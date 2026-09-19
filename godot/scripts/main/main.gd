extends Control

const HOME_STAGE := preload("res://art/generated/home_stage_v1.svg")
const CULTIVATOR := preload("res://art/generated/home_cultivator_v1.svg")

const GOLD := Color("f5c96b")
const CYAN := Color("59d8ff")
const MINT := Color("68e6b5")
const TEXT := Color("edf7ff")
const MUTED := Color("9eb3c9")
const PANEL := Color(0.012, 0.045, 0.085, 0.82)

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
	veil.color = Color(0.0, 0.025, 0.055, 0.10)
	veil.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(veil)

	_build_brand()
	_build_profile()
	_build_stage()
	_build_cultivation()
	_build_actions()
	_build_nav()

func _build_brand() -> void:
	var title := _label("TU TIÊN NHÀN DỖI", 21, Color("fff1c9"))
	title.position = Vector2(14, 11)
	title.size = Vector2(215, 26)
	add_child(title)

	var sub := _label("ĐẠO TẠI TÂM • NHÂN MÃ VẠN MẠNH", 7, Color(0.75, 0.86, 0.94, 0.72))
	sub.position = Vector2(15, 37)
	sub.size = Vector2(205, 12)
	add_child(sub)

	var jade := _resource_pill("◈ 3.680", CYAN)
	jade.position = Vector2(235, 9)
	jade.size = Vector2(68, 38)
	add_child(jade)

	var coin := _resource_pill("◉ 250", GOLD)
	coin.position = Vector2(308, 9)
	coin.size = Vector2(68, 38)
	add_child(coin)

func _build_profile() -> void:
	var box := _glass_panel(Color(0.02, 0.075, 0.125, 0.77), 16, Color(0.28, 0.67, 0.88, 0.46))
	box.position = Vector2(14, 58)
	box.size = Vector2(362, 88)
	add_child(box)

	var avatar := PanelContainer.new()
	avatar.position = Vector2(10, 10)
	avatar.size = Vector2(62, 62)
	avatar.add_theme_stylebox_override("panel", _flat(Color(0.05, 0.13, 0.20, 0.95), 31, GOLD, 2))
	var avatar_label := _label("☯", 32, CYAN)
	avatar_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	avatar_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	avatar.add_child(avatar_label)
	box.add_child(avatar)

	var name := _label("Thiên Vô Danh", 17, TEXT)
	name.position = Vector2(82, 9)
	name.size = Vector2(200, 22)
	box.add_child(name)

	var lv := _label("Lv.58", 12, GOLD)
	lv.position = Vector2(300, 10)
	lv.size = Vector2(48, 20)
	lv.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	box.add_child(lv)

	var realm := _label("Luyện Khí Trung Kỳ", 12, CYAN)
	realm.position = Vector2(82, 30)
	realm.size = Vector2(180, 18)
	box.add_child(realm)

	var p := ProgressBar.new()
	p.position = Vector2(82, 51)
	p.size = Vector2(266, 9)
	p.max_value = 50000
	p.value = 18450
	p.show_percentage = false
	p.add_theme_stylebox_override("background", _flat(Color(0.01, 0.04, 0.075, 0.95), 4))
	p.add_theme_stylebox_override("fill", _flat(Color(0.17, 0.72, 0.94, 1.0), 4))
	box.add_child(p)

	var meta := _label("Tu Vi 18.450 / 50.000   •   Linh Căn: Ngũ Hành", 9, MUTED)
	meta.position = Vector2(82, 65)
	meta.size = Vector2(270, 15)
	box.add_child(meta)

func _build_stage() -> void:
	var hero := TextureRect.new()
	hero.texture = CULTIVATOR
	hero.position = Vector2(72, 151)
	hero.size = Vector2(246, 326)
	hero.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	hero.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	hero.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(hero)

	var left_note := _side_chip("✦\nNhiệm Vụ")
	left_note.position = Vector2(8, 175)
	left_note.size = Vector2(58, 58)
	add_child(left_note)

	var right_note := _side_chip("✧\nSự Kiện")
	right_note.position = Vector2(324, 175)
	right_note.size = Vector2(58, 58)
	add_child(right_note)

	var root_chip := _glass_panel(Color(0.015, 0.06, 0.095, 0.72), 12, Color(0.83, 0.69, 0.32, 0.44))
	root_chip.position = Vector2(276, 241)
	root_chip.size = Vector2(98, 50)
	var root_text := _label("Linh Căn\nNgũ Hành", 9, Color("f0dfaa"))
	root_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root_text.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	root_chip.add_child(root_text)
	add_child(root_chip)

	var aura_text := _label("✦      ✧      ✦", 13, Color(0.43, 0.88, 1.0, 0.55))
	aura_text.position = Vector2(110, 438)
	aura_text.size = Vector2(170, 18)
	aura_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(aura_text)

func _build_cultivation() -> void:
	var box := _glass_panel(Color(0.008, 0.038, 0.073, 0.90), 17, Color(0.28, 0.62, 0.80, 0.52))
	box.position = Vector2(40, 472)
	box.size = Vector2(310, 92)
	add_child(box)

	status_label = _label("Đang tu luyện...", 15, TEXT)
	status_label.position = Vector2(12, 9)
	status_label.size = Vector2(286, 20)
	status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(status_label)

	var rate := _label("Tu vi +120 / phút", 11, MINT)
	rate.position = Vector2(12, 30)
	rate.size = Vector2(286, 16)
	rate.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(rate)

	var p := ProgressBar.new()
	p.position = Vector2(14, 52)
	p.size = Vector2(282, 8)
	p.max_value = 100
	p.value = 63
	p.show_percentage = false
	p.add_theme_stylebox_override("background", _flat(Color(0.0, 0.025, 0.05, 0.94), 4))
	p.add_theme_stylebox_override("fill", _flat(Color(0.16, 0.78, 0.52, 1.0), 4))
	box.add_child(p)

	var time := _label("00:12:36", 10, MUTED)
	time.position = Vector2(12, 66)
	time.size = Vector2(286, 15)
	time.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(time)

func _build_actions() -> void:
	var row := HBoxContainer.new()
	row.position = Vector2(14, 575)
	row.size = Vector2(362, 72)
	row.add_theme_constant_override("separation", 6)
	add_child(row)

	for data in [
		["☯", "Tu Luyện", &"cultivate", GOLD],
		["✦", "Đột Phá", &"breakthrough", Color("bb77ff")],
		["♨", "Luyện Đan", &"alchemy", Color("56d9a3")],
		["◉", "Săn Ảo", &"hunt", CYAN],
	]:
		var b := Button.new()
		b.text = "%s\n%s" % [data[0], data[1]]
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.custom_minimum_size = Vector2(0, 72)
		b.add_theme_font_size_override("font_size", 10)
		b.add_theme_color_override("font_color", data[3])
		b.add_theme_color_override("font_hover_color", Color.WHITE)
		b.add_theme_stylebox_override("normal", _flat(Color(0.015, 0.055, 0.095, 0.92), 15, Color(0.18, 0.37, 0.50, 0.72), 1))
		b.add_theme_stylebox_override("hover", _flat(Color(0.035, 0.13, 0.20, 0.98), 15, data[3], 1))
		b.add_theme_stylebox_override("pressed", _flat(Color(0.025, 0.09, 0.15, 1.0), 15, GOLD, 2))
		b.pressed.connect(AppState.request_cultivation_action.bind(data[2]))
		row.add_child(b)

func _build_nav() -> void:
	var box := _glass_panel(Color(0.005, 0.028, 0.055, 0.97), 18, Color(0.23, 0.43, 0.58, 0.62))
	box.position = Vector2(14, 747)
	box.size = Vector2(362, 82)
	add_child(box)

	route_label = _label("Động Phủ", 9, GOLD)
	route_label.position = Vector2(12, 5)
	route_label.size = Vector2(338, 15)
	route_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(route_label)

	var row := HBoxContainer.new()
	row.position = Vector2(8, 24)
	row.size = Vector2(346, 50)
	row.add_theme_constant_override("separation", 1)
	box.add_child(row)

	for data in [
		["⌂", "Động Phủ", &"home"], ["♙", "Nhân Vật", &"character"],
		["†", "Pháp Bảo", &"artifacts"], ["♘", "Linh Thú", &"pets"],
		["△", "Bản Đồ", &"world"], ["門", "Tông Môn", &"faction"],
	]:
		var b := Button.new()
		b.text = "%s\n%s" % [data[0], data[1]]
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.custom_minimum_size = Vector2(0, 48)
		b.add_theme_font_size_override("font_size", 8)
		b.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
		b.add_theme_stylebox_override("hover", _flat(Color(0.05, 0.12, 0.18, 0.80), 10))
		b.add_theme_color_override("font_color", GOLD if data[2] == &"home" else MUTED)
		b.add_theme_color_override("font_hover_color", GOLD)
		b.pressed.connect(AppState.request_route.bind(data[2]))
		nav_buttons[data[2]] = b
		row.add_child(b)

func _resource_pill(value: String, accent: Color) -> Control:
	var box := _glass_panel(Color(0.012, 0.05, 0.085, 0.90), 11, Color(accent, 0.30))
	var l := _label(value, 10, accent)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	box.add_child(l)
	return box

func _side_chip(value: String) -> Control:
	var box := _glass_panel(Color(0.012, 0.05, 0.085, 0.76), 29, Color(0.52, 0.72, 0.82, 0.36))
	var l := _label(value, 8, Color(0.90, 0.95, 1.0, 0.88))
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
	s.content_margin_left = 8
	s.content_margin_right = 8
	s.content_margin_top = 6
	s.content_margin_bottom = 6
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
		var button: Button = nav_buttons[id]
		button.add_theme_color_override("font_color", GOLD if id == route_id else MUTED)

func _on_action(action_id: StringName) -> void:
	var names := {
		&"cultivate": "Tu Luyện", &"breakthrough": "Đột Phá",
		&"alchemy": "Luyện Đan", &"hunt": "Săn Ảo"
	}
	status_label.text = "%s • đã nhận lệnh" % names.get(action_id, String(action_id))
