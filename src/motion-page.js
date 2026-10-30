import { mountTabs } from './interactions.js';
import { motionEnabled, settle, stamp } from './motion.js';

export function motionPage({icon,button,esc,breadcrumbs,heading,footer,tokens}) {
  const keys=['duration-fast','duration-normal','duration-enter','motion-distance','ease-out'];
  const sample=`:root {\n${keys.map(key=>`  --xu-${key}: ${tokens.base[key]};`).join('\n')}\n}`;
  const value=key=>esc(tokens.base[key].replace(/^(\d+)(ms|px)$/,'$1 $2'));
  return `${breadcrumbs('动效与反馈')}<div class="motion-intro">${heading('','动效与反馈','用短促、精确的动作解释状态。确认留在操作旁，切换保留位置感，完成后指向下一步。')}<p class="motion-system-state" id="motion-system-state"></p></div>
    <section class="motion-specimen" aria-labelledby="motion-copy-title">
      <div><h2 id="motion-copy-title">落印 · 操作有回执</h2><p>复制成功后，原按钮显示确认印记。结果同时保留在下方，不需要移开视线寻找通知。</p>
      ${button(`${icon('copy')}复制动效 Token`,'id="motion-copy"','primary')}
      <p id="motion-copy-status" role="status" class="demo-result">复制统一参数，直接用于你的界面。</p>
      <details class="motion-code"><summary>查看动效 Token 源码</summary><div><label for="motion-source" class="sr-only">动效 Token 源码</label><textarea id="motion-source" class="xu-textarea motion-copy-source" readonly spellcheck="false">${esc(sample)}</textarea></div></details></div>
      <div class="motion-signature"><div class="motion-seal" id="motion-seal" aria-hidden="true"><img src="./assets/brand/xu-classic.svg" alt="">${icon('check')}</div><p id="motion-seal-label">等待操作</p></div>
    </section>
    <div class="motion-cases"><section class="motion-case"><h2>归位 · 切换有连续性</h2><p>指示线跟随选择移动，内容在原位接续。方向键可切换，操作始终即时响应。</p>
      <div data-motion-tabs><div class="xu-tabs" role="tablist" aria-label="设计资源示例">
      ${[['standards','规范'],['components','组件'],['resources','资源']].map(([id,label],i)=>`<button type="button" role="tab" id="motion-tab-${id}" aria-controls="motion-panel-${id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${label}</button>`).join('')}</div>
      ${[['standards','先确认规则','每篇规范都关联可操作的效果，阅读后可直接核对。','阅读设计标准','standards'],['components','直接试用组件','检查默认、焦点、错误和完成状态，再选择接入方式。','打开组件实验室','components'],['resources','取用同一份资源','下载 Token、样式和图标，让实现与规范保持一致。','下载接入资源','foundations']].map(([id,title,text,label,route],i)=>`<section class="xu-tabpanel" role="tabpanel" id="motion-panel-${id}" aria-labelledby="motion-tab-${id}" tabindex="0" ${i?'hidden':''}><h3>${title}</h3><p>${text}</p><a class="text-action" href="#/${route}">${label} ${icon('arrow-right')}</a></section>`).join('')}</div>
    </section><section class="motion-case"><h2>展开 · 按需理解</h2><p>先给出当前需要的信息，详细规则按需展开。焦点保留在入口，内容紧接在下方。</p>
      <details><summary>什么时候使用动效？</summary><div><p>确认一次操作、解释一次切换，或指明新增内容的位置。没有状态变化时，不播放循环装饰。</p></div></details>
      <details><summary>减少动态效果时会怎样？</summary><div><p>位移、缩放和转场会停止，确认文字、选中标记、错误与下一步仍然保留。</p></div></details>
      <a class="text-action" href="#/standards/11-accessibility">阅读动效与可访问性标准 ${icon('arrow-right')}</a>
    </section></div>
    <div class="motion-timings"><span><strong>${value('duration-fast')}</strong>按下与落印</span><span><strong>${value('duration-normal')}</strong>切换与归位</span><span><strong>${value('duration-enter')}</strong>面板进入</span><span><strong>${value('motion-distance')}</strong>最大进入位移</span></div>${footer()}`;
}

export function mountMotionPage({copy,showStatus}) {
  const root=document.querySelector('[data-view="motion"]');
  const abort=new AbortController();
  const source=root.querySelector('#motion-source');
  let previousWidth=0;
  const sizing=new ResizeObserver(([entry])=>{
    const width=entry.contentRect.width;
    if (width>0 && width!==previousWidth) {
      source.style.height='auto';
      source.style.height=`${source.scrollHeight+source.offsetHeight-source.clientHeight}px`;
    }
    previousWidth=width;
  });
  sizing.observe(source);
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{document.querySelector('#motion-system-state').textContent=motionEnabled()?'动效开启 · 跟随系统':'减少动态效果 · 跟随系统';};
  update();preference.addEventListener('change',update,{signal:abort.signal});
  const unmount=mountTabs(root.querySelector('[data-motion-tabs]'));
  root.querySelector('#motion-copy').addEventListener('click',async(event)=>{
    const target=event.currentTarget;
    const copied=await copy(source.value,source,target);
    if (abort.signal.aborted) return;
    const seal=root.querySelector('#motion-seal');
    if (copied) {
      seal.dataset.confirmed='true';stamp(seal);
      root.querySelector('#motion-seal-label').textContent='已复制';
      showStatus(root.querySelector('#motion-copy-status'),'动效参数已复制，可粘贴到项目样式中。');
    } else {
      seal.removeAttribute('data-confirmed');
      root.querySelector('#motion-seal-label').textContent='请手动复制';
      showStatus(root.querySelector('#motion-copy-status'),'复制未完成。源码已选中，可手动复制。','error');
    }
  },{signal:abort.signal});
  settle(root.querySelector('.motion-seal'));
  return ()=>{abort.abort();sizing.disconnect();unmount();};
}
