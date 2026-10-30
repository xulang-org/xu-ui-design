# Layout and spacing

Layout starts from content relationships. It uses a 4 px base unit and builds order with semantic grouping and white space, instead of wrapping every piece of content in its own card.

## Spacing scale

| Token | Value | Typical use |
| --- | --- | --- |
| space-1 | 4 px | Visual spacing inside icons |
| space-2 | 8 px | Icon and text, controls in the same group |
| space-3 | 12 px | Form labels and descriptions |
| space-4 | 16 px | Control groups, spacing inside panels |
| space-6 | 24 px | Spacing between groups, page margins on narrow screens |
| space-8 | 32 px | Spacing between content modules |
| space-12 | 48 px | Spacing between major sections |
| space-16 | 64 px | White space in the desktop main area |

## Responsive contract

| Width | Navigation | Main content | Behavior |
| --- | --- | --- | --- |
| 320–599 px | Top menu expanded | Single column, 16 px margins | Controls wrap; icon details open in a dialog |
| 600–999 px | Top menu expanded | 32 px margins, columns by content | Icon inspector kept from 840 px |
| 1000–1279 px | 216 px sidebar | Main content area and resource inspector | Document table of contents collapses above body text |
| 1280 px and above | 216 px sidebar | Cover and preview side by side | Body text and in-page table of contents in columns |

Breakpoints are content boundaries of the reference implementation, not device models. Individual components should also wrap when their container narrows. Do not hide an entire primary feature to pass mobile acceptance.

## Control density

sm = 32 px, md = 40 px, lg = 48 px. The default md is for desktop. Standalone icon buttons are at least 44 × 44 px. Touch and narrow-screen modes raise the minimum height of regular controls to 44 px. Visual size and interaction target are evaluated separately.

## Radius, layers and scrims

radius-sm = 4 px is for small tags, radius-md = 8 px for controls, and radius-lg = 12 px for panels. Overlays prefer borders and scrims to establish hierarchy. z-sticky, z-menu and z-toast handle regular layering. The native dialog uses the browser top layer. Do not substitute an ever-increasing z-index for focus isolation.

## Component composition and typography matrix

When atomic controls are combined into complete interfaces, follow the predefined container structures, typographic hierarchy and spacing contracts (exported in Web `assets/components.css`, and mapped to `#ui/layout` and `#ui/widgets` natively):

| Composition pattern | Container and native mapping | Typography hierarchy (size / weight / line-height) | Spacing and alignment contract |
| --- | --- | --- | --- |
| Action cluster and button group | `.xu-cluster`, `.xu-button-group` / `widgets.ButtonGroup` | Button label `14 px` (`text-sm`) / `600` / `1.2` | Standalone buttons use `8 px` (`space-2`) gap in fixed order: Primary → Secondary → Ghost → Danger; segmented single-select groups (`joined`) share an outer frame with `4 px` inset padding |
| Search and filter toolbar | `.xu-toolbar` / `layout.row(..., CROSS_END)` | Field label `14 px` / `600`; input and select `14 px` / `400` / `1.5` | Search field `flex: 1 1 200px`, compact filter `144 px`, bottom-aligned (`align-items: flex-end`) so labeled inputs and trailing action buttons share the same `40 px` control baseline with `16 px` (`space-4`) gap |
| Form stack and two-column grid | `.xu-stack`, `.xu-form-grid` / `widgets.Field` | Label `14 px` / `600`; control `14 px` / `400`; helper and error `14 px` / `400` / `1.5` | `8 px` (`space-2`) inside each field (label → control → helper/error), `20 px` (`space-5`) vertically between fields; `32 px` (`space-8`) column gap in desktop 2-column grids, collapsing to 1 column below `720 px` |
| Three-section card panel | `.xu-card` (`header` / `body` / `footer`) / `widgets.CardRegions` | Title `16 px` (`text-md`) / `600` / `1.4`; subtitle `12 px` (`text-xs`) `muted`; footer meta `12 px` `mono` | `24 px` (`space-6`, `16 px` on narrow screens) outer padding; `16 px` (`space-4`) between header, body and footer; footer places status/metadata on the start side and action cluster on the end side |
| Structured list row | `.xu-list`, `.xu-list-row` / `widgets.ListRow` | Title `14 px` / `500` `text`; secondary description `12 px` / `400` `muted`; trailing detail `12 px` `mono` | Three-column grid: `20 px` leading icon → stacked title and description (`2 px` gap) → right-aligned mono detail, badge or `sm` ghost action, with `12 px` (`space-3`) horizontal gap and `48 px` minimum row height |
| Key-value spec row and split workbench | `.xu-kv`, `.xu-split-panels` / `widgets.SplitView` | Key label `14 px` `text`; value or code `12–14 px` `mono` `muted` | Key-value rows justify space-between with `12 px` (`space-3`) vertical padding and `1 px` top borders; split workbenches pair a `25%–35%` navigation rail with a `65%–75%` main pane without nested same-axis scrollbars |

## Acceptance

A 320 px viewport has no page-level horizontal overflow. Long titles, long paths and Chinese descriptions are not truncated in ways that lose key meaning. Tables keep the relationship between headers and data, and scroll regions have a keyboard entry point.

The ICON library is a resource search interface. Categories are grouped with headings and spacing; a single icon is highlighted only on hover or selection. The grid in the inspector carries real SVG coordinate measurement and is not a full-page decorative background. In shorter windows, the inspector uses internal scrolling, so the full content and export actions remain accessible after expanding the source code.
