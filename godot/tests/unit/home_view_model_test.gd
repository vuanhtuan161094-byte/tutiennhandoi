class_name HomeViewModelTest
extends GdUnitTestSuite

const HOME_VIEW_MODEL := preload("res://scripts/models/home_view_model.gd")


func test_build_maps_canonical_home_into_presentation_model() -> void:
	var vm := HOME_VIEW_MODEL.build(_valid_home())
	assert_bool(vm.get("ok", false)).is_true()
	assert_str(str(vm.get("schema", ""))).is_equal("godot-home-view-model.v1")
	assert_str(str(vm["identity"]["realm"])).is_equal("Luyện Khí tầng một")
	assert_int(int(vm["identity"]["life_number"])).is_equal(2)
	assert_float(float(vm["progression"]["tu_vi"])).is_equal(705.0)
	assert_float(float(vm["progression"]["live_tu_vi"])).is_equal(705.8)
	assert_float(float(vm["progression"]["rate_per_second"])).is_equal(0.8)
	assert_float(float(vm["progression"]["required_tu_vi"])).is_equal(1371.0)
	assert_float(float(vm["progression"]["remaining_life_years"])).is_equal(82.0)
	assert_bool(bool(vm["progression"]["retreat"]["enabled"])).is_true()
	assert_float(float(vm["progression"]["retreat"]["bank_hours"])).is_equal(6.0)
	assert_float(float(vm["resources"]["spirit_stone"])).is_equal(250.0)
	assert_str(str(vm["context"]["active_technique"])).is_equal("technique.qingmu")


func test_build_derives_progress_when_backend_progress_is_zero() -> void:
	var home := _valid_home()
	home["cultivation"]["tuVi"] = 50.0
	home["cultivation"]["requiredTuVi"] = 200.0
	home["cultivation"]["progressPct"] = 0.0
	var vm := HOME_VIEW_MODEL.build(home)
	assert_float(float(vm["progression"]["progress_pct"])).is_equal(25.0)


func test_build_locks_retreat_when_canonical_reward_is_zero() -> void:
	var home := _valid_home()
	home["cultivation"]["retreat"]["enabled"] = false
	home["cultivation"]["retreat"]["rewardPct3h"] = 0.0
	var vm := HOME_VIEW_MODEL.build(home)
	assert_bool(bool(vm["progression"]["retreat"]["enabled"])).is_false()


func test_build_locks_retreat_when_reward_is_zero_even_if_flag_is_true() -> void:
	var home := _valid_home()
	home["cultivation"]["retreat"]["enabled"] = true
	home["cultivation"]["retreat"]["rewardPct3h"] = 0.0
	var vm := HOME_VIEW_MODEL.build(home)
	assert_bool(bool(vm["progression"]["retreat"]["enabled"])).is_false()


func test_build_does_not_infer_retreat_unlock_when_enabled_flag_is_missing() -> void:
	var home := _valid_home()
	home["cultivation"]["retreat"].erase("enabled")
	home["cultivation"]["retreat"]["rewardPct3h"] = 2.0
	var vm := HOME_VIEW_MODEL.build(home)
	assert_bool(bool(vm["progression"]["retreat"]["enabled"])).is_false()


func test_build_rejects_wrong_bridge_version() -> void:
	var home := _valid_home()
	home["bridgeVersion"] = "godot-bridge.v1"
	var vm := HOME_VIEW_MODEL.build(home)
	assert_bool(vm.get("ok", true)).is_false()
	assert_str(str(vm.get("error", ""))).contains("bridge version")


func _valid_home() -> Dictionary:
	return {
		"ok": true,
		"schema": "godot-home-bridge.v1",
		"bridgeVersion": "godot-bridge.v2",
		"generatedAtUnixMs": 1,
		"authority": {
			"cultivation": "character-cultivation.v140",
			"transport": "web-client-view-patch.v140",
			"lockedRuntime": "V160-V179",
		},
		"character": {
			"name": "Thiên Vô Danh",
			"root": "Phàm Căn",
		},
		"life": {
			"lifeNumber": 2,
			"realm": "Luyện Khí tầng một",
			"realmOrder": 1,
			"ageYears": 18.0,
			"lifespanYears": 100.0,
			"alive": true,
		},
		"cultivation": {
			"tuVi": 705.0,
			"requiredTuVi": 1371.0,
			"progressPct": 51.42,
			"baseTuViPer15s": 10.0,
			"finalTuViPer15s": 12.0,
			"baseTuViPerSecond": 0.6666667,
			"finalTuViPerSecond": 0.8,
			"liveTuVi": 705.8,
			"commitIntervalSeconds": 15.0,
			"commitPhaseSeconds": 1.0,
			"sources": [
				{"id": "base", "label": "Cơ sở", "kind": "flat", "value": 10.0},
				{"id": "root", "label": "Linh Căn", "kind": "flat", "value": 3.0},
			],
			"etaRealSeconds": 780.0,
			"injury": 0.0,
			"ready": false,
			"transition": "auto",
			"nextRealm": "Luyện Khí tầng hai",
			"retreat": {
				"bankHours": 6.0,
				"capHours": 9.0,
				"dailyAccrualHours": 3.0,
				"rewardPct3h": 2.0,
				"rewardPctPerHour": 0.6666667,
				"enabled": true,
			},
		},
		"spiritualRoot": {
			"name": "Phàm Căn",
			"level": 1,
		},
		"resources": {
			"spiritStone": 250.0,
			"reincarnationCp": 12.0,
		},
		"homeContext": {
			"actions": [],
			"hints": ["Tiếp tục tu luyện"],
			"majorEvents": [],
			"activeTechnique": "technique.qingmu",
			"build": {
				"score": 10.0,
				"identity": "kiếm tu",
				"strongestAxis": "công",
				"bottleneckAxis": "phòng",
				"unspentPotential": 0.0,
			},
			"hunt": {
				"selectedFloor": 1,
				"highestUnlockedFloor": 1,
				"monsterName": "Yêu Thú",
				"monsterGrade": "Phàm",
			},
		},
	}
