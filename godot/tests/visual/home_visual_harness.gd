extends Control

const HOME_STAGE_SCRIPT := preload("res://scripts/home/home_stage.gd")
const HOME_HUD_SCRIPT := preload("res://scripts/home/home_hud.gd")
const HOME_OVERLAY_SCRIPT := preload("res://scripts/home/home_overlay.gd")
const HOME_NAV_SCRIPT := preload("res://scripts/home/home_nav.gd")

var stage
var hud
var overlay
var nav

func _ready() -> void:
	stage = HOME_STAGE_SCRIPT.new()
	stage.name = "HomeStage"
	stage.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(stage)
	stage.set_process(false)

	hud = HOME_HUD_SCRIPT.new()
	hud.name = "HomeHUD"
	hud.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(hud)
	hud.bind(_fixture_vm())
	hud.set_bridge_status(true, "Visual fixture")

	nav = HOME_NAV_SCRIPT.new()
	nav.name = "HomeNav"
	nav.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(nav)
	nav.set_route(&"home")

	overlay = HOME_OVERLAY_SCRIPT.new()
	overlay.name = "HomeOverlay"
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(overlay)

func _fixture_vm() -> Dictionary:
	return {
		"ok": true,
		"schema": "godot-home-view-model.v1",
		"identity": {
			"name": "Thiên Vô Danh",
			"life_number": 2,
			"realm": "Luyện Khí tầng một",
			"realm_order": 1,
			"root_name": "Phàm Căn",
			"root_level": 1,
		},
		"progression": {
			"tu_vi": 705.0,
			"required_tu_vi": 1371.0,
			"progress_pct": 51.42,
			"base_rate_per_15s": 10.0,
			"rate_per_15s": 13.0,
			"rate_sources": [
				{"id": "base", "label": "Cơ sở", "kind": "flat", "value": 10.0},
				{"id": "root", "label": "Linh Căn", "kind": "flat", "value": 3.0},
			],
			"eta_seconds": 780.0,
			"injury_pct": 0.0,
			"age_years": 18.0,
			"lifespan_years": 100.0,
			"remaining_life_years": 82.0,
			"ready": false,
			"transition": "auto",
			"next_realm": "Luyện Khí tầng hai",
			"retreat": {
				"enabled": true,
				"bank_hours": 6.0,
				"cap_hours": 9.0,
				"daily_hours": 3.0,
				"reward_pct_3h": 2.0,
				"reward_pct_per_hour": 0.6666667,
			},
		},
		"resources": {
			"spirit_stone": 250.0,
			"reincarnation_cp": 12.0,
		},
		"context": {
			"actions": [],
			"hints": ["Tiếp tục tu luyện"],
			"major_events": [],
			"active_technique": "technique.qingmu",
			"build": {},
			"hunt": {},
		},
	}
