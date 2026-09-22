extends Control

signal identity_pressed
signal cultivation_pressed
signal retreat_pressed
signal route_requested(route_id: StringName)
signal character_section_requested(section_id: StringName)
signal primary_action_requested(action_id: String)
signal home_mode_requested(mode: StringName)
signal home_motion_mode_requested(mode: StringName)

const MODE_CULTIVATION: StringName = &"cultivation"
const MODE_REST: StringName = &"rest"
const MOTION_STILL: StringName = &"still"
const MOTION_ANIMATED: StringName = &"animated"
const MOTION_HIDDEN: StringName = &"hidden"

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
var combat_button: Button
var combat_action_visual: Control
var combat_subtitle_label: Label

var home_mode_shell: PanelContainer
var cultivation_mode_button: Button
var rest_mode_button: Button
var still_mode_button: Button
var animated_mode_button: Button
var hidden_mode_button: Button
var home_presentation_mode: StringName = MODE_CULTIVATION
var home_motion_mode: StringName = MOTION_STILL

var cultivation_event_shell: PanelContainer
var cultivation_event_title: Label
var cultivation_event_subtitle: Label
var cultivation_gain_label: Label
var _cultivation_event_tween: Tween
var _cultivation_gain_tween: Tween
var _progress_bump_tween: Tween

# Presentation-only interpolation. The canonical runtime still commits Tu Vi in
# V140 quanta; Home only visualizes the current 15-second quantum continuously.
var display_tu_vi := 0.0
var display_rate_per_second := 0.0
var cultivation_animation_active := false

var _canonical_tu_vi := 0.0
var _display_required_tu_vi := 1.0
var _rate_per_15s := 0.0
var _cultivation_ready := false
var _bridge_online := false
var _has_cultivation_sample := false
var _gain_pulse_elapsed := 0.0
var _gain_pulse_anchor_tu_vi := 0.0
var _gain_pulse_initialized := false

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_PASS
	_build_top_shell()
	_build_identity_clusters()
	_build_home_mode_switch()
	_build_progress()
	_build_primary()
	_build_quick_actions()
	_build_cultivation_event()
	set_process(true)

func bind(vm: Dictionary) -> void:
	var identity: Dictionary = vm.get("identity", {})
	var progression: Dictionary = vm.get("progression", {})
	var resources: Dictionary = vm.get("resources", {})
	var retreat: Dictionary = progression.get("retreat", {})

	name_label.text = str(identity.get("name", "Tu Sĩ"))
	life_label.text = "Đời %d" % int(identity.get("life_number", 1))
	realm_label.text = realm_display_text(str(identity.get("realm", "Phàm Nhân")))
	root_label.text = "Linh Căn · %s" % str(identity.get("root_name", "Phàm Căn"))

	var remaining_life := float(progression.get("remaining_life_years", 0))
	lifespan_label.text = "Thọ nguyên còn · %s năm" % _fmt_decimal(remaining_life)

	var injury := float(progression.get("injury_pct", 0))
	injury_badge.visible = injury > 0.0
	if injury_badge.visible:
		injury_badge.text = "Thương Thế %.0f%%" % injury

	var tu_vi := maxf(0.0, float(progression.get("tu_vi", 0)))
	var live_tu_vi := maxf(tu_vi, float(progression.get("live_tu_vi", tu_vi)))
	var required := maxf(1.0, float(progression.get("required_tu_vi", 1)))
	var rate_per_15s := maxf(0.0, float(progression.get("rate_per_15s", 0)))
	var rate_per_second := maxf(0.0, float(progression.get("rate_per_second", 0)))
	_bind_cultivation_sample(
		tu_vi,
		live_tu_vi,
		required,
		rate_per_15s,
		rate_per_second,
		bool(progression.get("ready", false))
	)

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
		primary_title_label.text = "ĐỘT PHÁ"
		primary_subtitle_label.text = "Phá cảnh → %s" % str(progression.get("next_realm", ""))
		primary_button.set_meta("action_id", "ascendRealmV140")
	if show_primary:
		_set_primary_art(&"cta_tribulation" if transition == "tribulation" else &"cta_ascend")
	_update_action_band()

	var retreat_system_enabled := bool(retreat.get("enabled", false))
	var retreat_bank := maxf(0.0, float(retreat.get("bank_hours", 0)))
	var retreat_usable := retreat_system_enabled and retreat_bank >= 1.0
	retreat_button.visible = true
	retreat_button.disabled = not retreat_usable
	retreat_action_visual.modulate = Color.WHITE if retreat_usable else Color(0.56, 0.60, 0.64, 0.72)
	if not retreat_system_enabled:
		retreat_subtitle_label.text = "Chưa mở"
	elif retreat_bank < 1.0:
		retreat_subtitle_label.text = "Cần đủ 1h"
	else:
		retreat_subtitle_label.text = "%.1fh sẵn sàng" % retreat_bank

	stone_label.text = _fmt_num(float(resources.get("spirit_stone", 0)))
	cp_label.text = _fmt_num(float(resources.get("reincarnation_cp", 0)))

	if status_label.text.begins_with("Đang"):
		status_label.text = ""


static func realm_display_text(value: String) -> String:
	var normalized := value.strip_edges()
	if normalized.is_empty():
		return "Phàm Nhân"
	var marker := " tầng "
	var split_at := normalized.find(marker)
	if split_at > 0:
		var major := normalized.substr(0, split_at).strip_edges()
		var stage := normalized.substr(split_at + marker.length()).strip_edges()
		if not stage.is_empty():
			return "%s\nTầng %s" % [major, stage]
	return normalized

func set_bridge_status(online: bool, message: String) -> void:
	_bridge_online = online
	bridge_label.text = "ONLINE" if online else _friendly_bridge_message(message)
	bridge_label.visible = not online
	bridge_label.add_theme_color_override("font_color", MUTED)
	cultivation_animation_active = _bridge_online and not _cultivation_ready and display_rate_per_second > 0.0

func set_status_message(message: String) -> void:
	status_label.text = message

func set_home_presentation_mode(mode: StringName) -> void:
	home_presentation_mode = normalize_home_presentation_mode(mode)
	_refresh_home_mode_buttons()

func get_home_presentation_mode() -> StringName:
	return home_presentation_mode

static func normalize_home_presentation_mode(mode: StringName) -> StringName:
	return MODE_REST if mode == MODE_REST else MODE_CULTIVATION

func _request_home_presentation_mode(mode: StringName) -> void:
	var normalized := normalize_home_presentation_mode(mode)
	if normalized == home_presentation_mode:
		return
	set_home_presentation_mode(normalized)
	home_mode_requested.emit(normalized)

func set_home_motion_mode(mode: StringName) -> void:
	home_motion_mode = normalize_home_motion_mode(mode)
	_refresh_home_mode_buttons()

func get_home_motion_mode() -> StringName:
	return home_motion_mode

static func normalize_home_motion_mode(mode: StringName) -> StringName:
	if mode == MOTION_ANIMATED:
		return MOTION_ANIMATED
	if mode == MOTION_HIDDEN:
		return MOTION_HIDDEN
	return MOTION_STILL

func _request_home_motion_mode(mode: StringName) -> void:
	var normalized := normalize_home_motion_mode(mode)
	if normalized == home_motion_mode:
		return
	set_home_motion_mode(normalized)
	home_motion_mode_requested.emit(normalized)

func show_breakthrough(from_realm: String, to_realm: String, steps: int = 1, major: bool = false) -> void:
	var safe_steps := maxi(1, steps)
	var title := "ĐẠI CẢNH ĐỘT PHÁ" if major else ("LIÊN PHÁ %d CẢNH" % safe_steps if safe_steps > 1 else "ĐỘT PHÁ")
	var subtitle := "%s → %s" % [from_realm, to_realm]
	_play_cultivation_event(title, subtitle, GOLD_HI if major else MINT, 1.75 if major else 1.35)

func show_tribulation_result(passed: bool, kind: String = "", temper_stacks: int = 0) -> void:
	if passed:
		var suffix := " · Luyện Đạo %d/5" % clampi(temper_stacks, 0, 5) if temper_stacks > 0 else ""
		_play_cultivation_event("ĐỘ KIẾP THÀNH CÔNG", _humanize_tribulation(kind) + suffix, GOLD_HI, 2.0)
	else:
		_play_cultivation_event("THIÊN KIẾP THẤT BẠI", _humanize_tribulation(kind), Color("ff9b78"), 1.75)

func show_ling_quang(multiplier: int) -> void:
	var event := ling_quang_event_copy(multiplier)
	if event.is_empty():
		return
	var accent: Color = event.get("accent", MINT)
	_play_cultivation_event(
		str(event.get("title", "")),
		str(event.get("subtitle", "")),
		accent,
		float(event.get("hold", 1.15))
	)

static func ling_quang_event_copy(multiplier: int) -> Dictionary:
	var m := clampi(multiplier, 1, 10)
	if m <= 1:
		return {}
	if m >= 9:
		return {"title": "THIÊN ĐỊA CỘNG MINH ×%d" % m, "subtitle": "Linh khí đại bạo phát", "accent": GOLD_HI, "hold": 2.0}
	if m >= 7:
		return {"title": "ĐẠI LINH QUANG ×%d" % m, "subtitle": "Đạo vận hội tụ", "accent": Color("ffe099"), "hold": 1.7}
	if m >= 5:
		return {"title": "ĐẠI LINH QUANG ×%d" % m, "subtitle": "Tu Vi bùng nổ", "accent": VIOLET, "hold": 1.5}
	if m >= 3:
		return {"title": "LINH QUANG ×%d" % m, "subtitle": "Nhất niệm thông huyền", "accent": CYAN, "hold": 1.25}
	return {"title": "LINH QUANG ×2", "subtitle": "Tu Vi tăng vọt", "accent": MINT, "hold": 0.95}

func _play_cultivation_event(title: String, subtitle: String, accent: Color, hold: float) -> void:
	if cultivation_event_shell == null:
		return
	if _cultivation_event_tween != null and _cultivation_event_tween.is_valid():
		_cultivation_event_tween.kill()
	cultivation_event_title.text = title
	cultivation_event_title.add_theme_color_override("font_color", accent)
	cultivation_event_subtitle.text = subtitle
	cultivation_event_shell.add_theme_stylebox_override(
		"panel",
		_flat(Color(0.005, 0.025, 0.040, 0.90), 22, Color(accent.r, accent.g, accent.b, 0.78), 2)
	)
	cultivation_event_shell.visible = true
	cultivation_event_shell.pivot_offset = Vector2(142.0, 30.0)
	cultivation_event_shell.modulate = Color(1, 1, 1, 0)
	cultivation_event_shell.scale = Vector2(0.90, 0.90)

	# Events should land with impact instead of looking like a flat toast.
	_cultivation_event_tween = create_tween()
	_cultivation_event_tween.set_parallel(true)
	_cultivation_event_tween.tween_property(cultivation_event_shell, "modulate:a", 1.0, 0.12)
	_cultivation_event_tween.tween_property(cultivation_event_shell, "scale", Vector2(1.045, 1.045), 0.17).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	_cultivation_event_tween.set_parallel(false)
	_cultivation_event_tween.tween_property(cultivation_event_shell, "scale", Vector2.ONE, 0.09).set_ease(Tween.EASE_OUT)
	_cultivation_event_tween.tween_interval(maxf(0.40, hold))
	_cultivation_event_tween.set_parallel(true)
	_cultivation_event_tween.tween_property(cultivation_event_shell, "modulate:a", 0.0, 0.24)
	_cultivation_event_tween.tween_property(cultivation_event_shell, "scale", Vector2(0.975, 0.975), 0.24)
	_cultivation_event_tween.set_parallel(false)
	_cultivation_event_tween.tween_callback(func():
		cultivation_event_shell.visible = false
		cultivation_event_shell.scale = Vector2.ONE
	)

func _humanize_tribulation(kind: String) -> String:
	var names := {
		"heavenly_lightning": "Thiên Lôi",
		"heart_demon": "Tâm Ma",
		"karma_fire": "Nghiệp Hỏa",
		"dao_judgment": "Đạo Phán",
	}
	return str(names.get(kind, "Thiên Kiếp"))

func _process(delta: float) -> void:
	if not cultivation_animation_active or not _has_cultivation_sample:
		return

	var safe_delta := maxf(0.0, delta)

	# Never invent more than the next canonical 15-second commit. If the bridge
	# is delayed/offline the visual counter stops at that boundary.
	var quantum_ceiling := minf(_display_required_tu_vi, _canonical_tu_vi + _rate_per_15s)
	display_tu_vi = minf(quantum_ceiling, display_tu_vi + display_rate_per_second * safe_delta)
	_render_cultivation_display()

	# Player-facing feedback is sampled from the already-authorized display
	# counter. It never adds Tu Vi; it only visualizes integer gains about once
	# per second so cultivation feels active instead of silently changing text.
	_gain_pulse_elapsed += safe_delta
	if _gain_pulse_elapsed >= 1.0:
		var gain := cultivation_gain_pulse_amount(_gain_pulse_anchor_tu_vi, display_tu_vi)
		if gain > 0:
			_play_cultivation_gain(gain)
		_gain_pulse_anchor_tu_vi = display_tu_vi
		_gain_pulse_elapsed = fmod(_gain_pulse_elapsed, 1.0)

func _bind_cultivation_sample(
	tu_vi: float,
	live_tu_vi: float,
	required: float,
	rate_per_15s: float,
	rate_per_second: float,
	ready: bool
) -> void:
	var reset_display := (
		not _has_cultivation_sample
		or not is_equal_approx(required, _display_required_tu_vi)
		or tu_vi < _canonical_tu_vi - 0.001
	)

	_display_required_tu_vi = maxf(1.0, required)
	_rate_per_15s = maxf(0.0, rate_per_15s)
	display_rate_per_second = maxf(0.0, rate_per_second)
	_cultivation_ready = ready
	var backend_live := minf(_display_required_tu_vi, maxf(tu_vi, live_tu_vi))

	if reset_display:
		display_tu_vi = backend_live
	elif tu_vi > _canonical_tu_vi + 0.001:
		# Canonical V140 committed the quantum. Reconcile forward only; the
		# interpolation should never make the player see Tu Vi tick backward.
		display_tu_vi = maxf(display_tu_vi, backend_live)
	else:
		# Backend owns the exact second-rate and current commit phase. Godot only
		# smooths between the one-second bridge samples.
		display_tu_vi = maxf(display_tu_vi, backend_live)

	_canonical_tu_vi = tu_vi
	_has_cultivation_sample = true

	if ready:
		display_tu_vi = minf(_display_required_tu_vi, maxf(display_tu_vi, tu_vi))

	if reset_display or not _gain_pulse_initialized:
		_gain_pulse_anchor_tu_vi = display_tu_vi
		_gain_pulse_elapsed = 0.0
		_gain_pulse_initialized = true
	elif ready:
		_gain_pulse_anchor_tu_vi = display_tu_vi
		_gain_pulse_elapsed = 0.0

	cultivation_animation_active = _bridge_online and not ready and display_rate_per_second > 0.0
	_render_cultivation_display()

func _render_cultivation_display() -> void:
	if progress_bar == null or progress_text == null or rate_label == null:
		return
	progress_bar.max_value = _display_required_tu_vi
	progress_bar.value = clampf(display_tu_vi, 0.0, _display_required_tu_vi)
	progress_text.text = "Tu Vi · %s / %s" % [
		_fmt_num(display_tu_vi),
		_fmt_num(_display_required_tu_vi),
	]
	if display_rate_per_second > 0.0:
		rate_label.text = cultivation_rate_label_from_per_second(display_rate_per_second)
	else:
		rate_label.text = "+0 Tu Vi/s"

static func cultivation_gain_pulse_amount(previous: float, current: float) -> int:
	# Match the integer value the player actually sees in CultivationText.
	return maxi(0, int(round(current)) - int(round(previous)))

func _play_cultivation_gain(amount: int) -> void:
	if amount <= 0 or cultivation_gain_label == null:
		return

	if _cultivation_gain_tween != null and _cultivation_gain_tween.is_valid():
		_cultivation_gain_tween.kill()
	if _progress_bump_tween != null and _progress_bump_tween.is_valid():
		_progress_bump_tween.kill()

	cultivation_gain_label.text = "+%d Tu Vi" % amount
	cultivation_gain_label.visible = true
	cultivation_gain_label.modulate = Color(1, 1, 1, 0)
	cultivation_gain_label.scale = Vector2(0.90, 0.90)
	cultivation_gain_label.offset_top = -22.0
	cultivation_gain_label.offset_bottom = 2.0
	cultivation_gain_label.pivot_offset = Vector2(cultivation_gain_label.size.x * 0.5, cultivation_gain_label.size.y * 0.5)

	_cultivation_gain_tween = create_tween()
	_cultivation_gain_tween.set_parallel(true)
	_cultivation_gain_tween.tween_property(cultivation_gain_label, "modulate:a", 1.0, 0.10)
	_cultivation_gain_tween.tween_property(cultivation_gain_label, "scale", Vector2(1.07, 1.07), 0.13).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	_cultivation_gain_tween.tween_property(cultivation_gain_label, "offset_top", -31.0, 0.34).set_ease(Tween.EASE_OUT)
	_cultivation_gain_tween.tween_property(cultivation_gain_label, "offset_bottom", -7.0, 0.34).set_ease(Tween.EASE_OUT)
	_cultivation_gain_tween.set_parallel(false)
	_cultivation_gain_tween.tween_property(cultivation_gain_label, "scale", Vector2.ONE, 0.08)
	_cultivation_gain_tween.tween_interval(0.26)
	_cultivation_gain_tween.tween_property(cultivation_gain_label, "modulate:a", 0.0, 0.22)
	_cultivation_gain_tween.tween_callback(func():
		cultivation_gain_label.visible = false
		cultivation_gain_label.scale = Vector2.ONE
		cultivation_gain_label.offset_top = -22.0
		cultivation_gain_label.offset_bottom = 2.0
	)

	# The authoritative total remains the same value; this is only a small
	# visual confirmation that the displayed integer advanced.
	progress_text.pivot_offset = progress_text.size * 0.5
	progress_text.scale = Vector2(1.075, 1.075)
	_progress_bump_tween = create_tween()
	_progress_bump_tween.tween_property(progress_text, "scale", Vector2.ONE, 0.20).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

static func cultivation_rate_per_second(rate_per_15s: float, commit_seconds: float = 15.0) -> float:
	return maxf(0.0, rate_per_15s) / maxf(0.001, commit_seconds)

static func cultivation_rate_label(rate_per_15s: float, commit_seconds: float = 15.0) -> String:
	return cultivation_rate_label_from_per_second(cultivation_rate_per_second(rate_per_15s, commit_seconds))

static func cultivation_rate_label_from_per_second(per_second: float) -> String:
	var safe_rate := maxf(0.0, per_second)
	return "+%d Tu Vi/s" % int(ceil(safe_rate))

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

	realm_label = _readable_label("Phàm Nhân", 13, Color("e9f8ff"))
	realm_label.name = "RealmLabel"
	realm_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	realm_label.custom_minimum_size = Vector2(0, 30)
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
	root_tap.pressed.connect(func(): character_section_requested.emit(&"profile"))
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

func _build_home_mode_switch() -> void:
	home_mode_shell = PanelContainer.new()
	home_mode_shell.name = "HomeModeSwitch"
	home_mode_shell.z_index = 18
	home_mode_shell.anchor_left = 0.5
	home_mode_shell.anchor_right = 0.5
	home_mode_shell.anchor_top = 0.0
	home_mode_shell.anchor_bottom = 0.0
	home_mode_shell.offset_left = -116.0
	home_mode_shell.offset_right = 116.0
	home_mode_shell.offset_top = 414.0
	home_mode_shell.offset_bottom = 488.0
	home_mode_shell.add_theme_stylebox_override(
		"panel",
		_flat(Color(0.004, 0.022, 0.035, 0.88), 18, Color(0.58, 0.78, 0.82, 0.24), 1)
	)
	add_child(home_mode_shell)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 4)
	margin.add_theme_constant_override("margin_right", 4)
	margin.add_theme_constant_override("margin_top", 4)
	margin.add_theme_constant_override("margin_bottom", 4)
	home_mode_shell.add_child(margin)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 3)
	margin.add_child(col)

	var content_row := HBoxContainer.new()
	content_row.add_theme_constant_override("separation", 3)
	col.add_child(content_row)

	cultivation_mode_button = _home_mode_button("Tu Luyện", "CultivationModeButton", 108.0)
	cultivation_mode_button.button_down.connect(func(): _request_home_presentation_mode(MODE_CULTIVATION))
	cultivation_mode_button.pressed.connect(func(): _request_home_presentation_mode(MODE_CULTIVATION))
	content_row.add_child(cultivation_mode_button)

	rest_mode_button = _home_mode_button("Nghỉ Ngơi", "RestModeButton", 108.0)
	rest_mode_button.button_down.connect(func(): _request_home_presentation_mode(MODE_REST))
	rest_mode_button.pressed.connect(func(): _request_home_presentation_mode(MODE_REST))
	content_row.add_child(rest_mode_button)

	var motion_row := HBoxContainer.new()
	motion_row.add_theme_constant_override("separation", 3)
	col.add_child(motion_row)

	still_mode_button = _home_mode_button("Tĩnh", "StillModeButton", 70.0)
	still_mode_button.button_down.connect(func(): _request_home_motion_mode(MOTION_STILL))
	still_mode_button.pressed.connect(func(): _request_home_motion_mode(MOTION_STILL))
	motion_row.add_child(still_mode_button)

	animated_mode_button = _home_mode_button("Động", "AnimatedModeButton", 70.0)
	animated_mode_button.button_down.connect(func(): _request_home_motion_mode(MOTION_ANIMATED))
	animated_mode_button.pressed.connect(func(): _request_home_motion_mode(MOTION_ANIMATED))
	motion_row.add_child(animated_mode_button)

	hidden_mode_button = _home_mode_button("Ẩn", "HiddenModeButton", 70.0)
	hidden_mode_button.button_down.connect(func(): _request_home_motion_mode(MOTION_HIDDEN))
	hidden_mode_button.pressed.connect(func(): _request_home_motion_mode(MOTION_HIDDEN))
	motion_row.add_child(hidden_mode_button)

	_refresh_home_mode_buttons()

func _home_mode_button(caption: String, node_name: String, min_width: float) -> Button:
	var button := Button.new()
	button.name = node_name
	button.text = caption
	button.custom_minimum_size = Vector2(min_width, 28)
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.focus_mode = Control.FOCUS_NONE
	button.add_theme_font_size_override("font_size", 9)
	button.add_theme_color_override("font_color", TEXT)
	button.add_theme_color_override("font_hover_color", GOLD_HI)
	return button

func _refresh_home_mode_buttons() -> void:
	if cultivation_mode_button == null or rest_mode_button == null:
		return
	_apply_home_mode_button_style(cultivation_mode_button, home_presentation_mode == MODE_CULTIVATION, MINT)
	_apply_home_mode_button_style(rest_mode_button, home_presentation_mode == MODE_REST, GOLD)
	if still_mode_button != null:
		_apply_home_mode_button_style(still_mode_button, home_motion_mode == MOTION_STILL, CYAN)
	if animated_mode_button != null:
		_apply_home_mode_button_style(animated_mode_button, home_motion_mode == MOTION_ANIMATED, GOLD)
	if hidden_mode_button != null:
		_apply_home_mode_button_style(hidden_mode_button, home_motion_mode == MOTION_HIDDEN, VIOLET)

func _apply_home_mode_button_style(button: Button, selected: bool, accent: Color) -> void:
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
	rate_label.name = "CultivationRate"
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

	cultivation_gain_label = _readable_label("+0 Tu Vi", 13, MINT)
	cultivation_gain_label.name = "CultivationGainPulse"
	cultivation_gain_label.visible = false
	cultivation_gain_label.z_index = 8
	cultivation_gain_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cultivation_gain_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	cultivation_gain_label.anchor_left = 0.5
	cultivation_gain_label.anchor_right = 0.5
	cultivation_gain_label.anchor_top = 0.0
	cultivation_gain_label.anchor_bottom = 0.0
	cultivation_gain_label.offset_left = -72.0
	cultivation_gain_label.offset_right = 72.0
	cultivation_gain_label.offset_top = -22.0
	cultivation_gain_label.offset_bottom = 2.0
	shell.add_child(cultivation_gain_label)

func _build_cultivation_event() -> void:
	cultivation_event_shell = PanelContainer.new()
	cultivation_event_shell.name = "CultivationEvent"
	cultivation_event_shell.visible = false
	cultivation_event_shell.z_index = 45
	cultivation_event_shell.anchor_left = 0.5
	cultivation_event_shell.anchor_right = 0.5
	cultivation_event_shell.anchor_top = 0.0
	cultivation_event_shell.anchor_bottom = 0.0
	cultivation_event_shell.offset_left = -142.0
	cultivation_event_shell.offset_right = 142.0
	cultivation_event_shell.offset_top = 166.0
	cultivation_event_shell.offset_bottom = 226.0
	cultivation_event_shell.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(cultivation_event_shell)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_top", 7)
	margin.add_theme_constant_override("margin_bottom", 7)
	cultivation_event_shell.add_child(margin)

	var col := VBoxContainer.new()
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	col.add_theme_constant_override("separation", -1)
	margin.add_child(col)

	cultivation_event_title = _readable_label("", 16, GOLD_HI)
	cultivation_event_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(cultivation_event_title)

	cultivation_event_subtitle = _readable_label("", 8, TEXT)
	cultivation_event_subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	cultivation_event_subtitle.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	col.add_child(cultivation_event_subtitle)

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

	primary_title_label = _readable_label("ĐỘT PHÁ", 13, GOLD_HI)
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

	var character := _add_action_cell(&"orb_character", ICON_CHARACTER, "Nhân Vật", "Trang bị · Thuộc tính", VIOLET, "CharacterAction")
	character.pressed.connect(func(): route_requested.emit(&"character"))

	var root := _add_action_cell(&"orb_root", ICON_ROOT, "Linh Căn", "Căn nguyên", MINT, "RootAction")
	root.pressed.connect(func(): character_section_requested.emit(&"profile"))

	combat_button = _add_action_cell(&"orb_combat", ICON_COMBAT, "Chiến Đấu", "Chưa mở", CYAN, "CombatAction")
	combat_action_visual = combat_button.get_meta("visual_root") as Control
	combat_subtitle_label = combat_button.get_meta("subtitle_label") as Label
	_set_action_enabled(combat_button, combat_action_visual, combat_subtitle_label, false, "Chưa mở")

func _set_action_enabled(button: Button, visual: Control, subtitle: Label, enabled: bool, disabled_text: String = "Chưa mở") -> void:
	button.disabled = not enabled
	if visual != null:
		visual.modulate = Color.WHITE if enabled else Color(0.50, 0.56, 0.62, 0.58)
	if subtitle != null and not enabled:
		subtitle.text = disabled_text

func _update_action_band() -> void:
	# The target reserves a stable four-orb band. The conditional advancement
	# plaque occupies the band immediately above it and must not compress orbs.
	_anchor_bottom_wide(quick_actions, 14.0, 14.0, -216.0, -98.0)

func _add_action_cell(art_id: StringName, icon: Texture2D, caption: String, subtitle: String, accent: Color, button_name: String) -> Button:
	# The entire destination cell is tappable. On mobile, limiting the hit target
	# to the 72 px orb made taps on the caption/subtitle feel broken.
	var cell := Control.new()
	cell.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	cell.custom_minimum_size = Vector2(0, 112)
	cell.mouse_filter = Control.MOUSE_FILTER_IGNORE
	quick_actions.add_child(cell)

	var center := CenterContainer.new()
	center.anchor_left = 0.0
	center.anchor_right = 1.0
	center.anchor_top = 0.0
	center.anchor_bottom = 0.0
	center.offset_top = 0.0
	center.offset_bottom = 76.0
	center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cell.add_child(center)

	var orb := Control.new()
	orb.custom_minimum_size = Vector2(72, 72)
	orb.mouse_filter = Control.MOUSE_FILTER_IGNORE
	center.add_child(orb)

	_add_action_orb_art(orb, art_id, icon, accent)

	var title := _readable_label(caption, 10, TEXT)
	title.anchor_left = 0.0
	title.anchor_right = 1.0
	title.anchor_top = 0.0
	title.anchor_bottom = 0.0
	title.offset_top = 76.0
	title.offset_bottom = 94.0
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	title.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	title.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cell.add_child(title)

	var sub := _readable_label(subtitle, 7, MUTED)
	sub.anchor_left = 0.0
	sub.anchor_right = 1.0
	sub.anchor_top = 0.0
	sub.anchor_bottom = 0.0
	sub.offset_top = 94.0
	sub.offset_bottom = 110.0
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	sub.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	sub.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cell.add_child(sub)

	var button := Button.new()
	button.name = button_name
	button.text = ""
	button.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	button.focus_mode = Control.FOCUS_NONE
	button.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	button.add_theme_stylebox_override(
		"hover",
		_flat(Color(accent.r, accent.g, accent.b, 0.075), 18, Color(accent.r, accent.g, accent.b, 0.58), 1)
	)
	button.add_theme_stylebox_override(
		"pressed",
		_flat(Color(accent.r, accent.g, accent.b, 0.14), 18, Color(accent.r, accent.g, accent.b, 0.92), 2)
	)
	button.add_theme_stylebox_override("disabled", StyleBoxEmpty.new())
	cell.add_child(button)

	button.set_meta("visual_root", cell)
	button.set_meta("subtitle_label", sub)
	return button

func _add_action_orb_art(orb: Control, art_id: StringName, fallback_icon: Texture2D, accent: Color) -> void:
	var production_art := HOME_ART.production_texture(art_id)
	if production_art != null:
		# The approved production texture already contains both the orb frame and
		# its semantic symbol. Do not double-frame or recolor it with fallback UI.
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
	# Production resource chips include an emblem on the left. Reserve that
	# space so the live numeric/caption layer remains readable instead of
	# sitting on top of the crystal/reincarnation symbol.
	margin.add_theme_constant_override("margin_left", 28 if art_texture != null else 7)
	margin.add_theme_constant_override("margin_right", 6 if art_texture != null else 7)
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
