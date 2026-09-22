extends TextureRect

const IDLE_ATLAS_PATH := "res://art/approved/character/standing_idle_atlas.webp"
const IDLE_ATLAS_PACK_PATH := "res://art/approved/character/standing_idle/standing_idle_atlas.webp"
const APPROVED_MASTER_PATH := "res://art/approved/home/home_hero_standing.webp"
const COLUMNS := 6
const ROWS := 5
const FRAME_COUNT := 30
const FPS := 12.0

var runtime_animation_ready := false
var animation_mode := "standing_idle"
var animation_source := "none"
var animation_profile := "character_standing_v1"
var source_pose := "standing"
var current_frame := 0

var _atlas_region: AtlasTexture
var _frame_size := Vector2(200.0, 300.0)
var _time := 0.0
var _base_position := Vector2.ZERO
var _base_scale := Vector2.ONE

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	# Anchor procedural breathing near the feet. Moving around a torso pivot made
	# the static master look like it was floating instead of standing.
	pivot_offset = size * Vector2(0.5, 0.92)
	_base_position = position
	_base_scale = scale
	_load_visual()

func has_runtime_animation() -> bool:
	return runtime_animation_ready

func _load_visual() -> void:
	var atlas_path := ""
	for candidate in [IDLE_ATLAS_PATH, IDLE_ATLAS_PACK_PATH]:
		if ResourceLoader.exists(candidate):
			atlas_path = candidate
			break

	# A hand-authored atlas remains the highest-fidelity source when one is
	# approved later. Character is not blocked on it: the approved standing
	# master has its own production procedural idle below.
	if atlas_path != "":
		var atlas_texture := ResourceLoader.load(atlas_path) as Texture2D
		if atlas_texture != null:
			var atlas_size := atlas_texture.get_size()
			if atlas_size.x >= COLUMNS and atlas_size.y >= ROWS:
				_frame_size = Vector2(
					floor(atlas_size.x / float(COLUMNS)),
					floor(atlas_size.y / float(ROWS))
				)
				_atlas_region = AtlasTexture.new()
				_atlas_region.atlas = atlas_texture
				texture = _atlas_region
				animation_source = "atlas_30f"
				runtime_animation_ready = true
				_set_frame(0)
				set_process(true)
				return

	if ResourceLoader.exists(APPROVED_MASTER_PATH):
		texture = ResourceLoader.load(APPROVED_MASTER_PATH) as Texture2D
		animation_source = "procedural_approved_master"
		runtime_animation_ready = texture != null
		if runtime_animation_ready:
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

	# The approved master is a single standing image. Do not translate or rotate
	# the whole card: that reads as floating. Keep the feet fixed and use only a
	# tiny breathing deformation; hair/sleeves/silk animate locally in shader.
	var breath := sin(_time * 1.06)
	position = _base_position
	rotation = 0.0
	scale = Vector2(
		_base_scale.x * (1.0 - breath * 0.00045),
		_base_scale.y * (1.0 + breath * 0.00135)
	)

func _set_frame(frame_index: int) -> void:
	current_frame = clampi(frame_index, 0, FRAME_COUNT - 1)
	var column := current_frame % COLUMNS
	var row := floori(float(current_frame) / float(COLUMNS))
	_atlas_region.region = Rect2(
		float(column) * _frame_size.x,
		float(row) * _frame_size.y,
		_frame_size.x,
		_frame_size.y
	)

func _standing_idle_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;

void fragment() {
	vec2 uv = UV;
	float lateral = abs(uv.x - 0.5);

	// Keep the face/central silhouette stable. Motion concentrates on long hair,
	// sleeves and lower robe where subtle secondary motion reads naturally.
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
