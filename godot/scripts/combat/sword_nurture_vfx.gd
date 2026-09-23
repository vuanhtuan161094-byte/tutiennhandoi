extends Node2D
class_name SwordNurtureVfx
## Presentation-only VFX for Tàng Phong Dưỡng Kiếm.
##
## The JS runtime remains authoritative for cast duration, damage and Sword Intent gain.
## This node only visualizes the charge by drawing converging sword qi.

signal effect_finished(skill_id: String)

const SKILL_ID := "skill.dao.sword.nurture"
const DEFAULT_VISUAL_DURATION := 1.5

var _elapsed := 0.0
var _duration := DEFAULT_VISUAL_DURATION
var _playing := false


func _ready() -> void:
	var additive_material := CanvasItemMaterial.new()
	additive_material.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	material = additive_material
	z_index = 78
	set_process(_playing)


static func supports_skill(skill_id: String) -> bool:
	return skill_id == SKILL_ID


static func default_visual_duration() -> float:
	return DEFAULT_VISUAL_DURATION


func play(anchor_global: Vector2, authority_duration: float = DEFAULT_VISUAL_DURATION) -> void:
	global_position = anchor_global
	_elapsed = 0.0
	_duration = maxf(0.20, authority_duration)
	_playing = true
	set_process(true)
	queue_redraw()


func _process(delta: float) -> void:
	if not _playing:
		return

	_elapsed += delta
	queue_redraw()

	if _elapsed >= _duration:
		_playing = false
		set_process(false)
		effect_finished.emit(SKILL_ID)
		queue_free()


func _draw() -> void:
	if not _playing:
		return

	var phase := clampf(_elapsed / _duration, 0.0, 1.0)
	var gather := _smoothstep(0.0, 0.66, phase)
	var peak := _smoothstep(0.52, 0.80, phase) * (1.0 - _smoothstep(0.84, 1.0, phase))
	var fade := 1.0 - _smoothstep(0.88, 1.0, phase)
	var alpha := maxf(0.0, fade)

	_draw_converging_wisps(gather, alpha)
	_draw_sword_intent_particles(gather, alpha)
	_draw_central_sword(gather, peak, alpha)


func _draw_converging_wisps(gather: float, alpha: float) -> void:
	var base_radius := lerpf(94.0, 44.0, gather)
	for index in range(3):
		var base_angle := float(index) * TAU / 3.0
		var angle := base_angle + _elapsed * (1.35 + float(index) * 0.08)
		var radius_x := base_radius
		var radius_y := base_radius * 0.48
		var position := Vector2(
			cos(angle) * radius_x,
			sin(angle) * radius_y
		)
		var tangent := Vector2(
			-sin(angle),
			cos(angle) * 0.48
		).normalized()
		var blade_length := lerpf(20.0, 38.0, gather)
		var blade_half := tangent * blade_length * 0.5

		draw_line(
			position - blade_half,
			position + blade_half,
			Color(0.34, 0.16, 1.0, 0.18 * alpha),
			8.0,
			true
		)
		draw_line(
			position - blade_half,
			position + blade_half,
			Color(0.16, 0.55, 1.0, 0.62 * alpha),
			3.4,
			true
		)
		draw_line(
			position - blade_half,
			position + blade_half,
			Color(0.90, 0.97, 1.0, 0.92 * alpha),
			1.2,
			true
		)

		var arc_start := angle - 0.70
		_draw_wind_arc(
			radius_x,
			radius_y,
			arc_start,
			0.92,
			0.10 * float(index - 1),
			0.22 * alpha
		)


func _draw_wind_arc(
		radius_x: float,
		radius_y: float,
		start_angle: float,
		sweep: float,
		rotation: float,
		alpha: float
	) -> void:
	var points := PackedVector2Array()
	var steps := 12
	for index in range(steps + 1):
		var t := float(index) / float(steps)
		var angle := start_angle + sweep * t
		var point := Vector2(
			cos(angle) * radius_x,
			sin(angle) * radius_y
		).rotated(rotation)
		points.append(point)

	draw_polyline(
		points,
		Color(0.24, 0.46, 1.0, alpha),
		1.6,
		true
	)


func _draw_sword_intent_particles(gather: float, alpha: float) -> void:
	var outer_radius := lerpf(112.0, 34.0, gather)
	for index in range(12):
		var phase_offset := float(index) * 2.399963
		var drift := _elapsed * (0.75 + float(index % 4) * 0.08)
		var angle := phase_offset + drift
		var radius := outer_radius * (0.55 + float((index * 7) % 10) / 20.0)
		var point := Vector2(
			cos(angle) * radius,
			sin(angle) * radius * 0.56
		)
		var inward := (-point).normalized()
		var length := 3.0 + float(index % 3) * 1.8
		draw_line(
			point,
			point + inward * length,
			Color(0.52, 0.76, 1.0, 0.50 * alpha),
			1.1,
			true
		)


func _draw_central_sword(gather: float, peak: float, alpha: float) -> void:
	var blade_height := lerpf(28.0, 126.0, gather)
	var half_height := blade_height * 0.5
	var core_width := lerpf(1.4, 4.6, gather) + peak * 1.8
	var glow_scale := 1.0 + peak * 0.45
	var top := Vector2(0.0, -half_height)
	var bottom := Vector2(0.0, half_height)
	var guard_y := half_height * 0.18
	var guard_half := lerpf(8.0, 25.0, gather)

	draw_line(
		top,
		bottom,
		Color(0.36, 0.18, 1.0, 0.18 * alpha),
		core_width * 5.2 * glow_scale,
		true
	)
	draw_line(
		top,
		bottom,
		Color(0.10, 0.50, 1.0, 0.62 * alpha),
		core_width * 2.4 * glow_scale,
		true
	)
	draw_line(
		top,
		bottom,
		Color(0.90, 0.98, 1.0, 0.96 * alpha),
		core_width,
		true
	)
	draw_line(
		Vector2(-guard_half, guard_y),
		Vector2(guard_half, guard_y),
		Color(0.46, 0.28, 1.0, 0.68 * alpha),
		2.0 + peak * 1.2,
		true
	)
	draw_circle(
		Vector2.ZERO,
		5.0 + peak * 7.0,
		Color(0.72, 0.90, 1.0, (0.22 + peak * 0.30) * alpha)
	)


static func _smoothstep(edge0: float, edge1: float, value: float) -> float:
	if is_equal_approx(edge0, edge1):
		return 1.0 if value >= edge1 else 0.0
	var x := clampf((value - edge0) / (edge1 - edge0), 0.0, 1.0)
	return x * x * (3.0 - 2.0 * x)
