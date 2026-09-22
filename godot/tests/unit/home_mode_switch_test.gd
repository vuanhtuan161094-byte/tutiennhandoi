class_name HomeModeSwitchTest
extends GdUnitTestSuite

const HOME_HUD := preload("res://scripts/home/home_hud.gd")
const REGISTRY := preload("res://scripts/home/home_animation_registry.gd")

func test_home_defaults_to_cultivation_static_and_first_preset() -> void:
	var hud = HOME_HUD.new()
	assert_str(str(hud.home_presentation_mode)).is_equal("cultivation")
	assert_str(str(hud.home_motion_mode)).is_equal("still")
	assert_str(str(hud.home_animation_preset_id)).is_equal("cultivation_01")
	hud.free()

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
