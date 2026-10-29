import { test, expect } from '@playwright/test';
for(const theme of ['dark','light']) {
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
