extends TextureRect

const ANIMATION_REGISTRY := preload("res://scripts/character/character_animation_registry.gd")

const APPROVED_MASTER_PATH := "res://art/approved/home/home_hero_standing.webp"

var runtime_animation_ready := false
var animation_mode := "standing_idle"
var animation_source := "none"
var animation_profile := "character_standing_v2_green"
var source_pose := "standing"
var current_frame := 0
var animation_preset_id: StringName = &""

var _video_sprite: AnimatedSprite2D
var _video_frames: SpriteFrames
var _active_animation_name: StringName = &""
var _presentation_active := false
var _time := 0.0
var _base_position := Vector2.ZERO
var _base_scale := Vector2.ONE

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	pivot_offset = size * Vector2(0.5, 0.92)
	_base_position = position
	_base_scale = scale
	_build_video_sprite()
	_load_static_master()

func _notification(what: int) -> void:
	if what == NOTIFICATION_RESIZED and is_instance_valid(_video_sprite):
		_layout_video_sprite()

func has_runtime_animation() -> bool:
	return runtime_animation_ready

func set_presentation_active(active: bool) -> void:
	if active == _presentation_active:
		return
	_presentation_active = active
	if active:
		_start_registered_animation()
	else:
		_release_registered_animation()
		_load_static_master()

func get_presentation_active() -> bool:
	return _presentation_active

func get_animation_preset() -> StringName:
	return animation_preset_id

func set_animation_preset(preset_id: StringName) -> void:
	if ANIMATION_REGISTRY.preset(preset_id).is_empty():
		return
	animation_preset_id = preset_id
	if _presentation_active:
		_start_registered_animation()

func _build_video_sprite() -> void:
	_video_sprite = AnimatedSprite2D.new()
	_video_sprite.name = "CharacterVideoBody"
	_video_sprite.centered = true
	_video_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_video_sprite.visible = false
	_video_sprite.animation_finished.connect(_on_registered_animation_finished)
	add_child(_video_sprite)

func _load_static_master() -> void:
	if ResourceLoader.exists(APPROVED_MASTER_PATH):
		texture = ResourceLoader.load(APPROVED_MASTER_PATH) as Texture2D
		animation_source = "procedural_approved_master"
		runtime_animation_ready = texture != null
		if runtime_animation_ready:
			material = _standing_idle_material()
			set_process(true)
			return
	texture = null
	material = null
	animation_source = "none"
	runtime_animation_ready = false
	set_process(false)

func _start_registered_animation() -> void:
	var available := ANIMATION_REGISTRY.available_presets()
	if available.is_empty():
		_load_static_master()
		return

	if animation_preset_id == &"" or ANIMATION_REGISTRY.preset(animation_preset_id).is_empty():
		animation_preset_id = StringName(available[0].get("id", &""))

	var entry := ANIMATION_REGISTRY.preset(animation_preset_id)
	var path := str(entry.get("resource_path", ""))
	if path.is_empty() or not ResourceLoader.exists(path):
		animation_preset_id = StringName(available[0].get("id", &""))
		entry = ANIMATION_REGISTRY.preset(animation_preset_id)
		path = str(entry.get("resource_path", ""))

	_release_registered_animation()
	var loaded := ResourceLoader.load(path, "", ResourceLoader.CACHE_MODE_IGNORE_DEEP)
	if loaded == null or not loaded is SpriteFrames:
		_load_static_master()
		return

	var animation_name: StringName = entry.get("animation_name", &"")
	var frames := loaded as SpriteFrames
	if animation_name == &"" or not frames.has_animation(animation_name):
		_load_static_master()
		return

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

func _on_registered_animation_finished() -> void:
	if not _presentation_active:
		return
	var next_id := ANIMATION_REGISTRY.next_preset_id(animation_preset_id)
	if next_id == &"":
		return
	animation_preset_id = next_id
	_start_registered_animation()

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

func _process(delta: float) -> void:
	if not visible or not runtime_animation_ready or _presentation_active:
		return
	_time += delta
	# Static fallback only. Registered videos contain real articulated motion.
	var breath := sin(_time * 1.06)
	position = _base_position
	rotation = 0.0
	scale = Vector2(
		_base_scale.x * (1.0 - breath * 0.00045),
		_base_scale.y * (1.0 + breath * 0.00135)
	)

func _standing_idle_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;

void fragment() {
	vec2 uv = UV;
	float lateral = abs(uv.x - 0.5);
	float hair_mask =
		smoothstep(0.07, 0.20, uv.y)
		* (1.0 - smoothstep(0.66, 0.84, uv.y))
		* smoothstep(0.15, 0.29, lateral);
	float sleeve_mask =
		smoothstep(0.29, 0.43, uv.y)
		* (1.0 - smoothstep(0.73, 0.88, uv.y))
		* smoothstep(0.12, 0.27, lateral);
	float silk_mask =
		smoothstep(0.49, 0.94, uv.y)
		* smoothstep(0.09, 0.22, lateral);
	float torso_mask =
		smoothstep(0.23, 0.31, uv.y)
		* (1.0 - smoothstep(0.50, 0.61, uv.y))
		* (1.0 - smoothstep(0.19, 0.30, lateral));

	float hair_wave = sin(TIME * 0.63 + uv.y * 8.2 - uv.x * 4.6);
	float sleeve_wave = sin(TIME * 0.76 + uv.y * 7.4 + uv.x * 4.1 + 0.8);
	float silk_wave = sin(TIME * 0.82 + uv.y * 10.0 + uv.x * 3.2 + 1.4);
	float breath = sin(TIME * 1.08);

	uv.x += hair_wave * 0.00195 * hair_mask;
	uv.x += sleeve_wave * 0.00145 * sleeve_mask;
	uv.x += silk_wave * 0.00275 * silk_mask;
	uv.y += breath * 0.00055 * torso_mask;

	vec4 tex = texture(TEXTURE, clamp(uv, vec2(0.001), vec2(0.999)));
	float shimmer =
		1.0
		+ 0.010 * sin(TIME * 0.90 + uv.y * 5.2)
		+ 0.004 * sin(TIME * 0.37 + uv.x * 6.0);
	tex.rgb *= shimmer;
	COLOR = tex;
}
"""
	var shader_material := ShaderMaterial.new()
	shader_material.shader = shader
	return shader_material
