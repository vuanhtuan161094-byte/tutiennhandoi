class_name ArtifactCombatVfxTest
extends GdUnitTestSuite

const VFX := preload("res://scripts/combat/artifact_combat_vfx.gd")

func test_vfx_profiles_cover_full_artifact_kit() -> void:
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
	for skill_id in expected:
		assert_bool(VFX.supports_skill(skill_id)).is_true()
		var profile := VFX.profile_for_skill(skill_id)
		assert_float(float(profile.get("duration", 0.0))).is_greater(0.0)
		assert_int(int(profile.get("copies", 0))).is_greater_equal(1)

func test_vfx_unknown_skill_fails_closed() -> void:
	assert_bool(VFX.supports_skill("skill.dao.artifact.missing")).is_false()
	assert_int(VFX.profile_for_skill("skill.dao.artifact.missing").size()).is_equal(0)

func test_major_artifact_skills_have_stronger_impact_profiles() -> void:
	assert_str(VFX.impact_kind("skill.dao.artifact.basic")).is_equal("light")
	assert_str(VFX.impact_kind("skill.dao.artifact.strike")).is_equal("heavy")
	assert_str(VFX.impact_kind("skill.dao.artifact.suppress")).is_equal("break")
	assert_str(VFX.impact_kind("skill.dao.artifact.ultimate")).is_equal("break")
