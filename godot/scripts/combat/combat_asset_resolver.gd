extends RefCounted
## Pure presentation routing. Unknown metadata remains unknown; no floor/element inference.
const MANIFEST_PATH := "res://data/combat_asset_manifest.json"
const OVERRIDES_PATH := "res://data/combat_asset_overrides.json"
static var _manifest: Dictionary = {}
static var _textures: Dictionary = {}

static func _read(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		return {}
	var raw = JSON.parse_string(FileAccess.get_file_as_string(path))
	return raw if typeof(raw) == TYPE_DICTIONARY else {}

static func _catalog() -> Dictionary:
	if _manifest.is_empty():
		_manifest = _read(MANIFEST_PATH)
		var overrides := _read(OVERRIDES_PATH)
		# Overrides bind approved art/presentation hints, never canonical identities.
		var allowed := {"biomeFamilies":["baseBackgroundPath","fallbackPath","backgroundLayers","foregroundLayers","tint"],
			"enemies":["spritePath","shadowPath","accent","layout","anchors"],
			"families":["iconPath","accent"], "skills":["iconPath","accent"]}
		for group in allowed:
			var rows: Dictionary = overrides.get(group, {})
			for key in rows:
				if not _manifest.get(group, {}).has(key) or typeof(rows[key]) != TYPE_DICTIONARY:
					continue
				for field in allowed[group]:
					if rows[key].has(field):
						_manifest[group][key][field] = rows[key][field]
					if group == "families" and field == "accent":
						for skill_row in _manifest.get("skills", {}).values():
							if skill_row.daoId == key:
								skill_row.accent = rows[key][field]
	return _manifest

static func catalog() -> Dictionary:
	return _catalog().duplicate(true)

static func environment(raw) -> Dictionary:
	var source: Dictionary = raw if typeof(raw) == TYPE_DICTIONARY else {}
	var data := _catalog()
	var biome: Dictionary = {}
	for candidate in data.get("biomes", {}).values():
		if candidate.biomeName == str(source.get("biome_name", "")):
			biome = candidate.duplicate(true)
			break
	var family: Dictionary = data.get("biomeFamilies", {}).get(str(biome.get("biomeFamilyId", "")), data.get("genericBiome", {})).duplicate(true)
	var zone: Dictionary = data.get("zones", {}).get(str(source.get("zone", 1)), data.get("zones", {}).get("1", {})).duplicate(true)
	var element: Dictionary = data.get("elements", {}).get(str(source.get("primary_element", "")), {"id":"neutral","infoKey":"element.neutral","elementAccent":"819b9f"}).duplicate(true)
	return {"biome":biome, "family":family, "zone":zone, "element":element,
		"biomeFamilyId":str(family.get("familyId", "generic")),
		"biomeBasePath":str(family.get("baseBackgroundPath", "")),
		"zoneIntensityKey":str(zone.get("intensityKey", "tier.1")),
		"primaryElement":str(element.id), "primaryElementInfoKey":str(element.infoKey),
		"fallbackKey":str(family.get("fallbackKey", "mountain-shell"))}

static func enemy(archetype_id: String) -> Dictionary:
	var rows: Dictionary = _catalog().get("enemies", {})
	return rows.get(archetype_id, rows.get("generic", {"id":"generic", "spritePath":"", "fallbackKey":"generic"})).duplicate(true)

static func skill(dao_id: String, skill_id: String, category: String = "active") -> Dictionary:
	var data := _catalog()
	var row: Dictionary = data.get("skills", {}).get(skill_id, {})
	# Exact registry ID is authority, even with a missing/stale family parameter.
	if not row.is_empty():
		return row.duplicate(true)
	var family: Dictionary = data.get("families", {}).get(dao_id, data.get("generic", {})).duplicate(true)
	family["category"] = category if category in ["basic", "active", "ultimate"] else "active"
	return family

static func texture_for_path(path: String) -> Texture2D:
	path = path.simplify_path()
	if path.is_empty() or not path.begins_with("res://art/approved/") or not ResourceLoader.exists(path):
		return null
	if not _textures.has(path):
		_textures[path] = ResourceLoader.load(path) as Texture2D
	return _textures[path]

static func skill_texture(config: Dictionary) -> Texture2D:
	var texture := texture_for_path(str(config.get("iconPath", "")))
	if texture != null:
		return texture
	var family: Dictionary = _catalog().get("families", {}).get(str(config.get("daoId", "")), {})
	return texture_for_path(str(family.get("iconPath", "")))
