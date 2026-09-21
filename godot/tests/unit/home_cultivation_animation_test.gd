class_name HomeCultivationAnimationTest
extends GdUnitTestSuite

const HOME_HUD := preload("res://scripts/home/home_hud.gd")

func test_rate_per_second_is_one_fifteenth_of_canonical_quantum() -> void:
	assert_float(HOME_HUD.cultivation_rate_per_second(100.0)).is_equal_approx(100.0 / 15.0, 0.0001)
	assert_float(HOME_HUD.cultivation_rate_per_second(0.0)).is_equal(0.0)
	assert_float(HOME_HUD.cultivation_rate_per_second(-50.0)).is_equal(0.0)
