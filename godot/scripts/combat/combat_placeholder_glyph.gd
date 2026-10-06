extends RefCounted
## One temporary engraved language; family/category distinctions, not final icon art.
static func draw_glyph(canvas: Control, rect: Rect2, config: Dictionary) -> void:
	var center := rect.get_center()
	var ink := Color(str(config.get("accent", "819b9f")), 0.80)
	var index := int(config.get("glyphIndex", 8))
	var points := PackedVector2Array()
	var sides := 4 + index % 3
	for i in range(sides + 1):
		var angle := -PI / 2 + TAU * i / sides
		points.append(center + Vector2(cos(angle), sin(angle)) * 13)
	canvas.draw_polyline(points, Color(ink, 0.28), 1.0, true)
	var reach := 6.0 + index % 3
	canvas.draw_line(center + Vector2(0,-9), center + Vector2(0,9), ink, 1.5, true)
	canvas.draw_line(center + Vector2(-reach,-4), center + Vector2(reach,-4), ink, 1.5, true)
	canvas.draw_line(center + Vector2(-reach,4), center + Vector2(reach,4), ink, 1.5, true)
	if index % 2 == 0:
		canvas.draw_line(center + Vector2(-reach,-4), center + Vector2(-reach,4), ink, 1.0, true)
	else:
		canvas.draw_line(center + Vector2(reach,-4), center + Vector2(reach,4), ink, 1.0, true)
	if index >= 4:
		canvas.draw_line(center + Vector2(-9,8), center + Vector2(9,-8), ink, 1.0, true)
	var category := str(config.get("category", "active"))
	if category == "ultimate":
		canvas.draw_arc(center, 17, 0, TAU, 32, Color(ink,0.4), 1.0, true)
	elif category == "basic":
		canvas.draw_line(center + Vector2(-5,12), center + Vector2(5,12), ink, 1.0, true)
