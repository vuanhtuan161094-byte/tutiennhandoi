class_name HomeMeditationAnimationTest
extends GdUnitTestSuite

const MEDITATION_HERO := preload("res://scripts/home/meditation_hero.gd")

func test_home_hero_defaults_to_static_cultivation() -> void:
	var hero = MEDITATION_HERO.new()
	assert_str(str(hero.source_pose)).is_equal("meditation")
	assert_str(str(hero.home_mode)).is_equal("cultivation")
	assert_str(str(hero.motion_mode)).is_equal("still")
	assert_str(str(hero.animation_mode)).is_equal("cultivation_still")
	hero.free()

func test_home_animation_v3_declares_separate_cultivation_and_rest_playlists() -> void:
	assert_str(MEDITATION_HERO.CULTIVATION_V3_PATH).contains("animation_v3/home_cultivation_v3.tres")
	assert_int(MEDITATION_HERO.CULTIVATION_V3_VARIANTS.size()).is_equal(2)
	assert_str(str(MEDITATION_HERO.CULTIVATION_V3_VARIANTS[0])).is_equal("cultivation_01")
	assert_str(str(MEDITATION_HERO.CULTIVATION_V3_VARIANTS[1])).is_equal("cultivation_02")

	assert_str(MEDITATION_HERO.REST_V3_PATH).contains("animation_v3/home_rest_v3.tres")
	assert_int(MEDITATION_HERO.REST_V3_VARIANTS.size()).is_equal(3)
	assert_str(str(MEDITATION_HERO.REST_V3_VARIANTS[0])).is_equal("idle_relaxed_01")
	assert_str(str(MEDITATION_HERO.REST_V3_VARIANTS[1])).is_equal("idle_relaxed_02")
	assert_str(str(MEDITATION_HERO.REST_V3_VARIANTS[2])).is_equal("idle_relaxed_03")

func test_home_motion_mode_normalization_supports_still_animated_hidden() -> void:
	assert_str(str(MEDITATION_HERO.normalize_motion_mode(&"still"))).is_equal("still")
	assert_str(str(MEDITATION_HERO.normalize_motion_mode(&"animated"))).is_equal("animated")
	assert_str(str(MEDITATION_HERO.normalize_motion_mode(&"hidden"))).is_equal("hidden")
	assert_str(str(MEDITATION_HERO.normalize_motion_mode(&"unknown"))).is_equal("still")

func test_home_still_assets_are_mode_specific() -> void:
	assert_str(MEDITATION_HERO.CULTIVATION_STILL_PATH).contains("home_cultivation_still.webp")
	assert_str(MEDITATION_HERO.REST_STILL_PATH).contains("home_rest_still.webp")
	assert_bool(MEDITATION_HERO.CULTIVATION_STILL_PATH == MEDITATION_HERO.REST_STILL_PATH).is_false()

func test_home_animation_paths_have_no_standing_source() -> void:
	assert_bool(MEDITATION_HERO.CULTIVATION_V3_PATH.contains("standing")).is_false()
	assert_bool(MEDITATION_HERO.REST_V3_PATH.contains("standing")).is_false()
assert_bool(MEDITATION_HERO.MEDITATION_FRAME_01_PATH.contains("standing")).is_false()
