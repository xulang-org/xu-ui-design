# Color and themes

Colors describe semantics, not component positions. Product code uses semantic variables such as --xu-brand and --xu-text and does not copy hex colors directly.

## Semantic roles

| Token | Purpose | Usage limits |
| --- | --- | --- |
| --xu-canvas | Page base | Large background areas |
| --xu-surface | Content surface | Forms, panels, dialogs |
| --xu-elevated | Secondary layer | Control fills and table headers |
| --xu-text | Primary text | Headings, body text, input values |
| --xu-muted | Secondary text | Descriptions and metadata; must still be readable |
| --xu-brand | Brand and primary actions | Not also used for error messages |
| --xu-on-brand | Text on brand color | Must be paired with brand |
| --xu-control-border | Interactive boundaries | Inputs and unselected controls |
| --xu-border | Decorative dividers | Not the sole means of identifying a control |
| --xu-focus | Keyboard focus | 2 px outline, 3 px offset |

## Two themes

The default is dark Obsidian, and users may switch to light Xuan Paper. The theme setting is stored in the local browser; when storage is unavailable, the interface keeps working normally. The root element uses data-theme="dark" or data-theme="light". The exported tokens.css defaults to dark.

The primary cinnabar color is #be123c in light and #ff5274 in dark, to improve readability of small action areas. #ff5274 is an optically corrected UI color and does not replace the original color of the brand mark. Primary buttons in dark use dark text. Do not force white text in both themes.

## Status pairs

success / success-soft, warning / warning-soft, danger / danger-soft and info / info-soft are text and soft-background pairs. Each status carries both text and a graphic. Do not distinguish by red and green alone. Error messages point to the specific input, and warnings keep a path to continue or go back.

## Contrast ratio and verification

Regular text is at least 4.5:1, large text at least 3:1, and control boundaries and focus that carry identification at least 3:1. This library's check command measures text against canvas, surface and elevated, as well as the defined combinations for buttons, statuses, control boundaries and focus. The results are shown in the basics showcase. Transparent overlays, disabled states and arbitrary product color schemes must be verified separately.

Reference: [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/). These thresholds are project acceptance requirements. Automated color checks do not mean the whole site is certified.

## Prohibited practices

- Do not invert images in product components to simulate a theme.
- Do not hide important descriptions with faded opacity.
- Do not use --xu-border as the only boundary of an input.
- Do not use brand red for regular links, danger messages and all icons at the same time.

Use brand-pressed for a pressed primary action and control-pressed for neutral controls. Keep the same boundary and label contrast requirements.
