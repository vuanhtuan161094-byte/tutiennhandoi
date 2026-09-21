extends Control

const HOME_ART := preload("res://scripts/home/home_art_atlas.gd")
const MEDITATION_HERO_SCRIPT := preload("res://scripts/home/meditation_hero.gd")
const SPARK := preload("res://art/icons/spark.svg")

var _time := 0.0
var _hero
var _aura_outer: Control
var _aura_inner: Control
var _pedestal: Control
var _sparks: Array = []
var _was_cultivation_ready := false

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_process(true)
	_build_world()

func bind(vm: Dictionary) -> void:
	var progression: Dictionary = vm.get("progression", {})
	var ready := bool(progression.get("ready", false))
	if ready and not _was_cultivation_ready:
		play_meditation_surge()
	_was_cultivation_ready = ready

func play_meditation_surge(duration: float = 1.25, intensity: float = 1.0) -> void:
	if is_instance_valid(_hero) and _hero.has_method("play_surge"):
		_hero.play_surge(duration, intensity)

func play_breakthrough_burst(major: bool = false) -> void:
	play_meditation_surge(2.1 if major else 1.55, 1.35 if major else 1.0)

func play_ling_quang_burst(multiplier: int) -> void:
	if multiplier >= 9:
		play_meditation_surge(2.0, 1.55)
	elif multiplier >= 7:
		play_meditation_surge(1.75, 1.40)
	elif multiplier >= 5:
		play_meditation_surge(1.55, 1.25)
	elif multiplier >= 4:
		play_meditation_surge(1.35, 1.10)
	elif multiplier >= 3:
		play_meditation_surge(1.15, 0.90)
	elif multiplier >= 2:
		play_meditation_surge(0.85, 0.65)

func _build_world() -> void:
	var bg := TextureRect.new()
	bg.texture = HOME_ART.texture(&"background", "res://art/approved/home/home_background.webp")
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bg.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg)

	var wash := ColorRect.new()
	wash.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	wash.color = Color(0.015, 0.050, 0.075, 0.10)
	wash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(wash)

	var top_shade := ColorRect.new()
	_anchor_top_wide(top_shade, 0.0, 162.0)
	top_shade.color = Color(0.0, 0.012, 0.022, 0.31)
	top_shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(top_shade)

	var bottom_shade := ColorRect.new()
	_anchor_bottom_wide(bottom_shade, -276.0, 0.0)
	bottom_shade.color = Color(0.0, 0.014, 0.025, 0.56)
	bottom_shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bottom_shade)

	var hero_light := Panel.new()
	_anchor_center_x(hero_light, -112.0, 112.0, 226.0, 492.0)
	hero_light.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hero_light.add_theme_stylebox_override("panel", _flat(Color(0.42, 0.82, 0.94, 0.042), 112, Color(0.55, 0.88, 0.95, 0.08), 1))
	add_child(hero_light)

	var aura_art := HOME_ART.production_texture(&"aura")
	if aura_art != null:
		var aura_texture := TextureRect.new()
		aura_texture.texture = aura_art
		_anchor_center_x(aura_texture, -136.0, 136.0, 218.0, 490.0)
		aura_texture.pivot_offset = Vector2(136.0, 136.0)
		aura_texture.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		aura_texture.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		aura_texture.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		aura_texture.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_aura_outer = aura_texture
		add_child(aura_texture)
	else:
		_aura_outer = Panel.new()
		_anchor_center_x(_aura_outer, -136.0, 136.0, 218.0, 490.0)
		_aura_outer.pivot_offset = Vector2(136.0, 136.0)
		_aura_outer.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_aura_outer.add_theme_stylebox_override("panel", _flat(Color.TRANSPARENT, 136, Color(0.98, 0.77, 0.34, 0.38), 2))
		add_child(_aura_outer)

		_aura_inner = Panel.new()
		_anchor_center_x(_aura_inner, -109.0, 109.0, 245.0, 463.0)
		_aura_inner.pivot_offset = Vector2(109.0, 109.0)
		_aura_inner.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_aura_inner.add_theme_stylebox_override("panel", _flat(Color(0.16, 0.68, 0.76, 0.018), 109, Color(0.48, 0.90, 0.96, 0.32), 1))
		add_child(_aura_inner)

	var pedestal_art := HOME_ART.production_texture(&"pedestal")
	if pedestal_art != null:
		var pedestal_texture := TextureRect.new()
		pedestal_texture.texture = pedestal_art
		# Production pedestal includes its own vertical aura/mist, so give it a
		# taller stage box behind the hero instead of crushing it into 58 px.
		_anchor_center_x(pedestal_texture, -145.0, 145.0, 360.0, 530.0)
		pedestal_texture.pivot_offset = Vector2(145.0, 85.0)
		pedestal_texture.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		pedestal_texture.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		pedestal_texture.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		pedestal_texture.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_pedestal = pedestal_texture
		add_child(pedestal_texture)
	else:
		_pedestal = Panel.new()
		_anchor_center_x(_pedestal, -134.0, 134.0, 452.0, 510.0)
		_pedestal.pivot_offset = Vector2(134.0, 29.0)
		_pedestal.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_pedestal.add_theme_stylebox_override("panel", _flat(Color(0.12, 0.24, 0.23, 0.20), 29, Color(0.96, 0.79, 0.38, 0.32), 2))
		add_child(_pedestal)

		var pedestal_core := Panel.new()
		_anchor_center_x(pedestal_core, -93.0, 93.0, 466.0, 496.0)
		pedestal_core.mouse_filter = Control.MOUSE_FILTER_IGNORE
		pedestal_core.add_theme_stylebox_override("panel", _flat(Color(0.48, 0.82, 0.72, 0.08), 15, Color(0.56, 0.92, 0.79, 0.22), 1))
		add_child(pedestal_core)

	_hero = MEDITATION_HERO_SCRIPT.new()
	_hero.name = "HomeMeditationHero"
	_anchor_center_x(_hero, -118.0, 118.0, 198.0, 512.0)
	add_child(_hero)

	var spark_specs := [
		[Vector2(-102, 255), 0.0, 0.70],
		[Vector2(92, 242), 0.85, 0.82],
		[Vector2(-118, 346), 1.70, 0.94],
		[Vector2(114, 356), 2.55, 0.70],
		[Vector2(-72, 430), 3.40, 0.82],
		[Vector2(67, 444), 4.25, 0.94],
		[Vector2(-18, 208), 5.10, 0.76],
		[Vector2(20, 484), 5.95, 0.88],
	]
	for spec in spark_specs:
		var spark := TextureRect.new()
		spark.texture = SPARK
		spark.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		spark.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		spark.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var offset: Vector2 = spec[0]
		_anchor_center_x(spark, offset.x, offset.x + 12.0, offset.y, offset.y + 12.0)
		spark.modulate = Color(0.75, 0.94, 1.0, 0.40)
		add_child(spark)
		_sparks.append({
			"node": spark,
			"base": spark.position,
			"phase": float(spec[1]),
			"speed": float(spec[2]),
		})

func _process(delta: float) -> void:
	_time += delta
	if is_instance_valid(_aura_outer):
		var pulse := 1.0 + sin(_time * 0.68) * 0.016
		_aura_outer.scale = Vector2.ONE * pulse
		_aura_outer.modulate.a = 0.80 + sin(_time * 0.68) * 0.11
	if is_instance_valid(_aura_inner):
		var pulse_inner := 1.0 + sin(_time * 0.92 + 1.1) * 0.012
		_aura_inner.scale = Vector2.ONE * pulse_inner
	if is_instance_valid(_pedestal):
		_pedestal.modulate.a = 0.82 + sin(_time * 0.74 + 0.4) * 0.10
	for data in _sparks:
		var node: TextureRect = data["node"]
		var base: Vector2 = data["base"]
		var phase := float(data["phase"])
		var speed := float(data["speed"])
		node.position = base + Vector2(
			sin(_time * speed + phase) * 3.0,
			-fmod(_time * (6.0 + speed * 2.8) + phase * 11.0, 26.0)
		)
		node.modulate.a = 0.18 + 0.50 * (0.5 + 0.5 * sin(_time * 1.7 + phase))

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
