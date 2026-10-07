extends Node2D
class_name ArtifactActor
## Replaceable native silhouette. Motion clocks are presentation only.
var kind := 0
var pose := "idle"
var _clock := 0.0
var _start := Vector2.ZERO
var _destination := Vector2.ZERO
var _elapsed := 0.0
var _duration := 0.0
var _arc := 0.0
var _trail: Array[Vector2] = []

func move_to(point: Vector2, duration: float = 0.35, arc: float = 0.0, next_pose: String = "idle") -> void:
	_start = position
	_destination = point
	_elapsed = 0.0
	_duration = maxf(0.01, duration)
	_arc = arc
	pose = next_pose
	_trail.clear()

func advance(delta: float) -> void:
	_clock += maxf(0.0, delta)
	if _elapsed < _duration:
		_elapsed = minf(_duration, _elapsed + maxf(0.0, delta))
		var t := _elapsed / _duration
		var eased := t * t * (3.0 - 2.0 * t)
		position = _start.lerp(_destination, eased) + Vector2(0, -sin(t * PI) * _arc)
		if pose in ["launch", "return", "recall"]:
			_trail.append(position)
			if _trail.size() > 9:
				_trail.pop_front()
			rotation = (_destination - _start).angle() + PI / 2.0
	else:
		_trail.clear()
	if pose == "recall":
		modulate.a = 1.0 - 0.8*clampf(_elapsed/maxf(0.01,_duration),0,1)
	queue_redraw()

func _process(delta: float) -> void:
	advance(delta)

func _draw() -> void:
	if _trail.size() > 1:
		var points := PackedVector2Array()
		for point in _trail:
			points.append((point - position).rotated(-rotation))
		draw_polyline(points, Color(0.3, 0.85, 0.9, 0.32), 5.0, true)
	var hover := sin(_clock * (1.4 if kind == 3 else 2.1) + kind) * 2.0
	draw_set_transform(Vector2(0, hover))
	var cyan := Color("82dcd5")
	var gold := Color("dcb979")
	var core := Color("eff9e5")
	if kind == 0:
		# A solid blade with guard, bevel and pommel, not a light streak.
		draw_colored_polygon(PackedVector2Array([Vector2(0,-27),Vector2(7,-10),Vector2(5,13),Vector2(-5,13),Vector2(-7,-10)]), cyan)
		draw_colored_polygon(PackedVector2Array([Vector2(0,-27),Vector2(2,12),Vector2(-3,12)]), core)
		draw_rect(Rect2(-12,12,24,5), gold)
		draw_rect(Rect2(-3,17,6,10), Color("466866"))
		draw_circle(Vector2(0,28), 4, gold)
	elif kind == 1:
		# Octagonal mirror with a dark reflecting face and substantial rim.
		var rim := PackedVector2Array()
		var inner := PackedVector2Array()
		for i in range(8):
			var direction := Vector2.from_angle(TAU * i / 8.0 + PI / 8.0)
			rim.append(direction * 22)
			inner.append(direction * 16)
		draw_colored_polygon(rim, gold)
		draw_colored_polygon(inner, Color("254f61"))
		draw_arc(Vector2.ZERO, 12, -2.3, 0.5, 20, cyan, 3.5, true)
		draw_colored_polygon(PackedVector2Array([Vector2(0,-8),Vector2(5,0),Vector2(0,8),Vector2(-5,0)]), core)
	elif kind == 2:
		# Solid talisman seal, tassel and engraved core.
		draw_colored_polygon(PackedVector2Array([Vector2(0,-24),Vector2(18,-7),Vector2(13,14),Vector2(-13,14),Vector2(-18,-7)]), gold)
		draw_colored_polygon(PackedVector2Array([Vector2(0,-17),Vector2(11,-5),Vector2(8,8),Vector2(-8,8),Vector2(-11,-5)]), Color("295c60"))
		draw_rect(Rect2(-3,-8,6,18), core)
		for x in [-8,0,8]:
			draw_line(Vector2(x,15),Vector2(x,28),cyan,3.0,true)
	else:
		# Đại Khí Linh has its own crowned/winged silhouette, not a scaled blade.
		draw_colored_polygon(PackedVector2Array([Vector2(0,-43),Vector2(12,-19),Vector2(8,19),Vector2(0,35),Vector2(-8,19),Vector2(-12,-19)]), gold)
		for side in [-1,1]:
			draw_colored_polygon(PackedVector2Array([Vector2(side*9,-12),Vector2(side*34,-26),Vector2(side*27,8),Vector2(side*12,18)]), cyan)
		draw_colored_polygon(PackedVector2Array([Vector2(0,-32),Vector2(4,-10),Vector2(0,22),Vector2(-4,-10)]), core)
		draw_arc(Vector2.ZERO, 39 + sin(_clock)*2, -PI*0.85, -PI*0.15, 28, Color(gold,0.45), 4, true)
	if pose == "guard":
		draw_arc(Vector2.ZERO, 33 + sin(_clock*6)*2, -2.7, 2.7, 36, Color(cyan,0.65), 5, true)
	draw_set_transform(Vector2.ZERO)
