class_name CharacterAnimationRegistryTest
extends GdUnitTestSuite

const REGISTRY := preload("res://scripts/character/character_animation_registry.gd")
const STANDING_HERO := preload("res://scripts/character/standing_hero.gd")

func test_character_registry_has_four_unique_runtime_presets() -> void:
	assert_int(REGISTRY.PRESETS.size()).is_equal(4)
	assert_str(str(REGISTRY.default_preset_id())).is_equal("character_idle_01")
	assert_str(str(REGISTRY.next_preset_id(&"character_idle_01"))).is_equal("character_motion_02")
	assert_str(str(REGISTRY.next_preset_id(&"character_motion_04"))).is_equal("character_idle_01")

func test_character_registry_uses_split_runtime_resources() -> void:
	for entry in REGISTRY.PRESETS:
		assert_str(str(entry.get("resource_path", ""))).contains("character/animation_v2/presets/")
		assert_str(str(entry.get("animation_name", ""))).begins_with("character_")

func test_character_hero_defaults_to_static_fallback_until_character_route_is_active() -> void:
	var hero = STANDING_HERO.new()
	assert_str(str(hero.animation_profile)).is_equal("character_standing_v2_green")
	assert_str(str(hero.animation_mode)).is_equal("standing_idle")
	assert_bool(hero.get_presentation_active()).is_false()
	hero.free()
