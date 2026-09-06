export const thanhHaMarkets = {
    'market.thanh_ha_general': {
        id: 'market.thanh_ha_general', name: 'Thanh Hà Tạp Hóa Lâu', locationId: 'location.thanh_ha_town',
        listings: [
            { resourceId: 'resource.spirit_herb', name: 'Tụ Linh Thảo', basePrice: 3, targetStock: 90, initialStock: 78, localPriceMultiplier: 1.45, sellRatio: 0.72 },
            { resourceId: 'resource.black_iron_ore', name: 'Huyền Thiết Khoáng', basePrice: 5, targetStock: 55, initialStock: 42, localPriceMultiplier: 1.08 },
            { resourceId: 'resource.talisman_paper', name: 'Linh Phù Chỉ', basePrice: 7, targetStock: 36, initialStock: 28, localPriceMultiplier: 1.12 },
        ],
    },
    'market.herb_pavilion': {
        id: 'market.herb_pavilion', name: 'Bách Thảo Các', locationId: 'location.herb_market',
        listings: [
            { resourceId: 'resource.spirit_herb', name: 'Tụ Linh Thảo', basePrice: 3, targetStock: 180, initialStock: 165, localPriceMultiplier: 0.72, sellRatio: 0.68 },
            { resourceId: 'resource.qingling_herb', name: 'Thanh Linh Thảo', basePrice: 8, targetStock: 75, initialStock: 68, localPriceMultiplier: 0.88 },
            { resourceId: 'resource.alchemy_essence', name: 'Dược Tính Tinh Hoa', basePrice: 14, targetStock: 32, initialStock: 25, localPriceMultiplier: 0.94 },
            { resourceId: 'resource.beast_essence', name: 'Yêu Thú Tinh Nguyên', basePrice: 11, targetStock: 26, initialStock: 18, localPriceMultiplier: 1.06 },
        ],
    },
    'market.cloud_sea_exchange': {
        id: 'market.cloud_sea_exchange', name: 'Vân Hải Thương Hội', locationId: 'location.cloud_sea_city',
        listings: [
            { resourceId: 'resource.spirit_herb', name: 'Tụ Linh Thảo', basePrice: 3, targetStock: 120, initialStock: 110, localPriceMultiplier: 1.0 },
            { resourceId: 'resource.black_iron_ore', name: 'Huyền Thiết Khoáng', basePrice: 5, targetStock: 95, initialStock: 80, localPriceMultiplier: 0.94 },
            { resourceId: 'resource.talisman_paper', name: 'Linh Phù Chỉ', basePrice: 7, targetStock: 70, initialStock: 58, localPriceMultiplier: 0.95 },
            { resourceId: 'resource.rune_insight', name: 'Phù Văn Cảm Ngộ', basePrice: 16, targetStock: 28, initialStock: 19, localPriceMultiplier: 1.05 },
            { resourceId: 'resource.artifact_dust', name: 'Bảo Khí Tàn Tinh', basePrice: 22, targetStock: 20, initialStock: 12, localPriceMultiplier: 1.12 },
        ],
    },
};
//# sourceMappingURL=economy.js.map