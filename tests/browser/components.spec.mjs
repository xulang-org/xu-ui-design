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

for(const theme of ['dark','light']) {
  for(const id of ['menu','tabs','table','tree','splitter','input','button','feedback','chart']) {
    test(`axe and narrow reflow: ${id} / ${theme}`,async({page})=>{
      await page.addInitScript(value=>localStorage.setItem('xu-ui-theme',value),theme);
      await page.setViewportSize({width:320,height:800});await visit(page,id);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
