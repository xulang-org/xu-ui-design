# XUUI Design System

XU 生态的 UI 设计标准库：**标准文档、设计 Token、SVG 图标、可操作的效果展厅**。

当前版本为 `0.1.0`。这是一套浏览器参考实现，可供其他技术栈按契约实现；不代表 XU 原生 UI 已提供相同组件。

## 运行效果展示

需要 Node.js 22 或以上，无第三方依赖，无须安装 XU SDK。

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
| 组件实验室 | 按钮尺寸、加载与禁用、表单校验、选择、通知与模态框 |
| ICON | 48 个 SVG、语义分组、双语名称、检视区、四档尺寸、复制和下载 |
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
- `standards/*.md`：可离线保存的规范源文档。

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

CI 对 `dev`／`main` 及 PR 执行检查并上传 `xu-ui-showcase` 静态产物；默认不发布网站、不改变仓库保护。GitHub Actions 产物下载后解压，可通过任意静态 HTTP 服务预览。正式部署须在 `dev` 集成验证后获得发布授权。

参与维护请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。
