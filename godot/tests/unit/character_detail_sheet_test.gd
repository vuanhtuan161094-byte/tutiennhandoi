class_name CharacterDetailSheetTest
extends GdUnitTestSuite

const DETAIL_SHEET := preload("res://scripts/character/character_detail_sheet.gd")

func test_equipment_comparison_surfaces_meaningful_deltas() -> void:
	var sheet = DETAIL_SHEET.new()
	var line: String = sheet._equipment_comparison_line(
		{"attack": 130.0, "defense": 22.0, "critChancePct": 7.0},
		{"attack": 100.0, "defense": 30.0, "critChancePct": 5.0}
	)
	assert_str(line).contains("Công Lực +30")
	assert_str(line).contains("Phòng Ngự -8")
	assert_str(line).contains("Bạo Kích +2.0%")
	sheet.free()

func test_equipment_comparison_handles_near_equal_items() -> void:
	var sheet = DETAIL_SHEET.new()
	var line: String = sheet._equipment_comparison_line(
		{"attack": 100.0, "defense": 30.0},
		{"attack": 100.0, "defense": 30.0}
	)
	assert_str(line).contains("gần tương đương")
	sheet.free()

func test_equipment_comparison_skips_deferred_lightweight_rows() -> void:
	var sheet = DETAIL_SHEET.new()
	assert_str(sheet._equipment_comparison_line({}, {"attack": 100.0})).is_equal("")
	assert_str(sheet._equipment_comparison_line({"attack": 100.0}, {})).is_equal("")
	sheet.free()
