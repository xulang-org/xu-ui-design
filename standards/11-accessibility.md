# Accessibility and motion

WCAG 2.2 AA is the design target, and 44 × 44 px is the project standard for standalone icon and touch targets. 44 px is above the minimum target size required by some WCAG 2.2 AA criteria, and the two must not be conflated.

## Keyboard and semantics

- Native button, a, input, select, details and dialog take precedence over custom interactions.
- All actions support the keyboard, and focus order follows reading order.
- Do not use positive tabindex. After content changes, move focus to the main heading.
- Every icon-only button has an accessible name. Decorative icons are hidden from assistive technology.
- Input errors are associated with fields through aria-invalid and aria-describedby.
- Use role="status" for non-critical results. Blocking errors keep their text and focus the problem.

## Visual

Body text contrast is at least 4.5:1, large text at least 3:1, and essential non-text boundaries at least 3:1. Status must not be expressed by color alone. At 200% zoom and a 320 px viewport, no primary content may be lost. Focus outlines must not be clipped by sticky areas or overflow.

## Motion

XU motion uses three related actions: press to acknowledge contact, stamp to confirm a completed action, and settle to preserve position during a change. Motion explains an actual state change; it does not create a waiting period.

| Purpose | Token / value | Contract |
| --- | --- | --- |
| Press / stamp | duration-fast / 120 ms | One short response at the action source |
| Switch / settle | duration-normal / 200 ms | Move the selection indicator; content stays in its region |
| Panel entrance | duration-enter / 220 ms | Dialog and panel entry; focus works immediately |
| Entrance distance | motion-distance / 6 px | Small vertical movement; no large displacement |
| Easing | ease-out | Decelerate into a precise resting position; no bounce |

Only opacity and transform animate. Never animate width, height, top or left. Tab indicators use measured final geometry and transform, not an animated width. Closing a menu or dialog is immediate so keyboard focus is never delayed. Avoid looping decoration, flashing and motion on every keystroke.

### Feedback and the next step

- Copy and save confirmation appears in the original button, with a square check mark and no change in button size. The temporary receipt lasts 1.4 seconds; readable status text remains after it ends.
- Commit success only after the operation completes. Failed copying exposes selectable source. Failed saving keeps input. New edits immediately clear a previous saved receipt.
- The original accessible button name stays available; live status carries the result. Color and motion do not carry meaning alone.
- Project creation keeps the user on the patterns page. Validate before inserting a record, clear conflicting filters, focus the new row name and settle the row into place. Tell users that refreshing resets these local demo records.

### Reduced motion and cleanup

Under prefers-reduced-motion: reduce, disable movement, scaling and transitions while keeping confirmation text, selection, errors and next steps. Changing the preference while motion is playing cancels it at the already committed final state. Controls remain operable during motion. Route changes and controller cleanup cancel owned animations and temporary receipts.

### Web adoption

Include tokens.css, components.css and motion.css. The standalone interactions.js now imports its sibling motion.js; copy them together. The English controller uses assets/en/motion.js. No external runtime library is required.

```js
import { acknowledge, showStatus } from './assets/motion.js';
await navigator.clipboard.writeText(source);
acknowledge(copyButton, 'Copied');
showStatus(status, 'Copied. Paste into your project.');
```

The receipt uses the sprite at ./assets/icons.svg; keep that resource path aligned when adopting it. The interactive motion showcase demonstrates copy, continuous tabs and progressive disclosure. Native products follow their host animation APIs; this Web controller does not add native SDK animation capabilities.

## Acceptance steps

- Use Tab, Shift+Tab, Enter, Space and Escape to go through navigation, forms, dialogs and icon details.
- Check focus after closing a dialog, empty filter results, copy failure and storage failure.
- In both themes, check body text, status text, input boundaries and focus.
- Check 320 px, 768 px, 1440 px and 200% zoom.
- Use at least one screen reader to check headings, labels, error associations and live regions. Automated checks cannot replace this item.

The first release does not claim full screen reader certification. Maintainers complete manual acceptance for the system combinations the product actually supports.

Reference: [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/).

## Current acceptance status

Actual screen-reader speech acceptance is deferred at the user’s request and remains unverified. Automated browser and axe results do not change that status. Native verification currently covers macOS arm64 editing and themes; other platforms and native screen-reader support remain unverified.
