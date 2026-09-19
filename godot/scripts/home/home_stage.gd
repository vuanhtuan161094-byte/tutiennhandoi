extends Control

const HOME_BG := preload("res://art/approved/home_bg_blue_valley.webp")
const CULTIVATOR := preload("res://art/approved/home_cultivator_centered.png")
const SPARK := preload("res://art/icons/spark.svg")

const HERO_BASE_Y := 126.0

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
	wash.color = Color(0.015, 0.055, 0.075, 0.14)
	wash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(wash)

	var top_shade := ColorRect.new()
	_anchor_top_wide(top_shade, 0.0, 154.0)
	top_shade.color = Color(0.0, 0.015, 0.025, 0.32)
	top_shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(top_shade)

	var bottom_shade := ColorRect.new()
	_anchor_bottom_wide(bottom_shade, -188.0, 0.0)
	bottom_shade.color = Color(0.0, 0.018, 0.026, 0.58)
	bottom_shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bottom_shade)

	var glow := Panel.new()
	_anchor_center_x(glow, -108.0, 108.0, 170.0, 420.0)
	glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	glow.add_theme_stylebox_override("panel", _flat(Color(0.48, 0.83, 0.93, 0.050), 106, Color(0.47, 0.83, 0.92, 0.09), 1))
	add_child(glow)

	_aura_outer = Panel.new()
	_anchor_center_x(_aura_outer, -141.0, 141.0, 145.0, 427.0)
	_aura_outer.pivot_offset = Vector2(141.0, 141.0)
	_aura_outer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_aura_outer.add_theme_stylebox_override("panel", _flat(Color.TRANSPARENT, 141, Color(0.93, 0.77, 0.40, 0.30), 1))
	add_child(_aura_outer)

	_aura_inner = Panel.new()
	_anchor_center_x(_aura_inner, -118.0, 118.0, 168.0, 404.0)
	_aura_inner.pivot_offset = Vector2(118.0, 118.0)
	_aura_inner.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_aura_inner.add_theme_stylebox_override("panel", _flat(Color(0.18, 0.62, 0.70, 0.020), 118, Color(0.48, 0.88, 0.94, 0.36), 1))
	add_child(_aura_inner)

	_hero = TextureRect.new()
	_hero.texture = CULTIVATOR
	_anchor_center_x(_hero, -113.0, 113.0, HERO_BASE_Y, HERO_BASE_Y + 354.0)
	_hero.pivot_offset = Vector2(113.0, 354.0)
	_hero.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_hero.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_hero.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_hero.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_hero)

	var spark_specs := [
		[Vector2(-90, 240), 0.0, 0.70],
		[Vector2(83, 225), 0.85, 0.82],
		[Vector2(-110, 330), 1.70, 0.94],
		[Vector2(107, 348), 2.55, 0.70],
		[Vector2(-58, 414), 3.40, 0.82],
		[Vector2(62, 430), 4.25, 0.94],
	]
	for spec in spark_specs:
		var spark := TextureRect.new()
		spark.texture = SPARK
		spark.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		spark.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		spark.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var offset: Vector2 = spec[0]
		_anchor_center_x(spark, offset.x, offset.x + 13.0, offset.y, offset.y + 13.0)
		spark.modulate = Color(0.72, 0.93, 1.0, 0.42)
		add_child(spark)
		_sparks.append({
			"node": spark,
			"base": spark.position,
			"phase": float(spec[1]),
			"speed": float(spec[2]),
		})

func _process(delta: float) -> void:
	_time += delta
	if is_instance_valid(_hero):
		_hero.position.y = HERO_BASE_Y + sin(_time * 1.35) * 2.0
		var breath := 1.0 + sin(_time * 1.35) * 0.004
		_hero.scale = Vector2(breath, breath)
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
		node.position = base + Vector2(
			sin(_time * speed + phase) * 3.0,
			-fmod(_time * (7.0 + speed * 3.0) + phase * 13.0, 28.0)
		)
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

func _anchor_center_x(control: Control, left_offset: float, right_offset: float, top_offset: float, bottom_offset: float) -> void:
	control.anchor_left = 0.5
	control.anchor_right = 0.5
	control.anchor_top = 0.0
	control.anchor_bottom = 0.0
	control.offset_left = left_offset
	control.offset_right = right_offset
	control.offset_top = top_offset
	control.offset_bottom = bottom_offset

func _anchor_top_wide(control: Control, top_offset: float, bottom_offset: float) -> void:
	control.anchor_left = 0.0
	control.anchor_right = 1.0
	control.anchor_top = 0.0
	control.anchor_bottom = 0.0
	control.offset_left = 0.0
	control.offset_right = 0.0
	control.offset_top = top_offset
	control.offset_bottom = bottom_offset

func _anchor_bottom_wide(control: Control, top_offset: float, bottom_offset: float) -> void:
	control.anchor_left = 0.0
	control.anchor_right = 1.0
	control.anchor_top = 1.0
	control.anchor_bottom = 1.0
	control.offset_left = 0.0
	control.offset_right = 0.0
	control.offset_top = top_offset
	control.offset_bottom = bottom_offset
