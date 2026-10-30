# ICON 图标

图标是操作和状态的辅助语言。本库提供 60 个原创绘制 SVG，覆盖操作、方向、状态、通用与开发场景；唯一源文件为 icons/catalog.json。

## 几何契约

| 项目 | 标准 |
| --- | --- |
| 坐标系 | viewBox="0 0 24 24" |
| 主要安全区 | 2–22 单位，按形状光学校正 |
| 母版线宽 | 1.5 单位 |
| 端点和转角 | round / round |
| 颜色 | stroke="currentColor"，fill="none" |
| 常用尺寸 | 16 / 20 / 24 / 32 px |
| 交互目标 | 独立图标按钮至少 44 × 44 px |

线宽随 viewBox 等比缩放：16 px 为 1 px，20 px 为 1.25 px，24 px 为 1.5 px，32 px 为 2 px。不设置 non-scaling-stroke；需特殊像素校正时另增经审查的尺寸变体。

## 与控件组合

按钮图标与文字共用 currentColor：不能单独设成 muted。sm／md／lg 按钮使用 16／20／24 px 图标，文本与图标相距 8 px，图标无外边距并按盒中心对齐。对应尺寸来自 icon-sm／md／lg Token，32 px 使用 icon-xl。空状态、警告或状态标记的装饰图标使用直属插画选择器，禁止用容器后代规则放大嵌套按钮的图标。

## 命名和分类

文件使用小写 kebab-case，按形状命名，如 arrow-right、alert-triangle。中文 label 服务检索；具体业务含义由所在按钮的文字或可访问名称提供。禁止用同一图形暗示互相冲突的操作。

## 使用方式

```html
<button class="xu-button">
  <svg class="xu-icon" aria-hidden="true" focusable="false">
    <use href="./assets/icons.svg#plus"></use>
  </svg>
  新建项目
</button>

<button class="xu-icon-button" aria-label="关闭面板">
  <svg class="xu-icon" aria-hidden="true" focusable="false">
    <use href="./assets/icons.svg#x"></use>
  </svg>
</button>
```

上例路径适用于导出的展厅根目录；集成到其他应用时按实际部署位置调整。外部 sprite 必须同源通过 HTTP 提供；file:// 不作为支持的预览方式。独立 SVG 下载可用于设计工具；通过 img 引用时，颜色不能继承父元素的 currentColor，应改用内联 SVG 或 sprite。

## 可访问性

装饰图标设置 aria-hidden="true"。仅图标按钮在按钮上提供 aria-label；信息图标需要可读说明。独立 SVG 下载含 title 和 role="img"，复制按钮则输出适合内联装饰使用的 SVG。loader 只表示等待，旁边必须有“正在处理”等文本。

## 扩充与验收

新增图标须填写唯一 name、中文 label／英文 labelEn、双语 category／categoryEn 与安全 SVG body；不得含脚本、外部资源、事件处理器、嵌入图片和硬编码颜色。运行 npm run check 验证白名单、名称和导出。人工在四种尺寸、双主题以及按钮文本旁检查光学重量。品牌标志始终使用品牌资产。

## 资源展厅

图标以操作、方向、状态、开发和通用语义分组，按所选语言显示名称，保留英文标识，并支持中英文检索。840 px 及以上宽度提供持续可见的检视区，选择图标后同步显示坐标网格、四种尺寸、源码与导出操作；较窄空间使用带焦点管理的详情对话框。检视区只更新所选资源，不因复制或筛选打断任务。
