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

func _ready() -> void:
	add_theme_constant_override("separation", 4)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	title = STYLE.label("CHỜ GIAO TRANH", 11, STYLE.MUTED)
	title.name = "CombatTacticalLane"
	title.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(title)
	progress = STYLE.bar("CombatCastProgress", STYLE.RED, 4)
	progress.visible = false
	add_child(progress)
	detail = STYLE.label("", 9, STYLE.MUTED)
	detail.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(detail)
	set_process(false)

func reset() -> void:
	_priority = 0
	_remaining = 0.0
	title.text = "CHỜ GIAO TRANH"
	title.add_theme_font_size_override("font_size", 11)
	title.add_theme_color_override("font_color", STYLE.MUTED)
	queue_redraw()
	detail.text = ""
	progress.visible = false
	set_process(false)

func present(event: Dictionary) -> void:
	var type := str(event.get("type", ""))
	var payload: Dictionary = event.get("payload", {})
	var priority := 0
	var text := ""
	var caption := ""
	var duration := 0.0
	match type:
		"battle.start":
			text = "GIAO TRANH"
		"skill.cast.start":
			priority = 5 if bool(payload.get("bossTelegraph", false)) else 1
			text = str(event.get("skill_name", "THI TRIỂN"))
			caption = str(payload.get("bossDangerLabel", "THI TRIỂN"))
			duration = maxf(0.0, float(payload.get("castTime", 0.0)))
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
			text = "KẾT THÚC"
		_:
			return
	if text.is_empty() or (priority < _priority and _remaining > 0.0):
		return
	_priority = priority
	_duration = duration
	_remaining = duration if duration > 0.0 else 1.25
	title.text = text
	title.add_theme_font_size_override("font_size", 13)
	queue_redraw()
	title.add_theme_color_override("font_color", STYLE.RED if priority == 5 else STYLE.CYAN)
	detail.text = caption
	progress.visible = duration > 0.0
	progress.value = 0.0
	set_process(true)

func _process(delta: float) -> void:
	_remaining = maxf(0.0, _remaining - delta)
	if _duration > 0.0:
		progress.value = clampf(1.0 - _remaining / _duration, 0.0, 1.0) * 100.0
	if _remaining <= 0.0:
		_priority = 0
		queue_redraw()
		progress.visible = false
		detail.text = ""
		set_process(false)

func _draw() -> void:
	var accent := STYLE.RED if _priority == 5 else STYLE.GOLD
	var height := 48.0 if progress != null and progress.visible else 30.0
	var rect := Rect2(Vector2(0, (size.y - height) / 2.0), Vector2(size.x, height))
	draw_style_box(STYLE.surface(accent, 0.55 if _priority > 0 else 0.20), rect)
	draw_line(rect.position + Vector2(16, 0), rect.position + Vector2(size.x - 16, 0), Color(accent, 0.50 if _priority > 0 else 0.18), 1.0)
