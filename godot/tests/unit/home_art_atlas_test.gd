class_name HomeArtAtlasTest
extends GdUnitTestSuite

const HOME_ART := preload("res://scripts/home/home_art_atlas.gd")


func test_required_home_art_resolves_from_approved_manifest() -> void:
	assert_bool(HOME_ART.has_production_art(&"background")).is_true()
	assert_bool(HOME_ART.has_production_art(&"hero")).is_true()
	assert_bool(HOME_ART.has_production_art(&"portrait")).is_true()
	assert_bool(HOME_ART.has_production_art(&"orb_retreat")).is_true()
	assert_bool(HOME_ART.has_production_art(&"orb_character")).is_true()
	assert_bool(HOME_ART.has_production_art(&"orb_root")).is_true()
	assert_bool(HOME_ART.has_production_art(&"orb_combat")).is_true()


func test_code_driven_decorative_layers_remain_optional() -> void:
	assert_bool(HOME_ART.production_texture(&"aura") == null).is_true()
	assert_bool(HOME_ART.production_texture(&"pedestal") == null).is_true()
	assert_bool(HOME_ART.production_texture(&"dock") == null).is_true()
	assert_bool(HOME_ART.production_texture(&"selected_glow") == null).is_true()


func test_unknown_optional_asset_is_non_fatal() -> void:
	assert_bool(HOME_ART.production_texture(&"__missing_home_art__") == null).is_true()
