import { WORLD_YEARS_PER_REAL_HOUR } from './realtime-balance.js';
import { bundleSummaryLines } from './birth-origins-v101.js';

import { categoryDisplayName } from './life.js';
// V141: journey/read-model orchestration is isolated from the facade shell.
export function buildGameplayFlow() {
        const state = this.session.state;
        const life = this.session.currentLife;
        const realm = this.registry.realm(state.realm.realmId);
        const settled = this.session.meta.archives.some(item => item.lifeId === life.lifeId);
        const phase = state.alive ? 'living' : settled ? 'dead-settled' : 'dead-unsettled';
        const root = this.registry.spiritualRoot(state.character.spiritualRootId).name;
        const birthLines = life.birth.originsV101
            ? [...bundleSummaryLines(life.birth.originsV101)]
            : [`Xuất thân: ${life.birth.family}`, `Linh Căn: ${root} · Tư chất ${life.birth.aptitude}/100 · Khí vận ${life.birth.luck}/100`, `Mệnh: ${life.birth.fate}`];
        if (!life.birth.originsV101 && life.birth.physique)
            birthLines.push(`Thể chất: ${life.birth.physique}`);
        if (!life.birth.originsV101 && life.birth.bloodline)
            birthLines.push(`Huyết mạch: ${life.birth.bloodline}`);
        if (life.lifeNumber > 1) {
            const reincarnation = this.session.reincarnationSummary();
            birthLines.push(`Di sản: Mệnh Cơ ${(this.session.meta.mingJi ?? 0).toFixed(1)} · ${reincarnation.sealName} · CP ${this.session.meta.currentCp}`);
        }
        const unlockedSystems = ['Tu Luyện', 'Nhân Vật', 'Chiến Lực Cá Nhân', 'Du Hành', 'Nhật Ký'];
        const lockedHints = [];
        if (state.realm.maxRealmOrder >= 1)
            unlockedSystems.push('Chiến Đấu', 'Săn Yêu', 'Thu Thập', 'Phó Bản', 'Hành Trang', 'Trang Bị');
        else
            lockedHints.push('Bước vào Luyện Khí để mở Săn Yêu, Phó Bản và Hành Trang chiến đấu.');
        if (state.realm.maxRealmOrder >= 10)
            unlockedSystems.push('Kỹ Năng', 'Định Đạo', 'Động Phủ', 'Bộ Sưu Tập', 'Gacha', 'Pháp Bảo', 'Linh Thú', 'Tri Kỷ', 'Nghề Nghiệp', 'Luân Hồi');
        else
            lockedHints.push('Trúc Cơ mở Định Đạo, Kỹ Năng Bản Đạo, Động Phủ, Bộ Sưu Tập và Pháp Bảo.');
        if (this.session.factionMembership())
            unlockedSystems.push('Tông Môn (tùy chọn)');
        if (state.realm.maxRealmOrder >= 22)
            unlockedSystems.push('Thần Hồn', 'Phân Thân');
        if (state.realm.maxRealmOrder >= 26)
            unlockedSystems.push('Đạo', 'Đạo Vực');
        else if (state.realm.maxRealmOrder >= 22)
            lockedHints.push('Hóa Thần sẽ chính thức mở Chủ Đạo, Đạo Ý và Đạo Vực sơ khai.');
        else if (state.realm.maxRealmOrder >= 18)
            lockedHints.push('Nguyên Anh sẽ mở Thần Hồn và Phân Thân treo song song.');
        if (state.realm.maxRealmOrder >= 1 || life.lifeNumber > 1)
            unlockedSystems.push('Định Hướng');
        if (life.lifeNumber > 1 || this.session.meta.completedLives > 0)
            unlockedSystems.push('Vạn Thế', 'Mệnh Thai');
        const routine = state.flow?.offlineRoutine ? this.describeRoutine(state.flow.offlineRoutine) : undefined;
        const storyCompleted = new Set(state.flow?.firstLifeStory?.completedBeatIds ?? []);
        const firstLifePath = state.flow?.firstLifeStory?.path;
        let currentThread;
        const actions = [];
        if (phase === 'dead-unsettled') {
            actions.push({ key: 'settle', label: 'Kết Toán Một Đời', description: 'Xem biên niên, điểm, CP và Căn Nguyên.', emphasis: 'primary', command: { type: 'settleLife' } });
            actions.push({ key: 'journal', label: 'Đọc Nhật Ký Lần Cuối', description: 'Xem các mốc đáng nhớ trước khi kết toán.', emphasis: 'normal', view: 'journal' });
        }
        else if (phase === 'dead-settled') {
            actions.push({ key: 'settlement', label: 'Xem Kết Toán', description: 'Mở lại tổng kết của đời vừa kết thúc.', emphasis: 'normal', view: 'settlement' });
            actions.push({ key: 'reincarnate', label: 'Chuyển Sinh', description: 'Bắt đầu đời kế tiếp; thế giới tiếp tục trôi.', emphasis: 'primary', command: { type: 'reincarnate' } });
        }
        else {
            let storyPrimary = false;
            if (life.lifeNumber === 1) {
                if (!storyCompleted.has('first.awakening')) {
                    currentThread = 'Khai mở tu hành: gặp Tần Thủ Nhất ở Thanh Hà Trấn.';
                    actions.push({ key: 'story-awakening', label: 'Nghe Trưởng Bối Chỉ Điểm', description: 'Nhận vài tài nguyên mở đầu và đầu mối tới Thanh Hư Sơn.', emphasis: 'primary', command: { type: 'firstLifeStory', beatId: 'first.awakening' } });
                    storyPrimary = true;
                }
                else if (state.realm.maxRealmOrder >= 1 && !storyCompleted.has('first.qi_awakened')) {
                    currentThread = 'Đã nhập Luyện Khí: nhận lệnh bài cho lần công phá phó bản đầu.';
                    actions.push({ key: 'story-qi', label: 'Nhận Lệnh Tụ Linh Động', description: 'Tần Thủ Nhất đưa lệnh bài và ít linh thạch chuẩn bị first-clear.', emphasis: 'primary', command: { type: 'firstLifeStory', beatId: 'first.qi_awakened' } });
                    storyPrimary = true;
                }
                else if ((state.dungeons.highestClearedFloor['dungeon.spirit_gathering_cave'] ?? 0) >= 1 && !storyCompleted.has('first.first_clear')) {
                    currentThread = 'First-clear đã gây chú ý: có thư từ Thanh Hư Tông gửi tới.';
                    actions.push({ key: 'story-invite', label: 'Mở Phong Thư Thanh Hư Tông', description: 'Nhận lời dẫn nhập và mở đầu mối tới tông môn.', emphasis: 'primary', command: { type: 'firstLifeStory', beatId: 'first.first_clear' } });
                    storyPrimary = true;
                }
                else if (storyCompleted.has('first.first_clear') && !firstLifePath) {
                    currentThread = 'Thanh Hư Tông đã gửi lời dẫn: có thể bái nhập hoặc giữ thân tán tu.';
                    if (state.locationId === 'location.thanh_hu_sect') {
                        actions.push({ key: 'story-sect', label: 'Bái Nhập Thanh Hư Tông', description: 'Nhận tài nguyên/quan hệ tông môn; không tăng trần sức mạnh cá nhân.', emphasis: 'primary', command: { type: 'firstLifeStory', beatId: 'first.choose_path', path: 'sect' } });
                        actions.push({ key: 'story-wanderer', label: 'Từ Chối · Tiếp Tục Tán Tu', description: 'Giữ tự do; không mất cảnh giới, boss hay trần sức mạnh cá nhân.', emphasis: 'primary', command: { type: 'firstLifeStory', beatId: 'first.choose_path', path: 'wanderer' } });
                        storyPrimary = true;
                    }
                    else if (state.locationId === 'location.thanh_hu_mountain' || state.locationId === 'location.ancient_sword_cave') {
                        actions.push({ key: 'story-travel-sect', label: 'Tới Thanh Hư Tông', description: 'Theo phong thư dẫn nhập tới sơn môn.', emphasis: 'primary', command: { type: 'activity', request: { type: 'explore', targetLocationId: 'location.thanh_hu_sect', durationYears: 0.1, stopOnMajorEvent: true } } });
                        storyPrimary = true;
                    }
                    else if (state.locationId === 'location.thanh_ha_town') {
                        actions.push({ key: 'story-travel-mountain', label: 'Lên Thanh Hư Sơn', description: 'Đi bước đầu trên đường tới Thanh Hư Tông.', emphasis: 'primary', command: { type: 'activity', request: { type: 'explore', targetLocationId: 'location.thanh_hu_mountain', durationYears: 0.1, stopOnMajorEvent: true } } });
                        storyPrimary = true;
                    }
                }
                else if (firstLifePath === 'sect')
                    currentThread = 'Đời đầu: đã bái nhập Thanh Hư Tông; đây là nhánh tài nguyên/quan hệ, còn sức mạnh cá nhân vẫn là trục chính.';
                else if (firstLifePath === 'wanderer')
                    currentThread = 'Đời đầu: đang đi đường tán tu; không bị hụt progression cá nhân, Cổ Kiếm Động là một đầu mối đáng chú ý.';
            }
            if (life.lifeNumber === 1 && storyCompleted.has('first.awakening') && !state.worldSimulation.claimedOpportunityIds.includes('opportunity.riverside_spirit_spring') && state.worldTimeYears <= 30 && state.locationId === 'location.thanh_ha_town') {
                actions.push({ key: 'first-opportunity-claim', label: 'Tự Lấy Hà Biên Tiểu Linh Tuyền', description: 'Nhận toàn bộ cơ duyên nhỏ; người khác sẽ không còn phần.', emphasis: storyPrimary ? 'normal' : 'primary', command: { type: 'worldOpportunity', opportunityId: 'opportunity.riverside_spirit_spring', choice: 'claim' } });
                const guide = state.worldSimulation.npcs['npc.qin_shouyi'];
                if (guide?.alive && guide.locationId === state.locationId) {
                    actions.push({ key: 'first-opportunity-share', label: 'Chia Linh Tuyền Với Tần Thủ Nhất', description: 'Nhận ít tài nguyên hơn nhưng kết thêm thiện duyên thật.', emphasis: 'normal', command: { type: 'worldOpportunity', opportunityId: 'opportunity.riverside_spirit_spring', choice: 'share', npcId: 'npc.qin_shouyi' } });
                }
            }
            const contentEvents = this.session.availableContentEvents(storyPrimary ? 1 : 2);
            if (contentEvents.length > 0 && !currentThread)
                currentThread = `Sự kiện: ${contentEvents[0].title} — ${contentEvents[0].teaser}`;
            if (!currentThread && life.lifeNumber === 2)
                currentThread = 'Đời hai · Tái Chứng: dùng nền Mệnh Cơ để vượt các benchmark cũ, nhưng cố ý chọn ít nhất một con đường khác đời trước.';
            if (!currentThread && life.lifeNumber === 3)
                currentThread = 'Đời ba · Định Hướng: không cần replay mọi thứ; chọn một sở trường hoặc nút thắt cá nhân rồi xây cả đời quanh quyết định đó.';
            const domainNames = { cultivation: 'Tu luyện', technique: 'Công pháp', combat: 'Chiến đấu', alchemy: 'Luyện đan', forging: 'Luyện khí', talisman: 'Phù/Trận', gathering: 'Thu thập', artifact: 'Pháp bảo', dungeon: 'Phó bản', dao: 'Đạo', social: 'Nhân quả', exploration: 'Khám phá', general: 'Tổng hợp' };
            const riskNames = { safe: 'an toàn', cost: 'tốn tài nguyên', injury: 'rủi ro thương thế', combat: 'có chiến đấu' };
            for (const contentEvent of contentEvents) {
                const insights = this.session.contentEventChoiceInsights(contentEvent.id);
                for (const choice of contentEvent.choices) {
                    const insight = insights.find(item => item.choiceId === choice.id);
                    const suffix = insight ? ` [${insight.domains.map(id => domainNames[id] ?? id).join(' + ')} · ${riskNames[insight.risk] ?? insight.risk}]` : '';
                    actions.push({
                        key: `content-${contentEvent.id}-${choice.id}`,
                        label: `【${contentEvent.title}】${choice.label}`,
                        description: `${choice.description}${suffix}`,
                        emphasis: storyPrimary ? 'normal' : 'primary',
                        command: { type: 'contentEvent', eventId: contentEvent.id, choiceId: choice.id },
                    });
                }
            }
            const cultivation = this.session.cultivationSummaryV140();
            if (cultivation.ready && cultivation.transition === 'tribulation') {
                actions.push({ key:'tribulation', label:'Dẫn Thiên Kiếp', description:'Tu Vi đã viên mãn tại cửa Thiên Kiếp.', emphasis:storyPrimary?'normal':'primary', command:{type:'tribulation',intensity:1} });
            } else if (cultivation.ready && cultivation.transition === 'ascend') {
                actions.push({ key:'ascend', label:`Thăng Cảnh ${cultivation.nextRealm}`, description:'Tu Vi đã viên mãn; Thăng Cảnh chắc chắn thành công.', emphasis:storyPrimary?'normal':'primary', command:{type:'ascendRealm'} });
            } else {
                actions.push({ key:'retreat', label:'Bế Quan', description:`Ngân hàng còn ${cultivation.retreat.bankHours.toFixed(1)}h; Bế Quan nhận Tu Vi theo % cảnh giới.`, emphasis:storyPrimary?'normal':'primary', view:'cultivation' });
            }
            if (state.realm.maxRealmOrder >= 1) {
                const hunt = this.session.endlessHuntSummary();
                const dungeonViews = this.dungeons();
                const challenge = dungeonViews.find(dungeon => dungeon.unlocked && dungeon.nextFloor && dungeon.nextFloor.recommendedRealmOrder <= state.realm.maxRealmOrder + 1 && dungeon.readiness?.bandLabel !== 'CỰC NGUY') ?? dungeonViews.find(dungeon => dungeon.unlocked && dungeon.nextFloor && dungeon.nextFloor.recommendedRealmOrder <= state.realm.maxRealmOrder + 1);
                if (challenge?.nextFloor)
                    actions.push({ key: 'challenge', label: `Công Phá ${challenge.name} tầng ${challenge.nextFloor.floor}`, description: `Đánh thủ vệ để mở tầng treo mới${challenge.readiness ? ` · ${challenge.readiness.bandLabel} ${challenge.readiness.ratio.toFixed(2)}×` : ''}.`, emphasis: 'normal', command: { type: 'challengeDungeon', dungeonId: challenge.id, floor: challenge.nextFloor.floor } });
                const farm = dungeonViews.filter(dungeon => dungeon.highestClearedFloor > 0).sort((a, b) => b.highestClearedFloor - a.highestClearedFloor)[0];
                if (farm)
                    actions.push({ key: 'farm', label: `Treo ${farm.name} tầng ${farm.highestClearedFloor}`, description: 'Farm một năm bằng tầng đã công phá.', emphasis: 'normal', command: { type: 'activity', request: { type: 'dungeon', dungeonId: farm.id, floor: farm.highestClearedFloor, durationYears: 1, stopOnMajorEvent: true } } });
                actions.push({ key: 'hunt', label: 'Săn Yêu', description: 'Tìm chiến đấu và tài nguyên tại khu vực hiện tại.', emphasis: 'normal', command: { type: 'activity', request: { type: 'hunt', durationYears: 0.5, maxEncounters: 3, stopOnMajorEvent: true } } });
                actions.push({ key: 'gather', label: 'Thu Thập', description: 'Thu thập tài nguyên quanh nơi đang ở.', emphasis: 'normal', command: { type: 'activity', request: { type: 'gather', durationYears: 1, stopOnMajorEvent: true } } });
            }
            if (routine) {
                actions.push({ key: 'offline-off', label: 'Tắt Hoạt Động Treo', description: `Đang đặt: ${routine}`, emphasis: 'normal', command: { type: 'setOfflineRoutine' } });
            }
            else {
                actions.push({ key: 'offline-idle', label: 'Đặt Tự Tu Khi Offline', description: 'Khi đóng game, bản thể tiếp tục Tự Tu V140; Bế Quan chỉ dùng ngân hàng đăng nhập.', emphasis: 'normal', command: { type: 'setOfflineRoutine', plan: { request: { type: 'idle', durationYears: 200, stopOnMajorEvent: false }, yearsPerRealHour: WORLD_YEARS_PER_REAL_HOUR, maxOfflineYears: 200 } } });
            }
            actions.push({ key: 'map', label: 'Du Hành / Bản Đồ', description: 'Xem nơi đã biết và các hướng có thể đi.', emphasis: 'normal', view: 'locations' });
            if (state.realm.maxRealmOrder >= 22)
                actions.push({ key: 'soul', label: 'Thần Hồn / Phân Thân', description: 'Xem tải Thần Hồn, dưỡng hồn và các Phân Thân đang vận hành.', emphasis: 'normal', view: 'soul' });
            if (state.realm.maxRealmOrder >= 26)
                actions.push({ key: 'dao', label: 'Đạo / Đạo Vực', description: 'Xem Chủ Đạo, diễn giải, depth, Đạo Ngân và Domain.', emphasis: 'normal', view: 'dao' });
            if (life.lifeNumber > 1 || this.session.meta.completedLives > 0 || state.realm.maxRealmOrder >= 110) {
                actions.push({ key: 'fate-embryo', label: 'Mệnh Thai / Mệnh Cơ', description: 'Xem base vĩnh viễn, trần biểu hiện đời này và hệ đang gần chạm giới hạn.', emphasis: 'normal', view: 'fateEmbryo' });
                actions.push({ key: 'reincarnation-view', label: 'Luân Hồi Ấn / Di Sản', description: 'Xem CP, Luân Hồi XP, Fate Lock, Đạo Chủng, Ký Ức, Nhân Quả và Di Vật.', emphasis: 'normal', view: 'reincarnation' });
                actions.push({ key: 'talents-view', label: 'Thiên Phú Luân Hồi', description: 'Tiêu Điểm Thiên Phú vào Công Pháp, chiến đấu, nghề, thu thập và tự động.', emphasis: 'normal', view: 'talents' });
                actions.push({ key: 'myriad-lives', label: 'Vạn Thế Sử', description: 'Xem toàn bộ đời đã kết toán, record và biên niên các kiếp.', emphasis: 'normal', view: 'myriadLives' });
            }
            const passing = this.session.voluntaryPassingEligibility();
            if (passing.ok)
                actions.push({ key: state.realm.maxRealmOrder >= 110 ? 'eternal-reincarnation' : 'meditative-passing', label: state.realm.maxRealmOrder >= 110 ? 'Xả Vĩnh Sinh · Vào Thí Luyện' : 'Tọa Hóa · Kết Đời Có Chủ Đích', description: 'Kết thúc đời hiện tại nhưng chưa chuyển sinh; Cọc Gỗ + Sinh Tồn sẽ chốt reward V2 trước khi sang đời mới.', emphasis: 'normal', command: { type: 'meditativePassing' } });
            actions.push({ key: 'power', label: 'Chiến Lực Cá Nhân', description: 'Xem sức mạnh thật, nguồn tăng trưởng và bottleneck của build hiện tại.', emphasis: 'normal', view: 'power' });
            actions.push({ key: 'character', label: 'Nhân Vật', description: 'Xem Linh Căn, công pháp, skill và Căn Nguyên.', emphasis: 'normal', view: 'character' });
        }
        const indexedActions = actions.map((action, i) => ({ ...action, index: i + 1 }));
        let journey;
        if (life.lifeNumber === 1 && phase === 'living') {
            const order = state.realm.maxRealmOrder;
            const firstClear = (state.dungeons.highestClearedFloor['dungeon.spirit_gathering_cave'] ?? 0) >= 1;
            const specialization = this.session.specializationSkillSummaryV125();
            const specialized = Boolean(specialization.mainDaoId && specialization.daoNatureId);
            const activeSkillCount = state.character.activeSkillIds.length;
            const rawSteps = [
                { id: 'awakening', label: 'Khai Mạch', description: 'Nghe Tần Thủ Nhất chỉ điểm để biết nơi bắt đầu con đường tu hành.', route: 'cultivation', actionKey: 'story-awakening', unlockRealmOrder: 0 },
                { id: 'qi', label: 'Bước vào Luyện Khí', description: 'Tích đủ Tu Vi rồi Thăng Cảnh lần đầu; sau đó Săn Yêu và Phó Bản mới thật sự mở.', route: 'cultivation', actionKey: order < 1 ? 'ascend' : undefined, unlockRealmOrder: 1 },
                { id: 'qi-order', label: 'Nhận Lệnh Tụ Linh Động', description: 'Nhận lệnh bài sau khi nhập Luyện Khí để mở first-clear đầu tiên.', route: 'cultivation', actionKey: 'story-qi', unlockRealmOrder: 1 },
                { id: 'first-clear', label: 'First-clear Tụ Linh Động', description: 'Đánh một Boss thật để học vòng build → công phá → farm.', route: 'dungeons', targetDungeonId: 'dungeon.spirit_gathering_cave', targetFloor: 1, unlockRealmOrder: 1 },
                { id: 'path', label: 'Chọn đường đời', description: 'Nhận thư Thanh Hư Tông rồi chọn bái nhập hoặc tiếp tục làm Tán Tu.', route: 'cultivation', actionKey: !storyCompleted.has('first.first_clear') ? 'story-invite' : (!firstLifePath ? (indexedActions.find(x => x.key.startsWith('story-travel-') || x.key === 'story-sect' || x.key === 'story-wanderer')?.key) : undefined), unlockRealmOrder: 1 },
                { id: 'foundation', label: 'Đạt Trúc Cơ', description: 'Tiếp tục tu luyện và Thăng Cảnh tới Trúc Cơ để mở lớp build quan trọng đầu tiên.', route: 'cultivation', unlockRealmOrder: 10 },
                { id: 'dao', label: 'Định Đạo', description: 'Chọn Đạo Tính và đúng một Chủ Đạo; nhận Basic + Active I + Passive I + Core + Tuyệt Kỹ.', route: 'skills', unlockRealmOrder: 10 },
                { id: 'build', label: 'Hoàn thiện build Trúc Cơ', description: 'Kiểm tra bộ kỹ năng và Phối Đồ; nếu đã sở hữu Pháp Bảo thì trang bị. Tiên Ngọc Khóa là ngân sách chiến lược: có thể quay hoặc giữ, hành trình không phụ thuộc RNG.', route: 'skills', unlockRealmOrder: 10 },
                { id: 'purple', label: 'Tiến tới Tử Phủ', description: 'Đẩy cảnh giới, farm đúng nút thắt và mở ô Pháp Bảo thứ ba.', route: 'cultivation', unlockRealmOrder: 14 },
                { id: 'golden', label: 'Kết Vertical Slice tại Kim Đan', description: 'Đạt Kim Đan, có Active II và một vòng Tu Luyện → Combat → Farm → Nâng hoàn chỉnh.', route: 'cultivation', unlockRealmOrder: 18 },
            ];
            const doneById = {
                awakening: storyCompleted.has('first.awakening'),
                qi: order >= 1,
                'qi-order': storyCompleted.has('first.qi_awakened'),
                'first-clear': firstClear,
                path: Boolean(firstLifePath),
                foundation: order >= 10,
                dao: specialized,
                build: specialized && activeSkillCount >= 3,
                purple: order >= 14,
                golden: order >= 18,
            };
            const currentIndex = rawSteps.findIndex(x => !doneById[x.id]);
            const steps = rawSteps.map((step, index) => ({ ...step, status: doneById[step.id] ? 'done' : index === (currentIndex < 0 ? rawSteps.length - 1 : currentIndex) ? 'current' : 'upcoming' }));
            const current = steps.find(x => x.status === 'current' && !doneById[x.id]);
            const milestone = order < 1 ? { realmOrder: 1, realm: 'Luyện Khí', features: ['Săn Yêu', 'Phó Bản', 'Hành Trang'] } : order < 10 ? { realmOrder: 10, realm: 'Trúc Cơ', features: ['Định Đạo', 'Kỹ Năng', 'Động Phủ', 'Bộ Sưu Tập', 'Pháp Bảo'] } : order < 14 ? { realmOrder: 14, realm: 'Tử Phủ', features: ['Ô Pháp Bảo thứ 3', 'Phó Bản Tử Phủ'] } : order < 18 ? { realmOrder: 18, realm: 'Kim Đan', features: ['Active II + Passive II', 'Hoàn tất vertical slice đời đầu'] } : undefined;
            const completedCount = Object.values(doneById).filter(Boolean).length;
            const conditionAlert = state.injury > 60 ? { tone:'warn', title:'Thương Thế đang nặng', description:`Thương Thế ${Number(state.injury).toFixed(0)}/100. Hãy trị thương hoặc chờ hồi phục trước khi thử nội dung khó.`, route:'cultivation' } : undefined;
            journey = { schema: 'first-life-journey.v90', active: order < 18, complete: order >= 18, sliceTargetRealmOrder: 18, progressPct: Math.round(completedCount / rawSteps.length * 100), stageId: current?.id ?? 'golden', stageLabel: current?.label ?? 'Kim Đan · Vertical Slice hoàn tất', currentStepId: current?.id, currentActionKey: current?.actionKey, currentRoute: conditionAlert?.route ?? current?.route, currentTargetDungeonId: current?.targetDungeonId, currentTargetFloor: current?.targetFloor, currentTitle: conditionAlert?.title ?? current?.label ?? 'Vertical Slice đời đầu đã hoàn tất', currentDescription: conditionAlert?.description ?? current?.description ?? 'Bạn đã đi xuyên vòng Tu Luyện → build → combat → farm → nâng cấp tới Kim Đan. Từ đây game chuyển sang progression mở.', conditionAlert, nextUnlock: milestone, steps, rules: { noClaimRewards: true, doesNotBlockSandbox: true, derivedFromRealState: true } };
        }
        return {
            phase,
            headline: phase === 'living' ? `Đời ${life.lifeNumber} · ${realm.name}` : phase === 'dead-unsettled' ? 'Một đời đã kết thúc.' : 'Kết toán đã hoàn tất.',
            subline: phase === 'living' ? `${state.ageYears.toFixed(1)} tuổi · ${this.world.locations[state.locationId]?.name ?? state.locationId}` : `Nguyên nhân: ${this.settlement()?.causeOfDeath ?? 'chờ kết toán'}`,
            birthLines, unlockedSystems, lockedHints, routine, currentThread, journey,
            actions: indexedActions,
        };
    
}

// V141: Vạn Thế archive/projection DTO assembly is isolated from the facade shell.
export function buildMyriadLivesV141() {
        const meta = this.session.meta;
        const currentLife = this.session.currentLife;
        const currentState = this.session.state;
        const archives = meta.archives.slice().sort((a, b) => a.lifeNumber - b.lifeNumber);
        const rewardHistory = meta.reincarnationProgress?.rewardHistory ?? [];
        const rewardByLifeId = new Map(rewardHistory.map(reward => [reward.lifeId, reward]));
        const categoryKeys = ['cultivation', 'combat', 'exploration', 'profession', 'relationships', 'fate'];
        const safeRealmName = (realmId) => {
            try { return this.registry.realm(realmId).name; }
            catch { return realmId || 'Không rõ'; }
        };
        const categoryRows = (settlement) => categoryKeys.map(key => {
            const row = settlement?.categories?.[key] ?? { category: key, score: 0, reasons: [], uniqueMilestones: 0 };
            return { id: key, name: categoryDisplayName(key), score: Number(row.score ?? 0), uniqueMilestones: Number(row.uniqueMilestones ?? 0), reasons: [...(row.reasons ?? [])] };
        });
        const strongest = (rows) => rows.slice().sort((a, b) => b.score - a.score)[0];
        const weakest = (rows) => rows.slice().sort((a, b) => a.score - b.score)[0];
        const archiveDto = (archive, index) => {
            const categories = categoryRows(archive);
            const previous = index > 0 ? archives[index - 1] : undefined;
            const reward = rewardByLifeId.get(archive.lifeId);
            const previousCategories = previous ? Object.fromEntries(categoryRows(previous).map(row => [row.id, row.score])) : {};
            return {
                lifeNumber: archive.lifeNumber,
                lifeId: archive.lifeId,
                ageYears: Number(archive.ageAtDeathYears ?? 0),
                lifespanYears: Number(archive.lifespanYears ?? 0),
                realmId: archive.finalRealmId,
                realmName: safeRealmName(archive.finalRealmId),
                maxRealmOrder: Number(archive.maxRealmOrder ?? 0),
                causeOfDeath: archive.causeOfDeath ?? 'Không rõ',
                totalScore: Number(archive.totalScore ?? 0),
                grade: archive.grade ?? 'D',
                cpEarned: Number(archive.cpEarned ?? 0),
                cp: Number(archive.cpEarned ?? 0),
                mingJiGain: Number(archive.mingJiGain ?? 0),
                mingJi: Number(archive.mingJiGain ?? 0),
                talentPointGain: Number(archive.talentPointGain ?? 0),
                talentPoints: Number(archive.talentPointGain ?? 0),
                reincarnationLegacyXp: Number(archive.reincarnationLegacy?.xp ?? 0),
                reincarnationXp: Number(archive.reincarnationLegacy?.xp ?? 0),
                age: Number(archive.ageAtDeathYears ?? 0),
                cause: archive.causeOfDeath ?? 'Không rõ',
                reincarnationReward: reward ? {
                    reincarnationPoints: Number(reward.reincarnationPoints ?? 0),
                    permanentPotentialGain: Number(reward.permanentPotentialGain ?? 0),
                    energyCost: Number(reward.energyCost ?? 0),
                    depthTier: reward.depthTier,
                    depthStage: reward.depthStage,
                    offenseRatio: Number(reward.offenseRatio ?? 0),
                    survivalRatio: Number(reward.survivalRatio ?? 0),
                } : undefined,
                categories,
                strongestCategory: strongest(categories),
                weakestCategory: weakest(categories),
                deltaVsPrevious: previous ? {
                    totalScore: Number(archive.totalScore ?? 0) - Number(previous.totalScore ?? 0),
                    realmOrder: Number(archive.maxRealmOrder ?? 0) - Number(previous.maxRealmOrder ?? 0),
                    ageYears: Number(archive.ageAtDeathYears ?? 0) - Number(previous.ageAtDeathYears ?? 0),
                    categories: categories.map(row => ({ id: row.id, name: row.name, delta: row.score - Number(previousCategories[row.id] ?? 0) })),
                } : undefined,
                notableStats: { ...(archive.notableStats ?? {}) },
                legacy: archive.legacy?.summary,
                legacyDetail: archive.legacy ? { title: archive.legacy.title, summary: archive.legacy.summary, significance: Number(archive.legacy.significance ?? 0) } : undefined,
                chronicle: (archive.chronicle ?? []).map(entry => ({ ageYears: Number(entry.ageYears ?? 0), worldTimeYears: Number(entry.worldTimeYears ?? 0), text: entry.text, significance: Number(entry.significance ?? 0) })),
            };
        };
        const lives = archives.map(archiveDto);
        const settledCurrent = archives.find(archive => archive.lifeId === currentLife.lifeId);
        const projected = settledCurrent ?? this.session.previewCurrentLifeSettlement();
        const currentCategories = categoryRows(projected);
        const latest = archives.at(-1);
        const latestCategories = latest ? Object.fromEntries(categoryRows(latest).map(row => [row.id, row.score])) : {};
        const currentProjection = {
            lifeNumber: currentLife.lifeNumber,
            lifeId: currentLife.lifeId,
            settled: Boolean(settledCurrent),
            alive: Boolean(currentState.alive),
            ageYears: Number(currentState.ageYears ?? projected.ageAtDeathYears ?? 0),
            realmId: currentState.realm?.realmId ?? projected.finalRealmId,
            realmName: safeRealmName(currentState.realm?.realmId ?? projected.finalRealmId),
            maxRealmOrder: Number(currentState.realm?.maxRealmOrder ?? projected.maxRealmOrder ?? 0),
            totalScore: Number(projected.totalScore ?? 0),
            grade: projected.grade ?? 'D',
            categories: currentCategories,
            strongestCategory: strongest(currentCategories),
            weakestCategory: weakest(currentCategories),
            vsPreviousLife: latest && latest.lifeId !== currentLife.lifeId ? {
                lifeNumber: latest.lifeNumber,
                totalScoreDelta: Number(projected.totalScore ?? 0) - Number(latest.totalScore ?? 0),
                realmOrderDelta: Number(currentState.realm?.maxRealmOrder ?? projected.maxRealmOrder ?? 0) - Number(latest.maxRealmOrder ?? 0),
                categoryDeltas: currentCategories.map(row => ({ id: row.id, name: row.name, current: row.score, previous: Number(latestCategories[row.id] ?? 0), delta: row.score - Number(latestCategories[row.id] ?? 0) })),
            } : undefined,
        };
        const scoreRecord = lives.slice().sort((a, b) => b.totalScore - a.totalScore)[0];
        const realmRecord = lives.slice().sort((a, b) => b.maxRealmOrder - a.maxRealmOrder || b.totalScore - a.totalScore)[0];
        const longevityRecord = lives.slice().sort((a, b) => b.ageYears - a.ageYears)[0];
        const rewardRecord = lives.filter(life => life.reincarnationReward).sort((a, b) => (b.reincarnationReward?.permanentPotentialGain ?? 0) - (a.reincarnationReward?.permanentPotentialGain ?? 0) || (b.reincarnationReward?.reincarnationPoints ?? 0) - (a.reincarnationReward?.reincarnationPoints ?? 0))[0];
        const mingJiRecord = lives.slice().sort((a, b) => b.mingJiGain - a.mingJiGain)[0];
        const reincarnationLegacyRecord = lives.slice().sort((a, b) => b.reincarnationLegacyXp - a.reincarnationLegacyXp)[0];
        const categoryRecords = categoryKeys.map(key => {
            const ranked = lives.map(life => ({ lifeNumber: life.lifeNumber, score: life.categories.find(row => row.id === key)?.score ?? 0 })).sort((a, b) => b.score - a.score);
            return { id: key, name: categoryDisplayName(key), ...(ranked[0] ?? { lifeNumber: 0, score: 0 }) };
        });
        const comparisons = currentProjection.vsPreviousLife?.categoryDeltas ?? [];
        const improving = comparisons.filter(row => row.delta > 0).sort((a, b) => b.delta - a.delta);
        const declining = comparisons.filter(row => row.delta < 0).sort((a, b) => a.delta - b.delta);
        const insights = [];
        if (!archives.length)
            insights.push('Chưa có đời nào được kết toán; Vạn Thế sẽ bắt đầu lưu kỷ lục sau lần Luân Hồi đầu tiên.');
        else {
            if (currentProjection.totalScore > (scoreRecord?.totalScore ?? 0))
                insights.push(`Nếu kết đời ở trạng thái hiện tại, Đời ${currentLife.lifeNumber} đang vượt kỷ lục tổng điểm cũ ${currentProjection.totalScore - scoreRecord.totalScore} điểm.`);
            if (improving[0])
                insights.push(`${improving[0].name} đang tiến bộ rõ nhất so với Đời ${latest?.lifeNumber}: +${improving[0].delta} điểm.`);
            if (declining[0])
                insights.push(`${declining[0].name} đang hụt nhiều nhất so với Đời ${latest?.lifeNumber}: ${declining[0].delta} điểm.`);
            if (currentProjection.weakestCategory)
                insights.push(`Trục thấp nhất của đời hiện tại là ${currentProjection.weakestCategory.name} (${currentProjection.weakestCategory.score}); đây là nút thắt rõ nhất nếu muốn nâng điểm đời toàn diện.`);
        }
        return {
            schema: 'myriad-lives.v101',
            version: 'V101',
            rules: {
                source: 'LifeSettlement archive canonical',
                readOnly: true,
                currentProjectionIsPreview: !settledCurrent,
                noParallelHistory: true,
            },
            // Compatibility aliases kept for TextGameClient / old consumers.
            totalLives: archives.length,
            totalScore: Number(meta.totalLifeScore ?? archives.reduce((sum, archive) => sum + Number(archive.totalScore ?? 0), 0)),
            lifetimeCp: Number(meta.lifetimeCpEarned ?? 0),
            mingJi: Number(meta.mingJi ?? 0),
            reincarnation: this.session.reincarnationSummary(),
            summary: {
                completedLives: archives.length,
                currentLifeNumber: currentLife.lifeNumber,
                totalLifeScore: Number(meta.totalLifeScore ?? archives.reduce((sum, archive) => sum + Number(archive.totalScore ?? 0), 0)),
                lifetimeCpEarned: Number(meta.lifetimeCpEarned ?? 0),
                mingJi: Number(meta.mingJi ?? 0),
                reincarnation: this.session.reincarnationSummary(),
            },
            records: {
                bestScore: scoreRecord ? { lifeNumber: scoreRecord.lifeNumber, value: scoreRecord.totalScore, grade: scoreRecord.grade } : undefined,
                highestRealm: realmRecord ? { lifeNumber: realmRecord.lifeNumber, realmName: realmRecord.realmName, realmId: realmRecord.realmId, order: realmRecord.maxRealmOrder } : undefined,
                longestLife: longevityRecord ? { lifeNumber: longevityRecord.lifeNumber, ageYears: longevityRecord.ageYears } : undefined,
                bestReincarnationReward: rewardRecord ? { lifeNumber: rewardRecord.lifeNumber, permanentPotentialGain: rewardRecord.reincarnationReward.permanentPotentialGain, reincarnationPoints: rewardRecord.reincarnationReward.reincarnationPoints } : undefined,
                bestMingJi: mingJiRecord ? { lifeNumber: mingJiRecord.lifeNumber, value: mingJiRecord.mingJiGain } : undefined,
                bestReincarnation: reincarnationLegacyRecord ? { lifeNumber: reincarnationLegacyRecord.lifeNumber, value: reincarnationLegacyRecord.reincarnationLegacyXp } : undefined,
                categories: categoryRecords,
            },
            currentProjection,
            insights,
            lives,
        };
    
}
