extends Control

signal retreat_hours_selected(hours: int)

const GOLD := Color("e3bf70")
const GOLD_HI := Color("f5ddb0")
const CYAN := Color("8fd7f5")
const TEXT := Color("f6f1e7")
const MUTED := Color("aebbb8")

var _active: Control

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE

func show_identity(vm: Dictionary) -> void:
	var identity: Dictionary = vm.get("identity", {})
	var progression: Dictionary = vm.get("progression", {})
	var context: Dictionary = vm.get("context", {})
	var build: Dictionary = context.get("build", {})

	var lines := []
	lines.append("%s · Đời %d" % [str(identity.get("name", "Tu Sĩ")), int(identity.get("life_number", 1))])
	lines.append("Cảnh giới · %s" % str(identity.get("realm", "Phàm Nhân")))
	lines.append("Linh Căn · %s" % str(identity.get("root_name", "Phàm Căn")))

	var technique := str(context.get("active_technique", ""))
	if not technique.is_empty():
		lines.append("Công pháp · %s" % _humanize_id(technique))

	lines.append("Tuổi · %.1f / %.1f năm" % [
		float(progression.get("age_years", 0)),
		float(progression.get("lifespan_years", 0))
	])
	lines.append("Thọ nguyên còn · %.1f năm" % float(progression.get("remaining_life_years", 0)))

	var injury := float(progression.get("injury_pct", 0))
	if injury > 0:
		lines.append("Thương Thế · %.0f%%" % injury)

	var build_identity := str(build.get("identity", ""))
	if not build_identity.is_empty():
		lines.append("")
		lines.append("Thiên hướng · %s" % _humanize_id(build_identity))
	var strongest := str(build.get("strongestAxis", ""))
	if not strongest.is_empty():
		lines.append("Điểm mạnh · %s" % _humanize_id(strongest))
	var bottleneck := str(build.get("bottleneckAxis", ""))
	if not bottleneck.is_empty():
		lines.append("Nút thắt · %s" % _humanize_id(bottleneck))

	_open_sheet(str(identity.get("realm", "Hồ Sơ")), "HỒ SƠ ĐỜI HIỆN TẠI", lines, 405.0)

func show_cultivation(vm: Dictionary) -> void:
	var progression: Dictionary = vm.get("progression", {})
	var context: Dictionary = vm.get("context", {})
	var retreat: Dictionary = progression.get("retreat", {})

	var lines := []
	lines.append("Tu Vi · %s / %s" % [
		_fmt_num(float(progression.get("tu_vi", 0))),
		_fmt_num(float(progression.get("required_tu_vi", 0)))
	])
	lines.append("Tốc độ · +%s / 15 giây" % _fmt_num(float(progression.get("rate_per_15s", 0))))
	lines.append("Dự kiến · %s" % _duration(float(progression.get("eta_seconds", 0))))

	if bool(retreat.get("enabled", false)):
		lines.append("")
		lines.append("Bế Quan · %.2f / %.0f giờ" % [
			float(retreat.get("bank_hours", 0)),
			float(retreat.get("cap_hours", 9))
		])
		lines.append("+%.0f giờ/ngày · 3 giờ ≈ %.2f%% yêu cầu cảnh giới" % [
			float(retreat.get("daily_hours", 3)),
			float(retreat.get("reward_pct_3h", 0))
		])

	var sources = progression.get("rate_sources", [])
	if typeof(sources) == TYPE_ARRAY and not sources.is_empty():
		lines.append("")
		lines.append("NGUỒN TỐC ĐỘ")
		for source in sources:
			if typeof(source) != TYPE_DICTIONARY:
				continue
			var source_dict: Dictionary = source
			var label := str(source_dict.get("label", source_dict.get("id", "")))
			if label.is_empty():
				continue
			lines.append("• %s  %s" % [_humanize_id(label), _fmt_num(float(source_dict.get("value", 0)))])

	var hints = context.get("hints", [])
	if typeof(hints) == TYPE_ARRAY and not hints.is_empty():
		lines.append("")
		lines.append("GỢI Ý")
		for hint in hints.slice(0, 3):
			lines.append("• %s" % str(hint))

	_open_sheet("Tu Luyện", "CHI TIẾT TU LUYỆN", lines, 405.0)

func show_retreat(vm: Dictionary) -> void:
	var progression: Dictionary = vm.get("progression", {})
	var retreat: Dictionary = progression.get("retreat", {})
	if not bool(retreat.get("enabled", false)):
		return

	close_all()
	var root := _make_overlay()
	_active = root

	var card := _sheet_panel(Vector2(28, 486), Vector2(334, 326))
	root.add_child(card)
	var col := _sheet_column(card)

	var eyebrow := _label("BẾ QUAN", 9, GOLD)
	eyebrow.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(eyebrow)

	var title := _label("Chọn thời gian nhập định", 20, GOLD_HI)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(title)

	var bank := float(retreat.get("bank_hours", 0))
	var cap := float(retreat.get("cap_hours", 9))
	var summary := _label("%.2f / %.0f giờ tích lũy" % [bank, cap], 11, TEXT)
	summary.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(summary)

	var info := _label("+%.0fh/ngày  ·  3h ≈ %.2f%% yêu cầu cảnh giới" % [
		float(retreat.get("daily_hours", 3)),
		float(retreat.get("reward_pct_3h", 0))
	], 8, MUTED)
	info.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(info)

	var choices := HBoxContainer.new()
	choices.add_theme_constant_override("separation", 6)
	col.add_child(choices)
	for hour in [1, 3, 6, 9]:
		if float(hour) > cap:
			continue
		var button := Button.new()
		button.text = "%dh" % hour
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.custom_minimum_size = Vector2(0, 48)
		button.disabled = bank < float(hour)
		button.add_theme_font_size_override("font_size", 12)
		button.add_theme_color_override("font_color", GOLD_HI if hour == 3 else TEXT)
		button.add_theme_stylebox_override("normal", _flat(Color(0.03, 0.08, 0.095, 0.88), 12, Color(0.72, 0.62, 0.38, 0.24), 1))
		button.add_theme_stylebox_override("hover", _flat(Color(0.08, 0.13, 0.14, 0.96), 12, GOLD, 1))
		button.pressed.connect(_select_retreat_hour.bind(hour))
		choices.add_child(button)

	var close := Button.new()
	close.text = "Đóng"
	close.custom_minimum_size = Vector2(0, 40)
	close.add_theme_stylebox_override("normal", _flat(Color(0.04, 0.065, 0.075, 0.72), 12))
	close.pressed.connect(close_all)
	col.add_child(close)

func _select_retreat_hour(hour: int) -> void:
	close_all()
	retreat_hours_selected.emit(hour)

func close_all() -> void:
	if _active != null and is_instance_valid(_active):
		_active.queue_free()
	_active = null

func _open_sheet(title_text: String, eyebrow_text: String, lines: Array, top: float) -> void:
	close_all()
	var root := _make_overlay()
	_active = root

	var card := _sheet_panel(Vector2(24, top), Vector2(342, 844.0 - top))
	root.add_child(card)
	var col := _sheet_column(card)

	var eyebrow := _label(eyebrow_text, 8, GOLD)
	eyebrow.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(eyebrow)

	var title := _label(title_text, 22, GOLD_HI)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(title)

	var detail := RichTextLabel.new()
	detail.bbcode_enabled = false
	detail.fit_content = false
	detail.scroll_active = true
	detail.size_flags_vertical = Control.SIZE_EXPAND_FILL
	detail.custom_minimum_size = Vector2(0, 250)
	detail.add_theme_font_size_override("normal_font_size", 11)
	detail.add_theme_color_override("default_color", TEXT)
	detail.text = "\n".join(PackedStringArray(lines))
	col.add_child(detail)

	var close := Button.new()
	close.text = "Đóng"
	close.custom_minimum_size = Vector2(0, 40)
	close.add_theme_stylebox_override("normal", _flat(Color(0.04, 0.065, 0.075, 0.72), 12))
	close.pressed.connect(close_all)
	col.add_child(close)

func _make_overlay() -> Control:
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_STOP
	root.z_index = 80
	add_child(root)

	var dim := ColorRect.new()
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	dim.color = Color(0.0, 0.018, 0.026, 0.60)
	dim.mouse_filter = Control.MOUSE_FILTER_STOP
	dim.gui_input.connect(func(event):
		if event is InputEventMouseButton and event.pressed:
			close_all()
	)
	root.add_child(dim)
	return root

func _sheet_panel(pos: Vector2, size_value: Vector2) -> PanelContainer:
	var card := PanelContainer.new()
	card.position = pos
	card.size = size_value
	card.mouse_filter = Control.MOUSE_FILTER_STOP
	card.add_theme_stylebox_override("panel", _flat(Color(0.007, 0.030, 0.043, 0.985), 22, Color(0.84, 0.70, 0.40, 0.38), 1))
	return card

func _sheet_column(card: PanelContainer) -> VBoxContainer:
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 18)
	margin.add_theme_constant_override("margin_right", 18)
	margin.add_theme_constant_override("margin_top", 15)
	margin.add_theme_constant_override("margin_bottom", 15)
	card.add_child(margin)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 10)
	margin.add_child(col)
	return col

func _humanize_id(value: String) -> String:
	return value.replace("_", " ").replace(".", " · ").capitalize()

func _duration(seconds: float) -> String:
	var total := maxi(0, int(ceil(seconds)))
	if total < 60:
		return "%d giây" % total
	if total < 3600:
		return "%d phút %d giây" % [floori(total / 60.0), total % 60]
	return "%d giờ %d phút" % [floori(total / 3600.0), floori((total % 3600) / 60.0)]

func _fmt_num(value: float) -> String:
	var raw := str(int(round(value)))
	var out := ""
	var count := 0
	for i in range(raw.length() - 1, -1, -1):
		if count > 0 and count % 3 == 0:
			out = "." + out
		out = raw.substr(i, 1) + out
		count += 1
	return out

func _label(value: String, size: int, color: Color) -> Label:
	var label := Label.new()
	label.text = value
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", color)
	return label

func _flat(fill: Color, radius: int, border: Color = Color.TRANSPARENT, border_width: int = 0) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = fill
	style.corner_radius_top_left = radius
	style.corner_radius_top_right = radius
	style.corner_radius_bottom_left = radius
	style.corner_radius_bottom_right = radius
	style.border_color = border
	style.border_width_left = border_width
	style.border_width_top = border_width
	style.border_width_right = border_width
	style.border_width_bottom = border_width
	return style
