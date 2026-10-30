# File tree

Expandable hierarchy, selected item and visible-item navigation. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- tree container
- treeitem
- Hierarchy group
- Expansion indicator
- Selection indicator

## State matrix

| State | Must satisfy |
| --- | --- |
| Collapsed | aria-expanded=false; hidden descendants leave navigation |
| Expanded | aria-expanded=true; descendants are shown by level |
| Selected | aria-selected=true, distinct from focus |
| Focused | Only one visible item has tabindex=0 |
| Leaf item | aria-expanded is not set |
| Location | The full path is shown after a file is selected |

## Keyboard behavior

- ArrowUp / ArrowDown move between visible items; Home / End go to the first and last items.
- ArrowRight expands or moves to the first child; ArrowLeft collapses or moves to the parent.
- Enter / Space select without automatically changing the content editing focus.

## Tokens and sizing

Use --xu-text, --xu-muted, --xu-brand, --xu-focus and --xu-control-border. The default control height is 40 px; touch targets are at least 44 px. Components must support dark and light themes and respect the user's root font size and reduced motion preference.

## Native mapping

Native Tree capabilities must be verified against the actual SDK interface; this Web tree uses the WAI-ARIA tree model.

## Acceptance

- Default, focused, disabled and primary states can all be operated or compared in the corresponding demo.
- At 320 px there is no page-level horizontal overflow; long names and empty data keep their meaning.
- Use native semantics or complete ARIA relationships; errors are recoverable without losing user input.
- Browser regression tests cover the success path and at least one edge state; manual screen reader results are recorded separately and are not replaced by automated scans.
