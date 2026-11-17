# Switch

Immediate binary state toggle with clear checked status and disabled preconditions. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Visible setting label
- Pill track and movable thumb (`role="switch"`)
- Optional immediate status note and live confirmation

## State matrix

| State | Must satisfy |
| --- | --- |
| Off | Clear control border on elevated surface; aria-checked is false |
| On | Brand track fill with high-contrast thumb; aria-checked is true |
| Hover / pressed | Border or track tint feedback without layout shift |
| Focus | 2 px focus outline around the switch track |
| Disabled | Native disabled with explanation; toggle input is ignored |
| Reduced motion | Immediate state change without thumb sliding animation |

## Keyboard behavior

- Tab / Shift+Tab focus the switch control directly.
- Space or Enter toggles immediately and announces the updated state.
- Use a checkbox inside a form for deferred submission; use a switch for instant settings.

## Tokens and sizing

Use `--xu-brand`, `--xu-brand-hover`, `--xu-on-brand`, `--xu-elevated`, `--xu-control-border` and `--xu-focus`. Web touch rows enforce at least 44 px height (`--xu-target-min`) and native mobile switches provide 48 dp row targets.

## Native mapping

widgets.Switch / widgets.switch_control and `#ui/phone` phone.toggle_switch; animated transitions honor reduced-motion preferences.

## Acceptance

- Default off, checked on, instant status announcement and disabled states can all be operated or compared in the demo.
- At 320 px there is no page-level horizontal overflow; long setting labels wrap cleanly beside the track.
- Use native `role="switch"` semantics and accessible label associations rather than color alone.
- Browser regression tests verify toggling, live status update, keyboard activation and WCAG 2.2 AA compliance.
