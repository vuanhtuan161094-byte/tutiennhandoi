extends Node2D
class_name ArtifactCombatVfx
## Presentation-only Ngự Khí combat VFX.
## It never decides hit/miss, damage, resources, cooldowns or timing authority.

signal effect_finished(skill_id: String, phase: String)

const PHASE_CAST := "cast"
const PHASE_TRAVEL := "travel"
const PHASE_IMPACT := "impact"
const PHASE_SELF := "self"

const PROFILES := {
	"skill.dao.artifact.basic": {"impact": "light", "width": 4.0, "copies": 1, "arc": 14.0, "duration": 0.32},
	"skill.dao.artifact.deploy": {"impact": "normal", "width": 4.0, "copies": 2, "arc": 18.0, "duration": 0.40},
	"skill.dao.artifact.guard": {"impact": "light", "width": 4.0, "copies": 3, "arc": 20.0, "duration": 0.42},
	"skill.dao.artifact.strike": {"impact": "heavy", "width": 8.0, "copies": 1, "arc": 12.0, "duration": 0.36},
	"skill.dao.artifact.sync": {"impact": "heavy", "width": 6.0, "copies": 3, "arc": 22.0, "duration": 0.46},
	"skill.dao.artifact.recall": {"impact": "light", "width": 4.0, "copies": 2, "arc": 20.0, "duration": 0.44},
	"skill.dao.artifact.split": {"impact": "normal", "width": 5.0, "copies": 2, "arc": 26.0, "duration": 0.44},
	"skill.dao.artifact.merge": {"impact": "heavy", "width": 7.0, "copies": 1, "arc": 16.0, "duration": 0.48},
	"skill.dao.artifact.suppress": {"impact": "break", "width": 9.0, "copies": 3, "arc": 30.0, "duration": 0.52},
	"skill.dao.artifact.ultimate": {"impact": "break", "width": 10.0, "copies": 3, "arc": 34.0, "duration": 0.62},
}

var _skill_id := ""
var _phase := ""
var _profile: Dictionary = {}
var _elapsed := 0.0
var _duration := 0.4
var _local_target := Vector2.ZERO
var _playing := false

func _ready() -> void:
	var additive := CanvasItemMaterial.new()
	additive.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	material = additive
	z_index = 92
	set_process(false)

static func supports_skill(skill_id: String) -> bool:
	return PROFILES.has(skill_id)

static func profile_for_skill(skill_id: String) -> Dictionary:
	var profile: Dictionary = PROFILES.get(skill_id, {})
	return profile.duplicate(true)

static func impact_kind(skill_id: String) -> String:
	return str(PROFILES.get(skill_id, {}).get("impact", "normal"))

func play(skill_id: String, phase: String, from_global: Vector2, to_global_position: Vector2) -> void:
	if not supports_skill(skill_id):
		queue_free()
		return
	_skill_id = skill_id
	_phase = phase
	_profile = profile_for_skill(skill_id)
	_elapsed = 0.0
	_duration = float(_profile.get("duration", 0.4))
	match phase:
		PHASE_CAST:
			_duration *= 0.72
			global_position = from_global
		PHASE_SELF:
			_duration *= 0.90
			global_position = from_global
		PHASE_IMPACT:
			_duration *= 0.78
			global_position = to_global_position
		_:
			global_position = from_global
	_local_target = to_local(to_global_position)
	_playing = true
	set_process(true)
	queue_redraw()

func _process(delta: float) -> void:
	if not _playing:
		return
	_elapsed += maxf(0.0, delta)
	queue_redraw()
	if _elapsed >= _duration:
		_playing = false
		set_process(false)
		effect_finished.emit(_skill_id, _phase)
		queue_free()

func _draw() -> void:
	if not _playing:
		return
	var t := clampf(_elapsed / maxf(0.01, _duration), 0.0, 1.0)
	match _phase:
		PHASE_TRAVEL:
			_draw_travel(t)
		PHASE_IMPACT:
			_draw_impact(t)
		PHASE_SELF:
			_draw_self(t, true)
		_:
			_draw_self(t, false)

func _draw_travel(t: float) -> void:
	if _local_target.length_squared() <= 1.0:
		return
	var reveal := _smoothstep(0.0, 0.62, t)
	var fade := 1.0 - _smoothstep(0.68, 1.0, t)
	var copies := int(_profile.get("copies", 1))
	var width := float(_profile.get("width", 5.0))
	var arc := float(_profile.get("arc", 18.0))
	for index in range(copies):
		var lane := float(index) - float(copies - 1) * 0.5
		var points := _curve_points(_local_target, arc * (1.0 + absf(lane) * 0.25), lane * 10.0, reveal)
		if points.size() < 2:
			continue
		draw_polyline(points, Color(0.05, 0.85, 0.95, 0.18 * fade), width * 3.0, true)
		draw_polyline(points, Color(0.18, 0.96, 1.0, 0.58 * fade), width * 1.45, true)
		draw_polyline(points, Color(0.88, 1.0, 1.0, 0.92 * fade), maxf(1.2, width * 0.34), true)
	var tip := _local_target * reveal
	draw_circle(tip, 3.5 + width * 0.28, Color(0.72, 1.0, 1.0, 0.86 * fade))

func _draw_impact(t: float) -> void:
	var attack := _smoothstep(0.0, 0.18, t)
	var fade := 1.0 - _smoothstep(0.48, 1.0, t)
	var strength := 1.0
	match str(_profile.get("impact", "normal")):
		"heavy":
			strength = 1.28
		"break":
			strength = 1.52
	var radius := lerpf(10.0, 42.0 * strength, _smoothstep(0.0, 0.64, t))
	var alpha := attack * fade
	draw_arc(Vector2.ZERO, radius, 0.0, TAU, 48, Color(0.20, 0.96, 1.0, 0.74 * alpha), 2.3 * strength, true)
	draw_arc(Vector2.ZERO, radius * 0.60, 0.0, TAU, 40, Color(0.86, 1.0, 1.0, 0.82 * alpha), 1.3 * strength, true)
	var rays := 8 if strength < 1.4 else 12
	for index in range(rays):
		var angle := TAU * float(index) / float(rays) + float(index % 2) * 0.09
		var direction := Vector2.from_angle(angle)
		var inner := direction * radius * 0.36
		var outer := direction * radius * (0.86 + float(index % 3) * 0.08)
		draw_line(inner, outer, Color(0.20, 0.88, 1.0, 0.66 * alpha), 1.4 * strength, true)
	draw_circle(Vector2.ZERO, 5.0 + 6.0 * strength * (1.0 - t), Color(0.92, 1.0, 1.0, 0.78 * alpha))

func _draw_self(t: float, inward: bool) -> void:
	var fade := 1.0 - _smoothstep(0.72, 1.0, t)
	var copies := int(_profile.get("copies", 1))
	var base_radius := lerpf(48.0, 24.0, t) if inward else lerpf(22.0, 52.0, t)
	for index in range(maxi(1, copies)):
		var angle := _elapsed * (2.2 + float(index) * 0.18) + TAU * float(index) / float(maxi(1, copies))
		var p := Vector2(cos(angle) * base_radius, sin(angle) * base_radius * 0.42)
		draw_circle(p, 3.0 + float(index % 2), Color(0.36, 0.98, 1.0, 0.74 * fade))
		draw_line(p * 0.35, p, Color(0.12, 0.78, 0.92, 0.32 * fade), 1.2, true)
	draw_arc(Vector2.ZERO, base_radius * 0.92, 0.0, TAU, 40, Color(0.18, 0.88, 0.96, 0.20 * fade), 1.4, true)

func _curve_points(end_point: Vector2, curvature: float, lane_offset: float, reveal: float) -> PackedVector2Array:
	var points := PackedVector2Array()
	if reveal <= 0.001:
		return points
	var normal := end_point.normalized().orthogonal()
	var steps := 20
	var visible_steps := maxi(2, int(ceil(float(steps) * reveal)))
	for index in range(visible_steps + 1):
		var full_t := minf(reveal, float(index) / float(steps))
		var bow := sin(full_t * PI) * curvature
		points.append(end_point * full_t + normal * (bow + lane_offset * sin(full_t * PI)))
	return points

static func _smoothstep(edge0: float, edge1: float, value: float) -> float:
	if is_equal_approx(edge0, edge1):
		return 1.0 if value >= edge1 else 0.0
	var x := clampf((value - edge0) / (edge1 - edge0), 0.0, 1.0)
	return x * x * (3.0 - 2.0 * x)
