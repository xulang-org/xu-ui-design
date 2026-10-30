# Feedback and confirmation

Status text, notifications, waiting and confirmation. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Status icon
- Title and description
- Optional recovery action

## State matrix

| State | Must satisfy |
| --- | --- |
| Info | info icon, text and semantic background color |
| Success | success with a clear result |
| Warning | A path to continue or go back is kept |
| Error | Persistent description and a recovery action |
| Waiting | Actual known progress, or text for an indeterminate wait |
| Confirmation | Native dialog, background isolation and focus restoration |

## Keyboard behavior

- Tab cycles within the dialog; Escape closes it.
- Destructive confirmations focus Cancel by default; after closing, focus returns to the trigger.

## Tokens and sizing

Use --xu-text, --xu-muted, --xu-brand, --xu-focus and --xu-control-border. The default control height is 40 px; touch targets are at least 44 px. Components must support dark and light themes and respect the user's root font size and reduced motion preference.

## Native mapping

Cross-host interaction principles; this library's browser dialog does not mean that native hosts already provide an API of the same name.

## Acceptance

- Default, focused, disabled and primary states can all be operated or compared in the corresponding demo.
- At 320 px there is no page-level horizontal overflow; long names and empty data keep their meaning.
- Use native semantics or complete ARIA relationships; errors are recoverable without losing user input.
- Browser regression tests cover the success path and at least one edge state; manual screen reader results are recorded separately and are not replaced by automated scans.
