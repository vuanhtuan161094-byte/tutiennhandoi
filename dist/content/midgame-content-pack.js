const event = (definition) => definition;
const midgameEventList = [
    // Luyện Khí trung/hậu kỳ — neutral world pack
    event({
        id: 'event.mid.qi.cloud_hunter_board', packId: 'pack.mid.qi', title: 'Bảng Treo Thưởng Vân Hải', teaser: 'Vân Hải Thành treo thưởng một đàn yêu thú quấy tuyến thương lộ.', priority: 82,
        condition: { lifeNumbers: [1], locationIds: ['location.cloud_sea_city'], minRealmOrder: 4, maxRealmOrder: 9 },
        choices: [
            { id: 'hunt', label: 'Nhận bảng treo thưởng', description: 'Đánh Hắc Phong Lang Vương bằng build hiện tại.', resultText: 'Ngươi nhận lệnh bài săn yêu và đi tới mé rừng.', combat: { entityId: 'entity.elite.black_wind_wolf_king', onWin: { resources: { 'resource.spirit_stone': 16, 'resource.beast_essence': 4 }, unlockLocationIds: ['location.spirit_field_plain'] }, onLose: { injury: 7 }, completeOnLoss: false, loseText: 'Lang Vương ép ngươi rút lui; bảng treo thưởng vẫn còn hiệu lực.' }, significance: 24, tags: ['Combat', 'Bounty'] },
            { id: 'intel', label: 'Chỉ mua tin tức', description: 'Không giao chiến, mở đường tới Linh Điền.', resultText: 'Ngươi đổi vài chén trà lấy bản đồ tuyến thương lộ phía nam.', effects: { unlockLocationIds: ['location.spirit_field_plain'] }, significance: 10, tags: ['Exploration'] },
        ], tags: ['MidQi', 'Neutral'],
    }),
    event({
        id: 'event.mid.qi.thunder_harvest', packId: 'pack.mid.qi', title: 'Lôi Triều Hạ Cốc', teaser: 'Lôi Minh Cốc xuất hiện một đợt lôi triều ngắn; Lôi Tủy bám trên vách đá.', priority: 86,
        condition: { lifeNumbers: [1], locationIds: ['location.thunder_valley'], minRealmOrder: 5, maxRealmOrder: 10 },
        choices: [
            { id: 'harvest', label: 'Thu Lôi Tủy', description: 'Lấy tài nguyên hiếm, chịu chút áp lực thân thể.', resultText: 'Ngươi men theo vách cốc, thu được Lôi Tủy Dịch trước khi lôi triều tan.', effects: { resources: { 'resource.thunder_essence': 3, 'resource.thunder_iron': 5 },}, significance: 20, tags: ['Lightning', 'Resource'] },
            { id: 'temper', label: 'Dùng lôi triều luyện mạch', description: 'Đổi tài nguyên lấy nền tu hành.', resultText: 'Ngươi lấy thân chịu lôi, thân thể đau rát nhưng khả năng chịu tải tăng rõ.', effects: {}, significance: 22, tags: ['Cultivation', 'Risk'] },
        ], tags: ['MidQi', 'Thunder'],
    }),
    event({
        id: 'event.mid.qi.sword_cave_second_mark', packId: 'pack.mid.qi', title: 'Kiếm Ngân Tầng Thứ Hai', teaser: 'Sau khi tu vi tăng, ngươi nhận ra dưới vết kiếm cũ còn có một tầng kiếm ngân mảnh hơn.', priority: 84,
        condition: { lifeNumbers: [1], locationIds: ['location.ancient_sword_cave'], minRealmOrder: 6, maxRealmOrder: 11, knownSkillIds: ['skill.white_rainbow_slash'] },
        choices: [
            { id: 'comprehend', label: 'Ngồi lại ngộ kiếm', description: 'Tăng nền và học Kiếm Thế nếu chưa biết.', resultText: 'Ngươi lần theo kiếm ngân tới tận đầu mút, hiểu thêm cách duy trì áp lực kiếm thế.', effects: { learnSkillIds: ['skill.sword_pressure'], relationships: [{ npcId: 'npc.luo_qingyao', respect: 2, karmaDepth: 1 }] }, significance: 22, tags: ['Sword', 'Insight'] },
            { id: 'collect', label: 'Cạy lấy tàn phiến', description: 'Không ngộ sâu, đổi lấy vật liệu pháp bảo.', resultText: 'Ngươi cẩn thận lấy vài mảnh đá mang kiếm ý còn sót.', effects: { resources: { 'resource.sword_fragment': 4, 'resource.artifact_dust': 2 } }, significance: 14, tags: ['Artifact', 'Resource'] },
        ], tags: ['MidQi', 'Sword'],
    }),
    event({
        id: 'event.mid.qi.field_beast_tide', packId: 'pack.mid.qi', title: 'Tiểu Thú Triều Qua Linh Điền', teaser: 'Một đàn yêu thú bị Hắc Phong ép xuống Linh Điền Bình Nguyên.', priority: 80,
        condition: { lifeNumbers: [1], locationIds: ['location.spirit_field_plain'], minRealmOrder: 5, maxRealmOrder: 10 },
        choices: [
            { id: 'defend', label: 'Giữ linh điền', description: 'Đánh Thiết Giáp Trư đầu đàn.', resultText: 'Ngươi đứng chắn trước bờ ruộng linh điền.', combat: { entityId: 'entity.enemy.iron_boar', onWin: { resources: { 'resource.spirit_herb': 12, 'resource.beast_essence': 5 }, relationships: [{ npcId: 'npc.jiang_yue', trust: 4, respect: 4, karmaDepth: 2 }] }, onLose: { injury: 5 }, completeOnLoss: false }, significance: 21, tags: ['Combat', 'Guard'] },
            { id: 'evacuate', label: 'Dẫn người rời đồng', description: 'Ít chiến lợi phẩm nhưng tăng thiện duyên.', resultText: 'Ngươi dẫn dược nông rút khỏi tuyến yêu thú, giảm thiệt hại đáng kể.', effects: { relationships: [{ npcId: 'npc.jiang_yue', trust: 7, debt: 3, karmaDepth: 3 }] }, significance: 17, tags: ['Relationship'] },
        ], tags: ['MidQi', 'World'],
    }),
    event({
        id: 'event.mid.qi.foundation_rumor', packId: 'pack.mid.qi', title: 'Tin Về Trúc Cơ', teaser: 'Một lão tu sĩ ở Vân Hải Thành nói rằng Trúc Cơ không nằm ở việc nhồi đầy linh lực, mà ở nền tu hành có chịu nổi hay không.', priority: 78,
        condition: { lifeNumbers: [1], locationIds: ['location.cloud_sea_city'], minRealmOrder: 7, maxRealmOrder: 9 },
        choices: [
            { id: 'listen', label: 'Mời lão một bình trà', description: 'Lấy chuẩn bị thăng cảnh và chút nền tu hành.', resultText: 'Lão tu sĩ kể ba lần Trúc Cơ thất bại của mình; kinh nghiệm thất bại đôi khi quý hơn thành công.', effects: {}, significance: 20, tags: ['Breakthrough', 'Knowledge'] },
            { id: 'ignore', label: 'Tự đi con đường của mình', description: 'Không mất tài nguyên.', resultText: 'Ngươi ghi nhớ câu chuyện nhưng không dừng lại lâu.', significance: 6, tags: ['Choice'] },
        ], tags: ['MidQi', 'Breakthrough'],
    }),
    event({
        id: 'event.mid.qi.herb_night_market', packId: 'pack.mid.qi', title: 'Dạ Thị Bách Thảo', teaser: 'Bách Thảo Phường mở dạ thị ba ngày; nhiều dược liệu từ vùng khác được mang tới.', priority: 70,
        condition: { lifeNumbers: [1], locationIds: ['location.herb_market'], minRealmOrder: 4, maxRealmOrder: 10, requiredResources: { 'resource.spirit_stone': 8 } },
        choices: [
            { id: 'medicine', label: 'Mua dược liệu 8 Linh Thạch', description: 'Đổi tiền lấy nguyên liệu luyện đan.', resultText: 'Ngươi chọn một lô dược liệu khá sạch, đủ luyện vài mẻ.', effects: { resources: { 'resource.spirit_stone': -8, 'resource.spirit_herb': 14, 'resource.alchemy_essence': 3 } }, significance: 13, tags: ['Economy', 'Alchemy'] },
            { id: 'observe', label: 'Chỉ xem đan sư trả giá', description: 'Học nghề mà không tiêu tiền.', resultText: 'Ngươi đứng ngoài nghe đan sư phân biệt dược tính, tích được chút kinh nghiệm.', effects: { professionMastery: { alchemy: 2.5 } }, significance: 12, tags: ['Alchemy', 'Study'] },
        ], tags: ['MidQi', 'Economy'],
    }),
    event({
        id: 'event.mid.qi.blood_gorge_map', packId: 'pack.mid.qi', title: 'Bản Đồ Huyết Hà Cốc', teaser: 'Một thương đội trọng thương trở về từ phía sau Lôi Minh Cốc, mang theo bản đồ một hẻm núi đỏ sẫm.', priority: 74,
        condition: { lifeNumbers: [1], locationIds: ['location.thunder_valley', 'location.cloud_sea_city'], minRealmOrder: 8 },
        choices: [
            { id: 'copy', label: 'Sao lại bản đồ', description: 'Mở Huyết Hà Cốc, nơi nguy hiểm hơn hẳn vùng hiện tại.', resultText: 'Ngươi ghi lại đường vào Huyết Hà Cốc; mùi huyết sát trên tấm bản đồ vẫn chưa tan.', effects: { unlockLocationIds: ['location.blood_river_gorge'] }, significance: 18, tags: ['Exploration', 'Danger'] },
            { id: 'wait', label: 'Chưa động tới', description: 'Không mở vùng nguy hiểm ngay.', resultText: 'Ngươi chỉ ghi nhớ cái tên Huyết Hà Cốc, chưa vội đặt chân tới.', significance: 7, tags: ['Choice'] },
        ], tags: ['MidQi', 'Exploration'],
    }),
    // Thanh Hư inner path
    event({
        id: 'event.mid.sect.inner_exam', packId: 'pack.mid.sect', title: 'Khảo Hạch Nội Môn', teaser: 'Ngoại môn mở khảo hạch định kỳ; người đủ tu vi có thể tranh một vị trí Nội Môn.', priority: 96,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect'], paths: ['sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 4, minFactionRank: 'outerDisciple' },
        choices: [
            { id: 'fight', label: 'Dự khảo hạch', description: 'Đánh Thiết Bì Yêu Hùng mô phỏng; thắng nhận nhiều công đức.', resultText: 'Ngươi bước vào Hộ Sơn Trận mô phỏng một đầu Yêu Hùng.', combat: { entityId: 'entity.elite.iron_hide_demon_bear', onWin: { factionMerit: 55, relationships: [{ npcId: 'npc.luo_qingyao', respect: 4, karmaDepth: 2 }] }, onLose: { injury: 4, factionMerit: 8 }, completeOnLoss: true }, significance: 25, tags: ['Sect', 'Promotion'] },
            { id: 'support', label: 'Xin làm nhiệm vụ tích công', description: 'Không đánh, nhận ít công đức.', resultText: 'Ngươi chọn đi đường chắc chắn, nhận một loạt việc tuần sơn và kiểm kho.', effects: { factionMerit: 18 }, significance: 11, tags: ['Sect', 'Merit'] },
        ], tags: ['MidQi', 'Sect'],
    }),
    event({
        id: 'event.mid.sect.scripture_debate', packId: 'pack.mid.sect', title: 'Tàng Kinh Các Luận Pháp', teaser: 'Một vị chấp sự mở buổi luận pháp, cho phép đệ tử chọn một hướng công pháp để nghiên cứu sâu.', priority: 84,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect'], paths: ['sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 5 },
        choices: [
            { id: 'sword', label: 'Nghiên cứu Thái Hư Kiếm Tức', description: 'Học công pháp kiếm nếu chưa biết.', resultText: 'Ngươi theo kiếm ngân trên bản chú giải, lĩnh hội một phần Thái Hư Kiếm Tức Quyết.', effects: { learnTechniqueIds: ['technique.sword_breath'], factionMerit: 6 }, significance: 20, tags: ['Sword', 'Technique'] },
            { id: 'steady', label: 'Nghiên cứu Hàn Nguyệt Tĩnh Tâm', description: 'Hướng tinh thuần và thăng cảnh ổn định.', resultText: 'Ngươi chọn bản pháp thiên về tĩnh tâm, ghi lại cách lọc tạp khí trước bình cảnh.', effects: { learnTechniqueIds: ['technique.cold_moon'], factionMerit: 6 }, significance: 18, tags: ['Cultivation', 'Technique'] },
        ], tags: ['MidQi', 'Sect', 'Inheritance'],
    }),
    event({
        id: 'event.mid.sect.alchemy_watch', packId: 'pack.mid.sect', title: 'Đan Điện Khai Lô', teaser: 'Đan Điện mở lò công khai cho đệ tử quan sát hỏa hậu.', priority: 75,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect'], paths: ['sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 4 },
        choices: [
            { id: 'observe', label: 'Theo dõi trọn một lò', description: 'Tăng Luyện Đan mastery.', resultText: 'Ngươi nhìn rõ thời điểm chuyển hỏa và thu đan, bớt được nhiều đường vòng.', effects: { professionMastery: { alchemy: 6 }, resources: { 'resource.alchemy_essence': 2 } }, significance: 16, tags: ['Alchemy', 'Profession'] },
            { id: 'work', label: 'Phụ xử lý dược liệu', description: 'Ít mastery hơn, có công đức.', resultText: 'Ngươi phụ Đan Điện phân loại linh thảo, nhận một phần công đức.', effects: { professionMastery: { alchemy: 3 }, factionMerit: 12 }, significance: 13, tags: ['Alchemy', 'Sect'] },
        ], tags: ['MidQi', 'Sect', 'Profession'],
    }),
    event({
        id: 'event.mid.sect.forge_quench', packId: 'pack.mid.sect', title: 'Luyện Khí Điện Tôi Kiếm', teaser: 'Luyện Khí Điện đang tôi một mẻ kiếm phôi; đệ tử được phép phụ khống hỏa.', priority: 74,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect'], paths: ['sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 5 },
        choices: [
            { id: 'assist', label: 'Phụ khống hỏa', description: 'Tăng mastery Luyện Khí và nhận tinh hoa.', resultText: 'Ngươi giữ hỏa thế ổn qua ba lần tôi, học được cách nghe tiếng kim loại đổi tính.', effects: { professionMastery: { forging: 6 }, resources: { 'resource.forging_essence': 3 } }, significance: 16, tags: ['Forging', 'Profession'] },
            { id: 'sword', label: 'Chỉ nghiên cứu kiếm phôi', description: 'Nghiêng về Kiếm và vật liệu.', resultText: 'Ngươi ghi lại kết cấu kiếm phôi, đổi vài mảnh vật liệu thừa.', effects: { resources: { 'resource.black_iron_ore': 8 },}, significance: 12, tags: ['Forging', 'Sword'] },
        ], tags: ['MidQi', 'Sect', 'Profession'],
    }),
    event({
        id: 'event.mid.sect.black_wind_patrol', packId: 'pack.mid.sect', title: 'Tuần Sơn Hắc Phong', teaser: 'Thanh Hư Tông điều một đội nhỏ tới Hắc Phong Lâm dọn đường cho thương đội.', priority: 79,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect', 'location.black_wind_forest'], paths: ['sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 6 },
        choices: [
            { id: 'lead', label: 'Dẫn đội tiến sâu', description: 'Đánh Lang Vương, thưởng công đức.', resultText: 'Ngươi dẫn đội xuyên qua vùng gió đen.', combat: { entityId: 'entity.elite.black_wind_wolf_king', onWin: { factionMerit: 32, resources: { 'resource.wind_leaf': 7 }, relationships: [{ npcId: 'npc.luo_qingyao', trust: 3, respect: 3 }] }, onLose: { injury: 5 }, completeOnLoss: true }, significance: 22, tags: ['Sect', 'Combat'] },
            { id: 'guard', label: 'Giữ tuyến sau', description: 'An toàn, ít công đức hơn.', resultText: 'Ngươi giữ đường rút và đưa người bị thương trở về.', effects: { factionMerit: 14, relationships: [{ npcId: 'npc.luo_qingyao', trust: 4 }] }, significance: 13, tags: ['Sect', 'Guard'] },
        ], tags: ['MidQi', 'Sect'],
    }),
    event({
        id: 'event.mid.sect.mo_duel', packId: 'pack.mid.sect', title: 'Một Kiếm Định Cao Thấp', teaser: 'Mặc Trường Phong cuối cùng đưa ra lời luận kiếm chính thức trước Kiếm Bích.', priority: 88,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect'], paths: ['sect'], minRealmOrder: 7, relation: { npcId: 'npc.mo_changfeng', minKarmaDepth: 3 } },
        choices: [
            { id: 'accept', label: 'Nhận lời luận kiếm', description: 'Đấu bằng Hắc Phong Lang Vương mô phỏng để kiểm tra build.', resultText: 'Hai người cùng nhập thí kiếm trận, không ai định nương tay.', combat: { entityId: 'entity.elite.black_wind_wolf_king', onWin: { relationships: [{ npcId: 'npc.mo_changfeng', respect: 10, grudge: -3, karmaDepth: 5 }], learnSkillIds: ['skill.gale_slash'] }, onLose: { relationships: [{ npcId: 'npc.mo_changfeng', respect: 5, grudge: 2, karmaDepth: 3 }] }, completeOnLoss: true }, significance: 25, tags: ['Rivalry', 'Sword'] },
            { id: 'decline', label: 'Tạm không tranh', description: 'Giảm xung đột, không có chiến lợi phẩm.', resultText: 'Ngươi nói thời cơ chưa tới. Mặc Trường Phong không ép, nhưng vẫn nhớ lời ấy.', effects: { relationships: [{ npcId: 'npc.mo_changfeng', grudge: -2, karmaDepth: 1 }] }, significance: 9, tags: ['Relationship'] },
        ], tags: ['MidQi', 'Sect', 'Rivalry'],
    }),
    event({
        id: 'event.mid.sect.foundation_ceremony', packId: 'pack.mid.sect', title: 'Đạo Đài Trước Trúc Cơ', teaser: 'Tông môn mở Đạo Đài cho các đệ tử Luyện Khí hậu kỳ chỉnh nền tu hành trước Trúc Cơ.', priority: 93,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect'], paths: ['sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 8, maxRealmOrder: 9 },
        choices: [
            { id: 'foundation', label: 'Tĩnh tọa chỉnh nền tu hành', description: 'Tăng nền tu hành và chuẩn bị thăng cảnh.', resultText: 'Ngươi ngồi dưới Đạo Đài một ngày một đêm, chỉnh từng vòng chu thiên về trạng thái cân bằng.', effects: { factionMerit: 8 }, significance: 24, tags: ['Breakthrough', 'Foundation'] },
            { id: 'purify', label: 'Dùng Đạo Đài lọc tạp khí', description: 'Tập trung vào tinh thuần.', resultText: 'Ngươi dùng trận văn của Đạo Đài ép tạp khí ra ngoài thân thể.', effects: { factionMerit: 5 }, significance: 21, tags: ['Purity', 'Foundation'] },
        ], tags: ['MidQi', 'Sect', 'Breakthrough'],
    }),
    // Wanderer / solo path
    event({
        id: 'event.mid.wanderer.cloud_auction', packId: 'pack.mid.wanderer', title: 'Tiểu Hội Đấu Giá Vân Hải', teaser: 'Một tiểu hội đấu giá dành cho tán tu mở cửa; đồ tốt không nhiều nhưng tin tức rất thật.', priority: 78,
        condition: { lifeNumbers: [1], locationIds: ['location.cloud_sea_city'], paths: ['wanderer'], minRealmOrder: 4, requiredResources: { 'resource.spirit_stone': 12 } },
        choices: [
            { id: 'artifact_clue', label: 'Mua đầu mối Tàn Bảo Các', description: 'Tốn 12 Linh Thạch, mở phó bản pháp bảo.', resultText: 'Ngươi mua được một mảnh bản đồ tàn tích cùng ký hiệu của khí các cổ.', effects: { resources: { 'resource.spirit_stone': -12 }, unlockDungeonIds: ['dungeon.ruined_treasure_pavilion'] }, significance: 19, tags: ['Artifact', 'Exploration'] },
            { id: 'materials', label: 'Mua lô vật liệu hỗn hợp', description: 'Đổi tiền lấy nguyên liệu nghề.', resultText: 'Ngươi lấy một lô vật liệu không hoàn chỉnh nhưng khá hữu dụng.', effects: { resources: { 'resource.spirit_stone': -10, 'resource.black_iron_ore': 8, 'resource.talisman_paper': 5, 'resource.alchemy_essence': 2 } }, significance: 13, tags: ['Profession', 'Economy'] },
        ], tags: ['MidQi', 'Wanderer'],
    }),
    event({
        id: 'event.mid.wanderer.yan_thunder_lesson', packId: 'pack.mid.wanderer', title: 'Yến Thanh Sơn Thử Lôi', teaser: 'Yến Thanh Sơn thấy ngươi đứng quá lâu dưới lôi vân, thuận miệng hỏi có dám theo hắn vào sâu hơn không.', priority: 84,
        condition: { lifeNumbers: [1], locationIds: ['location.thunder_valley'], paths: ['wanderer'], minRealmOrder: 5 },
        choices: [
            { id: 'follow', label: 'Theo hắn vào lôi tâm', description: 'Nguy hiểm hơn, tăng nền tu hành và nhân quả.', resultText: 'Hai người cùng chịu một đợt lôi triều; Yến Thanh Sơn cười lớn khi thấy ngươi vẫn đứng được.', effects: { resources: { 'resource.thunder_essence': 2 }, relationships: [{ npcId: 'npc.yan_qingshan', respect: 7, trust: 3, karmaDepth: 4 }] }, significance: 22, tags: ['Lightning', 'Relationship'] },
            { id: 'observe', label: 'Chỉ quan sát cách hắn vận lôi', description: 'An toàn hơn.', resultText: 'Ngươi nhìn ra cách hắn xả phần lôi lực dư khỏi thân thể.', effects: { relationships: [{ npcId: 'npc.yan_qingshan', respect: 2 }] }, significance: 13, tags: ['Study'] },
        ], tags: ['MidQi', 'Wanderer', 'Lightning'],
    }),
    event({
        id: 'event.mid.wanderer.bai_ling_hunt', packId: 'pack.mid.wanderer', title: 'Bạch Linh Mượn Đường', teaser: 'Bạch Linh muốn săn một đầu Thiết Giáp Trư nhưng không muốn tự mình phá giáp.', priority: 80,
        condition: { lifeNumbers: [1], locationIds: ['location.black_wind_forest'], paths: ['wanderer'], minRealmOrder: 5, relation: { npcId: 'npc.bai_ling', maxGrudge: 8 } },
        choices: [
            { id: 'cooperate', label: 'Phối hợp săn thú', description: 'Đánh Thiết Giáp Trư, tăng duyên với Bạch Linh.', resultText: 'Ngươi ép Yêu Trư quay đầu, Bạch Linh chặn đường rút.', combat: { entityId: 'entity.enemy.iron_boar', onWin: { resources: { 'resource.beast_essence': 7 }, relationships: [{ npcId: 'npc.bai_ling', trust: 6, debt: 3, karmaDepth: 4 }] }, onLose: { injury: 4 }, completeOnLoss: true }, significance: 20, tags: ['Beast', 'Relationship'] },
            { id: 'refuse', label: 'Không muốn dính vào', description: 'Không tạo thêm nhân quả.', resultText: 'Bạch Linh hừ nhẹ rồi tự biến mất giữa rừng.', significance: 6, tags: ['Choice'] },
        ], tags: ['MidQi', 'Wanderer'],
    }),
    event({
        id: 'event.mid.wanderer.sword_inheritance', packId: 'pack.mid.wanderer', title: 'Kiếm Khí Trong Thạch Quan', teaser: 'Một thạch quan vô danh trong Cổ Kiếm Động rò ra kiếm khí khi ngươi tới gần.', priority: 91,
        condition: { lifeNumbers: [1], locationIds: ['location.ancient_sword_cave'], paths: ['wanderer'], minRealmOrder: 6 },
        choices: [
            { id: 'inherit', label: 'Mở thạch quan', description: 'Học công pháp Kiếm; chịu kiếm khí phản chấn.', resultText: 'Trong quan không có thi thể, chỉ có một thiên khẩu quyết khắc bằng kiếm khí.', effects: { learnTechniqueIds: ['technique.sword_breath'], injury: 5, resources: { 'resource.sword_fragment': 3 } }, significance: 25, tags: ['Inheritance', 'Sword'] },
            { id: 'seal', label: 'Không mở, lấy kiếm ngân ngoài quan', description: 'Ít rủi ro hơn.', resultText: 'Ngươi không động vào thạch quan, chỉ thu phần kiếm ngân đã bong ra.', effects: { resources: { 'resource.sword_fragment': 6, 'resource.artifact_dust': 2 } }, significance: 15, tags: ['Resource'] },
        ], tags: ['MidQi', 'Wanderer', 'Inheritance'],
    }),
    event({
        id: 'event.mid.wanderer.old_camp', packId: 'pack.mid.wanderer', title: 'Động Phủ Tán Tu Bỏ Hoang', teaser: 'Trong khe núi có một động phủ tán tu đã bỏ trống nhiều năm, trận pháp ngoài cửa chỉ còn nửa tác dụng.', priority: 76,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_mountain'], paths: ['wanderer'], minRealmOrder: 7 },
        choices: [
            { id: 'retreat', label: 'Dọn làm nơi bế quan tạm', description: 'Nhận chuẩn bị Trúc Cơ và ít linh thạch.', resultText: 'Ngươi sửa lại tụ linh văn còn dùng được, biến động phủ thành chỗ bế quan tạm thời.', effects: { resources: { 'resource.spirit_stone': 10 },}, significance: 19, tags: ['Retreat', 'Breakthrough'] },
            { id: 'salvage', label: 'Tháo trận văn đem bán', description: 'Thiên về Phù/Trận.', resultText: 'Ngươi tháo những trận văn còn nguyên, thu được một ít Phù Văn Cảm Ngộ.', effects: { resources: { 'resource.rune_insight': 5, 'resource.talisman_paper': 4 }, professionMastery: { talisman: 3 } }, significance: 16, tags: ['Talisman', 'Profession'] },
        ], tags: ['MidQi', 'Wanderer'],
    }),
    event({
        id: 'event.mid.wanderer.han_recipe', packId: 'pack.mid.wanderer', title: 'Hàn Mộc Sinh Đổi Đan Phương', teaser: 'Hàn Mộc Sinh có một bản Trúc Cơ Tĩnh Tâm Đan thiếu vài nét, muốn đổi lấy dược liệu và kinh nghiệm thực địa.', priority: 82,
        condition: { lifeNumbers: [1], locationIds: ['location.herb_market'], paths: ['wanderer'], minRealmOrder: 7, requiredResources: { 'resource.spirit_herb': 8 }, relation: { npcId: 'npc.han_musheng', minTrust: 5, maxGrudge: 5 } },
        choices: [
            { id: 'trade', label: 'Đổi 8 Tụ Linh Thảo', description: 'Học sớm đan phương Tụ Linh để hỗ trợ Tu Vi.', resultText: 'Ngươi đưa dược liệu, Hàn Mộc Sinh bổ sung nốt mấy nét hỏa hậu còn thiếu trên đan phương.', effects: { resources: { 'resource.spirit_herb': -8 }, learnRecipeIds: ['recipe.alchemy.spirit_gathering_pill'], professionMastery: { alchemy: 4 }, relationships: [{ npcId: 'npc.han_musheng', trust: 3, karmaDepth: 2 }] }, significance: 22, tags: ['Alchemy', 'Recipe'] },
            { id: 'help', label: 'Không lấy đan phương, chỉ cùng sửa bản thảo', description: 'Tăng quan hệ và mastery.', resultText: 'Hai người cùng chỉnh lại vài chỗ sai; đan phương vẫn ở lại với Hàn Mộc Sinh.', effects: { professionMastery: { alchemy: 6 }, relationships: [{ npcId: 'npc.han_musheng', trust: 6, debt: 2, karmaDepth: 3 }] }, significance: 16, tags: ['Alchemy', 'Relationship'] },
        ], tags: ['MidQi', 'Wanderer', 'Profession'],
    }),
    event({
        id: 'event.mid.wanderer.foundation_site', packId: 'pack.mid.wanderer', title: 'Một Đêm Trước Bình Cảnh', teaser: 'Tới Luyện Khí chín tầng, khí hải đã đầy nhưng nền tu hành vẫn cần một quyết định cuối.', priority: 95,
        condition: { lifeNumbers: [1], paths: ['wanderer'], minRealmOrder: 9, maxRealmOrder: 9 },
        choices: [
            { id: 'slow', label: 'Dành thời gian mài nền tu hành', description: 'An toàn, tăng foundation.', resultText: 'Ngươi không vội thăng cảnh, để linh lực tự lắng qua nhiều vòng chu thiên.', effects: { tuVi: -100 }, significance: 24, tags: ['Breakthrough', 'Foundation'] },
            { id: 'bold', label: 'Tìm áp lực chiến đấu trước thăng cảnh', description: 'Tăng chuẩn bị nhưng chịu thương.', resultText: 'Ngươi lấy chiến ý ép khí hải vận hành sát giới hạn, tìm cảm giác phá vỡ bình cảnh.', effects: { injury: 6,}, significance: 23, tags: ['Breakthrough', 'Risk'] },
        ], tags: ['MidQi', 'Wanderer', 'Breakthrough'],
    }),
    // Profession pack
    event({
        id: 'event.mid.prof.alchemy_competition', packId: 'pack.mid.profession', title: 'Tiểu Hội Luyện Đan', teaser: 'Bách Thảo Phường mở tiểu hội cho đan sư trẻ, không xét xuất thân.', priority: 77,
        condition: { lifeNumbers: [1], locationIds: ['location.herb_market'], minRealmOrder: 4, professionMinMastery: { alchemy: 5 } },
        choices: [
            { id: 'compete', label: 'Tham gia luyện một mẻ', description: 'Tăng mastery mạnh hơn và nhận dược tính.', resultText: 'Ngươi hoàn thành một mẻ trước nhiều ánh mắt soi xét, thu được không ít kinh nghiệm.', effects: { professionMastery: { alchemy: 8 }, resources: { 'resource.alchemy_essence': 4 } }, significance: 19, tags: ['Alchemy', 'Profession'] },
            { id: 'study', label: 'Quan sát người thắng', description: 'Ít lợi hơn nhưng không cần tranh.', resultText: 'Ngươi ghi lại cách người thắng xử lý lúc dược lực xung đột.', effects: { professionMastery: { alchemy: 4 } }, significance: 12, tags: ['Alchemy', 'Study'] },
        ], tags: ['MidQi', 'Profession'],
    }),
    event({
        id: 'event.mid.prof.forge_crack', packId: 'pack.mid.profession', title: 'Một Đường Nứt Trên Kiếm Phôi', teaser: 'Một kiếm phôi vừa tôi xuất hiện vết nứt nhỏ; sửa hay bỏ sẽ cho hai bài học khác nhau.', priority: 73,
        condition: { lifeNumbers: [1], locationIds: ['location.cloud_sea_city', 'location.thanh_hu_sect'], minRealmOrder: 4, professionMinMastery: { forging: 5 }, requiredResources: { 'resource.black_iron_ore': 4 } },
        choices: [
            { id: 'repair', label: 'Sửa bằng Huyền Thiết', description: 'Tăng mastery, tiêu vật liệu.', resultText: 'Ngươi nung lại đường nứt, học được cách bù ứng lực trong kiếm phôi.', effects: { resources: { 'resource.black_iron_ore': -4 }, professionMastery: { forging: 8 } }, significance: 18, tags: ['Forging'] },
            { id: 'break', label: 'Đập phôi để xem mặt gãy', description: 'Không tiêu vật liệu, nhận ít tinh hoa.', resultText: 'Ngươi chủ động bẻ phôi, nhìn rõ nơi phản phệ tích tụ rồi thu lại phần vật liệu dùng được.', effects: { resources: { 'resource.forging_essence': 2 }, professionMastery: { forging: 4 } }, significance: 12, tags: ['Forging', 'Study'] },
        ], tags: ['MidQi', 'Profession'],
    }),
    event({
        id: 'event.mid.prof.rune_fragment', packId: 'pack.mid.profession', title: 'Tàn Phù Không Khớp', teaser: 'Một tấm cổ phù bị xé mất góc; phần còn lại đủ để suy ngược vài nét trận văn.', priority: 75,
        condition: { lifeNumbers: [1], locationIds: ['location.ancient_sword_cave', 'location.cloud_sea_city'], minRealmOrder: 5, professionMinMastery: { talisman: 3 } },
        choices: [
            { id: 'restore', label: 'Suy ngược phù văn', description: 'Tăng Phù/Trận mastery.', resultText: 'Ngươi thử hàng chục cách nối nét trước khi tìm được một cấu trúc hợp lý.', effects: { professionMastery: { talisman: 8 }, resources: { 'resource.rune_insight': 3 } }, significance: 19, tags: ['Talisman', 'Insight'] },
            { id: 'sell', label: 'Bán tàn phù', description: 'Lấy Linh Thạch thay vì nghiên cứu.', resultText: 'Một phù sư ở Vân Hải Thành mua lại tàn phù với giá khá tốt.', effects: { resources: { 'resource.spirit_stone': 12 } }, significance: 9, tags: ['Economy'] },
        ], tags: ['MidQi', 'Profession'],
    }),
    event({
        id: 'event.mid.prof.foundation_recipe', packId: 'pack.mid.profession', title: 'Đan Phương Trước Trúc Cơ', teaser: 'Khi kinh nghiệm luyện đan đủ sâu, vài dòng trong bản đan phương cũ cuối cùng cũng trở nên rõ nghĩa.', priority: 88,
        condition: { lifeNumbers: [1], minRealmOrder: 7, maxRealmOrder: 10, professionMinMastery: { alchemy: 28 } },
        choices: [
            { id: 'learn', label: 'Hoàn thiện Tụ Linh Đan', description: 'Hoàn thiện đan phương hỗ trợ Tu Vi.', resultText: 'Ngươi hoàn thiện thứ tự nhập dược và ghi lại thành một đan phương có thể dùng thật.', effects: { learnRecipeIds: ['recipe.alchemy.spirit_gathering_pill'], professionMastery: { alchemy: 3 } }, significance: 23, tags: ['Alchemy', 'Recipe'] },
        ], tags: ['MidQi', 'Profession', 'Recipe'],
    }),
    event({
        id: 'event.mid.prof.thunder_sword_recipe', packId: 'pack.mid.profession', title: 'Lôi Văn Nhập Kiếm', teaser: 'Khi tay nghề luyện khí đủ sâu, Lôi Văn Thiết và kiếm phôi bắt đầu cho ngươi một ý tưởng rõ ràng.', priority: 86,
        condition: { lifeNumbers: [1], locationIds: ['location.thunder_valley', 'location.thanh_hu_sect'], minRealmOrder: 7, professionMinMastery: { forging: 32 }, requiredResources: { 'resource.thunder_iron': 2 } },
        choices: [
            { id: 'learn', label: 'Dựng khí đồ Dẫn Lôi Kiếm', description: 'Mở recipe Luyện Khí cấp cao hơn.', resultText: 'Ngươi ghi lại cách đưa lôi tính qua sống kiếm mà không làm phôi nứt.', effects: { resources: { 'resource.thunder_iron': -2 }, learnRecipeIds: ['recipe.forging.thunder_sword'], professionMastery: { forging: 4 } }, significance: 23, tags: ['Forging', 'Recipe', 'Lightning'] },
        ], tags: ['MidQi', 'Profession', 'Recipe'],
    }),
    event({
        id: 'event.mid.prof.formation_plate_recipe', packId: 'pack.mid.profession', title: 'Tụ Linh Văn Thành Trận', teaser: 'Những nét phù rời rạc cuối cùng ghép thành một vòng tụ linh hoàn chỉnh.', priority: 84,
        condition: { lifeNumbers: [1], minRealmOrder: 6, professionMinMastery: { talisman: 18 } },
        choices: [
            { id: 'learn', label: 'Lập Trận Đồ Tụ Linh', description: 'Mở recipe Tụ Linh Trận Bàn.', resultText: 'Ngươi hoàn thiện cấu trúc trận văn, đủ để khắc lên một trận bàn dùng trong bế quan.', effects: { learnRecipeIds: ['recipe.talisman.spirit_gathering_plate'], professionMastery: { talisman: 4 }, resources: { 'resource.rune_insight': 2 } }, significance: 21, tags: ['Talisman', 'Recipe'] },
        ], tags: ['MidQi', 'Profession', 'Recipe'],
    }),
    // Build-reactive midgame pack
    event({
        id: 'event.mid.build.lightning_marrow', packId: 'pack.mid.builds', title: 'Lôi Tủy Nhập Cốt', teaser: 'Lôi Tủy Dịch phản ứng mạnh với Lôi Cốt/Lôi Linh Căn, như muốn tự chui vào thân thể.', priority: 88,
        condition: { lifeNumbers: [1], minRealmOrder: 5, maxRealmOrder: 11, spiritualRootIds: ['root.lightning'], requiredResources: { 'resource.thunder_essence': 1 } },
        choices: [
            { id: 'refine', label: 'Luyện hóa Lôi Tủy', description: 'Tiêu Lôi Tủy, tăng nền và chịu tải.', resultText: 'Lôi Tủy chạy dọc cốt tủy; đau buốt nhưng thân thể thích nghi nhanh.', effects: { resources: { 'resource.thunder_essence': -1 }, learnSkillIds: ['skill.thunder_burst'] }, significance: 23, tags: ['Lightning', 'Build'] },
            { id: 'store', label: 'Giữ lại luyện khí', description: 'Không tiêu vật liệu.', resultText: 'Ngươi phong Lôi Tủy vào bình ngọc, để dành cho pháp bảo hoặc Luyện Khí.', significance: 7, tags: ['Choice'] },
        ], tags: ['MidQi', 'Build'],
    }),
    event({
        id: 'event.mid.build.fire_temper', packId: 'pack.mid.builds', title: 'Hỏa Mạch Dưới Đan Lô', teaser: 'Địa hỏa ở Bách Thảo Phường hợp với Hỏa Linh Căn hơn bình thường.', priority: 80,
        condition: { lifeNumbers: [1], locationIds: ['location.herb_market'], minRealmOrder: 5, spiritualRootIds: ['root.fire', 'root.metal_fire'] },
        choices: [
            { id: 'temper', label: 'Mượn địa hỏa luyện khí', description: 'Tăng tu vi và học Hỏa thuật cơ bản.', resultText: 'Ngươi dẫn địa hỏa vào đan điền rồi ép nó qua chu thiên.', effects: { tuVi: 180, learnSkillIds: ['skill.firebolt'] }, significance: 19, tags: ['Fire', 'Build'] },
            { id: 'alchemy', label: 'Dùng địa hỏa luyện dược', description: 'Tăng Luyện Đan.', resultText: 'Ngươi không dẫn hỏa nhập thân mà dùng nó ổn định một mẻ dược tính.', effects: { professionMastery: { alchemy: 5 }, resources: { 'resource.alchemy_essence': 4 } }, significance: 15, tags: ['Fire', 'Alchemy'] },
        ], tags: ['MidQi', 'Build'],
    }),
    event({
        id: 'event.mid.build.wind_hunt', packId: 'pack.mid.builds', title: 'Đuổi Gió Trong Hắc Phong', teaser: 'Phong Linh Diệp cuốn thành một đường xoáy tự nhiên giữa Hắc Phong Lâm.', priority: 79,
        condition: { lifeNumbers: [1], locationIds: ['location.black_wind_forest'], minRealmOrder: 5, spiritualRootIds: ['root.wind'] },
        choices: [
            { id: 'chase', label: 'Theo đường gió', description: 'Học thân pháp Phong nếu chưa biết.', resultText: 'Ngươi đuổi theo xoáy gió tới khi chân pháp tự điều chỉnh theo dòng khí.', effects: { learnSkillIds: ['skill.phantom_wind_step'], resources: { 'resource.wind_leaf': 6 },}, significance: 20, tags: ['Wind', 'Movement'] },
        ], tags: ['MidQi', 'Build'],
    }),
    event({
        id: 'event.mid.build.poison_pool', packId: 'pack.mid.builds', title: 'Độc Dược Trong Rễ Cỏ', teaser: 'Một khoảnh linh thảo đổi màu vì yêu khí; người thường tránh xa nhưng Bách Độc Thể lại cảm thấy quen thuộc.', priority: 81,
        condition: { lifeNumbers: [1], locationIds: ['location.spirit_field_plain', 'location.herb_market'], minRealmOrder: 5, physiqueIds: ['physique.hundred_poison'] },
        choices: [
            { id: 'absorb', label: 'Lấy thân thử độc', description: 'Nguy hiểm nhưng mở hướng Độc.', resultText: 'Ngươi thử độc từng chút, để cơ thể tự phân giải và ghi nhớ.', effects: { injury: 4, learnSkillIds: ['skill.venom_needle'], resources: { 'resource.alchemy_essence': 3 } }, significance: 21, tags: ['Poison', 'Physique'] },
            { id: 'harvest', label: 'Chỉ thu dược tính', description: 'An toàn hơn.', resultText: 'Ngươi thu phần rễ biến dị để dùng trong luyện đan.', effects: { resources: { 'resource.alchemy_essence': 5 } }, significance: 13, tags: ['Alchemy'] },
        ], tags: ['MidQi', 'Build'],
    }),
    event({
        id: 'event.mid.build.earth_mine', packId: 'pack.mid.builds', title: 'Địa Mạch Dưới Khoáng Động', teaser: 'Hậu Thổ Linh Thai cảm được một nhịp rung đều sâu dưới Huyền Thiết Khoáng Động.', priority: 81,
        condition: { lifeNumbers: [1], minRealmOrder: 6, physiqueIds: ['physique.earth_vessel'], requiredDungeonFloors: [{ dungeonId: 'dungeon.black_iron_mine', minFloor: 1 }] },
        choices: [
            { id: 'meditate', label: 'Tĩnh tọa nghe địa mạch', description: 'Tăng nền tu hành và thân thể.', resultText: 'Ngươi hòa nhịp hô hấp với địa mạch, khí cơ trở nên nặng và ổn.', effects: {}, significance: 21, tags: ['Earth', 'Physique'] },
            { id: 'mine', label: 'Đào theo địa mạch', description: 'Lấy tài nguyên luyện khí.', resultText: 'Ngươi lần theo rung động đào ra một túi quặng chất lượng khá.', effects: { resources: { 'resource.black_iron_ore': 14, 'resource.forging_essence': 3 } }, significance: 14, tags: ['Forging'] },
        ], tags: ['MidQi', 'Build'],
    }),
    event({
        id: 'event.mid.build.sword_core_seed', packId: 'pack.mid.builds', title: 'Một Hạt Kiếm Ý', teaser: 'Kiếm Cốt Thể và công pháp Kiếm cùng cộng hưởng, tạo cảm giác kiếm ý đang kết thành một điểm.', priority: 90,
        condition: { lifeNumbers: [1], minRealmOrder: 7, maxRealmOrder: 12, physiqueIds: ['physique.sword_bone'], knownTechniqueIds: ['technique.sword_breath'] },
        choices: [
            { id: 'nurture', label: 'Dưỡng hạt Kiếm Ý', description: 'Tăng nền mạnh, học Kiếm Thế.', resultText: 'Ngươi không vội phóng kiếm ý ra ngoài mà dưỡng nó trong khí hải.', effects: { learnSkillIds: ['skill.sword_pressure'], tuVi: -80 }, significance: 24, tags: ['Sword', 'Physique', 'Insight'] },
        ], tags: ['MidQi', 'Build'],
    }),
    // Foundation realm pack
    event({
        id: 'event.foundation.first_breath', packId: 'pack.foundation', title: 'Đạo Cơ Sơ Thành', teaser: 'Sau khi bước vào Trúc Cơ, linh lực không còn vận hành như trước; khí hải có cảm giác “đứng vững” hơn.', priority: 99,
        condition: { lifeNumbers: [1], minRealmOrder: 10, maxRealmOrder: 10 },
        choices: [
            { id: 'stabilize', label: 'Ổn định Đạo Cơ', description: 'Tăng nền tu hành và hồi thân thể.', resultText: 'Ngươi dành thời gian ổn định từng tầng linh lực quanh Đạo Cơ mới thành.', effects: {}, significance: 30, tags: ['Foundation', 'Breakthrough'] },
            { id: 'test', label: 'Lập tức thử sức', description: 'Học cách vận dụng sức mạnh mới.', resultText: 'Ngươi thử vận hành pháp thuật bằng Đạo Cơ mới, nhanh chóng nắm được thay đổi về lực.', effects: { tuVi: 140, injury: 2 }, significance: 21, tags: ['Foundation', 'CombatPrep'] },
        ], tags: ['Foundation', 'Milestone'],
    }),
    event({
        id: 'event.foundation.artifact_call', packId: 'pack.foundation', title: 'Pháp Bảo Cảm Ứng Đạo Cơ', teaser: 'Sau Trúc Cơ, thần niệm và linh lực đủ ổn để điều khiển nhiều pháp bảo hơn trước.', priority: 88,
        condition: { lifeNumbers: [1], minRealmOrder: 10, maxRealmOrder: 12 },
        choices: [
            { id: 'treasure', label: 'Tìm dấu Tàn Bảo Các', description: 'Mở phó bản pháp bảo nếu chưa mở.', resultText: 'Ngươi lần theo dao động pháp bảo cũ và xác nhận vị trí Tàn Bảo Các.', effects: { unlockDungeonIds: ['dungeon.ruined_treasure_pavilion'], resources: { 'resource.artifact_dust': 4 } }, significance: 20, tags: ['Artifact', 'DungeonHint'] },
            { id: 'nourish', label: 'Tập dưỡng bảo bằng linh lực', description: 'Lấy Bảo Khí Tàn Tinh để chuẩn bị.', resultText: 'Ngươi học cách nuôi một vật lâu dài thay vì chỉ thay trang bị liên tục.', effects: { resources: { 'resource.artifact_dust': 7 }, tuVi: -60 }, significance: 16, tags: ['Artifact', 'Nourish'] },
        ], tags: ['Foundation', 'Artifact'],
    }),
    event({
        id: 'event.foundation.sect_core_trial', packId: 'pack.foundation', title: 'Chân Truyền Khảo Hạch', teaser: 'Trúc Cơ tu sĩ trong Thanh Hư Tông có tư cách tranh Chân Truyền; khảo hạch lần này dùng Lôi Giác Huyền Tê mô phỏng.', priority: 94,
        condition: { lifeNumbers: [1], locationIds: ['location.thanh_hu_sect'], paths: ['sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 10, minFactionRank: 'innerDisciple' },
        choices: [
            { id: 'challenge', label: 'Đăng ký Chân Truyền khảo hạch', description: 'Đánh Lôi Giác Huyền Tê; thắng nhận nhiều công đức.', resultText: 'Trận pháp dựng lên hình thể một đầu Lôi Giác Huyền Tê.', combat: { entityId: 'entity.boss.thunder_horn_rhino', onWin: { factionMerit: 110, resources: { 'resource.artifact_dust': 5 }, relationships: [{ npcId: 'npc.luo_qingyao', respect: 6, karmaDepth: 3 }] }, onLose: { injury: 9, factionMerit: 15 }, completeOnLoss: false, loseText: 'Huyền Tê mô phỏng phá thế công của ngươi; khảo hạch cho phép tái chiến sau khi chuẩn bị lại.' }, significance: 36, tags: ['Sect', 'Boss', 'Promotion'] },
            { id: 'delay', label: 'Chưa vội tranh Chân Truyền', description: 'Nhận chút chỉ điểm chuẩn bị.', resultText: 'Ngươi quan sát người khác công phá trận, ghi lại vài điểm yếu của Huyền Tê.', effects: {}, significance: 9, tags: ['Study'] },
        ], tags: ['Foundation', 'Sect', 'Milestone'],
    }),
    event({
        id: 'event.foundation.wanderer_thunder_rhino', packId: 'pack.foundation', title: 'Lôi Giác Huyền Tê Rời Cốc', teaser: 'Một đầu Lôi Giác Huyền Tê rời sâu trong Lôi Minh Cốc, khiến các tuyến săn quanh đó đóng cửa.', priority: 95,
        condition: { lifeNumbers: [1], locationIds: ['location.thunder_valley'], paths: ['wanderer'], minRealmOrder: 10 },
        choices: [
            { id: 'hunt', label: 'Săn Huyền Tê', description: 'Boss milestone cho tán tu; thua được đánh lại.', resultText: 'Ngươi lần theo dấu sừng cày nát đá núi tới trung tâm lôi cốc.', combat: { entityId: 'entity.boss.thunder_horn_rhino', onWin: { resources: { 'resource.thunder_essence': 6, 'resource.artifact_dust': 7 }, unlockDungeonIds: ['dungeon.ruined_treasure_pavilion'] }, onLose: { injury: 12 }, completeOnLoss: false, loseText: 'Một cú charge của Huyền Tê phá thế thủ; ngươi buộc phải rút khỏi lôi cốc.' }, significance: 37, tags: ['Boss', 'Wanderer', 'Lightning'] },
            { id: 'track', label: 'Chỉ theo dấu, chưa săn', description: 'Nhận hiểu biết và ít vật liệu.', resultText: 'Ngươi ghi lại lộ tuyến, nhặt được vài mảnh Lôi Văn Thiết bị sừng cày bật khỏi vách.', effects: { resources: { 'resource.thunder_iron': 5 }, relationships: [{ npcId: 'npc.yan_qingshan', respect: 2 }] }, significance: 12, tags: ['Exploration'] },
        ], tags: ['Foundation', 'Wanderer', 'Milestone'],
    }),
    event({
        id: 'event.foundation.han_discussion', packId: 'pack.foundation', title: 'Một Lò Đan Sau Trúc Cơ', teaser: 'Hàn Mộc Sinh muốn thử dùng linh lực Trúc Cơ để thay đổi hỏa hậu trong một mẻ đan.', priority: 76,
        condition: { lifeNumbers: [1], locationIds: ['location.herb_market'], minRealmOrder: 10, professionMinMastery: { alchemy: 10 }, relation: { npcId: 'npc.han_musheng', minTrust: 4 } },
        choices: [
            { id: 'cooperate', label: 'Cùng mở lò', description: 'Tăng mastery và nhân quả.', resultText: 'Hai người thay phiên giữ hỏa, cuối cùng tìm được nhịp luyện hóa ổn định hơn.', effects: { professionMastery: { alchemy: 7 }, resources: { 'resource.alchemy_essence': 4 }, relationships: [{ npcId: 'npc.han_musheng', trust: 5, debt: 2, karmaDepth: 3 }] }, significance: 20, tags: ['Alchemy', 'Relationship'] },
        ], tags: ['Foundation', 'Profession'],
    }),
    event({
        id: 'event.foundation.blood_river_scout', packId: 'pack.foundation', title: 'Huyết Hà Cốc Thăm Dò', teaser: 'Tới Trúc Cơ, thần thức và sức chịu đựng đủ để thăm dò rìa Huyết Hà Cốc mà không lập tức mất mạng.', priority: 83,
        condition: { lifeNumbers: [1], locationIds: ['location.blood_river_gorge'], minRealmOrder: 11 },
        choices: [
            { id: 'scout', label: 'Thăm dò sâu hơn', description: 'Đụng Huyết Hà Tán Nhân; đây là thử thách khó.', resultText: 'Ngươi men theo huyết khí vào sâu, rồi một bóng người áo đỏ chặn đường.', combat: { entityId: 'entity.boss.blood_river_rogue', onWin: { resources: { 'resource.blood_crystal': 8, 'resource.artifact_dust': 8 },}, onLose: { injury: 15 }, completeOnLoss: false, loseText: 'Huyết Hà Tán Nhân hút cạn thế công của ngươi; ngươi phải bỏ chạy khỏi hẻm núi.' }, significance: 40, tags: ['Boss', 'Danger', 'LegacyCandidate'] },
            { id: 'gather', label: 'Chỉ thu Huyết Tinh ngoài rìa', description: 'Không đối đầu boss.', resultText: 'Ngươi không tiến sâu, chỉ thu những viên Huyết Tinh bị dòng sát khí đẩy ra ngoài.', effects: { resources: { 'resource.blood_crystal': 4 } }, significance: 14, tags: ['Resource'] },
        ], tags: ['Foundation', 'Danger'],
    }),
    event({
        id: 'event.foundation.dao_companion_seed', packId: 'pack.foundation', title: 'Đồng Hành Qua Một Bình Cảnh', teaser: 'Sau Trúc Cơ, một mối quan hệ đủ sâu bắt đầu mang ý nghĩa khác hẳn những lần gặp xã giao.', priority: 72,
        condition: { lifeNumbers: [1], minRealmOrder: 10, relation: { npcId: 'npc.luo_qingyao', minTrust: 10, minKarmaDepth: 8, maxGrudge: 5 } },
        choices: [
            { id: 'discuss', label: 'Cùng Lạc Thanh Dao luận Đạo', description: 'Tăng nhân quả, chưa tự động thành đạo lữ.', resultText: 'Hai người luận kiếm và tu hành tới khuya; không ai nhắc tới danh phận, nhưng nhân quả đã sâu thêm.', effects: { relationships: [{ npcId: 'npc.luo_qingyao', trust: 6, respect: 5, karmaDepth: 6 }] }, significance: 22, tags: ['Relationship', 'DaoDiscussion'] },
            { id: 'distance', label: 'Giữ khoảng cách', description: 'Giảm độ sâu nhân quả một chút.', resultText: 'Ngươi kết thúc cuộc luận Đạo sớm, giữ mối quan hệ ở mức đồng môn.', effects: { relationships: [{ npcId: 'npc.luo_qingyao', karmaDepth: -2 }] }, significance: 8, tags: ['Choice'] },
        ], tags: ['Foundation', 'Relationship'],
    }),
];
export const midgameContentEvents = Object.fromEntries(midgameEventList.map(e => [e.id, e]));
const packs = [
    ['pack.mid.qi', 'Luyện Khí Trung Hậu Kỳ', 'Sự kiện trung lập khi Luyện Khí bắt đầu đi vào giai đoạn tích nền và chuẩn bị Trúc Cơ.'],
    ['pack.mid.sect', 'Thanh Hư Nội Môn', 'Nội dung tông môn từ khảo hạch Nội Môn tới chuẩn bị Chân Truyền.'],
    ['pack.mid.wanderer', 'Tán Tu Lập Thân', 'Cơ duyên, quan hệ và truyền thừa cho người tiếp tục con đường tán tu.'],
    ['pack.mid.profession', 'Bách Nghệ Trung Kỳ', 'Sự kiện nghề nghiệp cho Luyện Đan, Luyện Khí và Phù/Trận.'],
    ['pack.mid.builds', 'Cơ Duyên Theo Build · Trung Kỳ', 'Sự kiện chỉ xuất hiện khi Linh Căn, Thể Chất hoặc công pháp phù hợp.'],
    ['pack.foundation', 'Trúc Cơ · Đạo Cơ Sơ Thành', 'Nội dung mở ra sau Trúc Cơ: pháp bảo, boss, quan hệ và thử thách mới.'],
];
export const midgameContentPacks = Object.fromEntries(packs.map(([id, name, description]) => [id, {
        id, name, description,
        eventIds: Object.values(midgameContentEvents).filter(e => e.packId === id).map(e => e.id),
    }]));
//# sourceMappingURL=midgame-content-pack.js.map