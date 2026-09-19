extends Control

const HOME_BG := preload("res://art/approved/home_bg_blue_valley.webp")
const CULTIVATOR := preload("res://art/approved/home_cultivator_centered.png")
const SPARK := preload("res://art/icons/spark.svg")

var _time := 0.0
var _hero: TextureRect
var _aura_outer: Panel
var _aura_inner: Panel
var _sparks: Array = []

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_process(true)
	_build_world()

func _build_world() -> void:
	var bg := TextureRect.new()
	bg.texture = HOME_BG
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bg.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg)

	var wash := ColorRect.new()
	wash.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	wash.color = Color(0.015, 0.055, 0.075, 0.16)
	wash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(wash)

	var top_shade := ColorRect.new()
	_place(top_shade, Vector2(0, 0), Vector2(390, 145))
	top_shade.color = Color(0.0, 0.015, 0.025, 0.34)
	top_shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(top_shade)

	var bottom_shade := ColorRect.new()
	_place(bottom_shade, Vector2(0, 690), Vector2(390, 154))
	bottom_shade.color = Color(0.0, 0.018, 0.026, 0.56)
	bottom_shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bottom_shade)

	var glow := Panel.new()
	_place(glow, Vector2(89, 170), Vector2(212, 250))
	glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	glow.add_theme_stylebox_override("panel", _flat(Color(0.48, 0.83, 0.93, 0.055), 106, Color(0.47, 0.83, 0.92, 0.10), 1))
	add_child(glow)

	_aura_outer = Panel.new()
	_place(_aura_outer, Vector2(54, 145), Vector2(282, 282))
	_aura_outer.pivot_offset = _aura_outer.size * 0.5
	_aura_outer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_aura_outer.add_theme_stylebox_override("panel", _flat(Color.TRANSPARENT, 141, Color(0.93, 0.77, 0.40, 0.32), 1))
	add_child(_aura_outer)

	_aura_inner = Panel.new()
	_place(_aura_inner, Vector2(77, 168), Vector2(236, 236))
	_aura_inner.pivot_offset = _aura_inner.size * 0.5
	_aura_inner.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_aura_inner.add_theme_stylebox_override("panel", _flat(Color(0.18, 0.62, 0.70, 0.025), 118, Color(0.48, 0.88, 0.94, 0.38), 1))
	add_child(_aura_inner)

	_hero = TextureRect.new()
	_hero.texture = CULTIVATOR
	_place(_hero, Vector2(82, 126), Vector2(226, 354))
	_hero.pivot_offset = _hero.size * Vector2(0.5, 1.0)
	_hero.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_hero.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_hero.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_hero.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_hero)

	var spark_positions := [
		Vector2(105, 240), Vector2(278, 225), Vector2(85, 330),
		Vector2(302, 348), Vector2(137, 414), Vector2(257, 430)
	]
	for i in range(spark_positions.size()):
		var spark := TextureRect.new()
		spark.texture = SPARK
		spark.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		spark.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		spark.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_place(spark, spark_positions[i], Vector2(13, 13))
		spark.modulate = Color(0.72, 0.93, 1.0, 0.45)
		add_child(spark)
		_sparks.append({
			"node": spark,
			"base": spark_positions[i],
			"phase": float(i) * 0.85,
			"speed": 0.7 + float(i % 3) * 0.12
		})

func _process(delta: float) -> void:
	_time += delta
	if is_instance_valid(_hero):
		_hero.position.y = 126.0 + sin(_time * 1.35) * 2.2
	if is_instance_valid(_aura_outer):
		var pulse := 1.0 + sin(_time * 0.72) * 0.018
		_aura_outer.scale = Vector2.ONE * pulse
		_aura_outer.modulate.a = 0.82 + sin(_time * 0.72) * 0.12
	if is_instance_valid(_aura_inner):
		var pulse_inner := 1.0 + sin(_time * 0.91 + 1.2) * 0.012
		_aura_inner.scale = Vector2.ONE * pulse_inner
	for data in _sparks:
		var node: TextureRect = data["node"]
		var base: Vector2 = data["base"]
		var phase := float(data["phase"])
		var speed := float(data["speed"])
		node.position = base + Vector2(sin(_time * speed + phase) * 3.0, -fmod(_time * (7.0 + speed * 3.0) + phase * 13.0, 28.0))
		node.modulate.a = 0.20 + 0.52 * (0.5 + 0.5 * sin(_time * 1.8 + phase))

func _flat(fill: Color, radius: int, border: Color = Color.TRANSPARENT, border_width: int = 0) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = fill
	style.corner_radius_top_left = radius
	style.corner_radius_top_right = radius
	style.corner_radius_bottom_left = radius
	style.corner_radius_bottom_right = radius
	style.border_color = border
	style.border_width_left = border_width
	style.border_width_top = border_width
	style.border_width_right = border_width
	style.border_width_bottom = border_width
	return style

func _place(control: Control, pos: Vector2, size_value: Vector2) -> void:
	control.position = pos
	control.size = size_value
