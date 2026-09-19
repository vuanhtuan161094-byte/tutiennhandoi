extends Control

signal identity_pressed
signal cultivation_pressed
signal retreat_pressed
signal route_requested(route_id: StringName)
signal primary_action_requested(action_id: String)

const ICON_CHARACTER := preload("res://art/icons/character.svg")
const ICON_ROOT := preload("res://art/icons/root.svg")
const ICON_COMBAT := preload("res://art/icons/combat.svg")
const ICON_RETREAT := preload("res://art/icons/retreat.svg")

const GOLD := Color("e3bf70")
const GOLD_HI := Color("f5ddb0")
const CYAN := Color("8fd7f5")
const MINT := Color("8bd2b5")
const TEXT := Color("f6f1e7")
const MUTED := Color("aebbb8")

var bridge_label: Label
var stone_label: Label
var cp_label: Label
var life_label: Label
var realm_label: Label
var progress_bar: ProgressBar
var progress_text: Label
var rate_label: Label
var eta_label: Label
var status_label: Label
var primary_button: Button
var retreat_button: Button
var quick_actions: HBoxContainer

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_PASS
	_build_top()
	_build_identity()
	_build_progress()
	_build_primary()
	_build_quick_actions()

func bind(vm: Dictionary) -> void:
	var identity: Dictionary = vm.get("identity", {})
	var progression: Dictionary = vm.get("progression", {})
	var resources: Dictionary = vm.get("resources", {})
	var retreat: Dictionary = progression.get("retreat", {})

	life_label.text = "ĐỜI %d" % int(identity.get("life_number", 1))
	realm_label.text = str(identity.get("realm", "Phàm Nhân"))

	var tu_vi := float(progression.get("tu_vi", 0))
	var required := maxf(1.0, float(progression.get("required_tu_vi", 1)))
	progress_bar.max_value = required
	progress_bar.value = tu_vi
	progress_text.text = "%s / %s" % [_fmt_num(tu_vi), _fmt_num(required)]
	rate_label.text = "+%s / 15s" % _fmt_num(float(progression.get("rate_per_15s", 0)))

	var ready := bool(progression.get("ready", false))
	var transition := str(progression.get("transition", "auto"))
	eta_label.text = _advance_text(progression) if ready else "Còn %s" % _duration(float(progression.get("eta_seconds", 0)))

	primary_button.visible = ready and (transition == "tribulation" or transition == "ascend")
	if ready and transition == "tribulation":
		primary_button.text = "DẪN THIÊN KIẾP"
		primary_button.set_meta("action_id", "tribulationV140")
	elif ready and transition == "ascend":
		primary_button.text = "THĂNG CẢNH"
		primary_button.set_meta("action_id", "ascendRealmV140")

	quick_actions.position.y = 625.0 if primary_button.visible else 579.0

	var retreat_enabled := bool(retreat.get("enabled", false))
	retreat_button.visible = retreat_enabled
	retreat_button.disabled = not retreat_enabled

	stone_label.text = _fmt_num(float(resources.get("spirit_stone", 0)))
	cp_label.text = _fmt_num(float(resources.get("reincarnation_cp", 0)))

	if status_label.text.begins_with("Đang"):
		status_label.text = ""

func set_bridge_status(online: bool, message: String) -> void:
	bridge_label.text = "CANONICAL V140 • ONLINE" if online else "CANONICAL V140 • %s" % message.to_upper()
	bridge_label.add_theme_color_override("font_color", MINT if online else MUTED)

func set_status_message(message: String) -> void:
	status_label.text = message

func _build_top() -> void:
	var title := _readable_label("TU TIÊN NHÀN DỖI", 20, GOLD_HI)
	_place(title, Vector2(14, 10), Vector2(215, 25))
	add_child(title)

	bridge_label = _readable_label("ĐANG NỐI CANONICAL RUNTIME…", 7, MUTED)
	_place(bridge_label, Vector2(15, 34), Vector2(210, 13))
	add_child(bridge_label)

	var stone := _resource("LINH THẠCH", CYAN)
	_place(stone, Vector2(239, 9), Vector2(65, 38))
	add_child(stone)
	stone_label = stone.find_child("Value", true, false) as Label

	var cp := _resource("LUÂN HỒI", GOLD)
	_place(cp, Vector2(309, 9), Vector2(66, 38))
	add_child(cp)
	cp_label = cp.find_child("Value", true, false) as Label

func _build_identity() -> void:
	life_label = _readable_label("ĐỜI —", 8, GOLD)
	_place(life_label, Vector2(16, 61), Vector2(120, 14))
	add_child(life_label)

	realm_label = _readable_label("Đang đọc cảnh giới", 27, Color("fff4db"))
	_place(realm_label, Vector2(15, 76), Vector2(305, 38))
	add_child(realm_label)

	var hint := _readable_label("Chạm để xem hồ sơ", 8, Color(0.80, 0.84, 0.82, 0.85))
	_place(hint, Vector2(17, 112), Vector2(190, 15))
	add_child(hint)

	var tap := Button.new()
	_place(tap, Vector2(9, 55), Vector2(312, 80))
	tap.text = ""
	tap.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	tap.add_theme_stylebox_override("hover", _flat(Color(0.95, 0.82, 0.50, 0.035), 12))
	tap.pressed.connect(func(): identity_pressed.emit())
	add_child(tap)

func _build_progress() -> void:
	var box := PanelContainer.new()
	_place(box, Vector2(26, 474), Vector2(338, 72))
	box.add_theme_stylebox_override("panel", _flat(Color(0.015, 0.055, 0.075, 0.76), 16, Color(0.83, 0.72, 0.45, 0.22), 1))
	add_child(box)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 13)
	margin.add_theme_constant_override("margin_right", 13)
	margin.add_theme_constant_override("margin_top", 8)
	margin.add_theme_constant_override("margin_bottom", 7)
	box.add_child(margin)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 3)
	margin.add_child(col)

	var row := HBoxContainer.new()
	col.add_child(row)
	var title := _label("TU VI", 8, GOLD)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(title)
	progress_text = _label("— / —", 10, TEXT)
	row.add_child(progress_text)

	progress_bar = ProgressBar.new()
	progress_bar.max_value = 1
	progress_bar.value = 0
	progress_bar.show_percentage = false
	progress_bar.custom_minimum_size = Vector2(0, 6)
	progress_bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	progress_bar.add_theme_stylebox_override("background", _flat(Color(0.0, 0.025, 0.04, 0.82), 3))
	progress_bar.add_theme_stylebox_override("fill", _flat(CYAN, 3))
	col.add_child(progress_bar)

	var foot := HBoxContainer.new()
	col.add_child(foot)
	rate_label = _label("+— / 15s", 8, CYAN)
	rate_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	foot.add_child(rate_label)
	eta_label = _label("Còn —", 8, MUTED)
	foot.add_child(eta_label)

	status_label = _label("", 7, Color(0.86, 0.88, 0.82, 0.9))
	status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(status_label)

	var tap := Button.new()
	_place(tap, Vector2(26, 474), Vector2(338, 72))
	tap.text = ""
	tap.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	tap.add_theme_stylebox_override("hover", _flat(Color(0.75, 0.92, 1.0, 0.03), 16))
	tap.pressed.connect(func(): cultivation_pressed.emit())
	add_child(tap)

func _build_primary() -> void:
	primary_button = Button.new()
	primary_button.visible = false
	_place(primary_button, Vector2(31, 557), Vector2(328, 48))
	primary_button.add_theme_font_size_override("font_size", 13)
	primary_button.add_theme_color_override("font_color", Color("fff0cf"))
	primary_button.add_theme_stylebox_override("normal", _flat(Color(0.24, 0.19, 0.08, 0.90), 15, Color(0.95, 0.81, 0.49, 0.60), 1))
	primary_button.add_theme_stylebox_override("hover", _flat(Color(0.32, 0.25, 0.10, 0.95), 15, GOLD_HI, 1))
	primary_button.pressed.connect(func():
		primary_action_requested.emit(str(primary_button.get_meta("action_id", "")))
	)
	add_child(primary_button)

func _build_quick_actions() -> void:
	quick_actions = HBoxContainer.new()
	_place(quick_actions, Vector2(31, 579), Vector2(328, 61))
	quick_actions.add_theme_constant_override("separation", 7)
	add_child(quick_actions)

	retreat_button = _quick_button(ICON_RETREAT, "Bế Quan", GOLD)
	retreat_button.pressed.connect(func(): retreat_pressed.emit())
	quick_actions.add_child(retreat_button)

	var character := _quick_button(ICON_CHARACTER, "Nhân Vật", Color("eadbb8"))
	character.pressed.connect(func(): identity_pressed.emit())
	quick_actions.add_child(character)

	var root := _quick_button(ICON_ROOT, "Linh Căn", MINT)
	root.pressed.connect(func(): route_requested.emit(&"roots"))
	quick_actions.add_child(root)

	var combat := _quick_button(ICON_COMBAT, "Chiến Đấu", CYAN)
	combat.pressed.connect(func(): route_requested.emit(&"dungeons"))
	quick_actions.add_child(combat)

func _resource(caption: String, accent: Color) -> PanelContainer:
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _flat(Color(0.008, 0.032, 0.045, 0.78), 11, Color(accent.r, accent.g, accent.b, 0.25), 1))
	var col := VBoxContainer.new()
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	var title := _label(caption, 5, MUTED)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(title)
	var value := _label("—", 9, accent)
	value.name = "Value"
	value.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(value)
	panel.add_child(col)
	return panel

func _quick_button(icon: Texture2D, caption: String, accent: Color) -> Button:
	var button := Button.new()
	button.icon = icon
	button.text = caption
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.custom_minimum_size = Vector2(0, 56)
	button.add_theme_font_size_override("font_size", 8)
	button.add_theme_color_override("font_color", accent)
	button.add_theme_color_override("icon_normal_color", accent)
	button.add_theme_color_override("icon_hover_color", Color.WHITE)
	button.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	button.add_theme_stylebox_override("hover", _flat(Color(0.03, 0.09, 0.11, 0.55), 13, Color(accent.r, accent.g, accent.b, 0.20), 1))
	return button

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
	var out := ""
	var count := 0
	for i in range(raw.length() - 1, -1, -1):
		if count > 0 and count % 3 == 0:
			out = "." + out
		out = raw.substr(i, 1) + out
		count += 1
	return out

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

func _place(control: Control, pos: Vector2, size_value: Vector2) -> void:
	control.position = pos
	control.size = size_value
