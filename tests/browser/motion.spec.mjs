import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.use({timezoneId:'America/New_York'});

const clipboard = async page => page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copiedText=text;}}}));
const visit=async(page,route='motion')=>{await page.goto(`/?lang=zh-CN#/${route}`);await expect(page.locator('h1')).toBeVisible();};

test('copy confirmation stays at the source, preserves geometry and uses compositor properties',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await clipboard(page);
  await page.addInitScript(()=>{
    window.motionCalls=[];
    const animate=Element.prototype.animate;
    Element.prototype.animate=function(frames,options){window.motionCalls.push({frames,options});return animate.call(this,frames,options);};
  });
  await visit(page);const button=page.locator('#motion-copy');
  const before=await button.boundingBox();await button.click();
  await expect(button).toHaveAttribute('data-receipt','success');
  await expect(button).toHaveAccessibleName('复制动效 Token');
  const after=await button.boundingBox();expect(after.width).toBe(before.width);expect(after.height).toBe(before.height);
  await expect(page.locator('#motion-copy-status')).toContainText('已复制');
  expect(await page.evaluate(()=>window.copiedText)).toContain('--xu-duration-fast: 120ms');
  const calls=await page.evaluate(()=>window.motionCalls);
  expect(calls.length).toBeGreaterThan(0);
  for (const {frames,options} of calls) {
    expect(options.duration).toBeLessThanOrEqual(220);
    for (const frame of frames) expect(Object.keys(frame).every(key=>['opacity','transform'].includes(key))).toBe(true);
  }
});

test('reduced motion keeps confirmation, tabs and disclosure without animation',async({page})=>{
  await clipboard(page);await page.emulateMedia({reducedMotion:'reduce'});await visit(page);
  await page.locator('#motion-copy').click();
  await expect(page.locator('#motion-seal')).toHaveAttribute('data-confirmed','true');
  await page.getByRole('tab',{name:'资源',exact:true}).click();
  await expect(page.getByRole('tabpanel',{name:'资源',exact:true})).toBeVisible();
  await page.getByText('减少动态效果时会怎样？',{exact:true}).click();
  await expect(page.getByText('位移、缩放和转场会停止，确认文字、选中标记、错误与下一步仍然保留。',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.getAnimations().length)).toBe(0);
});

test('rapid tab changes keep one selected target and the indicator lands on it',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await visit(page);
  for (const name of ['组件','资源','规范']) await page.getByRole('tab',{name,exact:true}).click();
  await expect(page.getByRole('tabpanel',{name:'规范',exact:true})).toBeVisible();
  await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveCount(1);
  await page.evaluate(()=>Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{}))));
  const selected=await page.getByRole('tab',{name:'规范',exact:true}).boundingBox();
  const marker=await page.locator('.xu-tab-marker').boundingBox();
  expect(marker.x).toBeCloseTo(selected.x,1);expect(marker.width).toBeCloseTo(selected.width,1);
});

test('changing the system preference cancels in-flight motion and keeps the final state',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await visit(page);
  await page.addStyleTag({content:':root{--xu-duration-normal:2000ms}'});
  await page.getByRole('tab',{name:'资源',exact:true}).click();
  expect(await page.evaluate(()=>document.getAnimations().length)).toBeGreaterThan(0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('#motion-system-state')).toContainText('减少动态效果');
  await expect.poll(()=>page.evaluate(()=>document.getAnimations().length)).toBe(0);
  await expect(page.getByRole('tabpanel',{name:'资源',exact:true})).toBeVisible();
});

test('failed copy does not show a success stamp and selects recoverable source',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:undefined}));
  await visit(page);await page.locator('#motion-copy').click();
  await expect(page.locator('#motion-copy')).not.toHaveAttribute('data-receipt');
  await expect(page.locator('#motion-seal')).not.toHaveAttribute('data-confirmed');
  await expect(page.locator('#motion-copy-status')).toHaveAttribute('data-state','error');
  await expect(page.locator('#motion-source')).toBeFocused();
  await expect(page.locator('.motion-code')).toHaveAttribute('open','');
  await expect.poll(()=>page.locator('#motion-source').evaluate(element=>element.scrollHeight-element.clientHeight)).toBe(0);
});

test('editing saved settings immediately clears the saved receipt',async({page})=>{
  await visit(page,'patterns');const save=page.locator('#settings-form [type="submit"]');
  await save.click();await expect(save).toHaveAttribute('data-receipt','success');
  await page.locator('#workspace-name').fill('新的草稿');
  await expect(save).not.toHaveAttribute('data-receipt');
  await expect(page.locator('#settings-status')).toHaveAttribute('data-state','dirty');
  await expect(page.locator('#settings-status')).toHaveText('有未保存的更改。');
});

test('a failed retry clears the previous successful receipt',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{if(window.failCopy)throw new Error('clipboard unavailable');}}}));
  await visit(page);await page.locator('#motion-copy').click();
  await expect(page.locator('#motion-copy')).toHaveAttribute('data-receipt','success');
  await page.evaluate(()=>{window.failCopy=true;});await page.locator('#motion-copy').click();
  await expect(page.locator('#motion-copy')).not.toHaveAttribute('data-receipt');
  await expect(page.locator('#motion-seal')).not.toHaveAttribute('data-confirmed');
  await visit(page,'patterns');const save=page.locator('#settings-form [type="submit"]');
  await save.click();await expect(save).toHaveAttribute('data-receipt','success');
  await page.evaluate(()=>Object.defineProperty(Storage.prototype,'setItem',{value(){throw new Error('storage unavailable');}}));
  await save.click();await expect(save).not.toHaveAttribute('data-receipt');
  await expect(page.locator('#settings-status')).toHaveAttribute('data-state','error');
});

for (const locale of ['zh-CN','en']) test(`create in place, recover errors and locate the new record: ${locale}`,async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-30T00:30:00Z'));
  await page.setViewportSize({width:320,height:900});await page.goto(`/?lang=${locale}#/patterns`);
  await page.locator('#project-search').fill('missing-record');await page.locator('#project-status').selectOption('archived');
  await page.locator('[data-create-project]').click();const dialog=page.getByRole('dialog');
  await dialog.locator('[type="submit"]').click();await expect(page.locator('#create-project-name')).toBeFocused();
  await page.locator('#create-project-name').fill('stone-workbench');await dialog.locator('[type="submit"]').click();
  await expect(page.locator('#create-project-error')).toContainText(locale==='en'?'already uses':'同名');
  const name='界面 <motion & work>';
  await page.locator('#create-project-name').fill(name);await dialog.locator('[type="submit"]').click();
  await expect(dialog).not.toBeVisible();await expect(page).toHaveURL(/#\/patterns$/);
  const row=page.locator('[data-project-row]').filter({hasText:name});
  await expect(row).toHaveCount(1);await expect(row).toHaveAttribute('data-created','');
  await expect(row).toContainText('2026-10-29');
  await expect(row.locator('th')).toBeFocused();
  const located=await row.locator('th').boundingBox();
  expect(located.y+located.height/2).toBeGreaterThan(200);
  expect(located.y+located.height/2).toBeLessThan(700);
  await expect(page.locator('#project-search')).toHaveValue('');await expect(page.locator('#project-status')).toHaveValue('all');
  await expect(page.locator('#project-table tbody tr')).toHaveCount(5);
  await expect(row.locator('motion')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('leaving the motion page clears transient feedback and modal Escape restores its trigger',async({page})=>{
  await clipboard(page);await visit(page);await page.locator('#motion-copy').click();
  await page.locator('.nav-link[href="#/patterns"]').click();
  await expect(page.locator('.xu-action-receipt')).toHaveCount(0);
  await page.locator('#new-demo-project').click();await page.keyboard.press('Escape');
  await expect(page.locator('#new-demo-project')).toBeFocused();
});

test('filtering and reselecting an icon preserve its open source context',async({page})=>{
  await visit(page,'icons');
  await page.locator('.inspector-code summary').click();
  const source=await page.locator('#inspector-source').inputValue();
  await page.locator('#icon-search').fill('plus');
  await page.locator('[data-icon="plus"]').click();
  await expect(page.locator('.inspector-code')).toHaveAttribute('open','');
  await expect(page.locator('#inspector-source')).toHaveValue(source);
});

for(const theme of ['dark','light']) test(`Chinese motion standard, narrow reflow and axe: ${theme}`,async({page})=>{
  await page.addInitScript(value=>localStorage.setItem('xu-ui-theme',value),theme);
  await page.setViewportSize({width:320,height:900});await visit(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(result.violations).toEqual([]);
});
