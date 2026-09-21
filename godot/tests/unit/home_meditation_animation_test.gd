class_name HomeMeditationAnimationTest
extends GdUnitTestSuite

const MEDITATION_HERO := preload("res://scripts/home/meditation_hero.gd")

func test_home_hero_contract_is_meditation_not_standing() -> void:
	var hero = MEDITATION_HERO.new()
	assert_str(str(hero.source_pose)).is_equal("meditation")
	assert_str(str(hero.animation_mode)).is_equal("meditation_idle")
	assert_str(str(hero.animation_source)).is_equal("video_atlas")
	hero.free()

func test_video_atlas_contract_is_fixed_and_sliceable() -> void:
	assert_int(MEDITATION_HERO.FRAME_COUNT).is_equal(12)
	assert_int(MEDITATION_HERO.FRAME_COLUMNS).is_equal(4)
	assert_int(MEDITATION_HERO.FRAME_SIZE.x).is_equal(192)
	assert_int(MEDITATION_HERO.FRAME_SIZE.y).is_equal(288)
