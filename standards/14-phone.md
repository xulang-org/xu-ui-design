# Phone and adaptive mobile

Mobile interfaces in the XU ecosystem preserve XUUI's clarity, contrast and Paper/Obsidian/Cinnabar tokens while adapting layout, navigation, touch targets, scroll physics and system insets to pocket and foldable viewports. Rather than shrinking desktop chrome onto a phone, adopt an explicit host-inset and adaptive-scaffold model.

## Coordinate system and safe areas

- Measure layout in logical density-independent units (`1 px` CSS ≈ `1 dp` Android ≈ `1 pt` iOS). Scale physical raster pixels by host `devicePixelRatio` / display density without changing layout coordinates.
- Track two distinct inset records on every frame and resize event:
  - **Safe area (`safe_area` / `viewPadding`)**: persistent system occlusions (`top` status bar, notch or Dynamic Island; `bottom` home indicator or gesture pill; `left`/`right` landscape cutouts).
  - **Keyboard / IME (`view_insets.bottom`)**: transient bottom occlusion when the soft keyboard or candidate bar is visible.
- **Edge-to-edge rule**: background fills (`canvas` / `surface`) and modal scrims extend behind translucent system bars to the physical viewport edges; interactive controls, sticky headers, navigation bars, snackbars and sheets keep their interactive geometry inside the effective safe area. Never crop the root canvas into fixed insets with mismatched hardcoded platform background colors.

## Adaptive shell and navigation

Adapt the primary scaffold to available viewport width and orientation rather than hardcoding a single phone bar:

| Viewport / posture | Primary navigation | Body layout | Chrome height |
| --- | --- | --- | --- |
| Compact portrait (`< 600 px` width) | Bottom Navigation Bar (`3–5` destinations) | Single column scroll or stacked view | Top bar `48–56 px` + `safe_top`; bottom bar `64 px` + `safe_bottom` |
| Landscape / wide (`>= 600 px` width, or short height) | Left Navigation Rail (`72–80 px` + `safe_left`) | Single flow or list-detail two-pane split | Compact header `48 px`; no stacked bottom bar |
| Pushed detail route | Top-left Back control + system Back gesture | Full-focus detail view (tab bar optional or hidden) | Preserves root tab scroll & draft state behind the pushed route |

- Limit bottom navigation to `3–5` peer destinations; use an icon (`20–24 px`) plus a single concise label and an unmistakable active pill (`--xu-brand-soft` + `--xu-brand`), never color alone.
- Maintain a route stack (`push`, `replace`, `pop`): each root tab keeps independent scroll position and local state instead of resetting when switching tabs.
- Integrate app lifecycle transitions (`resumed`, `inactive`, `paused`): cancel transient pressed highlights and active scroll drags when backgrounded, while preserving user drafts and error banners.

## Platform posture for iOS and Android

Visual identity stays unified through [Color and themes](02-color.md), while navigation and physical behavior match host conventions:

- **Header and back semantics**:
  - **iOS posture**: centered concise title (or large scroll-collapsing title for root views), top-left back chevron + label, and left-edge horizontal swipe-back gesture.
  - **Android posture**: start-aligned title in top `AppBar`, `48 × 48 dp` leading back arrow, and system Predictive Back dispatch (`IME` → `sheet / overlay` → `route pop` → `background`).
- **System bar appearance**: Dark theme requests light system status icons (`--xu-canvas` `#100e12` edge-to-edge); Light theme requests dark system status icons (`#f6f3ef` edge-to-edge).
- **Single primary thumb action**: when a screen has one primary creation or run action, place at most one primary button / FAB (`48–56 px`, `--xu-brand` / `--xu-on-brand`) in the lower thumb zone above the bottom bar and safe bottom inset.

## Touch ergonomics and dynamic type

- **Minimum interactive target**: `--xu-target-min` (`44 × 44 px` floor across [Accessibility and motion](11-accessibility.md); **`48 × 48 dp` target floor on Android** via `--xu-control-lg`). Keep at least **`8 px` (`--xu-space-2`)** separation between adjacent interactive controls to avoid thumb mis-taps.
- **Mobile proportions**: screen horizontal gutter `16–20 px` (`space-4` to `space-5`); form field gap `16–20 px`; standard two-line list row minimum height `64–72 px` with `min-width: 0` on text containers so long labels wrap or truncate cleanly without forcing horizontal overflow.
- **No hover-dependent workflows**: never hide primary actions inside hover states, tooltips or secondary context menus. Keep edit, delete or more actions visible or behind an explicit `>= 44 px` menu trigger.
- **Dynamic type, multiline wrapping and orientation**: body/detail copy and multi-line notes wrap cleanly within container width (`wrap_width`, explicit `line_height >= 1.4x`) across CJK/Latin grapheme boundaries instead of truncating to a single line; text scales (`1.0x` to `1.5x+`) and narrow `320 px` viewports grow row/card height from measured text extent without overlapping or clipping content. See [Layout and spacing](04-layout.md) and [Typography](03-typography.md).

## Scroll physics and gesture disambiguation

- **Drag slop (`8 px` / `8 dp`)**: pointer movement below `8 px` resolves as a tap; once vertical displacement crosses slop, the scroll container captures the gesture and cancels pending child press highlights so flinging lists never flash false clicks.
- **Kinetic fling and overscroll**: lifting a moving pointer starts velocity-based deceleration (`decay`); touching down during deceleration immediately stops the scroll without triggering the tapped item until a fresh tap occurs.
  - **iOS posture**: soft elastic overscroll bounce (`bouncing`) that settles smoothly with a momentary edge scrollbar indicator.
  - **Android posture**: firm boundary clamp (`clamping`) with subtle stretch/edge feedback and a momentary scrollbar indicator.
- **Horizontal vs vertical arbitration**: lock each drag gesture to the dominant axis once slop is crossed so vertical scrolling inside a carousel/card region does not fight horizontal swipe gestures.

## Bottom sheets, IME and mobile feedback

- **Modal bottom sheet**:
  - Header includes a centered grabber pill (`36 × 4 px`), visible title, explicit close button (`>= 44 px`) and bottom `surface` fill extending to the physical bottom edge below `safe_bottom`.
  - Dismissal supports close button, scrim (`--xu-overlay`) tap, downward swipe exceeding `30%` sheet height (or downward fling velocity), and `Escape` / system Back — always restoring focus to the opener.
  - Destructive confirmations inside mobile sheets follow [Feedback and overlays](09-feedback.md): explicit Cancel default and no nested confirmation modals.
- **IME / soft keyboard avoidance**: when `view_insets.bottom > 0`, shrink the scroll viewport height and ensure the focused field and primary form action scroll clear of the keyboard. Sheets shift upward by `view_insets.bottom` rather than clipping bottom buttons.
- **Mobile text input & IME composition**: editable fields enforce `>= 48 px` height (`phone_input_height`), clear field labels, `>= 44 px` clear controls (`phone_touch_target`), explicit focus rings (`focus`), and persistent inline validation (`danger`) that preserves user input on error. Active preedit (composing) text renders underlined separately from committed text, commits or completes cleanly on Done or outside tap, and follows the Back dismissal order: `IME / active field -> bottom sheet -> pushed sub-route -> app background`.
- **Pull-to-Refresh and tactile haptics**: pulling downward past the top edge at `scroll == 0` for `phone_refresh_threshold` (`64 px`) triggers an explicit refresh cycle alongside a `>= 44 px` accessible refresh button/action; avoid continuous spinner motion when `prefers-reduced-motion: reduce` is enabled. Lightweight haptic cues (`selection`, `impact`, `success`, `error`) complement visible state transitions and validation outcomes without replacing visual feedback.
- **System clipboard actions**: explicit copy/paste controls write or read host clipboard only on user activation, announce completion via transient status/Snackbar, and preserve selection/inline fallback without false success when clipboard access fails.
- **Snackbars vs blocking errors**: transient confirmations float *above* `bottom_bar_height + safe_bottom + 12 px` with optional single action (`Undo` / `Retry`), never covering navigation destinations or stealing focus. Form validation and failed saves remain persistent inline per [Feedback and overlays](09-feedback.md).

## Native mapping and acceptance

- Interactive mobile widgets (`Segmented`, `Switch` row, `Check`/`Radio` option rows, `Slider` row with `phone_slider_thumb` `24 px`, `Progress` bar with `phone_progress_height` `6 px`, semantic `Badge`, `Divider`, `EmptyState`, and confirm `Dialog` using `phone_dialog_radius` `16 px` and `overlay(dark)`) follow the same Paper/Obsidian/Cinnabar tokens, `>= 48 px` mobile row hit targets, and `Escape` / Back dismissal priority (`IME -> dialog -> bottom sheet -> pushed route`).
- Native colors and mobile baseline dimensions are exported in `xu/xuui_tokens/mod.xu` (`canvas`, `surface`, `brand`, `brand_soft`, `control_border`, `overlay`, `phone_touch_target`, `phone_bar_height`, `phone_nav_height`, `phone_rail_width`, `phone_gutter`, `phone_sheet_radius`, `phone_input_height`, `phone_refresh_threshold`, `phone_switch_width`, `phone_switch_height`, `phone_slider_thumb`, `phone_progress_height`, `phone_dialog_radius`), allowing `#ui/phone` and native Canvas hosts to consume the same tokens as Web.
- **Boundary clarity**: the Web showcase component demonstrates responsive Portrait/Landscape layout, safe-area framing, IME avoidance, multiline wrapping, inline validation preserving input, clipboard fallback, accessible pull-to-refresh, pushed-route Back flow, Bottom Sheet focus management and Snackbar positioning using CSS/DOM; actual mobile touch slop, velocity fling, pull-to-refresh edge overscroll, haptic motors, host clipboard (`UIPasteboard` / `ClipboardManager`), soft keyboard (`UITextInput` / `InputConnection`) insets, translucent system bars and hardware/gesture Back live in host adapters (`#ui/phone`, iOS `UIKit`/`WKWebView`, Android `WebView`/Native).
- **Acceptance**: zero horizontal overflow down to `320 px` width; dual-theme contrast validated across foreground/background and overlays; TalkBack and VoiceOver manual screen-reader verification on physical devices remains an explicit release gate and is not replaced by Web automated tests.
