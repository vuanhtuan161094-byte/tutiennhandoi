export const playableMortalCultivator = {
    id: 'entity.player.mortal_playable',
    name: 'Phàm Nhân',
    tags: ['Human', 'Cultivator'],
    stats: {
        maxHp: 1240, maxSpirit: 125, attack: 113, defense: 91,
        mobility: 100, accuracy: 100, critChancePct: 5, critPowerPerLayer: 0.5,
        controlPower: 80, resolve: 85, actionSpeed: 1,
    },
    skillIds: ['skill.basic_strike'],
    aiProfile: {
        name: 'Phàm Nhân · Bản Năng',
        rules: [{ skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }],
    },
};
export const lightningSwordCultivator = {
    id: 'entity.player.lightning_sword',
    name: 'Lôi Kiếm Tu',
    tags: ['Human', 'Cultivator', 'Sword', 'Lightning'],
    stats: {
        maxHp: 1240, maxSpirit: 125, attack: 113, defense: 91,
        mobility: 110, accuracy: 106, critChancePct: 112, critPowerPerLayer: 0.5,
        controlPower: 80, resolve: 85, actionSpeed: 1.08,
    },
    skillIds: [
        'skill.white_rainbow_slash', 'skill.thunder_finger', 'skill.guide_thunder',
        'skill.thunder_burst', 'skill.thunder_armor', 'skill.basic_strike',
    ],
    triggers: [
        {
            id: 'Lôi Văn Cộng Hưởng', event: 'OnCrit', chancePct: 35,
            sourceTags: ['ActiveHit'],
            effects: [{ type: 'addMark', mark: 'Lôi Ấn', stacks: 1, maxStacks: 10 }],
            cooldown: 0.35,
        },
    ],
    aiProfile: {
        name: 'Lôi Kiếm - Tích Ấn Bộc Phát',
        rules: [
            { skillId: 'skill.thunder_armor', priority: 100, conditions: [{ type: 'selfHpBelow', pct: 45 }] },
            { skillId: 'skill.thunder_burst', priority: 90, conditions: [{ type: 'targetMarkAtLeast', mark: 'Lôi Ấn', stacks: 5 }] },
            { skillId: 'skill.guide_thunder', priority: 70, conditions: [{ type: 'always' }] },
            { skillId: 'skill.thunder_finger', priority: 60, conditions: [{ type: 'always' }] },
            { skillId: 'skill.white_rainbow_slash', priority: 50, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] },
        ],
    },
};
export const heavySwordCultivator = {
    id: 'entity.enemy.heavy_sword',
    name: 'Trọng Kiếm Tu',
    tags: ['Human', 'Cultivator', 'Sword', 'Body'],
    stats: {
        maxHp: 1360, maxSpirit: 110, attack: 117, defense: 108,
        mobility: 76, accuracy: 103, critChancePct: 72, critPowerPerLayer: 0.5,
        controlPower: 88, resolve: 115, actionSpeed: 0.94,
    },
    skillIds: [
        'skill.heavy_mountain_break', 'skill.body_crash', 'skill.iron_bones',
        'skill.protective_charm', 'skill.white_rainbow_slash', 'skill.basic_strike',
    ],
    aiProfile: {
        name: 'Trọng Kiếm - Phá Khiên',
        rules: [
            { skillId: 'skill.iron_bones', priority: 100, conditions: [{ type: 'selfHpBelow', pct: 65 }] },
            { skillId: 'skill.body_crash', priority: 90, conditions: [{ type: 'targetHasShield' }] },
            { skillId: 'skill.heavy_mountain_break', priority: 80, conditions: [{ type: 'always' }] },
            { skillId: 'skill.protective_charm', priority: 70, conditions: [{ type: 'selfHpBelow', pct: 45 }] },
            { skillId: 'skill.white_rainbow_slash', priority: 50, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] },
        ],
    },
};
export const controlCultivator = {
    id: 'entity.enemy.control',
    name: 'Phù Tu',
    tags: ['Human', 'Cultivator', 'Talisman'],
    stats: {
        maxHp: 1240, maxSpirit: 160, attack: 108, defense: 92,
        mobility: 98, accuracy: 128, critChancePct: 40, critPowerPerLayer: 0.5,
        controlPower: 150, resolve: 96, actionSpeed: 1.02,
    },
    skillIds: [
        'skill.binding_talisman', 'skill.spirit_seal', 'skill.talisman_burst', 'skill.thunder_finger',
        'skill.thunder_burst', 'skill.restore_spirit', 'skill.clear_mind', 'skill.protective_charm', 'skill.basic_strike',
    ],
    aiProfile: {
        name: 'Phù Tu - Khống Chế',
        rules: [
            { skillId: 'skill.clear_mind', priority: 110, conditions: [{ type: 'selfHasStatus', statusId: 'status.stun' }] },
            { skillId: 'skill.protective_charm', priority: 105, conditions: [{ type: 'selfHpBelow', pct: 55 }] },
            { skillId: 'skill.restore_spirit', priority: 100, conditions: [{ type: 'selfSpiritBelow', pct: 25 }] },
            { skillId: 'skill.thunder_burst', priority: 90, conditions: [{ type: 'targetMarkAtLeast', mark: 'Lôi Ấn', stacks: 3 }] },
            { skillId: 'skill.binding_talisman', priority: 80, conditions: [{ type: 'always' }] },
            { skillId: 'skill.spirit_seal', priority: 70, conditions: [{ type: 'always' }] },
            { skillId: 'skill.talisman_burst', priority: 65, conditions: [{ type: 'always' }] },
            { skillId: 'skill.thunder_finger', priority: 60, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] },
        ],
    },
};
export const fireCultivator = {
    id: 'entity.player.fire_cultivator',
    name: 'Xích Viêm Tu',
    tags: ['Human', 'Cultivator', 'Fire', 'Spell'],
    stats: {
        maxHp: 1330, maxSpirit: 170, attack: 121, defense: 94,
        mobility: 91, accuracy: 112, critChancePct: 62, critPowerPerLayer: 0.5,
        controlPower: 92, resolve: 88, actionSpeed: 1.01,
    },
    skillIds: [
        'skill.firebolt', 'skill.flame_focus', 'skill.flame_eruption',
        'skill.scorching_seal', 'skill.rejuvenation', 'skill.basic_strike',
    ],
    aiProfile: {
        name: 'Xích Viêm - Thiêu Đốt Bộc Phát',
        rules: [
            { skillId: 'skill.rejuvenation', priority: 105, conditions: [{ type: 'selfHpBelow', pct: 32 }] },
            { skillId: 'skill.flame_eruption', priority: 95, conditions: [{ type: 'targetMarkAtLeast', mark: 'Hỏa Ấn', stacks: 4 }] },
            { skillId: 'skill.scorching_seal', priority: 85, conditions: [{ type: 'targetHpBelow', pct: 60 }] },
            { skillId: 'skill.flame_focus', priority: 75, conditions: [{ type: 'always' }] },
            { skillId: 'skill.firebolt', priority: 60, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] },
        ],
    },
};
export const poisonCultivator = {
    id: 'entity.player.poison_cultivator',
    name: 'U Minh Độc Tu',
    tags: ['Human', 'Cultivator', 'Poison'],
    stats: {
        maxHp: 1540, maxSpirit: 185, attack: 119, defense: 112,
        mobility: 100, accuracy: 121, critChancePct: 30, critPowerPerLayer: 0.5,
        controlPower: 116, resolve: 112, actionSpeed: 1.0,
    },
    skillIds: [
        'skill.venom_needle', 'skill.myriad_poison_cloud', 'skill.poison_detonation',
        'skill.rejuvenation', 'skill.clear_mind', 'skill.basic_strike',
    ],
    aiProfile: {
        name: 'Độc Tu - Tích Độc Bào Mòn',
        rules: [
            { skillId: 'skill.clear_mind', priority: 110, conditions: [{ type: 'selfHasStatus', statusId: 'status.stun' }] },
            { skillId: 'skill.rejuvenation', priority: 100, conditions: [{ type: 'selfHpBelow', pct: 36 }] },
            { skillId: 'skill.poison_detonation', priority: 95, conditions: [{ type: 'targetMarkAtLeast', mark: 'Độc Tích', stacks: 5 }] },
            { skillId: 'skill.myriad_poison_cloud', priority: 80, conditions: [{ type: 'always' }] },
            { skillId: 'skill.venom_needle', priority: 60, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] },
        ],
    },
};
export const windSwordCultivator = {
    id: 'entity.player.wind_sword',
    name: 'Tật Phong Kiếm Tu',
    tags: ['Human', 'Cultivator', 'Sword', 'Wind'],
    stats: {
        maxHp: 1180, maxSpirit: 125, attack: 103, defense: 84,
        mobility: 126, accuracy: 113, critChancePct: 78, critPowerPerLayer: 0.45,
        controlPower: 72, resolve: 82, actionSpeed: 1.16,
    },
    skillIds: [
        'skill.gale_slash', 'skill.phantom_wind_step', 'skill.wind_blade_flurry',
        'skill.sword_pressure', 'skill.triple_chain_sword', 'skill.basic_strike',
    ],
    aiProfile: {
        name: 'Phong Kiếm - Cơ Động Áp Lực',
        rules: [
            { skillId: 'skill.phantom_wind_step', priority: 95, conditions: [{ type: 'selfHpBelow', pct: 72 }] },
            { skillId: 'skill.sword_pressure', priority: 85, conditions: [{ type: 'always' }] },
            { skillId: 'skill.wind_blade_flurry', priority: 75, conditions: [{ type: 'always' }] },
            { skillId: 'skill.triple_chain_sword', priority: 65, conditions: [{ type: 'always' }] },
            { skillId: 'skill.gale_slash', priority: 50, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] },
        ],
    },
};
export const spiritGatheringTrialWolf = {
    id: 'entity.guardian.spirit_gathering_trial_wolf',
    name: 'Tụ Linh Huyễn Lang',
    tags: ['Beast', 'Spirit', 'Wolf', 'TutorialGuardian'],
    stats: {
        maxHp: 600, maxSpirit: 22, attack: 94, defense: 56,
        mobility: 96, accuracy: 88, critChancePct: 12, critPowerPerLayer: 0.5,
        controlPower: 52, resolve: 64, actionSpeed: 1.02,
    },
    skillIds: ['skill.wolf_pounce', 'skill.black_wind_claw'],
    aiProfile: {
        name: 'Tụ Linh Huyễn Lang · Nhập Môn',
        rules: [
            { skillId: 'skill.wolf_pounce', priority: 70, conditions: [{ type: 'always' }] },
            { skillId: 'skill.black_wind_claw', priority: 50, conditions: [{ type: 'always' }] },
        ],
    },
};
export const blackWindWolf = {
    id: 'entity.enemy.black_wind_wolf',
    name: 'Hắc Phong Lang',
    tags: ['Beast', 'Wind', 'Wolf'],
    stats: {
        maxHp: 760, maxSpirit: 20, attack: 78, defense: 52,
        mobility: 108, accuracy: 82, critChancePct: 22, critPowerPerLayer: 0.5,
        controlPower: 50, resolve: 58, actionSpeed: 1.08,
    },
    skillIds: ['skill.black_wind_claw', 'skill.wolf_pounce'],
    aiProfile: {
        name: 'Hắc Phong Lang - Áp Sát',
        rules: [
            { skillId: 'skill.wolf_pounce', priority: 80, conditions: [{ type: 'always' }] },
            { skillId: 'skill.black_wind_claw', priority: 50, conditions: [{ type: 'always' }] },
        ],
    },
};
export const blackWindWolfKing = {
    id: 'entity.elite.black_wind_wolf_king',
    name: 'Hắc Phong Lang Vương',
    tags: ['Beast', 'Wind', 'Wolf', 'Elite'],
    stats: {
        maxHp: 1380, maxSpirit: 35, attack: 112, defense: 73,
        mobility: 142, accuracy: 106, critChancePct: 75, critPowerPerLayer: 0.5,
        controlPower: 82, resolve: 86, actionSpeed: 1.18,
    },
    skillIds: ['skill.wolf_pounce', 'skill.black_wind_claw', 'skill.phantom_wind_step', 'skill.wind_blade_flurry'],
    aiProfile: {
        name: 'Lang Vương - Thăm Dò Săn Mồi',
        rules: [
            { skillId: 'skill.wolf_pounce', priority: 82, conditions: [{ type: 'always' }] },
            { skillId: 'skill.black_wind_claw', priority: 62, conditions: [{ type: 'always' }] },
            { skillId: 'skill.wind_blade_flurry', priority: 54, conditions: [{ type: 'always' }] },
        ],
    },
    phases: [
        {
            id: 'phase.black_wind.shadow_hunt', name: 'Ảnh Phong Liệp Sát', hpBelowPct: 68,
            description: 'Lang Vương thôi thăm dò, liên tục đổi vị và dùng phong nhận ép né để cướp nhịp.',
            counterHint: 'Multi-hit, kỹ năng ra tay nhanh và Cơ động/Chính xác ổn định sẽ bào Dodge Pressure tốt hơn một đòn chậm dễ hụt.',
            interruptCasting: true,
            counterWindow: {
                id: 'counter.black_wind.break_hunt', name: 'Phá Liệp Thế', duration: 6.5,
                description: 'Trong 6.5s đầu P2, dùng 2 hành động Truy Kích/Chính Xác/Multi-hit để ép Lang Vương mất nhịp đổi vị.',
                trigger: { type: 'skillRole', roles: ['Chase', 'Accuracy', 'MultiHit'], requiredActions: 2 },
                successText: 'Liên tục khóa đường đổi vị khiến Lang Vương trượt khỏi Liệp Thế và lộ sơ hở.',
                onSuccessEffects: [{ type: 'applyStatus', statusId: 'status.predator_off_balance', duration: 3.8, target: 'target' }],
            },
            onEnterEffects: [{ type: 'applyStatus', statusId: 'status.wind_step', duration: 5.5, target: 'self' }],
            aiProfile: { name: 'Lang Vương P2 - Ảnh Phong', rules: [
                    { skillId: 'skill.phantom_wind_step', priority: 120, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.wind_blade_flurry', priority: 102, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.wolf_pounce', priority: 78, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.black_wind_claw', priority: 55, conditions: [{ type: 'always' }] },
                ] },
        },
        {
            id: 'phase.black_wind.desperation', name: 'Hắc Phong Tuyệt Sát', hpBelowPct: 32,
            description: 'Bị dồn vào tuyệt cảnh, Lang Vương bỏ phòng thủ để đổi lấy tốc độ, chuẩn xác và sát thương kết liễu.',
            counterHint: 'Giữ một lớp Shield/Heal cho cuối trận; đừng kéo dài phase này nếu build có Burst hoặc kỹ năng khó né.',
            interruptCasting: true,
            counterWindow: {
                id: 'counter.black_wind.weather_storm', name: 'Chịu Tuyệt Sát', duration: 4.5,
                description: 'Dùng Barrier/Sustain đúng lúc đầu P3 để chịu nhịp tuyệt sát; Lang Vương sẽ quá đà và hở thân pháp.',
                trigger: { type: 'skillRole', roles: ['Barrier', 'Sustain'], requiredActions: 1 },
                successText: 'Ngươi chịu trọn nhịp Tuyệt Sát; Lang Vương quá đà, thân pháp rối loạn.',
                onSuccessEffects: [{ type: 'applyStatus', statusId: 'status.predator_off_balance', duration: 3.2, target: 'target' }],
            },
            onEnterEffects: [{ type: 'applyStatus', statusId: 'status.black_wind_desperation', duration: 120, target: 'self' }],
            aiProfile: { name: 'Lang Vương P3 - Tuyệt Sát', rules: [
                    { skillId: 'skill.wind_blade_flurry', priority: 125, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.wolf_pounce', priority: 108, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.phantom_wind_step', priority: 94, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.black_wind_claw', priority: 60, conditions: [{ type: 'always' }] },
                ] },
        },
    ],
};
export const ironBoar = {
    id: 'entity.enemy.iron_boar',
    name: 'Thiết Giáp Trư',
    tags: ['Beast', 'Body', 'Boar'],
    stats: {
        maxHp: 1120, maxSpirit: 25, attack: 91, defense: 112,
        mobility: 58, accuracy: 86, critChancePct: 15, critPowerPerLayer: 0.5,
        controlPower: 66, resolve: 98, actionSpeed: 0.82,
    },
    skillIds: ['skill.iron_boar_charge', 'skill.black_wind_claw'],
    aiProfile: {
        name: 'Thiết Giáp Trư - Cứng Đầu',
        rules: [
            { skillId: 'skill.iron_boar_charge', priority: 90, conditions: [{ type: 'targetHasShield' }] },
            { skillId: 'skill.iron_boar_charge', priority: 70, conditions: [{ type: 'always' }] },
            { skillId: 'skill.black_wind_claw', priority: 50, conditions: [{ type: 'always' }] },
        ],
    },
};
export const ironHideDemonBear = {
    id: 'entity.elite.iron_hide_demon_bear',
    name: 'Thiết Bì Yêu Hùng',
    tags: ['Beast', 'Body', 'Bear', 'Elite'],
    stats: {
        maxHp: 1780, maxSpirit: 45, attack: 120, defense: 132,
        mobility: 62, accuracy: 95, critChancePct: 32, critPowerPerLayer: 0.5,
        controlPower: 98, resolve: 132, actionSpeed: 0.9,
    },
    skillIds: ['skill.iron_bones', 'skill.body_crash', 'skill.meridian_breaker', 'skill.black_wind_claw'],
    aiProfile: {
        name: 'Yêu Hùng - Huyết Nhục Trấn Áp',
        rules: [
            { skillId: 'skill.iron_bones', priority: 100, conditions: [{ type: 'selfHpBelow', pct: 70 }] },
            { skillId: 'skill.meridian_breaker', priority: 88, conditions: [{ type: 'targetHpBelow', pct: 65 }] },
            { skillId: 'skill.body_crash', priority: 78, conditions: [{ type: 'targetHasShield' }] },
            { skillId: 'skill.body_crash', priority: 68, conditions: [{ type: 'always' }] },
            { skillId: 'skill.black_wind_claw', priority: 50, conditions: [{ type: 'always' }] },
        ],
    },
};
export const thunderSnake = {
    id: 'entity.enemy.thunder_snake',
    name: 'Lôi Văn Xà',
    tags: ['Beast', 'Lightning', 'Snake'],
    stats: {
        maxHp: 840, maxSpirit: 30, attack: 86, defense: 61,
        mobility: 116, accuracy: 96, critChancePct: 30, critPowerPerLayer: 0.5,
        controlPower: 72, resolve: 70, actionSpeed: 1.12,
    },
    skillIds: ['skill.thunder_fang', 'skill.thunder_snake_burst'],
    aiProfile: {
        name: 'Lôi Văn Xà - Tích Lôi',
        rules: [
            { skillId: 'skill.thunder_snake_burst', priority: 90, conditions: [{ type: 'targetMarkAtLeast', mark: 'Lôi Ấn', stacks: 3 }] },
            { skillId: 'skill.thunder_fang', priority: 60, conditions: [{ type: 'always' }] },
        ],
    },
};
export const thunderHornRhino = {
    id: 'entity.boss.thunder_horn_rhino',
    name: 'Lôi Giác Huyền Tê',
    tags: ['Beast', 'Lightning', 'Rhino', 'Boss'],
    stats: {
        maxHp: 2650, maxSpirit: 80, attack: 148, defense: 145,
        mobility: 68, accuracy: 108, critChancePct: 42, critPowerPerLayer: 0.5,
        controlPower: 122, resolve: 155, actionSpeed: 0.92,
    },
    skillIds: ['skill.rhino_charge', 'skill.rhino_thunder_armor', 'skill.rhino_thunder_roar', 'skill.rhino_overcharge', 'skill.iron_boar_charge'],
    aiProfile: {
        name: 'Lôi Giác Huyền Tê P1 - Xung Trận',
        rules: [
            { skillId: 'skill.rhino_charge', priority: 90, conditions: [{ type: 'targetHasShield' }] },
            { skillId: 'skill.rhino_charge', priority: 76, conditions: [{ type: 'always' }] },
            { skillId: 'skill.iron_boar_charge', priority: 58, conditions: [{ type: 'always' }] },
        ],
    },
    phases: [
        {
            id: 'phase.rhino.thunder_fortress', name: 'Lôi Khải Trấn Trường', hpBelowPct: 66,
            description: 'Huyền Tê dựng Lôi Khải rồi dùng Chấn Hống bảo vệ nhịp xung phong kế tiếp.',
            counterHint: 'Heavy/Stability Damage phá khiên nhanh hơn; nếu phá Lôi Khải trong cửa sổ đầu phase, Huyền Tê sẽ thật sự Vỡ Mạch và hở giáp.',
            counterWindow: {
                id: 'counter.rhino.break_armor', name: 'Phá Lôi Khải', duration: 7.0,
                description: 'Phá vỡ hộ thuẫn P2 trước khi cửa sổ đóng để làm lôi lực phản chấn vào giáp.',
                trigger: { type: 'shieldBreak' },
                successText: 'Lôi Khải vỡ sớm, lôi lực phản chấn khiến Huyền Tê Vỡ Mạch.',
                failureText: 'Lôi Khải ổn định; Huyền Tê giữ được thế xung trận.',
                onFailureEffects: [{ type: 'shield', capacity: 0, stability: 100, duration: 4.5, maxHpPct: 8 }],
                onSuccessEffects: [{ type: 'applyStatus', statusId: 'status.rhino_armor_broken', duration: 4.5, target: 'target' }],
            },
            onEnterEffects: [{ type: 'shield', capacity: 430, stability: 165, duration: 7 }],
            aiProfile: { name: 'Lôi Giác Huyền Tê P2 - Lôi Khải', rules: [
                    { skillId: 'skill.rhino_thunder_armor', priority: 118, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.rhino_thunder_roar', priority: 104, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.rhino_charge', priority: 92, conditions: [{ type: 'targetHasShield' }] },
                    { skillId: 'skill.rhino_charge', priority: 72, conditions: [{ type: 'always' }] },
                ] },
        },
        {
            id: 'phase.rhino.overcharge', name: 'Lôi Giác Bạo Tẩu', hpBelowPct: 28,
            description: 'Lôi lực ép toàn thân quá tải; Huyền Tê tăng tốc công kích và chấp nhận hở giáp để đổi lấy kết liễu.',
            counterHint: 'Đây là cửa sổ burst: sống qua cú Charge đầu rồi tận dụng phòng ngự giảm để kết thúc nhanh.',
            interruptCasting: true,
            onEnterEffects: [{ type: 'applyStatus', statusId: 'status.rhino_overcharge', duration: 5.5, target: 'self' }],
            aiProfile: { name: 'Lôi Giác Huyền Tê P3 - Bạo Tẩu', rules: [
                    { skillId: 'skill.rhino_overcharge', priority: 135, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.rhino_charge', priority: 120, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.rhino_thunder_roar', priority: 98, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.iron_boar_charge', priority: 70, conditions: [{ type: 'always' }] },
                ] },
        },
    ],
};
export const bloodRiverRogue = {
    id: 'entity.boss.blood_river_rogue',
    name: 'Huyết Hà Tán Nhân',
    tags: ['Human', 'Cultivator', 'Blood', 'Boss'],
    stats: {
        maxHp: 2320, maxSpirit: 175, attack: 134, defense: 96,
        mobility: 101, accuracy: 112, critChancePct: 58, critPowerPerLayer: 0.5,
        controlPower: 146, resolve: 168, actionSpeed: 1.04,
    },
    skillIds: [
        'skill.blood_river_drain', 'skill.blood_river_bind', 'skill.blood_river_recovery',
        'skill.meridian_breaker', 'skill.blood_frenzy',
    ],
    aiProfile: {
        name: 'Huyết Hà P1 - Thăm Mạch',
        rules: [
            { skillId: 'skill.blood_river_bind', priority: 88, conditions: [{ type: 'always' }] },
            { skillId: 'skill.blood_river_drain', priority: 78, conditions: [{ type: 'always' }] },
            { skillId: 'skill.meridian_breaker', priority: 66, conditions: [{ type: 'always' }] },
        ],
    },
    phases: [
        {
            id: 'phase.blood_river.lockdown', name: 'Huyết Tỏa Phong Mạch', hpBelowPct: 62,
            description: 'Huyết Hà đổi sang khóa thân và Phá Mạch, khiến hồi phục của đối thủ kém hiệu quả trước khi hút sinh lực.',
            counterHint: 'Resolve và nhịp đánh ổn định giúp không bị khóa chuỗi; nếu có anti-heal hãy giữ cho phase cuối thay vì dùng vô nghĩa từ đầu.',
            aiProfile: { name: 'Huyết Hà P2 - Phong Mạch', rules: [
                    { skillId: 'skill.meridian_breaker', priority: 112, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.blood_river_bind', priority: 102, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.blood_river_drain', priority: 84, conditions: [{ type: 'always' }] },
                ] },
        },
        {
            id: 'phase.blood_river.reversal', name: 'Huyết Hà Quy Nguyên', hpBelowPct: 38,
            description: 'Tán Nhân thanh tẩy debuff, hồi một nhịp Linh Lực rồi xoay vòng hồi máu lớn, hút sinh và Huyết Chiến để kéo trận đấu ngược trở lại.',
            counterHint: 'P3 thanh tẩy debuff đúng một lần khi chuyển phase: tái áp anti-heal trong 5.5s đầu sẽ khiến Quy Nguyên phản phệ thành Khí Huyết Nghịch Loạn.',
            interruptCasting: true,
            counterWindow: {
                id: 'counter.blood_river.reverse_flow', name: 'Nghịch Quy Nguyên', duration: 5.5,
                description: 'Sau lần thanh tẩy đầu P3, tái áp anti-heal trước khi Huyết Hà ổn định vòng hồi phục.',
                trigger: { type: 'antiHeal' },
                successText: 'Anti-heal cắt đúng lúc Quy Nguyên tái lập; huyết khí phản phệ thành Khí Huyết Nghịch Loạn.',
                failureText: 'Quy Nguyên hoàn tất; Huyết Hà kéo sinh cơ trở lại.',
                onFailureEffects: [{ type: 'heal', maxHpPct: 12, target: 'self' }],
                onSuccessEffects: [{ type: 'applyStatus', statusId: 'status.blood_qi_backlash', duration: 6.5, target: 'target' }],
            },
            onEnterEffects: [
                { type: 'removeStatus', groups: ['Debuff'], target: 'self' },
                { type: 'restoreSpirit', flat: 42 },
                { type: 'applyStatus', statusId: 'status.blood_frenzy', duration: 6, target: 'self' },
            ],
            aiProfile: { name: 'Huyết Hà P3 - Quy Nguyên', rules: [
                    { skillId: 'skill.blood_river_recovery', priority: 138, conditions: [{ type: 'selfHpBelow', pct: 55 }] },
                    { skillId: 'skill.blood_frenzy', priority: 122, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.blood_river_drain', priority: 112, conditions: [{ type: 'always' }] },
                    { skillId: 'skill.blood_river_bind', priority: 88, conditions: [{ type: 'always' }] },
                ] },
        },
    ],
};
export const purpleMistSpider = {
    id: 'entity.elite.purple_mist_spider',
    name: 'Tử Vụ Huyền Chu',
    tags: ['Beast', 'Poison', 'PurplePalace', 'Elite'],
    stats: {
        maxHp: 2150, maxSpirit: 70, attack: 132, defense: 108,
        mobility: 112, accuracy: 118, critChancePct: 46, critPowerPerLayer: 0.5,
        controlPower: 134, resolve: 128, actionSpeed: 1.06,
    },
    skillIds: ['skill.venom_needle', 'skill.myriad_poison_cloud', 'skill.binding_talisman', 'skill.basic_strike'],
    aiProfile: {
        name: 'Tử Vụ Huyền Chu - Độc Võng',
        rules: [
            { skillId: 'skill.binding_talisman', priority: 96, conditions: [{ type: 'always' }] },
            { skillId: 'skill.myriad_poison_cloud', priority: 88, conditions: [{ type: 'always' }] },
            { skillId: 'skill.venom_needle', priority: 66, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] },
        ],
    },
};
export const purpleMirrorGuardian = {
    id: 'entity.boss.purple_mirror_guardian',
    name: 'Tử Kính Hộ Linh',
    tags: ['SpiritEntity', 'PurplePalace', 'Mirror', 'Boss'],
    stats: {
        maxHp: 3480, maxSpirit: 150, attack: 164, defense: 168,
        mobility: 86, accuracy: 130, critChancePct: 48, critPowerPerLayer: 0.5,
        controlPower: 158, resolve: 188, actionSpeed: 0.98,
    },
    skillIds: ['skill.purple_mirror_guard', 'skill.purple_mirror_bind', 'skill.purple_mirror_shard', 'skill.basic_strike'],
    aiProfile: {
        name: 'Tử Kính Hộ Linh - Kính Quang Phản Chế',
        rules: [
            { skillId: 'skill.purple_mirror_guard', priority: 115, conditions: [{ type: 'selfHpBelow', pct: 78 }] },
            { skillId: 'skill.purple_mirror_bind', priority: 92, conditions: [{ type: 'always' }] },
            { skillId: 'skill.purple_mirror_shard', priority: 78, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 20, conditions: [{ type: 'always' }] },
        ],
    },
};
export const goldenCoreFireApe = {
    id: 'entity.boss.golden_core_fire_ape',
    name: 'Kim Đan Hỏa Viên',
    tags: ['Beast', 'Fire', 'GoldenCore', 'Boss'],
    stats: {
        maxHp: 4050, maxSpirit: 120, attack: 192, defense: 154,
        mobility: 92, accuracy: 136, critChancePct: 62, critPowerPerLayer: 0.55,
        controlPower: 142, resolve: 194, actionSpeed: 1.02,
    },
    skillIds: ['skill.core_fire_focus', 'skill.core_fire_fist', 'skill.core_fire_burst', 'skill.scorching_seal', 'skill.basic_strike'],
    aiProfile: {
        name: 'Kim Đan Hỏa Viên - Đan Hỏa Bạo Liệt',
        rules: [
            { skillId: 'skill.core_fire_burst', priority: 120, conditions: [{ type: 'targetMarkAtLeast', mark: 'Hỏa Ấn', stacks: 4 }] },
            { skillId: 'skill.core_fire_focus', priority: 105, conditions: [{ type: 'selfHpBelow', pct: 74 }] },
            { skillId: 'skill.scorching_seal', priority: 90, conditions: [{ type: 'targetHpBelow', pct: 70 }] },
            { skillId: 'skill.core_fire_fist', priority: 76, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 20, conditions: [{ type: 'always' }] },
        ],
    },
};
export const starfallSwordGhost = {
    id: 'entity.boss.starfall_sword_ghost',
    name: 'Tinh Lạc Kiếm Hồn',
    tags: ['SpiritEntity', 'Sword', 'Star', 'GoldenCore', 'Boss'],
    stats: {
        maxHp: 3660, maxSpirit: 130, attack: 184, defense: 132,
        mobility: 142, accuracy: 150, critChancePct: 92, critPowerPerLayer: 0.58,
        controlPower: 112, resolve: 174, actionSpeed: 1.14,
    },
    skillIds: ['skill.starfall_sword_intent', 'skill.starfall_sword_rain', 'skill.starfall_sever', 'skill.sword_pressure', 'skill.basic_strike'],
    aiProfile: {
        name: 'Tinh Lạc Kiếm Hồn - Kiếm Vũ Phá Thế',
        rules: [
            { skillId: 'skill.starfall_sword_intent', priority: 110, conditions: [{ type: 'always' }] },
            { skillId: 'skill.starfall_sever', priority: 96, conditions: [{ type: 'targetHasShield' }] },
            { skillId: 'skill.sword_pressure', priority: 88, conditions: [{ type: 'always' }] },
            { skillId: 'skill.starfall_sword_rain', priority: 76, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 20, conditions: [{ type: 'always' }] },
        ],
    },
};
export const soulEaterWraith = {
    id: 'entity.elite.soul_eater_wraith',
    name: 'Phệ Hồn U Ảnh',
    tags: ['SpiritEntity', 'Soul', 'NascentSoul', 'Elite'],
    stats: { maxHp: 4380, maxSpirit: 210, attack: 202, defense: 142, mobility: 136, accuracy: 154, critChancePct: 70, critPowerPerLayer: 0.55, controlPower: 188, resolve: 205, actionSpeed: 1.12 },
    skillIds: ['skill.ghost_soul_flame', 'skill.soul_devour', 'skill.soul_piercing_needle', 'skill.basic_strike'],
    aiProfile: { name: 'Phệ Hồn U Ảnh - Mài Mòn Thần Niệm', rules: [
            { skillId: 'skill.soul_devour', priority: 104, conditions: [{ type: 'selfHpBelow', pct: 58 }] },
            { skillId: 'skill.ghost_soul_flame', priority: 90, conditions: [{ type: 'always' }] },
            { skillId: 'skill.soul_piercing_needle', priority: 72, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] },
        ] },
};
export const soulPoolWarden = {
    id: 'entity.boss.soul_pool_warden',
    name: 'Dưỡng Hồn Trì Hộ Linh',
    tags: ['SpiritEntity', 'Soul', 'NascentSoul', 'Boss'],
    stats: { maxHp: 5680, maxSpirit: 280, attack: 222, defense: 196, mobility: 104, accuracy: 162, critChancePct: 64, critPowerPerLayer: 0.56, controlPower: 214, resolve: 246, actionSpeed: 1.02 },
    skillIds: ['skill.nascent_soul_guard', 'skill.soul_chain_bind', 'skill.soul_shock_break', 'skill.soul_devour', 'skill.basic_strike'],
    aiProfile: { name: 'Dưỡng Hồn Trì Hộ Linh - Trấn Hồn', rules: [
            { skillId: 'skill.nascent_soul_guard', priority: 118, conditions: [{ type: 'selfHpBelow', pct: 76 }] },
            { skillId: 'skill.soul_chain_bind', priority: 100, conditions: [{ type: 'always' }] },
            { skillId: 'skill.soul_shock_break', priority: 90, conditions: [{ type: 'targetHasShield' }] },
            { skillId: 'skill.soul_devour', priority: 80, conditions: [{ type: 'selfHpBelow', pct: 48 }] },
            { skillId: 'skill.basic_strike', priority: 12, conditions: [{ type: 'always' }] },
        ] },
};
export const nascentMirrorChild = {
    id: 'entity.boss.nascent_mirror_child',
    name: 'Kính Sinh Nguyên Anh',
    tags: ['SpiritEntity', 'Soul', 'Mirror', 'NascentSoul', 'Boss'],
    stats: { maxHp: 5220, maxSpirit: 330, attack: 214, defense: 164, mobility: 158, accuracy: 178, critChancePct: 98, critPowerPerLayer: 0.60, controlPower: 205, resolve: 224, actionSpeed: 1.16 },
    skillIds: ['skill.nascent_soul_exit', 'skill.soul_storm', 'skill.soul_piercing_needle', 'skill.soul_chain_bind', 'skill.basic_strike'],
    aiProfile: { name: 'Kính Sinh Nguyên Anh - Vạn Niệm Phân Quang', rules: [
            { skillId: 'skill.nascent_soul_exit', priority: 116, conditions: [{ type: 'selfHpBelow', pct: 72 }] },
            { skillId: 'skill.soul_storm', priority: 102, conditions: [{ type: 'always' }] },
            { skillId: 'skill.soul_chain_bind', priority: 90, conditions: [{ type: 'always' }] },
            { skillId: 'skill.soul_piercing_needle', priority: 76, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 12, conditions: [{ type: 'always' }] },
        ] },
};
export const daoEchoAvatar = {
    id: 'entity.boss.dao_echo_avatar',
    name: 'Đạo Ảnh Phân Thân',
    tags: ['SpiritEntity', 'Dao', 'SpiritTransformation', 'Boss'],
    stats: { maxHp: 6900, maxSpirit: 360, attack: 248, defense: 216, mobility: 148, accuracy: 188, critChancePct: 102, critPowerPerLayer: 0.62, controlPower: 224, resolve: 268, actionSpeed: 1.12 },
    skillIds: ['skill.starfall_sword_intent', 'skill.soul_storm', 'skill.soul_chain_bind', 'skill.basic_strike'],
    aiProfile: { name: 'Đạo Ảnh - Ý Niệm Thành Thế', rules: [
            { skillId: 'skill.starfall_sword_intent', priority: 112, conditions: [{ type: 'always' }] },
            { skillId: 'skill.soul_storm', priority: 96, conditions: [{ type: 'always' }] },
            { skillId: 'skill.soul_chain_bind', priority: 82, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 12, conditions: [{ type: 'always' }] },
        ] },
};
export const daoDomainShadow = {
    id: 'entity.boss.dao_domain_shadow',
    name: 'Đạo Vực Tàn Ảnh',
    tags: ['SpiritEntity', 'Dao', 'Domain', 'SpiritTransformation', 'Boss'],
    stats: { maxHp: 8450, maxSpirit: 440, attack: 278, defense: 244, mobility: 156, accuracy: 205, critChancePct: 118, critPowerPerLayer: 0.66, controlPower: 252, resolve: 304, actionSpeed: 1.16 },
    skillIds: ['skill.nascent_soul_exit', 'skill.starfall_sever', 'skill.soul_shock_break', 'skill.soul_storm', 'skill.basic_strike'],
    aiProfile: { name: 'Đạo Vực Tàn Ảnh - Quy Tắc Áp Chế', rules: [
            { skillId: 'skill.nascent_soul_exit', priority: 116, conditions: [{ type: 'selfHpBelow', pct: 72 }] },
            { skillId: 'skill.starfall_sever', priority: 102, conditions: [{ type: 'targetHasShield' }] },
            { skillId: 'skill.soul_shock_break', priority: 90, conditions: [{ type: 'always' }] },
            { skillId: 'skill.soul_storm', priority: 78, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 14, conditions: [{ type: 'always' }] },
        ] },
};
export const voidRiftStalker = {
    id: 'entity.elite.void_rift_stalker',
    name: 'Hư Liệt Ảnh Thú',
    tags: ['Beast', 'Space', 'Void', 'VoidRefinement', 'Elite'],
    stats: { maxHp: 9800, maxSpirit: 520, attack: 306, defense: 248, mobility: 205, accuracy: 228, critChancePct: 126, critPowerPerLayer: 0.68, controlPower: 258, resolve: 318, actionSpeed: 1.22 },
    skillIds: ['skill.void_fold_step', 'skill.spatial_sever', 'skill.rift_collapse', 'skill.basic_strike'],
    aiProfile: { name: 'Hư Liệt Ảnh Thú - Thác Vị Truy Sát', rules: [
            { skillId: 'skill.void_fold_step', priority: 110, conditions: [{ type: 'always' }] },
            { skillId: 'skill.spatial_sever', priority: 96, conditions: [{ type: 'always' }] },
            { skillId: 'skill.rift_collapse', priority: 82, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 12, conditions: [{ type: 'always' }] },
        ] },
};
export const voidGateWarden = {
    id: 'entity.boss.void_gate_warden',
    name: 'Hư Môn Trấn Giới Linh',
    tags: ['SpiritEntity', 'Space', 'Void', 'VoidRefinement', 'Boss'],
    stats: { maxHp: 13200, maxSpirit: 680, attack: 342, defense: 292, mobility: 178, accuracy: 238, critChancePct: 132, critPowerPerLayer: 0.70, controlPower: 286, resolve: 354, actionSpeed: 1.18 },
    skillIds: ['skill.void_anchor_guard', 'skill.spatial_sever', 'skill.rift_collapse', 'skill.soul_shock_break', 'skill.basic_strike'],
    aiProfile: { name: 'Hư Môn Trấn Giới Linh - Khóa Không Trấn Vực', rules: [
            { skillId: 'skill.void_anchor_guard', priority: 118, conditions: [{ type: 'selfHpBelow', pct: 72 }] },
            { skillId: 'skill.spatial_sever', priority: 104, conditions: [{ type: 'targetHasShield' }] },
            { skillId: 'skill.rift_collapse', priority: 92, conditions: [{ type: 'always' }] },
            { skillId: 'skill.soul_shock_break', priority: 78, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 12, conditions: [{ type: 'always' }] },
        ] },
};
export const threeOriginAvatar = {
    id: 'entity.boss.three_origin_avatar',
    name: 'Tam Nguyên Hợp Thể Ảnh',
    tags: ['SpiritEntity', 'Integration', 'Body', 'Soul', 'Dao', 'Boss'],
    stats: { maxHp: 18200, maxSpirit: 860, attack: 388, defense: 344, mobility: 182, accuracy: 252, critChancePct: 140, critPowerPerLayer: 0.72, controlPower: 318, resolve: 398, actionSpeed: 1.20 },
    skillIds: ['skill.void_anchor_guard', 'skill.soul_shock_break', 'skill.starfall_sever', 'skill.rift_collapse', 'skill.basic_strike'],
    aiProfile: { name: 'Tam Nguyên Hợp Thể Ảnh - Thân Hồn Đạo Đồng Quy', rules: [
            { skillId: 'skill.void_anchor_guard', priority: 120, conditions: [{ type: 'selfHpBelow', pct: 70 }] },
            { skillId: 'skill.soul_shock_break', priority: 104, conditions: [{ type: 'targetHasShield' }] },
            { skillId: 'skill.starfall_sever', priority: 94, conditions: [{ type: 'always' }] },
            { skillId: 'skill.rift_collapse', priority: 82, conditions: [{ type: 'always' }] },
            { skillId: 'skill.basic_strike', priority: 12, conditions: [{ type: 'always' }] },
        ] },
};
export const greatVehicleDomainBeast = {
    id: 'entity.elite.great_vehicle_domain_beast', name: 'Vạn Vực Thôn Thiên Thú', tags: ['Beast', 'Dao', 'GreatVehicle', 'Elite'],
    stats: { maxHp: 24500, maxSpirit: 1120, attack: 438, defense: 386, mobility: 188, accuracy: 278, critChancePct: 148, critPowerPerLayer: 0.74, controlPower: 350, resolve: 442, actionSpeed: 1.22 },
    skillIds: ['skill.myriad_domain_wave', 'skill.dao_heaven_press', 'skill.basic_strike'],
    aiProfile: { name: 'Vạn Vực Thôn Thiên Thú - Vực Triều', rules: [{ skillId: 'skill.dao_heaven_press', priority: 104, conditions: [{ type: 'targetHasShield' }] }, { skillId: 'skill.myriad_domain_wave', priority: 92, conditions: [{ type: 'always' }] }, { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }] },
};
export const greatVehicleHeavenLord = {
    id: 'entity.boss.great_vehicle_heaven_lord', name: 'Đại Thừa Thiên Vực Ảnh', tags: ['SpiritEntity', 'Dao', 'GreatVehicle', 'Boss'],
    stats: { maxHp: 32800, maxSpirit: 1500, attack: 492, defense: 432, mobility: 194, accuracy: 296, critChancePct: 156, critPowerPerLayer: 0.76, controlPower: 384, resolve: 492, actionSpeed: 1.24 },
    skillIds: ['skill.heaven_mandate_guard', 'skill.dao_heaven_press', 'skill.myriad_domain_wave', 'skill.basic_strike'],
    aiProfile: { name: 'Đại Thừa Thiên Vực Ảnh - Quyền Vực', rules: [{ skillId: 'skill.heaven_mandate_guard', priority: 118, conditions: [{ type: 'selfHpBelow', pct: 68 }] }, { skillId: 'skill.dao_heaven_press', priority: 104, conditions: [{ type: 'always' }] }, { skillId: 'skill.myriad_domain_wave', priority: 92, conditions: [{ type: 'always' }] }, { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }] },
};
export const tribulationThunderAvatar = {
    id: 'entity.elite.tribulation_thunder_avatar', name: 'Kiếp Lôi Hóa Linh', tags: ['SpiritEntity', 'Lightning', 'Tribulation', 'Elite'],
    stats: { maxHp: 35500, maxSpirit: 0, attack: 520, defense: 410, mobility: 205, accuracy: 306, critChancePct: 164, critPowerPerLayer: 0.78, controlPower: 392, resolve: 520, actionSpeed: 1.28 },
    skillIds: ['skill.tribulation_thunder', 'skill.rift_collapse', 'skill.basic_strike'],
    aiProfile: { name: 'Kiếp Lôi Hóa Linh - Lôi Phạt', rules: [{ skillId: 'skill.tribulation_thunder', priority: 110, conditions: [{ type: 'always' }] }, { skillId: 'skill.rift_collapse', priority: 88, conditions: [{ type: 'always' }] }, { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }] },
};
export const heartDemonTribulation = {
    id: 'entity.boss.heart_demon_tribulation', name: 'Vạn Thế Tâm Ma Ảnh', tags: ['SpiritEntity', 'Soul', 'Tribulation', 'Boss'],
    stats: { maxHp: 41800, maxSpirit: 0, attack: 548, defense: 445, mobility: 210, accuracy: 320, critChancePct: 148, critPowerPerLayer: 0.78, controlPower: 438, resolve: 548, actionSpeed: 1.30 },
    skillIds: ['skill.heart_demon_illusion', 'skill.karma_fire', 'skill.tribulation_thunder', 'skill.basic_strike'],
    aiProfile: { name: 'Vạn Thế Tâm Ma Ảnh - Hồi Chiếu', rules: [{ skillId: 'skill.heart_demon_illusion', priority: 118, conditions: [{ type: 'always' }] }, { skillId: 'skill.karma_fire', priority: 102, conditions: [{ type: 'always' }] }, { skillId: 'skill.tribulation_thunder', priority: 92, conditions: [{ type: 'targetHasShield' }] }, { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }] },
};
export const immortalSpiritCrane = {
    id: 'entity.elite.immortal_spirit_crane', name: 'Tiên Linh Hạc', tags: ['Beast', 'Immortal', 'HumanImmortal', 'Elite'],
    stats: { maxHp: 46500, maxSpirit: 1750, attack: 570, defense: 456, mobility: 255, accuracy: 338, critChancePct: 172, critPowerPerLayer: 0.80, controlPower: 402, resolve: 570, actionSpeed: 1.34 },
    skillIds: ['skill.immortal_cloud_step', 'skill.immortal_essence_strike', 'skill.basic_strike'],
    aiProfile: { name: 'Tiên Linh Hạc - Tiên Vân', rules: [{ skillId: 'skill.immortal_cloud_step', priority: 108, conditions: [{ type: 'always' }] }, { skillId: 'skill.immortal_essence_strike', priority: 96, conditions: [{ type: 'always' }] }, { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }] },
};
export const immortalPoolWarden = {
    id: 'entity.boss.immortal_pool_warden', name: 'Tiên Trì Trấn Thủ', tags: ['SpiritEntity', 'Immortal', 'HumanImmortal', 'Boss'],
    stats: { maxHp: 58500, maxSpirit: 2300, attack: 622, defense: 505, mobility: 215, accuracy: 352, critChancePct: 178, critPowerPerLayer: 0.82, controlPower: 432, resolve: 626, actionSpeed: 1.30 },
    skillIds: ['skill.immortal_body_guard', 'skill.immortal_essence_strike', 'skill.immortal_cloud_step', 'skill.dao_heaven_press', 'skill.basic_strike'],
    aiProfile: { name: 'Tiên Trì Trấn Thủ - Tiên Nguyên Hộ Giới', rules: [{ skillId: 'skill.immortal_body_guard', priority: 120, conditions: [{ type: 'selfHpBelow', pct: 70 }] }, { skillId: 'skill.immortal_essence_strike', priority: 106, conditions: [{ type: 'always' }] }, { skillId: 'skill.dao_heaven_press', priority: 92, conditions: [{ type: 'targetHasShield' }] }, { skillId: 'skill.immortal_cloud_step', priority: 80, conditions: [{ type: 'always' }] }, { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }] },
};
export const earthVeinGuardian = {
    id: 'entity.boss.earth_vein_guardian', name: 'Địa Mạch Tiên Linh', tags: ['SpiritEntity', 'Immortal', 'EarthImmortal', 'Boss'],
    stats: { maxHp: 76000, maxSpirit: 2800, attack: 690, defense: 610, mobility: 190, accuracy: 370, critChancePct: 182, critPowerPerLayer: 0.84, controlPower: 450, resolve: 760, actionSpeed: 1.24 },
    skillIds: ['skill.earth_anchor_guard', 'skill.earth_vein_palm', 'skill.immortal_essence_strike', 'skill.basic_strike'],
    aiProfile: { name: 'Địa Mạch Tiên Linh - Trấn Mạch', rules: [{ skillId: 'skill.earth_anchor_guard', priority: 120, conditions: [{ type: 'selfHpBelow', pct: 72 }] }, { skillId: 'skill.earth_vein_palm', priority: 104, conditions: [{ type: 'targetHasShield' }] }, { skillId: 'skill.immortal_essence_strike', priority: 90, conditions: [{ type: 'always' }] }, { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }] }
};
export const heavenLawWarden = {
    id: 'entity.boss.heaven_law_warden', name: 'Thiên Luật Tuần Sứ', tags: ['SpiritEntity', 'Immortal', 'HeavenImmortal', 'Boss'],
    stats: { maxHp: 92000, maxSpirit: 3600, attack: 770, defense: 650, mobility: 285, accuracy: 430, critChancePct: 192, critPowerPerLayer: 0.86, controlPower: 510, resolve: 820, actionSpeed: 1.38 },
    skillIds: ['skill.heaven_stream_step', 'skill.heaven_law_fall', 'skill.immortal_body_guard', 'skill.basic_strike'],
    aiProfile: { name: 'Thiên Luật Tuần Sứ - Thuận Thiên Lưu', rules: [{ skillId: 'skill.heaven_stream_step', priority: 116, conditions: [{ type: 'always' }] }, { skillId: 'skill.heaven_law_fall', priority: 106, conditions: [{ type: 'always' }] }, { skillId: 'skill.immortal_body_guard', priority: 92, conditions: [{ type: 'selfHpBelow', pct: 58 }] }, { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }] }
};
export const trueLawAvatar = {
    id: 'entity.boss.true_law_avatar', name: 'Chân Luật Pháp Ảnh', tags: ['SpiritEntity', 'Immortal', 'TrueImmortal', 'Boss'],
    stats: { maxHp: 118000, maxSpirit: 4500, attack: 875, defense: 735, mobility: 255, accuracy: 475, critChancePct: 204, critPowerPerLayer: 0.90, controlPower: 590, resolve: 940, actionSpeed: 1.36 },
    skillIds: ['skill.true_body_manifest', 'skill.true_law_seal', 'skill.heaven_law_fall', 'skill.basic_strike'],
    aiProfile: { name: 'Chân Luật Pháp Ảnh - Luật Tồn', rules: [{ skillId: 'skill.true_body_manifest', priority: 122, conditions: [{ type: 'selfHpBelow', pct: 70 }] }, { skillId: 'skill.true_law_seal', priority: 110, conditions: [{ type: 'always' }] }, { skillId: 'skill.heaven_law_fall', priority: 96, conditions: [{ type: 'targetHasShield' }] }, { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }] }
};
function apexEntity(id, name, tags, stats, skills, boss = false) {
    return { id, name, tags: [...tags, boss ? 'Boss' : 'Elite'], stats: { maxHp: stats.hp, maxSpirit: stats.spirit, attack: stats.attack, defense: stats.defense, mobility: stats.mobility, accuracy: stats.accuracy, critChancePct: stats.crit, critPowerPerLayer: 0.92, controlPower: stats.control, resolve: stats.resolve, actionSpeed: stats.speed }, skillIds: [...skills, 'skill.basic_strike'], aiProfile: { name: `${name} - Pháp Tắc`, rules: [{ skillId: skills[1], priority: 120, conditions: [{ type: 'selfHpBelow', pct: 68 }] }, { skillId: skills[0], priority: 104, conditions: [{ type: 'always' }] }, { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }] } };
}
export const mysticLawWeaver = apexEntity('entity.elite.mystic_law_weaver', 'Huyền Luật Chức Linh', ['Immortal', 'MysticImmortal', 'Law'], { hp: 138000, spirit: 5200, attack: 960, defense: 805, mobility: 270, accuracy: 510, crit: 214, control: 630, resolve: 1020, speed: 1.38 }, ['skill.mystic_law_weave', 'skill.mystic_law_guard']);
export const mysticLawSovereign = apexEntity('entity.boss.mystic_law_sovereign', 'Huyền Luật Vạn Tuyến Quân', ['Immortal', 'MysticImmortal', 'Law'], { hp: 188000, spirit: 6800, attack: 1080, defense: 900, mobility: 282, accuracy: 545, crit: 220, control: 700, resolve: 1140, speed: 1.40 }, ['skill.mystic_law_weave', 'skill.mystic_law_guard'], true);
export const goldenImmortalGuard = apexEntity('entity.elite.golden_immortal_guard', 'Kim Tính Bất Hoại Vệ', ['Immortal', 'GoldenImmortal'], { hp: 225000, spirit: 7600, attack: 1190, defense: 1030, mobility: 286, accuracy: 575, crit: 228, control: 725, resolve: 1320, speed: 1.42 }, ['skill.golden_indestructible_strike', 'skill.golden_reconstitution']);
export const goldenImmortalAncestor = apexEntity('entity.boss.golden_immortal_ancestor', 'Bất Hoại Kim Tiên Tổ Ảnh', ['Immortal', 'GoldenImmortal'], { hp: 305000, spirit: 9400, attack: 1320, defense: 1160, mobility: 294, accuracy: 610, crit: 235, control: 780, resolve: 1480, speed: 1.43 }, ['skill.golden_indestructible_strike', 'skill.golden_reconstitution'], true);
export const taiyiRiverHunter = apexEntity('entity.elite.taiyi_river_hunter', 'Thái Ất Kỷ Hà Liệp Giả', ['Immortal', 'TaiyiImmortal', 'Time'], { hp: 345000, spirit: 11200, attack: 1450, defense: 1210, mobility: 350, accuracy: 655, crit: 242, control: 830, resolve: 1570, speed: 1.49 }, ['skill.taiyi_epoch_cut', 'skill.taiyi_causal_shift']);
export const taiyiEpochLord = apexEntity('entity.boss.taiyi_epoch_lord', 'Thái Ất Kỷ Nguyên Chủ', ['Immortal', 'TaiyiImmortal', 'Time'], { hp: 465000, spirit: 13800, attack: 1600, defense: 1340, mobility: 372, accuracy: 700, crit: 250, control: 900, resolve: 1740, speed: 1.52 }, ['skill.taiyi_epoch_cut', 'skill.taiyi_causal_shift'], true);
export const grandLuoFruitShade = apexEntity('entity.elite.grand_luo_fruit_shade', 'Đại La Đạo Quả Ảnh', ['Immortal', 'GrandLuo', 'DaoFruit'], { hp: 520000, spirit: 16000, attack: 1760, defense: 1460, mobility: 382, accuracy: 745, crit: 258, control: 960, resolve: 1900, speed: 1.54 }, ['skill.grand_luo_fruit_press', 'skill.grand_luo_timeless_guard']);
export const grandLuoTimelessOne = apexEntity('entity.boss.grand_luo_timeless_one', 'Đại La Vô Thời Giả', ['Immortal', 'GrandLuo', 'DaoFruit'], { hp: 700000, spirit: 19800, attack: 1940, defense: 1610, mobility: 398, accuracy: 800, crit: 266, control: 1040, resolve: 2100, speed: 1.56 }, ['skill.grand_luo_fruit_press', 'skill.grand_luo_timeless_guard'], true);
export const immortalKingMarshal = apexEntity('entity.elite.immortal_king_marshal', 'Tiên Vương Vực Soái', ['Immortal', 'ImmortalKing', 'Domain'], { hp: 790000, spirit: 22500, attack: 2140, defense: 1760, mobility: 406, accuracy: 850, crit: 274, control: 1120, resolve: 2310, speed: 1.58 }, ['skill.king_domain_decree', 'skill.king_throne_guard']);
export const immortalKingThrone = apexEntity('entity.boss.immortal_king_throne', 'Vạn Vực Tiên Vương Pháp Tọa', ['Immortal', 'ImmortalKing', 'Domain'], { hp: 1060000, spirit: 27800, attack: 2360, defense: 1940, mobility: 422, accuracy: 910, crit: 282, control: 1210, resolve: 2550, speed: 1.60 }, ['skill.king_domain_decree', 'skill.king_throne_guard'], true);
export const emperorMandateEnvoy = apexEntity('entity.elite.emperor_mandate_envoy', 'Đế Mệnh Tuần Giới Sứ', ['Immortal', 'ImmortalEmperor', 'Authority'], { hp: 1200000, spirit: 31800, attack: 2600, defense: 2120, mobility: 432, accuracy: 970, crit: 290, control: 1300, resolve: 2800, speed: 1.62 }, ['skill.emperor_mandate_fall', 'skill.emperor_world_guard']);
export const immortalEmperorShadow = apexEntity('entity.boss.immortal_emperor_shadow', 'Tiên Đế Vạn Giới Ảnh', ['Immortal', 'ImmortalEmperor', 'Authority'], { hp: 1620000, spirit: 39200, attack: 2860, defense: 2340, mobility: 448, accuracy: 1040, crit: 300, control: 1410, resolve: 3100, speed: 1.64 }, ['skill.emperor_mandate_fall', 'skill.emperor_world_guard'], true);
export const extremityBreaker = apexEntity('entity.elite.extremity_breaker', 'Phá Cực Hành Giả', ['Immortal', 'Extremity'], { hp: 1850000, spirit: 44500, attack: 3160, defense: 2560, mobility: 462, accuracy: 1110, crit: 310, control: 1510, resolve: 3400, speed: 1.66 }, ['skill.extremity_break', 'skill.extremity_boundary']);
export const extremityBoundary = apexEntity('entity.boss.extremity_boundary', 'Cực Hạn Biên Giới Phân Thân', ['Immortal', 'Extremity'], { hp: 2500000, spirit: 55000, attack: 3500, defense: 2820, mobility: 478, accuracy: 1190, crit: 320, control: 1640, resolve: 3800, speed: 1.68 }, ['skill.extremity_break', 'skill.extremity_boundary'], true);
function transcendentEntity(id, name, tags, power, skills, boss = false) {
    const hp = Math.round(2500000 * Math.pow(1.72, power) * (boss ? 1.38 : 1));
    const spirit = Math.round(55000 * Math.pow(1.42, power) * (boss ? 1.22 : 1));
    const attack = Math.round(3500 * Math.pow(1.29, power) * (boss ? 1.16 : 1));
    const defense = Math.round(2820 * Math.pow(1.27, power) * (boss ? 1.14 : 1));
    return { id, name, tags: [...tags, 'Transcendent', boss ? 'Boss' : 'Elite'], stats: { maxHp: hp, maxSpirit: spirit, attack, defense, mobility: 490 + power * 24, accuracy: 1240 + power * 105, critChancePct: 330 + power * 18, critPowerPerLayer: 0.96, controlPower: 1720 + power * 155, resolve: 4050 + power * 410, actionSpeed: 1.70 + power * 0.035 }, skillIds: [...skills, 'skill.basic_strike'], aiProfile: { name: `${name} - Siêu Tầng`, rules: [{ skillId: skills[1], priority: 122, conditions: [{ type: 'selfHpBelow', pct: 66 }] }, { skillId: skills[0], priority: 106, conditions: [{ type: 'always' }] }, { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }] } };
}
export const supremeDaoEcho = transcendentEntity('entity.elite.supreme_dao_echo', 'Cực Đạo Tự Luật Ảnh', ['SupremeDao'], 1, ['skill.supreme_dao_verdict', 'skill.supreme_self_law_guard']);
export const supremeDaoSelf = transcendentEntity('entity.boss.supreme_dao_self', 'Cực Đạo Chân Ngã', ['SupremeDao'], 2, ['skill.supreme_dao_verdict', 'skill.supreme_self_law_guard'], true);
export const chaosSpawn = transcendentEntity('entity.elite.chaos_spawn', 'Hỗn Độn Vô Tướng Sinh', ['Chaos'], 3, ['skill.chaos_unformed_crush', 'skill.chaos_body_reform']);
export const chaosPrimordialBeast = transcendentEntity('entity.boss.chaos_primordial_beast', 'Hỗn Độn Thái Sơ Cổ Thú', ['Chaos'], 4, ['skill.chaos_unformed_crush', 'skill.chaos_body_reform'], true);
export const hongmengWisp = transcendentEntity('entity.elite.hongmeng_wisp', 'Hồng Mông Tử Khí Linh', ['Hongmeng'], 5, ['skill.hongmeng_purple_tide', 'skill.hongmeng_seed_guard']);
export const hongmengAncestorShadow = transcendentEntity('entity.boss.hongmeng_ancestor_shadow', 'Hồng Mông Tổ Ảnh', ['Hongmeng'], 6, ['skill.hongmeng_purple_tide', 'skill.hongmeng_seed_guard'], true);
export const heavenOpeningRemnant = transcendentEntity('entity.elite.heaven_opening_remnant', 'Khai Thiên Tàn Linh', ['HeavenOpening'], 7, ['skill.heaven_opening_split', 'skill.inner_cosmos_rotation']);
export const heavenOpeningGiant = transcendentEntity('entity.boss.heaven_opening_giant', 'Khai Thiên Cự Linh', ['HeavenOpening'], 8, ['skill.heaven_opening_split', 'skill.inner_cosmos_rotation'], true);
export const worldCoreGuardian = transcendentEntity('entity.elite.world_core_guardian', 'Giới Tâm Hộ Sinh Linh', ['WorldLord'], 9, ['skill.world_lord_decree', 'skill.myriad_life_return']);
export const worldDevourer = transcendentEntity('entity.boss.world_devourer', 'Thôn Giới Giả', ['WorldLord'], 10, ['skill.world_lord_decree', 'skill.myriad_life_return'], true);
export const eternityShade = transcendentEntity('entity.elite.eternity_shade', 'Vĩnh Sinh Cổ Ảnh', ['Eternity'], 11, ['skill.eternity_cut', 'skill.deathless_continuity']);
export const eternityReaper = transcendentEntity('entity.boss.eternity_reaper', 'Vĩnh Sinh Thu Hoạch Giả', ['Eternity'], 12, ['skill.eternity_cut', 'skill.deathless_continuity'], true);
export const genesisWitness = transcendentEntity('entity.elite.genesis_witness', 'Sơ Quang Kiến Chứng Giả', ['CreationLord'], 13, ['skill.genesis_first_light', 'skill.genesis_world_shell']);
export const genesisAntiCreator = transcendentEntity('entity.boss.genesis_anti_creator', 'Phản Sáng Thế Chủ', ['CreationLord'], 14, ['skill.genesis_first_light', 'skill.genesis_world_shell'], true);
export const adventureEnemies = {
    [spiritGatheringTrialWolf.id]: spiritGatheringTrialWolf,
    [blackWindWolf.id]: blackWindWolf,
    [blackWindWolfKing.id]: blackWindWolfKing,
    [ironBoar.id]: ironBoar,
    [ironHideDemonBear.id]: ironHideDemonBear,
    [thunderSnake.id]: thunderSnake,
    [thunderHornRhino.id]: thunderHornRhino,
    [bloodRiverRogue.id]: bloodRiverRogue,
    [purpleMistSpider.id]: purpleMistSpider,
    [purpleMirrorGuardian.id]: purpleMirrorGuardian,
    [goldenCoreFireApe.id]: goldenCoreFireApe,
    [starfallSwordGhost.id]: starfallSwordGhost,
    [soulEaterWraith.id]: soulEaterWraith,
    [soulPoolWarden.id]: soulPoolWarden,
    [nascentMirrorChild.id]: nascentMirrorChild,
    [daoEchoAvatar.id]: daoEchoAvatar,
    [daoDomainShadow.id]: daoDomainShadow,
    [voidRiftStalker.id]: voidRiftStalker,
    [voidGateWarden.id]: voidGateWarden,
    [threeOriginAvatar.id]: threeOriginAvatar,
    [greatVehicleDomainBeast.id]: greatVehicleDomainBeast,
    [greatVehicleHeavenLord.id]: greatVehicleHeavenLord,
    [tribulationThunderAvatar.id]: tribulationThunderAvatar,
    [heartDemonTribulation.id]: heartDemonTribulation,
    [immortalSpiritCrane.id]: immortalSpiritCrane,
    [immortalPoolWarden.id]: immortalPoolWarden,
    [earthVeinGuardian.id]: earthVeinGuardian,
    [heavenLawWarden.id]: heavenLawWarden,
    [trueLawAvatar.id]: trueLawAvatar,
    [mysticLawWeaver.id]: mysticLawWeaver, [mysticLawSovereign.id]: mysticLawSovereign,
    [goldenImmortalGuard.id]: goldenImmortalGuard, [goldenImmortalAncestor.id]: goldenImmortalAncestor,
    [taiyiRiverHunter.id]: taiyiRiverHunter, [taiyiEpochLord.id]: taiyiEpochLord,
    [grandLuoFruitShade.id]: grandLuoFruitShade, [grandLuoTimelessOne.id]: grandLuoTimelessOne,
    [immortalKingMarshal.id]: immortalKingMarshal, [immortalKingThrone.id]: immortalKingThrone,
    [emperorMandateEnvoy.id]: emperorMandateEnvoy, [immortalEmperorShadow.id]: immortalEmperorShadow,
    [extremityBreaker.id]: extremityBreaker, [extremityBoundary.id]: extremityBoundary,
    [supremeDaoEcho.id]: supremeDaoEcho, [supremeDaoSelf.id]: supremeDaoSelf, [chaosSpawn.id]: chaosSpawn, [chaosPrimordialBeast.id]: chaosPrimordialBeast,
    [hongmengWisp.id]: hongmengWisp, [hongmengAncestorShadow.id]: hongmengAncestorShadow, [heavenOpeningRemnant.id]: heavenOpeningRemnant, [heavenOpeningGiant.id]: heavenOpeningGiant,
    [worldCoreGuardian.id]: worldCoreGuardian, [worldDevourer.id]: worldDevourer, [eternityShade.id]: eternityShade, [eternityReaper.id]: eternityReaper, [genesisWitness.id]: genesisWitness, [genesisAntiCreator.id]: genesisAntiCreator,
};
export const combatArchetypes = [
    lightningSwordCultivator,
    heavySwordCultivator,
    controlCultivator,
    fireCultivator,
    poisonCultivator,
    windSwordCultivator,
];
export const combatBosses = [thunderHornRhino, bloodRiverRogue, purpleMirrorGuardian, goldenCoreFireApe, starfallSwordGhost, soulPoolWarden, nascentMirrorChild, daoEchoAvatar, daoDomainShadow, voidGateWarden, threeOriginAvatar, greatVehicleHeavenLord, heartDemonTribulation, immortalPoolWarden, earthVeinGuardian, heavenLawWarden, trueLawAvatar, mysticLawSovereign, goldenImmortalAncestor, taiyiEpochLord, grandLuoTimelessOne, immortalKingThrone, immortalEmperorShadow, extremityBoundary, supremeDaoSelf, chaosPrimordialBeast, hongmengAncestorShadow, heavenOpeningGiant, worldDevourer, eternityReaper, genesisAntiCreator];
//# sourceMappingURL=entities.js.map