extends Node2D
class_name SwordSlashVfx
## Presentation-only procedural VFX for the Sword Dao "slash family".
##
## Canonical damage, cast, recovery, resource and hit authority stay in the JS runtime.
## This node only maps canonical skill ids to a deterministic visual treatment.

signal impact_requested(world_position: Vector2, impact_kind: String)
signal effect_finished(skill_id: String)

const SKILL_BASIC := "skill.dao.sword.basic"
const SKILL_FLOW := "skill.dao.sword.flow_slash"
const SKILL_CHAIN := "skill.dao.sword.chain"
const SKILL_SEVER := "skill.dao.sword.sever"
const SKILL_FINISHER := "skill.dao.sword.finisher"

const PROFILES := {
	SKILL_BASIC: {
		"stroke_count": 1,
		"stroke_delay": 0.0,
		"stroke_duration": 0.42,
		"angles_deg": [-4.0],
		"base_width": 7.0,
		"length_scale": 0.72,
		"max_length": 230.0,
		"curvature": 20.0,
		"fracture": 0.0,
		"shard_count": 3,
		"impact_kind": "light",
	},
	SKILL_FLOW: {
		"stroke_count": 1,
		"stroke_delay": 0.0,
		"stroke_duration": 0.44,
		"angles_deg": [-8.0],
		"base_width": 9.0,
		"length_scale": 0.96,
		"max_length": 285.0,
		"curvature": 32.0,
		"fracture": 0.0,
		"shard_count": 5,
		"impact_kind": "normal",
	},
	SKILL_CHAIN: {
		"stroke_count": 3,
		"stroke_delay": 0.11,
		"stroke_duration": 0.34,
		"angles_deg": [-13.0, 9.0, -4.0],
		"base_width": 8.0,
		"length_scale": 0.90,
		"max_length": 275.0,
		"curvature": 26.0,
		"fracture": 0.0,
		"shard_count": 4,
		"impact_kind": "normal",
	},
	SKILL_SEVER: {
		"stroke_count": 1,
		"stroke_delay": 0.0,
		"stroke_duration": 0.58,
		"angles_deg": [-3.0],
		"base_width": 13.0,
		"length_scale": 1.08,
		"max_length": 315.0,
		"curvature": 16.0,
		"fracture": 1.0,
		"shard_count": 9,
		"impact_kind": "break",
	},
	SKILL_FINISHER: {
		"stroke_count": 1,
		"stroke_delay": 0.0,
		"stroke_duration": 0.68,
		"angles_deg": [-7.0],
		"base_width": 16.0,
		"length_scale": 1.18,
		"max_length": 340.0,
		"curvature": 28.0,
		"fracture": 0.72,
		"shard_count": 12,
		"impact_kind": "heavy",
	},
}

var _elapsed := 0.0
var _effect_duration := 0.0
var _skill_id := ""
var _profile: Dictionary = {}
var _local_end := Vector2.ZERO
var _strokes: Array[Dictionary] = []
var _playing := false


func _ready() -> void:
	var additive_material := CanvasItemMaterial.new()
	additive_material.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	material = additive_material
	z_index = 80
	set_process(_playing)


static func supported_skill_ids() -> PackedStringArray:
	return PackedStringArray([
		SKILL_BASIC,
		SKILL_FLOW,
		SKILL_CHAIN,
		SKILL_SEVER,
		SKILL_FINISHER,
	])


static func supports_skill(skill_id: String) -> bool:
	return PROFILES.has(skill_id)


static func profile_for_skill(skill_id: String) -> Dictionary:
	var profile: Dictionary = PROFILES.get(skill_id, {})
	return profile.duplicate(true)


func play(skill_id: String, from_global: Vector2, to_global_position: Vector2) -> void:
	if not supports_skill(skill_id):
		push_warning("SwordSlashVfx does not support skill id: %s" % skill_id)
		return

	_skill_id = skill_id
	_profile = profile_for_skill(skill_id)
	_elapsed = 0.0
	global_position = from_global
	_local_end = to_local(to_global_position)

	var max_length := float(_profile.get("max_length", 280.0))
	var current_length := _local_end.length()
	if current_length < 72.0:
		_local_end = Vector2(170.0, -48.0)
	elif current_length > max_length:
		_local_end = _local_end.normalized() * max_length

	_build_strokes()
	_playing = true
	set_process(true)
	queue_redraw()


func _build_strokes() -> void:
	_strokes.clear()
	var stroke_count := int(_profile.get("stroke_count", 1))
	var stroke_delay := float(_profile.get("stroke_delay", 0.0))
	var stroke_duration := float(_profile.get("stroke_duration", 0.45))
	var angles: Array = _profile.get("angles_deg", [0.0])

	for index in range(stroke_count):
		var angle_deg := 0.0
		if index < angles.size():
			angle_deg = float(angles[index])
		_strokes.append({
			"delay": float(index) * stroke_delay,
			"duration": stroke_duration,
			"angle": deg_to_rad(angle_deg),
			"impact_emitted": false,
		})

	_effect_duration = (
		float(maxi(0, stroke_count - 1)) * stroke_delay
		+ stroke_duration
		+ 0.16
	)


func _process(delta: float) -> void:
	if not _playing:
		return

	_elapsed += delta
	var impact_kind := str(_profile.get("impact_kind", "normal"))

	for index in range(_strokes.size()):
		var stroke: Dictionary = _strokes[index]
		var local_time := _elapsed - float(stroke["delay"])
		var duration := float(stroke["duration"])
		if (
			local_time >= duration * 0.58
			and not bool(stroke["impact_emitted"])
		):
			stroke["impact_emitted"] = true
			_strokes[index] = stroke
			impact_requested.emit(_impact_world_position(stroke), impact_kind)

	queue_redraw()

	if _elapsed >= _effect_duration:
		_playing = false
		set_process(false)
		effect_finished.emit(_skill_id)
		queue_free()


func _draw() -> void:
	if not _playing:
		return

	for stroke_variant in _strokes:
		var stroke: Dictionary = stroke_variant
		var local_time := _elapsed - float(stroke["delay"])
		var duration := float(stroke["duration"])
		if local_time < 0.0 or local_time > duration:
			continue

		var phase := clampf(local_time / duration, 0.0, 1.0)
		var reveal := _smoothstep(0.0, 0.52, phase)
		var attack_alpha := _smoothstep(0.0, 0.16, phase)
		var fade_alpha := 1.0 - _smoothstep(0.60, 1.0, phase)
		var alpha := attack_alpha * fade_alpha
		if alpha <= 0.001:
			continue

		_draw_stroke(stroke, reveal, alpha, phase)


func _draw_stroke(
		stroke: Dictionary,
		reveal: float,
		alpha: float,
		phase: float
	) -> void:
	var angle := float(stroke["angle"])
	var end_point := _local_end.rotated(angle) * float(_profile.get("length_scale", 1.0))
	var curvature := float(_profile.get("curvature", 24.0))
	var points := _build_curve_points(end_point, curvature, reveal)
	if points.size() < 2:
		return

	var width := float(_profile.get("base_width", 9.0))
	var pulse := 0.90 + sin(clampf(phase, 0.0, 1.0) * PI) * 0.18
	width *= pulse

	draw_polyline(
		points,
		Color(0.38, 0.18, 1.0, 0.16 * alpha),
		width * 3.4,
		true
	)
	draw_polyline(
		points,
		Color(0.12, 0.48, 1.0, 0.48 * alpha),
		width * 1.8,
		true
	)
	draw_polyline(
		points,
		Color(0.88, 0.96, 1.0, 0.96 * alpha),
		maxf(2.0, width * 0.46),
		true
	)

	var tangent := end_point.normalized()
	var normal := tangent.orthogonal()
	var afterimage_offset := normal * (6.0 + width * 0.18)
	var afterimage := PackedVector2Array()
	for point in points:
		afterimage.append(point - afterimage_offset)
	draw_polyline(
		afterimage,
		Color(0.43, 0.20, 1.0, 0.11 * alpha),
		maxf(2.0, width * 0.70),
		true
	)

	var tip := points[points.size() - 1]
	draw_circle(
		tip,
		maxf(2.0, width * 0.42),
		Color(0.82, 0.94, 1.0, 0.82 * alpha)
	)

	if phase >= 0.48:
		_draw_impact_fragments(end_point, angle, phase, alpha)

	var fracture_strength := float(_profile.get("fracture", 0.0))
	if fracture_strength > 0.0 and phase >= 0.48:
		_draw_fracture(end_point, fracture_strength, phase, alpha)


func _build_curve_points(
		end_point: Vector2,
		curvature: float,
		reveal: float
	) -> PackedVector2Array:
	var points := PackedVector2Array()
	if end_point.length_squared() <= 0.001 or reveal <= 0.001:
		return points

	var normal := end_point.normalized().orthogonal()
	var steps := 22
	var visible_steps := maxi(2, int(ceil(float(steps) * reveal)))

	for index in range(visible_steps + 1):
		var full_t := float(index) / float(steps)
		if full_t > reveal:
			full_t = reveal
		var curve_offset := sin(full_t * PI) * curvature
		var taper := 0.35 + full_t * 0.65
		points.append(end_point * full_t + normal * curve_offset * taper)

	return points


func _draw_impact_fragments(
		end_point: Vector2,
		angle: float,
		phase: float,
		alpha: float
	) -> void:
	var shard_count := int(_profile.get("shard_count", 4))
	if shard_count <= 0:
		return

	var burst_alpha := 1.0 - _smoothstep(0.50, 0.92, phase)
	var center := end_point * 0.86
	for index in range(shard_count):
		var theta := (
			float(index) * TAU / float(shard_count)
			+ angle * 0.35
			+ float(index % 3) * 0.17
		)
		var direction := Vector2.from_angle(theta)
		var inner := 5.0 + float(index % 4) * 2.5
		var length := 10.0 + float((index * 7) % 13)
		var start := center + direction * inner
		var finish := start + direction * length
		draw_line(
			start,
			finish,
			Color(0.46, 0.70, 1.0, 0.72 * alpha * burst_alpha),
			1.4,
			true
		)


func _draw_fracture(
		end_point: Vector2,
		strength: float,
		phase: float,
		alpha: float
	) -> void:
	var fracture_alpha := (1.0 - _smoothstep(0.56, 0.96, phase)) * strength
	var tangent := end_point.normalized()
	var normal := tangent.orthogonal()
	var center := end_point * 0.82
	var half_span := 18.0 + 20.0 * strength

	draw_line(
		center - normal * half_span,
		center + normal * half_span,
		Color(0.82, 0.92, 1.0, 0.82 * alpha * fracture_alpha),
		1.8,
		true
	)
	draw_line(
		center + normal * 5.0,
		center + normal * (half_span * 0.72) + tangent * 13.0,
		Color(0.48, 0.28, 1.0, 0.60 * alpha * fracture_alpha),
		1.2,
		true
	)
	draw_line(
		center - normal * 4.0,
		center - normal * (half_span * 0.62) - tangent * 11.0,
		Color(0.30, 0.58, 1.0, 0.56 * alpha * fracture_alpha),
		1.2,
		true
	)


func _impact_world_position(stroke: Dictionary) -> Vector2:
	var angle := float(stroke["angle"])
	var end_point := _local_end.rotated(angle) * float(_profile.get("length_scale", 1.0))
	return to_global(end_point * 0.86)


static func _smoothstep(edge0: float, edge1: float, value: float) -> float:
	if is_equal_approx(edge0, edge1):
		return 1.0 if value >= edge1 else 0.0
	var x := clampf((value - edge0) / (edge1 - edge0), 0.0, 1.0)
	return x * x * (3.0 - 2.0 * x)
