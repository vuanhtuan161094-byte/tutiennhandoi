class_name CharacterViewModelTest
extends GdUnitTestSuite

const CHARACTER_VIEW_MODEL := preload("res://scripts/models/character_view_model.gd")

func test_build_maps_v165_v168_character_contract() -> void:
	var vm := CHARACTER_VIEW_MODEL.build(_valid_character())
	assert_bool(vm.get("ok", false)).is_true()
	assert_str(str(vm.get("schema", ""))).is_equal("godot-character-view-model.v1")
	assert_str(str(vm["identity"]["name"])).is_equal("Thiên Vô Danh")
	assert_str(str(vm["identity"]["realm"])).is_equal("Luyện Khí tầng hai")
	assert_str(str(vm["identity"]["root_name"])).is_equal("Phàm Căn")
	assert_float(float(vm["stats"]["power"])).is_equal(1371.0)
	assert_float(float(vm["stats"]["body"])).is_equal(860.0)
	assert_float(float(vm["stats"]["agility"])).is_equal(110.0)
	assert_float(float(vm["stats"]["spirit"])).is_equal(120.0)
	assert_float(float(vm["stats"]["sense"])).is_equal(100.0)
	assert_float(float(vm["stats"]["defense"])).is_equal(540.0)
	assert_int(int(vm["equipment"]["canonical_slot_count"])).is_equal(10)
	assert_int(int(vm["equipment"]["max_enhancement"])).is_equal(15)
	assert_int(int(vm["equipment"]["slots"].size())).is_equal(10)
	assert_str(str(vm["equipment"]["slots"][0]["label"])).is_equal("Đạo Binh")
	assert_int(int(vm["equipment"]["slots"][0]["enhancement"])).is_equal(15)
	assert_int(int(vm["equipment"]["inventory"].size())).is_equal(2)
	assert_str(str(vm["profile"]["origin_details"]["bloodline"]["name"])).is_equal("Thanh Mộc Huyết")
	assert_str(str(vm["profile"]["known_skills"][0]["name"])).is_equal("Thanh Mộc Kiếm Khí")
	assert_int(int(vm["potential"]["unspent"])).is_equal(123)
	assert_int(int(vm["potential"]["allocations"]["power"])).is_equal(1)
	assert_int(int(vm["potential"]["definitions"].size())).is_equal(5)
	assert_int(int(vm["potential"]["allocations"]["agility"])).is_equal(1)
	assert_int(int(vm["potential"]["allocations"]["spirit"])).is_equal(1)
	assert_int(int(vm["potential"]["allocations"]["sense"])).is_equal(1)

func test_build_preserves_all_ten_canonical_slot_ids() -> void:
	var vm := CHARACTER_VIEW_MODEL.build(_valid_character())
	var ids: Array = vm["equipment"]["slots"].map(func(slot): return str(slot["id"]))
	for expected in ["weapon", "head", "gloves", "bracelet", "necklace", "robe", "belt", "boots", "ring", "talisman"]:
		assert_bool(ids.has(expected)).is_true()

func test_build_rejects_wrong_runtime_authority() -> void:
	var payload := _valid_character()
	payload["authority"]["stats"] = "combat-stat.v167"
	var vm := CHARACTER_VIEW_MODEL.build(payload)
	assert_bool(vm.get("ok", true)).is_false()
	assert_str(str(vm.get("error", ""))).contains("combat stat authority")

func _valid_character() -> Dictionary:
	return {
		"ok": true,
		"schema": "godot-character-bridge.v1",
		"bridgeVersion": "godot-bridge.v2",
		"generatedAtUnixMs": 1,
		"authority": {
			"equipment": "equipment.v142",
			"stats": "combat-stat.v168",
			"transport": "web-client-view-patch.v140",
			"lockedRuntime": "V160-V179",
		},
		"overview": {"life": {"lifeNumber": 2, "realm": "Luyện Khí tầng hai"}},
		"character": {
			"name": "Thiên Vô Danh",
			"root": "Phàm Căn",
			"coreStats": {"power": 1371.0, "body": 860.0, "agility": 110.0, "spirit": 120.0, "sense": 100.0},
			"combatStats": {"attack": 1371.0, "defense": 540.0, "maxHp": 8600.0, "maxSpirit": 120.0, "mobility": 110.0, "accuracy": 100.0, "controlPower": 100.0, "resolve": 100.0},
			"potential": {
				"unspent": 123,
				"allocations": {"power": 1, "body": 1, "agility": 1, "spirit": 1, "sense": 1},
				"definitions": [
					{"id": "power", "name": "Công Lực", "perPoint": ["Công Lực +1"]},
					{"id": "body", "name": "Thể Phách", "perPoint": ["Thể Phách +1", "Sinh Mệnh +20", "Phòng Ngự +1"]},
					{"id": "agility", "name": "Thân Pháp", "perPoint": ["Mobility +1"]},
					{"id": "spirit", "name": "Linh Lực", "perPoint": ["Chân Nguyên tối đa +1"]},
					{"id": "sense", "name": "Thần Thức", "perPoint": ["Chính Xác +1", "Khống Chế +1", "Định Lực +1"]},
				],
			},
			"activeTechniqueName": "Thanh Mộc Dẫn Khí Quyết",
			"originDetails": {
				"bloodline": {"name": "Thanh Mộc Huyết", "grade": "Phàm", "purity": 25},
				"physique": {"name": "Thanh Mộc Thể", "stage": "Sơ Tỉnh"},
				"talent": {"name": "Mộc Linh Tư Chất"},
				"fate": {"name": "Thanh Vân Mệnh"},
				"background": {"name": "Tán Tu"},
			},
			"originProgression": {
				"bloodline": {"name": "Thanh Mộc Huyết", "grade": "Phàm", "purity": 25, "available": true, "canPurify": false, "canAdvance": false},
				"physique": {"name": "Thanh Mộc Thể", "stage": "Sơ Tỉnh", "available": true, "canAdvance": false},
				"resources": {"bloodlineEssence": 4, "bodyEssence": 3, "protection": 1},
			},
			"bloodlines": [{"id": "bloodline.test", "name": "Thanh Mộc Huyết", "purity": 25}],
			"physiques": ["Thanh Mộc Thể"],
			"knownSkills": [{"id": "skill.test", "name": "Thanh Mộc Kiếm Khí", "active": true, "spiritCost": 8, "cooldown": 3.0}],
		},
		"spiritualRoot": {"grade": {"name": "Phàm Căn", "level": 1}},
		"equipment": [
			{"id": "weapon-1", "slot": "weapon", "name": "Thanh Phong Kiếm", "enhancementLevel": 20, "setId": "set.v142.attire.metal", "effectiveStats": {"attack": 30}},
			{"id": "robe-1", "slot": "robe", "name": "Kim Văn Đạo Bào", "enhancementLevel": 7, "effectiveStats": {"maxHp": 150}},
		],
		"equipmentInventory": [
			{"id": "weapon-1", "slot": "weapon", "slotLabel": "Đạo Binh", "name": "Thanh Phong Kiếm", "enhancementLevel": 20, "equipped": true, "effectiveStats": {"attack": 30}},
			{"id": "weapon-2", "slot": "weapon", "slotLabel": "Đạo Binh", "name": "Trúc Kiếm", "enhancementLevel": 0, "equipped": false, "effectiveStats": {"attack": 22}},
		],
		"equipmentSystem": {
			"canonicalSlotCount": 10,
			"slots": [
				{"id": "weapon", "label": "Đạo Binh"}, {"id": "head", "label": "Đạo Quan"},
				{"id": "robe", "label": "Pháp Bào"}, {"id": "belt", "label": "Huyền Đái"},
				{"id": "gloves", "label": "Hộ Uyển"}, {"id": "boots", "label": "Vân Ngoa"},
				{"id": "necklace", "label": "Ngọc Bội"}, {"id": "ring", "label": "Đạo Giới"},
				{"id": "bracelet", "label": "Linh Trạc"}, {"id": "talisman", "label": "Hộ Phù"},
			],
		},
	}
