import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { root } from './lib.mjs';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
// POSIX ustar, fixed timestamps/owners and sorted paths make identical sources reproducible.
function tarEntry(name, bytes) {
  if (Buffer.byteLength(name)>100) throw new Error(`Resource path too long: ${name}`);
  const header=Buffer.alloc(512);
  const text=(offset,length,value)=>header.write(value,offset,length,'ascii');
  const octal=(offset,length,value)=>text(offset,length,`${value.toString(8).padStart(length-1,'0')}\0`);
  text(0,100,name);octal(100,8,0o644);octal(108,8,0);octal(116,8,0);
  octal(124,12,bytes.length);octal(136,12,0);header.fill(32,148,156);
  text(156,1,'0');text(257,6,'ustar\0');text(263,2,'00');
  const checksum=header.reduce((sum,value)=>sum+value,0);
  text(148,8,`${checksum.toString(8).padStart(6,'0')}\0 `);
  return Buffer.concat([header,bytes,Buffer.alloc((512-bytes.length%512)%512)]);
}
export async function packageResources(pkg) {
  const files=new Map();
  const add=async(from,to=from)=>files.set(to,await readFile(new URL(from,root)));
  const walk=async path=>{
    for(const item of await readdir(new URL(path,root),{withFileTypes:true})) {
      const child=`${path}/${item.name}`;
      if(item.isDirectory()) await walk(child);else await add(child,child.slice(5));
    }
  };
  for(const path of ['dist/tokens','dist/icons','dist/standards','dist/components','dist/xu']) await walk(path);
  for(const file of ['tokens.css','components.css','component-lab.css','interactions.js','en/interactions.js','motion.js','en/motion.js','motion.css','icons.svg']) await add(`dist/assets/${file}`,`assets/${file}`);
  for(const file of ['LICENSE','README.md','README.zh-CN.md','CHANGELOG.md','CHANGELOG.zh-CN.md','MIGRATIONS.md','MIGRATIONS.zh-CN.md']) await add(file);
  const revision=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});
  const status=spawnSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'});
  const manifest={name:pkg.name,version:pkg.version,sourceRevision:revision.status===0?revision.stdout.trim():null,
    workingTreeDirty:status.status===0?!!status.stdout.trim():null,
    nativeAdapter:{sdk:'0.10.11',scope:'Editor appearance and semantic colors; other widgets retain SDK defaults'},
    files:Object.fromEntries([...files].sort(([a],[b])=>a.localeCompare(b,'en')).map(([name,bytes])=>[name,sha256(bytes)]))};
  files.set('MANIFEST.json',Buffer.from(JSON.stringify(manifest,null,2)+'\n'));
  const tar=Buffer.concat([...files].sort(([a],[b])=>a.localeCompare(b,'en')).map(([name,bytes])=>tarEntry(name,bytes)).concat([Buffer.alloc(1024)]));
  const archive=gzipSync(tar,{level:9});
  const directory=new URL('dist/downloads/',root);await mkdir(directory,{recursive:true});
  const name=`xu-ui-resources-${pkg.version}.tar.gz`;
  await writeFile(new URL(name,directory),archive);
  await writeFile(new URL('SHA256SUMS',directory),`${sha256(archive)}  ${name}\n`);
  await writeFile(new URL('manifest.json',directory),JSON.stringify(manifest,null,2)+'\n');
  console.log(`Packaged ${name}: ${files.size} files + SHA256SUMS.`);
}
