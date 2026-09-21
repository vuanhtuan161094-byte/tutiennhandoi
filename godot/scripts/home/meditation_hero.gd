extends Control

const HOME_ART := preload("res://scripts/home/home_art_atlas.gd")
const FALLBACK_PATH := "res://art/approved/home_cultivator_centered.png"

var runtime_animation_ready := false
var animation_mode := "meditation_idle"
var animation_source := "procedural"
var source_pose := "meditation"

var _body: TextureRect
var _time := 0.0
var _base_position := Vector2.ZERO
var _base_scale := Vector2.ONE
var _surge_remaining := 0.0
var _surge_duration := 0.0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	pivot_offset = size * Vector2(0.5, 0.62)
	_base_position = position
	_base_scale = scale
	_build_body()

func play_idle() -> void:
	animation_mode = "meditation_idle"
	_surge_remaining = 0.0
	_surge_duration = 0.0
	if _body != null and _body.material is ShaderMaterial:
		(_body.material as ShaderMaterial).set_shader_parameter("surge", 0.0)

func play_surge(duration: float = 1.25) -> void:
	animation_mode = "meditation_surge"
	_surge_duration = maxf(0.25, duration)
	_surge_remaining = _surge_duration

func has_runtime_animation() -> bool:
	return runtime_animation_ready

func _build_body() -> void:
	_body = TextureRect.new()
	_body.name = "MeditationBody"
	_body.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_body.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_body.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_body.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_body.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_body.texture = HOME_ART.texture(&"hero", FALLBACK_PATH)
	_body.material = _meditation_material()
	add_child(_body)

	runtime_animation_ready = _body.texture != null
	set_process(runtime_animation_ready)

func _process(delta: float) -> void:
	if not runtime_animation_ready or not visible:
		return

	_time += delta
	var breath := sin(_time * 1.08)
	var sway := sin(_time * 0.54 + 0.8)
	var surge_strength := 0.0

	if _surge_remaining > 0.0:
		_surge_remaining = maxf(0.0, _surge_remaining - delta)
		var progress := 1.0 - (_surge_remaining / maxf(_surge_duration, 0.001))
		surge_strength = sin(progress * PI) * sin(progress * PI)
		if _surge_remaining <= 0.0:
			animation_mode = "meditation_idle"
	else:
		animation_mode = "meditation_idle"

	position = _base_position + Vector2(sway * 0.65, breath * (1.25 + surge_strength * 1.1))
	rotation = deg_to_rad(sway * (0.07 + surge_strength * 0.05))
	scale = Vector2(
		_base_scale.x * (1.0 + breath * 0.0025 + surge_strength * 0.004),
		_base_scale.y * (1.0 + breath * 0.0040 + surge_strength * 0.006)
	)

	if _body.material is ShaderMaterial:
		var mat := _body.material as ShaderMaterial
		mat.set_shader_parameter("surge", surge_strength)

func _meditation_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;

uniform float surge : hint_range(0.0, 1.0) = 0.0;

void fragment() {
	vec2 uv = UV;

	float breath = sin(TIME * 1.08);
	float slow = sin(TIME * 0.54 + 0.8);
	float silk_wave = sin(TIME * 0.72 + uv.y * 9.0 + uv.x * 3.4);
	float hair_wave = sin(TIME * 0.61 + uv.y * 7.0 - uv.x * 4.2);

	float torso = smoothstep(0.16, 0.34, uv.y) * (1.0 - smoothstep(0.56, 0.72, uv.y));
	float lower_silk = smoothstep(0.48, 0.96, uv.y);
	float side_hair = smoothstep(0.18, 0.68, uv.y) * smoothstep(0.12, 0.34, abs(uv.x - 0.5));

	uv.y += breath * 0.0016 * torso;
	uv.x += silk_wave * (0.0018 + surge * 0.0018) * lower_silk;
	uv.x += hair_wave * (0.0011 + surge * 0.0010) * side_hair;
	uv.x += slow * 0.00055 * torso;

	vec4 tex = texture(TEXTURE, uv);
	float qi = 1.0 + 0.016 * sin(TIME * 0.88 + uv.y * 5.2);
	float focus = 1.0 + surge * 0.075 * smoothstep(0.25, 0.68, 1.0 - distance(uv, vec2(0.5, 0.55)));
	tex.rgb *= qi * focus;
	COLOR = tex;
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	return material
