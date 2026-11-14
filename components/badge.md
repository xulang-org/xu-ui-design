# Badge & status dot

Compact semantic marker for category, count or live state, either inline beside text or anchored onto a host control. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Short semantic label or numeric count (caps at `99+`)
- Optional leading status dot or 16 px icon
- Distinct soft or solid semantic surface pair (`neutral`, `brand`, `success`, `warning`, `danger`, `info`)
- Host button, tab or list item when rendered as an attached count or dot

## State matrix

| State | Must satisfy |
| --- | --- |
| Neutral / Brand | Subtle or Cinnabar accent pair clearly distinct from actionable buttons |
| Semantic status | Success, warning, danger and info tones meet 4.5:1 text contrast on soft surfaces |
| Count attachment | High-contrast solid pill (`--xu-brand` on `--xu-on-brand`); caps values over 99 as `99+` |
| Dot attachment | Compact unread marker anchored inside or beside a labeled host (`aria-label` includes count/state) |
| Overflow / wrap | Stays compact beside wrapped titles at 320 px without clipping siblings |

## Keyboard behavior

- Standalone inline badges are static annotations and stay out of the Tab sequence.
- Interactive controls carrying a count or status dot remain the single Tab stop and include the badge meaning in their accessible name.
- Filterable badge chips (if interactive) must be native `<button>` controls rather than styled `<span>` elements.

## Tokens and sizing

Inline pills use `--xu-subtle`, `--xu-brand-soft`, `--xu-success-soft`, `--xu-warning-soft`, `--xu-danger-soft`, `--xu-info-soft` paired with `--xu-text`, `--xu-brand`, `--xu-success`, `--xu-warning`, `--xu-danger`, `--xu-info`. Solid counters use `--xu-brand` fill with `--xu-on-brand` ink.

## Native mapping

`widgets.Badge` / `widgets.badge_attachment` (`badge_variant`, `BADGE_STATUS`, `BADGE_COUNT`, `BADGE_DOT`, `badge_solid_color`) and `#ui/phone` `phone.badge`.

## Acceptance

- All semantic tones (`neutral`, `brand`, `success`, `warning`, `danger`, `info`) and attachment variants (`status`, `count`, `dot`) are inspectable in the demo.
- Live controls adjust unread count across `0`, normal digits and `99+` overflow cleanly.
- Every badge text + background pair satisfies WCAG 2.2 AA 4.5:1 contrast across both Paper and Obsidian themes.
- Status dots never appear without an adjacent text label or accessible name on the host control.
