extends Control
class_name CombatScreen

signal back_requested
signal fight_requested

const DAO_WIDGET := preload("res://scripts/combat/combat_dao_widget.gd")
const SKILL_RAIL := preload("res://scripts/combat/combat_skill_rail.gd")
const EVENT_PLAYER := preload("res://scripts/combat/combat_event_player.gd")

const TEXT := Color("f7f2e8")
const MUTED := Color("9fb0bd")
const GOLD := Color("e3bf70")
const CYAN := Color("70d9ff")
const DANGER := Color("ff8c7d")

var _title: Label
var _status: Label
var _enemy_name: Label
var _enemy_meta: Label
var _enemy_hp: ProgressBar
var _enemy_hp_text: Label
var _enemy_break: ProgressBar
var _enemy_actor: Label
var _player_actor: Label
var _tactical: Label
var _player_name: Label
var _player_hp: ProgressBar
var _player_hp_text: Label
var _spirit: ProgressBar
var _spirit_text: Label
var _ultimate: ProgressBar
var _ultimate_text: Label
var _challenge_button: Button
var _result: Label
var _dao_widget: CombatDaoWidget
var _skill_rail: CombatSkillRail
var _event_player: CombatEventPlayer
var _vm: Dictionary = {}


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_PASS
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_build()
	_event_player = EVENT_PLAYER.new()
	_event_player.name = "CombatEventPlayer"
	_event_player.event_ready.connect(_on_combat_event)
	_event_player.playback_finished.connect(_on_playback_finished)
	add_child(_event_player)


func set_presentation_active(active: bool) -> void:
	visible = active
	if not active and _event_player != null:
		_event_player.reset()


func bind(vm: Dictionary) -> void:
	_vm = vm.duplicate(true)
	var challenge: Dictionary = vm.get("challenge", {})
	var player: Dictionary = vm.get("player", {})
	var enemy: Dictionary = vm.get("enemy", {})
	var dao: Dictionary = vm.get("dao", {})
	var boss: Dictionary = vm.get("boss", {})
	var auto: Dictionary = vm.get("auto", {})

	_title.text = "%s · Tầng %d" % [
		str(challenge.get("zone_name", "Bí Cảnh")),
		int(challenge.get("zone_floor", challenge.get("floor", 1))),
	]
	_player_name.text = str(player.get("name", "Tu Sĩ"))
	_enemy_name.text = str(enemy.get("name", "Thủ Lĩnh"))
	_enemy_meta.text = "Lv.%d%s" % [
		int(enemy.get("level", 1)),
		" · BOSS" if bool(boss.get("isBoss", false)) else "",
	]

	_bind_hp(_player_hp, _player_hp_text, player.get("hp", {}))
	_bind_hp(_enemy_hp, _enemy_hp_text, enemy.get("hp", {}))
	_bind_vital(_spirit, _spirit_text, player.get("spirit", {}), "CN")
	_bind_vital(_ultimate, _ultimate_text, player.get("ultimate", {}), "ULT")

	var enemy_break: Dictionary = enemy.get("break", {})
	_enemy_break.value = clampf(float(enemy_break.get("ratio", 1.0)) * 100.0, 0.0, 100.0)

	_dao_widget.bind(dao)
	_skill_rail.bind(vm.get("skills", []), bool(auto.get("enabled", true)))

	var can_start := bool(challenge.get("can_start", false))
	_challenge_button.disabled = not can_start
	_challenge_button.visible = str(vm.get("mode", "prefight")) != "playback"
	_challenge_button.text = "KHIÊU CHIẾN" if can_start else "CHƯA THỂ KHIÊU CHIẾN"
	_status.text = "" if can_start else str(challenge.get("blocked_reason", ""))

	var result: Dictionary = vm.get("result", {})
	# A playback snapshot already knows the canonical outcome, but presentation must
	# not reveal it before the timestamped event stream reaches battle.end.
	_result.visible = not result.is_empty() and str(vm.get("mode", "prefight")) != "playback"
	if not result.is_empty():
		_result.text = "TRẤN SÁT" if bool(result.get("won", false)) else "THẤT BẠI"


func append_events(encounter_id: String, events: Array) -> void:
	if _event_player == null or events.is_empty():
		return
	_event_player.append_events(encounter_id, events)


func set_status_message(message: String) -> void:
	_status.text = message


func _build() -> void:
	var background := ColorRect.new()
	background.color = Color(0.008, 0.022, 0.035, 1.0)
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background)

	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 10)
	margin.add_theme_constant_override("margin_right", 10)
	margin.add_theme_constant_override("margin_top", 12)
	margin.add_theme_constant_override("margin_bottom", 10)
	add_child(margin)

	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 6)
	margin.add_child(root)

	var header := HBoxContainer.new()
	header.custom_minimum_size = Vector2(0, 42)
	root.add_child(header)

	var back := Button.new()
	back.name = "CombatBack"
	back.text = "‹"
	back.custom_minimum_size = Vector2(44, 40)
	back.pressed.connect(func(): back_requested.emit())
	header.add_child(back)

	_title = Label.new()
	_title.text = "Bí Cảnh"
	_title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_title.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_title.add_theme_color_override("font_color", GOLD)
	_title.add_theme_font_size_override("font_size", 14)
	header.add_child(_title)

	var spacer := Control.new()
	spacer.custom_minimum_size = Vector2(44, 40)
	header.add_child(spacer)

	var enemy_panel := _panel()
	enemy_panel.custom_minimum_size = Vector2(0, 86)
	root.add_child(enemy_panel)
	var enemy_col := VBoxContainer.new()
	enemy_col.add_theme_constant_override("separation", 2)
	enemy_panel.add_child(enemy_col)

	var enemy_head := HBoxContainer.new()
	enemy_col.add_child(enemy_head)
	_enemy_name = Label.new()
	_enemy_name.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_enemy_name.add_theme_color_override("font_color", DANGER)
	_enemy_name.add_theme_font_size_override("font_size", 13)
	enemy_head.add_child(_enemy_name)
	_enemy_meta = Label.new()
	_enemy_meta.add_theme_color_override("font_color", MUTED)
	_enemy_meta.add_theme_font_size_override("font_size", 9)
	enemy_head.add_child(_enemy_meta)

	_enemy_hp = ProgressBar.new()
	_enemy_hp.name = "CombatEnemyHP"
	_enemy_hp.max_value = 100
	_enemy_hp.value = 100
	_enemy_hp.show_percentage = false
	_enemy_hp.custom_minimum_size = Vector2(0, 12)
	enemy_col.add_child(_enemy_hp)
	_enemy_hp_text = _small_label("— / —")
	enemy_col.add_child(_enemy_hp_text)

	_enemy_break = ProgressBar.new()
	_enemy_break.name = "CombatEnemyBreak"
	_enemy_break.max_value = 100
	_enemy_break.value = 100
	_enemy_break.show_percentage = false
	_enemy_break.custom_minimum_size = Vector2(0, 6)
	enemy_col.add_child(_enemy_break)

	var battlefield := PanelContainer.new()
	battlefield.size_flags_vertical = Control.SIZE_EXPAND_FILL
	battlefield.custom_minimum_size = Vector2(0, 340)
	battlefield.add_theme_stylebox_override("panel", _battle_style())
	root.add_child(battlefield)

	var field := Control.new()
	field.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	battlefield.add_child(field)

	_enemy_actor = _actor_label("YÊU THÚ")
	_enemy_actor.anchor_left = 0.52
	_enemy_actor.anchor_right = 0.96
	_enemy_actor.anchor_top = 0.05
	_enemy_actor.anchor_bottom = 0.40
	field.add_child(_enemy_actor)

	_player_actor = _actor_label("TU SĨ")
	_player_actor.anchor_left = 0.04
	_player_actor.anchor_right = 0.48
	_player_actor.anchor_top = 0.58
	_player_actor.anchor_bottom = 0.94
	field.add_child(_player_actor)

	_tactical = Label.new()
	_tactical.name = "CombatTacticalLane"
	_tactical.anchor_left = 0.08
	_tactical.anchor_right = 0.92
	_tactical.anchor_top = 0.44
	_tactical.anchor_bottom = 0.56
	_tactical.text = "CHỜ GIAO TRANH"
	_tactical.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_tactical.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_tactical.add_theme_color_override("font_color", CYAN)
	_tactical.add_theme_font_size_override("font_size", 12)
	field.add_child(_tactical)

	_result = Label.new()
	_result.name = "CombatResult"
	_result.anchor_left = 0.18
	_result.anchor_right = 0.82
	_result.anchor_top = 0.38
	_result.anchor_bottom = 0.62
	_result.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_result.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_result.add_theme_color_override("font_color", GOLD)
	_result.add_theme_font_size_override("font_size", 24)
	_result.visible = false
	field.add_child(_result)

	var player_panel := _panel()
	player_panel.custom_minimum_size = Vector2(0, 92)
	root.add_child(player_panel)
	var player_col := VBoxContainer.new()
	player_col.add_theme_constant_override("separation", 2)
	player_panel.add_child(player_col)

	_player_name = Label.new()
	_player_name.add_theme_color_override("font_color", TEXT)
	_player_name.add_theme_font_size_override("font_size", 11)
	player_col.add_child(_player_name)

	_player_hp = ProgressBar.new()
	_player_hp.name = "CombatPlayerHP"
	_player_hp.max_value = 100
	_player_hp.value = 100
	_player_hp.show_percentage = false
	_player_hp.custom_minimum_size = Vector2(0, 9)
	player_col.add_child(_player_hp)
	_player_hp_text = _small_label("HP")
	player_col.add_child(_player_hp_text)

	var resource_row := HBoxContainer.new()
	resource_row.add_theme_constant_override("separation", 6)
	player_col.add_child(resource_row)
	_spirit = ProgressBar.new()
	_spirit.name = "CombatSpirit"
	_spirit.max_value = 100
	_spirit.value = 100
	_spirit.show_percentage = false
	_spirit.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	resource_row.add_child(_spirit)
	_spirit_text = _small_label("CN")
	resource_row.add_child(_spirit_text)
	_ultimate = ProgressBar.new()
	_ultimate.name = "CombatUltimate"
	_ultimate.max_value = 100
	_ultimate.value = 0
	_ultimate.show_percentage = false
	_ultimate.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	resource_row.add_child(_ultimate)
	_ultimate_text = _small_label("ULT")
	resource_row.add_child(_ultimate_text)

	_dao_widget = DAO_WIDGET.new()
	_dao_widget.name = "CombatDaoWidget"
	root.add_child(_dao_widget)

	_skill_rail = SKILL_RAIL.new()
	_skill_rail.name = "CombatSkillRail"
	root.add_child(_skill_rail)

	_challenge_button = Button.new()
	_challenge_button.name = "CombatChallenge"
	_challenge_button.text = "KHIÊU CHIẾN"
	_challenge_button.custom_minimum_size = Vector2(0, 46)
	_challenge_button.pressed.connect(func(): fight_requested.emit())
	root.add_child(_challenge_button)

	_status = _small_label("")
	_status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	root.add_child(_status)


func _on_combat_event(event: Dictionary) -> void:
	var type := str(event.get("type", ""))
	var payload: Dictionary = event.get("payload", {})
	var target := str(event.get("target", ""))
	match type:
		"battle.start":
			_result.visible = false
			_challenge_button.visible = false
			_tactical.text = "GIAO TRANH"
		"skill.cast.start":
			_tactical.text = str(event.get("skill_name", event.get("message", "THI TRIỂN")))
			_skill_rail.set_selected_skill(str(event.get("skill_id", "")))
		"combat.damage", "combat.dot":
			_apply_event_hp(target, payload)
			var amount := str(payload.get("amount", ""))
			if not amount.is_empty():
				_tactical.text = "-%s" % amount
		"combat.heal":
			_apply_event_hp(target, payload)
			_tactical.text = "+%s" % str(payload.get("amount", ""))
		"combat.break":
			if target == "enemy" and payload.has("poisePct"):
				_enemy_break.value = clampf(float(payload.get("poisePct", 100.0)), 0.0, 100.0)
			if str(payload.get("breakState", "")) == "broken":
				_tactical.text = "THẤT THẾ"
		"combat.resource":
			var resource_id := str(payload.get("resourceId", ""))
			if not resource_id.is_empty() and payload.has("resourceValue"):
				_dao_widget.apply_resource(resource_id, float(payload.get("resourceValue", 0.0)), float(payload.get("resourceMax", -1.0)))
			if payload.has("ultimateGauge"):
				var gauge := clampf(float(payload.get("ultimateGauge", 0.0)), 0.0, 100.0)
				_ultimate.value = gauge
				_ultimate_text.text = "ULT %.0f/100" % gauge
		"combat.mark":
			if str(_vm.get("main_dao_id", "")) == "mind" and target == "enemy" and payload.has("stacks"):
				_dao_widget.apply_target_mark(float(payload.get("stacks", 0.0)), float(payload.get("maxStacks", 5.0)))
		"boss.phase":
			_tactical.text = str(payload.get("phaseName", "BOSS CHUYỂN PHA"))
		"boss.counter":
			_tactical.text = "CỬA PHẢN CÔNG"
		"combat.shield.break":
			_tactical.text = "PHÁ KHIÊN"
		"actor.death":
			_apply_event_hp(target, payload)
		"battle.end":
			_tactical.text = "KẾT THÚC"
		_:
			pass


func _on_playback_finished(_encounter_id: String) -> void:
	var result: Dictionary = _vm.get("result", {})
	if result.is_empty():
		return
	_result.text = "TRẤN SÁT" if bool(result.get("won", false)) else "THẤT BẠI"
	_result.visible = true
	_status.text = "Boss chỉ mở tiến độ · tài nguyên thuộc Săn Ảo" if str(result.get("rewardContext", "")) == "progression-only" else ""


func _apply_event_hp(target: String, payload: Dictionary) -> void:
	if not payload.has("hpPct"):
		return
	var pct := clampf(float(payload.get("hpPct", 0.0)), 0.0, 100.0)
	var current := str(payload.get("hpCurrent", "—"))
	var maximum := str(payload.get("hpMax", "—"))
	if target == "enemy":
		_enemy_hp.value = pct
		_enemy_hp_text.text = "%s / %s" % [current, maximum]
	elif target == "player":
		_player_hp.value = pct
		_player_hp_text.text = "%s / %s" % [current, maximum]


func _bind_hp(bar: ProgressBar, label: Label, raw) -> void:
	var data: Dictionary = raw if typeof(raw) == TYPE_DICTIONARY else {}
	bar.value = clampf(float(data.get("ratio", 0.0)) * 100.0, 0.0, 100.0)
	label.text = "%s / %s" % [str(data.get("display_current", "—")), str(data.get("display_max", "—"))]


func _bind_vital(bar: ProgressBar, label: Label, raw, prefix: String) -> void:
	var data: Dictionary = raw if typeof(raw) == TYPE_DICTIONARY else {}
	var maximum := maxf(1.0, float(data.get("max", 1.0)))
	var current := clampf(float(data.get("current", 0.0)), 0.0, maximum)
	bar.max_value = maximum
	bar.value = current
	label.text = "%s %d/%d" % [prefix, int(round(current)), int(round(maximum))]


func _actor_label(text: String) -> Label:
	var label := Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.add_theme_color_override("font_color", Color(0.78, 0.88, 0.92, 0.62))
	label.add_theme_font_size_override("font_size", 18)
	label.add_theme_stylebox_override("normal", _actor_style())
	return label


func _small_label(text: String) -> Label:
	var label := Label.new()
	label.text = text
	label.add_theme_color_override("font_color", MUTED)
	label.add_theme_font_size_override("font_size", 8)
	return label


func _panel() -> PanelContainer:
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _panel_style())
	return panel


func _panel_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.012, 0.030, 0.045, 0.92)
	style.border_color = Color(0.44, 0.64, 0.78, 0.22)
	style.set_border_width_all(1)
	style.set_corner_radius_all(12)
	style.content_margin_left = 10
	style.content_margin_right = 10
	style.content_margin_top = 7
	style.content_margin_bottom = 7
	return style


func _battle_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.018, 0.050, 0.066, 0.72)
	style.border_color = Color(0.36, 0.66, 0.72, 0.20)
	style.set_border_width_all(1)
	style.set_corner_radius_all(18)
	return style


func _actor_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.04, 0.09, 0.11, 0.32)
	style.border_color = Color(0.50, 0.74, 0.78, 0.16)
	style.set_border_width_all(1)
	style.set_corner_radius_all(20)
	return style
