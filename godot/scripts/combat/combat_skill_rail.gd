extends VBoxContainer
class_name CombatSkillRail

const TEXT := Color("f7f2e8")
const MUTED := Color("93a4b0")
const GOLD := Color("e3bf70")
const CYAN := Color("70d9ff")

var _active_row: HBoxContainer
var _utility_row: HBoxContainer
var _cards: Dictionary = {}


func _ready() -> void:
	add_theme_constant_override("separation", 5)
	_active_row = HBoxContainer.new()
	_active_row.add_theme_constant_override("separation", 4)
	add_child(_active_row)

	_utility_row = HBoxContainer.new()
	_utility_row.add_theme_constant_override("separation", 6)
	add_child(_utility_row)


func bind(skills: Array, auto_enabled: bool = true) -> void:
	_clear_row(_active_row)
	_clear_row(_utility_row)
	_cards.clear()

	var basics: Array = []
	var actives: Array = []
	var ultimates: Array = []
	for raw in skills:
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var skill: Dictionary = raw
		match str(skill.get("slot_class", "active")):
			"basic":
				basics.append(skill)
			"ultimate":
				ultimates.append(skill)
			_:
				actives.append(skill)

	for skill in actives.slice(0, 5):
		var card := _skill_card(skill, false)
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		_active_row.add_child(card)

	for skill in basics.slice(0, 1):
		var card := _skill_card(skill, false)
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		_utility_row.add_child(card)

	var auto_panel := PanelContainer.new()
	auto_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	auto_panel.custom_minimum_size = Vector2(0, 42)
	auto_panel.add_theme_stylebox_override("panel", _card_style(CYAN, false))
	var auto_label := Label.new()
	auto_label.text = "AUTO\n%s" % ("ĐANG BẬT" if auto_enabled else "TẮT")
	auto_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	auto_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	auto_label.add_theme_color_override("font_color", CYAN if auto_enabled else MUTED)
	auto_label.add_theme_font_size_override("font_size", 9)
	auto_panel.add_child(auto_label)
	_utility_row.add_child(auto_panel)

	for skill in ultimates.slice(0, 1):
		var card := _skill_card(skill, true)
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		_utility_row.add_child(card)


func set_selected_skill(skill_id: String) -> void:
	for id in _cards.keys():
		var card := _cards[id] as PanelContainer
		card.add_theme_stylebox_override("panel", _card_style(GOLD if str(id) == skill_id else CYAN, str(id) == skill_id))


func _skill_card(skill: Dictionary, ultimate: bool) -> PanelContainer:
	var id := str(skill.get("id", ""))
	var card := PanelContainer.new()
	card.custom_minimum_size = Vector2(0, 54 if ultimate else 48)
	card.add_theme_stylebox_override("panel", _card_style(GOLD if ultimate else CYAN, false))

	var col := VBoxContainer.new()
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	col.add_theme_constant_override("separation", 1)
	card.add_child(col)

	var name := Label.new()
	name.text = str(skill.get("name", "Kỹ năng"))
	name.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	name.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	name.add_theme_font_size_override("font_size", 8 if not ultimate else 9)
	name.add_theme_color_override("font_color", GOLD if ultimate else TEXT)
	col.add_child(name)

	var meta := Label.new()
	var cooldown := float(skill.get("cooldown_remaining", 0.0))
	var blocked := str(skill.get("blocked_reason", ""))
	if not blocked.is_empty():
		meta.text = blocked
	elif cooldown > 0.0:
		meta.text = "%.1fs" % cooldown
	elif bool(skill.get("ready", false)):
		meta.text = "SẴN SÀNG"
	else:
		meta.text = "CHỜ"
	meta.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	meta.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	meta.add_theme_font_size_override("font_size", 7)
	meta.add_theme_color_override("font_color", MUTED)
	col.add_child(meta)

	if not id.is_empty():
		_cards[id] = card
	return card


func _clear_row(row: HBoxContainer) -> void:
	for child in row.get_children():
		child.queue_free()


func _card_style(accent: Color, selected: bool) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.012, 0.030, 0.045, 0.94)
	style.border_color = accent if selected else Color(accent.r, accent.g, accent.b, 0.28)
	style.set_border_width_all(2 if selected else 1)
	style.set_corner_radius_all(10)
	return style
