extends Control

const ANIMATION_REGISTRY := preload("res://scripts/home/home_animation_registry.gd")

const MODE_CULTIVATION: StringName = &"cultivation"
const MODE_REST: StringName = &"rest"

const MOTION_STILL: StringName = &"still"
const MOTION_ANIMATED: StringName = &"animated"
const MOTION_HIDDEN: StringName = &"hidden"

const MAX_ANIMATION_CACHE_RESOURCES := 2

const MEDITATION_FRAME_01_PATH := "res://art/approved/home/home_meditation_idle_01.webp"
const MEDITATION_FRAME_04_PATH := "res://art/approved/home/home_meditation_idle_04.webp"
const MEDITATION_FRAME_01: Texture2D = preload("res://art/approved/home/home_meditation_idle_01.webp")
const MEDITATION_FRAME_04: Texture2D = preload("res://art/approved/home/home_meditation_idle_04.webp")

var runtime_animation_ready := false
var animation_mode := "cultivation_still"
var accent_mode := "none"
var animation_source := "still_fallback"
var source_pose := "meditation"
var home_mode: StringName = MODE_CULTIVATION
var motion_mode: StringName = MOTION_STILL
var animation_preset_id: StringName = &"cultivation_01"

var _still_body: TextureRect
var _video_sprite: AnimatedSprite2D
var _video_frames: SpriteFrames
var _loaded_resource_path := ""
var _active_animation_name: StringName = &""

# Runtime owns a tiny, explicit cache instead of preloading every atlas. Static
# and hidden modes clear it completely; animated mode keeps at most the current
# and one recently used SpriteFrames resource.
var _animation_cache: Dictionary = {}
var _animation_cache_order: Array[String] = []

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
	animation_preset_id = ANIMATION_REGISTRY.default_preset_id(home_mode)
	_build_body()

func _notification(what: int) -> void:
	if what == NOTIFICATION_RESIZED and is_instance_valid(_video_sprite):
		_layout_video_sprite()

func set_home_mode(mode: StringName) -> void:
	var normalized := normalize_home_mode(mode)
	if normalized == home_mode:
		return
	home_mode = normalized
	if ANIMATION_REGISTRY.preset_for_mode(animation_preset_id, home_mode).is_empty():
		animation_preset_id = ANIMATION_REGISTRY.default_preset_id(home_mode)
	_apply_presentation()

func get_home_mode() -> StringName:
	return home_mode

func set_motion_mode(mode: StringName) -> void:
	var normalized := normalize_motion_mode(mode)
	if normalized == motion_mode:
		return
	motion_mode = normalized
	_apply_presentation()

func get_motion_mode() -> StringName:
	return motion_mode

func set_animation_preset(preset_id: StringName) -> void:
	var entry := ANIMATION_REGISTRY.preset_for_mode(preset_id, home_mode)
	if entry.is_empty():
		return
	if preset_id == animation_preset_id:
		return
	animation_preset_id = preset_id
	if motion_mode == MOTION_ANIMATED:
		_apply_presentation()

func get_animation_preset() -> StringName:
	return animation_preset_id

static func normalize_home_mode(mode: StringName) -> StringName:
	return MODE_REST if mode == MODE_REST else MODE_CULTIVATION

static func normalize_motion_mode(mode: StringName) -> StringName:
	if mode == MOTION_ANIMATED:
		return MOTION_ANIMATED
	if mode == MOTION_HIDDEN:
		return MOTION_HIDDEN
	return MOTION_STILL

func play_idle() -> void:
	accent_mode = "none"
	_surge_remaining = 0.0
	_surge_duration = 0.0
	_surge_peak = 1.0
	_set_surge(0.0)
	if motion_mode == MOTION_ANIMATED and is_instance_valid(_video_sprite) and _video_sprite.visible and not _video_sprite.is_playing():
		_play_selected_animation()

func play_surge(duration: float = 1.25, intensity: float = 1.0) -> void:
	# Static means truly static: character pixels do not pulse/breathe until the
	# player explicitly chooses Động. Scene-level aura/VFX remain independent.
	if motion_mode != MOTION_ANIMATED:
		return
	accent_mode = "meditation_surge"
	_surge_duration = maxf(0.25, duration)
	_surge_remaining = _surge_duration
	_surge_peak = clampf(intensity, 0.35, 1.6)

func has_runtime_animation() -> bool:
	return runtime_animation_ready

func get_active_idle_variant() -> StringName:
	return _active_animation_name

func get_cached_animation_resource_count() -> int:
	return _animation_cache.size()

func _build_body() -> void:
	_still_body = TextureRect.new()
	_still_body.name = "HomeStillBody"
	_still_body.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_still_body.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_still_body.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_still_body.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_still_body.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_still_body.material = _meditation_material()
	add_child(_still_body)

	_video_sprite = AnimatedSprite2D.new()
	_video_sprite.name = "HomeVideoBody"
	_video_sprite.centered = true
	_video_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_video_sprite.material = _meditation_material()
	_video_sprite.visible = false
	_video_sprite.animation_finished.connect(_on_video_animation_finished)
	add_child(_video_sprite)

	_apply_presentation()
	set_process(true)

func _apply_presentation() -> void:
	position = _base_position
	rotation = 0.0
	scale = _base_scale

	if motion_mode == MOTION_HIDDEN:
		visible = false
		_release_active_animation(true)
		animation_mode = "hidden"
		animation_source = "hidden"
		runtime_animation_ready = true
		return

	visible = true
	if motion_mode == MOTION_STILL:
		_release_active_animation(true)
		_video_sprite.visible = false
		_still_body.visible = true
		_still_body.texture = _load_still_texture(home_mode)
		animation_mode = "cultivation_still" if home_mode == MODE_CULTIVATION else "rest_still"
		animation_source = "still_v3" if _still_path_exists(home_mode) else "still_fallback"
		runtime_animation_ready = _still_body.texture != null
		return

	_still_body.visible = false
	if _load_selected_animation():
		_video_sprite.visible = true
		animation_mode = "cultivation_idle" if home_mode == MODE_CULTIVATION else "rest_idle"
		runtime_animation_ready = true
		_layout_video_sprite()
		_play_selected_animation()
	else:
		# Missing local binary resources must not make Home blank.
		_release_active_animation(true)
		_video_sprite.visible = false
		_still_body.visible = true
		_still_body.texture = _load_still_texture(home_mode)
		animation_mode = "cultivation_still_fallback" if home_mode == MODE_CULTIVATION else "rest_still_fallback"
		animation_source = "animated_missing_fallback_still"
		runtime_animation_ready = _still_body.texture != null

func _load_still_texture(mode: StringName) -> Texture2D:
	var path := ANIMATION_REGISTRY.still_path(mode)
	if ResourceLoader.exists(path):
		var loaded := ResourceLoader.load(path)
		if loaded is Texture2D:
			return loaded as Texture2D
	return MEDITATION_FRAME_01 if mode == MODE_CULTIVATION else MEDITATION_FRAME_04

func _still_path_exists(mode: StringName) -> bool:
	return ResourceLoader.exists(ANIMATION_REGISTRY.still_path(mode))

func _load_selected_animation() -> bool:
	var entry := ANIMATION_REGISTRY.preset_for_mode(animation_preset_id, home_mode)
	if entry.is_empty():
		animation_preset_id = ANIMATION_REGISTRY.default_preset_id(home_mode)
		entry = ANIMATION_REGISTRY.preset_for_mode(animation_preset_id, home_mode)
	if entry.is_empty():
		return false

	var resource_path := ANIMATION_REGISTRY.resolved_resource_path(entry)
	if resource_path.is_empty():
		return false
	var animation_name: StringName = entry.get("animation_name", &"")
	if animation_name == &"":
		return false

	var frames: SpriteFrames = null
	if _animation_cache.has(resource_path):
		frames = _animation_cache[resource_path] as SpriteFrames
	else:
		var resource := ResourceLoader.load(resource_path, "", ResourceLoader.CACHE_MODE_IGNORE)
		if resource == null or not resource is SpriteFrames:
			push_warning("Home animation resource is not SpriteFrames: %s" % resource_path)
			return false
		frames = resource as SpriteFrames
		_animation_cache[resource_path] = frames
		_touch_animation_cache(resource_path)
		_trim_animation_cache(resource_path)

	if frames == null or not frames.has_animation(animation_name):
		push_warning("Home preset %s missing animation %s in %s" % [animation_preset_id, animation_name, resource_path])
		return false

	_video_frames = frames
	_loaded_resource_path = resource_path
	_active_animation_name = animation_name
	_video_sprite.sprite_frames = frames

	var primary_path := str(entry.get("resource_path", ""))
	animation_source = "video_spriteframes_split" if resource_path == primary_path else "video_spriteframes_v3_fallback"
	_touch_animation_cache(resource_path)
	return true

func _touch_animation_cache(resource_path: String) -> void:
	var existing := _animation_cache_order.find(resource_path)
	if existing >= 0:
		_animation_cache_order.remove_at(existing)
	_animation_cache_order.append(resource_path)

func _trim_animation_cache(current_path: String) -> void:
	while _animation_cache_order.size() > MAX_ANIMATION_CACHE_RESOURCES:
		var evict_path := _animation_cache_order.pop_front()
		if evict_path == current_path:
			_animation_cache_order.append(evict_path)
			continue
		_animation_cache.erase(evict_path)

func _release_active_animation(clear_cache: bool) -> void:
	if is_instance_valid(_video_sprite):
		_video_sprite.stop()
		_video_sprite.visible = false
		_video_sprite.sprite_frames = null
	_video_frames = null
	_loaded_resource_path = ""
	_active_animation_name = &""
	if clear_cache:
		_animation_cache.clear()
		_animation_cache_order.clear()

func _layout_video_sprite() -> void:
	if not is_instance_valid(_video_sprite) or _video_sprite.sprite_frames == null or _active_animation_name == &"":
		return
	if _video_sprite.sprite_frames.get_frame_count(_active_animation_name) <= 0:
		return
	var first_texture := _video_sprite.sprite_frames.get_frame_texture(_active_animation_name, 0)
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

func _play_selected_animation() -> void:
	if motion_mode != MOTION_ANIMATED or not is_instance_valid(_video_sprite) or not _video_sprite.visible:
		return
	if _video_sprite.sprite_frames == null or _active_animation_name == &"":
		return
	_video_sprite.play(_active_animation_name)

func _on_video_animation_finished() -> void:
	if motion_mode != MOTION_ANIMATED or not is_instance_valid(_video_sprite) or not _video_sprite.visible:
		return
	# Compatibility V3 resources are non-looping. Explicitly restart the chosen
	# preset rather than rotating through every atlas behind the player's back.
	_play_selected_animation()

func _process(delta: float) -> void:
	if not runtime_animation_ready or motion_mode != MOTION_ANIMATED:
		return
	var surge_strength := _update_surge(delta)
	if is_instance_valid(_video_sprite) and _video_sprite.visible:
		position = _base_position
		rotation = 0.0
		scale = _base_scale
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
	_set_canvas_surge(_still_body, value)

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
	float focus = 1.0 + surge * 0.095 * (1.0 - smoothstep(0.05, 0.74, distance(UV, vec2(0.5, 0.58))));
	tex.rgb *= focus;
	COLOR = tex;
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	return material
