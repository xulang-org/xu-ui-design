// Framework-neutral reference controllers. Each mount returns a cleanup function.
const all = (root, selector) => [...root.querySelectorAll(selector)];

export function mountMenu(root, onAction = () => {}) {
  const abort = new AbortController();
  const opts = { signal: abort.signal };
  const trigger = root.querySelector('[data-menu-trigger]');
  const menu = root.querySelector('[role="menu"]');
  const items = () => all(menu, '[role="menuitem"]').filter((item) => !item.disabled && item.getAttribute('aria-disabled') !== 'true');
  const focusItem = (item) => { items().forEach(entry=>entry.tabIndex=entry===item?0:-1); item?.focus(); };
  const close = (restore = false) => { menu.hidden = true; trigger.setAttribute('aria-expanded','false'); if (restore) trigger.focus(); };
  const open = (last = false) => {
    if (trigger.disabled) return;
    menu.hidden = false; trigger.setAttribute('aria-expanded','true');
    const bounds = trigger.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(bounds.left, innerWidth-menu.offsetWidth-8))}px`;
    menu.style.top = `${Math.max(8, Math.min(bounds.bottom+4, innerHeight-menu.offsetHeight-8))}px`;
    focusItem(last ? items().at(-1) : items()[0]);
  };
  trigger.addEventListener('click', () => menu.hidden ? open() : close(), opts);
  trigger.addEventListener('keydown', (event) => { if (['ArrowDown','ArrowUp'].includes(event.key)) { event.preventDefault(); open(event.key === 'ArrowUp'); } }, opts);
  menu.addEventListener('keydown', (event) => {
    const list = items(), index = list.indexOf(document.activeElement);
    if (event.key === 'Escape') { event.preventDefault(); close(true); return; }
    if (event.key === 'Tab') { close(true); return; }
    let next;
    if (event.key === 'ArrowDown') next = (index+1)%list.length;
    if (event.key === 'ArrowUp') next = (index-1+list.length)%list.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = list.length-1;
    if (next !== undefined) { event.preventDefault(); focusItem(list[next]); }
  }, opts);
  menu.addEventListener('click', (event) => {
    const item = event.target.closest('[role="menuitem"]');
    if (!item || !menu.contains(item) || item.disabled || item.getAttribute('aria-disabled') === 'true') return;
    close(true); onAction(item.dataset.action);
  }, opts);
  document.addEventListener('click', (event) => { if (!root.contains(event.target)) close(); }, opts);
  root.addEventListener('focusout', () => queueMicrotask(() => { if (!root.contains(document.activeElement)) close(); }), opts);
  close();
  return () => abort.abort();
}

export function mountTabs(root) {
  const abort = new AbortController();
  const tabs = all(root, '[role="tab"]');
  const available = tabs.filter((tab) => !tab.disabled);
  const activate = (target, focus = true) => {
    tabs.forEach((tab) => {
      const selected = tab === target;
      tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
      const panel = root.querySelector(`#${tab.getAttribute('aria-controls')}`);
      panel.hidden = !selected;
    });
    if (focus) target.focus();
  };
  available.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab), { signal:abort.signal });
    tab.addEventListener('keydown', (event) => {
      let index = available.indexOf(tab);
      if (event.key === 'ArrowRight') index = (index+1)%available.length;
      else if (event.key === 'ArrowLeft') index = (index-1+available.length)%available.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = available.length-1;
      else return;
      event.preventDefault(); activate(available[index]);
    }, { signal:abort.signal });
  });
  activate(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || available[0], false);
  return () => abort.abort();
}

export function mountPagedTable(root, records) {
  const abort = new AbortController(), opts = { signal:abort.signal };
  const input = root.querySelector('[data-table-search]'), body = root.querySelector('tbody');
  const previous = root.querySelector('[data-previous]'), next = root.querySelector('[data-next]');
  const status = root.querySelector('[role="status"]'), clear = root.querySelector('[data-clear]');
  const sort = root.querySelector('[data-sort]');
  let page = 1, ascending = true;
  const size = 4;
  const update = () => {
    const query = input.value.trim().toLowerCase();
    const rows = records.filter((item) => `${item.name} ${item.platform}`.toLowerCase().includes(query)).sort((a,b) => ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    const pages = Math.max(1,Math.ceil(rows.length/size)); page = Math.min(page,pages);
    body.replaceChildren();
    rows.slice((page-1)*size,page*size).forEach((item) => {
      const row = document.createElement('tr');
      [item.name,item.platform,item.status].forEach((value) => { const cell = document.createElement('td'); cell.textContent = value; row.append(cell); });
      body.append(row);
    });
    if (!rows.length) { const row = document.createElement('tr'), cell = document.createElement('td'); cell.colSpan = 3; cell.textContent = '没有匹配的项目，请清空筛选。'; row.append(cell); body.append(row); }
    previous.disabled = page === 1; next.disabled = page === pages;
    status.textContent = `记录数：${rows.length} · 页码 ${page} / ${pages}`;
    sort.closest('th').setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
    clear.hidden = !query;
  };
  input.addEventListener('input', () => { page=1; update(); }, opts);
  previous.addEventListener('click', () => { page--; update(); }, opts);
  next.addEventListener('click', () => { page++; update(); }, opts);
  sort.addEventListener('click', () => { ascending=!ascending; update(); }, opts);
  clear.addEventListener('click', () => { input.value=''; page=1; update(); input.focus(); }, opts);
  update(); return () => abort.abort();
}

export function mountTree(root, onSelect = () => {}) {
  const abort = new AbortController();
  const items = all(root,'[role="treeitem"]');
  const visible = () => items.filter((item) => !item.closest('[hidden]'));
  const focus = (item) => { items.forEach((entry) => entry.tabIndex=entry===item ? 0 : -1); item.focus(); };
  const expand = (item, value) => {
    const group = [...item.children].find((child) => child.getAttribute('role') === 'group');
    if (group) { item.setAttribute('aria-expanded', String(value)); group.hidden=!value; }
  };
  const select = (item) => { items.forEach((entry) => entry.setAttribute('aria-selected',String(entry===item))); onSelect(item.dataset.path); };
  root.addEventListener('click', (event) => {
    const item = event.target.closest('[role="treeitem"]');
    if (!item || !root.contains(item)) return;
    focus(item); select(item);
    if (event.target.closest('[data-tree-toggle]')) expand(item,item.getAttribute('aria-expanded') !== 'true');
  }, { signal:abort.signal });
  root.addEventListener('keydown', (event) => {
    const item = event.target.closest('[role="treeitem"]');
    if (!item) return;
    const list=visible(), index=list.indexOf(item);
    let target;
    if (event.key === 'ArrowDown') target=list[Math.min(index+1,list.length-1)];
    else if (event.key === 'ArrowUp') target=list[Math.max(index-1,0)];
    else if (event.key === 'Home') target=list[0];
    else if (event.key === 'End') target=list.at(-1);
    else if (event.key === 'ArrowRight') {
      if (item.getAttribute('aria-expanded') === 'false') expand(item,true);
      else target=items.find((entry) => entry.dataset.parent===item.id);
    } else if (event.key === 'ArrowLeft') {
      if (item.getAttribute('aria-expanded') === 'true') expand(item,false);
      else target=items.find((entry) => entry.id===item.dataset.parent);
    } else if (['Enter',' '].includes(event.key)) select(item);
    else return;
    event.preventDefault(); if (target) focus(target);
  }, { signal:abort.signal });
  return () => abort.abort();
}

export function mountSplitter(root) {
  const abort = new AbortController(), opts={ signal:abort.signal };
  const separator=root.querySelector('[role="separator"]'), status=root.querySelector('[role="status"]');
  let value=50;
  const set = (next) => {
    value=Math.round(Math.min(75,Math.max(25,next)));
    root.style.setProperty('--split-ratio',String(value/100));
    separator.setAttribute('aria-valuenow',String(value));
    separator.setAttribute('aria-valuetext',`左侧 ${value}%`);
    status.textContent=`左侧 ${value}% · 右侧 ${100-value}%`;
  };
  separator.addEventListener('keydown',(event) => {
    if (event.key==='ArrowLeft') set(value-5);
    else if (event.key==='ArrowRight') set(value+5);
    else if (event.key==='Home') set(25);
    else if (event.key==='End') set(75);
    else return;
    event.preventDefault();
  },opts);
  separator.addEventListener('pointerdown',(event) => { if (event.button===0) { separator.setPointerCapture(event.pointerId); separator.focus(); } },opts);
  separator.addEventListener('pointermove',(event) => {
    if (!separator.hasPointerCapture(event.pointerId)) return;
    const bounds=root.querySelector('[data-split-panels]').getBoundingClientRect();
    set((event.clientX-bounds.left-22)/Math.max(1,bounds.width-44)*100);
  },opts);
  const release=(event) => { if (separator.hasPointerCapture(event.pointerId)) separator.releasePointerCapture(event.pointerId); };
  separator.addEventListener('pointerup',release,opts); separator.addEventListener('pointercancel',release,opts);
  set(50); return () => abort.abort();
}
