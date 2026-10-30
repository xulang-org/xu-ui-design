# 绘图与数据可视化

XUUI 的绘图体系由 `#ui/draw` 2D 画布记录器与 `#ui/widgets.Chart` 数据图表组成。规范统一了帧记录预算、矢量路径几何、图层与渐变采样，以及双主题 8 色图表序列的对比度与交互契约。

## 画布帧与坐标契约

`#ui/draw` 采用左上角为原点的逻辑像素坐标系。每个画布上下文 `draw.Context` 绑定窗口的 `canvas_id` 与 `generation`，窗口关闭后旧世代句柄立即失效。帧记录器 `draw.Frame` 使用有界小端 `XDF1` 二进制协议：

| 契约项 | 规范上限 / 行为 |
| --- | --- |
| 单帧字节预算 | `MAX_FRAME_BYTES = 4,194,304`（4 MiB） |
| 单帧命令上限 | `MAX_FRAME_COMMANDS = 100,000` |
| 状态栈深度 | `MAX_STATE_DEPTH = 256`（`push` / `pop` 必须成对平衡） |
| 图层嵌套深度 | `MAX_LAYER_DEPTH = 16`（`begin_layer` / `end_layer` 必须闭合） |
| 坐标与缩放范围 | 有限浮点数，绝对值 `≤ 1e9`，缩放因子非奇异（`abs(scale) ≥ 1e-9`） |

`frame.begin()` 清空当前未提交记录并重置画笔；`frame.present()` 密封并提交完整帧，提交前上一帧画面保持稳定可见；`frame.cancel()` 丢弃半帧并回收临时图层资源。当前变换矩阵（CTM）与裁剪区 `clip_rect` 随 `push()` / `pop()` 一并保存和恢复。

## 矢量路径与描边规范

复杂几何通过可复用的 `draw.Path` 构建（`MAX_PATH_BYTES = 2 MiB`，`MAX_PATH_SEGMENTS = 32,768`）：

- 子路径必须以 `move_to(x, y)` 起始，随后连接 `line_to`、`quad_to`、`cubic_to` 或 `close()`；未起始即追加线段会将路径标记为失败，重用前必须 `clear()`。
- 填充规则支持 `FILL_NONZERO`（默认非零环绕）与 `FILL_EVENODD`（奇偶环绕）；`fill_path` 会隐式闭合开放子路径，而 `stroke_path` 保留开放端点。
- 描边参数 `StrokeOptions` 默认线宽 `1.0`–`2.0` 逻辑像素，支持端点 `CAP_BUTT` / `CAP_ROUND` / `CAP_SQUARE`、转角 `JOIN_MITER` / `JOIN_ROUND` / `JOIN_BEVEL` 与偶数长度的正数虚线对 `dashes`。超出预算的扁平化或虚线细分由宿主原子拒绝，绝不渲染残缺路径。

## 图层、表面与渐变

- **离屏表面（`draw.Surface`）**：通过 `frame.snapshot(width, height, scale)` 以显式分辨率光栅化为不可变透明图层，可在后续任意帧中通过 `frame.surface()` 复用，不再使用时显式调用 `dispose()`。
- **显示列表（`draw.DisplayList`）**：通过 `frame.freeze()` 一次性编译静态矢量片段（`XDL1`），不含清屏背景命令，适合网格、坐标轴与复杂底图复用。
- **线性与径向渐变（`draw.Gradient`）**：使用 `linear_gradient` 或 `radial_gradient` 定义 `2`–`32` 个严格递增的色标（首尾必须为 `0.0` 与 `1.0`），在预乘编码 sRGB 空间插值，支持 `SPREAD_PAD`、`SPREAD_REPEAT` 与 `SPREAD_REFLECT`。

## 图表组件与序列色板

`#ui/widgets.Chart` 基于 `#ui/draw` 提供五种标准图表类型：`CHART_LINE`（折线）、`CHART_AREA`（面积，默认填充透明度 `0.14`）、`CHART_BAR`（柱状，默认柱宽比 `0.7`）、`CHART_SCATTER`（散点）与 `CHART_DONUT`（环形，默认内径比 `0.64`，单序列）。单图最多承载 `CHART_MAX_SERIES = 8` 条序列与 `CHART_MAX_POINTS = 4,096` 个数据点。

| Token | 曜石暗夜（Dark） | 宣纸雪岩（Light） | 序列语义建议 |
| --- | --- | --- | --- |
| `--xu-chart-1` | `#EF8B79` | `#B1362A` | 主指标／朱砂珊瑚 |
| `--xu-chart-2` | `#70B8F2` | `#1B6BAA` | 对比序列／海蓝 |
| `--xu-chart-3` | `#66CDA2` | `#1D7B5E` | 达成或增长／松绿 |
| `--xu-chart-4` | `#ECBF59` | `#90640D` | 阈值或负载／琥珀 |
| `--xu-chart-5` | `#C396E2` | `#814A98` | 分组五／紫晶 |
| `--xu-chart-6` | `#6FCDD4` | `#1B7781` | 分组六／青碧 |
| `--xu-chart-7` | `#EF94B6` | `#AD4B69` | 分组七／棠粉 |
| `--xu-chart-8` | `#ACBBD2` | `#5C6B80` | 基准或历史／云灰 |

双主题 8 色序列对 `canvas`、`surface` 与 `elevated` 背景均满足图形对比度要求（暗色 `≥ 6.6:1`，亮色 `≥ 4.3:1`），详见 [色彩与主题](02-color.zh-CN.md)。

## 交互、动效与无障碍

- **图例与空状态**：图例支持切换单条序列显隐，隐藏序列保持 `0.4` 透明度标记；当全部序列隐藏或无有效数据时，绘图区居中显示明确空状态文案，不留空白坐标框。
- **十字准星与浮层提示**：悬停、点击或键盘聚焦数据点时显示十字参考线、外圈强调环与边界内自适应钳位的数值浮层（`tooltip`）。
- **视口缩放与过渡动效**：视口缩放保留至少 `2%` 归一化区间；数据更新仅执行单次前向插值过渡（禁止无限循环动画），并在开启减少动态效果时直接落位到目标值，遵循 [可访问性与动效](11-accessibility.zh-CN.md)。
- **键盘与屏幕阅读器**：Web 与桌面图表均须提供可读标题、数据点方向键切换（`ArrowLeft` / `ArrowRight` / `Home` / `End`）与状态播报，不能仅凭颜色区分序列。

## 原生代码示例与验收

```xu
#ui/draw
#ui/layout
#ui/widgets
#xuui_tokens

pub fn paint_demo(ctx &draw.Context, identity &ui.CanvasEvent, dark bool) int {
    $frame := ctx.new_frame(4096)
    frame.begin() or >>
    xuui_tokens.prepare_frame($&frame, dark) or >>

    $path := draw.new_path(256)
    path.move_to(24.0, 96.0) or >>
    path.cubic_to(96.0, 32.0, 168.0, 128.0, 240.0, 48.0) or >>
    stroke := draw.stroke_options(2.0)
    frame.stroke_path(&path, xuui_tokens.chart_1(dark), &stroke) or >>

    bounds := layout.rect(24.0, 120.0, 480.0, 240.0)
    $chart := widgets.chart(ctx, identity, 1, &bounds) or >>
    appearance := xuui_tokens.chart_appearance(dark)
    chart.set_appearance(&appearance) or >>
    << frame.present() or >>
}
```

验收：帧记录器状态栈与图层栈严格平衡；双主题 8 色序列在构建检查中通过对比度校验；图表支持类型切换、图例显隐、空状态恢复与键盘数据点检视；320 px 窄屏下无页面级横向溢出。
