# 操作与按钮

同一任务区最多一个主要操作。动作标签使用“动词 + 对象”，例如“保存设置”，避免“确定”承载不明确结果。

## 层级

| 类型 | 类名 | 使用场景 |
| --- | --- | --- |
| 主要 | xu-button primary | 保存、创建、提交 |
| 次要 | xu-button | 取消、辅助动作 |
| 轻量 | xu-button ghost | 查看说明、低强调操作 |
| 危险 | xu-button danger | 删除等破坏性动作，说明对象和后果 |
| 图标 | xu-icon-button | 有明确 aria-label 的紧凑操作 |

## 状态契约

- 默认：名称可读，边界明确。
- 悬停：改变背景和边界，不能只靠光标表达可点击。
- 按下：使用更深背景；禁止让布局跳动。
- 焦点：显示 focus 轮廓，不裁掉轮廓。
- 禁用：使用原生 disabled；提供前置条件说明。
- 加载：显示等待文字、aria-busy="true"；阻止重复提交。
- 成功或失败：保留当前任务上下文，使用可读状态信息。

## 尺寸

sm / md / lg 分别为 32 / 40 / 48 px；通过 data-size 指定。文本与图标间距 8 px。不要固定按钮宽度截断中文。表单提交按钮明确 type="submit"，其他按钮使用 type="button"。

## 参考实现

```html
<button type="button" class="xu-button primary" data-size="md">
  保存设置
</button>
<button type="button" class="xu-button" disabled>
  需完成必填项
</button>
```

## 验收

组件展厅提供加载、禁用、尺寸与通知反馈。Enter 和 Space 能触发按钮；等待期间不能重复执行。链接使用 a 并提供真实地址，按钮不伪装成没有去向的链接。
