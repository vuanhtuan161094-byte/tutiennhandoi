extends TextureRect

const ANIMATION_REGISTRY := preload("res://scripts/character/character_animation_registry.gd")

const MOTION_STILL: StringName = &"still"
const MOTION_ANIMATED: StringName = &"animated"
const MOTION_HIDDEN: StringName = &"hidden"

const APPROVED_MASTER_PATH := "res://art/approved/home/home_hero_standing.webp"

var runtime_animation_ready := false
var animation_mode := "standing_still"
var animation_source := "none"
var animation_profile := "character_standing_v3_options"
var source_pose := "standing"
var current_frame := 0
var animation_preset_id: StringName = &"character_idle_01"
var motion_mode: StringName = MOTION_STILL
var presentation_active := false

var _video_sprite: AnimatedSprite2D
var _video_frames: SpriteFrames
var _active_animation_name: StringName = &""
var _pending_resource_path := ""
var _pending_animation_name: StringName = &""
var _pending_preset_id: StringName = &""
var _thread_loading := false

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	pivot_offset = size * Vector2(0.5, 0.92)
	if ANIMATION_REGISTRY.preset(animation_preset_id).is_empty():
		animation_preset_id = ANIMATION_REGISTRY.default_preset_id()
	_build_video_sprite()
	_apply_presentation()

func _notification(what: int) -> void:
	if what == NOTIFICATION_RESIZED and is_instance_valid(_video_sprite):
		_layout_video_sprite()

func has_runtime_animation() -> bool:
	return runtime_animation_ready

func set_presentation_active(active: bool) -> void:
	if active == presentation_active:
		return
	presentation_active = active
	_apply_presentation()

func get_presentation_active() -> bool:
	return presentation_active

func set_motion_mode(mode: StringName) -> void:
	var normalized := normalize_motion_mode(mode)
	if normalized == motion_mode:
		return
	motion_mode = normalized
	_apply_presentation()

func get_motion_mode() -> StringName:
	return motion_mode

static func normalize_motion_mode(mode: StringName) -> StringName:
	if mode == MOTION_ANIMATED:
		return MOTION_ANIMATED
	if mode == MOTION_HIDDEN:
		return MOTION_HIDDEN
	return MOTION_STILL

func get_animation_preset() -> StringName:
	return animation_preset_id

func set_animation_preset(preset_id: StringName) -> void:
	if ANIMATION_REGISTRY.preset(preset_id).is_empty():
		return
	if preset_id == animation_preset_id:
		return
	animation_preset_id = preset_id
	if presentation_active:
		_apply_presentation()

func _build_video_sprite() -> void:
	_video_sprite = AnimatedSprite2D.new()
	_video_sprite.name = "CharacterVideoBody"
	_video_sprite.centered = true
	_video_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_video_sprite.visible = false
	_video_sprite.animation_finished.connect(_on_registered_animation_finished)
	add_child(_video_sprite)

func _apply_presentation() -> void:
	_release_registered_animation()
	_clear_pending_request()

	if not presentation_active:
		visible = true
		_load_selected_still()
		return

	if motion_mode == MOTION_HIDDEN:
		visible = false
		texture = null
		material = null
		animation_source = "hidden"
		animation_mode = "hidden"
		runtime_animation_ready = true
		set_process(false)
		return

	visible = true
	if motion_mode == MOTION_STILL:
		_load_selected_still()
		return

	# Animated mode keeps the current still visible while the selected atlas is
	# decoded off the main thread. Only one SpriteFrames resource becomes active.
	_load_selected_still()
	_queue_registered_animation()

func _load_selected_still() -> void:
	var still_path := ANIMATION_REGISTRY.still_path(animation_preset_id)
	var still_texture: Texture2D = null
	if not still_path.is_empty() and ResourceLoader.exists(still_path):
		var loaded_still: Resource = ResourceLoader.load(still_path)
		if loaded_still is Texture2D:
			still_texture = loaded_still as Texture2D

	if still_texture == null and ResourceLoader.exists(APPROVED_MASTER_PATH):
		var fallback: Resource = ResourceLoader.load(APPROVED_MASTER_PATH)
		if fallback is Texture2D:
			still_texture = fallback as Texture2D

	texture = still_texture
	material = null
	animation_source = "preset_still" if not still_path.is_empty() and still_texture != null else "approved_master_still"
	animation_mode = "standing_still"
	runtime_animation_ready = still_texture != null
	set_process(false)

func _queue_registered_animation() -> void:
	if not presentation_active or motion_mode != MOTION_ANIMATED:
		return
	var entry: Dictionary = ANIMATION_REGISTRY.preset(animation_preset_id)
	if entry.is_empty():
		return

	var path := str(entry.get("resource_path", ""))
	var animation_name: StringName = entry.get("animation_name", &"")
	if path.is_empty() or animation_name == &"" or not ResourceLoader.exists(path):
		return

	_pending_resource_path = path
	_pending_animation_name = animation_name
	_pending_preset_id = animation_preset_id
	var request_error: int = ResourceLoader.load_threaded_request(
		path,
		"",
		false,
		ResourceLoader.CACHE_MODE_IGNORE_DEEP
	)
	if request_error != OK:
		_clear_pending_request()
		return

	_thread_loading = true
	set_process(true)

func _poll_threaded_animation() -> void:
	if not _thread_loading or _pending_resource_path.is_empty():
		return

	var status: int = ResourceLoader.load_threaded_get_status(_pending_resource_path)
	if status == ResourceLoader.THREAD_LOAD_IN_PROGRESS:
		return

	if status != ResourceLoader.THREAD_LOAD_LOADED:
		_clear_pending_request()
		return

	var loaded: Resource = ResourceLoader.load_threaded_get(_pending_resource_path)
	var pending_animation: StringName = _pending_animation_name
	var pending_preset: StringName = _pending_preset_id
	_clear_pending_request()

	if (
		not presentation_active
		or motion_mode != MOTION_ANIMATED
		or pending_preset != animation_preset_id
		or loaded == null
		or not loaded is SpriteFrames
	):
		return

	var frames := loaded as SpriteFrames
	if not frames.has_animation(pending_animation):
		return

	_apply_loaded_animation(frames, pending_animation)

func _apply_loaded_animation(frames: SpriteFrames, animation_name: StringName) -> void:
	_release_registered_animation()
	texture = null
	material = null
	_video_frames = frames
	_active_animation_name = animation_name
	_video_sprite.sprite_frames = frames
	_video_sprite.visible = true
	animation_source = "video_spriteframes_v2_green"
	animation_mode = "standing_video"
	runtime_animation_ready = true
	_layout_video_sprite()
	_video_sprite.play(animation_name)
	set_process(false)

func _release_registered_animation() -> void:
	if not is_instance_valid(_video_sprite):
		return
	_video_sprite.stop()
	_video_sprite.visible = false
	_video_sprite.sprite_frames = null
	_video_frames = null
	_active_animation_name = &""

func _clear_pending_request() -> void:
	_pending_resource_path = ""
	_pending_animation_name = &""
	_pending_preset_id = &""
	_thread_loading = false
	set_process(false)

func _on_registered_animation_finished() -> void:
	if (
		presentation_active
		and motion_mode == MOTION_ANIMATED
		and is_instance_valid(_video_sprite)
		and _video_sprite.visible
		and _active_animation_name != &""
	):
		_video_sprite.play(_active_animation_name)

func _layout_video_sprite() -> void:
	if not is_instance_valid(_video_sprite) or _video_sprite.sprite_frames == null or _active_animation_name == &"":
		return
	if _video_sprite.sprite_frames.get_frame_count(_active_animation_name) <= 0:
		return

	var first_texture: Texture2D = _video_sprite.sprite_frames.get_frame_texture(_active_animation_name, 0)
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

func _process(_delta: float) -> void:
	if _thread_loading:
		_poll_threaded_animation()
