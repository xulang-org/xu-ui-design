# Delivery and governance

Design standards are product content of this repository and live in standards/. Local plans, logs, screenshots and audits go in ignored directories. Do not copy the compiler repository's local docs/ as public design documentation.

## Single source

| Source | Generated or consumed output |
| --- | --- |
| tokens/tokens.json | assets/tokens.css, native Editor adaptation, basic showcase, contrast ratio checks |
| icons/catalog.json | SVG sprite, standalone SVGs, searchable showcase |
| standards/index.json and Markdown | Documentation navigation, online reading and source download |
| src/components.css | Reusable reference component styles |
| components/index.json and Markdown | Standalone component contracts, state matrices and acceptance |
| src/interactions.js | Unmountable behavior controllers |
| src/app.js | Showcase interactions and page patterns |

## Build and use

```sh
npm run check
npm run build
npm run dev
```

Requires Node.js 22 or later, with no external runtime dependencies. The dev command builds first and defaults to http://127.0.0.1:4173. The port can be set through PORT. After source changes, rebuild and refresh. dist/ can be deployed at the root or a subdirectory of a static host. Internal resources use relative paths, and routes use hash.

To integrate into an application, copy dist/assets/tokens.css and components.css, and include dist/assets/icons.svg as needed. The component styles do not include dialog, form or routing behavior. Use native semantics and implement product state yourself. dist/tokens/tokens.json can be converted by design tools. It currently uses this project's own flat structure and does not claim compatibility with the DTCG file format.

## Versioning and compatibility

This library's independent version is managed by package.json, and the current release baseline is 0.1.0. Later development batches use pre-release versions, and the development suffix is removed after acceptance and release. Token removal, renaming, semantic changes and icon removal require migration notes. Additions keep existing contracts. Standards, resources and the showcase are updated in the same PR, not just screenshots. The XU compiler version must not be changed because of this.

## Collaboration

Create a task branch from the latest origin/dev, commit explicit paths after validation, push, and merge into dev through a PR. main advances only after release authorization is obtained and dev integration is validated. Before release, verify the target branch, the full commit and validation results. Merges between long-lived branches use merge commits that preserve the common ancestor. The presence of CI configuration does not mean branch protection is enabled.

## Release and rollback

CI builds and verifies PRs, dev and main. Pages deploys only after main passes resource checks, browser behavior and visual regression, and PRs do not have Pages write permission. A formal release must first obtain authorization and complete dev integration. Whether the deployment entry is available is determined by actual workflow success and online access results. Failures are recovered through a fix PR or revert PR followed by redeployment. Do not force-push long-lived branches, and do not move published tags.

Each build also outputs versioned resource packages, SHA256SUMS and a per-file manifest under downloads/. Resource packages include the license, changes and migration notes. Consumers pin the full version, source commit and checksums, verify them on upgrade, replace the whole set, and keep the old package for rollback.

## Delivery gates

check validates token structure, defined color combinations, the SVG allowlist, documentation links and build resources. Playwright checks behavior in Chromium, Firefox and WebKit. axe covers eight components in both themes on narrow screens, and a fixed Linux Chromium baseline checks visuals. Navigation, themes, screen readers and real tasks are checked manually in addition. Record the actual scope of checks, and do not use automated color checks in place of full accessibility acceptance.
