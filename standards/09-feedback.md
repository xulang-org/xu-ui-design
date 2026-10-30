# Feedback and overlays

Feedback stays close to where something happened. Critical errors and information users must read stay on the page. Transient notifications only carry recoverable, non-critical results.

## Choosing feedback

| Situation | Method | Lifetime |
| --- | --- | --- |
| Input error | Error below the field | Cleared after correction |
| Page notice | Status bar with icon and title | Kept as long as the task needs |
| Copy succeeded | Short role="status" notification | About 4 seconds, non-critical |
| Save failed | Status message within the form | Kept, with a retry path |
| Consequence needs confirmation | Native dialog | Closed by an explicit choice or Escape |
| No content yet | Empty state | Keep the primary next step |

## Dialogs

Use dialog.showModal() to enter the browser's top layer. Link the title through aria-labelledby and, when needed, a short description of the consequence through aria-describedby. When the dialog opens, focus moves inside it. Tab must not escape to the background. Escape closes it and returns focus to the trigger. For dangerous actions, focus Cancel by default. Do not nest another confirmation dialog inside a dialog.

The confirmation example in the component showcase is clearly marked "Demo". Confirming only updates the example state and does not delete any real resource.

## Status and progress

Status uses "icon + text + color". Use progress for known progress. For indeterminate waits, use loading text and aria-busy, and do not invent percentages. On completion, give the result and the next step. Errors must not just disappear in a short notification.

## Notification interaction

Notifications do not steal focus. Consecutive actions update the same status region instead of filling the screen. When copying fails, provide selectable source code, and do not still claim it was copied.

Reference: [WAI-ARIA Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## Acceptance

Dialogs can be exited with the close button, Cancel and Escape. After closing, focus returns to the original button. The background cannot be interacted with. Notifications do not cover keyboard focus, and errors stay visible until the user corrects them.
