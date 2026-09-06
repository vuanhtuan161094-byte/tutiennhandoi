export const artifactTemplates = [
    {
        id: 'artifact.spirit_suppressing_bell',
        name: 'Trấn Linh Chung',
        description: 'Cổ chung dùng linh áp hộ chủ và trấn áp nhịp chiến đấu.',
        tags: ['Artifact', 'Bell', 'Spirit', 'Suppression'],
        baseStats: { maxHp: 34, resolve: 6 },
        resonanceId: 'artifact_resonance.three_thunder_vessels',
        triggers: [{
                id: 'Trấn Linh Hộ Thể', event: 'OnBattleStart', chancePct: 100,
                effects: [{ type: 'shield', capacity: 42, stability: 24, duration: 12 }],
            }],
        awakenedTriggers: [{
                id: 'Khí Linh · Chung Minh', event: 'OnDamageTaken', chancePct: 18, sourceTags: ['ActiveHit'], cooldown: 2.5,
                effects: [{ type: 'restoreSpirit', flat: 8 }],
            }],
    },
    {
        id: 'artifact.thunder_guiding_mirror',
        name: 'Dẫn Lôi Kính',
        description: 'Mặt kính giữ điện quang, dẫn lôi lực bám theo mục tiêu bị công kích.',
        tags: ['Artifact', 'Mirror', 'Lightning'],
        baseStats: { maxSpirit: 26, critChancePct: 7 },
        resonanceId: 'artifact_resonance.three_thunder_vessels',
        triggers: [{
                id: 'Kính Dẫn Lôi', event: 'OnHit', chancePct: 28, sourceTags: ['ActiveHit'], cooldown: 0.35,
                effects: [{ type: 'addMark', mark: 'Lôi Ấn', stacks: 1, maxStacks: 10 }],
            }],
        awakenedTriggers: [{
                id: 'Khí Linh · Chiếu Lôi', event: 'OnCrit', chancePct: 30, sourceTags: ['ActiveHit'], cooldown: 1.2,
                effects: [{ type: 'addMark', mark: 'Lôi Ấn', stacks: 1, maxStacks: 10 }],
            }],
    },
    {
        id: 'artifact.thunder_punishment_sword',
        name: 'Lôi Phạt Kiếm',
        description: 'Phi kiếm chuyên thu Kiếp Lôi, càng lâu năm càng có xu hướng tự chủ công phạt.',
        tags: ['Artifact', 'Sword', 'Lightning', 'Offense'],
        baseStats: { attack: 18, accuracy: 4 },
        resonanceId: 'artifact_resonance.three_thunder_vessels',
        triggers: [{
                id: 'Lôi Phạt Truy Kích', event: 'OnCrit', chancePct: 22, sourceTags: ['ActiveHit'], cooldown: 1.4,
                effects: [{ type: 'damage', coefficient: 0.65, sourceTag: 'ProcHit', canCrit: false, canDodge: true, stabilityDamage: 5 }],
            }],
        awakenedTriggers: [{
                id: 'Khí Linh · Tự Hành Kiếm', event: 'OnHit', chancePct: 12, sourceTags: ['ActiveHit'], cooldown: 2,
                effects: [{ type: 'damage', coefficient: 0.85, sourceTag: 'ProcHit', canCrit: false, canDodge: true, stabilityDamage: 8 }],
            }],
    },
    {
        id: 'artifact.true_sight_mirror',
        name: 'Phá Vọng Kính',
        description: 'Kính chuyên bắt quỹ tích thân pháp; hụt một lần sẽ lập tức hiệu chỉnh đường truy kích.',
        tags: ['Artifact', 'Mirror', 'Counter', 'Counter:Evasive'],
        baseStats: { accuracy: 9, mobility: 4 },
        triggers: [{
                id: 'Phá Vọng Tỏa Ảnh', event: 'OnTargetDodge', chancePct: 100, sourceTags: ['ActiveHit'], cooldown: 2.2,
                effects: [{ type: 'applyStatus', statusId: 'status.true_sight_focus', duration: 4, target: 'self' }],
            }],
        awakenedTriggers: [{
                id: 'Khí Linh · Chiếu Chân', event: 'OnTargetDodge', chancePct: 100, sourceTags: ['ActiveHit'], cooldown: 3.2,
                effects: [{ type: 'damage', coefficient: 0.55, sourceTag: 'ProcHit', canCrit: false, canDodge: false, procCoefficient: 0 }],
            }],
    },
    {
        id: 'artifact.mountain_breaking_seal',
        name: 'Chấn Sơn Ấn',
        description: 'Ấn nặng chuyên phá kết cấu hộ giới; khiên vỡ sẽ kéo theo một nhịp Giáp Liệt.',
        tags: ['Artifact', 'Seal', 'Counter', 'Counter:Shield'],
        baseStats: { attack: 12, controlPower: 6 },
        triggers: [{
                id: 'Chấn Sơn Phá Giáp', event: 'OnShieldBreak', chancePct: 100, sourceTags: ['ActiveHit', 'ProcHit'], cooldown: 1.5,
                effects: [{ type: 'applyStatus', statusId: 'status.armor_fracture', duration: 4, target: 'target' }],
            }],
        awakenedTriggers: [{
                id: 'Khí Linh · Sơn Băng', event: 'OnShieldBreak', chancePct: 100, sourceTags: ['ActiveHit', 'ProcHit'], cooldown: 2.5,
                effects: [{ type: 'damage', coefficient: 0.8, sourceTag: 'ProcHit', canCrit: false, canDodge: false, stabilityDamage: 12, procCoefficient: 0 }],
            }],
    },
    {
        id: 'artifact.blood_severing_gourd',
        name: 'Đoạn Huyết Hồ',
        description: 'Hồ lô cảm ứng khí huyết hồi lưu; đối thủ vừa hồi phục sẽ lập tức bị khóa đường sinh cơ kế tiếp.',
        tags: ['Artifact', 'Gourd', 'Counter', 'Counter:Healing'],
        baseStats: { maxSpirit: 20, controlPower: 8 },
        triggers: [{
                id: 'Đoạn Huyết Phản Lưu', event: 'OnEnemyHeal', chancePct: 100, cooldown: 3.5,
                effects: [{ type: 'applyStatus', statusId: 'status.healing_suppressed', duration: 4.2, target: 'target' }],
            }],
        awakenedTriggers: [{
                id: 'Khí Linh · Huyết Phệ', event: 'OnEnemyHeal', chancePct: 100, cooldown: 4.5,
                effects: [{ type: 'damage', coefficient: 0.65, sourceTag: 'ProcHit', canCrit: false, canDodge: false, procCoefficient: 0 }],
            }],
    },
    {
        id: 'artifact.purple_mansion_lamp',
        name: 'Tử Phủ Minh Đăng',
        description: 'Một ngọn cổ đăng dùng thần niệm nuôi lửa, thiên về hộ tâm và kéo dài chiến đấu.',
        tags: ['Artifact', 'Lamp', 'PurplePalace', 'Spirit'],
        baseStats: { maxSpirit: 44, resolve: 11 },
        resonanceId: 'artifact_resonance.purple_golden_cycle',
        triggers: [{ id: 'Minh Đăng Hộ Tâm', event: 'OnBattleStart', chancePct: 100, effects: [{ type: 'shield', capacity: 72, stability: 55, duration: 12 }] }],
        awakenedTriggers: [{ id: 'Khí Linh · Tử Diễm Hồi Quang', event: 'OnDamageTaken', chancePct: 16, sourceTags: ['ActiveHit'], cooldown: 2.4, effects: [{ type: 'restoreSpirit', flat: 10 }] }],
    },
    {
        id: 'artifact.golden_core_cauldron',
        name: 'Kim Đan Hỏa Đỉnh',
        description: 'Tiểu đỉnh giữ Đan Hỏa, vừa dùng luyện chế vừa có thể trấn áp khí cơ trong chiến đấu.',
        tags: ['Artifact', 'Cauldron', 'GoldenCore', 'Fire'],
        baseStats: { maxHp: 48, defense: 8, maxSpirit: 28 },
        resonanceId: 'artifact_resonance.purple_golden_cycle',
        triggers: [{ id: 'Đan Hỏa Dưỡng Mệnh', event: 'OnDamageTaken', chancePct: 10, sourceTags: ['ActiveHit'], cooldown: 12, effects: [{ type: 'heal', maxHpPct: 10, target: 'self' }] }],
        awakenedTriggers: [{ id: 'Khí Linh · Đan Hỏa Phản Chấn', event: 'OnHit', chancePct: 14, sourceTags: ['ActiveHit'], cooldown: 1.8, effects: [{ type: 'damage', coefficient: 0.72, sourceTag: 'ProcHit', canCrit: false, canDodge: true, stabilityDamage: 7 }] }],
    },
    {
        id: 'artifact.starfall_sword_box',
        name: 'Tinh Lạc Kiếm Hạp',
        description: 'Kiếm hạp thu kiếm khí từ Tinh Lạc Nhai, thiên về multi-hit và truy kích.',
        tags: ['Artifact', 'SwordBox', 'Sword', 'Star'],
        baseStats: { attack: 16, accuracy: 8, critChancePct: 6 },
        triggers: [{ id: 'Tinh Quang Truy Kiếm', event: 'OnCrit', chancePct: 20, sourceTags: ['ActiveHit'], cooldown: 1.3, effects: [{ type: 'damage', coefficient: 0.8, sourceTag: 'ProcHit', canCrit: false, canDodge: true, stabilityDamage: 6 }] }],
    },
    {
        id: 'artifact.soul_nourishing_lotus',
        name: 'Dưỡng Hồn Liên',
        description: 'Hồn liên sinh trong Dưỡng Hồn Trì, thiên về bảo hộ thần niệm và hồi phục Linh Lực.',
        tags: ['Artifact', 'Soul', 'Lotus', 'NascentSoul'],
        baseStats: { maxSpirit: 54, resolve: 14 },
        resonanceId: 'artifact_resonance.nascent_soul_pair',
        triggers: [{ id: 'Hồn Liên Tĩnh Tức', event: 'OnBattleStart', chancePct: 100, effects: [{ type: 'restoreSpirit', flat: 18 }, { type: 'shield', capacity: 86, stability: 62, duration: 12 }] }],
        awakenedTriggers: [{ id: 'Khí Linh · Liên Tâm', event: 'OnDamageTaken', chancePct: 16, sourceTags: ['ActiveHit'], cooldown: 2.2, effects: [{ type: 'restoreSpirit', flat: 12 }] }],
    },
    {
        id: 'artifact.nascent_soul_banner',
        name: 'Nguyên Anh Phân Hồn Phiên',
        description: 'Cổ phiên dùng phân hóa thần niệm thành nhiều tuyến điều khiển; công phạt hồn thể mạnh nhưng khó dưỡng.',
        tags: ['Artifact', 'Soul', 'Banner', 'Clone', 'NascentSoul'],
        baseStats: { attack: 18, controlPower: 18, maxSpirit: 36 },
        resonanceId: 'artifact_resonance.nascent_soul_pair',
        triggers: [{ id: 'Phân Hồn Tập Kích', event: 'OnHit', chancePct: 18, sourceTags: ['ActiveHit'], cooldown: 1.5, effects: [{ type: 'damage', coefficient: 0.9, sourceTag: 'ProcHit', canCrit: false, canDodge: true, stabilityDamage: 8 }] }],
        awakenedTriggers: [{ id: 'Khí Linh · Vạn Niệm', event: 'OnCrit', chancePct: 18, sourceTags: ['ActiveHit'], cooldown: 1.7, effects: [{ type: 'damage', coefficient: 1.1, sourceTag: 'ProcHit', canCrit: false, canDodge: false, stabilityDamage: 10 }] }],
    },
    {
        id: 'artifact.green_spirit_gourd',
        name: 'Thanh Linh Hồ Lô',
        description: 'Hồ lô ôn dưỡng linh lực, thiên về trường chiến và bế quan.',
        tags: ['Artifact', 'Gourd', 'Spirit'],
        baseStats: { maxSpirit: 38, resolve: 4 },
        triggers: [{
                id: 'Hồ Lô Hồi Linh', event: 'OnBattleStart', chancePct: 100,
                effects: [{ type: 'restoreSpirit', flat: 10 }],
            }],
    },
];
export const artifactResonances = [
    {
        id: 'artifact_resonance.nascent_soul_pair',
        name: 'Liên Phiên Đồng Hồn',
        description: 'Dưỡng Hồn Liên ổn định bản ngã, Phân Hồn Phiên mở rộng thần niệm; hai món vốn là một bộ tu hồn cổ.',
        hidden: true,
        bonuses: [
            { pieces: 2, name: 'Liên Phiên Đồng Hồn', description: 'Thần niệm vừa bền vừa rộng; tăng Linh Lực, Khống Chế và khiên khai chiến.', statMultipliers: { maxSpirit: 0.12, controlPower: 0.10 }, triggers: [{ id: 'Liên Phiên Đồng Hồn', event: 'OnBattleStart', chancePct: 100, effects: [{ type: 'shield', capacity: 120, stability: 90, duration: 12 }] }] },
        ],
    },
    {
        id: 'artifact_resonance.purple_golden_cycle',
        name: 'Tử Kim Đồng Luyện',
        description: 'Tử Phủ Minh Đăng và Kim Đan Hỏa Đỉnh từng thuộc cùng một luyện khí sư; một món dưỡng thần, một món dưỡng đan.',
        hidden: true,
        bonuses: [
            { pieces: 2, name: 'Tử Kim Đồng Luyện', description: 'Khí cơ thần–đan tuần hoàn, tăng Linh Lực và phòng ngự.', statMultipliers: { maxSpirit: 0.10, defense: 0.08 }, grantedTags: ['ArtifactResonance:PurpleGolden'] },
        ],
    },
    {
        id: 'artifact_resonance.three_thunder_vessels',
        name: 'Tam Khí Lôi Minh',
        description: 'Ba pháp bảo đồng nguyên từng thuộc một Lôi Tu cổ. Từng món độc lập; cùng xuất chiến mới hoàn chỉnh lôi mạch.',
        hidden: true,
        bonuses: [
            {
                pieces: 2,
                name: 'Song Khí Đồng Minh',
                description: 'Hai bảo vật bắt đầu chia sẻ lôi vận; Mệnh Trung và Linh Lực cùng tăng.',
                statMultipliers: { accuracy: 0.06, maxSpirit: 0.08 },
            },
            {
                pieces: 3,
                name: 'Tam Khí Lôi Minh',
                description: 'Phá hộ thuẫn sẽ dẫn một đạo Lôi Phạt tự động truy kích.',
                grantedTags: ['ArtifactResonance:ThreeThunder'],
                triggers: [{
                        id: 'Tam Khí Lôi Minh', event: 'OnShieldBreak', chancePct: 100, sourceTags: ['ActiveHit', 'ProcHit'], cooldown: 1,
                        effects: [
                            { type: 'damage', coefficient: 1.05, sourceTag: 'ProcHit', canCrit: false, canDodge: false, stabilityDamage: 10 },
                            { type: 'addMark', mark: 'Lôi Ấn', stacks: 2, maxStacks: 10 },
                        ],
                    }],
            },
        ],
    },
];
//# sourceMappingURL=artifacts.js.map