const events = [
    {
        id: 'event.variety.qi.market_lot', packId: 'pack.variety.qi', title: 'Lô Hàng Không Đủ Chia', teaser: 'Một thương đội chỉ còn một lô vật liệu tốt; đan sư và luyện khí sư đều đang trả giá.', priority: 70,
        condition: { minRealmOrder: 2, maxRealmOrder: 8, locationIds: ['location.thanh_ha_town', 'location.herb_market', 'location.cloud_sea_city'], requiredResources: { 'resource.spirit_stone': 5 } }, choices: [
            { id: 'herb', label: 'Mua dược liệu', description: 'Tiêu 5 Linh Thạch để nuôi Luyện Đan.', resultText: 'Ngươi lấy phần dược liệu còn tươi trước khi người khác nâng giá.', effects: { resources: { 'resource.spirit_stone': -5, 'resource.spirit_herb': 6 }, professionMastery: { alchemy: 2 } }, significance: 13, tags: ['Alchemy', 'Herb', 'Economy'] },
            { id: 'ore', label: 'Mua phôi khoáng', description: 'Tiêu 5 Linh Thạch để nuôi Luyện Khí.', resultText: 'Ngươi chọn phần phôi kim loại ổn định, dễ luyện hơn khoáng thô.', effects: { resources: { 'resource.spirit_stone': -5, 'resource.black_iron_ore': 5 }, professionMastery: { forging: 2 } }, significance: 13, tags: ['Forging', 'Economy'] },
            { id: 'walk', label: 'Không tranh giá', description: 'Giữ tiền, đổi lấy một chút chuẩn bị thăng cảnh.', resultText: 'Ngươi rời chợ trước khi giá bị đẩy quá cao, giữ tâm cảnh không loạn.', effects: {}, significance: 8, tags: ['Cultivation', 'Choice'] },
        ], tags: ['Variety', 'Economy'],
    },
    {
        id: 'event.variety.qi.injured_hunter', packId: 'pack.variety.qi', title: 'Tu Sĩ Bị Thương Bên Rìa Rừng', teaser: 'Một tán tu bị yêu thú cào rách vai, cạnh người là túi chiến lợi phẩm chưa kịp nhặt.', priority: 72,
        condition: { minRealmOrder: 3, maxRealmOrder: 9, locationIds: ['location.black_wind_forest', 'location.thanh_hu_mountain'] }, choices: [
            { id: 'help', label: 'Giúp băng bó', description: 'Mất chút thời gian, lấy nhân quả và thông tin.', resultText: 'Người kia chỉ cho ngươi đường thú thường đi qua và ghi nhớ ân tình.', effects: { relationships: [{ npcId: 'npc.bai_ling', trust: 2, karmaDepth: 2 }] }, significance: 15, tags: ['Social', 'Karma', 'Exploration'] },
            { id: 'loot', label: 'Lấy phần chiến lợi phẩm bỏ lại', description: 'Có tài nguyên ngay, nhưng lựa chọn không đẹp.', resultText: 'Ngươi nhặt phần yêu thú tinh hoa bên đường rồi rời đi trước khi người khác tới.', effects: { resources: { 'resource.beast_essence': 3 } }, significance: 11, tags: ['Resource', 'Choice'] },
        ], tags: ['Variety', 'Social'],
    },
    {
        id: 'event.variety.qi.root_echo', packId: 'pack.variety.qi', title: 'Linh Căn Tự Phát Cộng Hưởng', teaser: 'Một luồng linh khí cùng thuộc tính với Linh Căn của ngươi đi ngang thân thể, đủ để chọn học nhanh hay luyện chắc.', priority: 76,
        condition: { minRealmOrder: 4, maxRealmOrder: 9 }, choices: [
            { id: 'insight', label: 'Dồn vào Công Pháp', description: 'Tăng năng lượng, lấy nhịp lĩnh ngộ.', resultText: 'Ngươi không tham lượng linh khí, chỉ giữ lại cấu trúc vận hành phù hợp nhất.', effects: { tuVi: 120 }, significance: 14, tags: ['Technique', 'Cultivation'] },
            { id: 'foundation', label: 'Dẫn vào nền móng', description: 'Ít lợi ngắn hạn, tăng Foundation.', resultText: 'Ngươi ép luồng cộng hưởng đi qua những đoạn thân thể yếu nhất.', effects: {}, significance: 15, tags: ['Cultivation', 'Stability'] },
        ], tags: ['Variety', 'BuildChoice'],
    },
    {
        id: 'event.variety.foundation.cracked_array', packId: 'pack.variety.foundation', title: 'Trận Bàn Nứt Một Góc', teaser: 'Một trận bàn cũ vẫn chạy được nhưng mỗi chu kỳ đều rò linh lực; sửa nó là bài tập tốt cho cả phù trận lẫn cảm giác linh lực.', priority: 74,
        condition: { minRealmOrder: 10, maxRealmOrder: 13 }, choices: [
            { id: 'repair', label: 'Tự sửa trận bàn', description: 'Tăng Phù/Trận và lấy Phù Văn Tinh Hoa.', resultText: 'Ngươi vá lại điểm đứt bằng một nét phù thay vì thay cả trận tâm.', effects: { professionMastery: { talisman: 5 }, resources: { 'resource.talisman_essence': 2 } }, significance: 17, tags: ['Talisman', 'Formation'] },
            { id: 'study', label: 'Không sửa, chỉ quan sát', description: 'Lấy cảm ngộ Công Pháp và độ ổn định.', resultText: 'Ngươi để trận bàn tiếp tục rò, nhìn đường linh lực sai để hiểu đường đúng.', effects: {}, significance: 17, tags: ['Technique', 'Cultivation'] },
        ], tags: ['Variety', 'Foundation'],
    },
    {
        id: 'event.variety.foundation.treasure_hum', packId: 'pack.variety.foundation', title: 'Bảo Khí Tàn Tinh Phát Tiếng', teaser: 'Một nhúm Bảo Khí Tàn Tinh trong túi tự rung khi ngươi vận công; đủ để nuôi bảo hoặc đổi lấy linh thạch.', priority: 73,
        condition: { minRealmOrder: 10, maxRealmOrder: 13, requiredResources: { 'resource.artifact_dust': 1 } }, choices: [
            { id: 'feed', label: 'Giữ lại nuôi Pháp Bảo', description: 'Giữ vật liệu cho tuyến nuôi Pháp Bảo thay vì bán lấy tiền.', resultText: 'Ngươi dùng linh lực loại phản phệ, phần còn lại ít hơn nhưng ổn định hơn.', effects: { resources: { 'resource.artifact_dust': 2 } }, significance: 15, tags: ['Artifact', 'Treasure'] },
            { id: 'sell', label: 'Đổi lấy Linh Thạch', description: 'Ưu tiên economy thay vì pháp bảo.', resultText: 'Ngươi bán phần tàn tinh cho một cửa hiệu chuyên thu vật liệu cũ.', effects: { resources: { 'resource.artifact_dust': -1, 'resource.spirit_stone': 8 } }, significance: 13, tags: ['Economy', 'Artifact'] },
        ], tags: ['Variety', 'Artifact'],
    },
    {
        id: 'event.variety.purple.route_map', packId: 'pack.variety.purple', title: 'Bản Đồ Phó Bản Chỉ Đúng Một Nửa', teaser: 'Một tấm địa đồ cũ đánh dấu đường ngắn qua cấm chế, nhưng phần cuối đã bị nước làm nhòe.', priority: 82,
        condition: { minRealmOrder: 14, maxRealmOrder: 17 }, choices: [
            { id: 'dungeon', label: 'Đi theo đường ngắn', description: 'Lấy tài nguyên phó bản, đổi chút thương thế.', resultText: 'Nửa đầu bản đồ đúng; nửa sau buộc ngươi tự phá một cấm chế nhỏ.', effects: { resources: { 'resource.cultivation_essence': 9 }, injury: 2 }, significance: 19, tags: ['Dungeon', 'Exploration', 'Risk'] },
            { id: 'decode', label: 'Giải lại ký hiệu', description: 'Ưu tiên Phù/Trận và chuẩn bị.', resultText: 'Ngươi không đi ngay, dùng bản đồ như một bài giải trận pháp.', effects: { professionMastery: { talisman: 5 },}, significance: 19, tags: ['Talisman', 'Dungeon'] },
        ], tags: ['Variety', 'Dungeon'],
    },
    {
        id: 'event.variety.purple.mirror_self', packId: 'pack.variety.purple', title: 'Ảnh Trong Hồ Đi Chậm Một Nhịp', teaser: 'Bóng của ngươi trên Tử Kính Hồ không bắt chước ngay; nó như đang thử một rotation khác.', priority: 85,
        condition: { minRealmOrder: 15, maxRealmOrder: 17, locationIds: ['location.purple_mirror_lake'] }, choices: [
            { id: 'copy', label: 'Học nhịp của bóng', description: 'Tăng chuẩn bị và năng lượng, thiên kỹ thuật.', resultText: 'Ngươi đổi thứ tự vận lực theo bóng trong hồ và nhận ra một nhịp thừa của chính mình.', effects: { tuVi: 360,}, significance: 21, tags: ['Technique', 'Combat', 'PurplePalace'] },
            { id: 'break', label: 'Phá ảnh', description: 'Lấy tài nguyên, bỏ qua bài học rotation.', resultText: 'Một chưởng đánh tan bóng nước, để lại vài mảnh Huyền Kính Ngọc.', effects: { resources: { 'resource.mirror_jade': 3 } }, significance: 17, tags: ['Resource', 'Combat'] },
        ], tags: ['Variety', 'BuildChoice'],
    },
    {
        id: 'event.variety.golden.core_fire_split', packId: 'pack.variety.golden', title: 'Đan Hỏa Chia Ba Ngả', teaser: 'Kim Đan sinh một đợt hỏa khí dư; ngươi chỉ đủ tâm lực dẫn nó theo một hướng.', priority: 88,
        condition: { minRealmOrder: 18, maxRealmOrder: 21 }, choices: [
            { id: 'combat', label: 'Tôi chiến pháp', description: 'Tăng nền chiến và lấy Pháp Bảo tài nguyên.', resultText: 'Ngươi dẫn Đan Hỏa qua những đoạn vận lực thường dùng khi bộc phát.', effects: { resources: { 'resource.artifact_dust': 4 },}, significance: 22, tags: ['Combat', 'Artifact', 'GoldenCore'] },
            { id: 'alchemy', label: 'Dưỡng đan hỏa', description: 'Tăng Luyện Đan.', resultText: 'Ngươi giữ lửa trong đan điền, mô phỏng hỏa hậu của một lò đan nhỏ.', effects: { professionMastery: { alchemy: 7 }, resources: { 'resource.alchemy_essence': 3 } }, significance: 22, tags: ['Alchemy', 'GoldenCore'] },
            { id: 'stability', label: 'Tán hỏa dưỡng mạch', description: 'Không lấy tài nguyên, đổi lấy sạch và ổn định.', resultText: 'Ngươi tán phần hỏa khí dư vào toàn thân thay vì dùng nó tạo lợi ích tức thời.', effects: {}, significance: 23, tags: ['Cultivation', 'Stability', 'GoldenCore'] },
        ], tags: ['Variety', 'GoldenCore'],
    },
];
export const earlyVarietyContentEvents = Object.fromEntries(events.map(event => [event.id, event]));
export const earlyVarietyContentPacks = Object.fromEntries([
    ['pack.variety.qi', 'Biến Số · Luyện Khí', 'Các lựa chọn nhỏ theo địa điểm/build để giảm chuỗi bế quan lặp.'],
    ['pack.variety.foundation', 'Biến Số · Trúc Cơ', 'Trade-off giữa nền, nghề, economy và Pháp Bảo.'],
    ['pack.variety.purple', 'Biến Số · Tử Phủ', 'Phó bản, rotation và nội cảnh tạo quyết định trước Kim Đan.'],
    ['pack.variety.golden', 'Biến Số · Kim Đan', 'Đan Hỏa phản ánh hướng đời hiện tại thay vì chỉ cho chỉ số.'],
].map(([id, name, description]) => [id, { id, name, description, eventIds: events.filter(event => event.packId === id).map(event => event.id) }]));
//# sourceMappingURL=early-variety-content-pack.js.map