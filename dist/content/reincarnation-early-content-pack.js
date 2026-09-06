const event = (definition) => definition;
/**
 * Vertical-slice repeat-life content. The point is not to skip the early game; it is to make
 * the same realm band ask different questions once the account has history.
 */
export const reincarnationEarlyContentEvents = Object.fromEntries([
    // ── Life 2: deja-vu, deliberate divergence, first proof that reincarnation changed the run. ──
    event({
        id: 'event.relife2.before_dawn', packId: 'pack.relife.life2', title: 'Trước Bình Minh Một Nhịp',
        teaser: 'Ngươi mở mắt trước tiếng gà gáy. Căn phòng xa lạ, nhưng cảm giác “đã từng bắt đầu lại” thì không xa lạ chút nào.', priority: 108,
        condition: { lifeNumbers: [2], locationIds: ['location.thanh_ha_town'], maxRealmOrder: 0 },
        choices: [
            { id: 'trust_body', label: 'Tin vào nền tảng mới', description: 'Không cố nhớ kiếp trước; thử xem Mệnh Thai đời này tự đi được bao xa.', resultText: 'Ngươi bỏ qua ký ức mơ hồ, bắt đầu bằng việc cảm nhận từng mạch khí của thân thể mới.', effects: { tuVi: 35 }, significance: 22, tags: ['Reincarnation', 'Body'] },
            { id: 'trace_memory', label: 'Lần theo cảm giác quen thuộc', description: 'Đổi chút ổn định lấy tốc độ nhập môn.', resultText: 'Ngươi thử vận khí theo một đường mạch gần như bản năng. Thân mới đau nhẹ, nhưng linh khí vào nhanh hơn.', effects: { tuVi: 72, injury: 2 }, significance: 20, tags: ['Reincarnation', 'Memory'] },
        ], tags: ['RepeatLife', 'Life2'],
    }),
    event({
        id: 'event.relife2.memory_fragment', packId: 'pack.relife.legacy', title: 'Một Đoạn Ký Ức Không Thuộc Đêm Nay',
        teaser: 'Trong lúc nhập định, một câu khẩu quyết cũ nổi lên rồi biến mất trước khi ngươi kịp nhớ trọn.', priority: 103,
        condition: { lifeNumbers: [2], minRealmOrder: 1, maxRealmOrder: 4, requiresInheritedMemory: true },
        choices: [
            { id: 'follow', label: 'Bám lấy nhịp khẩu quyết', description: 'Ký ức không cho sức mạnh miễn phí, nhưng giúp ngươi hiểu công pháp hiện tại nhanh hơn.', resultText: 'Ngươi không nhớ trọn công pháp cũ, chỉ giữ lại được một nhịp vận khí. Nhịp đó lại vừa đủ sửa một chỗ vụng trong cách tu hiện tại.', effects: { tuVi: 55 }, significance: 23, tags: ['Memory', 'Cultivation'] },
            { id: 'let_go', label: 'Để ký ức tự chìm xuống', description: 'Giữ tâm cảnh sạch, lấy một chút ổn định.', resultText: 'Ngươi không cưỡng cầu. Ký ức chìm xuống, tâm thần lại sáng hơn một phần.', effects: {}, significance: 16, tags: ['Memory', 'Restraint'] },
        ], tags: ['RepeatLife', 'Legacy'],
    }),
    event({
        id: 'event.relife2.mingji_pressure', packId: 'pack.relife.life2', title: 'Cùng Là Luyện Khí, Nhưng Không Còn Giống Trước',
        teaser: 'Linh lực vừa đầy một vòng, ngươi đã nhận ra thân thể này chịu được áp lực mà đời trước từng phải dè chừng.', priority: 97,
        condition: { lifeNumbers: [2], minRealmOrder: 1, maxRealmOrder: 3, minMingJi: 8 },
        choices: [
            { id: 'press', label: 'Ép thử giới hạn mới', description: 'Dùng nền Mệnh Cơ để tôi mạch; mạnh hơn nhưng vẫn có rủi ro.', resultText: 'Ngươi chủ động đẩy chu thiên lên sát ngưỡng. Mệnh Thai đời này không vỡ; nó đáp lại bằng một nền mạch chắc hơn.', effects: { injury: 3, tuVi: 45 }, significance: 22, tags: ['MingJi', 'Risk'] },
            { id: 'measure', label: 'Chỉ đo, không ép', description: 'An toàn; giữ hiểu biết cho thăng cảnh.', resultText: 'Ngươi dừng đúng lúc và ghi nhớ cảm giác giới hạn. Kinh nghiệm ấy biến thành sự chuẩn bị rất thực tế cho lần thăng cảnh tới.', effects: {}, significance: 17, tags: ['MingJi', 'Preparation'] },
        ], tags: ['RepeatLife', 'Life2'],
    }),
    event({
        id: 'event.relife2.change_route', packId: 'pack.relife.life2', title: 'Đường Cũ Hay Đường Mới',
        teaser: 'Trước ngã ba Thanh Hư Sơn và Hắc Phong Lâm, trực giác tiền kiếp khiến cả hai con đường đều quen một cách khó chịu.', priority: 91,
        condition: { lifeNumbers: [2], locationIds: ['location.thanh_ha_town', 'location.thanh_hu_mountain'], minRealmOrder: 1, maxRealmOrder: 5 },
        choices: [
            { id: 'old', label: 'Đi con đường đã từng thắng', description: 'Ổn định, lấy tài nguyên chắc chắn.', resultText: 'Ngươi chọn lối quen và tránh được những sai lầm cũ. Không có kỳ tích, nhưng thu hoạch rất sạch.', effects: { resources: { 'resource.spirit_stone': 7, 'resource.spirit_herb': 4 } }, significance: 15, tags: ['Reliable'] },
            { id: 'new', label: 'Cố ý đi con đường khác', description: 'Ít chắc chắn hơn, đổi lấy nền khám phá.', resultText: 'Ngươi rời lối quen, gặp một đoạn linh mạch nhỏ không có trong ký ức. Kiếp này bắt đầu thật sự trở thành một đời khác.', effects: { unlockLocationIds: ['location.spirit_field_plain'],}, significance: 23, tags: ['Exploration', 'Divergence'] },
        ], tags: ['RepeatLife', 'Life2'],
    }),
    event({
        id: 'event.relife2.first_clear_instinct', packId: 'pack.relife.life2', title: 'Thủ Vệ Vẫn Là Nó, Người Đã Khác',
        teaser: 'Sau khi lại công phá Tụ Linh Động, ngươi nhớ rõ đời trước từng coi chiến thắng này là một cột mốc lớn.', priority: 93,
        condition: { lifeNumbers: [2], requiredDungeonFloors: [{ dungeonId: 'dungeon.spirit_gathering_cave', minFloor: 1 }], minRealmOrder: 1, maxRealmOrder: 6 },
        choices: [
            { id: 'study_loot', label: 'Mổ xẻ chiến lợi phẩm ngay', description: 'Đặt trọng tâm vào build, nhận nguyên liệu trang bị.', resultText: 'Ngươi không vội bế quan. Từng đường linh văn trên chiến lợi phẩm được xem như một bài học về build đầu đời.', effects: { resources: { 'resource.forging_essence': 5, 'resource.artifact_dust': 3 } }, significance: 19, tags: ['Loot', 'Build'] },
            { id: 'push_floor', label: 'Dùng khí thế chuẩn bị tầng sau', description: 'Đổi loot phụ lấy chuẩn bị thăng cảnh.', resultText: 'Ngươi giữ khí thế chiến thắng, lập tức điều tức theo nhịp chiến đấu vừa qua.', effects: { tuVi: 60 }, significance: 19, tags: ['Momentum', 'Cultivation'] },
        ], tags: ['RepeatLife', 'Life2', 'Dungeon'],
    }),
    event({
        id: 'event.relife2.dao_seed_dream', packId: 'pack.relife.legacy', title: 'Đạo Chủng Chưa Nảy Mầm',
        teaser: 'Một ý niệm rất sâu ngủ trong thần hồn. Hiện tại ngươi chưa đủ cảnh giới gọi tên nó, nhưng nó vẫn âm thầm sửa cách ngươi nhìn chiến đấu.', priority: 90,
        condition: { lifeNumbers: [2], minRealmOrder: 2, maxRealmOrder: 9, requiresInheritedDaoSeed: true },
        choices: [
            { id: 'temper', label: 'Không cưỡng ngộ Đạo, chỉ luyện nền tu hành', description: 'Đạo Chủng chỉ định hướng; hiện tại dùng nó để chỉnh nền.', resultText: 'Ngươi không cố vượt cấp lĩnh Đạo. Chỉ vài nhịp trực giác cũng đủ khiến nền tu hành gọn hơn.', effects: {}, significance: 22, tags: ['DaoSeed', 'Foundation'] },
            { id: 'combat', label: 'Đưa trực giác vào chiêu thức', description: 'Lấy một ít tài nguyên và chiến đấu làm nơi thử nghiệm.', resultText: 'Ngươi để ý niệm tiền kiếp chảy qua từng lần ra tay, nhưng không gọi nó là Đạo. Chưa tới lúc.', effects: { resources: { 'resource.cultivation_essence': 8 }, tuVi: 35 }, significance: 19, tags: ['DaoSeed', 'Combat'] },
        ], tags: ['RepeatLife', 'Legacy'],
    }),
    event({
        id: 'event.relife2.karma_tug', packId: 'pack.relife.legacy', title: 'Sợi Nhân Quả Kéo Nhẹ',
        teaser: 'Giữa đám đông Vân Hải Thành, ngươi bất chợt quay đầu dù không ai gọi tên mình.', priority: 86,
        condition: { lifeNumbers: [2], locationIds: ['location.cloud_sea_city', 'location.thanh_ha_town'], requiresInheritedKarma: true, minRealmOrder: 1 },
        choices: [
            { id: 'follow', label: 'Đi theo cảm giác', description: 'Không bảo đảm gặp đúng người; chỉ nuôi độ nhạy với nhân quả.', resultText: 'Ngươi đi qua ba con phố rồi dừng. Không gặp người cũ, nhưng cảm giác nhân quả đã rõ hơn trước.', effects: { resources: { 'resource.spirit_stone': 4 } }, significance: 18, tags: ['Karma', 'Memory'] },
            { id: 'ignore', label: 'Đời này không sống bằng bóng đời trước', description: 'Cắt sự lệ thuộc vào ký ức, đổi lấy tâm cảnh sạch.', resultText: 'Ngươi quay đi. Nhân quả vẫn còn, nhưng quyết định hiện tại thuộc về đời này.', effects: {}, significance: 19, tags: ['Karma', 'Independence'] },
        ], tags: ['RepeatLife', 'Legacy'],
    }),
    event({
        id: 'event.relife2.relic_echo', packId: 'pack.relife.legacy', title: 'Di Vật Ở Một Nơi Nào Đó',
        teaser: 'Một pháp bảo từng theo ngươi qua đời trước vẫn tồn tại trong thế giới. Thân mới chưa đủ sức gọi nó về, nhưng cộng hưởng đã xuất hiện.', priority: 85,
        condition: { lifeNumbers: [2], minRealmOrder: 3, requiresBoundRelic: true },
        choices: [
            { id: 'answer', label: 'Đáp lại cộng hưởng', description: 'Lấy Bảo Khí Tàn Tinh và một đầu mối Tàn Bảo Các.', resultText: 'Ngươi gửi một tia thần niệm yếu ớt theo cộng hưởng. Không gọi được di vật, nhưng xác định được một phương vị mơ hồ.', effects: { resources: { 'resource.artifact_dust': 6 }, unlockDungeonIds: ['dungeon.ruined_treasure_pavilion'] }, significance: 24, tags: ['Relic', 'Artifact'] },
            { id: 'wait', label: 'Đợi thân này đủ mạnh', description: 'Không để di vật kéo lệch progression đời mới.', resultText: 'Ngươi cắt cộng hưởng. Di vật vẫn ở đó; đời này trước hết phải tự đứng vững.', effects: {}, significance: 17, tags: ['Relic', 'Restraint'] },
        ], tags: ['RepeatLife', 'Legacy'],
    }),
    event({
        id: 'event.relife2.bear_reckoning', packId: 'pack.relife.life2', title: 'Yêu Hùng Không Biết Luân Hồi',
        teaser: 'Thiết Bì Yêu Hùng lại chặn khe núi. Nó không nhớ đời trước, nhưng ngươi nhớ rõ từng cú vồ.', priority: 99,
        condition: { lifeNumbers: [2], locationIds: ['location.black_wind_forest', 'location.thanh_hu_mountain'], minRealmOrder: 4, maxRealmOrder: 9 },
        choices: [
            { id: 'challenge', label: 'Đánh bằng build đời này', description: 'Một benchmark cố định: xem Mệnh Cơ và lựa chọn mới đã khác đời trước tới đâu.', resultText: 'Ngươi bước vào khe núi, lần này không mang tâm thế của kẻ lần đầu gặp boss.', combat: { entityId: 'entity.elite.iron_hide_demon_bear', onWin: { resources: { 'resource.spirit_stone': 20, 'resource.forging_essence': 7 },}, onLose: { injury: 12 }, completeOnLoss: false, loseText: 'Ký ức giúp ngươi sống sót, nhưng build đời này vẫn chưa đủ. Yêu Hùng không quan tâm ngươi đã từng thắng nó hay chưa.' }, significance: 34, tags: ['Benchmark', 'BossMilestone', 'Combat'] },
            { id: 'skip', label: 'Không cần chứng minh lại', description: 'Luân hồi không có nghĩa phải replay mọi boss.', resultText: 'Ngươi đi vòng. Một đời mới không cần lặp lại tất cả chiến công cũ.', effects: { resources: { 'resource.spirit_stone': 3 } }, significance: 10, tags: ['Choice', 'Divergence'] },
        ], tags: ['RepeatLife', 'Life2', 'Boss'],
    }),
    // ── Life 3: specialization. The player has seen the loop; now ask what this life is FOR. ──
    event({
        id: 'event.relife3.declare_intent', packId: 'pack.relife.life3', title: 'Đời Này Tu Vì Điều Gì',
        teaser: 'Sau hai lần bắt đầu lại, câu hỏi đầu tiên không còn là “tu thế nào”, mà là “đời này sẽ chứng minh điều gì”.', priority: 112,
        condition: { lifeNumbers: [3], locationIds: ['location.thanh_ha_town'], maxRealmOrder: 0 },
        choices: [
            { id: 'combat', label: 'Lấy chiến đấu làm thước đo', description: 'Ưu tiên nền tu hành và tài nguyên combat đầu đời.', resultText: 'Ngươi quyết đời này sẽ đo mọi tiến bộ bằng những đối thủ mà mình có thể đánh bại.', effects: { resources: { 'resource.cultivation_essence': 6, 'resource.forging_essence': 3 } }, significance: 24, tags: ['Intent', 'Combat'] },
            { id: 'cultivation', label: 'Lấy nền tu hành làm trọng', description: 'Ổn định thân thể và chuẩn bị thăng cảnh.', resultText: 'Ngươi quyết không chạy theo từng trận thắng; mục tiêu là dựng một nền tu hành sạch hơn hai đời trước.', effects: {}, significance: 24, tags: ['Intent', 'Cultivation'] },
            { id: 'explore', label: 'Đời này cố ý đi nơi chưa đi', description: 'Mở sớm một tuyến khám phá.', resultText: 'Ngươi đánh dấu những nơi hai đời trước từng bỏ qua. Kiếp thứ ba sẽ không là bản sao.', effects: { unlockLocationIds: ['location.spirit_field_plain'], resources: { 'resource.spirit_stone': 4 } }, significance: 24, tags: ['Intent', 'Exploration'] },
        ], tags: ['RepeatLife', 'Life3'],
    }),
    event({
        id: 'event.relife3.orientation_resonance', packId: 'pack.relife.life3', title: 'Mệnh Thai Có Thiên Hướng',
        teaser: 'Lần chuyển sinh này, khuôn Mệnh Thai không còn hoàn toàn ngẫu nhiên. Sự thiên lệch bắt đầu hiện ra khi linh khí nhập thân.', priority: 100,
        condition: { lifeNumbers: [3], minRealmOrder: 1, maxRealmOrder: 4, minReincarnationSealLevel: 1 },
        choices: [
            { id: 'lean', label: 'Thuận theo thiên hướng', description: 'Đẩy thế mạnh hiện tại lên thêm một chút.', resultText: 'Ngươi không cố biến mình thành người toàn năng. Mệnh Thai muốn đi đâu, ngươi để nó đi sâu hơn ở đó.', effects: { tuVi: 45 }, significance: 23, tags: ['FateEmbryo', 'Specialization'] },
            { id: 'balance', label: 'Bù vào điểm yếu', description: 'Ít bùng nổ hơn, đổi lấy độ ổn định.', resultText: 'Ngươi dùng hai đời kinh nghiệm để không bị thiên hướng kéo lệch quá xa.', effects: {}, significance: 20, tags: ['FateEmbryo', 'Balance'] },
        ], tags: ['RepeatLife', 'Life3'],
    }),
    event({
        id: 'event.relife3.dao_embryo_echo', packId: 'pack.relife.life3', title: 'Đạo Thai Chưa Thành Đạo',
        teaser: 'Mệnh Thai thiên Đạo khiến từng chiêu thức đều có cảm giác “còn một tầng nghĩa khác”, dù Hóa Thần vẫn còn rất xa.', priority: 96,
        condition: { lifeNumbers: [3], minRealmOrder: 2, maxRealmOrder: 9, orientationIds: ['dao_embryo'], requiresInheritedDaoSeed: true },
        choices: [
            { id: 'discipline', label: 'Giữ Đạo Chủng ngủ yên', description: 'Không vượt cấp; biến trực giác thành nền chiến đấu.', resultText: 'Ngươi ép mọi “đốn ngộ” chưa đúng lúc trở lại thành kỷ luật trong từng thức.', effects: {}, significance: 25, tags: ['DaoSeed', 'DaoEmbryo'] },
            { id: 'experiment', label: 'Thử một lối đánh trái thói quen', description: 'Dùng Đạo Chủng như la bàn, không như sức mạnh.', resultText: 'Ngươi cố ý đổi nhịp ra tay. Không có Đạo Vực nào xuất hiện, chỉ có một build bớt máy móc hơn.', effects: { resources: { 'resource.cultivation_essence': 7 }, tuVi: 40 }, significance: 21, tags: ['DaoSeed', 'Build'] },
        ], tags: ['RepeatLife', 'Life3', 'Legacy'],
    }),
    event({
        id: 'event.relife3.battle_body_trial', packId: 'pack.relife.life3', title: 'Chiến Thể Phải Chịu Đòn Được',
        teaser: 'Thiên Sinh Chiến Thể không có ý nghĩa nếu chỉ nhìn con số. Huyền Thiết Khoáng Động là nơi thử xem thân này thực sự chịu được bao nhiêu.', priority: 95,
        condition: { lifeNumbers: [3], minRealmOrder: 2, maxRealmOrder: 8, orientationIds: ['battle_body'], requiredDungeonFloors: [{ dungeonId: 'dungeon.black_iron_mine', minFloor: 1 }] },
        choices: [
            { id: 'temper', label: 'Dùng khoáng áp luyện thân', description: 'Đổi thương nhẹ lấy nền sinh tồn.', resultText: 'Ngươi để khoáng áp ép lên toàn thân cho tới khi hô hấp gần đứt nhịp rồi mới lui.', effects: { injury: 5 }, significance: 25, tags: ['Body', 'Specialization'] },
            { id: 'forge', label: 'Lấy khoáng rèn đồ', description: 'Không ép thân; tăng tài nguyên build.', resultText: 'Ngươi không tự hành xác. Huyền Thiết được đưa vào build đúng chỗ vẫn là sức mạnh thật.', effects: { resources: { 'resource.black_iron_ore': 9, 'resource.forging_essence': 5 } }, significance: 20, tags: ['Forging', 'Build'] },
        ], tags: ['RepeatLife', 'Life3'],
    }),
    event({
        id: 'event.relife3.myriad_arts_choice', packId: 'pack.relife.life3', title: 'Biết Nhiều Không Có Nghĩa Dùng Hết',
        teaser: 'Vạn Pháp Thai khiến nhiều pháp môn đều có vẻ “hợp”. Hai đời trước đủ để ngươi hiểu cái bẫy của việc ôm tất cả cùng lúc.', priority: 92,
        condition: { lifeNumbers: [3], minRealmOrder: 2, maxRealmOrder: 9, orientationIds: ['myriad_arts'] },
        choices: [
            { id: 'focus', label: 'Chọn một nhịp làm lõi', description: 'Chuyên sâu trước, breadth để sau.', resultText: 'Ngươi ghi lại hàng loạt ý tưởng nhưng chỉ giữ một nhịp vận khí làm lõi. Vạn Pháp không đồng nghĩa tạp pháp.', effects: {}, significance: 24, tags: ['Technique', 'Focus'] },
            { id: 'sample', label: 'Thử nhiều pháp môn ở mức nông', description: 'Lấy tài nguyên/tri thức thay vì foundation.', resultText: 'Ngươi thử từng phương pháp ngắn rồi dừng trước khi chúng xung đột.', effects: { resources: { 'resource.alchemy_essence': 3, 'resource.forging_essence': 3, 'resource.artifact_dust': 3 } }, significance: 20, tags: ['Technique', 'Breadth'] },
        ], tags: ['RepeatLife', 'Life3'],
    }),
    event({
        id: 'event.relife3.old_relic_new_owner', packId: 'pack.relife.life3', title: 'Di Vật Cũ, Chủ Nhân Mới',
        teaser: 'Cộng hưởng với di vật tiền kiếp mạnh hơn đời thứ hai. Nhưng pháp bảo nhớ người cũ, còn thân thể hiện tại chưa chắc là cùng một người.', priority: 90,
        condition: { lifeNumbers: [3], minRealmOrder: 5, requiresBoundRelic: true },
        choices: [
            { id: 'earn', label: 'Không gọi về bằng danh nghĩa cũ', description: 'Tự mở Tàn Bảo Các và tìm lại bằng sức đời này.', resultText: 'Ngươi quyết sẽ đoạt lại di vật như một tu sĩ đời này, không như kẻ đòi lại tài sản cũ.', effects: { unlockDungeonIds: ['dungeon.ruined_treasure_pavilion'], resources: { 'resource.artifact_dust': 5 } }, significance: 26, tags: ['Relic', 'Identity'] },
            { id: 'call', label: 'Dùng Luân Hồi Ấn gọi cộng hưởng', description: 'Không nhận item miễn phí; chỉ lấy phương vị rõ hơn.', resultText: 'Ấn luân hồi rung nhẹ. Vị trí di vật rõ hơn, nhưng phong ấn vẫn phải tự phá.', effects: { resources: { 'resource.artifact_dust': 8, 'resource.sword_fragment': 2 } }, significance: 22, tags: ['Relic', 'Reincarnation'] },
        ], tags: ['RepeatLife', 'Life3', 'Legacy'],
    }),
    event({
        id: 'event.relife3.karma_choice', packId: 'pack.relife.life3', title: 'Người Cũ Không Phải Nghĩa Vụ',
        teaser: 'Một sợi nhân quả tiền kiếp kéo ngươi về phía một khuôn mặt quen mà đời này chưa từng gặp.', priority: 88,
        condition: { lifeNumbers: [3], minRealmOrder: 3, requiresInheritedKarma: true },
        choices: [
            { id: 'honor', label: 'Tôn trọng nhân quả cũ', description: 'Giữ tâm thế mở, nhận chút tài nguyên thiện duyên.', resultText: 'Ngươi không ép đối phương nhớ lại điều gì. Chỉ để mối duyên có cơ hội tự lớn lên lần nữa.', effects: { resources: { 'resource.spirit_stone': 7 },}, significance: 21, tags: ['Karma', 'Relationship'] },
            { id: 'release', label: 'Cho cả hai quyền bắt đầu lại', description: 'Cắt áp lực từ đời trước, tăng độ sạch tâm cảnh.', resultText: 'Ngươi thừa nhận nhân quả rồi buông tay. Nếu còn duyên, đời này sẽ tự gặp lại.', effects: {}, significance: 22, tags: ['Karma', 'Freedom'] },
        ], tags: ['RepeatLife', 'Life3', 'Legacy'],
    }),
    event({
        id: 'event.relife3.fixed_benchmark', packId: 'pack.relife.life3', title: 'Một Cột Mốc Không Scale Theo Ngươi',
        teaser: 'Ngươi quay lại Tụ Linh Động không vì tài nguyên, mà vì muốn nhìn một đối thủ cố định và biết mình đã mạnh hơn bao nhiêu qua ba đời.', priority: 87,
        condition: { lifeNumbers: [3], requiredDungeonFloors: [{ dungeonId: 'dungeon.spirit_gathering_cave', minFloor: 2 }], minRealmOrder: 2, maxRealmOrder: 9 },
        choices: [
            { id: 'record', label: 'Ghi lại benchmark đời 3', description: 'Tăng ít foundation; sự kiện được Vạn Thế Sử coi là mốc so sánh.', resultText: 'Ngươi ghi thời gian, thương thế và nhịp công pháp sau trận. Kẻ địch không mạnh lên theo ngươi; vì thế cột mốc này có ý nghĩa.', effects: { resources: { 'resource.cultivation_essence': 6 } }, significance: 24, tags: ['Benchmark', 'Record'] },
            { id: 'move_on', label: 'Không cần đo nữa', description: 'Dùng thời gian cho tuyến mới.', resultText: 'Ngươi khép lại trang so sánh. Ba đời đủ để biết mình đã không còn là người cũ.', effects: { resources: { 'resource.spirit_stone': 5 } }, significance: 14, tags: ['Choice'] },
        ], tags: ['RepeatLife', 'Life3', 'Benchmark'],
    }),
    event({
        id: 'event.relife3.third_path', packId: 'pack.relife.life3', title: 'Ba Đời, Một Lần Tự Chọn Khó Khăn',
        teaser: 'Ngươi có thể dùng kinh nghiệm để đi con đường dễ nhất, hoặc cố tình chọn một thứ mà hai đời trước chưa từng làm tốt.', priority: 84,
        condition: { lifeNumbers: [3], locationIds: ['location.thanh_hu_mountain', 'location.cloud_sea_city', 'location.herb_market'], minRealmOrder: 4, maxRealmOrder: 9 },
        choices: [
            { id: 'strength', label: 'Đẩy sở trường tới cực hạn', description: 'Lấy tài nguyên trực tiếp cho build cá nhân.', resultText: 'Ngươi thôi giả vờ cân bằng. Đời này sẽ dùng sở trường để nghiền nát những gì từng là nút thắt.', effects: { resources: { 'resource.cultivation_essence': 10, 'resource.spirit_stone': 8 },}, significance: 22, tags: ['Specialization', 'Power'] },
            { id: 'weakness', label: 'Cố ý luyện điểm yếu', description: 'Ít reward hơn, nhưng tăng chuẩn bị và độ ổn định.', resultText: 'Ngươi chọn thứ mình từng né. Không hào nhoáng, nhưng một điểm yếu thật sự bắt đầu được xử lý.', effects: {}, significance: 24, tags: ['Bottleneck', 'Growth'] },
        ], tags: ['RepeatLife', 'Life3'],
    }),
].map(item => [item.id, item]));
export const reincarnationEarlyContentPacks = {
    'pack.relife.life2': { id: 'pack.relife.life2', name: 'Đời Hai · Tái Chứng', description: 'Không replay tutorial; dùng déjà-vu, Mệnh Cơ và benchmark cố định để chứng minh đời sau khác đời trước.', eventIds: Object.values(reincarnationEarlyContentEvents).filter(e => e.packId === 'pack.relife.life2').map(e => e.id) },
    'pack.relife.life3': { id: 'pack.relife.life3', name: 'Đời Ba · Định Hướng', description: 'Đời thứ ba bắt đầu ép người chơi chọn mục tiêu/sở trường thay vì chỉ đi lại đường cũ.', eventIds: Object.values(reincarnationEarlyContentEvents).filter(e => e.packId === 'pack.relife.life3').map(e => e.id) },
    'pack.relife.legacy': { id: 'pack.relife.legacy', name: 'Di Sản Tái Hiện', description: 'Sự kiện chỉ xuất hiện khi người chơi thật sự mang Ký Ức, Đạo Chủng, Nhân Quả hoặc Di Vật qua luân hồi.', eventIds: Object.values(reincarnationEarlyContentEvents).filter(e => e.packId === 'pack.relife.legacy').map(e => e.id) },
};
//# sourceMappingURL=reincarnation-early-content-pack.js.map