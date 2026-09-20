class_name HomeArtAtlasTest
extends GdUnitTestSuite

const HOME_ART := preload("res://scripts/home/home_art_atlas.gd")


func test_required_home_art_falls_back_without_optional_payload() -> void:
	assert_bool(HOME_ART.texture(&"background") != null).is_true()
	assert_bool(HOME_ART.texture(&"hero") != null).is_true()
	assert_bool(HOME_ART.texture(&"portrait") != null).is_true()
	assert_bool(HOME_ART.texture(&"orb_retreat") != null).is_true()
	assert_bool(HOME_ART.texture(&"orb_character") != null).is_true()
	assert_bool(HOME_ART.texture(&"orb_root") != null).is_true()
	assert_bool(HOME_ART.texture(&"orb_combat") != null).is_true()


func test_missing_optional_asset_is_non_fatal() -> void:
	assert_bool(HOME_ART.production_texture(&"__missing_home_art__") == null).is_true()
