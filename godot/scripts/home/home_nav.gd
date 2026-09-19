extends Control

signal route_requested(route_id: StringName)

const ICON_HOME := preload("res://art/icons/home.svg")
const ICON_CHARACTER := preload("res://art/icons/character.svg")
const ICON_ARTIFACT := preload("res://art/icons/artifact.svg")
const ICON_PET := preload("res://art/icons/pet.svg")
const ICON_MAP := preload("res://art/icons/map.svg")
const ICON_FACTION := preload("res://art/icons/faction.svg")

const GOLD := Color("e3bf70")
const GOLD_HI := Color("f5ddb0")
const MUTED := Color("9fb0b2")

var _buttons: Dictionary = {}

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_PASS
	_build()

func set_route(route_id: StringName) -> void:
	for key in _buttons.keys():
		var nav_id := StringName(str(key))
		var button := _buttons[key] as Button
		var is_selected: bool = nav_id == route_id
		button.add_theme_color_override("font_color", GOLD if is_selected else MUTED)
		button.add_theme_color_override("icon_normal_color", GOLD if is_selected else MUTED)
		button.add_theme_stylebox_override(
			"normal",
			_flat(
				Color(0.09, 0.075, 0.035, 0.34) if is_selected else Color.TRANSPARENT,
				14,
				Color(0.90, 0.72, 0.36, 0.22) if is_selected else Color.TRANSPARENT,
				1 if is_selected else 0
			)
		)

func _build() -> void:
	var veil := PanelContainer.new()
	veil.anchor_left = 0.0
	veil.anchor_right = 1.0
	veil.anchor_top = 1.0
	veil.anchor_bottom = 1.0
	veil.offset_top = -92.0
	veil.offset_bottom = 0.0
	veil.mouse_filter = Control.MOUSE_FILTER_IGNORE
	veil.add_theme_stylebox_override("panel", _flat(Color(0.003, 0.016, 0.024, 0.78), 0, Color(0.50, 0.72, 0.72, 0.08), 1))
	add_child(veil)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 10)
	margin.add_theme_constant_override("margin_right", 10)
	margin.add_theme_constant_override("margin_top", 10)
	margin.add_theme_constant_override("margin_bottom", 10)
	veil.add_child(margin)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 1)
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
		button.icon = icon
		button.text = caption
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.custom_minimum_size = Vector2(0, 64)
		button.add_theme_font_size_override("font_size", 7)
		button.add_theme_color_override("font_color", GOLD if route_id == &"home" else MUTED)
		button.add_theme_color_override("icon_normal_color", GOLD if route_id == &"home" else MUTED)
		button.add_theme_color_override("icon_hover_color", GOLD_HI)
		button.add_theme_stylebox_override(
			"normal",
			_flat(Color(0.09, 0.075, 0.035, 0.34), 14, Color(0.90, 0.72, 0.36, 0.22), 1)
			if route_id == &"home"
			else StyleBoxEmpty.new()
		)
		button.add_theme_stylebox_override("hover", _flat(Color(0.05, 0.10, 0.12, 0.58), 14))
		button.pressed.connect(_emit_route.bind(route_id))
		_buttons[route_id] = button
		row.add_child(button)

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
