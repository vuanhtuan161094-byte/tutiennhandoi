import { environments } from './environments.js';
import { dungeons } from './dungeons.js';
import { thanhHaNpcs, thanhHaOpportunities } from './npcs.js';
import { thanhHaFactions } from './factions.js';
import { thanhHaMarkets } from './economy.js';
import { earlyGameContentEvents, earlyGameContentPacks } from './early-content-pack.js';
import { midgameContentEvents, midgameContentPacks } from './midgame-content-pack.js';
import { lateContentEvents, lateContentPacks } from './late-content-pack.js';
import { nascentContentEvents, nascentContentPacks } from './nascent-content-pack.js';
import { spiritTransformationContentEvents, spiritTransformationContentPacks } from './spirit-transformation-content-pack.js';
import { voidRefinementContentEvents, voidRefinementContentPacks } from './void-refinement-content-pack.js';
import { integrationContentEvents, integrationContentPacks } from './integration-content-pack.js';
import { greatVehicleContentEvents, greatVehicleContentPacks } from './great-vehicle-content-pack.js';
import { tribulationContentEvents, tribulationContentPacks } from './tribulation-content-pack.js';
import { humanImmortalContentEvents, humanImmortalContentPacks } from './human-immortal-content-pack.js';
import { upperImmortalContentEvents, upperImmortalContentPacks } from './upper-immortal-content-pack.js';
import { apexImmortalContentEvents, apexImmortalContentPacks } from './apex-immortal-content-pack.js';
import { transcendentContentEvents, transcendentContentPacks } from './transcendent-content-pack.js';
import { reincarnationEarlyContentEvents, reincarnationEarlyContentPacks } from './reincarnation-early-content-pack.js';
import { verticalSliceContentEvents, verticalSliceContentPacks } from './vertical-slice-content-pack.js';
import { earlyVarietyContentEvents, earlyVarietyContentPacks } from './early-variety-content-pack.js';
import { reincarnationDiversityContentEvents, reincarnationDiversityContentPacks } from './reincarnation-diversity-content-pack.js';
export const thanhHaWorld = {
    factions: thanhHaFactions,
    markets: thanhHaMarkets,
    contentEvents: { ...earlyGameContentEvents, ...midgameContentEvents, ...lateContentEvents, ...nascentContentEvents, ...spiritTransformationContentEvents, ...voidRefinementContentEvents, ...integrationContentEvents, ...greatVehicleContentEvents, ...tribulationContentEvents, ...humanImmortalContentEvents, ...upperImmortalContentEvents, ...apexImmortalContentEvents, ...transcendentContentEvents, ...reincarnationEarlyContentEvents, ...verticalSliceContentEvents, ...earlyVarietyContentEvents, ...reincarnationDiversityContentEvents },
    contentPacks: { ...earlyGameContentPacks, ...midgameContentPacks, ...lateContentPacks, ...nascentContentPacks, ...spiritTransformationContentPacks, ...voidRefinementContentPacks, ...integrationContentPacks, ...greatVehicleContentPacks, ...tribulationContentPacks, ...humanImmortalContentPacks, ...upperImmortalContentPacks, ...apexImmortalContentPacks, ...transcendentContentPacks, ...reincarnationEarlyContentPacks, ...verticalSliceContentPacks, ...earlyVarietyContentPacks, ...reincarnationDiversityContentPacks },
    id: 'world.thanh_ha_realm',
    name: 'Thanh Hà Vực',
    startLocationId: 'location.thanh_ha_town',
    dungeons,
    npcs: thanhHaNpcs,
    opportunities: thanhHaOpportunities,
    locations: {
        'location.thanh_ha_town': {
            id: 'location.thanh_ha_town',
            name: 'Thanh Hà Trấn',
            description: 'Một tiểu trấn dựa sông, linh khí mỏng nhưng an ổn.',
            environment: environments.town,
            neighbors: ['location.thanh_hu_mountain', 'location.black_wind_forest', 'location.cloud_sea_city'],
            resources: [
                { resourceId: 'resource.spirit_herb', name: 'Tụ Linh Thảo', baseYieldPerYear: 7, rarity: 'common' },
            ],
            encounters: [],
            danger: 5,
        },
        'location.thanh_hu_mountain': {
            id: 'location.thanh_hu_mountain',
            name: 'Thanh Hư Sơn',
            description: 'Sơn mạch thanh tĩnh, linh khí tụ mà không loạn.',
            environment: environments.mountain,
            neighbors: ['location.thanh_ha_town', 'location.ancient_sword_cave', 'location.thunder_valley', 'location.thanh_hu_sect'],
            resources: [
                { resourceId: 'resource.spirit_stone', name: 'Hạ Phẩm Linh Thạch', baseYieldPerYear: 5, rarity: 'common' },
                { resourceId: 'resource.qingling_herb', name: 'Thanh Linh Thảo', baseYieldPerYear: 3, rarity: 'uncommon' },
            ],
            encounters: [
                { entityId: 'entity.enemy.black_wind_wolf', weight: 8 },
            ],
            danger: 22,
        },
        'location.black_wind_forest': {
            id: 'location.black_wind_forest',
            name: 'Hắc Phong Lâm',
            description: 'Cổ lâm tối, yêu thú ẩn trong gió đen.',
            environment: environments.forest,
            neighbors: ['location.thanh_ha_town', 'location.thunder_valley', 'location.spirit_field_plain'],
            resources: [
                { resourceId: 'resource.ironwood', name: 'Hắc Thiết Mộc', baseYieldPerYear: 5, rarity: 'common' },
                { resourceId: 'resource.wind_leaf', name: 'Phong Linh Diệp', baseYieldPerYear: 2.4, rarity: 'uncommon' },
            ],
            encounters: [
                { entityId: 'entity.enemy.black_wind_wolf', weight: 7 },
                { entityId: 'entity.enemy.iron_boar', weight: 3 },
                { entityId: 'entity.elite.black_wind_wolf_king', weight: 0.35 },
                { entityId: 'entity.elite.iron_hide_demon_bear', weight: 0.15 },
            ],
            danger: 36,
        },
        'location.thunder_valley': {
            id: 'location.thunder_valley',
            name: 'Lôi Minh Cốc',
            description: 'Lôi khí tụ thành mây quanh năm, tu Lôi cực tốt nhưng rất dễ quá tải.',
            environment: environments.thunderValley,
            neighbors: ['location.thanh_hu_mountain', 'location.black_wind_forest', 'location.cloud_sea_city', 'location.blood_river_gorge'],
            resources: [
                { resourceId: 'resource.thunder_iron', name: 'Lôi Văn Thiết', baseYieldPerYear: 2, rarity: 'uncommon' },
                { resourceId: 'resource.thunder_essence', name: 'Lôi Tủy Dịch', baseYieldPerYear: 0.7, rarity: 'rare' },
            ],
            encounters: [
                { entityId: 'entity.enemy.thunder_snake', weight: 6 },
                { entityId: 'entity.enemy.iron_boar', weight: 2 },
            ],
            danger: 58,
        },
        'location.ancient_sword_cave': {
            id: 'location.ancient_sword_cave',
            name: 'Cổ Kiếm Động',
            description: 'Một động phủ cũ với kiếm ngân đã mờ trên vách đá.',
            environment: environments.swordCave,
            neighbors: ['location.thanh_hu_mountain', 'location.thanh_hu_sect', 'location.starfall_cliff'],
            resources: [
                { resourceId: 'resource.sword_fragment', name: 'Tàn Kiếm Phiến', baseYieldPerYear: 0.9, rarity: 'rare' },
            ],
            encounters: [
                { entityId: 'entity.enemy.iron_boar', weight: 4 },
                { entityId: 'entity.enemy.thunder_snake', weight: 2 },
            ],
            danger: 48,
        },
        'location.thanh_hu_sect': {
            id: 'location.thanh_hu_sect',
            name: 'Thanh Hư Tông',
            description: 'Tông môn lớn nhất quanh Thanh Hà, kiếm tu đông đảo, truyền thừa lâu đời.',
            environment: environments.mountain,
            neighbors: ['location.thanh_hu_mountain', 'location.ancient_sword_cave', 'location.herb_market'],
            resources: [
                { resourceId: 'resource.sect_merit_token', name: 'Thanh Hư Lệnh', baseYieldPerYear: 0.35, rarity: 'rare' },
            ],
            encounters: [],
            danger: 12,
        },
        'location.herb_market': {
            id: 'location.herb_market',
            name: 'Bách Thảo Phường',
            description: 'Một phường thị của đan sư và dược nông, mùi linh dược quanh năm không tan.',
            environment: environments.town,
            neighbors: ['location.thanh_hu_sect', 'location.spirit_field_plain', 'location.cloud_sea_city'],
            resources: [
                { resourceId: 'resource.qingling_herb', name: 'Thanh Linh Thảo', baseYieldPerYear: 5.5, rarity: 'uncommon' },
                { resourceId: 'resource.spirit_herb', name: 'Tụ Linh Thảo', baseYieldPerYear: 9, rarity: 'common' },
            ],
            encounters: [],
            danger: 8,
        },
        'location.cloud_sea_city': {
            id: 'location.cloud_sea_city',
            name: 'Vân Hải Thành',
            description: 'Tu chân thành náo nhiệt nằm giữa ba tuyến thương lộ, tin tức lan nhanh hơn kiếm quang.',
            environment: environments.town,
            neighbors: ['location.thanh_ha_town', 'location.herb_market', 'location.spirit_field_plain', 'location.core_fire_mountain'],
            resources: [
                { resourceId: 'resource.spirit_stone', name: 'Hạ Phẩm Linh Thạch', baseYieldPerYear: 7.5, rarity: 'common' },
            ],
            encounters: [],
            danger: 10,
        },
        'location.spirit_field_plain': {
            id: 'location.spirit_field_plain',
            name: 'Linh Điền Bình Nguyên',
            description: 'Đồng bằng linh điền nối tiếp nhau, rất thích hợp trồng dược liệu và nuôi linh thú nhỏ.',
            environment: environments.forest,
            neighbors: ['location.black_wind_forest', 'location.herb_market', 'location.cloud_sea_city'],
            resources: [
                { resourceId: 'resource.spirit_herb', name: 'Tụ Linh Thảo', baseYieldPerYear: 11, rarity: 'common' },
                { resourceId: 'resource.qingling_herb', name: 'Thanh Linh Thảo', baseYieldPerYear: 4.2, rarity: 'uncommon' },
            ],
            encounters: [
                { entityId: 'entity.enemy.black_wind_wolf', weight: 1.5 },
            ],
            danger: 18,
        },
        'location.purple_mirror_lake': {
            id: 'location.purple_mirror_lake',
            name: 'Tử Kính Hồ',
            description: 'Hồ cổ phủ sương tím; mặt nước đôi khi phản chiếu thần niệm thay vì bóng người.',
            environment: environments.purpleMirror,
            neighbors: ['location.thanh_hu_mountain', 'location.purple_mist_marsh', 'location.starfall_cliff', 'location.soul_echo_abyss'],
            resources: [
                { resourceId: 'resource.purple_mansion_essence', name: 'Tử Phủ Tinh Hoa', baseYieldPerYear: 1.4, rarity: 'uncommon' },
                { resourceId: 'resource.mirror_jade', name: 'Huyền Kính Ngọc', baseYieldPerYear: 0.45, rarity: 'rare' },
            ],
            encounters: [
                { entityId: 'entity.elite.purple_mist_spider', weight: 1.4 },
            ],
            danger: 82,
        },
        'location.purple_mist_marsh': {
            id: 'location.purple_mist_marsh',
            name: 'Tử Vụ Trạch',
            description: 'Đầm lầy linh vụ dày đặc, độc khí và thần niệm nhiễu lẫn nhau.',
            environment: environments.purpleMist,
            neighbors: ['location.blood_river_gorge', 'location.purple_mirror_lake'],
            resources: [
                { resourceId: 'resource.purple_mist_venom', name: 'Tử Vụ Độc Tủy', baseYieldPerYear: 0.7, rarity: 'rare' },
                { resourceId: 'resource.soul_moss', name: 'Dưỡng Thần Đài', baseYieldPerYear: 1.0, rarity: 'uncommon' },
            ],
            encounters: [
                { entityId: 'entity.elite.purple_mist_spider', weight: 4 },
                { entityId: 'entity.boss.purple_mirror_guardian', weight: 0.06 },
            ],
            danger: 91,
        },
        'location.core_fire_mountain': {
            id: 'location.core_fire_mountain',
            name: 'Đan Hỏa Sơn',
            description: 'Hỏa mạch sâu dưới núi đã bị nhiều thế hệ đan sư luyện thành Đan Hỏa địa mạch.',
            environment: environments.coreFire,
            neighbors: ['location.cloud_sea_city', 'location.starfall_cliff'],
            resources: [
                { resourceId: 'resource.golden_core_essence', name: 'Kim Đan Tinh Hoa', baseYieldPerYear: 1.1, rarity: 'uncommon' },
                { resourceId: 'resource.core_fire_crystal', name: 'Đan Hỏa Tinh', baseYieldPerYear: 0.38, rarity: 'rare' },
            ],
            encounters: [
                { entityId: 'entity.boss.golden_core_fire_ape', weight: 0.08 },
            ],
            danger: 108,
        },
        'location.starfall_cliff': {
            id: 'location.starfall_cliff',
            name: 'Tinh Lạc Nhai',
            description: 'Vách núi từng bị thiên thạch kiếm kim xuyên thủng; đêm xuống thường có kiếm quang như sao rơi.',
            environment: environments.starfall,
            neighbors: ['location.ancient_sword_cave', 'location.purple_mirror_lake', 'location.core_fire_mountain', 'location.nascent_cloud_platform', 'location.law_mark_cliff'],
            resources: [
                { resourceId: 'resource.star_iron', name: 'Tinh Thần Thiết', baseYieldPerYear: 0.72, rarity: 'rare' },
                { resourceId: 'resource.sword_fragment', name: 'Tàn Kiếm Phiến', baseYieldPerYear: 1.3, rarity: 'rare' },
            ],
            encounters: [
                { entityId: 'entity.boss.starfall_sword_ghost', weight: 0.07 },
            ],
            danger: 102,
        },
        'location.soul_echo_abyss': {
            id: 'location.soul_echo_abyss',
            name: 'Hồn Tức Uyên',
            description: 'Một khe sâu nơi thần niệm tàn dư tụ thành sương. Nguyên Anh tu sĩ thường tới đây dưỡng hồn hoặc thử Phân Thân.',
            environment: environments.purpleMirror,
            neighbors: ['location.purple_mirror_lake', 'location.nascent_cloud_platform'],
            resources: [
                { resourceId: 'resource.soul_dew', name: 'Dưỡng Hồn Lộ', baseYieldPerYear: 2.2, rarity: 'uncommon' },
                { resourceId: 'resource.soul_moss', name: 'Dưỡng Thần Đài', baseYieldPerYear: 1.4, rarity: 'uncommon' },
            ],
            encounters: [
                { entityId: 'entity.elite.soul_eater_wraith', weight: 2.8 },
                { entityId: 'entity.boss.soul_pool_warden', weight: 0.04 },
            ],
            danger: 138,
        },
        'location.nascent_cloud_platform': {
            id: 'location.nascent_cloud_platform',
            name: 'Nguyên Anh Vân Đài',
            description: 'Vân đài treo giữa tinh phong và linh vân, nơi thần niệm rời thân vẫn có thể giữ hình không tan.',
            environment: environments.starfall,
            neighbors: ['location.starfall_cliff', 'location.soul_echo_abyss', 'location.core_fire_mountain', 'location.dao_cloud_sea'],
            resources: [
                { resourceId: 'resource.soul_essence', name: 'Thần Hồn Tinh Hoa', baseYieldPerYear: 0.75, rarity: 'rare' },
                { resourceId: 'resource.star_iron', name: 'Tinh Lạc Thiết', baseYieldPerYear: 0.55, rarity: 'rare' },
            ],
            encounters: [
                { entityId: 'entity.boss.nascent_mirror_child', weight: 0.08 },
                { entityId: 'entity.elite.soul_eater_wraith', weight: 1.6 },
            ],
            danger: 152,
        },
        'location.dao_cloud_sea': {
            id: 'location.dao_cloud_sea', name: 'Đạo Vân Hải',
            description: 'Biển mây trên Nguyên Anh Vân Đài, nơi Hóa Thần tu sĩ có thể cảm quy luật trực tiếp trong linh vân.',
            environment: environments.starfall,
            neighbors: ['location.nascent_cloud_platform', 'location.law_mark_cliff'],
            resources: [
                { resourceId: 'resource.dao_essence', name: 'Đạo Vận Tinh Hoa', baseYieldPerYear: 0.82, rarity: 'rare' },
                { resourceId: 'resource.soul_essence', name: 'Thần Hồn Tinh Hoa', baseYieldPerYear: 0.46, rarity: 'rare' },
            ],
            encounters: [{ entityId: 'entity.boss.dao_echo_avatar', weight: 0.08 }], danger: 186,
        },
        'location.law_mark_cliff': {
            id: 'location.law_mark_cliff', name: 'Tắc Ngân Nhai',
            description: 'Vách đá phủ những dấu không phải kiếm ngân hay trận văn, mà là tàn tích của quy tắc từng bị ép lên nơi này.',
            environment: environments.swordCave,
            neighbors: ['location.dao_cloud_sea', 'location.starfall_cliff', 'location.void_gate_ridge'],
            resources: [
                { resourceId: 'resource.dao_mark_fragment', name: 'Đạo Ngân Tàn Phiến', baseYieldPerYear: 0.34, rarity: 'rare' },
                { resourceId: 'resource.star_iron', name: 'Tinh Thần Thiết', baseYieldPerYear: 0.38, rarity: 'rare' },
            ],
            encounters: [{ entityId: 'entity.boss.dao_domain_shadow', weight: 0.04 }], danger: 205,
        },
        'location.void_gate_ridge': {
            id: 'location.void_gate_ridge', name: 'Hư Môn Lĩnh',
            description: 'Một sống núi nơi không gian mỏng như giấy. Hóa Thần có thể thấy khe nứt, nhưng Luyện Hư mới chịu nổi sức kéo khi bước qua.',
            environment: environments.voidRift,
            neighbors: ['location.law_mark_cliff', 'location.fragmented_void_sea'],
            resources: [{ resourceId: 'resource.void_crystal', name: 'Hư Không Tinh', baseYieldPerYear: 0.48, rarity: 'rare' }],
            encounters: [{ entityId: 'entity.elite.void_rift_stalker', weight: 0.7 }],
            danger: 238, planeId: 'plane.thanh_ha', requiredRealmOrder: 30, spatialDistance: 2.4,
        },
        'location.fragmented_void_sea': {
            id: 'location.fragmented_void_sea', name: 'Toái Hư Hải',
            description: 'Biển hư không nằm ngoài biên Thanh Hà Vực; từng mảnh ánh sáng là một lớp không gian bị vỡ và trôi dạt.',
            environment: environments.voidRift,
            neighbors: ['location.void_gate_ridge', 'location.void_splinter_world'],
            resources: [
                { resourceId: 'resource.void_crystal', name: 'Hư Không Tinh', baseYieldPerYear: 0.82, rarity: 'rare' },
                { resourceId: 'resource.space_mark_fragment', name: 'Không Gian Tắc Phiến', baseYieldPerYear: 0.24, rarity: 'rare' },
            ],
            encounters: [{ entityId: 'entity.elite.void_rift_stalker', weight: 1.2 }, { entityId: 'entity.boss.void_gate_warden', weight: 0.03 }],
            danger: 272, planeId: 'plane.outer_void', requiredRealmOrder: 30, spatialDistance: 4.5,
        },
        'location.void_splinter_world': {
            id: 'location.void_splinter_world', name: 'Hư Giới Tàn Phiến',
            description: 'Một mảnh tiểu giới vỡ trôi trong Toái Hư Hải. Luật không gian ở đây tự khép rồi mở như nhịp thở.',
            environment: environments.voidRift,
            neighbors: ['location.fragmented_void_sea', 'location.integration_altar'],
            resources: [
                { resourceId: 'resource.space_mark_fragment', name: 'Không Gian Tắc Phiến', baseYieldPerYear: 0.42, rarity: 'rare' },
                { resourceId: 'resource.dao_essence', name: 'Đạo Vận Tinh Hoa', baseYieldPerYear: 0.48, rarity: 'rare' },
            ],
            encounters: [{ entityId: 'entity.boss.void_gate_warden', weight: 0.06 }],
            danger: 305, planeId: 'plane.void_fragment', requiredRealmOrder: 31, spatialDistance: 6.2,
        },
        'location.integration_altar': {
            id: 'location.integration_altar', name: 'Tam Nguyên Đài',
            description: 'Một đài cổ trong Hư Giới Tàn Phiến, ba vòng trận văn lần lượt phản chiếu nhục thân, Thần Hồn và Đạo Vực. Chỉ Hợp Thể mới khiến ba vòng cùng sáng.',
            environment: environments.voidRift,
            neighbors: ['location.void_splinter_world', 'location.unity_sky_field'],
            resources: [{ resourceId: 'resource.integration_essence', name: 'Hợp Nguyên Tinh Hoa', baseYieldPerYear: 0.54, rarity: 'rare' }],
            encounters: [{ entityId: 'entity.boss.three_origin_avatar', weight: 0.035 }],
            danger: 342, planeId: 'plane.void_fragment', requiredRealmOrder: 34, spatialDistance: 5.4,
        },
        'location.unity_sky_field': {
            id: 'location.unity_sky_field', name: 'Hợp Nguyên Thiên Cảnh',
            description: 'Một vùng trời không có ranh giới rõ giữa thân thể, thần niệm và Đạo Ý; mọi thứ phát ra từ người tu đều phản hồi trở lại chính họ.',
            environment: environments.voidRift,
            neighbors: ['location.integration_altar', 'location.great_vehicle_heaven_domain'],
            resources: [
                { resourceId: 'resource.integration_essence', name: 'Hợp Nguyên Tinh Hoa', baseYieldPerYear: 0.82, rarity: 'rare' },
                { resourceId: 'resource.unity_fragment', name: 'Tam Nguyên Đồng Văn', baseYieldPerYear: 0.22, rarity: 'rare' },
            ],
            encounters: [{ entityId: 'entity.boss.three_origin_avatar', weight: 0.05 }],
            danger: 380, planeId: 'plane.integration_sky', requiredRealmOrder: 35, spatialDistance: 6.8,
        },
        'location.great_vehicle_heaven_domain': {
            id: 'location.great_vehicle_heaven_domain', name: 'Đại Thừa Thiên Vực',
            description: 'Một vùng trời nơi Đạo Vực đủ mạnh có thể lưu lại sau khi chủ nhân thu lực; thiên địa liên tục tự chỉnh để chống lại các quyền hạn chồng lấn.',
            environment: environments.voidRift,
            neighbors: ['location.unity_sky_field', 'location.dao_authority_frontier'],
            resources: [{ resourceId: 'resource.great_vehicle_essence', name: 'Đại Thừa Đạo Tinh', baseYieldPerYear: 0.66, rarity: 'rare' }],
            encounters: [{ entityId: 'entity.elite.great_vehicle_domain_beast', weight: 0.9 }, { entityId: 'entity.boss.great_vehicle_heaven_lord', weight: 0.035 }],
            danger: 430, planeId: 'plane.integration_sky', requiredRealmOrder: 38, spatialDistance: 7.8,
        },
        'location.dao_authority_frontier': {
            id: 'location.dao_authority_frontier', name: 'Vạn Vực Biên',
            description: 'Biên giới nơi nhiều Đại Thừa Đạo Vực từng va nhau; không gian không vỡ nhưng quy tắc địa phương thay đổi theo từng bước.',
            environment: environments.voidRift,
            neighbors: ['location.great_vehicle_heaven_domain', 'location.heavenly_tribulation_peak'],
            resources: [{ resourceId: 'resource.domain_anchor', name: 'Vực Giới Đạo Đinh', baseYieldPerYear: 0.18, rarity: 'rare' }, { resourceId: 'resource.dao_essence', name: 'Đạo Vận Tinh Hoa', baseYieldPerYear: 0.62, rarity: 'rare' }],
            encounters: [{ entityId: 'entity.boss.great_vehicle_heaven_lord', weight: 0.05 }],
            danger: 468, planeId: 'plane.great_vehicle_frontier', requiredRealmOrder: 39, spatialDistance: 8.6,
        },
        'location.heavenly_tribulation_peak': {
            id: 'location.heavenly_tribulation_peak', name: 'Thiên Kiếp Phong',
            description: 'Đỉnh núi ngoài Vạn Vực Biên nơi thiên ý tụ nhanh bất thường; Đại Thừa viên mãn thường chọn nơi này chủ động dẫn kiếp.',
            environment: environments.thunderValley,
            neighbors: ['location.dao_authority_frontier', 'location.heart_demon_mirror_sea', 'location.lower_immortal_gate'],
            resources: [{ resourceId: 'resource.tribulation_essence', name: 'Kiếp Vận Tinh Hoa', baseYieldPerYear: 0.48, rarity: 'rare' }],
            encounters: [{ entityId: 'entity.elite.tribulation_thunder_avatar', weight: 0.8 }, { entityId: 'entity.boss.heart_demon_tribulation', weight: 0.025 }],
            danger: 520, planeId: 'plane.tribulation_field', requiredRealmOrder: 41, spatialDistance: 9.4,
        },
        'location.heart_demon_mirror_sea': {
            id: 'location.heart_demon_mirror_sea', name: 'Tâm Kính Hải',
            description: 'Mặt biển phản chiếu ký ức thay vì hình dáng. Độ Kiếp tu sĩ dùng nơi này luyện Đạo Tâm trước Tâm Ma Kiếp.',
            environment: environments.purpleMirror,
            neighbors: ['location.heavenly_tribulation_peak'],
            resources: [{ resourceId: 'resource.heaven_mark', name: 'Thiên Ngân', baseYieldPerYear: 0.12, rarity: 'rare' }, { resourceId: 'resource.soul_essence', name: 'Thần Hồn Tinh Hoa', baseYieldPerYear: 0.58, rarity: 'rare' }],
            encounters: [{ entityId: 'entity.boss.heart_demon_tribulation', weight: 0.05 }],
            danger: 548, planeId: 'plane.tribulation_field', requiredRealmOrder: 43, spatialDistance: 6.4,
        },
        'location.lower_immortal_gate': {
            id: 'location.lower_immortal_gate', name: 'Hạ Tiên Môn',
            description: 'Cửa giới chỉ mở ổn định với tồn tại đã vượt Độ Kiếp; phía sau là biên Tiên vực thấp chứ không phải một bản đồ tự scale theo người vào.',
            environment: environments.voidRift,
            neighbors: ['location.heavenly_tribulation_peak', 'location.immortal_spirit_shore'],
            resources: [{ resourceId: 'resource.immortal_qi', name: 'Tiên Khí Tinh Túy', baseYieldPerYear: 0.24, rarity: 'rare' }],
            encounters: [{ entityId: 'entity.elite.immortal_spirit_crane', weight: 0.2 }],
            danger: 600, planeId: 'plane.immortal_gate', requiredRealmOrder: 46, spatialDistance: 11.5,
        },
        'location.immortal_spirit_shore': {
            id: 'location.immortal_spirit_shore', name: 'Tiên Linh Bờ',
            description: 'Rìa một Tiên vực thấp. Tiên Khí mỏng so với thượng giới nhưng đã đủ làm linh khí phàm cấp trở thành thứ yếu.',
            environment: environments.starfall,
            neighbors: ['location.lower_immortal_gate', 'location.earth_vein_terrace'],
            resources: [{ resourceId: 'resource.immortal_qi', name: 'Tiên Khí Tinh Túy', baseYieldPerYear: 0.86, rarity: 'rare' }, { resourceId: 'resource.immortal_law_fragment', name: 'Tiên Tắc Tàn Phiến', baseYieldPerYear: 0.16, rarity: 'rare' }],
            encounters: [{ entityId: 'entity.elite.immortal_spirit_crane', weight: 0.8 }, { entityId: 'entity.boss.immortal_pool_warden', weight: 0.035 }],
            danger: 650, planeId: 'plane.lower_immortal_border', requiredRealmOrder: 46, spatialDistance: 12.8,
        },
        'location.earth_vein_terrace': { id: 'location.earth_vein_terrace', name: 'Địa Mạch Tiên Đài', description: 'Một tầng địa mạch của hạ Tiên vực lộ ra trên mặt đất; Địa Tiên dùng nơi này neo Tiên Thể vào luật địa phương.', environment: environments.mountain, neighbors: ['location.immortal_spirit_shore', 'location.lower_immortal_mountain'], resources: [{ resourceId: 'resource.earth_immortal_essence', name: 'Địa Tiên Mạch Tinh', baseYieldPerYear: 0.72, rarity: 'rare' }, { resourceId: 'resource.earth_law_jade', name: 'Địa Luật Tiên Ngọc', baseYieldPerYear: 0.12, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.earth_vein_guardian', weight: 0.035 }], danger: 760, planeId: 'plane.lower_immortal_earth', requiredRealmOrder: 50, spatialDistance: 9.0 },
        'location.lower_immortal_mountain': { id: 'location.lower_immortal_mountain', name: 'Hạ Tiên Sơn Hà', description: 'Sơn hà Tiên vực thấp nhưng địa mạch đã mang Tiên luật ổn định; mỗi dãy núi là một mạng mạch liên kết.', environment: environments.mountain, neighbors: ['location.earth_vein_terrace', 'location.heaven_ladder_sea'], resources: [{ resourceId: 'resource.earth_immortal_essence', name: 'Địa Tiên Mạch Tinh', baseYieldPerYear: 0.92, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.earth_vein_guardian', weight: 0.05 }], danger: 810, planeId: 'plane.lower_immortal_earth', requiredRealmOrder: 51, spatialDistance: 10.2 },
        'location.heaven_ladder_sea': { id: 'location.heaven_ladder_sea', name: 'Thiên Thê Vân Hải', description: 'Không có chiếc thang vật lý; các dòng thiên khí xếp tầng thành lộ tuyến chỉ Thiên Tiên mới theo kịp.', environment: environments.starfall, neighbors: ['location.lower_immortal_mountain', 'location.celestial_cloud_court'], resources: [{ resourceId: 'resource.heaven_immortal_essence', name: 'Thiên Luật Thanh Khí', baseYieldPerYear: 0.74, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.heaven_law_warden', weight: 0.035 }], danger: 920, planeId: 'plane.celestial_current', requiredRealmOrder: 54, spatialDistance: 12.0 },
        'location.celestial_cloud_court': { id: 'location.celestial_cloud_court', name: 'Thiên Luật Vân Đình', description: 'Một vùng mây nơi luật tự vận hành như dòng chảy; Thiên Tiên luyện chu thiên và du hành liên vực tại đây.', environment: environments.starfall, neighbors: ['location.heaven_ladder_sea', 'location.true_law_sea'], resources: [{ resourceId: 'resource.heaven_immortal_essence', name: 'Thiên Luật Thanh Khí', baseYieldPerYear: 0.96, rarity: 'rare' }, { resourceId: 'resource.celestial_law_thread', name: 'Thiên Tắc Tiên Ty', baseYieldPerYear: 0.13, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.heaven_law_warden', weight: 0.05 }], danger: 980, planeId: 'plane.celestial_current', requiredRealmOrder: 55, spatialDistance: 13.5 },
        'location.true_law_sea': { id: 'location.true_law_sea', name: 'Chân Luật Hải', description: 'Biển không chứa nước mà là vô số lớp pháp tắc chồng lên nhau; Chân Tiên luyện khả năng giữ luật của mình không bị xóa.', environment: environments.voidRift, neighbors: ['location.celestial_cloud_court', 'location.true_immortal_gate'], resources: [{ resourceId: 'resource.true_law_essence', name: 'Chân Luật Tinh Tủy', baseYieldPerYear: 0.70, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.true_law_avatar', weight: 0.04 }], danger: 1090, planeId: 'plane.true_law_sea', requiredRealmOrder: 58, spatialDistance: 15.0 },
        'location.true_immortal_gate': { id: 'location.true_immortal_gate', name: 'Chân Tiên Luật Môn', description: 'Cửa pháp tắc nơi dấu Đạo đủ bền có thể lưu lại sau khi người thi triển rời đi; là biên hiện tại của prototype.', environment: environments.voidRift, neighbors: ['location.true_law_sea', 'location.mystic_law_web'], resources: [{ resourceId: 'resource.true_law_essence', name: 'Chân Luật Tinh Tủy', baseYieldPerYear: 0.88, rarity: 'rare' }, { resourceId: 'resource.true_law_mark', name: 'Chân Tiên Luật Ngân', baseYieldPerYear: 0.12, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.true_law_avatar', weight: 0.055 }], danger: 1160, planeId: 'plane.true_law_sea', requiredRealmOrder: 59, spatialDistance: 16.2 },
        'location.mystic_law_web': { id: 'location.mystic_law_web', name: 'Huyền Luật Thiên Võng', description: 'Một tầng trời nơi pháp tắc hiện thành võng tuyến. Huyền Tiên phải học cách để nhiều luật cùng tồn tại mà không xé nát Chân Pháp Thân.', environment: environments.voidRift, neighbors: ['location.true_immortal_gate', 'location.ten_thousand_law_loom'], resources: [{ resourceId: 'resource.mystic_law_silk', name: 'Huyền Luật Tiên Ty', baseYieldPerYear: 0.72, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.mystic_law_weaver', weight: 0.7 }, { entityId: 'entity.boss.mystic_law_sovereign', weight: 0.03 }], danger: 1280, planeId: 'plane.mystic_law_web', requiredRealmOrder: 62, spatialDistance: 18.0 },
        'location.ten_thousand_law_loom': { id: 'location.ten_thousand_law_loom', name: 'Vạn Luật Chức Giới', description: 'Các dòng luật giao nhau như khung cửi vô tận; sai một nhịp có thể khiến Đạo Vực tự triệt tiêu.', environment: environments.voidRift, neighbors: ['location.mystic_law_web', 'location.indestructible_golden_heaven'], resources: [{ resourceId: 'resource.mystic_law_silk', name: 'Huyền Luật Tiên Ty', baseYieldPerYear: 0.94, rarity: 'rare' }, { resourceId: 'resource.law_weave_core', name: 'Vạn Luật Chức Tâm', baseYieldPerYear: 0.11, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.mystic_law_sovereign', weight: 0.05 }], danger: 1370, planeId: 'plane.mystic_law_web', requiredRealmOrder: 63, spatialDistance: 19.4 },
        'location.indestructible_golden_heaven': { id: 'location.indestructible_golden_heaven', name: 'Bất Hoại Kim Thiên', description: 'Kim tính ở đây là tính chất tồn tại chứ không phải kim loại; thân, hồn và pháp tắc đều bị ép chứng minh khả năng tự phục hồi.', environment: environments.starfall, neighbors: ['location.ten_thousand_law_loom', 'location.golden_nature_forge'], resources: [{ resourceId: 'resource.golden_immortal_marrow', name: 'Bất Hoại Kim Tủy', baseYieldPerYear: 0.70, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.golden_immortal_guard', weight: 0.7 }, { entityId: 'entity.boss.golden_immortal_ancestor', weight: 0.03 }], danger: 1490, planeId: 'plane.golden_immortal_heaven', requiredRealmOrder: 66, spatialDistance: 21.0 },
        'location.golden_nature_forge': { id: 'location.golden_nature_forge', name: 'Kim Tính Thần Lô', description: 'Một cổ lô khổng lồ dùng thiên địa làm lửa, chuyên ép Kim Tiên tái luyện phần căn nguyên chưa đủ bất hoại.', environment: environments.coreFire, neighbors: ['location.indestructible_golden_heaven', 'location.taiyi_epoch_river'], resources: [{ resourceId: 'resource.golden_immortal_marrow', name: 'Bất Hoại Kim Tủy', baseYieldPerYear: 0.93, rarity: 'rare' }, { resourceId: 'resource.golden_seal_fragment', name: 'Kim Tiên Ấn Phiến', baseYieldPerYear: 0.11, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.golden_immortal_ancestor', weight: 0.05 }], danger: 1600, planeId: 'plane.golden_immortal_heaven', requiredRealmOrder: 67, spatialDistance: 22.6 },
        'location.taiyi_epoch_river': { id: 'location.taiyi_epoch_river', name: 'Thái Ất Kỷ Hà', description: 'Một con sông mang theo dấu vết của các kỷ nguyên đã qua; đi ngược dòng không có nghĩa là trở về quá khứ, mà là đối diện lớp nhân quả cũ.', environment: environments.voidRift, neighbors: ['location.golden_nature_forge', 'location.causal_ancient_bank'], resources: [{ resourceId: 'resource.taiyi_epoch_sand', name: 'Thái Ất Kỷ Sa', baseYieldPerYear: 0.68, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.taiyi_river_hunter', weight: 0.65 }, { entityId: 'entity.boss.taiyi_epoch_lord', weight: 0.028 }], danger: 1740, planeId: 'plane.taiyi_epoch', requiredRealmOrder: 70, spatialDistance: 24.0 },
        'location.causal_ancient_bank': { id: 'location.causal_ancient_bank', name: 'Nhân Quả Cổ Ngạn', description: 'Bờ cổ không đổi dù Kỷ Hà biến chuyển. Những nhân quả đủ sâu kết thành vật chất có thể chạm tới.', environment: environments.purpleMirror, neighbors: ['location.taiyi_epoch_river', 'location.grand_luo_fruit_heaven'], resources: [{ resourceId: 'resource.taiyi_epoch_sand', name: 'Thái Ất Kỷ Sa', baseYieldPerYear: 0.90, rarity: 'rare' }, { resourceId: 'resource.causal_pearl', name: 'Nhân Quả Châu', baseYieldPerYear: 0.10, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.taiyi_epoch_lord', weight: 0.048 }], danger: 1860, planeId: 'plane.taiyi_epoch', requiredRealmOrder: 71, spatialDistance: 25.8 },
        'location.grand_luo_fruit_heaven': { id: 'location.grand_luo_fruit_heaven', name: 'Đại La Đạo Quả Thiên', description: 'Đạo tích lũy đủ sâu bắt đầu cô đọng thành quả; mỗi Đạo Quả mang lịch sử tu hành chứ không thể mua bằng một lần thăng cảnh.', environment: environments.starfall, neighbors: ['location.causal_ancient_bank', 'location.timeless_terrace'], resources: [{ resourceId: 'resource.grand_luo_origin', name: 'Đại La Bản Nguyên', baseYieldPerYear: 0.65, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.grand_luo_fruit_shade', weight: 0.62 }, { entityId: 'entity.boss.grand_luo_timeless_one', weight: 0.026 }], danger: 2020, planeId: 'plane.grand_luo', requiredRealmOrder: 74, spatialDistance: 27.5 },
        'location.timeless_terrace': { id: 'location.timeless_terrace', name: 'Vô Thời Đài', description: 'Ở đây thời gian vẫn tồn tại, nhưng không còn đủ quyền quyết định thứ tự mọi thứ. Đại La dùng nó để thử tự do khỏi một tuyến thời duy nhất.', environment: environments.voidRift, neighbors: ['location.grand_luo_fruit_heaven', 'location.ten_thousand_domain_king_court'], resources: [{ resourceId: 'resource.grand_luo_origin', name: 'Đại La Bản Nguyên', baseYieldPerYear: 0.87, rarity: 'rare' }, { resourceId: 'resource.timeless_leaf', name: 'Vô Thời Diệp', baseYieldPerYear: 0.095, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.grand_luo_timeless_one', weight: 0.045 }], danger: 2170, planeId: 'plane.grand_luo', requiredRealmOrder: 75, spatialDistance: 29.1 },
        'location.ten_thousand_domain_king_court': { id: 'location.ten_thousand_domain_king_court', name: 'Vạn Vực Vương Đình', description: 'Không phải triều đình phàm tục. Đây là nơi các Đạo Vực đủ lớn tranh quyền định nghĩa quy tắc chung mà không xóa nhau.', environment: environments.voidRift, neighbors: ['location.timeless_terrace', 'location.orthodoxy_heaven_pillar'], resources: [{ resourceId: 'resource.king_domain_core', name: 'Vương Vực Hạch', baseYieldPerYear: 0.61, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.immortal_king_marshal', weight: 0.58 }, { entityId: 'entity.boss.immortal_king_throne', weight: 0.024 }], danger: 2360, planeId: 'plane.immortal_king_court', requiredRealmOrder: 78, spatialDistance: 31.0 },
        'location.orthodoxy_heaven_pillar': { id: 'location.orthodoxy_heaven_pillar', name: 'Đạo Thống Thiên Trụ', description: 'Dấu ấn của vô số tông môn, gia tộc và truyền thừa chồng thành trụ. Tiên Vương càng mạnh càng phải gánh trọng lượng của thứ mình đại diện.', environment: environments.mountain, neighbors: ['location.ten_thousand_domain_king_court', 'location.emperor_mandate_palace'], resources: [{ resourceId: 'resource.king_domain_core', name: 'Vương Vực Hạch', baseYieldPerYear: 0.82, rarity: 'rare' }, { resourceId: 'resource.orthodoxy_seal', name: 'Đạo Thống Vương Ấn', baseYieldPerYear: 0.09, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.immortal_king_throne', weight: 0.042 }], danger: 2540, planeId: 'plane.immortal_king_court', requiredRealmOrder: 79, spatialDistance: 32.8 },
        'location.emperor_mandate_palace': { id: 'location.emperor_mandate_palace', name: 'Đế Mệnh Thiên Cung', description: 'Nơi quyền hạn cấp thế giới được thử nghiệm. Đế Mệnh ở đây phải do chính Đạo của người tu chống đỡ, không phải danh vị do NPC phong.', environment: environments.starfall, neighbors: ['location.orthodoxy_heaven_pillar', 'location.ten_thousand_world_emperor_sea'], resources: [{ resourceId: 'resource.emperor_mandate_fragment', name: 'Đế Mệnh Tàn Chương', baseYieldPerYear: 0.58, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.emperor_mandate_envoy', weight: 0.55 }, { entityId: 'entity.boss.immortal_emperor_shadow', weight: 0.022 }], danger: 2760, planeId: 'plane.immortal_emperor', requiredRealmOrder: 82, spatialDistance: 35.0 },
        'location.ten_thousand_world_emperor_sea': { id: 'location.ten_thousand_world_emperor_sea', name: 'Vạn Giới Đế Hải', description: 'Mỗi gợn sóng là phản hồi của một tiểu thế giới. Tiên Đế có thể áp luật lên chúng, nhưng càng áp càng phải trả giá bằng quyền lực thật.', environment: environments.voidRift, neighbors: ['location.emperor_mandate_palace', 'location.extremity_gate'], resources: [{ resourceId: 'resource.emperor_mandate_fragment', name: 'Đế Mệnh Tàn Chương', baseYieldPerYear: 0.78, rarity: 'rare' }, { resourceId: 'resource.world_authority_crystal', name: 'Giới Quyền Tinh', baseYieldPerYear: 0.085, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.immortal_emperor_shadow', weight: 0.039 }], danger: 2990, planeId: 'plane.immortal_emperor', requiredRealmOrder: 83, spatialDistance: 37.2 },
        'location.extremity_gate': { id: 'location.extremity_gate', name: 'Cực Hạn Khuy Môn', description: 'Sau Tiên Đế không còn một tên cảnh giới mới chờ sẵn. Chỉ có lớp trần hiện tại của chính người tu và khe nhỏ để nhìn thấy bên ngoài.', environment: environments.voidRift, neighbors: ['location.ten_thousand_world_emperor_sea', 'location.nameless_boundary'], resources: [{ resourceId: 'resource.extremity_shard', name: 'Cực Hạn Toái Phiến', baseYieldPerYear: 0.54, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.extremity_breaker', weight: 0.5 }, { entityId: 'entity.boss.extremity_boundary', weight: 0.02 }], danger: 3260, planeId: 'plane.extremity', requiredRealmOrder: 86, spatialDistance: 40.0 },
        'location.nameless_boundary': { id: 'location.nameless_boundary', name: 'Biên Giới Vô Danh', description: 'Biên của content có tên, không phải biên của tài khoản. Tại đây chỉ còn việc tự tạo áp lực, tích ngộ và Phá Cực từng lớp mới.', environment: environments.voidRift, neighbors: ['location.extremity_gate', 'location.supreme_dao_origin_sea'], resources: [{ resourceId: 'resource.extremity_shard', name: 'Cực Hạn Toái Phiến', baseYieldPerYear: 0.74, rarity: 'rare' }, { resourceId: 'resource.boundary_dust', name: 'Biên Giới Trần', baseYieldPerYear: 0.075, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.extremity_boundary', weight: 0.036 }], danger: 3600, planeId: 'plane.extremity', requiredRealmOrder: 89, spatialDistance: 42.5 },
        'location.supreme_dao_origin_sea': { id: 'location.supreme_dao_origin_sea', name: 'Cực Đạo Chân Nguyên Hải', description: 'Bên ngoài Biên Giới Vô Danh, mọi quy tắc vay mượn đều rơi rụng. Chỉ phần Đạo tự chứng của chính người tu còn giữ hình.', environment: environments.voidRift, neighbors: ['location.nameless_boundary', 'location.self_law_mirror'], resources: [{ resourceId: 'resource.supreme_dao_origin', name: 'Cực Đạo Nguyên Chất', baseYieldPerYear: 0.50, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.supreme_dao_echo', weight: 0.45 }, { entityId: 'entity.boss.supreme_dao_self', weight: 0.018 }], danger: 3950, planeId: 'plane.supreme_dao', requiredRealmOrder: 90, spatialDistance: 46 },
        'location.self_law_mirror': { id: 'location.self_law_mirror', name: 'Tự Luật Chân Kính', description: 'Không phản chiếu hình dáng mà phản chiếu mâu thuẫn nội tại trong Đạo của chính kẻ đứng trước nó.', environment: environments.purpleMirror, neighbors: ['location.supreme_dao_origin_sea', 'location.chaos_abyss'], resources: [{ resourceId: 'resource.supreme_dao_origin', name: 'Cực Đạo Nguyên Chất', baseYieldPerYear: 0.67, rarity: 'rare' }, { resourceId: 'resource.self_law_crystal', name: 'Tự Luật Kết Tinh', baseYieldPerYear: 0.07, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.supreme_dao_self', weight: 0.03 }], danger: 4250, planeId: 'plane.supreme_dao', requiredRealmOrder: 91, spatialDistance: 49 },
        'location.chaos_abyss': { id: 'location.chaos_abyss', name: 'Hỗn Độn Vô Tướng Uyên', description: 'Vật chất, năng lượng và pháp tắc chưa tách thành ba khái niệm. Thứ không có bản chất riêng sẽ bị hòa tan.', environment: environments.voidRift, neighbors: ['location.self_law_mirror', 'location.formless_chaos_sea'], resources: [{ resourceId: 'resource.chaos_origin', name: 'Hỗn Độn Nguyên Chất', baseYieldPerYear: 0.45, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.chaos_spawn', weight: 0.42 }, { entityId: 'entity.boss.chaos_primordial_beast', weight: 0.016 }], danger: 4700, planeId: 'plane.chaos', requiredRealmOrder: 94, spatialDistance: 53 },
        'location.formless_chaos_sea': { id: 'location.formless_chaos_sea', name: 'Vô Tướng Hỗn Độn Hải', description: 'Không có phương hướng cố định; chỉ Hỗn Độn Tương Tính của bản thân mới xác định được đâu là “trước”.', environment: environments.voidRift, neighbors: ['location.chaos_abyss', 'location.hongmeng_purple_sea'], resources: [{ resourceId: 'resource.chaos_origin', name: 'Hỗn Độn Nguyên Chất', baseYieldPerYear: 0.61, rarity: 'rare' }, { resourceId: 'resource.chaos_heart', name: 'Hỗn Độn Tâm', baseYieldPerYear: 0.065, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.chaos_primordial_beast', weight: 0.028 }], danger: 5050, planeId: 'plane.chaos', requiredRealmOrder: 95, spatialDistance: 57 },
        'location.hongmeng_purple_sea': { id: 'location.hongmeng_purple_sea', name: 'Hồng Mông Tử Hải', description: 'Tử khí mang khả năng chưa định hình. Nó không phải linh khí cao cấp mà là nguyên liệu của khả năng tồn tại.', environment: environments.starfall, neighbors: ['location.formless_chaos_sea', 'location.primordial_seed_garden'], resources: [{ resourceId: 'resource.hongmeng_purple_qi', name: 'Hồng Mông Tử Khí', baseYieldPerYear: 0.40, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.hongmeng_wisp', weight: 0.38 }, { entityId: 'entity.boss.hongmeng_ancestor_shadow', weight: 0.015 }], danger: 5550, planeId: 'plane.hongmeng', requiredRealmOrder: 98, spatialDistance: 62 },
        'location.primordial_seed_garden': { id: 'location.primordial_seed_garden', name: 'Thái Sơ Chủng Viên', description: 'Những “hạt giống” ở đây có thể nở thành vật chất, pháp tắc, sinh linh hoặc một khả năng chưa từng tồn tại.', environment: environments.forest, neighbors: ['location.hongmeng_purple_sea', 'location.heaven_opening_axe_field'], resources: [{ resourceId: 'resource.hongmeng_purple_qi', name: 'Hồng Mông Tử Khí', baseYieldPerYear: 0.55, rarity: 'rare' }, { resourceId: 'resource.primordial_seed', name: 'Thái Sơ Chủng', baseYieldPerYear: 0.06, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.hongmeng_ancestor_shadow', weight: 0.026 }], danger: 5950, planeId: 'plane.hongmeng', requiredRealmOrder: 99, spatialDistance: 66 },
        'location.heaven_opening_axe_field': { id: 'location.heaven_opening_axe_field', name: 'Khai Thiên Phủ Nguyên', description: 'Không có chiếc rìu cụ thể; đây là trường lực nơi mọi cấu trúc đều bị hỏi: ngươi sẽ phân thiên địa thế nào?', environment: environments.voidRift, neighbors: ['location.primordial_seed_garden', 'location.inner_cosmos_edge'], resources: [{ resourceId: 'resource.heaven_opening_origin', name: 'Khai Thiên Bản Nguyên', baseYieldPerYear: 0.36, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.heaven_opening_remnant', weight: 0.34 }, { entityId: 'entity.boss.heaven_opening_giant', weight: 0.014 }], danger: 6500, planeId: 'plane.heaven_opening', requiredRealmOrder: 102, spatialDistance: 72 },
        'location.inner_cosmos_edge': { id: 'location.inner_cosmos_edge', name: 'Nội Vũ Trụ Biên', description: 'Biên giới giữa bản thân và một vũ trụ do chính mình dựng. Sai một luật nền, toàn bộ nội giới có thể sụp.', environment: environments.voidRift, neighbors: ['location.heaven_opening_axe_field', 'location.world_core_cradle'], resources: [{ resourceId: 'resource.heaven_opening_origin', name: 'Khai Thiên Bản Nguyên', baseYieldPerYear: 0.50, rarity: 'rare' }, { resourceId: 'resource.cosmos_membrane', name: 'Vũ Trụ Thai Màng', baseYieldPerYear: 0.055, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.heaven_opening_giant', weight: 0.024 }], danger: 6950, planeId: 'plane.heaven_opening', requiredRealmOrder: 103, spatialDistance: 77 },
        'location.world_core_cradle': { id: 'location.world_core_cradle', name: 'Giới Tâm Thai Tạng', description: 'Thế giới bắt đầu có nhịp riêng. Từ đây, người tu không chỉ tạo địa hình mà phải tạo một hệ có thể tự vận hành.', environment: environments.mountain, neighbors: ['location.inner_cosmos_edge', 'location.myriad_life_domain'], resources: [{ resourceId: 'resource.world_core_essence', name: 'Giới Tâm Tinh Tủy', baseYieldPerYear: 0.32, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.world_core_guardian', weight: 0.31 }, { entityId: 'entity.boss.world_devourer', weight: 0.013 }], danger: 7550, planeId: 'plane.world_cradle', requiredRealmOrder: 106, spatialDistance: 83 },
        'location.myriad_life_domain': { id: 'location.myriad_life_domain', name: 'Vạn Sinh Sơ Giới', description: 'Nơi sinh linh sơ khai tự chọn con đường. Giới Chủ càng cưỡng ép hoàn hảo, tiềm năng thế giới càng dễ chết.', environment: environments.forest, neighbors: ['location.world_core_cradle', 'location.eternity_river'], resources: [{ resourceId: 'resource.world_core_essence', name: 'Giới Tâm Tinh Tủy', baseYieldPerYear: 0.45, rarity: 'rare' }, { resourceId: 'resource.life_genesis_seed', name: 'Chúng Sinh Nguyên Chủng', baseYieldPerYear: 0.05, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.world_devourer', weight: 0.022 }], danger: 8050, planeId: 'plane.world_cradle', requiredRealmOrder: 107, spatialDistance: 89 },
        'location.eternity_river': { id: 'location.eternity_river', name: 'Vĩnh Sinh Trường Hà', description: 'Không phải dòng thời gian. Nó là phép thử xem bản ngã có còn liên tục khi thời gian, thân thể và ký ức đều đổi hay không.', environment: environments.voidRift, neighbors: ['location.myriad_life_domain', 'location.deathless_shore'], resources: [{ resourceId: 'resource.eternity_mark', name: 'Vĩnh Sinh Ấn', baseYieldPerYear: 0.28, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.eternity_shade', weight: 0.28 }, { entityId: 'entity.boss.eternity_reaper', weight: 0.012 }], danger: 8700, planeId: 'plane.eternity', requiredRealmOrder: 110, spatialDistance: 96 },
        'location.deathless_shore': { id: 'location.deathless_shore', name: 'Bất Diệt Cổ Ngạn', description: 'Kẻ đến đây không chết vì già, nhưng dấu vết của vô số Vĩnh Sinh giả bị tiêu diệt vẫn nằm trên bờ.', environment: environments.purpleMirror, neighbors: ['location.eternity_river', 'location.genesis_source_sea'], resources: [{ resourceId: 'resource.eternity_mark', name: 'Vĩnh Sinh Ấn', baseYieldPerYear: 0.39, rarity: 'rare' }, { resourceId: 'resource.deathless_thread', name: 'Bất Diệt Mệnh Ty', baseYieldPerYear: 0.045, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.eternity_reaper', weight: 0.020 }], danger: 9250, planeId: 'plane.eternity', requiredRealmOrder: 111, spatialDistance: 103 },
        'location.genesis_source_sea': { id: 'location.genesis_source_sea', name: 'Sáng Thế Nguyên Hải', description: 'Không có vật chất sẵn để sử dụng. Sáng Thế Chủ phải tự định nghĩa nguồn, luật và điều kiện ban đầu.', environment: environments.starfall, neighbors: ['location.deathless_shore', 'location.first_dawn_throne'], resources: [{ resourceId: 'resource.genesis_core', name: 'Sáng Thế Nguyên Hạch', baseYieldPerYear: 0.24, rarity: 'rare' }], encounters: [{ entityId: 'entity.elite.genesis_witness', weight: 0.25 }, { entityId: 'entity.boss.genesis_anti_creator', weight: 0.011 }], danger: 10000, planeId: 'plane.genesis', requiredRealmOrder: 114, spatialDistance: 112 },
        'location.first_dawn_throne': { id: 'location.first_dawn_throne', name: 'Sơ Quang Sáng Thế Tọa', description: 'Điểm đứng ngoài thế giới đã dựng, nơi Sáng Thế Chủ quyết định bắt đầu Kỷ Nguyên mới rồi chấp nhận để nó tự phát triển.', environment: environments.starfall, neighbors: ['location.genesis_source_sea'], resources: [{ resourceId: 'resource.genesis_core', name: 'Sáng Thế Nguyên Hạch', baseYieldPerYear: 0.34, rarity: 'rare' }, { resourceId: 'resource.first_dawn_fragment', name: 'Sơ Quang Tàn Phiến', baseYieldPerYear: 0.04, rarity: 'rare' }], encounters: [{ entityId: 'entity.boss.genesis_anti_creator', weight: 0.018 }], danger: 10800, planeId: 'plane.genesis', requiredRealmOrder: 115, spatialDistance: 120 },
        'location.blood_river_gorge': {
            id: 'location.blood_river_gorge',
            name: 'Huyết Hà Cốc',
            description: 'Hẻm núi đỏ sẫm, linh khí pha huyết sát; tà tu và hung thú thường lui tới.',
            environment: environments.thunderValley,
            neighbors: ['location.thunder_valley', 'location.purple_mist_marsh'],
            resources: [
                { resourceId: 'resource.blood_crystal', name: 'Huyết Tinh', baseYieldPerYear: 1.2, rarity: 'rare' },
            ],
            encounters: [
                { entityId: 'entity.enemy.iron_boar', weight: 2 },
                { entityId: 'entity.boss.blood_river_rogue', weight: 0.08 },
            ],
            danger: 72,
        },
    },
};
//# sourceMappingURL=world.js.map