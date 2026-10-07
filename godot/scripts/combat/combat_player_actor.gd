extends Control
class_name CombatPlayerActor

const REGISTRY := preload("res://scripts/combat/combat_player_animation_registry.gd")
const FALLBACK := preload("res://scripts/combat/combat_actor_placeholder.gd")

var _fallback: CombatActorPlaceholder
var _sprite: AnimatedSprite2D
var _main_dao_id := ""
var _current_skill_id := ""
var _active_resource_path := ""
var _active_preset: Dictionary = {}

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	clip_contents = false
	_fallback = FALLBACK.new()
	_fallback.name = "CombatPlayerFallback"
	_fallback.enemy = false
	_fallback.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(_fallback)
	_sprite = AnimatedSprite2D.new()
	_sprite.name = "CombatPlayerAnimatedSprite"
	_sprite.centered = true
	_sprite.visible = false
	_sprite.z_index = 1
	_sprite.animation_finished.connect(_on_animation_finished)
	add_child(_sprite)
	resized.connect(_layout_sprite)

func bind_dao(dao_id: String) -> void:
	_main_dao_id = dao_id
	_current_skill_id = ""
	_active_resource_path = ""
	_active_preset.clear()
	if not _play_preset(REGISTRY.idle_preset(dao_id), true):
		_show_fallback()

func play_skill(skill_id: String) -> bool:
	var preset := REGISTRY.skill_preset(_main_dao_id, skill_id)
	if preset.is_empty():
		return false
	_current_skill_id = skill_id
	if not _play_preset(preset, false):
		_current_skill_id = ""
		return false
	return true

func reset_to_idle() -> void:
	_current_skill_id = ""
	if not _play_preset(REGISTRY.idle_preset(_main_dao_id), true):
		_show_fallback()

func current_skill_id() -> String:
	return _current_skill_id

func using_candidate_animation() -> bool:
	return _sprite != null and _sprite.visible and _sprite.sprite_frames != null

func active_resource_path() -> String:
	return _active_resource_path

func attack_anchor_global() -> Vector2:
	# Keep the launch point stable even when source-video framing changes.
	return global_position + Vector2(size.x * 0.70, size.y * 0.40)

func body_center_global() -> Vector2:
	return global_position + Vector2(size.x * 0.50, size.y * 0.56)

func _play_preset(preset: Dictionary, _idle: bool) -> bool:
	if preset.is_empty() or _sprite == null:
		return false
	var resource_path := str(preset.get("resource_path", ""))
	var animation_name := StringName(preset.get("animation_name", &""))
	if resource_path.is_empty() or animation_name == &"" or not ResourceLoader.exists(resource_path):
		return false
	var frames := ResourceLoader.load(resource_path) as SpriteFrames
	if frames == null or not frames.has_animation(animation_name):
		return false
	_active_preset = preset.duplicate(true)
	_sprite.sprite_frames = frames
	_sprite.animation = animation_name
	_sprite.speed_scale = maxf(0.01, float(preset.get("speed_scale", 1.0)))
	_sprite.frame = 0
	_sprite.visible = true
	_fallback.visible = false
	_active_resource_path = resource_path
	_layout_sprite()
	_sprite.play()
	return true

func _show_fallback() -> void:
	_active_resource_path = ""
	_active_preset.clear()
	if _sprite != null:
		_sprite.stop()
		_sprite.sprite_frames = null
		_sprite.visible = false
	if _fallback != null:
		_fallback.visible = true

func _layout_sprite() -> void:
	if _sprite == null or not _sprite.visible or _sprite.sprite_frames == null:
		return
	var animation_name := _sprite.animation
	if not _sprite.sprite_frames.has_animation(animation_name):
		return
	if _sprite.sprite_frames.get_frame_count(animation_name) <= 0:
		return
	var texture := _sprite.sprite_frames.get_frame_texture(animation_name, 0)
	if texture == null:
		return
	var texture_size := texture.get_size()
	if texture_size.x <= 0.0 or texture_size.y <= 0.0:
		return
	var usable := Vector2(maxf(1.0, size.x * 0.98), maxf(1.0, size.y * 0.98))
	var fit_scale := minf(usable.x / texture_size.x, usable.y / texture_size.y)
	fit_scale *= clampf(float(_active_preset.get("visual_scale", 1.0)), 0.75, 1.20)
	fit_scale = maxf(0.01, fit_scale)
	_sprite.scale = Vector2.ONE * fit_scale
	# All clips share one bottom-center placement. Apparent body size is calibrated
	# by visual_scale instead of moving the feet between skills.
	_sprite.position = Vector2(size.x * 0.5, size.y - texture_size.y * fit_scale * 0.5)

func _on_animation_finished() -> void:
	if _current_skill_id.is_empty():
		return
	reset_to_idle()
