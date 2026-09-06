import { addTuViV140 } from './cultivation-v140.js';
const PROFILE_BY_MAJOR = {
    'major.alchemy_sage': { id: 'alchemy', name: 'Kiếp Đan Tu', openingBoon: ['+4 Tụ Linh Thảo', '+2 Dược Tính Tinh Hoa'], priorities: ['Luyện Đan', 'Dược liệu', 'Sustain/DoT'], tradeoffs: ['Ít lợi trực tiếp cho boss rush đầu đời'] },
    'major.myriad_law': { id: 'technique', name: 'Kiếp Pháp Tu', openingBoon: ['+35 Tu Vi khởi đầu'], priorities: ['Công Pháp', 'Mastery', 'Setup → Finisher'], tradeoffs: ['Ít tài nguyên nghề khởi đầu'] },
    'major.war_immortal': { id: 'combat', name: 'Kiếp Chiến Tu', openingBoon: ['+4 Linh Thạch'], priorities: ['Boss', 'First Clear', 'Skill matchup'], tradeoffs: ['Không được bonus nghề miễn phí'] },
    'major.treasure_lord': { id: 'artifact', name: 'Kiếp Bảo Tu', openingBoon: ['+3 Bảo Khí Tàn Tinh'], priorities: ['Pháp Bảo', 'Khí Linh', 'Proc matchup'], tradeoffs: ['Sức mạnh phụ thuộc tìm/nuôi bảo vật'] },
    'major.idle_cloud': { id: 'idle', name: 'Kiếp Nhàn Tu', openingBoon: ['+2 Linh Thạch', '+3 Tụ Linh Thảo'], priorities: ['Offline', 'Phân Thân', 'Thu thập'], tradeoffs: ['Boss rush trực diện chậm hơn build chuyên chiến'] },
};
export function lifeArchetypeProfile(talents) {
    const active = [...(talents?.activeMajorIds ?? [])];
    if (active.length === 1) {
        const p = PROFILE_BY_MAJOR[active[0]];
        return { ...p, activeMajors: active };
    }
    if (active.length > 1)
        return { id: 'hybrid', name: 'Kiếp Hợp Đạo', activeMajors: active, openingBoon: active.flatMap(id => PROFILE_BY_MAJOR[id].openingBoon).slice(0, 5), priorities: [...new Set(active.flatMap(id => PROFILE_BY_MAJOR[id].priorities))].slice(0, 6), tradeoffs: ['Nhiều hướng mạnh nhưng khó tối ưu toàn bộ tài nguyên trong cùng một đời.'] };
    return { id: 'hybrid', name: 'Kiếp Vô Định', activeMajors: [], openingBoon: [], priorities: ['Tự do định hướng theo cơ duyên đời này'], tradeoffs: ['Không có opening boon từ Major Talent'] };
}
/** v0.79: tiny identity boon. It changes the opening route, not the long-run ceiling. */
export function applyMajorLifeOpeningBoon(state, activeMajorIds) {
    const lines = [];
    for (const id of activeMajorIds ?? []) {
        switch (id) {
            case 'major.alchemy_sage':
                state.inventory['resource.spirit_herb'] = (state.inventory['resource.spirit_herb'] ?? 0) + 4;
                state.inventory['resource.alchemy_essence'] = (state.inventory['resource.alchemy_essence'] ?? 0) + 2;
                lines.push('Đan Tu: dược liệu khởi đầu');
                break;
            case 'major.myriad_law':
                addTuViV140(state, 35, state.realm.maxRealmOrder);
                lines.push('Pháp Tu: Tu Vi khởi đầu');
                break;
            case 'major.war_immortal':
                state.inventory['resource.spirit_stone'] = (state.inventory['resource.spirit_stone'] ?? 0) + 4;
                lines.push('Chiến Tu: tài nguyên khởi đầu');
                break;
            case 'major.treasure_lord':
                state.inventory['resource.artifact_dust'] = (state.inventory['resource.artifact_dust'] ?? 0) + 3;
                lines.push('Bảo Tu: Bảo Khí Tàn Tinh khởi đầu');
                break;
            case 'major.idle_cloud':
                state.inventory['resource.spirit_stone'] = (state.inventory['resource.spirit_stone'] ?? 0) + 2;
                state.inventory['resource.spirit_herb'] = (state.inventory['resource.spirit_herb'] ?? 0) + 3;
                lines.push('Nhàn Tu: tài nguyên linh hoạt khởi đầu');
                break;
        }
    }
    return lines;
}
//# sourceMappingURL=reincarnation-diversity.js.map