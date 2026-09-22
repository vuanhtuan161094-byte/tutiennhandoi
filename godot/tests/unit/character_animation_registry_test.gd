class_name CharacterAnimationRegistryTest
extends GdUnitTestSuite

const REGISTRY := preload("res://scripts/character/character_animation_registry.gd")
const STANDING_HERO := preload("res://scripts/character/standing_hero.gd")

func test_character_registry_has_eleven_presets() -> void:
	assert_int(REGISTRY.PRESETS.size()).is_equal(11)
	assert_str(str(REGISTRY.default_preset_id())).is_equal("character_idle_01")
	assert_str(str(REGISTRY.PRESETS[10].get("id", &""))).is_equal("character_motion_11")

func test_character_registry_uses_split_runtime_and_still_resources() -> void:
	for entry in REGISTRY.PRESETS:
		assert_str(str(entry.get("resource_path", ""))).contains("character/animation_v2/presets/")
		assert_str(str(entry.get("still_path", ""))).contains("character/animation_v2/stills/")
		assert_str(str(entry.get("animation_name", ""))).starts_with("character_")

func test_character_hero_defaults_to_static_presentation() -> void:
	var hero = auto_free(STANDING_HERO.new())
	assert_str(str(hero.animation_profile)).is_equal("character_standing_v3_options")
	assert_str(str(hero.animation_mode)).is_equal("standing_still")
	assert_str(str(hero.motion_mode)).is_equal("still")
	assert_str(str(hero.animation_preset_id)).is_equal("character_idle_01")
	assert_bool(hero.get_presentation_active()).is_false()

func test_character_motion_mode_normalization_supports_three_modes() -> void:
	assert_str(str(STANDING_HERO.normalize_motion_mode(&"still"))).is_equal("still")
	assert_str(str(STANDING_HERO.normalize_motion_mode(&"animated"))).is_equal("animated")
	assert_str(str(STANDING_HERO.normalize_motion_mode(&"hidden"))).is_equal("hidden")
	assert_str(str(STANDING_HERO.normalize_motion_mode(&"unknown"))).is_equal("still")
