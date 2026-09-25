extends RefCounted

const SCHEMA := "godot-character-view-model.v1"
const EXPECTED_SCHEMA := "godot-character-bridge.v1"
const EXPECTED_BRIDGE_VERSION := "godot-bridge.v2"
const EXPECTED_EQUIPMENT_AUTHORITY := "equipment.v142"
const EXPECTED_STATS_AUTHORITY := "combat-stat.v168"

const SLOT_ORDER := [
	"weapon", "head", "gloves", "bracelet", "necklace",
	"robe", "belt", "boots", "ring", "talisman",
]

const SLOT_LABELS := {
	"weapon": "Đạo Binh",
	"head": "Đạo Quan",
	"robe": "Pháp Bào",
	"belt": "Huyền Đái",
	"gloves": "Hộ Uyển",
	"boots": "Vân Ngoa",
	"necklace": "Ngọc Bội",
	"ring": "Đạo Giới",
	"bracelet": "Linh Trạc",
	"talisman": "Hộ Phù",
}

static func build(payload: Dictionary) -> Dictionary:
	var validation := _validate(payload)
	if validation != "":
		return {"ok": false, "schema": SCHEMA, "error": validation}

	var character: Dictionary = payload.get("character", {})
	var overview: Dictionary = payload.get("overview", {})
	var life: Dictionary = overview.get("life", {})
	var root: Dictionary = payload.get("spiritualRoot", {})
	var root_grade: Dictionary = root.get("grade", {})
	var equipment_system: Dictionary = payload.get("equipmentSystem", {})
	var equipment_variant = payload.get("equipment", [])
	var equipment: Array = equipment_variant if typeof(equipment_variant) == TYPE_ARRAY else []
	var inventory_variant = payload.get("equipmentInventory", [])
	var inventory: Array = inventory_variant if typeof(inventory_variant) == TYPE_ARRAY else []
	var core: Dictionary = character.get("coreStats", {})
	var combat: Dictionary = character.get("combatStats", {})
	var potential: Dictionary = character.get("potential", {})

	var item_by_slot := {}
	for item_variant in equipment:
		if typeof(item_variant) != TYPE_DICTIONARY:
			continue
		var item: Dictionary = item_variant
		var slot_id := str(item.get("slot", ""))
		if slot_id != "":
			item_by_slot[slot_id] = item

	var backend_slot_labels := {}
	var backend_slots = equipment_system.get("slots", [])
	if typeof(backend_slots) == TYPE_ARRAY:
		for slot_variant in backend_slots:
			if typeof(slot_variant) != TYPE_DICTIONARY:
				continue
			var slot: Dictionary = slot_variant
			var slot_id := str(slot.get("id", ""))
			if slot_id != "":
				backend_slot_labels[slot_id] = str(slot.get("label", SLOT_LABELS.get(slot_id, slot_id)))

	var slots: Array = []
	for slot_id in SLOT_ORDER:
		var item: Dictionary = item_by_slot.get(slot_id, {})
		slots.append({
			"id": slot_id,
			"label": str(backend_slot_labels.get(slot_id, SLOT_LABELS.get(slot_id, slot_id))),
			"filled": not item.is_empty(),
			"item_id": str(item.get("id", "")),
			"name": str(item.get("name", "")),
			"enhancement": clampi(int(item.get("enhancementLevel", 0)), 0, 15),
			"set_id": str(item.get("setId", "")),
			"rank_name": str(item.get("rankName", item.get("equipmentRankName", item.get("grade", "")))),
			"rank_index": int(item.get("rankIndex", item.get("equipmentRankIndex", -1))),
			"is_v142": bool(item.get("isV142", item.get("schema", "") == "equipment.v142")),
			"item_level": int(item.get("itemLevel", 0)),
			"set_name": str(item.get("setName", "")),
			"source": str(item.get("source", "")),
			"stats": _dict_copy(item.get("effectiveStats", item.get("stats", {}))),
			"affixes": _array_copy(item.get("affixes", [])),
		})

	var root_name := str(root_grade.get("name", character.get("root", "Phàm Căn")))
	var realm := str(life.get("realm", character.get("realm", "Phàm Nhân")))
	var active_technique := _active_technique_label(character)
	var path_secondary := root_name

	return {
		"ok": true,
		"schema": SCHEMA,
		"source_generated_at": int(payload.get("generatedAtUnixMs", 0)),
		"identity": {
			"name": str(character.get("name", life.get("name", "Tu Sĩ"))),
			"life_number": maxi(1, int(life.get("lifeNumber", 1))),
			"realm": realm,
			"root_name": root_name,
		},
		"path": {
			"primary": _path_primary(character, active_technique),
			"secondary": path_secondary,
		},
		"stats": {
			"power": float(core.get("power", combat.get("attack", 0))),
			"body": float(core.get("body", float(combat.get("maxHp", 0)) / 20.0)),
			"agility": float(core.get("agility", combat.get("mobility", 0))),
			"spirit": float(core.get("spirit", combat.get("maxSpirit", 0))),
			"sense": float(core.get("sense", combat.get("accuracy", 0))),
			"defense": float(combat.get("defense", core.get("defense", 0))),
			"combat": combat.duplicate(true),
		},
		"profile": {
			"birth": _dict_copy(character.get("birth", {})),
			"root": _dict_copy(root),
			"root_tags": _array_copy(character.get("rootTags", [])),
			"origin_details": _dict_copy(character.get("originDetails", {})),
			"origin_progression": _dict_copy(character.get("originProgression", {})),
			"bloodlines": _array_copy(character.get("bloodlines", [])),
			"physiques": _array_copy(character.get("physiques", [])),
			"known_skills": _array_copy(character.get("knownSkills", [])),
		},
		"potential": {
			"unspent": maxi(0, int(potential.get("unspent", 0))),
			"allocations": _dict_copy(potential.get("allocations", {})),
			"definitions": _array_copy(potential.get("definitions", [])),
		},
		"inventory_resources": _array_copy(payload.get("inventoryResources", [])),
		"equipment": {
			"slots": slots,
			"inventory": _array_copy(inventory),
			"system": equipment_system.duplicate(true),
			"equipped_count": slots.filter(func(slot): return bool(slot.get("filled", false))).size(),
			"canonical_slot_count": 10,
			"max_enhancement": 15,
		},
	}

static func _active_technique_label(character: Dictionary) -> String:
	for key in ["activeTechniqueName", "activeTechnique", "activeTechniqueId"]:
		var value := str(character.get(key, ""))
		if value != "":
			return value
	return ""

static func _path_primary(character: Dictionary, active_technique: String) -> String:
	for key in ["buildIdentity", "pathIdentity", "daoIdentity", "specializationName"]:
		var value := str(character.get(key, ""))
		if value != "":
			return value
	if active_technique != "":
		return active_technique
	return "Đạo đồ chưa định"

static func _validate(payload: Dictionary) -> String:
	if str(payload.get("schema", "")) != EXPECTED_SCHEMA:
		return "Sai Character schema"
	if str(payload.get("bridgeVersion", "")) != EXPECTED_BRIDGE_VERSION:
		return "Sai bridge version"
	var authority = payload.get("authority", {})
	if typeof(authority) != TYPE_DICTIONARY:
		return "Thiếu authority"
	if str(authority.get("equipment", "")) != EXPECTED_EQUIPMENT_AUTHORITY:
		return "Sai equipment authority"
	if str(authority.get("stats", "")) != EXPECTED_STATS_AUTHORITY:
		return "Sai combat stat authority"
	for key in ["character", "overview", "spiritualRoot", "equipmentSystem"]:
		if typeof(payload.get(key, null)) != TYPE_DICTIONARY:
			return "Thiếu DTO: %s" % key
	if typeof(payload.get("equipment", null)) != TYPE_ARRAY:
		return "Thiếu DTO: equipment"
	if typeof(payload.get("equipmentInventory", null)) != TYPE_ARRAY:
		return "Thiếu DTO: equipmentInventory"
	return ""

static func _dict_copy(value) -> Dictionary:
	return value.duplicate(true) if typeof(value) == TYPE_DICTIONARY else {}

static func _array_copy(value) -> Array:
	return value.duplicate(true) if typeof(value) == TYPE_ARRAY else []
