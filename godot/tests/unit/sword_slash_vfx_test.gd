class_name SwordSlashVfxTest
extends GdUnitTestSuite

const SWORD_SLASH_VFX := preload("res://scripts/combat/sword_slash_vfx.gd")


func test_supports_only_current_slash_family_skill_ids() -> void:
	var supported: Array[String] = [
		"skill.dao.sword.basic",
		"skill.dao.sword.flow_slash",
		"skill.dao.sword.chain",
		"skill.dao.sword.sever",
		"skill.dao.sword.finisher",
	]
	for skill_id in supported:
		assert_bool(SWORD_SLASH_VFX.supports_skill(skill_id)).is_true()

	assert_bool(SWORD_SLASH_VFX.supports_skill("skill.dao.sword.nurture")).is_false()
	assert_bool(SWORD_SLASH_VFX.supports_skill("skill.dao.sword.myriad")).is_false()
	assert_bool(SWORD_SLASH_VFX.supports_skill("skill.dao.sword.ultimate")).is_false()


func test_chain_visual_preserves_three_hit_backend_identity() -> void:
	var profile: Dictionary = SWORD_SLASH_VFX.profile_for_skill("skill.dao.sword.chain")
	assert_int(int(profile.get("stroke_count", 0))).is_equal(3)
	var angles: Array = profile.get("angles_deg", [])
	assert_int(angles.size()).is_equal(3)


func test_break_and_finisher_have_distinct_presentation_weights() -> void:
	var sever: Dictionary = SWORD_SLASH_VFX.profile_for_skill("skill.dao.sword.sever")
	var finisher: Dictionary = SWORD_SLASH_VFX.profile_for_skill("skill.dao.sword.finisher")

	assert_str(str(sever.get("impact_kind", ""))).is_equal("break")
	assert_bool(float(sever.get("fracture", 0.0)) > 0.0).is_true()
	assert_str(str(finisher.get("impact_kind", ""))).is_equal("heavy")
	assert_bool(
		float(finisher.get("base_width", 0.0))
		> float(sever.get("base_width", 0.0))
	).is_true()


func test_profile_lookup_is_copy_safe() -> void:
	var first: Dictionary = SWORD_SLASH_VFX.profile_for_skill("skill.dao.sword.basic")
	first["stroke_count"] = 99
	var second: Dictionary = SWORD_SLASH_VFX.profile_for_skill("skill.dao.sword.basic")
	assert_int(int(second.get("stroke_count", 0))).is_equal(1)


func test_unknown_skill_has_empty_profile() -> void:
	assert_bool(
		SWORD_SLASH_VFX.profile_for_skill("skill.dao.sword.unknown").is_empty()
	).is_true()
