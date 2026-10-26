extends Control
class_name CombatSkillSlot
## Read-only icon surface. Cooldown/readiness come from the VM, never a local clock.

const STYLE := preload("res://scripts/combat/combat_style.gd")
const ASSETS := preload("res://scripts/combat/combat_asset_resolver.gd")
const GLYPHS := preload("res://scripts/combat/combat_placeholder_glyph.gd")
const R7V2_NGUKHI_ICON_CANDIDATES := {
	"skill.dao.artifact.basic": "res://art/candidate_r7v2/ngukhi_icons/basic.svg",
	"skill.dao.artifact.deploy": "res://art/candidate_r7v2/ngukhi_icons/deploy.svg",
	"skill.dao.artifact.guard": "res://art/candidate_r7v2/ngukhi_icons/guard.svg",
	"skill.dao.artifact.strike": "res://art/candidate_r7v2/ngukhi_icons/strike.svg",
	"skill.dao.artifact.sync": "res://art/candidate_r7v2/ngukhi_icons/sync.svg",
	"skill.dao.artifact.recall": "res://art/candidate_r7v2/ngukhi_icons/recall.svg",
	"skill.dao.artifact.split": "res://art/candidate_r7v2/ngukhi_icons/split.svg",
	"skill.dao.artifact.merge": "res://art/candidate_r7v2/ngukhi_icons/merge.svg",
	"skill.dao.artifact.suppress": "res://art/candidate_r7v2/ngukhi_icons/suppress.svg",
	"skill.dao.artifact.ultimate": "res://art/candidate_r7v2/ngukhi_icons/ultimate.svg",
}
var asset_config: Dictionary = {}
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
	asset_config = ASSETS.skill(str(skill.get('dao_id', '')), str(skill.get('id', '')), str(skill.get('slot_class', 'active')))
	_icon = ASSETS.skill_texture(asset_config)
	if OS.get_environment("TUTIEN_R7V2_NGUKHI_ICON_CANDIDATE") == "1":
		var candidate_path := str(R7V2_NGUKHI_ICON_CANDIDATES.get(str(skill.get("id", "")), ""))
		if not candidate_path.is_empty() and ResourceLoader.exists(candidate_path):
			_icon = ResourceLoader.load(candidate_path) as Texture2D
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
	var accent := STYLE.GOLD if ultimate or selected else Color(str(asset_config.get("accent", "75c7cc")))
	var style := STYLE.surface(accent, 0.72)
	style.set_corner_radius_all(3)
	style.border_color = Color(accent, 0.88 if selected else 0.30)
	if selected or (ultimate and gauge >= gauge_max and not skill.is_empty()):
		style.shadow_color = Color(accent, 0.17)
		style.shadow_size = 4
	draw_style_box(style, rect)
	if not skill.is_empty():
		if _icon != null:
			draw_texture_rect(_icon, rect.grow(-5), false)
		else:
			GLYPHS.draw_glyph(self, rect, asset_config)
	if selected:
		draw_line(rect.position + Vector2(8,side - 3), rect.position + Vector2(side - 8,side - 3), STYLE.GOLD, 2.0, true)
	var remaining := float(skill.get("cooldown_remaining", 0.0))
	if remaining > 0.0:
		draw_rect(rect.grow(-1), Color(0, 0, 0, 0.58))
		var total := maxf(remaining, float(skill.get("cooldown_total", remaining)))
		draw_arc(rect.get_center(), side * 0.40, -PI / 2, -PI / 2 + TAU * remaining / total, 32, STYLE.MUTED, 2.0, true)
	elif skill.is_empty() or (not bool(skill.get("ready", false)) and str(skill.get("blocked_reason", "")) != "AUTO"):
		draw_rect(rect.grow(-1), Color(0, 0, 0, 0.30))
	if ultimate:
		draw_arc(rect.get_center(), side * 0.44, -PI / 2, -PI / 2 + TAU * gauge / gauge_max, 32, Color(STYLE.GOLD, 0.85), 2.0, true)
