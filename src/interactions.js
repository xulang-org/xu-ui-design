import { settle, playMotion, cancelMotion, disposeMotion } from './motion.js';
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
  return () => {abort.abort();disposeMotion(root);};
}

export function mountTabs(root) {
  const abort = new AbortController();
  const tabs = all(root, '[role="tab"]');
  const available = tabs.filter((tab) => !tab.disabled);
  const list=root.querySelector('[role="tablist"]');
  const marker=document.createElement('span');
  marker.className='xu-tab-marker';marker.setAttribute('aria-hidden','true');
  list.append(marker);list.dataset.motionReady='true';
  const position=(target,animate=true)=>{
    const from=getComputedStyle(marker).transform;
    const bounds=target.getBoundingClientRect(),frame=list.getBoundingClientRect();
    const next=`translate(${bounds.left-frame.left}px,${bounds.bottom-frame.top-2}px) scaleX(${bounds.width})`;
    marker.style.transform=next;
    if (animate) playMotion(marker,[{transform:from},{transform:next}]);
    else cancelMotion(marker);
  };
  const activate = (target, focus = true) => {
    tabs.forEach((tab) => {
      const selected = tab === target;
      tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
      const panel = root.querySelector(`#${tab.getAttribute('aria-controls')}`);
      panel.hidden = !selected;
      if (selected && focus) settle(panel);
      if (!selected) cancelMotion(panel);
    });
    if (focus) target.focus();
    position(target,focus);
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
  const observer=new ResizeObserver(()=>position(tabs.find(tab=>tab.getAttribute('aria-selected')==='true'),false));
  observer.observe(list);
  return () => {abort.abort();observer.disconnect();disposeMotion(root);marker.remove();delete list.dataset.motionReady;};
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
  update(); return () => {abort.abort();disposeMotion(root);};
}

export function mountTree(root, onSelect = () => {}) {
  const abort = new AbortController();
  const items = all(root,'[role="treeitem"]');
  const visible = () => items.filter((item) => !item.closest('[hidden]'));
  const focus = (item) => { items.forEach((entry) => entry.tabIndex=entry===item ? 0 : -1); item.focus(); };
  const expand = (item, value) => {
    const group = [...item.children].find((child) => child.getAttribute('role') === 'group');
    if (group) { item.setAttribute('aria-expanded', String(value)); group.hidden=!value;if(value)settle(group);else cancelMotion(group); }
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
  return () => {abort.abort();disposeMotion(root);};
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
  set(50); return () => {abort.abort();disposeMotion(root);};
}

export function mountChart(root) {
  const abort = new AbortController(), opts = { signal:abort.signal };
  const svg = root.querySelector('[data-chart-svg]'), empty = root.querySelector('[data-chart-empty]');
  const status = root.querySelector('[data-chart-status]'), restore = root.querySelector('[data-chart-restore]');
  const kinds = all(root, '[data-chart-kind]'), legends = all(root, '[data-chart-series]'), points = all(root, '[data-chart-point]');
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const series = {
    fps: { label:'渲染帧率', unit:'fps', color:'var(--xu-chart-1)', values:[56, 59, 58, 60] },
    throughput: { label:'路径吞吐', unit:'kseg', color:'var(--xu-chart-2)', values:[38, 46, 52, 64] }
  };
  let kind = 'line', active = 3;
  const visible = { fps:true, throughput:true };
  const xs = [104, 224, 344, 464];
  const yOf = (v) => Math.round(180 - (v / 80) * 148);
  const render = (animate = false) => {
    kinds.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.chartKind === kind)));
    legends.forEach((btn) => btn.setAttribute('aria-pressed', String(visible[btn.dataset.chartSeries])));
    points.forEach((btn, i) => btn.setAttribute('aria-pressed', String(i === active)));
    const activeKeys = Object.keys(series).filter((key) => visible[key]);
    if (!activeKeys.length) {
      svg.innerHTML = '';
      empty.hidden = false;
      status.textContent = '暂无可见序列，请开启图例。';
      return;
    }
    empty.hidden = true;
    if (kind === 'donut') {
      const primary = series[activeKeys[0]];
      const total = primary.values.reduce((a, b) => a + b, 0);
      const r = 62, cx = 280, cy = 108, circ = 2 * Math.PI * r;
      let offset = 0;
      const palette = ['var(--xu-chart-1)', 'var(--xu-chart-2)', 'var(--xu-chart-3)', 'var(--xu-chart-4)'];
      const arcs = primary.values.map((val, i) => {
        const len = (val / total) * circ;
        const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${palette[i]}" stroke-width="${i === active ? 24 : 18}" stroke-dasharray="${Math.max(1, len - 3).toFixed(1)} ${circ.toFixed(1)}" stroke-dashoffset="${(-offset).toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`;
        offset += len;
        return seg;
      }).join('');
      svg.innerHTML = `${arcs}<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="var(--xu-text)" font-size="16" font-weight="600">${quarters[active]}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="var(--xu-muted)" font-size="12">${primary.values[active]} ${primary.unit}</text>`;
    } else {
      const grid = [0, 20, 40, 60, 80].map((tick) => {
        const y = yOf(tick);
        return `<line x1="48" y1="${y}" x2="528" y2="${y}" stroke="var(--xu-border)" stroke-width="1"/><text x="38" y="${y + 4}" text-anchor="end" fill="var(--xu-muted)" font-size="11">${tick}</text>`;
      }).join('');
      const xLabels = quarters.map((q, i) => `<text x="${xs[i]}" y="204" text-anchor="middle" fill="${i === active ? 'var(--xu-text)' : 'var(--xu-muted)'}" font-size="11" font-weight="${i === active ? '600' : '400'}">${q}</text>`).join('');
      const crosshair = `<line x1="${xs[active]}" y1="24" x2="${xs[active]}" y2="180" stroke="var(--xu-control-border)" stroke-width="1" stroke-dasharray="4 4"/>`;
      const shapes = activeKeys.map((key, idx) => {
        const item = series[key];
        const coords = item.values.map((v, i) => [xs[i], yOf(v)]);
        if (kind === 'bar') {
          const width = activeKeys.length > 1 ? 22 : 34;
          const shift = activeKeys.length > 1 ? (idx === 0 ? -13 : 13) : 0;
          return coords.map(([x, y], i) => `<rect x="${x + shift - width / 2}" y="${y}" width="${width}" height="${180 - y}" rx="4" fill="${item.color}" fill-opacity="${i === active ? '1' : '0.78'}" stroke="${i === active ? 'var(--xu-text)' : 'none'}" stroke-width="1.5"/>`).join('');
        }
        const d = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
        const area = kind === 'area' ? `<path d="${d} L${coords.at(-1)[0]} 180 L${coords[0][0]} 180 Z" fill="${item.color}" fill-opacity="0.16"/>` : '';
        const dots = coords.map(([x, y], i) => `${i === active ? `<circle cx="${x}" cy="${y}" r="8" fill="${item.color}" fill-opacity="0.22"/>` : ''}<circle cx="${x}" cy="${y}" r="${i === active ? 4.5 : 3.5}" fill="${item.color}" stroke="var(--xu-surface)" stroke-width="1.5"/>`).join('');
        return `${area}<path d="${d}" fill="none" stroke="${item.color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>${dots}`;
      }).join('');
      svg.innerHTML = `${grid}${xLabels}${crosshair}${shapes}`;
    }
    if (animate) settle(svg);
    const details = activeKeys.map((key) => `${series[key].label} ${series[key].values[active]} ${series[key].unit}`).join(' · ');
    status.textContent = `当前数据点：${quarters[active]} · ${details}`;
  };
  kinds.forEach((btn) => btn.addEventListener('click', () => { kind = btn.dataset.chartKind; render(true); }, opts));
  legends.forEach((btn) => btn.addEventListener('click', () => {
    const key = btn.dataset.chartSeries;
    visible[key] = !visible[key];
    render(true);
  }, opts));
  restore.addEventListener('click', () => {
    visible.fps = true; visible.throughput = true;
    render(true); legends[0]?.focus();
  }, opts);
  points.forEach((btn, i) => {
    btn.addEventListener('click', () => { active = i; render(false); }, opts);
    btn.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % points.length;
      else if (event.key === 'ArrowLeft') next = (i - 1 + points.length) % points.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = points.length - 1;
      else return;
      event.preventDefault();
      active = next; render(false); points[next].focus();
    }, opts);
  });
  render(false);
  return () => { abort.abort(); disposeMotion(root); };
}
