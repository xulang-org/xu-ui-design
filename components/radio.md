# Radio group and options

Mutually exclusive single-choice group and checkable option rows with grouped fieldset semantics. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Grouped container (`fieldset` and visible `legend`)
- Selectable option rows with radio indicator, title and optional hint
- Selected boundary highlight and live selection status

## State matrix

| State | Must satisfy |
| --- | --- |
| Unselected | Neutral surface with subtle border and unchecked indicator |
| Selected | Brand indicator fill and highlighted border on surface without lowering text contrast |
| Hover | Subtle elevated feedback when enabled |
| Focus | Clear 2 px outline on the focused radio control |
| Disabled | Native disabled attribute with reason; skipped by arrow navigation |

## Keyboard behavior

- Tab enters or leaves the radio group at the currently selected option.
- ArrowUp / ArrowDown or ArrowLeft / ArrowRight cycle across enabled options within the same group.
- Home / End navigation stays scoped to the native group; Space selects when focused.

## Tokens and sizing

Use `--xu-surface`, `--xu-border`, `--xu-brand`, `--xu-text`, `--xu-muted`, `--xu-focus` and `--xu-target-min`. Option rows enforce at least 44 px minimum height on Web and 48 dp on mobile.

## Native mapping

widgets.Radio / widgets.RadioGroup / widgets.radio_group and `#ui/phone` phone.radio_row / phone.check_row / phone.segmented.

## Acceptance

- Multiple mutually exclusive options, description text, disabled policy item and selection readout work in the demo.
- At 320 px labels wrap cleanly without overflowing the option card.
- Always pair related radios under `<fieldset>` and `<legend>` instead of visual proximity alone.
- Browser regression checks verify arrow-key selection, live status updates and dual-theme contrast.
