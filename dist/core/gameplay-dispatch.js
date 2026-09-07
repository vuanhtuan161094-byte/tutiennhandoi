import { artifactQualityName, artifactTierName } from './artifact.js';
import './artifact-v88.js';
import { enhancementBonusPct, equipmentQualityName, equipmentTierName } from './equipment.js';
import './equipment-set-v116.js';
import { EQUIPMENT_AFFIX_DEFINITIONS_V114 } from './equipment-affix-v114.js';
import './equipment-reforge-v115.js';
import { EQUIPMENT_GEM_BLANK_RESOURCE_NAME_V128 } from './equipment-inscription-gem-v128.js';
import './dungeon.js';
import './loot-economy-v122.js';
import { categoryDisplayName } from './life.js';
import './reincarnation.js';
import { normalizeGuidanceAutomationPolicy } from './guidance.js';
import './early-game.js';
import './reincarnation-loop.js';
import './playtest-telemetry.js';
import './reincarnation-diversity.js';
import './save-stability.js';
import './combat-roles.js';
import './birth-randomness.js';
import './realtime-balance.js';
import { economyMaterialDefinition, heavenlyTreasureDefinitions } from './economy-v111.js';
import './build-foundation-v113.js';
import './specialization-skill-progression-v125.js';
import './resource-pve-v12329.js';
import './player-experience-v105.js';
import './global-build-balance-v108.js';
import './progression-closure-v113.js';
import './immortal-progression-v114.js';
import './build-progression-v115.js';
import './late-game-economy-v140.js';
import './content-loop-v117.js';
import './pve-progression-v118.js';
import './pvp-production-v119.js';
const deadLifePlanningCommandTypes = new Set([
    'equip', 'activateArtifact', 'deactivateArtifact', 'setSkillActive', 'setLoadout', 'applyLoadoutPreset', 'saveCombatLoadout', 'applySavedCombatLoadout', 'cloneCombatLoadout',
    'setManifestations', 'setDaoDomain',
    'guidanceEnabled', 'configureAutomation', 'setOfflineRoutine', 'offlineReturn',
    'settleLife', 'reincarnate', 'spendReincarnationTalent', 'setMajorTalents',
]);
const resourceLabels = {
    'resource.spirit_stone': 'Hạ Phẩm Linh Thạch',
    'resource.spirit_herb': 'Tụ Linh Thảo',
    'resource.black_iron_ore': 'Huyền Thiết Khoáng',
    'resource.cultivation_essence': 'Tu Vi Tinh Hoa',
    'resource.alchemy_essence': 'Dược Tính Tinh Hoa',
    'resource.forging_essence': 'Khí Luyện Tinh Hoa',
    'resource.enhancement_protection_talisman': 'Bùa Chống Tụt',
    'resource.enhancement_transfer_gem': 'Ngọc Chuyển Cường Hóa',
    'resource.affix_family_change_core': 'Chuyển Tính Thạch',
    'resource.dao_inscription_fragment': 'Tàn Văn',
    'resource.artifact_dust': 'Bảo Khí Tàn Tinh',
    'resource.beast_essence': 'Yêu Thú Tinh Hoa',
    'resource.talisman_essence': 'Phù Văn Tinh Hoa',
    'resource.soul_essence': 'Thần Hồn Tinh Hoa',
    'resource.void_crystal': 'Hư Không Tinh',
    'resource.space_mark_fragment': 'Không Gian Tắc Phiến',
    'resource.integration_essence': 'Hợp Nguyên Tinh Hoa',
    'resource.unity_fragment': 'Tam Nguyên Đồng Văn',
    'resource.civilization_insight': 'Nhận Thức Văn Minh',
    'resource.immortal_tribute_seal': 'Tiên Vực Cống Ấn',
    'resource.pill.cultivation': 'Tu Vi Đan',
    'resource.bloodline_essence': 'Huyết Tinh',
    'resource.body_essence': 'Thể Phách Tinh Hoa',
    'resource.bloodline_protection': 'Hộ Huyết',
    'resource.technique_insight': 'Bí Thuật Tàn Trang',
};
function resourceName(id) {
    const economy = economyMaterialDefinition(id);
    if (economy)
        return economy.name;
    const treasure = heavenlyTreasureDefinitions[id];
    if (treasure)
        return treasure.name;
    return resourceLabels[id] ?? id.replace(/^resource\./, '').replaceAll('_', ' ');
}
const EQUIPMENT_AFFIX_FAMILY_LABELS_V13821 = {
    core: 'Cốt Lõi', combat: 'Chiến Đấu', element: 'Ngũ Hành', dao: 'Bản Đạo', rootOrigin: 'Căn Nguyên', skill: 'Kỹ Năng', mechanic: 'Cơ Chế',
};
const LIVE_EQUIPMENT_AFFIX_FAMILIES_V13821 = [...new Set(EQUIPMENT_AFFIX_DEFINITIONS_V114.filter(x => x.live).map(x => x.family))];
function availableReforgeFamiliesV13821(item, index) {
    const affixes = item.affixes ?? [];
    const current = affixes[index];
    if (!current)
        return [];
    const usedGroups = new Set(affixes.filter((_, i) => i !== index).map(x => x.exclusiveGroup));
    const buildCount = affixes.filter((x, i) => i !== index && x.buildAffix).length;
    const maxBuild = item.setId?.startsWith('set.v116.') ? 2 : 3;
    return LIVE_EQUIPMENT_AFFIX_FAMILIES_V13821.filter(family => EQUIPMENT_AFFIX_DEFINITIONS_V114.some(def => def.live && def.family === family && def.id !== current.id && !usedGroups.has(def.exclusiveGroup) && (!def.buildAffix || buildCount < maxBuild)));
}

// V141: command mutation transport is isolated from read-model construction.
// Keep facade semantics via Function#call so existing this.session/registry/world/result behavior is unchanged.
export function dispatchGameplayCommand(command) {
        const beforeYear = this.session.state.worldTimeYears;
        try {
            if (!this.session.state.alive && !deadLifePlanningCommandTypes.has(command.type)) {
                throw new Error('Đời hiện tại đã kết thúc; chỉ được chỉnh build/cài đặt và chuẩn bị Luân Hồi, không được tiếp tục hoạt động hay nhận tiến triển.');
            }
            switch (command.type) {
                case 'activity': {
                    const report = this.session.execute(command.request);
                    return this.result(command.type, beforeYear, report.summaryLines, report, report.stopReason);
                }
                case 'ascendRealm': {
                    const report = this.session.ascendRealmV140();
                    return this.result(command.type, beforeYear, [report.event?.message ?? 'Thăng Cảnh thành công.'], report);
                }
                case 'nourishBloodline': {
                    const report = this.session.nourishBloodline(command.points ?? 10);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'advanceBloodline': {
                    const report = this.session.advanceBloodline(Boolean(command.useProtection));
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'advancePhysique': {
                    const report = this.session.advancePhysique();
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'swapBloodline': {
                    const report = this.session.swapCurrentBloodline(command.targetId);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'implantBloodline': {
                    const report = this.session.implantCurrentBloodline(command.targetId);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'tribulation': {
                    const report = this.session.attemptHeavenlyTribulation(command.intensity ?? 1);
                    return this.result(command.type, beforeYear, [report.event.message, `Xác suất ước tính ${report.chance.toFixed(1)}% · cường độ ${report.intensity}.`], report, report.passed ? 'tribulationPassed' : 'tribulationFailed');
                }
                case 'refineImmortal': {
                    const report = this.session.refineImmortalEssence(command.batches ?? 1);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'refineEarthImmortal': {
                    const report = this.session.refineEarthImmortal(command.batches ?? 1);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'refineHeavenImmortal': {
                    const report = this.session.refineHeavenImmortal(command.batches ?? 1);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'refineTrueImmortal': {
                    const report = this.session.refineTrueImmortal(command.batches ?? 1);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'refineApexImmortal': {
                    const report = this.session.refineApexImmortal(command.kind, command.batches ?? 1);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'setManifestations': {
                    const report = this.session.setActiveManifestations(command.ids);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'breakExtremity': {
                    const report = this.session.breakExtremity();
                    return this.result(command.type, beforeYear, [report.summary], report, 'extremityBroken');
                }
                case 'createGenesisEpoch': {
                    const report = this.session.createGenesisEpoch();
                    return this.result(command.type, beforeYear, [report.summary], report, 'genesisEpochCreated');
                }
                case 'establishOrthodoxy': {
                    const report = this.session.establishImmortalOrthodoxy();
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'claimImmortalTerritory': {
                    const report = this.session.claimImmortalTerritory(command.locationId);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'declareImmortalWar': {
                    const report = this.session.declareImmortalWar(command.targetFactionId, command.contestedLocationId);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'fightImmortalWar': {
                    const report = this.session.fightImmortalWarCampaign(command.warId);
                    return this.result(command.type, beforeYear, [report.summary], report, report.ended ? 'warEnded' : 'warCampaign');
                }
                case 'formImmortalAlliance': {
                    const report = this.session.formImmortalAlliance(command.targetFactionId);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'establishImmortalVassal': {
                    const report = this.session.establishImmortalVassal(command.targetFactionId);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'dissolveImmortalDiplomacy': {
                    const report = this.session.dissolveImmortalDiplomacy(command.targetFactionId);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'createGenesisWorld': {
                    const report = this.session.createPersonalGenesisWorld(command.name);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'evolveGenesisWorld': {
                    const report = this.session.evolvePersonalGenesisWorld(command.worldId, command.years, command.policy ?? 'observe');
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'harvestGenesisInsight': {
                    const report = this.session.harvestPersonalGenesisInsight(command.worldId, command.amount ?? Number.POSITIVE_INFINITY);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'absorbCivilizationInsight': {
                    const report = this.session.absorbCivilizationInsight(command.amount);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'formImmortalLeague': {
                    const report = this.session.formImmortalLeague(command.memberFactionIds, command.name);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'collectImmortalTribute': {
                    const report = this.session.collectImmortalTribute(command.amount ?? Number.POSITIVE_INFINITY);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'mobilizeImmortalTreasury': {
                    const report = this.session.mobilizeImmortalTreasury(command.amount);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'befriendAscendant': {
                    const report = this.session.befriendGenesisAscendant(command.actorId);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'alignAscendant': {
                    const report = this.session.alignGenesisAscendant(command.actorId);
                    return this.result(command.type, beforeYear, [report.summary], report);
                }
                case 'challengeDungeon': {
                    const report = this.session.challengeDungeonFloor(command.dungeonId, command.floor);
                    this.lastCombatReviewValue = this.buildCombatReview(report);
                    const dungeon = this.world.dungeons[command.dungeonId];
                    const equipmentLoot = report.equipmentDropIds.map(id => this.session.state.equipment.items.find(item => item.id === id)).filter(Boolean);
                    const artifactLoot = report.artifactDropIds.map(id => this.session.state.artifacts.items.find(item => item.id === id)).filter(Boolean);
                    const lines = [
                        `${dungeon?.name ?? command.dungeonId} tầng ${command.floor}: ${report.won ? 'THẮNG' : 'THUA'} sau ${report.battleDuration.toFixed(1)}s${report.firstClear ? ' · FIRST CLEAR' : ''}.`,
                        `Thăm dò trước trận: ${report.readiness.bandLabel} · Chiến Lực ${report.readiness.player.score.toFixed(1)} vs ${report.readiness.enemy.score.toFixed(1)} · ${report.readiness.ratio.toFixed(2)}×.`,
                        ...(report.mechanic ? [`Cơ chế thủ vệ: ${report.mechanic.name} — ${report.mechanic.description}`, `Khắc chế: ${report.mechanic.counterHint}`] : []),
                        ...(report.phaseTransitions.length ? report.phaseTransitions.map((phase, index) => `Chuyển phase ${index + 2}: ${phase.name} @ ${phase.hpPct.toFixed(1)}% HP (${phase.time.toFixed(1)}s).`) : []),
                        ...(report.counterWindowSuccesses.length ? report.counterWindowSuccesses.map(x => `Phản công thành công: ${x.name} @ ${x.time.toFixed(1)}s${x.skillId ? ` · ${this.registry.skill(x.skillId).name}` : ''}.`) : []),
                        report.readiness.diagnosis,
                        ...(!report.won ? report.readiness.recommendations.slice(0, 2).map(x => `Gợi ý build: ${x}`) : []),
                        ...(!report.won && report.battleInsightGain > 0 ? [`Bại mà có ngộ: Công Pháp đang dùng +${report.battleInsightGain.toFixed(2)} mastery.`] : []),
                        ...Object.entries(report.rewards).filter(([, amount]) => amount > 0).map(([id, amount]) => `+${amount} ${resourceName(id)}`),
                        ...equipmentLoot.map(item => `Chiến lợi phẩm: ${item.name} · ${equipmentTierName(item.tier)} · ${equipmentQualityName(item.quality)}${report.milestoneLootProtected ? ' · [MỐC ĐÃ KHÓA]' : ''}`),
                        ...artifactLoot.map(item => `Pháp Bảo: ${item.name} · ${artifactTierName(item.tier)} · ${artifactQualityName(item.quality)}${report.milestoneLootProtected ? ' · [MỐC ĐÃ KHÓA]' : ''}`),
                        ...(report.milestoneLootProtected ? ['Chiến lợi phẩm first-clear đầu game được khóa khỏi Loot AI; tự xem/trang bị rồi mới quyết định xử lý.'] : []),
                    ];
                    return this.result(command.type, beforeYear, lines, report, report.won ? (report.firstClear ? 'firstClear' : undefined) : 'combatDefeat');
                }
                case 'equip': {
                    this.session.equip(command.itemId);
                    const item = this.session.state.equipment.items.find(candidate => candidate.id === command.itemId);
                    return this.result(command.type, beforeYear, [`Đã trang bị ${item.name} vào ô ${item.slot}.`], item);
                }
                case 'craftEquipmentV142': {
                    const report = this.session.craftEquipmentV142(command.slot, command.rankIndex);
                    return this.result(command.type, beforeYear, [`Luyện thành ${report.item.name}; tiêu ${report.fragmentCost} Mảnh Trang Bị.`], report);
                }
                case 'refineEquipmentFragmentsV142': {
                    const report = this.session.refineEquipmentFragmentsV142(command.fromRank, command.batches ?? 1);
                    return this.result(command.type, beforeYear, [`Tinh luyện Mảnh Trang Bị ${command.fromRank} → ${Number(command.fromRank)+1} theo tỷ lệ 3:1.`], report);
                }
                case 'mergeEquipmentV142': {
                    const report = this.session.mergeEquipmentV142(command.mainItemId, command.fodderItemAId, command.fodderItemBId);
                    return this.result(command.type, beforeYear, [`Hợp thành thành công: ${report.item.name}.`], report);
                }
                case 'engraveEquipmentSetV142': {
                    const report = this.session.engraveEquipmentSetV142(command.itemId, command.setId);
                    return this.result(command.type, beforeYear, [`Khắc Bộ ${report.setName} lên ${report.item.name}; tiêu ${report.cost} Tàn Ấn.`], report);
                }
                case 'enhanceEquipment': {
                    const report = this.session.enhanceEquipment(command.itemId, Boolean(command.useProtection));
                    const item = this.session.state.equipment.items.find(candidate => candidate.id === command.itemId);
                    const line = report.success
                        ? `Cường hóa thành công ${item.name}: +${report.afterLevel} · bonus ${enhancementBonusPct(report.afterLevel)}%.`
                        : report.downgraded
                            ? `Cường hóa thất bại: ${item.name} tụt xuống +${report.afterLevel}.`
                            : report.protectionUsed
                                ? `Cường hóa thất bại; Bùa Chống Tụt giữ ${item.name} ở +${report.afterLevel}.`
                                : `Cường hóa thất bại; ${item.name} giữ +${report.afterLevel}.`;
                    return this.result(command.type, beforeYear, [line, `Tỉ lệ lần thử: ${report.successChancePct}% · tốn ${report.essenceCost} Khí Luyện Tinh Hoa.`], report);
                }
                case 'transferEquipmentEnhancement': {
                    const report = this.session.transferEquipmentEnhancement(command.fromItemId, command.toItemId);
                    const target = this.session.state.equipment.items.find(candidate => candidate.id === command.toItemId);
                    return this.result(command.type, beforeYear, [`Đã chuyển +${report.transferredLevel} sang ${target.name}; trang bị nguồn trở về +0.`], report);
                }
                case 'reforgeEquipmentAffixV115': {
                    const report = this.session.reforgeEquipmentAffixV115(command.itemId, command.index, command.targetFamily);
                    return this.result(command.type, beforeYear, [`Tái Luyện dòng ${command.index + 1}: ${report.before.id} → ${report.after.id} · roll ${report.after.rollPct.toFixed(2)}% · lần #${report.reforgeCountAfter}.`, `Chi phí: ${report.cost.spiritStones} Linh Thạch · ${report.cost.equipmentEssence} Tinh Hoa Trang Bị${report.cost.familyChangeMaterial ? ` · ${report.cost.familyChangeMaterial} Chuyển Tính Thạch` : ''}.`], report);
                }
                case 'refineEquipmentAffixV115': {
                    const report = this.session.refineEquipmentAffixV115(command.itemId, command.index);
                    return this.result(command.type, beforeYear, [`Tinh Luyện dòng ${command.index + 1}: ${report.before.rollPct.toFixed(2)}% → ${report.after.rollPct.toFixed(2)}%.`, `Chi phí: ${report.cost.spiritStones} Linh Thạch · ${report.cost.equipmentEssence} Tinh Hoa Trang Bị.`], report);
                }
                case 'engraveDaoInscriptionV115': {
                    const report = this.session.engraveDaoInscriptionV115(command.itemId, command.inscriptionId);
                    return this.result(command.type, beforeYear, [`Đã khắc ${report.inscription.name ?? command.inscriptionId}.`, report.inscription.description ?? 'Đạo Văn đã nối vào EquipmentPower → CombatKernel.'], report, 'daoInscriptionV128');
                }
                case 'socketEquipmentGemV128': {
                    const report = this.session.socketEquipmentGemV128(command.itemId, command.socketIndex, command.element);
                    return this.result(command.type, beforeYear, [`Đã khảm ${report.effect.name} Lv${report.effect.level}: ${report.effect.detail}.`, `Tốn ${report.spentBlanks} ${EQUIPMENT_GEM_BLANK_RESOURCE_NAME_V128}.`], report, 'equipmentGemV128');
                }
                case 'upgradeEquipmentGemV128': {
                    const report = this.session.upgradeEquipmentGemV128(command.itemId, command.socketIndex);
                    return this.result(command.type, beforeYear, [`${report.effect.name} đã lên Lv${report.effect.level}: ${report.effect.detail}.`, `Tốn ${report.spentBlanks} ${EQUIPMENT_GEM_BLANK_RESOURCE_NAME_V128}.`], report, 'equipmentGemV128');
                }
                case 'unsocketEquipmentGemV128': {
                    const report = this.session.unsocketEquipmentGemV128(command.itemId, command.socketIndex);
                    return this.result(command.type, beforeYear, [`Đã tháo Ngũ Hành Ngọc khỏi ô ${report.socketIndex + 1}.`, `Hoàn ${report.refundedBlanks} ${EQUIPMENT_GEM_BLANK_RESOURCE_NAME_V128}.`], report, 'equipmentGemV128');
                }
                case 'craftTalismanV128': {
                    const recipe = this.registry.professionRecipe(command.recipeId);
                    if (recipe.professionId !== 'talisman')
                        throw new Error('Phù Trận Các chỉ nhận recipe Phù/Trận.');
                    const report = this.session.craftProfession(recipe.id, command.quantity ?? 1);
                    return this.result(command.type, beforeYear, [`${recipe.name}: ${report.result.successes}/${report.result.attempts} lần thành công.`, `Mastery Phù/Trận: ${report.result.masteryBefore.toFixed(1)} → ${report.result.masteryAfter.toFixed(1)}.`], report, 'talismanCraftV128');
                }
                case 'useTalismanV128': {
                    const product = this.registry.craftedProduct(command.productId);
                    if (product.professionId !== 'talisman')
                        throw new Error('Phù Trận Các chỉ sử dụng thành phẩm Phù/Trận.');
                    const report = this.session.useCraftedProduct(product.id, command.quality);
                    return this.result(command.type, beforeYear, [report.summary], report, 'talismanUseV128');
                }
                case 'craftEquipmentSetV116': {
                    const report = this.session.craftEquipmentSetV116({ setId: command.setId, slot: command.slot, grade: command.grade, tier: command.tier, quality: command.quality, preferredFamily: command.preferredFamily });
                    return this.result(command.type, beforeYear, [`Đã luyện đúng bộ ${report.item.name}.`, `Chi phí: ${report.cost.spiritStones} Linh Thạch · ${report.cost.equipmentEssence} Tinh Hoa Trang Bị${command.preferredFamily ? ` · ưu tiên family ${command.preferredFamily}` : ''}.`], report);
                }
                case 'activateArtifact': {
                    this.session.activateArtifact(command.artifactId);
                    const item = this.session.state.artifacts.items.find(candidate => candidate.id === command.artifactId);
                    return this.result(command.type, beforeYear, [`Đã đưa ${item.name} vào danh sách pháp bảo trực chiến.`], this.session.artifactSummary());
                }
                case 'deactivateArtifact': {
                    const item = this.session.state.artifacts.items.find(candidate => candidate.id === command.artifactId);
                    if (!item)
                        throw new Error(`Unknown artifact: ${command.artifactId}`);
                    this.session.deactivateArtifact(command.artifactId);
                    return this.result(command.type, beforeYear, [`Đã thu ${item.name} khỏi danh sách pháp bảo trực chiến.`], this.session.artifactSummary());
                }
                case 'learnSkill': {
                    this.session.learnSkill(command.skillId);
                    return this.result(command.type, beforeYear, [`Đã lĩnh ngộ ${this.registry.skill(command.skillId).name}.`]);
                }
                case 'setSkillActive': {
                    const skill = this.registry.skill(command.skillId);
                    const report = this.session.setCombatSkillActive(command.skillId, command.active);
                    return this.result(command.type, beforeYear, [command.active ? `Đã đưa ${skill.name} vào bộ chiến đấu.` : `Đã tháo ${skill.name} khỏi bộ chiến đấu.`, `Đang dùng ${report.activeCount}/6 kỹ năng.`], report);
                }
                case 'setLoadout': {
                    this.session.setCombatLoadout(command.skillIds, command.aiProfile);
                    return this.result(command.type, beforeYear, [`Đã đổi combat loadout: ${command.skillIds.map(id => this.registry.skill(id).name).join(', ')}.`]);
                }
                case 'applyLoadoutPreset': {
                    const preset = this.session.applyTacticalLoadoutPreset(command.presetId);
                    return this.result(command.type, beforeYear, [`Đã áp dụng preset ${preset.name}: ${preset.skillIds.map(id => this.registry.skill(id).name).join(', ')}.`, preset.description], preset);
                }
                case 'saveCombatLoadout': {
                    const loadout = this.session.saveCombatLoadout(command.name);
                    return this.result(command.type, beforeYear, [`Đã lưu loadout ${loadout.name}: ${loadout.skillIds.length} skill · ${loadout.artifactIds.length} pháp bảo · ${Object.keys(loadout.equipmentIds).length} trang bị.`], loadout);
                }
                case 'applySavedCombatLoadout': {
                    const report = this.session.applySavedCombatLoadout(command.idOrName);
                    return this.result(command.type, beforeYear, [`Đã mặc loadout ${report.loadout.name}.`, ...(report.missingAssets.length ? [`Thiếu ${report.missingAssets.length} vật phẩm cũ; các phần còn sở hữu vẫn được áp dụng.`] : [])], report);
                }
                case 'cloneCombatLoadout': {
                    const loadout = this.session.cloneCombatLoadout(command.sourceId, command.newName);
                    return this.result(command.type, beforeYear, [`Đã nhân bản thành loadout ${loadout.name}.`], loadout);
                }
                case 'guidanceEnabled': {
                    this.session.configureGuidance({ enabled: command.enabled });
                    return this.result(command.type, beforeYear, [`Định Hướng AI: ${command.enabled ? 'BẬT' : 'TẮT'}.`]);
                }
                case 'guidanceRun': {
                    const report = this.session.runGuidance(command.maxWorldYears ?? 5, command.maxDecisions ?? 8);
                    const lines = [
                        ...report.workerAssignments.map(line => `Phân thân: ${line}`),
                        ...report.steps.map(step => `${step.decision.chosen.summary} → ${step.resultSummary}`),
                        `AI dừng: ${report.wakeReason}; đã trôi ${report.elapsedYears.toFixed(2)} năm.`,
                    ];
                    return this.result(command.type, beforeYear, lines, report, report.wakeReason);
                }
                case 'configureAutomation': {
                    const current = normalizeGuidanceAutomationPolicy(this.session.guidanceState().automationPolicy);
                    this.session.configureGuidance({ automationPolicy: { ...current, ...command.patch } });
                    const policy = this.automationPolicy();
                    return this.result(command.type, beforeYear, ['Đã cập nhật Automation Policy.', ...policy.explanation.slice(0, 2)], policy);
                }
                case 'processLoot': {
                    const report = this.session.processStoredLoot();
                    return this.result(command.type, beforeYear, [
                        `Loot policy: giữ ${report.kept}, bán ${report.sold}, phân giải ${report.disassembled}.`,
                    ], report);
                }
                case 'meditativePassing': {
                    const report = this.session.enterMeditativePassing();
                    return this.result(command.type, beforeYear, [report.summary, 'Đời đã kết thúc. Hoàn thành Cọc Gỗ + Sinh Tồn, kiểm tra preview rồi chốt Điểm Luân Hồi/Tiềm Năng trước khi chuyển sinh.'], report, 'lifeEnd');
                }
                case 'firstLifeStory': {
                    const report = this.session.resolveFirstLifeStory(command.beatId, command.path);
                    return this.result(command.type, beforeYear, [report.summary], report, 'storyBeat');
                }
                case 'contentEvent': {
                    const report = this.session.resolveContentEvent(command.eventId, command.choiceId);
                    return this.result(command.type, beforeYear, [report.summary], report, report.wonCombat === false ? 'combatDefeat' : 'contentEvent');
                }
                case 'worldOpportunity': {
                    const report = this.session.resolveWorldOpportunity(command.opportunityId, command.choice, command.npcId);
                    const rewards = Object.entries(report.rewards).filter(([, value]) => value > 0).map(([key, value]) => `${key}: +${Number(value).toFixed(1)}`);
                    return this.result(command.type, beforeYear, [report.event.message, ...rewards], report, 'opportunity');
                }
                case 'joinFaction': {
                    const report = this.session.joinFaction(command.factionId);
                    return this.result(command.type, beforeYear, [report.event.message], report, 'factionJoined');
                }
                case 'leaveFaction': {
                    const report = this.session.leaveFaction();
                    return this.result(command.type, beforeYear, [report.event.message], report, 'factionLeft');
                }
                case 'factionContribute': {
                    const report = this.session.contributeToFaction(command.resourceId ?? 'resource.spirit_stone', command.quantity ?? 10);
                    return this.result(command.type, beforeYear, [report.event.message], report);
                }
                case 'factionPromote': {
                    const report = this.session.promoteInFaction();
                    return this.result(command.type, beforeYear, [report.event.message], report, 'factionPromoted');
                }
                case 'factionLearn': {
                    const report = this.session.learnFromFaction(command.kind, command.knowledgeId);
                    return this.result(command.type, beforeYear, [report.event.message], report);
                }
                case 'factionContributeKnowledge': {
                    const report = this.session.contributeKnowledgeToFaction(command.kind, command.knowledgeId);
                    return this.result(command.type, beforeYear, [report.event.message], report);
                }
                case 'factionInvite': {
                    const report = this.session.inviteNpcToFaction(command.npcId, command.rank ?? 'outerDisciple');
                    return this.result(command.type, beforeYear, [report.event.message], report);
                }
                case 'factionTeach': {
                    const report = this.session.teachFactionMember(command.npcId, command.knowledgeId);
                    return this.result(command.type, beforeYear, [report.event.message], report);
                }
                case 'foundFaction': {
                    const report = this.session.foundFaction(command.name, command.doctrineTags ?? []);
                    return this.result(command.type, beforeYear, [report.event.message], report, 'factionFounded');
                }
                case 'factionUpgradeFacility': {
                    const report = this.session.upgradeFactionFacility(command.facilityId);
                    return this.result(command.type, beforeYear, [report.event.message], report);
                }
                case 'interactNpc': {
                    const report = this.session.interactNpc(command.npcId, command.action ?? 'greet');
                    const labels = { trust: 'Tin', respect: 'Kính', debt: 'Ân', grudge: 'Oán', karmaDepth: 'Duyên' };
                    const deltaText = Object.entries(report.relationDelta ?? {}).filter(([, value]) => Math.abs(Number(value ?? 0)) > 1e-9).map(([key, value]) => `${labels[key] ?? key} ${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(Number.isInteger(Number(value)) ? 0 : 1)}`).join(' · ');
                    return this.result(command.type, beforeYear, [report.event.message, deltaText ? `Quan hệ: ${deltaText}.` : 'Quan hệ không đổi.'], report);
                }
                case 'takeMaster': {
                    const report = this.session.takeMaster(command.npcId);
                    return this.result(command.type, beforeYear, [report.event.message], report, 'masterBond');
                }
                case 'acceptDisciple': {
                    const report = this.session.acceptDisciple(command.npcId);
                    return this.result(command.type, beforeYear, [report.event.message], report, 'discipleBond');
                }
                case 'formDaoPartnership': {
                    const report = this.session.formDaoPartnership(command.npcId);
                    return this.result(command.type, beforeYear, [report.event.message], report, 'daoPartnerBond');
                }
                case 'receiveMasterTeaching': {
                    const report = this.session.receiveMasterTeaching(command.npcId);
                    return this.result(command.type, beforeYear, [report.event.message], report);
                }
                case 'teachDisciple': {
                    const report = this.session.teachDisciple(command.npcId, command.knowledgeId);
                    return this.result(command.type, beforeYear, [report.event.message], report);
                }
                case 'cultivateWithDaoPartner': {
                    const report = this.session.cultivateWithDaoPartner(command.npcId, command.years ?? 0.25);
                    return this.result(command.type, beforeYear, [report.event.message], report);
                }
                case 'haveChildWithDaoPartner': {
                    const report = this.session.haveChildWithDaoPartner(command.npcId);
                    return this.result(command.type, beforeYear, [report.event.message], report);
                }
                case 'receiveParentGuidance': {
                    const report = this.session.receiveParentGuidance(command.parentId);
                    return this.result(command.type, beforeYear, [report.event.message], report);
                }
                case 'createSoulClone': {
                    const report = this.session.createSoulClone();
                    return this.result(command.type, beforeYear, [
                        `Đã phân hóa ${report.clone.name} · ${report.clone.sixDaoName} · hiệu suất nền ${(report.clone.baseEfficiency * 100).toFixed(0)}%.`,
                        `Tải Thần Hồn: ${report.loadAfter.toFixed(1)}/${this.session.soulSummary().soul.loadCapacity.toFixed(1)} · hệ số áp lực ×${report.pressureMultiplier.toFixed(2)}.`,
                    ], report, 'cloneCreated');
                }
                case 'trainSoulCloneDaoHanhV128': {
                    const report = this.session.trainSoulCloneDaoHanhV128(command.cloneId, command.levels ?? 1);
                    return this.result(command.type, beforeYear, [
                        `${report.clone.name}: Đạo Hạnh +${report.gainedLevels} → Lv${report.progression.level} · ${report.progression.seal.name}.`,
                        `Đã dùng ${report.spentSoulDew} Dưỡng Hồn Lộ + ${report.spentSoulEssence} Thần Hồn Tinh Hoa; đúng chuyên môn ×${report.progression.specialtyEfficiency.toFixed(3)}.`,
                    ], report, 'soulDaoHanh');
                }
                case 'upgradeSoulCloneSealV128': {
                    const report = this.session.upgradeSoulCloneSealV128(command.cloneId);
                    return this.result(command.type, beforeYear, [
                        `${report.clone.name} đã Thăng Ấn: ${report.progression.seal.name}.`,
                        `Hiệu suất đúng chuyên môn ×${report.progression.specialtyEfficiency.toFixed(3)} · Hộ Pháp chất lượng ×${report.progression.protectorQualityMultiplier.toFixed(3)}.`,
                    ], report, 'soulDaoSeal');
                }
                case 'nourishSoul': {
                    const report = this.session.nourishSoul(command.batches ?? 1);
                    return this.result(command.type, beforeYear, [
                        `Dưỡng hồn ${command.batches ?? 1} lần: cường độ +${report.strengthGain.toFixed(1)}, độ thuần +${report.purityGain.toFixed(1)}, tải tối đa +${report.loadCapacityGain.toFixed(1)}.`,
                    ], report);
                }
                case 'assignSoulClone': {
                    this.session.assignSoulClone(command.cloneId, command.dungeonId, command.floor);
                    return this.result(command.type, beforeYear, [`Đã phái Phân Thân tới ${this.world.dungeons[command.dungeonId]?.name ?? command.dungeonId} tầng ${command.floor}.`]);
                }
                case 'setSoulCloneProtectorV127': {
                    const summary = this.session.setSoulCloneProtectorV127(command.cloneId, command.enabled !== false);
                    return this.result(command.type, beforeYear, [command.enabled !== false ? 'Phân Thân đã chuyển sang Hộ Pháp và ngừng farm.' : 'Phân Thân đã rời Hộ Pháp và có thể nhận nhiệm vụ farm.'], summary);
                }
                case 'dismissSoulClone': {
                    const clone = this.session.dismissSoulClone(command.cloneId);
                    return this.result(command.type, beforeYear, [`Đã thu hồi ${clone.name}; tải Thần Hồn giảm xuống ${this.session.soulSummary().totalLoad.toFixed(1)}.`]);
                }
                case 'discoverDao': {
                    const state = this.session.discoverDao(command.daoId);
                    return this.result(command.type, beforeYear, [`Đã chạm vào ${this.registry.dao(command.daoId).name}.`], state);
                }
                case 'setMainDao': {
                    const state = this.session.chooseMainDao(command.daoId);
                    return this.result(command.type, beforeYear, [`Chủ Đạo hiện tại: ${this.registry.dao(command.daoId).name}.`], state);
                }
                case 'setDaoInterpretation': {
                    const state = this.session.chooseDaoInterpretation(command.daoId, command.interpretationId);
                    const def = this.registry.dao(command.daoId);
                    const interp = def.interpretations.find(i => i.id === command.interpretationId);
                    return this.result(command.type, beforeYear, [`${def.name} · diễn giải: ${interp?.name ?? command.interpretationId}.`], state);
                }
                case 'contemplateDao': {
                    const report = this.session.contemplateDao(command.daoId, command.years ?? 1);
                    return this.result(command.type, beforeYear, [`Ngộ Đạo ${report.years.toFixed(1)} năm: depth +${report.depthGain.toFixed(2)}, insight +${report.insightGain.toFixed(1)}${report.domainUnlocked ? ' · Đạo Vực đã đủ điều kiện.' : ''}`], report);
                }
                case 'setDaoDomain': {
                    const state = this.session.setDaoDomain(command.active);
                    return this.result(command.type, beforeYear, [command.active ? 'Đạo Vực sơ khai đã manifest.' : 'Đã thu Đạo Vực.'], state);
                }
                case 'settleLife': {
                    const settlement = this.session.settleCurrentLife();
                    return this.result(command.type, beforeYear, [
                        `Một đời đến đây kết thúc · ${settlement.totalScore} điểm · hạng ${settlement.grade}.`,
                        ...Object.values(settlement.categories).map(category => `${categoryDisplayName(category.category)}: ${category.score}`),
                        `CP +${settlement.cpEarned}.`,
                        `Mệnh Cơ +${(settlement.mingJiGain ?? 0).toFixed(2)}.`,
                        `Luân Hồi XP +${settlement.reincarnationLegacy?.xp ?? 0}.`,
                        `Điểm Thiên Phú +${settlement.talentPointGain ?? 0} (suy giảm theo căn bậc hai của CP đời này).`,
                        ...settlement.originGains.map(origin => `${origin.name} +${origin.value.toFixed(2)}`),
                        ...(settlement.legacy ? [`Di sản: ${settlement.legacy.summary}`] : []),
                    ], settlement);
                }
                case 'spendReincarnationTalent': {
                    const report = this.session.spendReincarnationTalent(command.talentId, command.ranks ?? 1);
                    return this.result(command.type, beforeYear, [`${report.name}: bậc ${report.rankBefore} → ${report.rankAfter}; tiêu ${report.cost} Điểm Thiên Phú.`, `Điểm còn lại: ${report.pointsRemaining}.`], report);
                }
                case 'setMajorTalents': {
                    const report = this.session.queueMajorTalentFocus(command.ids);
                    const names = this.session.reincarnationTalentSummary().majors.filter(x => report.selected.includes(x.id)).map(x => x.name);
                    return this.result(command.type, beforeYear, [`Major Talent đời kế: ${names.join(' · ') || 'không chọn'}.`, `Đã dùng ${report.selected.length}/${report.slots} slot; chỉ kích hoạt sau lần Luân Hồi kế tiếp.`], report);
                }
                case 'reincarnate': {
                    const report = this.session.reincarnate(command.plan ?? {});
                    const progress = this.session.meta.reincarnationProgress;
                    return this.result(command.type, beforeYear, [
                        `Chuyển sinh sang đời ${report.currentLife.lifeNumber}.`,
                        `Xuất Thân: ${report.currentLife.birth.family}.`,
                        `Điểm Luân Hồi tích lũy: ${Math.floor(progress?.tree?.lifetimePointsEarned ?? 0)} RP.`,
                        `Năng Lượng Luân Hồi: ${Math.floor(progress?.energy?.current ?? 0)}/300.`,
                    ], report, 'reincarnated');
                }
                case 'recoverArtifactRelic': {
                    this.session.recoverArtifactRelic(command.artifactId);
                    const item = this.session.state.artifacts.items.find(x => x.id === command.artifactId);
                    return this.result(command.type, beforeYear, [`Đã tìm lại Di Vật tiền kiếp: ${item?.name ?? command.artifactId}.`]);
                }
                case 'setOfflineRoutine': {
                    const state = this.session.configureOfflineRoutine(command.plan);
                    return this.result(command.type, beforeYear, [state.offlineRoutine ? `Đã đặt hoạt động treo: ${this.describeRoutine(state.offlineRoutine)}.` : 'Đã tắt hoạt động treo của bản thể.'], state);
                }
                case 'offlineReturn': {
                    const resolved = this.session.resolveConfiguredOffline(command.lastSeenUnixMs, command.nowUnixMs);
                    if (!resolved)
                        return this.result(command.type, beforeYear, ['Không có hoạt động treo để xử lý.']);
                    const report = resolved.report;
                    const compact = [
                        `Rời game ${resolved.elapsedRealHours.toFixed(1)} giờ · thế giới trôi ${resolved.resolvedWorldYears.toFixed(2)} năm.`,
                        ...report.summaryLines.slice(0, 7),
                    ];
                    return this.result(command.type, beforeYear, compact, resolved, report.stopReason);
                }
            }
        }
        catch (error) {
            return { ok: false, type: command.type, summaryLines: [error instanceof Error ? error.message : String(error)], changedWorldYears: this.session.state.worldTimeYears - beforeYear };
        }
    
}
