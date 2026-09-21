class_name EquipmentInventoryScreenTest
extends GdUnitTestSuite

const INVENTORY_SCREEN := preload("res://scripts/character/equipment_inventory_screen.gd")

func _screen_with_weapon(stats: Dictionary, rank_index: int = 2, enhancement: int = 3):
	var screen = INVENTORY_SCREEN.new()
	screen._vm = {
		"equipment": {
			"slots": [{
				"id": "weapon",
				"filled": true,
				"rank_index": rank_index,
				"enhancement": enhancement,
				"stats": stats,
			}],
		},
	}
	return screen

func test_strength_signal_marks_clean_upgrade() -> void:
	var screen = _screen_with_weapon({"attack": 100.0, "defense": 30.0, "critChancePct": 5.0})
	var result: Dictionary = screen._strength_signal({
		"slot": "weapon",
		"equipped": false,
		"rankIndex": 2,
		"enhancementLevel": 3,
		"effectiveStats": {"attack": 130.0, "defense": 40.0, "critChancePct": 7.0},
	})
	assert_str(str(result.get("label", ""))).contains("NÂNG CẤP")
	screen.free()

func test_strength_signal_marks_sidegrade_when_stats_trade_off() -> void:
	var screen = _screen_with_weapon({"attack": 100.0, "defense": 30.0})
	var result: Dictionary = screen._strength_signal({
		"slot": "weapon",
		"equipped": false,
		"rankIndex": 2,
		"enhancementLevel": 3,
		"effectiveStats": {"attack": 130.0, "defense": 22.0},
	})
	assert_str(str(result.get("label", ""))).contains("ĐỔI LỐI CHƠI")
	screen.free()

func test_strength_signal_falls_back_to_rank_for_lightweight_rows() -> void:
	var screen = _screen_with_weapon({}, 2, 3)
	var result: Dictionary = screen._strength_signal({
		"slot": "weapon",
		"equipped": false,
		"rankIndex": 3,
		"enhancementLevel": 0,
	})
	assert_str(str(result.get("label", ""))).contains("BẬC CAO")
	screen.free()

func test_comparison_rows_surface_canonical_deltas() -> void:
	var screen = INVENTORY_SCREEN.new()
	var rows: Array = screen._comparison_rows(
		{"attack": 130.0, "defense": 22.0, "critChancePct": 7.0},
		{"attack": 100.0, "defense": 30.0, "critChancePct": 5.0}
	)
	var summary := ""
	for row_variant in rows:
		if typeof(row_variant) != TYPE_DICTIONARY:
			continue
		var row: Dictionary = row_variant
		summary += "%s %s | " % [str(row.get("label", "")), str(row.get("value", ""))]
	assert_str(summary).contains("Công Lực +30")
	assert_str(summary).contains("Phòng Ngự -8")
	assert_str(summary).contains("Bạo Kích +2.0%")
	screen.free()
