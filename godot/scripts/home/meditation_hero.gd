extends Control

const HOME_ART := preload("res://scripts/home/home_art_atlas.gd")
const MEDITATION_ATLAS_FALLBACK_PATH := "res://art/approved/home/home_meditation_idle_atlas.webp"
const STANDING_EMERGENCY_FALLBACK_PATH := "res://art/approved/home/home_hero_standing.webp"

const FRAME_SIZE := Vector2i(192, 288)
const FRAME_COLUMNS := 4
const FRAME_COUNT := 12
const FRAME_FPS := 6.0

var runtime_animation_ready := false
var animation_mode := "meditation_idle"
var accent_mode := "none"
var animation_source := "video_atlas"
var source_pose := "meditation"

var _body: TextureRect
var _atlas_texture: Texture2D
var _frame_texture: AtlasTexture
var _frame_index := 0
var _frame_direction := 1
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

	_atlas_texture = HOME_ART.texture(&"hero_meditation_idle_atlas", MEDITATION_ATLAS_FALLBACK_PATH)
	if _atlas_texture != null:
		_frame_texture = AtlasTexture.new()
		_frame_texture.atlas = _atlas_texture
		_apply_frame_region()
		_body.texture = _frame_texture
		animation_source = "video_atlas"
	else:
		if ResourceLoader.exists(STANDING_EMERGENCY_FALLBACK_PATH):
			_body.texture = ResourceLoader.load(STANDING_EMERGENCY_FALLBACK_PATH) as Texture2D
		else:
			_body.texture = null
		animation_source = "procedural_fallback"

	_body.material = _meditation_material()
	add_child(_body)

	runtime_animation_ready = _body.texture != null
	set_process(runtime_animation_ready)

func _process(delta: float) -> void:
	if not runtime_animation_ready or not visible:
		return

	_time += delta
	if _frame_texture != null:
		_frame_elapsed += delta
		var frame_interval: float = 1.0 / FRAME_FPS
		while _frame_elapsed >= frame_interval:
			_frame_elapsed -= frame_interval
			_step_video_frame()

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

	position = _base_position + Vector2(sway * 0.32, breath * (0.55 + surge_strength * 0.85))
	rotation = deg_to_rad(sway * 0.035)
	scale = Vector2(
		_base_scale.x * (1.0 + surge_strength * 0.003),
		_base_scale.y * (1.0 + surge_strength * 0.004)
	)

	if _body.material is ShaderMaterial:
		var mat := _body.material as ShaderMaterial
		mat.set_shader_parameter("surge", surge_strength)

func _step_video_frame() -> void:
	_frame_index += _frame_direction
	if _frame_index >= FRAME_COUNT - 1:
		_frame_index = FRAME_COUNT - 1
		_frame_direction = -1
	elif _frame_index <= 0:
		_frame_index = 0
		_frame_direction = 1
	_apply_frame_region()

func _apply_frame_region() -> void:
	if _frame_texture == null:
		return
	var col: int = _frame_index % FRAME_COLUMNS
	var row: int = floori(float(_frame_index) / float(FRAME_COLUMNS))
	_frame_texture.region = Rect2(
		float(col * FRAME_SIZE.x),
		float(row * FRAME_SIZE.y),
		float(FRAME_SIZE.x),
		float(FRAME_SIZE.y)
	)

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
