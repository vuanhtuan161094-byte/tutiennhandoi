extends Control
## Static, replaceable battlefield shell. No combat state or animation.

var _sky: GradientTexture2D

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	var gradient := Gradient.new()
	gradient.colors = PackedColorArray([Color("102b35"), Color("193e43"), Color("0b202b"), Color("07131d")])
	gradient.offsets = PackedFloat32Array([0.0, 0.36, 0.72, 1.0])
	_sky = GradientTexture2D.new()
	_sky.gradient = gradient
	_sky.fill_from = Vector2(0.5, 0.0)
	_sky.fill_to = Vector2(0.5, 1.0)
	resized.connect(queue_redraw)

func _polygon(points: Array, color: Color) -> void:
	var scaled := PackedVector2Array()
	for point in points:
		scaled.append(Vector2(point.x * size.x, point.y * size.y))
	draw_colored_polygon(scaled, color)

func _ellipse(center: Vector2, radius: Vector2, color: Color, outline: bool = false) -> void:
	var points := PackedVector2Array()
	for i in range(65):
		var angle := TAU * i / 64.0
		points.append(center + Vector2(cos(angle), sin(angle)) * radius)
	if outline:
		draw_polyline(points, color, 1.0, true)
	else:
		draw_colored_polygon(points, color)

func _draw() -> void:
	if _sky == null:
		return
	draw_texture_rect(_sky, Rect2(Vector2.ZERO, size), false)
	# Distant stone ridges and an abandoned gate, deliberately abstract.
	_polygon([Vector2(0, .30), Vector2(.12, .19), Vector2(.23, .25), Vector2(.37, .09), Vector2(.49, .23), Vector2(.64, .13), Vector2(.81, .24), Vector2(1, .15), Vector2(1, .55), Vector2(0, .55)], Color("17323c"))
	_polygon([Vector2(0, .39), Vector2(.18, .29), Vector2(.30, .37), Vector2(.48, .25), Vector2(.66, .37), Vector2(.85, .27), Vector2(1, .34), Vector2(1, .64), Vector2(0, .64)], Color("102932"))
	for x in [.12, .36]:
		draw_rect(Rect2(size * Vector2(x, .27), size * Vector2(.025, .17)), Color("203f43"))
	_polygon([Vector2(.08, .275), Vector2(.11, .255), Vector2(.39, .255), Vector2(.43, .275)], Color("29494b"))
	# Broad translucent fog, static and cheap.
	for i in range(7):
		_ellipse(size * Vector2(.44, .40 + i * .012), size * Vector2(.72, .08), Color(.28, .48, .48, .018))
	_polygon([Vector2(0, .62), Vector2(.52, .53), Vector2(1, .61), Vector2(1, 1), Vector2(0, 1)], Color("0c2029"))
	var center := size * Vector2(.52, .76)
	for radius in [.29, .35, .43]:
		_ellipse(center, size * Vector2(radius, radius * .22), Color(.42, .55, .51, .13), true)
	for i in range(12):
		var angle := TAU * i / 12.0
		var inner := center + size * Vector2(cos(angle) * .29, sin(angle) * .064)
		var outer := center + size * Vector2(cos(angle) * .43, sin(angle) * .095)
		draw_line(inner, outer, Color(.55, .47, .32, .15), 1.0, true)
	# Soft edge vignette without shader or imported assets.
	for i in range(16):
		var inset := float(i) * 2.0
		draw_rect(Rect2(Vector2(inset, inset), size - Vector2.ONE * inset * 2), Color(0.01, .025, .04, .035), false, 2.0)
