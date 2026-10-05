extends Control
class_name CombatScreen

signal back_requested
signal fight_requested

const STYLE := preload("res://scripts/combat/combat_style.gd")
const DAO_WIDGET := preload("res://scripts/combat/combat_dao_widget.gd")
const SKILL_RAIL := preload("res://scripts/combat/combat_skill_rail.gd")
const EVENT_PLAYER := preload("res://scripts/combat/combat_event_player.gd")
const BOSS_HUD := preload("res://scripts/combat/combat_boss_hud.gd")
const PLAYER_HUD := preload("res://scripts/combat/combat_player_hud.gd")
const TACTICAL_LANE := preload("res://scripts/combat/combat_tactical_lane.gd")

var _title: Label
var _floor: Label
var _status: Label
var _boss_hud: CombatBossHud
var _player_hud: CombatPlayerHud
var _lane: CombatTacticalLane
var _enemy_hp: ProgressBar
var _player_hp: ProgressBar
var _enemy_hp_text: Label
var _player_hp_text: Label
var _enemy_break: ProgressBar
var _tactical: Label
var _challenge_button: Button
var _result: Label
var _dao_widget: CombatDaoWidget
var _skill_rail: CombatSkillRail
var _event_player: CombatEventPlayer
var _vm: Dictionary = {}
var _battle_end_seen := false

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
		_lane.reset()
		_vm.clear()
		_battle_end_seen = false

func bind(vm: Dictionary) -> void:
	var same_playback := str(vm.get("mode", "")) == "playback" and not str(vm.get("encounter_id", "")).is_empty() and str(vm.get("encounter_id", "")) == str(_vm.get("encounter_id", ""))
	_vm = vm.duplicate(true)
	if same_playback:
		return
	_battle_end_seen = false
	_lane.reset()
	_lane.visible = true
	var challenge: Dictionary = vm.get("challenge", {})
	_title.text = "Bí Cảnh · %s" % str(challenge.get("zone_name", "Thanh Hà"))
	_floor.text = "Tầng %d" % int(challenge.get("zone_floor", challenge.get("floor", 1)))
	_boss_hud.bind(vm.get("enemy", {}), vm.get("boss", {}))
	_player_hud.bind(vm.get("player", {}))
	_dao_widget.bind(vm.get("dao", {}))
	_skill_rail.bind(vm.get("skills", []), bool(vm.get("auto", {}).get("enabled", true)))
	_skill_rail.set_ultimate(vm.get("player", {}).get("ultimate", {}))
	var can_start := bool(challenge.get("can_start", false))
	_challenge_button.disabled = not can_start
	_challenge_button.visible = str(vm.get("mode", "prefight")) != "playback"
	_challenge_button.text = "KHIÊU CHIẾN" if can_start else "CHƯA THỂ KHIÊU CHIẾN"
	set_status_message("" if can_start else str(challenge.get("blocked_reason", "")))
	var result: Dictionary = vm.get("result", {})
	_result.visible = not result.is_empty() and str(vm.get("mode", "prefight")) != "playback"
	if not result.is_empty():
		_result.text = "TRẤN SÁT" if bool(result.get("won", false)) else "THẤT BẠI"

func append_events(encounter_id: String, events: Array) -> void:
	if _event_player != null and not events.is_empty():
		_event_player.append_events(encounter_id, events)

func set_status_message(message: String) -> void:
	_status.text = message
	_status.visible = not message.is_empty()

func _build() -> void:
	var background := ColorRect.new()
	background.color = Color("050c12")
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background)
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side in ["left", "right", "top", "bottom"]:
		margin.add_theme_constant_override("margin_" + side, 10 if side in ["left", "right"] else 6)
	add_child(margin)
	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 6)
	margin.add_child(root)
	var header := HBoxContainer.new()
	root.add_child(header)
	var back := Button.new()
	back.name = "CombatBack"
	back.text = "‹"
	back.custom_minimum_size = Vector2(44, 44)
	back.add_theme_stylebox_override("normal", STYLE.surface(STYLE.GOLD, 0.18))
	back.pressed.connect(func(): back_requested.emit())
	header.add_child(back)
	var heading := VBoxContainer.new()
	heading.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	heading.add_theme_constant_override("separation", 0)
	header.add_child(heading)
	_title = STYLE.label("Bí Cảnh", 13, STYLE.GOLD)
	_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	heading.add_child(_title)
	_floor = STYLE.label("Tầng 1", 9, STYLE.MUTED)
	_floor.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	heading.add_child(_floor)
	var spacer := Control.new()
	spacer.custom_minimum_size = Vector2(44, 0)
	header.add_child(spacer)
	_boss_hud = BOSS_HUD.new()
	_boss_hud.name = "CombatBossHud"
	root.add_child(_boss_hud)
	_enemy_hp = _boss_hud.hp
	_enemy_hp_text = _boss_hud.hp_text
	_enemy_break = _boss_hud.break_bar
	var field := Control.new()
	field.name = "CombatBattlefield"
	field.size_flags_vertical = Control.SIZE_EXPAND_FILL
	field.custom_minimum_size = Vector2(0, 260)
	field.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(field)
	var enemy := _actor("YÊU THÚ", STYLE.RED)
	enemy.name = "CombatEnemyActor"
	enemy.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	enemy.anchor_left = 0.50
	enemy.anchor_right = 0.97
	enemy.anchor_top = 0.02
	enemy.anchor_bottom = 0.38
	field.add_child(enemy)
	var player := _actor("TU SĨ", STYLE.CYAN)
	player.name = "CombatPlayerActor"
	player.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	player.anchor_left = 0.03
	player.anchor_right = 0.50
	player.anchor_top = 0.62
	player.anchor_bottom = 0.98
	field.add_child(player)
	_lane = TACTICAL_LANE.new()
	_lane.name = "CombatTacticalSurface"
	_lane.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_lane.anchor_left = 0.13
	_lane.anchor_right = 0.87
	_lane.anchor_top = 0.43
	_lane.anchor_bottom = 0.57
	_lane.alignment = BoxContainer.ALIGNMENT_CENTER
	field.add_child(_lane)
	_tactical = _lane.title
	_result = STYLE.label("", 25, STYLE.GOLD)
	_result.name = "CombatResult"
	_result.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_result.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_result.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_result.anchor_top = 0.40
	_result.anchor_bottom = 0.60
	_result.visible = false
	field.add_child(_result)
	_player_hud = PLAYER_HUD.new()
	_player_hud.name = "CombatPlayerHud"
	root.add_child(_player_hud)
	_player_hp = _player_hud.hp
	_player_hp_text = _player_hud.hp_text
	_dao_widget = DAO_WIDGET.new()
	_dao_widget.name = "CombatDaoWidget"
	root.add_child(_dao_widget)
	_dao_widget.payoff_presented.connect(func(label: String): _lane.present({"type": "combat.daoPayoff", "label": label}))
	_skill_rail = SKILL_RAIL.new()
	_skill_rail.name = "CombatSkillRail"
	root.add_child(_skill_rail)
	_challenge_button = Button.new()
	_challenge_button.name = "CombatChallenge"
	_challenge_button.custom_minimum_size = Vector2(0, 44)
	_challenge_button.add_theme_stylebox_override("normal", STYLE.surface(STYLE.GOLD, 0.36))
	_challenge_button.add_theme_font_size_override("font_size", 12)
	_challenge_button.pressed.connect(func(): fight_requested.emit())
	root.add_child(_challenge_button)
	_status = STYLE.label("", 8, STYLE.MUTED)
	_status.name = "CombatStatus"
	_status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_status.visible = false
	root.add_child(_status)

func _actor(text: String, accent: Color) -> Label:
	var node := STYLE.label(text, 16, Color(accent, 0.35))
	node.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	node.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	return node

func _on_combat_event(event: Dictionary) -> void:
	var type := str(event.get("type", ""))
	var payload: Dictionary = event.get("payload", {})
	var target := str(event.get("target", ""))
	_lane.present(event)
	_skill_rail.apply_event(event)
	match type:
		"battle.start":
			_result.visible = false
			_challenge_button.visible = false
			_apply_event_hp(target, payload)
			if payload.has("monsterName"):
				_boss_hud.identity.text = str(payload.monsterName)
		"skill.cast.start":
			if str(event.get("actor", "")) == "player":
				_skill_rail.set_selected_skill(str(event.get("skill_id", "")))
		"combat.damage", "combat.dot", "combat.heal", "actor.death":
			_apply_event_hp(target, payload)
		"combat.break":
			if target == "enemy" and payload.has("poisePct"):
				_enemy_break.value = clampf(float(payload.poisePct), 0.0, 100.0)
		"combat.resource":
			var id := str(payload.get("resourceId", ""))
			if str(event.get("actor", "")) == "player" and not id.is_empty() and payload.has("resourceValue"):
				_dao_widget.apply_resource(id, float(payload.resourceValue), float(payload.get("resourceMax", -1.0)))
			if str(event.get("actor", "")) == "player" and payload.has("ultimateGauge"):
				_skill_rail.set_ultimate({"current": payload.ultimateGauge, "max": 100.0})
		"combat.daoProjection":
			if str(event.get("actor", "")) == "player":
				_dao_widget.apply_projection(payload.get("dao", {}))
		"combat.mark":
			if str(_vm.get("main_dao_id", "")) == "mind" and target == "enemy" and payload.has("stacks"):
				_dao_widget.apply_target_mark(float(payload.stacks), float(payload.get("maxStacks", 5.0)))
		"battle.end":
			_battle_end_seen = true
			_skill_rail.clear_selection()

func _on_playback_finished(_encounter_id: String) -> void:
	var result: Dictionary = _vm.get("result", {})
	if result.is_empty() or not _battle_end_seen:
		return
	_result.text = "TRẤN SÁT" if bool(result.get("won", false)) else "THẤT BẠI"
	_result.visible = true
	_lane.visible = false
	set_status_message("Boss chỉ mở tiến độ · tài nguyên thuộc Săn Ảo" if str(result.get("rewardContext", "")) == "progression-only" else "")

func _apply_event_hp(target: String, payload: Dictionary) -> void:
	if not payload.has("hpPct"):
		return
	var pct := clampf(float(payload.hpPct), 0.0, 100.0)
	var text := "%s / %s" % [str(payload.get("hpCurrent", "—")), str(payload.get("hpMax", "—"))]
	if target == "enemy":
		_enemy_hp.value = pct
		_enemy_hp_text.text = text
	elif target == "player":
		_player_hp.value = pct
		_player_hp_text.text = text
