extends Control

const BACKEND_BRIDGE_SCRIPT := preload("res://scripts/core/backend_bridge.gd")
const HOME_VIEW_MODEL := preload("res://scripts/models/home_view_model.gd")
const HOME_STAGE_SCRIPT := preload("res://scripts/home/home_stage.gd")
const HOME_HUD_SCRIPT := preload("res://scripts/home/home_hud.gd")
const HOME_OVERLAY_SCRIPT := preload("res://scripts/home/home_overlay.gd")
const HOME_NAV_SCRIPT := preload("res://scripts/home/home_nav.gd")
const CHARACTER_VIEW_MODEL := preload("res://scripts/models/character_view_model.gd")
const CHARACTER_SCREEN_SCRIPT := preload("res://scripts/character/character_screen.gd")

var backend_bridge
var stage
var hud
var overlay
var nav
var character_screen

var _home: Dictionary = {}
var _character_vm: Dictionary = {}
var _vm: Dictionary = {}
var _last_home_generated_at := 0
var _last_character_generated_at := 0
var _pending_character_detail: StringName = &""

var _home_observed := false
var _last_home_realm_order := -1
var _last_home_realm_name := ""
var _last_ling_quang_tick := -1
var _pending_cultivation_action := ""
var _pending_breakthrough_from_realm := ""

func _ready() -> void:
	_build_home()
	_connect_ui()
	_start_backend()

func _build_home() -> void:
	stage = HOME_STAGE_SCRIPT.new()
	stage.name = "HomeStage"
	stage.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(stage)

	hud = HOME_HUD_SCRIPT.new()
	hud.name = "HomeHUD"
	hud.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(hud)

	character_screen = CHARACTER_SCREEN_SCRIPT.new()
	character_screen.name = "CharacterScreen"
	character_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	character_screen.visible = false
	add_child(character_screen)

	nav = HOME_NAV_SCRIPT.new()
	nav.name = "HomeNav"
	nav.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(nav)

	overlay = HOME_OVERLAY_SCRIPT.new()
	overlay.name = "HomeOverlay"
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(overlay)

func _connect_ui() -> void:
	hud.identity_pressed.connect(_open_identity)
	hud.cultivation_pressed.connect(_open_cultivation)
	hud.retreat_pressed.connect(_open_retreat)
	hud.route_requested.connect(_on_route_requested)
	hud.character_section_requested.connect(_on_home_character_section_requested)
	hud.primary_action_requested.connect(_on_primary_action)
	nav.route_requested.connect(_on_route_requested)
	overlay.retreat_hours_selected.connect(_on_retreat_hours_selected)
	character_screen.detail_requested.connect(_on_character_detail_requested)
	character_screen.equipment_action_requested.connect(_on_character_equipment_action_requested)
	character_screen.profile_action_requested.connect(_on_character_profile_action_requested)
	character_screen.potential_action_requested.connect(_on_character_potential_action_requested)
	AppState.route_changed.connect(_on_route_changed)

func _start_backend() -> void:
	backend_bridge = BACKEND_BRIDGE_SCRIPT.new()
	backend_bridge.name = "BackendBridge"
	backend_bridge.home_updated.connect(_on_home_updated)
	backend_bridge.character_updated.connect(_on_character_updated)
	backend_bridge.bridge_status_changed.connect(_on_bridge_status_changed)
	backend_bridge.action_failed.connect(_on_action_failed)
	backend_bridge.action_completed.connect(_on_action_completed)
	add_child(backend_bridge)

func _on_home_updated(home: Dictionary) -> void:
	var generated_at := int(home.get("generatedAtUnixMs", 0))
	if generated_at > 0 and generated_at < _last_home_generated_at:
		return

	var vm := HOME_VIEW_MODEL.build(home)
	if vm.get("ok", false) != true:
		_on_action_failed(str(vm.get("error", "Home DTO không hợp lệ")))
		return

	_last_home_generated_at = maxi(_last_home_generated_at, generated_at)

	var identity: Dictionary = vm.get("identity", {})
	var progression: Dictionary = vm.get("progression", {})
	var reincarnation_r3: Dictionary = progression.get("reincarnation_r3", {})
	var realm_order := int(identity.get("realm_order", -1))
	var realm_name := str(identity.get("realm", ""))
	var ling_tick := int(reincarnation_r3.get("last_ling_quang_tick", 0))
	var ling_multiplier := int(round(float(reincarnation_r3.get("last_ling_quang_multiplier", 1.0))))
	var did_breakthrough := false

	if not _home_observed:
		_home_observed = true
		_last_home_realm_order = realm_order
		_last_home_realm_name = realm_name
		_last_ling_quang_tick = ling_tick
	else:
		if realm_order > _last_home_realm_order:
			var steps := realm_order - _last_home_realm_order
			var primary_transition := _pending_cultivation_action in ["ascendRealmV140", "tribulationV140"]
			if not primary_transition and hud.visible:
				hud.show_breakthrough(_last_home_realm_name, realm_name, steps, false)
				stage.play_breakthrough_burst(false)
				did_breakthrough = true
		_last_home_realm_order = realm_order
		_last_home_realm_name = realm_name

		if ling_tick > _last_ling_quang_tick:
			if ling_multiplier > 1 and not did_breakthrough and hud.visible:
				hud.show_ling_quang(ling_multiplier)
				stage.play_ling_quang_burst(ling_multiplier)
			_last_ling_quang_tick = ling_tick

	_home = home
	_vm = vm
	stage.bind(vm)
	hud.bind(vm)

func _on_character_updated(character_view: Dictionary) -> void:
	var generated_at := int(character_view.get("generatedAtUnixMs", 0))
	if generated_at > 0 and generated_at < _last_character_generated_at:
		return
	var vm := CHARACTER_VIEW_MODEL.build(character_view)
	if vm.get("ok", false) != true:
		_on_action_failed(str(vm.get("error", "Character DTO không hợp lệ")))
		return
	_last_character_generated_at = maxi(_last_character_generated_at, generated_at)
	_character_vm = vm
	character_screen.bind(vm)
	if _pending_character_detail != &"":
		character_screen.open_detail(_pending_character_detail)
		_pending_character_detail = &""

func _on_bridge_status_changed(online: bool, message: String) -> void:
	hud.set_bridge_status(online, message)
	character_screen.set_bridge_status(online, message)

func _on_action_failed(message: String) -> void:
	hud.set_status_message(message)
	character_screen.set_status_message(message)
	_pending_cultivation_action = ""
	_pending_breakthrough_from_realm = ""

func _on_action_completed(action_id: String, result: Dictionary) -> void:
	if action_id == "retreatV140":
		var used := float(result.get("hoursUsed", 0))
		var gained := float(result.get("gained", 0))
		if gained > 0:
			hud.set_status_message("Bế Quan %.2fh · +%s Tu Vi" % [used, _fmt_num(gained)])
			stage.play_meditation_surge(1.35)
		else:
			hud.set_status_message("Bế Quan chưa tạo thêm Tu Vi")
	elif action_id == "ascendRealmV140":
		var to_realm := str(_vm.get("identity", {}).get("realm", "Cảnh giới mới"))
		var from_realm := _pending_breakthrough_from_realm if not _pending_breakthrough_from_realm.is_empty() else "Cảnh giới cũ"
		hud.show_breakthrough(from_realm, to_realm, 1, true)
		hud.set_status_message("Đột Phá thành công")
		stage.play_breakthrough_burst(true)
		_pending_cultivation_action = ""
		_pending_breakthrough_from_realm = ""
	elif action_id == "tribulationV140":
		var passed := bool(result.get("passed", false))
		var kind := str(result.get("kind", ""))
		var r3: Dictionary = _vm.get("progression", {}).get("reincarnation_r3", {})
		var temper_stacks := int(r3.get("tribulation_temper_stacks", 0))
		hud.show_tribulation_result(passed, kind, temper_stacks)
		if passed:
			hud.set_status_message("Độ Kiếp thành công")
			stage.play_breakthrough_burst(true)
		else:
			hud.set_status_message("Độ Kiếp thất bại · Thương Thế tăng")
		_pending_cultivation_action = ""
		_pending_breakthrough_from_realm = ""
	elif action_id == "equipItem":
		character_screen.set_status_message("Đã cập nhật trang bị")
		backend_bridge.refresh_character()
	elif action_id in ["nourishBloodline", "advanceBloodline", "advancePhysique"]:
		character_screen.set_status_message("Hồ sơ tu hành đã cập nhật")
		backend_bridge.refresh_character()
	elif action_id == "spendPotential":
		character_screen.set_status_message("Đã phân bổ Điểm Tiềm Năng")
		backend_bridge.refresh_character()

func _open_identity() -> void:
	if _vm.is_empty():
		return
	overlay.show_identity(_vm)

func _open_cultivation() -> void:
	if _vm.is_empty():
		return
	overlay.show_cultivation(_vm)

func _open_retreat() -> void:
	if _vm.is_empty():
		return
	overlay.show_retreat(_vm)

func _on_retreat_hours_selected(hours: int) -> void:
	hud.set_status_message("Đang Bế Quan %dh…" % hours)
	backend_bridge.perform_action("retreatV140", {"hours": hours})

func _on_primary_action(action_id: String) -> void:
	if action_id.is_empty():
		return
	if action_id in ["ascendRealmV140", "tribulationV140"]:
		_pending_cultivation_action = action_id
		_pending_breakthrough_from_realm = str(_vm.get("identity", {}).get("realm", ""))
	backend_bridge.perform_action(action_id)

func _on_route_requested(route_id: StringName) -> void:
	if route_id not in [&"home", &"character"]:
		hud.set_status_message("Chức năng này chưa mở trong bản Godot hiện tại")
		return
	AppState.request_route(route_id)

func _on_home_character_section_requested(section_id: StringName) -> void:
	_pending_character_detail = section_id
	AppState.request_route(&"character")

func _on_route_changed(route_id: StringName) -> void:
	if route_id not in [&"home", &"character"]:
		# Never leave Home visible while a non-existent destination looks selected.
		# Until a Godot screen exists, Home remains the truthful active surface.
		nav.set_route(&"home")
		character_screen.visible = false
		character_screen.hide_detail()
		stage.visible = true
		hud.visible = true
		overlay.visible = true
		hud.set_status_message("%s chưa có màn Godot" % _route_label(route_id))
		return

	nav.set_route(route_id)
	var character_active := route_id == &"character"
	character_screen.visible = character_active
	stage.visible = not character_active
	hud.visible = not character_active
	overlay.visible = not character_active
	if character_active:
		character_screen.set_status_message("Đang tải nhân vật…")
		backend_bridge.refresh_character()
	else:
		character_screen.hide_detail()

func _on_character_detail_requested(detail_id: StringName) -> void:
	match detail_id:
		&"equipment", &"stats", &"profile", &"potential":
			character_screen.open_detail(detail_id)
		_:
			character_screen.set_status_message(String(detail_id))

func _on_character_equipment_action_requested(item_id: String) -> void:
	if item_id.is_empty():
		return
	backend_bridge.perform_action("equipItem", {"itemId": item_id})

func _on_character_profile_action_requested(action_id: String, payload: Dictionary) -> void:
	if action_id.is_empty():
		return
	backend_bridge.perform_action(action_id, payload)

func _on_character_potential_action_requested(stat_id: String, points: int) -> void:
	if stat_id.is_empty() or points <= 0:
		return
	backend_bridge.perform_action("spendPotential", {"statId": stat_id, "points": points})

func _route_label(route_id: StringName) -> String:
	var labels := {
		&"character": "Nhân Vật",
		&"artifacts": "Pháp Bảo",
		&"pets": "Linh Thú",
		&"world": "Bản Đồ",
		&"faction": "Tông Môn",
		&"roots": "Linh Căn",
		&"dungeons": "Chiến Đấu",
	}
	return str(labels.get(route_id, String(route_id)))

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
