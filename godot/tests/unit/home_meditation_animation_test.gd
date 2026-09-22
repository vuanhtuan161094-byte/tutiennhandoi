class_name HomeMeditationAnimationTest
extends GdUnitTestSuite

const MEDITATION_HERO := preload("res://scripts/home/meditation_hero.gd")

func test_home_hero_contract_is_meditation_not_standing() -> void:
	var hero = MEDITATION_HERO.new()
	assert_str(str(hero.source_pose)).is_equal("meditation")
	assert_str(str(hero.home_mode)).is_equal("cultivation")
	assert_str(str(hero.animation_mode)).is_equal("meditation_idle")
	assert_str(str(hero.animation_source)).is_equal("video_frames_preloaded")
	hero.free()

func test_home_animation_v2_declares_separate_cultivation_and_rest_playlists() -> void:
	assert_str(MEDITATION_HERO.CULTIVATION_V2_PATH).contains("animation_v2/home_cultivation_v2.tres")
	assert_int(MEDITATION_HERO.CULTIVATION_V2_VARIANTS.size()).is_equal(2)
	assert_str(str(MEDITATION_HERO.CULTIVATION_V2_VARIANTS[0])).is_equal("cultivation_01")
	assert_str(str(MEDITATION_HERO.CULTIVATION_V2_VARIANTS[1])).is_equal("cultivation_02")

	assert_str(MEDITATION_HERO.REST_V2_PATH).contains("animation_v2/home_idle_v2.tres")
	assert_int(MEDITATION_HERO.REST_V2_VARIANTS.size()).is_equal(3)
	assert_str(str(MEDITATION_HERO.REST_V2_VARIANTS[0])).is_equal("idle_relaxed_01")
	assert_str(str(MEDITATION_HERO.REST_V2_VARIANTS[1])).is_equal("idle_relaxed_02")
	assert_str(str(MEDITATION_HERO.REST_V2_VARIANTS[2])).is_equal("idle_relaxed_03")

func test_home_mode_normalization_defaults_to_cultivation() -> void:
	assert_str(str(MEDITATION_HERO.normalize_home_mode(&"cultivation"))).is_equal("cultivation")
	assert_str(str(MEDITATION_HERO.normalize_home_mode(&"rest"))).is_equal("rest")
	assert_str(str(MEDITATION_HERO.normalize_home_mode(&"unknown"))).is_equal("cultivation")

func test_meditation_key_poses_remain_safe_fallback_dependencies() -> void:
	assert_str(MEDITATION_HERO.MEDITATION_FRAME_01_PATH).contains("home_meditation_idle_01.webp")
	assert_str(MEDITATION_HERO.MEDITATION_FRAME_04_PATH).contains("home_meditation_idle_04.webp")
	assert_bool(MEDITATION_HERO.MEDITATION_FRAME_01 != null).is_true()
	assert_bool(MEDITATION_HERO.MEDITATION_FRAME_04 != null).is_true()
	assert_bool(MEDITATION_HERO.POSE_CYCLE_SECONDS > 4.0).is_true()
	assert_bool(MEDITATION_HERO.SECONDARY_POSE_MAX_ALPHA >= 0.25).is_true()
	assert_bool(MEDITATION_HERO.SECONDARY_POSE_MAX_ALPHA <= 0.60).is_true()

func test_home_animation_paths_have_no_standing_source() -> void:
	assert_bool(MEDITATION_HERO.CULTIVATION_V2_PATH.contains("standing")).is_false()
	assert_bool(MEDITATION_HERO.REST_V2_PATH.contains("standing")).is_false()
	assert_bool(MEDITATION_HERO.MEDITATION_FRAME_01_PATH.contains("standing")).is_false()
	assert_bool(MEDITATION_HERO.MEDITATION_FRAME_04_PATH.contains("standing")).is_false()
