extends Control

const MODE_CULTIVATION: StringName = &"cultivation"
const MODE_REST: StringName = &"rest"

const CULTIVATION_V2_PATH := "res://art/approved/home/animation_v2/home_cultivation_v2.tres"
const CULTIVATION_V2_VARIANTS := [
	&"cultivation_01",
	&"cultivation_02",
]

const REST_V2_PATH := "res://art/approved/home/animation_v2/home_idle_v2.tres"
const REST_V2_VARIANTS := [
	&"idle_relaxed_01",
	&"idle_relaxed_02",
	&"idle_relaxed_03",
]

const MEDITATION_FRAME_01_PATH := "res://art/approved/home/home_meditation_idle_01.webp"
const MEDITATION_FRAME_04_PATH := "res://art/approved/home/home_meditation_idle_04.webp"
const MEDITATION_FRAME_01: Texture2D = preload("res://art/approved/home/home_meditation_idle_01.webp")
const MEDITATION_FRAME_04: Texture2D = preload("res://art/approved/home/home_meditation_idle_04.webp")

# Safe fallback until each video-derived SpriteFrames resource is present.
const POSE_CYCLE_SECONDS := 5.6
const SECONDARY_POSE_MAX_ALPHA := 0.42

var runtime_animation_ready := false
var animation_mode := "meditation_idle"
var accent_mode := "none"
var animation_source := "video_frames_preloaded"
var source_pose := "meditation"
var home_mode: StringName = MODE_CULTIVATION

var _body: TextureRect
var _secondary_body: TextureRect
var _video_sprite: AnimatedSprite2D
var _mode_frames: Dictionary = {}
var _video_variant_index := 0

var _time := 0.0
var _base_position := Vector2.ZERO
var _base_scale := Vector2.ONE
var _surge_remaining := 0.0
var _surge_duration := 0.0
var _surge_peak := 1.0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	clip_contents = false
	pivot_offset = size * Vector2(0.5, 0.80)
	_base_position = position
	_base_scale = scale
	_build_body()

func _notification(what: int) -> void:
	if what == NOTIFICATION_RESIZED and is_instance_valid(_video_sprite):
		_layout_video_sprite()

func set_home_mode(mode: StringName) -> void:
	var normalized := normalize_home_mode(mode)
	if normalized == home_mode and runtime_animation_ready:
		return
	home_mode = normalized
	_video_variant_index = 0
	_apply_home_mode()

func get_home_mode() -> StringName:
	return home_mode

static func normalize_home_mode(mode: StringName) -> StringName:
	return MODE_REST if mode == MODE_REST else MODE_CULTIVATION

func play_idle() -> void:
	accent_mode = "none"
	_surge_remaining = 0.0
	_surge_duration = 0.0
	_surge_peak = 1.0
	_set_surge(0.0)
	if is_instance_valid(_video_sprite) and _video_sprite.visible and not _video_sprite.is_playing():
		_start_video_variant(_video_variant_index)

func play_surge(duration: float = 1.25, intensity: float = 1.0) -> void:
	accent_mode = "meditation_surge"
	_surge_duration = maxf(0.25, duration)
	_surge_remaining = _surge_duration
	_surge_peak = clampf(intensity, 0.35, 1.6)

func has_runtime_animation() -> bool:
	return runtime_animation_ready

func get_active_idle_variant() -> StringName:
	var variants := _variants_for_mode(home_mode)
	if variants.is_empty():
		return &""
	return variants[posmod(_video_variant_index, variants.size())]

func _build_body() -> void:
	_build_legacy_body()
	_load_mode_resources()
	_build_video_sprite()
	_apply_home_mode()
	set_process(runtime_animation_ready)

func _build_legacy_body() -> void:
	_body = _make_pose("MeditationBody", MEDITATION_FRAME_01)
	_secondary_body = _make_pose("MeditationBodySecondary", MEDITATION_FRAME_04)
	_secondary_body.modulate.a = 0.0
	add_child(_body)
	add_child(_secondary_body)
	runtime_animation_ready = MEDITATION_FRAME_01 != null and MEDITATION_FRAME_04 != null

func _load_mode_resources() -> void:
	_try_load_mode_frames(MODE_CULTIVATION, CULTIVATION_V2_PATH, CULTIVATION_V2_VARIANTS)
	_try_load_mode_frames(MODE_REST, REST_V2_PATH, REST_V2_VARIANTS)

func _try_load_mode_frames(mode: StringName, path: String, variants: Array) -> void:
	if not ResourceLoader.exists(path):
		return
	var resource := ResourceLoader.load(path)
	if resource == null or not resource is SpriteFrames:
		push_warning("Home animation resource is not SpriteFrames: %s" % path)
		return
	var frames := resource as SpriteFrames
	for animation_name in variants:
		if not frames.has_animation(animation_name):
			push_warning("Home animation resource %s missing animation: %s" % [path, animation_name])
			return
	_mode_frames[mode] = frames

func _build_video_sprite() -> void:
	_video_sprite = AnimatedSprite2D.new()
	_video_sprite.name = "HomeVideoBody"
	_video_sprite.centered = true
	_video_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_video_sprite.material = _meditation_material()
	_video_sprite.visible = false
	_video_sprite.animation_finished.connect(_on_video_animation_finished)
	add_child(_video_sprite)

func _apply_home_mode() -> void:
	var frames := _frames_for_mode(home_mode)
	if frames != null:
		_body.visible = false
		_secondary_body.visible = false
		_video_sprite.visible = true
		_video_sprite.sprite_frames = frames
		animation_source = "video_spriteframes_%s" % String(home_mode)
		animation_mode = "cultivation_idle" if home_mode == MODE_CULTIVATION else "rest_idle"
		runtime_animation_ready = true
		_layout_video_sprite()
		_start_video_variant(0)
		return

	if is_instance_valid(_video_sprite):
		_video_sprite.stop()
		_video_sprite.visible = false
	_body.visible = true
	_secondary_body.visible = true
	animation_source = "video_frames_preloaded"
	animation_mode = "meditation_idle" if home_mode == MODE_CULTIVATION else "rest_fallback"
	runtime_animation_ready = MEDITATION_FRAME_01 != null and MEDITATION_FRAME_04 != null

func _frames_for_mode(mode: StringName) -> SpriteFrames:
	var value = _mode_frames.get(mode)
	return value as SpriteFrames if value is SpriteFrames else null

func _variants_for_mode(mode: StringName) -> Array:
	return REST_V2_VARIANTS if mode == MODE_REST else CULTIVATION_V2_VARIANTS

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
	if not is_instance_valid(_video_sprite) or _video_sprite.sprite_frames == null:
		return
	var variants := _variants_for_mode(home_mode)
	if variants.is_empty():
		return
	var first_variant: StringName = variants[0]
	if _video_sprite.sprite_frames.get_frame_count(first_variant) <= 0:
		return
	var first_texture := _video_sprite.sprite_frames.get_frame_texture(first_variant, 0)
	if first_texture == null:
		return
	var frame_size := first_texture.get_size()
	if frame_size.x <= 0.0 or frame_size.y <= 0.0 or size.x <= 0.0 or size.y <= 0.0:
		return

	var fit_scale := minf(size.x / frame_size.x, size.y / frame_size.y)
	_video_sprite.scale = Vector2.ONE * fit_scale
	_video_sprite.position = Vector2(
		size.x * 0.5,
		size.y - frame_size.y * fit_scale * 0.5
	)

func _start_video_variant(index: int) -> void:
	if not is_instance_valid(_video_sprite) or not _video_sprite.visible:
		return
	var variants := _variants_for_mode(home_mode)
	if variants.is_empty():
		return
	_video_variant_index = posmod(index, variants.size())
	_video_sprite.play(variants[_video_variant_index])

func _on_video_animation_finished() -> void:
	if not is_instance_valid(_video_sprite) or not _video_sprite.visible:
		return
	_start_video_variant(_video_variant_index + 1)

func _process(delta: float) -> void:
	if not runtime_animation_ready or not visible:
		return

	_time += maxf(0.0, delta)
	var surge_strength := _update_surge(delta)

	if is_instance_valid(_video_sprite) and _video_sprite.visible:
		# Video source already carries real articulated motion. Never layer
		# whole-character sway/zoom on top of it.
		position = _base_position
		rotation = 0.0
		scale = _base_scale
		_set_surge(surge_strength)
		return

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
