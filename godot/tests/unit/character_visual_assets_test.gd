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
	var has_atlas := ResourceLoader.exists("res://art/approved/character/standing_idle_atlas.webp")
	var has_approved_master := ResourceLoader.exists("res://art/approved/home/home_hero_standing.webp")
	assert_bool(has_atlas or has_approved_master).is_true()

func test_character_hero_contract_is_standing_idle() -> void:
	var hero = STANDING_HERO.new()
	assert_str(str(hero.source_pose)).is_equal("standing")
	assert_str(str(hero.animation_mode)).is_equal("standing_idle")
	hero.free()
