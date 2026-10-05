extends Control
## Native silhouette placeholder; replace this surface with a sprite later.
var enemy := false

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	resized.connect(queue_redraw)

func _shape(points: Array, fill: Color, edge: Color) -> void:
	var polygon := PackedVector2Array()
	for point in points:
		polygon.append(Vector2(point.x * size.x, point.y * size.y))
	draw_colored_polygon(polygon, fill)
	polygon.append(polygon[0])
	draw_polyline(polygon, edge, 1.2, true)

func _draw() -> void:
	var rim := Color("799b83") if enemy else Color("75c7cc")
	var shadow := PackedVector2Array()
	for i in range(49):
		var angle := TAU * i / 48.0
		shadow.append(size * Vector2(.5 + cos(angle) * .34, .91 + sin(angle) * .035))
	draw_colored_polygon(shadow, Color(0, .02, .03, .42))
	if enemy:
		# Abstract horned beast: a curved body, heavy neck and grounded claws.
		_shape([Vector2(.08,.79), Vector2(.15,.74), Vector2(.21,.61), Vector2(.29,.54), Vector2(.40,.52), Vector2(.50,.55), Vector2(.56,.49), Vector2(.60,.37), Vector2(.57,.29), Vector2(.55,.13), Vector2(.64,.23), Vector2(.77,.16), Vector2(.72,.29), Vector2(.83,.31), Vector2(.88,.37), Vector2(.84,.42), Vector2(.75,.44), Vector2(.71,.54), Vector2(.72,.65), Vector2(.81,.83), Vector2(.89,.87), Vector2(.74,.89), Vector2(.66,.81), Vector2(.60,.72), Vector2(.54,.79), Vector2(.55,.86), Vector2(.63,.89), Vector2(.46,.90), Vector2(.42,.81), Vector2(.35,.73), Vector2(.30,.80), Vector2(.29,.88), Vector2(.37,.91), Vector2(.20,.91), Vector2(.18,.85), Vector2(.20,.74), Vector2(.14,.80), Vector2(.07,.83)], Color("10252a"), Color(rim,.55))
		_shape([Vector2(.25,.62), Vector2(.33,.57), Vector2(.44,.56), Vector2(.55,.60), Vector2(.60,.53), Vector2(.64,.42), Vector2(.70,.44), Vector2(.66,.65), Vector2(.55,.73), Vector2(.40,.70), Vector2(.31,.72)], Color("193338"), Color(rim,.22))
		_shape([Vector2(.61,.30), Vector2(.65,.26), Vector2(.73,.30), Vector2(.79,.32), Vector2(.78,.37), Vector2(.70,.40), Vector2(.64,.37)], Color("24373a"), Color("936962"))
		draw_line(size * Vector2(.71,.33), size * Vector2(.76,.34), Color("b78c71"), 2.0, true)
		draw_line(size * Vector2(.78,.40), size * Vector2(.85,.39), Color(rim,.40), 1.0, true)
	else:
		# Hood, layered robe and a plain blade: silhouette only, no final art.
		_shape([Vector2(.22,.90), Vector2(.33,.59), Vector2(.29,.39), Vector2(.43,.29), Vector2(.43,.18), Vector2(.51,.10), Vector2(.61,.19), Vector2(.60,.30), Vector2(.73,.41), Vector2(.67,.62), Vector2(.81,.90), Vector2(.55,.86), Vector2(.43,.92)], Color("122832"), Color(rim,.65))
		_shape([Vector2(.44,.30), Vector2(.58,.30), Vector2(.64,.64), Vector2(.58,.87), Vector2(.42,.87), Vector2(.38,.63)], Color("1a3b43"), Color(rim,.25))
		_shape([Vector2(.46,.20), Vector2(.52,.15), Vector2(.58,.21), Vector2(.56,.28), Vector2(.49,.27)], Color("07161f"), Color(rim,.20))
		draw_line(size * Vector2(.66,.59), size * Vector2(.86,.16), Color("b2ccc7"), 1.5, true)
		draw_line(size * Vector2(.61,.57), size * Vector2(.72,.62), Color("bd9c65"), 2.0, true)
		draw_line(size * Vector2(.40,.52), size * Vector2(.61,.55), Color("bd9c65"), 1.5, true)
