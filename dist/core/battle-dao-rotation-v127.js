import { applyBodyDaoAutoPresetV1, BODY_DAO_AUTO_DEFAULT_PRESET_V1, bodyDaoAutoMinHpPctV1 } from './body-dao-auto-v1.js';

export const BATTLE_DAO_AUTO_ROTATION_PREFIX_V127 = 'battle-dao.auto.v127';
const DAOS = ['sword', 'fist', 'body', 'spell', 'poison', 'artifact', 'formation', 'mind'];
function daoFromSkillId(id) {
    const match = /^skill\.dao\.(sword|fist|body|spell|poison|artifact|formation|mind)\./.exec(id);
    return match?.[1];
}
function rule(skillId, priority, ...conditions) { return { skillId, priority, conditions: conditions.length ? conditions : [{ type: 'always' }] }; }
function rulesForDao(dao, skillIds, offset = 0) {
    const out = [];
    const add = (suffix, priority, ...conditions) => { const id = `skill.dao.${dao}.${suffix}`; if (skillIds.has(id))
        out.push(rule(id, priority + offset, ...conditions)); };
    const gauge = { type: 'selfUltimateGaugeAtLeast', value: 100 };
    switch (dao) {
        case 'sword':
            // Auto Sword creates a readable kill window instead of dumping every resource on cooldown.
            add('finisher', 142, { type: 'swordFinisherKillWindow' });
            add('ultimate', 138, { type: 'swordPerfectUltimateWindow' });
            // Fallback Ultimate is intentionally lower: ai.js may hold it for at most 4s while building 5 Khí + 20 Ý.
            add('ultimate', 118, gauge);
            add('counter', 116);
            add('nurture', 113, { type: 'selfDaoV2ResourceBelow', resource: 'swordQi', value: 2 });
            add('finisher', 112, { type: 'selfDaoV2ResourceAtLeast', resource: 'swordQi', value: 3 }, { type: 'targetIsBroken' });
            add('sever', 108, { type: 'selfDaoV2ResourceAtLeast', resource: 'swordQi', value: 2 });
            add('break_mark', 102, { type: 'targetIsNotBroken' });
            add('chain', 96);
            add('flow_slash', 94);
            add('myriad', 90, { type: 'selfDaoV2ResourceAtLeast', resource: 'swordQi', value: 4 });
            add('break_mark', 86);
            add('nurture', 82, { type: 'selfDaoV2ResourceBelow', resource: 'swordQi', value: 3 });
            add('basic', 10);
            break;
        case 'fist':
            // Quyền Q3: phản ứng trước, ép Thất Thế, rồi mới cash-out Quyền Thế.
            add('shock', 160, { type: 'targetIsCasting' });
            add('counter', 154, { type: 'targetIsCasting' });
            add('finisher', 150, { type: 'selfDaoV2ResourceAtLeast', resource: 'fistForce', value: 4 }, { type: 'targetIsBroken' });
            add('pressure', 146, { type: 'selfDaoV2ResourceAtLeast', resource: 'fistForce', value: 5 }, { type: 'targetIsNotBroken' });
            add('ultimate', 142, gauge, { type: 'selfDaoV2ResourceAtLeast', resource: 'fistForce', value: 5 });
            add('heavy', 138, { type: 'selfDaoV2ResourceAtLeast', resource: 'fistForce', value: 5 });
            // Fallback Ultimate may be held briefly by ai.js while 4 Quyền Thế tries to reach 5.
            add('ultimate', 132, gauge, { type: 'selfDaoV2ResourceAtLeast', resource: 'fistForce', value: 4 });
            add('shock', 128, { type: 'targetIsNotBroken' });
            add('pressure', 124, { type: 'targetIsNotBroken' });
            add('heavy', 116, { type: 'selfDaoV2ResourceAtLeast', resource: 'fistForce', value: 2 });
            add('nurture', 110, { type: 'selfDaoV2ResourceBelow', resource: 'fistForce', value: 2 });
            add('triple', 104, { type: 'selfDaoV2ResourceBelow', resource: 'fistForce', value: 4 });
            add('chain_heavy', 98);
            add('shock', 94);
            add('triple', 90);
            add('pressure', 86);
            add('nurture', 82, { type: 'selfDaoV2ResourceBelow', resource: 'fistForce', value: 3 });
            add('basic', 10);
            break;
        case 'body': {
            // Body B6: Chịu → Hóa → Phản remains primary. Auto Nhiên Huyết is a payoff setup,
            // so it requires both healthy HP and banked Phản Thế instead of paying HP on cadence alone.
            const bodyAutoHp = bodyDaoAutoMinHpPctV1(BODY_DAO_AUTO_DEFAULT_PRESET_V1);
            add('ultimate', 180, gauge, { type: 'selfHpBelow', pct: 35 });
            add('recover', 176, { type: 'selfHpBelow', pct: 45 }, { type: 'selfDaoV2ResourceAtLeast', resource: 'counterForce', value: 40 });
            add('transform', 170, { type: 'targetIsCasting' });
            add('counter', 166, { type: 'targetIsCasting' }, { type: 'selfDaoV2ResourceAtLeast', resource: 'counterForce', value: 30 });
            add('finisher', 160, { type: 'targetIsBroken' }, { type: 'selfDaoV2ResourceAtLeast', resource: 'counterForce', value: 70 });
            add('break', 154, { type: 'targetIsNotBroken' }, { type: 'selfDaoV2ResourceAtLeast', resource: 'counterForce', value: 20 });
            add('elephant', 149, { type: 'selfHpAbove', pct: bodyAutoHp }, { type: 'selfDaoV2ResourceAtLeast', resource: 'counterForce', value: 20 });
            add('guard', 144, { type: 'selfHpBelow', pct: 85 }, { type: 'selfShieldBelow', pct: 8 });
            add('immovable', 138, { type: 'selfHpBelow', pct: 65 });
            // Non-emergency Ultimate is still held for a meaningful pressure state instead of full-HP dumping.
            add('ultimate', 132, gauge, { type: 'selfHpBelow', pct: 60 });
            add('basic', 10);
            break;
        }
        case 'spell':
            add('shield', 168, { type: 'selfHpBelow', pct: 45 }, { type: 'selfShieldBelow', pct: 8 });
            add('restore', 164, { type: 'spellNeedsSpirit' });
            add('transform', 162, { type: 'spellNeedsSpirit' });
            add('burst', 152, { type: 'spellPayoffReady', suffix: 'burst' });
            add('break', 150, { type: 'spellPayoffReady', suffix: 'break' }, { type: 'targetIsNotBroken' });
            add('break', 148, { type: 'spellPayoffReady', suffix: 'break' });
            add('ultimate', 142, gauge);
            add('light', 136, { type: 'spellWheelStepReady', form: 'Tốc Pháp' });
            add('basic', 135, { type: 'spellWheelStepReady', form: 'Tốc Pháp' });
            add('seal', 134, { type: 'spellWheelStepReady', form: 'Thi Triển' });
            add('channel', 133, { type: 'spellWheelStepReady', form: 'Dẫn Pháp' });
            // Payoffs are tactical-only: do not waste CN on a dry heavy cast while
            // the next wheel form is cooling down. Dẫn kits may channel for output.
            if (!skillIds.has('skill.dao.spell.burst')) add('channel', 90, { type: 'spellChannelWindow' });
            add('basic', 10);
            break;
        case 'poison':
            for(const [suffix,priority] of [['guard',180],['ultimate',160],['consume',150],['transform',140],['mist',130],['calamity',126],['insects',120],['heart',116],['bone',112],['basic',10]])
                add(suffix,priority,{type:'poisonWindow',suffix});
            break;
        case 'artifact':
            add('ultimate', 134, gauge, { type: 'selfDaoV2ResourceAtLeast', resource: 'artifactSourcesV2', value: 2 });
            add('recall', 126, { type: 'selfSpiritBelow', pct: 28 }, { type: 'selfDaoV2ResourceAtLeast', resource: 'artifactSourcesV2', value: 1 });
            add('guard', 120, { type: 'selfHpBelow', pct: 60 });
            // Dựng đủ nguồn trước; các lệnh lớn không được chen vào ngay từ nguồn đầu tiên.
            add('deploy', 116, { type: 'selfDaoV2ResourceBelow', resource: 'artifactSourcesV2', value: 3 });
            add('split', 114, { type: 'selfDaoV2ResourceBelow', resource: 'artifactSourcesV2', value: 3 });
            add('suppress', 108, { type: 'selfDaoV2ResourceAtLeast', resource: 'artifactSourcesV2', value: 3 });
            add('sync', 104, { type: 'selfDaoV2ResourceAtLeast', resource: 'artifactSourcesV2', value: 3 });
            add('merge', 100, { type: 'selfDaoV2ResourceAtLeast', resource: 'artifactSourcesV2', value: 3 }, { type: 'targetHpBelow', pct: 25 });
            add('strike', 92, { type: 'selfDaoV2ResourceAtLeast', resource: 'artifactSourcesV2', value: 1 });
            add('basic', 10);
            break;
        case 'formation': {
            const full=skillIds.has('skill.dao.formation.full_activate'),guard=skillIds.has('skill.dao.formation.convert');
            add('deploy', 150, {type:'selfDaoV2ResourceBelow',resource:'formationIntegrityV2',value:1});
            add('fortify',140,{type:'selfDaoV2ResourceBelow',resource:'formationIntegrityV2',value:guard?88:full?60:75});
            add('convert',139,{type:'selfDaoV2ResourceBelow',resource:'formationIntegrityV2',value:90},{type:'selfDaoV2ResourceAtLeast',resource:'formationNurtureV2',value:20});
            add('ultimate',132,gauge,{type:'selfDaoV2ResourceAtLeast',resource:'formationNurtureV2',value:70});
            add('full_activate',125,{type:'selfDaoV2ResourceAtLeast',resource:'formationNurtureV2',value:100});
            add('small_activate',124,{type:'selfDaoV2ResourceAtLeast',resource:'formationNurtureV2',value:25});
            add('nourish',115,{type:'selfDaoV2ResourceBelow',resource:'formationNurtureV2',value:full?65:55});
            add('seal',114,{type:'selfDaoV2ResourceBelow',resource:'formationNurtureV2',value:full?85:55});
            add('break',145,{type:'selfSpiritBelow',pct:15});
            add('basic',10);
            break;
        }
        case 'mind':
            // M1: tactical spenders are gated by the target-local Thần Ấn they actually consume.
            add('interfere', 156, { type: 'targetIsCasting' }, { type: 'targetMarkAtLeast', mark: 'Thần Ấn', stacks: 1 });
            add('burst', 150, { type: 'targetIsBroken' }, { type: 'targetMarkAtLeast', mark: 'Thần Ấn', stacks: 3 });
            add('ultimate', 144, gauge, { type: 'targetMarkAtLeast', mark: 'Thần Ấn', stacks: 3 });
            add('burst', 138, { type: 'targetMarkAtLeast', mark: 'Thần Ấn', stacks: 5 });
            // mindEchoCounter is cadence only: at 2/3 prefer a valuable snapshot source instead of spending marks.
            add('chase', 126, { type: 'selfDaoV2ResourceAtLeast', resource: 'mindEchoCounter', value: 2 });
            add('guard', 124, { type: 'selfHpBelow', pct: 58 });
            add('ultimate', 116, gauge);
            add('observe', 106);
            add('flow', 102);
            add('split', 98);
            add('chase', 94);
            add('mark', 90);
            add('basic', 10);
            break;
    }
    // Mọi skill Bản Đạo đang gắn đều có đường fallback, nhưng không được vượt rule chiến thuật phía trên.
    let fallback = 72;
    for (const id of skillIds) {
        if (daoFromSkillId(id) !== dao || out.some(r => r.skillId === id))
            continue;
        out.push(rule(id, fallback--, { type: 'always' }));
    }
    return out;
}
/**
 * Auto-rotation backend V1.27 + Bản Đạo V2. Chủ Đạo là nguồn Active duy nhất; Phụ Đạo chỉ đóng góp Passive.
 * Không thay skill/loadout của người chơi, chỉ sinh rule cho những skill Chủ Đạo đã được gắn.
 */
export function battleDaoAutoRotationV127(mainDao, activeSkillIds, secondaryDao) {
    const unique = [...new Set(activeSkillIds)], set = new Set(unique);
    const rules = [];
    rules.push(...rulesForDao(mainDao, set, 0));
    // V2 canonical: Phụ Đạo không có Active/Ultimate, vì vậy không sinh rotation rule cho secondaryDao.
    void secondaryDao;
    for (const id of unique) {
        if (daoFromSkillId(id) || rules.some(r => r.skillId === id))
            continue;
        rules.push(rule(id, 34, { type: 'always' }));
    }
    const presentDaos = DAOS.filter(dao => unique.some(id => daoFromSkillId(id) === dao));
    for (const dao of presentDaos) {
        if (dao === mainDao || dao === secondaryDao)
            continue;
        rules.push(...rulesForDao(dao, set, -28));
    }
    rules.sort((a, b) => b.priority - a.priority);
    const profile = { name: `${BATTLE_DAO_AUTO_ROTATION_PREFIX_V127}:${mainDao}${secondaryDao ? `+${secondaryDao}` : ''}`, rules };
    return mainDao === 'body' ? applyBodyDaoAutoPresetV1(profile, BODY_DAO_AUTO_DEFAULT_PRESET_V1) : profile;
}
export function isBattleDaoAutoRotationV127(profile) { return Boolean(profile?.name?.startsWith(BATTLE_DAO_AUTO_ROTATION_PREFIX_V127)); }
export function isBattleDaoSkillIdV127(id) { return Boolean(daoFromSkillId(id)); }
//# sourceMappingURL=battle-dao-rotation-v127.js.map
