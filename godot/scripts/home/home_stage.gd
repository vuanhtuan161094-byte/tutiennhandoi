extends Control

const HOME_ART := preload("res://scripts/home/home_art_atlas.gd")
const MEDITATION_HERO_SCRIPT := preload("res://scripts/home/meditation_hero.gd")
const SPARK := preload("res://art/icons/spark.svg")

# HOME ANIMATION V2 staging: the heroine owns a larger stage than the old
# card-like box. Decorative world layers may pass behind/in front of her while
# HUD/Nav remain separate siblings above HomeStage in main.gd.
const HERO_STAGE_LEFT := -154.0
const HERO_STAGE_RIGHT := 154.0
const HERO_STAGE_TOP := 136.0
const HERO_STAGE_BOTTOM := 554.0

const Z_BACKGROUND := -40
const Z_WORLD_BACK := -20
const Z_PEDESTAL_BACK := -8
const Z_HERO := 0
const Z_WORLD_FRONT := 8
const Z_PARTICLES_FRONT := 12

var _time := 0.0
var _hero
var _aura_outer: Control
var _aura_inner: Control
var _pedestal: Control
var _front_aura: CanvasItem
var _front_pedestal: CanvasItem
var _front_mist: CanvasItem
var _sparks: Array = []
var _was_cultivation_ready := false

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	# HomeStage itself is full screen and must never clip animation limbs/hair
	# merely because the heroine moves outside her local hero rectangle.
	clip_contents = false
	set_process(true)
	_build_world()

func bind(vm: Dictionary) -> void:
	var progression: Dictionary = vm.get("progression", {})
	var ready := bool(progression.get("ready", false))
	if ready and not _was_cultivation_ready:
		play_meditation_surge()
	_was_cultivation_ready = ready

func set_home_mode(mode: StringName) -> void:
	if is_instance_valid(_hero) and _hero.has_method("set_home_mode"):
		_hero.set_home_mode(mode)

func get_home_mode() -> StringName:
	if is_instance_valid(_hero) and _hero.has_method("get_home_mode"):
		return _hero.get_home_mode()
	return &"cultivation"

func set_motion_mode(mode: StringName) -> void:
	if is_instance_valid(_hero) and _hero.has_method("set_motion_mode"):
		_hero.set_motion_mode(mode)

func get_motion_mode() -> StringName:
	if is_instance_valid(_hero) and _hero.has_method("get_motion_mode"):
		return _hero.get_motion_mode()
	return &"still"

func set_animation_preset(preset_id: StringName) -> void:
	if is_instance_valid(_hero) and _hero.has_method("set_animation_preset"):
		_hero.set_animation_preset(preset_id)

func get_animation_preset() -> StringName:
	if is_instance_valid(_hero) and _hero.has_method("get_animation_preset"):
		return _hero.get_animation_preset()
	return &""

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
	bg.name = "WorldBackground"
	bg.texture = HOME_ART.texture(&"background", "res://art/approved/home/home_background.webp")
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bg.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	bg.z_index = Z_BACKGROUND
	add_child(bg)

	var wash := ColorRect.new()
	wash.name = "WorldWash"
	wash.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	wash.color = Color(0.015, 0.050, 0.075, 0.10)
	wash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	wash.z_index = Z_BACKGROUND + 1
	add_child(wash)

	var top_shade := ColorRect.new()
	_anchor_top_wide(top_shade, 0.0, 162.0)
	top_shade.color = Color(0.0, 0.012, 0.022, 0.31)
	top_shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	top_shade.z_index = Z_BACKGROUND + 2
	add_child(top_shade)

	var bottom_shade := ColorRect.new()
	_anchor_bottom_wide(bottom_shade, -276.0, 0.0)
	bottom_shade.color = Color(0.0, 0.014, 0.025, 0.56)
	bottom_shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	bottom_shade.z_index = Z_BACKGROUND + 2
	add_child(bottom_shade)

	var hero_light := Panel.new()
	hero_light.name = "HeroBackLight"
	_anchor_center_x(hero_light, -146.0, 146.0, 188.0, 520.0)
	hero_light.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hero_light.z_index = Z_WORLD_BACK - 2
	hero_light.add_theme_stylebox_override("panel", _flat(Color(0.42, 0.82, 0.94, 0.038), 146, Color(0.55, 0.88, 0.95, 0.08), 1))
	add_child(hero_light)

	var aura_art := HOME_ART.production_texture(&"aura")
	if aura_art != null:
		var aura_texture := TextureRect.new()
		aura_texture.name = "AuraBack"
		aura_texture.texture = aura_art
		_anchor_center_x(aura_texture, -154.0, 154.0, 196.0, 504.0)
		aura_texture.pivot_offset = Vector2(154.0, 154.0)
		aura_texture.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		aura_texture.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		aura_texture.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		aura_texture.mouse_filter = Control.MOUSE_FILTER_IGNORE
		aura_texture.z_index = Z_WORLD_BACK
		_aura_outer = aura_texture
		add_child(aura_texture)
	else:
		_aura_outer = Panel.new()
		_aura_outer.name = "AuraBackFallback"
		_anchor_center_x(_aura_outer, -154.0, 154.0, 196.0, 504.0)
		_aura_outer.pivot_offset = Vector2(154.0, 154.0)
		_aura_outer.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_aura_outer.z_index = Z_WORLD_BACK
		_aura_outer.add_theme_stylebox_override("panel", _flat(Color.TRANSPARENT, 154, Color(0.98, 0.77, 0.34, 0.38), 2))
		add_child(_aura_outer)

		_aura_inner = Panel.new()
		_aura_inner.name = "AuraInnerBack"
		_anchor_center_x(_aura_inner, -122.0, 122.0, 228.0, 472.0)
		_aura_inner.pivot_offset = Vector2(122.0, 122.0)
		_aura_inner.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_aura_inner.z_index = Z_WORLD_BACK + 1
		_aura_inner.add_theme_stylebox_override("panel", _flat(Color(0.16, 0.68, 0.76, 0.018), 122, Color(0.48, 0.90, 0.96, 0.32), 1))
		add_child(_aura_inner)

	var pedestal_art := HOME_ART.production_texture(&"pedestal")
	if pedestal_art != null:
		var pedestal_texture := TextureRect.new()
		pedestal_texture.name = "PedestalBack"
		pedestal_texture.texture = pedestal_art
		_anchor_center_x(pedestal_texture, -160.0, 160.0, 350.0, 548.0)
		pedestal_texture.pivot_offset = Vector2(160.0, 99.0)
		pedestal_texture.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		pedestal_texture.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		pedestal_texture.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		pedestal_texture.mouse_filter = Control.MOUSE_FILTER_IGNORE
		pedestal_texture.z_index = Z_PEDESTAL_BACK
		_pedestal = pedestal_texture
		add_child(pedestal_texture)
	else:
		_pedestal = Panel.new()
		_pedestal.name = "PedestalBackFallback"
		_anchor_center_x(_pedestal, -148.0, 148.0, 446.0, 520.0)
		_pedestal.pivot_offset = Vector2(148.0, 37.0)
		_pedestal.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_pedestal.z_index = Z_PEDESTAL_BACK
		_pedestal.add_theme_stylebox_override("panel", _flat(Color(0.12, 0.24, 0.23, 0.20), 37, Color(0.96, 0.79, 0.38, 0.32), 2))
		add_child(_pedestal)

		var pedestal_core := Panel.new()
		pedestal_core.name = "PedestalCore"
		_anchor_center_x(pedestal_core, -104.0, 104.0, 464.0, 502.0)
		pedestal_core.mouse_filter = Control.MOUSE_FILTER_IGNORE
		pedestal_core.z_index = Z_PEDESTAL_BACK + 1
		pedestal_core.add_theme_stylebox_override("panel", _flat(Color(0.48, 0.82, 0.72, 0.08), 19, Color(0.56, 0.92, 0.79, 0.22), 1))
		add_child(pedestal_core)

	# A few motes live behind the heroine so the depth read is not a single flat
	# stack. More motes are added in front below.
	_add_sparks([
		[Vector2(-124, 246), 0.0, 0.70],
		[Vector2(112, 258), 0.85, 0.82],
		[Vector2(-136, 350), 1.70, 0.94],
		[Vector2(128, 366), 2.55, 0.70],
	], Z_PEDESTAL_BACK + 2)

	_hero = MEDITATION_HERO_SCRIPT.new()
	_hero.name = "HomeMeditationHero"
	_hero.clip_contents = false
	_hero.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_hero.z_index = Z_HERO
	_anchor_center_x(_hero, HERO_STAGE_LEFT, HERO_STAGE_RIGHT, HERO_STAGE_TOP, HERO_STAGE_BOTTOM)
	add_child(_hero)

	_build_foreground_depth(aura_art, pedestal_art)

	_add_sparks([
		[Vector2(-96, 418), 3.40, 0.82],
		[Vector2(90, 438), 4.25, 0.94],
		[Vector2(-28, 202), 5.10, 0.76],
		[Vector2(32, 492), 5.95, 0.88],
	], Z_PARTICLES_FRONT)

func _build_foreground_depth(aura_art: Texture2D, pedestal_art: Texture2D) -> void:
	if aura_art != null:
		var aura_front := TextureRect.new()
		aura_front.name = "AuraFrontArc"
		aura_front.texture = aura_art
		_anchor_center_x(aura_front, -154.0, 154.0, 196.0, 504.0)
		aura_front.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		aura_front.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		aura_front.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		aura_front.mouse_filter = Control.MOUSE_FILTER_IGNORE
		aura_front.material = _front_aura_material()
		aura_front.z_index = Z_WORLD_FRONT
		_front_aura = aura_front
		add_child(aura_front)
	else:
		var aura_front_fallback := ColorRect.new()
		aura_front_fallback.name = "AuraFrontArcFallback"
		_anchor_center_x(aura_front_fallback, -166.0, 166.0, 326.0, 536.0)
		aura_front_fallback.color = Color.WHITE
		aura_front_fallback.mouse_filter = Control.MOUSE_FILTER_IGNORE
		aura_front_fallback.material = _procedural_front_arc_material()
		aura_front_fallback.z_index = Z_WORLD_FRONT
		_front_aura = aura_front_fallback
		add_child(aura_front_fallback)

	if pedestal_art != null:
		var pedestal_front := TextureRect.new()
		pedestal_front.name = "PedestalFrontLip"
		pedestal_front.texture = pedestal_art
		_anchor_center_x(pedestal_front, -160.0, 160.0, 350.0, 548.0)
		pedestal_front.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		pedestal_front.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		pedestal_front.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		pedestal_front.mouse_filter = Control.MOUSE_FILTER_IGNORE
		pedestal_front.material = _front_pedestal_material()
		pedestal_front.z_index = Z_WORLD_FRONT + 1
		_front_pedestal = pedestal_front
		add_child(pedestal_front)

	var mist := ColorRect.new()
	mist.name = "ForegroundMist"
	_anchor_center_x(mist, -186.0, 186.0, 390.0, 570.0)
	mist.color = Color.WHITE
	mist.mouse_filter = Control.MOUSE_FILTER_IGNORE
	mist.material = _foreground_mist_material()
	mist.z_index = Z_WORLD_FRONT + 2
	_front_mist = mist
	add_child(mist)

func _add_sparks(specs: Array, depth: int) -> void:
	for spec in specs:
		var spark := TextureRect.new()
		spark.texture = SPARK
		spark.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		spark.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		spark.mouse_filter = Control.MOUSE_FILTER_IGNORE
		spark.z_index = depth
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
	if is_instance_valid(_front_aura):
		_front_aura.modulate.a = 0.72 + sin(_time * 0.68 + 0.15) * 0.08
	if is_instance_valid(_front_pedestal):
		_front_pedestal.modulate.a = 0.78 + sin(_time * 0.74 + 0.65) * 0.07
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

func _front_aura_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;

void fragment() {
	vec4 tex = texture(TEXTURE, UV);
	float lower = smoothstep(0.54, 0.73, UV.y);
	float side = smoothstep(0.05, 0.24, abs(UV.x - 0.5));
	float depth_mask = clamp(lower * (0.68 + side * 0.32), 0.0, 1.0);
	tex.a *= depth_mask * 0.66;
	COLOR = tex;
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	return material

func _front_pedestal_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;

void fragment() {
	vec4 tex = texture(TEXTURE, UV);
	float lip = smoothstep(0.58, 0.79, UV.y);
	float center_fade = 0.70 + 0.30 * smoothstep(0.0, 0.46, abs(UV.x - 0.5));
	tex.a *= lip * center_fade * 0.72;
	COLOR = tex;
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	return material

func _procedural_front_arc_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;

void fragment() {
	vec2 p = UV - vec2(0.5, 0.23);
	p.y *= 1.55;
	float d = length(p);
	float outer = 1.0 - smoothstep(0.49, 0.51, d);
	float inner = smoothstep(0.44, 0.46, d);
	float lower = smoothstep(0.48, 0.72, UV.y);
	float alpha = outer * inner * lower * 0.34;
	COLOR = vec4(0.72, 0.94, 1.0, alpha);
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	return material

func _foreground_mist_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;

void fragment() {
	vec2 uv = UV;
	float center = 1.0 - smoothstep(0.28, 0.52, abs(uv.x - 0.5));
	float vertical = smoothstep(0.05, 0.28, uv.y) * (1.0 - smoothstep(0.68, 0.98, uv.y));
	float wave_a = 0.5 + 0.5 * sin(uv.x * 11.0 + uv.y * 4.5 + TIME * 0.34);
	float wave_b = 0.5 + 0.5 * sin(uv.x * 17.0 - uv.y * 3.0 - TIME * 0.27 + 1.7);
	float alpha = center * vertical * (0.026 + wave_a * 0.024 + wave_b * 0.016);
	COLOR = vec4(0.76, 0.94, 1.0, alpha);
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	return material

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
