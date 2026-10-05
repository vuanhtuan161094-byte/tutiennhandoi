extends Control
class_name CombatSkillSlot
## Read-only icon surface. Cooldown/readiness come from the VM, never a local clock.

const STYLE := preload("res://scripts/combat/combat_style.gd")
var skill: Dictionary = {}
var selected := false
var ultimate := false
var gauge := 0.0
var gauge_max := 100.0
var slot_index := 0
var _icon: Texture2D
var _state: Label
var _gauge_text: Label

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	custom_minimum_size = Vector2(54, 66) if ultimate else Vector2(44, 44)
	_state = STYLE.label("", 9)
	_state.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_state.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_state.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_state.offset_bottom = -12 if ultimate else 0
	add_child(_state)
	if slot_index > 0:
		var ordinal := STYLE.label(str(slot_index), 7, STYLE.MUTED)
		ordinal.position = Vector2(5, 1)
		add_child(ordinal)
	if ultimate:
		_gauge_text = STYLE.label("0/100", 9, STYLE.GOLD)
		_gauge_text.name = "CombatUltimateGauge"
		_gauge_text.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
		_gauge_text.offset_top = -12
		_gauge_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		add_child(_gauge_text)

func bind(data: Dictionary) -> void:
	skill = data.duplicate(true)
	tooltip_text = str(skill.get("name", "Ô chưa trang bị"))
	_icon = null
	var icon_path := str(skill.get("icon_path", ""))
	if not icon_path.is_empty() and ResourceLoader.exists(icon_path):
		_icon = load(icon_path) as Texture2D
	var remaining := float(skill.get("cooldown_remaining", 0.0))
	var blocked := str(skill.get("blocked_reason", ""))
	if remaining > 0.0:
		_state.text = "%.1fs" % remaining
	elif blocked != "" and blocked != "AUTO":
		_state.text = "×"
	elif str(skill.get("channel_state", "idle")) not in ["idle", ""]:
		_state.text = "DẪN"
	elif str(skill.get("cast_state", "idle")) not in ["idle", ""]:
		_state.text = "THI"
	else:
		_state.text = "" if not skill.is_empty() else "—"
	queue_redraw()

func set_selected(value: bool) -> void:
	selected = value
	queue_redraw()

func set_gauge(data: Dictionary) -> void:
	gauge_max = maxf(1.0, float(data.get("max", 100.0)))
	gauge = clampf(float(data.get("current", 0.0)), 0.0, gauge_max)
	if _gauge_text != null:
		_gauge_text.text = "%d/%d" % [int(round(gauge)), int(round(gauge_max))]
	queue_redraw()

func _draw() -> void:
	var side := 54.0 if ultimate else 44.0
	var rect := Rect2(Vector2((size.x - side) / 2.0, 0), Vector2(side, side))
	var accent := STYLE.GOLD if ultimate or selected else STYLE.CYAN
	var style := STYLE.surface(accent, 0.40)
	style.border_color = Color(accent, 0.88 if selected else 0.30)
	if selected or (ultimate and gauge >= gauge_max and not skill.is_empty()):
		style.shadow_color = Color(accent, 0.17)
		style.shadow_size = 4
	draw_style_box(style, rect)
	if not skill.is_empty():
		if _icon != null:
			draw_texture_rect(_icon, rect.grow(-5), false)
		else:
			# Temporary clean sigil; replaceable icon surface, not permanent skill art.
			var center := rect.get_center()
			draw_arc(center, side * 0.24, 0.2, TAU - 0.2, 24, Color(accent, 0.70), 1.0, true)
			draw_line(center + Vector2(-8, 8), center + Vector2(8, -8), Color(accent, 0.65), 2.0, true)
			draw_line(center + Vector2(0, -11), center + Vector2(0, 11), Color(accent, 0.30), 1.0, true)
	var remaining := float(skill.get("cooldown_remaining", 0.0))
	if remaining > 0.0:
		draw_rect(rect.grow(-1), Color(0, 0, 0, 0.58))
		var total := maxf(remaining, float(skill.get("cooldown_total", remaining)))
		draw_arc(rect.get_center(), side * 0.40, -PI / 2, -PI / 2 + TAU * remaining / total, 32, STYLE.MUTED, 2.0, true)
	elif skill.is_empty() or (not bool(skill.get("ready", false)) and str(skill.get("blocked_reason", "")) != "AUTO"):
		draw_rect(rect.grow(-1), Color(0, 0, 0, 0.30))
	if ultimate:
		draw_arc(rect.get_center(), side * 0.44, -PI / 2, -PI / 2 + TAU * gauge / gauge_max, 32, Color(STYLE.GOLD, 0.85), 2.0, true)

