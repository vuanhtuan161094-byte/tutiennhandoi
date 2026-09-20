class_name HomeArtAtlasTest
extends GdUnitTestSuite

const HOME_ART := preload("res://scripts/home/home_art_atlas.gd")

const REQUIRED_HOME_ART := [
	&"background", &"hero", &"portrait", &"portrait_frame", &"aura", &"pedestal",
	&"resource_stone", &"resource_reincarnation", &"cta_ascend", &"cta_tribulation",
	&"orb_retreat", &"orb_character", &"orb_root", &"orb_combat", &"dock", &"selected_glow",
	&"nav_home", &"nav_character", &"nav_artifacts", &"nav_pets", &"nav_world", &"nav_faction",
]

func test_required_home_art_resolves_from_approved_manifest() -> void:
	for asset_id in REQUIRED_HOME_ART:
		assert_bool(HOME_ART.has_production_art(asset_id)).is_true()

func test_unknown_optional_asset_is_non_fatal() -> void:
	assert_bool(HOME_ART.production_texture(&"__missing_home_art__") == null).is_true()