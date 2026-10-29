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

Quick feedback takes 120 ms and general transitions take 200 ms, using ease-out. Only add transitions to opacity and transform. Avoid large displacement, looping decoration and flashing. Under prefers-reduced-motion: reduce, turn off non-essential motion, and loaders keep text feedback for waiting.

## Acceptance steps

- Use Tab, Shift+Tab, Enter, Space and Escape to go through navigation, forms, dialogs and icon details.
- Check focus after closing a dialog, empty filter results, copy failure and storage failure.
- In both themes, check body text, status text, input boundaries and focus.
- Check 320 px, 768 px, 1440 px and 200% zoom.
- Use at least one screen reader to check headings, labels, error associations and live regions. Automated checks cannot replace this item.

The first release does not claim full screen reader certification. Maintainers complete manual acceptance for the system combinations the product actually supports.

Reference: [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/).
