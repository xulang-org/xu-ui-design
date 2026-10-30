# Tabs

Selection, arrow keys and associated panels. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- tablist container
- tab buttons
- tabpanel content

## State matrix

| State | Must satisfy |
| --- | --- |
| Default | One tab is selected and reachable with Tab |
| Unselected | aria-selected=false, tabindex=-1 |
| Selected | aria-selected=true; the associated panel is visible |
| Disabled | Native disabled; skipped by arrow keys |
| Focus | Focus outline and selection indicator are each visible |
| Switching | Automatic activation, only for immediate local content |

## Keyboard behavior

- ArrowLeft / ArrowRight cycle through available tabs.
- Home / End go to the first and last tabs; Tab moves into the current panel.

## Tokens and sizing

Use --xu-text, --xu-muted, --xu-brand, --xu-focus and --xu-control-border. The default control height is 40 px; touch targets are at least 44 px. Components must support dark and light themes and respect the user's root font size and reduced motion preference.

## Native mapping

Where a native tab control exists, adapt it to the host focus model; this library only commits to this Web automatic-activation pattern.

## Acceptance

- Default, focused, disabled and primary states can all be operated or compared in the corresponding demo.
- At 320 px there is no page-level horizontal overflow; long names and empty data keep their meaning.
- Use native semantics or complete ARIA relationships; errors are recoverable without losing user input.
- Browser regression tests cover the success path and at least one edge state; manual screen reader results are recorded separately and are not replaced by automated scans.
