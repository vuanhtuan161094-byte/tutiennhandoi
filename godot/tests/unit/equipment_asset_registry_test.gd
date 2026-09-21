class_name EquipmentAssetRegistryTest
extends GdUnitTestSuite

const REGISTRY := preload("res://scripts/character/equipment_asset_registry.gd")

func test_attire_set_slot_maps_to_expected_cell() -> void:
	var spec: Dictionary = REGISTRY.resolve_spec("set.v142.attire.fire", "robe")
	assert_str(str(spec.get("category", ""))).is_equal("attire")
	assert_str(str(spec.get("set_key", ""))).is_equal("fire")
	var region: Rect2i = spec.get("region", Rect2i())
	assert_int(region.position.x).is_equal(2 * 160)
	assert_int(region.position.y).is_equal(3 * 160)
	assert_int(region.size.x).is_equal(160)
	assert_int(region.size.y).is_equal(160)

func test_jewelry_set_slot_maps_to_expected_cell() -> void:
	var spec: Dictionary = REGISTRY.resolve_spec("set.v142.jewelry.hu_khong", "talisman")
	assert_str(str(spec.get("category", ""))).is_equal("jewelry")
	assert_str(str(spec.get("set_key", ""))).is_equal("hu_khong")
	var region: Rect2i = spec.get("region", Rect2i())
	assert_int(region.position.x).is_equal(3 * 200)
	assert_int(region.position.y).is_equal(2 * 200)
	assert_int(region.size.x).is_equal(200)
	assert_int(region.size.y).is_equal(200)

func test_wrong_slot_category_does_not_cross_map() -> void:
	assert_bool(REGISTRY.resolve_spec("set.v142.attire.metal", "ring").is_empty()).is_true()
	assert_bool(REGISTRY.resolve_spec("set.v142.jewelry.tran_thu", "weapon").is_empty()).is_true()

func test_backend_set_ids_normalize_to_art_keys() -> void:
	assert_str(REGISTRY.normalize_set_key("set.v142.attire.metal")).is_equal("metal")
	assert_str(REGISTRY.normalize_set_key("set.v142.attire.wood")).is_equal("wood")
	assert_str(REGISTRY.normalize_set_key("set.v142.attire.water")).is_equal("water")
	assert_str(REGISTRY.normalize_set_key("set.v142.attire.fire")).is_equal("fire")
	assert_str(REGISTRY.normalize_set_key("set.v142.attire.earth")).is_equal("earth")
	assert_str(REGISTRY.normalize_set_key("set.v142.jewelry.huyen_nguyen")).is_equal("huyen_nguyen")
	assert_str(REGISTRY.normalize_set_key("set.v142.jewelry.pha_gioi")).is_equal("pha_gioi")
	assert_str(REGISTRY.normalize_set_key("set.v142.jewelry.hu_khong")).is_equal("hu_khong")
	assert_str(REGISTRY.normalize_set_key("set.v142.jewelry.tran_thu")).is_equal("tran_thu")
