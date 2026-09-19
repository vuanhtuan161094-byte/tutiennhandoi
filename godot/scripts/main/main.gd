extends Control

const HOME_STAGE := preload("res://art/generated/home_stage_v1.svg")
const CULTIVATOR := preload("res://art/generated/home_cultivator_v1.svg")

const GOLD := Color("f5c96b")
const GOLD_DIM := Color("b88b45")
const CYAN := Color("59d8ff")
const MINT := Color("68e6b5")
const TEXT := Color("edf7ff")
const MUTED := Color("9eb3c9")
const INK := Color("061321")
const PANEL := Color(0.018, 0.055, 0.10, 0.86)

var status_label: Label
var route_label: Label
var nav_buttons: Dictionary = {}

func _ready() -> void:
	_build_ui()
	AppState.route_changed.connect(_on_route_changed)
	AppState.cultivation_action_requested.connect(_on_action)

func _build_ui() -> void:
	var world := TextureRect.new()
	world.texture = HOME_STAGE
	world.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	world.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	world.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	world.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(world)

	var veil := ColorRect.new()
	veil.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	veil.color = Color(0.01, 0.04, 0.08, 0.18)
	veil.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(veil)

	var safe := MarginContainer.new()
	safe.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	safe.add_theme_constant_override("margin_left", 14)
	safe.add_theme_constant_override("margin_right", 14)
	safe.add_theme_constant_override("margin_top", 16)
	safe.add_theme_constant_override("margin_bottom", 14)
	add_child(safe)

	var page := VBoxContainer.new()
	page.add_theme_constant_override("separation", 8)
	safe.add_child(page)

	page.add_child(_top_bar())
	page.add_child(_hero_card())
	page.add_child(_stage())
	page.add_child(_cultivation_card())
	page.add_child(_action_row())

	var flex := Control.new()
	flex.size_flags_vertical = Control.SIZE_EXPAND_FILL
	page.add_child(flex)
	page.add_child(_nav())

func _top_bar() -> Control:
	var row := HBoxContainer.new()
	row.custom_minimum_size = Vector2(0, 42)
	row.add_theme_constant_override("separation", 9)

	var brand := VBoxContainer.new()
	brand.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	brand.add_child(_label("TU TIÊN NHÀN DỖI", 21, Color("fff0c8")))
	brand.add_child(_label("ĐẠO TẠI TÂM • NHÂN MÃ VẠN MẠNH", 8, Color(0.72, 0.83, 0.92, 0.72)))
	row.add_child(brand)

	row.add_child(_resource_pill("◈ 3.680", CYAN))
	row.add_child(_resource_pill("◉ 250", GOLD))
	return row

func _hero_card() -> Control:
	var box := _glass_panel(Color(0.03, 0.09, 0.15, 0.80), 15, Color(0.25, 0.60, 0.78, 0.42))
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)

	var portrait := Label.new()
	portrait.text = "☯"
	portrait.custom_minimum_size = Vector2(52, 52)
	portrait.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	portrait.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	portrait.add_theme_font_size_override("font_size", 30)
	portrait.add_theme_color_override("font_color", GOLD)
	row.add_child(portrait)

	var data := VBoxContainer.new()
	data.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	data.add_theme_constant_override("separation", 2)

	var title := HBoxContainer.new()
	var name := _label("Thiên Vô Danh", 18, TEXT)
	name.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title.add_child(name)
	title.add_child(_label("Lv.58", 13, GOLD))
	data.add_child(title)
	data.add_child(_label("Luyện Khí Trung Kỳ", 13, CYAN))

	var p := ProgressBar.new()
	p.max_value = 50000
	p.value = 18450
	p.show_percentage = false
	p.custom_minimum_size = Vector2(0, 8)
	p.add_theme_stylebox_override("background", _flat(Color(0.02, 0.06, 0.10, 0.85), 4))
	p.add_theme_stylebox_override("fill", _flat(Color(0.22, 0.72, 0.92, 0.95), 4))
	data.add_child(p)
	data.add_child(_label("Tu Vi 18.450 / 50.000   •   Linh Căn: Ngũ Hành", 10, MUTED))
	row.add_child(data)

	box.add_child(row)
	return box

func _stage() -> Control:
	var stage := Control.new()
	stage.custom_minimum_size = Vector2(0, 300)
	stage.clip_contents = false

	var halo := Label.new()
	halo.text = "◌     ✦     ◌\n\n\n      ✧"
	halo.set_anchors_preset(Control.PRESET_FULL_RECT)
	halo.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	halo.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	halo.add_theme_font_size_override("font_size", 25)
	halo.add_theme_color_override("font_color", Color(0.42, 0.88, 1.0, 0.40))
	halo.mouse_filter = Control.MOUSE_FILTER_IGNORE
	stage.add_child(halo)

	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var hero := TextureRect.new()
	hero.texture = CULTIVATOR
	hero.custom_minimum_size = Vector2(220, 282)
	hero.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	hero.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	hero.mouse_filter = Control.MOUSE_FILTER_IGNORE
	center.add_child(hero)
	stage.add_child(center)

	var realm := _glass_panel(Color(0.02, 0.07, 0.11, 0.70), 12, Color(0.87, 0.70, 0.32, 0.45))
	realm.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	realm.position = Vector2(-120, 14)
	realm.size = Vector2(106, 48)
	var realm_text := _label("Linh Căn\nNgũ Hành", 10, Color("e9dba6"))
	realm_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	realm.add_child(realm_text)
	stage.add_child(realm)

	return stage

func _cultivation_card() -> Control:
	var box := _glass_panel(Color(0.02, 0.07, 0.12, 0.88), 16, Color(0.26, 0.58, 0.72, 0.46))
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 3)

	status_label = _label("Đang tu luyện...", 15, TEXT)
	status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(status_label)

	var rate := _label("Tu vi +120 / phút", 11, MINT)
	rate.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(rate)

	var p := ProgressBar.new()
	p.max_value = 100
	p.value = 63
	p.show_percentage = false
	p.custom_minimum_size = Vector2(0, 7)
	p.add_theme_stylebox_override("background", _flat(Color(0.01, 0.04, 0.07, 0.9), 4))
	p.add_theme_stylebox_override("fill", _flat(Color(0.20, 0.80, 0.55, 0.95), 4))
	col.add_child(p)

	var time := _label("00:12:36", 11, MUTED)
	time.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(time)

	box.add_child(col)
	return box

func _action_row() -> Control:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	for data in [
		["☯", "Tu Luyện", &"cultivate", GOLD],
		["✦", "Đột Phá", &"breakthrough", Color("bb77ff")],
		["♨", "Luyện Đan", &"alchemy", Color("56d9a3")],
		["◉", "Săn Ảo", &"hunt", CYAN],
	]:
		var b := Button.new()
		b.text = "%s\n%s" % [data[0], data[1]]
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.custom_minimum_size = Vector2(0, 64)
		b.add_theme_font_size_override("font_size", 11)
		b.add_theme_color_override("font_color", data[3])
		b.add_theme_color_override("font_hover_color", Color.WHITE)
		b.add_theme_stylebox_override("normal", _flat(Color(0.02, 0.07, 0.12, 0.90), 14, Color(0.18, 0.37, 0.50, 0.72), 1))
		b.add_theme_stylebox_override("hover", _flat(Color(0.04, 0.13, 0.20, 0.96), 14, data[3], 1))
		b.add_theme_stylebox_override("pressed", _flat(Color(0.03, 0.09, 0.15, 1.0), 14, GOLD, 2))
		b.pressed.connect(AppState.request_cultivation_action.bind(data[2]))
		row.add_child(b)
	return row

func _nav() -> Control:
	var box := _glass_panel(Color(0.01, 0.035, 0.065, 0.96), 16, Color(0.22, 0.40, 0.55, 0.55))
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 5)

	route_label = _label("Động Phủ", 10, GOLD)
	route_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(route_label)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 1)
	for data in [
		["⌂", "Động Phủ", &"home"], ["♙", "Nhân Vật", &"character"],
		["†", "Pháp Bảo", &"artifacts"], ["♘", "Linh Thú", &"pets"],
		["△", "Bản Đồ", &"world"], ["門", "Tông Môn", &"faction"],
	]:
		var b := Button.new()
		b.text = "%s\n%s" % [data[0], data[1]]
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.custom_minimum_size = Vector2(0, 52)
		b.add_theme_font_size_override("font_size", 8)
		b.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
		b.add_theme_stylebox_override("hover", _flat(Color(0.06, 0.13, 0.19, 0.78), 10))
		b.add_theme_color_override("font_color", GOLD if data[2] == &"home" else MUTED)
		b.add_theme_color_override("font_hover_color", GOLD)
		b.pressed.connect(AppState.request_route.bind(data[2]))
		nav_buttons[data[2]] = b
		row.add_child(b)

	col.add_child(row)
	box.add_child(col)
	return box

func _resource_pill(value: String, accent: Color) -> Control:
	var box := _glass_panel(Color(0.02, 0.07, 0.11, 0.88), 10, Color(accent, 0.28))
	box.custom_minimum_size = Vector2(68, 31)
	var l := _label(value, 10, accent)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	box.add_child(l)
	return box

func _glass_panel(fill: Color, radius: int, border: Color) -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", _flat(fill, radius, border, 1))
	return p

func _flat(fill: Color, radius: int, border: Color = Color.TRANSPARENT, border_width: int = 0) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = fill
	s.corner_radius_top_left = radius
	s.corner_radius_top_right = radius
	s.corner_radius_bottom_left = radius
	s.corner_radius_bottom_right = radius
	s.border_color = border
	s.border_width_left = border_width
	s.border_width_top = border_width
	s.border_width_right = border_width
	s.border_width_bottom = border_width
	s.content_margin_left = 10
	s.content_margin_right = 10
	s.content_margin_top = 8
	s.content_margin_bottom = 8
	return s

func _label(value: String, size: int, color: Color) -> Label:
	var l := Label.new()
	l.text = value
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	return l

func _on_route_changed(route_id: StringName) -> void:
	var names := {
		&"home": "Động Phủ", &"character": "Nhân Vật", &"artifacts": "Pháp Bảo",
		&"pets": "Linh Thú", &"world": "Bản Đồ", &"faction": "Tông Môn"
	}
	route_label.text = names.get(route_id, String(route_id))
	for id in nav_buttons:
		var b: Button = nav_buttons[id]
		b.add_theme_color_override("font_color", GOLD if id == route_id else MUTED)

func _on_action(action_id: StringName) -> void:
	var names := {
		&"cultivate": "Tu Luyện", &"breakthrough": "Đột Phá",
		&"alchemy": "Luyện Đan", &"hunt": "Săn Ảo"
	}
	status_label.text = "%s • đã nhận lệnh" % names.get(action_id, String(action_id))
