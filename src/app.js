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

function notify(message) {
  clearTimeout(toastTimer);
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 4000);
}

async function copy(text, fallback) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    notify('已复制到剪贴板');
  } catch {
    if (fallback) { fallback.focus(); fallback.select(); }
    notify(fallback ? '复制未完成，请手动复制已选中的源码。' : '剪贴板不可用，请从 Token 下载文件中复制。');
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
  const entries = [['overview','总览','grid'], ['standards','标准文档','file'], ['foundations','基础与 Token','palette'], ['components','组件实验室','layers'], ['icons','ICON 图标库','square'], ['patterns','页面模式','monitor']];
  const current = (route) => activeRoute === route ? 'aria-current="page"' : '';
  $('#sidebar').innerHTML = `<nav><div class="nav-label">EXPLORE / 探索</div>${entries.map(([id, title, name]) => `<a class="nav-link" href="#/${id}" ${current(id)}>${icon(name)}${title}</a>`).join('')}<div class="nav-label">STANDARDS / 设计标准</div>${data.docs.map((doc, i) => `<a class="nav-link" href="#/standards/${doc.id}" ${current(`standards/${doc.id}`)}><span class="nav-number">${String(i + 1).padStart(2, '0')}</span>${doc.title}</a>`).join('')}</nav><div class="sidebar-footer">规范与效果，同一份来源。<a href="./tokens/tokens.json" download>下载设计 Token ${icon('download')}</a></div>`;
}

const breadcrumbs = (title) => `<div class="breadcrumbs"><a href="#/overview">XUUI</a><span>/</span><span>${esc(title)}</span></div>`;
const heading = (en, title, text) => `<div class="page-heading"><div class="eyebrow">${en}</div><h1 tabindex="-1">${title}</h1><p class="lead">${text}</p></div>`;
const footer = () => `<footer class="footnote"><span>XUUI / ${data.version} · 设计标准与浏览器参考实现</span><span>PRECISE BY DESIGN.</span></footer>`;
const demoTitle = (title, standard) => `<div class="demo-title"><h2>${title}</h2><a href="#/standards/${standard}">阅读对应标准 ${icon('arrow-right')}</a></div>`;
const code = (content) => `<details><summary>查看使用代码</summary><pre tabindex="0"><code>${esc(content)}</code></pre></details>`;

function swatches() {
  const theme = data.tokens.themes[document.documentElement.dataset.theme];
  return `<div class="color-strip">${[['brand','朱砂 / BRAND'],['text','金石 / INK'],['canvas',document.documentElement.dataset.theme === 'light' ? '宣纸 / CANVAS' : '曜石 / CANVAS'],['success','松绿 / SUCCESS'],['info','海蓝 / INFO']].map(([key, label]) => `<div class="color-sample"><span class="swatch" style="background:var(--xu-${key})"></span><p>${label}</p><code>${theme[key].toUpperCase()}</code></div>`).join('')}</div>`;
}

function overview() {
  return `${breadcrumbs('设计系统')}<section class="hero"><div><div class="eyebrow">XUUI / DESIGN LANGUAGE</div><h1 tabindex="-1"><span>让界面有序，</span><span class="brand">让体验一致。</span></h1><p>从一枚图标，到每一个交互细节。<br>为 XU 生态建立可复用、可验证、可持续的设计语言。</p><div class="hero-actions">${link(`开始阅读 ${icon('arrow-right')}`, 'standards', 'primary')}${link('探索组件', 'components')}</div><div class="hero-notes"><span><b>${data.docs.length}</b> 篇设计标准</span><span><b>${data.icons.length}</b> 枚 SVG 图标</span><span><b>02</b> 套主题</span></div></div><div><div class="workbench"><div class="window-bar"><span class="window-dots"><i></i><i></i><i></i></span><span class="mono">workspace / appearance</span><span>01</span></div><div class="workbench-body"><span class="xu-badge">LIVE REFERENCE · 可交互预览</span><h2>工作区，恰如所需。</h2><p class="workbench-caption">一套变量，贯穿每一处细节。</p><div class="spec-line"><span>外观主题</span><div class="theme-choices">${button('曜石', 'data-set-theme="dark" aria-pressed="true" data-size="sm"')}${button('宣纸', 'data-set-theme="light" aria-pressed="false" data-size="sm"')}</div></div><div class="spec-line"><span>自动保存 <span class="muted">/ 演示</span></span><label class="xu-check"><input type="checkbox" class="xu-switch" role="switch" aria-label="演示自动保存" data-demo-switch checked></label></div><div class="workbench-bottom"><span class="xu-badge success">${icon('check-circle')}标准已就绪</span>${link(`查看规范 ${icon('arrow-right')}`, 'standards/04-layout', 'ghost')}</div><div class="ruler"><span>4 PX GRID</span><span>24 / 40 / 48</span><span>1.5 STROKE</span></div></div></div></div></section><div class="section-heading"><h2><span class="section-no">01</span>色彩有语义，设计有依据。</h2><a href="#/foundations">全部基础规范 ${icon('arrow-right')}</a></div><div id="overview-colors">${swatches()}</div><div class="resource-grid"><a href="#/standards" class="resource"><span class="resource-mark">01 / DOCUMENTATION</span><h3>设计标准</h3><p>原则、布局、状态与交付。<br>让每一次设计决定都有据可循。</p></a><a href="#/components" class="resource"><span class="resource-mark">02 / COMPONENTS</span><h3>组件实验室</h3><p>真实操作，实时反馈。<br>核对按钮、表单与浮层的每种状态。</p></a><a href="#/icons" class="resource"><div class="resource-icons">${['box','git-branch','terminal','sliders','arrow-right'].map((v) => icon(v)).join('')}</div><h3>ICON，精确到每一笔。</h3><p>统一网格与线宽，支持检索和 SVG 导出。</p></a></div>${footer()}`;
}

function standards() {
  return `${breadcrumbs('标准文档')}${heading('DOCUMENTATION / 12 STANDARDS','把设计共识，写成标准。','从视觉基础到交付验收，每篇标准都关联对应效果。选择一篇开始阅读，或通过关键词查找。')}<div class="toolbar"><div class="xu-field"><label for="doc-search">查找标准</label><input class="xu-input" type="search" id="doc-search" placeholder="例如：图标、表单、主题"></div></div><p class="result-count" id="doc-count" role="status">${data.docs.length} 篇标准</p><div class="docs-grid" id="doc-results"></div>`;
}

function updateDocs() {
  const query = $('#doc-search').value.trim().toLowerCase();
  const docs = data.docs.filter((doc) => `${doc.title} ${doc.summary} ${doc.group}`.toLowerCase().includes(query));
  $('#doc-count').textContent = `${docs.length} 篇标准`;
  $('#doc-results').innerHTML = docs.length ? docs.map((doc) => `<a href="#/standards/${doc.id}" class="doc-card"><span class="num">${doc.id.slice(0, 2)}</span><div><h2>${doc.title}</h2><p>${doc.summary}</p></div>${icon('arrow-right')}</a>`).join('') : `<div class="empty"><h3>没有找到对应标准</h3><p>试试“基础”“组件”，或清空关键词。</p>${button('清空搜索', 'id="clear-doc-search"')}</div>`;
  $('#clear-doc-search')?.addEventListener('click', () => { $('#doc-search').value = ''; updateDocs(); $('#doc-search').focus(); });
}

function documentView(id) {
  const doc = data.docs.find((item) => item.id === id);
  if (!doc) return missing();
  return `${breadcrumbs(`标准 / ${doc.title}`)}<div class="document"><div class="document-actions"><a class="small muted" href="#/standards">${icon('arrow-left')} 全部标准</a><div class="row"><a class="xu-button" href="./standards/${id}.md" download>${icon('download')} Markdown 源文件</a>${link('查看对应效果', doc.demo, 'primary')}</div></div><article>${doc.html}</article><div class="xu-alert info">${icon('info')}<p>规范对应 ${data.version}。使用资源前运行构建，Token 和 SVG 从同一源文件导出。</p></div></div>${footer()}`;
}

function foundations() {
  const mode = document.documentElement.dataset.theme;
  const theme = data.tokens.themes[mode];
  const rows = Object.entries(theme).filter(([, value]) => /^#[0-9a-f]{6}$/.test(value));
  return `${breadcrumbs('基础与 Token')}${heading('FOUNDATIONS / DESIGN TOKENS','以规则，构成秩序。','所有变量来自 tokens/tokens.json。切换顶部主题查看对应色值；点击变量复制 CSS 用法。')}<div class="row"><a class="xu-button" href="./tokens/tokens.json" download>${icon('download')} 下载 Token JSON</a><a class="xu-button" href="./assets/tokens.css" download>下载 CSS 变量</a></div><section class="demo-section"><div class="section-heading"><h2>01 / 语义色 · ${mode === 'dark' ? '曜石暗夜' : '宣纸雪岩'}</h2><a href="#/standards/02-color">使用规则 ${icon('arrow-right')}</a></div>${swatches()}<div class="token-list">${rows.map(([key, value]) => `<button type="button" class="token-button" data-copy-token="${key}" aria-label="复制 --xu-${key}"><i class="token-swatch" style="background:var(--xu-${key})"></i><code class="token-name">--xu-${key}</code><span>${value.toUpperCase()}</span></button>`).join('')}</div></section><section class="demo-section">${demoTitle('02 / 文字对比度', '02-color')}<p class="small muted">下列值由构建时计算，背景为当前主题的 surface；完整约定组合由 check 命令验证。</p><div class="table-scroll" role="region" aria-label="主题文字对比度" tabindex="0"><table><thead><tr><th scope="col">文字角色</th><th scope="col">对比度</th><th scope="col">项目门槛</th></tr></thead><tbody>${Object.entries(data.ratios[mode]).map(([key, ratio]) => `<tr><td><code>--xu-${key}</code></td><td>${ratio}:1</td><td>${icon('check')} ≥ 4.5:1</td></tr>`).join('')}</tbody></table></div></section><section class="demo-section">${demoTitle('03 / 字体与层级', '03-typography')}<div class="demo-frame"><div class="type-specimen">秩序之中，自有锋芒。<br>Precision in every detail.</div><p>正文 16 / 1.65 · 设计与开发，使用同一种语言。</p><p class="mono small muted">const design = 'consistent'; // Token / Code</p><div class="row">${[12,14,16,20,28,40].map((size) => `<span style="font-size:${size}px">Aa<span class="small muted"> ${size}</span></span>`).join('')}</div></div></section><section class="demo-section">${demoTitle('04 / 空间刻度', '04-layout')}<div class="demo-frame"><div class="spacing-demo">${[1,2,3,4,6,8,12,16].map((size) => `<div class="spacing-item"><div class="spacing-bar" style="width:var(--xu-space-${size})"></div>${size * 4} px</div>`).join('')}</div></div></section>${footer()}`;
}

function components() {
  return `${breadcrumbs('组件实验室')}${heading('COMPONENT LAB / INTERACTIVE','细节，经得起操作。','用真实交互检查组件的层级、状态和反馈。这里的所有操作都是浏览器演示，不连接远端服务。')}<div class="filter-row" aria-label="组件筛选">${[['all','全部组件'],['actions','操作'],['forms','输入'],['feedback','反馈']].map(([id,title]) => `<button type="button" data-component-filter="${id}" aria-pressed="${id === 'all'}">${title}</button>`).join('')}</div><section class="demo-section" data-component="actions">${demoTitle('01 / 操作与按钮','06-actions')}<div class="demo-frame"><div class="toolbar"><div class="xu-field compact"><label for="button-size">预览尺寸</label><select class="xu-select" id="button-size"><option value="sm">sm · 32 px</option><option value="md" selected>md · 40 px</option><option value="lg">lg · 48 px</option></select></div><span class="small muted">悬停、按下或用 Tab 查看焦点状态。</span></div><div class="demo-buttons" id="sized-buttons"><span class="state-label">层级</span>${button(`${icon('plus')}新建项目`, 'data-notify="新建项目：交互演示已触发。"', 'primary')}${button('次要操作','data-notify="已触发次要操作。"')}${button('轻量操作','data-notify="已触发轻量操作。"','ghost')}${button(`${icon('trash')}删除`,'data-confirm','danger')}</div><div class="demo-buttons"><span class="state-label">状态</span>${button('点击加载','id="loading-demo"','primary')}${button('暂不可用','disabled')}${button(icon('sliders'),'aria-label="调整演示参数" data-notify="参数按钮可用。"','icon-only')}</div><p class="xu-help" style="margin-top:16px">禁用原因示例：尚未选择项目，当前操作不可用。</p><div class="component-meta">HEIGHT 32 / 40 / 48 · GAP 8 · RADIUS 8 · FOCUS 2</div>${code('<button type="button" class="xu-button primary" data-size="md">保存设置</button>')}</div></section><section class="demo-section" data-component="forms">${demoTitle('02 / 表单与选择','07-forms')}<div class="demo-frame"><div class="two-columns"><form id="demo-form" class="field-stack" novalidate><div class="xu-field"><label for="demo-name">项目名称 <span class="muted small">必填</span></label><input class="xu-input" id="demo-name" name="name" maxlength="40" required placeholder="例如：stone-workbench" aria-describedby="demo-name-help demo-name-error"><p class="xu-help" id="demo-name-help">使用 1–40 个字符。试试留空后提交。</p><p class="xu-error" id="demo-name-error"></p></div><div class="xu-field"><label for="demo-platform">目标平台</label><select class="xu-select" id="demo-platform" name="platform"><option>桌面应用</option><option>Web 应用</option><option>命令行工具</option></select></div><label class="xu-check"><input type="checkbox" name="template" checked>包含示例模板</label><div><button type="submit" class="xu-button primary">验证并创建 ${icon('arrow-right')}</button></div><p id="demo-form-status" class="small muted" role="status"></p></form><div class="field-stack"><div class="xu-field"><label for="readonly-input">只读输入</label><input id="readonly-input" class="xu-input" value="xulang-org / xu-ui-design" readonly></div><div class="xu-field"><label for="disabled-input">禁用输入</label><input id="disabled-input" class="xu-input" value="由组织统一管理" disabled><p class="xu-help">示例：组织策略禁止修改。</p></div><div class="xu-field"><label for="demo-description">项目说明</label><textarea id="demo-description" class="xu-textarea" placeholder="可选，描述这个项目的用途。" maxlength="200"></textarea></div><label class="xu-check"><input type="checkbox" class="xu-switch" role="switch" data-demo-switch checked>启用演示通知</label></div></div>${code('<label for="name">项目名称</label>\n<input class="xu-input" id="name" required aria-describedby="help">\n<p id="help" class="xu-help">使用 1–40 个字符。</p>')}</div></section><section class="demo-section" data-component="feedback">${demoTitle('03 / 状态与反馈','09-feedback')}<div class="demo-frame"><div class="row">${[['success','check-circle','已完成'],['warning','alert-triangle','需注意'],['danger','x-circle','未通过'],['info','info','信息']].map(([type,name,label]) => `<span class="xu-badge ${type}">${icon(name)}${label}</span>`).join('')}</div><div class="field-stack" style="margin-top:24px"><div class="xu-alert info">${icon('info')}<p><strong>这是一条说明。</strong><br>颜色、图标与文字共同表达信息，避免单靠颜色判断。</p></div><div class="xu-alert warning">${icon('alert-triangle')}<p><strong>保存前请检查。</strong><br>关键反馈保留在页面内，让用户有时间阅读和恢复。</p></div><div><label for="demo-progress" class="small">确定进度示例 · 68%</label><progress id="demo-progress" class="xu-progress" max="100" value="68">68%</progress></div></div><div class="row" style="margin-top:24px">${button('显示短通知','data-notify="这是一条演示通知，不会抢走键盘焦点。"')}${button('打开确认对话框','data-confirm')}</div>${code('<dialog aria-labelledby="title">\n  <h2 id="title">确认操作</h2>\n  <button type="button">取消</button>\n</dialog>\n<!-- 使用 showModal() 打开，close() 关闭。 -->')}</div></section>${footer()}`;
}

function icons() {
  const categories = [...new Set(data.icons.map((item) => item.category))];
  return `${breadcrumbs('ICON 图标库')}${heading('ICONOGRAPHY / 48 ORIGINAL SVG','一笔一画，统一表达。','24 单位网格 · 1.5 单位线宽 · currentColor。选择图标查看细节、复制内联 SVG 或下载文件。')}<div class="row" style="margin-bottom:28px"><a class="xu-button" href="./assets/icons.svg" download>${icon('download')} 下载 SVG Sprite</a><a class="xu-button" href="#/standards/05-icons">阅读 ICON 标准</a></div><div class="toolbar"><div class="xu-field"><label for="icon-search">检索图标</label><input type="search" class="xu-input" id="icon-search" placeholder="英文名、中文名或分类，如 arrow / 搜索"></div><div class="xu-field compact"><label for="icon-category">分类</label><select class="xu-select" id="icon-category"><option value="all">全部分类</option>${categories.map((v) => `<option>${v}</option>`).join('')}</select></div><div class="xu-field compact"><label for="icon-size">预览尺寸</label><select class="xu-select" id="icon-size">${[16,20,24,32].map((v) => `<option value="${v}" ${v === 24 ? 'selected' : ''}>${v} px</option>`).join('')}</select></div></div><p class="result-count" id="icon-count" role="status"></p><div class="icon-grid" id="icon-results"></div>${footer()}`;
}

function updateIcons() {
  const query = $('#icon-search').value.trim().toLowerCase();
  const category = $('#icon-category').value;
  const results = data.icons.filter((item) => `${item.name} ${item.label} ${item.category}`.toLowerCase().includes(query) && (category === 'all' || item.category === category));
  $('#icon-count').textContent = `${results.length} / ${data.icons.length} 枚图标 · 点击查看与导出`;
  const container = $('#icon-results');
  container.classList.toggle('icon-grid', !!results.length);
  container.style.setProperty('--preview-icon-size', `${$('#icon-size').value}px`);
  container.innerHTML = results.length ? results.map((item) => `<button type="button" class="icon-tile" data-icon="${item.name}" aria-label="查看 ${item.label} ${item.name}">${icon(item.name)}<span>${item.name}</span></button>`).join('') : `<div class="empty">${icon('search')}<h3>没有找到匹配图标</h3><p>试试其他关键词，或恢复全部分类。</p>${button('清空筛选','id="clear-icon-search"')}</div>`;
  $('#clear-icon-search')?.addEventListener('click', () => { $('#icon-search').value = ''; $('#icon-category').value = 'all'; updateIcons(); $('#icon-search').focus(); });
}

const projects = [
  { name:'stone-workbench', description:'桌面工作区', platform:'Desktop', status:'active', date:'2026-10-28' },
  { name:'paper-docs', description:'文档与知识库', platform:'Web', status:'active', date:'2026-10-26' },
  { name:'cinnabar-cli', description:'终端工具实验', platform:'CLI', status:'draft', date:'2026-10-24' },
  { name:'grid-studio', description:'布局原型', platform:'Web', status:'archived', date:'2026-10-20' }
];

function patterns() {
  return `${breadcrumbs('页面模式')}${heading('PATTERNS / REAL SCENARIOS','从组件，到完整体验。','设置、数据列表、空状态。以下均为演示数据，帮助检查组件组合后的层级和操作路径。')}<section class="demo-section">${demoTitle('01 / 工作区设置','10-patterns')}<div class="demo-frame"><div class="pattern-header"><div><h2>工作区设置</h2><p>示例 · 仅保存至当前浏览器</p></div><span class="xu-badge">LOCAL DEMO</span></div><div class="settings-layout"><div class="settings-rail" aria-hidden="true"><span>基本设置</span><span>外观与主题</span><span>通知偏好</span></div><form id="settings-form" class="field-stack" novalidate><div class="xu-field"><label for="workspace-name">工作区名称 <span class="muted small">必填</span></label><input class="xu-input" id="workspace-name" name="name" required maxlength="40" aria-describedby="workspace-help workspace-error"><p class="xu-help" id="workspace-help">使用 1–40 个字符；请勿填写私密信息。</p><p class="xu-error" id="workspace-error"></p></div><div class="xu-field"><label for="workspace-density">界面密度偏好</label><select class="xu-select" id="workspace-density" name="density"><option value="comfortable">舒适 · 较多留白</option><option value="compact">紧凑 · 更多信息</option></select><p class="xu-help">此示例仅保存偏好值，不改变整个展厅布局。</p></div><label class="xu-check"><input type="checkbox" id="workspace-autosave" name="autosave">保存时保留本地草稿（示例偏好）</label><div><button type="submit" class="xu-button primary">${icon('check')} 保存到本地</button></div><p id="settings-status" class="small muted" role="status">尚未保存。</p></form></div></div></section><section class="demo-section">${demoTitle('02 / 项目列表','10-patterns')}<div class="demo-frame"><div class="pattern-header"><div><h2>项目工作台</h2><p>4 条本地演示记录 · 非真实仓库状态</p></div>${button(`${icon('plus')}新建演示项目`,'id="new-demo-project"','primary')}</div><div class="toolbar"><div class="xu-field"><label for="project-search">搜索项目</label><input type="search" class="xu-input" id="project-search" placeholder="按项目名称或说明查找"></div><div class="xu-field compact"><label for="project-status">状态</label><select class="xu-select" id="project-status"><option value="all">全部状态</option><option value="active">进行中</option><option value="draft">草稿</option><option value="archived">已归档</option></select></div></div><div id="project-table"></div><p id="project-count" class="result-count" role="status" style="margin-top:16px"></p></div></section><section class="demo-section">${demoTitle('03 / 初始空状态','10-patterns')}<div class="empty">${icon('folder')}<h3>为下一个想法，建立工作区。</h3><p>当前是空状态示例。先创建一个项目，再逐步添加内容。</p>${link(`${icon('plus')}尝试创建交互`, 'components', 'primary')}</div></section>${footer()}`;
}

let sortAscending = true;
function updateProjects() {
  const query = $('#project-search').value.trim().toLowerCase();
  const status = $('#project-status').value;
  const filtered = projects.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query) && (status === 'all' || status === item.status)).sort((a,b) => sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  $('#project-count').textContent = `显示 ${filtered.length} / ${projects.length} 条演示记录`;
  const statuses = { active:['success','进行中'], draft:['warning','草稿'], archived:['info','已归档'] };
  $('#project-table').innerHTML = filtered.length ? `<div class="table-scroll" role="region" aria-label="演示项目列表" tabindex="0"><table class="table-demo"><thead><tr><th scope="col" aria-sort="${sortAscending ? 'ascending' : 'descending'}"><button type="button" class="sort-button" id="sort-projects">项目名称 ${icon(sortAscending ? 'arrow-up' : 'arrow-down')}</button></th><th scope="col">平台</th><th scope="col">状态</th><th scope="col">更新日期</th><th scope="col">操作</th></tr></thead><tbody>${filtered.map((item) => `<tr><td><strong>${esc(item.name)}</strong><small>${esc(item.description)}</small></td><td class="mono small">${item.platform}</td><td><span class="xu-badge ${statuses[item.status][0]}">${statuses[item.status][1]}</span></td><td class="mono small muted">${item.date}</td><td>${button('详情', `data-project="${esc(item.name)}" aria-label="查看 ${esc(item.name)} 详情" data-size="sm"`, 'ghost')}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty">${icon('search')}<h3>没有匹配的项目</h3><p>清空关键词和状态条件，重新查看演示记录。</p>${button('清空筛选','id="clear-projects"')}</div>`;
  $('#sort-projects')?.addEventListener('click', () => { sortAscending = !sortAscending; updateProjects(); $('#sort-projects')?.focus(); });
  $('#clear-projects')?.addEventListener('click', () => { $('#project-search').value = ''; $('#project-status').value = 'all'; updateProjects(); $('#project-search').focus(); });
}

function validName(input, error, status) {
  const value = input.value.trim();
  const message = !value ? '请输入项目或工作区名称，不能只包含空格。' : value.length > 40 ? '名称不能超过 40 个字符。' : '';
  input.setAttribute('aria-invalid', String(!!message));
  error.textContent = message;
  if (message && status) status.textContent = '';
  return !message;
}

function openDialog(content, trigger) {
  opener = trigger || document.activeElement;
  $('#dialog-content').innerHTML = content;
  dialog.showModal();
  $('[autofocus]', dialog)?.focus();
}

function confirmDemo(trigger) {
  openDialog(`<div class="dialog-heading"><h2 id="dialog-title">确认删除演示项目？</h2></div><p class="muted" id="dialog-description">这是组件行为演示。确认后仅显示一条反馈，不会删除任何真实项目或文件。</p><div class="row">${button('取消','data-close-dialog autofocus')}${button('确认演示','id="confirm-demo-action"','danger')}</div>`, trigger);
  dialog.setAttribute('aria-describedby', 'dialog-description');
  $('#confirm-demo-action').addEventListener('click', () => { dialog.close(); notify('已完成确认交互演示，未删除真实资源。'); });
}

function iconDetail(name, trigger) {
  const item = data.icons.find((entry) => entry.name === name);
  const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${item.body}</svg>`;
  dialog.removeAttribute('aria-describedby');
  openDialog(`<div class="dialog-heading"><div><h2 id="dialog-title">${item.label}</h2><span class="mono small muted">${item.name}</span></div>${button(icon('x'),'data-close-dialog aria-label="关闭图标详情" autofocus','ghost icon-only')}</div><div class="icon-enlarged">${icon(item.name)}</div><p class="small muted">${item.category} / 24 × 24 / 1.5 stroke<br>复制用于装饰的内联 SVG；仅图标按钮仍须提供可访问名称。</p><label for="icon-source" class="small">SVG 源码</label><textarea id="icon-source" class="xu-textarea source-code" readonly spellcheck="false">${esc(source)}</textarea><div class="row">${button(`${icon('copy')}复制 SVG`,'id="copy-icon"','primary')}<a class="xu-button" href="./icons/${item.name}.svg" download="${item.name}.svg">${icon('download')}下载 SVG</a></div>`, trigger);
  $('#copy-icon').addEventListener('click', () => copy(source, $('#icon-source')));
}

function missing() { return `${heading('404 / PAGE NOT FOUND','这个页面还不存在。','从设计系统总览重新开始，或使用侧栏查找标准。')}${link('返回总览','overview','primary')}`; }

function bindPage() {
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
    input.addEventListener('input', () => { $('#settings-status').textContent = '有未保存的更改。'; if (input.getAttribute('aria-invalid') === 'true') validName(input, $('#workspace-error')); });
    $('#settings-form').addEventListener('change', () => $('#settings-status').textContent = '有未保存的更改。');
    $('#settings-form').addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validName(input, $('#workspace-error'), $('#settings-status'))) { input.focus(); return; }
      try {
        localStorage.setItem('xu-ui-demo-settings', JSON.stringify({ name: input.value.trim(), density: $('#workspace-density').value, autosave: $('#workspace-autosave').checked }));
        $('#settings-status').textContent = '已保存到当前浏览器。刷新后可恢复；未上传到远端。';
      } catch { $('#settings-status').textContent = '本地保存失败。输入已保留，请允许浏览器存储后重试。'; }
    });
    $('#new-demo-project').addEventListener('click', () => { location.hash = '/components'; });
  }
}

function render(focus = false) {
  activeRoute = location.hash.replace(/^#\//, '').replace(/\/$/, '') || 'overview';
  if (activeRoute === '#main') activeRoute = 'overview';
  const views = { overview, standards, foundations, components, icons, patterns };
  main.innerHTML = activeRoute.startsWith('standards/') ? documentView(activeRoute.slice(10)) : (views[activeRoute] || missing)();
  navigation();
  updateThemeButton();
  bindPage();
  const title = $('h1', main);
  document.title = `${title?.textContent || '设计标准'} · XUUI`;
  if (focus) { title?.setAttribute('tabindex','-1'); title?.focus({ preventScroll:true }); window.scrollTo(0,0); }
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
  if (target.matches('[data-copy-token]')) copy(`var(--xu-${target.dataset.copyToken})`);
  if (target.matches('[data-confirm]')) confirmDemo(target);
  if (target.matches('[data-close-dialog]')) dialog.close();
  if (target.matches('[data-icon]')) iconDetail(target.dataset.icon, target);
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
window.addEventListener('hashchange', () => { if (location.hash !== '#main') { closeMenu(); render(true); } });

try {
  const response = await fetch('./assets/data.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  data = await response.json();
  render();
} catch (error) {
  main.innerHTML = `${heading('LOAD ERROR','标准暂时无法载入。','请确认通过本地 HTTP 服务访问，重新运行 npm run dev 后刷新。')}<p class="small muted">${esc(error.message)}</p><a class="xu-button" href="https://github.com/xulang-org/xu-ui-design/tree/feat/design-system-foundation/standards">阅读仓库中的标准源文件</a>`;
}
