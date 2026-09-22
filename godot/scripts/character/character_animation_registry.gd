class_name CharacterAnimationRegistry
extends RefCounted

const PRESETS := [
	{
		"id": &"character_idle_01",
		"title": "Character 01",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_idle_01.tres",
		"animation_name": &"character_idle_01",
	},
	{
		"id": &"character_motion_02",
		"title": "Character 02",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_motion_02.tres",
		"animation_name": &"character_motion_02",
	},
	{
		"id": &"character_motion_03",
		"title": "Character 03",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_motion_03.tres",
		"animation_name": &"character_motion_03",
	},
	{
		"id": &"character_motion_04",
		"title": "Character 04",
		"resource_path": "res://art/approved/character/animation_v2/presets/character_motion_04.tres",
		"animation_name": &"character_motion_04",
	},
]

static func default_preset_id() -> StringName:
	return StringName(PRESETS[0].get("id", &"")) if not PRESETS.is_empty() else &""

static func preset(preset_id: StringName) -> Dictionary:
	for entry in PRESETS:
		if entry.get("id", &"") == preset_id:
			return entry
	return {}

static func next_preset_id(current: StringName) -> StringName:
	if PRESETS.is_empty():
		return &""
	for index in range(PRESETS.size()):
		if PRESETS[index].get("id", &"") == current:
			return StringName(PRESETS[(index + 1) % PRESETS.size()].get("id", &""))
	return default_preset_id()

static func available_presets() -> Array:
	var result: Array = []
	for entry in PRESETS:
		var path := str(entry.get("resource_path", ""))
		if not path.is_empty() and ResourceLoader.exists(path):
			result.append(entry)
	return result
