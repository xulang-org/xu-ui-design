# 浏览器验收

用户于 2026-10-29 授权本库维护公开浏览器回归。此目录只包含效果展厅的测试源码与经视觉审查的正式基线，不复制编译器本机测试。报告、trace、失败截图和差异图保存在忽略的 `.local/`，CI 以 artifact 提供。

```sh
npm ci
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
```

行为回归在 Chromium、Firefox、WebKit 执行；涵盖菜单禁用跳过、页签、分页边界、树键盘、分栏、表单恢复、模态框焦点、图标下载及剪贴板／存储失败。八个组件在双主题 320 px 下检查溢出与 axe WCAG A/AA 规则。axe 通过不等于人工屏幕阅读器验收或 WCAG 认证。

## 视觉基线

正式基线必须来自 `mcr.microsoft.com/playwright:v1.64.1-noble`，与锁文件的 Playwright 版本一致。固定 Chromium、zh-CN、reducedMotion、桌面 1440×900／移动 390×844；不使用本机 macOS 截图更新 Linux 基线。

```sh
docker run --rm --init --ipc=host -v "$PWD:/work" -w /work mcr.microsoft.com/playwright:v1.64.1-noble sh -c 'npm ci && npm run test:visual -- --update-snapshots'
```

首次 CI 缺少基线会失败，并提供候选截图。维护者须查看双主题桌面图标页与移动页签页，再显式提交 `baselines/*.png`；后续差异同样审查。版本升级时同时更新容器、依赖、锁文件和基线，禁止无审查批量接受差异。

基线来源、生成工作流与 SHA-256 记录在 `baselines/source.json`。图标页采用完整页面截图，覆盖全部 60 枚图标；空状态与按钮规格同时核对桌面／移动和双主题，文件树单独核对行级焦点。行为与视觉报告分开保存。

外观回归还验证组合边界：空状态中的操作与外部同类按钮具有一致的外框和图标尺寸、图标跟随文字颜色且垂直居中；导出的组件 CSS 不依赖展厅全局 reset；禁用项不出现可用的悬停反馈；文件夹与文件名称在同一列。

## 人工接受范围

发布前以键盘操作完成主要任务；用 VoiceOver/Safari 或 NVDA/Firefox 核对控件名称、状态、层级、错误播报和焦点恢复，并记录系统、浏览器、屏幕阅读器版本及结果。暂未执行的组合须写“未验收”。原生 Writing Desk 当前仅验证 macOS arm64 的实际编辑、菜单和主题；SDK 对自绘控件的辅助功能暴露需单独补齐，不宣称屏幕阅读器通过。
