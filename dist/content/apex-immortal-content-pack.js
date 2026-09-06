const STAGES = [
    {
        key: 'mystic', label: 'Huyền Tiên', minRealmOrder: 62, maxRealmOrder: 65,
        locationA: 'location.mystic_law_web', locationB: 'location.ten_thousand_law_loom', dungeonId: 'dungeon.mystic_law_loom',
        resourceId: 'resource.mystic_law_silk', rareResourceId: 'resource.law_weave_core', bossId: 'entity.boss.mystic_law_sovereign',
        coreTitles: ['Một Sợi Luật Thành Võng', 'Huyền Luật Không Chỉ Một Đạo', 'Luật Xung Đột Trong Thân', 'Dệt Lại Đạo Vực'],
        trialTitles: ['Vạn Luật Đồng Thanh', 'Pháp Bảo Qua Luật Võng', 'Huyền Luật Tự Chứng', 'Huyền Luật Chí Tôn'],
    },
    {
        key: 'golden', label: 'Kim Tiên', minRealmOrder: 66, maxRealmOrder: 69,
        locationA: 'location.indestructible_golden_heaven', locationB: 'location.golden_nature_forge', dungeonId: 'dungeon.golden_immortal_forge',
        resourceId: 'resource.golden_immortal_marrow', rareResourceId: 'resource.golden_seal_fragment', bossId: 'entity.boss.golden_immortal_ancestor',
        coreTitles: ['Kim Tính Không Phải Kim Loại', 'Bất Hoại Từ Bản Nguyên', 'Một Ấn Trấn Vạn Pháp', 'Tiên Thể Tái Cấu'],
        trialTitles: ['Kim Tính Qua Kiếp Hỏa', 'Khí Linh Chạm Bất Hoại', 'Bất Hoại Không Bất Bại', 'Kim Tiên Cổ Tổ'],
    },
    {
        key: 'taiyi', label: 'Thái Ất', minRealmOrder: 70, maxRealmOrder: 73,
        locationA: 'location.taiyi_epoch_river', locationB: 'location.causal_ancient_bank', dungeonId: 'dungeon.taiyi_epoch_river',
        resourceId: 'resource.taiyi_epoch_sand', rareResourceId: 'resource.causal_pearl', bossId: 'entity.boss.taiyi_epoch_lord',
        coreTitles: ['Một Hạt Cát Một Kỷ', 'Nhân Quả Có Trọng Lượng', 'Dòng Thời Không Chảy Thẳng', 'Thái Ất Hồi Quang'],
        trialTitles: ['Cổ Ngạn Ghi Tên', 'Nhân Quả Của Phân Thân', 'Không Gian Đạo Gặp Kỷ Hà', 'Thái Ất Kỷ Chủ'],
    },
    {
        key: 'grand_luo', label: 'Đại La', minRealmOrder: 74, maxRealmOrder: 77,
        locationA: 'location.grand_luo_fruit_heaven', locationB: 'location.timeless_terrace', dungeonId: 'dungeon.grand_luo_orchard',
        resourceId: 'resource.grand_luo_origin', rareResourceId: 'resource.timeless_leaf', bossId: 'entity.boss.grand_luo_timeless_one',
        coreTitles: ['Đạo Quả Không Phải Phần Thưởng', 'Một Quả Chứa Một Đời Đạo', 'Ngoài Dòng Thời Vẫn Có Nhân Quả', 'Đại La Tự Tại'],
        trialTitles: ['Vô Thời Đài', 'Đạo Quả Và Căn Nguyên', 'Dấu Ấn Vượt Một Đời', 'Đại La Vô Thời Giả'],
    },
    {
        key: 'king', label: 'Tiên Vương', minRealmOrder: 78, maxRealmOrder: 81,
        locationA: 'location.ten_thousand_domain_king_court', locationB: 'location.orthodoxy_heaven_pillar', dungeonId: 'dungeon.immortal_king_court',
        resourceId: 'resource.king_domain_core', rareResourceId: 'resource.orthodoxy_seal', bossId: 'entity.boss.immortal_king_throne',
        coreTitles: ['Vực Không Có Chủ Tự Loạn', 'Một Đạo Thống Một Trọng Lượng', 'Vương Quyền Không Phải Danh Hiệu', 'Vạn Vực Triều Quy'],
        trialTitles: ['Đạo Thống Thiên Trụ', 'Tông Môn Cũ Gặp Tiên Vương', 'Quyền Vực Và Chủ Đạo', 'Vương Tọa Vạn Vực'],
    },
    {
        key: 'emperor', label: 'Tiên Đế', minRealmOrder: 82, maxRealmOrder: 85,
        locationA: 'location.emperor_mandate_palace', locationB: 'location.ten_thousand_world_emperor_sea', dungeonId: 'dungeon.immortal_emperor_throne',
        resourceId: 'resource.emperor_mandate_fragment', rareResourceId: 'resource.world_authority_crystal', bossId: 'entity.boss.immortal_emperor_shadow',
        coreTitles: ['Đế Mệnh Không Do Trời Ban', 'Một Ý Chạm Vạn Giới', 'Thế Giới Có Quyền Phản Kháng', 'Đế Đạo Tự Lập'],
        trialTitles: ['Vạn Giới Đế Hải', 'Đạo Vực Thành Thiên Địa', 'Quyền Năng Và Giới Hạn', 'Tiên Đế Chi Ảnh'],
    },
    {
        key: 'extremity', label: 'Cực Hạn', minRealmOrder: 86, maxRealmOrder: 89,
        locationA: 'location.extremity_gate', locationB: 'location.nameless_boundary', dungeonId: 'dungeon.extremity_boundary',
        resourceId: 'resource.extremity_shard', rareResourceId: 'resource.boundary_dust', bossId: 'entity.boss.extremity_boundary',
        coreTitles: ['Cực Hạn Chỉ Là Một Lớp', 'Khuy Môn', 'Phá Giới', 'Vô Cực Không Vô Hạn'],
        trialTitles: ['Biên Giới Không Tên', 'Không Có Cảnh Giới Kế Tiếp', 'Tự Đặt Lại Trần Của Mình', 'Cực Hạn Biên Giới'],
    },
];
const events = [];
const packs = [];
function addPack(stage, kind, titles) {
    const packId = `pack.apex.${stage.key}.${kind}`;
    const locationId = kind === 'core' ? stage.locationA : stage.locationB;
    const ids = [];
    titles.forEach((title, index) => {
        const eventId = `event.apex.${stage.key}.${kind}.${index + 1}`;
        ids.push(eventId);
        const isBoss = kind === 'trial' && index === titles.length - 1;
        const isMilestone = index === titles.length - 1;
        events.push({
            id: eventId, packId, title,
            teaser: `${title} — nội dung ${stage.label} dùng cùng tài nguyên, phó bản và chiến đấu của hệ thống thật.`,
            priority: 112 + index + (kind === 'trial' ? 5 : 0), oneShot: true,
            condition: {
                minRealmOrder: stage.minRealmOrder, maxRealmOrder: stage.maxRealmOrder,
                locationIds: [locationId],
                requiredDungeonFloors: isBoss ? [{ dungeonId: stage.dungeonId, minFloor: 4 }] : undefined,
            },
            choices: [isBoss ? {
                    id: 'challenge', label: 'Đối diện', description: 'Boss milestone; thất bại không khóa sự kiện.',
                    resultText: `Ngươi dùng toàn bộ tích lũy ${stage.label} để chạm thẳng giới hạn hiện tại.`,
                    combat: {
                        entityId: stage.bossId, completeOnLoss: false,
                        onWin: { resources: { [stage.resourceId]: 10, [stage.rareResourceId]: 2 } },
                        onLose: { injury: 12 }, loseText: 'Giới hạn này chưa bị phá. Có thể dưỡng thương, đổi biểu hiện rồi quay lại.',
                    },
                    significance: 72, tags: ['Apex', stage.label, 'Boss'],
                } : {
                    id: 'comprehend', label: isMilestone ? 'Ép tới mốc hiện tại' : 'Thuận thế lĩnh ngộ',
                    description: 'Nhận tiến độ dưới dạng tài nguyên thật; refinement vẫn phải do người chơi chủ động thực hiện.',
                    resultText: `Trải nghiệm được cô đọng thành tài nguyên ${stage.label}; nó không tự thay ngươi hoàn thành tu luyện.`,
                    effects: { resources: { [stage.resourceId]: 2 + (index === 3 ? 2 : 0), [stage.rareResourceId]: index >= 2 ? 1 : 0 } },
                    significance: 30 + index * 4, tags: ['Apex', stage.label, kind],
                }],
            tags: ['ApexImmortal', stage.key, kind],
        });
    });
    packs.push({ id: packId, name: `${stage.label} · ${kind === 'core' ? 'Nền Tu Hành' : 'Thử Luyện'}`, description: `4 sự kiện ${stage.label}; lọc theo cảnh giới, vị trí và tiến độ phó bản.`, eventIds: ids });
}
for (const stage of STAGES) {
    addPack(stage, 'core', stage.coreTitles);
    addPack(stage, 'trial', stage.trialTitles);
}
export const apexImmortalContentEvents = Object.fromEntries(events.map(x => [x.id, x]));
export const apexImmortalContentPacks = Object.fromEntries(packs.map(x => [x.id, x]));
//# sourceMappingURL=apex-immortal-content-pack.js.map