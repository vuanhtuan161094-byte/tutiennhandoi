extends TextureRect

const IDLE_ATLAS_PATH := "res://art/approved/character/standing_idle_atlas.webp"
const FALLBACK_PATH := "res://art/approved/home/home_hero_standing.webp"
const FRAME_SIZE := Vector2(200.0, 300.0)
const COLUMNS := 6
const FRAME_COUNT := 30
const FPS := 12.0

var _atlas_region: AtlasTexture
var _time := 0.0
var _frame := -1

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_load_visual()

func has_runtime_animation() -> bool:
	return _atlas_region != null

func _load_visual() -> void:
	if ResourceLoader.exists(IDLE_ATLAS_PATH):
		var atlas_texture := ResourceLoader.load(IDLE_ATLAS_PATH) as Texture2D
		if atlas_texture != null:
			_atlas_region = AtlasTexture.new()
			_atlas_region.atlas = atlas_texture
			texture = _atlas_region
			_set_frame(0)
			set_process(true)
			return
	if ResourceLoader.exists(FALLBACK_PATH):
		texture = ResourceLoader.load(FALLBACK_PATH) as Texture2D
	set_process(false)

func _process(delta: float) -> void:
	if not visible or _atlas_region == null:
		return
	_time += delta
	var next_frame := int(floor(_time * FPS)) % FRAME_COUNT
	if next_frame != _frame:
		_set_frame(next_frame)

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
