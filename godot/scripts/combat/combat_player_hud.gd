extends VBoxContainer
class_name CombatPlayerHud

const STYLE := preload("res://scripts/combat/combat_style.gd")
var hp: ProgressBar
var hp_text: Label
var spirit: ProgressBar
var spirit_text: Label
var identity: Label

func _ready() -> void:
	add_theme_constant_override("separation", 3)
	var head := HBoxContainer.new()
	add_child(head)
	identity = STYLE.label("", 11, STYLE.IVORY)
	identity.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(identity)
	hp_text = STYLE.label("", 8, STYLE.MUTED)
	hp_text.custom_minimum_size = Vector2(98, 0)
	hp_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	head.add_child(hp_text)
	hp = STYLE.bar("CombatPlayerHP", Color("74a795"), 6)
	add_child(hp)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	add_child(row)
	row.add_child(STYLE.label("CHÂN NGUYÊN", 7, STYLE.CYAN))
	spirit = STYLE.bar("CombatSpirit", STYLE.CYAN, 3)
	spirit.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	row.add_child(spirit)
	spirit_text = STYLE.label("", 7, STYLE.MUTED)
	spirit_text.custom_minimum_size = Vector2(58, 0)
	spirit_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	row.add_child(spirit_text)

func bind(player: Dictionary) -> void:
	identity.text = str(player.get("name", "Tu Sĩ"))
	var vital: Dictionary = player.get("hp", {})
	hp.value = float(vital.get("ratio", 1.0)) * 100.0
	hp_text.text = "%s / %s" % [str(vital.get("display_current", "—")), str(vital.get("display_max", "—"))]
	var cn: Dictionary = player.get("spirit", {})
	spirit.max_value = maxf(1.0, float(cn.get("max", 1.0)))
	spirit.value = float(cn.get("current", 0.0))
	spirit_text.text = "%d/%d" % [int(spirit.value), int(spirit.max_value)]

func _draw() -> void:
	STYLE.draw_hud_strip(self, STYLE.CYAN)
