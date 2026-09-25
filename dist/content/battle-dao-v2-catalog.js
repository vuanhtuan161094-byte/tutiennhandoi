import { remainingDaoPacksV2 } from './remaining-dao-v2.js';
import { swordPassivesV2 } from './sword-dao-v2.js';
export const BATTLE_DAO_V2_REALM_ORDER = {
    mundane: 10, spirit: 18, mystic: 34, earth: 46, heaven: 62, immortal: 74, extreme: 90, breaker: 102,
};
export const BATTLE_DAO_V2_REALM_SEQUENCE = ['mundane', 'spirit', 'mystic', 'earth', 'heaven', 'immortal', 'extreme', 'breaker'];
const swordCoreV2 = {
    dao: 'sword', name: 'Kiếm Khí', mainOnly: true,
    summary: 'Chủ Kiếm xoay Kiếm Khí 0–5: sinh Khí → từng kiếm thức tự tiêu Khí theo vai trò → lượng Khí thực tiêu nuôi Kiếm Ý. Tiên Vương có thể mở Kiếm Vực tạm nâng cap lên 7 bằng Tuyệt Kỹ đủ 5 Khí.',
};
const swordTreeV2 = [
    { realm: 'mundane', activeSkillId: 'skill.dao.sword.flow_slash', passiveId: 'passive.v2.sword.intent' },
    { realm: 'spirit', activeSkillId: 'skill.dao.sword.nurture', passiveId: 'passive.v2.sword.nourish' },
    { realm: 'mystic', activeSkillId: 'skill.dao.sword.break_mark', passiveId: 'passive.v2.sword.endure' },
    { realm: 'earth', activeSkillId: 'skill.dao.sword.chain', passiveId: 'passive.v2.sword.break_truth' },
    { realm: 'heaven', activeSkillId: 'skill.dao.sword.counter', passiveId: 'passive.v2.sword.limitless' },
    { realm: 'immortal', activeSkillId: 'skill.dao.sword.sever', passiveId: 'passive.v2.sword.majesty' },
    { realm: 'extreme', activeSkillId: 'skill.dao.sword.finisher', passiveId: 'passive.v2.sword.killing_heart' },
    { realm: 'breaker', activeSkillId: 'skill.dao.sword.myriad', passiveId: 'passive.v2.sword.undying_intent' },
];
const swordPassivesNormalized = swordPassivesV2.map(x => ({ ...x, dao: 'sword' }));
const remainingByDao = new Map(remainingDaoPacksV2.map(pack => [pack.dao, pack]));
export function battleDaoV2Catalog(dao) {
    if (dao === 'sword')
        return { dao, core: swordCoreV2, tree: swordTreeV2, passives: swordPassivesNormalized, basicSkillId: 'skill.dao.sword.basic', ultimateSkillId: 'skill.dao.sword.ultimate' };
    const pack = remainingByDao.get(dao);
    if (!pack)
        throw new Error(`Thiếu Bản Đạo V2 catalog: ${dao}`);
    return { dao, core: pack.core, tree: pack.tree, passives: pack.passives, basicSkillId: `skill.dao.${dao}.basic`, ultimateSkillId: `skill.dao.${dao}.ultimate` };
}
export function battleDaoV2Tree(dao) { return battleDaoV2Catalog(dao).tree; }
export function battleDaoV2Passives(dao) { return battleDaoV2Catalog(dao).passives; }
export function battleDaoV2Passive(passiveId) {
    const m = /^passive\.v2\.(sword|fist|body|spell|poison|artifact|formation|mind)\./.exec(passiveId);
    if (!m)
        return undefined;
    return battleDaoV2Passives(m[1]).find(x => x.id === passiveId);
}
export function battleDaoV2PassiveRealmGate(passiveId) {
    const def = battleDaoV2Passive(passiveId);
    return def ? BATTLE_DAO_V2_REALM_ORDER[def.realm] : undefined;
}
export function battleDaoV2ActiveRealmGate(dao, skillId) {
    const row = battleDaoV2Tree(dao).find(x => x.activeSkillId === skillId);
    return row ? BATTLE_DAO_V2_REALM_ORDER[row.realm] : undefined;
}
export function battleDaoV2UnlockedRows(dao, realmOrder) { return battleDaoV2Tree(dao).filter(row => realmOrder >= BATTLE_DAO_V2_REALM_ORDER[row.realm]); }
export function battleDaoV2StarterPackage(dao) { const c = battleDaoV2Catalog(dao); const first = c.tree[0]; return { basicSkillId: c.basicSkillId, activeSkillId: first.activeSkillId, passiveId: first.passiveId, ultimateSkillId: c.ultimateSkillId, core: c.core }; }
export function battleDaoV2ActiveSlotsUnlocked(realmOrder, maxSlots = 5) { return Math.min(maxSlots, BATTLE_DAO_V2_REALM_SEQUENCE.filter(realm => realmOrder >= BATTLE_DAO_V2_REALM_ORDER[realm]).length); }
export function isBattleDaoV2ActiveSkill(dao, skillId) { return battleDaoV2Tree(dao).some(row => row.activeSkillId === skillId); }
export function isBattleDaoV2PassiveId(passiveId) { return Boolean(battleDaoV2Passive(passiveId)); }
//# sourceMappingURL=battle-dao-v2-catalog.js.map