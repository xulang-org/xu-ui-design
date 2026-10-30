# 文件树

展开层级、选中项目与可见项导航。以下是组件的设计与交互契约，Web 参考实现与原生能力边界分别说明。

## 结构

- tree 容器
- treeitem
- 层级 group
- 展开标记
- 选中标记

## 状态矩阵

| 状态 | 必须满足 |
| --- | --- |
| 折叠 | aria-expanded=false，隐藏后代退出导航 |
| 展开 | aria-expanded=true，后代按层级显示 |
| 选中 | aria-selected=true，与焦点区别 |
| 聚焦 | 可见项中仅一个 tabindex=0 |
| 叶项 | 不设置 aria-expanded |
| 定位 | 选择文件后显示完整路径 |

## 键盘行为

- ArrowUp / ArrowDown 移动可见项；Home / End 到首尾。
- ArrowRight 展开或进入首个子项；ArrowLeft 折叠或到父项。
- Enter / Space 选择，不自动改变内容编辑焦点。

## Token 与尺寸

使用 --xu-text、--xu-muted、--xu-brand、--xu-focus 和 --xu-control-border。默认控件高度 40 px；触摸目标至少 44 px。组件必须适配暗色和亮色，并尊重用户根字号与减少动效偏好。

## 原生映射

原生 Tree 能力需要对照实际 SDK 接口验证；此 Web 树使用 WAI-ARIA tree 模型。

## 验收

- 默认、聚焦、禁用和主要状态均可在对应效果中操作或对照。
- 320 px 下没有页面级横向溢出，长名称和空数据保留含义。
- 使用原生语义或完整 ARIA 关系；错误能恢复且不丢失用户输入。
- 浏览器回归覆盖成功路径和至少一种边界状态；屏幕阅读器人工结果另行记录，不以自动扫描代替。
