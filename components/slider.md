# Slider

Bounded numeric adjustment along a track with discrete step support, touch-sized thumb clearance and explicit value output. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Visible label and current formatted numeric readout
- Bounded range input (`min`, `max`, `step`, `aria-valuetext`)
- Coarse step buttons or disabled comparison track

## State matrix

| State | Must satisfy |
| --- | --- |
| Default | Clear track, active fill and numeric output aligned with the thumb value |
| Focus | 2 px focus ring around the interactive slider bounds |
| Adjusting | Value updates continuously or by step without layout jump |
| Clamped | Reaching minimum or maximum stops cleanly without wrapping around |
| Disabled | Native disabled appearance with muted fill and static explanation |

## Keyboard behavior

- Tab focuses the slider; ArrowLeft / ArrowDown decrease by one step and ArrowRight / ArrowUp increase by one step.
- PageUp / PageDown jump by coarse increments; Home / End jump to minimum and maximum bounds.
- Complementary `-10` / `+10` step buttons offer single-tap fine tuning on touch devices.

## Tokens and sizing

Use `--xu-brand`, `--xu-elevated`, `--xu-control-border`, `--xu-focus`, `--xu-text` and `--xu-muted`. Slider controls reserve at least 44 px vertical hit height (`--xu-target-min`).

## Native mapping

widgets.Slider / widgets.RangeSlider and `#ui/phone` phone.slider.

## Acceptance

- Slider track, live numeric output, step quick buttons and disabled comparison operate smoothly in the demo.
- At 320 px the track and numeric badge stay aligned without overflowing horizontally.
- Expose human-readable value text alongside numeric percentages.
- Browser regression checks cover keyboard Home/End/Arrow stepping, button nudging and WCAG 2.2 AA compliance.
