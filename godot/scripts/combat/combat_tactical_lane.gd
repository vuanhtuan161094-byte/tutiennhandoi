extends VBoxContainer
class_name CombatTacticalLane
## Priority and display lifetime only. Progress uses an exported cast duration.

const STYLE := preload("res://scripts/combat/combat_style.gd")
var title: Label
var detail: Label
var progress: ProgressBar
var _priority := 0
var _remaining := 0.0
var _duration := 0.0
var _danger_level := ""

func _ready() -> void:
	add_theme_constant_override("separation", 3)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	title = STYLE.label("", 11, STYLE.MUTED)
	title.name = "CombatTacticalLane"
	title.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(title)
	progress = STYLE.bar("CombatCastProgress", STYLE.RED, 4)
	progress.visible = false
	add_child(progress)
	detail = STYLE.label("", 8, STYLE.MUTED)
	detail.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(detail)
	set_process(false)

func reset() -> void:
	_priority = 0
	_remaining = 0.0
	_duration = 0.0
	_danger_level = ""
	title.text = ""
	title.add_theme_font_size_override("font_size", 11)
	title.add_theme_color_override("font_color", STYLE.MUTED)
	detail.text = ""
	progress.visible = false
	set_process(false)
	queue_redraw()

func present(event: Dictionary) -> void:
	var type := str(event.get("type", ""))
	var payload: Dictionary = event.get("payload", {})
	var priority := 0
	var text := ""
	var caption := ""
	var duration := 0.0
	match type:
		"battle.start":
			priority = 1
			text = "GIAO TRANH"
		"skill.cast.start":
			priority = 5 if bool(payload.get("bossTelegraph", false)) else 1
			text = str(event.get("skill_name", ""))
			if text.is_empty():
				text = "BOSS · VẬN CHIÊU" if priority == 5 else "THI TRIỂN"
			caption = str(payload.get("bossDangerLabel", "SẮP THI TRIỂN")) if priority == 5 else ""
			duration = maxf(0.0, float(payload.get("castTime", 0.0)))
			_danger_level = str(payload.get("bossDangerLevel", "warning")) if priority == 5 else ""
		"boss.counter", "combat.interrupt":
			priority = 4
			text = "CỬA PHẢN CÔNG" if type == "boss.counter" else "NGẮT CHIÊU"
		"combat.break":
			if str(payload.get("breakState", "")) == "broken":
				priority = 3
				text = "THẤT THẾ"
		"boss.phase":
			priority = 3
			text = str(payload.get("phaseName", "BOSS CHUYỂN PHA"))
		"combat.shield.break":
			priority = 2
			text = "PHÁ KHIÊN"
		"combat.daoPayoff":
			priority = 2
			text = str(event.get("label", ""))
		"battle.end":
			_remaining = 0.0
			priority = 1
			text = "KẾT THÚC"
		_:
			return
	if text.is_empty() or (priority < _priority and _remaining > 0.0):
		return
	_priority = priority
	_duration = duration
	_remaining = duration if duration > 0.0 else 1.05
	title.text = text
	title.add_theme_font_size_override("font_size", 14 if priority == 5 else 12)
	title.add_theme_color_override("font_color", _danger_color() if priority == 5 else STYLE.CYAN)
	detail.text = caption
	progress.visible = duration > 0.0
	progress.value = 0.0
	set_process(true)
	queue_redraw()

func _process(delta: float) -> void:
	_remaining = maxf(0.0, _remaining - delta)
	if _duration > 0.0:
		progress.value = clampf(1.0 - _remaining / _duration, 0.0, 1.0) * 100.0
	if _remaining <= 0.0:
		_priority = 0
		_duration = 0.0
		_danger_level = ""
		progress.visible = false
		detail.text = ""
		title.text = ""
		set_process(false)
		queue_redraw()

func _draw() -> void:
	if _priority <= 0:
		return
	var accent := _danger_color() if _priority == 5 else STYLE.GOLD
	var height := 50.0 if progress != null and progress.visible else 30.0
	var rect := Rect2(Vector2(0, (size.y - height) / 2.0), Vector2(size.x, height))
	draw_style_box(STYLE.overlay_surface(accent, 0.62 if _priority == 5 else 0.44, 5), rect)
	draw_line(rect.position + Vector2(22, 0), rect.position + Vector2(size.x - 22, 0), Color(accent, 0.62), 1.0)

func _danger_color() -> Color:
	match _danger_level:
		"lethal":
			return STYLE.RED
		"danger":
			return Color("e88a53")
		_:
			return STYLE.GOLD
