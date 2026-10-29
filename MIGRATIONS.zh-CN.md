# 资源接入与迁移

[English](MIGRATIONS.md) · [简体中文](MIGRATIONS.zh-CN.md)

## 0.1.1-dev.2 → 0.1.1-dev.3

英文文档使用 `.md`，中文文档使用 `.zh-CN.md`；需要固定中文的直接文档链接须更新。Token、CSS 类名、图标标识与 hash 路由保持。在线下载跟随所选语言，资源包包含两种文档。

使用 `?lang=en` 或 `?lang=zh-CN` 指定语言。顶部切换会保留页面和主题并重新载入，请先保存表单草稿。浏览器允许时记忆语言；禁用存储不影响显式语言链接。独立英文控制器位于 `assets/en/interactions.js`，原有 `assets/interactions.js` 保持中文反馈。SVG 独立导出的 title 包含双语名称。

## 0.1.1-dev.1 → 0.1.1-dev.2

新增 icon-sm／md／lg／xl、brand-pressed 与 control-pressed Token，既有名称保留。按钮的图标颜色跟随文字，sm／md／lg 对应 16／20／24 px；空状态插画样式仅作用于直属插画。按钮按边框盒计量，导出的组件样式独立使用时也遵守 32／40／48 px 最小高度。请将 tokens.css 与 components.css 一起更新，避免缺少新增变量。

select 可使用 `xu-select-wrap` 与装饰性的 chevron-down SVG，取得跨浏览器一致的高度、内边距和箭头；原生交互保持。完整结构见 `standards/07-forms.md`。既有未包装的 select 继续保留系统外观。

## 0.1.0 → 0.1.1-dev.1

现有 Token 名称、CSS 类名和 48 个图标名称保留；无需改名迁移。新增图标是可选资源。组件实验室中的菜单、页签、表格、树和分栏提供独立行为契约，不自动替换产品控件。

1. 下载 `downloads/xu-ui-resources-0.1.1-dev.1.tar.gz` 和同目录 `SHA256SUMS`。
2. 使用 `shasum -a 256 -c SHA256SUMS`（Linux 可用 `sha256sum -c SHA256SUMS`）核验，再解压到独立目录。
3. 保留 `MANIFEST.json`；其中记录资源版本、源码提交、工作区是否有改动及逐文件 SHA-256。离线资源包含 MIT 许可。
4. 将 `assets/tokens.css` 与 `assets/components.css` 一起更新，按需替换 Sprite 或独立 SVG；核对亮暗主题、业务状态与键盘。

不将预发布版本解释为正式兼容性保证；升级前固定完整版本和校验值。回退时恢复整套旧资源，避免混用新旧 Token 与样式。

## 原生 XU Editor

将包内 `xu/xuui_tokens/` 复制到应用模块，使用 `tokens #xuui_tokens`。调用 `tokens.editor_styles(dark)` 后，Editor 通过 `paint_styled` 绘制；画布使用 `tokens.canvas(dark)`。主题变化需更新 Styles、背景并标记相关节点重绘。该适配以 SDK 0.10.11 为依据，仅映射 Editor 的颜色、边框、焦点、选择色、16 px 文字与 8 px 圆角；其他控件仍使用 SDK 默认样式。不导出简化 Theme：旧 Editor.paint 的选择区文字复用普通前景色，无法独立保证品牌选择色上的文字对比度。原生 Editor 必须使用完整 Styles 映射。

SDK 自定义绘制控件的语义暴露和屏幕阅读器支持须在原生产品逐项验收。本库不能通过 CSS 或 Token 为 SDK 补出可访问性树。当前实机验证范围为 macOS arm64；Windows、Linux 与屏幕阅读器均不宣称已通过。

## 网页行为模块

`assets/interactions.js` 导出 mountMenu、mountTabs、mountPagedTable、mountTree、mountSplitter；每个函数返回清理函数，卸载时调用，避免重复事件绑定。挂载点及必要的 data/ARIA 结构以仓库 `src/component-pages.js` 和对应 `components/*.md` 为准。这是参考实现，接入业务前须替换本地演示数据并处理产品实际状态。
