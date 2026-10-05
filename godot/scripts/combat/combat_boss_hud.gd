extends VBoxContainer
class_name CombatBossHud

const STYLE := preload("res://scripts/combat/combat_style.gd")
var hp: ProgressBar
var hp_text: Label
var break_bar: ProgressBar
var identity: Label
var metadata: Label

func _ready() -> void:
	add_theme_constant_override("separation", 3)
	var head := HBoxContainer.new()
	add_child(head)
	identity = STYLE.label("", 12, STYLE.TEXT)
	identity.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(identity)
	metadata = STYLE.label("", 9, STYLE.GOLD)
	metadata.custom_minimum_size = Vector2(62, 0)
	head.add_child(metadata)
	hp = STYLE.bar("CombatEnemyHP", STYLE.RED, 10)
	add_child(hp)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 7)
	add_child(row)
	row.add_child(STYLE.label("THẤT THẾ", 8, STYLE.MUTED))
	break_bar = STYLE.bar("CombatEnemyBreak", Color("8ba5a1"), 4)
	break_bar.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	row.add_child(break_bar)
	hp_text = STYLE.label("", 8, STYLE.MUTED)
	hp_text.custom_minimum_size = Vector2(96, 0)
	row.add_child(hp_text)
	# No decorative status icons: this DTO currently exports no status authority.

func bind(enemy: Dictionary, boss: Dictionary) -> void:
	identity.text = str(enemy.get("name", "Thủ Lĩnh"))
	identity.tooltip_text = identity.text
	metadata.text = "Lv.%d%s" % [int(enemy.get("level", 1)), " · BOSS" if bool(boss.get("isBoss", false)) else ""]
	var vital: Dictionary = enemy.get("hp", {})
	hp.value = float(vital.get("ratio", 1.0)) * 100.0
	hp_text.text = "%s / %s" % [str(vital.get("display_current", "—")), str(vital.get("display_max", "—"))]
	break_bar.value = float(enemy.get("break", {}).get("ratio", 1.0)) * 100.0
