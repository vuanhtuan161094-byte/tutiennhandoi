extends Control

signal detail_requested(detail_id: StringName)
signal equipment_action_requested(item_id: String)

const STANDING_HERO_SCRIPT := preload("res://scripts/character/standing_hero.gd")
const EQUIPMENT_SLOT_SCRIPT := preload("res://scripts/character/character_equipment_slot.gd")
const CHARACTER_DETAIL_SHEET_SCRIPT := preload("res://scripts/character/character_detail_sheet.gd")
const BACKGROUND_PATH := "res://art/approved/home/home_background.webp"

const GOLD_HI := Color("fff1bf")
const CYAN := Color("84e7ec")
const TEXT := Color("f4f0e5")
const MUTED := Color("aab9c3")
const DARK := Color(0.015, 0.035, 0.055, 0.86)

var _name_label: Label
var _realm_label: Label
var _root_label: Label
var _path_primary: Label
var _path_secondary: Label
var _stat_power: Label
var _stat_body: Label
var _stat_defense: Label
var _potential_button: Button
var _status: Label
var _hero
var _detail_sheet
var _slot_components: Dictionary = {}
var _vm: Dictionary = {}

func _ready() -> void:
	name = "CharacterScreen"
	mouse_filter = Control.MOUSE_FILTER_STOP
	_build()

func bind(vm: Dictionary) -> void:
	_vm = vm
	var identity: Dictionary = vm.get("identity", {})
	var path: Dictionary = vm.get("path", {})
	var stats: Dictionary = vm.get("stats", {})
	var potential: Dictionary = vm.get("potential", {})
	var equipment: Dictionary = vm.get("equipment", {})

	_name_label.text = str(identity.get("name", "Tu Sĩ"))
	_realm_label.text = "ĐỜI %d · %s" % [int(identity.get("life_number", 1)), str(identity.get("realm", "Phàm Nhân"))]
	_root_label.text = str(identity.get("root_name", "Phàm Căn"))
	_path_primary.text = str(path.get("primary", "Lối tu hiện tại"))
	_path_secondary.text = str(path.get("secondary", ""))
	_stat_power.text = _fmt_num(float(stats.get("power", 0)))
	_stat_body.text = _fmt_num(float(stats.get("body", 0)))
	_stat_defense.text = _fmt_num(float(stats.get("defense", 0)))

	var unspent := int(potential.get("unspent", 0))
	_potential_button.text = "TĂNG ĐIỂM" if unspent <= 0 else "TĂNG ĐIỂM · %d" % unspent
	_potential_button.add_theme_color_override("font_color", GOLD_HI if unspent > 0 else TEXT)

	var slots = equipment.get("slots", [])
	if typeof(slots) == TYPE_ARRAY:
		for slot_variant in slots:
			if typeof(slot_variant) == TYPE_DICTIONARY:
				_bind_slot(slot_variant)
	var equipped_count := int(equipment.get("equipped_count", 0))
	var slot_count := int(equipment.get("canonical_slot_count", 10))
	_status.text = "Chạm ô trang bị để mở Hành Trang" if equipped_count <= 0 else "%d/%d trang bị đang mặc" % [equipped_count, slot_count]
	if _detail_sheet != null and _detail_sheet.visible:
		_detail_sheet.refresh(vm)

func set_bridge_status(online: bool, message: String) -> void:
	if not visible:
		return
	if not online:
		_status.text = "Mất kết nối · " + message
		_status.add_theme_color_override("font_color", Color("ffb19d"))
	elif _vm.is_empty():
		_status.text = "Đang đồng bộ nhân vật…"
		_status.add_theme_color_override("font_color", CYAN)

func set_status_message(message: String) -> void:
	if message != "":
		_status.text = message

func _build() -> void:
	var bg := TextureRect.new()
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	if ResourceLoader.exists(BACKGROUND_PATH):
		bg.texture = ResourceLoader.load(BACKGROUND_PATH) as Texture2D
	add_child(bg)

	var veil := ColorRect.new()
	veil.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	veil.color = Color(0.006, 0.020, 0.032, 0.34)
	veil.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(veil)

	var header := Panel.new()
	_anchor(header, 10, 10, 380, 72)
	header.mouse_filter = Control.MOUSE_FILTER_IGNORE
	header.add_theme_stylebox_override("panel", _flat(Color(0.01, 0.03, 0.05, 0.72), 16, Color(0.70, 0.82, 0.86, 0.16), 1))
	add_child(header)

	_realm_label = Label.new()
	_realm_label.name = "CharacterRealm"
	_realm_label.text = "ĐỜI 1 · PHÀM NHÂN"
	_realm_label.add_theme_font_size_override("font_size", 10)
	_realm_label.add_theme_color_override("font_color", CYAN)
	_anchor(_realm_label, 14, 7, 268, 24)
	header.add_child(_realm_label)

	_name_label = Label.new()
	_name_label.name = "CharacterName"
	_name_label.text = "Tu Sĩ"
	_name_label.add_theme_font_size_override("font_size", 18)
	_name_label.add_theme_color_override("font_color", GOLD_HI)
	_anchor(_name_label, 14, 23, 268, 51)
	header.add_child(_name_label)

	_root_label = Label.new()
	_root_label.name = "CharacterRoot"
	_root_label.text = "Phàm Căn"
	_root_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_root_label.add_theme_font_size_override("font_size", 11)
	_root_label.add_theme_color_override("font_color", TEXT)
	_anchor(_root_label, 266, 20, 354, 46)
	header.add_child(_root_label)

	var stage := Control.new()
	stage.name = "CharacterStage"
	_anchor(stage, 0, 74, 390, 500)
	stage.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(stage)

	var glow := Panel.new()
	_anchor(glow, 92, 60, 298, 394)
	glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	glow.add_theme_stylebox_override("panel", _flat(Color(0.23, 0.68, 0.76, 0.035), 98, Color(0.95, 0.75, 0.31, 0.22), 2))
	stage.add_child(glow)

	_hero = STANDING_HERO_SCRIPT.new()
	_hero.name = "CharacterHero"
	_anchor(_hero, 78, 26, 312, 402)
	stage.add_child(_hero)

	var slot_specs := [
		["weapon", "Đạo Binh", 2, 30], ["head", "Đạo Quan", 2, 100], ["gloves", "Hộ Uyển", 2, 170], ["bracelet", "Linh Trạc", 2, 240], ["necklace", "Ngọc Bội", 2, 310],
		["robe", "Pháp Bào", 324, 30], ["belt", "Huyền Đái", 324, 100], ["boots", "Vân Ngoa", 324, 170], ["ring", "Đạo Giới", 324, 240], ["talisman", "Hộ Phù", 324, 310],
	]
	for spec in slot_specs:
		_add_slot(stage, str(spec[0]), str(spec[1]), float(spec[2]), float(spec[3]))

	var path_panel := Panel.new()
	_anchor(path_panel, 76, 378, 314, 426)
	path_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	path_panel.add_theme_stylebox_override("panel", _flat(Color(0.01, 0.03, 0.05, 0.84), 15, Color(0.91, 0.74, 0.34, 0.34), 1))
	stage.add_child(path_panel)

	var path_kicker := Label.new()
	path_kicker.text = "LỐI TU HIỆN TẠI"
	path_kicker.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	path_kicker.add_theme_font_size_override("font_size", 8)
	path_kicker.add_theme_color_override("font_color", MUTED)
	_anchor(path_kicker, 8, 4, 230, 16)
	path_panel.add_child(path_kicker)

	_path_primary = Label.new()
	_path_primary.name = "CharacterPathPrimary"
	_path_primary.text = "Lối tu hiện tại"
	_path_primary.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_path_primary.add_theme_font_size_override("font_size", 12)
	_path_primary.add_theme_color_override("font_color", GOLD_HI)
	_anchor(_path_primary, 8, 15, 230, 32)
	path_panel.add_child(_path_primary)

	_path_secondary = Label.new()
	_path_secondary.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_path_secondary.add_theme_font_size_override("font_size", 8)
	_path_secondary.add_theme_color_override("font_color", CYAN)
	_anchor(_path_secondary, 8, 31, 230, 45)
	path_panel.add_child(_path_secondary)

	var stats_panel := Panel.new()
	_anchor(stats_panel, 10, 506, 380, 568)
	stats_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	stats_panel.add_theme_stylebox_override("panel", _flat(DARK, 15, Color(0.43, 0.67, 0.75, 0.20), 1))
	add_child(stats_panel)
	_stat_power = _stat_cell(stats_panel, "CharacterStatPower", "Công Lực", 0)
	_stat_body = _stat_cell(stats_panel, "CharacterStatBody", "Thể Phách", 1)
	_stat_defense = _stat_cell(stats_panel, "CharacterStatDefense", "Phòng Ngự", 2)

	_potential_button = Button.new()
	_potential_button.name = "CharacterPotentialCTA"
	_potential_button.text = "TĂNG ĐIỂM"
	_potential_button.add_theme_font_size_override("font_size", 14)
	_potential_button.add_theme_color_override("font_color", TEXT)
	_potential_button.add_theme_stylebox_override("normal", _flat(Color(0.05, 0.08, 0.08, 0.90), 14, Color(0.94, 0.74, 0.29, 0.52), 1))
	_potential_button.add_theme_stylebox_override("hover", _flat(Color(0.10, 0.10, 0.07, 0.96), 14, Color(1.0, 0.84, 0.42, 0.76), 2))
	_anchor(_potential_button, 72, 576, 318, 620)
	_potential_button.pressed.connect(_emit_detail.bind(&"potential"))
	add_child(_potential_button)

	var actions := [["Trang Bị", &"equipment"], ["Thuộc Tính", &"stats"], ["Hồ Sơ", &"profile"]]
	for i in range(actions.size()):
		var action = actions[i]
		var button := Button.new()
		button.name = "CharacterAction_%s" % String(action[1])
		button.text = str(action[0])
		button.add_theme_font_size_override("font_size", 11)
		button.add_theme_color_override("font_color", TEXT)
		button.add_theme_stylebox_override("normal", _flat(Color(0.01, 0.04, 0.06, 0.84), 14, Color(0.38, 0.70, 0.78, 0.22), 1))
		button.add_theme_stylebox_override("hover", _flat(Color(0.04, 0.08, 0.10, 0.94), 14, Color(0.55, 0.88, 0.91, 0.42), 1))
		_anchor(button, 20 + i * 119, 630, 132 + i * 119, 680)
		button.pressed.connect(_emit_detail.bind(action[1]))
		add_child(button)

	_status = Label.new()
	_status.name = "CharacterStatus"
	_status.text = "Đang tải dữ liệu nhân vật…"
	_status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_status.add_theme_font_size_override("font_size", 9)
	_status.add_theme_color_override("font_color", MUTED)
	_anchor(_status, 16, 686, 374, 714)
	add_child(_status)

	_detail_sheet = CHARACTER_DETAIL_SHEET_SCRIPT.new()
	_detail_sheet.name = "CharacterDetailSheet"
	_detail_sheet.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_detail_sheet.equip_requested.connect(_on_detail_equip_requested)
	add_child(_detail_sheet)

func _add_slot(stage: Control, slot_id: String, slot_label: String, x: float, y: float) -> void:
	var slot = EQUIPMENT_SLOT_SCRIPT.new()
	slot.name = "CharacterSlot_%s" % slot_id
	slot.setup(slot_id, slot_label)
	_anchor(slot, x, y, x + 64, y + 66)
	slot.slot_pressed.connect(_on_slot_pressed)
	stage.add_child(slot)
	_slot_components[slot_id] = slot

func _bind_slot(slot: Dictionary) -> void:
	var slot_id := str(slot.get("id", ""))
	if not _slot_components.has(slot_id):
		return
	var component = _slot_components[slot_id]
	component.bind_slot(slot)

func _stat_cell(parent: Control, node_name: String, caption: String, index: int) -> Label:
	var left := 6.0 + index * 120.0
	var caption_label := Label.new()
	caption_label.text = caption
	caption_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	caption_label.add_theme_font_size_override("font_size", 8)
	caption_label.add_theme_color_override("font_color", MUTED)
	_anchor(caption_label, left, 8, left + 116, 23)
	parent.add_child(caption_label)

	var value := Label.new()
	value.name = node_name
	value.text = "0"
	value.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	value.add_theme_font_size_override("font_size", 17)
	value.add_theme_color_override("font_color", GOLD_HI if index == 0 else TEXT)
	_anchor(value, left, 23, left + 116, 55)
	parent.add_child(value)
	return value

func _on_slot_pressed(slot_id: String, data: Dictionary) -> void:
	if data.is_empty() or not bool(data.get("filled", false)):
		_status.text = "%s đang trống · mở Trang Bị để chọn" % str(data.get("label", slot_id))
		detail_requested.emit(&"equipment")
		return
	_status.text = "%s · %s · +%d" % [str(data.get("label", slot_id)), str(data.get("name", "Trang bị")), int(data.get("enhancement", 0))]

func _emit_detail(detail_id: StringName) -> void:
	detail_requested.emit(detail_id)

func open_detail(detail_id: StringName) -> void:
	if _detail_sheet == null or _vm.is_empty():
		return
	match detail_id:
		&"equipment":
			_detail_sheet.show_detail("equipment", _vm)
		&"stats":
			_detail_sheet.show_detail("stats", _vm)
		&"profile":
			_detail_sheet.show_detail("profile", _vm)
		_:
			set_status_message(String(detail_id))

func _on_detail_equip_requested(item_id: String) -> void:
	if item_id.is_empty():
		return
	_status.text = "Đang trang bị…"
	equipment_action_requested.emit(item_id)

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

func _anchor(control: Control, left: float, top: float, right: float, bottom: float) -> void:
	control.anchor_left = 0.0
	control.anchor_right = 0.0
	control.anchor_top = 0.0
	control.anchor_bottom = 0.0
	control.offset_left = left
	control.offset_top = top
	control.offset_right = right
	control.offset_bottom = bottom

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
