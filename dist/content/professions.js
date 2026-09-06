export const professionDefinitions = [
    { id: 'alchemy', name: 'Luyện Đan', description: 'Dùng dược tính, hỏa hậu và phương pháp luyện hóa để tạo đan dược.', tags: ['Alchemy', 'Medicine'] },
    { id: 'forging', name: 'Luyện Khí', description: 'Rèn vật liệu thành trang bị; phẩm chất phụ thuộc tay nghề và nguyên liệu.', tags: ['Forging', 'Equipment'] },
    { id: 'talisman', name: 'Phù/Trận', description: 'Khắc phù văn và trận bàn để hỗ trợ tu luyện, tài nguyên và hộ đạo.', tags: ['Talisman', 'Formation'] },
];
export const craftedProducts = [
    {
        id: 'product.pill.spirit_gathering', name: 'Tụ Linh Đan', professionId: 'alchemy', tags: ['Pill', 'Cultivation'],
        description: 'Đan dược cơ bản bổ sung một lượng Tu Vi trực tiếp.',
        useEffect: { type: 'tuVi', baseAmount: 95 },
    },
    {
        id: 'product.formation.spirit_gathering_plate', name: 'Tụ Linh Trận Bàn', professionId: 'talisman', tags: ['Formation', 'Cultivation'],
        description: 'Trận bàn tiêu hao một lần để bổ sung Tu Vi trực tiếp.',
        useEffect: { type: 'tuVi', baseAmount: 140 },
    }
];
export const professionRecipes = [
    {
        id: 'recipe.alchemy.spirit_gathering_pill', name: 'Đan Phương · Tụ Linh Đan', professionId: 'alchemy',
        description: 'Đan phương nhập môn. Dược Tính Tinh Hoa cho chất lượng tốt hơn, Tu Vi Tinh Hoa có thể thay nhưng thô hơn.',
        difficulty: 1, masteryRequired: 0, timeYears: 0.04, tags: ['Alchemy', 'Pill', 'Cultivation'],
        ingredients: [
            { id: 'herb', name: 'Tụ Linh Thảo', options: [{ resourceId: 'resource.spirit_herb', quantity: 4, qualityModifier: 0.2, variantTag: 'Thanh Dược' }] },
            { id: 'catalyst', name: 'Luyện hóa chất', options: [
                    { resourceId: 'resource.alchemy_essence', quantity: 1, qualityModifier: 0.9, variantTag: 'Dược Tính Thuần' },
                    { resourceId: 'resource.cultivation_essence', quantity: 2, qualityModifier: -0.25, variantTag: 'Tu Vi Thô Luyện' },
                ] },
        ],
        output: { kind: 'stack', productId: 'product.pill.spirit_gathering', quantity: 1 },
    },
    {
        id: 'recipe.forging.black_iron_blade', name: 'Khí Đồ · Huyền Thiết Trọng Nhận', professionId: 'forging',
        description: 'Trọng binh nhập môn, lấy Huyền Thiết làm thân và Khí Luyện Tinh Hoa làm dẫn.',
        difficulty: 1, masteryRequired: 0, timeYears: 0.08, tags: ['Forging', 'Weapon', 'Heavy'],
        ingredients: [
            { id: 'ore', name: 'Huyền Thiết Khoáng', options: [{ resourceId: 'resource.black_iron_ore', quantity: 8, qualityModifier: 0.25 }] },
            { id: 'essence', name: 'Khí Luyện Tinh Hoa', options: [
                    { resourceId: 'resource.forging_essence', quantity: 2, qualityModifier: 0.8, variantTag: 'Tinh Luyện' },
                    { resourceId: 'resource.artifact_dust', quantity: 3, qualityModifier: 0.15, variantTag: 'Tàn Bảo Dung Luyện' },
                ] },
        ],
        output: { kind: 'equipment', templateId: 'equipment.black_iron_blade', baseTier: 0 },
    },
    {
        id: 'recipe.forging.black_iron_armor', name: 'Khí Đồ · Huyền Thiết Giáp', professionId: 'forging',
        description: 'Trọng giáp cần nhiều vật liệu hơn nhưng ổn định và dễ sửa.',
        difficulty: 2, masteryRequired: 15, timeYears: 0.10, tags: ['Forging', 'Armor', 'Heavy'],
        ingredients: [
            { id: 'ore', name: 'Huyền Thiết Khoáng', options: [{ resourceId: 'resource.black_iron_ore', quantity: 12, qualityModifier: 0.25 }] },
            { id: 'essence', name: 'Khí Luyện Tinh Hoa', options: [{ resourceId: 'resource.forging_essence', quantity: 3, qualityModifier: 0.7 }] },
        ],
        output: { kind: 'equipment', templateId: 'equipment.black_iron_armor', baseTier: 0 },
    },
    {
        id: 'recipe.forging.thunder_sword', name: 'Khí Đồ · Dẫn Lôi Kiếm', professionId: 'forging',
        description: 'Đưa Lôi tính vào phôi kiếm; Bảo Khí Tàn Tinh có thể thay một phần vật liệu dẫn nhưng khó ổn định hơn.',
        difficulty: 4, masteryRequired: 40, timeYears: 0.16, tags: ['Forging', 'Sword', 'Lightning'],
        ingredients: [
            { id: 'ore', name: 'Huyền Thiết Khoáng', options: [{ resourceId: 'resource.black_iron_ore', quantity: 14, qualityModifier: 0.2 }] },
            { id: 'essence', name: 'Khí Luyện Tinh Hoa', options: [{ resourceId: 'resource.forging_essence', quantity: 5, qualityModifier: 0.7 }] },
            { id: 'lightning', name: 'Lôi tính dẫn chất', options: [
                    { resourceId: 'resource.artifact_dust', quantity: 5, qualityModifier: 0.25, variantTag: 'Tàn Bảo Dẫn Lôi' },
                    { resourceId: 'resource.rune_insight', quantity: 3, qualityModifier: 0.55, variantTag: 'Lôi Văn Dẫn Khí' },
                ] },
        ],
        output: { kind: 'equipment', templateId: 'equipment.thunder_sword', baseTier: 1 },
    },
    {
        id: 'recipe.talisman.spirit_gathering_plate', name: 'Trận Đồ · Tụ Linh Trận Bàn', professionId: 'talisman',
        description: 'Trận bàn dùng một lần cho một quãng bế quan; không tạo buff vĩnh viễn.',
        difficulty: 3, masteryRequired: 22, timeYears: 0.09, tags: ['Formation', 'Cultivation'],
        ingredients: [
            { id: 'paper', name: 'Linh Phù Chỉ', options: [{ resourceId: 'resource.talisman_paper', quantity: 5, qualityModifier: 0.15 }] },
            { id: 'insight', name: 'Phù Văn Cảm Ngộ', options: [{ resourceId: 'resource.rune_insight', quantity: 3, qualityModifier: 0.8 }] },
            { id: 'stone', name: 'Linh Thạch', options: [{ resourceId: 'resource.spirit_stone', quantity: 12, qualityModifier: 0.1 }] },
        ],
        output: { kind: 'stack', productId: 'product.formation.spirit_gathering_plate', quantity: 1 },
    }
];
//# sourceMappingURL=professions.js.map