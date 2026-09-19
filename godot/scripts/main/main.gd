extends Control

const HOME_STAGE := preload("res://art/generated/home_stage_v1.svg")
const CULTIVATOR := preload("res://art/generated/home_cultivator_v1.svg")
const BACKEND_BRIDGE_SCRIPT := preload("res://scripts/core/backend_bridge.gd")

const GOLD := Color("f5c96b")
const CYAN := Color("59d8ff")
const MINT := Color("68e6b5")
const TEXT := Color("edf7ff")
const MUTED := Color("9eb3c9")
const PANEL := Color(0.012, 0.045, 0.085, 0.82)

var name_label: Label
var life_label: Label
var realm_label: Label
var root_label: Label
var progress_bar: ProgressBar
var mini_progress_bar: ProgressBar
var progress_text: Label
var vitality_label: Label
var stone_label: Label
var cp_label: Label
var status_label: Label
var rate_label: Label
var eta_label: Label
var bridge_label: Label
var advance_button: Button
var route_label: Label
var nav_buttons: Dictionary = {}
var _home: Dictionary = {}
var backend_bridge

func _ready() -> void:
	_build_ui()
	backend_bridge = BACKEND_BRIDGE_SCRIPT.new()
	backend_bridge.name = "BackendBridge"
	backend_bridge.home_updated.connect(_on_home_updated)
	backend_bridge.bridge_status_changed.connect(_on_bridge_status_changed)
	backend_bridge.action_failed.connect(_on_action_failed)
	add_child(backend_bridge)
	AppState.route_changed.connect(_on_route_changed)

func _build_ui() -> void:
	_build_background()
	_build_brand()
	_build_profile()
	_build_stage()
	_build_cultivation()
	_build_actions()
	_build_nav()

func _build_background() -> void:
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

func _build_brand() -> void:
	var title := _label("TU TIÊN NHÀN DỖI", 21, Color("fff1c9"))
	_place(title, Vector2(14, 10), Vector2(215, 25))
	add_child(title)

	bridge_label = _label("Đang nối canonical runtime…", 7, Color(0.72, 0.84, 0.92, 0.78))
	_place(bridge_label, Vector2(15, 35), Vector2(205, 13))
	add_child(bridge_label)

	var jade := _resource_pill("Linh Thạch", CYAN)
	_place(jade, Vector2(233, 9), Vector2(70, 39))
	stone_label = jade.find_child("Value", true, false) as Label
	add_child(jade)

	var cp := _resource_pill("Luân Hồi", GOLD)
	_place(cp, Vector2(307, 9), Vector2(69, 39))
	cp_label = cp.find_child("Value", true, false) as Label
	add_child(cp)

func _build_profile() -> void:
	var box := _panel(Color(0.02, 0.075, 0.125, 0.78), 16, Color(0.28, 0.67, 0.88, 0.46))
	_place(box, Vector2(14, 57), Vector2(362, 98))
	add_child(box)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 10)
	margin.add_theme_constant_override("margin_right", 10)
	margin.add_theme_constant_override("margin_top", 9)
	margin.add_theme_constant_override("margin_bottom", 9)
	box.add_child(margin)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	margin.add_child(row)

	var avatar := PanelContainer.new()
	avatar.custom_minimum_size = Vector2(60, 60)
	avatar.add_theme_stylebox_override("panel", _flat(Color(0.045, 0.13, 0.20, 0.97), 30, GOLD, 2))
	var avatar_label := _label("☯", 30, CYAN)
	avatar_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	avatar_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	avatar.add_child(avatar_label)
	row.add_child(avatar)

	var data := VBoxContainer.new()
	data.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	data.add_theme_constant_override("separation", 1)
	row.add_child(data)

	var title_row := HBoxContainer.new()
	name_label = _label("Đang tải nhân vật…", 16, TEXT)
	name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_row.add_child(name_label)
	life_label = _label("Đời —", 10, GOLD)
	title_row.add_child(life_label)
	data.add_child(title_row)

	realm_label = _label("Đang đọc cảnh giới", 12, CYAN)
	data.add_child(realm_label)

	progress_bar = ProgressBar.new()
	progress_bar.max_value = 1
	progress_bar.value = 0
	progress_bar.show_percentage = false
	progress_bar.custom_minimum_size = Vector2(0, 8)
	progress_bar.add_theme_stylebox_override("background", _flat(Color(0.01, 0.04, 0.075, 0.95), 4))
	progress_bar.add_theme_stylebox_override("fill", _flat(Color(0.17, 0.72, 0.94, 1.0), 4))
	data.add_child(progress_bar)

	progress_text = _label("Tu Vi — / —", 9, MUTED)
	data.add_child(progress_text)

	vitality_label = _label("Thương Thế —  •  Thọ Nguyên —", 8, Color(0.74, 0.84, 0.91, 0.82))
	data.add_child(vitality_label)

func _build_stage() -> void:
	var hero := TextureRect.new()
	hero.texture = CULTIVATOR
	_place(hero, Vector2(65, 145), Vector2(260, 345))
	hero.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	hero.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	hero.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(hero)

	var left_chip := _side_chip("✦", "Nhiệm Vụ")
	_place(left_chip, Vector2(8, 180), Vector2(58, 58))
	add_child(left_chip)

	var right_chip := _side_chip("✧", "Sự Kiện")
	_place(right_chip, Vector2(324, 180), Vector2(58, 58))
	add_child(right_chip)

	var root_box := _panel(Color(0.015, 0.06, 0.095, 0.78), 12, Color(0.83, 0.69, 0.32, 0.44))
	_place(root_box, Vector2(278, 250), Vector2(96, 52))
	add_child(root_box)
	var root_margin := MarginContainer.new()
	root_margin.add_theme_constant_override("margin_left", 5)
	root_margin.add_theme_constant_override("margin_right", 5)
	root_margin.add_theme_constant_override("margin_top", 6)
	root_margin.add_theme_constant_override("margin_bottom", 6)
	root_box.add_child(root_margin)
	root_label = _label("Linh Căn\n—", 9, Color("f0dfaa"))
	root_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	root_margin.add_child(root_label)

	var aura := _label("✦      ✧      ✦", 13, Color(0.43, 0.88, 1.0, 0.58))
	_place(aura, Vector2(110, 452), Vector2(170, 18))
	aura.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(aura)

func _build_cultivation() -> void:
	var box := _panel(Color(0.008, 0.038, 0.073, 0.91), 17, Color(0.28, 0.62, 0.80, 0.52))
	_place(box, Vector2(40, 478), Vector2(310, 98))
	add_child(box)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 14)
	margin.add_theme_constant_override("margin_right", 14)
	margin.add_theme_constant_override("margin_top", 9)
	margin.add_theme_constant_override("margin_bottom", 8)
	box.add_child(margin)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 3)
	margin.add_child(col)

	status_label = _label("Đang đồng bộ Tu Luyện…", 14, TEXT)
	status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(status_label)

	rate_label = _label("+— Tu Vi / 15s", 10, MINT)
	rate_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(rate_label)

	mini_progress_bar = ProgressBar.new()
	mini_progress_bar.name = "CultivationMiniProgress"
	mini_progress_bar.max_value = 100
	mini_progress_bar.value = 0
	mini_progress_bar.show_percentage = false
	mini_progress_bar.custom_minimum_size = Vector2(0, 7)
	mini_progress_bar.add_theme_stylebox_override("background", _flat(Color(0.0, 0.025, 0.05, 0.94), 4))
	mini_progress_bar.add_theme_stylebox_override("fill", _flat(Color(0.16, 0.78, 0.52, 1.0), 4))
	col.add_child(mini_progress_bar)

	eta_label = _label("Còn —", 9, MUTED)
	eta_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(eta_label)

func _build_actions() -> void:
	var row := HBoxContainer.new()
	_place(row, Vector2(14, 587), Vector2(362, 76))
	row.add_theme_constant_override("separation", 6)
	add_child(row)

	var retreat := _action_button("◉", "Bế Quan", GOLD)
	retreat.pressed.connect(func(): backend_bridge.perform_action("retreatV140", {"hours": 1}))
	row.add_child(retreat)

	advance_button = _action_button("✦", "Tu Vi Đan", Color("bb77ff"))
	advance_button.pressed.connect(_on_advance_pressed)
	row.add_child(advance_button)

	var root := _action_button("◇", "Linh Căn", Color("56d9a3"))
	root.pressed.connect(AppState.request_route.bind(&"roots"))
	row.add_child(root)

	var fight := _action_button("⚔", "Chiến Đấu", CYAN)
	fight.pressed.connect(AppState.request_route.bind(&"dungeons"))
	row.add_child(fight)

func _build_nav() -> void:
	var box := _panel(Color(0.005, 0.028, 0.055, 0.97), 18, Color(0.23, 0.43, 0.58, 0.62))
	_place(box, Vector2(14, 748), Vector2(362, 82))
	add_child(box)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 8)
	margin.add_theme_constant_override("margin_right", 8)
	margin.add_theme_constant_override("margin_top", 5)
	margin.add_theme_constant_override("margin_bottom", 5)
	box.add_child(margin)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 2)
	margin.add_child(col)

	route_label = _label("Động Phủ", 9, GOLD)
	route_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(route_label)

	var row := HBoxContainer.new()
	row.size_flags_vertical = Control.SIZE_EXPAND_FILL
	row.add_theme_constant_override("separation", 1)
	col.add_child(row)

	for data in [
		["⌂", "Động Phủ", &"home"], ["♙", "Nhân Vật", &"character"],
		["†", "Pháp Bảo", &"artifacts"], ["♘", "Linh Thú", &"pets"],
		["△", "Bản Đồ", &"world"], ["門", "Tông Môn", &"faction"],
	]:
		var button := Button.new()
		button.text = "%s\n%s" % [data[0], data[1]]
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.add_theme_font_size_override("font_size", 8)
		button.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
		button.add_theme_stylebox_override("hover", _flat(Color(0.05, 0.12, 0.18, 0.80), 10))
		button.add_theme_color_override("font_color", GOLD if data[2] == &"home" else MUTED)
		button.add_theme_color_override("font_hover_color", GOLD)
		button.pressed.connect(AppState.request_route.bind(data[2]))
		nav_buttons[data[2]] = button
		row.add_child(button)

func _on_home_updated(home: Dictionary) -> void:
	_home = home
	var character: Dictionary = home.get("character", {})
	var life: Dictionary = home.get("life", {})
	var cultivation: Dictionary = home.get("cultivation", {})
	var spiritual_root: Dictionary = home.get("spiritualRoot", {})
	var resources: Dictionary = home.get("resources", {})

	name_label.text = str(character.get("name", "Tu Sĩ"))
	life_label.text = "Đời %d" % int(life.get("lifeNumber", 1))
	realm_label.text = str(life.get("realm", "Phàm Nhân"))
	root_label.text = "Linh Căn\n%s" % str(spiritual_root.get("name", "Phàm Căn"))

	var tu_vi := float(cultivation.get("tuVi", 0))
	var required := maxf(1.0, float(cultivation.get("requiredTuVi", 1)))
	progress_bar.max_value = required
	progress_bar.value = tu_vi
	progress_text.text = "Tu Vi %s / %s" % [_fmt_num(tu_vi), _fmt_num(required)]

	var injury := float(cultivation.get("injury", 0))
	var remaining_life := maxf(0.0, float(life.get("lifespanYears", 0)) - float(life.get("ageYears", 0)))
	vitality_label.text = "Thương Thế %.0f%%  •  Thọ Nguyên %.1f năm" % [injury, remaining_life]

	var rate := float(cultivation.get("finalTuViPer15s", 0))
	rate_label.text = "+%s Tu Vi / 15s" % _fmt_num(rate)

	mini_progress_bar.value = float(cultivation.get("progressPct", tu_vi / required * 100.0))

	var ready := bool(cultivation.get("ready", false))
	var transition := str(cultivation.get("transition", "auto"))
	var eta := float(cultivation.get("etaRealSeconds", 0))
	status_label.text = "Đã viên mãn" if ready else "Đang tự tu…"
	eta_label.text = _advance_text(cultivation) if ready else "Còn %s" % _duration(eta)

	if ready and transition == "tribulation":
		advance_button.text = "⚡\nThiên Kiếp"
	elif ready and transition == "ascend":
		advance_button.text = "✦\nThăng Cảnh"
	else:
		advance_button.text = "◆\nTu Vi Đan"

	stone_label.text = _fmt_num(float(resources.get("spiritStone", 0)))
	cp_label.text = _fmt_num(float(resources.get("reincarnationCp", 0)))

func _on_advance_pressed() -> void:
	var cultivation: Dictionary = _home.get("cultivation", {})
	var ready := bool(cultivation.get("ready", false))
	var transition := str(cultivation.get("transition", "auto"))
	if ready and transition == "tribulation":
		backend_bridge.perform_action("tribulationV140")
	elif ready and transition == "ascend":
		backend_bridge.perform_action("ascendRealmV140")
	else:
		backend_bridge.perform_action("useCultivationPill")

func _on_bridge_status_changed(online: bool, message: String) -> void:
	bridge_label.text = "CANONICAL V140 • ONLINE" if online else "CANONICAL V140 • %s" % message.to_upper()
	bridge_label.add_theme_color_override("font_color", MINT if online else MUTED)

func _on_action_failed(message: String) -> void:
	status_label.text = message

func _on_route_changed(route_id: StringName) -> void:
	var names := {
		&"home": "Động Phủ", &"character": "Nhân Vật", &"artifacts": "Pháp Bảo",
		&"pets": "Linh Thú", &"world": "Bản Đồ", &"faction": "Tông Môn",
		&"roots": "Linh Căn", &"dungeons": "Chiến Đấu"
	}
	route_label.text = str(names.get(route_id, String(route_id)))
	for id in nav_buttons:
		var button: Button = nav_buttons[id]
		button.add_theme_color_override("font_color", GOLD if id == route_id else MUTED)

func _advance_text(cultivation: Dictionary) -> String:
	var transition := str(cultivation.get("transition", "auto"))
	var next_realm := str(cultivation.get("nextRealm", ""))
	if transition == "tribulation":
		return "Thiên Kiếp → %s" % next_realm
	if transition == "ascend":
		return "Có thể Thăng Cảnh → %s" % next_realm
	return "Đã viên mãn"

func _duration(seconds: float) -> String:
	var total := maxi(0, int(ceil(seconds)))
	if total < 60:
		return "%d giây" % total
	if total < 3600:
		return "%d phút %d giây" % [floori(total / 60.0), total % 60]
	return "%d giờ %d phút" % [floori(total / 3600.0), floori((total % 3600) / 60.0)]

func _fmt_num(value: float) -> String:
	var raw := str(int(round(value)))
	var sign_text := ""
	if raw.begins_with("-"):
		sign_text = "-"
		raw = raw.substr(1)
	var out := ""
	var count := 0
	for i in range(raw.length() - 1, -1, -1):
		if count > 0 and count % 3 == 0:
			out = "." + out
		out = raw.substr(i, 1) + out
		count += 1
	return sign_text + out

func _resource_pill(title_text: String, accent: Color) -> PanelContainer:
	var box := _panel(Color(0.012, 0.05, 0.085, 0.91), 11, Color(accent.r, accent.g, accent.b, 0.32))
	var col := VBoxContainer.new()
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	var title := _label(title_text, 6, Color(0.75, 0.84, 0.91, 0.85))
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(title)
	var value := _label("—", 9, accent)
	value.name = "Value"
	value.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(value)
	box.add_child(col)
	return box

func _side_chip(glyph: String, caption: String) -> PanelContainer:
	var box := _panel(Color(0.012, 0.05, 0.085, 0.78), 29, Color(0.52, 0.72, 0.82, 0.36))
	var col := VBoxContainer.new()
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	var icon := _label(glyph, 12, Color(0.88, 0.95, 1.0, 0.92))
	icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(icon)
	var text := _label(caption, 7, Color(0.88, 0.95, 1.0, 0.88))
	text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(text)
	box.add_child(col)
	return box

func _action_button(glyph: String, caption: String, accent: Color) -> Button:
	var button := Button.new()
	button.text = "%s\n%s" % [glyph, caption]
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.custom_minimum_size = Vector2(0, 76)
	button.add_theme_font_size_override("font_size", 10)
	button.add_theme_color_override("font_color", accent)
	button.add_theme_color_override("font_hover_color", Color.WHITE)
	button.add_theme_stylebox_override("normal", _flat(Color(0.015, 0.055, 0.095, 0.93), 15, Color(0.18, 0.37, 0.50, 0.72), 1))
	button.add_theme_stylebox_override("hover", _flat(Color(0.035, 0.13, 0.20, 0.98), 15, accent, 1))
	button.add_theme_stylebox_override("pressed", _flat(Color(0.025, 0.09, 0.15, 1.0), 15, GOLD, 2))
	return button

func _panel(fill: Color, radius: int, border: Color) -> PanelContainer:
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _flat(fill, radius, border, 1))
	return panel

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

func _label(value: String, size: int, color: Color) -> Label:
	var label := Label.new()
	label.text = value
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", color)
	return label

func _place(control: Control, pos: Vector2, size_value: Vector2) -> void:
	control.position = pos
	control.size = size_value
