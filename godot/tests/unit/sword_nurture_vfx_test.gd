class_name SwordNurtureVfxTest
extends GdUnitTestSuite

const SWORD_NURTURE_VFX := preload("res://scripts/combat/sword_nurture_vfx.gd")


func test_matches_current_backend_skill_id() -> void:
	assert_bool(
		SWORD_NURTURE_VFX.supports_skill("skill.dao.sword.nurture")
	).is_true()
	assert_bool(
		SWORD_NURTURE_VFX.supports_skill("skill.dao.sword.myriad")
	).is_false()


func test_default_visual_duration_tracks_current_charge_duration() -> void:
	assert_float(
		SWORD_NURTURE_VFX.default_visual_duration()
	).is_equal(1.5)
