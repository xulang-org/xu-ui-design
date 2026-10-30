const supported = ['zh-CN','en'];
const requested = new URL(location.href).searchParams.get('lang');
let saved;
try { saved = localStorage.getItem('xu-ui-language'); } catch { /* URL and browser language still work. */ }
const locale = supported.includes(requested) ? requested : supported.includes(saved) ? saved : navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
document.documentElement.lang = locale;
try { localStorage.setItem('xu-ui-language',locale); } catch { /* No persistence required. */ }
const toggle = document.querySelector('#language-toggle');
const next = locale === 'en' ? 'zh-CN' : 'en';
toggle.textContent = next === 'en' ? 'English' : '\u4e2d\u6587';
toggle.lang = next;
toggle.setAttribute('aria-label',next === 'en' ? 'Switch to English' : '\u5207\u6362\u81f3\u4e2d\u6587');
toggle.addEventListener('click',() => {
  const url = new URL(location.href);
  url.searchParams.set('lang',next);
  url.searchParams.set('theme',document.documentElement.dataset.theme);
  location.assign(url.href);
});
if (locale === 'en') document.querySelector('.loading p').textContent = 'Loading design standards…';
try {
  await import(`./${locale}/app.js`);
} catch {
  const p = document.querySelector('.loading p');
  if (p) p.textContent = locale === 'en' ? 'The showcase could not load. Refresh to try again, or read the source documents below.' : '\u5c55\u5385\u6682\u65f6\u65e0\u6cd5\u8f7d\u5165\uff0c\u8bf7\u5237\u65b0\u91cd\u8bd5\u6216\u9605\u8bfb\u4e0b\u65b9\u6e90\u6587\u6863\u3002';
}
