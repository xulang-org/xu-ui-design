# XUUI Design System

XU 生态的 UI 设计标准库：**标准文档、设计 Token、SVG 图标、可操作的效果展厅**。

当前开发版本为 `0.1.1-dev.1`，正式基线为 `0.1.0`。浏览器提供组件契约与交互实现；原生适配针对 SDK 0.10.11 的 Editor，其他原生组件须按实际 SDK 验证。

## 运行效果展示

需要 Node.js 22 或以上，无外部运行依赖，无须安装 XU SDK。浏览器测试通过 `npm ci` 安装开发依赖。

```sh
git clone https://github.com/xulang-org/xu-ui-design.git
cd xu-ui-design
npm run check
npm run dev
```

默认 `main` 为已验收的正式基线；参与开发时从最新 `origin/dev` 建立任务分支。

打开 [本地效果展厅](http://127.0.0.1:4173)。如端口冲突，运行 `PORT=4174 npm run dev`。修改源文件后重新执行构建并刷新；预览服务不提供自动热更新。

| 展示区域 | 可验证的效果 |
| --- | --- |
| 总览 | XU 品牌、工作区预览、亮／暗主题切换 |
| 标准文档 | 12 篇标准、分组检索、篇内目录、在线阅读、Markdown 下载 |
| 基础与 Token | 双主题色值、复制 CSS 变量、对比度、排版、间距 |
| 组件实验室 | 八份独立契约：按钮、输入、反馈、菜单、页签、分页表格、树和分栏 |
| ICON | 60 个 SVG、语义分组、双语名称、检视区、四档尺寸、复制和下载 |
| 页面模式 | 本地设置保存、项目检索与状态筛选、排序、详情、空状态 |

深链接示例：`http://127.0.0.1:4173/#/icons`。也支持部署到子目录，例如 `/xu-ui-design/`；无需服务器重写 hash 路由。

## 标准目录

| 基础 | 组件 | 模式与交付 |
| --- | --- | --- |
| [设计原则](standards/01-principles.md) | [操作与按钮](standards/06-actions.md) | [页面模式](standards/10-patterns.md) |
| [色彩与主题](standards/02-color.md) | [表单与输入](standards/07-forms.md) | [可访问性与动效](standards/11-accessibility.md) |
| [字体与排版](standards/03-typography.md) | [导航与信息层级](standards/08-navigation.md) | [开发交付与治理](standards/12-delivery.md) |
| [布局与间距](standards/04-layout.md) | [反馈与浮层](standards/09-feedback.md) | |
| [ICON 图标](standards/05-icons.md) | | |

## 消费设计资源

```sh
npm run build
```

生成的 `dist/` 包含可独立部署的展厅与资源：

- `assets/tokens.css`：语义变量、字号、间距、圆角、尺寸与动效 Token。
- `assets/components.css`：按钮、输入、选择、开关、状态与进度的参考样式。
- `assets/icons.svg`：同源外部 SVG Sprite；`icons/*.svg` 为带名称的独立 SVG。
- `tokens/tokens.json`：项目自定义扁平 Token 数据，不宣称 DTCG 格式兼容。
- `standards/*.md`、`components/*.md`：标准与组件契约。
- `assets/interactions.js`：可卸载的菜单、页签、表格、树和分栏行为。
- `xu/xuui_tokens/mod.xu`：SDK 0.10.11 原生 Theme／Editor 适配。
- `downloads/xu-ui-resources-0.1.1-dev.1.tar.gz`、`SHA256SUMS` 和 `manifest.json`：版本资源包与来源、校验信息。

接入与回退见 [MIGRATIONS.md](MIGRATIONS.md)，版本变更见 [CHANGELOG.md](CHANGELOG.md)。

实际消费者见 [原生 Writing Desk 接入 PR](https://github.com/xulang-org/examples/pull/21)：SDK 0.10.11 下使用同一份生成资源，亮暗切换保留编辑内容。该接入仍待 dev 审查合并。

```html
<link rel="stylesheet" href="./assets/tokens.css">
<link rel="stylesheet" href="./assets/components.css">
<button type="button" class="xu-button primary">
  <svg class="xu-icon" aria-hidden="true" focusable="false">
    <use href="./assets/icons.svg#plus"></use>
  </svg>
  新建项目
</button>
```

根元素使用 `data-theme="light"` 切换主题；默认暗色。仅图标按钮必须在按钮上提供可访问名称。组件样式不自动接管业务状态、表单和对话框行为。

## 来源与维护

`tokens/tokens.json`、`icons/catalog.json`、`standards/` 是权威源；不直接编辑生成文件。原始品牌资产来自官网提交 [8d36bb4](https://github.com/xulang-org/xulang-org/tree/8d36bb410511f12429a12c8596d672e5e0b5a29f/brand)，保持原始几何和 MIT 许可。通用图标由本库创建，沿用仓库许可。代码和资源的许可不授予 XU 品牌背书。

`npm run check` 校验主题结构、已定义配色组合的对比度、SVG 安全白名单、文档链接、脚本语法、Token 引用和构建资源。此检查不等于整站 WCAG 认证；屏幕阅读器与目标平台的人工验收另见可访问性标准。

CI 对 `dev`／`main` 及 PR 执行资源检查、三浏览器行为、双主题 axe 和 Chromium 视觉回归，上传静态展厅与验收证据。测试方法与基线来源见 [浏览器验收](tests/browser/README.md)。

Pages 工作流仅在 `main` 构建和浏览器验收通过后部署。预定地址为 `https://xulang-org.github.io/xu-ui-design/`；工作流和仓库 Pages 设置完成、实际部署成功后才可作为在线入口。新变更须先经 PR 合入 `dev` 并验证，再按发布授权进入 `main`。失败可回滚源码后重新部署，不改写长期分支历史。

参与维护请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。
