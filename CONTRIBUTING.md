# 维护 XUUI

遵守 [XU 仓库管理规范](https://github.com/xulang-org/xulang-org/blob/dev/.github/REPOSITORY_RULES.md)。所有开发从新获取的 `origin/dev` 建立任务分支，通过 PR 合入 `dev`；获得发布授权后再推进 `main`。初始化分支只提供最小基线，产品实现不直接推到长期分支。

## 公开内容与本机资料

`standards/` 是本库正式产品文档，不是本机研发账本。源码、Token、图标目录、构建脚本和 CI 可以提交。本机 `docs/`、`reports/`、`.local/`、agent 配置、调试截图和生成 `dist/` 保持忽略。用户于 2026-10-29 授权为本库新增持续浏览器验收，正式源码与经审查的视觉基线保存在 `tests/browser/`；其他本机测试仍忽略。不得复制编译器本机测试到 CI。源码检查由 `scripts/check.mjs` 执行，浏览器行为与可访问性由 Playwright 和 axe 验证。

## 变更与验证

同时维护规范、资源与效果。Token 和图标保持单一来源；增加图标时同步数量声明与目录，不提交手工修改的派生文件。

```sh
npm run check
npm run dev
```

浏览器核对双主题、320 px／768 px／1440 px、键盘焦点、表单失败与成功、对话框 Escape 与焦点恢复、ICON 空结果、复制和下载、本地存储失败。修改静态展示不需要虚构后端；演示数据须明确标注。

本库版本独立于 XU 编译器，权威源为 `package.json`，`tokens/tokens.json` 同步版本。同一开发版本的后续批次递增 `dev.N`。Token 删除、改名或语义变化附迁移说明；未经用户明确批准，不自动增加 minor 或发布正式版。

## 提交与 PR

只暂存本次变更的明确路径，审查暂存差异、文件类型与许可。使用已授权的真实身份，不自动追加贡献者署名。PR 说明问题、结果、版本、验证范围、兼容性和回滚方式。

合并必须获得授权。CI 与模板存在不等于分支保护已经配置；不声称自动批准、自动部署或已经进入 `dev`。

正式视觉基线由固定 Playwright Linux 容器生成，源代码、浏览器版本和生成方法见 tests/browser/README.md；基线只在视觉审查后显式更新。运行报告、差异图和临时截图只通过 CI artifact 提供，不进入源码。
