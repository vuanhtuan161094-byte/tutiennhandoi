extends Control

const HOME_IDLE_V2_PATH := "res://art/approved/home/animation_v2/home_idle_v2.tres"
const HOME_IDLE_V2_VARIANTS := [
	&"idle_relaxed_01",
	&"idle_relaxed_02",
	&"idle_relaxed_03",
]

const MEDITATION_FRAME_01_PATH := "res://art/approved/home/home_meditation_idle_01.webp"
const MEDITATION_FRAME_04_PATH := "res://art/approved/home/home_meditation_idle_04.webp"
const MEDITATION_FRAME_01: Texture2D = preload("res://art/approved/home/home_meditation_idle_01.webp")
const MEDITATION_FRAME_04: Texture2D = preload("res://art/approved/home/home_meditation_idle_04.webp")

# Legacy seated key-pose fallback. HOME ANIMATION V2 takes priority whenever
# the approved SpriteFrames resource exists; this fallback keeps current main
# bootable while binary candidate assets are installed through the asset pack.
const POSE_CYCLE_SECONDS := 5.6
const SECONDARY_POSE_MAX_ALPHA := 0.42

var runtime_animation_ready := false
var animation_mode := "meditation_idle"
var accent_mode := "none"
var animation_source := "video_frames_preloaded"
var source_pose := "meditation"

var _body: TextureRect
var _secondary_body: TextureRect
var _video_sprite: AnimatedSprite2D
var _video_frames: SpriteFrames
var _video_variant_index := 0

var _time := 0.0
var _base_position := Vector2.ZERO
var _base_scale := Vector2.ONE
var _surge_remaining := 0.0
var _surge_duration := 0.0
var _surge_peak := 1.0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	pivot_offset = size * Vector2(0.5, 0.80)
	_base_position = position
	_base_scale = scale
	_build_body()

func _notification(what: int) -> void:
	if what == NOTIFICATION_RESIZED and is_instance_valid(_video_sprite):
		_layout_video_sprite()

func play_idle() -> void:
	accent_mode = "none"
	_surge_remaining = 0.0
	_surge_duration = 0.0
	_surge_peak = 1.0
	_set_surge(0.0)
	if is_instance_valid(_video_sprite) and not _video_sprite.is_playing():
		_start_video_variant(_video_variant_index)

func play_surge(duration: float = 1.25, intensity: float = 1.0) -> void:
	accent_mode = "meditation_surge"
	_surge_duration = maxf(0.25, duration)
	_surge_remaining = _surge_duration
	_surge_peak = clampf(intensity, 0.35, 1.6)

func has_runtime_animation() -> bool:
	return runtime_animation_ready

func get_active_idle_variant() -> StringName:
	if HOME_IDLE_V2_VARIANTS.is_empty():
		return &""
	return HOME_IDLE_V2_VARIANTS[_video_variant_index]

func _build_body() -> void:
	if _try_build_video_playlist():
		return
	_build_legacy_body()

func _try_build_video_playlist() -> bool:
	if not ResourceLoader.exists(HOME_IDLE_V2_PATH):
		return false

	var resource := ResourceLoader.load(HOME_IDLE_V2_PATH)
	if resource == null or not resource is SpriteFrames:
		push_warning("HOME ANIMATION V2 resource is not SpriteFrames: %s" % HOME_IDLE_V2_PATH)
		return false

	var frames := resource as SpriteFrames
	for animation_name in HOME_IDLE_V2_VARIANTS:
		if not frames.has_animation(animation_name):
			push_warning("HOME ANIMATION V2 missing animation: %s" % animation_name)
			return false

	_video_frames = frames
	_video_sprite = AnimatedSprite2D.new()
	_video_sprite.name = "HomeIdleVideoBody"
	_video_sprite.sprite_frames = _video_frames
	_video_sprite.centered = true
	_video_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_video_sprite.material = _meditation_material()
	_video_sprite.animation_finished.connect(_on_video_animation_finished)
	add_child(_video_sprite)

	animation_source = "video_spriteframes_v2"
	runtime_animation_ready = true
	_layout_video_sprite()
	_start_video_variant(0)
	set_process(true)
	return true

func _build_legacy_body() -> void:
	_body = _make_pose("MeditationBody", MEDITATION_FRAME_01)
	_secondary_body = _make_pose("MeditationBodySecondary", MEDITATION_FRAME_04)
	_secondary_body.modulate.a = 0.0
	add_child(_body)
	add_child(_secondary_body)

	runtime_animation_ready = (
		MEDITATION_FRAME_01 != null
		and MEDITATION_FRAME_04 != null
	)
	animation_source = "video_frames_preloaded"
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

func _layout_video_sprite() -> void:
	if not is_instance_valid(_video_sprite) or _video_frames == null:
		return
	var first_variant: StringName = HOME_IDLE_V2_VARIANTS[0]
	if _video_frames.get_frame_count(first_variant) <= 0:
		return
	var first_texture := _video_frames.get_frame_texture(first_variant, 0)
	if first_texture == null:
		return
	var frame_size := first_texture.get_size()
	if frame_size.x <= 0.0 or frame_size.y <= 0.0 or size.x <= 0.0 or size.y <= 0.0:
		return

	var fit_scale := minf(size.x / frame_size.x, size.y / frame_size.y)
	_video_sprite.scale = Vector2.ONE * fit_scale
	# Bottom-center anchoring keeps every sampled pose visually seated on the
	# same cultivation platform instead of making the heroine float.
	_video_sprite.position = Vector2(
		size.x * 0.5,
		size.y - frame_size.y * fit_scale * 0.5
	)

func _start_video_variant(index: int) -> void:
	if not is_instance_valid(_video_sprite) or _video_frames == null:
		return
	if HOME_IDLE_V2_VARIANTS.is_empty():
		return
	_video_variant_index = posmod(index, HOME_IDLE_V2_VARIANTS.size())
	_video_sprite.play(HOME_IDLE_V2_VARIANTS[_video_variant_index])

func _on_video_animation_finished() -> void:
	if not is_instance_valid(_video_sprite):
		return
	_start_video_variant(_video_variant_index + 1)

func _process(delta: float) -> void:
	if not runtime_animation_ready or not visible:
		return

	_time += maxf(0.0, delta)
	var surge_strength := _update_surge(delta)

	if is_instance_valid(_video_sprite):
		# HOME ANIMATION V2 already contains real articulated body movement.
		# Never add whole-image sway/zoom/breathing on top of the video frames.
		position = _base_position
		rotation = 0.0
		scale = _base_scale
		_set_surge(surge_strength)
		return

	# Legacy fallback only.
	var pose_wave := (sin((_time / POSE_CYCLE_SECONDS) * TAU - PI * 0.5) + 1.0) * 0.5
	var eased_pose := pose_wave * pose_wave * (3.0 - 2.0 * pose_wave)
	_secondary_body.modulate.a = eased_pose * SECONDARY_POSE_MAX_ALPHA

	var breath := sin(_time * 1.15)
	position = _base_position
	rotation = 0.0
	scale = Vector2(
		_base_scale.x * (1.0 - breath * 0.00035 + surge_strength * 0.0015),
		_base_scale.y * (1.0 + breath * 0.00115 + surge_strength * 0.0022)
	)
	_set_surge(surge_strength)

func _update_surge(delta: float) -> float:
	if _surge_remaining <= 0.0:
		accent_mode = "none"
		return 0.0

	_surge_remaining = maxf(0.0, _surge_remaining - maxf(delta, 0.0))
	var progress := 1.0 - (_surge_remaining / maxf(_surge_duration, 0.001))
	var strength := pow(sin(progress * PI), 2.0) * _surge_peak
	if _surge_remaining <= 0.0:
		accent_mode = "none"
	return strength

func _set_surge(value: float) -> void:
	_set_canvas_surge(_video_sprite, value)
	_set_canvas_surge(_body, value)
	_set_canvas_surge(_secondary_body, value)

func _set_canvas_surge(item: CanvasItem, value: float) -> void:
	if item != null and item.material is ShaderMaterial:
		(item.material as ShaderMaterial).set_shader_parameter("surge", value)

func _meditation_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;

uniform float surge : hint_range(0.0, 1.6) = 0.0;

void fragment() {
	vec4 tex = texture(TEXTURE, UV);
	float qi = 1.0 + 0.007 * sin(TIME * 0.82 + UV.y * 5.2);
	float focus = 1.0 + surge * 0.095 * (1.0 - smoothstep(0.05, 0.74, distance(UV, vec2(0.5, 0.58))));
	tex.rgb *= qi * focus;
	COLOR = tex;
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	return material
