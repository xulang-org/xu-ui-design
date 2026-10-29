# Icons

Icons are a supporting language for actions and states. This library provides 60 originally drawn SVGs covering action, direction, status, general and development scenarios. The single source file is icons/catalog.json.

## Geometry contract

| Item | Standard |
| --- | --- |
| Coordinate system | viewBox="0 0 24 24" |
| Primary safe area | 2–22 units, optically corrected by shape |
| Master stroke width | 1.5 units |
| Caps and joins | round / round |
| Color | stroke="currentColor", fill="none" |
| Common sizes | 16 / 20 / 24 / 32 px |
| Interaction target | Standalone icon buttons at least 44 × 44 px |

Stroke width scales proportionally with the viewBox: 1 px at 16 px, 1.25 px at 20 px, 1.5 px at 24 px and 2 px at 32 px. Do not set non-scaling-stroke. When special pixel correction is needed, add a separate, reviewed size variant.

## Naming and categories

Files use lowercase kebab-case and are named by shape, such as arrow-right and alert-triangle. The Chinese label serves search. The specific product meaning comes from the text or accessible name of the containing button. Do not use the same graphic to suggest conflicting actions.

## Usage

```html
<button class="xu-button">
  <svg class="xu-icon" aria-hidden="true" focusable="false">
    <use href="./assets/icons.svg#plus"></use>
  </svg>
  New project
</button>

<button class="xu-icon-button" aria-label="Close panel">
  <svg class="xu-icon" aria-hidden="true" focusable="false">
    <use href="./assets/icons.svg#x"></use>
  </svg>
</button>
```

The paths above apply to the exported showcase root directory. When integrating into another application, adjust them to the actual deployment location. External sprites must be served same-origin over HTTP; file:// is not a supported preview method. Standalone SVG downloads can be used in design tools. When referenced through img, the color cannot inherit the parent element's currentColor; use inline SVG or the sprite instead.

## Accessibility

Decorative icons set aria-hidden="true". Icon-only buttons provide aria-label on the button. Informational icons need a readable description. Standalone SVG downloads include title and role="img", while the copy button outputs SVG suited to inline decorative use. The loader only indicates waiting and must have text such as “Processing” next to it.

## Extension and acceptance

New icons must provide a unique name, Chinese label, category and a safe SVG body. They must not contain scripts, external resources, event handlers, embedded images or hard-coded colors. Run npm run check to verify the allowlist, names and exports. Manually check optical weight at the four sizes, in both themes and next to button text. The brand mark always uses the brand asset.

## Resource showcase

Icons are grouped by action, direction, status, development and general semantics, showing the Chinese name and English identifier. At widths of 840 px and above, a persistently visible inspector is provided. Selecting an icon updates the coordinate grid, four sizes, source code and export actions together. Narrower spaces use a details dialog with focus management. The inspector only updates the selected resource and does not interrupt the task on copy or filtering.

## Icons in controls

Use icon-sm/md/lg/xl tokens at 16/20/24/32 px. Button sm/md/lg icons are 16/20/24 px, inherit text color and have no outer margin. Scope illustration styles to a direct child so they cannot change nested action icons. Icon metadata includes both language labels and categories. Exported SVG titles include both names.
