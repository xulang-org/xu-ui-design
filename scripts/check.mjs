import assert from 'node:assert/strict';
import { readdir, access } from 'node:fs/promises';
import { spawnSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { json, read, root, contrast } from './lib.mjs';

const tokens = await json('tokens/tokens.json');
const icons = await json('icons/catalog.json');
const docs = await json('standards/index.json');
const pkg = await json('package.json');
assert.equal(tokens.version, pkg.version, 'Token and package versions must match.');
assert.match(pkg.version, /^0\.\d+\.\d+(-dev\.\d+)?$/);
assert.deepEqual(Object.keys(tokens.themes).sort(), ['dark','light']);
assert.deepEqual(Object.keys(tokens.themes.dark).sort(), Object.keys(tokens.themes.light).sort(), 'Theme role contracts differ.');
let pairCount = 0;
for (const [mode, theme] of Object.entries(tokens.themes)) {
  for (const [key, value] of Object.entries({ ...tokens.base, ...theme })) {
    assert.match(key, /^[a-z][a-z0-9-]*$/);
    assert.equal(typeof value, 'string');
    assert.ok(!/[{};<>]/.test(value), `Unsafe token ${key}`);
  }
  for (const value of Object.values(theme)) assert.match(value, /^#[0-9a-f]{6}([0-9a-f]{2})?$/);
  const pairs = [];
  for (const background of ['canvas','surface','elevated']) {
    for (const foreground of ['text','muted','brand','success','warning','danger','info']) pairs.push([foreground,background,4.5]);
    pairs.push(['control-border',background,3], ['focus',background,3]);
  }
  pairs.push(['on-brand','brand',4.5], ['on-brand','brand-hover',4.5], ['on-brand','brand-pressed',4.5], ['text','control-pressed',4.5], ['control-border','control-pressed',3], ['brand','brand-soft',4.5]);
  for (const status of ['success','warning','danger','info']) pairs.push([status,`${status}-soft`,4.5]);
  for (const [fg,bg,min] of pairs) {
    const ratio = contrast(theme[fg], theme[bg]);
    assert.ok(ratio >= min, `${mode}: ${fg} / ${bg} = ${ratio.toFixed(2)} < ${min}`);
    pairCount++;
  }
}
const names = new Set();
const allowedElements = new Set(['path','rect','circle','ellipse','line','polyline','polygon']);
const allowedAttrs = new Set(['d','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','width','height','points']);
for (const item of icons) {
  assert.match(item.name, /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
  assert.ok(!names.has(item.name), `Duplicate icon: ${item.name}`);
  names.add(item.name);
  assert.ok(item.label && item.category, `Missing icon metadata: ${item.name}`);
  const elements = [...item.body.matchAll(/<([a-z]+)((?:\s+[a-z0-9]+='[^']*')*)\s*\/>/g)];
  assert.equal(elements.map((m) => m[0]).join(''), item.body, `Malformed SVG: ${item.name}`);
  assert.ok(elements.length > 0);
  for (const [,tag,attrs] of elements) {
    assert.ok(allowedElements.has(tag), `Forbidden SVG element: ${tag}`);
    for (const [,attr,value] of attrs.matchAll(/([a-z0-9]+)='([^']*)'/g)) {
      assert.ok(allowedAttrs.has(attr), `Forbidden SVG attribute: ${attr}`);
      assert.match(value, /^[0-9a-zA-Z\s.,+\-]+$/, `Invalid geometry: ${item.name}`);
    }
  }
}
assert.ok(icons.length >= 48, 'Preserve the original icon inventory.');
assert.equal(docs.length, 12, 'Update documented standard inventory when changing the index.');
assert.equal(new Set(docs.map((doc) => doc.id)).size, docs.length);
for (const doc of docs) {
  assert.match(doc.id, /^\d{2}-[a-z-]+$/);
  const source = await read(`standards/${doc.id}.md`);
  assert.equal((source.match(/^# /gm) || []).length, 1, `One h1 required: ${doc.id}`);
  for (const [,target] of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    if (target.startsWith('https://')) continue;
    assert.ok(docs.some((entry) => `${entry.id}.md` === target), `Broken standard link: ${doc.id} -> ${target}`);
  }
}
for (const file of ['src/app.js','scripts/build.mjs','scripts/serve.mjs','scripts/lib.mjs','scripts/package.mjs','scripts/check-hygiene.mjs','scripts/native-tokens.mjs','src/interactions.js','src/component-pages.js']) {
  const result = spawnSync(process.execPath, ['--check', new URL(file, root).pathname], { encoding:'utf8' });
  assert.equal(result.status, 0, result.stderr);
}
await import('./build.mjs');
const html = await read('dist/index.html');
for (const [,path] of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)) await access(new URL(`dist/${path}`, root));
assert.ok(!html.includes('{{VERSION}}'));
const app = await read('src/app.js');
for (const [,name] of app.matchAll(/icon\('([a-z-]+)'/g)) assert.ok(names.has(name), `Unknown icon reference: ${name}`);
for (const file of ['src/components.css','src/site.css','src/component-lab.css']) {
  const source = await read(file);
  for (const [,name] of source.matchAll(/var\(--xu-([a-z0-9-]+)/g)) assert.ok(name in tokens.base || name in tokens.themes.dark, `Unknown token: ${name}`);
}
for (const item of icons) {
  const exported = await read(`dist/icons/${item.name}.svg`);
  assert.ok(exported.includes('<title>') && exported.includes('role="img"'));
}
const iconFiles = await readdir(new URL('dist/icons/', root));
assert.ok(iconFiles.includes('catalog.json'));
const data = await json('dist/assets/data.json');
assert.equal(data.docs.length, docs.length);
assert.equal(data.icons.length, icons.length);
const contracts=await json('components/index.json');
assert.equal(data.components.length,contracts.length);
assert.equal(new Set(contracts.map(item=>item.id)).size,contracts.length);
for (const item of contracts) {
  assert.match(item.id,/^[a-z][a-z-]+$/);
  assert.ok(docs.some(doc=>doc.id===item.standard));
  const source=await read(`components/${item.id}.md`);
  for (const section of ['结构','状态矩阵','键盘行为','原生映射','验收']) assert.ok(source.includes(`## ${section}`),`${item.id}: missing ${section}`);
}
assert.ok((await read('dist/xu/xuui_tokens/mod.xu')).includes(tokens.version));
const archiveName=`xu-ui-resources-${pkg.version}.tar.gz`;
const archive=new URL(`dist/downloads/${archiveName}`,root);
const archiveBytes=await readFile(archive);
assert.equal(await read('dist/downloads/SHA256SUMS'),`${createHash('sha256').update(archiveBytes).digest('hex')}  ${archiveName}\n`);
const manifest=await json('dist/downloads/manifest.json');
assert.equal(manifest.version,pkg.version);
for(const path of ['tokens/tokens.json','icons/play.svg','xu/xuui_tokens/mod.xu','LICENSE','MIGRATIONS.md']) {
  const result=spawnSync('tar',['-xOf',archive.pathname,path]);
  assert.equal(result.status,0,result.stderr?.toString());
  assert.equal(createHash('sha256').update(result.stdout).digest('hex'),manifest.files[path],`Archive content mismatch: ${path}`);
}
// Exercise the actual preview server, including the root path and escape guard.
const child = spawn(process.execPath, [new URL('scripts/serve.mjs', root).pathname], { cwd: root, env: { ...process.env, PORT:'0' }, stdio:['ignore','pipe','pipe'] });
try {
  const url = await new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => reject(new Error('Preview startup timed out.')), 10000);
    const finish = (fn, value) => { clearTimeout(timeout); fn(value); };
    child.on('error', (error) => finish(reject, error));
    child.on('exit', (code) => finish(reject, new Error(`Preview exited: ${code}`)));
    child.stdout.on('data', (chunk) => {
      output += chunk;
      const match = output.match(/Local: (http:\/\/127\.0\.0\.1:\d+)/);
      if (match) finish(resolve, match[1]);
    });
  });
  const home = await fetch(`${url}/`);
  assert.equal(home.status, 200, 'Preview root must return 200.');
  assert.ok((await home.text()).includes('XUUI'));
  const asset = await fetch(`${url}/assets/icons.svg`, { method:'HEAD' });
  assert.equal(asset.status, 200);
  assert.ok(asset.headers.get('content-type').startsWith('image/svg+xml'));
  assert.equal((await fetch(`${url}/missing-file`)).status, 404);
  assert.equal((await fetch(`${url}/%2e%2e%2fpackage.json`)).status, 403);
  assert.equal((await fetch(`${url}/`, { method:'POST' })).status, 405);
} finally {
  child.kill();
}
console.log(`PASS: ${pairCount} contrast pairs; ${icons.length} safe SVG icons; ${docs.length} linked standards; JS syntax; CSS token references; generated assets; HTTP preview and path guard.`);
