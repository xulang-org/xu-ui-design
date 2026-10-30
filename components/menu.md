# Action menu

Expansion, arrow keys, disabled items and exit. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Trigger button
- Menu container
- Actionable items
- Disabled items

## State matrix

| State | Must satisfy |
| --- | --- |
| Closed | aria-expanded=false; the menu is not in the Tab order |
| Expanded | aria-expanded=true; focus moves to the first item |
| Focused item | Only one available item is a Tab stop |
| Disabled item | aria-disabled=true; no action is performed |
| Selected | The menu closes and the action result is announced |
| Exit | Escape closes the menu and restores focus to the trigger |

## Keyboard behavior

- On the trigger, ArrowDown expands; ArrowUp expands and focuses the last item.
- Inside the menu, ArrowUp / ArrowDown cycle; Home / End go to the first and last items.
- Escape returns to the trigger; Tab closes the menu and keeps the normal focus order.

## Tokens and sizing

Use --xu-text, --xu-muted, --xu-brand, --xu-focus and --xu-control-border. The default control height is 40 px; touch targets are at least 44 px. Components must support dark and light themes and respect the user's root font size and reduced motion preference.

## Native mapping

Native widgets.Menu and ui.MenuEntry both provide menu capabilities; hierarchy, shortcuts and the host menu bar need separate adaptation.

## Acceptance

- Default, focused, disabled and primary states can all be operated or compared in the corresponding demo.
- At 320 px there is no page-level horizontal overflow; long names and empty data keep their meaning.
- Use native semantics or complete ARIA relationships; errors are recoverable without losing user input.
- Browser regression tests cover the success path and at least one edge state; manual screen reader results are recorded separately and are not replaced by automated scans.
