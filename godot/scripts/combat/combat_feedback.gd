extends Node
class_name CombatFeedback
## Presentation-only adapter around the vendored Saltmire Juice runtime.
##
## Canonical combat/gameplay timing remains owned by the locked JS runtime.
## This adapter intentionally does NOT expose Juice.hitstop(), because that
## mutates Engine.time_scale while the external authority can keep advancing.

const SWORD_SLASH_VFX := preload("res://scripts/combat/sword_slash_vfx.gd")
const SWORD_NURTURE_VFX := preload("res://scripts/combat/sword_nurture_vfx.gd")

enum ImpactLevel {
	LIGHT,
	NORMAL,
	HEAVY,
	BREAK,
}

func shake(camera: Camera2D, level: int = ImpactLevel.NORMAL) -> void:
	var juice := _juice()
	if juice == null or camera == null:
		return

	var amount := 0.24
	var decay := 2.0
	var max_offset := Vector2(5.0, 3.0)
	var max_roll := 0.012

	match level:
		ImpactLevel.LIGHT:
			amount = 0.14
			max_offset = Vector2(3.0, 2.0)
			max_roll = 0.006
		ImpactLevel.HEAVY:
			amount = 0.38
			decay = 1.8
			max_offset = Vector2(8.0, 5.0)
			max_roll = 0.020
		ImpactLevel.BREAK:
			amount = 0.52
			decay = 1.65
			max_offset = Vector2(11.0, 7.0)
			max_roll = 0.028

	juice.call("shake", camera, amount, decay, max_offset, max_roll)


func flash_hit(target: CanvasItem, level: int = ImpactLevel.NORMAL) -> void:
	var juice := _juice()
	if juice == null or target == null:
		return

	var tint := Color(1.0, 0.96, 0.82, 1.0)
	var duration := 0.10
	if level == ImpactLevel.HEAVY or level == ImpactLevel.BREAK:
		tint = Color(1.0, 0.90, 0.64, 1.0)
		duration = 0.14

	juice.call("flash", target, tint, duration)


func punch(node: Node, scale_mult: float = 1.08, duration: float = 0.16) -> void:
	var juice := _juice()
	if juice == null or node == null:
		return
	juice.call("pop", node, clampf(scale_mult, 1.0, 1.18), clampf(duration, 0.08, 0.28))


func damage_number(
		parent: Node,
		world_pos: Vector2,
		value: Variant,
		critical: bool = false
	) -> void:
	var juice := _juice()
	if juice == null or parent == null:
		return

	var options := {
		"color": Color(1.0, 0.86, 0.52, 1.0) if critical else Color(1.0, 1.0, 1.0, 1.0),
		"rise": 46.0 if critical else 36.0,
		"duration": 0.72 if critical else 0.62,
		"spread": 8.0,
		"scale": 1.28 if critical else 1.0,
	}
	juice.call("damage_number", parent, world_pos, value, options)


func sword_slash(
		parent: Node,
		skill_id: String,
		from_global: Vector2,
		to_global_position: Vector2,
		target: CanvasItem = null,
		camera: Camera2D = null
	) -> Node2D:
	if parent == null or not SWORD_SLASH_VFX.supports_skill(skill_id):
		return null

	var effect: SwordSlashVfx = SWORD_SLASH_VFX.new()
	parent.add_child(effect)
	effect.impact_requested.connect(
		_on_sword_slash_impact.bind(target, camera)
	)
	effect.play(skill_id, from_global, to_global_position)
	return effect


func sword_nurture(
		parent: Node,
		anchor_global: Vector2,
		authority_duration: float = 1.5
	) -> Node2D:
	if parent == null:
		return null

	var effect: SwordNurtureVfx = SWORD_NURTURE_VFX.new()
	parent.add_child(effect)
	effect.play(anchor_global, authority_duration)
	return effect


func _on_sword_slash_impact(
		_world_position: Vector2,
		impact_kind: String,
		target: CanvasItem,
		camera: Camera2D
	) -> void:
	var level := ImpactLevel.NORMAL
	match impact_kind:
		"light":
			level = ImpactLevel.LIGHT
		"heavy":
			level = ImpactLevel.HEAVY
		"break":
			level = ImpactLevel.BREAK

	if target != null:
		flash_hit(target, level)
	if camera != null:
		shake(camera, level)


func _juice() -> Node:
	return get_node_or_null("/root/Juice")
