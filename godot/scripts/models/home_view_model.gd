extends RefCounted

const SCHEMA := "godot-home-view-model.v1"
const EXPECTED_HOME_SCHEMA := "godot-home-bridge.v1"
const EXPECTED_BRIDGE_VERSION := "godot-bridge.v2"
const EXPECTED_CULTIVATION_AUTHORITY := "character-cultivation.v140"

static func build(home: Dictionary) -> Dictionary:
	var validation := _validate(home)
	if validation != "":
		return {
			"ok": false,
			"schema": SCHEMA,
			"error": validation,
		}

	var character: Dictionary = home.get("character", {})
	var life: Dictionary = home.get("life", {})
	var cultivation: Dictionary = home.get("cultivation", {})
	var root: Dictionary = home.get("spiritualRoot", {})
	var resources: Dictionary = home.get("resources", {})
	var retreat: Dictionary = cultivation.get("retreat", {})
	var home_context: Dictionary = home.get("homeContext", {})

	var tu_vi := maxf(0.0, float(cultivation.get("tuVi", 0)))
	var live_tu_vi := maxf(tu_vi, float(cultivation.get("liveTuVi", tu_vi)))
	var required := maxf(0.0, float(cultivation.get("requiredTuVi", 0)))
	var progress_pct := clampf(float(cultivation.get("progressPct", 0)), 0.0, 100.0)
	if required > 0.0 and progress_pct <= 0.0 and tu_vi > 0.0:
		progress_pct = clampf(tu_vi / required * 100.0, 0.0, 100.0)

	var age_years := maxf(0.0, float(life.get("ageYears", 0)))
	var lifespan_years := maxf(0.0, float(life.get("lifespanYears", 0)))
	var remaining_life := maxf(0.0, lifespan_years - age_years)

	var retreat_reward := maxf(0.0, float(retreat.get("rewardPct3h", 0)))
	var retreat_enabled := bool(retreat.get("enabled", false)) and retreat_reward > 0.0

	return {
		"ok": true,
		"schema": SCHEMA,
		"source_generated_at": int(home.get("generatedAtUnixMs", 0)),
		"identity": {
			"name": str(character.get("name", "Tu Sĩ")),
			"life_number": maxi(1, int(life.get("lifeNumber", 1))),
			"realm": str(life.get("realm", "Phàm Nhân")),
			"realm_order": maxi(0, int(life.get("realmOrder", 0))),
			"root_name": str(root.get("name", "Phàm Căn")),
			"root_level": maxi(0, int(root.get("level", 0))),
		},
		"progression": {
			"tu_vi": tu_vi,
			"live_tu_vi": minf(required, live_tu_vi) if required > 0.0 else live_tu_vi,
			"required_tu_vi": required,
			"progress_pct": progress_pct,
			"base_rate_per_15s": maxf(0.0, float(cultivation.get("baseTuViPer15s", cultivation.get("finalTuViPer15s", 0)))),
			"rate_per_15s": maxf(0.0, float(cultivation.get("finalTuViPer15s", 0))),
			"base_rate_per_second": maxf(0.0, float(cultivation.get("baseTuViPerSecond", 0))),
			"rate_per_second": maxf(0.0, float(cultivation.get("finalTuViPerSecond", 0))),
			"commit_interval_seconds": maxf(0.001, float(cultivation.get("commitIntervalSeconds", 15.0))),
			"commit_phase_seconds": clampf(
				float(cultivation.get("commitPhaseSeconds", 0.0)),
				0.0,
				maxf(0.001, float(cultivation.get("commitIntervalSeconds", 15.0)))
			),
			"rate_sources": cultivation.get("sources", []),
			"eta_seconds": maxf(0.0, float(cultivation.get("etaRealSeconds", 0))),
			"injury_pct": clampf(float(cultivation.get("injury", 0)), 0.0, 100.0),
			"age_years": age_years,
			"lifespan_years": lifespan_years,
			"remaining_life_years": remaining_life,
			"ready": bool(cultivation.get("ready", false)),
			"transition": str(cultivation.get("transition", "auto")),
			"next_realm": str(cultivation.get("nextRealm", "")),
			"retreat": {
				"enabled": retreat_enabled,
				"bank_hours": maxf(0.0, float(retreat.get("bankHours", 0))),
				"cap_hours": maxf(0.0, float(retreat.get("capHours", 9))),
				"daily_hours": maxf(0.0, float(retreat.get("dailyAccrualHours", 3))),
				"reward_pct_3h": retreat_reward,
				"reward_pct_per_hour": maxf(0.0, float(retreat.get("rewardPctPerHour", 0))),
			},
		},
		"resources": {
			"spirit_stone": maxf(0.0, float(resources.get("spiritStone", 0))),
			"reincarnation_cp": maxf(0.0, float(resources.get("reincarnationCp", 0))),
		},
		"context": {
			"actions": home_context.get("actions", []),
			"hints": home_context.get("hints", []),
			"major_events": home_context.get("majorEvents", []),
			"active_technique": str(home_context.get("activeTechnique", "")),
			"build": home_context.get("build", {}),
			"hunt": home_context.get("hunt", {}),
		},
	}

static func _validate(home: Dictionary) -> String:
	if str(home.get("schema", "")) != EXPECTED_HOME_SCHEMA:
		return "Sai Home schema"
	if str(home.get("bridgeVersion", "")) != EXPECTED_BRIDGE_VERSION:
		return "Sai bridge version"
	var authority = home.get("authority", {})
	if typeof(authority) != TYPE_DICTIONARY:
		return "Thiếu authority"
	if str(authority.get("cultivation", "")) != EXPECTED_CULTIVATION_AUTHORITY:
		return "Sai cultivation authority"
	for key in ["character", "life", "cultivation", "spiritualRoot", "resources", "homeContext"]:
		if typeof(home.get(key, null)) != TYPE_DICTIONARY:
			return "Thiếu DTO: %s" % key
	return ""
