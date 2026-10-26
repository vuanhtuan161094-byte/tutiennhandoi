class_name CombatSkillCandidateIconsTest
extends GdUnitTestSuite

const SLOT := preload("res://scripts/combat/combat_skill_slot.gd")
const CANDIDATE_FLAG := "TUTIEN_R7V2_NGUKHI_ICON_CANDIDATE"
const ICON_IDS := [
	"basic", "deploy", "guard", "strike", "sync", "recall", "split", "merge", "suppress", "ultimate",
]

func test_original_ngukhi_icons_are_candidate_flag_gated_and_exact_id_mapped() -> void:
	var previous_flag := OS.get_environment(CANDIDATE_FLAG)
	var slot := SLOT.new()
	add_child(slot)
	await get_tree().process_frame
	for suffix_variant in ICON_IDS:
		var suffix: String = str(suffix_variant)
		var skill_id: String = "skill.dao.artifact." + suffix
		var path: String = "res://art/candidate_r7v2/ngukhi_icons/%s.svg" % suffix
		OS.set_environment(CANDIDATE_FLAG, "0")
		slot.bind({"id": skill_id, "dao_id": "artifact", "slot_class": "active", "name": suffix, "ready": true})
		assert_bool(slot._icon == null or slot._icon.resource_path != path).is_true()
		OS.set_environment(CANDIDATE_FLAG, "1")
		slot.bind({"id": skill_id, "dao_id": "artifact", "slot_class": "active", "name": suffix, "ready": true})
		assert_object(slot._icon).is_not_null()
		assert_str(slot._icon.resource_path).is_equal(path)

	OS.set_environment(CANDIDATE_FLAG, "1")
	slot.bind({"id": "skill.dao.sword.basic", "dao_id": "sword", "slot_class": "basic", "name": "Kiếm", "ready": true})
	assert_bool(slot._icon == null or slot._icon.resource_path.find("ngukhi_icons") == -1).is_true()
	OS.set_environment(CANDIDATE_FLAG, previous_flag)
