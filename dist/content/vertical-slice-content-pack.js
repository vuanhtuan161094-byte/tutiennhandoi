const events = [
    {
        id: 'event.slice.qi.resource_split', packId: 'pack.slice.qi', title: 'Một Túi Linh Thạch, Hai Con Đường', teaser: 'Một chuyến thu thập để lại vừa đủ tài nguyên cho một lần lựa chọn: dưỡng mạch hay đổi lấy dược liệu.', priority: 84,
        condition: { minRealmOrder: 3, maxRealmOrder: 8 }, choices: [
            { id: 'meridian', label: 'Dưỡng mạch trước', description: 'Tiêu ít Linh Thạch để đổi ổn định và chuẩn bị thăng cảnh.', resultText: 'Ngươi không vội tăng tu vi, dùng linh khí chậm rãi dưỡng lại đường thân thể.', effects: { resources: { 'resource.spirit_stone': -4 },}, significance: 15, tags: ['Cultivation', 'Breakthrough'] },
            { id: 'herbs', label: 'Đổi lấy dược liệu', description: 'Giữ nhịp nghề Luyện Đan nhưng không được ổn định thân thể.', resultText: 'Ngươi đổi phần linh thạch thành một bó Tụ Linh Thảo còn tươi.', effects: { resources: { 'resource.spirit_stone': -4, 'resource.spirit_herb': 7 } }, significance: 13, tags: ['Alchemy', 'Herb', 'Gather'] },
        ], tags: ['Cultivation', 'Economy'],
    },
    {
        id: 'event.slice.qi.overdraw', packId: 'pack.slice.qi', title: 'Thân Thể Báo Nóng', teaser: 'Luyện Khí hậu kỳ khiến linh lực dồn qua vài đoạn thân thể nhanh hơn thân thể thích nghi.', priority: 90,
        condition: { minRealmOrder: 7, maxRealmOrder: 9 }, choices: [
            { id: 'stabilize', label: 'Dừng lại ổn mạch', description: 'Mất nhịp tăng linh lực nhưng giữ nền.', resultText: 'Ngươi hạ chu thiên xuống một nửa, ép tạp khí thoát dần khỏi thân thể.', effects: {}, significance: 20, tags: ['Cultivation', 'Stability'] },
            { id: 'push', label: 'Ép thêm một chu thiên', description: 'Lấy linh lực và chuẩn bị thăng cảnh, đổi lại thương mạch.', resultText: 'Ngươi ép linh lực chạy thêm một vòng; tu vi tăng nhưng thân thể nóng rát.', effects: { tuVi: 260, injury: 2 }, significance: 18, tags: ['Cultivation', 'Risk'] },
        ], tags: ['Cultivation', 'Decision'],
    },
    {
        id: 'event.slice.foundation.identity', packId: 'pack.slice.foundation', title: 'Trúc Cơ Không Chỉ Là Nền Móng', teaser: 'Sau khi Trúc Cơ, ngươi nhận ra cùng một Đạo Cơ có thể được nuôi theo hướng chiến, nghề hoặc ổn định.', priority: 92,
        condition: { minRealmOrder: 10, maxRealmOrder: 12 }, choices: [
            { id: 'combat', label: 'Lấy chiến dưỡng cơ', description: 'Đổi một ít ổn định lấy nhịp chiến đấu và tu vi.', resultText: 'Ngươi dùng thực chiến giả tưởng ép Đạo Cơ phản ứng nhanh hơn.', effects: { tuVi: 380,}, significance: 20, tags: ['Combat', 'Technique', 'Foundation'] },
            { id: 'craft', label: 'Lấy bách nghệ dưỡng cơ', description: 'Chọn tiến đều ba nghề thay vì tăng lực tức thời.', resultText: 'Ngươi dùng đan, khí và phù như ba cách quan sát cùng một luồng linh lực.', effects: { professionMastery: { alchemy: 3, forging: 3, talisman: 3 } }, significance: 20, tags: ['Alchemy', 'Forging', 'Talisman', 'Foundation'] },
            { id: 'stable', label: 'Đạo Cơ vô khuyết', description: 'Ưu tiên nền và thân thể.', resultText: 'Ngươi bỏ qua lợi ích ngắn hạn, chỉnh từng điểm lệch của Đạo Cơ.', effects: {}, significance: 22, tags: ['Cultivation', 'Stability', 'Foundation'] },
        ], tags: ['Foundation', 'BuildChoice'],
    },
    {
        id: 'event.slice.foundation.profession_focus', packId: 'pack.slice.foundation', title: 'Ba Lò Tranh Một Địa Hỏa', teaser: 'Một mạch địa hỏa nhỏ chỉ đủ cho một xưởng dùng trọn hôm nay.', priority: 79,
        condition: { minRealmOrder: 11, maxRealmOrder: 13 }, choices: [
            { id: 'alchemy', label: 'Nhường cho Đan lô', description: 'Tăng Luyện Đan và lấy dược tính.', resultText: 'Đan lô cháy đỏ cả ngày; ngươi ghi được vài biến hóa hỏa hậu.', effects: { professionMastery: { alchemy: 6 }, resources: { 'resource.alchemy_essence': 3 } }, significance: 16, tags: ['Alchemy'] },
            { id: 'forging', label: 'Nhường cho Luyện Khí lô', description: 'Tăng Luyện Khí và lấy tinh hoa.', resultText: 'Huyền thiết đỏ dần trong địa hỏa; ngươi quen hơn với nhịp rèn dài.', effects: { professionMastery: { forging: 6 }, resources: { 'resource.forging_essence': 3 } }, significance: 16, tags: ['Forging'] },
            { id: 'talisman', label: 'Dẫn hỏa vào trận bàn', description: 'Tăng Phù/Trận và lấy cảm ngộ.', resultText: 'Ngươi không đốt vật liệu, dùng địa hỏa làm nét thứ tư của trận văn.', effects: { professionMastery: { talisman: 6 }, resources: { 'resource.rune_insight': 3 } }, significance: 16, tags: ['Talisman', 'Formation'] },
        ], tags: ['Profession', 'Choice'],
    },
    {
        id: 'event.slice.purple.inventory', packId: 'pack.slice.purple', title: 'Tử Phủ Có Chỗ, Nhưng Tâm Chỉ Có Một Hướng', teaser: 'Nội cảnh mở rộng khiến ngươi có thể nuôi một nhánh tài nguyên sâu hơn thay vì ôm tất cả.', priority: 86,
        condition: { minRealmOrder: 14, maxRealmOrder: 16 }, choices: [
            { id: 'treasure', label: 'Nuôi Pháp Bảo', description: 'Dồn vật liệu vào Bảo Khí.', resultText: 'Ngươi dành một góc Tử Phủ nuôi khí tức bảo vật.', effects: { resources: { 'resource.artifact_dust': 6 } }, significance: 18, tags: ['Artifact', 'PurplePalace'] },
            { id: 'dungeon', label: 'Chuẩn bị phó bản', description: 'Tích Tu Vi Tinh Hoa và chuẩn bị công phá.', resultText: 'Ngươi chuyển nội cảnh sang nhịp hồi phục nhanh, dành cho những trận kéo dài.', effects: { resources: { 'resource.cultivation_essence': 10 },}, significance: 18, tags: ['Dungeon', 'Cultivation', 'PurplePalace'] },
            { id: 'profession', label: 'Dưỡng bách nghệ', description: 'Tăng nhẹ cả ba nghề.', resultText: 'Tử Phủ trở thành một kho thao tác tinh tế cho đan, khí và phù.', effects: { professionMastery: { alchemy: 3, forging: 3, talisman: 3 } }, significance: 18, tags: ['Alchemy', 'Forging', 'Talisman', 'PurplePalace'] },
        ], tags: ['PurplePalace', 'BuildChoice'],
    },
    {
        id: 'event.slice.purple.compress', packId: 'pack.slice.purple', title: 'Nén Tử Phủ Trước Kim Đan', teaser: 'Tử Phủ viên mãn bắt đầu co lại. Nén sớm lấy chuẩn bị, nén chậm giữ nền.', priority: 96,
        condition: { minRealmOrder: 17, maxRealmOrder: 17 }, choices: [
            { id: 'slow', label: 'Nén chậm, giữ nền', description: 'Tăng nền móng và độ sạch.', resultText: 'Ngươi để Tử Phủ co theo từng nhịp, không cưỡng ép một lần thành đan.', effects: {}, significance: 28, tags: ['Cultivation', 'Breakthrough', 'Stability'] },
            { id: 'fast', label: 'Nén nhanh, giành thời cơ', description: 'Lấy chuẩn bị phá Kim Đan nhưng tổn mạch.', resultText: 'Ngươi ép nội cảnh co mạnh; Đan tâm hiện sớm nhưng thân thể phải gánh phản lực.', effects: { tuVi: 900, injury: 3 }, significance: 26, tags: ['Cultivation', 'Breakthrough', 'Risk'] },
        ], tags: ['PurplePalace', 'GoldenCore', 'Milestone'],
    },
    {
        id: 'event.slice.golden.pattern', packId: 'pack.slice.golden', title: 'Khắc Đan Văn Đầu Tiên', teaser: 'Kim Đan mới thành có một khoảng trống trong Đan văn, đủ để phản ánh lối chơi đời này.', priority: 98,
        condition: { minRealmOrder: 18, maxRealmOrder: 19 }, choices: [
            { id: 'battle', label: 'Khắc Chiến Văn', description: 'Lấy tài nguyên chiến/pháp bảo, nền giảm nhẹ.', resultText: 'Đan văn chạy như một vết kiếm quanh Kim Đan, thiên về phản ứng trong chiến đấu.', effects: { resources: { 'resource.artifact_dust': 5, 'resource.cultivation_essence': 8 },}, significance: 30, tags: ['Combat', 'Artifact', 'GoldenCore'] },
            { id: 'craft', label: 'Khắc Bách Nghệ Văn', description: 'Đẩy nghề đang còn thấp.', resultText: 'Đan văn chia ba nhánh nhỏ, mô phỏng đan hỏa, khí hỏa và phù văn.', effects: { professionMastery: { alchemy: 5, forging: 5, talisman: 5 } }, significance: 30, tags: ['Alchemy', 'Forging', 'Talisman', 'GoldenCore'] },
            { id: 'pure', label: 'Không khắc, dưỡng thuần', description: 'Không nhận tài nguyên, đổi lấy nền và sạch.', resultText: 'Ngươi để Đan văn tự sinh, chậm nhưng ít tạp niệm nhất.', effects: {}, significance: 32, tags: ['Cultivation', 'Stability', 'GoldenCore'] },
        ], tags: ['GoldenCore', 'BuildChoice', 'Milestone'],
    },
];
export const verticalSliceContentEvents = Object.fromEntries(events.map(event => [event.id, event]));
export const verticalSliceContentPacks = Object.fromEntries([
    ['pack.slice.qi', 'Vertical Slice · Luyện Khí', 'Các quyết định nhỏ chen giữa chuỗi bế quan để build hình thành trước Trúc Cơ.'],
    ['pack.slice.foundation', 'Vertical Slice · Trúc Cơ', 'Định hướng nền móng và nghề thay vì chỉ tăng tu vi.'],
    ['pack.slice.purple', 'Vertical Slice · Tử Phủ', 'Ép người chơi chọn nơi dồn tài nguyên trước Kim Đan.'],
    ['pack.slice.golden', 'Vertical Slice · Kim Đan', 'Đóng dấu identity của đoạn chơi đầu bằng Đan văn lựa chọn.'],
].map(([id, name, description]) => [id, { id, name, description, eventIds: events.filter(event => event.packId === id).map(event => event.id) }]));
//# sourceMappingURL=vertical-slice-content-pack.js.map