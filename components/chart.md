# Canvas and chart

2D canvas primitives, series visibility toggling, keyboard datum inspection and chart type switching. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Chart type switcher (line, area, bar and donut)
- Toggleable series legend buttons (with `aria-pressed` and color swatches)
- 2D drawing stage (coordinate grid, series geometry, crosshair and empty-state feedback)
- Focusable datum inspection buttons and live `role="status"` value readout
- `#ui/draw` primitive reference cards (vector paths, clipped layers and linear gradients)

## State matrix

| State | Must satisfy |
| --- | --- |
| Default | At least one visible series; active datum and status readout stay synchronized |
| Legend toggle | Selecting a legend item toggles `aria-pressed`, dims the legend swatch and removes hidden series from the plot |
| All hidden / empty | Turning off all series displays a clear empty-state message and a restore action |
| Kind switch | Switching between line, area, bar and donut preserves the active datum period |
| Focus / inspect | Crosshair and emphasis ring follow the active datum; status announces metrics and units |
| Narrow screens | At 320 px controls wrap cleanly and the canvas scales without page-level horizontal scroll |

## Keyboard behavior

- Datum inspection buttons use `ArrowLeft` / `ArrowRight` to cycle across periods and `Home` / `End` to jump to the first or last datum.
- Chart kind and legend buttons are reachable with `Tab` and toggle with `Enter` or `Space`.

## Tokens and sizing

Use the `--xu-chart-1` through `--xu-chart-8` dual-theme series palette together with `--xu-surface`, `--xu-elevated`, `--xu-border`, `--xu-text`, `--xu-muted` and `--xu-focus`. Interactive controls maintain a minimum 44 px touch target; when reduced motion is enabled, geometry updates settle immediately without interpolation.

## Native mapping

`draw.Frame`, `draw.Path`, `draw.Surface`, `draw.DisplayList` and `widgets.Chart` are provided by `#ui/draw` and `#ui/widgets`. Native hosts verify `XDF1` frame command budgets, balanced state stacks and invertible matrices; adopt token colors through `xuui_tokens.chart_appearance(dark)` and `xuui_tokens.prepare_frame($&frame, dark)`.

## Acceptance

- Default, focused, hidden-series, empty-state recovery and all four chart kinds can be operated or compared in the demo.
- At 320 px there is no page-level horizontal overflow; long names and empty data keep their meaning.
- Use native semantics or complete ARIA relationships; every series value is exposed as readable text rather than color alone.
- Browser regression tests cover chart kind switching, empty-state recovery when all series are hidden and arrow-key datum inspection.
