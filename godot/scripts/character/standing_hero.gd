extends TextureRect

const IDLE_ATLAS_PATH := "res://art/approved/character/standing_idle_atlas.webp"
const FALLBACK_PATH := "res://art/approved/home/home_hero_standing.webp"
const FRAME_SIZE := Vector2(200.0, 300.0)
const COLUMNS := 6
const FRAME_COUNT := 30
const FPS := 12.0

var runtime_animation_ready := false
var animation_mode := "static"

var _atlas_region: AtlasTexture
var _time := 0.0
var _frame := -1
var _base_position := Vector2.ZERO
var _base_scale := Vector2.ONE

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	pivot_offset = size * Vector2(0.5, 0.68)
	_base_position = position
	_base_scale = scale
	_load_visual()

func has_runtime_animation() -> bool:
	return runtime_animation_ready

func _load_visual() -> void:
	if ResourceLoader.exists(IDLE_ATLAS_PATH):
		var atlas_texture := ResourceLoader.load(IDLE_ATLAS_PATH) as Texture2D
		if atlas_texture != null:
			_atlas_region = AtlasTexture.new()
			_atlas_region.atlas = atlas_texture
			texture = _atlas_region
			animation_mode = "atlas"
			runtime_animation_ready = true
			_set_frame(0)
			set_process(true)
			return

	if ResourceLoader.exists(FALLBACK_PATH):
		texture = ResourceLoader.load(FALLBACK_PATH) as Texture2D
		_enable_procedural_idle()
		return

	animation_mode = "static"
	runtime_animation_ready = false
	set_process(false)

func _enable_procedural_idle() -> void:
	animation_mode = "procedural"
	runtime_animation_ready = true
	material = _idle_material()
	set_process(true)

func _process(delta: float) -> void:
	if not visible or not runtime_animation_ready:
		return
	_time += delta
	if _atlas_region != null:
		var next_frame := int(floor(_time * FPS)) % FRAME_COUNT
		if next_frame != _frame:
			_set_frame(next_frame)
		return

	# Production fallback while the frame atlas is optional: preserve the face,
	# animate the whole-body silhouette with a slow breathing/sway cadence, and
	# let the shader carry the hair/silk motion. This is intentionally stronger
	# than the old 2 px Home bob so it reads as an idle animation at 390x844.
	var breath := sin(_time * 1.12)
	var sway := sin(_time * 0.72 + 0.45)
	position = _base_position + Vector2(sway * 2.4, breath * 2.0)
	rotation = deg_to_rad(sway * 0.32)
	scale = Vector2(
		_base_scale.x * (1.0 + breath * 0.0045),
		_base_scale.y * (1.0 + breath * 0.0075)
	)

func _set_frame(frame_index: int) -> void:
	_frame = clampi(frame_index, 0, FRAME_COUNT - 1)
	var column := _frame % COLUMNS
	var row := floori(float(_frame) / float(COLUMNS))
	_atlas_region.region = Rect2(
		float(column) * FRAME_SIZE.x,
		float(row) * FRAME_SIZE.y,
		FRAME_SIZE.x,
		FRAME_SIZE.y
	)

func _idle_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;

uniform float cloth_sway : hint_range(0.0, 0.01) = 0.0032;
uniform float upper_sway : hint_range(0.0, 0.005) = 0.0011;

void fragment() {
	vec2 uv = UV;
	float lower_mask = smoothstep(0.38, 1.0, uv.y);
	float upper_mask = smoothstep(0.12, 0.72, uv.y) * (1.0 - smoothstep(0.72, 0.94, uv.y));
	float lower_wave = sin(TIME * 0.92 + uv.y * 7.5) * cloth_sway * lower_mask;
	float upper_wave = sin(TIME * 0.58 + uv.y * 4.0 + 0.8) * upper_sway * upper_mask;
	uv.x += lower_wave + upper_wave;
	vec4 tex = texture(TEXTURE, uv);
	float shimmer = 1.0 + 0.018 * sin(TIME * 1.05 + uv.y * 5.0);
	tex.rgb *= shimmer;
	COLOR = tex;
}
"""
	var shader_material := ShaderMaterial.new()
	shader_material.shader = shader
	return shader_material
