class_name CombatPlayerAnimationRegistry
extends RefCounted

const DAO_ARTIFACT := "artifact"
const ROOT := "res://art/candidate/combat/ngukhi_v1"

# visual_scale is presentation calibration only. Source videos have different
# framing even though all generated SpriteFrames share a stable 256px canvas.
# These multipliers keep the apparent head-to-foot size closer across skills.
const IDLE := {
	"id": "ngukhi_idle",
	"resource_path": ROOT + "/ngukhi_idle/ngukhi_idle.tres",
	"animation_name": &"idle",
	"speed_scale": 1.0,
	"visual_scale": 1.00,
}

const SKILLS := {
	"skill.dao.artifact.basic": {
		"resource_path": ROOT + "/ngukhi_basic/ngukhi_basic.tres",
		"animation_name": &"skill.dao.artifact.basic",
		"speed_scale": 3.6,
		"visual_scale": 1.10,
	},
	"skill.dao.artifact.deploy": {
		"resource_path": ROOT + "/ngukhi_deploy/ngukhi_deploy.tres",
		"animation_name": &"skill.dao.artifact.deploy",
		"speed_scale": 2.8,
		"visual_scale": 1.03,
	},
	"skill.dao.artifact.guard": {
		"resource_path": ROOT + "/ngukhi_guard/ngukhi_guard.tres",
		"animation_name": &"skill.dao.artifact.guard",
		"speed_scale": 3.2,
		"visual_scale": 1.04,
	},
	"skill.dao.artifact.strike": {
		"resource_path": ROOT + "/ngukhi_strike/ngukhi_strike.tres",
		"animation_name": &"skill.dao.artifact.strike",
		"speed_scale": 3.5,
		"visual_scale": 1.04,
	},
	"skill.dao.artifact.sync": {
		"resource_path": ROOT + "/ngukhi_sync/ngukhi_sync.tres",
		"animation_name": &"skill.dao.artifact.sync",
		"speed_scale": 3.0,
		"visual_scale": 1.02,
	},
	"skill.dao.artifact.recall": {
		"resource_path": ROOT + "/ngukhi_recall/ngukhi_recall.tres",
		"animation_name": &"skill.dao.artifact.recall",
		"speed_scale": 3.6,
		"visual_scale": 0.92,
	},
	"skill.dao.artifact.split": {
		"resource_path": ROOT + "/ngukhi_split/ngukhi_split.tres",
		"animation_name": &"skill.dao.artifact.split",
		"speed_scale": 3.0,
		"visual_scale": 0.92,
	},
	"skill.dao.artifact.merge": {
		"resource_path": ROOT + "/ngukhi_merge/ngukhi_merge.tres",
		"animation_name": &"skill.dao.artifact.merge",
		"speed_scale": 2.3,
		"visual_scale": 0.96,
	},
	"skill.dao.artifact.suppress": {
		"resource_path": ROOT + "/ngukhi_suppress/ngukhi_suppress.tres",
		"animation_name": &"skill.dao.artifact.suppress",
		"speed_scale": 3.1,
		"visual_scale": 0.97,
	},
	"skill.dao.artifact.ultimate": {
		"resource_path": ROOT + "/ngukhi_ultimate/ngukhi_ultimate.tres",
		"animation_name": &"skill.dao.artifact.ultimate",
		"speed_scale": 2.7,
		"visual_scale": 0.95,
	},
}

static func idle_preset(dao_id: String) -> Dictionary:
	if dao_id != DAO_ARTIFACT:
		return {}
	return IDLE.duplicate(true)

static func skill_preset(dao_id: String, skill_id: String) -> Dictionary:
	if dao_id != DAO_ARTIFACT or not SKILLS.has(skill_id):
		return {}
	var preset: Dictionary = SKILLS[skill_id]
	return preset.duplicate(true)

static func artifact_skill_ids() -> PackedStringArray:
	var result := PackedStringArray()
	for skill_id in SKILLS.keys():
		result.append(str(skill_id))
	return result
