extends Control

signal slot_pressed(slot_id: String, slot_data: Dictionary)

const ICON_PATHS := {
	"weapon": "res://art/approved/character/equipment/equip_weapon.webp",
	"head": "res://art/approved/character/equipment/equip_head.webp",
	"robe": "res://art/approved/character/equipment/equip_robe.webp",
	"belt": "res://art/approved/character/equipment/equip_belt.webp",
	"gloves": "res://art/approved/character/equipment/equip_gloves.webp",
	"boots": "res://art/approved/character/equipment/equip_boots.webp",
	"necklace": "res://art/approved/character/equipment/equip_necklace.webp",
	"ring": "res://art/approved/character/equipment/equip_ring.webp",
	"bracelet": "res://art/approved/character/equipment/equip_bracelet.webp",
	"talisman": "res://art/approved/character/equipment/equip_talisman.webp",
}

const GOLD := Color("e6bd62")
const GOLD_HI := Color("fff0b1")
const CYAN := Color("6fe8f2")
const TEXT := Color("f3f0e7")
const MUTED := Color("9babb5")

var slot_id := ""
var slot_label := ""
var filled_state := false
var enhancement_level := 0
var icon_ready := false

var _data: Dictionary = {}
var _frame: Panel
var _inner: Panel
var _icon: TextureRect
var _plus: Label
var _badge: Label
var _set_mark: Label
var _label: Label
var _button: Button

func setup(id: String, label: String) -> void:
	slot_id = id
	slot_label = label
	if is_node_ready():
		_load_icon()
		_refresh()

func bind_slot(data: Dictionary) -> void:
	_data = data.duplicate(true)
	filled_state = bool(data.get("filled", false))
	enhancement_level = clampi(int(data.get("enhancement", 0)), 0, 15)
	slot_label = str(data.get("label", slot_label))
	if is_node_ready():
		_refresh()

func slot_data() -> Dictionary:
	return _data.duplicate(true)

func _ready() -> void:
	custom_minimum_size = Vector2(64, 66)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_build()
	_load_icon()
	_refresh()

func _build() -> void:
	_frame = Panel.new()
	_frame.name = "Frame"
	_anchor(_frame, 5, 0, 59, 54)
	_frame.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_frame)

	_inner = Panel.new()
	_anchor(_inner, 5, 5, 49, 49)
	_inner.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_frame.add_child(_inner)

	var center := CenterContainer.new()
	_anchor(center, 7, 7, 47, 47)
	center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_frame.add_child(center)

	_icon = TextureRect.new()
	_icon.name = "SlotIcon"
	_icon.custom_minimum_size = Vector2(32, 32)
	_icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_icon.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	center.add_child(_icon)

	_plus = Label.new()
	_plus.name = "EmptyPlus"
	_plus.text = "+"
	_plus.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_plus.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_plus.add_theme_font_size_override("font_size", 14)
	_plus.add_theme_color_override("font_color", GOLD_HI)
	_plus.add_theme_constant_override("outline_size", 3)
	_plus.add_theme_color_override("font_outline_color", Color(0.01, 0.02, 0.03, 0.9))
	_anchor(_plus, 27, 27, 51, 51)
	_plus.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_frame.add_child(_plus)

	_badge = Label.new()
	_badge.name = "EnhancementBadge"
	_badge.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_badge.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_badge.add_theme_font_size_override("font_size", 10)
	_badge.add_theme_color_override("font_color", GOLD_HI)
	_badge.add_theme_constant_override("outline_size", 3)
	_badge.add_theme_color_override("font_outline_color", Color(0.0, 0.0, 0.0, 0.95))
	_anchor(_badge, 27, -3, 55, 15)
	_badge.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_frame.add_child(_badge)

	_set_mark = Label.new()
	_set_mark.name = "SetMarker"
	_set_mark.text = "◆"
	_set_mark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_set_mark.add_theme_font_size_override("font_size", 9)
	_set_mark.add_theme_color_override("font_color", CYAN)
	_anchor(_set_mark, 1, 1, 17, 16)
	_set_mark.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_frame.add_child(_set_mark)

	_label = Label.new()
	_label.name = "SlotLabel"
	_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_label.add_theme_font_size_override("font_size", 10)
	_label.add_theme_color_override("font_color", TEXT)
	_label.add_theme_constant_override("outline_size", 2)
	_label.add_theme_color_override("font_outline_color", Color(0.0, 0.01, 0.02, 0.92))
	_anchor(_label, -2, 53, 66, 66)
	_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_label)

	_button = Button.new()
	_button.name = "SlotTap"
	_button.text = ""
	_button.flat = true
	_button.focus_mode = Control.FOCUS_NONE
	_button.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_button.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	_button.add_theme_stylebox_override("hover", StyleBoxEmpty.new())
	_button.add_theme_stylebox_override("pressed", StyleBoxEmpty.new())
	_button.pressed.connect(_emit_pressed)
	add_child(_button)

func _load_icon() -> void:
	icon_ready = false
	if _icon == null:
		return
	var path := str(ICON_PATHS.get(slot_id, ""))
	if path != "" and ResourceLoader.exists(path):
		var tex := ResourceLoader.load(path) as Texture2D
		if tex != null:
			_icon.texture = tex
			icon_ready = true

func _refresh() -> void:
	if _frame == null:
		return
	_label.text = slot_label if slot_label != "" else slot_id

	var set_active := not str(_data.get("set_id", "")).is_empty()
	_set_mark.visible = filled_state and set_active
	_badge.visible = filled_state and enhancement_level > 0
	_badge.text = "+%d" % enhancement_level if enhancement_level > 0 else ""
	_plus.visible = not filled_state

	if filled_state:
		_icon.modulate = Color.WHITE
		_frame.add_theme_stylebox_override("panel", _round_box(
			Color(0.015, 0.060, 0.080, 0.96), 27,
			Color(0.98, 0.79, 0.34, 0.82), 2
		))
		_inner.add_theme_stylebox_override("panel", _round_box(
			Color(0.02, 0.13, 0.16, 0.72), 22,
			Color(0.35, 0.91, 0.95, 0.44), 1
		))
		_frame.modulate = Color(1.0, 1.0, 1.0, 1.0)
	else:
		_icon.modulate = Color(0.58, 0.70, 0.76, 0.48)
		_frame.add_theme_stylebox_override("panel", _round_box(
			Color(0.008, 0.027, 0.041, 0.91), 27,
			Color(0.77, 0.62, 0.27, 0.60), 1
		))
		_inner.add_theme_stylebox_override("panel", _round_box(
			Color(0.012, 0.045, 0.062, 0.76), 22,
			Color(0.24, 0.49, 0.57, 0.28), 1
		))
		_frame.modulate = Color(0.93, 0.96, 1.0, 0.93)

	var item_name := str(_data.get("name", ""))
	if filled_state:
		_button.tooltip_text = "%s · %s · +%d" % [slot_label, item_name, enhancement_level]
	else:
		_button.tooltip_text = "%s · ô trống" % slot_label

func _emit_pressed() -> void:
	slot_pressed.emit(slot_id, _data.duplicate(true))

func _anchor(control: Control, left: float, top: float, right: float, bottom: float) -> void:
	control.anchor_left = 0.0
	control.anchor_right = 0.0
	control.anchor_top = 0.0
	control.anchor_bottom = 0.0
	control.offset_left = left
	control.offset_top = top
	control.offset_right = right
	control.offset_bottom = bottom

func _round_box(fill: Color, radius: int, border: Color, border_width: int) -> StyleBoxFlat:
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
