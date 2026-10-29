# Actions and buttons

Each task area has at most one primary action. Action labels use “verb + object”, such as “Save settings”. Avoid using “OK” for an unclear result.

## Hierarchy

| Type | Class name | Use case |
| --- | --- | --- |
| Primary | xu-button primary | Save, create, submit |
| Secondary | xu-button | Cancel, supporting actions |
| Ghost | xu-button ghost | View descriptions, low-emphasis actions |
| Danger | xu-button danger | Destructive actions such as delete; state the object and consequences |
| Icon | xu-icon-button | Compact actions with a clear aria-label |

## State contract

- Default: the name is readable and the boundary is clear.
- Hover: change background and border. Do not rely on the cursor alone to indicate clickability.
- Pressed: use a darker background. Do not let the layout shift.
- Focus: show the focus outline. Do not clip the outline.
- Disabled: use native disabled and explain the precondition. Hover and pressed feedback remain disabled.
- Loading: show waiting text and aria-busy="true"; prevent duplicate submission.
- Success or failure: keep the current task context and use readable status information.

## Sizes

sm / md / lg are 32 / 40 / 48 px respectively, set through data-size. Measurements include the border. Touch targets are at least 44 px. Icons use 16/20/24 px, inherit the label color and have no outer margin; the text-to-icon gap is 8 px. Multiline labels may increase control height. Do not fix button widths in ways that truncate Chinese text. Form submit buttons explicitly use type="submit"; other buttons use type="button".

## Reference implementation

```html
<button type="button" class="xu-button primary" data-size="md">
  Save settings
</button>
<button type="button" class="xu-button" disabled>
  Complete required fields
</button>
```

## Acceptance

The component showcase provides loading, disabled, size and notification feedback. Enter and Space trigger buttons; the action must not run again while waiting. Links use a with a real address. Buttons must not pose as links that go nowhere.
