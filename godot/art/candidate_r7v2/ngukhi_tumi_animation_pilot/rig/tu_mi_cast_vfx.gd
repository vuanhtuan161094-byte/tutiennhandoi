extends Node2D

var _energy := 0.0
var energy: float:
	set(value):
		_energy = clampf(value, 0.0, 1.0)
		queue_redraw()
	get:
		return _energy

func _draw() -> void:
	if _energy <= 0.01:
		return
	var pulse := 0.88 + 0.12 * sin(rotation * 3.0)
	var radius := 76.0 * pulse
	var main_color := Color(0.84, 0.58, 1.0, 0.78 * _energy)
	var accent := Color(0.42, 0.88, 1.0, 0.62 * _energy)
	draw_arc(Vector2.ZERO, radius, 0.0, TAU, 48, main_color, 3.0, true)
	draw_arc(Vector2.ZERO, radius * 0.72, 0.28, TAU * 0.82, 36, accent, 2.0, true)
	draw_arc(Vector2.ZERO, radius * 1.10, 0.68, TAU * 0.77, 36, main_color, 1.5, true)
	for index in range(8):
		var angle := TAU * float(index) / 8.0 + rotation
		var inner := Vector2(cos(angle), sin(angle)) * radius * 0.82
		var outer := Vector2(cos(angle), sin(angle)) * (radius + 17.0)
		draw_line(inner, outer, accent, 2.2, true)
	draw_circle(Vector2.ZERO, 5.0 + 5.0 * _energy, Color(0.9, 0.72, 1.0, 0.42 * _energy))