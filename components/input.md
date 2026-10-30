# Text input

Labels, help, errors, read-only and input recovery. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Visible label
- Input value
- Help text
- Error message

## State matrix

| State | Must satisfy |
| --- | --- |
| Default | Persistent label associated with its description |
| Focus | Visible caret and a clear outline |
| Error | aria-invalid=true; input is preserved |
| Disabled | Native disabled, with the reason stated |
| Read-only | readonly; copying is allowed |
| Done | Values the user has submitted are not cleared |

## Keyboard behavior

- Tab / Shift+Tab move focus.
- Follow native text editing and IME behavior; do not intercept composition input.

## Tokens and sizing

Use --xu-text, --xu-muted, --xu-brand, --xu-focus and --xu-control-border. The default control height is 40 px; touch targets are at least 44 px. Components must support dark and light themes and respect the user's root font size and reduced motion preference.

## Native mapping

widgets.Editor / widgets.input / widgets.text_area; native IME, selection and clipboard are handled by the host.

## Acceptance

- Default, focused, disabled and primary states can all be operated or compared in the corresponding demo.
- At 320 px there is no page-level horizontal overflow; long names and empty data keep their meaning.
- Use native semantics or complete ARIA relationships; errors are recoverable without losing user input.
- Browser regression tests cover the success path and at least one edge state; manual screen reader results are recorded separately and are not replaced by automated scans.
