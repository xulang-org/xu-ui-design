# Drawing and data visualization

The XUUI drawing system combines the `#ui/draw` 2D canvas recorder with the `#ui/widgets.Chart` data visualization widget. This standard defines frame budgets, vector path geometry, layer and gradient sampling, and the dual-theme 8-color chart series palette and interaction contract.

## Canvas frame and coordinate contract

`#ui/draw` uses a top-left logical pixel coordinate system. Each `draw.Context` binds a window's `canvas_id` and `generation`; once a native window closes, handles from that generation are revoked immediately. The `draw.Frame` recorder emits a bounded little-endian `XDF1` binary stream:

| Contract item | Limit / behavior |
| --- | --- |
| Frame byte budget | `MAX_FRAME_BYTES = 4,194,304` (4 MiB) |
| Frame command limit | `MAX_FRAME_COMMANDS = 100,000` |
| State stack depth | `MAX_STATE_DEPTH = 256` (`push` / `pop` must balance) |
| Layer nesting depth | `MAX_LAYER_DEPTH = 16` (`begin_layer` / `end_layer` must close) |
| Coordinate and scale bounds | Finite floats with `abs(value) <= 1e9` and nonsingular scale (`abs(scale) >= 1e-9`) |

`frame.begin()` clears unsubmitted recording work and resets the pen. `frame.present()` seals and submits a complete frame while keeping the previous committed frame visible until swap. `frame.cancel()` discards an incomplete frame and releases temporary layer images. The current transformation matrix (CTM) and `clip_rect` are saved and restored together by `push()` and `pop()`.

## Vector paths and stroke rules

Complex geometry is recorded with reusable `draw.Path` buffers (`MAX_PATH_BYTES = 2 MiB`, `MAX_PATH_SEGMENTS = 32,768`):

- Every figure must start with `move_to(x, y)` before `line_to`, `quad_to`, `cubic_to` or `close()`. Appending segments without an open figure marks the path as failed until `clear()` is called.
- Fill rules support `FILL_NONZERO` (default nonzero winding) and `FILL_EVENODD`. `fill_path` implicitly closes open figures, while `stroke_path` preserves open endpoints.
- `StrokeOptions` defaults to a `1.0`–`2.0` logical-pixel width and supports `CAP_BUTT`, `CAP_ROUND` and `CAP_SQUARE` caps, `JOIN_MITER`, `JOIN_ROUND` and `JOIN_BEVEL` joins, and even-length positive `dashes` pairs. Excessive flattening or dash expansion is rejected atomically by the host so partial paths are never displayed.

## Layers, surfaces and gradients

- **Offscreen surfaces (`draw.Surface`)**: `frame.snapshot(width, height, scale)` rasterizes a frame once at an explicit resolution into an immutable transparent layer. Reuse it across frames with `frame.surface()` and release it explicitly with `dispose()`.
- **Display lists (`draw.DisplayList`)**: `frame.freeze()` compiles an immutable vector fragment (`XDL1`) without background-clearing commands, suited to reusable grids, axes and complex vector underlays.
- **Linear and radial gradients (`draw.Gradient`)**: `linear_gradient` and `radial_gradient` accept `2`–`32` strictly increasing stops in `[0.0, 1.0]` (including endpoints `0.0` and `1.0`), interpolating in premultiplied encoded sRGB with `SPREAD_PAD`, `SPREAD_REPEAT` or `SPREAD_REFLECT`.

## Chart widget and series palette

`#ui/widgets.Chart` builds on `#ui/draw` to provide five standard chart types: `CHART_LINE`, `CHART_AREA` (default area opacity `0.14`), `CHART_BAR` (default bar width ratio `0.7`), `CHART_SCATTER` and `CHART_DONUT` (default inner radius ratio `0.64`, single series). A chart supports up to `CHART_MAX_SERIES = 8` series and `CHART_MAX_POINTS = 4,096` points.

| Token | Obsidian (Dark) | Paper (Light) | Suggested series role |
| --- | --- | --- | --- |
| `--xu-chart-1` | `#EF8B79` | `#B1362A` | Primary metric / Coral |
| `--xu-chart-2` | `#70B8F2` | `#1B6BAA` | Comparison series / Sky |
| `--xu-chart-3` | `#66CDA2` | `#1D7B5E` | Completion or growth / Mint |
| `--xu-chart-4` | `#ECBF59` | `#90640D` | Threshold or load / Amber |
| `--xu-chart-5` | `#C396E2` | `#814A98` | Series five / Iris |
| `--xu-chart-6` | `#6FCDD4` | `#1B7781` | Series six / Teal |
| `--xu-chart-7` | `#EF94B6` | `#AD4B69` | Series seven / Rose |
| `--xu-chart-8` | `#ACBBD2` | `#5C6B80` | Baseline or history / Slate |

All eight series colors satisfy contrast requirements against `canvas`, `surface` and `elevated` in both themes (`>= 6.6:1` in dark mode and `>= 4.3:1` in light mode); see [Color and themes](02-color.md).

## Interaction, motion and accessibility

- **Legend and empty state**: Legend controls toggle individual series visibility and dim hidden series markers to `0.4` opacity. When all series are hidden or no positive data exists, the plot area centers a clear empty-state message instead of leaving an unlabeled blank box.
- **Crosshair and tooltip**: Hovering, clicking or focusing a datum displays a crosshair reference line, an emphasis ring and a tooltip clamped within the chart bounds.
- **Viewport zoom and transitions**: Viewport zoom preserves a normalized span of at least `2%`. Data updates run a single forward transition (`iterations = 1, alternate = false`) and settle immediately when reduced motion is enabled, following [Accessibility and motion](11-accessibility.md).
- **Keyboard and screen readers**: Both Web and desktop charts must provide a readable label, arrow-key datum inspection (`ArrowLeft` / `ArrowRight` / `Home` / `End`) and live status text so meaning never depends on color alone.

## Native code example and acceptance

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

Acceptance: frame state and layer stacks remain balanced; all eight dual-theme series colors pass build contrast checks; charts support type switching, legend toggling, empty-state recovery and keyboard datum inspection; no page-level horizontal overflow occurs at 320 px.
