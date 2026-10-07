extends RefCounted
## Shared presentation palette. No gameplay state or asset authority.

const TEXT := Color("f2ece2")
const MUTED := Color("8ea0a4")
const GOLD := Color("c7a66b")
const CYAN := Color("72cbd1")
const RED := Color("c7615a")
const CRIMSON := Color("a94343")
const IVORY := Color("f2ece2")
const INK := Color("071015")
const PANEL := Color("0a1419")

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
	style.bg_color = Color(PANEL, opacity)
	style.border_color = Color(accent, 0.24)
	style.set_border_width_all(1)
	style.set_corner_radius_all(6)
	return style

static func overlay_surface(accent: Color = GOLD, opacity: float = 0.66, radius: int = 8) -> StyleBoxFlat:
	var style := surface(accent, opacity)
	style.set_corner_radius_all(radius)
	style.border_color = Color(accent, 0.30)
	style.shadow_color = Color(0, 0, 0, 0.34)
	style.shadow_size = 5
	style.shadow_offset = Vector2(0, 2)
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
	var background := surface(MUTED, 0.58)
	background.set_border_width_all(0)
	background.set_corner_radius_all(2)
	var fill := background.duplicate() as StyleBoxFlat
	fill.bg_color = color
	node.add_theme_stylebox_override("background", background)
	node.add_theme_stylebox_override("fill", fill)
	return node

static func draw_hud_strip(canvas: Control, accent: Color) -> void:
	# Parent overlay panels own the main surface. Child HUDs only draw a quiet
	# separator so the combat screen reads as one composition instead of cards.
	canvas.draw_line(
		Vector2(0, canvas.size.y - 1),
		Vector2(canvas.size.x, canvas.size.y - 1),
		Color(accent, 0.18),
		1.0
	)
