// V77: each floor is one real Boss. Ordinary monsters are virtual farm presentation only.
export const ENDLESS_HUNT_KILLS_PER_FLOOR = 0;
export const ENDLESS_HUNT_FLOOR_POWER_GROWTH = 1.0075;
export const endlessHuntGrades = {
    common: { id: 'common', name: 'Thường', description: 'Quái phổ thông của tầng.', weight: 72, powerMultiplier: 1, cultivationPct: 0, spiritStoneMultiplier: 1, equipmentChancePct: 1.5, trainingLogGain: 0.00005 },
    enhanced: { id: 'enhanced', name: 'Cường Hóa', description: 'Cá thể mạnh hơn, thưởng cao hơn.', weight: 21, powerMultiplier: 1.55, cultivationPct: 0, spiritStoneMultiplier: 2.2, equipmentChancePct: 9, trainingLogGain: 0.00012 },
    elite: { id: 'elite', name: 'Tinh Anh', description: 'Quái hiếm có sức mạnh và chiến lợi phẩm vượt trội.', weight: 7, powerMultiplier: 2.8, cultivationPct: 0, spiritStoneMultiplier: 4.8, equipmentChancePct: 32, trainingLogGain: 0.0003 },
    boss: { id: 'boss', name: 'Boss Tầng', description: 'Thủ hộ duy nhất của tầng; hạ gục để mở tầng kế và mở bãi farm ảo của tầng này.', weight: 0, powerMultiplier: 6.5, cultivationPct: 0, spiritStoneMultiplier: 14, equipmentChancePct: 100, trainingLogGain: 0.001 },
};
export const endlessHuntArchetypes = [
    { id: 'wolf', names: ['Hắc Phong Lang', 'Thanh Nha Yêu Lang', 'Thôn Nguyệt Lang'], tags: ['Beast', 'Speed'], hpBias: 1, attackBias: 1.08, defenseBias: 0.92 },
    { id: 'serpent', names: ['U Minh Xà', 'Xích Lân Yêu Xà', 'Huyền Độc Mãng'], tags: ['Beast', 'Poison'], hpBias: 0.92, attackBias: 1.04, defenseBias: 1.02 },
    { id: 'golem', names: ['Thạch Khôi', 'Huyền Thiết Khôi', 'Địa Mạch Cự Tượng'], tags: ['Construct', 'Defense'], hpBias: 1.16, attackBias: 0.92, defenseBias: 1.18 },
    { id: 'spirit', names: ['Linh Hỏa Tinh', 'Âm Phong Linh', 'Lôi Quang Tinh'], tags: ['Spirit', 'Element'], hpBias: 0.88, attackBias: 1.15, defenseBias: 0.9 },
    { id: 'demon', names: ['Huyết Sát Ma', 'Vô Diện Yêu', 'Cổ Ma Tàn Ảnh'], tags: ['Demon', 'Control'], hpBias: 1.06, attackBias: 1.08, defenseBias: 1.04 },
    { id: 'dragon', names: ['Giao Long Tàn Huyết', 'Cổ Giao', 'Hỗn Độn Long Ảnh'], tags: ['Dragon', 'BossLike'], hpBias: 1.22, attackBias: 1.12, defenseBias: 1.1 },
];
//# sourceMappingURL=endless-hunt.js.map