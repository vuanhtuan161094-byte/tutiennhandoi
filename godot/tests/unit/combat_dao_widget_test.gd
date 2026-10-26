class_name CombatDaoWidgetTest
extends GdUnitTestSuite

const DAO_WIDGET := preload("res://scripts/combat/combat_dao_widget.gd")
const SKILL_RAIL := preload("res://scripts/combat/combat_skill_rail.gd")

func test_all_eight_daos_render_their_authoritative_primary_resource() -> void:
	var widget := DAO_WIDGET.new()
	add_child(widget)
	await get_tree().process_frame
	var fixtures := [
		_meter_fixture("sword", "Kiếm Đạo", "swordQi", "Kiếm Khí", 3, 5),
		_meter_fixture("fist", "Quyền Đạo", "fistForce", "Quyền Thế", 2, 5),
		_meter_fixture("body", "Thể Đạo", "counterForce", "Phản Thế", 72, 100),
		_meter_fixture("spell", "Pháp Đạo", "lawWheel", "Pháp Luân", 1, 3),
		_meter_fixture("poison", "Độc Đạo", "poisonSeedStage", "Độc Chủng", 4, 4, true),
		_meter_fixture("formation", "Trận Đạo", "formationNurtureV2", "Dưỡng Độ", 56, 100),
		_meter_fixture("artifact", "Ngự Khí Đạo", "artifactSourcesV2", "Khí Linh", 2, 3),
		_meter_fixture("mind", "Thần Niệm Đạo", "mindMarkCount", "Thần Ấn", 3, 5, true),
	]
	var expected_titles := ["KIẾM ĐẠO", "QUYỀN ĐẠO", "THỂ ĐẠO", "PHÁP ĐẠO", "ĐỘC ĐẠO", "TRẬN ĐẠO", "NGỰ KHÍ", "THẦN NIỆM"]
	for i in range(fixtures.size()):
		var source: Dictionary = fixtures[i]
		var original := source.duplicate(true)
		widget.bind(source)
		assert_str(widget._title.text).is_equal(expected_titles[i])
		assert_str(widget._title.tooltip_text).contains(str(source.label))
		assert_str(widget._summary.text).contains(str(source.meters[0].label))
		assert_str(widget._summary.text).contains("%d/%d" % [source.meters[0].value, source.meters[0].max])
		var should_be_discrete := int(source.meters[0].max) <= 5
		assert_bool(widget._continuous_meter.visible).is_equal(not should_be_discrete)
		assert_bool(widget._meter_visual.visible).is_equal(should_be_discrete)
		if should_be_discrete:
			assert_int(_visible_segments(widget)).is_equal(int(source.meters[0].max))
		else:
			var track := widget._continuous_meter.get_theme_stylebox("background") as StyleBoxFlat
			assert_bool(track != null).is_true()
			assert_bool(track.bg_color.a >= 0.2).is_true()
		assert_dict(source).is_equal(original)
	widget.free()

func test_resource_change_updates_meter_and_pulses_without_mutating_projection() -> void:
	var widget := DAO_WIDGET.new()
	add_child(widget)
	await get_tree().process_frame
	var source := _meter_fixture("sword", "Kiếm Đạo", "swordQi", "Kiếm Khí", 0, 5)
	widget.bind(source)
	var original := source.duplicate(true)
	widget.apply_resource("swordQi", 3, 5)
	assert_str(widget._summary.text).contains("3/5")
	assert_int(_visible_segments(widget)).is_equal(5)
	assert_bool(widget._meter_tween != null).is_true()
	assert_bool(widget._meter_tween.is_valid()).is_true()
	assert_dict(source).is_equal(original)
	widget.free()

func test_mind_target_marks_survive_a_player_dao_projection() -> void:
	var widget := DAO_WIDGET.new()
	add_child(widget)
	await get_tree().process_frame
	var marks := _meter_fixture("mind", "Thần Niệm Đạo", "mindMarkCount", "Thần Ấn", 0, 5, true)
	widget.bind(marks)
	widget.apply_target_mark(4, 5)
	var next_projection := _meter_fixture("mind", "Thần Niệm Đạo", "mindMarkCount", "Thần Ấn", 0, 5, true)
	widget.apply_projection(next_projection)
	assert_str(widget._summary.text).contains("4/5")
	widget.free()

func test_auto_status_explains_rotation_and_remains_read_only() -> void:
	var rail := SKILL_RAIL.new()
	add_child(rail)
	await get_tree().process_frame
	rail.bind([], true)
	assert_str(rail._auto.text).is_equal("TỰ ĐỘNG")
	assert_str(rail._auto.tooltip_text).contains("vòng ưu tiên")
	assert_int(rail._auto.mouse_filter).is_equal(Control.MOUSE_FILTER_IGNORE)
	rail.bind([], false)
	assert_str(rail._auto.text).is_equal("TỰ ĐỘNG TẮT")
	rail.free()

func _visible_segments(widget: CombatDaoWidget) -> int:
	var count := 0
	for segment in widget._meter_segments:
		if segment.visible:
			count += 1
	return count

func _meter_fixture(dao_id: String, dao_label: String, meter_id: String, meter_label: String, value: int, maximum: int, target_owned: bool = false) -> Dictionary:
	return {
		"id": dao_id,
		"label": dao_label,
		"anchorKind": "target" if target_owned else "self",
		"meters": [{"id": meter_id, "label": meter_label, "value": value, "max": maximum, "targetOwned": target_owned}],
		"flags": [],
		"detail": {},
	}
