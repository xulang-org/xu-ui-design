# XUUI Design System

[English](README.md) · [简体中文](README.zh-CN.md)

UI standards for the XU ecosystem: **design documentation, semantic tokens, SVG icons and an interactive reference showcase**.

Current development version: `0.1.1-dev.4`. Stable baseline: `0.1.0`. Web components have explicit behavior contracts. The native adapter targets the Editor in XU SDK 0.10.11; other native widgets require separate verification.

## Run the showcase

Use Node.js 22 or later. The showcase has no runtime dependencies and does not need the XU SDK. Install development dependencies with `npm ci` for browser tests.

```sh
git clone https://github.com/xulang-org/xu-ui-design.git
cd xu-ui-design
npm run check
npm run dev
```

`main` contains the accepted stable baseline. Start development on a task branch from freshly fetched `origin/dev`.

Open the [local showcase](http://127.0.0.1:4173/). Use `PORT=4174 npm run dev` if the port is occupied. Rebuild and refresh after source changes; the preview server does not provide hot reload.

Use **English / 中文** in the header. The initial language follows the browser, with an explicit URL choice taking precedence over the saved preference. Examples: `/?lang=en#/icons` and `/?lang=zh-CN#/icons`. Switching preserves the route and theme and reloads the page. Unsaved form drafts should be saved before switching. Storage is optional; explicit language links work when it is unavailable.

| Area | Working reference |
| --- | --- |
| Overview | XU identity, workspace preview and light/dark themes |
| Standards | 13 documents in both languages, search, outline, reading and Markdown downloads |
| Foundations | Theme values, CSS variable copying, contrast, type and spacing |
| Component lab | Nine contracts: buttons, input, feedback, menus, tabs, tables, trees, split panels and charts |
| Icons | 60 SVGs, bilingual search, categories, inspector, four sizes, copying and downloads |
| Motion and feedback | XU stamp receipts, continuous tabs, disclosure and reduced motion |
| Patterns | Local settings, project search and status filters, sorting, details, in-place creation, new-row focus and empty states |

Hash routes also work under a subdirectory such as `/xu-ui-design/`, without server-side route rewrites.

## Standards

| Foundations | Components | Patterns and delivery |
| --- | --- | --- |
| [Design principles](standards/01-principles.md) | [Actions and buttons](standards/06-actions.md) | [Page patterns](standards/10-patterns.md) |
| [Color and themes](standards/02-color.md) | [Forms and input](standards/07-forms.md) | [Accessibility and motion](standards/11-accessibility.md) |
| [Typography](standards/03-typography.md) | [Navigation](standards/08-navigation.md) | [Delivery and governance](standards/12-delivery.md) |
| [Layout and spacing](standards/04-layout.md) | [Feedback and overlays](standards/09-feedback.md) | |
| [Icons](standards/05-icons.md) | [Drawing and data visualization](standards/13-drawing.md) | |

Every standard and component contract has an English `.md` and a Simplified Chinese `.zh-CN.md` source. Online downloads follow the selected language. The resource archive includes both.

## Use the resources

```sh
npm run build
```

The generated `dist/` directory is a standalone static showcase with:

- `assets/tokens.css`: semantic colors, type, spacing, radii, sizes and motion.
- `assets/components.css`: reference control, state and progress styles.
- `assets/icons.svg` and `icons/*.svg`: a same-origin sprite and individually named SVGs.
- `tokens/tokens.json`: the project token format; DTCG compatibility is not claimed.
- `standards/*.md` and `components/*.md`: both language editions.
- `assets/motion.css` and `assets/motion.js`: cancellable receipts, settling and status feedback.
- `assets/interactions.js`: removable menu, tab, table, tree and splitter controllers; `assets/en/interactions.js` has English feedback.
- `xu/xuui_tokens/mod.xu`: SDK 0.10.11 Editor styles and semantic colors.
- `downloads/xu-ui-resources-0.1.1-dev.4.tar.gz`, `SHA256SUMS` and `manifest.json`: versioned resources and source/checksum metadata.

Read [migration and adoption guidance](MIGRATIONS.md) and the [changelog](CHANGELOG.md). The [Writing Desk adapter](https://github.com/xulang-org/examples/pull/21) is integrated into the examples repository's `dev`, with a pinned source revision and SDK version.

```html
<link rel="stylesheet" href="./assets/tokens.css">
<link rel="stylesheet" href="./assets/components.css">
<button type="button" class="xu-button primary">
  <svg class="xu-icon" aria-hidden="true" focusable="false">
    <use href="./assets/icons.svg#plus"></use>
  </svg>
  Create project
</button>
```

Set `data-theme="light"` on the root to use the light theme; dark is the default. Icon-only buttons need an accessible name on the button. Component CSS does not manage application state, forms or dialogs.

## Sources and validation

Authoritative sources are `tokens/tokens.json`, `icons/catalog.json`, `standards/`, `components/` and `locales/en.json`. Do not edit generated files. Brand geometry comes from [the XU website source](https://github.com/xulang-org/xulang-org/tree/8d36bb410511f12429a12c8596d672e5e0b5a29f/brand), under MIT. General icons are original to this repository. The license does not grant XU brand endorsement.

`npm run check` validates tokens, defined contrast combinations, safe SVG geometry, both language inventories and links, JavaScript syntax, token references, archives and the HTTP preview. CI runs Chromium, Firefox and WebKit behavior checks, dual-theme axe scans and fixed-environment Chromium visual comparisons. See [browser acceptance](tests/browser/README.md).

Automated checks are not WCAG certification. Actual screen-reader speech acceptance is deferred at the user's request and remains **unverified**. Native verification covers macOS arm64 editing and themes; Windows, Linux and native screen-reader support remain unverified.

Pages deploys only after `main` passes build and browser acceptance. The intended address is `https://xulang-org.github.io/xu-ui-design/`; a successful deployment must be confirmed before treating it as a live entry point. Changes go through a PR to `dev` first, then an authorized release to `main`. Roll back by reverting source and redeploying, without rewriting shared history.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before making changes.
