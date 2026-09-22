class_name CharacterVisualAssetsTest
extends GdUnitTestSuite

const STANDING_HERO := preload("res://scripts/character/standing_hero.gd")

const EQUIPMENT_ART := [
	"res://art/approved/character/equipment/equip_weapon.webp",
	"res://art/approved/character/equipment/equip_head.webp",
	"res://art/approved/character/equipment/equip_robe.webp",
	"res://art/approved/character/equipment/equip_belt.webp",
	"res://art/approved/character/equipment/equip_gloves.webp",
	"res://art/approved/character/equipment/equip_boots.webp",
	"res://art/approved/character/equipment/equip_necklace.webp",
	"res://art/approved/character/equipment/equip_ring.webp",
	"res://art/approved/character/equipment/equip_bracelet.webp",
	"res://art/approved/character/equipment/equip_talisman.webp",
]

func test_all_ten_character_equipment_slot_assets_resolve() -> void:
	for path in EQUIPMENT_ART:
		assert_bool(ResourceLoader.exists(path)).is_true()
		assert_bool(ResourceLoader.load(path) is Texture2D).is_true()

func test_character_standing_hero_has_approved_runtime_source() -> void:
	var has_atlas := (
		ResourceLoader.exists("res://art/approved/character/standing_idle_atlas.webp")
		or ResourceLoader.exists("res://art/approved/character/standing_idle/standing_idle_atlas.webp")
	)
	var has_approved_master := ResourceLoader.exists("res://art/approved/home/home_hero_standing.webp")
	assert_bool(has_atlas or has_approved_master).is_true()

func test_character_hero_contract_defaults_to_static_character_presentation() -> void:
	assert_str(str(STANDING_HERO.SOURCE_POSE)).is_equal("standing")
	assert_str(str(STANDING_HERO.DEFAULT_ANIMATION_MODE)).is_equal("standing_still")
	assert_str(str(STANDING_HERO.ANIMATION_PROFILE)).is_equal("character_standing_v3_options")
	assert_str(str(STANDING_HERO.DEFAULT_PRESET_ID)).is_equal("character_idle_01")
	assert_str(str(STANDING_HERO.MOTION_STILL)).is_equal("still")
