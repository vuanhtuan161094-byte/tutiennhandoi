extends Control
## Development-only visual review harness for the approved-in-chat Ngự Khí source clips.
## It deliberately drives presentation animation only; no gameplay authority is simulated.

const COMBAT_SCREEN := preload("res://scripts/combat/combat_screen.gd")

const SEQUENCE := [
	{"id": "skill.dao.artifact.basic", "name": "Ngự Khí Linh Chỉ"},
	{"id": "skill.dao.artifact.deploy", "name": "Phân Khí Thành Binh"},
	{"id": "skill.dao.artifact.guard", "name": "Huyền Kính Hộ Chủ"},
	{"id": "skill.dao.artifact.strike", "name": "Phá Không Ngự Kích"},
	{"id": "skill.dao.artifact.sync", "name": "Bách Khí Đồng Minh"},
	{"id": "skill.dao.artifact.recall", "name": "Quy Khí Hồi Nguyên"},
	{"id": "skill.dao.artifact.split", "name": "Phân Quang Ngự Khí"},
	{"id": "skill.dao.artifact.merge", "name": "Hợp Khí Quy Nhất"},
	{"id": "skill.dao.artifact.suppress", "name": "Vạn Bảo Trấn Không"},
	{"id": "skill.dao.artifact.ultimate", "name": "Chư Thiên Vạn Bảo Triều Tông"},
]

var _screen: CombatScreen
var _banner: Label
var _start_button: Button
var _running := false


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_build()
	await get_tree().process_frame
	await get_tree().process_frame
	_screen.bind(_review_vm())
	await get_tree().process_frame

	if not _screen._player_actor.using_candidate_animation():
		_banner.text = "THIẾU ASSET NGỰ KHÍ CANDIDATE"
		_screen.set_status_message("Hãy cài gói NGUKHI_COMBAT_V1_CANDIDATE_FIXED trước.")
		_start_button.disabled = true
		return

	_banner.text = "NGỰ KHÍ · REVIEW 1×"
	_screen.set_status_message("SPACE hoặc bấm BẮT ĐẦU · ESC để thoát")
	_start_button.grab_focus()


func _build() -> void:
	_screen = COMBAT_SCREEN.new()
	_screen.name = "NguKhiReviewCombatScreen"
	_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(_screen)

	_banner = Label.new()
	_banner.name = "NguKhiReviewBanner"
	_banner.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_banner.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_banner.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_banner.add_theme_font_size_override("font_size", 15)
	_banner.add_theme_color_override("font_color", Color("e7c985"))
	_banner.anchor_left = 0.08
	_banner.anchor_right = 0.92
	_banner.anchor_top = 0.115
	_banner.anchor_bottom = 0.155
	add_child(_banner)

	_start_button = Button.new()
	_start_button.name = "NguKhiReviewStart"
	_start_button.text = "BẮT ĐẦU REVIEW 1×"
	_start_button.custom_minimum_size = Vector2(190, 46)
	_start_button.anchor_left = 0.5
	_start_button.anchor_right = 0.5
	_start_button.anchor_top = 0.5
	_start_button.anchor_bottom = 0.5
	_start_button.offset_left = -95
	_start_button.offset_right = 95
	_start_button.offset_top = -23
	_start_button.offset_bottom = 23
	_start_button.pressed.connect(_request_start)
	add_child(_start_button)


func _unhandled_key_input(event: InputEvent) -> void:
	if not (event is InputEventKey):
		return
	var key := event as InputEventKey
	if not key.pressed or key.echo:
		return
	if key.keycode == KEY_ESCAPE:
		get_tree().quit()
	elif key.keycode == KEY_SPACE or key.keycode == KEY_ENTER:
		_request_start()


func _request_start() -> void:
	if _running or _start_button.disabled:
		return
	_running = true
	_start_button.visible = false
	call_deferred("_run_review")


func _run_review() -> void:
	_screen._player_actor.reset_to_idle()
	_screen._skill_rail.clear_selection()
	for count in [3, 2, 1]:
		_banner.text = "BẮT ĐẦU SAU %d" % count
		_screen.set_status_message("Chuẩn bị quay màn hình...")
		await get_tree().create_timer(0.8).timeout

	_banner.text = "IDLE COMBAT"
	_screen.set_status_message("00/10 · IDLE COMBAT · REVIEW 1×")
	await get_tree().create_timer(3.0).timeout

	for index in range(SEQUENCE.size()):
		var row: Dictionary = SEQUENCE[index]
		var skill_id := str(row.get("id", ""))
		var skill_name := str(row.get("name", skill_id))
		var ordinal := index + 1

		_banner.text = "%02d/10 · %s" % [ordinal, skill_name]
		_screen.set_status_message("%02d/10 · %s · REVIEW 1×" % [ordinal, skill_name])
		_screen._on_combat_event({
			"type": "skill.cast.start",
			"actor": "player",
			"target": "enemy",
			"skill_id": skill_id,
			"skill_name": skill_name,
			"payload": {},
		})

		var actor := _screen._player_actor
		if actor.current_skill_id() != skill_id or actor._sprite == null:
			_banner.text = "%02d/10 · THIẾU ASSET · %s" % [ordinal, skill_name]
			await get_tree().create_timer(2.0).timeout
			actor.reset_to_idle()
			continue

		# Review all authored frames at source SpriteFrames speed.
		# Production Combat keeps its own registry speed_scale; this override exists
		# only inside this debug showcase.
		actor._sprite.speed_scale = 1.0
		await actor._sprite.animation_finished
		await get_tree().create_timer(0.75).timeout

	_screen._player_actor.reset_to_idle()
	_screen._skill_rail.clear_selection()
	_banner.text = "HOÀN TẤT · IDLE + 10 SKILL"
	_screen.set_status_message("Video review đã chạy hết · SPACE để chạy lại · ESC để thoát")
	_start_button.text = "CHẠY LẠI"
	_start_button.visible = true
	_start_button.grab_focus()
	_running = false


func _review_vm() -> Dictionary:
	var skills: Array = [
		_skill("skill.dao.artifact.basic", "Ngự Khí Linh Chỉ", "basic"),
		_skill("skill.dao.artifact.deploy", "Phân Khí Thành Binh", "active"),
		_skill("skill.dao.artifact.guard", "Huyền Kính Hộ Chủ", "active"),
		_skill("skill.dao.artifact.strike", "Phá Không Ngự Kích", "active"),
		_skill("skill.dao.artifact.sync", "Bách Khí Đồng Minh", "active"),
		_skill("skill.dao.artifact.recall", "Quy Khí Hồi Nguyên", "active"),
		_skill("skill.dao.artifact.ultimate", "Chư Thiên Vạn Bảo Triều Tông", "ultimate"),
	]
	return {
		"ok": true,
		"mode": "playback",
		"encounter_id": "debug.ngukhi.showcase",
		"main_dao_id": "artifact",
		"environment": {
			"map_id": "debug.ngukhi",
			"major_realm_index": 1,
			"realm_name": "Phàm Nhân",
			"biome_name": "Thanh Hư Sơn Mạch",
			"zone": 1,
			"zone_name": "Phàm Vực",
			"zone_floor": 1,
			"local_floor": 1,
			"primary_element": "Wood",
		},
		"challenge": {
			"can_start": true,
			"blocked_reason": "",
			"floor": 1,
			"zone_floor": 1,
			"zone_name": "Phàm Vực",
		},
		"player": {
			"id": "player",
			"name": "Ngự Khí Tu Sĩ",
			"hp": {"current": 1371, "max": 1371, "ratio": 1.0, "display_current": "1.37K", "display_max": "1.37K"},
			"spirit": {"current": 139, "max": 139, "ratio": 1.0, "display_current": "139", "display_max": "139"},
			"ultimate": {"current": 100.0, "max": 100.0, "ratio": 1.0, "ready": true},
		},
		"enemy": {
			"id": "debug.target",
			"name": "Mục Tiêu Review",
			"level": 1,
			"grade": "Boss",
			"grade_id": "boss",
			"archetype_id": "serpent",
			"elements": ["Wood"],
			"hp": {"current": 9999, "max": 9999, "ratio": 1.0, "display_current": "9.99K", "display_max": "9.99K"},
			"break": {"ratio": 1.0, "state": "stable"},
		},
		"skills": skills,
		"dao": {
			"id": "artifact",
			"label": "Ngự Khí Đạo",
			"anchor_kind": "sources",
			"meters": [
				{"id": "artifactSourcesV2", "label": "Khí Linh", "value": 3.0, "max": 3.0, "ratio": 1.0, "target_owned": false},
				{"id": "artifactPassiveStack", "label": "Khí Cảm", "value": 20.0, "max": 20.0, "ratio": 1.0, "target_owned": false},
			],
			"flags": [{"id": "artifactMergeActive", "label": "Đại Khí Linh", "active": false}],
			"detail": {"mergedFrom": 0},
		},
		"auto": {"enabled": true},
		"boss": {"isBoss": true},
		"result": {},
	}


func _skill(id: String, title: String, slot_class: String) -> Dictionary:
	return {
		"id": id,
		"name": title,
		"dao_id": "artifact",
		"slot_class": slot_class,
		"form": "instant",
		"cooldown_total": 0.0,
		"cooldown_remaining": 0.0,
		"spirit_cost": 0.0,
		"ready": true,
		"blocked_reason": "",
		"cast_state": "idle",
		"channel_state": "idle",
		"auto_selected": false,
	}
