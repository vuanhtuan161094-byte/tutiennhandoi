extends VBoxContainer
class_name CombatDaoWidget

signal payoff_presented(label: String)
const STYLE := preload("res://scripts/combat/combat_style.gd")
const DAO_TITLE := {
	"sword": "KIẾM ĐẠO",
	"fist": "QUYỀN ĐẠO",
	"body": "THỂ ĐẠO",
	"spell": "PHÁP ĐẠO",
	"poison": "ĐỘC ĐẠO",
	"formation": "TRẬN ĐẠO",
	"artifact": "NGỰ KHÍ",
	"mind": "THẦN NIỆM",
}
const SECONDARY_NAME := {
	"swordIntentV2": "Kiếm Ý",
	"fistPassiveStack": "Liên Kình",
	"spellPassiveStack": "Pháp Ý",
	"poisonPassiveStack": "Độc Tức",
	"formationIntegrityV2": "Bền",
	"formationPassiveStack": "Trận Văn",
	"artifactPassiveStack": "Khí Cảm",
	"mindPassiveStack": "Niệm Lực",
}

var _title: Label
var _summary: Label
var _secondary: Label
var _flags: Label
var _detail: Label
var _meter_visual: HBoxContainer
var _meter_segments: Array[ColorRect] = []
var _continuous_meter: ProgressBar
var _dao: Dictionary = {}
var _active_flags: Dictionary = {}
var _accent := STYLE.CYAN
var _last_primary_id := ""
var _last_primary_value := -1.0
var _meter_tween: Tween

func _ready() -> void:
	add_theme_constant_override("separation", 2)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 5)
	add_child(header)
	_title = STYLE.label("", 8, STYLE.GOLD)
	_title.name = "CombatDaoTitle"
	_title.custom_minimum_size = Vector2(58, 0)
	header.add_child(_title)
	_flags = STYLE.label("", 7, STYLE.GOLD)
	_flags.name = "CombatDaoFlags"
	_flags.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_flags.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	header.add_child(_flags)

	var primary_row := HBoxContainer.new()
	primary_row.name = "CombatDaoPrimaryRow"
	primary_row.add_theme_constant_override("separation", 4)
	add_child(primary_row)
	_summary = STYLE.label("", 8, STYLE.CYAN)
	_summary.name = "CombatDaoSummary"
	_summary.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	primary_row.add_child(_summary)
	_meter_visual = HBoxContainer.new()
	_meter_visual.name = "CombatDaoMeterVisual"
	_meter_visual.custom_minimum_size = Vector2(42, 5)
	_meter_visual.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_meter_visual.add_theme_constant_override("separation", 2)
	primary_row.add_child(_meter_visual)
	for i in range(5):
		var segment := ColorRect.new()
		segment.name = "CombatDaoMeterSegment%d" % (i + 1)
		segment.custom_minimum_size = Vector2(6, 4)
		segment.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		segment.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_meter_segments.append(segment)
		_meter_visual.add_child(segment)
	_continuous_meter = STYLE.bar("CombatDaoContinuousMeter", STYLE.CYAN, 6)
	_continuous_meter.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	add_child(_continuous_meter)

	var secondary_row := HBoxContainer.new()
	secondary_row.add_theme_constant_override("separation", 4)
	add_child(secondary_row)
	_secondary = STYLE.label("", 7, STYLE.MUTED)
	_secondary.name = "CombatDaoSecondary"
	_secondary.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	secondary_row.add_child(_secondary)
	_detail = STYLE.label("", 7, STYLE.MUTED)
	_detail.name = "CombatDaoDetail"
	_detail.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	secondary_row.add_child(_detail)

func bind(dao: Dictionary) -> void:
	_dao = dao.duplicate(true)
	_render()

func apply_projection(dao: Dictionary) -> void:
	var previous := _active_flags.duplicate()
	var target_marks: Array = []
	for raw in _dao.get("meters", []):
		if str(raw.get("id", "")) == "mindMarkCount":
			target_marks.append(raw)
	_dao = dao.duplicate(true)
	for mark in target_marks:
		for raw in _dao.get("meters", []):
			if str(raw.get("id", "")) == "mindMarkCount":
				raw.value = mark.get("value", 0)
	_render(true)
	for id in _active_flags:
		if not previous.has(id):
			payoff_presented.emit(str(_active_flags[id]))

func apply_resource(resource_id: String, value: float, maximum: float = -1.0) -> void:
	for raw in _dao.get("meters", []):
		if str(raw.get("id", "")) == resource_id:
			if maximum > 0.0:
				raw["max"] = maximum
			raw["value"] = clampf(value, 0.0, float(raw.get("max", 1.0)))
	_render(true)

func apply_target_mark(stacks: float, maximum: float = 5.0) -> void:
	apply_resource("mindMarkCount", stacks, maximum)

func set_flag(flag_id: String, label: String, active: bool) -> void:
	var flags: Array = _dao.get("flags", [])
	for raw in flags:
		if str(raw.get("id", "")) == flag_id:
			raw.active = active
			_render()
			return
	flags.append({"id": flag_id, "label": label, "active": active})
	_dao["flags"] = flags
	_render()

func _render(animate_change: bool = false) -> void:
	var id := str(_dao.get("id", ""))
	_accent = _accent_for(id)
	_title.text = DAO_TITLE.get(id, str(_dao.get("label", "Bản Đạo")).to_upper())
	_title.tooltip_text = str(_dao.get("label", _title.text))
	_title.add_theme_color_override("font_color", _accent)
	_summary.add_theme_color_override("font_color", _accent)
	var primary: Dictionary = {}
	var secondary: Array[String] = []
	for raw in _dao.get("meters", []):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		if primary.is_empty():
			primary = raw
		else:
			var meter_id := str(raw.get("id", ""))
			var label := str(SECONDARY_NAME.get(meter_id, raw.get("label", meter_id)))
			secondary.append("%s %d/%d" % [label, roundi(float(raw.get("value", 0))), roundi(float(raw.get("max", 1)))])
	var current_id := str(primary.get("id", ""))
	var current_value := float(primary.get("value", 0))
	var maximum := maxf(1.0, float(primary.get("max", 1)))
	if not primary.is_empty():
		_summary.text = "%s %d/%d" % [str(primary.get("label", current_id)), roundi(current_value), roundi(maximum)]
		_summary.tooltip_text = "%s · %d trên %d" % [str(primary.get("label", current_id)), roundi(current_value), roundi(maximum)]
		var discrete := maximum <= 5.0 and is_equal_approx(maximum, roundf(maximum))
		_meter_visual.visible = discrete
		_meter_visual.tooltip_text = _summary.tooltip_text
		_continuous_meter.visible = not discrete
		_continuous_meter.tooltip_text = _summary.tooltip_text
		for i in range(_meter_segments.size()):
			var segment := _meter_segments[i]
			segment.visible = discrete and i < int(maximum)
			segment.color = _accent if i < int(current_value) else Color(_accent, 0.20)
			segment.tooltip_text = _summary.tooltip_text
		if not discrete:
			_continuous_meter.max_value = maximum
			_continuous_meter.value = clampf(current_value, 0.0, maximum)
			var track := _continuous_meter.get_theme_stylebox("background") as StyleBoxFlat
			if track != null:
				track.bg_color = Color(_accent, 0.22)
				track.set_border_width_all(1)
				track.border_color = Color(_accent, 0.48)
			var fill := _continuous_meter.get_theme_stylebox("fill") as StyleBoxFlat
			if fill != null:
				fill.bg_color = _accent
	else:
		_summary.text = ""
		_summary.tooltip_text = ""
		_meter_visual.visible = false
		_continuous_meter.visible = false
	_secondary.text = " · ".join(secondary)
	_secondary.tooltip_text = _secondary.text
	(_secondary.get_parent() as Control).visible = not secondary.is_empty() or not str(_dao.get("detail", {}).get("expectedForm", "")).is_empty()
	_active_flags.clear()
	for raw in _dao.get("flags", []):
		if bool(raw.get("active", false)):
			_active_flags[str(raw.get("id", ""))] = str(raw.get("label", ""))
	_flags.text = " · ".join(_active_flags.values())
	_flags.tooltip_text = _flags.text
	_flags.visible = not _active_flags.is_empty()
	_flags.add_theme_color_override("font_color", _accent)
	var detail: Dictionary = _dao.get("detail", {})
	_detail.text = str(detail.get("expectedForm", ""))
	_detail.tooltip_text = _detail.text
	visible = not _dao.get("meters", []).is_empty()
	if animate_change and current_id == _last_primary_id and not is_equal_approx(current_value, _last_primary_value):
		_pulse_meter()
	_last_primary_id = current_id
	_last_primary_value = current_value

func _accent_for(id: String) -> Color:
	match id:
		"sword": return Color("69cbd4")
		"fist": return Color("e3b16a")
		"body": return Color("dc7465")
		"spell": return Color("a993e8")
		"poison": return Color("82c988")
		"formation": return Color("79aee0")
		"artifact": return Color("81d8eb")
		"mind": return Color("c091e8")
		_: return STYLE.CYAN

func _pulse_meter() -> void:
	if _meter_tween != null and _meter_tween.is_valid():
		_meter_tween.kill()
	var target: Control = _continuous_meter if _continuous_meter.visible else _meter_visual
	target.modulate = Color("fff1cc")
	_meter_tween = create_tween()
	_meter_tween.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	_meter_tween.tween_property(target, "modulate", Color.WHITE, 0.28)
