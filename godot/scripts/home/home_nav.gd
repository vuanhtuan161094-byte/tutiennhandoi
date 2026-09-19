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
	for id in _buttons:
		var button: Button = _buttons[id]
		var selected := id == route_id
		button.add_theme_color_override("font_color", GOLD if selected else MUTED)
		button.add_theme_color_override("icon_normal_color", GOLD if selected else MUTED)

func _build() -> void:
	var veil := Panel.new()
	veil.position = Vector2(0, 754)
	veil.size = Vector2(390, 90)
	veil.mouse_filter = Control.MOUSE_FILTER_IGNORE
	veil.add_theme_stylebox_override("panel", _flat(Color(0.003, 0.016, 0.024, 0.74), 0))
	add_child(veil)

	var row := HBoxContainer.new()
	row.position = Vector2(14, 766)
	row.size = Vector2(362, 61)
	row.add_theme_constant_override("separation", 0)
	add_child(row)

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
		button.custom_minimum_size = Vector2(0, 58)
		button.add_theme_font_size_override("font_size", 7)
		button.add_theme_color_override("font_color", GOLD if route_id == &"home" else MUTED)
		button.add_theme_color_override("icon_normal_color", GOLD if route_id == &"home" else MUTED)
		button.add_theme_color_override("icon_hover_color", GOLD_HI)
		button.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
		button.add_theme_stylebox_override("hover", _flat(Color(0.05, 0.10, 0.12, 0.50), 13))
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
