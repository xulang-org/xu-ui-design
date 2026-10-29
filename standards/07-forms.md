# Forms and input

Forms first help users enter correct input, then help them recover when errors occur. Labels stay visible. A placeholder only provides an example and must not replace the label.

## Basic structure

```html
<label for="project-name">Project name <span>Required</span></label>
<input class="xu-input" id="project-name" name="project-name"
  required maxlength="40" aria-describedby="name-help">
<p id="name-help">Use 1–40 characters.</p>
```

## Fields and states

| State | Presentation | Behavior |
| --- | --- | --- |
| Default | Visible boundary and persistent label | Native input semantics |
| Focus | Focus outline | Do not auto-advance focus during input |
| Error | Danger text with a specific explanation | aria-invalid, linked error; focus the first error |
| Disabled | disabled, with the reason explained | Changes not allowed |
| Read-only | readonly | Can be selected and copied |
| Submitting | aria-busy on the form | Prevent duplicate submission, keep values |
| Complete | Text feedback | Do not clear user input without reason |

Do not show errors before the first input. On submit, validate all fields. After an error appears, update that field's error as the user types. Validation must cover whitespace-only strings and length. Native maxlength must not replace business validation.

## Selection controls

Use a wrapper to normalize the native select height and arrow across browsers:

```html
<span class="xu-select-wrap">
  <select class="xu-select" id="density" name="density">
    <option value="comfortable">Comfortable</option>
  </select>
  <svg class="xu-icon" aria-hidden="true" focusable="false">
    <use href="./assets/icons.svg#chevron-down"></use>
  </svg>
</span>
```

Associate a visible label with the select. The arrow ignores pointer events; the native popup and keyboard behavior remain available.

- Prefer a native select for single-choice lists. Use checkboxes for multiple-choice options.
- A switch represents a binary state that takes effect immediately. A regular checkbox represents a form option pending submission.
- Use fieldset and legend for options in the same group. Do not rely on position alone to indicate grouping.
- Text areas allow vertical resizing. Password and private fields follow business security requirements. Examples do not accept real credentials.

## Reference demo boundaries

The project form in the component showcase only validates and shows feedback on the current page. The settings example in page patterns may save to the local browser, and clearly shows local saving or storage failure. Neither connects to the XU compiler or remote services.

## Acceptance

Complete input, selection and submission using only the keyboard. Errors are announced and input is preserved. Chinese input is not interrupted by keyboard shortcuts. Disabled, read-only and error states each have a visible example.
