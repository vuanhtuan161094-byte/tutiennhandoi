extends Control

signal close_requested
signal equip_requested(item_id: String)
signal profile_action_requested(action_id: String, payload: Dictionary)

const GOLD := Color("e8c76d")
const GOLD_HI := Color("fff0b8")
const CYAN := Color("77e6ef")
const TEXT := Color("f4f0e6")
const MUTED := Color("9cabb5")
const PANEL := Color(0.008, 0.025, 0.040, 0.97)
const CARD := Color(0.014, 0.045, 0.063, 0.92)

const SLOT_LABELS := {
	"weapon": "Đạo Binh", "head": "Đạo Quan", "robe": "Pháp Bào", "belt": "Huyền Đái",
	"gloves": "Hộ Uyển", "boots": "Vân Ngoa", "necklace": "Ngọc Bội", "ring": "Đạo Giới",
	"bracelet": "Linh Trạc", "talisman": "Hộ Phù",
}

const STAT_LABELS := {
	"attack": "Công Lực", "maxHp": "Khí Huyết", "defense": "Phòng Ngự", "maxSpirit": "Chân Nguyên",
	"critChancePct": "Bạo Kích", "heartChancePct": "Hội Tâm", "critDamagePct": "Bạo Thương",
	"armorPenPct": "Xuyên Phòng", "dodgeChancePct": "Né Tránh", "mobility": "Thân Pháp",
	"accuracy": "Chính Xác", "controlPower": "Khống Chế", "resolve": "Định Lực",
	"controlDurationReductionPct": "Kháng Khống Chế", "damageReductionPct": "Giảm Thương",
	"spiritEfficiencyPct": "Hiệu Suất Chân Nguyên", "actionSpeed": "Tốc Độ Hành Động",
	"breakEffectPct": "Phá Thế",
}

const ELEMENT_LABELS := {
	"Metal": "Kim", "Wood": "Mộc", "Water": "Thủy", "Fire": "Hỏa", "Earth": "Thổ",
	"metal": "Kim", "wood": "Mộc", "water": "Thủy", "fire": "Hỏa", "earth": "Thổ",
}

var _vm: Dictionary = {}
var _mode := ""
var _profile_tab := "origin"

var _title: Label
var _subtitle: Label
var _profile_tabs: HBoxContainer
var _body: VBoxContainer
var _scroll: ScrollContainer

func _ready() -> void:
	name = "CharacterDetailSheet"
	visible = false
	mouse_filter = Control.MOUSE_FILTER_STOP
	_build_shell()

func show_detail(mode: String, vm: Dictionary) -> void:
	_mode = mode
	_vm = vm.duplicate(true)
	_profile_tab = "origin"
	visible = true
	_render()

func refresh(vm: Dictionary) -> void:
	_vm = vm.duplicate(true)
	if visible:
		_render()

func close() -> void:
	visible = false
	close_requested.emit()

func _build_shell() -> void:
	var scrim := ColorRect.new()
	scrim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	scrim.color = Color(0.0, 0.01, 0.018, 0.78)
	scrim.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(scrim)

	var panel := Panel.new()
	panel.name = "DetailPanel"
	_anchor(panel, 7, 38, 383, 746)
	panel.add_theme_stylebox_override("panel", _box(PANEL, 18, Color(0.75, 0.64, 0.31, 0.48), 1))
	add_child(panel)

	var header := Control.new()
	_anchor(header, 10, 8, 366, 62)
	panel.add_child(header)

	_title = Label.new()
	_title.name = "CharacterDetailTitle"
	_title.add_theme_font_size_override("font_size", 18)
	_title.add_theme_color_override("font_color", GOLD_HI)
	_anchor(_title, 8, 2, 282, 28)
	header.add_child(_title)

	_subtitle = Label.new()
	_subtitle.add_theme_font_size_override("font_size", 9)
	_subtitle.add_theme_color_override("font_color", MUTED)
	_anchor(_subtitle, 8, 29, 300, 50)
	header.add_child(_subtitle)

	var close_button := Button.new()
	close_button.name = "CharacterDetailClose"
	close_button.text = "×"
	close_button.add_theme_font_size_override("font_size", 20)
	close_button.add_theme_color_override("font_color", TEXT)
	close_button.add_theme_stylebox_override("normal", _box(Color(0.02, 0.05, 0.07, 0.88), 18, Color(0.48, 0.67, 0.72, 0.24), 1))
	_anchor(close_button, 314, 4, 354, 44)
	close_button.pressed.connect(close)
	header.add_child(close_button)

	_profile_tabs = HBoxContainer.new()
	_profile_tabs.name = "CharacterProfileTabs"
	_profile_tabs.add_theme_constant_override("separation", 4)
	_anchor(_profile_tabs, 12, 64, 364, 104)
	panel.add_child(_profile_tabs)

	for spec in [
		["origin", "Căn Nguyên"],
		["blood", "Huyết Mạch"],
		["physique", "Thể Chất"],
		["skills", "Kỹ Năng"],
	]:
		var button := Button.new()
		button.name = "ProfileTab_%s" % str(spec[0])
		button.text = str(spec[1])
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.add_theme_font_size_override("font_size", 9)
		button.pressed.connect(_set_profile_tab.bind(str(spec[0])))
		_profile_tabs.add_child(button)

	_scroll = ScrollContainer.new()
	_scroll.name = "CharacterDetailScroll"
	_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	_anchor(_scroll, 12, 108, 364, 690)
	panel.add_child(_scroll)

	_body = VBoxContainer.new()
	_body.name = "CharacterDetailBody"
	_body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_body.add_theme_constant_override("separation", 8)
	_scroll.add_child(_body)

func _render() -> void:
	_clear_body()
	_profile_tabs.visible = _mode == "profile"
	_scroll.offset_top = 108 if _profile_tabs.visible else 70
	_scroll.scroll_vertical = 0

	match _mode:
		"equipment":
			_title.text = "Trang Bị"
			_subtitle.text = "10 vị trí · Cường Hóa · Bộ Trang Bị"
			_render_equipment()
		"stats":
			_title.text = "Thuộc Tính"
			_subtitle.text = "Chỉ số chiến đấu chi tiết"
			_render_stats()
		"profile":
			_title.text = "Hồ Sơ Tu Hành"
			_subtitle.text = "Căn nguyên và tiến trình nhân vật hiện tại"
			_render_profile()
		_:
			_title.text = "Nhân Vật"
			_subtitle.text = ""
			_add_note("Chưa có nội dung.")

func _clear_body() -> void:
	for child in _body.get_children():
		child.queue_free()

func _render_equipment() -> void:
	var equipment: Dictionary = _vm.get("equipment", {})
	var slots: Array = equipment.get("slots", [])
	var inventory: Array = equipment.get("inventory", [])
	var system: Dictionary = equipment.get("system", {})
	var resources: Dictionary = system.get("resources", {})

	var summary := _card()
	_add_card_title(summary, "ĐANG MẶC", "%d/%d ô" % [
		int(equipment.get("equipped_count", 0)),
		int(equipment.get("canonical_slot_count", 10)),
	])
	_add_pair(summary, "Khí Luyện Tinh Hoa", _fmt_num(float(resources.get("forgingEssence", 0))))
	_add_pair(summary, "Bùa Chống Tụt", _fmt_num(float(resources.get("protectionTalismans", 0))))

	var sets_variant = system.get("sets", [])
	if typeof(sets_variant) == TYPE_ARRAY:
		var active_sets: Array = sets_variant.filter(func(entry): return typeof(entry) == TYPE_DICTIONARY and int(entry.get("equippedPieces", 0)) > 0)
		if not active_sets.is_empty():
			_add_section_label("BỘ ĐANG KÍCH HOẠT")
			for set_variant in active_sets:
				var set_data: Dictionary = set_variant
				var set_card := _card()
				_add_card_title(set_card, str(set_data.get("setName", "Bộ Trang Bị")), "%d/%d" % [
					int(set_data.get("equippedPieces", 0)),
					int(set_data.get("maxPieces", 0)),
				])
				var thresholds = set_data.get("thresholds", [])
				if typeof(thresholds) == TYPE_ARRAY:
					for threshold_variant in thresholds:
						if typeof(threshold_variant) == TYPE_DICTIONARY:
							var threshold: Dictionary = threshold_variant
							var state := "Đã kích" if bool(threshold.get("active", false)) else "Chưa kích"
							_add_pair(set_card, "%d món · %s" % [int(threshold.get("pieces", 0)), str(threshold.get("name", "Hiệu ứng"))], state)

	_add_section_label("10 VỊ TRÍ TRANG BỊ")
	for slot_variant in slots:
		if typeof(slot_variant) != TYPE_DICTIONARY:
			continue
		var slot: Dictionary = slot_variant
		var card := _card()
		var label := str(slot.get("label", SLOT_LABELS.get(str(slot.get("id", "")), "Trang bị")))
		if bool(slot.get("filled", false)):
			_add_card_title(card, label, "+%d" % int(slot.get("enhancement", 0)))
			_add_body_text(card, str(slot.get("name", "Trang bị")), GOLD_HI, 12)
			var meta: Array[String] = []
			var rank := str(slot.get("rank_name", ""))
			if rank != "":
				meta.append(rank)
			var set_name := str(slot.get("set_name", ""))
			if set_name != "":
				meta.append(set_name)
			var source := str(slot.get("source", ""))
			if source != "":
				meta.append(source)
			if not meta.is_empty():
				_add_body_text(card, " · ".join(meta), MUTED, 9)
			_add_stats_line(card, slot.get("stats", {}))
		else:
			_add_card_title(card, label, "Ô trống")
			_add_body_text(card, "Chưa trang bị", MUTED, 10)

	_add_section_label("KHO TRANG BỊ")
	if inventory.is_empty():
		_add_note("Chưa có trang bị trong kho.")
		return

	var equipped_ids := {}
	for slot_variant in slots:
		if typeof(slot_variant) == TYPE_DICTIONARY:
			var item_id := str(slot_variant.get("item_id", ""))
			if item_id != "":
				equipped_ids[item_id] = true

	var shown := 0
	for item_variant in inventory:
		if typeof(item_variant) != TYPE_DICTIONARY:
			continue
		if shown >= 36:
			break
		var item: Dictionary = item_variant
		var card := _card()
		var item_id := str(item.get("id", ""))
		var is_equipped := bool(equipped_ids.get(item_id, false)) or bool(item.get("equipped", false))
		var slot_label := str(item.get("slotLabel", SLOT_LABELS.get(str(item.get("slot", "")), "Trang bị")))
		var enhancement := int(item.get("enhancementLevel", 0))
		_add_card_title(card, slot_label, "ĐANG MẶC" if is_equipped else "+%d" % enhancement)
		_add_body_text(card, str(item.get("name", "Trang bị")), GOLD_HI if is_equipped else TEXT, 12)

		var meta: Array[String] = []
		for value in [
			str(item.get("equipmentRankName", "")),
			str(item.get("grade", "")),
			str(item.get("setName", "")),
			str(item.get("source", "")),
		]:
			if value != "" and not meta.has(value):
				meta.append(value)
		if not meta.is_empty():
			_add_body_text(card, " · ".join(meta), MUTED, 8)

		_add_stats_line(card, item.get("effectiveStats", item.get("stats", {})))

		if not is_equipped and item_id != "":
			var equip_button := Button.new()
			equip_button.text = "TRANG BỊ"
			equip_button.name = "Equip_%s" % _safe_node_name(item_id)
			equip_button.add_theme_font_size_override("font_size", 10)
			equip_button.add_theme_color_override("font_color", GOLD_HI)
			equip_button.add_theme_stylebox_override("normal", _box(Color(0.05, 0.08, 0.07, 0.94), 12, Color(0.91, 0.73, 0.28, 0.52), 1))
			equip_button.custom_minimum_size = Vector2(0, 34)
			equip_button.pressed.connect(_emit_equip.bind(item_id))
			card.add_child(equip_button)

		shown += 1

func _render_stats() -> void:
	var stats: Dictionary = _vm.get("stats", {})
	var combat: Dictionary = stats.get("combat", {})

	var core := _card()
	_add_card_title(core, "CHỈ SỐ LÕI", "Nền tảng")
	_add_pair(core, "Công Lực", _fmt_num(float(stats.get("power", 0))))
	_add_pair(core, "Thể Phách", _fmt_num(float(stats.get("body", 0))))
	_add_pair(core, "Phòng Ngự", _fmt_num(float(stats.get("defense", 0))))

	_add_stat_group("TẤN CÔNG", [
		["Công Lực", _fmt_num(float(combat.get("attack", 0)))],
		["Hội Tâm", _pct(float(combat.get("heartChancePct", 0)))],
		["Bạo Kích", _pct(float(combat.get("critChancePct", 0)))],
		["Bạo Thương", _crit_damage(combat)],
		["Xuyên Phòng", _pct(float(combat.get("armorPenPct", 0)))],
		["Chính Xác", _fmt_num(float(combat.get("accuracy", 0)))],
		["Phá Thế", _pct(float(combat.get("breakEffectPct", 0)))],
	])

	_add_stat_group("SINH TỒN", [
		["Khí Huyết", _fmt_num(float(combat.get("maxHp", 0)))],
		["Phòng Ngự", _fmt_num(float(combat.get("defense", 0)))],
		["Giảm Thương", _pct(float(combat.get("damageReductionPct", 0)))],
		["Né Tránh", _pct(float(combat.get("dodgeChancePct", 0)))],
		["Định Lực", _fmt_num(float(combat.get("resolve", 0)))],
		["Kháng Khống Chế", _pct(float(combat.get("controlDurationReductionPct", 0)))],
	])

	_add_stat_group("BẢN ĐẠO", [
		["Chân Nguyên", _fmt_num(float(combat.get("maxSpirit", 0)))],
		["Hiệu Suất Chân Nguyên", _pct(float(combat.get("spiritEfficiencyPct", 0)))],
		["Tốc Độ Hành Động", _speed_pct(float(combat.get("actionSpeed", 1.0)))],
		["Thân Pháp", _fmt_num(float(combat.get("mobility", 0)))],
		["Khống Chế", _fmt_num(float(combat.get("controlPower", 0)))],
	])

	var affinities = combat.get("elementalAffinities", {})
	var resistances = combat.get("elementalResistancesPct", {})
	if typeof(affinities) == TYPE_DICTIONARY or typeof(resistances) == TYPE_DICTIONARY:
		var elements := {}
		if typeof(affinities) == TYPE_DICTIONARY:
			for key in affinities.keys():
				elements[str(key)] = true
		if typeof(resistances) == TYPE_DICTIONARY:
			for key in resistances.keys():
				elements[str(key)] = true
		if not elements.is_empty():
			var card := _card()
			_add_card_title(card, "NGŨ HÀNH", "Hiệu lực / Kháng")
			for key in elements.keys():
				var affinity := _element_pct(affinities.get(key, 0) if typeof(affinities) == TYPE_DICTIONARY else 0)
				var resist := _element_pct(resistances.get(key, 0) if typeof(resistances) == TYPE_DICTIONARY else 0)
				_add_pair(card, str(ELEMENT_LABELS.get(key, key)), "%.1f%% / %.1f%%" % [affinity, resist])

func _render_profile() -> void:
	_update_profile_tab_styles()
	match _profile_tab:
		"blood":
			_render_profile_blood()
		"physique":
			_render_profile_physique()
		"skills":
			_render_profile_skills()
		_:
			_render_profile_origin()

func _render_profile_origin() -> void:
	var profile: Dictionary = _vm.get("profile", {})
	var root: Dictionary = profile.get("root", {})
	var grade: Dictionary = root.get("grade", {})
	var detail: Dictionary = profile.get("origin_details", {})
	var birth: Dictionary = profile.get("birth", {})

	var root_card := _card()
	_add_card_title(root_card, "LINH CĂN", "V145")
	_add_body_text(root_card, "%s · Lv%d" % [
		str(grade.get("name", _vm.get("identity", {}).get("root_name", "Phàm Căn"))),
		int(root.get("level", grade.get("level", 1))),
	], GOLD_HI, 14)
	_add_pair(root_card, "Tu Vi", "+%.1f%%" % float(root.get("cultivationBonusPct", 0)))
	var root_combat: Dictionary = root.get("combat", {})
	_add_pair(root_card, "Công", "+%.1f%%" % float(root_combat.get("attackPct", 0)))
	_add_pair(root_card, "Khí Huyết", "+%.1f%%" % float(root_combat.get("maxHpPct", 0)))
	_add_pair(root_card, "Phòng", "+%.1f%%" % float(root_combat.get("defensePct", 0)))

	var permanent := _card()
	_add_card_title(permanent, "CĂN NGUYÊN", "Giữ qua Luân Hồi")
	var blood: Dictionary = detail.get("bloodline", {})
	var physique: Dictionary = detail.get("physique", {})
	_add_pair(permanent, "Huyết Mạch", _origin_name(blood, "Vô Huyết Mạch"))
	_add_pair(permanent, "Thể Chất", _origin_name(physique, "Phàm Thể"))

	var life := _card()
	_add_card_title(life, "ĐỜI HIỆN TẠI", "Khởi nguyên")
	var talent: Dictionary = detail.get("talent", {})
	var fate: Dictionary = detail.get("fate", {})
	var background: Dictionary = detail.get("background", {})
	_add_pair(life, "Thiên Tư", _origin_name(talent, "Vô Thiên Tư"))
	_add_pair(life, "Mệnh Cách", str(fate.get("name", birth.get("fate", "Không rõ"))))
	_add_pair(life, "Xuất Thân", str(background.get("name", birth.get("family", "Không rõ"))))
	_add_pair(life, "Gia Tộc", str(birth.get("family", "Không rõ")))

func _render_profile_blood() -> void:
	var profile: Dictionary = _vm.get("profile", {})
	var detail: Dictionary = profile.get("origin_details", {})
	var progression: Dictionary = profile.get("origin_progression", {})
	var native: Dictionary = detail.get("bloodline", {})
	var blood: Dictionary = progression.get("bloodline", {})
	var resources: Dictionary = progression.get("resources", {})

	var card := _card()
	_add_card_title(card, "HUYẾT MẠCH", "Tiến trình vĩnh viễn")
	_add_body_text(card, str(blood.get("name", native.get("name", "Vô Huyết Mạch"))), GOLD_HI, 14)
	_add_pair(card, "Phẩm", str(blood.get("grade", native.get("grade", "Phàm"))))
	_add_pair(card, "Độ Thuần", "%.0f / 100" % float(blood.get("purity", native.get("purity", 0))))
	_add_pair(card, "Huyết Tinh", _fmt_num(float(resources.get("bloodlineEssence", 0))))
	_add_pair(card, "Hộ Huyết", _fmt_num(float(resources.get("protection", 0))))
	_add_pair(card, "Nuôi Độ Thuần", "Sẵn sàng" if bool(blood.get("canPurify", false)) else "Chưa đủ điều kiện")
	_add_pair(card, "Thăng Huyết Mạch", "Sẵn sàng" if bool(blood.get("canAdvance", false)) else "Chưa đủ điều kiện")

	if bool(blood.get("available", false)):
		var purify := _action_button("BloodlinePurify", "NUÔI ĐỘ THUẦN +10", bool(blood.get("canPurify", false)))
		purify.pressed.connect(_emit_profile_action.bind("nourishBloodline", {"points": 10}))
		card.add_child(purify)

		var advance := _action_button("BloodlineAdvance", "THĂNG HUYẾT MẠCH", bool(blood.get("canAdvance", false)))
		advance.pressed.connect(_emit_profile_action.bind("advanceBloodline", {"useProtection": false}))
		card.add_child(advance)

		var protection_cost := maxi(0, int(blood.get("protectionCost", 0)))
		if protection_cost > 0:
			var protection_have := maxi(0, int(resources.get("protection", 0)))
			var protected := _action_button(
				"BloodlineAdvanceProtected",
				"BẢO HỘ + THĂNG · %d" % protection_cost,
				bool(blood.get("canAdvance", false)) and protection_have >= protection_cost
			)
			protected.pressed.connect(_emit_profile_action.bind("advanceBloodline", {"useProtection": true}))
			card.add_child(protected)

	var catalog: Array = profile.get("bloodlines", [])
	if not catalog.is_empty():
		var owned := _card()
		_add_card_title(owned, "HUYẾT MẠCH HIỆN CÓ", "%d" % catalog.size())
		for entry_variant in catalog:
			if typeof(entry_variant) == TYPE_DICTIONARY:
				var entry: Dictionary = entry_variant
				_add_pair(owned, str(entry.get("name", entry.get("id", "Huyết Mạch"))), "%.0f%%" % float(entry.get("purity", 0)))

func _render_profile_physique() -> void:
	var profile: Dictionary = _vm.get("profile", {})
	var detail: Dictionary = profile.get("origin_details", {})
	var progression: Dictionary = profile.get("origin_progression", {})
	var native: Dictionary = detail.get("physique", {})
	var physique: Dictionary = progression.get("physique", {})
	var resources: Dictionary = progression.get("resources", {})

	var card := _card()
	_add_card_title(card, "THỂ CHẤT", "Tiến cảnh thân thể")
	_add_body_text(card, str(physique.get("name", native.get("name", "Phàm Thể"))), GOLD_HI, 14)
	_add_pair(card, "Cảnh hiện tại", str(physique.get("stage", native.get("stage", "Phàm Thể"))))
	_add_pair(card, "Cảnh kế", str(physique.get("nextStage", "—")))
	_add_pair(card, "Thể Phách Tinh Hoa", _fmt_num(float(resources.get("bodyEssence", 0))))
	_add_pair(card, "Chi phí", _fmt_num(float(physique.get("cost", 0))))
	_add_pair(card, "Tiến Thể Chất", "Sẵn sàng" if bool(physique.get("canAdvance", false)) else "Chưa đủ điều kiện")
	if bool(physique.get("available", false)):
		var advance := _action_button("PhysiqueAdvance", "TIẾN THỂ CHẤT", bool(physique.get("canAdvance", false)))
		advance.pressed.connect(_emit_profile_action.bind("advancePhysique", {}))
		card.add_child(advance)

	var names: Array = profile.get("physiques", [])
	if not names.is_empty():
		var current := _card()
		_add_card_title(current, "THỂ CHẤT ĐÃ THỨC TỈNH", "%d" % names.size())
		for name_variant in names:
			_add_body_text(current, str(name_variant), TEXT, 11)

func _render_profile_skills() -> void:
	var profile: Dictionary = _vm.get("profile", {})
	var skills: Array = profile.get("known_skills", [])
	var card := _card()
	_add_card_title(card, "KỸ NĂNG ĐÃ LĨNH NGỘ", "%d" % skills.size())
	_add_body_text(card, "Kỹ năng chiến đấu đã lĩnh ngộ trong đời hiện tại.", MUTED, 8)

	if skills.is_empty():
		_add_note("Chưa lĩnh ngộ kỹ năng chiến đấu.")
		return

	for skill_variant in skills:
		if typeof(skill_variant) != TYPE_DICTIONARY:
			continue
		var skill: Dictionary = skill_variant
		var skill_card := _card()
		_add_card_title(skill_card, "ĐANG DÙNG" if bool(skill.get("active", false)) else "KỸ NĂNG", str(skill.get("dao", "")))
		_add_body_text(skill_card, str(skill.get("name", "Kỹ năng")), GOLD_HI if bool(skill.get("active", false)) else TEXT, 12)
		var description := str(skill.get("description", ""))
		if description != "":
			_add_body_text(skill_card, description, MUTED, 8)
		_add_pair(skill_card, "Chân Nguyên", _fmt_num(float(skill.get("spiritCost", 0))))
		_add_pair(skill_card, "Hồi chiêu", "%.1fs" % float(skill.get("cooldown", 0)))

func _set_profile_tab(tab: String) -> void:
	_profile_tab = tab
	_clear_body()
	_render_profile()
	_scroll.scroll_vertical = 0

func _update_profile_tab_styles() -> void:
	for child in _profile_tabs.get_children():
		if child is Button:
			var button := child as Button
			var active := button.name == "ProfileTab_%s" % _profile_tab
			button.add_theme_color_override("font_color", GOLD_HI if active else MUTED)
			button.add_theme_stylebox_override("normal", _box(
				Color(0.07, 0.08, 0.06, 0.92) if active else Color(0.01, 0.04, 0.055, 0.82),
				10,
				Color(0.92, 0.74, 0.30, 0.48) if active else Color(0.35, 0.55, 0.62, 0.20),
				1
			))

func _add_stat_group(title: String, rows: Array) -> void:
	var card := _card()
	_add_card_title(card, title, "")
	for row_variant in rows:
		var row: Array = row_variant
		_add_pair(card, str(row[0]), str(row[1]))

func _card() -> VBoxContainer:
	var wrapper := PanelContainer.new()
	wrapper.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var style := _box(CARD, 12, Color(0.37, 0.59, 0.65, 0.18), 1)
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

func _add_card_title(card: VBoxContainer, left: String, right: String) -> void:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	card.add_child(row)

	var l := Label.new()
	l.text = left
	l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	l.add_theme_font_size_override("font_size", 9)
	l.add_theme_color_override("font_color", CYAN)
	row.add_child(l)

	var r := Label.new()
	r.text = right
	r.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	r.add_theme_font_size_override("font_size", 9)
	r.add_theme_color_override("font_color", GOLD)
	row.add_child(r)

func _add_body_text(card: VBoxContainer, value: String, color: Color, size: int) -> void:
	var label := Label.new()
	label.text = value
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", color)
	card.add_child(label)

func _add_pair(card: VBoxContainer, key: String, value: String) -> void:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	card.add_child(row)

	var k := Label.new()
	k.text = key
	k.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	k.add_theme_font_size_override("font_size", 9)
	k.add_theme_color_override("font_color", MUTED)
	row.add_child(k)

	var v := Label.new()
	v.text = value
	v.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	v.add_theme_font_size_override("font_size", 9)
	v.add_theme_color_override("font_color", TEXT)
	row.add_child(v)

func _add_stats_line(card: VBoxContainer, stats_variant) -> void:
	if typeof(stats_variant) != TYPE_DICTIONARY:
		return
	var stats: Dictionary = stats_variant
	var parts: Array[String] = []
	for key in ["attack", "maxHp", "defense", "maxSpirit", "accuracy", "resolve"]:
		if stats.has(key) and absf(float(stats.get(key, 0))) > 0.0001:
			parts.append("%s +%s" % [str(STAT_LABELS.get(key, key)), _fmt_num(float(stats.get(key, 0)))])
		if parts.size() >= 3:
			break
	if not parts.is_empty():
		_add_body_text(card, " · ".join(parts), CYAN, 8)

func _add_section_label(value: String) -> void:
	var label := Label.new()
	label.text = value
	label.add_theme_font_size_override("font_size", 9)
	label.add_theme_color_override("font_color", GOLD)
	label.custom_minimum_size = Vector2(0, 20)
	_body.add_child(label)

func _add_note(value: String) -> void:
	var card := _card()
	_add_body_text(card, value, MUTED, 9)

func _emit_equip(item_id: String) -> void:
	equip_requested.emit(item_id)

func _emit_profile_action(action_id: String, payload: Dictionary) -> void:
	profile_action_requested.emit(action_id, payload)

func _action_button(node_name: String, caption: String, enabled: bool) -> Button:
	var button := Button.new()
	button.name = node_name
	button.text = caption
	button.disabled = not enabled
	button.custom_minimum_size = Vector2(0, 36)
	button.add_theme_font_size_override("font_size", 10)
	button.add_theme_color_override("font_color", GOLD_HI if enabled else MUTED)
	button.add_theme_stylebox_override("normal", _box(Color(0.05, 0.08, 0.07, 0.94), 12, Color(0.91, 0.73, 0.28, 0.52), 1))
	button.add_theme_stylebox_override("disabled", _box(Color(0.02, 0.04, 0.05, 0.76), 12, Color(0.35, 0.42, 0.44, 0.18), 1))
	return button

func _origin_name(data: Dictionary, fallback: String) -> String:
	if str(data.get("band", "")) == "NONE":
		return fallback
	var name := str(data.get("name", fallback))
	var suffix := str(data.get("grade", data.get("stage", "")))
	return name if suffix == "" else "%s · %s" % [name, suffix]

func _crit_damage(combat: Dictionary) -> String:
	if combat.has("critDamagePct"):
		return _pct(float(combat.get("critDamagePct", 0)))
	return _pct((float(combat.get("critPowerPerLayer", 0.5)) + 1.0) * 100.0)

func _speed_pct(value: float) -> String:
	return "%.0f%%" % (value * 100.0 if absf(value) <= 5.0 else value)

func _element_pct(value) -> float:
	if typeof(value) == TYPE_DICTIONARY:
		return float(value.get("pct", value.get("value", value.get("multiplier", 0))))
	var number := float(value)
	return number * 100.0 if absf(number) <= 1.0 else number

func _pct(value: float) -> String:
	return "%.1f%%" % value

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

func _safe_node_name(value: String) -> String:
	return value.replace(".", "_").replace("-", "_").replace("/", "_")

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
