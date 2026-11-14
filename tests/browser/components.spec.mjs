import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const visit = async (page, id) => {
  await page.goto(`/#/components/${id}`);
  await expect(page.locator('#contract-demo')).toBeVisible();
};

test('menu skips disabled items and restores focus on Escape',async({page})=>{
  await visit(page,'menu');
  const trigger=page.getByRole('button',{name:'项目操作',exact:true});
  await trigger.press('ArrowDown');
  await expect(page.getByRole('menuitem',{name:'打开项目',exact:true})).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem',{name:'复制路径',exact:true})).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem',{name:'查看历史',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded','false');
});

test('tabs activate with arrows, skip disabled and keep one tab stop',async({page})=>{
  await visit(page,'tabs');
  await page.getByRole('tab',{name:'概览',exact:true}).press('ArrowRight');
  await expect(page.getByRole('tab',{name:'文件',exact:true})).toHaveAttribute('aria-selected','true');
  await expect(page.getByRole('tabpanel',{name:'文件',exact:true})).toBeVisible();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab',{name:'历史',exact:true})).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab',{name:'概览',exact:true})).toBeFocused();
  await expect(page.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
});

test('table pagination has boundaries and filtering resets the page',async({page})=>{
  await visit(page,'table');
  await expect(page.getByRole('button',{name:'上一页',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'下一页',exact:true}).click();
  await expect(page.locator('.pagination [role="status"]')).toContainText('页码 2 / 3');
  await page.getByRole('button',{name:'下一页',exact:true}).click();
  await expect(page.getByRole('button',{name:'下一页',exact:true})).toBeDisabled();
  await page.getByLabel('筛选演示项目',{exact:true}).fill('not-present');
  await expect(page.locator('[data-paged-table] tbody')).toContainText('没有匹配的项目');
  await expect(page.locator('.pagination [role="status"]')).toContainText('页码 1 / 1');
  await page.getByRole('button',{name:'清空筛选',exact:true}).click();
  await expect(page.locator('[data-paged-table] tbody tr')).toHaveCount(4);
});

test('tree navigates only visible items and selects a full path',async({page})=>{
  await visit(page,'tree');
  await page.getByRole('treeitem',{name:'workspace',exact:true}).press('ArrowDown');
  await expect(page.getByRole('treeitem',{name:'src',exact:true})).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('treeitem',{name:'src',exact:true})).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('treeitem',{name:'main.xu',exact:true})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#tree-selection')).toContainText('workspace/src/main.xu');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('treeitem',{name:'src',exact:true})).toHaveAttribute('aria-expanded','false');
  await expect(page.getByRole('treeitem',{name:'main.xu',exact:true})).toBeHidden();
});

test('splitter respects keyboard limits and reports its value',async({page})=>{
  await visit(page,'splitter');
  const separator=page.getByRole('separator',{name:'编辑区宽度',exact:true});
  await separator.press('End'); await expect(separator).toHaveAttribute('aria-valuenow','75');
  const ratio=await page.locator('[data-split-panels]').evaluate(root=>{
    const left=root.querySelector('#split-editor').getBoundingClientRect().width;
    const right=root.querySelector('#split-preview').getBoundingClientRect().width;
    return left/(left+right);
  });
  expect(ratio).toBeCloseTo(.75,2);
  await separator.press('ArrowRight'); await expect(separator).toHaveAttribute('aria-valuenow','75');
  await separator.press('Home'); await expect(separator).toHaveAttribute('aria-valuenow','25');
  await separator.press('ArrowRight'); await expect(separator).toHaveAttribute('aria-valuenow','30');
});

test('splitter pointer drag clamps at both limits',async({page})=>{
  await visit(page,'splitter');
  const bar=await page.getByRole('separator',{name:'编辑区宽度',exact:true}).boundingBox();
  const panels=await page.locator('[data-split-panels]').boundingBox();
  await page.mouse.move(bar.x+bar.width/2,bar.y+bar.height/2);await page.mouse.down();
  await page.mouse.move(panels.x,bar.y+bar.height/2);
  await expect(page.getByRole('separator')).toHaveAttribute('aria-valuenow','25');
  await page.mouse.move(panels.x+panels.width,bar.y+bar.height/2);await page.mouse.up();
  await expect(page.getByRole('separator')).toHaveAttribute('aria-valuenow','75');
});

test('input validation preserves the value and recovers',async({page})=>{
  await visit(page,'input');
  await page.getByRole('button',{name:'验证输入',exact:true}).click();
  const input=page.getByLabel('项目名称（必填）',{exact:true});
  await expect(input).toBeFocused();await expect(input).toHaveAttribute('aria-invalid','true');
  await input.fill('中文 workspace');
  await page.getByRole('button',{name:'验证输入',exact:true}).click();
  await expect(page.locator('#contract-result')).toContainText('校验通过');
  await expect(input).toHaveValue('中文 workspace');
});

test('button loading blocks duplicate activation and restores the button',async({page})=>{
  await visit(page,'button');
  const button=page.locator('#contract-loading');await button.click();
  await expect(button).toBeDisabled();await expect(button).toHaveAttribute('aria-busy','true');
  await expect(page.getByRole('button',{name:'演示完成',exact:true})).toBeEnabled();
});

test('modal Escape returns focus to its invoker',async({page})=>{
  await visit(page,'feedback');
  const trigger=page.getByRole('button',{name:'打开确认',exact:true});await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button',{name:'取消',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
});

test('chart switches modes, inspects slots with arrows and recovers from hidden series',async({page})=>{
  await visit(page,'chart');
  await page.getByRole('button',{name:'柱状图',exact:true}).click();
  await expect(page.getByRole('button',{name:'柱状图',exact:true})).toHaveAttribute('aria-pressed','true');
  const firstPoint=page.locator('[data-chart-point="0"]');
  await firstPoint.focus();
  await firstPoint.press('ArrowRight');
  await expect(page.locator('[data-chart-point="1"]')).toBeFocused();
  await expect(page.locator('[data-chart-status]')).toContainText('Q2');
  for(const key of ['fps','throughput']) await page.locator(`[data-chart-series="${key}"]`).click();
  await expect(page.locator('[data-chart-empty]')).toBeVisible();
  await page.locator('[data-chart-restore]').click();
  await expect(page.locator('[data-chart-empty]')).toBeHidden();
  await expect(page.locator('[data-chart-series="fps"]')).toHaveAttribute('aria-pressed','true');
});

test('phone switches posture, adapts navigation, manages route stack and restores bottom sheet focus',async({page})=>{
  await visit(page,'phone');
  await page.locator('[data-phone-refresh]').click();
  await expect(page.locator('[data-phone-refresh-status]')).toContainText('#2');
  await expect(page.locator('[data-phone-snackbar]')).toBeVisible();
  await page.locator('[data-phone-platform="android"]').click();
  await expect(page.locator('[data-phone-device]')).toHaveAttribute('data-platform','android');
  await expect(page.locator('[data-phone-meta-platform]')).toContainText('Android');
  await page.locator('[data-phone-layout="landscape"]').click();
  await expect(page.locator('[data-phone-device]')).toHaveAttribute('data-layout','landscape');
  await page.locator('[data-phone-ime]').click();
  await expect(page.locator('[data-phone-device]')).toHaveAttribute('data-ime','true');
  await expect(page.locator('[data-phone-meta-insets]')).toContainText('ime 260');
  await page.locator('[data-phone-push="physics"]').click();
  await expect(page.locator('[data-phone-back]')).toBeVisible();
  await expect(page.locator('[data-phone-meta-stack]')).toHaveText('[overview, detail:physics]');
  await page.locator('[data-phone-back]').click();
  await expect(page.locator('[data-phone-back]')).toBeHidden();
  await page.locator('[data-phone-tab="tasks"]').click();
  await page.locator('[data-phone-task-filter="pending"]').click();
  await page.locator('[data-phone-tab="overview"]').click();
  await page.locator('[data-phone-tab="tasks"]').click();
  await expect(page.locator('[data-phone-task-filter="pending"]')).toHaveAttribute('aria-pressed','true');
  const opener=page.locator('[data-phone-open-sheet]').first();
  await opener.click();
  await expect(page.locator('[data-phone-sheet]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-phone-sheet]')).toBeHidden();
  await expect(opener).toBeFocused();
  await opener.click();
  await page.locator('[data-phone-sheet-action="notify"]').click();
  await expect(page.locator('[data-phone-snackbar]')).toBeVisible();
  await page.locator('[data-phone-tab="settings"]').click();
  await page.locator('[data-phone-ime]').click();
  await expect(page.locator('[data-phone-device]')).toHaveAttribute('data-ime','false');
  const note=page.locator('[data-phone-note-input]');
  await note.focus();
  await expect(page.locator('[data-phone-device]')).toHaveAttribute('data-ime','true');
  await note.fill('x');
  await expect(page.locator('[data-phone-note-clear]')).toBeVisible();
  await page.locator('[data-phone-note-save]').click();
  await expect(note).toHaveAttribute('aria-invalid','true');
  await expect(note).toHaveValue('x');
  await expect(page.locator('[data-phone-note-error]')).toBeVisible();
  await page.locator('[data-phone-note-clear]').click();
  await expect(note).toHaveValue('');
  await expect(note).toBeFocused();
  await note.fill('Phone IME ready');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-phone-device]')).toHaveAttribute('data-ime','false');
  await expect(note).toHaveValue('Phone IME ready');
  await page.locator('[data-phone-note-copy]').click();
  await expect(page.locator('[data-phone-snackbar]')).toBeVisible();
  await page.locator('[data-phone-note-save]').click();
  await expect(page.locator('[data-phone-snackbar]')).toBeVisible();
});

test('phone draft copy fallback selects text without claiming success',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:undefined}));
  await visit(page,'phone');
  await page.locator('[data-phone-tab="settings"]').click();
  const note=page.locator('[data-phone-note-input]');
  await note.fill('Fallback draft');
  await page.locator('[data-phone-note-copy]').click();
  await expect(note).toBeFocused();
  await expect(page.locator('[data-phone-snackbar]')).toContainText('复制未完成');
});

test('phone extended widgets cover progress, empty state, dialog, radio and slider',async({page})=>{
  await visit(page,'phone');
  await expect(page.locator('[data-phone-progress]')).toHaveAttribute('value','72');
  await page.locator('[data-phone-refresh]').click();
  await expect(page.locator('[data-phone-progress]')).toHaveAttribute('value','86');

  await page.locator('[data-phone-tab="tasks"]').click();
  await page.locator('[data-phone-task-filter="archived"]').click();
  await expect(page.locator('[data-phone-empty]')).toBeVisible();
  await page.locator('[data-phone-task-reset]').click();
  await expect(page.locator('[data-phone-empty]')).toBeHidden();

  const openDlg=page.locator('[data-phone-open-dialog]');
  await openDlg.click();
  await expect(page.locator('[data-phone-dialog]')).toBeVisible();
  await expect(page.locator('[data-phone-dialog-cancel]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-phone-dialog]')).toBeHidden();
  await expect(openDlg).toBeFocused();

  await openDlg.click();
  await page.locator('[data-phone-dialog-confirm]').click();
  await expect(page.locator('[data-phone-dialog]')).toBeHidden();
  await expect(page.locator('[data-phone-snackbar]')).toContainText('已归档已完成任务');
  await expect(page.locator('[data-phone-task="done"]')).toBeHidden();

  await page.locator('[data-phone-tab="settings"]').click();
  await page.locator('[data-phone-radio][value="manual"]').check();
  await expect(page.locator('[data-phone-snackbar]')).toContainText('仅手动同步');
  const phoneSlider=page.locator('[data-phone-slider]');
  await phoneSlider.fill('80');
  await phoneSlider.dispatchEvent('input');
  await expect(page.locator('[data-phone-slider-output]')).toHaveText('80%');
});

test('switch toggles, updates live status and enforces disabled state',async({page})=>{
  await visit(page,'switch');
  const sync=page.locator('[data-switch-sync]');
  const haptics=page.locator('[data-switch-haptics]');
  const status=page.locator('[data-switch-status]');
  await expect(sync).toBeChecked();
  await expect(haptics).not.toBeChecked();
  await haptics.focus();
  await page.keyboard.press('Space');
  await expect(haptics).toBeChecked();
  await expect(status).toContainText('触觉反馈：已开启');
  await sync.click();
  await expect(sync).not.toBeChecked();
  await expect(status).toContainText('自动同步：已关闭');
  await expect(page.locator('#contract-demo input[disabled]')).toBeDisabled();
});

test('radio supports click and arrow-key navigation skipping disabled',async({page})=>{
  await visit(page,'radio');
  const first=page.locator('[data-radio-input][value="realtime"]');
  const status=page.locator('[data-radio-status]');
  await expect(first).toBeChecked();
  await first.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-radio-input][value="battery"]')).toBeChecked();
  await expect(status).toContainText('省电批处理 (battery)');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-radio-input][value="manual"]')).toBeChecked();
  await expect(status).toContainText('仅手动触发 (manual)');
});

test('slider adjusts via step buttons and keyboard arrows',async({page})=>{
  await visit(page,'slider');
  const input=page.locator('[data-slider-input]');
  const output=page.locator('[data-slider-output]');
  await expect(input).toHaveValue('60');
  await page.locator('[data-slider-step="10"]').click();
  await expect(output).toHaveText('70%');
  await input.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(output).toHaveText('65%');
  await page.keyboard.press('End');
  await expect(output).toHaveText('100%');
});

test('progress updates phases between in-progress, complete, error and reset',async({page})=>{
  await visit(page,'progress');
  const bar=page.locator('[data-progress-bar]');
  const status=page.locator('[data-progress-status]');
  await expect(bar).toHaveAttribute('value','65');
  await page.locator('[data-progress-action="advance"]').click();
  await expect(bar).toHaveAttribute('value','85');
  await page.locator('[data-progress-action="complete"]').click();
  await expect(bar).toHaveAttribute('value','100');
  await expect(status).toContainText('100%');
  await page.locator('[data-progress-action="error"]').click();
  await expect(bar).toHaveClass(/danger/);
  await page.locator('[data-progress-action="reset"]').click();
  await expect(bar).toHaveAttribute('value','0');
});

test('badge counts increment, cap at 99+ and clear dot/pill safely',async({page})=>{
  await visit(page,'badge');
  const countPill=page.locator('[data-badge-count]');
  const dot=page.locator('[data-badge-dot]');
  const host=page.locator('[data-badge-host-count]');
  await expect(countPill).toHaveText('3');
  await page.locator('[data-badge-op="inc"]').click();
  await expect(countPill).toHaveText('4');
  await page.locator('[data-badge-op="overflow"]').click();
  await expect(countPill).toHaveText('99+');
  await expect(host).toHaveAttribute('aria-label',/99\+/);
  await page.locator('[data-badge-op="clear"]').click();
  await expect(countPill).toBeHidden();
  await expect(dot).toBeHidden();
  await expect(host).toHaveAttribute('aria-label',/暂无未读/);
});

test('dialog isolates modal interaction, confirms and restores focus on escape',async({page})=>{
  await visit(page,'dialog');
  const pubBtn=page.locator('[data-dialog-open="publish"]');
  const revBtn=page.locator('[data-dialog-open="revoke"]');
  const modal=page.locator('[data-dialog-modal]');
  const status=page.locator('[data-dialog-status]');
  await pubBtn.click();
  await expect(modal).toBeVisible();
  await expect(page.locator('[data-dialog-cancel]')).toBeFocused();
  await page.locator('[data-dialog-confirm]').click();
  await expect(modal).toBeHidden();
  await expect(pubBtn).toBeFocused();
  await expect(status).toContainText('发布工作区版本');

  await revBtn.click();
  await expect(modal).toBeVisible();
  await expect(page.locator('[data-dialog-confirm]')).toHaveClass(/danger/);
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  await expect(revBtn).toBeFocused();
  await expect(status).toContainText('已取消操作');
});

for(const theme of ['dark','light']) {
  for(const id of ['menu','tabs','table','tree','splitter','input','button','switch','radio','slider','feedback','progress','badge','dialog','chart','phone']) {
    test(`axe and narrow reflow: ${id} / ${theme}`,async({page})=>{
      await page.addInitScript(value=>localStorage.setItem('xu-ui-theme',value),theme);
      await page.setViewportSize({width:320,height:800});await visit(page,id);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
