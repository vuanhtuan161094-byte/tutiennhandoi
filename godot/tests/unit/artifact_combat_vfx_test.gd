class_name ArtifactCombatVfxTest
extends GdUnitTestSuite
const VFX := preload("res://scripts/combat/artifact_combat_vfx.gd")
func test_all_ten_skills_route_without_painted_assets() -> void:
	for suffix in VFX.STYLES:
		var id: String = "skill.dao.artifact."+str(suffix)
		assert_bool(VFX.supports_skill(id)).is_true()
		assert_str(VFX.style_for_skill(id)).is_equal(suffix)
		assert_bool(VFX.profile_for_skill(id).has("v3_asset")).is_false()
	assert_bool(VFX.supports_skill("skill.dao.artifact.missing")).is_false()
	assert_bool(VFX.supports_skill("skill.dao.sword.basic")).is_false()
func test_helper_has_no_overlay_children_and_expires() -> void:
	var effect := VFX.new()
	add_child(effect)
	effect.play("skill.dao.artifact.ultimate","impact",Vector2.ZERO,Vector2(60,60))
	assert_int(effect.get_child_count()).is_equal(0)
	assert_vector(effect.global_position).is_equal(Vector2(60,60))
	effect._process(0.6)
	assert_bool(effect.is_queued_for_deletion()).is_true()
	await get_tree().process_frame
func test_contact_strength_retains_tiers() -> void:
	assert_str(VFX.impact_kind("skill.dao.artifact.basic")).is_equal("light")
	assert_str(VFX.impact_kind("skill.dao.artifact.strike")).is_equal("heavy")
	assert_str(VFX.impact_kind("skill.dao.artifact.suppress")).is_equal("break")
	assert_str(VFX.impact_kind("skill.dao.artifact.ultimate")).is_equal("break")
