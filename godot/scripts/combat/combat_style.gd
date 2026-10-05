extends RefCounted
## Shared presentation palette. No gameplay state or asset authority.

const TEXT := Color("dddcd1")
const MUTED := Color("819b9f")
const GOLD := Color("bd9c65")
const CYAN := Color("75c7cc")
const RED := Color("bd6961")

static func label(text: String, font_size: int = 11, color: Color = TEXT) -> Label:
	var node := Label.new()
	node.text = text
	node.mouse_filter = Control.MOUSE_FILTER_IGNORE
	node.add_theme_font_size_override("font_size", font_size)
	node.add_theme_color_override("font_color", color)
	node.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS if text.is_empty() else TextServer.OVERRUN_NO_TRIMMING
	return node

static func surface(accent: Color = MUTED, opacity: float = 0.36) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.027, 0.061, 0.072, opacity)
	style.border_color = Color(accent, 0.24)
	style.set_border_width_all(1)
	style.set_corner_radius_all(6)
	return style

static func bar(node_name: String, color: Color, height: float) -> ProgressBar:
	var node := ProgressBar.new()
	node.name = node_name
	node.max_value = 100.0
	node.value = 100.0
	node.show_percentage = false
	node.mouse_filter = Control.MOUSE_FILTER_IGNORE
	node.custom_minimum_size = Vector2(0, height)
	node.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var background := surface(MUTED, 0.65)
	background.set_border_width_all(0)
	background.set_corner_radius_all(2)
	var fill := background.duplicate() as StyleBoxFlat
	fill.bg_color = color
	node.add_theme_stylebox_override("background", background)
	node.add_theme_stylebox_override("fill", fill)
	return node
