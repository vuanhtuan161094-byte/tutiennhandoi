class_name HomeStageDepthTest
extends GdUnitTestSuite

const HOME_STAGE := preload("res://scripts/home/home_stage.gd")

func test_home_hero_has_expanded_v2_stage() -> void:
	var width: float = HOME_STAGE.HERO_STAGE_RIGHT - HOME_STAGE.HERO_STAGE_LEFT
	var height: float = HOME_STAGE.HERO_STAGE_BOTTOM - HOME_STAGE.HERO_STAGE_TOP
	assert_bool(width >= 300.0).is_true()
	assert_bool(height >= 400.0).is_true()

func test_home_depth_stack_places_world_both_behind_and_in_front_of_hero() -> void:
	assert_bool(HOME_STAGE.Z_BACKGROUND < HOME_STAGE.Z_WORLD_BACK).is_true()
	assert_bool(HOME_STAGE.Z_WORLD_BACK < HOME_STAGE.Z_HERO).is_true()
	assert_bool(HOME_STAGE.Z_PEDESTAL_BACK < HOME_STAGE.Z_HERO).is_true()
	assert_bool(HOME_STAGE.Z_WORLD_FRONT > HOME_STAGE.Z_HERO).is_true()
	assert_bool(HOME_STAGE.Z_PARTICLES_FRONT > HOME_STAGE.Z_WORLD_FRONT).is_true()

func test_home_hero_bounds_remain_centered() -> void:
	assert_float(absf(HOME_STAGE.HERO_STAGE_LEFT)).is_equal_approx(HOME_STAGE.HERO_STAGE_RIGHT, 0.001)
