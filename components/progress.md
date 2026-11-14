# Progress & busy indicator

Communicate determinate task completion or bounded indeterminate work without blocking adjacent controls. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Task label and optional status summary
- Determinate track and proportional fill (`role="progressbar"`)
- Tabular percentage or step counter alongside the track
- Optional busy spinner (`aria-busy`) for unquantified background work

## State matrix

| State | Must satisfy |
| --- | --- |
| Idle (0%) | Visible track fill frame; `aria-valuenow="0"` with clear initial note |
| Determinate (1% - 99%) | Tabular percentage updates synchronously with fill width (`aria-valuemin="0"`, `aria-valuemax="100"`) |
| Complete (100%) | Switches cleanly to success tone and announces completion |
| Error / paused | Shifts to warning or danger tone with recovery action rather than stalling silently |
| Indeterminate / busy | Spinner or bounded pulse paired with descriptive text; never used when percentage is known |
| Reduced motion | Stops spinner rotation and removes animated fill transition while preserving percentage updates |

## Keyboard behavior

- Non-interactive progress tracks stay out of the tab order to avoid unnecessary focus stops.
- Companion controls (`Advance`, `Pause`, `Reset`, `Retry`) receive normal Tab focus and `Enter` / `Space` activation.
- Significant phase transitions update a polite live region (`aria-live="polite"`) without stealing focus.

## Tokens and sizing

Use `--xu-subtle` and `--xu-border` for the track, `--xu-brand`, `--xu-success`, `--xu-warning` and `--xu-danger` for fills, `--xu-radius-full` for track ends, and `phone_progress_height` (`6 px`) on mobile cards. Format numerical progress with tabular numerals (`font-variant-numeric: tabular-nums`) so layout stays steady during updates.

## Native mapping

`widgets.Progress` / `widgets.ProgressBar` and `#ui/phone` `phone.progress_bar`; native indeterminate animations map to host frame cadence and honor reduced-motion settings.

## Acceptance

- Interactive controls let testers step progress between 0%, intermediate states, 100% completion and error/reset.
- Determinate bars expose accurate `aria-valuenow`, `aria-valuemin` and `aria-valuemax` attributes at every step.
- Spinner and progress rows never rely on animation or color alone; text status stays clear at 320 px.
- Browser tests verify keyboard operation of step controls, live announcement updates and WCAG 2.2 AA contrast.
