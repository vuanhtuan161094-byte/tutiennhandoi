extends Node2D
class_name ArtifactCombatVfx
## Ngự Khí V2 presentation-only VFX.
##
## Canonical combat authority stays in JS. This node only composes visual
## layers after authoritative events arrive. The generic "cyan streak for
## everything" candidate is intentionally replaced by skill-specific motifs.

signal effect_finished(skill_id: String, phase: String)

const PHASE_CAST := "cast"
const PHASE_TRAVEL := "travel"
const PHASE_IMPACT := "impact"
const PHASE_SELF := "self"

const CYAN := Color("#72F7FF")
const CYAN_DEEP := Color("#1AB9D6")
const GOLD := Color("#F4CE72")
const WHITE := Color("#F2FFFF")
const VIOLET := Color("#A67BFF")

const SUMMON_SCENE := preload("res://third_party/godot_vfx_library_curated/summon_circle.tscn")
const PORTAL_SCENE := preload("res://third_party/godot_vfx_library_curated/portal_vortex.tscn")
const ENERGY_SCENE := preload("res://third_party/godot_vfx_library_curated/energy_burst.tscn")
const COMBO_SCENE := preload("res://third_party/godot_vfx_library_curated/combo_ring.tscn")
const SHIELD_BREAK_SCENE := preload("res://third_party/godot_vfx_library_curated/shield_break.tscn")
const LIGHTNING_SCENE := preload("res://third_party/godot_vfx_library_curated/lightning_chain.tscn")

const PROFILES := {
	"skill.dao.artifact.basic": {
		"style": "basic", "impact": "light", "duration": 0.42,
	},
	"skill.dao.artifact.deploy": {
		"style": "deploy", "impact": "normal", "duration": 0.72,
	},
	"skill.dao.artifact.guard": {
		"style": "guard", "impact": "light", "duration": 0.78,
	},
	"skill.dao.artifact.strike": {
		"style": "strike", "impact": "heavy", "duration": 0.50,
	},
	"skill.dao.artifact.sync": {
		"style": "sync", "impact": "heavy", "duration": 0.62,
	},
	"skill.dao.artifact.recall": {
		"style": "recall", "impact": "light", "duration": 0.82,
	},
	"skill.dao.artifact.split": {
		"style": "split", "impact": "normal", "duration": 0.72,
	},
	"skill.dao.artifact.merge": {
		"style": "merge", "impact": "heavy", "duration": 0.90,
	},
	"skill.dao.artifact.suppress": {
		"style": "suppress", "impact": "break", "duration": 0.96,
	},
	"skill.dao.artifact.ultimate": {
		"style": "ultimate", "impact": "break", "duration": 1.18,
	},
}

var _skill_id := ""
var _phase := ""
var _style := ""
var _profile: Dictionary = {}
var _elapsed := 0.0
var _duration := 0.5
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


static func style_for_skill(skill_id: String) -> String:
	return str(PROFILES.get(skill_id, {}).get("style", ""))


func play(skill_id: String, phase: String, from_global: Vector2, to_global_position: Vector2) -> void:
	if not supports_skill(skill_id):
		queue_free()
		return

	_skill_id = skill_id
	_phase = phase
	_profile = profile_for_skill(skill_id)
	_style = str(_profile.get("style", "basic"))
	_elapsed = 0.0
	_duration = _phase_duration(phase, float(_profile.get("duration", 0.55)))

	if phase == PHASE_IMPACT:
		global_position = to_global_position
	else:
		global_position = from_global
	_local_target = to_local(to_global_position)

	_spawn_phase_layers()
	_playing = true
	set_process(true)
	queue_redraw()


func _phase_duration(phase: String, base_duration: float) -> float:
	match phase:
		PHASE_TRAVEL:
			return clampf(base_duration * 0.86, 0.34, 0.82)
		PHASE_IMPACT:
			return clampf(base_duration * 0.82, 0.40, 0.98)
		PHASE_SELF:
			return clampf(base_duration, 0.55, 1.05)
		_:
			return clampf(base_duration * 0.82, 0.38, 0.92)


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


func _spawn_phase_layers() -> void:
	match _phase:
		PHASE_CAST:
			_spawn_cast_layers()
		PHASE_IMPACT:
			_spawn_impact_layers()
		PHASE_SELF:
			_spawn_self_layers()
		_:
			pass


func _spawn_cast_layers() -> void:
	match _style:
		"deploy":
			_spawn_layer(SUMMON_SCENE, Vector2.ZERO, 1.30, Color(0.70, 1.0, 0.92, 0.95))
			_spawn_layer(PORTAL_SCENE, Vector2.ZERO, 0.72, Color(0.62, 0.95, 1.0, 0.72))
		"guard":
			_spawn_layer(SUMMON_SCENE, Vector2.ZERO, 1.05, Color(0.78, 1.0, 1.0, 0.90))
			_spawn_layer(COMBO_SCENE, Vector2.ZERO, 0.76, Color(0.72, 1.0, 1.0, 0.80))
		"strike":
			_spawn_layer(ENERGY_SCENE, Vector2.ZERO, 0.75, Color(0.80, 1.0, 1.0, 0.86))
		"sync":
			_spawn_layer(SUMMON_SCENE, Vector2.ZERO, 1.20, Color(0.82, 1.0, 0.82, 0.86))
			_spawn_layer(COMBO_SCENE, Vector2.ZERO, 0.92, Color(0.72, 1.0, 1.0, 0.76))
		"recall":
			_spawn_layer(PORTAL_SCENE, Vector2.ZERO, 0.82, Color(0.72, 0.95, 1.0, 0.78))
		"split":
			_spawn_layer(ENERGY_SCENE, Vector2.ZERO, 0.84, Color(0.82, 1.0, 1.0, 0.80))
			_spawn_layer(COMBO_SCENE, Vector2.ZERO, 0.78, Color(0.90, 1.0, 0.78, 0.70))
		"merge":
			_spawn_layer(PORTAL_SCENE, Vector2.ZERO, 1.05, Color(0.70, 0.94, 1.0, 0.88))
			_spawn_layer(SUMMON_SCENE, Vector2.ZERO, 1.30, Color(0.95, 0.92, 0.72, 0.82))
		"suppress":
			_spawn_layer(SUMMON_SCENE, Vector2.ZERO, 1.55, Color(0.88, 0.92, 1.0, 0.90))
			_spawn_layer(COMBO_SCENE, Vector2.ZERO, 1.15, Color(0.80, 1.0, 1.0, 0.74))
		"ultimate":
			_spawn_layer(SUMMON_SCENE, Vector2.ZERO, 1.90, Color(0.98, 0.90, 0.72, 0.90))
			_spawn_layer(PORTAL_SCENE, Vector2.ZERO, 1.25, Color(0.66, 0.92, 1.0, 0.78))
			_spawn_layer(COMBO_SCENE, Vector2.ZERO, 1.45, Color(0.75, 1.0, 1.0, 0.80))
		_:
			_spawn_layer(COMBO_SCENE, Vector2.ZERO, 0.58, Color(0.78, 1.0, 1.0, 0.72))


func _spawn_self_layers() -> void:
	match _style:
		"guard":
			_spawn_layer(SUMMON_SCENE, Vector2.ZERO, 1.15, Color(0.68, 1.0, 1.0, 0.92))
			_spawn_layer(COMBO_SCENE, Vector2.ZERO, 0.96, Color(0.86, 1.0, 1.0, 0.80))
		"recall":
			_spawn_layer(PORTAL_SCENE, Vector2.ZERO, 0.92, Color(0.72, 0.94, 1.0, 0.82))
		"merge":
			_spawn_layer(PORTAL_SCENE, Vector2.ZERO, 1.15, Color(0.74, 0.95, 1.0, 0.86))
			_spawn_layer(SUMMON_SCENE, Vector2.ZERO, 1.18, Color(1.0, 0.90, 0.68, 0.78))
		"deploy", "split":
			_spawn_layer(SUMMON_SCENE, Vector2.ZERO, 1.12, Color(0.82, 1.0, 0.86, 0.84))
			_spawn_layer(ENERGY_SCENE, Vector2.ZERO, 0.74, Color(0.75, 1.0, 1.0, 0.78))
		_:
			_spawn_layer(ENERGY_SCENE, Vector2.ZERO, 0.66, Color(0.76, 1.0, 1.0, 0.70))


func _spawn_impact_layers() -> void:
	_spawn_layer(ENERGY_SCENE, Vector2.ZERO, 0.90 if _style == "basic" else 1.15, Color(0.82, 1.0, 1.0, 0.96))
	if _style in ["strike", "sync", "merge", "suppress", "ultimate"]:
		_spawn_layer(COMBO_SCENE, Vector2.ZERO, 1.10 if _style != "ultimate" else 1.75, Color(0.90, 0.98, 1.0, 0.92))
	if _style in ["strike", "suppress", "ultimate"]:
		_spawn_layer(SHIELD_BREAK_SCENE, Vector2.ZERO, 0.95 if _style == "strike" else 1.35, Color(0.72, 1.0, 1.0, 0.90))
	if _style in ["sync", "suppress", "ultimate"]:
		_spawn_layer(LIGHTNING_SCENE, Vector2.ZERO, 0.90 if _style == "sync" else 1.22, Color(0.78, 0.94, 1.0, 0.82))
	if _style == "suppress":
		_spawn_layer(SUMMON_SCENE, Vector2.ZERO, 1.35, Color(0.90, 0.92, 1.0, 0.84))
	if _style == "ultimate":
		_spawn_layer(SUMMON_SCENE, Vector2.ZERO, 1.82, Color(1.0, 0.88, 0.66, 0.90))
		_spawn_layer(PORTAL_SCENE, Vector2.ZERO, 1.48, Color(0.68, 0.88, 1.0, 0.78))


func _spawn_layer(scene: PackedScene, local_pos: Vector2, scale_factor: float, tint: Color) -> void:
	var layer := scene.instantiate()
	add_child(layer)
	if layer is Node2D:
		var node2d := layer as Node2D
		node2d.position = local_pos
		node2d.scale = Vector2.ONE * scale_factor
	if layer is CanvasItem:
		(layer as CanvasItem).modulate = tint
	_restart_particles_recursive(layer)


func _restart_particles_recursive(node: Node) -> void:
	if node is CPUParticles2D:
		var particles := node as CPUParticles2D
		particles.emitting = true
		particles.restart()
	for child in node.get_children():
		_restart_particles_recursive(child)


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
			_draw_self(t)
		_:
			_draw_cast(t)


func _draw_cast(t: float) -> void:
	var alpha := (1.0 - _smoothstep(0.72, 1.0, t)) * _smoothstep(0.0, 0.12, t)
	var spin := _elapsed * 2.4
	match _style:
		"deploy":
			_draw_magic_seal(Vector2.ZERO, 54.0, spin, alpha, 12)
			_draw_orbiting_artifacts(42.0, spin, alpha, 0.86)
		"guard":
			_draw_barrier(Vector2.ZERO, 54.0, spin, alpha)
		"strike":
			_draw_magic_seal(Vector2.ZERO, 34.0, -spin, alpha, 8)
			_draw_artifact(1, Vector2(10, -5), -0.34, 1.20 + 0.16 * sin(t * PI), alpha)
		"sync":
			_draw_magic_seal(Vector2.ZERO, 50.0, spin, alpha, 16)
			_draw_orbiting_artifacts(48.0, -spin * 0.8, alpha, 1.0)
		"recall":
			var radius := lerpf(68.0, 22.0, _smoothstep(0.0, 0.86, t))
			_draw_orbiting_artifacts(radius, -spin * 1.3, alpha, 0.92)
			_draw_magic_seal(Vector2.ZERO, 38.0, spin, alpha * 0.75, 10)
		"split":
			var spread := lerpf(4.0, 46.0, _smoothstep(0.10, 0.78, t))
			_draw_artifact(1, Vector2(-spread, 0), -0.24, 0.82, alpha)
			_draw_artifact(0, Vector2.ZERO, 0.0, 0.86, alpha)
			_draw_artifact(2, Vector2(spread, 0), 0.24, 0.90, alpha)
			_draw_magic_seal(Vector2.ZERO, 42.0, spin, alpha * 0.80, 12)
		"merge":
			var radius := lerpf(58.0, 8.0, _smoothstep(0.0, 0.72, t))
			_draw_orbiting_artifacts(radius, spin * 1.2, alpha, 0.96)
			_draw_artifact(1, Vector2.ZERO, -PI * 0.5, lerpf(0.45, 1.48, t), alpha)
			_draw_magic_seal(Vector2.ZERO, 48.0, -spin, alpha, 14)
		"suppress":
			_draw_magic_seal(Vector2(0, -12), 68.0, -spin * 0.55, alpha, 18)
			_draw_magic_seal(Vector2(0, -12), 48.0, spin, alpha * 0.78, 12)
			_draw_artifact(0, Vector2.ZERO, spin * 0.6, 1.35, alpha)
		"ultimate":
			_draw_magic_seal(Vector2.ZERO, 82.0, spin * 0.55, alpha, 20)
			_draw_magic_seal(Vector2.ZERO, 60.0, -spin * 0.9, alpha * 0.85, 16)
			_draw_orbiting_artifacts(70.0, spin * 1.25, alpha, 1.18)
		_:
			_draw_magic_seal(Vector2.ZERO, 30.0, spin, alpha, 8)
			_draw_artifact(1, Vector2.ZERO, -PI * 0.35, 0.80, alpha)


func _draw_self(t: float) -> void:
	var alpha := (1.0 - _smoothstep(0.76, 1.0, t)) * _smoothstep(0.0, 0.10, t)
	var spin := _elapsed * 2.6
	match _style:
		"guard":
			_draw_barrier(Vector2.ZERO, 62.0, spin, alpha)
			_draw_magic_seal(Vector2.ZERO, 48.0, -spin * 0.6, alpha * 0.82, 12)
		"recall":
			var radius := lerpf(86.0, 18.0, _smoothstep(0.0, 0.80, t))
			_draw_orbiting_artifacts(radius, -spin, alpha, 1.0)
			_draw_magic_seal(Vector2.ZERO, 42.0, spin, alpha, 12)
		"split":
			var radius := lerpf(8.0, 66.0, _smoothstep(0.0, 0.72, t))
			_draw_orbiting_artifacts(radius, spin, alpha, 0.96)
			_draw_magic_seal(Vector2.ZERO, 46.0, -spin, alpha * 0.75, 12)
		"merge":
			var radius := lerpf(76.0, 10.0, _smoothstep(0.0, 0.70, t))
			_draw_orbiting_artifacts(radius, spin * 1.4, alpha, 1.06)
			_draw_artifact(0, Vector2.ZERO, spin, lerpf(0.35, 1.55, t), alpha)
			_draw_magic_seal(Vector2.ZERO, 54.0, -spin, alpha, 16)
		"deploy":
			_draw_magic_seal(Vector2.ZERO, 58.0, spin, alpha, 14)
			_draw_orbiting_artifacts(52.0, spin * 0.75, alpha, 1.0)
		_:
			_draw_magic_seal(Vector2.ZERO, 42.0, spin, alpha, 10)


func _draw_travel(t: float) -> void:
	if _local_target.length_squared() <= 1.0:
		return
	var travel := _smoothstep(0.02, 0.86, t)
	var fade := 1.0 - _smoothstep(0.82, 1.0, t)
	var direction := _local_target.normalized()
	var angle := direction.angle()
	match _style:
		"sync":
			for index in range(3):
				var lane := float(index - 1) * 24.0
				var tt := clampf(travel - float(index) * 0.06, 0.0, 1.0)
				var p := _path_point(tt, lane, 26.0)
				_draw_afterimages(index, tt, lane, 26.0, angle, fade, 0.92)
				_draw_artifact(index, p, angle, 1.08, fade)
		"split":
			for index in range(3):
				var lane := float(index - 1) * 28.0
				var p := _path_point(travel, lane, 34.0)
				_draw_afterimages(index, travel, lane, 34.0, angle, fade, 0.82)
				_draw_artifact(index, p, angle, 0.94, fade)
		"suppress":
			var center := _path_point(travel, 0.0, 18.0)
			_draw_magic_seal(center, lerpf(28.0, 72.0, travel), -_elapsed * 2.0, fade, 18)
			_draw_artifact(0, center, _elapsed * 2.5, 1.38, fade)
		"ultimate":
			for index in range(6):
				var lane := (float(index) - 2.5) * 18.0
				var tt := clampf(travel - float(index) * 0.035, 0.0, 1.0)
				var p := _path_point(tt, lane, 42.0 + float(index % 2) * 12.0)
				_draw_afterimages(index % 3, tt, lane, 46.0, angle, fade, 0.72)
				_draw_artifact(index % 3, p, angle + float(index % 2) * 0.18, 0.88 + float(index % 3) * 0.10, fade)
		"strike":
			var p := _path_point(travel, 0.0, 16.0)
			_draw_afterimages(1, travel, 0.0, 16.0, angle, fade, 1.45)
			_draw_artifact(1, p, angle, 1.72, fade)
			_draw_magic_seal(p, 30.0, -_elapsed * 4.0, fade * 0.70, 8)
		"recall":
			var reverse := 1.0 - travel
			for index in range(3):
				var lane := float(index - 1) * 18.0
				var p := _path_point(reverse, lane, 28.0)
				_draw_artifact(index, p, angle + PI, 0.90, fade)
		_:
			var kind := 1 if _style == "basic" else 0
			var p := _path_point(travel, 0.0, 22.0)
			_draw_afterimages(kind, travel, 0.0, 22.0, angle, fade, 0.92)
			_draw_artifact(kind, p, angle, 1.05, fade)


func _draw_afterimages(
		kind: int,
		travel: float,
		lane: float,
		curve: float,
		angle: float,
		alpha: float,
		size_mult: float
	) -> void:
	for ghost in range(1, 4):
		var tt := maxf(0.0, travel - float(ghost) * 0.055)
		var ghost_alpha := alpha * (0.30 / float(ghost))
		_draw_artifact(kind, _path_point(tt, lane, curve), angle, size_mult * (1.0 - float(ghost) * 0.08), ghost_alpha)


func _draw_impact(t: float) -> void:
	var attack := _smoothstep(0.0, 0.14, t)
	var fade := 1.0 - _smoothstep(0.58, 1.0, t)
	var alpha := attack * fade
	match _style:
		"strike":
			_draw_artifact(1, Vector2.ZERO, -PI * 0.5, 1.95, alpha)
			_draw_magic_seal(Vector2.ZERO, lerpf(24.0, 62.0, t), -_elapsed * 2.8, alpha, 12)
			_draw_shockwave(64.0, t, alpha, 1.25)
		"sync":
			for index in range(3):
				var angle := TAU * float(index) / 3.0 + _elapsed * 0.7
				var p := Vector2.from_angle(angle) * lerpf(48.0, 8.0, _smoothstep(0.0, 0.55, t))
				_draw_artifact(index, p, angle + PI, 1.10, alpha)
			_draw_magic_seal(Vector2.ZERO, 58.0, _elapsed * 2.2, alpha, 15)
			_draw_shockwave(72.0, t, alpha, 1.15)
		"suppress":
			var drop_y := lerpf(-115.0, -4.0, _smoothstep(0.0, 0.52, t))
			_draw_magic_seal(Vector2(0, drop_y), 92.0, -_elapsed * 1.5, alpha, 20)
			_draw_magic_seal(Vector2(0, drop_y), 66.0, _elapsed * 2.1, alpha * 0.84, 14)
			_draw_seal_columns(drop_y, t, alpha)
			_draw_shockwave(104.0, t, alpha, 1.45)
		"ultimate":
			_draw_magic_seal(Vector2.ZERO, 112.0, _elapsed * 1.35, alpha, 24)
			_draw_magic_seal(Vector2.ZERO, 82.0, -_elapsed * 2.0, alpha * 0.88, 18)
			for index in range(9):
				var x := (float(index) - 4.0) * 20.0
				var fall := fposmod(t * 1.65 + float(index) * 0.13, 1.0)
				var y := lerpf(-126.0, 58.0, fall)
				_draw_artifact(index % 3, Vector2(x, y), PI * 0.5, 0.78 + float(index % 3) * 0.10, alpha * (1.0 - fall * 0.45))
			_draw_shockwave(126.0, t, alpha, 1.72)
			_draw_shockwave(92.0, clampf(t * 1.25 - 0.14, 0.0, 1.0), alpha * 0.80, 1.30)
		"merge":
			_draw_artifact(0, Vector2.ZERO, _elapsed * 3.0, 1.68, alpha)
			_draw_magic_seal(Vector2.ZERO, 70.0, -_elapsed * 1.8, alpha, 18)
			_draw_shockwave(84.0, t, alpha, 1.30)
		_:
			_draw_magic_seal(Vector2.ZERO, lerpf(18.0, 48.0, t), _elapsed * 2.8, alpha, 10)
			_draw_shockwave(56.0, t, alpha, 0.95)


func _draw_magic_seal(center: Vector2, radius: float, rotation_value: float, alpha: float, spokes: int) -> void:
	if alpha <= 0.001 or radius <= 1.0:
		return
	draw_arc(center, radius, 0.0, TAU, 72, Color(CYAN, 0.50 * alpha), 2.0, true)
	draw_arc(center, radius * 0.76, 0.0, TAU, 64, Color(GOLD, 0.54 * alpha), 1.35, true)
	draw_arc(center, radius * 0.48, 0.0, TAU, 56, Color(WHITE, 0.30 * alpha), 1.0, true)
	var safe_spokes := maxi(6, spokes)
	for index in range(safe_spokes):
		var angle := rotation_value + TAU * float(index) / float(safe_spokes)
		var direction := Vector2.from_angle(angle)
		var tangent := direction.orthogonal()
		var inner := center + direction * radius * 0.78
		var outer := center + direction * radius * 0.96
		draw_line(inner, outer, Color(CYAN if index % 2 == 0 else GOLD, 0.70 * alpha), 1.4, true)
		if index % 3 == 0:
			var rune_center := center + direction * radius * 0.62
			draw_line(rune_center - tangent * 3.2, rune_center + tangent * 3.2, Color(WHITE, 0.56 * alpha), 1.0, true)
	var diamond := PackedVector2Array([
		center + Vector2(0, -radius * 0.32).rotated(rotation_value),
		center + Vector2(radius * 0.22, 0).rotated(rotation_value),
		center + Vector2(0, radius * 0.32).rotated(rotation_value),
		center + Vector2(-radius * 0.22, 0).rotated(rotation_value),
		center + Vector2(0, -radius * 0.32).rotated(rotation_value),
	])
	draw_polyline(diamond, Color(GOLD, 0.48 * alpha), 1.35, true)


func _draw_barrier(center: Vector2, radius: float, rotation_value: float, alpha: float) -> void:
	_draw_magic_seal(center, radius, rotation_value * 0.45, alpha * 0.72, 12)
	var hex := PackedVector2Array()
	for index in range(7):
		var angle := rotation_value * 0.16 + TAU * float(index % 6) / 6.0
		hex.append(center + Vector2.from_angle(angle) * radius * 0.84)
	draw_polyline(hex, Color(CYAN, 0.78 * alpha), 3.0, true)
	var inner := PackedVector2Array()
	for index in range(7):
		var angle := -rotation_value * 0.18 + TAU * float(index % 6) / 6.0
		inner.append(center + Vector2.from_angle(angle) * radius * 0.58)
	draw_polyline(inner, Color(WHITE, 0.44 * alpha), 1.5, true)
	for index in range(6):
		var angle := TAU * float(index) / 6.0 + rotation_value * 0.12
		var p := center + Vector2.from_angle(angle) * radius * 0.72
		draw_circle(p, 3.4, Color(GOLD, 0.58 * alpha))


func _draw_orbiting_artifacts(radius: float, rotation_value: float, alpha: float, size_mult: float) -> void:
	for index in range(3):
		var angle := rotation_value + TAU * float(index) / 3.0
		var p := Vector2(cos(angle) * radius, sin(angle) * radius * 0.48)
		_draw_artifact(index, p, angle + PI * 0.5, size_mult, alpha)


func _draw_artifact(kind: int, center: Vector2, rotation_value: float, size_mult: float, alpha: float) -> void:
	if alpha <= 0.001:
		return
	var s := maxf(0.20, size_mult)
	match posmod(kind, 3):
		0:
			var r := 13.0 * s
			draw_arc(center, r, 0.0, TAU, 32, Color(CYAN, 0.92 * alpha), maxf(1.1, 2.2 * s), true)
			draw_arc(center, r * 0.62, 0.0, TAU, 24, Color(GOLD, 0.86 * alpha), maxf(1.0, 1.35 * s), true)
			for index in range(4):
				var angle := rotation_value + PI * 0.5 * float(index)
				var direction := Vector2.from_angle(angle)
				draw_line(center + direction * r * 0.72, center + direction * r * 1.24, Color(WHITE, 0.82 * alpha), maxf(1.0, 1.25 * s), true)
			draw_circle(center, 2.6 * s, Color(WHITE, 0.90 * alpha))
		1:
			var forward := Vector2.from_angle(rotation_value)
			var side := forward.orthogonal()
			var tip := center + forward * 24.0 * s
			var tail := center - forward * 19.0 * s
			var poly := PackedVector2Array([
				tip,
				center + side * 5.2 * s,
				tail,
				center - side * 5.2 * s,
			])
			draw_colored_polygon(poly, Color(CYAN_DEEP, 0.50 * alpha))
			var outline := PackedVector2Array([tip, center + side * 5.2 * s, tail, center - side * 5.2 * s, tip])
			draw_polyline(outline, Color(WHITE, 0.92 * alpha), maxf(1.2, 1.7 * s), true)
			draw_line(center - forward * 4.0 * s, tail - forward * 6.0 * s, Color(GOLD, 0.84 * alpha), maxf(1.0, 1.8 * s), true)
		2:
			var r := 16.0 * s
			draw_arc(center, r, rotation_value - 1.85, rotation_value + 1.85, 28, Color(CYAN, 0.94 * alpha), maxf(1.4, 3.4 * s), true)
			draw_arc(center + Vector2.from_angle(rotation_value) * 4.0 * s, r * 0.74, rotation_value - 1.68, rotation_value + 1.68, 24, Color(GOLD, 0.72 * alpha), maxf(1.0, 1.6 * s), true)
			var gem := center - Vector2.from_angle(rotation_value) * 7.0 * s
			draw_circle(gem, 2.7 * s, Color(WHITE, 0.88 * alpha))


func _draw_shockwave(max_radius: float, t: float, alpha: float, width_scale: float) -> void:
	var wave := _smoothstep(0.0, 0.72, t)
	var radius := lerpf(8.0, max_radius, wave)
	var fade := (1.0 - _smoothstep(0.48, 1.0, t)) * alpha
	draw_arc(Vector2.ZERO, radius, 0.0, TAU, 64, Color(CYAN, 0.82 * fade), 2.4 * width_scale, true)
	draw_arc(Vector2.ZERO, radius * 0.72, 0.0, TAU, 56, Color(GOLD, 0.42 * fade), 1.2 * width_scale, true)


func _draw_seal_columns(drop_y: float, t: float, alpha: float) -> void:
	var column_alpha := (1.0 - _smoothstep(0.68, 1.0, t)) * alpha
	for index in range(7):
		var x := (float(index) - 3.0) * 20.0
		var top := Vector2(x, drop_y - 42.0 - float(index % 2) * 12.0)
		var bottom := Vector2(x * 0.35, lerpf(drop_y + 18.0, 52.0, t))
		draw_line(top, bottom, Color(CYAN if index % 2 == 0 else VIOLET, 0.46 * column_alpha), 2.2, true)
		draw_circle(bottom, 3.0, Color(WHITE, 0.72 * column_alpha))


func _path_point(t: float, lane: float, curvature: float) -> Vector2:
	var clamped := clampf(t, 0.0, 1.0)
	var normal := _local_target.normalized().orthogonal()
	var bow := sin(clamped * PI) * curvature
	return _local_target * clamped + normal * (bow + lane * sin(clamped * PI))


static func _smoothstep(edge0: float, edge1: float, value: float) -> float:
	if is_equal_approx(edge0, edge1):
		return 1.0 if value >= edge1 else 0.0
	var x := clampf((value - edge0) / (edge1 - edge0), 0.0, 1.0)
	return x * x * (3.0 - 2.0 * x)
