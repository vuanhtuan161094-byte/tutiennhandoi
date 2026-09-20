extends RefCounted
class_name HomeArtAtlas

# Production Home art stays optional at source level: a missing binary payload
# must never make the client fail to parse or boot. Once the approved atlas and
# manifest land, presentation scripts resolve them automatically.
const MANIFEST_PATH := "res://art/approved/home_runtime_atlas.json"
const DEFAULT_ATLAS_PATH := "res://art/approved/home_runtime_atlas.webp"

const FALLBACK_PATHS := {
	"background": "res://art/approved/home_bg_blue_valley.webp",
	"hero": "res://art/approved/home_cultivator_centered.png",
	"portrait": "res://art/approved/hero_portrait.webp",
	"orb_retreat": "res://art/icons/retreat.svg",
	"orb_character": "res://art/icons/character.svg",
	"orb_root": "res://art/icons/root.svg",
	"orb_combat": "res://art/icons/combat.svg",
}

static var _manifest_loaded := false
static var _manifest: Dictionary = {}
static var _texture_cache: Dictionary = {}
static var _production_cache: Dictionary = {}


static func texture(asset_id: StringName, fallback_path: String = "") -> Texture2D:
	var production := production_texture(asset_id)
	if production != null:
		return production

	var path := fallback_path
	if path.is_empty():
		path = str(FALLBACK_PATHS.get(String(asset_id), ""))
	return _load_texture(path)


static func production_texture(asset_id: StringName) -> Texture2D:
	var key := String(asset_id)
	if _production_cache.has(key):
		return _production_cache[key] as Texture2D

	_ensure_manifest()
	var resolved: Texture2D = null
	var assets_variant = _manifest.get("assets", {})
	if typeof(assets_variant) == TYPE_DICTIONARY:
		var assets: Dictionary = assets_variant
		if assets.has(key):
			resolved = _texture_from_entry(assets[key])

	_production_cache[key] = resolved
	return resolved


static func has_production_art(asset_id: StringName) -> bool:
	return production_texture(asset_id) != null


static func _ensure_manifest() -> void:
	if _manifest_loaded:
		return
	_manifest_loaded = true

	if not FileAccess.file_exists(MANIFEST_PATH):
		return

	var parsed = JSON.parse_string(FileAccess.get_file_as_string(MANIFEST_PATH))
	if typeof(parsed) == TYPE_DICTIONARY:
		_manifest = parsed


static func _texture_from_entry(entry_variant) -> Texture2D:
	if typeof(entry_variant) == TYPE_STRING:
		return _load_texture(str(entry_variant))
	if typeof(entry_variant) != TYPE_DICTIONARY:
		return null

	var entry: Dictionary = entry_variant
	var direct_path := str(entry.get("path", ""))
	if not direct_path.is_empty():
		return _load_texture(direct_path)

	var rect_variant = entry.get("rect", [])
	if typeof(rect_variant) != TYPE_ARRAY:
		return null
	var rect: Array = rect_variant
	if rect.size() < 4:
		return null

	var atlas_path := str(entry.get("atlas", _manifest.get("atlas", DEFAULT_ATLAS_PATH)))
	var atlas_texture := _load_texture(atlas_path)
	if atlas_texture == null:
		return null

	var region := AtlasTexture.new()
	region.atlas = atlas_texture
	region.region = Rect2(
		float(rect[0]),
		float(rect[1]),
		float(rect[2]),
		float(rect[3])
	)
	return region


static func _load_texture(path: String) -> Texture2D:
	if path.is_empty():
		return null
	if _texture_cache.has(path):
		return _texture_cache[path] as Texture2D
	if not ResourceLoader.exists(path):
		_texture_cache[path] = null
		return null

	var resource := ResourceLoader.load(path)
	var resolved := resource as Texture2D
	_texture_cache[path] = resolved
	return resolved
