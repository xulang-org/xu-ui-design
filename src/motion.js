// Shared, dependency-free motion. Semantic state is committed before animation.
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const playing = new Set();
const receipts = new Map();
export const motionEnabled = () => !preference.matches;
const token = (name,fallback) => getComputedStyle(document.documentElement).getPropertyValue(`--xu-${name}`).trim() || fallback;
const milliseconds = value => parseFloat(value) * (value.endsWith('ms') ? 1 : 1000);

export function cancelMotion(root) {
  for (const animation of [...playing]) {
    const target=animation.effect?.target;
    if (target===root || root.contains(target)) animation.cancel();
  }
}

export function playMotion(target,frames,role='normal') {
  if (!target?.isConnected || !motionEnabled() || !target.animate) return null;
  cancelMotion(target);
  const animation=target.animate(frames,{
    duration:milliseconds(token(`duration-${role}`,'200ms')),
    easing:token('ease-out','cubic-bezier(0.16,1,0.3,1)'),fill:'none'
  });
  playing.add(animation);
  animation.finished.catch(()=>{}).finally(()=>playing.delete(animation));
  return animation;
}

export const settle = target => playMotion(target,[
  {opacity:.45,transform:`translateY(${token('motion-distance','6px')})`},
  {opacity:1,transform:'translateY(0)'}
]);

export const stamp = target => playMotion(target,[
  {opacity:.35,transform:'scale(.9)'},{opacity:1,transform:'scale(1)'}
],'fast');

export function clearReceipt(target) {
  const receipt=receipts.get(target);
  if (!receipt) return;
  clearTimeout(receipt.timer);
  cancelMotion(receipt.overlay);
  receipt.overlay.remove();
  target.removeAttribute('data-receipt');
  receipts.delete(target);
}

export function acknowledge(target,label) {
  if (!target?.isConnected) return;
  clearReceipt(target);
  let original=target.querySelector(':scope > .xu-action-label');
  if (!original) {
    original=document.createElement('span');original.className='xu-action-label';
    original.append(...target.childNodes);target.append(original);
  }
  const overlay=document.createElement('span');
  overlay.className='xu-action-receipt';overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML='<span class="xu-receipt-mark"><svg class="xu-icon" aria-hidden="true" focusable="false"><use href="./assets/icons.svg#check"></use></svg></span>';
  const text=document.createElement('span');text.textContent=label;overlay.append(text);
  target.append(overlay);target.dataset.receipt='success';
  stamp(overlay);
  receipts.set(target,{overlay,timer:setTimeout(()=>clearReceipt(target),1400)});
}

export function showStatus(target,text,state='success') {
  if (!target?.isConnected) return;
  if (target.textContent===text && target.dataset.state===state) return;
  target.textContent=text;target.dataset.state=state;settle(target);
}

export function disposeMotion(root) {
  cancelMotion(root);
  for (const target of [...receipts.keys()]) if (root===target || root.contains(target)) clearReceipt(target);
}

preference.addEventListener('change',()=>{
  if (preference.matches) for (const animation of [...playing]) animation.cancel();
});
