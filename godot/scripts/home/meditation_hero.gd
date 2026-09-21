extends Control

const MEDITATION_FRAME_01_PATH := "res://art/approved/home/home_meditation_idle_01.webp"
const MEDITATION_FRAME_04_PATH := "res://art/approved/home/home_meditation_idle_04.webp"
const MEDITATION_FRAME_01: Texture2D = preload("res://art/approved/home/home_meditation_idle_01.webp")
const MEDITATION_FRAME_04: Texture2D = preload("res://art/approved/home/home_meditation_idle_04.webp")
const FRAME_INTERVAL := 0.34

var runtime_animation_ready := false
var animation_mode := "meditation_idle"
var accent_mode := "none"
var animation_source := "video_frames_preloaded"
var source_pose := "meditation"

var _body: TextureRect
var _frames: Array[Texture2D] = []
var _frame_index := 0
var _frame_elapsed := 0.0
var _time := 0.0
var _base_position := Vector2.ZERO
var _base_scale := Vector2.ONE
var _surge_remaining := 0.0
var _surge_duration := 0.0
var _surge_peak := 1.0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	pivot_offset = size * Vector2(0.5, 0.62)
	_base_position = position
	_base_scale = scale
	_build_body()

func play_idle() -> void:
	accent_mode = "none"
	_surge_remaining = 0.0
	_surge_duration = 0.0
	_surge_peak = 1.0
	if _body != null and _body.material is ShaderMaterial:
		(_body.material as ShaderMaterial).set_shader_parameter("surge", 0.0)

func play_surge(duration: float = 1.25, intensity: float = 1.0) -> void:
	accent_mode = "meditation_surge"
	_surge_duration = maxf(0.25, duration)
	_surge_remaining = _surge_duration
	_surge_peak = clampf(intensity, 0.35, 1.6)

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
	_body.material = _meditation_material()

	_frames = [MEDITATION_FRAME_01, MEDITATION_FRAME_04]
	_body.texture = _frames[0]
	add_child(_body)

	# Production Home is seated-only. The textures above are parse-time
	# dependencies, so a missing/import-broken frame fails before runtime
	# instead of silently caching null and showing an empty hero stage.
	runtime_animation_ready = _frames.size() == 2 and _frames[0] != null and _frames[1] != null
	set_process(runtime_animation_ready)

func _process(delta: float) -> void:
	if not runtime_animation_ready or not visible:
		return

	_time += delta
	_frame_elapsed += delta
	if _frame_elapsed >= FRAME_INTERVAL:
		_frame_elapsed = fmod(_frame_elapsed, FRAME_INTERVAL)
		_frame_index = (_frame_index + 1) % _frames.size()
		_body.texture = _frames[_frame_index]

	var breath: float = sin(_time * 1.08)
	var sway: float = sin(_time * 0.54 + 0.8)
	var surge_strength := 0.0

	if _surge_remaining > 0.0:
		_surge_remaining = maxf(0.0, _surge_remaining - delta)
		var progress := 1.0 - (_surge_remaining / maxf(_surge_duration, 0.001))
		surge_strength = sin(progress * PI) * sin(progress * PI) * _surge_peak
		if _surge_remaining <= 0.0:
			accent_mode = "none"
	else:
		accent_mode = "none"

	position = _base_position + Vector2(sway * 0.28, breath * (0.45 + surge_strength * 0.85))
	rotation = deg_to_rad(sway * 0.03)
	scale = Vector2(
		_base_scale.x * (1.0 + surge_strength * 0.003),
		_base_scale.y * (1.0 + surge_strength * 0.004)
	)

	if _body.material is ShaderMaterial:
		var mat := _body.material as ShaderMaterial
		mat.set_shader_parameter("surge", surge_strength)

func _meditation_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;

uniform float surge : hint_range(0.0, 1.6) = 0.0;

void fragment() {
	vec4 tex = texture(TEXTURE, UV);
	float qi = 1.0 + 0.010 * sin(TIME * 0.88 + UV.y * 5.2);
	float focus = 1.0 + surge * 0.085 * smoothstep(0.74, 0.05, distance(UV, vec2(0.5, 0.58)));
	tex.rgb *= qi * focus;
	COLOR = tex;
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	return material
