extends Control

signal identity_pressed
signal cultivation_pressed
signal retreat_pressed
signal route_requested(route_id: StringName)
signal primary_action_requested(action_id: String)

const HOME_ART := preload("res://scripts/home/home_art_atlas.gd")
const ICON_CHARACTER := preload("res://art/icons/character.svg")
const ICON_ROOT := preload("res://art/icons/root.svg")
const ICON_COMBAT := preload("res://art/icons/combat.svg")
const ICON_RETREAT := preload("res://art/icons/retreat.svg")
const ICON_SPARK := preload("res://art/icons/spark.svg")

const GOLD := Color("e3bf70")
const GOLD_HI := Color("fff0bd")
const CYAN := Color("70d9ff")
const MINT := Color("76e5bf")
const VIOLET := Color("c285ff")
const TEXT := Color("f7f2e8")
const MUTED := Color("b6c2c8")
const DEEP := Color(0.008, 0.025, 0.040, 0.82)

var bridge_label: Label
var stone_label: Label
var cp_label: Label

var name_label: Label
var life_label: Label
var realm_label: Label
var root_label: Label
var lifespan_label: Label
var injury_badge: Button

var cultivation_state_label: Label
var progress_bar: ProgressBar
var progress_text: Label
var rate_label: Label
var eta_label: Label
var status_label: Label

var primary_shell: PanelContainer
var primary_art: TextureRect
var primary_button: Button
var primary_title_label: Label
var primary_subtitle_label: Label
var quick_actions: HBoxContainer
var retreat_button: Button
var retreat_action_visual: Control
var retreat_subtitle_label: Label

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_PASS
	_build_top_shell()
	_build_identity_clusters()
	_build_progress()
	_build_primary()
	_build_quick_actions()

func bind(vm: Dictionary) -> void:
	var identity: Dictionary = vm.get("identity", {})
	var progression: Dictionary = vm.get("progression", {})
	var resources: Dictionary = vm.get("resources", {})
	var retreat: Dictionary = progression.get("retreat", {})

	name_label.text = str(identity.get("name", "Tu Sĩ"))
	life_label.text = "Đời %d" % int(identity.get("life_number", 1))
	realm_label.text = str(identity.get("realm", "Phàm Nhân"))
	root_label.text = "Linh Căn · %s" % str(identity.get("root_name", "Phàm Căn"))

	var remaining_life := float(progression.get("remaining_life_years", 0))
	lifespan_label.text = "Thọ nguyên còn · %s năm" % _fmt_decimal(remaining_life)

	var injury := float(progression.get("injury_pct", 0))
	injury_badge.visible = injury > 0.0
	if injury_badge.visible:
		injury_badge.text = "Thương Thế %.0f%%" % injury

	var tu_vi := float(progression.get("tu_vi", 0))
	var required := maxf(1.0, float(progression.get("required_tu_vi", 1)))
	progress_bar.max_value = required
	progress_bar.value = tu_vi
	progress_text.text = "Tu Vi · %s / %s" % [_fmt_num(tu_vi), _fmt_num(required)]
	rate_label.text = "+%s Tu Vi / 15s" % _fmt_num(float(progression.get("rate_per_15s", 0)))

	var ready := bool(progression.get("ready", false))
	var transition := str(progression.get("transition", "auto"))
	cultivation_state_label.text = "Tu Vi viên mãn" if ready else "Đang tu luyện…"
	eta_label.text = _advance_text(progression) if ready else "ETA · %s" % _duration(float(progression.get("eta_seconds", 0)))

	var show_primary := ready and (transition == "tribulation" or transition == "ascend")
	primary_shell.visible = show_primary
	primary_button.visible = show_primary
	if ready and transition == "tribulation":
		primary_title_label.text = "DẪN THIÊN KIẾP"
		primary_subtitle_label.text = "Chuẩn bị vượt kiếp → %s" % str(progression.get("next_realm", ""))
		primary_button.set_meta("action_id", "tribulationV140")
	elif ready and transition == "ascend":
		primary_title_label.text = "THĂNG CẢNH"
		primary_subtitle_label.text = "Đủ điều kiện → %s" % str(progression.get("next_realm", ""))
		primary_button.set_meta("action_id", "ascendRealmV140")
	if show_primary:
		_set_primary_art(&"cta_tribulation" if transition == "tribulation" else &"cta_ascend")
	_update_action_band()

	var retreat_enabled := bool(retreat.get("enabled", false))
	retreat_button.visible = true
	retreat_button.disabled = not retreat_enabled
	retreat_action_visual.modulate = Color.WHITE if retreat_enabled else Color(0.56, 0.60, 0.64, 0.72)
	retreat_subtitle_label.text = "Tích lũy Tu Vi" if retreat_enabled else "Chưa mở"

	stone_label.text = _fmt_num(float(resources.get("spirit_stone", 0)))
	cp_label.text = _fmt_num(float(resources.get("reincarnation_cp", 0)))

	if status_label.text.begins_with("Đang"):
		status_label.text = ""

func set_bridge_status(online: bool, message: String) -> void:
	bridge_label.text = "ONLINE" if online else _friendly_bridge_message(message)
	bridge_label.visible = not online
	bridge_label.add_theme_color_override("font_color", MUTED)

func set_status_message(message: String) -> void:
	status_label.text = message

func _build_top_shell() -> void:
	var shell := MarginContainer.new()
	shell.set_anchors_preset(Control.PRESET_TOP_WIDE)
	shell.offset_bottom = 58.0
	shell.add_theme_constant_override("margin_left", 10)
	shell.add_theme_constant_override("margin_right", 10)
	shell.add_theme_constant_override("margin_top", 7)
	add_child(shell)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 7)
	shell.add_child(row)

	var brand := VBoxContainer.new()
	brand.custom_minimum_size = Vector2(116, 0)
	brand.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	brand.add_theme_constant_override("separation", -4)
	row.add_child(brand)

	var title_top := _readable_label("TU TIÊN", 19, Color("eaf8ff"))
	title_top.add_theme_color_override("font_outline_color", Color(0.02, 0.16, 0.28, 0.95))
	brand.add_child(title_top)

	var title_bottom := _readable_label("NHÀN DỖI", 17, CYAN)
	title_bottom.add_theme_color_override("font_outline_color", Color(0.02, 0.12, 0.22, 0.95))
	brand.add_child(title_bottom)

	bridge_label = _readable_label("ĐANG KẾT NỐI…", 7, MUTED)
	bridge_label.name = "BridgeStatus"
	brand.add_child(bridge_label)

	var resources := HBoxContainer.new()
	resources.add_theme_constant_override("separation", 5)
	row.add_child(resources)

	var stone := _resource_chip("LINH THẠCH", CYAN, &"resource_stone")
	stone.custom_minimum_size = Vector2(82, 42)
	resources.add_child(stone)
	stone_label = stone.find_child("Value", true, false) as Label

	var cp := _resource_chip("LUÂN HỒI", GOLD, &"resource_reincarnation")
	cp.custom_minimum_size = Vector2(78, 42)
	resources.add_child(cp)
	cp_label = cp.find_child("Value", true, false) as Label

func _build_identity_clusters() -> void:
	var left := PanelContainer.new()
	left.anchor_left = 0.0
	left.anchor_right = 0.0
	left.offset_left = 8.0
	left.offset_top = 66.0
	left.offset_right = 224.0
	left.offset_bottom = 153.0
	left.add_theme_stylebox_override("panel", _flat(Color(0.01, 0.04, 0.06, 0.56), 20, Color(0.70, 0.84, 0.92, 0.16), 1))
	add_child(left)

	var left_margin := MarginContainer.new()
	left_margin.add_theme_constant_override("margin_left", 7)
	left_margin.add_theme_constant_override("margin_right", 8)
	left_margin.add_theme_constant_override("margin_top", 6)
	left_margin.add_theme_constant_override("margin_bottom", 6)
	left.add_child(left_margin)

	var identity_row := HBoxContainer.new()
	identity_row.add_theme_constant_override("separation", 7)
	left_margin.add_child(identity_row)

	var portrait_ring := PanelContainer.new()
	portrait_ring.custom_minimum_size = Vector2(68, 68)
	portrait_ring.clip_contents = true
	portrait_ring.add_theme_stylebox_override("panel", _flat(Color(0.035, 0.08, 0.10, 0.96), 34, GOLD, 2))
	identity_row.add_child(portrait_ring)

	var portrait_margin := MarginContainer.new()
	portrait_margin.add_theme_constant_override("margin_left", 4)
	portrait_margin.add_theme_constant_override("margin_right", 4)
	portrait_margin.add_theme_constant_override("margin_top", 4)
	portrait_margin.add_theme_constant_override("margin_bottom", 4)
	portrait_ring.add_child(portrait_margin)

	var portrait := TextureRect.new()
	portrait.texture = HOME_ART.texture(&"portrait", "res://art/approved/hero_portrait.webp")
	portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	portrait.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	portrait.mouse_filter = Control.MOUSE_FILTER_IGNORE
	portrait_margin.add_child(portrait)

	var portrait_frame_texture := HOME_ART.production_texture(&"portrait_frame")
	if portrait_frame_texture != null:
		var portrait_frame := TextureRect.new()
		portrait_frame.texture = portrait_frame_texture
		portrait_frame.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		portrait_frame.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		portrait_frame.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		portrait_frame.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		portrait_frame.mouse_filter = Control.MOUSE_FILTER_IGNORE
		portrait_ring.add_child(portrait_frame)

	var identity_col := VBoxContainer.new()
	identity_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	identity_col.add_theme_constant_override("separation", -1)
	identity_row.add_child(identity_col)

	name_label = _readable_label("Tu Sĩ", 12, TEXT)
	name_label.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	identity_col.add_child(name_label)

	life_label = _readable_label("Đời —", 8, GOLD)
	identity_col.add_child(life_label)

	realm_label = _readable_label("Phàm Nhân", 15, Color("e9f8ff"))
	realm_label.name = "RealmLabel"
	realm_label.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	identity_col.add_child(realm_label)

	var tap := Button.new()
	tap.name = "IdentityTap"
	tap.anchor_left = 0.0
	tap.anchor_right = 0.0
	tap.offset_left = 8.0
	tap.offset_top = 66.0
	tap.offset_right = 224.0
	tap.offset_bottom = 153.0
	tap.text = ""
	tap.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	tap.add_theme_stylebox_override("hover", _flat(Color(0.95, 0.82, 0.50, 0.05), 20, Color(0.95, 0.82, 0.50, 0.32), 1))
	tap.pressed.connect(func(): identity_pressed.emit())
	add_child(tap)

	var right := PanelContainer.new()
	right.anchor_left = 1.0
	right.anchor_right = 1.0
	right.offset_left = -159.0
	right.offset_top = 72.0
	right.offset_right = -8.0
	right.offset_bottom = 151.0
	right.add_theme_stylebox_override("panel", _flat(Color(0.01, 0.04, 0.06, 0.67), 15, Color(0.35, 0.85, 0.72, 0.22), 1))
	add_child(right)

	var right_margin := MarginContainer.new()
	right_margin.add_theme_constant_override("margin_left", 10)
	right_margin.add_theme_constant_override("margin_right", 10)
	right_margin.add_theme_constant_override("margin_top", 8)
	right_margin.add_theme_constant_override("margin_bottom", 7)
	right.add_child(right_margin)

	var root_tap := Button.new()
	root_tap.name = "RootTap"
	root_tap.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root_tap.text = ""
	root_tap.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	root_tap.add_theme_stylebox_override("hover", _flat(Color(0.30, 0.85, 0.70, 0.045), 15, Color(0.40, 0.90, 0.72, 0.22), 1))
	root_tap.pressed.connect(func(): route_requested.emit(&"roots"))
	right.add_child(root_tap)

	var root_col := VBoxContainer.new()
	root_col.add_theme_constant_override("separation", 5)
	right_margin.add_child(root_col)

	root_label = _readable_label("Linh Căn · —", 9, MINT)
	root_label.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	root_col.add_child(root_label)

	lifespan_label = _readable_label("Thọ nguyên còn · —", 8, TEXT)
	lifespan_label.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	root_col.add_child(lifespan_label)

	injury_badge = Button.new()
	injury_badge.visible = false
	injury_badge.custom_minimum_size = Vector2(0, 24)
	injury_badge.add_theme_font_size_override("font_size", 7)
	injury_badge.add_theme_color_override("font_color", Color("ffd4a8"))
	injury_badge.add_theme_stylebox_override("normal", _flat(Color(0.22, 0.075, 0.025, 0.74), 10, Color(0.95, 0.47, 0.24, 0.50), 1))
	injury_badge.pressed.connect(func(): identity_pressed.emit())
	root_col.add_child(injury_badge)

func _build_progress() -> void:
	var shell := Control.new()
	shell.name = "CultivationShell"
	_anchor_bottom_wide(shell, 48.0, 48.0, -350.0, -274.0)
	add_child(shell)

	var box := PanelContainer.new()
	box.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	box.add_theme_stylebox_override("panel", _flat(Color(0.004, 0.026, 0.043, 0.76), 18, Color(0.44, 0.77, 0.92, 0.24), 1))
	shell.add_child(box)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 15)
	margin.add_theme_constant_override("margin_right", 15)
	margin.add_theme_constant_override("margin_top", 7)
	margin.add_theme_constant_override("margin_bottom", 7)
	box.add_child(margin)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 2)
	margin.add_child(col)

	cultivation_state_label = _label("Đang tu luyện…", 10, TEXT)
	cultivation_state_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(cultivation_state_label)

	progress_text = _label("Tu Vi · — / —", 10, TEXT)
	progress_text.name = "CultivationText"
	progress_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(progress_text)

	progress_bar = ProgressBar.new()
	progress_bar.name = "CultivationProgress"
	progress_bar.max_value = 1
	progress_bar.value = 0
	progress_bar.show_percentage = false
	progress_bar.custom_minimum_size = Vector2(0, 7)
	progress_bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	progress_bar.add_theme_stylebox_override("background", _flat(Color(0.0, 0.015, 0.025, 0.92), 4, Color(0.36, 0.55, 0.60, 0.28), 1))
	progress_bar.add_theme_stylebox_override("fill", _flat(MINT, 4))
	col.add_child(progress_bar)

	var foot := HBoxContainer.new()
	col.add_child(foot)
	rate_label = _label("+— Tu Vi / 15s", 9, MINT)
	rate_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	foot.add_child(rate_label)
	eta_label = _label("ETA · —", 9, MUTED)
	foot.add_child(eta_label)

	status_label = _label("", 8, Color(0.90, 0.90, 0.82, 0.92))
	status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(status_label)

	var tap := Button.new()
	tap.name = "CultivationTap"
	tap.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	tap.text = ""
	tap.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	tap.add_theme_stylebox_override("hover", _flat(Color(0.40, 0.88, 1.0, 0.035), 18, Color(0.45, 0.86, 1.0, 0.24), 1))
	tap.pressed.connect(func(): cultivation_pressed.emit())
	shell.add_child(tap)

func _build_primary() -> void:
	primary_shell = PanelContainer.new()
	primary_shell.visible = false
	_anchor_bottom_wide(primary_shell, 58.0, 58.0, -269.0, -218.0)
	primary_shell.add_theme_stylebox_override("panel", _primary_style())
	add_child(primary_shell)

	primary_art = TextureRect.new()
	primary_art.visible = false
	primary_art.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	primary_art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	primary_art.stretch_mode = TextureRect.STRETCH_SCALE
	primary_art.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	primary_art.mouse_filter = Control.MOUSE_FILTER_IGNORE
	primary_shell.add_child(primary_art)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_top", 5)
	margin.add_theme_constant_override("margin_bottom", 5)
	primary_shell.add_child(margin)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	margin.add_child(row)

	var icon_wrap := CenterContainer.new()
	icon_wrap.custom_minimum_size = Vector2(34, 0)
	row.add_child(icon_wrap)

	var icon := TextureRect.new()
	icon.texture = ICON_SPARK
	icon.custom_minimum_size = Vector2(26, 26)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	icon.modulate = GOLD_HI
	icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	icon_wrap.add_child(icon)

	var labels := VBoxContainer.new()
	labels.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	labels.add_theme_constant_override("separation", -1)
	row.add_child(labels)

	primary_title_label = _readable_label("THĂNG CẢNH", 13, GOLD_HI)
	primary_title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	labels.add_child(primary_title_label)

	primary_subtitle_label = _readable_label("Đủ điều kiện", 7, Color("f0d58c"))
	primary_subtitle_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	primary_subtitle_label.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	labels.add_child(primary_subtitle_label)

	primary_button = Button.new()
	primary_button.name = "PrimaryCTA"
	primary_button.visible = false
	primary_button.text = ""
	primary_button.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	primary_button.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	primary_button.add_theme_stylebox_override(
		"hover",
		_flat(Color(1.0, 0.78, 0.30, 0.075), 28, Color(1.0, 0.88, 0.55, 0.92), 2)
	)
	primary_button.add_theme_stylebox_override(
		"pressed",
		_flat(Color(1.0, 0.75, 0.24, 0.13), 28, GOLD_HI, 2)
	)
	primary_button.pressed.connect(func():
		primary_action_requested.emit(str(primary_button.get_meta("action_id", "")))
	)
	primary_shell.add_child(primary_button)

func _build_quick_actions() -> void:
	quick_actions = HBoxContainer.new()
	quick_actions.add_theme_constant_override("separation", 2)
	_anchor_bottom_wide(quick_actions, 14.0, 14.0, -216.0, -98.0)
	add_child(quick_actions)

	retreat_button = _add_action_cell(&"orb_retreat", ICON_RETREAT, "Bế Quan", "Tích lũy Tu Vi", GOLD, "RetreatButton")
	retreat_action_visual = retreat_button.get_meta("visual_root") as Control
	retreat_subtitle_label = retreat_button.get_meta("subtitle_label") as Label
	retreat_button.pressed.connect(func(): retreat_pressed.emit())

	var character := _add_action_cell(&"orb_character", ICON_CHARACTER, "Nhân Vật", "Hồ sơ đời", VIOLET, "CharacterAction")
	character.pressed.connect(func(): identity_pressed.emit())

	var root := _add_action_cell(&"orb_root", ICON_ROOT, "Linh Căn", "Căn cơ", MINT, "RootAction")
	root.pressed.connect(func(): route_requested.emit(&"roots"))

	var combat := _add_action_cell(&"orb_combat", ICON_COMBAT, "Chiến Đấu", "Khiêu chiến", CYAN, "CombatAction")
	combat.pressed.connect(func(): route_requested.emit(&"dungeons"))

func _update_action_band() -> void:
	# The target reserves a stable four-orb band. The conditional advancement
	# plaque occupies the band immediately above it and must not compress orbs.
	_anchor_bottom_wide(quick_actions, 14.0, 14.0, -216.0, -98.0)

func _add_action_cell(art_id: StringName, icon: Texture2D, caption: String, subtitle: String, accent: Color, button_name: String) -> Button:
	var cell := VBoxContainer.new()
	cell.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	cell.add_theme_constant_override("separation", 1)
	quick_actions.add_child(cell)

	var center := CenterContainer.new()
	center.custom_minimum_size = Vector2(0, 76)
	cell.add_child(center)

	var orb := Control.new()
	orb.custom_minimum_size = Vector2(72, 72)
	orb.mouse_filter = Control.MOUSE_FILTER_IGNORE
	center.add_child(orb)

	_add_action_orb_art(orb, art_id, icon, accent)

	var button := Button.new()
	button.name = button_name
	button.text = ""
	button.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	button.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	button.add_theme_stylebox_override(
		"hover",
		_flat(Color(accent.r, accent.g, accent.b, 0.10), 36, Color(accent.r, accent.g, accent.b, 0.92), 2)
	)
	button.add_theme_stylebox_override("pressed", _flat(Color(accent.r, accent.g, accent.b, 0.16), 36, accent, 2))
	button.add_theme_stylebox_override("disabled", StyleBoxEmpty.new())
	orb.add_child(button)

	var title := _readable_label(caption, 10, TEXT)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	cell.add_child(title)

	var sub := _readable_label(subtitle, 7, MUTED)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	cell.add_child(sub)

	button.set_meta("visual_root", cell)
	button.set_meta("subtitle_label", sub)
	return button

func _add_action_orb_art(orb: Control, art_id: StringName, fallback_icon: Texture2D, accent: Color) -> void:
	var production_art := HOME_ART.production_texture(art_id)
	if production_art != null:
		var art := TextureRect.new()
		art.texture = production_art
		art.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		art.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		art.mouse_filter = Control.MOUSE_FILTER_IGNORE
		orb.add_child(art)
		return

	var outer_ring := Panel.new()
	outer_ring.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	outer_ring.mouse_filter = Control.MOUSE_FILTER_IGNORE
	outer_ring.add_theme_stylebox_override(
		"panel",
		_flat(
			Color(accent.r, accent.g, accent.b, 0.055),
			36,
			Color(accent.r, accent.g, accent.b, 0.78),
			2
		)
	)
	orb.add_child(outer_ring)

	var inner_ring := Panel.new()
	inner_ring.anchor_left = 0.5
	inner_ring.anchor_right = 0.5
	inner_ring.anchor_top = 0.5
	inner_ring.anchor_bottom = 0.5
	inner_ring.offset_left = -27.0
	inner_ring.offset_right = 27.0
	inner_ring.offset_top = -27.0
	inner_ring.offset_bottom = 27.0
	inner_ring.mouse_filter = Control.MOUSE_FILTER_IGNORE
	inner_ring.add_theme_stylebox_override(
		"panel",
		_flat(
			Color(0.010, 0.035, 0.055, 0.94),
			27,
			Color(accent.r, accent.g, accent.b, 0.28),
			1
		)
	)
	orb.add_child(inner_ring)

	var icon_rect := TextureRect.new()
	icon_rect.texture = fallback_icon
	icon_rect.anchor_left = 0.5
	icon_rect.anchor_right = 0.5
	icon_rect.anchor_top = 0.5
	icon_rect.anchor_bottom = 0.5
	icon_rect.offset_left = -19.0
	icon_rect.offset_right = 19.0
	icon_rect.offset_top = -19.0
	icon_rect.offset_bottom = 19.0
	icon_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	icon_rect.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	icon_rect.modulate = accent
	icon_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	orb.add_child(icon_rect)


func _resource_chip(caption: String, accent: Color, art_id: StringName) -> PanelContainer:
	var panel := PanelContainer.new()
	var art_texture := HOME_ART.production_texture(art_id)
	if art_texture != null:
		panel.add_theme_stylebox_override("panel", StyleBoxEmpty.new())
		var art := TextureRect.new()
		art.texture = art_texture
		art.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		art.stretch_mode = TextureRect.STRETCH_SCALE
		art.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		art.mouse_filter = Control.MOUSE_FILTER_IGNORE
		panel.add_child(art)
	else:
		panel.add_theme_stylebox_override("panel", _flat(Color(0.008, 0.035, 0.055, 0.82), 14, Color(accent.r, accent.g, accent.b, 0.24), 1))

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 7)
	margin.add_theme_constant_override("margin_right", 7)
	margin.add_theme_constant_override("margin_top", 4)
	margin.add_theme_constant_override("margin_bottom", 4)
	panel.add_child(margin)

	var col := VBoxContainer.new()
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	col.add_theme_constant_override("separation", -2)
	margin.add_child(col)

	var title := _label(caption, 6, MUTED)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(title)

	var value := _label("—", 10, accent)
	value.name = "Value"
	value.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(value)
	return panel

func _set_primary_art(asset_id: StringName) -> void:
	var art_texture := HOME_ART.production_texture(asset_id)
	primary_art.texture = art_texture
	primary_art.visible = art_texture != null
	if art_texture != null:
		primary_shell.add_theme_stylebox_override("panel", StyleBoxEmpty.new())
	else:
		primary_shell.add_theme_stylebox_override("panel", _primary_style())


func _primary_style() -> StyleBoxFlat:
	return _flat(Color(0.18, 0.115, 0.025, 0.94), 28, Color(1.0, 0.79, 0.32, 0.86), 2)


func _advance_text(progression: Dictionary) -> String:
	var transition := str(progression.get("transition", "auto"))
	var next_realm := str(progression.get("next_realm", ""))
	if transition == "tribulation":
		return "Thiên Kiếp → %s" % next_realm
	if transition == "ascend":
		return "Thăng Cảnh → %s" % next_realm
	return "Đã viên mãn"

func _friendly_bridge_message(message: String) -> String:
	if message.is_empty():
		return "Mất kết nối"
	if message.length() > 28:
		return "Mất kết nối"
	return message

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

func _fmt_decimal(value: float) -> String:
	if is_equal_approx(value, round(value)):
		return str(int(round(value)))
	return "%.1f" % value

func _label(value: String, size: int, color: Color) -> Label:
	var label := Label.new()
	label.text = value
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", color)
	return label

func _readable_label(value: String, size: int, color: Color) -> Label:
	var label := _label(value, size, color)
	label.add_theme_constant_override("outline_size", 3)
	label.add_theme_color_override("font_outline_color", Color(0.0, 0.015, 0.025, 0.90))
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

func _anchor_bottom_wide(control: Control, left_margin: float, right_margin: float, top_offset: float, bottom_offset: float) -> void:
	control.anchor_left = 0.0
	control.anchor_right = 1.0
	control.anchor_top = 1.0
	control.anchor_bottom = 1.0
	control.offset_left = left_margin
	control.offset_right = -right_margin
	control.offset_top = top_offset
	control.offset_bottom = bottom_offset
