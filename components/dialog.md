# Modal dialog

Blocking decision surface with backdrop scrim, keyboard focus containment, explicit confirmation choices and safe focus restoration. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Backdrop scrim (`--xu-overlay`) dimming underlying content
- Dialog container with clear heading, concise consequence description and optional form body
- Action footer with unambiguous cancel/dismiss action paired with primary or danger confirmation button

## State matrix

| State | Must satisfy |
| --- | --- |
| Closed | Inaccessible in background DOM (`display: none` or closed `<dialog>`); trigger keeps its identity |
| Confirmation open | Top layer centers over `--xu-overlay` with initial focus placed inside dialog |
| Destructive confirm | Primary confirm uses `danger` variant and concrete verb label instead of bare `OK` |
| Form / validation open | Invalid inputs display inline error without dismissing the modal |
| Dismissed / confirmed | Closes cleanly on Cancel, backdrop intent (if non-destructive) or Escape, restoring focus to opener |
| Mobile viewport | Full-width sheet or compact centered card with `>= 44 px` action targets |

## Keyboard behavior

- Opening moves focus to the first interactive element inside the dialog (or initial focus target).
- `Tab` / `Shift+Tab` stay trapped inside the open dialog until dismissed.
- `Escape` closes the dialog cleanly (unless an active task blocks dismissal) and returns focus to the triggering button.

## Tokens and sizing

Use `--xu-surface`, `--xu-border`, `--xu-radius-lg` (`12 px` desktop / `phone_dialog_radius` `16 dp` mobile) and `--xu-overlay` for the backdrop scrim (`xuui_tokens.overlay(dark)`). Footer buttons align right on wide viewports and stack or fill evenly on narrow mobile screens.

## Native mapping

`widgets.Modal` / `widgets.modal_dialog` using `xuui_tokens.overlay(dark)` and `#ui/phone` `phone.confirm_dialog` alert overlay.

## Acceptance

- Both standard confirmation and destructive deletion variants can be triggered, confirmed or cancelled in the demo.
- Trigger focus is restored automatically after pressing `Escape`, clicking Cancel or confirming an action.
- Action buttons remain cleanly reachable without clipping or horizontal page overflow at `320 px`.
- Browser regression tests verify dialog role, Escape dismissal, focus restoration and WCAG 2.2 AA compliance.
