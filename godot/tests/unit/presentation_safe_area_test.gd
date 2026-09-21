class_name PresentationSafeAreaTest
extends GdUnitTestSuite

const HOME_NAV := preload("res://scripts/home/home_nav.gd")
const HOME_HUD := preload("res://scripts/home/home_hud.gd")
const CHARACTER_SCREEN := preload("res://scripts/character/character_screen.gd")
const INVENTORY_SCREEN := preload("res://scripts/character/equipment_inventory_screen.gd")
const DETAIL_SHEET := preload("res://scripts/character/character_detail_sheet.gd")

func test_portrait_surfaces_keep_minimum_side_inset() -> void:
	assert_bool(HOME_NAV.SAFE_SIDE_INSET >= 8.0).is_true()
	assert_bool(INVENTORY_SCREEN.SAFE_SIDE_INSET >= 8.0).is_true()
	assert_bool(DETAIL_SHEET.SAFE_SIDE_INSET >= 8.0).is_true()

func test_character_equipment_columns_stay_inside_390_width() -> void:
	assert_bool(CHARACTER_SCREEN.EQUIPMENT_SLOT_LEFT_X >= 8.0).is_true()
	assert_bool(CHARACTER_SCREEN.EQUIPMENT_SLOT_RIGHT_X + 64.0 <= 382.0).is_true()

func test_home_realm_wrap_preserves_full_progression_text() -> void:
	assert_str(HOME_HUD.realm_display_text("Phàm Nhân")).is_equal("Phàm Nhân")
	assert_str(HOME_HUD.realm_display_text("Luyện Khí tầng ba")).is_equal("Luyện Khí\nTầng ba")
	assert_str(HOME_HUD.realm_display_text("Trúc Cơ tầng mười")).is_equal("Trúc Cơ\nTầng mười")
