class_name CombatViewModelTest
extends GdUnitTestSuite

const COMBAT_VIEW_MODEL := preload("res://scripts/models/combat_view_model.gd")
const COMBAT_SCREEN := preload("res://scripts/combat/combat_screen.gd")
const EVENT_PLAYER := preload("res://scripts/combat/combat_event_player.gd")
const BRIDGE := preload("res://scripts/core/backend_bridge.gd")


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
