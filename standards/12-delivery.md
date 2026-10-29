# 开发交付与治理

设计标准是本仓库的产品内容，放在 standards/；本机计划、日志、截图和审计放在忽略目录。不要复制编译器仓库的本机 docs/ 作为公开设计文档。

## 单一来源

| 来源 | 生成或消费结果 |
| --- | --- |
| tokens/tokens.json | assets/tokens.css、基础展厅、对比度检查 |
| icons/catalog.json | SVG sprite、独立 SVG、检索展厅 |
| standards/index.json 与 Markdown | 文档导航、在线阅读和源码下载 |
| src/components.css | 可复用的参考组件样式 |
| src/app.js | 展厅交互与页面模式 |

## 构建与使用

```sh
npm run check
npm run build
npm run dev
```

需要 Node.js 22 或以上，无外部运行依赖。dev 命令会先构建，默认 http://127.0.0.1:4173；端口可通过 PORT 指定。源码变化后重新构建并刷新。dist/ 可部署在静态主机根路径或子目录；内部资源使用相对路径，路由使用 hash。

接入应用时复制 dist/assets/tokens.css 和 components.css，并按需引入 dist/assets/icons.svg；组件样式并不自带对话框、表单或路由行为，需使用原生语义并实现产品状态。dist/tokens/tokens.json 可供设计工具转换，当前为本项目自定义扁平结构，不宣称兼容 DTCG 文件格式。

## 版本和兼容

本库独立版本由 package.json 管理，从 0.1.0-dev.2 开始。Token 删除、改名、语义变化和图标删除需迁移说明；新增保持现有契约。标准、资源和展厅在同一个 PR 更新，不能只更新截图。不得因此改动 XU 编译器版本。

## 协作

从最新 origin/dev 建立任务分支，验证后提交明确路径，推送并通过 PR 合入 dev。main 仅在获得发布授权并完成 dev 集成验证后推进。仓库初始化的 main/dev 只包含空白基线，本批内容由任务 PR 交付。CI 配置存在不代表分支保护已启用。

## 发布和回滚

CI 构建静态展厅并保存 artifact，不自动部署。维护者可将 dist/ 发布到静态主机；正式发布必须先取得授权。失败通过修复 PR 或 revert PR 恢复，不强推长期分支，不移动已发布标签。

## 交付门槛

check 验证 Token 结构、定义配色组合、SVG 白名单、文档链接和构建资源。浏览器另检导航、主题、表单、对话框、图标检索与下载、窄屏布局。记录实际检查范围，不以自动颜色检查替代完整可访问性验收。
