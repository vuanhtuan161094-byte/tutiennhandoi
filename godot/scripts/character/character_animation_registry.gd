class_name CharacterAnimationRegistry
extends RefCounted

const PRESETS := [
	{
		"id": &"character_idle_01",
		"title": "Character 01",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_idle_01.tres",
		"still_path": "res://art/approved/character/animation_v2/stills/character_idle_01.webp",
		"animation_name": &"character_idle_01",
	},
	{
		"id": &"character_motion_02",
		"title": "Character 02",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_motion_02.tres",
		"still_path": "res://art/approved/character/animation_v2/stills/character_motion_02.webp",
		"animation_name": &"character_motion_02",
	},
	{
		"id": &"character_motion_03",
		"title": "Character 03",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_motion_03.tres",
		"still_path": "res://art/approved/character/animation_v2/stills/character_motion_03.webp",
		"animation_name": &"character_motion_03",
	},
	{
		"id": &"character_motion_04",
		"title": "Character 04",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_motion_04.tres",
		"still_path": "res://art/approved/character/animation_v2/stills/character_motion_04.webp",
		"animation_name": &"character_motion_04",
	},
	{
		"id": &"character_motion_05",
		"title": "Character 05",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_motion_05.tres",
		"still_path": "res://art/approved/character/animation_v2/stills/character_motion_05.webp",
		"animation_name": &"character_motion_05",
	},
	{
		"id": &"character_motion_06",
		"title": "Character 06",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_motion_06.tres",
		"still_path": "res://art/approved/character/animation_v2/stills/character_motion_06.webp",
		"animation_name": &"character_motion_06",
	},
	{
		"id": &"character_motion_07",
		"title": "Character 07",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_motion_07.tres",
		"still_path": "res://art/approved/character/animation_v2/stills/character_motion_07.webp",
		"animation_name": &"character_motion_07",
	},
	{
		"id": &"character_motion_08",
		"title": "Character 08",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_motion_08.tres",
		"still_path": "res://art/approved/character/animation_v2/stills/character_motion_08.webp",
		"animation_name": &"character_motion_08",
	},
	{
		"id": &"character_motion_09",
		"title": "Character 09",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_motion_09.tres",
		"still_path": "res://art/approved/character/animation_v2/stills/character_motion_09.webp",
		"animation_name": &"character_motion_09",
	},
	{
		"id": &"character_motion_10",
		"title": "Character 10",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_motion_10.tres",
		"still_path": "res://art/approved/character/animation_v2/stills/character_motion_10.webp",
		"animation_name": &"character_motion_10",
	},
	{
		"id": &"character_motion_11",
		"title": "Character 11",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_motion_11.tres",
		"still_path": "res://art/approved/character/animation_v2/stills/character_motion_11.webp",
		"animation_name": &"character_motion_11",
	},
]

static func default_preset_id() -> StringName:
	if PRESETS.is_empty():
		return &""
	return StringName(PRESETS[0].get("id", &""))

static func preset(preset_id: StringName) -> Dictionary:
	for entry in PRESETS:
		if entry.get("id", &"") == preset_id:
			return entry
	return {}

static func still_path(preset_id: StringName) -> String:
	var entry := preset(preset_id)
	return str(entry.get("still_path", ""))

static func available_presets() -> Array:
	var result: Array = []
	for entry in PRESETS:
		var resource_path := str(entry.get("resource_path", ""))
		var still_resource_path := str(entry.get("still_path", ""))
		if (
			(not resource_path.is_empty() and ResourceLoader.exists(resource_path))
			or (not still_resource_path.is_empty() and ResourceLoader.exists(still_resource_path))
		):
			result.append(entry)
	return result
