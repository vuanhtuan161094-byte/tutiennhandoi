extends VBoxContainer
class_name CombatDaoWidget

signal payoff_presented(label: String)
const STYLE := preload("res://scripts/combat/combat_style.gd")
var _title: Label
var _summary: Label
var _secondary: Label
var _flags: Label
var _detail: Label
var _dao: Dictionary = {}
var _active_flags: Dictionary = {}

func _ready() -> void:
	add_theme_constant_override("separation", 2)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 7)
	add_child(row)
	_title = STYLE.label("", 8, STYLE.GOLD)
	_title.name = "CombatDaoTitle"
	_title.custom_minimum_size = Vector2(58, 0)
	row.add_child(_title)
	_summary = STYLE.label("", 9, STYLE.CYAN)
	_summary.name = "CombatDaoSummary"
	_summary.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(_summary)
	_flags = STYLE.label("", 8, STYLE.GOLD)
	_flags.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	row.add_child(_flags)
	var secondary_row := HBoxContainer.new()
	add_child(secondary_row)
	_secondary = STYLE.label("", 7, STYLE.MUTED)
	_secondary.name = "CombatDaoSecondary"
	_secondary.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	secondary_row.add_child(_secondary)
	_detail = STYLE.label("", 7, STYLE.MUTED)
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
	_render()
	for id in _active_flags:
		if not previous.has(id):
			payoff_presented.emit(str(_active_flags[id]))

func apply_resource(resource_id: String, value: float, maximum: float = -1.0) -> void:
	for raw in _dao.get("meters", []):
		if str(raw.get("id", "")) == resource_id:
			if maximum > 0.0:
				raw["max"] = maximum
			raw["value"] = clampf(value, 0.0, float(raw.get("max", 1.0)))
	_render()

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

func _render() -> void:
	var artifact := str(_dao.get("id", "")) == "artifact"
	_title.text = "NGỰ KHÍ" if artifact else str(_dao.get("label", "Bản Đạo")).to_upper()
	var primary: Array[String] = []
	var secondary: Array[String] = []
	for raw in _dao.get("meters", []):
		var id := str(raw.get("id", ""))
		var value := float(raw.get("value", 0))
		var maximum := float(raw.get("max", 1))
		if artifact and id == "artifactSourcesV2":
			var orbs := ""
			for i in range(3):
				orbs += "◆" if i < int(value) else "◇"
			primary.append("%s %d/%d" % [orbs, int(value), int(maximum)])
		else:
			secondary.append("%s %d/%d" % [str(raw.get("label", id)), int(value), int(maximum)])
	_summary.text = " · ".join(primary)
	_secondary.text = " · ".join(secondary)
	_secondary.get_parent().visible = not secondary.is_empty()
	_active_flags.clear()
	for raw in _dao.get("flags", []):
		if bool(raw.get("active", false)):
			_active_flags[str(raw.get("id", ""))] = str(raw.get("label", ""))
	_flags.text = " · ".join(_active_flags.values())
	_flags.visible = not _active_flags.is_empty()
	var detail: Dictionary = _dao.get("detail", {})
	_detail.text = str(detail.get("expectedForm", ""))
	visible = not _dao.get("meters", []).is_empty()
