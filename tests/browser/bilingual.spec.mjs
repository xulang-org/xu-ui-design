import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('language switch retains a document section and theme, then persists',async({page})=>{
  await page.goto('/?lang=zh-CN#/standards/05-icons#section-2');
  await expect(page.locator('#section-2')).toBeFocused();
  const skip=page.getByRole('link',{name:'跳到正文',exact:true});
  await skip.focus();await skip.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await expect(page).toHaveURL(/#\/standards\/05-icons#section-2$/);
  await page.getByRole('button',{name:'切换至亮色主题',exact:true}).click();
  await page.getByRole('button',{name:'Switch to English',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await expect(page.locator('#section-2')).toBeFocused();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Icons');
  await expect(page.getByRole('link',{name:'Markdown',exact:true})).toHaveAttribute('href','./standards/05-icons.md');
  await page.goto('/#/components/input');
  await expect(page.getByRole('heading',{level:1})).toHaveText('Text input');
  await page.getByRole('button',{name:'切换至中文',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
  await expect(page.getByRole('heading',{level:1})).toHaveText('文本输入');
  await expect(page.getByRole('link',{name:'下载组件说明',exact:true})).toHaveAttribute('href','./components/input.zh-CN.md');
});

test('URL language overrides storage and browser preference',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('xu-ui-language','en'));
  await page.goto('/?lang=zh-CN#/icons');
  await expect(page.getByRole('heading',{level:1})).toHaveText('ICON 图标库');
  await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
});

test('browser language supplies the initial preference and unknown URL values are ignored',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'language',{value:'en-GB'}));
  await page.goto('/?lang=unsupported#/overview');
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.getByRole('heading',{level:1})).toContainText('Interface design standards');
  await expect(page).toHaveTitle('XUUI · Interface design standards');
  await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-label','Expand navigation');
});

test('language switching works when browser storage is unavailable',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('storage unavailable');}}));
  await page.goto('/?lang=en#/patterns');
  await page.getByRole('button',{name:'Switch to light theme',exact:true}).click();
  await page.getByLabel('Workspace name Required',{exact:true}).fill('Retained draft');
  await page.getByRole('button',{name:'Save locally',exact:true}).click();
  await expect(page.locator('#settings-status')).toContainText('Local save failed');
  await expect(page.locator('#workspace-name')).toHaveValue('Retained draft');
  await page.getByRole('button',{name:'切换至中文',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
  await expect(page.getByRole('heading',{level:1})).toHaveText('页面模式');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});

test('both language inventories and download editions are complete',async({page,request})=>{
  for (const locale of ['en','zh-CN']) {
    const response=await request.get(`/assets/data.${locale}.json`);
    const data=await response.json();
    expect(data.docs).toHaveLength(12);expect(data.components).toHaveLength(8);expect(data.icons).toHaveLength(60);
    for (const item of [...data.docs,...data.components]) {
      await page.goto(`/?lang=${locale}#/${data.docs.includes(item)?'standards':'components'}/${item.id}`);
      await expect(page.getByRole('heading',{level:1})).toHaveText(item.title);
      const link=page.locator(`a[download][href="./${item.source}"]`);
      await expect(link).toBeVisible();
      const source=await request.get(`/${item.source}`);
      expect(source.status()).toBe(200);
      expect(await source.text()).toMatch(/^# /);
    }
  }
});

test('bilingual icon and document search uses the selected display language',async({page})=>{
  await page.goto('/?lang=en#/icons');
  await page.getByLabel('Search icons',{exact:true}).fill('运行');
  await expect(page.locator('[data-icon]')).toHaveCount(1);
  await expect(page.locator('.icon-label')).toHaveText('Run');
  await page.getByLabel('Search icons',{exact:true}).fill('missing-icon');
  await page.getByRole('button',{name:'Clear filters',exact:true}).click();
  await page.getByLabel('Category',{exact:true}).selectOption({label:'Development'});
  await expect(page.locator('[data-icon="play"]')).toBeVisible();
  await page.goto('/?lang=zh-CN#/standards');
  await page.getByLabel('查找标准',{exact:true}).fill('typography');
  await expect(page.locator('.doc-card')).toHaveCount(1);
  await expect(page.locator('.doc-card h3')).toHaveText('字体与排版');
});

test('English forms, menu and table give translated feedback without changing user input',async({page})=>{
  await page.goto('/?lang=en#/components/input');
  await page.getByRole('button',{name:'Validate input',exact:true}).click();
  await expect(page.locator('#contract-error')).toContainText('Enter 1–40 characters');
  await page.getByLabel('Project name (required)',{exact:true}).fill('中文 & <project>');
  await page.getByRole('button',{name:'Validate input',exact:true}).click();
  await expect(page.locator('#contract-result')).toHaveText('Validation passed: 中文 & <project> (demo)');
  await expect(page.locator('#contract-result project')).toHaveCount(0);
  await page.goto('/?lang=en#/components/menu');
  await page.getByRole('button',{name:'Project actions',exact:true}).press('ArrowDown');
  await expect(page.getByRole('menuitem',{name:'Open project',exact:true})).toBeFocused();
  await page.keyboard.press('End');await page.keyboard.press('Enter');
  await expect(page.locator('[data-menu-status]')).toHaveText('Selected: View history (demo)');
  await page.goto('/?lang=en#/components/table');
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect(page.locator('.pagination [role="status"]')).toHaveText('Records: 12 · Page 2 / 3');
  await page.getByLabel('Filter demo projects',{exact:true}).fill('no-such-project');
  await expect(page.locator('[data-paged-table] tbody')).toContainText('No matching projects');
});

test('English clipboard failure and confirmation are translated',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:undefined}));
  await page.goto('/?lang=en#/icons');
  await page.getByRole('button',{name:'Copy SVG',exact:true}).click();
  await expect(page.locator('#toast')).toContainText('Copy failed');
  await expect(page.locator('#inspector-source')).toBeFocused();
  await page.goto('/?lang=en#/components/feedback');
  const trigger=page.getByRole('button',{name:'Open confirmation',exact:true});
  await trigger.click();
  await expect(page.getByRole('dialog')).toHaveAccessibleName('Delete the demo project?');
  await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
});

for (const theme of ['dark','light']) {
  for (const route of ['overview','standards','foundations','icons','motion','patterns','components','components/button','components/input','components/feedback','components/menu','components/tabs','components/table','components/tree','components/splitter']) {
    test(`English narrow reflow and axe: ${route} / ${theme}`,async({page})=>{
      await page.addInitScript(value=>localStorage.setItem('xu-ui-theme',value),theme);
      await page.setViewportSize({width:320,height:900});
      await page.goto(`/?lang=en#/${route}`);
      await expect(page.getByRole('heading',{level:1})).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang','en');
      expect(await page.locator('main').innerText()).not.toMatch(/[\u3400-\u9fff]/u);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      expect(result.violations).toEqual([]);
    });
  }
}
