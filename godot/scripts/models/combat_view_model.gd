extends RefCounted

const SCHEMA := "godot-combat-view-model.v1"
const EXPECTED_BRIDGE_SCHEMA := "godot-combat-bridge.v1"
const EXPECTED_BRIDGE_VERSION := "godot-bridge.v2"
const EXPECTED_COMBAT_AUTHORITY := "combat-kernel.v3"
const EXPECTED_DAO_AUTHORITY := "battle-dao.runtime.v2"


static func build(view: Dictionary) -> Dictionary:
	var validation := _validate(view)
	if validation != "":
		return {
			"ok": false,
			"schema": SCHEMA,
			"error": validation,
		}

	var snapshot: Dictionary = view.get("snapshot", {})
	var player: Dictionary = snapshot.get("player", {})
	var enemy: Dictionary = snapshot.get("enemy", {})
	var challenge: Dictionary = snapshot.get("challenge", {})
	var dao: Dictionary = snapshot.get("dao", {})
	var boss: Dictionary = snapshot.get("boss", {})
	var result = snapshot.get("result", null)

	return {
		"ok": true,
		"schema": SCHEMA,
		"source_generated_at": int(view.get("generatedAtUnixMs", 0)),
		"encounter_id": str(snapshot.get("encounterId", "")),
		"snapshot_seq": int(snapshot.get("snapshotSeq", 0)),
		"mode": str(snapshot.get("mode", "prefight")),
		"main_dao_id": str(snapshot.get("mainDaoId", "")),
		"challenge": {
			"can_start": bool(challenge.get("canStart", false)),
			"blocked_reason": str(challenge.get("blockedReason", "")),
			"floor": maxi(1, int(challenge.get("floor", 1))),
			"zone_floor": maxi(1, int(challenge.get("zoneFloor", 1))),
			"zone_name": str(challenge.get("zoneName", "")),
		},
		"player": _actor(player),
		"enemy": _enemy(enemy),
		"skills": _skills(snapshot.get("skills", [])),
		"dao": _dao(dao),
		"auto": _dictionary_copy(snapshot.get("auto", {})),
		"boss": _dictionary_copy(boss),
		"result": _dictionary_copy(result) if typeof(result) == TYPE_DICTIONARY else {},
		"events": _events(view.get("events", [])),
		"event_cursor": maxi(0, int(view.get("eventCursor", 0))),
	}


static func _actor(source: Dictionary) -> Dictionary:
	return {
		"id": str(source.get("id", "")),
		"name": str(source.get("name", "")),
		"hp": _vital(source.get("hp", {})),
		"spirit": _vital(source.get("spirit", {})),
		"ultimate": _ultimate(source.get("ultimate", {})),
	}


static func _enemy(source: Dictionary) -> Dictionary:
	return {
		"id": str(source.get("id", "")),
		"name": str(source.get("name", "")),
		"level": maxi(1, int(source.get("level", 1))),
		"grade": str(source.get("grade", "")),
		"grade_id": str(source.get("gradeId", "")),
		"elements": source.get("elements", []).duplicate(true) if typeof(source.get("elements", [])) == TYPE_ARRAY else [],
		"hp": _vital(source.get("hp", {})),
		"break": _break_state(source.get("break", {})),
	}


static func _vital(raw) -> Dictionary:
	var source: Dictionary = raw if typeof(raw) == TYPE_DICTIONARY else {}
	var ratio := clampf(float(source.get("ratio", 0.0)), 0.0, 1.0)
	return {
		"current": source.get("current", null),
		"max": source.get("max", null),
		"ratio": ratio,
		"display_current": str(source.get("displayCurrent", source.get("current", "—"))),
		"display_max": str(source.get("displayMax", source.get("max", "—"))),
	}


static func _ultimate(raw) -> Dictionary:
	var source: Dictionary = raw if typeof(raw) == TYPE_DICTIONARY else {}
	var maximum := maxf(1.0, float(source.get("max", 100.0)))
	var current := clampf(float(source.get("current", 0.0)), 0.0, maximum)
	return {
		"current": current,
		"max": maximum,
		"ratio": current / maximum,
		"ready": bool(source.get("ready", current >= maximum)),
	}


static func _break_state(raw) -> Dictionary:
	var source: Dictionary = raw if typeof(raw) == TYPE_DICTIONARY else {}
	return {
		"ratio": clampf(float(source.get("ratio", 1.0)), 0.0, 1.0),
		"state": str(source.get("state", "stable")),
	}


static func _skills(raw) -> Array:
	if typeof(raw) != TYPE_ARRAY:
		return []
	var out: Array = []
	for entry in raw:
		if typeof(entry) != TYPE_DICTIONARY:
			continue
		var row: Dictionary = entry
		out.append({
			"id": str(row.get("id", "")),
			"name": str(row.get("name", "")),
			"slot_class": str(row.get("slotClass", "active")),
			"form": str(row.get("form", "instant")),
			"cooldown_total": maxf(0.0, float(row.get("cooldownTotal", 0.0))),
			"cooldown_remaining": maxf(0.0, float(row.get("cooldownRemaining", 0.0))),
			"spirit_cost": maxf(0.0, float(row.get("spiritCost", 0.0))),
			"ready": bool(row.get("ready", false)),
			"blocked_reason": str(row.get("blockedReason", "")),
			"cast_state": str(row.get("castState", "idle")),
			"channel_state": str(row.get("channelState", "idle")),
			"auto_selected": bool(row.get("autoSelected", false)),
		})
	return out


static func _dao(raw) -> Dictionary:
	var source: Dictionary = raw if typeof(raw) == TYPE_DICTIONARY else {}
	var meters: Array = []
	var raw_meters = source.get("meters", [])
	if typeof(raw_meters) == TYPE_ARRAY:
		for entry in raw_meters:
			if typeof(entry) != TYPE_DICTIONARY:
				continue
			var row: Dictionary = entry
			var maximum := maxf(1.0, float(row.get("max", 1.0)))
			var value := clampf(float(row.get("value", 0.0)), 0.0, maximum)
			meters.append({
				"id": str(row.get("id", "")),
				"label": str(row.get("label", "")),
				"value": value,
				"max": maximum,
				"ratio": value / maximum,
				"target_owned": bool(row.get("targetOwned", false)),
			})
	var flags: Array = []
	var raw_flags = source.get("flags", [])
	if typeof(raw_flags) == TYPE_ARRAY:
		for entry in raw_flags:
			if typeof(entry) == TYPE_DICTIONARY:
				var row: Dictionary = entry
				flags.append({
					"id": str(row.get("id", "")),
					"label": str(row.get("label", "")),
					"active": bool(row.get("active", false)),
				})
	return {
		"id": str(source.get("id", "")),
		"label": str(source.get("label", "Bản Đạo")),
		"anchor_kind": str(source.get("anchorKind", "self")),
		"meters": meters,
		"flags": flags,
		"detail": _dictionary_copy(source.get("detail", {})),
	}


static func _events(raw) -> Array:
	if typeof(raw) != TYPE_ARRAY:
		return []
	var out: Array = []
	for entry in raw:
		if typeof(entry) != TYPE_DICTIONARY:
			continue
		var row: Dictionary = entry
		out.append({
			"cursor": maxi(0, int(row.get("cursor", 0))),
			"seq": maxi(0, int(row.get("seq", 0))),
			"time": maxf(0.0, float(row.get("time", 0.0))),
			"type": str(row.get("type", "")),
			"source_type": str(row.get("sourceType", "")),
			"actor": str(row.get("actor", "")),
			"target": str(row.get("target", "")),
			"skill_id": str(row.get("skillId", "")),
			"skill_name": str(row.get("skillName", "")),
			"message": str(row.get("message", "")),
			"payload": _dictionary_copy(row.get("payload", {})),
		})
	return out


static func _dictionary_copy(raw) -> Dictionary:
	return raw.duplicate(true) if typeof(raw) == TYPE_DICTIONARY else {}


static func _validate(view: Dictionary) -> String:
	if str(view.get("schema", "")) != EXPECTED_BRIDGE_SCHEMA:
		return "Sai Combat schema"
	if str(view.get("bridgeVersion", "")) != EXPECTED_BRIDGE_VERSION:
		return "Sai bridge version"
	var authority = view.get("authority", {})
	if typeof(authority) != TYPE_DICTIONARY:
		return "Combat thiếu authority"
	if str(authority.get("combat", "")) != EXPECTED_COMBAT_AUTHORITY:
		return "Sai Combat authority"
	if str(authority.get("dao", "")) != EXPECTED_DAO_AUTHORITY:
		return "Sai Bản Đạo authority"
	if typeof(view.get("snapshot", null)) != TYPE_DICTIONARY:
		return "Combat thiếu snapshot"
	if typeof(view.get("events", null)) != TYPE_ARRAY:
		return "Combat thiếu event stream"
	return ""
