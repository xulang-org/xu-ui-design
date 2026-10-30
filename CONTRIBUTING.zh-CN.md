# 维护 XUUI

[English](CONTRIBUTING.md) · [简体中文](CONTRIBUTING.zh-CN.md)

遵守 [XU 仓库管理规范](https://github.com/xulang-org/xulang-org/blob/dev/.github/REPOSITORY_RULES.md)。所有开发从新获取的 `origin/dev` 建立任务分支，通过 PR 合入 `dev`；获得发布授权后再推进 `main`。初始化分支只提供最小基线，产品实现不直接推到长期分支。

## 公开内容与本机资料

`standards/` 是本库正式产品文档，不是本机研发账本。源码、Token、图标目录、构建脚本和 CI 可以提交。本机 `docs/`、`reports/`、`.local/`、agent 配置、调试截图和生成 `dist/` 保持忽略。用户于 2026-10-29 授权为本库新增持续浏览器验收，正式源码与经审查的视觉基线保存在 `tests/browser/`；其他本机测试仍忽略。不得复制编译器本机测试到 CI。源码检查由 `scripts/check.mjs` 执行，浏览器行为与可访问性由 Playwright 和 axe 验证。

## 中英文维护

英文文档使用 `.md`，简体中文使用 `.zh-CN.md`，规范与组件必须成对维护。索引标题、分组、摘要与原生映射包含 en／zh-CN 两种值；图标须填写 label、labelEn、category、categoryEn。

两种界面共用 src 控制器；locales/en.json 记录英文文案，构建时由 scripts/localize.mjs 生成同逻辑的两套客户端，英文缺失会导致构建失败。只转换源码中的固定文案，不翻译运行时用户输入或渲染后的 DOM。优先使用完整短语和句子，长短语单次匹配优先；译文不包含 JavaScript 引号、反斜线或反引号。修改插值文案后核对英文语序。

语言链接参数优先于保存值与浏览器语言。切换保留路由和主题并刷新，表单草稿需先保存。对应语言的 Markdown 下载与双语资源包同时验收。

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
