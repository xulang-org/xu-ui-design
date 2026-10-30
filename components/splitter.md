# Split panes

Constrained pane sizes and keyboard resizing. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Leading pane
- Focusable separator
- Trailing pane

## State matrix

| State | Must satisfy |
| --- | --- |
| Default | Pane ratio 50%; the separator has an accessible name |
| Resizing | aria-valuenow tracks the ratio |
| Minimum / maximum | Limited to 25%–75% |
| Pointer | Drag is captured and released when it ends |
| Keyboard | Arrow keys step by 5% |
| Narrow screens | Panes can shrink; long content can scroll |

## Keyboard behavior

- A vertical separator is resized with ArrowLeft / ArrowRight.
- Home / End go to the minimum and maximum; each adjustment updates the readable ratio.

## Tokens and sizing

Use --xu-text, --xu-muted, --xu-brand, --xu-focus and --xu-control-border. The default control height is 40 px; touch targets are at least 44 px. Components must support dark and light themes and respect the user's root font size and reduced motion preference.

## Native mapping

Native split layouts are adapted to host size constraints; Web pointer capture and the DOM separator must not be treated directly as a native implementation.

## Acceptance

- Default, focused, disabled and primary states can all be operated or compared in the corresponding demo.
- At 320 px there is no page-level horizontal overflow; long names and empty data keep their meaning.
- Use native semantics or complete ARIA relationships; errors are recoverable without losing user input.
- Browser regression tests cover the success path and at least one edge state; manual screen reader results are recorded separately and are not replaced by automated scans.
