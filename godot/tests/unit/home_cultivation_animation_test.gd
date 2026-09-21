class_name HomeCultivationAnimationTest
extends GdUnitTestSuite

const HOME_HUD := preload("res://scripts/home/home_hud.gd")

func test_rate_per_second_is_one_fifteenth_of_canonical_quantum() -> void:
	var rate := HOME_HUD.cultivation_rate_per_second(100.0)
	assert_bool(absf(rate - (100.0 / 15.0)) < 0.0001).is_true()
	assert_float(HOME_HUD.cultivation_rate_per_second(0.0)).is_equal(0.0)
	assert_float(HOME_HUD.cultivation_rate_per_second(-50.0)).is_equal(0.0)

func test_rate_uses_canonical_commit_interval() -> void:
	assert_float(HOME_HUD.cultivation_rate_per_second(120.0, 12.0)).is_equal(10.0)

func test_home_rate_label_is_integer_only() -> void:
	assert_str(HOME_HUD.cultivation_rate_label(100.0)).is_equal("+7 Tu Vi/s")
	assert_str(HOME_HUD.cultivation_rate_label(90.0)).is_equal("+6 Tu Vi/s")
