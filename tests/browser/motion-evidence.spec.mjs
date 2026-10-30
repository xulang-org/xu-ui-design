import { test, expect } from '@playwright/test';

// Capture real, isolated CI clipboard interactions at a watchable pace.
// This video is evidence, not a golden and never enters the source repository.
  test.skip(!process.env.CI,'Generate evidence in the pinned Linux environment.');
  test.skip(({browserName})=>browserName!=='chromium','One recording is sufficient; behavior runs in all engines.');
  test.use({reducedMotion:'no-preference',viewport:{width:1280,height:900},permissions:['clipboard-read','clipboard-write'],video:{mode:'on',size:{width:1280,height:900}}});
  test('record stamp, continuous selection and in-place creation',async({page})=>{
    await page.goto('/?lang=zh-CN&theme=light#/motion');
    await expect(page.locator('#motion-copy')).toBeVisible();await page.waitForTimeout(700);
    await page.locator('#motion-copy').click();
    await expect(page.locator('#motion-copy-status')).toHaveAttribute('data-state','success');
    expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('--xu-duration-fast: 120ms');
    await page.waitForTimeout(1600);
    await page.getByRole('tab',{name:'资源',exact:true}).click();await page.waitForTimeout(650);
    await page.getByRole('tab',{name:'组件',exact:true}).click();await page.waitForTimeout(650);
    await page.getByText('什么时候使用动效？',{exact:true}).click();await page.waitForTimeout(700);
    await page.locator('.nav-link[href="#/patterns"]').click();
    await page.locator('#new-demo-project').click();
    await page.locator('#create-project-name').pressSequentially('motion-studio',{delay:70});await page.waitForTimeout(400);
    await page.getByRole('dialog').locator('[type="submit"]').click();
    await expect(page.locator('[data-created] th')).toBeFocused();await page.waitForTimeout(1600);
  });
