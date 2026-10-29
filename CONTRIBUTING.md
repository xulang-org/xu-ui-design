# Maintaining XUUI

[English](CONTRIBUTING.md) · [简体中文](CONTRIBUTING.zh-CN.md)

Follow the [XU repository rules](https://github.com/xulang-org/xulang-org/blob/dev/.github/REPOSITORY_RULES.md). Fetch first, preserve local work and create a task branch from the latest `origin/dev`. Validate, commit explicit paths, push and open a PR to `dev`. Merging requires authorization. Release to `main` only after integration and validation in `dev` and release authorization.

## Public sources and local material

`standards/` is formal product documentation. Sources, tokens, icon metadata, build scripts and CI belong in the repository. Keep local development records, `docs/`, `reports/`, `.local/`, agent configuration, debug screenshots and generated `dist/` ignored. The user authorized public browser acceptance on 2026-10-29: source and reviewed visual baselines live in `tests/browser/`. Do not copy local compiler tests into CI.

## Languages

Maintain English `.md` and Simplified Chinese `.zh-CN.md` editions together, including README, changelog, migrations, contribution and browser guidance. Metadata in both document indexes uses `en` / `zh-CN` values. Icon metadata requires `label`, `labelEn`, `category` and `categoryEn`.

Controllers in `src/` are shared across languages. `locales/en.json` translates authored Chinese interface copy at build time. `scripts/localize.mjs` compiles two clients with the same behavior and rejects untranslated Chinese copy in the English client. Translation applies to source copy only, never user input, rendered HTML or token/icon identifiers. Keep phrases contextual and prefer complete sentences; longer phrases take precedence in a single pass. Do not include JavaScript delimiters in translated values. Check the resulting English for grammar around interpolated values. This is a dependency-free build step, not a runtime DOM translation layer.

The header language control preserves route and theme, persists a supported preference when storage is available, and reloads the page. URL `lang` overrides saved and browser preferences. Language changes do not auto-save form drafts.

## Validation

```sh
npm run check:hygiene
npm run check
npm ci
npm run test:browser
npm run test:visual
```

Check both languages and themes at 320 / 768 / 1440 px, focus, forms, dialog Escape and focus restoration, icon empty results, copying/downloads and unavailable browser storage. Demos stay clearly labeled as local; do not invent a backend.

The version in `package.json` is authoritative and matches `tokens/tokens.json`. It is independent of the compiler. Increment `dev.N` for subsequent prerelease batches. Token removals, renames or semantic changes require migration guidance. Do not add a minor or stable release without explicit approval.

Review staged paths, file types and licensing. Use the authorized author/committer identity and do not append contributor credits automatically. PR descriptions explain the problem, resulting behavior, version, validation, compatibility and rollback.

Formal visual baselines come from the pinned Linux Playwright container. Review screenshots before explicitly committing them; runtime reports and diffs stay in CI artifacts. A workflow file does not prove branch protection or successful deployment. Never report changes in `dev` before the PR is merged.
