const event = (definition) => definition;
export const earlyGameContentEvents = Object.fromEntries([
    // Thanh Hà / neutral opening pack
    event({
        id: 'event.early.meridian_test', packId: 'pack.early.thanh_ha', title: 'Thử Mạch Dưới Mưa', teaser: 'Một trận linh vũ bất chợt khiến thân thể nóng lên; Tần Thủ Nhất bảo đây là lúc tốt để thử vận khí.', priority: 95,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_ha_town'], requiredBeatIds: ['first.awakening'], maxRealmOrder: 0, forbiddenCompletedEventIds: ['event.early.meridian_test'] },
        choices: [
            { id: 'steady', label: 'Dẫn khí chậm, giữ mạch ổn', description: 'Ít lợi tức hơn nhưng an toàn.', resultText: 'Ngươi dẫn từng sợi linh khí đi qua thân thể, nền móng tuy chậm mà chắc.', effects: { tuVi: 45, relationships: [{ npcId: 'npc.qin_shouyi', respect: 2, karmaDepth: 1 }] }, significance: 20, tags: ['Cultivation', 'Safe'] },
            { id: 'force', label: 'Mượn linh vũ cưỡng dẫn', description: 'Nhanh hơn nhưng dễ tổn mạch.', resultText: 'Ngươi cưỡng kéo linh khí vào thân; tu vi tăng nhanh nhưng thân thể đau rát.', effects: { tuVi: 85, injury: 5, relationships: [{ npcId: 'npc.qin_shouyi', respect: 4, grudge: 0, karmaDepth: 1 }] }, significance: 16, tags: ['Cultivation', 'Risk'] },
        ], tags: ['FirstLife', 'ThanhHa'],
    }),
    event({
        id: 'event.early.riverside_tracks', packId: 'pack.early.thanh_ha', title: 'Dấu Chân Bên Bờ Sông', teaser: 'Dấu vuốt yêu thú xuất hiện gần bờ sông; dân trấn chưa ai dám lần theo.', priority: 82,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_ha_town'], minRealmOrder: 1, maxRealmOrder: 3 },
        choices: [
            { id: 'track', label: 'Lần theo dấu vết', description: 'Có thể dẫn tới Hắc Phong Lâm.', resultText: 'Ngươi lần theo dấu vuốt tới mé rừng, ghi lại một lối săn an toàn hơn.', effects: { unlockLocationIds: ['location.black_wind_forest'], resources: { 'resource.spirit_stone': 3 } }, significance: 15, tags: ['Exploration'] },
            { id: 'warn', label: 'Báo người trong trấn', description: 'Không mạo hiểm, đổi lấy thiện cảm.', resultText: 'Ngươi báo lại dấu vết cho người trong trấn, tránh được một trận yêu thú tập kích nhỏ.', effects: { relationships: [{ npcId: 'npc.qin_shouyi', trust: 3, respect: 2, karmaDepth: 1 }] }, significance: 12, tags: ['Relationship'] },
        ], tags: ['FirstLife', 'ThanhHa'],
    }),
    event({
        id: 'event.early.old_map', packId: 'pack.early.thanh_ha', title: 'Tấm Địa Đồ Cháy Xém', teaser: 'Một lão lái đò bán tấm địa đồ cũ, trên đó đánh dấu đường tắt tới Bách Thảo Phường.', priority: 70,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_ha_town'], minRealmOrder: 1, requiredResources: { 'resource.spirit_stone': 4 } },
        choices: [
            { id: 'buy', label: 'Mua với 4 Linh Thạch', description: 'Mở sớm đầu mối Bách Thảo Phường.', resultText: 'Tấm bản đồ tuy cũ nhưng đường núi ghi khá chuẩn; Bách Thảo Phường được đánh dấu vào địa đồ.', effects: { resources: { 'resource.spirit_stone': -4 }, unlockLocationIds: ['location.herb_market'] }, significance: 13, tags: ['Exploration', 'Economy'] },
            { id: 'decline', label: 'Không mua', description: 'Giữ tài nguyên cho tu luyện.', resultText: 'Ngươi cất linh thạch lại; tấm địa đồ theo một thương nhân khác rời trấn.', significance: 5, tags: ['Choice'] },
        ], tags: ['FirstLife', 'ThanhHa'],
    }),
    event({
        id: 'event.early.mountain_spirit_rain', packId: 'pack.early.thanh_ha', title: 'Thanh Sơn Linh Vũ', teaser: 'Mây linh khí tụ trên Thanh Hư Sơn, cỏ cây đồng loạt ánh lên linh quang.', priority: 76,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_mountain'], minRealmOrder: 1, maxWorldYear: 35 },
        choices: [
            { id: 'cultivate', label: 'Ngồi xuống hấp thu', description: 'Tận dụng linh vũ để tu hành.', resultText: 'Ngươi ngồi giữa linh vũ, linh lực trong đan điền đầy lên một đoạn rõ rệt.', effects: { tuVi: 120 }, significance: 15, tags: ['Cultivation'] },
            { id: 'gather', label: 'Thu linh thảo sau mưa', description: 'Đổi cơ hội tu luyện lấy tài nguyên.', resultText: 'Sau trận mưa, Thanh Linh Thảo mọc dày trên sườn núi; ngươi thu được một mẻ tốt.', effects: { resources: { 'resource.qingling_herb': 7 } }, significance: 13, tags: ['Resource'] },
        ], tags: ['FirstLife', 'Mountain'],
    }),
    event({
        id: 'event.early.herb_market_apprentice', packId: 'pack.early.thanh_ha', title: 'Mùi Thuốc Cháy Ở Bách Thảo Phường', teaser: 'Một lò đan nhỏ nổ tung; Hàn Mộc Sinh đang thiếu người nhặt lại dược liệu.', priority: 68,
        condition: { lifeNumbers: [1], locationIds: ['location.herb_market'], minRealmOrder: 1 },
        choices: [
            { id: 'help', label: 'Ở lại phụ một tay', description: 'Kết duyên với Hàn Mộc Sinh.', resultText: 'Ngươi giúp Hàn Mộc Sinh thu dọn lò thuốc, tiện thể nghe được vài nguyên lý luyện đan căn bản.', effects: { resources: { 'resource.spirit_herb': 6 }, relationships: [{ npcId: 'npc.han_musheng', trust: 7, debt: 4, karmaDepth: 4 }] }, significance: 16, tags: ['Alchemy', 'Relationship'] },
            { id: 'salvage', label: 'Chỉ lấy dược liệu bỏ đi', description: 'Ít nhân quả, nhiều nguyên liệu.', resultText: 'Ngươi lựa ra những phần dược tính còn dùng được từ đống lò vỡ.', effects: { resources: { 'resource.qingling_herb': 5, 'resource.spirit_herb': 4 } }, significance: 11, tags: ['Alchemy', 'Resource'] },
        ], tags: ['FirstLife', 'Alchemy'],
    }),
    event({
        id: 'event.early.cloud_city_rumor', packId: 'pack.early.thanh_ha', title: 'Tin Đồn Từ Vân Hải Thành', teaser: 'Một thương đội nói về Tàn Bảo Các vừa lộ ra dấu vết phía bắc.', priority: 63,
        condition: { lifeNumbers: [1], locationIds: ['location.cloud_sea_city'], minRealmOrder: 2 },
        choices: [
            { id: 'buy_rumor', label: 'Mời thương nhân một chầu', description: 'Mất ít linh thạch để lấy tọa độ.', resultText: 'Sau một chầu rượu, thương nhân vẽ lại hướng tới Tàn Bảo Các lên địa đồ của ngươi.', effects: { resources: { 'resource.spirit_stone': -5 }, unlockDungeonIds: ['dungeon.ruined_treasure_pavilion'] }, significance: 15, tags: ['DungeonHint', 'Economy'] },
            { id: 'remember', label: 'Chỉ ghi nhớ tin đồn', description: 'Không tốn tiền, chưa mở phó bản.', resultText: 'Ngươi ghi lại vài địa danh mơ hồ, chờ sau này kiểm chứng.', significance: 7, tags: ['Rumor'] },
        ], tags: ['FirstLife', 'City'],
    }),
    // Sect path pack
    event({
        id: 'event.sect.outer_gate_test', packId: 'pack.early.sect', title: 'Ngoại Môn Thí Kiếm', teaser: 'Ngoại môn tổ chức một vòng thí kiếm nhỏ; Lạc Thanh Dao đứng ngoài trận quan sát.', priority: 92,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect'], paths: ['sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 1 },
        choices: [
            { id: 'enter', label: 'Đăng ký thí kiếm', description: 'Đánh Hắc Phong Lang Vương mô phỏng.', resultText: 'Ngươi bước vào thí kiếm trận.', combat: { entityId: 'entity.elite.black_wind_wolf_king', onWin: { learnSkillIds: ['skill.triple_chain_sword'], relationships: [{ npcId: 'npc.luo_qingyao', respect: 6, karmaDepth: 2 }] }, onLose: { injury: 5, relationships: [{ npcId: 'npc.luo_qingyao', respect: 1 }] }, loseText: 'Ngươi bị ép rời trận, nhưng vẫn nhìn ra vài sơ hở trong kiếm lộ.' }, significance: 24, tags: ['Sect', 'Combat', 'Sword'] },
            { id: 'watch', label: 'Đứng ngoài quan sát', description: 'Không mạo hiểm, học chút kinh nghiệm.', resultText: 'Ngươi quan sát nhiều trận liên tiếp, ghi nhớ cách ngoại môn đệ tử điều chỉnh khoảng cách.', effects: { relationships: [{ npcId: 'npc.luo_qingyao', respect: 2 }] }, significance: 10, tags: ['Sect', 'Study'] },
        ], tags: ['FirstLife', 'Sect'],
    }),
    event({
        id: 'event.sect.archive_choice', packId: 'pack.early.sect', title: 'Một Ngày Trong Tàng Kinh Các', teaser: 'Ngươi được phép chọn một phần kiếm quyết hoặc hộ thân thuật để tham khảo.', priority: 86,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect'], paths: ['sect'], requiredCompletedEventIds: ['event.sect.outer_gate_test'] },
        choices: [
            { id: 'sword', label: 'Chọn Kiếm Bộ', description: 'Học kỹ năng cơ động Kiếm Bộ.', resultText: 'Ngươi chọn một thiên thân pháp phối kiếm, luyện thành Kiếm Bộ.', effects: { learnSkillIds: ['skill.sword_step'] }, significance: 18, tags: ['Sword', 'Inheritance'] },
            { id: 'guard', label: 'Chọn Hộ Thân Chú', description: 'Học một thủ đoạn phòng thân.', resultText: 'Ngươi chọn bản Hộ Thân Chú, bổ sung một lớp phòng ngự ổn định cho build.', effects: { learnSkillIds: ['skill.protective_charm'] }, significance: 18, tags: ['Defense', 'Inheritance'] },
        ], tags: ['FirstLife', 'Sect', 'Inheritance'],
    }),
    event({
        id: 'event.sect.mo_changfeng_argument', packId: 'pack.early.sect', title: 'Mặc Trường Phong Chặn Đường', teaser: 'Mặc Trường Phong cho rằng tân đệ tử chỉ gặp may ở Tụ Linh Động.', priority: 80,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect'], paths: ['sect'], minRealmOrder: 2 },
        choices: [
            { id: 'debate', label: 'Luận kiếm thay vì động thủ', description: 'Tranh bằng lý và kiếm ý.', resultText: 'Hai người tranh luận kiếm thế hồi lâu; bất đồng vẫn còn nhưng đối phương không còn xem thường ngươi.', effects: { relationships: [{ npcId: 'npc.mo_changfeng', respect: 7, grudge: 2, karmaDepth: 4 }] }, significance: 16, tags: ['Relationship', 'DaoDiscussion'] },
            { id: 'provoke', label: 'Đáp lại thẳng mặt', description: 'Kết oán nhanh hơn.', resultText: 'Ngươi không nhường nửa bước. Mặc Trường Phong cười lạnh, đoạn oán duyên từ đây rõ rệt hơn.', effects: { relationships: [{ npcId: 'npc.mo_changfeng', respect: 4, grudge: 12, karmaDepth: 6 }] }, significance: 17, tags: ['Relationship', 'Rivalry'] },
        ], tags: ['FirstLife', 'Sect', 'Rivalry'],
    }),
    event({
        id: 'event.sect.pill_hall_errand', packId: 'pack.early.sect', title: 'Đan Điện Thiếu Dược', teaser: 'Đan Điện cần gấp một mẻ Tụ Linh Thảo; đệ tử được phép lĩnh công sau khi giao đủ.', priority: 66,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect'], paths: ['sect'], requiredResources: { 'resource.spirit_herb': 8 } },
        choices: [
            { id: 'deliver', label: 'Giao 8 Tụ Linh Thảo', description: 'Đổi nguyên liệu lấy tài nguyên tinh luyện.', resultText: 'Đan Điện nhận đủ dược liệu và trả lại một phần Dược Tính Tinh Hoa.', effects: { resources: { 'resource.spirit_herb': -8, 'resource.alchemy_essence': 4, 'resource.spirit_stone': 4 } }, significance: 13, tags: ['Sect', 'Alchemy'] },
            { id: 'keep', label: 'Giữ lại tự dùng', description: 'Không đổi tài nguyên.', resultText: 'Ngươi quyết định giữ dược liệu cho kế hoạch riêng.', significance: 5, tags: ['Choice'] },
        ], tags: ['FirstLife', 'Sect', 'Profession'],
    }),
    event({
        id: 'event.sect.sword_wall_echo', packId: 'pack.early.sect', title: 'Kiếm Bích Lưu Ngân', teaser: 'Đêm xuống, Thanh Hư Kiếm Bích lưu lại một đạo kiếm ngân chưa tan.', priority: 74,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect'], paths: ['sect'], minRealmOrder: 3 },
        choices: [
            { id: 'comprehend', label: 'Ngồi trước kiếm bích lĩnh ngộ', description: 'Có cơ hội học Kiếm Thế.', resultText: 'Ngươi ngồi tới bình minh, cuối cùng nắm được một tia “thế” trong kiếm.', effects: { learnSkillIds: ['skill.sword_pressure'],}, significance: 20, tags: ['Sword', 'Insight'] },
            { id: 'record', label: 'Chép lại kiếm ngân', description: 'Đổi lĩnh ngộ trực tiếp lấy đầu mối lâu dài.', resultText: 'Ngươi chép lại đường kiếm, giữ làm tư liệu cho ngày sau.', effects: { resources: { 'resource.sword_fragment': 2 } }, significance: 11, tags: ['Sword', 'Resource'] },
        ], tags: ['FirstLife', 'Sect', 'Sword'],
    }),
    event({
        id: 'event.sect.luo_patrol', packId: 'pack.early.sect', title: 'Tuần Sơn Cùng Lạc Thanh Dao', teaser: 'Lạc Thanh Dao thiếu một người đi cùng trong chuyến tuần sơn ngắn.', priority: 72,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect'], paths: ['sect'], relation: { npcId: 'npc.luo_qingyao', minRespect: 3, maxGrudge: 10 } },
        choices: [
            { id: 'join', label: 'Nhận lời tuần sơn', description: 'Tăng quan hệ và có thể gặp yêu thú.', resultText: 'Ngươi cùng Lạc Thanh Dao tuần qua sơn môn, phối hợp xử lý một đám yêu thú lạc đàn.', effects: { relationships: [{ npcId: 'npc.luo_qingyao', trust: 6, respect: 4, karmaDepth: 5 }], resources: { 'resource.spirit_stone': 5 } }, significance: 18, tags: ['Relationship', 'Sect'] },
            { id: 'decline', label: 'Từ chối để bế quan', description: 'Không mất gì, không tăng quan hệ.', resultText: 'Ngươi xin phép ở lại bế quan; Lạc Thanh Dao cũng không để tâm.', significance: 4, tags: ['Choice'] },
        ], tags: ['FirstLife', 'Sect', 'Relationship'],
    }),
    // Wanderer path pack
    event({
        id: 'event.wanderer.rain_shelter', packId: 'pack.early.wanderer', title: 'Trú Mưa Cùng Hàn Mộc Sinh', teaser: 'Một trận mưa linh khí kéo tới; dưới mái lều cũ có Hàn Mộc Sinh đang hong dược.', priority: 86,
        condition: { lifeNumbers: [1], locationIds: ['location.herb_market', 'location.spirit_field_plain'], paths: ['wanderer'] },
        choices: [
            { id: 'talk', label: 'Ngồi lại nói chuyện', description: 'Kết một đoạn thiện duyên.', resultText: 'Hai người nói từ linh dược tới đường tu; Hàn Mộc Sinh đưa ngươi vài cây thuốc còn mới.', effects: { resources: { 'resource.spirit_herb': 5 }, relationships: [{ npcId: 'npc.han_musheng', trust: 8, karmaDepth: 5 }] }, significance: 17, tags: ['Relationship', 'Alchemy'] },
            { id: 'trade', label: 'Đổi linh thạch lấy thuốc', description: 'Ít nhân quả, lời về tài nguyên.', resultText: 'Ngươi mua một mẻ dược liệu giá tốt rồi rời đi trước khi mưa tạnh.', effects: { resources: { 'resource.spirit_stone': -4, 'resource.qingling_herb': 6 } }, significance: 11, tags: ['Economy', 'Resource'] },
        ], tags: ['FirstLife', 'Wanderer'],
    }),
    event({
        id: 'event.wanderer.sword_scratch', packId: 'pack.early.wanderer', title: 'Một Vết Kiếm Trên Vách Động', teaser: 'Cổ Kiếm Động có một vết chém không hợp với những kiếm ngân còn lại.', priority: 91,
        condition: { lifeNumbers: [1], locationIds: ['location.ancient_sword_cave'], paths: ['wanderer'], minRealmOrder: 1 },
        choices: [
            { id: 'trace', label: 'Lần theo vết kiếm', description: 'Học Kiếm Bộ từ quỹ tích sót lại.', resultText: 'Ngươi dùng ngón tay lần theo vết kiếm, vô tình hiểu ra cách chuyển bộ theo kiếm thế.', effects: { learnSkillIds: ['skill.sword_step'], resources: { 'resource.sword_fragment': 1 } }, significance: 21, tags: ['Sword', 'Inheritance'] },
            { id: 'chip', label: 'Cạy lấy mảnh đá kiếm ý', description: 'Lấy tài nguyên thay vì lĩnh ngộ.', resultText: 'Ngươi lấy được vài mảnh đá lưu kiếm ý, thích hợp luyện khí về sau.', effects: { resources: { 'resource.sword_fragment': 4 } }, significance: 13, tags: ['Sword', 'Resource'] },
        ], tags: ['FirstLife', 'Wanderer', 'Sword'],
    }),
    event({
        id: 'event.wanderer.black_wind_ambush', packId: 'pack.early.wanderer', title: 'Hắc Phong Lang Vương Phục Kích', teaser: 'Gió đen im bặt; một con Lang Vương chặn đường về.', priority: 88,
        condition: { lifeNumbers: [1], locationIds: ['location.black_wind_forest'], paths: ['wanderer'], minRealmOrder: 2 },
        choices: [
            { id: 'fight', label: 'Rút kiếm nghênh chiến', description: 'Một trận elite thật.', resultText: 'Ngươi chủ động ép Lang Vương vào khoảng trống giữa hai cây cổ thụ.', combat: { entityId: 'entity.elite.black_wind_wolf_king', onWin: { resources: { 'resource.spirit_stone': 8, 'resource.wind_leaf': 5 }, relationships: [{ npcId: 'npc.bai_ling', respect: 3, karmaDepth: 2 }] }, onLose: { injury: 10 }, loseText: 'Ngươi thoát khỏi Hắc Phong Lâm với thương thế không nhẹ.' }, significance: 24, tags: ['Combat', 'Elite'] },
            { id: 'retreat', label: 'Rút lui theo khe núi', description: 'Tránh trận đánh, bị thương nhẹ.', resultText: 'Ngươi bỏ lại một phần hành lý để thoát khỏi đàn sói.', effects: { injury: 3, resources: { 'resource.spirit_stone': -2 } }, significance: 9, tags: ['Risk'] },
        ], tags: ['FirstLife', 'Wanderer', 'Combat'],
    }),
    event({
        id: 'event.wanderer.thunder_resonance', packId: 'pack.early.wanderer', title: 'Lôi Văn Trên Vách Cốc', teaser: 'Một đạo lôi văn cổ chỉ sáng lên khi ngươi tới gần.', priority: 82,
        condition: { lifeNumbers: [1], locationIds: ['location.thunder_valley'], paths: ['wanderer'], minRealmOrder: 3, spiritualRootIds: ['root.lightning'] },
        choices: [
            { id: 'touch', label: 'Đưa tay chạm lôi văn', description: 'Nguy hiểm nhưng hợp Lôi Linh Căn.', resultText: 'Lôi văn nhập vào thần thức; ngươi hiểu thêm cách dẫn lôi tụ ấn.', effects: { learnSkillIds: ['skill.guide_thunder'], tuVi: 90, injury: 4 }, significance: 22, tags: ['Lightning', 'Insight'] },
            { id: 'copy', label: 'Chỉ sao chép trận văn', description: 'An toàn hơn, lấy vật liệu.', resultText: 'Ngươi không chạm trực tiếp mà sao lại kết cấu lôi văn để nghiên cứu sau.', effects: { resources: { 'resource.thunder_iron': 4 } }, significance: 13, tags: ['Lightning', 'Resource'] },
        ], tags: ['FirstLife', 'Wanderer', 'Lightning'],
    }),
    event({
        id: 'event.wanderer.ruined_pavilion_whisper', packId: 'pack.early.wanderer', title: 'Tiếng Chuông Trong Tàn Tích', teaser: 'Đêm ở Cổ Kiếm Động vang lên tiếng chuông không rõ nguồn; nó chỉ về phía một tàn các.', priority: 75,
        condition: { lifeNumbers: [1], locationIds: ['location.ancient_sword_cave'], paths: ['wanderer'], minRealmOrder: 3, requiredCompletedEventIds: ['event.wanderer.sword_scratch'] },
        choices: [
            { id: 'follow', label: 'Đi theo tiếng chuông', description: 'Mở Tàn Bảo Các.', resultText: 'Ngươi lần theo âm thanh tới một mảnh địa đồ cũ, xác nhận vị trí Tàn Bảo Các.', effects: { unlockDungeonIds: ['dungeon.ruined_treasure_pavilion'] }, significance: 18, tags: ['Artifact', 'DungeonHint'] },
            { id: 'ignore', label: 'Không đuổi theo dị âm', description: 'Giữ an toàn.', resultText: 'Ngươi không truy theo tiếng chuông; tới sáng, dị âm hoàn toàn biến mất.', significance: 6, tags: ['Choice'] },
        ], tags: ['FirstLife', 'Wanderer', 'Artifact'],
    }),
    event({
        id: 'event.wanderer.bai_ling_trade', packId: 'pack.early.wanderer', title: 'Bạch Hồ Đổi Vật', teaser: 'Bạch Linh chặn đường, đặt xuống vài Phong Linh Diệp rồi nhìn túi linh thạch của ngươi.', priority: 64,
        condition: { lifeNumbers: [1], locationIds: ['location.black_wind_forest'], paths: ['wanderer'], requiredResources: { 'resource.spirit_stone': 6 } },
        choices: [
            { id: 'fair', label: 'Đổi 6 Linh Thạch', description: 'Giao dịch công bằng.', resultText: 'Bạch Linh đẩy mấy chiếc lá sang rồi biến vào rừng; mối quan hệ không tệ.', effects: { resources: { 'resource.spirit_stone': -6, 'resource.wind_leaf': 8 }, relationships: [{ npcId: 'npc.bai_ling', trust: 4, respect: 2, karmaDepth: 3 }] }, significance: 13, tags: ['Economy', 'Relationship'] },
            { id: 'haggle', label: 'Ép giá', description: 'Lời hơn nhưng dễ kết oán.', resultText: 'Ngươi ép xuống còn bốn linh thạch. Bạch Linh nhận nhưng ánh mắt rõ ràng khó chịu.', effects: { resources: { 'resource.spirit_stone': -4, 'resource.wind_leaf': 8 }, relationships: [{ npcId: 'npc.bai_ling', grudge: 5, respect: 1, karmaDepth: 2 }] }, significance: 12, tags: ['Economy', 'Rivalry'] },
        ], tags: ['FirstLife', 'Wanderer'],
    }),
    // Build-sensitive / shared milestone pack
    event({
        id: 'event.build.lightning_overload', packId: 'pack.early.builds', title: 'Lôi Cốt Quá Tải', teaser: 'Lôi khí trong xương cộng hưởng quá mức, từng khớp xương phát sáng.', priority: 79,
        condition: { lifeNumbers: [1], minRealmOrder: 2, physiqueIds: ['physique.thunder_bones'], locationIds: ['location.thunder_valley'] },
        choices: [
            { id: 'vent', label: 'Dẫn lôi ra ngoài', description: 'Giảm rủi ro, lấy chút lôi tinh.', resultText: 'Ngươi dẫn phần lôi lực dư xuống đất, kết thành vài mảnh Lôi Văn Thiết.', effects: { resources: { 'resource.thunder_iron': 5 }, injury: -3 }, significance: 14, tags: ['Physique', 'Lightning'] },
            { id: 'temper', label: 'Dùng lôi lực luyện cốt', description: 'Mạo hiểm đổi lấy nền tảng.', resultText: 'Ngươi khóa lôi lực vào xương, chịu đau để tôi luyện thân thể.', effects: { injury: 8, tuVi: 55 }, significance: 20, tags: ['Physique', 'Risk'] },
        ], tags: ['FirstLife', 'BuildEvent'],
    }),
    event({
        id: 'event.build.sword_bone_echo', packId: 'pack.early.builds', title: 'Kiếm Cốt Cộng Minh', teaser: 'Tàn Kiếm Phiến trong túi đồng loạt rung lên khi ngươi vận kiếm.', priority: 78,
        condition: { lifeNumbers: [1], minRealmOrder: 2, physiqueIds: ['physique.sword_bone'], requiredResources: { 'resource.sword_fragment': 1 } },
        choices: [
            { id: 'merge', label: 'Dung kiếm ý vào cốt', description: 'Tiêu mảnh kiếm để tăng nền tảng.', resultText: 'Một phần kiếm ý hòa vào xương, kiếm thế của ngươi ổn định hơn.', effects: { resources: { 'resource.sword_fragment': -1 }, learnSkillIds: ['skill.sword_pressure'] }, significance: 21, tags: ['Physique', 'Sword'] },
            { id: 'keep', label: 'Giữ mảnh kiếm làm vật liệu', description: 'Không thay đổi build.', resultText: 'Ngươi ép cộng minh xuống, giữ Tàn Kiếm Phiến cho luyện khí sau này.', significance: 7, tags: ['Choice'] },
        ], tags: ['FirstLife', 'BuildEvent'],
    }),
    event({
        id: 'event.build.fire_furnace', packId: 'pack.early.builds', title: 'Dương Hỏa Trong Đan Điền', teaser: 'Hỏa Linh Căn bỗng cộng hưởng với địa hỏa dưới Bách Thảo Phường.', priority: 76,
        condition: { lifeNumbers: [1], minRealmOrder: 2, spiritualRootIds: ['root.fire', 'root.metal_fire'], locationIds: ['location.herb_market'] },
        choices: [
            { id: 'learn', label: 'Mượn địa hỏa luyện thuật', description: 'Lĩnh ngộ Hỏa Cầu Thuật.', resultText: 'Ngươi thử nhiều lần tới khi hỏa khí tụ thành một cầu lửa ổn định.', effects: { learnSkillIds: ['skill.firebolt'], tuVi: 50 }, significance: 18, tags: ['Fire', 'Skill'] },
            { id: 'refine', label: 'Dùng địa hỏa tinh luyện dược liệu', description: 'Lấy nguyên liệu nghề.', resultText: 'Ngươi dùng địa hỏa tinh luyện một mẻ linh thảo thành dược tính tinh hoa.', effects: { resources: { 'resource.alchemy_essence': 5 } }, significance: 13, tags: ['Fire', 'Alchemy'] },
        ], tags: ['FirstLife', 'BuildEvent'],
    }),
    event({
        id: 'event.build.wind_cliff', packId: 'pack.early.builds', title: 'Phong Nhai Thử Bộ', teaser: 'Một vách đá gió xiết là nơi thích hợp thử thân pháp.', priority: 72,
        condition: { lifeNumbers: [1], minRealmOrder: 2, spiritualRootIds: ['root.wind'], locationIds: ['location.thanh_hu_mountain', 'location.black_wind_forest'] },
        choices: [
            { id: 'step', label: 'Đi ngược chiều gió', description: 'Lĩnh ngộ Phong Ảnh Bộ.', resultText: 'Sau nhiều lần trượt chân, ngươi bắt đầu biết mượn chính luồng gió để đổi vị trí.', effects: { learnSkillIds: ['skill.phantom_wind_step'], injury: 2 }, significance: 18, tags: ['Wind', 'Movement'] },
            { id: 'blade', label: 'Chém gió luyện kiếm', description: 'Lĩnh ngộ Tật Phong Trảm.', resultText: 'Ngươi dùng kiếm chém theo nhịp gió, dần hình thành một thức kiếm cực nhanh.', effects: { learnSkillIds: ['skill.gale_slash'] }, significance: 18, tags: ['Wind', 'Sword'] },
        ], tags: ['FirstLife', 'BuildEvent'],
    }),
    // Shared early milestone boss
    event({
        id: 'event.milestone.demon_bear', packId: 'pack.early.milestone', title: 'Thiết Bì Yêu Hùng Xuống Núi', teaser: 'Một con Thiết Bì Yêu Hùng chiếm lối giao giữa Thanh Hư Sơn và Hắc Phong Lâm; thương đội đã ngừng qua lại.', priority: 99,
        condition: { lifeNumbers: [1], minRealmOrder: 4, requiredCompletedEventIds: ['event.early.riverside_tracks'], forbiddenCompletedEventIds: ['event.milestone.demon_bear'] },
        choices: [
            { id: 'challenge', label: 'Tự mình trừ yêu', description: 'Boss milestone đầu đời; dùng build thật.', resultText: 'Ngươi tìm tới khe núi nơi Yêu Hùng chiếm giữ.', combat: { entityId: 'entity.elite.iron_hide_demon_bear', onWin: { resources: { 'resource.spirit_stone': 18, 'resource.forging_essence': 6 }, unlockDungeonIds: ['dungeon.black_iron_mine'] }, onLose: { injury: 16 }, completeOnLoss: false, loseText: 'Thiết Bì Yêu Hùng ép ngươi lui khỏi khe núi; thương thế đủ để nhớ lần sau phải chuẩn bị kỹ hơn.' }, significance: 36, tags: ['BossMilestone', 'Combat', 'LegacyCandidate'] },
            { id: 'avoid', label: 'Đi đường vòng', description: 'Không phải mọi đời đều cần đánh boss này.', resultText: 'Ngươi chọn vòng qua đường núi khác; Yêu Hùng tiếp tục chiếm khe núi thêm một thời gian.', significance: 8, tags: ['Choice'] },
        ], tags: ['FirstLife', 'Milestone', 'Boss'],
    }),
].map(item => [item.id, item]));
export const earlyGameContentPacks = {
    'pack.early.thanh_ha': { id: 'pack.early.thanh_ha', name: 'Thanh Hà Sơ Lộ', description: 'Sự kiện trung lập quanh Thanh Hà Trấn, Thanh Hư Sơn và các phường thị.', eventIds: Object.values(earlyGameContentEvents).filter(e => e.packId === 'pack.early.thanh_ha').map(e => e.id) },
    'pack.early.sect': { id: 'pack.early.sect', name: 'Thanh Hư Ngoại Môn', description: 'Nội dung dành cho đường bái nhập Thanh Hư Tông.', eventIds: Object.values(earlyGameContentEvents).filter(e => e.packId === 'pack.early.sect').map(e => e.id) },
    'pack.early.wanderer': { id: 'pack.early.wanderer', name: 'Tán Tu Sơ Lộ', description: 'Nội dung dành cho người giữ thân tán tu.', eventIds: Object.values(earlyGameContentEvents).filter(e => e.packId === 'pack.early.wanderer').map(e => e.id) },
    'pack.early.builds': { id: 'pack.early.builds', name: 'Cơ Duyên Theo Build', description: 'Sự kiện phản ứng với Linh Căn/Thể Chất và hướng build hiện tại.', eventIds: Object.values(earlyGameContentEvents).filter(e => e.packId === 'pack.early.builds').map(e => e.id) },
    'pack.early.milestone': { id: 'pack.early.milestone', name: 'Đại Sự Đời Đầu', description: 'Boss và cột mốc chiến đấu đáng nhớ.', eventIds: Object.values(earlyGameContentEvents).filter(e => e.packId === 'pack.early.milestone').map(e => e.id) },
};
//# sourceMappingURL=early-content-pack.js.map