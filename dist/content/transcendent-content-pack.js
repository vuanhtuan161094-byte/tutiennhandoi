const stages = [
    { key: 'supreme_dao', label: 'Cực Đạo Chân Cảnh', min: 90, max: 93, a: 'location.supreme_dao_origin_sea', b: 'location.self_law_mirror', dungeon: 'dungeon.supreme_dao_origin', resource: 'resource.supreme_dao_origin', rare: 'resource.self_law_crystal', boss: 'entity.boss.supreme_dao_self', themes: ['Chân Hạch Không Mượn Trời', 'Tự Luật Không Mâu Thuẫn', 'Cực Đạo Sau Biên Giới', 'Một Đạo Tự Chứng', 'Pháp Tắc Phản Chiếu', 'Cực Đạo Chân Ngã'] },
    { key: 'chaos', label: 'Hỗn Độn Cảnh', min: 94, max: 97, a: 'location.chaos_abyss', b: 'location.formless_chaos_sea', dungeon: 'dungeon.chaos_abyss', resource: 'resource.chaos_origin', rare: 'resource.chaos_heart', boss: 'entity.boss.chaos_primordial_beast', themes: ['Không Có Ngũ Hành', 'Thân Trong Vô Tướng', 'Hỗn Độn Không Phải Hư Vô', 'Một Niệm Phân Thanh Trọc', 'Hỗn Độn Tâm', 'Thái Sơ Cổ Thú'] },
    { key: 'hongmeng', label: 'Hồng Mông Cảnh', min: 98, max: 101, a: 'location.hongmeng_purple_sea', b: 'location.primordial_seed_garden', dungeon: 'dungeon.hongmeng_origin_sea', resource: 'resource.hongmeng_purple_qi', rare: 'resource.primordial_seed', boss: 'entity.boss.hongmeng_ancestor_shadow', themes: ['Tử Khí Từ Vô Sơ', 'Một Chủng Một Khả Năng', 'Trước Cả Hỗn Độn Phân Hóa', 'Thái Sơ Sinh Cơ', 'Hồng Mông Chủng Nở', 'Tổ Ảnh Hồng Mông'] },
    { key: 'heaven_opening', label: 'Khai Thiên Cảnh', min: 102, max: 105, a: 'location.heaven_opening_axe_field', b: 'location.inner_cosmos_edge', dungeon: 'dungeon.heaven_opening_trial', resource: 'resource.heaven_opening_origin', rare: 'resource.cosmos_membrane', boss: 'entity.boss.heaven_opening_giant', themes: ['Một Đường Phân Thiên Địa', 'Nội Vũ Trụ Bắt Đầu Thở', 'Thanh Trọc Có Trật Tự', 'Bầu Trời Đầu Tiên', 'Vũ Trụ Không Được Sập', 'Khai Thiên Cự Linh'] },
    { key: 'world_lord', label: 'Thế Giới Chủ', min: 106, max: 109, a: 'location.world_core_cradle', b: 'location.myriad_life_domain', dungeon: 'dungeon.world_core_cradle', resource: 'resource.world_core_essence', rare: 'resource.life_genesis_seed', boss: 'entity.boss.world_devourer', themes: ['Giới Tâm Có Nhịp Đập', 'Tạo Núi Sông Không Khó', 'Khó Là Để Chúng Tự Sống', 'Luật Sinh Thái Đầu Tiên', 'Chúng Sinh Có Ý Riêng', 'Thôn Giới Giả'] },
    { key: 'eternity', label: 'Vĩnh Sinh Cảnh', min: 110, max: 113, a: 'location.eternity_river', b: 'location.deathless_shore', dungeon: 'dungeon.eternity_river', resource: 'resource.eternity_mark', rare: 'resource.deathless_thread', boss: 'entity.boss.eternity_reaper', themes: ['Thọ Nguyên Không Còn Nghĩa', 'Neo Bản Ngã Qua Kỷ Nguyên', 'Bất Diệt Không Bất Bại', 'Dòng Sông Không Có Cuối', 'Cái Chết Vẫn Có Thể Tới', 'Vĩnh Sinh Thu Hoạch Giả'] },
    { key: 'creation_lord', label: 'Sáng Thế Chủ', min: 114, max: 117, a: 'location.genesis_source_sea', b: 'location.first_dawn_throne', dungeon: 'dungeon.genesis_source', resource: 'resource.genesis_core', rare: 'resource.first_dawn_fragment', boss: 'entity.boss.genesis_anti_creator', themes: ['Không Chỉ Mở Một Thế Giới', 'Nguồn Quy Tắc Đầu Tiên', 'Cho Chúng Sinh Quyền Tự Chọn', 'Kỷ Nguyên Có Sinh Có Diệt', 'Sáng Thế Không Phải Toàn Tri', 'Phản Sáng Thế Chủ'] },
];
const events = [];
const packs = [];
for (const st of stages) {
    for (const side of ['core', 'trial']) {
        const packId = `pack.transcendent.${st.key}.${side}`;
        const ids = [];
        const offset = side === 'core' ? 0 : 3;
        for (let i = 0; i < 3; i++) {
            const index = offset + i;
            const id = `event.transcendent.${st.key}.${side}.${i + 1}`;
            ids.push(id);
            const boss = side === 'trial' && i === 2;
            events.push({
                id, packId, title: st.themes[index], teaser: `${st.label}: ${st.themes[index]}.`, priority: 150 + index, oneShot: true,
                condition: { minRealmOrder: st.min, maxRealmOrder: st.max, locationIds: [side === 'core' ? st.a : st.b], requiredDungeonFloors: boss ? [{ dungeonId: st.dungeon, minFloor: 4 }] : undefined },
                choices: [boss ? {
                        id: 'challenge', label: 'Đối diện bản chất thử thách', description: 'Boss milestone; thua không khóa event.', resultText: `Ngươi đối diện thử thách ${st.label} mà không mượn level scaling.`,
                        combat: { entityId: st.boss, completeOnLoss: false, onWin: { resources: { [st.resource]: 16, [st.rare]: 3 } }, onLose: { injury: 14 }, loseText: 'Thất bại chỉ chứng minh cấu trúc hiện tại chưa đủ. Có thể trở lại.' },
                        significance: 118, tags: ['Transcendent', st.label, 'Boss'],
                    } : {
                        id: 'comprehend', label: index % 2 === 0 ? 'Tự chứng' : 'Quan sát rồi tái cấu trúc', description: 'Cô đọng trải nghiệm thành tài nguyên thật.', resultText: `Cảm ngộ ${st.label} được giữ dưới dạng nguyên chất; người chơi vẫn phải chủ động luyện hóa.`,
                        effects: { resources: { [st.resource]: 4 + (i * 2), [st.rare]: index >= 2 ? 1 : 0 } }, significance: 52 + index * 5, tags: ['Transcendent', st.key, side],
                    }], tags: ['Transcendent', st.key, side],
            });
        }
        packs.push({ id: packId, name: `${st.label} · ${side === 'core' ? 'Căn Nguyên' : 'Thử Luyện'}`, description: `3 sự kiện hậu-Cực Đạo của ${st.label}.`, eventIds: ids });
    }
}
export const transcendentContentEvents = Object.fromEntries(events.map(x => [x.id, x]));
export const transcendentContentPacks = Object.fromEntries(packs.map(x => [x.id, x]));
//# sourceMappingURL=transcendent-content-pack.js.map