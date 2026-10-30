import { componentDetail, mountComponent } from './component-pages.js';
import { acknowledge, clearReceipt, showStatus, settle, stamp, disposeMotion } from './motion.js';
import { motionPage, mountMotionPage } from './motion-page.js';
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const icon = (name, extra = '') => `<svg class="xu-icon ${extra}" aria-hidden="true" focusable="false"><use href="./assets/icons.svg#${name}"></use></svg>`;
const button = (label, attrs = '', variant = '') => `<button type="button" class="xu-button ${variant}" ${attrs}>${label}</button>`;
const link = (label, route, variant = '') => `<a class="xu-button ${variant}" href="#/${route}">${label}</a>`;
const main = $('#main');
const dialog = $('#detail-dialog');
let data;
let activeRoute = 'overview';
let toastTimer;
let opener;
let pageCleanup;

// The English client is compiled from this controller and the shared copy catalog.
$('.skip-link').textContent = '跳到正文';
$('.skip-link').addEventListener('click',event => {
  event.preventDefault();
  main.focus({preventScroll:true});
  main.scrollIntoView({block:'start'});
});
$('.wordmark').setAttribute('aria-label','XUUI 设计系统首页');
$('.wordmark-note').textContent = '设计标准与资源';
$('#sidebar').setAttribute('aria-label','设计系统导航');
$('#menu-toggle').setAttribute('aria-label','展开导航');
$('a[href="https://github.com/xulang-org/xu-ui-design"]').setAttribute('aria-label','查看 GitHub 仓库');
$('meta[name="description"]').content = 'XUUI 设计系统：设计标准、语义 Token、SVG 图标与可操作的组件和页面参考。';

function notify(message) {
  clearTimeout(toastTimer);
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 4000);
}

async function copy(text, fallback, trigger) {
  clearReceipt(trigger);
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    if (trigger?.matches('.xu-button')) acknowledge(trigger,'已复制');
    else if (trigger?.isConnected) {
      trigger.dataset.confirmed='true';stamp(trigger);
      setTimeout(()=>trigger.removeAttribute('data-confirmed'),1400);
    }
    notify('已复制到剪贴板');
    return true;
  } catch {
    clearReceipt(trigger);
    trigger?.removeAttribute('data-confirmed');
    if (fallback) { fallback.closest('details')?.setAttribute('open','');fallback.focus();fallback.select(); }
    notify(fallback ? '复制未完成，请手动复制已选中的源码。' : '剪贴板不可用，请从 Token 下载文件中复制。');
    return false;
  }
}

function updateThemeButton() {
  const light = document.documentElement.dataset.theme === 'light';
  $('#theme-toggle').innerHTML = icon(light ? 'moon' : 'sun');
  $('#theme-toggle').setAttribute('aria-label', `切换至${light ? '暗' : '亮'}色主题`);
  $$('[data-set-theme]').forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.setTheme === document.documentElement.dataset.theme)));
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const url = new URL(location.href);
  if (url.searchParams.has('theme')) { url.searchParams.set('theme',theme); history.replaceState(null,'',url); }
  try { localStorage.setItem('xu-ui-theme', theme); } catch { /* Theme still works without persistence. */ }
  updateThemeButton();
  if (activeRoute === 'foundations') { render(); $('#theme-toggle').focus(); }
}

function closeMenu(restore = false) {
  $('#sidebar').classList.remove('open');
  $('#menu-toggle').setAttribute('aria-expanded', 'false');
  $('#menu-toggle').setAttribute('aria-label', '展开导航');
  if (restore) $('#menu-toggle').focus();
}

function navigation() {
  const entries = [['overview','总览','grid'], ['standards','设计标准','file'], ['foundations','基础与 Token','palette'], ['components','组件实验室','layers'], ['icons','ICON 图标库','square'], ['motion','动效与反馈','play'], ['patterns','页面模式','monitor']];
  const current = (route) => (activeRoute === route || (route === 'components' && activeRoute.startsWith('components/'))) ? 'aria-current="page"' : '';
  const reading = activeRoute.startsWith('standards');
  $('#sidebar').innerHTML = `<nav aria-label="主要导航">
    <div class="nav-label">设计资源</div>
    ${entries.map(([id, title, name]) => `<a class="nav-link" href="#/${id}" ${current(id)}>${icon(name)}${title}</a>`).join('')}
    <details class="nav-standards" ${reading ? 'open' : ''}>
      <summary>规范目录 <span>${data.docs.length}</span></summary>
      ${data.docs.map((doc, i) => `<a class="nav-link sub-link" href="#/standards/${doc.id}" ${current(`standards/${doc.id}`)}><span class="nav-number">${String(i + 1).padStart(2, '0')}</span>${doc.title}</a>`).join('')}
    </details>
  </nav><div class="sidebar-footer"><span class="sidebar-status">浏览器参考实现</span><p>规范与效果，同一份来源。</p><a href="./tokens/tokens.json" download>${icon('download')} 下载设计 Token</a></div>`;
}

const breadcrumbs = (title) => `<div class="breadcrumbs"><a href="#/overview">XUUI</a><span>/</span><span>${esc(title)}</span></div>`;
const heading = (en, title, text) => `<div class="page-heading"><h1 tabindex="-1">${title}</h1><p class="lead">${text}</p></div>`;
const footer = () => `<footer class="footnote"><span>XUUI / ${data.version} · 设计标准与浏览器参考实现</span><span>XUUI DESIGN SYSTEM</span></footer>`;
const demoTitle = (title, standard) => `<div class="demo-title"><h2>${title}</h2><a href="#/standards/${standard}">阅读对应标准 ${icon('arrow-right')}</a></div>`;
const code = (content) => `<details><summary>查看使用代码</summary><pre tabindex="0"><code>${esc(content)}</code></pre></details>`;

function swatches() {
  const theme = data.tokens.themes[document.documentElement.dataset.theme];
  return `<div class="color-strip">${[['brand','朱砂 / BRAND'],['text','金石 / INK'],['canvas',document.documentElement.dataset.theme === 'light' ? '宣纸 / CANVAS' : '曜石 / CANVAS'],['success','松绿 / SUCCESS'],['info','海蓝 / INFO']].map(([key, label]) => `<div class="color-sample"><span class="swatch" style="background:var(--xu-${key})"></span><p>${label}</p><code>${theme[key].toUpperCase()}</code></div>`).join('')}</div>`;
}

function overview() {
  return `${breadcrumbs('总览')}
    <section class="overview-cover">
      <div class="cover-intro"><h1 tabindex="-1">XUUI<span>界面设计标准</span></h1>
        <p class="cover-description">统一的视觉语言，具体到每一个细节。<br>在这里查阅规范、检验组件，找到可直接使用的设计资源。</p>
        <div class="hero-actions">${link(`浏览设计标准 ${icon('arrow-right')}`, 'standards', 'primary')}${link('探索组件', 'components')}</div>
        <p class="cover-edition">为 XU 生态的设计与开发协作而建 · ${data.version}</p>
      </div>
      <section class="cover-specimen" aria-label="可交互组件预览">
        <div class="specimen-header"><h2>组件预览</h2><span class="xu-badge success">${icon('check-circle')}可操作</span></div>
        <div class="specimen-content"><div class="xu-field"><label for="cover-workspace">工作区名称</label><input id="cover-workspace" class="xu-input" value="XU Workspace" readonly></div>
        <div class="spec-line"><span>外观主题</span><div class="theme-choices">${button('曜石', 'data-set-theme="dark" aria-pressed="true"')}${button('宣纸', 'data-set-theme="light" aria-pressed="false"')}</div></div>
        <div class="spec-line"><span>自动保存 <span class="muted small">演示</span></span><label class="xu-check"><input type="checkbox" class="xu-switch" role="switch" aria-label="演示自动保存" data-demo-switch checked></label></div>
        <div class="specimen-bottom"><span class="small muted">使用统一 Token 构建</span>${link(`查看组件 ${icon('arrow-right')}`, 'components', 'ghost')}</div></div>
      </section>
    </section>
    <section class="overview-resources" aria-labelledby="resources-title"><div class="section-heading"><h2 id="resources-title">从这里开始</h2><span class="small muted">标准、实现与效果，相互对应</span></div>
      <a class="resource-row" href="#/standards"><span class="resource-symbol">${icon('file')}</span><div><h3>设计标准</h3><p>从视觉基础、组件行为，到交付验收。</p></div><span class="resource-detail">${data.docs.length} 篇文档</span>${icon('arrow-right')}</a>
      <a class="resource-row" href="#/icons"><span class="resource-symbol">${icon('grid')}</span><div><h3>ICON 图标库</h3><p>统一网格与线宽，按需检索、复制和下载。</p></div><span class="resource-detail">${data.icons.length} 枚 SVG</span>${icon('arrow-right')}</a>
      <a class="resource-row" href="#/patterns"><span class="resource-symbol">${icon('monitor')}</span><div><h3>页面模式</h3><p>通过设置、列表和空状态，核对完整任务。</p></div><span class="resource-detail">交互示例</span>${icon('arrow-right')}</a>
    </section>
    <section><div class="section-heading"><h2>设计基础</h2><a href="#/motion">动效与反馈 ${icon('arrow-right')}</a><a href="#/foundations">查看全部 Token ${icon('arrow-right')}</a></div><div id="overview-colors">${swatches()}</div></section>${footer()}`;
}

function standards() {
  return `${breadcrumbs('标准文档')}${heading('DOCUMENTATION / 12 STANDARDS','设计标准','从视觉基础到交付验收，每篇标准都关联对应效果。选择一篇开始阅读，或通过关键词查找。')}<div class="toolbar"><div class="xu-field"><label for="doc-search">查找标准</label><input class="xu-input" type="search" id="doc-search" placeholder="例如：图标、表单、主题"></div></div><p class="result-count" id="doc-count" role="status">标准数量：${data.docs.length}</p><div class="docs-grid" id="doc-results"></div>`;
}

function updateDocs() {
  const query = $('#doc-search').value.trim().toLowerCase();
  const docs = data.docs.filter((doc) => doc.search.toLowerCase().includes(query));
  $('#doc-count').textContent = `标准数量：${docs.length}`;
  const groups = [...new Set(docs.map((doc) => doc.group))];
  $('#doc-results').innerHTML = docs.length ? groups.map((group) => `<section class="doc-group"><h2>${group}<span>${docs.filter((doc) => doc.group === group).length}</span></h2><div>${docs.filter((doc) => doc.group === group).map((doc) => `<a href="#/standards/${doc.id}" class="doc-card"><span class="num">${doc.id.slice(0, 2)}</span><div><h3>${doc.title}</h3><p>${doc.summary}</p></div>${icon('arrow-right')}</a>`).join('')}</div></section>`).join('') : `<div class="empty"><h3>没有找到对应标准</h3><p>试试“基础”“组件”，或清空关键词。</p>${button('清空搜索', 'id="clear-doc-search"')}</div>`;
  $('#clear-doc-search')?.addEventListener('click', () => { $('#doc-search').value = ''; updateDocs(); $('#doc-search').focus(); });
}

function documentView(id) {
  const index = data.docs.findIndex((item) => item.id === id);
  const doc = data.docs[index];
  if (!doc) return missing();
  const sections = [];
  const html = doc.html.replace(/<h2>(.*?)<\/h2>/g, (_, title) => {
    const anchor = `section-${sections.length + 1}`;
    sections.push({ anchor, title });
    return `<h2 id="${anchor}" tabindex="-1">${title}</h2>`;
  });
  const next = data.docs[index + 1];
  return `${breadcrumbs(`设计标准 / ${doc.title}`)}<div class="reading-layout"><aside class="doc-outline" aria-label="本篇目录"><details ${window.matchMedia('(min-width: 1280px)').matches ? 'open' : ''}><summary>本篇目录</summary>${sections.map(({anchor,title}) => `<a href="#/standards/${id}#${anchor}">${title}</a>`).join('')}</details></aside><div class="document">
    <div class="document-actions"><a class="small muted" href="#/standards">${icon('arrow-left')} 全部标准</a><a class="text-action" href="./${doc.source}" download>${icon('download')} Markdown</a></div>
    <article>${html}</article>
    <div class="document-next"><div><span class="small muted">将标准用到界面中</span><p>查看这篇规范对应的实际效果。</p></div>${link(`查看对应效果 ${icon('arrow-right')}`, doc.demo, 'primary')}</div>
    ${next ? `<a class="next-standard" href="#/standards/${next.id}"><span>继续阅读</span><strong>${next.title}</strong>${icon('arrow-right')}</a>` : ''}
    </div></div>${footer()}`;
}

function foundations() {
  const mode = document.documentElement.dataset.theme;
  const theme = data.tokens.themes[mode];
  const rows = Object.entries(theme).filter(([, value]) => /^#[0-9a-f]{6}$/.test(value));
  return `${breadcrumbs('基础与 Token')}${heading('FOUNDATIONS / DESIGN TOKENS','基础与 Token','所有变量来自 tokens/tokens.json。切换顶部主题查看对应色值；点击变量复制 CSS 用法。')}<div class="row"><a class="xu-button primary" href="./downloads/xu-ui-resources-${data.version}.tar.gz" download>${icon('download')} 下载完整资源 · ${data.version}</a><a class="xu-button" href="./downloads/SHA256SUMS" download>SHA-256 校验值</a></div><div class="row"><a class="xu-button" href="./tokens/tokens.json" download>${icon('download')} 下载 Token JSON</a><a class="xu-button" href="./assets/tokens.css" download>下载 CSS 变量</a></div><section class="demo-section"><div class="section-heading"><h2>语义色 · ${mode === 'dark' ? '曜石暗夜' : '宣纸雪岩'}</h2><a href="#/standards/02-color">使用规则 ${icon('arrow-right')}</a></div>${swatches()}<div class="token-list">${rows.map(([key, value]) => `<button type="button" class="token-button" data-copy-token="${key}" aria-label="复制 --xu-${key}"><i class="token-swatch" style="background:var(--xu-${key})"></i><code class="token-name">--xu-${key}</code><span>${value.toUpperCase()}</span></button>`).join('')}</div></section><section class="demo-section">${demoTitle('文字对比度', '02-color')}<p class="small muted">下列值由构建时计算，背景为当前主题的 surface；完整约定组合由 check 命令验证。</p><div class="table-scroll" role="region" aria-label="主题文字对比度" tabindex="0"><table><thead><tr><th scope="col">文字角色</th><th scope="col">对比度</th><th scope="col">项目门槛</th></tr></thead><tbody>${Object.entries(data.ratios[mode]).map(([key, ratio]) => `<tr><td><code>--xu-${key}</code></td><td>${ratio}:1</td><td>${icon('check')} ≥ 4.5:1</td></tr>`).join('')}</tbody></table></div></section><section class="demo-section">${demoTitle('字体与层级', '03-typography')}<div class="demo-frame"><div class="type-specimen">秩序之中，自有锋芒。<br>Precision in every detail.</div><p>正文 16 / 1.65 · 设计与开发，使用同一种语言。</p><p class="mono small muted">const design = 'consistent'; // Token / Code</p><div class="row">${[12,14,16,20,28,40].map((size) => `<span style="font-size:${size}px">Aa<span class="small muted"> ${size}</span></span>`).join('')}</div></div></section><section class="demo-section">${demoTitle('空间刻度', '04-layout')}<div class="demo-frame"><div class="spacing-demo">${[1,2,3,4,6,8,12,16].map((size) => `<div class="spacing-item"><div class="spacing-bar" style="width:var(--xu-space-${size})"></div>${size * 4} px</div>`).join('')}</div></div></section>${footer()}`;
}

function components() {
  return `${breadcrumbs('组件实验室')}${heading('COMPONENT LAB / INTERACTIVE','组件实验室','用真实交互检查组件的层级、状态和反馈。这里的所有操作都是浏览器演示，不连接远端服务。')}<div class="component-index">${data.components.map((item)=>`<a class="component-entry" href="#/components/${item.id}"><h2>${item.title}</h2><p>${item.summary}</p><span>${item.group} ${icon('arrow-right')}</span></a>`).join('')}</div><h2>基础状态预览</h2><div class="filter-row" aria-label="组件筛选">${[['all','全部组件'],['actions','操作'],['forms','输入'],['feedback','反馈']].map(([id,title]) => `<button type="button" data-component-filter="${id}" aria-pressed="${id === 'all'}">${title}</button>`).join('')}</div><section class="demo-section" data-component="actions">${demoTitle('操作与按钮','06-actions')}<div class="demo-frame"><div class="toolbar"><div class="xu-field compact"><label for="button-size">预览尺寸</label><span class="xu-select-wrap"><select class="xu-select" id="button-size"><option value="sm">sm · 32 px</option><option value="md" selected>md · 40 px</option><option value="lg">lg · 48 px</option></select>${icon('chevron-down')}</span></div><span class="small muted">悬停、按下或用 Tab 查看焦点状态。</span></div><div class="demo-buttons" id="sized-buttons"><span class="state-label">层级</span>${button(`${icon('plus')}新建项目`, 'data-notify="新建项目：交互演示已触发。"', 'primary')}${button('次要操作','data-notify="已触发次要操作。"')}${button('轻量操作','data-notify="已触发轻量操作。"','ghost')}${button(`${icon('trash')}删除`,'data-confirm','danger')}</div><div class="demo-buttons"><span class="state-label">状态</span>${button('点击加载','id="loading-demo"','primary')}${button('暂不可用','disabled')}${button(icon('sliders'),'aria-label="调整演示参数" data-notify="参数按钮可用。"','icon-only')}</div><p class="xu-help" style="margin-top:16px">禁用原因示例：尚未选择项目，当前操作不可用。</p><div class="component-meta">HEIGHT 32 / 40 / 48 · GAP 8 · RADIUS 8 · FOCUS 2</div>${code('<button type="button" class="xu-button primary" data-size="md">保存设置</button>')}</div></section><section class="demo-section" data-component="forms">${demoTitle('表单与选择','07-forms')}<div class="demo-frame"><div class="two-columns"><form id="demo-form" class="field-stack" novalidate><div class="xu-field"><label for="demo-name">项目名称 <span class="muted small">必填</span></label><input class="xu-input" id="demo-name" name="name" maxlength="40" required placeholder="例如：stone-workbench" aria-describedby="demo-name-help demo-name-error"><p class="xu-help" id="demo-name-help">使用 1–40 个字符。试试留空后提交。</p><p class="xu-error" id="demo-name-error"></p></div><div class="xu-field"><label for="demo-platform">目标平台</label><span class="xu-select-wrap"><select class="xu-select" id="demo-platform" name="platform"><option>桌面应用</option><option>Web 应用</option><option>命令行工具</option></select>${icon('chevron-down')}</span></div><label class="xu-check"><input type="checkbox" name="template" checked>包含示例模板</label><div><button type="submit" class="xu-button primary">验证并创建 ${icon('arrow-right')}</button></div><p id="demo-form-status" class="small muted" role="status"></p></form><div class="field-stack"><div class="xu-field"><label for="readonly-input">只读输入</label><input id="readonly-input" class="xu-input" value="xulang-org / xu-ui-design" readonly></div><div class="xu-field"><label for="disabled-input">禁用输入</label><input id="disabled-input" class="xu-input" value="由组织统一管理" disabled><p class="xu-help">示例：组织策略禁止修改。</p></div><div class="xu-field"><label for="demo-description">项目说明</label><textarea id="demo-description" class="xu-textarea" placeholder="可选，描述这个项目的用途。" maxlength="200"></textarea></div><label class="xu-check"><input type="checkbox" class="xu-switch" role="switch" data-demo-switch checked>启用演示通知</label></div></div>${code('<label for="name">项目名称</label>\n<input class="xu-input" id="name" required aria-describedby="help">\n<p id="help" class="xu-help">使用 1–40 个字符。</p>')}</div></section><section class="demo-section" data-component="feedback">${demoTitle('状态与反馈','09-feedback')}<div class="demo-frame"><div class="row">${[['success','check-circle','已完成'],['warning','alert-triangle','需注意'],['danger','x-circle','未通过'],['info','info','信息']].map(([type,name,label]) => `<span class="xu-badge ${type}">${icon(name)}${label}</span>`).join('')}</div><div class="field-stack" style="margin-top:24px"><div class="xu-alert info">${icon('info')}<p><strong>这是一条说明。</strong><br>颜色、图标与文字共同表达信息，避免单靠颜色判断。</p></div><div class="xu-alert warning">${icon('alert-triangle')}<p><strong>保存前请检查。</strong><br>关键反馈保留在页面内，让用户有时间阅读和恢复。</p></div><div><label for="demo-progress" class="small">确定进度示例 · 68%</label><progress id="demo-progress" class="xu-progress" max="100" value="68">68%</progress></div></div><div class="row" style="margin-top:24px">${button('显示短通知','data-notify="这是一条演示通知，不会抢走键盘焦点。"')}${button('打开确认对话框','data-confirm')}</div>${code('<dialog aria-labelledby="title">\n  <h2 id="title">确认操作</h2>\n  <button type="button">取消</button>\n</dialog>\n<!-- 使用 showModal() 打开，close() 关闭。 -->')}</div></section>${footer()}`;
}

let selectedIcon = 'plus';
function icons() {
  const categories = [...new Set(data.icons.map((item) => item.category))];
  return `${breadcrumbs('ICON 图标库')}<div class="library-header"><div>${heading('', 'ICON 图标库', `${data.icons.length} 枚线性图标，与 XUUI 组件共用一套视觉语言。`)}</div><a class="xu-button" href="./assets/icons.svg" download>${icon('download')} 下载 Sprite</a></div>
    <div class="icon-contract"><span><strong>24 × 24</strong> 标准网格</span><span><strong>1.5</strong> 母版线宽</span><span><strong>SVG</strong> currentColor</span><a href="#/standards/05-icons">阅读图标规范 ${icon('arrow-right')}</a></div>
    <div class="toolbar icon-toolbar"><div class="xu-field"><label for="icon-search">检索图标</label><div class="search-field">${icon('search')}<input type="search" class="xu-input" id="icon-search" placeholder="搜索名称，例如 arrow 或向右"></div></div><div class="xu-field compact"><label for="icon-category">分类</label><span class="xu-select-wrap"><select class="xu-select" id="icon-category"><option value="all">全部分类</option>${categories.map((v) => `<option>${v}</option>`).join('')}</select>${icon('chevron-down')}</span></div><div class="xu-field compact"><label for="icon-size">预览尺寸</label><span class="xu-select-wrap"><select class="xu-select" id="icon-size">${[16,20,24,32].map((v) => `<option value="${v}" ${v === 24 ? 'selected' : ''}>${v} px</option>`).join('')}</select>${icon('chevron-down')}</span></div></div>
    <div class="icon-workspace"><div class="icon-catalog"><p class="result-count" id="icon-count" role="status"></p><div id="icon-results"></div></div><aside class="icon-inspector" id="icon-inspector" aria-label="所选图标详情"></aside></div>${footer()}`;
}

function svgSource(item) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${item.body}</svg>`;
}

function updateInspector(animate = false) {
  const item = data.icons.find((entry) => entry.name === selectedIcon);
  const source = svgSource(item);
  $('#icon-inspector').innerHTML = `<div class="inspector-heading"><span class="small muted">图标详情</span><span class="xu-badge">${item.category}</span></div><div class="icon-blueprint">${icon(item.name)}<span>24 × 24</span></div><h2>${item.label}</h2><p class="icon-identifier">${item.name}</p>
    <div class="icon-sizes" aria-label="不同尺寸对照">${[16,20,24,32].map((size) => `<div><span style="--sample-size:${size}px">${icon(item.name)}</span><small>${size} px</small></div>`).join('')}</div>
    <div class="inspector-actions">${button(`${icon('copy')}复制 SVG`,'id="inspector-copy"','primary')}<a class="xu-button" href="./icons/${item.name}.svg" download="${item.name}.svg">${icon('download')}下载</a></div>
    <details class="inspector-code"><summary>查看 SVG 源码</summary><label class="sr-only" for="inspector-source">所选图标 SVG 源码</label><textarea id="inspector-source" class="xu-textarea source-code" readonly spellcheck="false">${esc(source)}</textarea></details>
    <p class="inspector-note">装饰图标使用 aria-hidden。仅图标按钮仍需提供可访问名称。</p>`;
  if (animate) settle($('#icon-inspector'));
  $('#inspector-copy').addEventListener('click', async (event) => {
    const target=event.currentTarget;
    clearReceipt(target);
    const field = $('#inspector-source');
    // Keep source available when clipboard access fails, without a blocking modal.
    try { await navigator.clipboard.writeText(source); acknowledge(target,'已复制');notify(`已复制：${item.name}.svg`); }
    catch { $('.inspector-code').open = true; field.focus(); field.select(); notify('复制未完成，请手动复制已选中的源码。'); }
  });
}

function updateIcons() {
  const query = $('#icon-search').value.trim().toLowerCase();
  const category = $('#icon-category').value;
  const results = data.icons.filter((item) => item.search.toLowerCase().includes(query) && (category === 'all' || item.category === category));
  $('#icon-count').textContent = `${results.length} / ${data.icons.length} 枚图标`;
  const container = $('#icon-results');
  container.style.setProperty('--preview-icon-size', `${$('#icon-size').value}px`);
  const groups = [...new Set(results.map((item) => item.category))];
  container.innerHTML = results.length ? groups.map((group) => `<section class="icon-group"><div class="icon-group-heading"><h2>${group}</h2><span>${results.filter((item) => item.category === group).length}</span></div><div class="icon-grid">${results.filter((item) => item.category === group).map((item) => `<button type="button" class="icon-tile" data-icon="${item.name}" aria-pressed="${item.name === selectedIcon}" aria-label="查看 ${item.label} ${item.name}"><span class="tile-art">${icon(item.name)}</span><span class="icon-label">${item.label}</span><span class="icon-name">${item.name}</span></button>`).join('')}</div></section>`).join('') : `<div class="empty">${icon('search')}<h3>没有找到匹配图标</h3><p>试试其他关键词，或恢复全部分类。</p>${button('清空筛选','id="clear-icon-search"')}</div>`;
  updateInspector();
  $('#clear-icon-search')?.addEventListener('click', () => { $('#icon-search').value = ''; $('#icon-category').value = 'all'; updateIcons(); $('#icon-search').focus(); });
}

const projects = [
  { name:'stone-workbench', description:'桌面工作区', platform:'Desktop', status:'active', date:'2026-10-28' },
  { name:'paper-docs', description:'文档与知识库', platform:'Web', status:'active', date:'2026-10-26' },
  { name:'cinnabar-cli', description:'终端工具实验', platform:'CLI', status:'draft', date:'2026-10-24' },
  { name:'grid-studio', description:'布局原型', platform:'Web', status:'archived', date:'2026-10-20' }
];

function patterns() {
  return `${breadcrumbs('页面模式')}${heading('PATTERNS / REAL SCENARIOS','页面模式','设置、数据列表、空状态。以下均为演示数据，帮助检查组件组合后的层级和操作路径。')}<section class="demo-section">${demoTitle('工作区设置','10-patterns')}<div class="demo-frame"><div class="pattern-header"><div><h2>工作区设置</h2><p>示例 · 仅保存至当前浏览器</p></div><span class="xu-badge">LOCAL DEMO</span></div><div class="settings-layout"><div class="settings-rail" aria-hidden="true"><span>基本设置</span><span>外观与主题</span><span>通知偏好</span></div><form id="settings-form" class="field-stack" novalidate><div class="xu-field"><label for="workspace-name">工作区名称 <span class="muted small">必填</span></label><input class="xu-input" id="workspace-name" name="name" required maxlength="40" aria-describedby="workspace-help workspace-error"><p class="xu-help" id="workspace-help">使用 1–40 个字符；请勿填写私密信息。</p><p class="xu-error" id="workspace-error"></p></div><div class="xu-field"><label for="workspace-density">界面密度偏好</label><span class="xu-select-wrap"><select class="xu-select" id="workspace-density" name="density"><option value="comfortable">舒适 · 较多留白</option><option value="compact">紧凑 · 更多信息</option></select>${icon('chevron-down')}</span><p class="xu-help">此示例仅保存偏好值，不改变整个展厅布局。</p></div><label class="xu-check"><input type="checkbox" id="workspace-autosave" name="autosave">保存时保留本地草稿（示例偏好）</label><div><button type="submit" class="xu-button primary">${icon('check')} 保存到本地</button></div><p id="settings-status" class="small muted" role="status">尚未保存。</p></form></div></div></section><section class="demo-section">${demoTitle('项目列表','10-patterns')}<div class="demo-frame"><div class="pattern-header"><div><h2>项目工作台</h2><p id="project-total">${projects.length} 条本地演示记录 · 非真实仓库状态</p></div>${button(`${icon('plus')}新建演示项目`,'id="new-demo-project"','primary')}</div><div class="toolbar"><div class="xu-field"><label for="project-search">搜索项目</label><input type="search" class="xu-input" id="project-search" placeholder="按项目名称或说明查找"></div><div class="xu-field compact"><label for="project-status">状态</label><span class="xu-select-wrap"><select class="xu-select" id="project-status"><option value="all">全部状态</option><option value="active">进行中</option><option value="draft">草稿</option><option value="archived">已归档</option></select>${icon('chevron-down')}</span></div></div><div id="project-table"></div><p id="project-count" class="result-count" role="status" style="margin-top:16px"></p></div></section><section class="demo-section">${demoTitle('初始空状态','10-patterns')}<div class="empty">${icon('folder')}<h3>为下一个想法，建立工作区。</h3><p>在这个本地示例中创建项目，完成后会定位到列表记录。</p>${button(`${icon('plus')}创建演示项目`, 'data-create-project', 'primary')}</div></section>${footer()}`;
}

let sortAscending = true;
function updateProjects(createdName) {
  $('#project-total').textContent=`${projects.length} 条本地演示记录 · 非真实仓库状态`;
  const query = $('#project-search').value.trim().toLowerCase();
  const status = $('#project-status').value;
  const filtered = projects.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query) && (status === 'all' || status === item.status)).sort((a,b) => sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  $('#project-count').textContent = `显示 ${filtered.length} / ${projects.length} 条演示记录`;
  const statuses = { active:['success','进行中'], draft:['warning','草稿'], archived:['info','已归档'] };
  $('#project-table').innerHTML = filtered.length ? `<div class="table-scroll" role="region" aria-label="演示项目列表" tabindex="0"><table class="table-demo"><thead><tr><th scope="col" aria-sort="${sortAscending ? 'ascending' : 'descending'}"><button type="button" class="sort-button" id="sort-projects">项目名称 ${icon(sortAscending ? 'arrow-up' : 'arrow-down')}</button></th><th scope="col">平台</th><th scope="col">状态</th><th scope="col">更新日期</th><th scope="col">操作</th></tr></thead><tbody>${filtered.map((item) => `<tr data-project-row="${esc(item.name)}" ${item.name===createdName?'data-created':''}><th scope="row" tabindex="-1"><strong>${esc(item.name)}</strong><small>${esc(item.description)}</small></th><td class="mono small">${item.platform}</td><td><span class="xu-badge ${statuses[item.status][0]}">${statuses[item.status][1]}</span></td><td class="mono small muted">${item.date}</td><td>${button('详情', `data-project="${esc(item.name)}" aria-label="查看 ${esc(item.name)} 详情" data-size="sm"`, 'ghost')}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty">${icon('search')}<h3>没有匹配的项目</h3><p>清空关键词和状态条件，重新查看演示记录。</p>${button('清空筛选','id="clear-projects"')}</div>`;
  $('#sort-projects')?.addEventListener('click', () => { sortAscending = !sortAscending; updateProjects(); $('#sort-projects')?.focus(); });
  $('#clear-projects')?.addEventListener('click', () => { $('#project-search').value = ''; $('#project-status').value = 'all'; updateProjects(); $('#project-search').focus(); });
  return $$('[data-project-row]').find(row=>row.dataset.projectRow===createdName);
}

function validName(input, error, status) {
  const value = input.value.trim();
  const message = !value ? '请输入项目或工作区名称，不能只包含空格。' : value.length > 40 ? '名称不能超过 40 个字符。' : '';
  input.setAttribute('aria-invalid', String(!!message));
  const changed=error.textContent!==message;
  error.textContent = message;
  if (message && changed) settle(error);
  if (message && status) {status.textContent = '';status.removeAttribute('data-state');}
  return !message;
}

function openDialog(content, trigger) {
  opener = trigger || document.activeElement;
  disposeMotion($('#dialog-content'));
  $('#dialog-content').innerHTML = content;
  dialog.showModal();
  $('[autofocus]', dialog)?.focus();
}

function confirmDemo(trigger) {
  openDialog(`<div class="dialog-heading"><h2 id="dialog-title">确认删除演示项目？</h2></div><p class="muted" id="dialog-description">这是组件行为演示。确认后仅显示一条反馈，不会删除任何真实项目或文件。</p><div class="row">${button('取消','data-close-dialog autofocus')}${button('确认演示','id="confirm-demo-action"','danger')}</div>`, trigger);
  dialog.setAttribute('aria-describedby', 'dialog-description');
  $('#confirm-demo-action').addEventListener('click', () => { dialog.close(); notify('已完成确认交互演示，未删除真实资源。'); });
}

function createProject(trigger) {
  dialog.setAttribute('aria-describedby','create-project-description');
  openDialog(`<div class="dialog-heading"><h2 id="dialog-title">创建演示项目</h2>${button(icon('x'),'data-close-dialog aria-label="关闭创建窗口"','ghost icon-only')}</div>
    <p id="create-project-description" class="small muted">仅在当前页面保留，刷新会重置。不创建真实仓库。</p>
    <form id="create-project-form" class="field-stack" novalidate><div class="xu-field"><label for="create-project-name">项目名称（必填）</label><input id="create-project-name" class="xu-input" maxlength="40" required aria-describedby="create-project-help create-project-error" autofocus><p id="create-project-help" class="xu-help">使用 1–40 个字符，完成后会定位到新记录。</p><p id="create-project-error" class="xu-error"></p></div><div class="row">${button('取消','data-close-dialog')}<button type="submit" class="xu-button primary">创建并定位 ${icon('arrow-right')}</button></div></form>`,trigger);
  const input=$('#create-project-name'),error=$('#create-project-error');
  input.addEventListener('input',()=>{if(input.getAttribute('aria-invalid')==='true')validName(input,error);});
  $('#create-project-form').addEventListener('submit',event=>{
    event.preventDefault();
    if (!validName(input,error)) {input.focus();return;}
    const name=input.value.trim();
    if (projects.some(item=>item.name.toLowerCase()===name.toLowerCase())) {
      input.setAttribute('aria-invalid','true');error.textContent='已有同名演示项目，请换一个名称。';settle(error);input.focus();return;
    }
    const today=new Date();
    const date=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
    projects.push({name,description:'刚创建的本地演示项目',platform:'Web',status:'draft',date});
    $('#project-search').value='';$('#project-status').value='all';
    const row=updateProjects(name);
    opener=row.querySelector('th');
    dialog.close();opener.focus();settle(row);
    notify(`已创建演示项目：${name}。刷新页面会重置列表。`);
  });
}

function iconDetail(name, trigger) {
  const item = data.icons.find((entry) => entry.name === name);
  const source = svgSource(item);
  dialog.removeAttribute('aria-describedby');
  openDialog(`<div class="dialog-heading"><div><h2 id="dialog-title">${item.label}</h2><span class="mono small muted">${item.name}</span></div>${button(icon('x'),'data-close-dialog aria-label="关闭图标详情" autofocus','ghost icon-only')}</div><div class="icon-enlarged">${icon(item.name)}</div><p class="small muted">${item.category} / 24 × 24 / 1.5 stroke<br>复制用于装饰的内联 SVG；仅图标按钮仍须提供可访问名称。</p><label for="icon-source" class="small">SVG 源码</label><textarea id="icon-source" class="xu-textarea source-code" readonly spellcheck="false">${esc(source)}</textarea><div class="row">${button(`${icon('copy')}复制 SVG`,'id="copy-icon"','primary')}<a class="xu-button" href="./icons/${item.name}.svg" download="${item.name}.svg">${icon('download')}下载 SVG</a></div>`, trigger);
  $('#copy-icon').addEventListener('click', (event) => copy(source, $('#icon-source'),event.currentTarget));
}

function missing() { return `${heading('404 / PAGE NOT FOUND','这个页面还不存在。','从设计系统总览重新开始，或使用侧栏查找标准。')}${link('返回总览','overview','primary')}`; }

function bindPage() {
  if (activeRoute === 'motion') {pageCleanup=mountMotionPage({copy,showStatus});return;}
  if (activeRoute.startsWith('components/')) {
    if ($('#contract-demo')) pageCleanup=mountComponent(activeRoute.slice(11),notify);
    return;
  }
  if (activeRoute === 'standards') { updateDocs(); $('#doc-search').addEventListener('input', updateDocs); }
  if (activeRoute === 'icons') { updateIcons(); ['icon-search','icon-category','icon-size'].forEach((id) => $(`#${id}`).addEventListener(id === 'icon-search' ? 'input' : 'change', updateIcons)); }
  if (activeRoute === 'components') {
    $('#button-size').addEventListener('change', (event) => $$('#sized-buttons .xu-button').forEach((el) => el.dataset.size = event.target.value));
    $$('[data-component-filter]').forEach((el) => el.addEventListener('click', () => {
      $$('[data-component-filter]').forEach((entry) => entry.setAttribute('aria-pressed', String(entry === el)));
      $$('[data-component]').forEach((section) => section.hidden = el.dataset.componentFilter !== 'all' && section.dataset.component !== el.dataset.componentFilter);
    }));
    $('#loading-demo').addEventListener('click', async (event) => {
      const target = event.currentTarget;
      target.setAttribute('aria-busy', 'true'); target.disabled = true;
      target.innerHTML = `${icon('loader','xu-spinner')}正在处理…`;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      target.disabled = false; target.removeAttribute('aria-busy'); target.innerHTML = `${icon('check')}演示完成`;
      if (target.isConnected) notify('加载状态演示已完成。');
    });
    const form = $('#demo-form');
    const input = $('#demo-name');
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') validName(input, $('#demo-name-error'), $('#demo-form-status')); });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validName(input, $('#demo-name-error'), $('#demo-form-status'))) { input.focus(); return; }
      $('#demo-form-status').textContent = `校验通过：“${input.value.trim()}”已完成创建交互演示，未写入远端。`;
    });
  }
  if (activeRoute === 'patterns') {
    updateProjects();
    $('#project-search').addEventListener('input', updateProjects);
    $('#project-status').addEventListener('change', updateProjects);
    let stored;
    try { stored = JSON.parse(localStorage.getItem('xu-ui-demo-settings')); } catch { /* Invalid or unavailable storage falls back to defaults. */ }
    $('#workspace-name').value = typeof stored?.name === 'string' ? stored.name : 'XU Studio';
    $('#workspace-density').value = ['comfortable','compact'].includes(stored?.density) ? stored.density : 'comfortable';
    $('#workspace-autosave').checked = stored?.autosave ?? true;
    if (stored?.name) $('#settings-status').textContent = '已载入当前浏览器保存的示例设置。';
    const input = $('#workspace-name');
    const saveButton=$('#settings-form [type="submit"]');
    const dirty=()=>{clearReceipt(saveButton);showStatus($('#settings-status'),'有未保存的更改。','dirty');};
    input.addEventListener('input', () => { dirty(); if (input.getAttribute('aria-invalid') === 'true') validName(input, $('#workspace-error')); });
    $('#settings-form').addEventListener('change',dirty);
    $('#settings-form').addEventListener('submit', (event) => {
      event.preventDefault();
      clearReceipt(saveButton);
      if (!validName(input, $('#workspace-error'), $('#settings-status'))) { input.focus(); return; }
      try {
        localStorage.setItem('xu-ui-demo-settings', JSON.stringify({ name: input.value.trim(), density: $('#workspace-density').value, autosave: $('#workspace-autosave').checked }));
        acknowledge(saveButton,'已保存');
        showStatus($('#settings-status'),'已保存到当前浏览器。刷新后可恢复；未上传到远端。');
      } catch { showStatus($('#settings-status'),'本地保存失败。输入已保留，请允许浏览器存储后重试。','error'); }
    });
  }
}

function render(focus = false) {
  if (dialog.open) {opener=undefined;dialog.close();}
  pageCleanup?.(); pageCleanup=undefined;
  disposeMotion(main);
  const [route, section] = location.hash.replace(/^#\//, '').split('#');
  activeRoute = route.replace(/\/$/, '') || 'overview';
  if (activeRoute === '#main') activeRoute = 'overview';
  const motion=()=>motionPage({icon,button,esc,breadcrumbs,heading,footer,tokens:data.tokens});
  const views = { overview, standards, foundations, components, icons, motion, patterns };
  const contract=data.components.find((item)=>activeRoute===`components/${item.id}`);
  main.innerHTML = activeRoute.startsWith('standards/') ? documentView(activeRoute.slice(10)) : activeRoute.startsWith('components/') ? (contract ? `${breadcrumbs(`组件 / ${contract.title}`)}${componentDetail(contract,{icon,button,esc})}${footer()}` : missing()) : (views[activeRoute] || missing)();
  main.dataset.view = activeRoute.split('/')[0];
  navigation();
  updateThemeButton();
  bindPage();
  settle($('.page-heading',main) || $('.cover-intro',main));
  const title = $('h1', main);
  document.title = activeRoute === 'overview' ? 'XUUI · 界面设计标准' : `${title?.textContent || '设计标准'} · XUUI`;
  if (section && /^section-\d+$/.test(section)) {
    const target = document.getElementById(section);
    target?.focus({ preventScroll:true }); target?.scrollIntoView({ block:'start' });
  } else if (focus) { title?.setAttribute('tabindex','-1'); title?.focus({ preventScroll:true }); window.scrollTo(0,0); }
}

$('#theme-toggle').addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  if ($('#overview-colors')) $('#overview-colors').innerHTML = swatches();
});
$('#menu-toggle').addEventListener('click', () => {
  const open = $('#sidebar').classList.toggle('open');
  $('#menu-toggle').setAttribute('aria-expanded', String(open));
  $('#menu-toggle').setAttribute('aria-label', open ? '收起导航' : '展开导航');
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && $('#sidebar').classList.contains('open') && !dialog.open) closeMenu(true); });
document.addEventListener('click', (event) => {
  const target = event.target.closest('button, a');
  if (!target) return;
  if (target.matches('[data-set-theme]')) { setTheme(target.dataset.setTheme); if ($('#overview-colors')) $('#overview-colors').innerHTML = swatches(); }
  if (target.matches('[data-notify]')) notify(target.dataset.notify);
  if (target.matches('[data-copy-token]')) copy(`var(--xu-${target.dataset.copyToken})`,undefined,target);
  if (target.matches('[data-create-project],#new-demo-project')) createProject(target);
  if (target.matches('[data-confirm]')) confirmDemo(target);
  if (target.matches('[data-close-dialog]')) dialog.close();
  if (target.matches('[data-icon]')) {
    selectedIcon = target.dataset.icon;
    $$('[data-icon]').forEach((entry) => entry.setAttribute('aria-pressed', String(entry === target)));
    stamp($('.tile-art',target));
    if (window.matchMedia('(min-width: 840px)').matches) updateInspector(true);
    else iconDetail(selectedIcon, target);
  }
  if (target.matches('[data-project]')) {
    const project = projects.find((item) => item.name === target.dataset.project);
    dialog.removeAttribute('aria-describedby');
    openDialog(`<div class="dialog-heading"><h2 id="dialog-title">项目详情 · 演示</h2>${button(icon('x'),'data-close-dialog aria-label="关闭项目详情" autofocus','ghost icon-only')}</div><h3>${esc(project.name)}</h3><p class="muted">${esc(project.description)}</p><p class="small">平台：${project.platform}<br>更新日期：${project.date}</p><div class="xu-alert info">${icon('info')}<p>此记录仅用于展示列表与详情交互，不对应实际仓库。</p></div>`, target);
  }
  const hash = target.getAttribute('href');
  if (hash?.startsWith('#/')) {
    closeMenu();
    if (hash === location.hash) { render(true); }
  }
});
document.addEventListener('change', (event) => { if (event.target.matches('[data-demo-switch]')) notify(`演示开关已${event.target.checked ? '开启' : '关闭'}。`); });
dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
document.addEventListener('toggle',event=>{
  if (event.target.matches('details[open]')) settle(event.target.querySelector(':scope > div, :scope > pre, :scope > textarea'));
},true);
window.addEventListener('hashchange', () => { if (location.hash !== '#main') { closeMenu(); render(true); } });

try {
  const response = await fetch(`./assets/data.${document.documentElement.lang}.json`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  data = await response.json();
  render();
} catch (error) {
  main.innerHTML = `${heading('LOAD ERROR','标准暂时无法载入。','请确认通过本地 HTTP 服务访问，重新运行 npm run dev 后刷新。')}<p class="small muted">${esc(error.message)}</p><a class="xu-button" href="https://github.com/xulang-org/xu-ui-design/tree/dev/standards">阅读仓库中的标准源文件</a>`;
}
