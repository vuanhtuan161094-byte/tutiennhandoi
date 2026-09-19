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

var _items: Dictionary = {}

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_PASS
	_build()

func set_route(route_id: StringName) -> void:
	for key in _items.keys():
		var nav_id := StringName(str(key))
		var item: Dictionary = _items[key]
		_apply_state(item, nav_id == route_id)

func _build() -> void:
	var dock := Panel.new()
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
	top_glow.anchor_top = 0.0
	top_glow.anchor_bottom = 0.0
	top_glow.offset_top = 0.0
	top_glow.offset_bottom = 1.0
	top_glow.color = Color(0.86, 0.72, 0.40, 0.30)
	top_glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	dock.add_child(top_glow)

	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 8)
	margin.add_theme_constant_override("margin_right", 8)
	margin.add_theme_constant_override("margin_top", 8)
	margin.add_theme_constant_override("margin_bottom", 7)
	dock.add_child(margin)

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
		var nav_item := _nav_item(icon, caption, route_id)
		_items[route_id] = nav_item
		row.add_child(nav_item["root"])
		_apply_state(nav_item, route_id == &"home")

func _nav_item(icon: Texture2D, caption: String, route_id: StringName) -> Dictionary:
	var root := PanelContainer.new()
	root.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	root.custom_minimum_size = Vector2(0, 72)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 2)
	margin.add_theme_constant_override("margin_right", 2)
	margin.add_theme_constant_override("margin_top", 4)
	margin.add_theme_constant_override("margin_bottom", 3)
	root.add_child(margin)

	var col := VBoxContainer.new()
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	col.add_theme_constant_override("separation", 1)
	margin.add_child(col)

	var center := CenterContainer.new()
	center.custom_minimum_size = Vector2(0, 38)
	col.add_child(center)

	var icon_rect := TextureRect.new()
	icon_rect.texture = icon
	icon_rect.custom_minimum_size = Vector2(30, 30)
	icon_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	icon_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	center.add_child(icon_rect)

	var label := Label.new()
	label.text = caption
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 9)
	label.add_theme_constant_override("outline_size", 2)
	label.add_theme_color_override("font_outline_color", Color(0.0, 0.01, 0.02, 0.90))
	col.add_child(label)

	var button := Button.new()
	button.name = "Nav_%s" % String(route_id)
	button.text = ""
	button.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	button.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	button.add_theme_stylebox_override("hover", _flat(Color(0.05, 0.10, 0.13, 0.26), 14))
	button.pressed.connect(_emit_route.bind(route_id))
	root.add_child(button)

	return {
		"root": root,
		"button": button,
		"icon": icon_rect,
		"label": label,
	}

func _apply_state(item: Dictionary, selected: bool) -> void:
	var root := item["root"] as PanelContainer
	var icon := item["icon"] as TextureRect
	var label := item["label"] as Label
	var accent := GOLD_HI if selected else MUTED
	icon.modulate = GOLD if selected else MUTED
	label.add_theme_color_override("font_color", accent)
	if selected:
		root.add_theme_stylebox_override("panel", _flat(Color(0.14, 0.095, 0.025, 0.44), 14, Color(0.94, 0.77, 0.38, 0.36), 1))
	else:
		root.add_theme_stylebox_override("panel", StyleBoxEmpty.new())

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
