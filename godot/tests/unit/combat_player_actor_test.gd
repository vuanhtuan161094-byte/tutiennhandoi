class_name CombatPlayerActorTest
extends GdUnitTestSuite

const REGISTRY := preload("res://scripts/combat/combat_player_animation_registry.gd")
const PLAYER_ACTOR := preload("res://scripts/combat/combat_player_actor.gd")

func test_artifact_registry_covers_canonical_combat_kit() -> void:
	var expected := PackedStringArray([
		"skill.dao.artifact.basic",
		"skill.dao.artifact.deploy",
		"skill.dao.artifact.guard",
		"skill.dao.artifact.strike",
		"skill.dao.artifact.sync",
		"skill.dao.artifact.recall",
		"skill.dao.artifact.split",
		"skill.dao.artifact.merge",
		"skill.dao.artifact.suppress",
		"skill.dao.artifact.ultimate",
	])
	var actual := REGISTRY.artifact_skill_ids()
	assert_int(actual.size()).is_equal(expected.size())
	for skill_id in expected:
		assert_bool(actual.has(skill_id)).is_true()
	assert_str(str(REGISTRY.idle_preset("artifact").get("animation_name", ""))).is_equal("idle")

func test_unknown_dao_and_skill_do_not_invent_animation() -> void:
	assert_int(REGISTRY.idle_preset("sword").size()).is_equal(0)
	assert_int(REGISTRY.skill_preset("artifact", "skill.dao.artifact.missing").size()).is_equal(0)
	assert_int(REGISTRY.skill_preset("sword", "skill.dao.artifact.basic").size()).is_equal(0)

func test_player_actor_falls_back_safely_when_candidate_resources_are_absent() -> void:
	var actor := PLAYER_ACTOR.new()
	actor.custom_minimum_size = Vector2(160, 200)
	add_child(actor)
	await get_tree().process_frame
	actor.bind_dao("sword")
	assert_bool(actor.using_candidate_animation()).is_false()
	assert_bool(actor.play_skill("skill.dao.artifact.basic")).is_false()
	actor.free()


func test_artifact_visual_scale_calibration_stays_conservative() -> void:
	var idle := REGISTRY.idle_preset("artifact")
	assert_float(float(idle.get("visual_scale", 0.0))).is_between(0.75, 1.20)
	for skill_id in REGISTRY.artifact_skill_ids():
		var preset := REGISTRY.skill_preset("artifact", skill_id)
		assert_float(float(preset.get("visual_scale", 0.0))).is_between(0.75, 1.20)
