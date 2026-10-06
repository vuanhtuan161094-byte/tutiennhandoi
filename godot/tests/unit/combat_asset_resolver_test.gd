class_name CombatAssetResolverTest
extends GdUnitTestSuite
const ASSETS := preload("res://scripts/combat/combat_asset_resolver.gd")
const SCREEN := preload("res://scripts/combat/combat_screen.gd")

func test_all_canonical_biomes_resolve_to_eight_families() -> void:
	var data := ASSETS.catalog()
	assert_int(data.biomes.size()).is_equal(28)
	assert_int(data.biomeFamilies.size()).is_equal(8)
	for row in data.biomes.values():
		var config := ASSETS.environment({"biome_name":row.biomeName,"zone":1,"primary_element":"Wood"})
		assert_str(config.biomeFamilyId).is_equal(row.biomeFamilyId)
		assert_bool(data.biomeFamilies.has(config.biomeFamilyId)).is_true()
		assert_str(config.biomeBasePath).is_equal(data.biomeFamilies[row.biomeFamilyId].baseBackgroundPath)
	var first := ASSETS.environment({"biome_name":"Thanh Hư Sơn Mạch","zone":1,"primary_element":"Wood"})
	assert_str(first.biomeFamilyId).is_equal("mountain_valley")
	assert_str(first.zoneIntensityKey).is_equal("tier.1")
	assert_str(first.primaryElementInfoKey).is_equal("element.wood")

func test_zone_and_element_never_select_different_biome_art() -> void:
	for biome in ASSETS.catalog().biomes.values():
		var base := ASSETS.environment({"biome_name":biome.biomeName,"zone":1,"primary_element":"Wood"})
		for zone in range(1,9):
			for element in ["Wood","Fire","Earth","Metal","Water"]:
				var config := ASSETS.environment({"biome_name":biome.biomeName,"zone":zone,"primary_element":element})
				assert_str(config.biomeFamilyId).is_equal(base.biomeFamilyId)
				assert_str(config.biomeBasePath).is_equal(base.biomeBasePath)
				assert_str(config.zoneIntensityKey).is_equal("tier."+str(zone))
				assert_str(config.primaryElement).is_equal(element)
				assert_str(config.primaryElementInfoKey).is_equal("element."+element.to_lower())
				assert_bool(config.has("zoneLayerPath") or config.has("elementLayerPath")).is_false()

func test_all_archetypes_resolve_and_unknown_names_never_guess_identity() -> void:
	for id in ["wolf","serpent","golem","spirit","demon","dragon","generic"]:
		var config := ASSETS.enemy(id)
		assert_str(config.id).is_equal(id)
		assert_str(config.fallbackKey).is_equal(id)
		assert_bool(config.has("anchors")).is_true()
	assert_str(ASSETS.enemy("").id).is_equal("generic")
	assert_str(ASSETS.enemy("Thủ Tầng · U Minh Xà").id).is_equal("generic")

func test_all_eighty_registry_skills_and_family_category_counts() -> void:
	var data := ASSETS.catalog()
	assert_int(data.skills.size()).is_equal(80)
	assert_int(data.families.size()).is_equal(8)
	for dao_id in data.families:
		var counts := {"basic":0,"active":0,"ultimate":0}
		for row in data.skills.values():
			if row.daoId != dao_id:
				continue
			var config := ASSETS.skill(dao_id,row.skillId)
			assert_str(config.skillId).is_equal(row.skillId)
			assert_str(config.fallbackKey).is_equal("dao." + dao_id)
			counts[config.category] += 1
		assert_int(counts.basic).is_equal(1)
		assert_int(counts.active).is_equal(8)
		assert_int(counts.ultimate).is_equal(1)

func test_missing_paths_and_metadata_fallback_without_catalog_mutation() -> void:
	assert_str(ASSETS.skill("spell","missing.skill","ultimate").fallbackKey).is_equal("dao.spell")
	assert_str(ASSETS.skill("missing.dao","missing.skill").fallbackKey).is_equal("generic")
	assert_str(ASSETS.environment(null).fallbackKey).is_equal("mountain-shell")
	var missing := ASSETS.environment({"major_realm_index":1})
	assert_str(missing.biomeFamilyId).is_equal("generic")
	assert_str(missing.biomeBasePath).is_equal("")
	assert_str(missing.zoneIntensityKey).is_equal("tier.1")
	assert_str(missing.primaryElement).is_equal("neutral")
	assert_str(missing.primaryElementInfoKey).is_equal("element.neutral")
	assert_str(ASSETS.environment({"biome_name":"unknown","zone":99,"primary_element":"unknown"}).biomeFamilyId).is_equal("generic")
	assert_str(ASSETS.environment({"zone":99}).zoneIntensityKey).is_equal("tier.1")
	assert_object(ASSETS.texture_for_path("res://art/approved/combat/missing.webp")).is_null()
	assert_object(ASSETS.texture_for_path("user://missing.png")).is_null()
	assert_object(ASSETS.texture_for_path("res://art/approved/home/home_ui_core.webp")).is_not_null()
	var config := ASSETS.enemy("wolf")
	config.id = "mutated"
	assert_str(ASSETS.enemy("wolf").id).is_equal("wolf")

func test_screen_and_slots_bind_asset_configs_with_full_or_missing_metadata() -> void:
	var screen := SCREEN.new()
	add_child(screen)
	screen.bind({"environment":{"major_realm_index":1,"biome_name":"Thanh Hư Sơn Mạch","zone":1,"primary_element":"Wood"},
		"enemy":{"archetype_id":"serpent"},"skills":[{"id":"skill.dao.spell.basic","slot_class":"basic","dao_id":"spell"}]})
	assert_str(screen._battlefield.asset_config.biomeFamilyId).is_equal("mountain_valley")
	assert_str(screen._enemy_actor.asset_config.id).is_equal("serpent")
	assert_str(screen._skill_rail._basic.asset_config.fallbackKey).is_equal("dao.spell")
	await get_tree().process_frame
	screen.bind({})
	assert_str(screen._enemy_actor.asset_config.id).is_equal("generic")
	assert_str(screen._battlefield.asset_config.fallbackKey).is_equal("mountain-shell")
	screen.free()
