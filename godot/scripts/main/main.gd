extends Control

const HOME_BG := preload("res://art/approved/home_bg_ink_mountain.webp")
const HERO_IDLE := preload("res://art/approved/hero_idle.webp")
const HERO_PORTRAIT := preload("res://art/approved/hero_portrait.webp")
const BACKEND_BRIDGE_SCRIPT := preload("res://scripts/core/backend_bridge.gd")
const HOME_VIEW_MODEL := preload("res://scripts/models/home_view_model.gd")

const GOLD := Color("e3bf70")
const GOLD_HI := Color("f3d99a")
const CYAN := Color("8cc7ef")
const MINT := Color("8fd0b7")
const TEXT := Color("f5f0e4")
const MUTED := Color("aebdbb")
const INK := Color("061621")
const PANEL := Color(0.018, 0.064, 0.090, 0.86)

var backend_bridge
var _home: Dictionary = {}
var _vm: Dictionary = {}
var _last_home_generated_at := 0
var retreat_modal: Control

var bridge_label: Label
var stone_label: Label
var cp_label: Label
var life_label: Label
var realm_label: Label
var name_label: Label
var root_label: Label
var injury_label: Label
var lifespan_label: Label
var progress_bar: ProgressBar
var progress_text: Label
var rate_label: Label
var eta_label: Label
var status_label: Label
var primary_button: Button
var retreat_button: Button
var route_label: Label
var nav_buttons: Dictionary = {}

func _ready() -> void:
	_build_ui()
	backend_bridge = BACKEND_BRIDGE_SCRIPT.new()
	backend_bridge.name = "BackendBridge"
	backend_bridge.home_updated.connect(_on_home_updated)
	backend_bridge.bridge_status_changed.connect(_on_bridge_status_changed)
	backend_bridge.action_failed.connect(_on_action_failed)
	backend_bridge.action_completed.connect(_on_action_completed)
	add_child(backend_bridge)
	AppState.route_changed.connect(_on_route_changed)

func _build_ui() -> void:
	_build_world()
	_build_top_hud()
	_build_identity()
	_build_hero()
	_build_progress()
	_build_primary_action()
	_build_quick_actions()
	_build_nav()

func _build_world() -> void:
	var bg := TextureRect.new()
	bg.texture = HOME_BG
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg)

	var top_vignette := ColorRect.new()
	top_vignette.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	top_vignette.color = Color(0.01, 0.035, 0.05, 0.18)
	top_vignette.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(top_vignette)

	var bottom_fade := ColorRect.new()
	_place(bottom_fade, Vector2(0, 650), Vector2(390, 194))
	bottom_fade.color = Color(0.015, 0.055, 0.075, 0.83)
	bottom_fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bottom_fade)

func _build_top_hud() -> void:
	var title := _readable_label("TU TIÊN NHÀN DỖI", 20, GOLD_HI)
	_place(title, Vector2(14, 10), Vector2(215, 24))
	add_child(title)

	bridge_label = _readable_label("ĐANG NỐI CANONICAL RUNTIME…", 7, MUTED)
	_place(bridge_label, Vector2(15, 34), Vector2(208, 13))
	add_child(bridge_label)

	var stone := _resource_pill("LINH THẠCH", CYAN)
	_place(stone, Vector2(233, 8), Vector2(70, 40))
	add_child(stone)
	stone_label = stone.find_child("Value", true, false) as Label

	var cp := _resource_pill("LUÂN HỒI", GOLD)
	_place(cp, Vector2(307, 8), Vector2(69, 40))
	add_child(cp)
	cp_label = cp.find_child("Value", true, false) as Label

func _build_identity() -> void:
	life_label = _readable_label("ĐỜI —", 8, GOLD)
	_place(life_label, Vector2(16, 59), Vector2(185, 14))
	add_child(life_label)

	realm_label = _readable_label("Đang đọc cảnh giới", 28, Color("fff2d6"))
	_place(realm_label, Vector2(15, 73), Vector2(250, 37))
	add_child(realm_label)

	name_label = _readable_label("Đang tải nhân vật…", 11, TEXT)
	_place(name_label, Vector2(17, 109), Vector2(220, 17))
	add_child(name_label)

	root_label = _readable_label("Linh Căn · —", 9, Color("c7d3ce"))
	_place(root_label, Vector2(17, 126), Vector2(220, 15))
	add_child(root_label)

	var vitals := _panel(Color(0.015, 0.050, 0.070, 0.58), 12, Color(0.86, 0.72, 0.40, 0.18))
	_place(vitals, Vector2(274, 61), Vector2(101, 72))
	add_child(vitals)

	var vm := MarginContainer.new()
	vm.add_theme_constant_override("margin_left", 9)
	vm.add_theme_constant_override("margin_right", 9)
	vm.add_theme_constant_override("margin_top", 7)
	vm.add_theme_constant_override("margin_bottom", 7)
	vitals.add_child(vm)

	var vcol := VBoxContainer.new()
	vcol.add_theme_constant_override("separation", 4)
	vm.add_child(vcol)

	var injury_title := _label("THƯƠNG THẾ", 6, MUTED)
	vcol.add_child(injury_title)
	injury_label = _label("—", 11, TEXT)
	vcol.add_child(injury_label)
	var life_title := _label("THỌ NGUYÊN", 6, MUTED)
	vcol.add_child(life_title)
	lifespan_label = _label("—", 10, TEXT)
	vcol.add_child(lifespan_label)

func _build_hero() -> void:
	var outer_aura := Panel.new()
	_place(outer_aura, Vector2(64, 155), Vector2(262, 262))
	outer_aura.mouse_filter = Control.MOUSE_FILTER_IGNORE
	outer_aura.add_theme_stylebox_override("panel", _flat(Color.TRANSPARENT, 131, Color(0.88, 0.73, 0.36, 0.16), 1))
	add_child(outer_aura)

	var inner_aura := Panel.new()
	_place(inner_aura, Vector2(86, 177), Vector2(218, 218))
	inner_aura.mouse_filter = Control.MOUSE_FILTER_IGNORE
	inner_aura.add_theme_stylebox_override("panel", _flat(Color(0.20, 0.65, 0.75, 0.025), 109, Color(0.47, 0.78, 0.84, 0.18), 1))
	add_child(inner_aura)

	var hero := TextureRect.new()
	hero.texture = HERO_IDLE
	_place(hero, Vector2(18, 123), Vector2(354, 355))
	hero.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	hero.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	hero.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(hero)

	var spark := _readable_label("✦        ·        ✧        ·        ✦", 11, Color(0.72, 0.90, 0.94, 0.55))
	_place(spark, Vector2(94, 425), Vector2(202, 18))
	spark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(spark)

func _build_progress() -> void:
	var box := _panel(Color(0.025, 0.095, 0.125, 0.91), 18, Color(0.90, 0.75, 0.42, 0.34))
	_place(box, Vector2(24, 447), Vector2(342, 93))
	add_child(box)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 15)
	margin.add_theme_constant_override("margin_right", 15)
	margin.add_theme_constant_override("margin_top", 10)
	margin.add_theme_constant_override("margin_bottom", 9)
	box.add_child(margin)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 4)
	margin.add_child(col)

	var head := HBoxContainer.new()
	col.add_child(head)
	var title := _label("TU VI", 9, GOLD)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(title)
	progress_text = _label("— / —", 11, TEXT)
	head.add_child(progress_text)

	progress_bar = ProgressBar.new()
	progress_bar.max_value = 1
	progress_bar.value = 0
	progress_bar.show_percentage = false
	progress_bar.custom_minimum_size = Vector2(0, 7)
	progress_bar.add_theme_stylebox_override("background", _flat(Color(0.0, 0.025, 0.04, 0.86), 4))
	progress_bar.add_theme_stylebox_override("fill", _flat(Color("8cc7ef"), 4))
	col.add_child(progress_bar)

	var foot := HBoxContainer.new()
	col.add_child(foot)
	rate_label = _label("+— / 15s", 9, CYAN)
	rate_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	foot.add_child(rate_label)
	eta_label = _label("Còn —", 9, MUTED)
	foot.add_child(eta_label)

	status_label = _label("Đang đồng bộ Tu Luyện…", 8, Color(0.86, 0.88, 0.82, 0.90))
	status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(status_label)

func _build_primary_action() -> void:
	primary_button = Button.new()
	primary_button.text = "☯   TĂNG TỐC TU LUYỆN   ›"
	_place(primary_button, Vector2(24, 550), Vector2(342, 58))
	primary_button.add_theme_font_size_override("font_size", 14)
	primary_button.add_theme_color_override("font_color", Color("fff0cf"))
	primary_button.add_theme_color_override("font_hover_color", Color.WHITE)
	primary_button.add_theme_stylebox_override("normal", _flat(Color(0.24, 0.19, 0.08, 0.90), 16, Color(0.95, 0.81, 0.49, 0.62), 1))
	primary_button.add_theme_stylebox_override("hover", _flat(Color(0.32, 0.25, 0.10, 0.95), 16, GOLD_HI, 1))
	primary_button.add_theme_stylebox_override("pressed", _flat(Color(0.16, 0.16, 0.09, 1.0), 16, GOLD_HI, 2))
	primary_button.pressed.connect(_on_primary_pressed)
	add_child(primary_button)

func _build_quick_actions() -> void:
	var row := HBoxContainer.new()
	_place(row, Vector2(26, 620), Vector2(338, 82))
	row.add_theme_constant_override("separation", 4)
	add_child(row)

	retreat_button = _round_action("◉", "Bế Quan", GOLD)
	retreat_button.pressed.connect(_open_retreat_modal)
	row.add_child(retreat_button)

	var pill := _round_action("◆", "Tu Vi Đan", Color("bd8cff"))
	pill.pressed.connect(func(): backend_bridge.perform_action("useCultivationPill"))
	row.add_child(pill)

	var root := _round_action("◇", "Linh Căn", MINT)
	root.pressed.connect(AppState.request_route.bind(&"roots"))
	row.add_child(root)

	var fight := _round_action("⚔", "Chiến Đấu", CYAN)
	fight.pressed.connect(AppState.request_route.bind(&"dungeons"))
	row.add_child(fight)

func _build_nav() -> void:
	var nav := _panel(Color(0.008, 0.032, 0.045, 0.95), 18, Color(0.90, 0.74, 0.40, 0.20))
	_place(nav, Vector2(14, 750), Vector2(362, 80))
	add_child(nav)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 7)
	margin.add_theme_constant_override("margin_right", 7)
	margin.add_theme_constant_override("margin_top", 5)
	margin.add_theme_constant_override("margin_bottom", 5)
	nav.add_child(margin)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 1)
	margin.add_child(col)

	route_label = _label("Động Phủ", 8, GOLD)
	route_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(route_label)

	var row := HBoxContainer.new()
	row.size_flags_vertical = Control.SIZE_EXPAND_FILL
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
		button.add_theme_stylebox_override("hover", _flat(Color(0.06, 0.12, 0.14, 0.72), 9))
		button.add_theme_color_override("font_color", GOLD if data[2] == &"home" else MUTED)
		button.add_theme_color_override("font_hover_color", GOLD_HI)
		button.pressed.connect(AppState.request_route.bind(data[2]))
		nav_buttons[data[2]] = button
		row.add_child(button)

func _on_home_updated(home: Dictionary) -> void:
	var generated_at := int(home.get("generatedAtUnixMs", 0))
	if generated_at > 0 and generated_at < _last_home_generated_at:
		return

	var vm := HOME_VIEW_MODEL.build(home)
	if vm.get("ok", false) != true:
		_on_action_failed(str(vm.get("error", "Home DTO không hợp lệ")))
		return

	_last_home_generated_at = maxi(_last_home_generated_at, generated_at)
	_home = home
	_vm = vm

	var identity: Dictionary = vm.get("identity", {})
	var progression: Dictionary = vm.get("progression", {})
	var resources: Dictionary = vm.get("resources", {})
	var retreat: Dictionary = progression.get("retreat", {})

	life_label.text = "ĐỜI %d" % int(identity.get("life_number", 1))
	realm_label.text = str(identity.get("realm", "Phàm Nhân"))
	name_label.text = str(identity.get("name", "Tu Sĩ"))
	root_label.text = "Linh Căn · %s" % str(identity.get("root_name", "Phàm Căn"))

	injury_label.text = "%.0f%%" % float(progression.get("injury_pct", 0))
	lifespan_label.text = "%.1f năm" % float(progression.get("remaining_life_years", 0))

	var tu_vi := float(progression.get("tu_vi", 0))
	var required := maxf(1.0, float(progression.get("required_tu_vi", 1)))
	progress_bar.max_value = required
	progress_bar.value = tu_vi
	progress_text.text = "%s / %s" % [_fmt_num(tu_vi), _fmt_num(required)]
	rate_label.text = "+%s Tu Vi / 15s" % _fmt_num(float(progression.get("rate_per_15s", 0)))

	var ready := bool(progression.get("ready", false))
	var transition := str(progression.get("transition", "auto"))
	var eta := float(progression.get("eta_seconds", 0))
	eta_label.text = _advance_text(progression) if ready else "Còn %s" % _duration(eta)

	if ready and transition == "tribulation":
		primary_button.text = "⚡   DẪN THIÊN KIẾP   ›"
	elif ready and transition == "ascend":
		primary_button.text = "✦   THĂNG CẢNH   ›"
	else:
		primary_button.text = "☯   TĂNG TỐC TU LUYỆN   ›"

	var retreat_enabled := bool(retreat.get("enabled", false))
	retreat_button.disabled = not retreat_enabled
	retreat_button.text = "◉\nBế Quan" if retreat_enabled else "◉\nBế Quan Khóa"
	retreat_button.tooltip_text = "" if retreat_enabled else "Bế Quan mở từ Luyện Khí."

	stone_label.text = _fmt_num(float(resources.get("spirit_stone", 0)))
	cp_label.text = _fmt_num(float(resources.get("reincarnation_cp", 0)))

	if status_label.text.begins_with("Đang đồng bộ"):
		status_label.text = "Tự Tu đang vận hành"

func _on_primary_pressed() -> void:
	var progression: Dictionary = _vm.get("progression", {})
	var transition := str(progression.get("transition", "auto"))
	if bool(progression.get("ready", false)) and transition == "tribulation":
		backend_bridge.perform_action("tribulationV140")
	elif bool(progression.get("ready", false)) and transition == "ascend":
		backend_bridge.perform_action("ascendRealmV140")
	else:
		var retreat: Dictionary = progression.get("retreat", {})
		if bool(retreat.get("enabled", false)):
			_open_retreat_modal()
		else:
			status_label.text = "Tự Tu đang tiến triển; Bế Quan mở từ Luyện Khí"

func _open_retreat_modal() -> void:
	var progression: Dictionary = _vm.get("progression", {})
	var retreat: Dictionary = progression.get("retreat", {})
	if not bool(retreat.get("enabled", false)):
		status_label.text = "Bế Quan mở từ Luyện Khí"
		return

	_close_retreat_modal()
	retreat_modal = Control.new()
	retreat_modal.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	retreat_modal.mouse_filter = Control.MOUSE_FILTER_STOP
	retreat_modal.z_index = 50
	add_child(retreat_modal)

	var dim := ColorRect.new()
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	dim.color = Color(0.0, 0.02, 0.03, 0.72)
	dim.mouse_filter = Control.MOUSE_FILTER_STOP
	dim.gui_input.connect(func(event):
		if event is InputEventMouseButton and event.pressed:
			_close_retreat_modal()
	)
	retreat_modal.add_child(dim)

	var card := _panel(Color(0.008, 0.030, 0.045, 0.985), 18, Color(0.90, 0.74, 0.40, 0.46))
	_place(card, Vector2(44, 267), Vector2(302, 238))
	retreat_modal.add_child(card)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 16)
	margin.add_theme_constant_override("margin_right", 16)
	margin.add_theme_constant_override("margin_top", 15)
	margin.add_theme_constant_override("margin_bottom", 14)
	card.add_child(margin)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 9)
	margin.add_child(col)

	var title := _label("BẾ QUAN", 18, GOLD_HI)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(title)

	var bank := float(retreat.get("bank_hours", 0))
	var cap := float(retreat.get("cap_hours", 9))
	var summary := _label("%.2f / %.0f giờ tích lũy" % [bank, cap], 12, TEXT)
	summary.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(summary)

	var detail := _label("Mỗi ngày +%.0fh  •  3h ≈ %.2f%% yêu cầu cảnh giới" % [
		float(retreat.get("daily_hours", 3)),
		float(retreat.get("reward_pct_3h", 0))
	], 8, MUTED)
	detail.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	detail.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	col.add_child(detail)

	var choices := HBoxContainer.new()
	choices.add_theme_constant_override("separation", 5)
	col.add_child(choices)
	for hour in [1, 3, 6, 9]:
		if float(hour) > cap:
			continue
		var button := Button.new()
		button.text = "%dh" % hour
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.custom_minimum_size = Vector2(0, 44)
		button.disabled = bank <= 0.0
		button.add_theme_color_override("font_color", GOLD if hour == 3 else TEXT)
		button.pressed.connect(_on_retreat_hour_selected.bind(hour))
		choices.add_child(button)

	var close := Button.new()
	close.text = "Đóng"
	close.custom_minimum_size = Vector2(0, 38)
	close.pressed.connect(_close_retreat_modal)
	col.add_child(close)

func _close_retreat_modal() -> void:
	if retreat_modal != null and is_instance_valid(retreat_modal):
		retreat_modal.queue_free()
	retreat_modal = null

func _on_retreat_hour_selected(hours: int) -> void:
	_close_retreat_modal()
	status_label.text = "Đang Bế Quan %dh…" % hours
	backend_bridge.perform_action("retreatV140", {"hours": hours})

func _on_action_completed(action_id: String, result: Dictionary) -> void:
	if action_id != "retreatV140":
		return
	var used := float(result.get("hoursUsed", 0))
	var gained := float(result.get("gained", 0))
	var bank_after := float(result.get("bankHoursAfter", -1))
	if gained > 0:
		status_label.text = "Bế Quan %.2fh  •  +%s Tu Vi" % [used, _fmt_num(gained)]
	elif bank_after == 0:
		status_label.text = "Không còn giờ Bế Quan tích lũy"
	else:
		status_label.text = "Bế Quan chưa tạo thêm Tu Vi"

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

func _advance_text(progression: Dictionary) -> String:
	var transition := str(progression.get("transition", "auto"))
	var next_realm := str(progression.get("next_realm", ""))
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
	var box := _panel(Color(0.012, 0.046, 0.064, 0.88), 11, Color(accent.r, accent.g, accent.b, 0.28))
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_top", 4)
	margin.add_theme_constant_override("margin_bottom", 4)
	box.add_child(margin)
	var col := VBoxContainer.new()
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	margin.add_child(col)
	var title := _label(title_text, 5, MUTED)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(title)
	var value := _label("—", 9, accent)
	value.name = "Value"
	value.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(value)
	return box

func _round_action(glyph: String, caption: String, accent: Color) -> Button:
	var button := Button.new()
	button.text = "%s\n%s" % [glyph, caption]
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.custom_minimum_size = Vector2(0, 78)
	button.add_theme_font_size_override("font_size", 9)
	button.add_theme_color_override("font_color", accent)
	button.add_theme_color_override("font_disabled_color", Color(0.52, 0.56, 0.56, 0.65))
	button.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	button.add_theme_stylebox_override("hover", _flat(Color(0.06, 0.13, 0.14, 0.55), 18, Color(accent.r, accent.g, accent.b, 0.25), 1))
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

func _readable_label(value: String, size: int, color: Color) -> Label:
	var label := _label(value, size, color)
	label.add_theme_constant_override("outline_size", 4)
	label.add_theme_color_override("font_outline_color", Color(0.0, 0.02, 0.03, 0.88))
	return label

func _place(control: Control, pos: Vector2, size_value: Vector2) -> void:
	control.position = pos
	control.size = size_value
