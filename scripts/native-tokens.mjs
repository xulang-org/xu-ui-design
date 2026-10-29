// Generate the verified Editor style contract for XU SDK 0.10.11.
export function nativeTokens(tokens) {
  const rgb = hex => hex.slice(1).match(/../g).slice(0,3).map(part=>parseInt(part,16)).join(',');
  const roles=['canvas','surface','elevated','subtle','text','muted','brand','focus','control-border','on-brand','danger','danger-soft'];
  const functions=roles.map(role=>`pub fn ${role.replaceAll('-','_')}(dark bool) draw.Color {
    if dark { << draw.rgb(${rgb(tokens.themes.dark[role])}) }
    << draw.rgb(${rgb(tokens.themes.light[role])})
}`).join('\n');
  return `@xuui_tokens
// XUUI ${tokens.version}; generated from tokens/tokens.json.
// Regenerate with npm run build; retain this provenance when vendoring.
#ui/draw
#ui/widgets

${functions}

// Editor appearance for XU SDK 0.10.11. Other controls retain SDK defaults.
pub fn editor_styles(dark bool) widgets.Styles {
    mut styles := widgets.light_styles()
    if dark { styles = widgets.dark_styles() }
    styles.background = canvas(dark)
    mut input := styles.input.clone()
    input.radius = ${parseFloat(tokens.base['radius-md']).toFixed(1)}
    input.min_height = ${parseFloat(tokens.base['control-md']).toFixed(1)}
    input.padding.left = ${parseFloat(tokens.base['space-3']).toFixed(1)}
    input.padding.right = ${parseFloat(tokens.base['space-3']).toFixed(1)}
    input.padding.top = ${parseFloat(tokens.base['space-2']).toFixed(1)}
    input.padding.bottom = ${parseFloat(tokens.base['space-2']).toFixed(1)}
    input.border_width = 1.0
    input.focus_width = 2.0
    input.font.size = 16.0
    input.inherit_font = false
    input.palette.normal = surface(dark)
    input.palette.hovered = surface(dark)
    input.palette.pressed = subtle(dark)
    input.palette.disabled = surface(dark)
    input.palette.foreground = text(dark)
    input.palette.muted = muted(dark)
    input.palette.placeholder = muted(dark)
    input.palette.accent = brand(dark)
    input.palette.on_accent = on_brand(dark)
    input.palette.focus = focus(dark)
    input.palette.border = control_border(dark)
    input.palette.invalid = danger(dark)
    input.palette.invalid_fill = danger_soft(dark)
    input.palette.read_only = subtle(dark)
    input.palette.selection = brand(dark)
    input.palette.selection_text = on_brand(dark)
    mut hover := widgets.state_paint(widgets.STATE_HOVERED)
    hover.unless = widgets.STATE_DISABLED | widgets.STATE_INVALID | widgets.STATE_READ_ONLY
    hover.fields = widgets.PAINT_BORDER
    hover.border = brand(dark)
    mut focused := widgets.state_paint(widgets.STATE_FOCUSED)
    focused.unless = widgets.STATE_DISABLED | widgets.STATE_INVALID
    focused.fields = widgets.PAINT_BORDER
    focused.border = focus(dark)
    input.states = [hover,focused]
    styles.input = input.clone()
    styles.text_area = input.clone()
    styles.text_area.align_y = 0.0
    << styles
}
`;
}
