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
		assert_str(str(profile.get("style", ""))).is_not_empty()

func test_vfx_unknown_skill_fails_closed() -> void:
	assert_bool(VFX.supports_skill("skill.dao.artifact.missing")).is_false()
	assert_int(VFX.profile_for_skill("skill.dao.artifact.missing").size()).is_equal(0)

func test_major_artifact_skills_have_stronger_impact_profiles() -> void:
	assert_str(VFX.impact_kind("skill.dao.artifact.basic")).is_equal("light")
	assert_str(VFX.impact_kind("skill.dao.artifact.strike")).is_equal("heavy")
	assert_str(VFX.impact_kind("skill.dao.artifact.suppress")).is_equal("break")
	assert_str(VFX.impact_kind("skill.dao.artifact.ultimate")).is_equal("break")


func test_every_artifact_skill_has_a_distinct_v3_style() -> void:
	var styles := {}
	for skill_id in [
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
	]:
		var style := VFX.style_for_skill(skill_id)
		assert_str(style).is_not_empty()
		assert_bool(styles.has(style)).is_false()
		styles[style] = true
	assert_int(styles.size()).is_equal(10)


func test_v3_projection_scale_escalates_with_skill_tier() -> void:
	assert_int(VFX.projected_weapon_count("skill.dao.artifact.basic")).is_equal(4)
	assert_int(VFX.projected_weapon_count("skill.dao.artifact.deploy")).is_greater_equal(8)
	assert_int(VFX.projected_weapon_count("skill.dao.artifact.merge")).is_greater_equal(16)
	assert_int(VFX.projected_weapon_count("skill.dao.artifact.suppress")).is_greater_equal(18)
	assert_int(VFX.projected_weapon_count("skill.dao.artifact.ultimate")).is_greater_equal(30)


func test_v3_candidate_texture_contract_is_stable_without_requiring_binary_assets() -> void:
	assert_str(VFX.candidate_texture_path("deploy")).is_equal(
		"res://art/candidate/combat/ngukhi_v3/deploy_vortex.png"
	)
	assert_str(VFX.candidate_texture_path("guard")).is_equal(
		"res://art/candidate/combat/ngukhi_v3/guard_barrier.png"
	)
	assert_str(VFX.candidate_texture_path("suppress")).is_equal(
		"res://art/candidate/combat/ngukhi_v3/suppress_seal.png"
	)
	assert_str(VFX.candidate_texture_path("ultimate")).is_equal(
		"res://art/candidate/combat/ngukhi_v3/ultimate_barrage.png"
	)
	assert_str(VFX.candidate_texture_path("unknown")).is_empty()


func test_v3_major_painted_layers_are_impact_only() -> void:
	var suppress := VFX.profile_for_skill("skill.dao.artifact.suppress")
	var ultimate := VFX.profile_for_skill("skill.dao.artifact.ultimate")
	assert_str(str(suppress.get("v3_asset", ""))).is_equal("suppress")
	assert_str(str(ultimate.get("v3_asset", ""))).is_equal("ultimate")
	assert_str(VFX.impact_kind("skill.dao.artifact.suppress")).is_equal("break")
	assert_str(VFX.impact_kind("skill.dao.artifact.ultimate")).is_equal("break")
