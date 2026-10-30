# Table and pagination

Sorting, pagination, empty results and action names. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Semantic header
- Data rows
- Sort buttons
- Result count
- Pagination navigation

## State matrix

| State | Must satisfy |
| --- | --- |
| With data | Complete header-to-cell relationships |
| Sorted | aria-sort expresses the current order |
| First / last page | Previous / Next are natively disabled |
| Empty result | Filter conditions are kept; a way to clear them is provided |
| Updated | The result count is announced in a role=status region |
| Narrow screens | The table container scrolls horizontally; the page does not overflow |

## Keyboard behavior

- Tab reaches the sort and pagination buttons; Enter / Space perform the action.
- Do not disguise an ordinary table as a grid that requires two-dimensional keyboard navigation.

## Tokens and sizing

Use --xu-text, --xu-muted, --xu-brand, --xu-focus and --xu-control-border. The default control height is 40 px; touch targets are at least 44 px. Components must support dark and light themes and respect the user's root font size and reduced motion preference.

## Native mapping

widgets.Table supports native tables and sorting; pagination belongs to the application data model and is not claimed to be provided automatically by the host.

## Acceptance

- Default, focused, disabled and primary states can all be operated or compared in the corresponding demo.
- At 320 px there is no page-level horizontal overflow; long names and empty data keep their meaning.
- Use native semantics or complete ARIA relationships; errors are recoverable without losing user input.
- Browser regression tests cover the success path and at least one edge state; manual screen reader results are recorded separately and are not replaced by automated scans.
