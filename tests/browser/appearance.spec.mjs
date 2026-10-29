import { test, expect } from '@playwright/test';

for(const theme of ['dark','light']) {
  for(const width of [390,1440]) {
    test(`empty state preserves the shared action geometry: ${theme} / ${width}`,async({page})=>{
      await page.addInitScript(value=>localStorage.setItem('xu-ui-theme',value),theme);
      await page.setViewportSize({width,height:900});await page.goto('/#/patterns');
      const action=page.getByRole('link',{name:'尝试创建交互',exact:true});await expect(action).toBeVisible();
      const metrics=await action.evaluate(link=>{
        const reference=document.querySelector('#new-demo-project');
        const icon=link.querySelector('svg'), referenceIcon=reference.querySelector('svg');
        const box=link.getBoundingClientRect(), art=icon.getBoundingClientRect();
        return {height:box.height,referenceHeight:reference.getBoundingClientRect().height,
          iconSize:art.width,referenceIconSize:referenceIcon.getBoundingClientRect().width,
          centerOffset:Math.abs(art.y+art.height/2-box.y-box.height/2),
          foreground:getComputedStyle(link).color,iconForeground:getComputedStyle(icon).color};
      });
      expect(metrics.height).toBe(metrics.referenceHeight);
      expect(metrics.iconSize).toBe(metrics.referenceIconSize);
      expect(metrics.centerOffset).toBeLessThan(.5);
      expect(metrics.iconForeground).toBe(metrics.foreground);
      await action.click();await expect(page.getByRole('heading',{name:'组件实验室',exact:true})).toBeVisible();
    });
  }
}

test('component exports honor outer dimensions without the showcase reset',async({page})=>{
  await page.goto('/');
  await page.setContent(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><link rel="stylesheet" href="http://127.0.0.1:4174/assets/tokens.css"><link rel="stylesheet" href="http://127.0.0.1:4174/assets/components.css"></head><body>${['sm','md','lg'].map(size=>`<button type="button" class="xu-button primary" data-size="${size}"><svg class="xu-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>新建项目</button>`).join('')}</body></html>`);
  for(const size of ['sm','md','lg']) {
    const button=page.locator(`[data-size="${size}"]`);
    await expect(button).toHaveCSS('box-sizing','border-box');
    const measured=await button.evaluate((element,size)=>({actual:element.getBoundingClientRect().height,
      expected:parseFloat(getComputedStyle(element).getPropertyValue(`--xu-control-${size}`))}),size);
    expect(measured.actual).toBe(measured.expected);
  }
});

test('disabled controls do not acquire enabled hover feedback',async({page})=>{
  await page.goto('/#/components/button');
  const disabled=page.getByRole('button',{name:'暂不可用',exact:true});
  const background=await disabled.evaluate(element=>getComputedStyle(element).backgroundColor);
  await disabled.hover();await expect(disabled).toHaveCSS('background-color',background);
});

test('tree folder and file labels share a column',async({page})=>{
  await page.goto('/#/components/tree');
  await expect(page.getByRole('treeitem',{name:'workspace',exact:true})).toBeVisible();
  const columns=await page.locator('.xu-tree').evaluate(root=>{
    const textLeft=id=>{
      const label=root.querySelector(`#${id} > .tree-label`);
      const range=document.createRange();range.selectNodeContents(label.lastChild);
      return range.getBoundingClientRect().left;
    };
    return [textLeft('tree-source'),textLeft('tree-readme')];
  });
  expect(columns[0]).toBeCloseTo(columns[1],1);
});

test('native selects share the input height and keep filtering behavior',async({page})=>{
  await page.goto('/#/patterns');
  const input=page.getByLabel('搜索项目',{exact:true}),select=page.getByLabel('状态',{exact:true});
  await expect(select).toBeVisible();
  expect((await select.boundingBox()).height).toBe((await input.boundingBox()).height);
  const centerOffset=await select.evaluate(element=>{
    const arrow=element.parentElement.querySelector('svg').getBoundingClientRect();
    const box=element.getBoundingClientRect();
    return Math.abs(arrow.y+arrow.height/2-box.y-box.height/2);
  });
  expect(centerOffset).toBeLessThan(.5);
  await select.selectOption('draft');await expect(page.locator('#project-table tbody tr')).toHaveCount(1);
});
