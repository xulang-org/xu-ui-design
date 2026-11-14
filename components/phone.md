# Phone shell and bottom sheet

Adaptive mobile scaffold, navigation stack and modal bottom sheet for portrait and landscape phones. The following is the component's design and interaction contract; the Web reference preview demonstrates responsive shell behavior without claiming native system-bar or IME runtime capabilities.

## Structure

- Top bar: back trigger (shown when a detail route is pushed), centered or start-aligned title (by platform posture), and concise trailing action (`>= 44 px`).
- Safe-area top and bottom tracks: explicit inset regions representing system bars and home indicator clearance, toggled cleanly without overlapping controls.
- Content viewport: tab-scoped feed/settings/tasks preserving active tab state, plus pushed detail sub-route and optional single thumb primary action.
- Adaptive navigation: bottom navigation bar (`3–5` destinations) in compact portrait; left navigation rail (`>= 600 px` or landscape posture) switching smoothly without losing active route state.
- Modal bottom sheet and snackbar slot: surface sheet with grabber (`36 × 4 px`), header, `>= 48 px` action rows, backdrop scrim and non-overlapping snackbar clearance above the bottom bar.

## State matrix

| State | Must satisfy |
| --- | --- |
| Portrait shell | Bottom navigation bar active (`3–5` items); top and bottom safe areas clearly separate chrome from system bars |
| Landscape / wide shell | Switches to side navigation rail with list-detail workspace; removes stacked bottom bar |
| Pushed detail route | Shows explicit Back affordance and supports platform Back dismissal while preserving underlying tab state |
| Bottom sheet open | Enters modal layer with backdrop scrim, grabber, close control and focus trapped/contained until dismissed |
| Keyboard / IME active | Raises form/sheet clearance cleanly above `view_insets.bottom` so active controls stay visible |
| Snackbar active | Floats above bottom bar + `safe_bottom` without overlapping tabs or stealing keyboard focus |

## Keyboard behavior

- Navigation tabs support click activation and standard keyboard focus (`Tab` / `Enter` / `Space`); `aria-current="page"` or `aria-selected="true"` marks the current destination.
- Pushing a detail route reveals the Back trigger; activating Back pops the route stack and returns focus cleanly.
- Opening the modal bottom sheet moves focus inside the sheet header/close control; `Escape`, scrim click or Close closes the sheet and restores focus to the trigger.

## Tokens and sizing

Use `--xu-canvas`, `--xu-surface`, `--xu-elevated`, `--xu-border`, `--xu-text`, `--xu-muted`, `--xu-brand`, `--xu-brand-soft`, `--xu-on-brand`, `--xu-focus`, `--xu-overlay` and `--xu-target-min`. Portrait interactive controls preserve at least `44 px` height (`48 px` recommended for mobile list rows and Android touch targets) with `8 px` (`--xu-space-2`) minimum gap between peer targets. Components honor `data-theme="light"`/`"dark"` and `prefers-reduced-motion: reduce`.

## Native mapping

Maps to `#ui/phone` scaffold primitives, route stack, bottom sheet and `xu/xuui_tokens/mod.xu` (`phone_touch_target`, `phone_bar_height`, `phone_nav_height`, `phone_rail_width`, `phone_gutter`, `phone_sheet_radius`). Actual iOS/Android safe-area insets, fling decay physics, system translucent bars and hardware/gesture Back require host runtime wiring and real-device verification.

## Acceptance

- Switching iOS vs Android posture updates bar alignment, overscroll/Back cue and safe-area readout cleanly; switching Portrait vs Landscape swaps bottom bar and side rail with zero horizontal overflow at `320 px`.
- Opening the Bottom Sheet isolates background interaction in the preview, closes on Close button, scrim click or `Escape`, and returns focus to the trigger.
- Both light and dark themes and both languages (`zh-CN` and `en`) pass `320 px` reflow and WCAG 2.2 AA automated contrast/structure checks.
