class_name HomeMeditationAnimationTest
extends GdUnitTestSuite

const MEDITATION_HERO := preload("res://scripts/home/meditation_hero.gd")
const REGISTRY := preload("res://scripts/home/home_animation_registry.gd")

func test_home_hero_declares_static_cultivation_defaults_without_instantiation() -> void:
	assert_str(str(MEDITATION_HERO.SOURCE_POSE)).is_equal("meditation")
	assert_str(str(MEDITATION_HERO.DEFAULT_HOME_MODE)).is_equal("cultivation")
	assert_str(str(MEDITATION_HERO.DEFAULT_MOTION_MODE)).is_equal("still")
	assert_str(str(MEDITATION_HERO.DEFAULT_ANIMATION_PRESET_ID)).is_equal("cultivation_01")
	assert_str(str(MEDITATION_HERO.DEFAULT_ANIMATION_MODE)).is_equal("cultivation_still")
	assert_int(MEDITATION_HERO.MAX_ANIMATION_CACHE_RESOURCES).is_equal(2)

func test_home_registry_exposes_scalable_mode_presets() -> void:
	var cultivation := REGISTRY.presets_for_mode(&"cultivation")
	var rest := REGISTRY.presets_for_mode(&"rest")
	assert_int(cultivation.size()).is_equal(2)
	assert_int(rest.size()).is_equal(3)
	assert_str(str(REGISTRY.default_preset_id(&"cultivation"))).is_equal("cultivation_01")
	assert_str(str(REGISTRY.default_preset_id(&"rest"))).is_equal("rest_01")
	assert_str(str(cultivation[0].get("animation_name", &""))).is_equal("cultivation_01")
	assert_str(str(rest[2].get("animation_name", &""))).is_equal("idle_relaxed_03")

func test_home_registry_prefers_split_resources_with_v3_fallback() -> void:
	for entry in REGISTRY.PRESETS:
		assert_str(str(entry.get("resource_path", ""))).contains("/presets/")
		assert_str(str(entry.get("fallback_resource_path", ""))).contains("animation_v3/")
		assert_bool(str(entry.get("resource_path", "")).contains("standing")).is_false()

func test_home_motion_mode_normalization_supports_still_animated_hidden() -> void:
	assert_str(str(MEDITATION_HERO.normalize_motion_mode(&"still"))).is_equal("still")
	assert_str(str(MEDITATION_HERO.normalize_motion_mode(&"animated"))).is_equal("animated")
	assert_str(str(MEDITATION_HERO.normalize_motion_mode(&"hidden"))).is_equal("hidden")
	assert_str(str(MEDITATION_HERO.normalize_motion_mode(&"unknown"))).is_equal("still")

func test_home_still_assets_are_mode_specific() -> void:
	assert_str(REGISTRY.still_path(&"cultivation")).contains("home_cultivation_still.webp")
	assert_str(REGISTRY.still_path(&"rest")).contains("home_rest_still.webp")
	assert_bool(REGISTRY.still_path(&"cultivation") == REGISTRY.still_path(&"rest")).is_false()

func test_home_animation_cache_is_intentionally_bounded() -> void:
	assert_int(MEDITATION_HERO.MAX_ANIMATION_CACHE_RESOURCES).is_equal(2)
