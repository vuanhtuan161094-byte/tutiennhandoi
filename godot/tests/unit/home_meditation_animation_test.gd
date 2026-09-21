class_name HomeMeditationAnimationTest
extends GdUnitTestSuite

const MEDITATION_HERO := preload("res://scripts/home/meditation_hero.gd")

func test_home_hero_contract_is_meditation_not_standing() -> void:
	var hero = MEDITATION_HERO.new()
	assert_str(str(hero.source_pose)).is_equal("meditation")
	assert_str(str(hero.animation_mode)).is_equal("meditation_idle")
	assert_str(str(hero.animation_source)).is_equal("video_frames")
	hero.free()

func test_video_frame_contract_uses_small_seated_assets() -> void:
	assert_str(MEDITATION_HERO.MEDITATION_FRAME_01_PATH).contains("home_meditation_idle_01.webp")
	assert_str(MEDITATION_HERO.MEDITATION_FRAME_04_PATH).contains("home_meditation_idle_04.webp")
	assert_float(MEDITATION_HERO.FRAME_INTERVAL).is_equal_approx(0.34, 0.001)
