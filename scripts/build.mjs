import { mkdir, cp, writeFile, rm } from 'node:fs/promises';
import { read, json, root, escape, svg, markdown, contrast } from './lib.mjs';
import { nativeTokens } from './native-tokens.mjs';
import { packageResources } from './package.mjs';
import { localize, locales, localized } from './localize.mjs';

const [tokens, icons, standards, pkg, contracts] = await Promise.all([
  json('tokens/tokens.json'), json('icons/catalog.json'), json('standards/index.json'), json('package.json'), json('components/index.json')
]);
const out = new URL('dist/', root);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await Promise.all(['assets', 'icons', 'tokens', 'standards', 'components', 'xu/xuui_tokens'].map((p) => mkdir(new URL(`${p}/`, out), { recursive: true })));
const declarations = (map) => Object.entries(map).map(([key, value]) => `  --xu-${key}: ${value};`).join('\n');
const css = `/* Generated from tokens/tokens.json. Do not edit. */\n:root {\n${declarations(tokens.base)}\n${declarations(tokens.themes.dark)}\n  color-scheme: dark;\n}\n[data-theme="light"] {\n${declarations(tokens.themes.light)}\n  color-scheme: light;\n}\n`;
await writeFile(new URL('assets/tokens.css', out), css);
await writeFile(new URL('assets/icons.svg', out), `<svg xmlns="http://www.w3.org/2000/svg"><defs>${icons.map((v) => `<symbol id="${v.name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${v.body}</symbol>`).join('')}</defs></svg>`);
await Promise.all(icons.map((v) => writeFile(new URL(`icons/${v.name}.svg`, out), svg(v, true))));
await cp(new URL('src/brand/', root), new URL('assets/brand/', out), { recursive: true });
await Promise.all(['components.css', 'site.css', 'app.js', 'interactions.js', 'component-pages.js','component-lab.css','boot.js'].map((file) => cp(new URL(`src/${file}`, root), new URL(`assets/${file}`, out))));
await cp(new URL('tokens/tokens.json', root), new URL('tokens/tokens.json', out));
await cp(new URL('icons/catalog.json', root), new URL('icons/catalog.json', out));
const documents = async (items, directory, locale) => Promise.all(items.map(async item => {
  const suffix = locale === 'en' ? '' : '.zh-CN';
  const path = `${directory}/${item.id}${suffix}.md`;
  const source = await read(path);
  await writeFile(new URL(path,out),source);
  return {...Object.fromEntries(Object.entries(item).map(([key,value])=>[key,localized(value,locale)])),
    source:path, search:Object.values(item).flatMap(value=>typeof value === 'object' ? Object.values(value) : [value]).join(' '),
    html:markdown(source,locale)};
}));
await writeFile(new URL('xu/xuui_tokens/mod.xu', out), nativeTokens(tokens));
const ratios = Object.fromEntries(Object.entries(tokens.themes).map(([mode, theme]) => [mode,
  Object.fromEntries(['text', 'muted', 'brand', 'success', 'warning', 'danger', 'info'].map((key) => [key, contrast(theme[key], theme.surface).toFixed(2)]))
]));
for (const locale of locales) {
  await mkdir(new URL(`assets/${locale}/`,out),{recursive:true});
  for (const file of ['app.js','interactions.js','component-pages.js']) {
    await writeFile(new URL(`assets/${locale}/${file}`,out),localize(await read(`src/${file}`),locale));
  }
  const docs = await documents(standards,'standards',locale);
  const components = await documents(contracts,'components',locale);
  const localizedIcons = icons.map(item=>({...item,search:`${item.name} ${item.label} ${item.labelEn} ${item.category} ${item.categoryEn}`,
    label:locale === 'en' ? item.labelEn : item.label,category:locale === 'en' ? item.categoryEn : item.category}));
  const data = JSON.stringify({version:pkg.version,locale,tokens,icons:localizedIcons,docs,ratios,components});
  await writeFile(new URL(`assets/data.${locale}.json`,out),data);
  if (locale === 'zh-CN') await writeFile(new URL('assets/data.json',out),data);
}
let index = await read('src/index.html');
index = index.replaceAll('{{VERSION}}', escape(pkg.version));
await writeFile(new URL('index.html', out), index);
await packageResources(pkg);
console.log(`Built dist/: ${standards.length} standards, ${icons.length} icons, ${contracts.length} component contracts, 2 languages, 2 themes (${pkg.version}).`);
