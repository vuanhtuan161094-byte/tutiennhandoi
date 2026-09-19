extends Control

const GOLD := Color("f6c667")
const CYAN := Color("55d9ff")
const TEXT := Color("eaf5ff")
const MUTED := Color("98abc0")
const PANEL := Color(0.025, 0.075, 0.13, 0.90)

var status_label: Label
var route_label: Label

func _ready() -> void:
	_build_ui()
	AppState.route_changed.connect(_on_route_changed)
	AppState.cultivation_action_requested.connect(_on_action)

func _build_ui() -> void:
	var bg := ColorRect.new()
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.color = Color("07172b")
	add_child(bg)

	var safe := MarginContainer.new()
	safe.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side in ["left", "right", "top", "bottom"]:
		safe.add_theme_constant_override("margin_%s" % side, 16)
	add_child(safe)

	var page := VBoxContainer.new()
	page.add_theme_constant_override("separation", 10)
	safe.add_child(page)
	page.add_child(_top_bar())
	page.add_child(_hero_card())

	var stage := CenterContainer.new()
	stage.custom_minimum_size = Vector2(0, 260)
	var aura := Label.new()
	aura.text = "✦\n\n   TU TIÊN   \n\n✦"
	aura.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	aura.add_theme_font_size_override("font_size", 24)
	aura.add_theme_color_override("font_color", Color(0.35, 0.84, 1.0, 0.55))
	stage.add_child(aura)
	page.add_child(stage)

	page.add_child(_cultivation_card())
	page.add_child(_action_row())
	var flex := Control.new()
	flex.size_flags_vertical = Control.SIZE_EXPAND_FILL
	page.add_child(flex)
	page.add_child(_nav())

func _top_bar() -> Control:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	var title := _label("TU TIÊN NHÀN DỖI", 22, GOLD)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(title)
	row.add_child(_label("◈ 3.680", 12, CYAN))
	row.add_child(_label("◉ 250", 12, GOLD))
	return row

func _hero_card() -> Control:
	var box := _panel()
	var col := VBoxContainer.new()
	col.add_child(_label("Thiên Vô Danh        Lv.58", 18, TEXT))
	col.add_child(_label("Luyện Khí Trung Kỳ", 14, CYAN))
	var p := ProgressBar.new()
	p.max_value = 50000
	p.value = 18450
	p.show_percentage = false
	p.custom_minimum_size = Vector2(0, 10)
	col.add_child(p)
	col.add_child(_label("Tu Vi 18.450 / 50.000  •  Linh Căn: Ngũ Hành", 11, MUTED))
	box.add_child(col)
	return box

func _cultivation_card() -> Control:
	var box := _panel()
	var col := VBoxContainer.new()
	status_label = _label("Đang tu luyện...", 16, TEXT)
	status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(status_label)
	var rate := _label("Tu vi +120 / phút   •   00:12:36", 12, Color("68e6b5"))
	rate.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(rate)
	box.add_child(col)
	return box

func _action_row() -> Control:
	var row := HBoxContainer.new()
	for data in [["Tu Luyện", &"cultivate"], ["Đột Phá", &"breakthrough"], ["Luyện Đan", &"alchemy"], ["Săn Ảo", &"hunt"]]:
		var b := Button.new()
		b.text = data[0]
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.custom_minimum_size = Vector2(0, 58)
		b.pressed.connect(AppState.request_cultivation_action.bind(data[1]))
		row.add_child(b)
	return row

func _nav() -> Control:
	var box := _panel()
	var col := VBoxContainer.new()
	route_label = _label("Động Phủ", 11, GOLD)
	route_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(route_label)
	var row := HBoxContainer.new()
	for data in [["Động Phủ", &"home"], ["Nhân Vật", &"character"], ["Pháp Bảo", &"artifacts"], ["Linh Thú", &"pets"], ["Bản Đồ", &"world"], ["Tông Môn", &"faction"]]:
		var b := Button.new()
		b.text = data[0]
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.add_theme_font_size_override("font_size", 9)
		b.pressed.connect(AppState.request_route.bind(data[1]))
		row.add_child(b)
	col.add_child(row)
	box.add_child(col)
	return box

func _panel() -> PanelContainer:
	var p := PanelContainer.new()
	var s := StyleBoxFlat.new()
	s.bg_color = PANEL
	s.corner_radius_top_left = 14
	s.corner_radius_top_right = 14
	s.corner_radius_bottom_left = 14
	s.corner_radius_bottom_right = 14
	s.content_margin_left = 12
	s.content_margin_right = 12
	s.content_margin_top = 10
	s.content_margin_bottom = 10
	p.add_theme_stylebox_override("panel", s)
	return p

func _label(value: String, size: int, color: Color) -> Label:
	var l := Label.new()
	l.text = value
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	return l

func _on_route_changed(route_id: StringName) -> void:
	route_label.text = "%s • route OK" % String(route_id)

func _on_action(action_id: StringName) -> void:
	status_label.text = "%s • input OK" % String(action_id)
