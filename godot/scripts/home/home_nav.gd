extends Control

signal route_requested(route_id: StringName)

const ICON_HOME := preload("res://art/icons/home.svg")
const ICON_CHARACTER := preload("res://art/icons/character.svg")
const ICON_ARTIFACT := preload("res://art/icons/artifact.svg")
const ICON_PET := preload("res://art/icons/pet.svg")
const ICON_MAP := preload("res://art/icons/map.svg")
const ICON_FACTION := preload("res://art/icons/faction.svg")

const GOLD := Color("e3bf70")
const GOLD_HI := Color("fff0bd")
const MUTED := Color("9fb0bd")

var _buttons: Dictionary = {}

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_PASS
	_build()

func set_route(route_id: StringName) -> void:
	for key in _buttons.keys():
		var nav_id := StringName(str(key))
		var button := _buttons[key] as Button
		var is_selected: bool = nav_id == route_id
		_apply_state(button, is_selected)

func _build() -> void:
	var dock := PanelContainer.new()
	dock.anchor_left = 0.0
	dock.anchor_right = 1.0
	dock.anchor_top = 1.0
	dock.anchor_bottom = 1.0
	dock.offset_left = 2.0
	dock.offset_right = -2.0
	dock.offset_top = -92.0
	dock.offset_bottom = -2.0
	dock.mouse_filter = Control.MOUSE_FILTER_IGNORE
	dock.add_theme_stylebox_override("panel", _flat(Color(0.004, 0.018, 0.032, 0.94), 20, Color(0.44, 0.64, 0.78, 0.25), 1))
	add_child(dock)

	var top_glow := ColorRect.new()
	top_glow.anchor_left = 0.08
	top_glow.anchor_right = 0.92
	top_glow.offset_top = 0.0
	top_glow.offset_bottom = 1.0
	top_glow.color = Color(0.86, 0.72, 0.40, 0.30)
	top_glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	dock.add_child(top_glow)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 8)
	margin.add_theme_constant_override("margin_right", 8)
	margin.add_theme_constant_override("margin_top", 9)
	margin.add_theme_constant_override("margin_bottom", 8)
	dock.add_child(margin)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 0)
	margin.add_child(row)

	var items := [
		[ICON_HOME, "Động Phủ", &"home"],
		[ICON_CHARACTER, "Nhân Vật", &"character"],
		[ICON_ARTIFACT, "Pháp Bảo", &"artifacts"],
		[ICON_PET, "Linh Thú", &"pets"],
		[ICON_MAP, "Bản Đồ", &"world"],
		[ICON_FACTION, "Tông Môn", &"faction"],
	]

	for item in items:
		var icon: Texture2D = item[0]
		var caption: String = item[1]
		var route_id: StringName = item[2]
		var button := Button.new()
		button.name = "Nav_%s" % String(route_id)
		button.icon = icon
		button.text = caption
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.custom_minimum_size = Vector2(0, 68)
		button.add_theme_font_size_override("font_size", 8)
		button.add_theme_color_override("icon_hover_color", GOLD_HI)
		button.add_theme_color_override("font_hover_color", GOLD_HI)
		button.add_theme_stylebox_override("hover", _flat(Color(0.05, 0.10, 0.13, 0.62), 14, Color(0.70, 0.82, 0.86, 0.12), 1))
		button.pressed.connect(_emit_route.bind(route_id))
		_buttons[route_id] = button
		row.add_child(button)
		_apply_state(button, route_id == &"home")

func _apply_state(button: Button, selected: bool) -> void:
	button.add_theme_color_override("font_color", GOLD_HI if selected else MUTED)
	button.add_theme_color_override("icon_normal_color", GOLD if selected else MUTED)
	if selected:
		button.add_theme_stylebox_override("normal", _flat(Color(0.14, 0.095, 0.025, 0.44), 14, Color(0.94, 0.77, 0.38, 0.36), 1))
	else:
		button.add_theme_stylebox_override("normal", StyleBoxEmpty.new())

func _emit_route(route_id: StringName) -> void:
	route_requested.emit(route_id)

func _flat(fill: Color, radius: int, border: Color = Color.TRANSPARENT, border_width: int = 0) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = fill
	style.corner_radius_top_left = radius
	style.corner_radius_top_right = radius
	style.corner_radius_bottom_left = radius
	style.corner_radius_bottom_right = radius
	style.border_color = border
	style.border_width_left = border_width
	style.border_width_top = border_width
	style.border_width_right = border_width
	style.border_width_bottom = border_width
	return style
