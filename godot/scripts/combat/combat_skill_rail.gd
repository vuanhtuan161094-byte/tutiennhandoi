extends VBoxContainer
class_name CombatSkillRail

const STYLE := preload("res://scripts/combat/combat_style.gd")
const SLOT := preload("res://scripts/combat/combat_skill_slot.gd")
var _active_row: HBoxContainer
var _utility_row: HBoxContainer
var _cards: Dictionary = {}
var _active_slots: Array[CombatSkillSlot] = []
var _basic: CombatSkillSlot
var _ultimate: CombatSkillSlot
var _auto: Label

func _ready() -> void:
	add_theme_constant_override("separation", 6)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_active_row = HBoxContainer.new()
	_active_row.name = "CombatActiveRow"
	_active_row.add_theme_constant_override("separation", 6)
	add_child(_active_row)
	for i in range(5):
		var slot := SLOT.new()
		slot.name = "CombatActive%d" % (i + 1)
		slot.slot_index = i + 1
		slot.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		_active_slots.append(slot)
		_active_row.add_child(slot)
	_utility_row = HBoxContainer.new()
	_utility_row.name = "CombatUtilityRow"
	_utility_row.add_theme_constant_override("separation", 8)
	add_child(_utility_row)
	_basic = SLOT.new()
	_basic.name = "CombatBasic"
	_basic.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_utility_row.add_child(_basic)
	var basic_caption := STYLE.label("BASIC", 8, STYLE.MUTED)
	basic_caption.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_utility_row.add_child(basic_caption)
	_auto = STYLE.label("AUTO ON", 10, STYLE.CYAN)
	_auto.name = "CombatAutoStatus"
	_auto.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_auto.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_auto.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_utility_row.add_child(_auto)
	var ult_caption := STYLE.label("ULT", 8, STYLE.GOLD)
	ult_caption.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_utility_row.add_child(ult_caption)
	_ultimate = SLOT.new()
	_ultimate.name = "CombatUltimate"
	_ultimate.ultimate = true
	_utility_row.add_child(_ultimate)

func bind(skills: Array, auto_enabled: bool = true) -> void:
	_cards.clear()
	var actives: Array = []
	var basic: Dictionary = {}
	var ultimate: Dictionary = {}
	for raw in skills:
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		match str(raw.get("slot_class", "active")):
			"basic": basic = raw
			"ultimate": ultimate = raw
			_: actives.append(raw)
	for i in range(5):
		_bind_slot(_active_slots[i], actives[i] if i < actives.size() else {})
	_bind_slot(_basic, basic)
	_bind_slot(_ultimate, ultimate)
	_auto.text = "AUTO ON" if auto_enabled else "AUTO OFF"

func _bind_slot(slot: CombatSkillSlot, data: Dictionary) -> void:
	slot.bind(data)
	slot.set_selected(bool(data.get("auto_selected", false)))
	var id := str(data.get("id", ""))
	if not id.is_empty():
		_cards[id] = slot

func set_selected_skill(skill_id: String) -> void:
	for id in _cards:
		(_cards[id] as CombatSkillSlot).set_selected(str(id) == skill_id)

func clear_selection() -> void:
	set_selected_skill("")

func set_ultimate(data: Dictionary) -> void:
	_ultimate.set_gauge(data)

func apply_event(event: Dictionary) -> void:
	if str(event.get("actor", "")) != "player":
		return
	var id := str(event.get("skill_id", ""))
	if not _cards.has(id):
		return
	var slot := _cards[id] as CombatSkillSlot
	var data := slot.skill.duplicate(true)
	var payload: Dictionary = event.get("payload", {})
	# Never start a cooldown from authored total or invent availability.
	for key in ["cooldownRemaining", "cooldownTotal", "blockedReason", "ready", "castState", "channelState"]:
		if payload.has(key):
			var vm_key: String = str({"cooldownRemaining":"cooldown_remaining", "cooldownTotal":"cooldown_total", "blockedReason":"blocked_reason", "castState":"cast_state", "channelState":"channel_state"}.get(key, key))
			data[vm_key] = payload[key]
	slot.bind(data)
