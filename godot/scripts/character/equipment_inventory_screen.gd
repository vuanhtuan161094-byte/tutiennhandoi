extends Control

signal close_requested
signal equip_requested(item_id: String)
signal equipment_detail_requested(item_id: String)
signal enhance_requested(item_id: String, use_protection: bool)
signal equipment_command_requested(action_id: String, payload: Dictionary)

const GOLD := Color("e8c76d")
const GOLD_HI := Color("fff0b8")
const CYAN := Color("77e6ef")
const TEXT := Color("f4f0e6")
const MUTED := Color("9cabb5")
const PANEL := Color(0.007, 0.022, 0.035, 0.985)
const CARD := Color(0.014, 0.045, 0.063, 0.94)
const POSITIVE := Color("9de6b4")
const NEGATIVE := Color("ffb19d")

const ATTIRE_SLOTS := ["weapon", "head", "robe", "belt", "gloves", "boots"]
const JEWELRY_SLOTS := ["necklace", "ring", "bracelet", "talisman"]
const STAT_ORDER := [
	"attack", "maxHp", "defense", "maxSpirit",
	"critChancePct", "heartChancePct", "critDamagePct", "armorPenPct",
	"accuracy", "resolve", "mobility", "dodgeChancePct",
	"damageReductionPct", "controlPower", "controlDurationReductionPct",
	"spiritEfficiencyPct", "breakEffectPct",
]
const STAT_LABELS := {
	"attack": "Công Lực", "maxHp": "Khí Huyết", "defense": "Phòng Ngự", "maxSpirit": "Chân Nguyên",
	"critChancePct": "Bạo Kích", "heartChancePct": "Hội Tâm", "critDamagePct": "Bạo Thương",
	"armorPenPct": "Xuyên Phòng", "accuracy": "Chính Xác", "resolve": "Định Lực",
	"mobility": "Thân Pháp", "dodgeChancePct": "Né Tránh", "damageReductionPct": "Giảm Thương",
	"controlPower": "Khống Chế", "controlDurationReductionPct": "Kháng Khống Chế",
	"spiritEfficiencyPct": "Hiệu Suất Chân Nguyên", "breakEffectPct": "Phá Thế",
	"brokenTargetDamagePct": "Sát Thương Phá Thế", "dotDamagePct": "Sát Thương Duy Trì",
	"healingEffectivenessPct": "Hiệu Quả Hồi Phục", "trueEssenceScalingPct": "Chân Nguyên Hiệu Lực",
	"shieldEffectPct": "Hiệu Quả Hộ Thuẫn", "counterDamagePct": "Phản Chấn",
	"cooldownReductionPct": "Giảm Hồi Chiêu",
}
const SLOT_LABELS := {
	"weapon": "Đạo Binh", "head": "Đạo Quan", "robe": "Pháp Bào", "belt": "Huyền Đái",
	"gloves": "Hộ Uyển", "boots": "Vân Ngoa", "necklace": "Ngọc Bội", "ring": "Đạo Giới",
	"bracelet": "Linh Trạc", "talisman": "Hộ Phù",
}
const SLOT_ICON_PATHS := {
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

var _vm: Dictionary = {}
var _focus_slot := ""
var _filter := "all"
var _selected_item_id := ""
var _forge_slot := "weapon"
var _merge_group_key := ""
var _merge_main_id := ""
var _merge_fodder_ids: Array[String] = []

var _title: Label
var _subtitle: Label
var _item_count: Label
var _resource_essence: Label
var _resource_protection: Label
var _resource_transfer: Label
var _body: VBoxContainer
var _scroll: ScrollContainer
var _tabs: Dictionary = {}
var _detail_layer: Panel
var _detail_body: VBoxContainer
var _status: Label

func _ready() -> void:
	name = "EquipmentInventoryScreen"
	visible = false
	mouse_filter = Control.MOUSE_FILTER_STOP
	_build()

func show_inventory(vm: Dictionary, focus_slot: String = "") -> void:
	_vm = vm.duplicate(true)
	_focus_slot = focus_slot
	_filter = "all"
	_selected_item_id = ""
	_forge_slot = focus_slot if focus_slot != "" else "weapon"
	_merge_group_key = ""
	_merge_main_id = ""
	_merge_fodder_ids.clear()
	visible = true
	_detail_layer.visible = false
	_render()

func refresh(vm: Dictionary) -> void:
	_vm = vm.duplicate(true)
	if not visible:
		return
	var scroll_pos := _scroll.scroll_vertical
	_render(false)
	_scroll.set_deferred("scroll_vertical", scroll_pos)
	if _selected_item_id != "":
		_render_detail()
		var selected := _find_item(_selected_item_id)
		if not selected.is_empty() and not _has_heavy_detail(selected):
			equipment_detail_requested.emit(_selected_item_id)

func set_status_message(message: String) -> void:
	if message != "" and _status != null:
		_status.text = message


func close() -> void:
	visible = false
	_selected_item_id = ""
	_detail_layer.visible = false
	close_requested.emit()

func _build() -> void:
	var scrim := ColorRect.new()
	scrim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	scrim.color = Color(0.0, 0.008, 0.015, 0.94)
	scrim.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(scrim)

	var panel := Panel.new()
	panel.name = "InventoryPanel"
	_anchor(panel, 4, 4, 386, 748)
	panel.add_theme_stylebox_override("panel", _box(PANEL, 18, Color(0.74, 0.63, 0.31, 0.44), 1))
	add_child(panel)

	_title = Label.new()
	_title.name = "InventoryTitle"
	_title.text = "Kho Đồ"
	_title.add_theme_font_size_override("font_size", 20)
	_title.add_theme_color_override("font_color", GOLD_HI)
	_anchor(_title, 16, 10, 250, 38)
	panel.add_child(_title)

	_subtitle = Label.new()
	_subtitle.name = "InventorySubtitle"
	_subtitle.text = "Trang bị V142"
	_subtitle.add_theme_font_size_override("font_size", 9)
	_subtitle.add_theme_color_override("font_color", MUTED)
	_anchor(_subtitle, 16, 38, 270, 57)
	panel.add_child(_subtitle)

	_item_count = Label.new()
	_item_count.name = "InventoryItemCount"
	_item_count.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_item_count.add_theme_font_size_override("font_size", 9)
	_item_count.add_theme_color_override("font_color", CYAN)
	_anchor(_item_count, 250, 15, 326, 36)
	panel.add_child(_item_count)

	var close_button := Button.new()
	close_button.name = "InventoryClose"
	close_button.text = "×"
	close_button.focus_mode = Control.FOCUS_NONE
	close_button.add_theme_font_size_override("font_size", 20)
	close_button.add_theme_color_override("font_color", TEXT)
	close_button.add_theme_stylebox_override("normal", _box(Color(0.02, 0.05, 0.07, 0.82), 18, Color(0.45, 0.63, 0.69, 0.24), 1))
	close_button.add_theme_stylebox_override("pressed", _box(Color(0.09, 0.08, 0.04, 0.96), 18, GOLD, 1))
	_anchor(close_button, 330, 10, 366, 46)
	close_button.pressed.connect(close)
	panel.add_child(close_button)

	var resources := PanelContainer.new()
	resources.name = "InventoryResources"
	_anchor(resources, 10, 66, 372, 112)
	var resource_style := _box(Color(0.012, 0.043, 0.058, 0.90), 13, Color(0.37, 0.66, 0.72, 0.22), 1)
	resource_style.content_margin_left = 8
	resource_style.content_margin_right = 8
	resource_style.content_margin_top = 5
	resource_style.content_margin_bottom = 5
	resources.add_theme_stylebox_override("panel", resource_style)
	panel.add_child(resources)

	var resource_row := HBoxContainer.new()
	resource_row.add_theme_constant_override("separation", 4)
	resources.add_child(resource_row)
	_resource_essence = _resource_cell(resource_row, "TINH HOA")
	_resource_protection = _resource_cell(resource_row, "BÙA")
	_resource_transfer = _resource_cell(resource_row, "NGỌC CHUYỂN")

	var tabs := HBoxContainer.new()
	tabs.name = "InventoryTabs"
	tabs.add_theme_constant_override("separation", 3)
	_anchor(tabs, 10, 118, 372, 156)
	panel.add_child(tabs)
	for spec in [
		["all", "TẤT CẢ"],
		["attire", "Y TRANG"],
		["jewelry", "TRANG SỨC"],
		["sets", "SET"],
		["materials", "VẬT PHẨM"],
		["forge", "LUYỆN"],
	]:
		var tab_id := str(spec[0])
		var button := Button.new()
		button.name = "InventoryTab_%s" % tab_id
		button.text = str(spec[1])
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.custom_minimum_size = Vector2(0, 34)
		button.focus_mode = Control.FOCUS_NONE
		button.add_theme_font_size_override("font_size", 7)
		button.pressed.connect(_set_filter.bind(tab_id))
		tabs.add_child(button)
		_tabs[tab_id] = button

	_scroll = ScrollContainer.new()
	_scroll.name = "InventoryScroll"
	_anchor(_scroll, 10, 162, 372, 704)
	panel.add_child(_scroll)

	_body = VBoxContainer.new()
	_body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_body.add_theme_constant_override("separation", 8)
	_scroll.add_child(_body)

	_status = Label.new()
	_status.name = "InventoryStatus"
	_status.text = "Chạm một món để xem chi tiết."
	_status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_status.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	_status.add_theme_font_size_override("font_size", 8)
	_status.add_theme_color_override("font_color", MUTED)
	_anchor(_status, 10, 708, 372, 732)
	panel.add_child(_status)

	_detail_layer = Panel.new()
	_detail_layer.name = "InventoryItemDetail"
	_detail_layer.visible = false
	_anchor(_detail_layer, 6, 344, 376, 738)
	_detail_layer.add_theme_stylebox_override("panel", _box(Color(0.006, 0.024, 0.036, 0.995), 18, Color(0.92, 0.75, 0.35, 0.56), 1))
	panel.add_child(_detail_layer)

	var detail_close := Button.new()
	detail_close.name = "InventoryItemDetailClose"
	detail_close.text = "×"
	detail_close.focus_mode = Control.FOCUS_NONE
	detail_close.add_theme_font_size_override("font_size", 18)
	detail_close.add_theme_color_override("font_color", TEXT)
	detail_close.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	detail_close.add_theme_stylebox_override("pressed", _box(Color(0.08, 0.07, 0.035, 0.74), 16, GOLD, 1))
	_anchor(detail_close, 326, 8, 360, 42)
	detail_close.pressed.connect(_hide_detail)
	_detail_layer.add_child(detail_close)

	var detail_scroll := ScrollContainer.new()
	_anchor(detail_scroll, 12, 12, 322, 382)
	_detail_layer.add_child(detail_scroll)

	_detail_body = VBoxContainer.new()
	_detail_body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_detail_body.add_theme_constant_override("separation", 5)
	detail_scroll.add_child(_detail_body)

func _resource_cell(parent: HBoxContainer, caption: String) -> Label:
	var cell := VBoxContainer.new()
	cell.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	cell.add_theme_constant_override("separation", 0)
	parent.add_child(cell)

	var cap := Label.new()
	cap.text = caption
	cap.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	cap.add_theme_font_size_override("font_size", 7)
	cap.add_theme_color_override("font_color", MUTED)
	cell.add_child(cap)

	var value := Label.new()
	value.text = "0"
	value.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	value.add_theme_font_size_override("font_size", 12)
	value.add_theme_color_override("font_color", GOLD_HI)
	cell.add_child(value)
	return value

func _render(reset_scroll: bool = true) -> void:
	_clear(_body)
	var equipment: Dictionary = _vm.get("equipment", {})
	var inventory: Array = equipment.get("inventory", [])
	var system: Dictionary = equipment.get("system", {})
	var resources: Dictionary = system.get("resources", {})

	var v142_count := 0
	for item_variant in inventory:
		if typeof(item_variant) != TYPE_DICTIONARY:
			continue
		var count_item: Dictionary = item_variant
		if bool(count_item.get("isV142", false)):
			v142_count += 1
	_item_count.text = "%d món" % v142_count
	_resource_essence.text = _fmt_num(float(resources.get("forgingEssence", 0)))
	_resource_protection.text = _fmt_num(float(resources.get("protectionTalismans", 0)))
	_resource_transfer.text = _fmt_num(float(resources.get("transferGems", 0)))

	if _focus_slot != "":
		_subtitle.text = "%s · chọn trang bị" % str(SLOT_LABELS.get(_focus_slot, _focus_slot))
	else:
		_subtitle.text = "Bậc · Cường Hóa · Affix · Set"

	_update_tab_styles()

	match _filter:
		"sets":
			_render_sets()
		"materials":
			_render_materials()
		"forge":
			_render_forge()
		_:
			_render_items()

	if reset_scroll:
		_scroll.scroll_vertical = 0

func _render_items() -> void:
	var equipment: Dictionary = _vm.get("equipment", {})
	var inventory: Array = equipment.get("inventory", [])
	var items: Array = []
	for item_variant in inventory:
		if typeof(item_variant) != TYPE_DICTIONARY:
			continue
		var item: Dictionary = item_variant
		if not bool(item.get("isV142", false)):
			continue
		var slot_id := str(item.get("slot", ""))
		if _focus_slot != "" and slot_id != _focus_slot:
			continue
		if _filter == "attire" and slot_id not in ATTIRE_SLOTS:
			continue
		if _filter == "jewelry" and slot_id not in JEWELRY_SLOTS:
			continue
		items.append(item)

	items.sort_custom(func(a, b):
		var a_equipped := bool(a.get("equipped", false))
		var b_equipped := bool(b.get("equipped", false))
		if a_equipped != b_equipped:
			return a_equipped
		var ar := int(a.get("rankIndex", 0))
		var br := int(b.get("rankIndex", 0))
		if ar != br:
			return ar > br
		var ae := int(a.get("enhancementLevel", 0))
		var be := int(b.get("enhancementLevel", 0))
		if ae != be:
			return ae > be
		return int(a.get("itemLevel", 0)) > int(b.get("itemLevel", 0))
	)

	if items.is_empty():
		_add_empty("Không có trang bị V142 phù hợp bộ lọc.")
		return

	var grid := GridContainer.new()
	grid.name = "InventoryItemGrid"
	grid.columns = 2
	grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	grid.add_theme_constant_override("h_separation", 7)
	grid.add_theme_constant_override("v_separation", 7)
	_body.add_child(grid)

	for item_variant in items:
		_add_item_card(grid, item_variant)

func _add_item_card(parent: GridContainer, item: Dictionary) -> void:
	var set_id := str(item.get("setId", ""))
	var accent := _set_accent(set_id)
	var equipped := bool(item.get("equipped", false))

	var wrapper := PanelContainer.new()
	wrapper.custom_minimum_size = Vector2(0, 126)
	wrapper.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var style := _box(
		Color(accent.r * 0.06, accent.g * 0.06, accent.b * 0.07, 0.96) if set_id != "" else CARD,
		12,
		accent if set_id != "" else Color(0.37, 0.61, 0.67, 0.25),
		2 if equipped else 1
	)
	style.content_margin_left = 7
	style.content_margin_right = 7
	style.content_margin_top = 7
	style.content_margin_bottom = 7
	wrapper.add_theme_stylebox_override("panel", style)
	parent.add_child(wrapper)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 3)
	wrapper.add_child(col)

	var top := HBoxContainer.new()
	top.add_theme_constant_override("separation", 5)
	col.add_child(top)

	var icon := TextureRect.new()
	icon.custom_minimum_size = Vector2(36, 36)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var icon_path := str(SLOT_ICON_PATHS.get(str(item.get("slot", "")), ""))
	if icon_path != "" and ResourceLoader.exists(icon_path):
		icon.texture = ResourceLoader.load(icon_path) as Texture2D
	top.add_child(icon)

	var meta := VBoxContainer.new()
	meta.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	meta.add_theme_constant_override("separation", 0)
	top.add_child(meta)

	var rank := Label.new()
	rank.text = str(item.get("rankName", "Phàm"))
	rank.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	rank.add_theme_font_size_override("font_size", 8)
	rank.add_theme_color_override("font_color", accent if set_id != "" else CYAN)
	meta.add_child(rank)

	var enhance := Label.new()
	enhance.text = "ĐANG MẶC" if equipped else "+%d" % maxi(0, int(item.get("enhancementLevel", 0)))
	enhance.add_theme_font_size_override("font_size", 9)
	enhance.add_theme_color_override("font_color", GOLD_HI if equipped else GOLD)
	meta.add_child(enhance)

	var name_label := Label.new()
	name_label.text = str(item.get("name", "Trang bị"))
	name_label.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	name_label.add_theme_font_size_override("font_size", 10)
	name_label.add_theme_color_override("font_color", TEXT)
	col.add_child(name_label)

	if set_id != "":
		var set_label := Label.new()
		set_label.text = "%s · %s" % [_set_badge(set_id), _compact_set_name(str(item.get("setName", "")))]
		set_label.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
		set_label.add_theme_font_size_override("font_size", 7)
		set_label.add_theme_color_override("font_color", accent)
		col.add_child(set_label)

	var signal_info := _strength_signal(item)
	var strength := Label.new()
	strength.text = str(signal_info.get("label", "SO SÁNH"))
	strength.add_theme_font_size_override("font_size", 8)
	var strength_color: Color = signal_info.get("color", MUTED)
	strength.add_theme_color_override("font_color", strength_color)
	col.add_child(strength)

	var button := Button.new()
	button.name = "InventoryItem_%s" % _safe_node_name(str(item.get("id", "")))
	button.text = ""
	button.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	button.focus_mode = Control.FOCUS_NONE
	button.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	button.add_theme_stylebox_override("hover", _box(Color(1, 1, 1, 0.025), 12, Color(accent.r, accent.g, accent.b, 0.34), 1))
	button.add_theme_stylebox_override("pressed", _box(Color(accent.r, accent.g, accent.b, 0.09), 12, accent, 2))
	button.pressed.connect(_select_item.bind(str(item.get("id", ""))))
	wrapper.add_child(button)

func _render_sets() -> void:
	var system: Dictionary = _vm.get("equipment", {}).get("system", {})
	var v142: Dictionary = system.get("v142", {})
	var rows_variant = v142.get("setRows", [])
	if typeof(rows_variant) != TYPE_ARRAY or rows_variant.is_empty():
		_add_empty("Chưa có dữ liệu Set V142.")
		return

	for row_variant in rows_variant:
		if typeof(row_variant) != TYPE_DICTIONARY:
			continue
		var row: Dictionary = row_variant
		var accent := _set_accent(str(row.get("setId", "")))
		var card := _panel_card(accent)
		_add_title_pair(card, str(row.get("setName", "Bộ Trang Bị")), "%d/%d" % [
			int(row.get("equippedPieces", 0)),
			int(row.get("maxPieces", 0)),
		], accent)
		_add_small_text(card, "Sở hữu %d ô · Tàn Ấn %s" % [
			int(row.get("ownedSlotCount", 0)),
			_fmt_num(float(row.get("fragmentBalance", 0))),
		], MUTED)

		var thresholds = row.get("thresholds", [])
		if typeof(thresholds) == TYPE_ARRAY:
			for threshold_variant in thresholds:
				if typeof(threshold_variant) != TYPE_DICTIONARY:
					continue
				var threshold: Dictionary = threshold_variant
				var active := bool(threshold.get("active", false))
				_add_pair(
					card,
					"%d món · %s" % [int(threshold.get("pieces", 0)), str(threshold.get("name", "Cộng hưởng"))],
					"ĐÃ KÍCH" if active else "Chưa kích",
					POSITIVE if active else MUTED
				)
				var effect_text := _set_bonus_text(threshold)
				if effect_text != "":
					_add_small_text(card, effect_text, TEXT if active else MUTED)

func _render_materials() -> void:
	var equipment: Dictionary = _vm.get("equipment", {})
	var system: Dictionary = equipment.get("system", {})
	var resources: Dictionary = system.get("resources", {})
	var v142: Dictionary = system.get("v142", {})

	var core := _panel_card(GOLD)
	_add_title_pair(core, "VẬT LIỆU TRANG BỊ", "V142", GOLD)
	_add_pair(core, "Khí Luyện Tinh Hoa", _fmt_num(float(resources.get("forgingEssence", 0))), TEXT)
	_add_pair(core, "Bùa Chống Tụt", _fmt_num(float(resources.get("protectionTalismans", 0))), TEXT)
	_add_pair(core, "Ngọc Chuyển Cường Hóa", _fmt_num(float(resources.get("transferGems", 0))), TEXT)

	var fragment_rows = v142.get("fragmentRows", [])
	if typeof(fragment_rows) == TYPE_ARRAY:
		var shown_fragments := false
		for row_variant in fragment_rows:
			if typeof(row_variant) != TYPE_DICTIONARY:
				continue
			var row: Dictionary = row_variant
			var balance := maxi(0, int(row.get("balance", 0)))
			if balance <= 0:
				continue
			if not shown_fragments:
				_add_section_label("MẢNH TRANG BỊ")
				shown_fragments = true
			var card := _panel_card(CYAN)
			_add_title_pair(card, str(row.get("rankName", "Bậc")), "×%s" % _fmt_num(balance), CYAN)
			_add_small_text(card, "Luyện 1 món: %s mảnh · Tinh luyện bậc sau theo tỷ lệ 3:1." % _fmt_num(float(row.get("craftCost", 50))), MUTED)

	var resource_rows = _vm.get("inventory_resources", [])
	var hidden_resource_ids := {
		"resource.forging_essence": true,
		"resource.enhancement_protection_talisman": true,
		"resource.enhancement_transfer_gem": true,
	}
	var v128 = system.get("v128Resources", {})
	if typeof(v128) == TYPE_DICTIONARY:
		for legacy_key in ["daoFragments", "gemBlanks"]:
			var legacy = v128.get(legacy_key, {})
			if typeof(legacy) == TYPE_DICTIONARY:
				var legacy_id := str(legacy.get("id", ""))
				if legacy_id != "":
					hidden_resource_ids[legacy_id] = true
	var other_resources: Array = []
	if typeof(resource_rows) == TYPE_ARRAY:
		for resource_variant in resource_rows:
			if typeof(resource_variant) != TYPE_DICTIONARY:
				continue
			var resource: Dictionary = resource_variant
			if bool(hidden_resource_ids.get(str(resource.get("id", "")), false)):
				continue
			if float(resource.get("quantity", 0)) <= 0:
				continue
			other_resources.append(resource)
	if not other_resources.is_empty():
		_add_section_label("VẬT PHẨM KHÁC")
		var resource_grid := GridContainer.new()
		resource_grid.name = "InventoryResourceGrid"
		resource_grid.columns = 2
		resource_grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		resource_grid.add_theme_constant_override("h_separation", 6)
		resource_grid.add_theme_constant_override("v_separation", 6)
		_body.add_child(resource_grid)
		for resource_variant in other_resources:
			_add_resource_card(resource_grid, resource_variant)

	var set_rows = v142.get("setRows", [])
	if typeof(set_rows) == TYPE_ARRAY:
		var shown_sets := false
		for row_variant in set_rows:
			if typeof(row_variant) != TYPE_DICTIONARY:
				continue
			var row: Dictionary = row_variant
			var balance := maxi(0, int(row.get("fragmentBalance", 0)))
			if balance <= 0 and int(row.get("ownedPieces", 0)) <= 0:
				continue
			if not shown_sets:
				_add_section_label("TÀN ẤN SET")
				shown_sets = true
			var accent := _set_accent(str(row.get("setId", "")))
			var card := _panel_card(accent)
			_add_title_pair(card, _compact_set_name(str(row.get("setName", "Tàn Ấn"))), "×%s" % _fmt_num(balance), accent)
			_add_small_text(card, "Dùng để Khắc Bộ lên trang bị V142 phù hợp.", MUTED)

func _render_forge() -> void:
	var equipment: Dictionary = _vm.get("equipment", {})
	var inventory: Array = equipment.get("inventory", [])
	var system: Dictionary = equipment.get("system", {})
	var v142: Dictionary = system.get("v142", {})
	var fragment_rows = v142.get("fragmentRows", [])

	var forge := _panel_card(GOLD)
	_add_title_pair(forge, "LUYỆN TRANG BỊ", str(SLOT_LABELS.get(_forge_slot, _forge_slot)), GOLD)
	_add_small_text(forge, "Chọn ô trang bị, sau đó dùng Mảnh đúng Bậc để luyện món mới.", MUTED)

	var slot_grid := GridContainer.new()
	slot_grid.name = "InventoryForgeSlotGrid"
	slot_grid.columns = 5
	slot_grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	slot_grid.add_theme_constant_override("h_separation", 3)
	slot_grid.add_theme_constant_override("v_separation", 3)
	for slot_id in ATTIRE_SLOTS + JEWELRY_SLOTS:
		var selected := slot_id == _forge_slot
		var button := Button.new()
		button.name = "ForgeSlot_%s" % slot_id
		button.text = _slot_short_label(slot_id)
		button.custom_minimum_size = Vector2(0, 30)
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.focus_mode = Control.FOCUS_NONE
		button.add_theme_font_size_override("font_size", 7)
		button.add_theme_color_override("font_color", GOLD_HI if selected else MUTED)
		button.add_theme_stylebox_override("normal", _box(
			Color(0.08, 0.075, 0.035, 0.94) if selected else Color(0.015, 0.045, 0.058, 0.90),
			9,
			GOLD if selected else Color(0.35, 0.58, 0.64, 0.20),
			1
		))
		button.pressed.connect(_select_forge_slot.bind(slot_id))
		slot_grid.add_child(button)
	forge.add_child(slot_grid)

	var shown_fragments := 0
	if typeof(fragment_rows) == TYPE_ARRAY:
		for row_variant in fragment_rows:
			if typeof(row_variant) != TYPE_DICTIONARY:
				continue
			var row: Dictionary = row_variant
			var balance := maxi(0, int(row.get("balance", 0)))
			if balance <= 0:
				continue
			var card := _panel_card(CYAN)
			_add_title_pair(card, str(row.get("rankName", "Bậc")), "×%s Mảnh" % _fmt_num(balance), CYAN)
			var actions := HBoxContainer.new()
			actions.add_theme_constant_override("separation", 5)
			card.add_child(actions)

			var craft_cost := maxi(1, int(row.get("craftCost", 50)))
			var craft := _action_button(
				"ForgeCraft_%s_%s" % [str(row.get("rankIndex", 0)), _forge_slot],
				"LUYỆN · %s" % _fmt_num(craft_cost),
				balance >= craft_cost
			)
			craft.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			craft.pressed.connect(_emit_equipment_command.bind("craftEquipmentV142", {
				"slot": _forge_slot,
				"rankIndex": int(row.get("rankIndex", 0)),
			}))
			actions.add_child(craft)

			var refine_enabled := bool(row.get("refinable", false))
			var refine := _action_button(
				"ForgeRefine_%s" % str(row.get("rankIndex", 0)),
				"TINH 3:1",
				refine_enabled
			)
			refine.custom_minimum_size.x = 82
			refine.pressed.connect(_emit_equipment_command.bind("refineEquipmentFragmentsV142", {
				"fromRank": int(row.get("rankIndex", 0)),
				"batches": 1,
			}))
			actions.add_child(refine)
			shown_fragments += 1

	if shown_fragments == 0:
		_add_small_text(forge, "Chưa có Mảnh Trang Bị để luyện.", MUTED)

	_add_section_label("HỢP THÀNH 3 → 1")
	var groups := _merge_groups(inventory)
	if groups.is_empty():
		_add_empty("Chưa có nhóm 3 món V142 cùng ô và cùng Bậc để Hợp Thành.")
		return

	for key in groups.keys():
		var group: Array = groups[key]
		var first: Dictionary = group[0]
		var card := _panel_card(_set_accent(str(first.get("setId", ""))))
		_add_title_pair(card, "%s · %s" % [
			str(first.get("slotLabel", SLOT_LABELS.get(str(first.get("slot", "")), "Trang bị"))),
			str(first.get("rankName", "Bậc")),
		], "%d món" % group.size(), CYAN)
		var pick := _action_button(
			"MergeGroup_%s" % _safe_node_name(str(key)),
			"CHỌN 3 MÓN",
			true
		)
		pick.pressed.connect(_select_merge_group.bind(str(key)))
		card.add_child(pick)

	if _merge_group_key != "" and groups.has(_merge_group_key):
		_render_merge_picker(groups[_merge_group_key])

func _merge_groups(inventory: Array) -> Dictionary:
	var groups := {}
	for item_variant in inventory:
		if typeof(item_variant) != TYPE_DICTIONARY:
			continue
		var item: Dictionary = item_variant
		if not bool(item.get("isV142", false)):
			continue
		var key := "%s|%d" % [str(item.get("slot", "")), int(item.get("rankIndex", -1))]
		if not groups.has(key):
			groups[key] = []
		groups[key].append(item)
	var eligible := {}
	for key in groups.keys():
		var group: Array = groups[key]
		if group.size() >= 3:
			eligible[key] = group
	return eligible

func _render_merge_picker(group: Array) -> void:
	var card := _panel_card(GOLD)
	_add_title_pair(card, "CHỌN PHÔI", "1 giữ · 2 hy sinh", GOLD)
	_add_small_text(card, "Món chính giữ Set, Affix và cấp Cường Hóa. Món đang mặc/khóa/Set không được dùng làm phôi phụ.", MUTED)

	for item_variant in group:
		if typeof(item_variant) != TYPE_DICTIONARY:
			continue
		var item: Dictionary = item_variant
		var item_id := str(item.get("id", ""))
		var is_main := item_id == _merge_main_id
		var is_fodder := _merge_fodder_ids.has(item_id)
		var protected_fodder := bool(item.get("equipped", false)) or bool(item.get("locked", false)) or str(item.get("setId", "")) != ""
		var caption := ""
		if is_main:
			caption = "GIỮ · " + _merge_item_label(item)
		elif is_fodder:
			caption = "HY SINH · " + _merge_item_label(item)
		elif _merge_main_id == "":
			caption = "CHỌN GIỮ · " + _merge_item_label(item)
		else:
			caption = "CHỌN PHỤ · " + _merge_item_label(item)
		var enabled := is_main or is_fodder or _merge_main_id == "" or not protected_fodder
		var button := _action_button("MergePick_%s" % _safe_node_name(item_id), caption, enabled)
		button.pressed.connect(_toggle_merge_item.bind(item_id))
		card.add_child(button)

	var footer := HBoxContainer.new()
	footer.add_theme_constant_override("separation", 5)
	card.add_child(footer)
	var reset := _action_button("MergeReset", "LÀM LẠI", true)
	reset.pressed.connect(_reset_merge_selection)
	footer.add_child(reset)
	var confirm := _action_button(
		"MergeConfirm",
		"HỢP THÀNH",
		_merge_main_id != "" and _merge_fodder_ids.size() == 2
	)
	confirm.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	confirm.pressed.connect(_confirm_merge)
	footer.add_child(confirm)

func _merge_item_label(item: Dictionary) -> String:
	var suffix := " +%d" % int(item.get("enhancementLevel", 0))
	if str(item.get("setId", "")) != "":
		suffix += " · SET"
	if bool(item.get("equipped", false)):
		suffix += " · ĐANG MẶC"
	if bool(item.get("locked", false)):
		suffix += " · KHÓA"
	return str(item.get("name", "Trang bị")) + suffix

func _select_forge_slot(slot_id: String) -> void:
	_forge_slot = slot_id
	_render()

func _select_merge_group(key: String) -> void:
	_merge_group_key = key
	_merge_main_id = ""
	_merge_fodder_ids.clear()
	_render(false)

func _toggle_merge_item(item_id: String) -> void:
	if item_id == "":
		return
	if _merge_main_id == "":
		_merge_main_id = item_id
		_render(false)
		return
	if item_id == _merge_main_id:
		_reset_merge_selection()
		return
	if _merge_fodder_ids.has(item_id):
		_merge_fodder_ids.erase(item_id)
	elif _merge_fodder_ids.size() < 2:
		_merge_fodder_ids.append(item_id)
	_render(false)

func _reset_merge_selection() -> void:
	_merge_main_id = ""
	_merge_fodder_ids.clear()
	_render(false)

func _confirm_merge() -> void:
	if _merge_main_id == "" or _merge_fodder_ids.size() != 2:
		return
	_emit_equipment_command("mergeEquipmentV142", {
		"mainItemId": _merge_main_id,
		"fodderItemAId": _merge_fodder_ids[0],
		"fodderItemBId": _merge_fodder_ids[1],
	})
	_merge_main_id = ""
	_merge_fodder_ids.clear()


func _add_resource_card(parent: GridContainer, resource: Dictionary) -> void:
	var wrapper := PanelContainer.new()
	wrapper.custom_minimum_size = Vector2(0, 58)
	wrapper.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var style := _box(Color(0.012, 0.040, 0.055, 0.90), 11, Color(0.35, 0.58, 0.64, 0.20), 1)
	style.content_margin_left = 8
	style.content_margin_right = 8
	style.content_margin_top = 6
	style.content_margin_bottom = 6
	wrapper.add_theme_stylebox_override("panel", style)
	parent.add_child(wrapper)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 1)
	wrapper.add_child(col)
	var name_label := Label.new()
	name_label.text = str(resource.get("name", resource.get("id", "Vật phẩm")))
	name_label.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	name_label.add_theme_font_size_override("font_size", 8)
	name_label.add_theme_color_override("font_color", TEXT)
	col.add_child(name_label)
	var qty := Label.new()
	qty.text = "×%s" % _fmt_num(float(resource.get("quantity", 0)))
	qty.add_theme_font_size_override("font_size", 10)
	qty.add_theme_color_override("font_color", GOLD_HI)
	col.add_child(qty)


func _select_item(item_id: String) -> void:
	if item_id.is_empty():
		return
	_selected_item_id = item_id
	_detail_layer.visible = true
	_render_detail()
	var item := _find_item(item_id)
	if item.is_empty():
		return
	if not _has_heavy_detail(item):
		equipment_detail_requested.emit(item_id)

func _render_detail() -> void:
	_clear(_detail_body)
	var item := _find_item(_selected_item_id)
	if item.is_empty():
		_add_small_text(_detail_body, "Không tìm thấy trang bị.", NEGATIVE)
		return

	var set_id := str(item.get("setId", ""))
	var accent := _set_accent(set_id)
	_add_title_pair(_detail_body, str(item.get("name", "Trang bị")), "+%d" % maxi(0, int(item.get("enhancementLevel", 0))), accent)
	_add_small_text(_detail_body, "%s · %s" % [
		str(item.get("slotLabel", SLOT_LABELS.get(str(item.get("slot", "")), "Trang bị"))),
		str(item.get("rankName", "Phàm")),
	], MUTED)

	var signal_info := _strength_signal(item)
	var signal_color: Color = signal_info.get("color", MUTED)
	_add_small_text(_detail_body, str(signal_info.get("label", "SO SÁNH")), signal_color)

	if set_id != "":
		_add_small_text(_detail_body, "SET · " + str(item.get("setName", set_id)), accent)

	if not _has_heavy_detail(item):
		_add_small_text(_detail_body, "Đang tải chỉ số chi tiết…", CYAN)
		return

	var stats_variant = item.get("effectiveStats", item.get("stats", {}))
	if typeof(stats_variant) == TYPE_DICTIONARY:
		var stats: Dictionary = stats_variant
		_add_section_label_to(_detail_body, "CHỈ SỐ")
		for key in STAT_ORDER:
			if not stats.has(key):
				continue
			var value := float(stats.get(key, 0))
			if absf(value) <= 0.0001:
				continue
			_add_pair(_detail_body, str(STAT_LABELS.get(key, key)), _format_stat(key, value), TEXT)

	var equipped := _equipped_slot(str(item.get("slot", "")))
	if not equipped.is_empty() and not bool(item.get("equipped", false)):
		var comparison := _comparison_rows(stats_variant, equipped.get("stats", {}))
		if not comparison.is_empty():
			_add_section_label_to(_detail_body, "SO VỚI ĐANG MẶC")
			for row_variant in comparison:
				var row: Dictionary = row_variant
				var row_color: Color = row.get("color", MUTED)
				_add_pair(_detail_body, str(row.get("label", "")), str(row.get("value", "")), row_color)

	var affixes = item.get("affixDetails", [])
	if typeof(affixes) == TYPE_ARRAY and not affixes.is_empty():
		_add_section_label_to(_detail_body, "AFFIX")
		for affix_variant in affixes:
			if typeof(affix_variant) != TYPE_DICTIONARY:
				continue
			var affix: Dictionary = affix_variant
			var formatted := str(affix.get("formatted", affix.get("name", "Affix")))
			var roll := float(affix.get("rollPct", 0))
			_add_small_text(_detail_body, "◆ %s · %.0f%%" % [formatted, roll], _affix_color(roll))
			_add_affix_actions(item, affix)
	elif typeof(item.get("affixes", [])) == TYPE_ARRAY:
		var affix_lines: Array = item.get("affixes", [])
		if not affix_lines.is_empty():
			_add_section_label_to(_detail_body, "AFFIX")
			for line in affix_lines:
				_add_small_text(_detail_body, "◆ " + str(line), CYAN)

	var source := str(item.get("source", ""))
	if source != "":
		_add_small_text(_detail_body, "Nguồn: " + source, MUTED)

	_add_set_engrave_controls(item)
	_add_transfer_controls(item)

	var actions := HBoxContainer.new()
	actions.add_theme_constant_override("separation", 6)
	_detail_body.add_child(actions)

	if not bool(item.get("equipped", false)):
		var equip := _action_button("InventoryEquip", "TRANG BỊ", true)
		equip.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		equip.pressed.connect(_emit_equip.bind(str(item.get("id", ""))))
		actions.add_child(equip)

	_add_enhance_action(actions, item)

func _add_affix_actions(item: Dictionary, affix: Dictionary) -> void:
	var item_id := str(item.get("id", ""))
	if item_id.is_empty():
		return
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 5)
	_detail_body.add_child(row)

	var reforge_cost = affix.get("reforgeCost", {})
	if typeof(reforge_cost) == TYPE_DICTIONARY:
		var reforge := _action_button(
			"InventoryAffixReforge_%s_%s" % [_safe_node_name(item_id), str(affix.get("index", 0))],
			"TÁI LUYỆN",
			_affix_cost_available(reforge_cost)
		)
		reforge.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		reforge.pressed.connect(_emit_equipment_command.bind("reforgeEquipmentAffixV115", {
			"itemId": item_id,
			"index": int(affix.get("index", 0)),
		}))
		row.add_child(reforge)

	var refine_cost = affix.get("refineCost", {})
	if typeof(refine_cost) == TYPE_DICTIONARY and not bool(affix.get("maxRoll", false)):
		var refine := _action_button(
			"InventoryAffixRefine_%s_%s" % [_safe_node_name(item_id), str(affix.get("index", 0))],
			"TINH +1%",
			_affix_cost_available(refine_cost)
		)
		refine.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		refine.pressed.connect(_emit_equipment_command.bind("refineEquipmentAffixV115", {
			"itemId": item_id,
			"index": int(affix.get("index", 0)),
		}))
		row.add_child(refine)

func _affix_cost_available(cost: Dictionary) -> bool:
	var resources: Dictionary = _vm.get("equipment", {}).get("system", {}).get("resources", {})
	var stones := maxi(0, int(resources.get("spiritStones", 0)))
	var essence := maxi(0, int(resources.get("forgingEssence", 0)))
	return (
		stones >= maxi(0, int(cost.get("spiritStones", 0)))
		and essence >= maxi(0, int(cost.get("equipmentEssence", 0)))
	)

func _add_set_engrave_controls(item: Dictionary) -> void:
	var slot_id := str(item.get("slot", ""))
	var category := "attire" if slot_id in ATTIRE_SLOTS else "jewelry" if slot_id in JEWELRY_SLOTS else ""
	if category == "":
		return
	var v142: Dictionary = _vm.get("equipment", {}).get("system", {}).get("v142", {})
	var rows = v142.get("setRows", [])
	if typeof(rows) != TYPE_ARRAY:
		return

	var eligible: Array = []
	for row_variant in rows:
		if typeof(row_variant) != TYPE_DICTIONARY:
			continue
		var set_row: Dictionary = row_variant
		if str(set_row.get("category", "")) != category:
			continue
		if int(set_row.get("fragmentBalance", 0)) <= 0 and str(set_row.get("setId", "")) != str(item.get("setId", "")):
			continue
		eligible.append(set_row)
	if eligible.is_empty():
		return

	_add_section_label_to(_detail_body, "KHẮC SET")
	if str(item.get("setId", "")) != "":
		_add_small_text(_detail_body, "Khắc Set khác sẽ thay Set hiện tại của món.", MUTED)
	for set_variant in eligible:
		var set_row: Dictionary = set_variant
		var set_id := str(set_row.get("setId", ""))
		var current := set_id == str(item.get("setId", ""))
		var balance := maxi(0, int(set_row.get("fragmentBalance", 0)))
		var cost := maxi(1, int(set_row.get("engraveCost", 1)))
		var button := _action_button(
			"InventoryEngrave_%s" % _safe_node_name(set_id),
			("%s · ĐANG KHẮC" % _set_badge(set_id)) if current else ("%s · %s/%s Tàn Ấn" % [_set_badge(set_id), _fmt_num(balance), _fmt_num(cost)]),
			not current and balance >= cost
		)
		button.pressed.connect(_emit_equipment_command.bind("engraveEquipmentSetV142", {
			"itemId": str(item.get("id", "")),
			"setId": set_id,
		}))
		_detail_body.add_child(button)

func _add_transfer_controls(item: Dictionary) -> void:
	var targets = item.get("transferEligibleTargetIds", [])
	if typeof(targets) != TYPE_ARRAY or targets.is_empty():
		return
	var resources: Dictionary = _vm.get("equipment", {}).get("system", {}).get("resources", {})
	var gems := maxi(0, int(resources.get("transferGems", 0)))
	_add_section_label_to(_detail_body, "CHUYỂN CƯỜNG HÓA")
	_add_small_text(_detail_body, "Tốn 1 Ngọc Chuyển. Món nguồn về +0; món đích nhận nguyên cấp +.", MUTED)
	for target_id_variant in targets:
		var target_id := str(target_id_variant)
		var target := _find_item(target_id)
		if target.is_empty() or not bool(target.get("isV142", false)):
			continue
		var button := _action_button(
			"InventoryTransfer_%s" % _safe_node_name(target_id),
			"CHUYỂN +%d → %s" % [
				int(item.get("enhancementLevel", 0)),
				str(target.get("name", "Trang bị đích")),
			],
			gems > 0
		)
		button.pressed.connect(_emit_equipment_command.bind("transferEquipmentEnhancement", {
			"fromItemId": str(item.get("id", "")),
			"toItemId": target_id,
		}))
		_detail_body.add_child(button)

func _add_enhance_action(parent: HBoxContainer, item: Dictionary) -> void:
	var level := maxi(0, int(item.get("enhancementLevel", 0)))
	var max_level := maxi(1, int(item.get("maxEnhancementLevel", 15)))
	if level >= max_level:
		var cap := Label.new()
		cap.text = "CƯỜNG HÓA +%d MAX" % max_level
		cap.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		cap.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		cap.add_theme_font_size_override("font_size", 8)
		cap.add_theme_color_override("font_color", GOLD)
		parent.add_child(cap)
		return
	if not item.has("nextEnhanceChancePct") or not item.has("nextEnhanceCost"):
		return

	var system: Dictionary = _vm.get("equipment", {}).get("system", {})
	var resources: Dictionary = system.get("resources", {})
	var essence := maxi(0, int(resources.get("forgingEssence", 0)))
	var talismans := maxi(0, int(resources.get("protectionTalismans", 0)))
	var cost := maxi(0, int(round(float(item.get("nextEnhanceCost", 0)))))
	var chance := clampf(float(item.get("nextEnhanceChancePct", 0)), 0.0, 100.0)
	var downgrade := clampf(float(item.get("nextEnhanceDowngradeChancePct", 0)), 0.0, 100.0)

	var info := Label.new()
	info.text = "%.0f%% · %s Tinh Hoa" % [chance, _fmt_num(cost)]
	if downgrade > 0:
		info.text += " · %.0f%% tụt" % downgrade
	info.add_theme_font_size_override("font_size", 7)
	info.add_theme_color_override("font_color", MUTED)
	_detail_body.add_child(info)
	_detail_body.move_child(info, maxi(0, _detail_body.get_child_count() - 2))

	var enhance := _action_button("InventoryEnhance", "CƯỜNG HÓA → +%d" % (level + 1), essence >= cost)
	enhance.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	enhance.pressed.connect(_emit_enhance.bind(str(item.get("id", "")), false))
	parent.add_child(enhance)

	if downgrade > 0:
		var protect := _action_button("InventoryEnhanceProtect", "DÙNG BÙA", essence >= cost and talismans > 0)
		protect.custom_minimum_size.x = 92
		protect.pressed.connect(_emit_enhance.bind(str(item.get("id", "")), true))
		parent.add_child(protect)

func _strength_signal(item: Dictionary) -> Dictionary:
	if bool(item.get("equipped", false)):
		return {"label": "ĐANG MẶC", "color": GOLD_HI}

	var equipped := _equipped_slot(str(item.get("slot", "")))
	if equipped.is_empty():
		return {"label": "▲ Ô TRỐNG", "color": POSITIVE}

	var candidate_stats = item.get("effectiveStats", item.get("stats", {}))
	var equipped_stats = equipped.get("stats", {})
	if typeof(candidate_stats) == TYPE_DICTIONARY and typeof(equipped_stats) == TYPE_DICTIONARY and not candidate_stats.is_empty() and not equipped_stats.is_empty():
		var positive := 0
		var negative := 0
		for key in STAT_ORDER:
			var delta := float(candidate_stats.get(key, 0)) - float(equipped_stats.get(key, 0))
			if delta > 0.0001:
				positive += 1
			elif delta < -0.0001:
				negative += 1
		if positive > 0 and negative == 0:
			return {"label": "▲ NÂNG CẤP", "color": POSITIVE}
		if negative > 0 and positive == 0:
			return {"label": "▼ THẤP HƠN", "color": NEGATIVE}
		if positive > 0 and negative > 0:
			return {"label": "↔ ĐỔI LỐI CHƠI", "color": GOLD}
		return {"label": "≈ TƯƠNG ĐƯƠNG", "color": MUTED}

	var candidate_rank := int(item.get("rankIndex", -1))
	var equipped_rank := int(equipped.get("rank_index", -1))
	if candidate_rank >= 0 and equipped_rank >= 0 and candidate_rank != equipped_rank:
		return {"label": "▲ BẬC CAO" if candidate_rank > equipped_rank else "▼ BẬC THẤP", "color": POSITIVE if candidate_rank > equipped_rank else NEGATIVE}

	var candidate_enhance := int(item.get("enhancementLevel", 0))
	var equipped_enhance := int(equipped.get("enhancement", 0))
	if candidate_enhance != equipped_enhance:
		return {"label": "▲ CƯỜNG HÓA CAO" if candidate_enhance > equipped_enhance else "▼ CƯỜNG HÓA THẤP", "color": POSITIVE if candidate_enhance > equipped_enhance else NEGATIVE}

	return {"label": "SO SÁNH", "color": MUTED}

func _comparison_rows(candidate_variant, equipped_variant) -> Array:
	if typeof(candidate_variant) != TYPE_DICTIONARY or typeof(equipped_variant) != TYPE_DICTIONARY:
		return []
	var candidate: Dictionary = candidate_variant
	var equipped: Dictionary = equipped_variant
	var rows: Array = []
	for key in STAT_ORDER:
		var delta := float(candidate.get(key, 0)) - float(equipped.get(key, 0))
		if absf(delta) <= 0.0001:
			continue
		rows.append({
			"label": str(STAT_LABELS.get(key, key)),
			"value": _format_delta(key, delta),
			"color": POSITIVE if delta > 0 else NEGATIVE,
		})
		if rows.size() >= 6:
			break
	return rows

func _equipped_slot(slot_id: String) -> Dictionary:
	var slots = _vm.get("equipment", {}).get("slots", [])
	if typeof(slots) != TYPE_ARRAY:
		return {}
	for slot_variant in slots:
		if typeof(slot_variant) != TYPE_DICTIONARY:
			continue
		var slot: Dictionary = slot_variant
		if str(slot.get("id", "")) == slot_id:
			return slot
	return {}

func _find_item(item_id: String) -> Dictionary:
	var inventory = _vm.get("equipment", {}).get("inventory", [])
	if typeof(inventory) != TYPE_ARRAY:
		return {}
	for item_variant in inventory:
		if typeof(item_variant) != TYPE_DICTIONARY:
			continue
		var item: Dictionary = item_variant
		if str(item.get("id", "")) == item_id:
			return item
	return {}

func _has_heavy_detail(item: Dictionary) -> bool:
	return item.has("effectiveStats") or item.has("nextEnhanceChancePct") or item.has("affixDetails")

func _slot_short_label(slot_id: String) -> String:
	var labels := {
		"weapon": "BINH", "head": "QUAN", "robe": "BÀO", "belt": "ĐÁI", "gloves": "UYỂN",
		"boots": "NGOA", "necklace": "BỘI", "ring": "GIỚI", "bracelet": "TRẠC", "talisman": "PHÙ",
	}
	return str(labels.get(slot_id, slot_id.to_upper()))


func _set_filter(filter_id: String) -> void:
	_filter = filter_id
	_selected_item_id = ""
	_detail_layer.visible = false
	_render()

func _update_tab_styles() -> void:
	for key in _tabs.keys():
		var button := _tabs[key] as Button
		var active := str(key) == _filter
		button.add_theme_color_override("font_color", GOLD_HI if active else MUTED)
		button.add_theme_stylebox_override("normal", _box(
			Color(0.07, 0.08, 0.045, 0.92) if active else Color(0.012, 0.040, 0.055, 0.88),
			10,
			Color(0.92, 0.75, 0.32, 0.55) if active else Color(0.36, 0.61, 0.67, 0.18),
			1
		))
		button.add_theme_stylebox_override("pressed", _box(Color(0.11, 0.09, 0.04, 0.98), 10, GOLD, 2))

func _hide_detail() -> void:
	_selected_item_id = ""
	_detail_layer.visible = false

func _emit_equipment_command(action_id: String, payload: Dictionary) -> void:
	if action_id.is_empty():
		return
	set_status_message("Đang xử lý trang bị…")
	equipment_command_requested.emit(action_id, payload)


func _emit_equip(item_id: String) -> void:
	if item_id != "":
		set_status_message("Đang trang bị…")
		equip_requested.emit(item_id)

func _emit_enhance(item_id: String, use_protection: bool) -> void:
	if item_id != "":
		set_status_message("Đang cường hóa…")
		enhance_requested.emit(item_id, use_protection)

func _panel_card(accent: Color = CYAN) -> VBoxContainer:
	var wrapper := PanelContainer.new()
	wrapper.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var style := _box(CARD, 12, Color(accent.r, accent.g, accent.b, 0.30), 1)
	style.content_margin_left = 10
	style.content_margin_right = 10
	style.content_margin_top = 8
	style.content_margin_bottom = 8
	wrapper.add_theme_stylebox_override("panel", style)
	_body.add_child(wrapper)
	var card := VBoxContainer.new()
	card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	card.add_theme_constant_override("separation", 4)
	wrapper.add_child(card)
	return card

func _add_title_pair(parent: VBoxContainer, left: String, right: String, accent: Color) -> void:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	parent.add_child(row)
	var l := Label.new()
	l.text = left
	l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	l.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	l.add_theme_font_size_override("font_size", 10)
	l.add_theme_color_override("font_color", accent)
	row.add_child(l)
	var r := Label.new()
	r.text = right
	r.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	r.add_theme_font_size_override("font_size", 9)
	r.add_theme_color_override("font_color", GOLD_HI)
	row.add_child(r)

func _add_pair(parent: VBoxContainer, key: String, value: String, color: Color) -> void:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	parent.add_child(row)
	var k := Label.new()
	k.text = key
	k.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	k.add_theme_font_size_override("font_size", 8)
	k.add_theme_color_override("font_color", MUTED)
	row.add_child(k)
	var v := Label.new()
	v.text = value
	v.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	v.add_theme_font_size_override("font_size", 8)
	v.add_theme_color_override("font_color", color)
	row.add_child(v)

func _add_small_text(parent: VBoxContainer, value: String, color: Color) -> void:
	var label := Label.new()
	label.text = value
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.add_theme_font_size_override("font_size", 8)
	label.add_theme_color_override("font_color", color)
	parent.add_child(label)

func _add_section_label(value: String) -> void:
	_add_section_label_to(_body, value)

func _add_section_label_to(parent: VBoxContainer, value: String) -> void:
	var label := Label.new()
	label.text = value
	label.custom_minimum_size = Vector2(0, 20)
	label.add_theme_font_size_override("font_size", 8)
	label.add_theme_color_override("font_color", GOLD)
	parent.add_child(label)

func _add_empty(message: String) -> void:
	var card := _panel_card(CYAN)
	_add_small_text(card, message, MUTED)

func _action_button(node_name: String, caption: String, enabled: bool) -> Button:
	var button := Button.new()
	button.name = node_name
	button.text = caption
	button.disabled = not enabled
	button.custom_minimum_size = Vector2(0, 34)
	button.focus_mode = Control.FOCUS_NONE
	button.add_theme_font_size_override("font_size", 8)
	button.add_theme_color_override("font_color", GOLD_HI if enabled else MUTED)
	button.add_theme_stylebox_override("normal", _box(Color(0.045, 0.070, 0.065, 0.96), 10, Color(0.88, 0.71, 0.29, 0.42), 1))
	button.add_theme_stylebox_override("pressed", _box(Color(0.11, 0.10, 0.055, 0.99), 10, GOLD_HI, 2))
	button.add_theme_stylebox_override("disabled", _box(Color(0.02, 0.035, 0.045, 0.72), 10, Color(0.30, 0.38, 0.40, 0.14), 1))
	return button

func _set_bonus_text(threshold: Dictionary) -> String:
	var parts: Array[String] = []
	var multipliers = threshold.get("statMultipliers", {})
	if typeof(multipliers) == TYPE_DICTIONARY:
		for key in multipliers.keys():
			var value := float(multipliers.get(key, 0))
			if absf(value) <= 0.0001:
				continue
			parts.append("%s +%.0f%%" % [str(STAT_LABELS.get(key, key)), value * 100.0])
	var flats = threshold.get("flatStats", {})
	if typeof(flats) == TYPE_DICTIONARY:
		for key in flats.keys():
			var value := float(flats.get(key, 0))
			if absf(value) <= 0.0001:
				continue
			parts.append("%s %s" % [str(STAT_LABELS.get(key, key)), _format_stat(str(key), value)])
	return " · ".join(parts)


func _set_accent(set_id: String) -> Color:
	var id := set_id.to_lower()
	if id.contains(".metal"):
		return Color("f4df9b")
	if id.contains(".wood"):
		return Color("7fd69a")
	if id.contains(".water"):
		return Color("75d7ef")
	if id.contains(".fire"):
		return Color("ff9a78")
	if id.contains(".earth"):
		return Color("d9b56f")
	if id.contains("huyen_nguyen"):
		return Color("b7a4ff")
	if id.contains("pha_gioi"):
		return Color("f0c86e")
	if id.contains("hu_khong"):
		return Color("93c9ff")
	if id.contains("tran_thu"):
		return Color("a9d6c2")
	return CYAN

func _set_badge(set_id: String) -> String:
	var id := set_id.to_lower()
	if id.contains(".metal"):
		return "KIM"
	if id.contains(".wood"):
		return "MỘC"
	if id.contains(".water"):
		return "THỦY"
	if id.contains(".fire"):
		return "HỎA"
	if id.contains(".earth"):
		return "THỔ"
	if id.contains("huyen_nguyen"):
		return "HUYỀN"
	if id.contains("pha_gioi"):
		return "PHÁ"
	if id.contains("hu_khong"):
		return "HƯ"
	if id.contains("tran_thu"):
		return "TRẤN"
	return "SET"


func _compact_set_name(value: String) -> String:
	if value.length() <= 24:
		return value
	return value.substr(0, 22) + "…"

func _affix_color(roll_pct: float) -> Color:
	if roll_pct >= 90.0:
		return GOLD_HI
	if roll_pct >= 75.0:
		return POSITIVE
	if roll_pct >= 55.0:
		return CYAN
	return MUTED

func _format_stat(key: String, value: float) -> String:
	if key.ends_with("Pct"):
		return "+%.1f%%" % value
	if key == "actionSpeed" and absf(value) <= 5.0:
		return "+%.1f%%" % (value * 100.0)
	return "+%s" % _fmt_num(value)

func _format_delta(key: String, value: float) -> String:
	var sign := "+" if value > 0 else ""
	if key.ends_with("Pct"):
		return "%s%.1f%%" % [sign, value]
	if key == "actionSpeed" and absf(value) <= 5.0:
		return "%s%.1f%%" % [sign, value * 100.0]
	return "%s%s" % [sign, _fmt_num(value)]

func _fmt_num(value: float) -> String:
	var raw := str(int(round(value)))
	var negative := raw.begins_with("-")
	var digits := raw.substr(1) if negative else raw
	var out := ""
	var count := 0
	for i in range(digits.length() - 1, -1, -1):
		if count > 0 and count % 3 == 0:
			out = "." + out
		out = digits.substr(i, 1) + out
		count += 1
	return ("-" if negative else "") + out

func _safe_node_name(value: String) -> String:
	return value.replace(".", "_").replace("-", "_").replace("/", "_")

func _clear(parent: Node) -> void:
	for child in parent.get_children():
		parent.remove_child(child)
		child.queue_free()

func _anchor(control: Control, left: float, top: float, right: float, bottom: float) -> void:
	control.anchor_left = 0.0
	control.anchor_right = 0.0
	control.anchor_top = 0.0
	control.anchor_bottom = 0.0
	control.offset_left = left
	control.offset_top = top
	control.offset_right = right
	control.offset_bottom = bottom

func _box(fill: Color, radius: int, border: Color, border_width: int) -> StyleBoxFlat:
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
