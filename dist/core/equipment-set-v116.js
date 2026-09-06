/**
 * v1.16 Set Engine V1.
 *
 * Locked structure:
 * - 10 canonical slots stay unchanged.
 * - 6 Y Trang slots use 2/4/6 thresholds.
 * - 4 Bội/Nhẫn accessory-group slots use 2/4 thresholds.
 * - every set in the same category uses the same fixed slot group; no per-set slot puzzle.
 * - 13 attire sets = 5 Hành + 8 Bản Đạo.
 * - 8 jewelry sets = 6 Hybrid + 2 Universal.
 * - legacy/retired 6-piece attire mechanics keep their authored trade-offs; the five live Ngũ Hành Sets were simplified in Alpha.23.18 to direct stats with no hidden penalty.
 * - jewelry 4-piece mechanics are deliberately below attire 6-piece power.
 * - no Set mechanic grants generic Total Damage; every parameter belongs to an authored eligible domain.
 * - Set bonuses are never multiplied by equipment enhancement.
 */
export const ATTIRE_SET_SLOTS_V116 = ['weapon', 'head', 'robe', 'belt', 'gloves', 'boots'];
export const JEWELRY_SET_SLOTS_V116 = ['necklace', 'ring', 'bracelet', 'talisman'];
export const EQUIPMENT_SET_MAX_BUILD_AFFIXES_V116 = 2;
export const SET_GRADE_ORDER_V116 = ['mundane', 'spirit', 'mystic', 'earth', 'heaven', 'immortal', 'extreme', 'breaker'];
export const SET_ATTIRE_2P_LIGHT_V116 = [4, 5, 6, 7, 8, 10, 12, 15];
export const SET_ATTIRE_4P_MEDIUM_V116 = [8, 10, 12, 14, 17, 20, 24, 28];
export const SET_JEWELRY_2P_LIGHT_V116 = [5, 6, 7, 8, 10, 12, 14, 16];
export const SET_JEWELRY_4P_MEDIUM_V116 = [10, 12, 15, 18, 22, 26, 31, 36];
export const SET_ATTIRE_6P_MAJOR_V116 = [20, 24, 28, 32, 36, 40, 45, 50];
export const SET_REFUND_SMALL_V116 = [5, 6, 7, 8, 10, 12, 14, 16];
export const SET_WINDOW_SECONDS_V116 = [2, 2.2, 2.4, 2.6, 2.8, 3, 3.3, 3.6];
// Alpha.23.18: Ngũ Hành Set V2 intentionally uses direct, readable combat stats.
// These curves are deliberately smaller than the old resource-engine curves because bonuses stack 2p+4p+6p.
export const SET_SIMPLE_2P_STAT_V12318 = [5, 6, 8, 10, 12, 14, 16, 18];
export const SET_SIMPLE_4P_STAT_V12318 = [8, 10, 13, 16, 20, 23, 27, 30];
export const SET_SIMPLE_6P_STAT_V12318 = [12, 15, 18, 22, 26, 30, 35, 40];
export const SET_SIMPLE_MINOR_V12318 = [1.5, 2, 2.5, 3, 4, 5, 6.5, 8];
// V129 Stat Architecture V2: live Ngũ Hành sets use stat-class curves, not one universal raw percentage.
export const SET_V129_METAL_ARMOR_PEN = [3, 4, 5, 6, 7, 8, 9, 10];
export const SET_V129_METAL_BREAK = [8, 10, 13, 16, 19, 22, 25, 28];
export const SET_V129_METAL_BROKEN_DAMAGE = [12, 15, 18, 21, 25, 29, 34, 38];
export const SET_V129_WOOD_HEALING = [5, 6, 7, 8, 9, 10, 12, 14];
export const SET_V129_WOOD_DOT = [8, 10, 13, 16, 19, 22, 25, 28];
export const SET_V129_WOOD_LIFESTEAL = [1.5, 2, 2.5, 3, 4, 5, 6.5, 8];
export const SET_V129_WATER_REGEN = [6, 8, 10, 11, 13, 15, 17, 18];
export const SET_V129_WATER_EFFICIENCY = [5, 7, 9, 11, 13, 15, 17, 18];
export const SET_V129_WATER_CDR = [4, 6, 8, 10, 12, 14, 16, 18];
export const SET_V129_FIRE_DAMAGE = [5, 6, 7, 8, 9, 10, 12, 14];
export const SET_V129_FIRE_CRIT = [2, 3, 4, 5, 6, 7, 8, 10];
export const SET_V129_FIRE_CRIT_DAMAGE = [12, 15, 18, 22, 26, 30, 35, 40];
export const SET_V129_EARTH_DEFENSE = [6, 8, 10, 11, 13, 15, 17, 18];
export const SET_V129_EARTH_DR = [1.5, 2, 2.5, 3, 4, 5, 6.5, 8];
export const SET_V129_EARTH_COUNTER = [12, 15, 18, 22, 26, 30, 35, 40];
function p(key, unit, byGrade) { return { key, unit, byGrade }; }
function f(key, unit, fixed) { return { key, unit, fixed }; }
const EARLY_THRESHOLD = [70, 68, 66, 64, 62, 60, 58, 55];
const FIRE_EARLY_THRESHOLD = [90, 88, 86, 84, 82, 80, 78, 75];
const POISON_CONSUME_EFFICIENCY = [35, 38, 41, 44, 47, 50, 55, 60];
const MIND_DISRUPTION_CAP = [12, 14, 16, 18, 20, 23, 26, 30];
const SUMMON_FUSION_DURATION = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5];
const WOOD_POISON_CONVERT = [35, 40, 45, 50, 55, 60, 65, 70];
const WATER_SPELL_CAST_PER_STACK = [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];
export const EQUIPMENT_SET_CATALOG_V116 = [
    {
        id: 'set.v116.attire.taibach_canhkim', key: 'taibach_canhkim', name: 'Thái Bạch Canh Kim Phá Giới Bộ', category: 'attire', identity: 'element', tags: ['Metal', 'Root:Metal'],
        description: 'Kim = Phá. Bộ chỉ cộng chỉ số trực tiếp: Xuyên Giáp, Phá Thế và sát thương lên mục tiêu Thất Thế. Không tạo thêm tài nguyên chiến đấu.',
        mechanics: [
            { pieces: 2, id: 'kim.2', name: 'Kim · Xuyên Giáp', mechanic: 'simple_metal_armor_pen', eligibleDomains: ['Stat:ArmorPen'], params: [p('armorPenPct', 'pct', SET_V129_METAL_ARMOR_PEN)], description: 'Tăng trực tiếp Xuyên Giáp.' },
            { pieces: 4, id: 'kim.4', name: 'Kim · Phá Thế', mechanic: 'simple_metal_break', eligibleDomains: ['Stat:Break'], params: [p('breakBonusPct', 'pct', SET_V129_METAL_BREAK)], description: 'Tăng trực tiếp hiệu quả Phá Thế của mọi đòn gây Phá Thế.' },
            { pieces: 6, id: 'kim.6', name: 'Kim · Trảm Thất Thế', mechanic: 'simple_metal_broken_damage', eligibleDomains: ['Damage:BrokenTarget'], params: [p('damageBonusPct', 'pct', SET_V129_METAL_BROKEN_DAMAGE)], description: 'Gây thêm sát thương lên mục tiêu đang Thất Thế.' },
        ],
    },
    {
        id: 'set.v116.attire.thanhde_truongsinh', key: 'thanhde_truongsinh', name: 'Thanh Đế Trường Sinh Vạn Mộc Bộ', category: 'attire', identity: 'element', tags: ['Wood', 'Root:Wood'],
        description: 'Mộc = Sinh. Bộ cộng trực tiếp Hồi Phục, sát thương duy trì và Hút Sinh Mệnh.',
        mechanics: [
            { pieces: 2, id: 'moc.2', name: 'Mộc · Dưỡng Sinh', mechanic: 'simple_wood_healing', eligibleDomains: ['Stat:Healing'], params: [p('healingPct', 'pct', SET_V129_WOOD_HEALING)], description: 'Tăng trực tiếp hiệu quả hồi phục gây ra.' },
            { pieces: 4, id: 'moc.4', name: 'Mộc · Thực Cốt', mechanic: 'simple_wood_dot_damage', eligibleDomains: ['Damage:DoT'], params: [p('dotDamagePct', 'pct', SET_V129_WOOD_DOT)], description: 'Tăng trực tiếp sát thương duy trì (DoT).' },
            { pieces: 6, id: 'moc.6', name: 'Mộc · Trường Sinh', mechanic: 'simple_wood_lifesteal', eligibleDomains: ['Stat:LifeSteal'], params: [p('lifeStealPct', 'pct', SET_V129_WOOD_LIFESTEAL)], description: 'Tăng trực tiếp Hút Sinh Mệnh.' },
        ],
    },
    {
        id: 'set.v116.attire.huyenminh_thuonghai', key: 'huyenminh_thuonghai', name: 'Huyền Minh Thương Hải Vạn Lưu Bộ', category: 'attire', identity: 'element', tags: ['Water', 'Root:Water'],
        description: 'Thủy = Thuận. Bộ cộng trực tiếp hồi Chân Nguyên, Hiệu Suất Chân Nguyên và giảm Hồi Chiêu.',
        mechanics: [
            { pieces: 2, id: 'thuy.2', name: 'Thủy · Hồi Nguyên', mechanic: 'simple_water_spirit_regen', eligibleDomains: ['Stat:SpiritRegen'], params: [p('spiritRegenPct', 'pct', SET_V129_WATER_REGEN)], description: 'Tăng tốc độ hồi Chân Nguyên.' },
            { pieces: 4, id: 'thuy.4', name: 'Thủy · Tiết Nguyên', mechanic: 'simple_water_spirit_efficiency', eligibleDomains: ['Stat:SpiritEfficiency'], params: [p('spiritEfficiencyPct', 'pct', SET_V129_WATER_EFFICIENCY)], description: 'Tăng trực tiếp Hiệu Suất Chân Nguyên, giúp giảm chi phí kỹ năng theo cap hiện hành.' },
            { pieces: 6, id: 'thuy.6', name: 'Thủy · Luân Chuyển', mechanic: 'simple_water_cooldown', eligibleDomains: ['Stat:CooldownReduction'], params: [p('cooldownReductionPct', 'pct', SET_V129_WATER_CDR)], description: 'Giảm Hồi Chiêu của kỹ năng.' },
        ],
    },
    {
        id: 'set.v116.attire.dainhat_phanthien', key: 'dainhat_phanthien', name: 'Đại Nhật Phần Thiên Cực Viêm Bộ', category: 'attire', identity: 'element', tags: ['Fire', 'Root:Fire'],
        description: 'Hỏa = Bạo. Bộ cộng trực tiếp sát thương, Bạo Kích và Bạo Thương.',
        mechanics: [
            { pieces: 2, id: 'hoa.2', name: 'Hỏa · Liệt Diễm', mechanic: 'simple_fire_damage', eligibleDomains: ['Damage:All'], params: [p('damageBonusPct', 'pct', SET_V129_FIRE_DAMAGE)], description: 'Tăng trực tiếp sát thương gây ra.' },
            { pieces: 4, id: 'hoa.4', name: 'Hỏa · Bạo Kích', mechanic: 'simple_fire_crit', eligibleDomains: ['Stat:CritChance'], params: [p('critChancePct', 'pct', SET_V129_FIRE_CRIT)], description: 'Tăng trực tiếp Bạo Kích.' },
            { pieces: 6, id: 'hoa.6', name: 'Hỏa · Phần Thiên', mechanic: 'simple_fire_crit_damage', eligibleDomains: ['Stat:CritDamage'], params: [p('critDamagePct', 'pct', SET_V129_FIRE_CRIT_DAMAGE)], description: 'Tăng trực tiếp Bạo Thương.' },
        ],
    },
    {
        id: 'set.v116.attire.hautho_trannhac', key: 'hautho_trannhac', name: 'Hậu Thổ Trấn Nhạc Bất Động Bộ', category: 'attire', identity: 'element', tags: ['Earth', 'Root:Earth'],
        description: 'Thổ = Thủ. Bộ cộng trực tiếp Phòng Ngự, giảm sát thương và sát thương Phản Kích.',
        mechanics: [
            { pieces: 2, id: 'tho.2', name: 'Thổ · Hộ Thể', mechanic: 'simple_earth_defense', eligibleDomains: ['Stat:Defense'], params: [p('defensePct', 'pct', SET_V129_EARTH_DEFENSE)], description: 'Tăng trực tiếp Phòng Ngự.' },
            { pieces: 4, id: 'tho.4', name: 'Thổ · Bất Động', mechanic: 'simple_earth_damage_reduction', eligibleDomains: ['Stat:DamageReduction'], params: [p('damageReductionPct', 'pct', SET_V129_EARTH_DR)], description: 'Tăng trực tiếp giảm sát thương.' },
            { pieces: 6, id: 'tho.6', name: 'Thổ · Phản Chấn', mechanic: 'simple_earth_counter_damage', eligibleDomains: ['Damage:Counter'], params: [p('counterDamagePct', 'pct', SET_V129_EARTH_COUNTER)], description: 'Tăng trực tiếp sát thương của đòn Phản Kích.' },
        ],
    },
    {
        id: 'set.v116.attire.thaihu_nhatkiem', key: 'thaihu_nhatkiem', name: 'Thái Hư Nhất Kiếm Phá Vọng Bộ', category: 'attire', identity: 'dao', tags: ['Dao:Sword', 'Sword'],
        description: 'Kiếm Đạo chính trang: ép cửa sổ Finisher/Phá Thế, hoàn resource đúng Thất Thế và cho phép dốc Spend vượt chuẩn.',
        mechanics: [
            { pieces: 2, id: 'kiem.2', name: 'Kiếm Phong Phá Thế', mechanic: 'sword_finisher_break', eligibleDomains: ['SwordFinisher', 'PháThế'], params: [p('eligibleEffectBonusPct', 'pct', SET_ATTIRE_2P_LIGHT_V116)], description: 'Finisher/Phá Thế của Kiếm mạnh hơn trong đúng domain.' },
            { pieces: 4, id: 'kiem.4', name: 'Thất Thế Hồi Phong', mechanic: 'sword_finisher_refund', eligibleDomains: ['SwordFinisher', 'ThấtThế', 'DaoSpend'], params: [p('refundPct', 'pct', SET_ATTIRE_4P_MEDIUM_V116), f('globalRefundCapPct', 'pct', 40)], description: 'Finisher lên mục tiêu Thất Thế hoàn lại một phần Dao Spend, vẫn chịu hard cap refund chung 40%.' },
            { pieces: 6, id: 'kiem.6', name: 'Nhất Kiếm Tận Chú', mechanic: 'sword_over_spend_finisher', eligibleDomains: ['SwordFinisher', 'DaoSpend'], params: [p('maxExtraSpendPct', 'pct', SET_ATTIRE_6P_MAJOR_V116), f('extraSpendEfficiencyPct', 'pct', 70), f('recoveryPenaltyPerExtraSpendPct', 'ratio', 0.5)], constraint: 'Recovery tăng bằng 50% lượng Spend vượt chuẩn.', description: 'Finisher được dốc Spend vượt chuẩn; phần vượt chỉ chuyển thành Finisher package ở 70% hiệu suất và kéo dài Thu Chiêu.' },
        ],
    },
    {
        id: 'set.v116.attire.bathoang_quyen', key: 'bathoang_quyen', name: 'Bát Hoang Trấn Thiên Quyền Ý Bộ', category: 'attire', identity: 'dao', tags: ['Dao:Fist', 'Fist'],
        description: 'Quyền Đạo chính trang: giữ chuỗi, giữ pressure sau Heavy và cho phép tham combo vượt cap với rủi ro bị ngắt.',
        mechanics: [
            { pieces: 2, id: 'quyen.2', name: 'Liên Hoàn Bất Đoạn', mechanic: 'fist_combo_window', eligibleDomains: ['FistCombo'], params: [p('windowBonusPct', 'pct', SET_ATTIRE_2P_LIGHT_V116)], description: 'Cửa sổ nối chuỗi Quyền dài hơn.' },
            { pieces: 4, id: 'quyen.4', name: 'Trọng Quyền Tàng Kình', mechanic: 'fist_finisher_pressure_retention', eligibleDomains: ['FistHeavy', 'FistFinisher', 'ComboPressure'], params: [p('pressureRetainedPct', 'pct', SET_ATTIRE_4P_MEDIUM_V116)], description: 'Heavy/Finisher giữ lại một phần combo pressure sau Spend.' },
            { pieces: 6, id: 'quyen.6', name: 'Bát Hoang Vô Tận', mechanic: 'fist_combo_overcap', eligibleDomains: ['FistCombo'], params: [p('comboCapBonusPct', 'pct', SET_ATTIRE_6P_MAJOR_V116), f('interruptRecoveryPenaltyPct', 'pct', 25)], constraint: 'Bị interrupt khi đang vượt cap gốc: combo về 0 và Recovery hành động kế +25%.', description: 'Cho phép combo vượt cap gốc; càng tham chuỗi càng dễ mất sạch khi bị ngắt.' },
        ],
    },
    {
        id: 'set.v116.attire.batdiet_honnguyen', key: 'batdiet_honnguyen', name: 'Bất Diệt Hỗn Nguyên Kim Thân Bộ', category: 'attire', identity: 'dao', tags: ['Dao:Body', 'Body'],
        description: 'Thể Đạo chính trang: chỉ tích phản công từ pressure thật sự đã mitigate, không khuyến khích cố tình ăn raw damage.',
        mechanics: [
            { pieces: 2, id: 'the.2', name: 'Hóa Kình Tụ Thế', mechanic: 'body_mitigated_pressure_conversion', eligibleDomains: ['Mitigation', 'CounterPressure'], params: [p('conversionBonusPct', 'pct', SET_ATTIRE_2P_LIGHT_V116)], description: 'Pressure đã thực sự mitigate chuyển thành Counter resource hiệu quả hơn.' },
            { pieces: 4, id: 'the.4', name: 'Phản Kình Chấn Thể', mechanic: 'body_threshold_counter', eligibleDomains: ['Counter'], params: [p('counterBonusPct', 'pct', SET_ATTIRE_4P_MEDIUM_V116)], description: 'Đạt pressure threshold chuẩn cường hóa Counter kế tiếp.' },
            { pieces: 6, id: 'the.6', name: 'Dẫn Thế Hậu Phát', mechanic: 'body_hold_empowered_counter', eligibleDomains: ['Counter'], params: [p('holdSeconds', 'seconds', SET_WINDOW_SECONDS_V116)], constraint: 'Trong lúc giữ Counter cường hóa không Generate thêm Counter pressure.', description: 'Cho phép giữ Counter cường hóa để chờ đúng cửa sổ; đổi lại tài nguyên phản công ngừng tích trong lúc giữ.' },
        ],
    },
    {
        id: 'set.v116.attire.vanphap_thiendien', key: 'vanphap_thiendien', name: 'Vạn Pháp Quy Nguyên Thiên Diễn Bộ', category: 'attire', identity: 'dao', tags: ['Dao:Spell', 'Spell'],
        description: 'Pháp Đạo chính trang: tối ưu Chân Nguyên, nối cast và cho phép Overchannel để đổi thời gian + resource lấy payoff.',
        mechanics: [
            { pieces: 2, id: 'phap.2', name: 'Tụ Pháp Tiết Nguyên', mechanic: 'spell_spirit_efficiency', eligibleDomains: ['SpellCast', 'SpellChannel', 'ChânNguyênCost'], params: [p('efficiencyBonusPct', 'pct', SET_ATTIRE_2P_LIGHT_V116)], description: 'Cast/Channel Pháp hiệu quả Chân Nguyên hơn, vẫn chịu hard rule resource hiện có.' },
            { pieces: 4, id: 'phap.4', name: 'Pháp Tức Liên Chuyển', mechanic: 'spell_channel_next_tempo', eligibleDomains: ['SpellChannel', 'SpellCast', 'Recovery'], params: [p('castRecoveryReductionPct', 'pct', SET_ATTIRE_4P_MEDIUM_V116)], description: 'Hoàn tất Channel làm Cast/Recovery của Pháp thuật kế tiếp ngắn hơn.' },
            { pieces: 6, id: 'phap.6', name: 'Thiên Diễn Quá Tải', mechanic: 'spell_overchannel', eligibleDomains: ['SpellChannel'], params: [p('maxExtraChannelPct', 'pct', SET_ATTIRE_6P_MAJOR_V116), f('effectEfficiencyPct', 'pct', 80), f('extraSpiritCostPctOfOverchannel', 'pct', 100)], constraint: 'Overchannel tiếp tục tiêu Chân Nguyên; bị interrupt trước khi phóng sẽ mất phần đầu tư Overchannel.', description: 'Sau điểm có thể phóng, được Channel thêm; extra effect chỉ nhận 80% theo phần Overchannel trong khi extra Chân Nguyên trả đủ 100%.' },
        ],
    },
    {
        id: 'set.v116.attire.cuuu_vandoc', key: 'cuu_u_vandoc', name: 'Cửu U Vạn Độc Phệ Sinh Bộ', category: 'attire', identity: 'dao', tags: ['Dao:Poison', 'Poison'],
        description: 'Độc Đạo chính trang: giữ nền Độc qua Phệ và có lựa chọn đổi toàn bộ DoT tương lai lấy payoff tức thời.',
        mechanics: [
            { pieces: 2, id: 'doc.2', name: 'Độc Tức Bất Tán', mechanic: 'poison_generate_maintain', eligibleDomains: ['PoisonGenerate', 'PoisonMaintain'], params: [p('bonusPct', 'pct', SET_ATTIRE_2P_LIGHT_V116)], description: 'Generate/duy trì Độc hợp lệ tốt hơn.' },
            { pieces: 4, id: 'doc.4', name: 'Phệ Độc Lưu Căn', mechanic: 'poison_consume_retention', eligibleDomains: ['PoisonConsume'], params: [p('retainedBasePct', 'pct', SET_ATTIRE_4P_MEDIUM_V116)], description: 'Phệ thường giữ lại một phần nền Độc thay vì xóa sạch.' },
            { pieces: 6, id: 'doc.6', name: 'Vạn Độc Quy Phệ', mechanic: 'poison_full_consume_burst', eligibleDomains: ['PoisonDoT', 'PoisonConsume'], params: [p('remainingDotConversionPct', 'pct', POISON_CONSUME_EFFICIENCY), f('postConsumeGeneratePenaltyPct', 'pct', 40), f('penaltySeconds', 'seconds', 4)], constraint: 'Toàn bộ DoT eligible bị tiêu; sau đó Poison Generate lên mục tiêu đó -40% trong 4 giây.', description: 'Cho phép Phệ toàn bộ remaining DoT thành payoff tức thời ở hiệu suất có giới hạn; burst xong việc tích Độc lại chậm rõ rệt.' },
        ],
    },
    {
        id: 'set.v116.attire.vanbao_trieutong', key: 'vanbao_trieutong', name: 'Vạn Bảo Triều Tông Ngự Linh Bộ', category: 'attire', identity: 'dao', tags: ['Dao:Artifact', 'Artifact'],
        description: 'Ngự Khí chính trang: nối nhịp nhiều pháp bảo nhưng Hợp Khí gom chúng thành một nguồn burst mà không nhân proc budget.',
        mechanics: [
            { pieces: 2, id: 'ngukhi.2', name: 'Bảo Khí Đồng Tức', mechanic: 'artifact_generate_spend', eligibleDomains: ['ArtifactGenerate', 'ArtifactSpend'], params: [p('bonusPct', 'pct', SET_ATTIRE_2P_LIGHT_V116)], description: 'Generate/Spend package của Ngự Khí mạnh hơn trong đúng domain.' },
            { pieces: 4, id: 'ngukhi.4', name: 'Vạn Khí Tương Thừa', mechanic: 'artifact_alternate_advance', eligibleDomains: ['ArtifactAction'], params: [p('nextOtherSourceAdvancePct', 'pct', SET_ATTIRE_4P_MEDIUM_V116), f('maxProcPerEvent', 'count', 1)], description: 'Một pháp bảo hoàn tất action đẩy nhịp pháp bảo khác kế tiếp; một event chỉ kích một lần.' },
            { pieces: 6, id: 'ngukhi.6', name: 'Chư Bảo Quy Nhất', mechanic: 'artifact_fusion', eligibleDomains: ['ArtifactSignature', 'ArtifactSources'], params: [p('durationSeconds', 'seconds', SUMMON_FUSION_DURATION), p('primarySignatureBonusPct', 'pct', SET_ATTIRE_6P_MAJOR_V116)], constraint: 'Trong Hợp Khí các nguồn phụ tạm ngừng; không nhân proc/Break budget theo số nguồn bị gộp.', description: 'Hợp Khí gom nhịp pháp bảo thành một nguồn chính mạnh hơn trong thời gian ngắn; nguồn phụ bị khóa trong cửa sổ.' },
        ],
    },
    {
        id: 'set.v116.attire.chuthien_tinhdau', key: 'chuthien_tinhdau', name: 'Chu Thiên Tinh Đấu Diễn Trận Bộ', category: 'attire', identity: 'dao', tags: ['Dao:Formation', 'Formation'],
        description: 'Trận Đạo chính trang: dưỡng Trận, cho các Trận nối tiến độ và đánh đổi Integrity để Kích sớm.',
        mechanics: [
            { pieces: 2, id: 'tran.2', name: 'Dưỡng Trận Tàng Cơ', mechanic: 'formation_nourish_speed', eligibleDomains: ['FormationNourish'], params: [p('bonusPct', 'pct', SET_ATTIRE_2P_LIGHT_V116)], description: 'Dưỡng Trận nhanh hơn.' },
            { pieces: 4, id: 'tran.4', name: 'Trận Trận Tương Sinh', mechanic: 'formation_chain_nourish', eligibleDomains: ['FormationActivate', 'FormationNourish'], params: [p('progressRequirementPct', 'pct', SET_ATTIRE_4P_MEDIUM_V116)], description: 'Kích một Trận hợp lệ giúp Trận đang dưỡng nhận thêm progress theo requirement.' },
            { pieces: 6, id: 'tran.6', name: 'Nghịch Thế Khải Trận', mechanic: 'formation_early_activate', eligibleDomains: ['FormationActivate', 'FormationIntegrity'], params: [p('minimumCompletionPct', 'pct', EARLY_THRESHOLD), f('outputPerCompletionPct', 'ratio', 1), f('integrityCostPenaltyPct', 'pct', 25)], constraint: 'Kích sớm chỉ cho output tương ứng đúng completion hiện tại và tốn +25% Integrity.', description: 'Cho phép Kích Trận trước khi dưỡng hoàn tất; không có chuyện kích 60% mà nhận 100% output.' },
        ],
    },
    {
        id: 'set.v116.attire.thaihu_luyenthan', key: 'thaihu_luyenthan', name: 'Thái Hư Luyện Thần Vô Tướng Bộ', category: 'attire', identity: 'dao', tags: ['Dao:Mind', 'Mind'],
        description: 'Thần Niệm chính trang: tạo Ấn, nối nhịp Ấn và có thể đốt toàn bộ Ấn để phá nhịp Cast/Recovery mà không thành hard stun.',
        mechanics: [
            { pieces: 2, id: 'thanniem.2', name: 'Niệm Ấn Ngưng Thần', mechanic: 'mind_mark_generate_maintain', eligibleDomains: ['MindMark'], params: [p('bonusPct', 'pct', SET_ATTIRE_2P_LIGHT_V116)], description: 'Generate/duy trì Ấn Thần Niệm hiệu quả hơn.' },
            { pieces: 4, id: 'thanniem.4', name: 'Ấn Diệt Tái Sinh', mechanic: 'mind_mark_next_recovery', eligibleDomains: ['MindMark', 'Recovery'], params: [p('recoveryReductionPct', 'pct', SET_ATTIRE_4P_MEDIUM_V116)], description: 'Kích một Ấn làm Recovery của action tạo Ấn kế tiếp ngắn hơn.' },
            { pieces: 6, id: 'thanniem.6', name: 'Vạn Niệm Đoạn Cơ', mechanic: 'mind_consume_all_disrupt', eligibleDomains: ['MindMark', 'CastDisruption', 'RecoveryDisruption'], params: [p('disruptionCapPct', 'pct', MIND_DISRUPTION_CAP), f('postConsumeGeneratePenaltyPct', 'pct', 40), f('penaltySeconds', 'seconds', 4)], constraint: 'Tiêu toàn bộ Ấn; sau đó Generate Ấn -40% trong 4 giây. Không stun và không bypass boss rule.', description: 'Đốt toàn bộ Ấn để gây Nhiễu Cast/Recovery có cap; boss vẫn chịu modifier giảm hiệu quả hiện hữu.' },
        ],
    },
    {
        id: 'set.v116.jewelry.taibach_vanbao', key: 'taibach_vanbao', name: 'Thái Bạch Vạn Bảo Đồng Tâm Bội Giới', category: 'jewelry', identity: 'hybrid', tags: ['Metal', 'Dao:Artifact'],
        description: 'Bội/Nhẫn Kim × Ngự Khí: dùng pháp bảo mang Kim để nuôi Phong Mang rồi đổi Phong Mang thành cửa sổ Phá của pháp bảo.',
        mechanics: [
            { pieces: 2, id: 'kim_ngukhi.2', name: 'Kim Bảo Đồng Tức', mechanic: 'metal_artifact_edge_generate', eligibleDomains: ['ArtifactAction', 'Metal', 'PhongMang'], params: [p('generateBonusPct', 'pct', SET_JEWELRY_2P_LIGHT_V116)], description: 'Action Ngự Khí có Kim tag sinh Phong Mang hiệu quả hơn.' },
            { pieces: 4, id: 'kim_ngukhi.4', name: 'Thái Bạch Phá Khí', mechanic: 'metal_artifact_next_break', eligibleDomains: ['PhongMangSpend', 'ArtifactBreak', 'PháThế'], params: [p('nextBreakPackageBonusPct', 'pct', SET_JEWELRY_4P_MEDIUM_V116)], description: 'Spend Phong Mang cường hóa package Phá/Phá Thế của pháp bảo kế tiếp; không tự tạo Hợp Khí.' },
        ],
    },
    {
        id: 'set.v116.jewelry.khovinh_vandoc', key: 'khovinh_vandoc', name: 'Khô Vinh Vạn Độc Sinh Diệt Bội Giới', category: 'jewelry', identity: 'hybrid', tags: ['Wood', 'Dao:Poison'],
        description: 'Bội/Nhẫn Mộc × Độc: cho DoT thúc Mộc Mầm nhưng giữ event budget; có thể hi sinh DoT tương lai để đẩy Mầm.',
        mechanics: [
            { pieces: 2, id: 'moc_doc.2', name: 'Độc Dưỡng Mộc Sinh', mechanic: 'wood_poison_tick_growth', eligibleDomains: ['PoisonTick', 'MộcMầm'], params: [p('standardWoodGenerateContributionPct', 'pct', SET_JEWELRY_2P_LIGHT_V116), f('maxContributionPerSecondPerTarget', 'count', 1)], description: 'Tick Độc hợp lệ thúc Mộc Mầm theo một phần Mộc Generate chuẩn, cap 1 contribution/giây/mục tiêu.' },
            { pieces: 4, id: 'moc_doc.4', name: 'Khô Vinh Hoán Sinh', mechanic: 'wood_consume_poison_to_seed', eligibleDomains: ['MộcSpend', 'PoisonDoT', 'MộcMầm'], params: [p('dotToMaturityConversionPct', 'pct', WOOD_POISON_CONVERT)], constraint: 'Phần DoT bị hút mất toàn bộ sát thương tương lai tương ứng.', description: 'Mộc Spend được tiêu Độc còn lại để đẩy nhanh Mộc Mầm; đổi sustain DoT lấy payoff Mộc sớm.' },
        ],
    },
    {
        id: 'set.v116.jewelry.thuonghai_vanphap', key: 'thuonghai_vanphap', name: 'Thương Hải Vạn Pháp Lưu Quang Bội Giới', category: 'jewelry', identity: 'hybrid', tags: ['Water', 'Dao:Spell'],
        description: 'Bội/Nhẫn Thủy × Pháp: dùng Cast để giữ Lưu Thế và tạo chuỗi Cast nhanh dần nhưng Chân Nguyên cost tăng dần.',
        mechanics: [
            { pieces: 2, id: 'thuy_phap.2', name: 'Pháp Lưu Sinh Thế', mechanic: 'water_spell_flow_generate', eligibleDomains: ['SpellCast', 'LưuThế'], params: [p('flowGenerateBonusPct', 'pct', SET_JEWELRY_2P_LIGHT_V116)], description: 'Cast Pháp thành công sinh Lưu Thế tốt hơn.' },
            { pieces: 4, id: 'thuy_phap.4', name: 'Thương Hải Liên Pháp', mechanic: 'water_spell_chain_cast', eligibleDomains: ['SpellCast', 'LưuThế', 'ChânNguyênCost'], params: [f('requiredFlowPct', 'pct', 80), f('maxStacks', 'stacks', 4), p('castTimeReductionPerStackPct', 'pct', WATER_SPELL_CAST_PER_STACK), f('spiritCostIncreasePerStackPct', 'pct', 10)], constraint: 'Basic/Defensive/non-Pháp action phá chuỗi; mỗi stack làm Chân Nguyên cost +10%.', description: 'Ở Lưu Thế cao, Cast Pháp liên tiếp tạo tối đa 4 stack: cast nhanh hơn nhưng cost tăng 10% mỗi stack.' },
        ],
    },
    {
        id: 'set.v116.jewelry.xichtieu_kiemtham', key: 'xichtieu_kiemtham', name: 'Xích Tiêu Phần Thiên Kiếm Tâm Bội Giới', category: 'jewelry', identity: 'hybrid', tags: ['Fire', 'Dao:Sword', 'Sword'],
        description: 'Bội/Nhẫn Hỏa × Kiếm: Finisher nuôi Hỏa và trong Cực Viêm có thể dồn Finisher mạnh hơn bằng cách tự rút ngắn cửa sổ.',
        mechanics: [
            { pieces: 2, id: 'hoa_kiem.2', name: 'Kiếm Hỏa Đồng Minh', mechanic: 'fire_sword_finisher_generate', eligibleDomains: ['SwordFinisher', 'FireGenerate'], params: [p('fireGenerateBonusPct', 'pct', SET_JEWELRY_2P_LIGHT_V116)], description: 'Kiếm Finisher hợp lệ tăng Hỏa Generate.' },
            { pieces: 4, id: 'hoa_kiem.4', name: 'Xích Tiêu Tận Viêm', mechanic: 'fire_sword_extreme_finisher', eligibleDomains: ['CựcViêm', 'SwordFinisher', 'TànHỏa'], params: [p('finisherBonusPct', 'pct', SET_JEWELRY_4P_MEDIUM_V116), f('extremeDurationCutPerFinisherSeconds', 'seconds', 0.5), f('aftermathIncreasePerFinisherPct', 'pct', 8), f('aftermathIncreaseCapPct', 'pct', 32)], constraint: 'Mỗi Finisher rút 0.5 giây Cực Viêm và làm Tàn Hỏa +8%, cap +32%.', description: 'Trong Cực Viêm cường hóa Finisher; spam Finisher tự đốt ngắn cửa sổ và tăng hậu quả Tàn Hỏa.' },
        ],
    },
    {
        id: 'set.v116.jewelry.trannhac_batdiet', key: 'trannhac_batdiet', name: 'Trấn Nhạc Bất Diệt Hộ Tâm Bội Giới', category: 'jewelry', identity: 'hybrid', tags: ['Earth', 'Dao:Body', 'Body'],
        description: 'Bội/Nhẫn Thổ × Thể: chọn đứng chịu bằng mitigation trong một cửa sổ ngắn, đổi toàn bộ Né lấy Trọng Thế + Counter.',
        mechanics: [
            { pieces: 2, id: 'tho_the.2', name: 'Hậu Thổ Hóa Kình', mechanic: 'earth_body_mitigation_weight', eligibleDomains: ['Mitigation', 'TrọngThế'], params: [p('weightGenerateBonusPct', 'pct', SET_JEWELRY_2P_LIGHT_V116)], description: 'Mitigation hợp lệ sinh Trọng Thế tốt hơn.' },
            { pieces: 4, id: 'tho_the.4', name: 'Trấn Nhạc Kim Thân', mechanic: 'earth_body_stand_ground', eligibleDomains: ['DefenseUtility', 'TrọngThế', 'Counter', 'Dodge'], params: [f('requiredWeightPct', 'pct', 90), f('durationSeconds', 'seconds', 5), f('effectiveDodgePct', 'pct', 0), p('weightGenerateBonusPct', 'pct', SET_JEWELRY_4P_MEDIUM_V116), p('counterBonusPct', 'pct', SET_JEWELRY_4P_MEDIUM_V116), f('internalCooldownSeconds', 'seconds', 10)], constraint: 'Trong cửa sổ Né hiệu lực = 0%; cooldown nội bộ 10 giây.', description: 'Ở Trọng Thế ≥90%, Defense/Utility mở 5 giây đứng thế: bỏ Né để tăng Trọng Thế Generate và Counter.' },
        ],
    },
    {
        id: 'set.v116.jewelry.tinhla_kiemtran', key: 'tinhla_kiemtran', name: 'Tinh La Kiếm Trận Thiên Cơ Bội Giới', category: 'jewelry', identity: 'hybrid', tags: ['Dao:Sword', 'Dao:Formation', 'Sword', 'Formation'],
        description: 'Bội/Nhẫn Kiếm × Trận: dùng Kiếm dưỡng Trận rồi khóa quyền kích thủ công để gắn Trận vào Finisher.',
        mechanics: [
            { pieces: 2, id: 'kiem_tran.2', name: 'Kiếm Dẫn Tinh La', mechanic: 'sword_formation_nourish', eligibleDomains: ['SwordAction', 'FormationNourish'], params: [p('standardFormationContributionPct', 'pct', SET_JEWELRY_2P_LIGHT_V116), f('maxContributionPerAction', 'count', 1)], description: 'Kiếm action hợp lệ Dưỡng Trận; multi-hit không nhân contribution.' },
            { pieces: 4, id: 'kiem_tran.4', name: 'Nhất Kiếm Khải Trận', mechanic: 'sword_link_formation_finisher', eligibleDomains: ['SwordFinisher', 'FormationActivate'], params: [p('linkedActivationBonusPct', 'pct', SET_JEWELRY_4P_MEDIUM_V116), f('maxLinkedFormations', 'count', 1)], constraint: 'Trận đã Liên Kết không thể kích thủ công; hủy liên kết mất bonus của lần liên kết đó.', description: 'Liên Kết một Trận đã dưỡng; Finisher kế tự Kích Trận với package được cường hóa.' },
        ],
    },
    {
        id: 'set.v116.jewelry.luchop_luanchuyen', key: 'luchop_luanchuyen', name: 'Lục Hợp Luân Chuyển Đạo Hoàn', category: 'jewelry', identity: 'universal', tags: ['Universal', 'Rotation'],
        description: 'Bội/Nhẫn phổ dụng cho rotation nhiều Active: thưởng đổi skill, không thưởng spam một nút.',
        mechanics: [
            { pieces: 2, id: 'luanchuyen.2', name: 'Lục Hợp Dị Chuyển', mechanic: 'rotation_alternate_skill_efficiency', eligibleDomains: ['NormalActive', 'ChânNguyênCost'], params: [p('nextActiveCostReductionPct', 'pct', SET_JEWELRY_2P_LIGHT_V116)], description: 'Đổi sang Active khác skill trước đó làm Active kế giảm Chân Nguyên cost; không stack.' },
            { pieces: 4, id: 'luanchuyen.4', name: 'Vạn Pháp Luân Hành', mechanic: 'rotation_four_distinct_payoff', eligibleDomains: ['NormalActive', 'EligibleAuthoredEffect'], params: [f('distinctActivesRequired', 'count', 4), p('payoffBonusPct', 'pct', SET_JEWELRY_4P_MEDIUM_V116)], constraint: 'Lặp một skill đã nằm trong chuỗi trước khi đủ 4 Active khác nhau sẽ reset chain.', description: 'Dùng 4 Active khác nhau liên tiếp sẽ cường hóa eligible authored effect của Active kế rồi reset chuỗi.' },
        ],
    },
    {
        id: 'set.v116.jewelry.quytang_uanthe', key: 'quytang_uanthe', name: 'Quy Tàng Thiên Cơ Uẩn Thế Đạo Hoàn', category: 'jewelry', identity: 'universal', tags: ['Universal', 'UltimateGauge'],
        description: 'Bội/Nhẫn phổ dụng quanh Ultimate Gauge: tăng tích Gauge và cho phép hy sinh 20 Gauge để cứu một nhịp Active.',
        mechanics: [
            { pieces: 2, id: 'tangthe.2', name: 'Quy Tàng Dưỡng Thế', mechanic: 'ultimate_gauge_generate', eligibleDomains: ['UltimateGaugeGenerate'], params: [p('gaugeGenerateBonusPct', 'pct', SET_JEWELRY_2P_LIGHT_V116)], description: 'Ultimate Gauge gain từ event hợp lệ tăng nhưng vẫn chịu per-skill/event budget.' },
            { pieces: 4, id: 'tangthe.4', name: 'Thiên Cơ Tàng Phong', mechanic: 'ultimate_gauge_spend_active', eligibleDomains: ['NormalActive', 'UltimateGauge', 'EligibleAuthoredEffect'], params: [f('gaugeCost', 'gauge', 20), f('minimumGaugeBeforeAction', 'gauge', 40), p('eligibleEffectBonusPct', 'pct', SET_JEWELRY_4P_MEDIUM_V116), f('lockoutSeconds', 'seconds', 6), f('buffedActionGaugeGeneratePct', 'pct', 0)], constraint: 'Mỗi lần tiêu đúng 20 Gauge, lockout 6 giây; action được buff không Generate Ultimate Gauge.', description: 'Active hợp lệ có thể tiêu 20 Gauge để cường hóa eligible authored effect, trực tiếp trì hoãn Ultimate.' },
        ],
    },
];
/**
 * v1.38 alpha.23.10 architecture lock:
 * equipment itself only owns the five Ngũ Hành attire Sets.
 * Former Bản Đạo attire + Hybrid/Universal jewelry Sets are retained in this historical
 * catalog strictly for save/content migration and mechanic reuse by Bí Tịch Trấn Phái.
 */
export const LIVE_EQUIPMENT_SET_CATALOG_V12310 = EQUIPMENT_SET_CATALOG_V116.filter(set => set.category === 'attire' && set.identity === 'element');
export const RETIRED_EQUIPMENT_SET_IDS_V12310 = new Set(EQUIPMENT_SET_CATALOG_V116.filter(set => !(set.category === 'attire' && set.identity === 'element')).map(set => set.id));
export function isLiveEquipmentSetV12310(id) { return Boolean(id && LIVE_EQUIPMENT_SET_CATALOG_V12310.some(set => set.id === id)); }
const SET_BY_ID = new Map(EQUIPMENT_SET_CATALOG_V116.map(set => [set.id, set]));
export function equipmentSetCatalogEntryV116(id) { return SET_BY_ID.get(id); }
export function isEquipmentSetV116(id) { return Boolean(id && SET_BY_ID.has(id)); }
export function setGradeIndexV116(grade) { return Math.max(0, SET_GRADE_ORDER_V116.indexOf(grade)); }
export function setCurveValueV116(curve, grade) { return curve[setGradeIndexV116(grade)]; }
export function equipmentSetSlotsV116(category) { return category === 'attire' ? ATTIRE_SET_SLOTS_V116 : JEWELRY_SET_SLOTS_V116; }
function gradeOf(item) { return item.grade ?? 'mundane'; }
function validSetItems(state, set) {
    const legalSlots = new Set(equipmentSetSlotsV116(set.category));
    const equippedIds = new Set(Object.values(state.equipped).filter((id) => Boolean(id)));
    return state.items.filter(item => equippedIds.has(item.id) && item.setId === set.id && legalSlots.has(item.slot));
}
/**
 * Each threshold resolves independently from the best N pieces.
 * Example grades Phá/Phá/Tiên/Tiên/Thiên/Thiên => 2p Phá, 4p Tiên, 6p Thiên.
 */
export function equipmentSetEffectiveGradeV116(items, pieces) {
    if (items.length < pieces || pieces <= 0)
        return undefined;
    const sorted = [...items].sort((a, b) => setGradeIndexV116(gradeOf(b)) - setGradeIndexV116(gradeOf(a)) || (b.itemLevel ?? 0) - (a.itemLevel ?? 0));
    return gradeOf(sorted[pieces - 1]);
}
export function evaluateSetMechanicParamsV116(def, grade) {
    const out = {};
    for (const param of def.params) {
        if (param.byGrade)
            out[param.key] = setCurveValueV116(param.byGrade, grade);
        else if (param.fixed !== undefined)
            out[param.key] = param.fixed;
    }
    return out;
}
function n(params, key) { return params[key] ?? 0; }
export function describeSetMechanicV116(mechanic, params) {
    switch (mechanic) {
        case 'simple_metal_armor_pen': return `Xuyên Giáp +${n(params, 'armorPenPct')}%.`;
        case 'simple_metal_break': return `Phá Thế +${n(params, 'breakBonusPct')}%.`;
        case 'simple_metal_broken_damage': return `Sát thương lên mục tiêu Thất Thế +${n(params, 'damageBonusPct')}%.`;
        case 'simple_wood_healing': return `Hiệu quả Hồi Phục +${n(params, 'healingPct')}%.`;
        case 'simple_wood_dot_damage': return `Sát thương duy trì (DoT) +${n(params, 'dotDamagePct')}%.`;
        case 'simple_wood_lifesteal': return `Hút Sinh Mệnh +${n(params, 'lifeStealPct')}%.`;
        case 'simple_water_spirit_regen': return `Hồi Chân Nguyên +${n(params, 'spiritRegenPct')}%.`;
        case 'simple_water_spirit_efficiency': return `Hiệu Suất Chân Nguyên +${n(params, 'spiritEfficiencyPct')}%.`;
        case 'simple_water_cooldown': return `Giảm Hồi Chiêu +${n(params, 'cooldownReductionPct')}%.`;
        case 'simple_fire_damage': return `Sát thương +${n(params, 'damageBonusPct')}%.`;
        case 'simple_fire_crit': return `Bạo Kích +${n(params, 'critChancePct')}%.`;
        case 'simple_fire_crit_damage': return `Bạo Thương +${n(params, 'critDamagePct')}%.`;
        case 'simple_earth_defense': return `Phòng Ngự +${n(params, 'defensePct')}%.`;
        case 'simple_earth_damage_reduction': return `Giảm sát thương +${n(params, 'damageReductionPct')}%.`;
        case 'simple_earth_counter_damage': return `Sát thương Phản Kích +${n(params, 'counterDamagePct')}%.`;
        case 'metal_conversion_efficiency': return `Kim Cương ↔ Phong Mang +${n(params, 'conversionBonusPct')}% hiệu suất.`;
        case 'metal_defense_to_edge': return `Phòng thủ Kim dùng ≥${n(params, 'requiredBudgetUsedPct')}% budget → lần sinh Phong Mang kế +${n(params, 'nextGenerateBonusPct')}%.`;
        case 'metal_full_edge_break_spend': return `Phong Mang đầy: Kim Spend dốc toàn bộ, package Phá/Phá Thế +${n(params, 'breakPackageBonusPct')}%; Kim Cương Generate -${n(params, 'kimCuongGeneratePenaltyPct')}%/${n(params, 'penaltySeconds')}s sau đó.`;
        case 'wood_seed_growth': return `Mộc Mầm trưởng thành từ Sinh Cơ +${n(params, 'growthBonusPct')}%.`;
        case 'wood_mature_refund': return `Mầm trưởng thành hoàn ${n(params, 'refundPct')}% Sinh Cơ đã trực tiếp nuôi Mầm.`;
        case 'wood_early_harvest': return `Mộc Spend được thu hoạch từ ${n(params, 'minimumMaturityPct')}% trưởng thành; payoff = đúng % trưởng thành và Mầm reset.`;
        case 'water_flow_decay_reduction': return `Lưu Thế suy giảm chậm hơn ${n(params, 'decayReductionPct')}%.`;
        case 'water_spend_flow_retention': return `Triều Ấn Spend giữ ${n(params, 'retainedLossPct')}% phần Lưu Thế lẽ ra mất.`;
        case 'water_lock_adaptation': return `Lưu Thế ≥${n(params, 'requiredFlowPct')}%: Thủy Spend khóa Thuận Thế ${n(params, 'lockSeconds')}s, package đó +${n(params, 'lockedPackageBonusPct')}%; không đổi Thuận Thế trong khóa.`;
        case 'fire_heat_generate': return `Viêm Ấn/Nhiệt Thế Generate +${n(params, 'generateBonusPct')}%.`;
        case 'fire_burst_heat_retention': return `Sau Bạo Viêm giữ ${n(params, 'heatRetainedPct')}% Nhiệt Thế theo baseline.`;
        case 'fire_early_extreme_heat': return `Được ép Cực Viêm từ ${n(params, 'minimumRequirementPct')}% requirement; mỗi 1% thiếu làm Tàn Hỏa +${n(params, 'aftermathPenaltyPerMissingPct')}%.`;
        case 'earth_weight_generate': return `Trọng Thế Generate từ mitigation +${n(params, 'generateBonusPct')}%.`;
        case 'earth_spend_to_recoil': return `${n(params, 'conversionPct')}% Trọng Thế Spend tấn công chuyển thành Phản Lực budget.`;
        case 'earth_overcap_weight': return `Cap Trọng Thế +${n(params, 'capBonusPct')}%; tiêu phần vượt cap gốc → Generate -${n(params, 'postOvercapGeneratePenaltyPct')}%/${n(params, 'penaltySeconds')}s.`;
        case 'sword_finisher_break': return `Finisher/Phá Thế Kiếm +${n(params, 'eligibleEffectBonusPct')}% eligible effect.`;
        case 'sword_finisher_refund': return `Finisher lên Thất Thế hoàn ${n(params, 'refundPct')}% Dao Spend, refund tổng vẫn cap ${n(params, 'globalRefundCapPct')}%.`;
        case 'sword_over_spend_finisher': return `Finisher Spend vượt tối đa ${n(params, 'maxExtraSpendPct')}%; phần vượt hiệu suất ${n(params, 'extraSpendEfficiencyPct')}%, đổi lại Recovery tăng theo lượng vượt.`;
        case 'fist_combo_window': return `Cửa sổ nối combo +${n(params, 'windowBonusPct')}%.`;
        case 'fist_finisher_pressure_retention': return `Heavy/Finisher giữ ${n(params, 'pressureRetainedPct')}% combo pressure.`;
        case 'fist_combo_overcap': return `Combo cap +${n(params, 'comboCapBonusPct')}%; bị interrupt trên cap gốc → combo 0, Recovery kế +${n(params, 'interruptRecoveryPenaltyPct')}%.`;
        case 'body_mitigated_pressure_conversion': return `Pressure đã mitigate → Counter resource +${n(params, 'conversionBonusPct')}% hiệu suất.`;
        case 'body_threshold_counter': return `Counter sau threshold +${n(params, 'counterBonusPct')}% eligible effect.`;
        case 'body_hold_empowered_counter': return `Counter cường hóa giữ tối đa ${n(params, 'holdSeconds')}s; trong lúc giữ không tích thêm Counter pressure.`;
        case 'spell_spirit_efficiency': return `Cast/Channel Pháp +${n(params, 'efficiencyBonusPct')}% Chân Nguyên efficiency trong domain.`;
        case 'spell_channel_next_tempo': return `Hoàn tất Channel → Cast/Recovery Pháp thuật kế -${n(params, 'castRecoveryReductionPct')}%.`;
        case 'spell_overchannel': return `Overchannel tối đa +${n(params, 'maxExtraChannelPct')}% thời gian; extra effect hiệu suất ${n(params, 'effectEfficiencyPct')}%, extra cost trả ${n(params, 'extraSpiritCostPctOfOverchannel')}%.`;
        case 'poison_generate_maintain': return `Generate/duy trì Độc +${n(params, 'bonusPct')}%.`;
        case 'poison_consume_retention': return `Phệ thường giữ ${n(params, 'retainedBasePct')}% nền Độc.`;
        case 'poison_full_consume_burst': return `Đại Phệ đổi remaining DoT ở ${n(params, 'remainingDotConversionPct')}% hiệu suất; sau đó Generate Độc -${n(params, 'postConsumeGeneratePenaltyPct')}%/${n(params, 'penaltySeconds')}s.`;
        case 'artifact_generate_spend': return `Generate/Spend Ngự Khí +${n(params, 'bonusPct')}% eligible package.`;
        case 'artifact_alternate_advance': return `Pháp bảo hoàn action → pháp bảo khác kế advance ${n(params, 'nextOtherSourceAdvancePct')}%, tối đa ${n(params, 'maxProcPerEvent')} proc/event.`;
        case 'artifact_fusion': return `Hợp Khí ${n(params, 'durationSeconds')}s: nguồn chính Signature +${n(params, 'primarySignatureBonusPct')}%, nguồn phụ tạm ngừng và không nhân proc/Break budget.`;
        case 'formation_nourish_speed': return `Dưỡng Trận +${n(params, 'bonusPct')}%.`;
        case 'formation_chain_nourish': return `Kích Trận hợp lệ → Trận đang dưỡng +${n(params, 'progressRequirementPct')}% requirement progress.`;
        case 'formation_early_activate': return `Kích Trận từ ${n(params, 'minimumCompletionPct')}% completion; output theo completion thật, Integrity cost +${n(params, 'integrityCostPenaltyPct')}%.`;
        case 'mind_mark_generate_maintain': return `Generate/duy trì Ấn +${n(params, 'bonusPct')}%.`;
        case 'mind_mark_next_recovery': return `Kích Ấn → Recovery action tạo Ấn kế -${n(params, 'recoveryReductionPct')}%.`;
        case 'mind_consume_all_disrupt': return `Tiêu toàn bộ Ấn: Nhiễu Cast/Recovery cap ${n(params, 'disruptionCapPct')}%; Generate Ấn -${n(params, 'postConsumeGeneratePenaltyPct')}%/${n(params, 'penaltySeconds')}s.`;
        case 'metal_artifact_edge_generate': return `Ngự Khí mang Kim sinh Phong Mang +${n(params, 'generateBonusPct')}%.`;
        case 'metal_artifact_next_break': return `Spend Phong Mang → pháp bảo kế +${n(params, 'nextBreakPackageBonusPct')}% package Phá/Phá Thế.`;
        case 'wood_poison_tick_growth': return `Tick Độc thúc Mộc Mầm bằng ${n(params, 'standardWoodGenerateContributionPct')}% Mộc Generate chuẩn, cap ${n(params, 'maxContributionPerSecondPerTarget')}/giây/mục tiêu.`;
        case 'wood_consume_poison_to_seed': return `Mộc Spend đổi Độc còn lại thành tiến độ Mầm ở ${n(params, 'dotToMaturityConversionPct')}% hiệu suất; DoT bị hút mất damage tương lai.`;
        case 'water_spell_flow_generate': return `Cast Pháp thành công sinh Lưu Thế +${n(params, 'flowGenerateBonusPct')}%.`;
        case 'water_spell_chain_cast': return `Lưu Thế ≥${n(params, 'requiredFlowPct')}%: tối đa ${n(params, 'maxStacks')} Liên Lưu; mỗi stack Cast -${n(params, 'castTimeReductionPerStackPct')}%, cost +${n(params, 'spiritCostIncreasePerStackPct')}%.`;
        case 'fire_sword_finisher_generate': return `Kiếm Finisher tăng Hỏa Generate +${n(params, 'fireGenerateBonusPct')}%.`;
        case 'fire_sword_extreme_finisher': return `Trong Cực Viêm, Finisher +${n(params, 'finisherBonusPct')}%; mỗi Finisher cắt ${n(params, 'extremeDurationCutPerFinisherSeconds')}s và tăng Tàn Hỏa +${n(params, 'aftermathIncreasePerFinisherPct')}% (cap ${n(params, 'aftermathIncreaseCapPct')}%).`;
        case 'earth_body_mitigation_weight': return `Mitigation sinh Trọng Thế +${n(params, 'weightGenerateBonusPct')}%.`;
        case 'earth_body_stand_ground': return `Trọng Thế ≥${n(params, 'requiredWeightPct')}% + Defense/Utility → ${n(params, 'durationSeconds')}s: Né=${n(params, 'effectiveDodgePct')}%, Trọng Thế Generate và Counter +${n(params, 'weightGenerateBonusPct')}%; CD ${n(params, 'internalCooldownSeconds')}s.`;
        case 'sword_formation_nourish': return `Kiếm action dưỡng Trận +${n(params, 'standardFormationContributionPct')}% contribution chuẩn, cap ${n(params, 'maxContributionPerAction')}/action.`;
        case 'sword_link_formation_finisher': return `Liên Kết 1 Trận đã dưỡng: Finisher tự Kích Trận +${n(params, 'linkedActivationBonusPct')}% eligible effect; mất quyền kích thủ công trong lúc liên kết.`;
        case 'rotation_alternate_skill_efficiency': return `Đổi sang Active khác → Active kế giảm ${n(params, 'nextActiveCostReductionPct')}% Chân Nguyên cost.`;
        case 'rotation_four_distinct_payoff': return `${n(params, 'distinctActivesRequired')} Active khác nhau liên tiếp → Active kế +${n(params, 'payoffBonusPct')}% eligible authored effect; lặp sớm reset chain.`;
        case 'ultimate_gauge_generate': return `Ultimate Gauge gain từ event hợp lệ +${n(params, 'gaugeGenerateBonusPct')}%, vẫn chịu event budget.`;
        case 'ultimate_gauge_spend_active': return `Gauge ≥${n(params, 'minimumGaugeBeforeAction')}: Active có thể tiêu ${n(params, 'gaugeCost')} Gauge để +${n(params, 'eligibleEffectBonusPct')}% eligible effect; lockout ${n(params, 'lockoutSeconds')}s, action đó không Generate Gauge.`;
        default: return mechanic;
    }
}
export function activeEquipmentSetMechanicsV116(state) {
    const out = [];
    for (const set of LIVE_EQUIPMENT_SET_CATALOG_V12310) {
        const items = validSetItems(state, set);
        if (items.length < 2)
            continue;
        for (const mechanic of set.mechanics) {
            const grade = equipmentSetEffectiveGradeV116(items, mechanic.pieces);
            if (!grade)
                continue;
            const params = evaluateSetMechanicParamsV116(mechanic, grade);
            out.push({ setId: set.id, setName: set.name, category: set.category, equippedPieces: items.length, pieces: mechanic.pieces, effectiveGrade: grade, mechanicId: mechanic.id, mechanic: mechanic.mechanic, name: mechanic.name, eligibleDomains: [...mechanic.eligibleDomains], params, constraint: mechanic.constraint, summary: describeSetMechanicV116(mechanic.mechanic, params) });
        }
    }
    return out;
}
export function validateEquipmentSetCatalogV116() {
    const errors = [];
    const ids = new Set();
    for (const set of EQUIPMENT_SET_CATALOG_V116) {
        if (ids.has(set.id))
            errors.push(`${set.id}: duplicate set id`);
        ids.add(set.id);
        const expected = set.category === 'attire' ? [2, 4, 6] : [2, 4];
        const actual = set.mechanics.map(x => x.pieces);
        if (JSON.stringify(actual) !== JSON.stringify(expected))
            errors.push(`${set.id}: thresholds ${actual.join('/')} != ${expected.join('/')}`);
        for (const mechanic of set.mechanics) {
            if (mechanic.eligibleDomains.some(x => x.toLowerCase().includes('totaldamage')))
                errors.push(`${mechanic.id}: forbidden Total Damage domain`);
            if (mechanic.params.some(x => x.key.toLowerCase().includes('totaldamage')))
                errors.push(`${mechanic.id}: forbidden Total Damage param`);
            for (const param of mechanic.params) {
                if (param.byGrade && param.byGrade.length !== 8)
                    errors.push(`${mechanic.id}.${param.key}: grade curve must have 8 values`);
            }
        }
        if (set.category === 'attire' && set.identity !== 'element') {
            const six = set.mechanics.find(x => x.pieces === 6);
            if (!six?.constraint)
                errors.push(`${set.id}: legacy/retired Dao attire 6p must keep its authored constraint/trade-off`);
        }
    }
    if (EQUIPMENT_SET_CATALOG_V116.filter(x => x.category === 'attire').length !== 13)
        errors.push('v1.16 must have exactly 13 attire sets');
    if (EQUIPMENT_SET_CATALOG_V116.filter(x => x.category === 'jewelry').length !== 8)
        errors.push('v1.16 must have exactly 8 jewelry sets');
    return errors;
}
export function validateLiveEquipmentSetArchitectureV12310() {
    const errors = [];
    if (LIVE_EQUIPMENT_SET_CATALOG_V12310.length !== 5)
        errors.push(`alpha.23.10 requires exactly 5 live equipment Sets; got ${LIVE_EQUIPMENT_SET_CATALOG_V12310.length}`);
    for (const set of LIVE_EQUIPMENT_SET_CATALOG_V12310) {
        if (set.category !== 'attire' || set.identity !== 'element')
            errors.push(`${set.id}: live equipment Set must be Ngũ Hành attire`);
        if (JSON.stringify(set.mechanics.map(x => x.pieces)) !== JSON.stringify([2, 4, 6]))
            errors.push(`${set.id}: live Ngũ Hành thresholds must be 2/4/6`);
        if (set.mechanics.some(x => Boolean(x.constraint)))
            errors.push(`${set.id}: Alpha.23.18 live Ngũ Hành Sets must not hide penalties/trade-offs`);
        if (set.mechanics.some(x => !x.mechanic.startsWith('simple_')))
            errors.push(`${set.id}: Alpha.23.18 live Ngũ Hành mechanics must use direct simple_* stats`);
    }
    return errors;
}
/** Tags are a stable bridge for combat/build runtimes; values stay in ActiveSetMechanicV116, never encoded as fake prose. */
export function equipmentSetMechanicTagsV116(active) {
    return active.map(x => `SetV116:${x.setId}:${x.pieces}:${x.effectiveGrade}:${x.mechanic}`);
}
/** Drop/discovery and blueprint systems may both call this; crafting must check the same persistent list. */
export function unlockEquipmentSetV116(state, setId) {
    if (!isLiveEquipmentSetV12310(setId))
        throw new Error(`Set trang bị này đã retire hoặc không tồn tại: ${setId}`);
    state.unlockedSetIds = [...new Set([...(state.unlockedSetIds ?? []), setId])];
}
export function isEquipmentSetUnlockedV116(state, setId) { return (state.unlockedSetIds ?? []).includes(setId); }
/** Exact Set + slot selection contract. Economy/craft layer still owns item tier/grade/material payment. */
export function requireUnlockedSetCraftV116(state, setId, slot) {
    const set = equipmentSetCatalogEntryV116(setId);
    if (!set || !isLiveEquipmentSetV12310(setId))
        throw new Error(`Set trang bị này đã retire hoặc không tồn tại: ${setId}`);
    if (!isEquipmentSetUnlockedV116(state, setId))
        throw new Error(`Chưa mở công thức/bản vẽ của ${set.name}.`);
    if (!equipmentSetSlotsV116(set.category).includes(slot))
        throw new Error(`${set.name} không dùng slot ${slot}.`);
    return set;
}
/** Deterministic template id for exact Set + slot crafting. */
export function equipmentSetTemplateIdV116(setId, slot) {
    const set = equipmentSetCatalogEntryV116(setId);
    if (!set || !isLiveEquipmentSetV12310(setId))
        throw new Error(`Set trang bị này đã retire hoặc không tồn tại: ${setId}`);
    if (!equipmentSetSlotsV116(set.category).includes(slot))
        throw new Error(`${set.name} không dùng slot ${slot}.`);
    const prefix = set.category === 'attire' ? 'equipment.v116.attire' : 'equipment.v116.jewelry';
    return `${prefix}.${set.key}.${slot}`;
}
//# sourceMappingURL=equipment-set-v116.js.map