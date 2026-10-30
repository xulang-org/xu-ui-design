// Generate the verified Editor, Chart and Frame token contract for XU SDK 0.10.11+.
export function nativeTokens(tokens) {
  const rgb = hex => hex.slice(1).match(/../g).slice(0,3).map(part=>parseInt(part,16)).join(',');
  const roles=['canvas','surface','elevated','subtle','text','muted','brand','focus','control-border','on-brand','danger','danger-soft','chart-1','chart-2','chart-3','chart-4','chart-5','chart-6','chart-7','chart-8'];
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

pub fn chart_palette(dark bool) []draw.Color {
    << [chart_1(dark),chart_2(dark),chart_3(dark),chart_4(dark),chart_5(dark),chart_6(dark),chart_7(dark),chart_8(dark)]
}

pub fn chart_appearance(dark bool) widgets.ChartAppearance {
    $appearance := widgets.chart_appearance()
    appearance.palette = chart_palette(dark)
    << appearance
}

pub fn prepare_frame(frame $&draw.Frame, dark bool) int {
    frame.set_bg(canvas(dark)) or >>
    frame.set_color(text(dark)) or >>
    << 0
}

// Editor appearance for XU SDK 0.10.11+. Other controls retain SDK defaults.
pub fn editor_styles(dark bool) widgets.Styles {
    $styles := widgets.light_styles()
    if dark { styles = widgets.dark_styles() }
    styles.background = canvas(dark)
    $input := styles.input.clone()
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
    $hover := widgets.state_paint(widgets.STATE_HOVERED)
    hover.unless = widgets.STATE_DISABLED | widgets.STATE_INVALID | widgets.STATE_READ_ONLY
    hover.fields = widgets.PAINT_BORDER
    hover.border = brand(dark)
    $focused := widgets.state_paint(widgets.STATE_FOCUSED)
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
