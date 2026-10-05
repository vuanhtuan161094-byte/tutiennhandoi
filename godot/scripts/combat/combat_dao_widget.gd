extends PanelContainer
class_name CombatDaoWidget

const TEXT := Color("f7f2e8")
const MUTED := Color("9fb0bd")
const GOLD := Color("e3bf70")
const CYAN := Color("70d9ff")

var _title: Label
var _flags: Label
var _meter_box: VBoxContainer
var _bars: Dictionary = {}
var _value_labels: Dictionary = {}


func _ready() -> void:
	custom_minimum_size = Vector2(0, 92)
	add_theme_stylebox_override("panel", _panel_style())
	_build()


func bind(dao: Dictionary) -> void:
	if _title == null:
		_build()
	_title.text = str(dao.get("label", "Bản Đạo"))
	_title.tooltip_text = "Anchor · %s" % str(dao.get("anchor_kind", "self"))

	for child in _meter_box.get_children():
		child.queue_free()
	_bars.clear()
	_value_labels.clear()

	var meters = dao.get("meters", [])
	if typeof(meters) == TYPE_ARRAY:
		for raw in meters:
			if typeof(raw) == TYPE_DICTIONARY:
				_add_meter(raw)

	var active_flags: Array[String] = []
	var flags = dao.get("flags", [])
	if typeof(flags) == TYPE_ARRAY:
		for raw in flags:
			if typeof(raw) == TYPE_DICTIONARY and bool(raw.get("active", false)):
				active_flags.append(str(raw.get("label", "")))
	_flags.text = " · ".join(active_flags)
	_flags.visible = not active_flags.is_empty()


func apply_resource(resource_id: String, value: float, maximum: float = -1.0) -> void:
	if not _bars.has(resource_id):
		return
	var bar := _bars[resource_id] as ProgressBar
	var max_value := maximum if maximum > 0.0 else bar.max_value
	bar.max_value = maxf(1.0, max_value)
	bar.value = clampf(value, 0.0, bar.max_value)
	var label := _value_labels.get(resource_id) as Label
	if label != null:
		label.text = "%s/%s" % [_fmt(bar.value), _fmt(bar.max_value)]


func apply_target_mark(stacks: float, maximum: float = 5.0) -> void:
	apply_resource("mindMarkCount", stacks, maximum)


func set_flag(flag_id: String, label: String, active: bool) -> void:
	set_meta("flag:%s" % flag_id, active)
	if active:
		_flags.text = label
		_flags.visible = true


func _build() -> void:
	if get_child_count() > 0:
		return
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 10)
	margin.add_theme_constant_override("margin_right", 10)
	margin.add_theme_constant_override("margin_top", 7)
	margin.add_theme_constant_override("margin_bottom", 7)
	add_child(margin)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 4)
	margin.add_child(col)

	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 8)
	col.add_child(head)

	_title = Label.new()
	_title.text = "Bản Đạo"
	_title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_title.add_theme_color_override("font_color", GOLD)
	_title.add_theme_font_size_override("font_size", 13)
	head.add_child(_title)

	_flags = Label.new()
	_flags.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_flags.add_theme_color_override("font_color", CYAN)
	_flags.add_theme_font_size_override("font_size", 10)
	head.add_child(_flags)

	_meter_box = VBoxContainer.new()
	_meter_box.add_theme_constant_override("separation", 3)
	col.add_child(_meter_box)


func _add_meter(raw: Dictionary) -> void:
	var resource_id := str(raw.get("id", ""))
	if resource_id.is_empty():
		return
	var maximum := maxf(1.0, float(raw.get("max", 1.0)))
	var value := clampf(float(raw.get("value", 0.0)), 0.0, maximum)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	_meter_box.add_child(row)

	var name := Label.new()
	name.text = str(raw.get("label", resource_id))
	name.custom_minimum_size = Vector2(72, 0)
	name.add_theme_color_override("font_color", TEXT if not bool(raw.get("target_owned", false)) else CYAN)
	name.add_theme_font_size_override("font_size", 9)
	row.add_child(name)

	var bar := ProgressBar.new()
	bar.show_percentage = false
	bar.min_value = 0.0
	bar.max_value = maximum
	bar.value = value
	bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	bar.custom_minimum_size = Vector2(0, 9)
	row.add_child(bar)

	var value_label := Label.new()
	value_label.text = "%s/%s" % [_fmt(value), _fmt(maximum)]
	value_label.custom_minimum_size = Vector2(46, 0)
	value_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	value_label.add_theme_color_override("font_color", MUTED)
	value_label.add_theme_font_size_override("font_size", 8)
	row.add_child(value_label)

	_bars[resource_id] = bar
	_value_labels[resource_id] = value_label


func _fmt(value: float) -> String:
	return str(int(round(value))) if is_equal_approx(value, round(value)) else "%.1f" % value


func _panel_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.015, 0.035, 0.055, 0.90)
	style.border_color = Color(0.48, 0.66, 0.76, 0.24)
	style.set_border_width_all(1)
	style.set_corner_radius_all(12)
	return style
