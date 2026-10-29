import { test, expect } from '@playwright/test';

test('icon search, empty recovery and SVG download',async({page})=>{
  await page.goto('/#/icons');await expect(page.getByRole('heading',{name:'ICON 图标库',exact:true})).toBeVisible();
  await page.getByLabel('检索图标',{exact:true}).fill('运行');
  await expect(page.locator('[data-icon]')).toHaveCount(1);
  await page.getByRole('button',{name:'查看 运行 play',exact:true}).click();
  const link=page.getByRole('link',{name:'下载',exact:true});
  const downloaded=page.waitForEvent('download');await link.click();
  expect((await downloaded).suggestedFilename()).toBe('play.svg');
  await page.getByLabel('检索图标',{exact:true}).fill('no-such-icon');
  await expect(page.getByRole('heading',{name:'没有找到匹配图标',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'清空筛选',exact:true}).click();
  await expect(page.locator('[data-icon]')).toHaveCount(60);
});

test('clipboard failure exposes selectable source without false success',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:undefined}));
  await page.setViewportSize({width:1440,height:900});await page.goto('/#/icons');
  await page.getByRole('button',{name:'复制 SVG',exact:true}).click();
  await expect(page.locator('.inspector-code')).toHaveAttribute('open','');
  await expect(page.locator('#inspector-source')).toBeFocused();
  await expect(page.locator('#toast')).toContainText('复制未完成');
});

test('document section deep links have a target and keyboard focus',async({page})=>{
  await page.goto('/#/standards/05-icons#section-2');
  await expect(page.locator('#section-2')).toBeFocused();
  await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
});

test('storage failure preserves settings and reports failure',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('storage unavailable');}}));
  await page.goto('/#/patterns');
  await page.getByLabel('工作区名称 必填',{exact:true}).fill('保留的工作区');
  await page.getByRole('button',{name:'保存到本地',exact:true}).click();
  await expect(page.locator('#settings-status')).toContainText('本地保存失败');
  await expect(page.getByLabel('工作区名称 必填',{exact:true})).toHaveValue('保留的工作区');
});
