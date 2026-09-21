extends Control

signal route_requested(route_id: StringName)

const HOME_ART := preload("res://scripts/home/home_art_atlas.gd")

const ICON_HOME := preload("res://art/icons/home.svg")
const ICON_CHARACTER := preload("res://art/icons/character.svg")
const ICON_ARTIFACT := preload("res://art/icons/artifact.svg")
const ICON_PET := preload("res://art/icons/pet.svg")
const ICON_MAP := preload("res://art/icons/map.svg")
const ICON_FACTION := preload("res://art/icons/faction.svg")

const GOLD := Color("e3bf70")
const GOLD_HI := Color("fff0bd")
const MUTED := Color("9fb0bd")
const SAFE_SIDE_INSET := 8.0

var _items: Dictionary = {}
var _enabled_routes := {
	&"home": true,
	&"character": true,
	&"artifacts": false,
	&"pets": false,
	&"world": false,
	&"faction": false,
}

func _ready() -> void:
	# HomeNav is a full-screen composition layer, but only its dock buttons
	# should participate in hit-testing. PASS here blocks HomeHUD controls that
	# sit underneath the transparent area above the dock.
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_build()

func set_route(route_id: StringName) -> void:
	for key in _items.keys():
		var nav_id := StringName(str(key))
		var item: Dictionary = _items[key]
		_apply_state(item, nav_id == route_id)
		_apply_enabled(item, bool(_enabled_routes.get(nav_id, false)))

func set_route_enabled(route_id: StringName, enabled: bool) -> void:
	_enabled_routes[route_id] = enabled
	if _items.has(route_id):
		_apply_enabled(_items[route_id], enabled)

func _build() -> void:
	var dock := Panel.new()
	dock.anchor_left = 0.0
	dock.anchor_right = 1.0
	dock.anchor_top = 1.0
	dock.anchor_bottom = 1.0
	dock.offset_left = SAFE_SIDE_INSET
	dock.offset_right = -SAFE_SIDE_INSET
	dock.offset_top = -92.0
	dock.offset_bottom = -4.0
	dock.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var dock_art_texture := HOME_ART.production_texture(&"dock")
	if dock_art_texture != null:
		dock.add_theme_stylebox_override("panel", StyleBoxEmpty.new())
	else:
		dock.add_theme_stylebox_override("panel", _flat(Color(0.004, 0.018, 0.032, 0.94), 20, Color(0.44, 0.64, 0.78, 0.25), 1))
	add_child(dock)

	if dock_art_texture != null:
		var dock_art := TextureRect.new()
		dock_art.texture = dock_art_texture
		dock_art.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		dock_art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		dock_art.stretch_mode = TextureRect.STRETCH_SCALE
		dock_art.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		dock_art.mouse_filter = Control.MOUSE_FILTER_IGNORE
		dock.add_child(dock_art)

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
	margin.add_theme_constant_override("margin_left", 6)
	margin.add_theme_constant_override("margin_right", 6)
	margin.add_theme_constant_override("margin_top", 8)
	margin.add_theme_constant_override("margin_bottom", 7)
	dock.add_child(margin)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 1)
	margin.add_child(row)

	var items := [
		[&"nav_home", ICON_HOME, "Động Phủ", &"home"],
		[&"nav_character", ICON_CHARACTER, "Nhân Vật", &"character"],
		[&"nav_artifacts", ICON_ARTIFACT, "Pháp Bảo", &"artifacts"],
		[&"nav_pets", ICON_PET, "Linh Thú", &"pets"],
		[&"nav_world", ICON_MAP, "Bản Đồ", &"world"],
		[&"nav_faction", ICON_FACTION, "Tông Môn", &"faction"],
	]

	for item in items:
		var art_id: StringName = item[0]
		var icon: Texture2D = item[1]
		var caption: String = item[2]
		var route_id: StringName = item[3]
		var nav_item := _nav_item(art_id, icon, caption, route_id)
		_items[route_id] = nav_item
		row.add_child(nav_item["root"])
		_apply_state(nav_item, route_id == &"home")
		_apply_enabled(nav_item, bool(_enabled_routes.get(route_id, false)))

func _nav_item(art_id: StringName, fallback_icon: Texture2D, caption: String, route_id: StringName) -> Dictionary:
	var root := PanelContainer.new()
	root.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	root.custom_minimum_size = Vector2(0, 72)

	var selected_glow: TextureRect = null
	var selected_glow_texture := HOME_ART.production_texture(&"selected_glow")
	if selected_glow_texture != null:
		selected_glow = TextureRect.new()
		selected_glow.texture = selected_glow_texture
		selected_glow.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		selected_glow.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		selected_glow.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		selected_glow.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		selected_glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
		selected_glow.visible = false
		root.add_child(selected_glow)

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

	var production_icon := HOME_ART.production_texture(art_id)
	var icon_rect := TextureRect.new()
	icon_rect.texture = production_icon if production_icon != null else fallback_icon
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
	button.add_theme_stylebox_override("pressed", _flat(Color(0.16, 0.11, 0.035, 0.42), 14, Color(0.92, 0.76, 0.38, 0.42), 1))
	button.add_theme_stylebox_override("disabled", StyleBoxEmpty.new())
	button.pressed.connect(_emit_route.bind(route_id))
	root.add_child(button)

	return {
		"root": root,
		"button": button,
		"icon": icon_rect,
		"label": label,
		"selected_glow": selected_glow,
		"production_icon": production_icon != null,
	}

func _apply_state(item: Dictionary, selected: bool) -> void:
	var root := item["root"] as PanelContainer
	var icon := item["icon"] as TextureRect
	var label := item["label"] as Label
	var selected_glow := item.get("selected_glow") as TextureRect
	var accent := GOLD_HI if selected else MUTED
	if bool(item.get("production_icon", false)):
		# Preserve authored gold/cyan icon colors; only reduce inactive emphasis.
		icon.modulate = Color.WHITE if selected else Color(0.66, 0.74, 0.80, 0.78)
	else:
		icon.modulate = GOLD if selected else MUTED
	label.add_theme_color_override("font_color", accent)
	if selected_glow != null:
		selected_glow.visible = selected
	if selected and selected_glow == null:
		root.add_theme_stylebox_override("panel", _flat(Color(0.14, 0.095, 0.025, 0.44), 14, Color(0.94, 0.77, 0.38, 0.36), 1))
	else:
		root.add_theme_stylebox_override("panel", StyleBoxEmpty.new())

func _apply_enabled(item: Dictionary, enabled: bool) -> void:
	var button := item["button"] as Button
	var icon := item["icon"] as TextureRect
	var label := item["label"] as Label
	button.disabled = not enabled
	if not enabled:
		icon.modulate = Color(0.40, 0.46, 0.50, 0.38)
		label.add_theme_color_override("font_color", Color(0.52, 0.58, 0.62, 0.52))

func _emit_route(route_id: StringName) -> void:
	if not bool(_enabled_routes.get(route_id, false)):
		return
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
