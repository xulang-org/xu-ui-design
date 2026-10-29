import { json } from './lib.mjs';

// Compile authored interface copy, never user content or a rendered DOM.
// Longest phrases win in one pass; missing English copy fails the build.
const english = await json('locales/en.json');
const escaped = Object.keys(english).sort((a,b) => b.length-a.length)
  .map(key => key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
const phrases = new RegExp(escaped.join('|'),'gu');
export function localize(source, locale) {
  if (locale === 'zh-CN') return source;
  if (locale !== 'en') throw new Error(`Unsupported locale: ${locale}`);
  const result = source.replace(phrases, phrase => english[phrase]);
  const missing = result.match(/[\u3400-\u9fff][\u3400-\u9fff，。、；：（）！？“”《》…／·—]*/gu);
  if (missing) throw new Error(`Missing English copy: ${[...new Set(missing)].join(' | ')}`);
  return result;
}
export const locales = ['zh-CN','en'];
export const localized = (value,locale) => typeof value === 'object' && value !== null ? value[locale] : value;
