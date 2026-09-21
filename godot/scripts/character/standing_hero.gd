extends TextureRect

const IDLE_ATLAS_PATH := "res://art/approved/character/standing_idle_atlas.webp"
const FALLBACK_PATH := "res://art/approved/home/home_hero_standing.webp"
const FRAME_SIZE := Vector2(200.0, 300.0)
const COLUMNS := 6
const FRAME_COUNT := 30
const FPS := 12.0

var runtime_animation_ready := false
var animation_mode := "standing_idle"
var animation_source := "none"
var source_pose := "standing"
var current_frame := 0

var _atlas_region: AtlasTexture
var _time := 0.0
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
			animation_source = "atlas_30f"
			runtime_animation_ready = true
			_set_frame(0)
			set_process(true)
			return

	if ResourceLoader.exists(FALLBACK_PATH):
		texture = ResourceLoader.load(FALLBACK_PATH) as Texture2D
		animation_source = "procedural"
		runtime_animation_ready = true
		material = _standing_idle_material()
		set_process(true)
		return

	animation_source = "none"
	runtime_animation_ready = false
	set_process(false)

func _process(delta: float) -> void:
	if not visible or not runtime_animation_ready:
		return

	_time += delta
	if _atlas_region != null:
		var next_frame := int(floor(_time * FPS)) % FRAME_COUNT
		if next_frame != current_frame:
			_set_frame(next_frame)
		return

	# Standing showcase motion: a slow weight shift plus breathing. Hair and silk
	# motion stays local to the shader so the face and feet do not visibly swim.
	var breath := sin(_time * 1.06)
	var weight_shift := sin(_time * 0.48 + 0.7)
	var micro := sin(_time * 0.23 + 1.9)

	position = _base_position + Vector2(weight_shift * 1.45 + micro * 0.35, breath * 1.25)
	rotation = deg_to_rad(weight_shift * 0.16)
	scale = Vector2(
		_base_scale.x * (1.0 + breath * 0.0028),
		_base_scale.y * (1.0 + breath * 0.0048)
	)

func _set_frame(frame_index: int) -> void:
	current_frame = clampi(frame_index, 0, FRAME_COUNT - 1)
	var column := current_frame % COLUMNS
	var row := floori(float(current_frame) / float(COLUMNS))
	_atlas_region.region = Rect2(
		float(column) * FRAME_SIZE.x,
		float(row) * FRAME_SIZE.y,
		FRAME_SIZE.x,
		FRAME_SIZE.y
	)

func _standing_idle_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;

void fragment() {
	vec2 uv = UV;

	float hair_mask =
		smoothstep(0.06, 0.24, uv.y)
		* (1.0 - smoothstep(0.72, 0.90, uv.y))
		* smoothstep(0.13, 0.32, abs(uv.x - 0.5));
	float silk_mask = smoothstep(0.43, 0.96, uv.y);
	float torso_mask =
		smoothstep(0.18, 0.31, uv.y)
		* (1.0 - smoothstep(0.51, 0.66, uv.y));

	float hair_wave = sin(TIME * 0.63 + uv.y * 8.0 - uv.x * 4.5);
	float silk_wave = sin(TIME * 0.78 + uv.y * 9.8 + uv.x * 3.0);
	float breath = sin(TIME * 1.06);

	uv.x += hair_wave * 0.00145 * hair_mask;
	uv.x += silk_wave * 0.00225 * silk_mask;
	uv.y += breath * 0.00115 * torso_mask;

	vec4 tex = texture(TEXTURE, uv);
	float shimmer = 1.0 + 0.012 * sin(TIME * 0.92 + uv.y * 5.5);
	tex.rgb *= shimmer;
	COLOR = tex;
}
"""
	var shader_material := ShaderMaterial.new()
	shader_material.shader = shader
	return shader_material
