class_name HomeAnimationRegistry
extends RefCounted

const MODE_CULTIVATION: StringName = &"cultivation"
const MODE_REST: StringName = &"rest"

const STILL_PATHS := {
	MODE_CULTIVATION: "res://art/approved/home/animation_v3/home_cultivation_still.webp",
	MODE_REST: "res://art/approved/home/animation_v3/home_rest_still.webp",
}

# Each preset can point at its own SpriteFrames resource. The split resources
# reference only the atlas needed by that preset, so selecting one animation
# does not force Godot to decode every Home atlas at once.
#
# fallback_resource_path preserves compatibility with the original V3 pack.
# Once the split .tres files are installed, runtime automatically prefers them.
const PRESETS := [
	{
		"id": &"cultivation_01",
		"mode": MODE_CULTIVATION,
		"title": "Tu Luyện 01",
		"resource_path": "res://art/approved/home/animation_v3/presets/home_cultivation_01.tres",
		"fallback_resource_path": "res://art/approved/home/animation_v3/home_cultivation_v3.tres",
		"animation_name": &"cultivation_01",
	},
	{
		"id": &"cultivation_02",
		"mode": MODE_CULTIVATION,
		"title": "Tu Luyện 02",
		"resource_path": "res://art/approved/home/animation_v3/presets/home_cultivation_02.tres",
		"fallback_resource_path": "res://art/approved/home/animation_v3/home_cultivation_v3.tres",
		"animation_name": &"cultivation_02",
	},
	{
		"id": &"rest_01",
		"mode": MODE_REST,
		"title": "Nghỉ Ngơi 01",
		"resource_path": "res://art/approved/home/animation_v3/presets/home_rest_01.tres",
		"fallback_resource_path": "res://art/approved/home/animation_v3/home_rest_v3.tres",
		"animation_name": &"idle_relaxed_01",
	},
	{
		"id": &"rest_02",
		"mode": MODE_REST,
		"title": "Nghỉ Ngơi 02",
		"resource_path": "res://art/approved/home/animation_v3/presets/home_rest_02.tres",
		"fallback_resource_path": "res://art/approved/home/animation_v3/home_rest_v3.tres",
		"animation_name": &"idle_relaxed_02",
	},
	{
		"id": &"rest_03",
		"mode": MODE_REST,
		"title": "Nghỉ Ngơi 03",
		"resource_path": "res://art/approved/home/animation_v3/presets/home_rest_03.tres",
		"fallback_resource_path": "res://art/approved/home/animation_v3/home_rest_v3.tres",
		"animation_name": &"idle_relaxed_03",
	},
]

static func normalize_mode(mode: StringName) -> StringName:
	return MODE_REST if mode == MODE_REST else MODE_CULTIVATION

static func still_path(mode: StringName) -> String:
	return str(STILL_PATHS.get(normalize_mode(mode), STILL_PATHS[MODE_CULTIVATION]))

static func presets_for_mode(mode: StringName) -> Array:
	var normalized := normalize_mode(mode)
	var result: Array = []
	for entry in PRESETS:
		if entry.get("mode", MODE_CULTIVATION) == normalized:
			result.append(entry)
	return result

static func default_preset_id(mode: StringName) -> StringName:
	var entries := presets_for_mode(mode)
	if entries.is_empty():
		return &""
	return StringName(entries[0].get("id", &""))

static func preset(preset_id: StringName) -> Dictionary:
	for entry in PRESETS:
		if entry.get("id", &"") == preset_id:
			return entry
	return {}

static func preset_for_mode(preset_id: StringName, mode: StringName) -> Dictionary:
	var entry := preset(preset_id)
	if entry.is_empty():
		return {}
	if entry.get("mode", MODE_CULTIVATION) != normalize_mode(mode):
		return {}
	return entry

static func resolved_resource_path(entry: Dictionary) -> String:
	var primary := str(entry.get("resource_path", ""))
	if not primary.is_empty() and ResourceLoader.exists(primary):
		return primary
	var fallback := str(entry.get("fallback_resource_path", ""))
	if not fallback.is_empty() and ResourceLoader.exists(fallback):
		return fallback
	return ""

static func display_title(preset_id: StringName) -> String:
	var entry := preset(preset_id)
	return str(entry.get("title", String(preset_id)))
