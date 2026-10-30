# Page patterns

Page patterns combine basic components to show complete tasks. All project names, records and statuses are recognizable demo data and do not connect to real repositories.

## Component composition blueprints

Before assembling full pages, use the six predefined component composition blueprints instead of improvising ad-hoc padding, font sizes or alignments:

- **Action cluster and segmented group (`.xu-cluster` / `.xu-button-group`)**: Space peer action buttons by `8 px` (`space-2`) in the order Primary → Secondary → Ghost → Danger. Use `.xu-button-group` for mutually exclusive view or chart mode switches with `aria-pressed="true"` on the active item.
- **Search and filter toolbar (`.xu-toolbar`)**: Combine a flexible search field (`flex: 1 1 200px`), compact filter selects (`144 px`) and a trailing action button. Align cross-axis items to the bottom (`align-items: flex-end` / native `layout.CROSS_END`) so labeled inputs and standalone buttons share the same `40 px` control box baseline.
- **Form stack and two-column grid (`.xu-stack` / `.xu-form-grid`)**: Space vertical field stacks by `20 px` (`space-5`) and desktop two-column grids by `32 px` (`space-8`). Every field follows the three-tier vertical rhythm Label (`14 px` `600`) → Control (`40 px`) → Helper or Error (`14 px`) with `8 px` (`space-2`) internal gap; checkboxes and switches occupy their own row.
- **Three-section card panel (`.xu-card`)**: Matching native `widgets.CardRegions`, structure cards into `.xu-card-header` (left `16 px` title and `12 px` subtitle, right status badge), `.xu-card-body` (form, chart or `.xu-kv` specification rows) and `.xu-card-footer` (left `12 px` monospace receipt/meta, right `.xu-cluster` actions).
- **Structured list row (`.xu-list` / `.xu-list-row`)**: Matching native `widgets.ListRow`, lay out each row in three columns—leading `20 px` icon, stacked `14 px` `500` title and `12 px` `muted` description, and right-aligned monospace metadata or `sm` ghost action.
- **Master-detail split workbench**: Pair a navigation or file-tree rail on the start side with a main workspace (`xu-tabs` → `.xu-toolbar` → table or chart stage → status/pagination bar) while preserving a single primary scroll container.

## Settings page

Order the page as "Basic information → Behavior preferences → Save result". Field labels sit above fields, and help text follows the field. Setting changes are first kept as a draft. After a successful save, show a clear result. If storage fails, keep the input and allow retry. The example's local storage key is xu-ui-demo-settings. No backend API is used.

The save button confirms in place; the result remains below it. Editing again immediately returns to an unsaved state.

Acceptance: saved content is read after refresh. Invalid names block saving. When storage is disabled, show the failure and do not pretend it succeeded. The example does not save personal information or credentials.

## Data list

The order is "Title and create entry → Search → Status filter → Data table → Result count". Column names explain their meaning. Text is left-aligned and numbers are right-aligned. Row actions state their target. Prefer table to keep semantics. On narrow screens, let the table container scroll on its own.

Acceptance: keyword and status filter together. No results shows a clear-filters action. The details button shows the corresponding demo project. Sort buttons sit in column headers that carry aria-sort. Status text must not be replaced by icons.

Creation opens a named local demo form in the current page. Empty or duplicate names keep focus on the error. Success inserts one draft record, clears search/status filters and focuses the new row name. Records are held on the current page and reset on refresh; no repository is created.

## Empty states

Explain the current situation, what caused it and the next step available. An initial empty state provides a create entry. A filtered empty state provides clear filters. Do not write "No permission", "Network error" and "No data yet" all as "No data".

## Adaptation principles

On mobile, keep primary actions and error messages. Forms become a single column. Horizontally scrollable data still has visible headings. Do not scale the desktop canvas down proportionally into an unreadable screenshot. The mobile preview in the examples is a real DOM container, and the whole browser at narrow width must also be checked.

Continue reading: [Layout and spacing](04-layout.md), [Forms and input](07-forms.md).
