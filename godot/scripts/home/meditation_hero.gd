extends Control

const MEDITATION_FRAME_01_PATH := "res://art/approved/home/home_meditation_idle_01.webp"
const MEDITATION_FRAME_04_PATH := "res://art/approved/home/home_meditation_idle_04.webp"
const MEDITATION_FRAME_01: Texture2D = preload("res://art/approved/home/home_meditation_idle_01.webp")
const MEDITATION_FRAME_04: Texture2D = preload("res://art/approved/home/home_meditation_idle_04.webp")

# Only two approved key poses exist today. Never hard-flip them like a two-frame
# GIF: use them as slow key poses while shader-local secondary motion supplies
# continuous breathing / hair / robe life between the keys.
const POSE_CYCLE_SECONDS := 5.6
const SECONDARY_POSE_MAX_ALPHA := 0.42

var runtime_animation_ready := false
var animation_mode := "meditation_idle"
var accent_mode := "none"
var animation_source := "video_frames_preloaded"
var source_pose := "meditation"

var _body: TextureRect
var _secondary_body: TextureRect
var _time := 0.0
var _base_position := Vector2.ZERO
var _base_scale := Vector2.ONE
var _surge_remaining := 0.0
var _surge_duration := 0.0
var _surge_peak := 1.0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	# The seated silhouette must feel grounded on the cultivation platform.
	pivot_offset = size * Vector2(0.5, 0.80)
	_base_position = position
	_base_scale = scale
	_build_body()

func play_idle() -> void:
	accent_mode = "none"
	_surge_remaining = 0.0
	_surge_duration = 0.0
	_surge_peak = 1.0
	_set_surge(0.0)

func play_surge(duration: float = 1.25, intensity: float = 1.0) -> void:
	accent_mode = "meditation_surge"
	_surge_duration = maxf(0.25, duration)
	_surge_remaining = _surge_duration
	_surge_peak = clampf(intensity, 0.35, 1.6)

func has_runtime_animation() -> bool:
	return runtime_animation_ready

func _build_body() -> void:
	_body = _make_pose("MeditationBody", MEDITATION_FRAME_01)
	_secondary_body = _make_pose("MeditationBodySecondary", MEDITATION_FRAME_04)
	_secondary_body.modulate.a = 0.0
	add_child(_body)
	add_child(_secondary_body)

	# Production Home remains seated-only. Both key poses are parse-time
	# dependencies so an import failure is caught before runtime.
	runtime_animation_ready = (
		MEDITATION_FRAME_01 != null
		and MEDITATION_FRAME_04 != null
	)
	set_process(runtime_animation_ready)

func _make_pose(node_name: String, pose_texture: Texture2D) -> TextureRect:
	var pose := TextureRect.new()
	pose.name = node_name
	pose.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	pose.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	pose.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	pose.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	pose.mouse_filter = Control.MOUSE_FILTER_IGNORE
	pose.texture = pose_texture
	pose.material = _meditation_material()
	return pose

func _process(delta: float) -> void:
	if not runtime_animation_ready or not visible:
		return

	_time += maxf(0.0, delta)

	# Continuous eased key-pose blend. The approved second pose never fully
	# replaces the first one, which avoids the old snap / "two beat" look.
	var pose_wave := (sin((_time / POSE_CYCLE_SECONDS) * TAU - PI * 0.5) + 1.0) * 0.5
	var eased_pose := pose_wave * pose_wave * (3.0 - 2.0 * pose_wave)
	_secondary_body.modulate.a = eased_pose * SECONDARY_POSE_MAX_ALPHA

	var breath := sin(_time * 1.15)
	var surge_strength := 0.0
	if _surge_remaining > 0.0:
		_surge_remaining = maxf(0.0, _surge_remaining - delta)
		var progress := 1.0 - (_surge_remaining / maxf(_surge_duration, 0.001))
		surge_strength = pow(sin(progress * PI), 2.0) * _surge_peak
		if _surge_remaining <= 0.0:
			accent_mode = "none"
	else:
		accent_mode = "none"

	# Keep the seated body anchored. Breathing is a tiny scale deformation around
	# a low pivot instead of translating/rotating the whole character.
	position = _base_position
	rotation = 0.0
	scale = Vector2(
		_base_scale.x * (1.0 - breath * 0.00035 + surge_strength * 0.0015),
		_base_scale.y * (1.0 + breath * 0.00115 + surge_strength * 0.0022)
	)
	_set_surge(surge_strength)

func _set_surge(value: float) -> void:
	_set_pose_surge(_body, value)
	_set_pose_surge(_secondary_body, value)

func _set_pose_surge(pose: TextureRect, value: float) -> void:
	if pose != null and pose.material is ShaderMaterial:
		(pose.material as ShaderMaterial).set_shader_parameter("surge", value)

func _meditation_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;

uniform float surge : hint_range(0.0, 1.6) = 0.0;

void fragment() {
	vec2 uv = UV;
	float lateral = abs(uv.x - 0.5);
	float breath = sin(TIME * 1.15);

	// Face and hands remain stable. Motion is concentrated in long hair,
	// sleeves and lower cloth so the seated pose reads as grounded meditation.
	float hair_mask =
		smoothstep(0.15, 0.28, lateral)
		* smoothstep(0.12, 0.23, uv.y)
		* (1.0 - smoothstep(0.69, 0.84, uv.y));
	float sleeve_mask =
		smoothstep(0.14, 0.25, lateral)
		* smoothstep(0.35, 0.49, uv.y)
		* (1.0 - smoothstep(0.76, 0.90, uv.y));
	float robe_mask =
		smoothstep(0.56, 0.78, uv.y)
		* smoothstep(0.08, 0.20, lateral);
	float torso_mask =
		smoothstep(0.28, 0.38, uv.y)
		* (1.0 - smoothstep(0.55, 0.67, uv.y))
		* (1.0 - smoothstep(0.18, 0.27, lateral));

	float hair_wave = sin(TIME * 0.58 + uv.y * 8.4 - uv.x * 4.0);
	float sleeve_wave = sin(TIME * 0.69 + uv.y * 7.2 + uv.x * 3.8 + 0.9);
	float robe_wave = sin(TIME * 0.74 + uv.y * 9.6 + uv.x * 2.8 + 1.6);

	uv.x += hair_wave * 0.00165 * hair_mask;
	uv.x += sleeve_wave * 0.00120 * sleeve_mask;
	uv.x += robe_wave * 0.00185 * robe_mask;
	uv.y += breath * 0.00055 * torso_mask;

	vec4 tex = texture(TEXTURE, clamp(uv, vec2(0.001), vec2(0.999)));
	float qi = 1.0 + 0.007 * sin(TIME * 0.82 + uv.y * 5.2);
	float focus = 1.0 + surge * 0.095 * (1.0 - smoothstep(0.05, 0.74, distance(uv, vec2(0.5, 0.58))));
	tex.rgb *= qi * focus;
	COLOR = tex;
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	return material
