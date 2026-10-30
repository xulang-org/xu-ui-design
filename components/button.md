# Button

Action hierarchy, sizes, loading and duplicate submission. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Container
- Optional leading icon
- Action label
- Optional loading indicator

## State matrix

| State | Must satisfy |
| --- | --- |
| Default | Clear action name; primary actions use brand / on-brand |
| Hover / pressed | Background feedback; layout size is preserved |
| Focus | 2 px focus outline |
| Disabled | Native disabled, with the precondition stated |
| Loading | aria-busy=true; duplicate submission is blocked |
| Done / failed | Readable result; failure keeps a recovery path |

## Keyboard behavior

- Tab focuses; Enter or Space activates.
- After loading, the button returns to an operable state without losing context.

## Tokens and sizing

Use --xu-text, --xu-muted, --xu-brand, --xu-focus and --xu-control-border. Control heights are 32/40/48 px for sm/md/lg, measured including borders; touch targets are at least 44 px. Icons use 16/20/24 px, inherit the label color, sit 8 px from the text and have no outer margins. Components must support dark and light themes and respect the user's root font size and reduced motion preference.

## Native mapping

widgets.Button / widgets.button; the basic action contract can be mapped, and host events use widgets.Action.

## Acceptance

- Default, focused, disabled and primary states can all be operated or compared in the corresponding demo.
- At 320 px there is no page-level horizontal overflow; long names and empty data keep their meaning.
- Use native semantics or complete ARIA relationships; errors are recoverable without losing user input.
- Browser regression tests cover the success path and at least one edge state; manual screen reader results are recorded separately and are not replaced by automated scans.
