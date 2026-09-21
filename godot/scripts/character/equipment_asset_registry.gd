extends RefCounted
class_name EquipmentAssetRegistry

const ATTIRE_ATLAS_PATH := "res://art/approved/equipment/atlases/attire_sets_v1.webp"
const JEWELRY_ATLAS_PATH := "res://art/approved/equipment/atlases/jewelry_sets_v1.webp"

const ATTIRE_SET_ROWS := {
	"metal": 0,
	"wood": 1,
	"water": 2,
	"fire": 3,
	"earth": 4,
}
const ATTIRE_SLOT_COLS := {
	"weapon": 0,
	"head": 1,
	"robe": 2,
	"belt": 3,
	"gloves": 4,
	"boots": 5,
}
const JEWELRY_SET_ROWS := {
	"huyen_nguyen": 0,
	"pha_gioi": 1,
	"hu_khong": 2,
	"tran_thu": 3,
}
const JEWELRY_SLOT_COLS := {
	"necklace": 0,
	"ring": 1,
	"bracelet": 2,
	"talisman": 3,
}

# Runtime atlases are intentionally normalized to exact divisible dimensions.
const ATTIRE_CELL_SIZE := Vector2i(160, 160)
const JEWELRY_CELL_SIZE := Vector2i(200, 200)

var _cache: Dictionary = {}

func texture_for(set_id: String, slot_id: String) -> Texture2D:
	var spec := resolve_spec(set_id, slot_id)
	if spec.is_empty():
		return null
	var key := "%s|%s" % [str(spec.get("path", "")), str(spec.get("region", Rect2i()))]
	if _cache.has(key):
		return _cache[key]
	var atlas_path := str(spec.get("path", ""))
	if atlas_path.is_empty() or not ResourceLoader.exists(atlas_path):
		return null
	var source := ResourceLoader.load(atlas_path) as Texture2D
	if source == null:
		return null
	var atlas := AtlasTexture.new()
	atlas.atlas = source
	atlas.region = Rect2(spec.get("region", Rect2i()))
	_cache[key] = atlas
	return atlas

static func resolve_spec(set_id: String, slot_id: String) -> Dictionary:
	var set_key := normalize_set_key(set_id)
	if set_key in ATTIRE_SET_ROWS and slot_id in ATTIRE_SLOT_COLS:
		var row := int(ATTIRE_SET_ROWS[set_key])
		var col := int(ATTIRE_SLOT_COLS[slot_id])
		return {
			"path": ATTIRE_ATLAS_PATH,
			"set_key": set_key,
			"category": "attire",
			"region": Rect2i(
				col * ATTIRE_CELL_SIZE.x,
				row * ATTIRE_CELL_SIZE.y,
				ATTIRE_CELL_SIZE.x,
				ATTIRE_CELL_SIZE.y
			),
		}
	if set_key in JEWELRY_SET_ROWS and slot_id in JEWELRY_SLOT_COLS:
		var row := int(JEWELRY_SET_ROWS[set_key])
		var col := int(JEWELRY_SLOT_COLS[slot_id])
		return {
			"path": JEWELRY_ATLAS_PATH,
			"set_key": set_key,
			"category": "jewelry",
			"region": Rect2i(
				col * JEWELRY_CELL_SIZE.x,
				row * JEWELRY_CELL_SIZE.y,
				JEWELRY_CELL_SIZE.x,
				JEWELRY_CELL_SIZE.y
			),
		}
	return {}

static func normalize_set_key(set_id: String) -> String:
	var id := set_id.to_lower()
	if id.contains(".metal") or id == "metal":
		return "metal"
	if id.contains(".wood") or id == "wood":
		return "wood"
	if id.contains(".water") or id == "water":
		return "water"
	if id.contains(".fire") or id == "fire":
		return "fire"
	if id.contains(".earth") or id == "earth":
		return "earth"
	if id.contains("huyen_nguyen") or id == "xuan":
		return "huyen_nguyen"
	if id.contains("pha_gioi") or id == "pha":
		return "pha_gioi"
	if id.contains("hu_khong") or id == "void":
		return "hu_khong"
	if id.contains("tran_thu") or id == "guardian":
		return "tran_thu"
	return ""
