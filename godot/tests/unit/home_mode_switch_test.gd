class_name HomeModeSwitchTest
extends GdUnitTestSuite

const HOME_HUD := preload("res://scripts/home/home_hud.gd")
const REGISTRY := preload("res://scripts/home/home_animation_registry.gd")

func test_home_defaults_to_cultivation_static_and_first_preset() -> void:
	assert_str(str(HOME_HUD.DEFAULT_HOME_MODE)).is_equal("cultivation")
	assert_str(str(HOME_HUD.DEFAULT_MOTION_MODE)).is_equal("still")
	assert_str(str(HOME_HUD.DEFAULT_ANIMATION_PRESET_ID)).is_equal("cultivation_01")

func test_home_content_mode_normalization_accepts_two_modes() -> void:
	assert_str(str(HOME_HUD.normalize_home_presentation_mode(&"cultivation"))).is_equal("cultivation")
	assert_str(str(HOME_HUD.normalize_home_presentation_mode(&"rest"))).is_equal("rest")
	assert_str(str(HOME_HUD.normalize_home_presentation_mode(&"anything_else"))).is_equal("cultivation")

func test_home_motion_mode_normalization_accepts_three_modes() -> void:
	assert_str(str(HOME_HUD.normalize_home_motion_mode(&"still"))).is_equal("still")
	assert_str(str(HOME_HUD.normalize_home_motion_mode(&"animated"))).is_equal("animated")
	assert_str(str(HOME_HUD.normalize_home_motion_mode(&"hidden"))).is_equal("hidden")
	assert_str(str(HOME_HUD.normalize_home_motion_mode(&"anything_else"))).is_equal("still")

func test_registry_defaults_match_hud_defaults() -> void:
	assert_str(str(REGISTRY.default_preset_id(&"cultivation"))).is_equal("cultivation_01")
	assert_str(str(REGISTRY.default_preset_id(&"rest"))).is_equal("rest_01")


func test_ling_quang_feedback_is_readable_long_enough() -> void:
	var x2 := HOME_HUD.ling_quang_event_copy(2)
	var x3 := HOME_HUD.ling_quang_event_copy(3)
	var x9 := HOME_HUD.ling_quang_event_copy(9)
	assert_float(float(x2.get("hold", 0.0))).is_greater_equal(HOME_HUD.LING_QUANG_MIN_HOLD_SECONDS)
	assert_float(float(x3.get("hold", 0.0))).is_greater_equal(2.5)
	assert_float(float(x9.get("hold", 0.0))).is_greater_equal(3.5)
	assert_float(HOME_HUD.CULTIVATION_EVENT_FADE_OUT_SECONDS).is_greater_equal(0.35)
