extends Control
class_name CombatThreatTelegraph
## Event driven target marker for an authoritative Boss windup.
## Its lifetime and progress use the adjusted cast time carried by the combat event.

var _active := false
var _elapsed := 0.0
var _duration := 0.0
var _danger_level := "warning"

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_process(false)

func present(danger_level: String, cast_time: float) -> void:
	_danger_level = danger_level if danger_level in ["warning", "danger", "lethal"] else "warning"
	_duration = maxf(0.0, cast_time)
	_elapsed = 0.0
	_active = _duration > 0.0
	set_process(_active)
	queue_redraw()

func clear() -> void:
	_active = false
	_elapsed = 0.0
	_duration = 0.0
	set_process(false)
	queue_redraw()

func is_active() -> bool:
	return _active

func progress_ratio() -> float:
	if not _active or _duration <= 0.0:
		return 0.0
	return clampf(_elapsed / _duration, 0.0, 1.0)

func _process(delta: float) -> void:
	_elapsed = minf(_duration, _elapsed + maxf(0.0, delta))
	if _elapsed >= _duration:
		clear()
	else:
		queue_redraw()

func _draw() -> void:
	if not _active:
		return
	var color := _danger_color()
	var center := size * Vector2(0.5, 0.94)
	var radii := Vector2(minf(size.x * 0.31, 64.0), minf(size.y * 0.041, 12.0))
	var pulse := 0.82 + sin(_elapsed * 10.0) * 0.12
	var base := _ellipse_points(center, radii, 0.0, TAU, 64)
	draw_polyline(base, Color(color, 0.25), 2.0, true)
	var progress := progress_ratio()
	if progress > 0.0:
		var arc := _ellipse_points(center, radii * 0.82, -PI / 2.0, TAU * progress, maxi(2, int(ceil(64.0 * progress))))
		draw_polyline(arc, Color(color, pulse), 3.0, true)
	for angle in [0.0, PI / 2.0, PI, PI * 1.5]:
		var point := center + Vector2(cos(angle) * radii.x, sin(angle) * radii.y)
		var tangent := Vector2(-sin(angle) * 3.0, cos(angle) * 3.0)
		draw_line(point - tangent, point + tangent, Color(color, 0.78), 1.4, true)

func _ellipse_points(center: Vector2, radii: Vector2, start: float, sweep: float, segments: int) -> PackedVector2Array:
	var points := PackedVector2Array()
	for index in range(segments + 1):
		var angle := start + sweep * float(index) / float(segments)
		points.append(center + Vector2(cos(angle) * radii.x, sin(angle) * radii.y))
	return points

func _danger_color() -> Color:
	match _danger_level:
		"lethal":
			return Color("ff5b58")
		"danger":
			return Color("ffac5b")
		_:
			return Color("f0d279")
