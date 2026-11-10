# Candidate-only deterministic 2D Ngự Khí casting VFX.
# Calls are presentation-only; no hit, damage or target authority.
extends Node2D

signal cycle_finished

const CYCLE_SECONDS := 1.5
const JADE := Color(0.34, 0.94, 0.94)
const VIOLET := Color(0.73, 0.39, 1.0)
const GOLD := Color(1.0, 0.81, 0.47)

@export var autoplay: bool = true
@export var loop_preview: bool = true
var origin: Vector2 = Vector2(145.0, 342.0)
var target: Vector2 = Vector2(316.0, 365.0)
var _progress: float = 0.0
var _running: bool = false

func _ready() -> void:
	_running = autoplay
	queue_redraw()

func set_anchors(from_position: Vector2, to_position: Vector2) -> void:
	origin = from_position
	target = to_position
	queue_redraw()

func replay() -> void:
	_progress = 0.0
	_running = true
	queue_redraw()

func seek_normalized(value: float) -> void:
	_progress = clampf(value, 0.0, 1.0)
	_running = false
	queue_redraw()

func _process(delta: float) -> void:
	if not _running:
		return
	_progress += delta / CYCLE_SECONDS
	if _progress >= 1.0:
		cycle_finished.emit()
		if loop_preview:
			_progress = fposmod(_progress, 1.0)
		else:
			_progress = 1.0
			_running = false
	queue_redraw()

func _draw() -> void:
	_draw_seal()
	_draw_orbit()
	_draw_swords()
	_draw_impact()

func _draw_seal() -> void:
	var entrance := clampf(_progress / 0.28, 0.0, 1.0)
	var departure := 1.0 - clampf((_progress - 0.61) / 0.22, 0.0, 1.0)
	var a := entrance * departure
	if a <= 0.0:
		return
	var pulse := 1.0 + 0.06 * sin(_progress * TAU * 3.0)
	for ring in range(3):
		var radius := (27.0 + float(ring) * 10.0) * pulse
		var tint := VIOLET if ring == 1 else JADE
		var c := Color(tint.r, tint.g, tint.b, a * (0.23 if ring == 2 else 0.66))
		draw_arc(origin, radius, _progress * 2.0 + float(ring), _progress * 2.0 + float(ring) + TAU * 0.92, 48, c, 1.8 if ring > 0 else 3.0, true)
	for i in range(10):
		var angle := float(i) * TAU / 10.0 + _progress * 2.8
		var a1 := origin + Vector2.from_angle(angle) * 37.0 * pulse
		var a2 := origin + Vector2.from_angle(angle) * 44.0 * pulse
		draw_line(a1, a2, Color(GOLD.r, GOLD.g, GOLD.b, a * 0.7), 1.5, true)
	draw_circle(origin, 5.0 + 5.0 * a, Color(0.72, 1.0, 1.0, 0.45 * a))

func _draw_orbit() -> void:
	var opacity := clampf((_progress - 0.04) / 0.18, 0.0, 1.0) * (1.0 - clampf((_progress - 0.48) / 0.15, 0.0, 1.0))
	for i in range(3):
		var angle := float(i) * TAU / 3.0 + _progress * TAU * 1.7
		var position := origin + Vector2(cos(angle) * 34.0, sin(angle) * 17.0)
		draw_circle(position, 5.0, Color(JADE.r, JADE.g, JADE.b, opacity * 0.28))
		draw_circle(position, 2.0, Color(0.98, 0.95, 0.77, opacity))

func _draw_swords() -> void:
	for i in range(3):
		var launch := 0.34 + float(i) * 0.055
		var t := clampf((_progress - launch) / 0.38, 0.0, 1.0)
		if t <= 0.0 or t >= 1.0:
			continue
		var p0 := origin + Vector2(13.0, (float(i) - 1.0) * 15.0)
		var p2 := target + Vector2(0.0, (float(i) - 1.0) * 12.0)
		var p1 := (p0 + p2) * 0.5 + Vector2(12.0, -52.0 + float(i) * 28.0)
		var pos := _quad(p0, p1, p2, t)
		var next := _quad(p0, p1, p2, minf(1.0, t + 0.02))
		var axis := (next - pos).normalized()
		if axis.length_squared() < 0.01:
			axis = Vector2.RIGHT
		for trail in range(9, 0, -1):
			var ta := maxf(0.0, t - float(trail) * 0.026)
			var tb := maxf(0.0, t - float(trail - 1) * 0.026)
			var pa := _quad(p0, p1, p2, ta)
			var pb := _quad(p0, p1, p2, tb)
			var strength := (1.0 - float(trail) / 10.0) * minf(1.0, t * 8.0)
			draw_line(pa, pb, Color(VIOLET.r, VIOLET.g, VIOLET.b, strength * 0.38), 6.0, true)
			draw_line(pa, pb, Color(JADE.r, JADE.g, JADE.b, strength * 0.72), 2.4, true)
		_draw_sword(pos, axis)

func _draw_sword(center: Vector2, axis: Vector2) -> void:
	var sideways := Vector2(-axis.y, axis.x)
	var blade := PackedVector2Array([
		center + axis * 20.0,
		center + sideways * 4.5,
		center - axis * 12.0,
		center - sideways * 4.5,
	])
	draw_colored_polygon(blade, Color(0.73, 1.0, 1.0, 0.95))
	draw_line(center - axis * 11.0, center + axis * 18.0, Color(1.0, 1.0, 1.0, 0.93), 1.3, true)
	draw_line(center - axis * 12.0 - sideways * 7.0, center - axis * 12.0 + sideways * 7.0, GOLD, 2.4, true)
	draw_circle(center - axis * 14.0, 2.4, GOLD)

func _draw_impact() -> void:
	var impact := clampf((_progress - 0.68) / 0.24, 0.0, 1.0)
	if impact <= 0.0 or impact >= 1.0:
		return
	var fade := pow(1.0 - impact, 1.25)
	for ring in range(3):
		var radius := 7.0 + impact * (48.0 + float(ring) * 14.0)
		draw_arc(target, radius, 0, TAU, 56, Color(JADE.r, JADE.g, JADE.b, 0.74 * fade / (float(ring) + 1.0)), 3.5 - float(ring), true)
	for shard in range(12):
		var angle := float(shard) * TAU / 12.0 + 0.11
		var start := target + Vector2.from_angle(angle) * (13.0 + impact * 19.0)
		var end := target + Vector2.from_angle(angle) * (22.0 + impact * 69.0)
		var tint := GOLD if shard % 3 == 0 else VIOLET
		draw_line(start, end, Color(tint.r, tint.g, tint.b, fade * 0.83), 2.0, true)
	draw_circle(target, (12.0 + 18.0 * impact) * fade, Color(0.92, 1.0, 1.0, 0.45 * fade))

func _quad(p0: Vector2, p1: Vector2, p2: Vector2, t: float) -> Vector2:
	var u := 1.0 - t
	return u * u * p0 + 2.0 * u * t * p1 + t * t * p2
