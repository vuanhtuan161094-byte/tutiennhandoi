class_name HomeModeSwitchTest
extends GdUnitTestSuite

const HOME_HUD := preload("res://scripts/home/home_hud.gd")

func test_home_mode_defaults_to_cultivation() -> void:
	var hud = HOME_HUD.new()
	assert_str(str(hud.home_presentation_mode)).is_equal("cultivation")
	hud.free()

func test_home_mode_normalization_accepts_only_two_presentation_modes() -> void:
	assert_str(str(HOME_HUD.normalize_home_presentation_mode(&"cultivation"))).is_equal("cultivation")
	assert_str(str(HOME_HUD.normalize_home_presentation_mode(&"rest"))).is_equal("rest")
	assert_str(str(HOME_HUD.normalize_home_presentation_mode(&"anything_else"))).is_equal("cultivation")
