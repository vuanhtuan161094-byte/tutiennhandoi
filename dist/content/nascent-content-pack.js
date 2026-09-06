const event = (definition) => definition;
const nascentEventList = [
    // 1) Kim Đan viên mãn -> Nguyên Anh.
    event({
        id: 'event.nascent.bridge.core_cracks', packId: 'pack.nascent.bridge', title: 'Kim Đan Sinh Linh', teaser: 'Kim Đan viên mãn xuất hiện một tia linh tính như có thứ gì đang muốn phá xác mà ra.', priority: 103,
        condition: { minRealmOrder: 21, maxRealmOrder: 21 },
        choices: [
            { id: 'listen', label: 'Lắng nghe linh tính trong Đan', description: 'Ổn định nền, chuẩn bị kết Anh.', resultText: 'Ngươi không cưỡng ép. Một điểm linh quang trong Kim Đan dần có nhịp riêng.', effects: { soulInsight: 4 }, significance: 34, tags: ['GoldenCore', 'NascentSoulHint'] },
            { id: 'force', label: 'Cưỡng thúc linh quang', description: 'Lấy tiến độ nhanh nhưng tổn hồn.', resultText: 'Ngươi cưỡng ép linh quang lớn lên. Kim Đan rung dữ dội, thần niệm đau như bị xé.', effects: { tuVi: 1800, soulStability: -4, injury: 5 }, significance: 28, tags: ['Risk', 'NascentSoulHint'] },
        ], tags: ['NascentSoul', 'Bridge'],
    }),
    event({
        id: 'event.nascent.bridge.purple_mirror_soul', packId: 'pack.nascent.bridge', title: 'Kính Hồ Chiếu Anh', teaser: 'Tử Kính Hồ phản chiếu một bóng người nhỏ ngồi bên trong Kim Đan, dù Nguyên Anh còn chưa thành.', priority: 98,
        condition: { locationIds: ['location.purple_mirror_lake'], minRealmOrder: 21, maxRealmOrder: 22 },
        choices: [
            { id: 'trace', label: 'Theo bóng phản chiếu', description: 'Mở Hồn Tức Uyên và nhận Dưỡng Hồn Lộ.', resultText: 'Bóng trong hồ chỉ về một khe sâu đầy hồn vụ. Ngươi ghi lại đường tới Hồn Tức Uyên.', effects: { unlockLocationIds: ['location.soul_echo_abyss'], resources: { 'resource.soul_dew': 10 }, soulInsight: 3 }, significance: 29, tags: ['Soul', 'Exploration'] },
        ], tags: ['NascentSoul', 'Bridge'],
    }),
    event({
        id: 'event.nascent.bridge.starfall_avatar', packId: 'pack.nascent.bridge', title: 'Kiếm Ý Phân Niệm', teaser: 'Tinh Lạc Kiếm Hồn để lại một phương pháp tách một sợi thần niệm khỏi bản thể mà không làm tan kiếm tâm.', priority: 93,
        condition: { locationIds: ['location.starfall_cliff'], minRealmOrder: 21, knownSkillIds: ['skill.sword_pressure'] },
        choices: [
            { id: 'study', label: 'Tách một sợi niệm', description: 'Nhận insight Thần Hồn và mở Vân Đài.', resultText: 'Ngươi tách một sợi kiếm niệm rồi thu về ngay trước khi nó tan. Đây chưa phải Phân Thân, nhưng đã là tiền đề.', effects: { soulInsight: 5, unlockLocationIds: ['location.nascent_cloud_platform'] }, significance: 26, tags: ['Sword', 'Soul'] },
        ], tags: ['NascentSoul', 'Bridge', 'Sword'],
    }),
    event({
        id: 'event.nascent.bridge.soul_moss', packId: 'pack.nascent.bridge', title: 'Dưỡng Thần Đài Thành Tinh', teaser: 'Dưỡng Thần Đài lâu năm trong Tử Vụ Trạch kết ra một lớp linh dịch có thể ôn dưỡng thần niệm.', priority: 82,
        condition: { locationIds: ['location.purple_mist_marsh'], minRealmOrder: 20, maxRealmOrder: 22 },
        choices: [
            { id: 'refine', label: 'Tinh luyện linh dịch', description: 'Lấy Dưỡng Hồn Lộ và giảm tạp.', resultText: 'Ngươi lọc bỏ độc vụ, chỉ giữ phần linh tính trong suốt.', effects: { resources: { 'resource.soul_dew': 8, 'resource.soul_moss': -2 }, soulPurity: 2 }, significance: 20, tags: ['Soul', 'Resource'] },
            { id: 'leave', label: 'Không động tới độc vụ', description: 'Giữ an toàn.', resultText: 'Ngươi bỏ qua linh dịch, chỉ ghi lại phương pháp hình thành của nó.', effects: { soulInsight: 2 }, significance: 10, tags: ['Knowledge'] },
        ], tags: ['NascentSoul', 'Bridge'],
    }),
    event({
        id: 'event.nascent.bridge.huyet_soul_trial', packId: 'pack.nascent.bridge', title: 'Huyết Hà Luyện Thần', teaser: 'Huyết sát ở Huyết Hà Cốc đủ mạnh để ép thần niệm hiện hình, nhưng sai một bước sẽ tổn thương tinh thần.', priority: 88,
        condition: { locationIds: ['location.blood_river_gorge'], minRealmOrder: 21, maxRealmOrder: 22 },
        choices: [
            { id: 'endure', label: 'Dùng huyết sát luyện thần', description: 'Tăng ổn định hồn, chịu thương.', resultText: 'Ngươi giữ thần niệm giữa huyết sát, để từng lớp áp lực mài cho ý thức cô đọng hơn.', effects: { soulStability: 4, soulStrength: 3, injury: 5 }, significance: 24, tags: ['Soul', 'Risk'] },
        ], tags: ['NascentSoul', 'Bridge', 'Blood'],
    }),
    event({
        id: 'event.nascent.bridge.open_pool', packId: 'pack.nascent.bridge', title: 'Dưỡng Hồn Trì Lộ Diện', teaser: 'Sau khi thần niệm đủ cô đọng, ngươi cảm được một cổ trì bị che dưới Hồn Tức Uyên.', priority: 106,
        condition: { locationIds: ['location.soul_echo_abyss'], minRealmOrder: 22 },
        choices: [
            { id: 'mark', label: 'Khắc thần niệm ấn', description: 'Mở Dưỡng Hồn Trì.', resultText: 'Ngươi dùng Nguyên Anh thần niệm mở một lối ổn định vào Dưỡng Hồn Trì.', effects: { unlockDungeonIds: ['dungeon.soul_nourishing_pool'], resources: { 'resource.soul_dew': 6 } }, significance: 35, tags: ['Dungeon', 'Soul'] },
        ], tags: ['NascentSoul', 'DungeonHint'],
    }),
    // 2) Nguyên Anh core.
    event({
        id: 'event.nascent.core.first_awaken', packId: 'pack.nascent.core', title: 'Nguyên Anh Khai Mục', teaser: 'Nguyên Anh vừa thành, lần đầu mở mắt bên trong khí hải.', priority: 110,
        condition: { minRealmOrder: 22, maxRealmOrder: 22, minSoulStrength: 100 },
        choices: [
            { id: 'stabilize', label: 'Ổn định Anh thể', description: 'Tăng Hồn cường độ/độ ổn định.', resultText: 'Ngươi để Nguyên Anh ngồi yên, đồng bộ nhịp hô hấp với bản thể cho tới khi thần niệm không còn rung.', effects: { soulStrength: 6, soulPurity: 3, soulStability: 5, soulInsight: 3 }, significance: 42, tags: ['Soul', 'Milestone'] },
        ], tags: ['NascentSoul', 'Core'],
    }),
    event({
        id: 'event.nascent.core.divine_sense', packId: 'pack.nascent.core', title: 'Thần Thức Ngoại Phóng', teaser: 'Thần niệm không còn bị da thịt khóa chặt; thế giới quanh thân bắt đầu hiện bằng một giác quan mới.', priority: 96,
        condition: { minRealmOrder: 22, maxRealmOrder: 24, minSoulStrength: 105 },
        choices: [
            { id: 'wide', label: 'Mở rộng phạm vi', description: 'Tăng Hồn cường độ và học Hồn Châm.', resultText: 'Thần thức quét qua đá cây như nước, rồi co lại thành một điểm sắc bén.', effects: { soulStrength: 4, soulInsight: 3, learnSkillIds: ['skill.soul_piercing_needle'] }, significance: 28, tags: ['Soul', 'Skill'] },
            { id: 'fine', label: 'Luyện độ tinh vi', description: 'Tăng độ thuần và ổn định.', resultText: 'Ngươi không mở rộng xa, chỉ dùng thần thức phân biệt từng hạt bụi trong phạm vi gần.', effects: { soulPurity: 4, soulStability: 3 }, significance: 25, tags: ['Soul', 'Control'] },
        ], tags: ['NascentSoul', 'Core'],
    }),
    event({
        id: 'event.nascent.core.exit_body', packId: 'pack.nascent.core', title: 'Nguyên Anh Xuất Khiếu', teaser: 'Một đêm yên tĩnh, Nguyên Anh có thể tạm rời thân thể mà không lập tức tan.', priority: 101,
        condition: { minRealmOrder: 22, minSoulStrength: 112, minSoulStability: 78 },
        choices: [
            { id: 'attempt', label: 'Xuất khiếu một khắc', description: 'Học kỹ năng Xuất Khiếu.', resultText: 'Nguyên Anh rời mi tâm, nhìn bản thể từ bên ngoài lần đầu tiên rồi trở về an toàn.', effects: { learnSkillIds: ['skill.nascent_soul_exit'], soulInsight: 6, soulStability: 2 }, significance: 38, tags: ['Soul', 'Skill', 'Milestone'] },
        ], tags: ['NascentSoul', 'Core'],
    }),
    event({
        id: 'event.nascent.core.guard', packId: 'pack.nascent.core', title: 'Hồn Giáp Nội Sinh', teaser: 'Khi thần thức bị kích động, Nguyên Anh tự nhiên co thần niệm thành một lớp phòng hộ.', priority: 84,
        condition: { minRealmOrder: 22, minSoulStability: 80 },
        choices: [
            { id: 'shape', label: 'Định hình hồn giáp', description: 'Học Nguyên Anh Hộ Thể.', resultText: 'Ngươi biến phản xạ phòng hộ thành pháp môn có thể chủ động kích phát.', effects: { learnSkillIds: ['skill.nascent_soul_guard'], soulStability: 3 }, significance: 23, tags: ['Soul', 'Defense'] },
        ], tags: ['NascentSoul', 'Core'],
    }),
    event({
        id: 'event.nascent.core.chain', packId: 'pack.nascent.core', title: 'Niệm Thành Xích', teaser: 'Thần thức đủ cô đọng để không chỉ cảm nhận mà còn trói buộc ý thức đối phương.', priority: 85,
        condition: { minRealmOrder: 23, minSoulStrength: 125 },
        choices: [
            { id: 'learn', label: 'Ngưng Hồn Xích', description: 'Học Hồn Xích Trói Niệm.', resultText: 'Ngươi nén thần niệm thành từng mắt xích vô hình, thử khóa một vật dẫn thần thức.', effects: { learnSkillIds: ['skill.soul_chain_bind'], soulInsight: 4 }, significance: 25, tags: ['Soul', 'Control'] },
        ], tags: ['NascentSoul', 'Core'],
    }),
    event({
        id: 'event.nascent.core.mid_stabilize', packId: 'pack.nascent.core', title: 'Anh Thể Trưởng Thành', teaser: 'Nguyên Anh trung kỳ không còn chỉ là “một đứa trẻ trong khí hải”; thần niệm bắt đầu mang dấu ấn bản ngã rõ rệt.', priority: 91,
        condition: { minRealmOrder: 23, maxRealmOrder: 25 },
        choices: [
            { id: 'identity', label: 'Khắc dấu bản ngã', description: 'Tăng Hồn cường độ/độ thuần.', resultText: 'Ngươi dùng ký ức, Đạo tâm và khí cơ hiện kiếp khắc lên Anh thể một tầng dấu ấn riêng.', effects: { soulStrength: 5, soulPurity: 4, soulInsight: 4 }, significance: 29, tags: ['Soul', 'Identity'] },
        ], tags: ['NascentSoul', 'Core'],
    }),
    // 3) Phân Thân / Dưỡng Hồn Trì.
    event({
        id: 'event.nascent.clone.first_seed', packId: 'pack.nascent.clone', title: 'Một Niệm Thành Song', teaser: 'Sau khi Nguyên Anh ổn định, ngươi thử giữ một sợi thần niệm độc lập lâu hơn bình thường.', priority: 105,
        condition: { minRealmOrder: 22, maxCloneCount: 0, minSoulStrength: 108 },
        choices: [
            { id: 'prepare', label: 'Chuẩn bị Phân Thân', description: 'Nhận nguyên liệu Hồn, chưa tự tạo phân thân.', resultText: 'Ngươi chuẩn bị một phần thần niệm làm “hạt giống”, nhưng chưa tách nó khỏi bản thể.', effects: { resources: { 'resource.soul_dew': 12, 'resource.soul_essence': 4 }, soulInsight: 4 }, significance: 26, tags: ['Clone', 'Preparation'] },
        ], tags: ['NascentSoul', 'Clone'],
    }),
    event({
        id: 'event.nascent.clone.first_echo', packId: 'pack.nascent.clone', title: 'Phân Thân Có Tiếng Vọng', teaser: 'Sau một thời gian hoạt động, Phân Thân bắt đầu trả về những cảm giác không hoàn toàn trùng với bản thể.', priority: 92,
        condition: { minRealmOrder: 22, minCloneCount: 1 },
        choices: [
            { id: 'merge', label: 'Đồng bộ ký ức', description: 'Tăng insight, ổn định Hồn.', resultText: 'Ngươi thu những trải nghiệm của Phân Thân về, bỏ phần trùng lặp và giữ lại góc nhìn khác biệt.', effects: { soulInsight: 6, soulStability: 2 }, significance: 27, tags: ['Clone', 'Insight'] },
        ], tags: ['NascentSoul', 'Clone'],
    }),
    event({
        id: 'event.nascent.clone.specialize', packId: 'pack.nascent.clone', title: 'Phân Công Một Đạo', teaser: 'Phân Thân làm cùng một loại việc đủ lâu bắt đầu hình thành thói quen vận hành thần niệm riêng.', priority: 80,
        condition: { minRealmOrder: 22, minCloneCount: 1 },
        choices: [
            { id: 'accept', label: 'Giữ chuyên môn riêng', description: 'Tăng tải Hồn nhưng thu thêm insight.', resultText: 'Ngươi không ép Phân Thân trở lại giống bản thể hoàn toàn, chấp nhận một chút khác biệt để đổi lấy hiệu suất.', effects: { soulInsight: 4, soulStrength: 2, soulStability: -1 }, significance: 20, tags: ['Clone', 'Specialization'] },
        ], tags: ['NascentSoul', 'Clone'],
    }),
    event({
        id: 'event.nascent.clone.pool_floor2', packId: 'pack.nascent.clone', title: 'Liên Hoa Dưỡng Hồn', teaser: 'Tầng hai Dưỡng Hồn Trì có một đóa hồn liên chỉ nở khi cảm được nhiều luồng thần niệm cùng lúc.', priority: 90,
        condition: { minRealmOrder: 22, minCloneCount: 1, requiredDungeonFloors: [{ dungeonId: 'dungeon.soul_nourishing_pool', minFloor: 2 }] },
        choices: [
            { id: 'nourish', label: 'Cùng Phân Thân dưỡng hồn', description: 'Tăng độ thuần/ổn định.', resultText: 'Bản thể và Phân Thân cùng ngồi quanh hồn liên, điều chỉnh nhịp thần niệm cho tới khi không còn xung đột.', effects: { soulPurity: 4, soulStability: 5, resources: { 'resource.soul_dew': 8 } }, significance: 28, tags: ['Clone', 'Dungeon'] },
        ], tags: ['NascentSoul', 'Clone', 'Dungeon'],
    }),
    event({
        id: 'event.nascent.clone.overload_warning', packId: 'pack.nascent.clone', title: 'Thần Hồn Quá Tải', teaser: 'Nhiều Phân Thân cùng hoạt động khiến bản thể xuất hiện những khoảng trống chú ý ngắn.', priority: 108, oneShot: false,
        condition: { minRealmOrder: 23, minCloneCount: 2, minSoulLoadRatio: 0.90 },
        choices: [
            { id: 'rest', label: 'Thu niệm dưỡng thần', description: 'Tăng ổn định, không mở thêm tải.', resultText: 'Ngươi thu thần niệm về gần bản thể, để những phần ký ức chồng lấn dần tách rõ.', effects: { soulStability: 5, soulPurity: 2 }, significance: 22, tags: ['Clone', 'Warning'] },
        ], tags: ['NascentSoul', 'Clone', 'Pressure'],
    }),
    event({
        id: 'event.nascent.clone.mirror_boss', packId: 'pack.nascent.clone', title: 'Kính Sinh Nguyên Anh', teaser: 'Một Nguyên Anh phản chiếu trong Dưỡng Hồn Trì bắt chước chính nhịp thần thức của người tới gần.', priority: 107,
        condition: { minRealmOrder: 23, requiredDungeonFloors: [{ dungeonId: 'dungeon.soul_nourishing_pool', minFloor: 3 }] },
        choices: [
            { id: 'fight', label: 'Đấu Kính Sinh Nguyên Anh', description: 'Boss Hồn; thua được thử lại.', resultText: 'Bóng phản chiếu mở mắt, thần thức của nó lập tức bám theo từng chuyển động của ngươi.', combat: { entityId: 'entity.boss.nascent_mirror_child', onWin: { resources: { 'resource.soul_essence': 8, 'resource.soul_dew': 16 }, soulStrength: 5, soulInsight: 6 }, onLose: { injury: 10, soulStability: -3 }, completeOnLoss: false, loseText: 'Kính Sinh Nguyên Anh bẻ gãy nhịp thần thức; ngươi phải rút lui dưỡng hồn.' }, significance: 46, tags: ['Soul', 'Boss', 'Clone'] },
        ], tags: ['NascentSoul', 'Clone', 'Boss'],
    }),
    // 4) Thanh Hư Nguyên Anh.
    event({
        id: 'event.nascent.sect.soul_archive', packId: 'pack.nascent.sect', title: 'Tàng Kinh Các · Anh Hồn Thiên', teaser: 'Tàng Kinh Các mở một tầng cấm chỉ dành cho Nguyên Anh trưởng lão.', priority: 94,
        condition: { locationIds: ['location.thanh_hu_sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 22 },
        choices: [
            { id: 'guard', label: 'Đổi Nguyên Anh Hộ Thể', description: 'Tiêu công đức học Hồn phòng.', resultText: 'Ngươi đổi một thiên bí chú chuyên bảo hộ Anh thể.', effects: { factionMerit: -20, learnSkillIds: ['skill.nascent_soul_guard'], soulInsight: 2 }, significance: 22, tags: ['Sect', 'Soul'] },
            { id: 'needle', label: 'Đổi Thần Hồn Châm', description: 'Tiêu công đức học Hồn công.', resultText: 'Ngươi chọn một môn thần thức công kích ngắn gọn nhưng sắc bén.', effects: { factionMerit: -20, learnSkillIds: ['skill.soul_piercing_needle'], soulInsight: 2 }, significance: 22, tags: ['Sect', 'Soul'] },
        ], tags: ['NascentSoul', 'Sect'],
    }),
    event({
        id: 'event.nascent.sect.guardian_duty', packId: 'pack.nascent.sect', title: 'Trấn Thủ Hộ Sơn Thần Niệm', teaser: 'Một trưởng lão Nguyên Anh được giao giữ mắt trận thần niệm trong Hộ Sơn Đại Trận.', priority: 82,
        condition: { locationIds: ['location.thanh_hu_sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 22 },
        choices: [
            { id: 'serve', label: 'Trấn thủ ba tháng', description: 'Nhận công đức và Hồn insight.', resultText: 'Ngươi nối thần thức với đại trận, học cách giữ một ý niệm ổn định dù hàng trăm tín hiệu cùng truyền tới.', effects: { factionMerit: 34, soulStability: 3, soulInsight: 3 }, significance: 23, tags: ['Sect', 'Formation'] },
        ], tags: ['NascentSoul', 'Sect'],
    }),
    event({
        id: 'event.nascent.sect.teach_clones', packId: 'pack.nascent.sect', title: 'Phân Thân Giảng Pháp', teaser: 'Tông môn đề nghị để Phân Thân thay bản thể giảng một buổi cho nội môn đệ tử.', priority: 86,
        condition: { locationIds: ['location.thanh_hu_sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 22, minCloneCount: 1 },
        choices: [
            { id: 'teach', label: 'Để Phân Thân giảng pháp', description: 'Nhận công đức, kiểm tra độ ổn định phân thân.', resultText: 'Phân Thân giảng hết một buổi mà không lộ loạn niệm. Bản thể cũng hiểu rõ hơn những phần kiến thức trước đây chỉ biết theo trực giác.', effects: { factionMerit: 28, soulInsight: 4, soulStability: 2 }, significance: 25, tags: ['Sect', 'Clone', 'Teaching'] },
        ], tags: ['NascentSoul', 'Sect', 'Clone'],
    }),
    event({
        id: 'event.nascent.sect.luo_discussion', packId: 'pack.nascent.sect', title: 'Lạc Thanh Dao Luận Anh', teaser: 'Lạc Thanh Dao muốn so sánh cách mỗi người giữ “bản ngã” khi thần niệm đã có thể rời thân.', priority: 79,
        condition: { locationIds: ['location.thanh_hu_sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 22, relation: { npcId: 'npc.luo_qingyao', minRespect: 8 } },
        choices: [
            { id: 'discuss', label: 'Luận một đêm', description: 'Tăng quan hệ và Hồn insight.', resultText: 'Hai người tranh luận tới sáng về việc Phân Thân là công cụ hay một phần của chính mình.', effects: { relationships: [{ npcId: 'npc.luo_qingyao', trust: 4, respect: 5, karmaDepth: 2 }], soulInsight: 5 }, significance: 24, tags: ['Relationship', 'Soul'] },
        ], tags: ['NascentSoul', 'Sect', 'Relationship'],
    }),
    event({
        id: 'event.nascent.sect.pool_supply', packId: 'pack.nascent.sect', title: 'Tông Môn Cấp Dưỡng Hồn Vật', teaser: 'Sau khi hoàn thành đủ trách nhiệm, tông môn cấp một phần vật tư để dưỡng Anh thể.', priority: 74,
        condition: { locationIds: ['location.thanh_hu_sect'], requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 23 },
        choices: [
            { id: 'receive', label: 'Nhận vật tư', description: 'Tiêu công đức đổi Hồn tài nguyên.', resultText: 'Ngươi nhận một hộp Dưỡng Hồn Lộ và vài khối Hồn Tinh từ nội khố.', effects: { factionMerit: -18, resources: { 'resource.soul_dew': 18, 'resource.soul_essence': 5 } }, significance: 17, tags: ['Sect', 'Resource'] },
        ], tags: ['NascentSoul', 'Sect'],
    }),
    event({
        id: 'event.nascent.sect.warden_trial', packId: 'pack.nascent.sect', title: 'Hộ Linh Thí Thần', teaser: 'Tông môn mượn Dưỡng Hồn Trì Hộ Linh làm khảo nghiệm cho trưởng lão Nguyên Anh.', priority: 101,
        condition: { requiredFactionId: 'faction.thanh_hu_sect', minRealmOrder: 23, requiredDungeonFloors: [{ dungeonId: 'dungeon.soul_nourishing_pool', minFloor: 2 }] },
        choices: [
            { id: 'fight', label: 'Nhận khảo nghiệm', description: 'Đấu Hộ Linh; thất bại được retry.', resultText: 'Hộ Linh dựng một tầng hồn quang, ép thần thức của ngươi co lại.', combat: { entityId: 'entity.boss.soul_pool_warden', onWin: { factionMerit: 42, soulStrength: 4, resources: { 'resource.soul_essence': 5 } }, onLose: { injury: 8, soulStability: -2 }, completeOnLoss: false }, significance: 42, tags: ['Sect', 'Boss', 'Soul'] },
        ], tags: ['NascentSoul', 'Sect', 'Boss'],
    }),
    // 5) Tán tu Nguyên Anh.
    event({
        id: 'event.nascent.wanderer.abyss_market', packId: 'pack.nascent.wanderer', title: 'Hồn Tức Dạ Thị', teaser: 'Một nhóm Nguyên Anh tán tu lén trao đổi vật dẫn thần thức ở đáy Hồn Tức Uyên.', priority: 84,
        condition: { locationIds: ['location.soul_echo_abyss'], forbidFactionMembership: true, minRealmOrder: 22 },
        choices: [
            { id: 'buy', label: 'Đổi hồn vật', description: 'Tiêu linh thạch lấy Hồn tài nguyên.', resultText: 'Ngươi đổi linh thạch lấy một lô vật tư không ghi xuất xứ.', effects: { resources: { 'resource.spirit_stone': -45, 'resource.soul_dew': 16, 'resource.soul_essence': 4 } }, significance: 18, tags: ['Wanderer', 'Trade'] },
            { id: 'observe', label: 'Chỉ quan sát', description: 'Lấy insight.', resultText: 'Ngươi ghi nhớ cách các tán tu kiểm tra thần niệm thật giả trên hồn vật.', effects: { soulInsight: 3 }, significance: 12, tags: ['Wanderer', 'Knowledge'] },
        ], tags: ['NascentSoul', 'Wanderer'],
    }),
    event({
        id: 'event.nascent.wanderer.mingluo_trade', packId: 'pack.nascent.wanderer', title: 'Minh La Tán Nhân Đổi Thuật', teaser: 'Minh La Tán Nhân muốn đổi một môn Hồn thuật lấy tài nguyên Tử Vụ.', priority: 87,
        condition: { locationIds: ['location.purple_mist_marsh'], forbidFactionMembership: true, minRealmOrder: 22, requiredResources: { 'resource.purple_mist_venom': 5 } },
        choices: [
            { id: 'trade', label: 'Đổi năm phần Độc Tủy', description: 'Học Hồn Xích.', resultText: 'Minh La Tán Nhân nhận Độc Tủy rồi truyền cho ngươi một đoạn Hồn Xích pháp.', effects: { resources: { 'resource.purple_mist_venom': -5 }, learnSkillIds: ['skill.soul_chain_bind'], relationships: [{ npcId: 'npc.mingluo_sanren', trust: 3, respect: 4, karmaDepth: 1 }] }, significance: 22, tags: ['Wanderer', 'Trade', 'Soul'] },
        ], tags: ['NascentSoul', 'Wanderer'],
    }),
    event({
        id: 'event.nascent.wanderer.cloud_platform', packId: 'pack.nascent.wanderer', title: 'Vân Đài Không Chủ', teaser: 'Nguyên Anh Vân Đài không thuộc thế lực nào; tán tu có thể dùng nơi đây làm điểm luyện Xuất Khiếu.', priority: 91,
        condition: { locationIds: ['location.nascent_cloud_platform'], forbidFactionMembership: true, minRealmOrder: 22 },
        choices: [
            { id: 'claim', label: 'Khắc một thần niệm ấn', description: 'Tăng ổn định và lấy Hồn tinh.', resultText: 'Ngươi để lại một thần niệm ấn đủ rõ để nhận ra, nhưng không tuyên bố chiếm cả Vân Đài.', effects: { soulStability: 4, resources: { 'resource.soul_essence': 4 } }, significance: 22, tags: ['Wanderer', 'Soul'] },
        ], tags: ['NascentSoul', 'Wanderer'],
    }),
    event({
        id: 'event.nascent.wanderer.clone_errand', packId: 'pack.nascent.wanderer', title: 'Phân Thân Đi Một Đường', teaser: 'Một Phân Thân đủ ổn để tự hoàn thành một chuyến thu thập ngắn mà bản thể không cần theo sát.', priority: 83,
        condition: { forbidFactionMembership: true, minRealmOrder: 22, minCloneCount: 1 },
        choices: [
            { id: 'send', label: 'Cho Phân Thân tự xử lý', description: 'Nhận tài nguyên và insight.', resultText: 'Phân Thân hoàn thành chuyến đi, bản thể chỉ nhận về ký ức đã nén gọn cùng vật tư.', effects: { resources: { 'resource.soul_dew': 6, 'resource.spirit_stone': 15 }, soulInsight: 4 }, significance: 19, tags: ['Wanderer', 'Clone'] },
        ], tags: ['NascentSoul', 'Wanderer', 'Clone'],
    }),
    event({
        id: 'event.nascent.wanderer.soul_eater', packId: 'pack.nascent.wanderer', title: 'Phệ Hồn U Ảnh', teaser: 'Một U Ảnh chuyên săn thần thức bám theo dấu Phân Thân quanh Hồn Tức Uyên.', priority: 96,
        condition: { locationIds: ['location.soul_echo_abyss'], forbidFactionMembership: true, minRealmOrder: 22 },
        choices: [
            { id: 'fight', label: 'Diệt U Ảnh', description: 'Đấu elite Hồn hệ.', resultText: 'U Ảnh lao thẳng vào thần thức thay vì thân thể.', combat: { entityId: 'entity.elite.soul_eater_wraith', onWin: { resources: { 'resource.soul_essence': 5, 'resource.soul_dew': 9 }, soulStrength: 2 }, onLose: { injury: 7, soulStability: -3 }, completeOnLoss: false }, significance: 31, tags: ['Wanderer', 'Combat', 'Soul'] },
        ], tags: ['NascentSoul', 'Wanderer', 'Combat'],
    }),
    event({
        id: 'event.nascent.wanderer.old_method', packId: 'pack.nascent.wanderer', title: 'Tàn Pháp Phân Hồn', teaser: 'Một tấm ngọc giản cũ mô tả phương pháp chia thần niệm cực thô, nguy hiểm nhưng có vài nguyên lý đáng học.', priority: 79,
        condition: { forbidFactionMembership: true, minRealmOrder: 23 },
        choices: [
            { id: 'extract', label: 'Chỉ lấy nguyên lý an toàn', description: 'Tăng insight/độ thuần.', resultText: 'Ngươi bỏ phần cưỡng xé thần hồn, chỉ giữ lại cách đồng bộ ký ức giữa nhiều niệm tuyến.', effects: { soulInsight: 6, soulPurity: 3 }, significance: 23, tags: ['Wanderer', 'Knowledge'] },
            { id: 'force', label: 'Thử bản cổ pháp', description: 'Tăng mạnh insight nhưng giảm ổn định.', resultText: 'Ngươi thử một đoạn cổ pháp rồi lập tức dừng khi cảm thấy bản ngã rung lắc.', effects: { soulInsight: 10, soulStrength: 3, soulStability: -7, injury: 3 }, significance: 26, tags: ['Wanderer', 'Risk'] },
        ], tags: ['NascentSoul', 'Wanderer'],
    }),
    // 6) Build / boss Nguyên Anh.
    event({
        id: 'event.nascent.build.lightning_soul', packId: 'pack.nascent.builds', title: 'Lôi Quang Tôi Anh', teaser: 'Lôi Linh Căn có thể dùng lôi lực rất nhỏ để mài biên giới Anh thể mà không đánh vào bản thể.', priority: 92,
        condition: { locationIds: ['location.thunder_valley'], minRealmOrder: 22, spiritualRootIds: ['root.lightning'] },
        choices: [
            { id: 'temper', label: 'Dẫn vi lôi tôi Anh', description: 'Tăng Hồn cường độ và học Hồn Chấn.', resultText: 'Từng tia lôi mảnh đi qua Anh thể như kim châm, khiến thần niệm đau nhưng cô đọng.', effects: { soulStrength: 5, soulPurity: 2, learnSkillIds: ['skill.soul_shock_break'],}, significance: 26, tags: ['Lightning', 'Soul'] },
        ], tags: ['NascentSoul', 'Build'],
    }),
    event({
        id: 'event.nascent.build.sword_soul', packId: 'pack.nascent.builds', title: 'Kiếm Niệm Xuất Khiếu', teaser: 'Kiếm tu thử để Nguyên Anh cầm một sợi kiếm niệm thay vì pháp bảo thật.', priority: 93,
        condition: { locationIds: ['location.starfall_cliff', 'location.nascent_cloud_platform'], minRealmOrder: 22, knownSkillIds: ['skill.sword_pressure'] },
        choices: [
            { id: 'sever', label: 'Lấy niệm làm kiếm', description: 'Tăng insight và Hồn cường độ.', resultText: 'Nguyên Anh cầm kiếm niệm chém qua một sợi thần thức tạp loạn, không làm tổn thương vật chất.', effects: { soulInsight: 5, soulStrength: 4, learnSkillIds: ['skill.soul_piercing_needle'] }, significance: 27, tags: ['Sword', 'Soul'] },
        ], tags: ['NascentSoul', 'Build'],
    }),
    event({
        id: 'event.nascent.build.poison_soul', packId: 'pack.nascent.builds', title: 'Độc Không Nhập Anh', teaser: 'Bách Độc Thể phải học cách để độc lực quanh thân không ăn mòn chính Nguyên Anh.', priority: 88,
        condition: { locationIds: ['location.purple_mist_marsh'], minRealmOrder: 22, physiqueIds: ['physique.hundred_poison'] },
        choices: [
            { id: 'separate', label: 'Tách Độc và Hồn', description: 'Tăng độ thuần/ổn định.', resultText: 'Ngươi dựng một lớp ranh giới giữa độc vận và Anh thể; độc vẫn mạnh nhưng thần niệm sạch hơn.', effects: { soulPurity: 5, soulStability: 3,}, significance: 24, tags: ['Poison', 'Soul'] },
        ], tags: ['NascentSoul', 'Build'],
    }),
    event({
        id: 'event.nascent.build.fire_soul', packId: 'pack.nascent.builds', title: 'Anh Hỏa Bất Diệt', teaser: 'Hỏa tu phát hiện Đan Hỏa cũ có thể chuyển thành một điểm hỏa quang bảo hộ Nguyên Anh.', priority: 88,
        condition: { locationIds: ['location.core_fire_mountain'], minRealmOrder: 22, spiritualRootIds: ['root.fire', 'root.metal_fire'] },
        choices: [
            { id: 'ignite', label: 'Dưỡng Anh Hỏa', description: 'Tăng Hồn phòng và học U Hồn Hỏa.', resultText: 'Một điểm hỏa quang bám quanh Anh thể, chỉ cháy khi thần niệm bị xâm nhập.', effects: { soulStability: 4, soulStrength: 3, learnSkillIds: ['skill.ghost_soul_flame'] }, significance: 25, tags: ['Fire', 'Soul'] },
        ], tags: ['NascentSoul', 'Build'],
    }),
    event({
        id: 'event.nascent.build.soul_storm', packId: 'pack.nascent.builds', title: 'Thần Niệm Thành Bão', teaser: 'Nguyên Anh hậu kỳ có thể khuếch đại thần thức thành một vùng áp lực liên tục thay vì một đòn đơn lẻ.', priority: 95,
        condition: { minRealmOrder: 24, minSoulStrength: 155 },
        choices: [
            { id: 'learn', label: 'Ngưng Thần Hồn Bạo', description: 'Học Hồn Bạo.', resultText: 'Ngươi thử mở thần thức thành vòng rồi ép nó quay quanh một tâm điểm, cuối cùng tạo được một cơn hồn bạo ổn định.', effects: { learnSkillIds: ['skill.soul_storm'], soulInsight: 6, soulStrength: 3 }, significance: 31, tags: ['Soul', 'Skill'] },
        ], tags: ['NascentSoul', 'Build'],
    }),
    event({
        id: 'event.nascent.build.pool_warden_finale', packId: 'pack.nascent.builds', title: 'Dưỡng Hồn Trì · Lục Tầng', teaser: 'Tầng cuối Hộ Linh không còn thử thân thể mà trực tiếp ép Nguyên Anh rời khỏi vùng an toàn.', priority: 112,
        condition: { minRealmOrder: 25, requiredDungeonFloors: [{ dungeonId: 'dungeon.soul_nourishing_pool', minFloor: 5 }], minSoulStrength: 170 },
        choices: [
            { id: 'fight', label: 'Công phá tầng cuối', description: 'Boss milestone Nguyên Anh; thua được thử lại.', resultText: 'Hộ Linh mở toàn bộ hồn vực của cổ trì, sáu tầng thần niệm đồng thời ép xuống.', combat: { entityId: 'entity.boss.soul_pool_warden', onWin: { resources: { 'resource.soul_essence': 14, 'resource.soul_dew': 28, 'resource.artifact_dust': 8 }, soulStrength: 7, soulPurity: 4, soulStability: 5, soulInsight: 8 }, onLose: { injury: 15, soulStability: -5 }, completeOnLoss: false, loseText: 'Hồn vực ép Anh thể rung mạnh; ngươi lui xuống tầng năm, lần sau phải chuẩn bị kỹ hơn.' }, significance: 54, tags: ['Soul', 'Boss', 'Milestone', 'LegacyCandidate'] },
        ], tags: ['NascentSoul', 'Boss', 'Milestone'],
    }),
];
export const nascentContentEvents = Object.fromEntries(nascentEventList.map(e => [e.id, e]));
const packMeta = [
    ['pack.nascent.bridge', 'Kim Đan Viên Mãn · Kết Anh', 'Cầu nối từ Kim Đan viên mãn tới Nguyên Anh và Thần Hồn.'],
    ['pack.nascent.core', 'Nguyên Anh · Anh Thể Sơ Thành', 'Thần thức, xuất khiếu, hồn phòng và trưởng thành Anh thể.'],
    ['pack.nascent.clone', 'Nguyên Anh · Phân Thân', 'Phân Thân, tải Thần Hồn và Dưỡng Hồn Trì.'],
    ['pack.nascent.sect', 'Thanh Hư · Nguyên Anh', 'Nội dung tông môn dành cho Nguyên Anh và Phân Thân.'],
    ['pack.nascent.wanderer', 'Tán Tu · Nguyên Anh', 'Đường tán tu, hồn vật và luyện thần ngoài tông môn.'],
    ['pack.nascent.builds', 'Nguyên Anh · Cơ Duyên Theo Build', 'Lôi/Hỏa/Kiếm/Độc và boss milestone hồn hệ.'],
];
export const nascentContentPacks = Object.fromEntries(packMeta.map(([id, name, description]) => [id, {
        id, name, description, eventIds: nascentEventList.filter(e => e.packId === id).map(e => e.id),
    }]));
//# sourceMappingURL=nascent-content-pack.js.map