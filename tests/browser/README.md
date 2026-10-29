# Browser acceptance

[English](README.md) · [简体中文](README.zh-CN.md)

Public browser regression sources were authorized on 2026-10-29. This directory contains showcase acceptance and visually reviewed baselines. Reports, traces, failures and diffs stay in ignored `.local/` directories and CI artifacts. Do not copy local compiler tests here.

```sh
npm ci
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
```

Chromium, Firefox and WebKit cover disabled menu entries, tabs, pagination boundaries, tree navigation, splitters, form recovery, modal focus, icon downloads, clipboard failure and storage failure. Both languages are checked for switching, document completeness, translated interactions and responsive overflow. Eight components receive axe A/AA checks in both themes at 320 px. Automated checks are not manual screen-reader acceptance or WCAG certification.

## Visual baselines

Use `mcr.microsoft.com/playwright:v1.64.1-noble`, matching the lockfile. Fix Chromium, zh-CN, reduced motion and desktop 1440×900 / mobile 390×844. Never use macOS screenshots to replace Linux baselines.

```sh
docker run --rm --init --ipc=host -v "$PWD:/work" -w /work mcr.microsoft.com/playwright:v1.64.1-noble sh -c 'npm ci && npm run test:visual -- --update-snapshots'
```

Missing baselines deliberately fail CI and expose candidate images. Review every language/theme/layout candidate before explicitly committing `baselines/*.png`. Changes need the same review; never bulk-accept unreviewed diffs. Keep container, dependencies, lockfile and baselines aligned on browser upgrades.

`baselines/source.json` records the generation run, source revision and SHA-256 hashes. Full-page icon screenshots cover all 60 icons; focused empty-state/button screenshots cover desktop/mobile in both themes, and tree screenshots verify row focus. Behavior and visual reports are separate. Each visual run retains a current `review-*.png` render for explicit review.

Appearance checks also verify composition: empty-state action icons match external buttons in size, color and centering; standalone component CSS needs no showcase reset; disabled items retain disabled feedback; folder and file labels align.

## Manual acceptance

Complete key tasks by keyboard. Manual VoiceOver/Safari or NVDA/Firefox acceptance records names, states, hierarchy, error speech and focus restoration, together with system/browser/reader versions. Mark untested combinations **unverified**. Actual speech acceptance is deferred at the user's request.

Native Writing Desk verification currently covers macOS arm64 editing, menus and themes only. SDK accessibility exposure needs separate work; native screen-reader acceptance is not claimed.
