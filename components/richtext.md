# Rich text editor

Formatted text editing, formatting toolbar, inline styles, blocks and assistive technology semantics. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Formatting toolbar with accessible action buttons
- Content editable surface with block and inline run semantics
- Character and selection status region
- Link and formatting property popovers

## State matrix

| State | Must satisfy |
| --- | --- |
| Empty | Shows placeholder, accessible role="textbox" with aria-multiline="true" |
| Focused | Visible caret at current run boundary, active styles highlighted in toolbar |
| Range selected | Selection spans runs cleanly; format actions apply across all intersecting runs |
| Composing (IME) | Preedit composition text displayed with platform underline; toolbar actions deferred |
| Read-only | Formatting toolbar hidden or disabled; text selectable and copyable |
| Disabled | Natively disabled; content not editable or focusable |

## Keyboard behavior

| Shortcut | Action |
| --- | --- |
| Ctrl+B / Cmd+B | Toggle bold style on active selection or current insertion point |
| Ctrl+I / Cmd+I | Toggle italic style on active selection or current insertion point |
| Ctrl+U / Cmd+U | Toggle underline style on active selection or current insertion point |
| Ctrl+K / Cmd+K | Open hyperlink dialog for selected text |
| Shift+Enter | Insert soft line break within current paragraph |
| Enter | Split block and create new paragraph with inherited styles |
| Tab / Shift+Tab | Indent or outdent list item block, or move focus out when at root level |

## Tokens and sizing

Use --xu-text, --xu-muted, --xu-brand, --xu-focus, --xu-control-border and --xu-surface. The minimum editor height is 160 px; toolbar buttons maintain touch targets of at least 44 px. Components must support dark and light themes and respect the user's root font size and reduced motion preference.

## Native mapping

widgets.RichEditor / widgets.rich_editor; native IME proxy and DirectWrite / CoreText multi-run text layouts with platform UIA / NSAccessibility text pattern bridging.

## Acceptance

- Default, focused, formatted selection, read-only and disabled states can all be operated or verified.
- CJK IME composition places candidates accurately at the caret position without breaking formatting runs.
- At 320 px there is no page-level horizontal overflow; toolbar wraps responsively without clipping actions.
- ARIA relationships associate toolbar items with the editing canvas; screen readers announce current formatting state changes.
- Browser regression tests cover inline styling, block creation and IME commit paths; manual screen reader speech verification is recorded separately.
