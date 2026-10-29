import { test, expect } from '@playwright/test';
for(const theme of ['dark','light']) {
  for(const [device,width] of [['desktop',1440],['mobile',390]]) {
    test(`@visual empty state ${device} ${theme}`,async({page})=>{
      await page.addInitScript(value=>localStorage.setItem('xu-ui-theme',value),theme);
      await page.setViewportSize({width,height:900});await page.goto('/#/patterns');
      const empty=page.locator('.empty');await expect(empty).toBeVisible();
      await page.mouse.move(0,0);await expect(empty).toHaveScreenshot(`empty-state-${device}-${theme}.png`);
    });
    test(`@visual button proportions ${device} ${theme}`,async({page})=>{
      await page.addInitScript(value=>localStorage.setItem('xu-ui-theme',value),theme);
      await page.setViewportSize({width,height:900});await page.goto('/#/components/button');
      const demo=page.locator('#contract-demo');await expect(demo).toBeVisible();
      await page.mouse.move(0,0);await expect(demo).toHaveScreenshot(`button-proportions-${device}-${theme}.png`);
    });
  }
  test(`@visual tree focus ${theme}`,async({page})=>{
    await page.addInitScript(value=>localStorage.setItem('xu-ui-theme',value),theme);
    await page.setViewportSize({width:1440,height:900});await page.goto('/#/components/tree');
    await page.getByRole('treeitem',{name:'workspace',exact:true}).press('Home');
    await page.mouse.move(0,0);await expect(page.locator('.xu-tree')).toHaveScreenshot(`tree-focus-${theme}.png`);
  });
  test(`@visual icons desktop ${theme}`,async({page,browserName})=>{
    test.skip(browserName!=='chromium');
    await page.addInitScript(value=>localStorage.setItem('xu-ui-theme',value),theme);
    await page.setViewportSize({width:1440,height:900});await page.goto('/#/icons');
    await expect(page.getByRole('heading',{name:'ICON 图标库',exact:true})).toBeVisible();
    await page.mouse.move(0,0);
    await expect(page).toHaveScreenshot(`icons-desktop-${theme}.png`,{fullPage:true});
  });
  test(`@visual tabs mobile ${theme}`,async({page,browserName})=>{
    test.skip(browserName!=='chromium');
    await page.addInitScript(value=>localStorage.setItem('xu-ui-theme',value),theme);
    await page.setViewportSize({width:390,height:844});await page.goto('/#/components/tabs');
    await expect(page.getByRole('heading',{name:'页签',exact:true})).toBeVisible();
    await page.mouse.move(0,0);
    await expect(page).toHaveScreenshot(`tabs-mobile-${theme}.png`);
  });
}
