# Table and pagination

Sorting, pagination, virtualized rows, in-cell editing, column management and action names. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Semantic header with sort, filter and column menu controls
- Virtualized data viewport with recycled row containers
- Pinned/frozen column regions (left and right)
- In-cell editors (text, number, select, date) with validation popovers
- Row selection indicators and batch action toolbar
- Result count and pagination navigation

## State matrix

| State | Must satisfy |
| --- | --- |
| With data | Complete header-to-cell relationships with aria-rowindex and aria-colindex |
| Sorted | aria-sort expresses the current order on the sorted header |
| Virtualized scrolling | Viewport renders visible rows plus buffer; total height reflected in scrollbar |
| Cell editing | Inline editor takes focus; Enter/Tab commits edit, Esc reverts value |
| Pinned column | Frozen columns stay fixed horizontally with box-shadow boundary separator |
| Multi-selected | Selection checkboxes reflect checked / indeterminate count; batch actions enabled |
| First / last page | Previous / Next are natively disabled |
| Empty result | Filter conditions are kept; a way to clear them is provided |
| Updated | The result count and mutation results are announced in a role=status region |
| Narrow screens | The table container scrolls horizontally; the page does not overflow |

## Keyboard behavior

- Tab reaches sort buttons, interactive cell actions and pagination controls; Enter / Space perform the action.
- In editable grid mode, Arrow keys navigate between cells; Enter or F2 enters edit mode; Escape cancels edit mode.
- In edit mode, Tab commits current cell and advances focus to next editable cell in reading order.
- Space toggles row selection when focused on row checkbox or selection column.
- Do not disguise an ordinary read-only table as an editing grid unless two-dimensional navigation is supported.

## Tokens and sizing

Use --xu-text, --xu-muted, --xu-brand, --xu-focus, --xu-surface, --xu-canvas and --xu-control-border. The default row height is 40 px; touch targets for sort and action buttons are at least 44 px. Components must support dark and light themes and respect the user's root font size and reduced motion preference.

## Native mapping

widgets.Table / widgets.table; virtualized row cache recycling with draw.TextLayout reuse, native TextInput inline cell overlay, column resize/reorder drag tracking, and UIA / NSAccessibility table and grid pattern mapping.

## Acceptance

- Default, virtualized, cell-editing, sorted, multi-selected and disabled states can all be operated or verified.
- Virtual scrolling retains smooth 60fps frame rate with datasets exceeding 10,000 rows without memory leakage.
- Inline cell editing integrates cleanly with platform IME, committing valid text and showing localized validation errors.
- At 320 px there is no page-level horizontal overflow; frozen columns unfreeze or gracefully wrap on narrow screens.
- Use native semantics or complete ARIA table/grid relationships; cell mutations announce changes via role="status".
- Browser regression tests cover virtual scrolling, in-cell edit commit and cancel, and column reorder; manual screen reader results are recorded separately.
