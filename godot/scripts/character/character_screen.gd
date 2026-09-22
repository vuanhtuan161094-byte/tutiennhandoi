extends Control

signal detail_requested(detail_id: StringName)
signal equipment_action_requested(item_id: String)
signal equipment_detail_requested(item_id: String)
signal equipment_enhance_requested(item_id: String, use_protection: bool)
signal equipment_system_action_requested(action_id: String, payload: Dictionary)
signal profile_action_requested(action_id: String, payload: Dictionary)
signal potential_action_requested(stat_id: String, points: int)

const STANDING_HERO_SCRIPT := preload("res://scripts/character/standing_hero.gd")
const CHARACTER_ANIMATION_REGISTRY := preload("res://scripts/character/character_animation_registry.gd")
const EQUIPMENT_SLOT_SCRIPT := preload("res://scripts/character/character_equipment_slot.gd")
const CHARACTER_DETAIL_SHEET_SCRIPT := preload("res://scripts/character/character_detail_sheet.gd")
const EQUIPMENT_INVENTORY_SCREEN_SCRIPT := preload("res://scripts/character/equipment_inventory_screen.gd")
const BACKGROUND_PATH := "res://art/approved/home/home_background.webp"

const GOLD_HI := Color("fff1bf")
const CYAN := Color("84e7ec")
const TEXT := Color("f4f0e5")
const MUTED := Color("aab9c3")
const DARK := Color(0.015, 0.035, 0.055, 0.86)
const EQUIPMENT_SLOT_LEFT_X := 10.0
const EQUIPMENT_SLOT_RIGHT_X := 316.0
const MOTION_STILL: StringName = &"still"
const MOTION_ANIMATED: StringName = &"animated"
const MOTION_HIDDEN: StringName = &"hidden"

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
var _hero_glow: Panel
var _visual_time := 0.0
var _detail_sheet
var _equipment_inventory
var _slot_components: Dictionary = {}
var _vm: Dictionary = {}

var _presentation_trigger: Button
var _presentation_panel: PanelContainer
var _presentation_preset_list: VBoxContainer
var _presentation_still_button: Button
var _presentation_animated_button: Button
var _presentation_hidden_button: Button
var character_motion_mode: StringName = MOTION_STILL
var character_animation_preset_id: StringName = &"character_idle_01"

func _ready() -> void:
	name = "CharacterScreen"
	mouse_filter = Control.MOUSE_FILTER_STOP
	_build()
	set_process(true)

func _process(delta: float) -> void:
	if not visible:
		return
	_visual_time += delta
	if is_instance_valid(_hero_glow):
		var pulse := 0.92 + sin(_visual_time * 0.72) * 0.05
		_hero_glow.scale = Vector2.ONE * pulse
		_hero_glow.modulate.a = 0.72 + sin(_visual_time * 0.72 + 0.8) * 0.10

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
	_status.text = "Chạm ô trang bị để mở Kho Đồ" if equipped_count <= 0 else "%d/%d trang bị đang mặc" % [equipped_count, slot_count]
	if _detail_sheet != null and _detail_sheet.visible:
		_detail_sheet.refresh(vm)
	if _equipment_inventory != null and _equipment_inventory.visible:
		_equipment_inventory.refresh(vm)

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
		if _equipment_inventory != null and _equipment_inventory.visible:
			_equipment_inventory.set_status_message(message)

func set_presentation_active(active: bool) -> void:
	if is_instance_valid(_hero):
		if _hero.has_method("set_animation_preset"):
			_hero.set_animation_preset(character_animation_preset_id)
		if _hero.has_method("set_motion_mode"):
			_hero.set_motion_mode(character_motion_mode)
		if _hero.has_method("set_presentation_active"):
			_hero.set_presentation_active(active)
	if not active:
		close_character_presentation_panel()

func get_character_animation_preset() -> StringName:
	return character_animation_preset_id

func get_character_motion_mode() -> StringName:
	return character_motion_mode

func set_character_motion_mode(mode: StringName) -> void:
	character_motion_mode = _normalize_character_motion_mode(mode)
	if is_instance_valid(_hero) and _hero.has_method("set_motion_mode"):
		_hero.set_motion_mode(character_motion_mode)
	_refresh_character_presentation_controls()

func set_character_animation_preset(preset_id: StringName) -> void:
	if CHARACTER_ANIMATION_REGISTRY.preset(preset_id).is_empty():
		return
	character_animation_preset_id = preset_id
	if is_instance_valid(_hero) and _hero.has_method("set_animation_preset"):
		_hero.set_animation_preset(preset_id)
	_refresh_character_presentation_controls()
	_refresh_character_preset_list()

static func _normalize_character_motion_mode(mode: StringName) -> StringName:
	if mode == MOTION_ANIMATED:
		return MOTION_ANIMATED
	if mode == MOTION_HIDDEN:
		return MOTION_HIDDEN
	return MOTION_STILL

func close_character_presentation_panel() -> void:
	if _presentation_panel != null:
		_presentation_panel.visible = false

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
	header.z_index = 20
	_anchor(header, 10, 430, 380, 492)
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
	stage.z_index = 0
	_anchor(stage, 0, 0, 390, 526)
	stage.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(stage)

	_hero_glow = Panel.new()
	_hero_glow.z_index = -8
	_anchor(_hero_glow, 62, 8, 328, 506)
	_hero_glow.pivot_offset = Vector2(133, 249)
	_hero_glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_hero_glow.add_theme_stylebox_override("panel", _flat(Color(0.23, 0.68, 0.76, 0.035), 98, Color(0.95, 0.75, 0.31, 0.22), 2))
	stage.add_child(_hero_glow)

	var hero_ground := Panel.new()
	hero_ground.name = "CharacterGroundShadow"
	hero_ground.z_index = -7
	_anchor(hero_ground, 96, 468, 294, 506)
	hero_ground.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hero_ground.add_theme_stylebox_override(
		"panel",
		_flat(Color(0.005, 0.025, 0.032, 0.54), 48, Color(0.58, 0.88, 0.86, 0.16), 1)
	)
	stage.add_child(hero_ground)

	_hero = STANDING_HERO_SCRIPT.new()
	_hero.name = "CharacterHero"
	_hero.z_index = -6
	# Character animation is the stage backdrop. UI remains interactive above it.
	_anchor(_hero, 42, -6, 348, 512)
	stage.add_child(_hero)

	var slot_specs := [
		["weapon", "Đạo Binh", EQUIPMENT_SLOT_LEFT_X, 154], ["head", "Đạo Quan", EQUIPMENT_SLOT_LEFT_X, 220], ["gloves", "Hộ Uyển", EQUIPMENT_SLOT_LEFT_X, 286], ["bracelet", "Linh Trạc", EQUIPMENT_SLOT_LEFT_X, 352], ["necklace", "Ngọc Bội", EQUIPMENT_SLOT_LEFT_X, 418],
		["robe", "Pháp Bào", EQUIPMENT_SLOT_RIGHT_X, 154], ["belt", "Huyền Đái", EQUIPMENT_SLOT_RIGHT_X, 220], ["boots", "Vân Ngoa", EQUIPMENT_SLOT_RIGHT_X, 286], ["ring", "Đạo Giới", EQUIPMENT_SLOT_RIGHT_X, 352], ["talisman", "Hộ Phù", EQUIPMENT_SLOT_RIGHT_X, 418],
	]
	for spec in slot_specs:
		_add_slot(stage, str(spec[0]), str(spec[1]), float(spec[2]), float(spec[3]))

	var path_panel := Panel.new()
	path_panel.z_index = 12
	_anchor(path_panel, 76, 374, 314, 422)
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
	stats_panel.z_index = 20
	_anchor(stats_panel, 10, 500, 380, 558)
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
	_potential_button.add_theme_stylebox_override("pressed", _flat(Color(0.16, 0.12, 0.045, 0.98), 14, GOLD_HI, 2))
	_potential_button.focus_mode = Control.FOCUS_NONE
	_anchor(_potential_button, 72, 566, 318, 608)
	_potential_button.pressed.connect(_emit_detail.bind(&"potential"))
	add_child(_potential_button)

	var actions := [["Kho Đồ", &"equipment"], ["Thuộc Tính", &"stats"], ["Hồ Sơ", &"profile"]]
	for i in range(actions.size()):
		var action = actions[i]
		var button := Button.new()
		button.name = "CharacterAction_%s" % String(action[1])
		button.text = str(action[0])
		button.add_theme_font_size_override("font_size", 11)
		button.add_theme_color_override("font_color", TEXT)
		button.add_theme_stylebox_override("normal", _flat(Color(0.01, 0.04, 0.06, 0.84), 14, Color(0.38, 0.70, 0.78, 0.22), 1))
		button.add_theme_stylebox_override("hover", _flat(Color(0.04, 0.08, 0.10, 0.94), 14, Color(0.55, 0.88, 0.91, 0.42), 1))
		button.add_theme_stylebox_override("pressed", _flat(Color(0.06, 0.11, 0.13, 0.98), 14, CYAN, 2))
		button.focus_mode = Control.FOCUS_NONE
		_anchor(button, 20 + i * 119, 616, 132 + i * 119, 664)
		button.pressed.connect(_emit_detail.bind(action[1]))
		add_child(button)

	_status = Label.new()
	_status.name = "CharacterStatus"
	_status.text = "Đang tải dữ liệu nhân vật…"
	_status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_status.add_theme_font_size_override("font_size", 9)
	_status.add_theme_color_override("font_color", MUTED)
	_anchor(_status, 16, 670, 374, 700)
	add_child(_status)

	_build_character_presentation_controls()

	_detail_sheet = CHARACTER_DETAIL_SHEET_SCRIPT.new()
	_detail_sheet.name = "CharacterDetailSheet"
	_detail_sheet.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_detail_sheet.profile_action_requested.connect(_on_detail_profile_action_requested)
	_detail_sheet.potential_action_requested.connect(_on_detail_potential_action_requested)
	add_child(_detail_sheet)

	_equipment_inventory = EQUIPMENT_INVENTORY_SCREEN_SCRIPT.new()
	_equipment_inventory.name = "EquipmentInventoryScreen"
	_equipment_inventory.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_equipment_inventory.equip_requested.connect(_on_detail_equip_requested)
	_equipment_inventory.equipment_detail_requested.connect(_on_detail_equipment_detail_requested)
	_equipment_inventory.enhance_requested.connect(_on_detail_enhance_requested)
	_equipment_inventory.equipment_command_requested.connect(_on_inventory_command_requested)
	add_child(_equipment_inventory)

func _build_character_presentation_controls() -> void:
	var trigger_shell := PanelContainer.new()
	trigger_shell.name = "CharacterPresentationTrigger"
	trigger_shell.z_index = 70
	_anchor(trigger_shell, 252, 82, 382, 118)
	trigger_shell.add_theme_stylebox_override(
		"panel",
		_flat(Color(0.004, 0.022, 0.035, 0.90), 16, Color(0.58, 0.78, 0.82, 0.30), 1)
	)
	add_child(trigger_shell)

	_presentation_trigger = Button.new()
	_presentation_trigger.name = "CharacterPresentationButton"
	_presentation_trigger.text = "Hiển thị · Tĩnh"
	_presentation_trigger.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_presentation_trigger.focus_mode = Control.FOCUS_NONE
	_presentation_trigger.add_theme_font_size_override("font_size", 9)
	_presentation_trigger.add_theme_color_override("font_color", TEXT)
	_presentation_trigger.add_theme_color_override("font_hover_color", GOLD_HI)
	_presentation_trigger.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	_presentation_trigger.add_theme_stylebox_override("hover", _flat(Color(0.25, 0.70, 0.82, 0.09), 16, Color(0.45, 0.85, 0.94, 0.40), 1))
	_presentation_trigger.add_theme_stylebox_override("pressed", _flat(Color(0.30, 0.76, 0.92, 0.14), 16, CYAN, 1))
	_presentation_trigger.pressed.connect(_toggle_character_presentation_panel)
	trigger_shell.add_child(_presentation_trigger)

	_presentation_panel = PanelContainer.new()
	_presentation_panel.name = "CharacterPresentationPanel"
	_presentation_panel.visible = false
	_presentation_panel.z_index = 90
	_anchor(_presentation_panel, 42, 124, 348, 410)
	_presentation_panel.add_theme_stylebox_override(
		"panel",
		_flat(Color(0.004, 0.020, 0.033, 0.97), 22, Color(0.65, 0.82, 0.88, 0.42), 1)
	)
	add_child(_presentation_panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_top", 10)
	margin.add_theme_constant_override("margin_bottom", 10)
	_presentation_panel.add_child(margin)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 7)
	margin.add_child(col)

	var header_row := HBoxContainer.new()
	col.add_child(header_row)
	var title := Label.new()
	title.text = "HIỂN THỊ NHÂN VẬT"
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title.add_theme_font_size_override("font_size", 11)
	title.add_theme_color_override("font_color", GOLD_HI)
	header_row.add_child(title)
	var close_button := Button.new()
	close_button.name = "CharacterPresentationClose"
	close_button.text = "×"
	close_button.custom_minimum_size = Vector2(32, 28)
	close_button.focus_mode = Control.FOCUS_NONE
	close_button.add_theme_font_size_override("font_size", 16)
	close_button.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	close_button.pressed.connect(close_character_presentation_panel)
	header_row.add_child(close_button)

	var display_label := Label.new()
	display_label.text = "CHẾ ĐỘ HIỂN THỊ"
	display_label.add_theme_font_size_override("font_size", 8)
	display_label.add_theme_color_override("font_color", MUTED)
	col.add_child(display_label)

	var motion_row := HBoxContainer.new()
	motion_row.add_theme_constant_override("separation", 4)
	col.add_child(motion_row)
	_presentation_still_button = _character_presentation_button("Tĩnh", "CharacterStillButton")
	_presentation_still_button.button_down.connect(func(): set_character_motion_mode(MOTION_STILL))
	motion_row.add_child(_presentation_still_button)
	_presentation_animated_button = _character_presentation_button("Động", "CharacterAnimatedButton")
	_presentation_animated_button.button_down.connect(func(): set_character_motion_mode(MOTION_ANIMATED))
	motion_row.add_child(_presentation_animated_button)
	_presentation_hidden_button = _character_presentation_button("Ẩn", "CharacterHiddenButton")
	_presentation_hidden_button.button_down.connect(func(): set_character_motion_mode(MOTION_HIDDEN))
	motion_row.add_child(_presentation_hidden_button)

	var preset_hint := Label.new()
	preset_hint.text = "ANIMATION · chọn một kiểu"
	preset_hint.add_theme_font_size_override("font_size", 8)
	preset_hint.add_theme_color_override("font_color", MUTED)
	col.add_child(preset_hint)

	var scroll := ScrollContainer.new()
	scroll.name = "CharacterAnimationPresetScroll"
	scroll.custom_minimum_size = Vector2(0, 150)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	col.add_child(scroll)

	_presentation_preset_list = VBoxContainer.new()
	_presentation_preset_list.name = "CharacterAnimationPresetList"
	_presentation_preset_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_presentation_preset_list.add_theme_constant_override("separation", 3)
	scroll.add_child(_presentation_preset_list)

	_refresh_character_presentation_controls()
	_refresh_character_preset_list()

func _toggle_character_presentation_panel() -> void:
	if _presentation_panel == null:
		return
	_presentation_panel.visible = not _presentation_panel.visible
	if _presentation_panel.visible:
		_refresh_character_preset_list()

func _character_presentation_button(caption: String, node_name: String) -> Button:
	var button := Button.new()
	button.name = node_name
	button.text = caption
	button.custom_minimum_size = Vector2(88, 30)
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.focus_mode = Control.FOCUS_NONE
	button.add_theme_font_size_override("font_size", 9)
	button.add_theme_color_override("font_hover_color", GOLD_HI)
	return button

func _refresh_character_presentation_controls() -> void:
	if _presentation_trigger != null:
		var mode_label := "Tĩnh"
		if character_motion_mode == MOTION_ANIMATED:
			mode_label = "Động"
		elif character_motion_mode == MOTION_HIDDEN:
			mode_label = "Ẩn"
		_presentation_trigger.text = "Hiển thị · %s" % mode_label
	if _presentation_still_button != null:
		_style_character_presentation_button(_presentation_still_button, character_motion_mode == MOTION_STILL, CYAN)
	if _presentation_animated_button != null:
		_style_character_presentation_button(_presentation_animated_button, character_motion_mode == MOTION_ANIMATED, GOLD_HI)
	if _presentation_hidden_button != null:
		_style_character_presentation_button(_presentation_hidden_button, character_motion_mode == MOTION_HIDDEN, Color("c285ff"))

func _refresh_character_preset_list() -> void:
	if _presentation_preset_list == null:
		return
	for child in _presentation_preset_list.get_children():
		child.free()

	for entry in CHARACTER_ANIMATION_REGISTRY.PRESETS:
		var preset_id: StringName = entry.get("id", &"")
		var resource_path := str(entry.get("resource_path", ""))
		var still_path := str(entry.get("still_path", ""))
		var installed := (
			(not resource_path.is_empty() and ResourceLoader.exists(resource_path))
			or (not still_path.is_empty() and ResourceLoader.exists(still_path))
		)
		var button := _character_presentation_button(
			str(entry.get("title", String(preset_id))),
			"CharacterPreset_%s" % String(preset_id)
		)
		button.disabled = not installed
		_style_character_presentation_button(
			button,
			preset_id == character_animation_preset_id,
			GOLD_HI if installed else MUTED
		)
		button.button_down.connect(func(): set_character_animation_preset(preset_id))
		_presentation_preset_list.add_child(button)

func _style_character_presentation_button(button: Button, selected: bool, accent: Color) -> void:
	button.add_theme_color_override("font_color", GOLD_HI if selected else MUTED)
	button.add_theme_stylebox_override(
		"normal",
		_flat(
			Color(accent.r, accent.g, accent.b, 0.16 if selected else 0.025),
			13,
			Color(accent.r, accent.g, accent.b, 0.72 if selected else 0.12),
			1
		)
	)
	button.add_theme_stylebox_override(
		"hover",
		_flat(Color(accent.r, accent.g, accent.b, 0.13), 13, Color(accent.r, accent.g, accent.b, 0.62), 1)
	)
	button.add_theme_stylebox_override(
		"pressed",
		_flat(Color(accent.r, accent.g, accent.b, 0.22), 13, Color(accent.r, accent.g, accent.b, 0.92), 1)
	)

func _add_slot(stage: Control, slot_id: String, slot_label: String, x: float, y: float) -> void:
	var slot = EQUIPMENT_SLOT_SCRIPT.new()
	slot.name = "CharacterSlot_%s" % slot_id
	slot.setup(slot_id, slot_label)
	slot.z_index = 10
	_anchor(slot, x, y, x + 64, y + 62)
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
		_status.text = "%s đang trống · chọn trang bị phù hợp" % str(data.get("label", slot_id))
	else:
		_status.text = "%s · %s · +%d" % [
			str(data.get("label", slot_id)),
			str(data.get("name", "Trang bị")),
			int(data.get("enhancement", 0)),
		]
	open_equipment_for_slot(slot_id)

func _emit_detail(detail_id: StringName) -> void:
	close_character_presentation_panel()
	detail_requested.emit(detail_id)

func open_equipment_for_slot(slot_id: String) -> void:
	close_character_presentation_panel()
	if _equipment_inventory == null or _vm.is_empty():
		return
	if _detail_sheet != null:
		_detail_sheet.visible = false
	_equipment_inventory.show_inventory(_vm, slot_id)

func open_detail(detail_id: StringName) -> void:
	if _detail_sheet == null or _vm.is_empty():
		return
	match detail_id:
		&"equipment":
			_detail_sheet.visible = false
			_equipment_inventory.show_inventory(_vm)
		&"stats":
			_detail_sheet.show_detail("stats", _vm)
		&"profile":
			_detail_sheet.show_detail("profile", _vm)
		&"potential":
			_detail_sheet.show_detail("potential", _vm)
		_:
			set_status_message(String(detail_id))

func hide_detail() -> void:
	if _detail_sheet != null:
		_detail_sheet.visible = false
	if _equipment_inventory != null:
		_equipment_inventory.visible = false

func _on_detail_equip_requested(item_id: String) -> void:
	if item_id.is_empty():
		return
	set_status_message("Đang trang bị…")
	equipment_action_requested.emit(item_id)

func _on_detail_equipment_detail_requested(item_id: String) -> void:
	if item_id.is_empty():
		return
	set_status_message("Đang tải chi tiết trang bị…")
	equipment_detail_requested.emit(item_id)

func _on_detail_enhance_requested(item_id: String, use_protection: bool) -> void:
	if item_id.is_empty():
		return
	set_status_message("Đang cường hóa…")
	equipment_enhance_requested.emit(item_id, use_protection)

func _on_inventory_command_requested(action_id: String, payload: Dictionary) -> void:
	if action_id.is_empty():
		return
	set_status_message("Đang xử lý trang bị…")
	equipment_system_action_requested.emit(action_id, payload)

func _on_detail_profile_action_requested(action_id: String, payload: Dictionary) -> void:
	if action_id.is_empty():
		return
	_status.text = "Đang cập nhật hồ sơ…"
	profile_action_requested.emit(action_id, payload)

func _on_detail_potential_action_requested(stat_id: String, points: int) -> void:
	if stat_id.is_empty() or points <= 0:
		return
	_status.text = "Đang phân bổ %d điểm…" % points
	potential_action_requested.emit(stat_id, points)

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
