class_name CombatViewModelTest
extends GdUnitTestSuite

const COMBAT_VIEW_MODEL := preload("res://scripts/models/combat_view_model.gd")
const COMBAT_SCREEN := preload("res://scripts/combat/combat_screen.gd")
const EVENT_PLAYER := preload("res://scripts/combat/combat_event_player.gd")
const BRIDGE := preload("res://scripts/core/backend_bridge.gd")

func test_production_layout_at_four_portrait_viewports() -> void:
	for viewport_size in [Vector2i(360, 800), Vector2i(390, 844), Vector2i(412, 915), Vector2i(430, 932)]:
		var viewport := SubViewport.new()
		viewport.size = viewport_size
		add_child(viewport)
		var screen := COMBAT_SCREEN.new()
		viewport.add_child(screen)
		screen.bind(COMBAT_VIEW_MODEL.build(_valid_combat()))
		await get_tree().process_frame
		await get_tree().process_frame
		var field := screen.find_child("CombatBattlefield", true, false) as Control
		assert_float(field.size.y / viewport_size.y).is_greater_equal(0.55)
		assert_float(field.get_global_rect().end.y).is_less_equal(screen._player_hud.get_global_rect().position.y)
		var row := screen._skill_rail._active_row
		assert_int(row.get_child_count()).is_equal(5)
		for slot in row.get_children():
			assert_float(slot.get_global_rect().position.x).is_greater_equal(8.0)
			assert_float(slot.get_global_rect().end.x).is_less_equal(float(viewport_size.x - 8))
			assert_float(slot.get_global_rect().position.y).is_equal(row.get_global_rect().position.y)
		assert_float(screen._skill_rail._ultimate.get_global_rect().end.y).is_less_equal(float(viewport_size.y - 6))
		assert_bool(screen._skill_rail._auto.is_visible_in_tree()).is_true()
		assert_int(screen._skill_rail._cards.size()).is_equal(7)
		assert_bool(screen._result.visible).is_false()
		viewport.free()

func test_tactical_priority_and_only_exported_cast_progress() -> void:
	var screen := COMBAT_SCREEN.new()
	add_child(screen)
	screen.bind(COMBAT_VIEW_MODEL.build(_valid_combat()))
	screen._on_combat_event({"type":"skill.cast.start", "actor":"enemy", "skill_name":"Boss cast", "payload":{"bossTelegraph":true, "castTime":4.0}})
	screen._on_combat_event({"type":"skill.cast.start", "actor":"player", "skill_name":"Basic", "payload":{}})
	assert_str(screen._tactical.text).is_equal("Boss cast")
	assert_bool(screen._lane.progress.visible).is_true()
	screen._lane._process(4.1)
	screen._on_combat_event({"type":"boss.counter", "payload":{}})
	screen._on_combat_event({"type":"combat.break", "payload":{"breakState":"broken"}})
	assert_str(screen._tactical.text).is_equal("CỬA PHẢN CÔNG")
	assert_bool(screen._lane.progress.visible).is_false()
	screen.free()

func test_artifact_damage_event_spawns_presentation_impact_without_mutating_authority() -> void:
	var screen := COMBAT_SCREEN.new()
	add_child(screen)
	screen.bind(COMBAT_VIEW_MODEL.build(_valid_combat()))
	var before_child_count := screen._battlefield.get_child_count()
	screen._on_combat_event({
		"type": "combat.damage",
		"actor": "player",
		"target": "enemy",
		"skill_id": "skill.dao.artifact.strike",
		"payload": {"hpPct": 82, "hpCurrent": 820, "hpMax": 1000},
	})
	assert_float(screen._enemy_hp.value).is_equal(82.0)
	assert_int(screen._battlefield.get_child_count()).is_greater_equal(before_child_count + 1)
	screen.free()


func test_read_only_rail_uses_exported_cooldown_and_one_gauge() -> void:
	var screen := COMBAT_SCREEN.new()
	add_child(screen)
	var payload := _valid_combat()
	payload.snapshot.player.ultimate.current = 73
	screen.bind(COMBAT_VIEW_MODEL.build(payload))
	assert_str(screen._skill_rail._ultimate._gauge_text.text).is_equal("73/100")
	screen._on_combat_event({"type":"combat.resource", "actor":"player", "skill_id":"active.0", "payload":{"cooldownRemaining":4.3,"cooldownTotal":10.0}})
	var slot := screen._skill_rail._cards["active.0"] as CombatSkillSlot
	assert_str(slot._state.text).is_equal("4.3s")
	screen._on_combat_event({"type":"combat.resource", "actor":"enemy", "skill_id":"active.0", "payload":{"cooldownRemaining":0,"resourceId":"artifactSourcesV2","resourceValue":0}})
	assert_str(slot._state.text).is_equal("4.3s")
	assert_int(int(screen._dao_widget._dao.meters[0].value)).is_equal(3)
	assert_bool(slot.is_class("Button")).is_false()
	screen._skill_rail.set_selected_skill("active.0")
	assert_bool(slot.selected).is_true()
	screen._on_combat_event({"type":"combat.resource", "actor":"enemy", "payload":{"ultimateGauge":100}})
	assert_str(screen._skill_rail._ultimate._gauge_text.text).is_equal("73/100")
	screen.free()


func test_bridge_cursor_tracks_each_encounter_independently() -> void:
	var bridge := BRIDGE.new()
	var payload := _valid_combat()
	payload["eventCursor"] = 90
	bridge._consume_combat(payload)
	assert_int(bridge._combat_cursor).is_equal(90)
	payload["snapshot"]["encounterId"] = "next"
	payload["eventCursor"] = 2
	bridge._consume_combat(payload)
	assert_int(bridge._combat_cursor).is_equal(2)
	payload["eventCursor"] = 1
	bridge._consume_combat(payload)
	assert_int(bridge._combat_cursor).is_equal(2)
	bridge.free()


func test_poll_preserves_event_hp_and_requires_battle_end_for_result() -> void:
	var screen := COMBAT_SCREEN.new()
	add_child(screen)
	var payload := _valid_combat()
	payload["snapshot"]["result"] = {"won": true}
	var vm := COMBAT_VIEW_MODEL.build(payload)
	screen.bind(vm)
	screen._on_combat_event({"type": "combat.damage", "target": "enemy", "payload": {"hpPct": 17}})
	screen.bind(vm)
	assert_float(screen._enemy_hp.value).is_equal(17.0)
	screen._on_playback_finished("hunt.1.1")
	assert_bool(screen._result.visible).is_false()
	screen._on_combat_event({"type": "battle.end"})
	screen._on_playback_finished("hunt.1.1")
	screen.bind(vm)
	assert_bool(screen._result.visible).is_true()
	screen.set_presentation_active(false)
	screen.bind(vm)
	assert_float(screen._enemy_hp.value).is_equal(100.0)
	screen.free()


func test_event_replay_is_deduplicated_per_encounter() -> void:
	var player := EVENT_PLAYER.new()
	add_child(player)
	var events := [{"cursor": 1, "time": 0.0, "type": "battle.start"}]
	assert_int(player.append_events("first", events)).is_equal(1)
	player._process(0.1)
	assert_int(player.append_events("first", events)).is_equal(0)
	assert_int(player.pending_count()).is_equal(0)
	assert_int(player.append_events("second", events)).is_equal(1)
	player.reset()
	assert_int(player.pending_count()).is_equal(0)
	assert_bool(player.is_playing()).is_false()
	player.free()


func test_build_maps_canonical_combat_contract() -> void:
	var vm := COMBAT_VIEW_MODEL.build(_valid_combat())
	assert_bool(vm.get("ok", false)).is_true()
	assert_str(str(vm.get("schema", ""))).is_equal("godot-combat-view-model.v1")
	assert_str(str(vm.get("main_dao_id", ""))).is_equal("artifact")
	assert_str(str(vm["dao"]["label"])).is_equal("Ngự Khí Đạo")
	assert_str(str(vm["dao"]["meters"][0]["label"])).is_equal("Khí Linh")
	assert_int(int(vm["dao"]["meters"][0]["value"])).is_equal(3)
	assert_bool(bool(vm["challenge"]["can_start"])).is_true()
	assert_int(int(vm["skills"].size())).is_equal(7)
	assert_int(int(vm["events"].size())).is_equal(2)
	assert_int(int(vm["event_cursor"])).is_equal(2)


func test_build_preserves_visual_metadata_without_recalculating_floor_or_element() -> void:
	var payload := _valid_combat()
	payload.snapshot.environment = {
		"mapId": "realm-map.2.4", "majorRealmIndex": 2, "realmName": "Trúc Cơ",
		"biomeName": "Lôi Minh Cốc", "zone": 4, "zoneName": "Địa Vực",
		"zoneFloor": 21, "localFloor": 321, "primaryElement": "Water",
	}
	payload.snapshot.enemy.archetypeId = "serpent"
	payload.snapshot.skills[0].daoId = "spell"
	var original := payload.duplicate(true)
	var vm := COMBAT_VIEW_MODEL.build(payload)
	assert_bool(vm.ok).is_true()
	assert_str(vm.enemy.archetype_id).is_equal("serpent")
	assert_str(vm.skills[0].dao_id).is_equal("spell")
	assert_str(vm.environment.map_id).is_equal("realm-map.2.4")
	assert_int(vm.environment.major_realm_index).is_equal(2)
	assert_str(vm.environment.realm_name).is_equal("Trúc Cơ")
	assert_str(vm.environment.biome_name).is_equal("Lôi Minh Cốc")
	assert_int(vm.environment.zone).is_equal(4)
	assert_str(vm.environment.zone_name).is_equal("Địa Vực")
	assert_int(vm.environment.zone_floor).is_equal(21)
	assert_int(vm.environment.local_floor).is_equal(321)
	assert_str(vm.environment.primary_element).is_equal("Water")
	assert_dict(payload).is_equal(original)


func test_build_accepts_legacy_visual_metadata_absence_and_null_environment() -> void:
	var payload := _valid_combat()
	var vm := COMBAT_VIEW_MODEL.build(payload)
	assert_bool(vm.ok).is_true()
	assert_str(vm.enemy.archetype_id).is_equal("")
	assert_str(vm.environment.biome_name).is_equal("")
	assert_str(vm.environment.primary_element).is_equal("")
	assert_int(vm.environment.major_realm_index).is_equal(0)
	payload.snapshot.environment = null
	vm = COMBAT_VIEW_MODEL.build(payload)
	assert_bool(vm.ok).is_true()
	assert_str(vm.environment.map_id).is_equal("")


func test_body_projection_contract_does_not_expose_legacy_huyet_khi_meter() -> void:
	var payload := _valid_combat()
	payload["snapshot"]["mainDaoId"] = "body"
	payload["snapshot"]["dao"] = {
		"id": "body",
		"label": "Thể Đạo",
		"anchorKind": "self",
		"meters": [
			{"id": "counterForce", "label": "Phản Thế", "value": 100, "max": 100, "targetOwned": false},
		],
		"flags": [{"id": "bodyPerfect", "label": "Chân Thân Viên Mãn", "active": true}],
		"detail": {},
	}
	var vm := COMBAT_VIEW_MODEL.build(payload)
	assert_int(int(vm["dao"]["meters"].size())).is_equal(1)
	assert_str(str(vm["dao"]["meters"][0]["id"])).is_equal("counterForce")
	assert_str(str(vm["dao"]["meters"][0]["label"])).is_equal("Phản Thế")


func test_build_rejects_wrong_combat_authority() -> void:
	var payload := _valid_combat()
	payload["authority"]["combat"] = "combat-kernel.v2"
	var vm := COMBAT_VIEW_MODEL.build(payload)
	assert_bool(vm.get("ok", true)).is_false()
	assert_str(str(vm.get("error", ""))).contains("Combat authority")


func test_build_keeps_mind_target_marks_as_target_owned() -> void:
	var payload := _valid_combat()
	payload["snapshot"]["mainDaoId"] = "mind"
	payload["snapshot"]["dao"] = {
		"id": "mind",
		"label": "Thần Niệm Đạo",
		"anchorKind": "target",
		"meters": [
			{"id": "mindMarkCount", "label": "Thần Ấn", "value": 4, "max": 5, "targetOwned": true},
			{"id": "mindPassiveStack", "label": "Niệm Lực", "value": 12, "max": 20, "targetOwned": false},
		],
		"flags": [],
		"detail": {},
	}
	var vm := COMBAT_VIEW_MODEL.build(payload)
	assert_bool(bool(vm["dao"]["meters"][0]["target_owned"])).is_true()
	assert_int(int(vm["dao"]["meters"][0]["max"])).is_equal(5)


func _valid_combat() -> Dictionary:
	var skills: Array = []
	skills.append({"id": "basic", "name": "Basic", "slotClass": "basic", "ready": true})
	for i in range(5):
		skills.append({"id": "active.%d" % i, "name": "Active %d" % i, "slotClass": "active", "ready": true})
	skills.append({"id": "ultimate", "name": "Ultimate", "slotClass": "ultimate", "ready": false})
	return {
		"ok": true,
		"schema": "godot-combat-bridge.v1",
		"bridgeVersion": "godot-bridge.v2",
		"generatedAtUnixMs": 1,
		"authority": {
			"combat": "combat-kernel.v3",
			"dao": "battle-dao.runtime.v2",
			"stats": "combat-stat.v168",
			"transport": "combat-presentation.v2",
			"lockedRuntime": "V160-V179",
		},
		"snapshot": {
			"encounterId": "hunt.1.1",
			"snapshotSeq": 1,
			"mode": "playback",
			"mainDaoId": "artifact",
			"challenge": {"canStart": true, "blockedReason": "", "floor": 1, "zoneFloor": 1, "zoneName": "Thanh Hà"},
			"player": {
				"id": "player",
				"name": "Thiên Vô Danh",
				"hp": {"current": 1000, "max": 1000, "ratio": 1.0, "displayCurrent": "1K", "displayMax": "1K"},
				"spirit": {"current": 100, "max": 100, "ratio": 1.0},
				"ultimate": {"current": 30, "max": 100, "ready": false},
			},
			"enemy": {
				"id": "boss",
				"name": "Yêu Vương",
				"level": 10,
				"grade": "Boss",
				"gradeId": "boss",
				"elements": ["Wood"],
				"hp": {"current": null, "max": null, "ratio": 1.0, "displayCurrent": "10K", "displayMax": "10K"},
				"break": {"ratio": 1.0, "state": "stable"},
			},
			"skills": skills,
			"dao": {
				"id": "artifact",
				"label": "Ngự Khí Đạo",
				"anchorKind": "sources",
				"meters": [
					{"id": "artifactSourcesV2", "label": "Khí Linh", "value": 3, "max": 3, "targetOwned": false},
					{"id": "artifactPassiveStack", "label": "Khí Cảm", "value": 8, "max": 20, "targetOwned": false},
				],
				"flags": [{"id": "artifactMergeActive", "label": "Đại Khí Linh", "active": false}],
				"detail": {"mergedFrom": 0},
			},
			"auto": {"enabled": true},
			"boss": {"isBoss": true},
			"result": {},
		},
		"events": [
			{"cursor": 1, "seq": 0, "time": 0.0, "type": "battle.start", "actor": "player", "target": "enemy", "message": "Bắt đầu", "payload": {}},
			{"cursor": 2, "seq": 1, "time": 0.5, "type": "combat.damage", "actor": "player", "target": "enemy", "message": "Trúng", "payload": {"hpPct": 90}},
		],
		"eventCursor": 2,
	}
