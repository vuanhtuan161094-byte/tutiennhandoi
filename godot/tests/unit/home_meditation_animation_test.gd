class_name HomeMeditationAnimationTest
extends GdUnitTestSuite

const MEDITATION_HERO := preload("res://scripts/home/meditation_hero.gd")

func test_home_hero_contract_is_meditation_not_standing() -> void:
	var hero = MEDITATION_HERO.new()
	assert_str(str(hero.source_pose)).is_equal("meditation")
	assert_str(str(hero.animation_mode)).is_equal("meditation_idle")
	assert_str(str(hero.animation_source)).is_equal("procedural")
	hero.free()
