# Resource adoption and migrations

[English](MIGRATIONS.md) · [简体中文](MIGRATIONS.zh-CN.md)

## 0.1.1-dev.2 → 0.1.1-dev.3

Existing token names, CSS classes, icon identifiers and hash routes are preserved. English documents use `.md`; Chinese documents use `.zh-CN.md`. Update direct Markdown links if they need to stay Chinese. Online downloads automatically use the selected language. Resource archives contain both editions.

Use `?lang=en` or `?lang=zh-CN` before the hash route for explicit language links. The header switch remembers the preference where browser storage permits it. Switching reloads the page, preserving the route and theme; save any form drafts first.

Standalone controllers with English feedback are available at `assets/en/interactions.js`. The existing `assets/interactions.js` retains Chinese feedback. DOM contracts and exported function names are unchanged. Individually exported SVG titles now contain both names; geometry and identifiers are unchanged.

## 0.1.1-dev.1 → 0.1.1-dev.2

Add `icon-sm/md/lg/xl`, `brand-pressed` and `control-pressed` tokens without removing existing names. Button icons inherit the label color and use 16/20/24 px for sm/md/lg. Empty-state illustration styling applies only to the direct illustration. Border-box control heights are 32/40/48 px, including when component CSS is used alone. Update `tokens.css` and `components.css` together.

Wrap native selects with `xu-select-wrap` and a decorative chevron-down SVG for consistent heights, padding and arrows. Native interactions are retained. See `standards/07-forms.md`. Unwrapped selects keep the system appearance.

## 0.1.0 → 0.1.1-dev.1

Existing token names, CSS classes and the original 48 icon names are preserved. Additional icons are optional. New behavior contracts do not automatically replace product controls.

1. Download the versioned `downloads/xu-ui-resources-*.tar.gz` and `SHA256SUMS` from the same build.
2. Run `shasum -a 256 -c SHA256SUMS` (or `sha256sum -c SHA256SUMS` on Linux), then extract into a separate directory.
3. Retain `MANIFEST.json`: it records the resource version, source revision, dirty-tree status and per-file hashes. Offline resources include the MIT license.
4. Update token and component CSS together, optionally replace the sprite or individual SVGs, and check both themes, application states and keyboard behavior.

Pin the complete prerelease version and checksum; a prerelease is not a stable compatibility promise. Roll back the entire previous resource set rather than mixing token and style versions.

## Native XU Editor

Copy `xu/xuui_tokens/` into the application module and import it as `tokens #xuui_tokens`. Use `tokens.editor_styles(dark)` and draw with `paint_styled`; use `tokens.canvas(dark)` for the canvas. Theme changes update Styles and background and request repainting.

The adapter targets SDK 0.10.11 and maps Editor colors, border, focus, selection, 16 px text and 8 px radius. Other widgets retain SDK defaults. A simplified Theme is not exported: the older Editor.paint reuses the normal text foreground in selections, so it cannot independently guarantee contrast on the brand selection background. Use the complete Styles mapping.

Custom-drawn native controls require their own accessibility-tree and screen-reader acceptance. CSS and tokens cannot supply missing SDK semantics. Actual device verification covers macOS arm64. Windows, Linux and native screen-reader support remain unverified.

## Web behavior modules

`assets/interactions.js` exports `mountMenu`, `mountTabs`, `mountPagedTable`, `mountTree` and `mountSplitter`; the English edition is `assets/en/interactions.js`. Each returns a cleanup function: call it on unmount to avoid duplicate listeners. See `src/component-pages.js` and the component contracts for required data/ARIA structure. Replace local demo records and handle real product states before production adoption.
