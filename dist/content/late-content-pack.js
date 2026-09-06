const event = (definition) => definition;
const lateEventList = [
    // Trúc Cơ hậu kỳ / viên mãn — bridge into Tử Phủ.
    event({
        id: 'event.late.foundation.purple_gate_rumor', packId: 'pack.late.foundation', title: 'Tin Về Tử Kính Hồ', teaser: 'Vân Hải Thành truyền tin mặt hồ phía bắc gần đây phản chiếu thần niệm của tu sĩ Trúc Cơ.', priority: 86,
        condition: { locationIds: ['location.cloud_sea_city'], minRealmOrder: 12, maxRealmOrder: 13 },
        choices: [
            { id: 'investigate', label: 'Chép lại bản đồ Tử Kính Hồ', description: 'Mở đường tới vùng Tử Phủ.', resultText: 'Ngươi chép lại một bản đồ cũ, đánh dấu con đường men theo Thanh Hư Sơn tới Tử Kính Hồ.', effects: { unlockLocationIds: ['location.purple_mirror_lake'] }, significance: 21, tags: ['Exploration', 'PurplePalaceHint'] },
            { id: 'listen', label: 'Chỉ nghe tin', description: 'Không tiêu tiền, nhận chút chuẩn bị.', resultText: 'Ngươi ghi lại đặc điểm của Tử Kính Hồ và cách tránh kính quang phản thần.', effects: {}, significance: 10, tags: ['Knowledge'] },
        ], tags: ['FoundationLate', 'Exploration'],
    }),
    event({
        id: 'event.late.foundation.compress_core', packId: 'pack.late.foundation', title: 'Ép Đạo Cơ Thành Một Điểm', teaser: 'Trúc Cơ hậu kỳ bắt đầu xuất hiện cảm giác Đạo Cơ có thể nén sâu hơn, chuẩn bị mở Tử Phủ.', priority: 92,
        condition: { minRealmOrder: 12, maxRealmOrder: 13 },
        choices: [
            { id: 'steady', label: 'Nén chậm, giữ nền tu hành', description: 'Tăng nền tu hành và chuẩn bị, không lấy tu vi tức thời.', resultText: 'Ngươi nén từng vòng linh lực quanh Đạo Cơ, để khí cơ dày mà không loạn.', effects: {}, significance: 28, tags: ['Cultivation', 'Breakthrough'] },
            { id: 'force', label: 'Cưỡng ép nén nhanh', description: 'Đổi thương tổn lấy tu vi.', resultText: 'Ngươi cưỡng ép linh lực co lại thành một điểm, tu vi dâng mạnh nhưng thân thể chịu áp lực.', effects: { tuVi: 520,}, significance: 23, tags: ['Cultivation', 'Risk'] },
        ], tags: ['FoundationLate', 'Breakthrough'],
    }),
    event({
        id: 'event.late.foundation.blood_residue', packId: 'pack.late.foundation', title: 'Huyết Sát Sau Cơn Mưa', teaser: 'Huyết Hà Cốc sau một trận mưa lớn để lộ những tinh thể bị huyết sát mài nhẵn.', priority: 78,
        condition: { locationIds: ['location.blood_river_gorge'], minRealmOrder: 12, maxRealmOrder: 14 },
        choices: [
            { id: 'gather', label: 'Thu Huyết Tinh', description: 'Lấy vật liệu hiếm nhưng tích phản phệ.', resultText: 'Ngươi thu những viên Huyết Tinh còn sạch nhất ở rìa cốc.', effects: { resources: { 'resource.blood_crystal': 7 },}, significance: 17, tags: ['Resource', 'Blood'] },
            { id: 'purify', label: 'Dùng huyết sát luyện tâm', description: 'Không lấy vật liệu, tăng nền tu hành.', resultText: 'Ngươi đứng giữa huyết sát mà giữ tâm niệm không loạn, Đạo Cơ càng ổn.', effects: {}, significance: 20, tags: ['Cultivation'] },
        ], tags: ['FoundationLate', 'Blood'],
    }),
    event({
        id: 'event.late.foundation.starfall_trace', packId: 'pack.late.foundation', title: 'Tinh Quang Sau Vết Kiếm', teaser: 'Ở sâu Cổ Kiếm Động, một vết kiếm ban đêm lóe lên tinh quang dẫn về phía vách núi xa.', priority: 88,
        condition: { locationIds: ['location.ancient_sword_cave'], minRealmOrder: 13, knownSkillIds: ['skill.sword_pressure'] },
        choices: [
            { id: 'follow', label: 'Lần theo tinh quang', description: 'Mở Tinh Lạc Nhai.', resultText: 'Ngươi lần theo hướng kiếm quang và tìm ra con đường tới Tinh Lạc Nhai.', effects: { unlockLocationIds: ['location.starfall_cliff'], resources: { 'resource.sword_fragment': 2 } }, significance: 23, tags: ['Sword', 'Exploration'] },
            { id: 'meditate', label: 'Ngồi lại ngộ kiếm', description: 'Tăng nền Kiếm mà chưa đi xa.', resultText: 'Ngươi không truy dấu, chỉ ghi nhớ nhịp tinh quang ẩn trong kiếm ngân.', effects: { learnSkillIds: ['skill.sword_step'] }, significance: 19, tags: ['Sword', 'Insight'] },
        ], tags: ['FoundationLate', 'Sword'],
    }),
    event({
        id: 'event.late.foundation.purple_mist_route', packId: 'pack.late.foundation', title: 'Đường Tắt Qua Tử Vụ', teaser: 'Từ Huyết Hà Cốc có một tuyến cũ dẫn vào vùng sương tím, nhưng yêu độc sinh sôi dày đặc.', priority: 82,
        condition: { locationIds: ['location.blood_river_gorge'], minRealmOrder: 13 },
        choices: [
            { id: 'open', label: 'Mở đường Tử Vụ Trạch', description: 'Nhận một ít độc tủy và mở map.', resultText: 'Ngươi dùng linh lực đánh dấu từng đoạn an toàn, cuối cùng nối được đường sang Tử Vụ Trạch.', effects: { unlockLocationIds: ['location.purple_mist_marsh'], resources: { 'resource.purple_mist_venom': 2 } }, significance: 22, tags: ['Exploration', 'Poison'] },
        ], tags: ['FoundationLate', 'Exploration'],
    }),
    event({
        id: 'event.late.foundation.purple_threshold', packId: 'pack.late.foundation', title: 'Thử Cửa Tử Phủ', teaser: 'Một Tử Vụ Huyền Chu giữ lối vào khe núi có Tử Phủ Tinh Hoa.', priority: 96,
        condition: { minRealmOrder: 13, maxRealmOrder: 14 },
        choices: [
            { id: 'fight', label: 'Phá cửa bằng chiến đấu', description: 'Đánh Tử Vụ Huyền Chu; thua được thử lại.', resultText: 'Ngươi tiến vào lớp sương tím, Huyền Chu lập tức giăng độc võng.', combat: { entityId: 'entity.elite.purple_mist_spider', onWin: { resources: { 'resource.purple_mansion_essence': 5 }, unlockDungeonIds: ['dungeon.purple_mirror_palace'] }, onLose: { injury: 9 }, completeOnLoss: false, loseText: 'Độc võng ép ngươi lùi khỏi khe núi; cửa Tử Phủ vẫn còn đó.' }, significance: 34, tags: ['Combat', 'PurplePalaceHint'] },
            { id: 'prepare', label: 'Chưa vội vào', description: 'Lấy chuẩn bị thăng cảnh.', resultText: 'Ngươi quan sát độc võng và ghi lại nhịp linh áp của vùng Tử Phủ.', effects: {}, significance: 11, tags: ['Study'] },
        ], tags: ['FoundationLate', 'Milestone'],
    }),
    // Tử Phủ core.
    event({
        id: 'event.purple.first_space', packId: 'pack.purple.core', title: 'Tử Phủ Sơ Khai', teaser: 'Sau khi mở Tử Phủ, linh lực có một nơi “trú” rõ ràng hơn bên trong thân thể.', priority: 100,
        condition: { minRealmOrder: 14, maxRealmOrder: 14 },
        choices: [
            { id: 'stabilize', label: 'Ổn định Tử Phủ', description: 'Tăng nền tu hành và thanh tạp.', resultText: 'Ngươi giữ thần niệm trong Tử Phủ nhiều ngày, từng lớp khí cơ dần đứng yên.', effects: {}, significance: 34, tags: ['PurplePalace', 'Milestone'] },
            { id: 'expand', label: 'Mở rộng không gian ngay', description: 'Đổi chút ổn định lấy tu vi.', resultText: 'Ngươi ép Tử Phủ mở rộng, linh lực tràn vào nhanh nhưng khí cơ còn thô.', effects: { tuVi: 750,}, significance: 26, tags: ['PurplePalace', 'Risk'] },
        ], tags: ['PurplePalace', 'Milestone'],
    }),
    event({
        id: 'event.purple.mirror_lake_reflection', packId: 'pack.purple.core', title: 'Tử Kính Chiếu Tâm', teaser: 'Mặt Tử Kính Hồ phản chiếu không phải khuôn mặt mà là cách linh lực vận hành trong Tử Phủ.', priority: 88,
        condition: { locationIds: ['location.purple_mirror_lake'], minRealmOrder: 14, maxRealmOrder: 17 },
        choices: [
            { id: 'observe', label: 'Quan sát Tử Phủ của chính mình', description: 'Tăng nền và giảm phản phệ.', resultText: 'Qua mặt hồ, ngươi nhìn thấy vài điểm linh lực xoáy sai và sửa lại từng chỗ.', effects: {}, significance: 24, tags: ['PurplePalace', 'Insight'] },
            { id: 'seek_ziyun', label: 'Tìm Tử Vân Chân Nhân luận giải', description: 'Tạo quan hệ với NPC Tử Phủ.', resultText: 'Tử Vân Chân Nhân chỉ ra vài sai khác giữa Tử Phủ rộng và Tử Phủ ổn.', effects: { relationships: [{ npcId: 'npc.ziyun_zhenren', trust: 4, respect: 5, karmaDepth: 2 }],}, significance: 20, tags: ['Relationship', 'Knowledge'] },
        ], tags: ['PurplePalace', 'Mirror'],
    }),
    event({
        id: 'event.purple.spider_hunt', packId: 'pack.purple.core', title: 'Huyền Chu Ăn Thần Niệm', teaser: 'Một Tử Vụ Huyền Chu trưởng thành bắt đầu săn tu sĩ quanh đầm.', priority: 90,
        condition: { locationIds: ['location.purple_mist_marsh'], minRealmOrder: 14, maxRealmOrder: 17 },
        choices: [
            { id: 'hunt', label: 'Săn Huyền Chu', description: 'Combat elite Tử Phủ.', resultText: 'Ngươi lần theo độc tơ tới ổ Huyền Chu.', combat: { entityId: 'entity.elite.purple_mist_spider', onWin: { resources: { 'resource.purple_mist_venom': 5, 'resource.soul_moss': 4 } }, onLose: { injury: 8 }, completeOnLoss: false }, significance: 28, tags: ['Combat', 'Poison'] },
            { id: 'avoid', label: 'Đi vòng qua đầm', description: 'Không chiến đấu.', resultText: 'Ngươi đổi tuyến đường, tránh ổ độc và nhặt một ít Dưỡng Thần Đài.', effects: { resources: { 'resource.soul_moss': 2 } }, significance: 10, tags: ['Exploration'] },
        ], tags: ['PurplePalace', 'Combat'],
    }),
    event({
        id: 'event.purple.palace_discovery', packId: 'pack.purple.core', title: 'Tử Kính Huyền Cung Lộ Diện', teaser: 'Kính quang dưới đáy hồ hội tụ thành một cửa cung cổ chỉ Tử Phủ tu sĩ mới cảm được.', priority: 94,
        condition: { locationIds: ['location.purple_mirror_lake'], minRealmOrder: 14 },
        choices: [
            { id: 'unlock', label: 'Khắc ấn cửa Huyền Cung', description: 'Mở phó bản Tử Kính Huyền Cung.', resultText: 'Ngươi để lại thần niệm ấn trên cửa cung và tìm được lối ổn định vào bên trong.', effects: { unlockDungeonIds: ['dungeon.purple_mirror_palace'], resources: { 'resource.mirror_jade': 2 } }, significance: 27, tags: ['Dungeon', 'Artifact'] },
        ], tags: ['PurplePalace', 'DungeonHint'],
    }),
    event({
        id: 'event.purple.inner_storehouse', packId: 'pack.purple.core', title: 'Tàng Vật Trong Tử Phủ', teaser: 'Tử Phủ đủ ổn để cất giữ một ít vật liệu nhạy cảm mà không làm khí cơ hỗn loạn.', priority: 72,
        condition: { minRealmOrder: 15, maxRealmOrder: 17 },
        choices: [
            { id: 'spirit', label: 'Dưỡng vật bằng linh lực', description: 'Lấy Tử Phủ Tinh Hoa.', resultText: 'Ngươi dùng Tử Phủ ôn dưỡng vài khối linh vật, để khí tính dần thuần.', effects: { resources: { 'resource.purple_mansion_essence': 4 }, tuVi: -180 }, significance: 16, tags: ['PurplePalace', 'Resource'] },
            { id: 'foundation', label: 'Không cất vật, chỉ dưỡng phủ', description: 'Tăng nền tu hành.', resultText: 'Ngươi để Tử Phủ trống, dùng thời gian củng cố biên giới khí hải.', effects: {}, significance: 15, tags: ['Cultivation'] },
        ], tags: ['PurplePalace', 'Cultivation'],
    }),
    event({
        id: 'event.purple.mirror_guardian_trial', packId: 'pack.purple.core', title: 'Hộ Linh Trong Tử Kính', teaser: 'Tầng sâu Huyền Cung có một Hộ Linh dùng kính quang phản chế thần niệm.', priority: 97,
        condition: { minRealmOrder: 15, requiredDungeonFloors: [{ dungeonId: 'dungeon.purple_mirror_palace', minFloor: 1 }] },
        choices: [
            { id: 'fight', label: 'Đấu Tử Kính Hộ Linh', description: 'Boss Tử Phủ; thua được thử lại.', resultText: 'Kính quang dựng thành một hình người vô mặt đối diện ngươi.', combat: { entityId: 'entity.boss.purple_mirror_guardian', onWin: { resources: { 'resource.purple_mansion_essence': 8, 'resource.mirror_jade': 3 },}, onLose: { injury: 11 }, completeOnLoss: false, loseText: 'Kính quang phản lại thế công, buộc ngươi rút khỏi điện.' }, significance: 40, tags: ['Boss', 'PurplePalace'] },
        ], tags: ['PurplePalace', 'Boss', 'Milestone'],
    }),
    // Tử Phủ tông môn.
    event({
        id: 'event.purple.sect.elder_council', packId: 'pack.purple.sect', title: 'Dự Thính Trưởng Lão Hội', teaser: 'Tử Phủ tu sĩ đã đủ tư cách nghe một phần nghị sự nội môn.', priority: 82,
        condition: { locationIds: ['location.thanh_hu_sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 14 },
        choices: [
            { id: 'listen', label: 'Dự thính', description: 'Nhận công đức và hiểu biết thế giới.', resultText: 'Ngươi nghe các trưởng lão bàn về Tử Vụ Trạch và biến động Đan Hỏa Sơn.', effects: { factionMerit: 28, unlockLocationIds: ['location.purple_mist_marsh', 'location.core_fire_mountain'] }, significance: 20, tags: ['Sect', 'World'] },
        ], tags: ['PurplePalace', 'Sect'],
    }),
    event({
        id: 'event.purple.sect.archive', packId: 'pack.purple.sect', title: 'Tàng Kinh Các · Tử Phủ Thiên', teaser: 'Một tầng Tàng Kinh Các chỉ mở cho tu sĩ đã hình thành Tử Phủ.', priority: 86,
        condition: { locationIds: ['location.thanh_hu_sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 14 },
        choices: [
            { id: 'seal', label: 'Nghiên cứu Định Thần', description: 'Học Định Thần Phù nếu chưa biết.', resultText: 'Ngươi đọc các ghi chép về thần niệm và cách khóa khí cơ.', effects: { factionMerit: -12, learnSkillIds: ['skill.spirit_seal'] }, significance: 19, tags: ['Sect', 'Skill'] },
            { id: 'guard', label: 'Nghiên cứu hộ phủ', description: 'Học Hộ Thân Chú.', resultText: 'Ngươi chọn một thiên hộ phủ, chú trọng độ ổn định hơn dung lượng.', effects: { factionMerit: -12, learnSkillIds: ['skill.protective_charm'] }, significance: 19, tags: ['Sect', 'Skill'] },
        ], tags: ['PurplePalace', 'Sect', 'Inheritance'],
    }),
    event({
        id: 'event.purple.sect.rune_tower', packId: 'pack.purple.sect', title: 'Phù Văn Tháp Nội Khảo', teaser: 'Tử Phủ khiến thần niệm đủ ổn để nhìn rõ những tầng phù văn trước đây chỉ thấy như nhiễu sáng.', priority: 84,
        condition: { requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 14, requiredDungeonFloors: [{ dungeonId: 'dungeon.rune_tower', minFloor: 1 }] },
        choices: [
            { id: 'study', label: 'Phân tích phù văn', description: 'Tăng Phù/Trận mastery.', resultText: 'Ngươi dành nhiều ngày tách từng lớp phù văn rồi ghép lại thành một cấu trúc dễ hiểu hơn.', effects: { professionMastery: { talisman: 7 }, resources: { 'resource.rune_insight': 5 }, factionMerit: 12 }, significance: 21, tags: ['Sect', 'Talisman'] },
        ], tags: ['PurplePalace', 'Sect', 'Profession'],
    }),
    event({
        id: 'event.purple.sect.treasure_duty', packId: 'pack.purple.sect', title: 'Trấn Thủ Bảo Khố', teaser: 'Tông môn cần Tử Phủ tu sĩ trông coi một lô pháp bảo vừa chuyển về.', priority: 76,
        condition: { locationIds: ['location.thanh_hu_sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 15 },
        choices: [
            { id: 'guard', label: 'Nhận nhiệm vụ', description: 'Công đức + Bảo Khí Tàn Tinh.', resultText: 'Ngươi trấn thủ bảo khố đủ một chu kỳ, tiện thể học cách phân biệt khí tính.', effects: { factionMerit: 36, resources: { 'resource.artifact_dust': 6 } }, significance: 18, tags: ['Sect', 'Artifact'] },
        ], tags: ['PurplePalace', 'Sect'],
    }),
    event({
        id: 'event.purple.sect.teach_juniors', packId: 'pack.purple.sect', title: 'Giảng Đạo Cho Nội Môn', teaser: 'Một nhóm đệ tử Luyện Khí xin nghe kinh nghiệm từ Tử Phủ tu sĩ.', priority: 70,
        condition: { locationIds: ['location.thanh_hu_sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 15 },
        choices: [
            { id: 'teach', label: 'Giảng một buổi', description: 'Tăng công đức và quan hệ tông môn.', resultText: 'Ngươi giảng những lỗi mình từng mắc lúc Luyện Khí; lời đơn giản lại khiến nhiều người nhớ lâu.', effects: { factionMerit: 24, relationships: [{ npcId: 'npc.luo_qingyao', respect: 3 }, { npcId: 'npc.mo_changfeng', respect: 2 }] }, significance: 18, tags: ['Sect', 'Teaching'] },
        ], tags: ['PurplePalace', 'Sect', 'Legacy'],
    }),
    event({
        id: 'event.purple.sect.starfall_mission', packId: 'pack.purple.sect', title: 'Nhiệm Vụ Tinh Lạc Nhai', teaser: 'Thanh Hư Tông muốn xác nhận Kiếm Hồn trên Tinh Lạc Nhai có phải truyền thừa thất lạc của tông hay không.', priority: 93,
        condition: { requiredFactionId: 'faction.thanh_hu_sect', locationIds: ['location.starfall_cliff'], minRealmOrder: 16 },
        choices: [
            { id: 'fight', label: 'Thử Kiếm Hồn', description: 'Đấu boss Kiếm; thua được retry.', resultText: 'Tinh quang kết thành một Kiếm Hồn không nói một lời.', combat: { entityId: 'entity.boss.starfall_sword_ghost', onWin: { factionMerit: 65, resources: { 'resource.star_iron': 4 }, relationships: [{ npcId: 'npc.xingluo_jianke', respect: 6, karmaDepth: 2 }] }, onLose: { injury: 10 }, completeOnLoss: false }, significance: 38, tags: ['Sect', 'Boss', 'Sword'] },
        ], tags: ['PurplePalace', 'Sect', 'Boss'],
    }),
    // Tử Phủ tán tu.
    event({
        id: 'event.purple.wanderer.mingluo_meet', packId: 'pack.purple.wanderer', title: 'Minh La Tán Nhân', teaser: 'Một tán tu áo xám ngồi giữa Tử Vụ Trạch, quanh người không có một con độc trùng nào dám lại gần.', priority: 86,
        condition: { locationIds: ['location.purple_mist_marsh'], forbidFactionMembership: true, minRealmOrder: 14 },
        choices: [
            { id: 'talk', label: 'Trao đổi đường tu', description: 'Kết nhân quả với Minh La.', resultText: 'Minh La Tán Nhân không hỏi lai lịch, chỉ đổi vài kinh nghiệm về độc vụ và đường tán tu.', effects: { relationships: [{ npcId: 'npc.mingluo_sanren', trust: 4, respect: 4, karmaDepth: 3 }], resources: { 'resource.purple_mist_venom': 2 } }, significance: 20, tags: ['Wanderer', 'Relationship'] },
            { id: 'avoid', label: 'Không dây nhân quả', description: 'Chỉ lấy tài nguyên ngoài rìa.', resultText: 'Ngươi tránh xa người lạ, tự tìm một đoạn đầm ít độc trùng.', effects: { resources: { 'resource.soul_moss': 2 } }, significance: 8, tags: ['Choice'] },
        ], tags: ['PurplePalace', 'Wanderer'],
    }),
    event({
        id: 'event.purple.wanderer.cave_claim', packId: 'pack.purple.wanderer', title: 'Động Phủ Không Chủ', teaser: 'Một động phủ nhỏ bên Tử Kính Hồ đã bỏ trống nhiều năm, trận pháp ngoài cửa gần tan.', priority: 79,
        condition: { locationIds: ['location.purple_mirror_lake'], forbidFactionMembership: true, minRealmOrder: 14 },
        choices: [
            { id: 'claim', label: 'Chiếm động phủ tạm thời', description: 'Lấy Tử Phủ Tinh Hoa và nền tu hành.', resultText: 'Ngươi sửa lại trận cửa, dùng nơi này làm chỗ tĩnh tu một thời gian.', effects: { resources: { 'resource.purple_mansion_essence': 5 },}, significance: 19, tags: ['Wanderer', 'Cave'] },
        ], tags: ['PurplePalace', 'Wanderer'],
    }),
    event({
        id: 'event.purple.wanderer.ziyun_trade', packId: 'pack.purple.wanderer', title: 'Một Cuộc Đổi Ngọc Với Tử Vân', teaser: 'Tử Vân Chân Nhân muốn đổi Huyền Kính Ngọc lấy một ít linh thạch và tin tức Tử Vụ.', priority: 72,
        condition: { locationIds: ['location.purple_mirror_lake'], forbidFactionMembership: true, minRealmOrder: 14, requiredResources: { 'resource.spirit_stone': 20 } },
        choices: [
            { id: 'trade', label: 'Đổi 20 Linh Thạch', description: 'Nhận Huyền Kính Ngọc.', resultText: 'Cuộc giao dịch gọn gàng; Tử Vân Chân Nhân cũng nhớ mặt ngươi.', effects: { resources: { 'resource.spirit_stone': -20, 'resource.mirror_jade': 4 }, relationships: [{ npcId: 'npc.ziyun_zhenren', trust: 3, respect: 2, karmaDepth: 1 }] }, significance: 15, tags: ['Wanderer', 'Economy'] },
        ], tags: ['PurplePalace', 'Wanderer'],
    }),
    event({
        id: 'event.purple.wanderer.starfall_route', packId: 'pack.purple.wanderer', title: 'Tinh Lạc Lộ', teaser: 'Tinh Lạc Kiếm Khách bán một tấm bản đồ đường núi, giá không rẻ nhưng tránh được ba vùng yêu thú.', priority: 78,
        condition: { locationIds: ['location.ancient_sword_cave'], forbidFactionMembership: true, minRealmOrder: 15 },
        choices: [
            { id: 'take', label: 'Nhận bản đồ', description: 'Mở Tinh Lạc Nhai và tạo nhân quả.', resultText: 'Ngươi nhận bản đồ cũ, trên mép còn nhiều vết kiếm thử giấy.', effects: { unlockLocationIds: ['location.starfall_cliff'], relationships: [{ npcId: 'npc.xingluo_jianke', respect: 3, karmaDepth: 2 }] }, significance: 17, tags: ['Wanderer', 'Sword', 'Exploration'] },
        ], tags: ['PurplePalace', 'Wanderer'],
    }),
    event({
        id: 'event.purple.wanderer.artifact_clue', packId: 'pack.purple.wanderer', title: 'Tàn Đăng Trong Chợ Đen', teaser: 'Một mảnh chân đèn tím mang khí tức tương tự Tử Kính Huyền Cung.', priority: 80,
        condition: { forbidFactionMembership: true, minRealmOrder: 15, requiredResources: { 'resource.spirit_stone': 18 } },
        choices: [
            { id: 'buy', label: 'Mua mảnh chân đèn', description: 'Mở Tử Kính Huyền Cung và nhận Bảo Khí Tàn Tinh.', resultText: 'Mảnh chân đèn không còn dùng được, nhưng khí tức trên đó đủ để xác định nguồn gốc.', effects: { resources: { 'resource.spirit_stone': -18, 'resource.artifact_dust': 5 }, unlockDungeonIds: ['dungeon.purple_mirror_palace'] }, significance: 18, tags: ['Wanderer', 'Artifact'] },
        ], tags: ['PurplePalace', 'Wanderer'],
    }),
    event({
        id: 'event.purple.wanderer.starfall_duel', packId: 'pack.purple.wanderer', title: 'Một Kiếm Hỏi Đường', teaser: 'Tinh Lạc Kiếm Hồn chắn đúng lối ngươi định qua; không có tông môn nào đứng sau hỗ trợ.', priority: 94,
        condition: { locationIds: ['location.starfall_cliff'], forbidFactionMembership: true, minRealmOrder: 16 },
        choices: [
            { id: 'fight', label: 'Tự mình phá kiếm', description: 'Boss Sword; thắng nhận Kiếm tài nguyên.', resultText: 'Ngươi rút kiếm đối diện Tinh Lạc Kiếm Hồn.', combat: { entityId: 'entity.boss.starfall_sword_ghost', onWin: { resources: { 'resource.star_iron': 5, 'resource.sword_fragment': 5 },}, onLose: { injury: 12 }, completeOnLoss: false }, significance: 39, tags: ['Wanderer', 'Boss', 'Sword'] },
        ], tags: ['PurplePalace', 'Wanderer', 'Boss'],
    }),
    // Bách nghệ Tử Phủ / chuẩn bị Kim Đan.
    event({
        id: 'event.purple.prof.alchemy_mirror', packId: 'pack.purple.profession', title: 'Dược Tính Phản Chiếu', teaser: 'Tử Kính Hồ khiến dược tính trong linh dịch hiện thành những quầng màu rõ ràng.', priority: 78,
        condition: { locationIds: ['location.purple_mirror_lake'], minRealmOrder: 14, professionMinMastery: { alchemy: 30 } },
        choices: [
            { id: 'study', label: 'Dùng kính quang phân dược', description: 'Tăng Luyện Đan mastery.', resultText: 'Ngươi dùng kính quang tách từng lớp dược tính, hiểu rõ hơn vì sao vài mẻ đan trước thất bại.', effects: { professionMastery: { alchemy: 8 }, resources: { 'resource.alchemy_essence': 5 } }, significance: 20, tags: ['Alchemy', 'PurplePalace'] },
        ], tags: ['PurplePalace', 'Profession'],
    }),
    event({
        id: 'event.purple.prof.forge_mirror', packId: 'pack.purple.profession', title: 'Huyền Kính Ngọc Luyện Khí', teaser: 'Huyền Kính Ngọc có thể dùng làm vật liệu phản linh lực, nhưng rất dễ nứt khi hỏa hậu quá mạnh.', priority: 78,
        condition: { minRealmOrder: 14, professionMinMastery: { forging: 28 }, requiredResources: { 'resource.mirror_jade': 1 } },
        choices: [
            { id: 'practice', label: 'Thử luyện một khối ngọc', description: 'Tiêu ngọc, tăng mastery Luyện Khí.', resultText: 'Ngươi giữ hỏa hậu thấp hơn bình thường, cuối cùng không làm ngọc nứt.', effects: { resources: { 'resource.mirror_jade': -1, 'resource.forging_essence': 3 }, professionMastery: { forging: 8 } }, significance: 20, tags: ['Forging', 'PurplePalace'] },
        ], tags: ['PurplePalace', 'Profession'],
    }),
    event({
        id: 'event.purple.prof.mirror_formation', packId: 'pack.purple.profession', title: 'Tử Kính Phản Trận', teaser: 'Một trận sư dùng mặt hồ làm nửa trận bàn tự nhiên, giảm đáng kể lượng phù chỉ cần dùng.', priority: 78,
        condition: { locationIds: ['location.purple_mirror_lake'], minRealmOrder: 14, professionMinMastery: { talisman: 28 } },
        choices: [
            { id: 'learn', label: 'Theo dõi cách bố trận', description: 'Tăng Phù/Trận mastery.', resultText: 'Ngươi ghi lại cách mượn mặt hồ phản chiếu trận văn.', effects: { professionMastery: { talisman: 8 }, resources: { 'resource.rune_insight': 5 } }, significance: 20, tags: ['Formation', 'PurplePalace'] },
        ], tags: ['PurplePalace', 'Profession'],
    }),
    event({
        id: 'event.purple.prof.core_fire_rumor', packId: 'pack.purple.profession', title: 'Đan Hỏa Sơn Mở Lò', teaser: 'Đan sư Tử Phủ truyền nhau rằng Đan Hỏa Sơn sắp mở một cổ lô đã tắt nhiều năm.', priority: 82,
        condition: { minRealmOrder: 16, professionMinMastery: { alchemy: 40 } },
        choices: [
            { id: 'go', label: 'Ghi lại đường tới Đan Hỏa Sơn', description: 'Mở location Kim Đan.', resultText: 'Ngươi mua một tấm hỏa mạch đồ, đánh dấu đường từ Vân Hải Thành tới Đan Hỏa Sơn.', effects: { unlockLocationIds: ['location.core_fire_mountain'],}, significance: 19, tags: ['Alchemy', 'Exploration'] },
        ], tags: ['PurplePalace', 'Profession'],
    }),
    event({
        id: 'event.purple.prof.star_iron', packId: 'pack.purple.profession', title: 'Tinh Thần Thiết Thử Lửa', teaser: 'Tinh Thần Thiết cực cứng nhưng phản ứng tốt với kiếm khí hơn hỏa lực thuần.', priority: 79,
        condition: { locationIds: ['location.starfall_cliff'], minRealmOrder: 16, professionMinMastery: { forging: 40 } },
        choices: [
            { id: 'forge', label: 'Thử một phôi nhỏ', description: 'Tăng Luyện Khí mastery và lấy vật liệu.', resultText: 'Ngươi dùng kiếm khí phối hỏa, phôi kim loại cuối cùng mới chịu mềm.', effects: { professionMastery: { forging: 9 }, resources: { 'resource.star_iron': 3 } }, significance: 21, tags: ['Forging', 'Sword'] },
        ], tags: ['PurplePalace', 'Profession'],
    }),
    event({
        id: 'event.purple.prof.palace_stabilizer', packId: 'pack.purple.profession', title: 'Trận Văn Ổn Phủ', teaser: 'Một trận văn nhỏ có thể giảm dao động khi Tử Phủ chuẩn bị nén thành Kim Đan.', priority: 84,
        condition: { minRealmOrder: 17, professionMinMastery: { talisman: 42 }, requiredResources: { 'resource.rune_insight': 2 } },
        choices: [
            { id: 'inscribe', label: 'Khắc trận ổn phủ', description: 'Tăng chuẩn bị Kim Đan.', resultText: 'Ngươi khắc trận quanh động phủ, để mỗi lần vận hành đều ép khí cơ về cùng một tâm.', effects: { professionMastery: { talisman: 7 }, resources: { 'resource.rune_insight': -2 } }, significance: 23, tags: ['Formation', 'Breakthrough'] },
        ], tags: ['PurplePalace', 'Profession', 'Breakthrough'],
    }),
    // Kim Đan core.
    event({
        id: 'event.golden.first_core', packId: 'pack.golden.core', title: 'Kim Đan Sơ Kết', teaser: 'Tử Phủ co lại quanh một viên Kim Đan mới thành; lượng linh lực ít hơn về thể tích nhưng nặng hơn hẳn.', priority: 100,
        condition: { minRealmOrder: 18, maxRealmOrder: 18 },
        choices: [
            { id: 'inspect', label: 'Ổn định Đan văn', description: 'Củng cố Kim Đan.', resultText: 'Ngươi giữ Kim Đan quay chậm trong khí hải, quan sát từng vệt Đan văn hiện lên.', effects: {}, significance: 38, tags: ['GoldenCore', 'Milestone'] },
            { id: 'test', label: 'Dùng Đan lực thử chiến', description: 'Lấy tu vi nhưng hơi tổn mạch.', resultText: 'Ngươi vận Đan lực qua thân thể cũ; uy lực tăng rõ nhưng thân thể phải thích nghi lại.', effects: { tuVi: 1100,}, significance: 28, tags: ['GoldenCore', 'CombatPrep'] },
        ], tags: ['GoldenCore', 'Milestone'],
    }),
    event({
        id: 'event.golden.core_fire_open', packId: 'pack.golden.core', title: 'Cổ Lô Trên Đan Hỏa Sơn', teaser: 'Kim Đan tu sĩ đã đủ sức chịu Đan Hỏa trong cổ lô mà không lập tức cháy thân thể.', priority: 94,
        condition: { locationIds: ['location.core_fire_mountain'], minRealmOrder: 18 },
        choices: [
            { id: 'unlock', label: 'Mở cửa Kim Đan Hỏa Lô', description: 'Mở phó bản Kim Đan.', resultText: 'Ngươi dùng Đan lực kích hoạt cổ văn, cửa lô từ từ mở ra.', effects: { unlockDungeonIds: ['dungeon.golden_core_furnace'], resources: { 'resource.core_fire_crystal': 2 } }, significance: 28, tags: ['GoldenCore', 'DungeonHint'] },
        ], tags: ['GoldenCore', 'Dungeon'],
    }),
    event({
        id: 'event.golden.danxia_meet', packId: 'pack.golden.core', title: 'Đan Hà Chân Nhân', teaser: 'Một Kim Đan đan sư đang kiểm tra địa hỏa, bên cạnh là hàng chục lọ đan không ghi tên.', priority: 84,
        condition: { locationIds: ['location.core_fire_mountain'], minRealmOrder: 18 },
        choices: [
            { id: 'discuss', label: 'Luận Đan Hỏa', description: 'Tạo quan hệ và tăng Luyện Đan.', resultText: 'Đan Hà Chân Nhân không cho đan phương, chỉ hỏi ngươi vì sao một mẻ đan lại cần “thở”.', effects: { professionMastery: { alchemy: 6 }, relationships: [{ npcId: 'npc.danxia_zhenren', trust: 4, respect: 5, karmaDepth: 3 }] }, significance: 22, tags: ['GoldenCore', 'Alchemy', 'Relationship'] },
            { id: 'observe', label: 'Chỉ quan sát hỏa hậu', description: 'Không kết nhân quả sâu.', resultText: 'Ngươi đứng xa quan sát màu Đan Hỏa thay đổi theo từng nhịp.', effects: { professionMastery: { alchemy: 3 } }, significance: 12, tags: ['Alchemy'] },
        ], tags: ['GoldenCore', 'Relationship'],
    }),
    event({
        id: 'event.golden.fire_ape_trial', packId: 'pack.golden.core', title: 'Kim Đan Hỏa Viên Giữ Lô', teaser: 'Một Hỏa Viên đã nuốt Đan Hỏa nhiều năm chiếm tầng giữa cổ lô.', priority: 97,
        condition: { minRealmOrder: 18, requiredDungeonFloors: [{ dungeonId: 'dungeon.golden_core_furnace', minFloor: 1 }] },
        choices: [
            { id: 'fight', label: 'Đấu Hỏa Viên', description: 'Boss Kim Đan; thua được retry.', resultText: 'Hỏa Viên đập ngực, Đan Hỏa quanh người co thành từng vòng.', combat: { entityId: 'entity.boss.golden_core_fire_ape', onWin: { resources: { 'resource.golden_core_essence': 9, 'resource.core_fire_crystal': 3 },}, onLose: { injury: 13 }, completeOnLoss: false }, significance: 44, tags: ['GoldenCore', 'Boss', 'Fire'] },
        ], tags: ['GoldenCore', 'Boss'],
    }),
    event({
        id: 'event.golden.core_pattern', packId: 'pack.golden.core', title: 'Đan Văn Dị Biến', teaser: 'Một đường Đan văn trên Kim Đan đột nhiên sáng khác thường sau nhiều năm vận hành.', priority: 80,
        condition: { minRealmOrder: 19, maxRealmOrder: 21 },
        choices: [
            { id: 'nurture', label: 'Dưỡng Đan văn', description: 'Tăng nền tu hành và chuẩn bị.', resultText: 'Ngươi không cưỡng ép biến đổi, chỉ nuôi Đan văn theo nhịp linh lực tự nhiên.', effects: {}, significance: 23, tags: ['GoldenCore', 'Cultivation'] },
            { id: 'burn', label: 'Cưỡng thúc Đan văn', description: 'Đổi độ ổn định lấy tu vi nhanh.', resultText: 'Ngươi cưỡng ép Đan văn sáng mạnh, khiến khí cơ bùng lên trong thời gian ngắn.', effects: { tuVi: 1200,}, significance: 20, tags: ['GoldenCore', 'Risk'] },
        ], tags: ['GoldenCore', 'Cultivation'],
    }),
    event({
        id: 'event.golden.core_balance', packId: 'pack.golden.core', title: 'Kim Đan Quá Nặng', teaser: 'Khi Đan lực tăng quá nhanh, thân thể cũ bắt đầu có cảm giác không theo kịp.', priority: 78,
        condition: { minRealmOrder: 20, maxRealmOrder: 21 },
        choices: [
            { id: 'slow', label: 'Giảm nhịp tu, dưỡng mạch', description: 'Hồi thân thể và giảm tạp.', resultText: 'Ngươi giảm chu thiên, để thân thể dần thích nghi với chất lượng Đan lực.', effects: {}, significance: 19, tags: ['GoldenCore', 'Meridian'] },
            { id: 'push', label: 'Tiếp tục ép tiến', description: 'Lấy tu vi, chịu thương.', resultText: 'Ngươi không giảm nhịp, Đan lực tiếp tục dâng nhưng mạch lạc đau nhức.', effects: { tuVi: 1500, injury: 3 }, significance: 20, tags: ['GoldenCore', 'Risk'] },
        ], tags: ['GoldenCore', 'Cultivation'],
    }),
    // Kim Đan build / rare content.
    event({
        id: 'event.golden.build.fire_vein', packId: 'pack.golden.builds', title: 'Đan Hỏa Nhập Mạch', teaser: 'Hỏa Linh Căn cảm được địa mạch dưới Đan Hỏa Sơn đang cộng hưởng trực tiếp với Kim Đan.', priority: 90,
        condition: { locationIds: ['location.core_fire_mountain'], minRealmOrder: 18, spiritualRootIds: ['root.fire', 'root.metal_fire'] },
        choices: [
            { id: 'refine', label: 'Dẫn Đan Hỏa nhập thân', description: 'Tăng nền, học Hỏa thuật nếu thiếu.', resultText: 'Ngươi kéo một sợi Đan Hỏa qua Kim Đan, cảm nhận lực bộc phát rõ hơn trước.', effects: { resources: { 'resource.core_fire_crystal': 2 }, learnSkillIds: ['skill.flame_eruption'] }, significance: 25, tags: ['Fire', 'GoldenCore'] },
        ], tags: ['GoldenCore', 'Build'],
    }),
    event({
        id: 'event.golden.build.star_sword', packId: 'pack.golden.builds', title: 'Kiếm Ý Dưới Tinh Hà', teaser: 'Tinh Lạc Nhai về đêm khiến kiếm ý trong Kim Đan rung theo nhịp sao rơi.', priority: 91,
        condition: { locationIds: ['location.starfall_cliff'], minRealmOrder: 18, knownSkillIds: ['skill.sword_pressure'] },
        choices: [
            { id: 'comprehend', label: 'Ngộ một đêm', description: 'Lấy nền tu hành Kiếm và Tinh Thần Thiết.', resultText: 'Ngươi đứng dưới kiếm quang tới sáng, mỗi lần sao rơi lại sửa một nhịp kiếm thế.', effects: { resources: { 'resource.star_iron': 3 }, learnSkillIds: ['skill.triple_chain_sword'] }, significance: 25, tags: ['Sword', 'GoldenCore'] },
        ], tags: ['GoldenCore', 'Build'],
    }),
    event({
        id: 'event.golden.build.thunder_core', packId: 'pack.golden.builds', title: 'Lôi Đan Đồng Chấn', teaser: 'Kim Đan của Lôi Linh Căn bắt đầu kéo sét từ Lôi Minh Cốc mà không cần chủ động dẫn.', priority: 88,
        condition: { locationIds: ['location.thunder_valley'], minRealmOrder: 18, spiritualRootIds: ['root.lightning'] },
        choices: [
            { id: 'temper', label: 'Lấy lôi dưỡng Đan', description: 'Tăng nền và Lôi tài nguyên.', resultText: 'Ngươi để từng đạo lôi nhỏ đánh vào khí cơ quanh Kim Đan rồi tán ra thân thể.', effects: { resources: { 'resource.thunder_essence': 5 },}, significance: 24, tags: ['Lightning', 'GoldenCore'] },
        ], tags: ['GoldenCore', 'Build'],
    }),
    event({
        id: 'event.golden.build.poison_core', packId: 'pack.golden.builds', title: 'Độc Tính Kết Đan', teaser: 'Bách Độc Thể phát hiện Kim Đan có thể giữ độc tính ở lớp ngoài mà không làm ô nhiễm Đan tâm.', priority: 88,
        condition: { locationIds: ['location.purple_mist_marsh'], minRealmOrder: 18, physiqueIds: ['physique.hundred_poison'] },
        choices: [
            { id: 'refine', label: 'Kết độc hoàn quanh Đan', description: 'Lấy độc tài nguyên và nền.', resultText: 'Ngươi giữ Đan tâm sạch, chỉ để độc tính tuần hoàn ở lớp ngoài.', effects: { resources: { 'resource.purple_mist_venom': 6 }, learnSkillIds: ['skill.poison_detonation'] }, significance: 24, tags: ['Poison', 'GoldenCore'] },
        ], tags: ['GoldenCore', 'Build'],
    }),
    event({
        id: 'event.golden.build.purple_golden_artifacts', packId: 'pack.golden.builds', title: 'Tử Kim Đồng Luyện Tàn Đồ', teaser: 'Một tàn đồ nhắc tới hai bảo vật: Tử Phủ Minh Đăng và Kim Đan Hỏa Đỉnh, vốn được luyện thành một cặp.', priority: 83,
        condition: { minRealmOrder: 18, requiredDungeonFloors: [{ dungeonId: 'dungeon.purple_mirror_palace', minFloor: 2 }] },
        choices: [
            { id: 'trace', label: 'Lần theo tàn đồ', description: 'Mở Kim Đan Hỏa Lô và nhận Bảo Khí Tàn Tinh.', resultText: 'Tàn đồ chỉ tới Đan Hỏa Sơn; hai bảo vật có lẽ vẫn còn lưu lại ở hai cổ địa khác nhau.', effects: { unlockLocationIds: ['location.core_fire_mountain'], unlockDungeonIds: ['dungeon.golden_core_furnace'], resources: { 'resource.artifact_dust': 6 } }, significance: 22, tags: ['Artifact', 'HiddenResonance'] },
        ], tags: ['GoldenCore', 'Artifact'],
    }),
    event({
        id: 'event.golden.build.starfall_finale', packId: 'pack.golden.builds', title: 'Tinh Lạc Kiếm Hồn · Toàn Lực', teaser: 'Sau khi bước vào Kim Đan, Kiếm Hồn trên Tinh Lạc Nhai mới thật sự chịu dùng toàn bộ kiếm thế.', priority: 98,
        condition: { locationIds: ['location.starfall_cliff'], minRealmOrder: 19 },
        choices: [
            { id: 'fight', label: 'Đấu toàn lực', description: 'Boss Kim Đan Sword; thua được thử lại.', resultText: 'Tinh Lạc Kiếm Hồn rút toàn bộ kiếm quang trên vách núi về một điểm.', combat: { entityId: 'entity.boss.starfall_sword_ghost', onWin: { resources: { 'resource.star_iron': 7, 'resource.sword_fragment': 8 },}, onLose: { injury: 14 }, completeOnLoss: false, loseText: 'Tinh Hà Đoạn phá thế kiếm của ngươi; Kiếm Hồn vẫn chờ lần tái chiến.' }, significance: 46, tags: ['GoldenCore', 'Boss', 'Sword', 'LegacyCandidate'] },
        ], tags: ['GoldenCore', 'Boss', 'Milestone'],
    }),
];
export const lateContentEvents = Object.fromEntries(lateEventList.map(e => [e.id, e]));
const packMeta = [
    ['pack.late.foundation', 'Trúc Cơ Hậu Kỳ · Hướng Tử Phủ', 'Cầu nối từ Trúc Cơ hậu kỳ/viên mãn sang Tử Phủ.'],
    ['pack.purple.core', 'Tử Phủ · Nội Cảnh Sơ Thành', 'Nội dung lõi Tử Phủ, Tử Kính Hồ và Huyền Cung.'],
    ['pack.purple.sect', 'Thanh Hư · Tử Phủ', 'Nhiệm vụ và truyền thừa tông môn dành cho tu sĩ Tử Phủ.'],
    ['pack.purple.wanderer', 'Tán Tu · Tử Phủ', 'Động phủ, giao dịch và thử thách riêng của Tử Phủ tán tu.'],
    ['pack.purple.profession', 'Bách Nghệ · Tử Phủ', 'Luyện Đan/Luyện Khí/Phù-Trận khi thần niệm đã bước vào Tử Phủ.'],
    ['pack.golden.core', 'Kim Đan · Đan Văn Sơ Thành', 'Nội dung lõi Kim Đan và Đan Hỏa Sơn.'],
    ['pack.golden.builds', 'Kim Đan · Cơ Duyên Theo Build', 'Cơ duyên Lôi/Hỏa/Kiếm/Độc và bảo vật liên quan Kim Đan.'],
];
export const lateContentPacks = Object.fromEntries(packMeta.map(([id, name, description]) => [id, {
        id, name, description, eventIds: lateEventList.filter(e => e.packId === id).map(e => e.id),
    }]));
//# sourceMappingURL=late-content-pack.js.map