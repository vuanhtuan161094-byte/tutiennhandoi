import { daoSuyCombatMultiplierV127, ensureDaoSuyStateV127 } from './dao-suy-v127.js';
export function createImmortalState() {
    return { awakened: false, immortalEssence: 0, essencePurity: 0, immortalBody: 0, lawAdaptation: 0, refinedBatches: 0, earthAnchor: 0, earthVeinHarmony: 0, earthRefinements: 0, heavenResonance: 0, celestialCirculation: 0, heavenRefinements: 0, trueLawBody: 0, trueLawAuthority: 0, trueRefinements: 0,
        mysticLawWeave: 0, mysticLawStability: 0, mysticRefinements: 0, goldenImmortalSeal: 0, indestructibleEssence: 0, goldenRefinements: 0,
        taiyiEpochRiver: 0, causalStability: 0, taiyiRefinements: 0, grandLuoDaoFruit: 0, timelineFreedom: 0, grandLuoRefinements: 0,
        kingDomainAuthority: 0, orthodoxyWeight: 0, kingRefinements: 0, emperorMandate: 0, worldAuthority: 0, emperorRefinements: 0,
        extremityPressure: 0, extremityInsight: 0, extremityLayers: 0, extremityAuthority: 0, extremityRefinements: 0,
        supremeDaoCore: 0, supremeLawConsistency: 0, supremeDaoRefinements: 0, chaosAffinity: 0, chaosBody: 0, chaosRefinements: 0, hongmengSeed: 0, primordialVitality: 0, hongmengRefinements: 0,
        heavenOpeningAuthority: 0, innerCosmosStability: 0, heavenOpeningRefinements: 0, worldCore: 0, worldLifePotential: 0, worldLordRefinements: 0, eternityAnchor: 0, deathlessContinuity: 0, eternityRefinements: 0,
        creationSource: 0, genesisAuthority: 0, creationRefinements: 0, creationEpochs: 0, creationEpochAuthority: 0, manifestationCapacity: 0, activeManifestationIds: [],
        daoSuy: 0, daoSuyTribulationsPassed: 0, daoSuyTribulationsFailed: 0, daoSuyTribulationsPassedByMajor: {} };
}
export function cloneImmortalState(s) {
    const base = createImmortalState();
    const source = s ?? {};
    const next = { ...base, ...source, activeManifestationIds: [...(source.activeManifestationIds ?? base.activeManifestationIds)],
        daoSuyTribulationsPassedByMajor: { ...(source.daoSuyTribulationsPassedByMajor ?? base.daoSuyTribulationsPassedByMajor) } };
    ensureDaoSuyStateV127(next);
    return next;
}
export function synchronizeImmortalForRealm(state, realmOrder, manifestationBonus = 0) {
    if (realmOrder >= 46)
        state.awakened = true;
    // Cảnh giới chỉ mở hệ; không tự bịa tiến độ đã tu. Một ít floor giữ save/debug ở cảnh giới cao không vô nghĩa hoàn toàn.
    if (realmOrder >= 50)
        state.earthAnchor = Math.max(state.earthAnchor, 5);
    if (realmOrder >= 54)
        state.heavenResonance = Math.max(state.heavenResonance, 5);
    if (realmOrder >= 58)
        state.trueLawBody = Math.max(state.trueLawBody, 5);
    if (realmOrder >= 62) {
        state.mysticLawWeave = Math.max(state.mysticLawWeave, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 3);
    }
    if (realmOrder >= 66) {
        state.goldenImmortalSeal = Math.max(state.goldenImmortalSeal, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 4);
    }
    if (realmOrder >= 70) {
        state.taiyiEpochRiver = Math.max(state.taiyiEpochRiver, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 4);
    }
    if (realmOrder >= 74) {
        state.grandLuoDaoFruit = Math.max(state.grandLuoDaoFruit, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 5);
    }
    if (realmOrder >= 78) {
        state.kingDomainAuthority = Math.max(state.kingDomainAuthority, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 6);
    }
    if (realmOrder >= 82) {
        state.emperorMandate = Math.max(state.emperorMandate, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 7);
    }
    if (realmOrder >= 86) {
        state.extremityPressure = Math.max(state.extremityPressure, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 8);
    }
    if (realmOrder >= 90) {
        state.supremeDaoCore = Math.max(state.supremeDaoCore, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 9);
    }
    if (realmOrder >= 94) {
        state.chaosAffinity = Math.max(state.chaosAffinity, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 10);
    }
    if (realmOrder >= 98) {
        state.hongmengSeed = Math.max(state.hongmengSeed, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 11);
    }
    if (realmOrder >= 102) {
        state.heavenOpeningAuthority = Math.max(state.heavenOpeningAuthority, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 12);
    }
    if (realmOrder >= 106) {
        state.worldCore = Math.max(state.worldCore, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 13);
    }
    if (realmOrder >= 110) {
        state.eternityAnchor = Math.max(state.eternityAnchor, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 14);
    }
    if (realmOrder >= 114) {
        state.creationSource = Math.max(state.creationSource, 5);
        state.manifestationCapacity = Math.max(state.manifestationCapacity, 15);
    }
    const effectiveCapacity = state.manifestationCapacity + Math.max(0, Math.floor(manifestationBonus));
    if (state.activeManifestationIds.length > effectiveCapacity)
        state.activeManifestationIds = state.activeManifestationIds.slice(0, effectiveCapacity);
}
export function refineImmortalEssence(state, batches) {
    if (!state.awakened)
        throw new Error('Cần bước vào Nhân Tiên mới có thể luyện hóa Tiên Khí thành Tiên Nguyên.');
    const used = Math.max(1, Math.floor(batches));
    state.refinedBatches += used;
    state.immortalEssence += used * 9;
    state.essencePurity = Math.min(100, state.essencePurity + used * 2.6);
    state.immortalBody = Math.min(100, state.immortalBody + used * 1.9);
    state.lawAdaptation = Math.min(100, state.lawAdaptation + used * 1.5);
    return { used, essence: state.immortalEssence, purity: state.essencePurity, body: state.immortalBody, law: state.lawAdaptation };
}
export function refineEarthImmortal(state, batches) {
    const used = Math.max(1, Math.floor(batches));
    state.earthRefinements += used;
    state.earthAnchor = Math.min(100, state.earthAnchor + used * 3.2);
    state.earthVeinHarmony = Math.min(100, state.earthVeinHarmony + used * 2.5);
    state.immortalBody = Math.min(100, state.immortalBody + used * 0.9);
    return { used, anchor: state.earthAnchor, harmony: state.earthVeinHarmony, body: state.immortalBody };
}
export function refineHeavenImmortal(state, batches) {
    const used = Math.max(1, Math.floor(batches));
    state.heavenRefinements += used;
    state.heavenResonance = Math.min(100, state.heavenResonance + used * 3.0);
    state.celestialCirculation = Math.min(100, state.celestialCirculation + used * 2.7);
    state.lawAdaptation = Math.min(100, state.lawAdaptation + used * 0.8);
    return { used, resonance: state.heavenResonance, circulation: state.celestialCirculation, law: state.lawAdaptation };
}
export function refineTrueImmortal(state, batches) {
    const used = Math.max(1, Math.floor(batches));
    state.trueRefinements += used;
    state.trueLawBody = Math.min(100, state.trueLawBody + used * 2.8);
    state.trueLawAuthority = Math.min(100, state.trueLawAuthority + used * 2.4);
    state.essencePurity = Math.min(100, state.essencePurity + used * 0.6);
    return { used, body: state.trueLawBody, authority: state.trueLawAuthority, purity: state.essencePurity };
}
export function refineApexImmortal(state, kind, batches) {
    const used = Math.max(1, Math.floor(batches));
    if (kind === 'mystic') {
        state.mysticRefinements += used;
        state.mysticLawWeave = Math.min(100, state.mysticLawWeave + used * 2.9);
        state.mysticLawStability = Math.min(100, state.mysticLawStability + used * 2.4);
        return { used, weave: state.mysticLawWeave, stability: state.mysticLawStability };
    }
    if (kind === 'golden') {
        state.goldenRefinements += used;
        state.goldenImmortalSeal = Math.min(100, state.goldenImmortalSeal + used * 2.75);
        state.indestructibleEssence = Math.min(100, state.indestructibleEssence + used * 2.35);
        return { used, seal: state.goldenImmortalSeal, essence: state.indestructibleEssence };
    }
    if (kind === 'taiyi') {
        state.taiyiRefinements += used;
        state.taiyiEpochRiver = Math.min(100, state.taiyiEpochRiver + used * 2.6);
        state.causalStability = Math.min(100, state.causalStability + used * 2.25);
        return { used, river: state.taiyiEpochRiver, causal: state.causalStability };
    }
    if (kind === 'grand_luo') {
        state.grandLuoRefinements += used;
        state.grandLuoDaoFruit = Math.min(100, state.grandLuoDaoFruit + used * 2.45);
        state.timelineFreedom = Math.min(100, state.timelineFreedom + used * 2.2);
        return { used, fruit: state.grandLuoDaoFruit, freedom: state.timelineFreedom };
    }
    if (kind === 'king') {
        state.kingRefinements += used;
        state.kingDomainAuthority = Math.min(100, state.kingDomainAuthority + used * 2.3);
        state.orthodoxyWeight = Math.min(100, state.orthodoxyWeight + used * 2.05);
        return { used, domain: state.kingDomainAuthority, orthodoxy: state.orthodoxyWeight };
    }
    if (kind === 'emperor') {
        state.emperorRefinements += used;
        state.emperorMandate = Math.min(100, state.emperorMandate + used * 2.15);
        state.worldAuthority = Math.min(100, state.worldAuthority + used * 1.95);
        return { used, mandate: state.emperorMandate, world: state.worldAuthority };
    }
    if (kind === 'extremity') {
        state.extremityRefinements += used;
        state.extremityPressure = Math.min(100, state.extremityPressure + used * 4.0);
        state.extremityInsight += used * 2.5;
        return { used, pressure: state.extremityPressure, insight: state.extremityInsight, layers: state.extremityLayers };
    }
    if (kind === 'supreme_dao') {
        state.supremeDaoRefinements += used;
        state.supremeDaoCore = Math.min(100, state.supremeDaoCore + used * 2.25);
        state.supremeLawConsistency = Math.min(100, state.supremeLawConsistency + used * 2.0);
        return { used, core: state.supremeDaoCore, consistency: state.supremeLawConsistency };
    }
    if (kind === 'chaos') {
        state.chaosRefinements += used;
        state.chaosAffinity = Math.min(100, state.chaosAffinity + used * 2.15);
        state.chaosBody = Math.min(100, state.chaosBody + used * 1.95);
        return { used, affinity: state.chaosAffinity, body: state.chaosBody };
    }
    if (kind === 'hongmeng') {
        state.hongmengRefinements += used;
        state.hongmengSeed = Math.min(100, state.hongmengSeed + used * 2.05);
        state.primordialVitality = Math.min(100, state.primordialVitality + used * 1.9);
        return { used, seed: state.hongmengSeed, vitality: state.primordialVitality };
    }
    if (kind === 'heaven_opening') {
        state.heavenOpeningRefinements += used;
        state.heavenOpeningAuthority = Math.min(100, state.heavenOpeningAuthority + used * 1.95);
        state.innerCosmosStability = Math.min(100, state.innerCosmosStability + used * 1.85);
        return { used, authority: state.heavenOpeningAuthority, cosmos: state.innerCosmosStability };
    }
    if (kind === 'world_lord') {
        state.worldLordRefinements += used;
        state.worldCore = Math.min(100, state.worldCore + used * 1.85);
        state.worldLifePotential = Math.min(100, state.worldLifePotential + used * 1.75);
        return { used, core: state.worldCore, life: state.worldLifePotential };
    }
    if (kind === 'eternity') {
        state.eternityRefinements += used;
        state.eternityAnchor = Math.min(100, state.eternityAnchor + used * 1.75);
        state.deathlessContinuity = Math.min(100, state.deathlessContinuity + used * 1.68);
        return { used, anchor: state.eternityAnchor, continuity: state.deathlessContinuity };
    }
    state.creationRefinements += used;
    state.creationSource = Math.min(100, state.creationSource + used * 1.65);
    state.genesisAuthority = Math.min(100, state.genesisAuthority + used * 1.58);
    return { used, source: state.creationSource, genesis: state.genesisAuthority, epochs: state.creationEpochs };
}
export function setActiveManifestations(state, ids, capacityOverride) {
    const unique = [...new Set(ids.filter(Boolean))];
    const capacity = Math.max(0, capacityOverride ?? state.manifestationCapacity);
    if (unique.length > capacity)
        throw new Error(`Chỉ có thể đồng thời biểu hiện ${capacity} hệ; đang chọn ${unique.length}.`);
    state.activeManifestationIds = unique;
}
export function breakExtremityLayer(state) {
    if (state.extremityPressure < 100)
        throw new Error('Phá Cực cần Cực Hạn Áp Lực đạt 100/100.');
    if (state.extremityInsight < 30 + state.extremityLayers * 5)
        throw new Error(`Phá Cực tầng kế cần Cực Hạn Ngộ ≥ ${30 + state.extremityLayers * 5}.`);
    state.extremityLayers += 1;
    state.extremityAuthority += 8;
    state.extremityPressure = 20;
    state.extremityInsight += 5;
    return { layer: state.extremityLayers, authority: state.extremityAuthority, pressure: state.extremityPressure };
}
export function createGenesisEpoch(state) {
    if (state.creationSource < 100 || state.genesisAuthority < 100)
        throw new Error('Khai Kỷ Nguyên cần Sáng Thế Nguyên đạt 100 và Sáng Thế Quyền đạt 100.');
    const needAuthority = state.creationEpochs * 3;
    if (state.creationEpochAuthority < needAuthority)
        throw new Error(`Kỷ Nguyên kế cần Kỷ Nguyên Quyền ≥ ${needAuthority}.`);
    state.creationEpochs += 1;
    state.creationEpochAuthority += 12 + Math.floor(Math.sqrt(state.creationEpochs) * 4);
    // Mỗi Kỷ Nguyên mới buộc người chơi tái cô đọng một phần nguồn sáng thế, tránh spam một lần max rồi vô hạn.
    state.creationSource = 35;
    state.genesisAuthority = 40;
    return { epoch: state.creationEpochs, authority: state.creationEpochAuthority, source: state.creationSource, genesis: state.genesisAuthority };
}
export function applyImmortalToEntity(entity, state, realm, manifestationCapacityOverride) {
    if (!state.awakened || realm.maxRealmOrder < 46)
        return entity;
    const q = (state.essencePurity + state.immortalBody + state.lawAdaptation) / 300;
    const earth = realm.maxRealmOrder >= 50 ? (state.earthAnchor + state.earthVeinHarmony) / 200 : 0;
    const heaven = realm.maxRealmOrder >= 54 ? (state.heavenResonance + state.celestialCirculation) / 200 : 0;
    const truth = realm.maxRealmOrder >= 58 ? (state.trueLawBody + state.trueLawAuthority) / 200 : 0;
    const mystic = realm.maxRealmOrder >= 62 ? (state.mysticLawWeave + state.mysticLawStability) / 200 : 0;
    const golden = realm.maxRealmOrder >= 66 ? (state.goldenImmortalSeal + state.indestructibleEssence) / 200 : 0;
    const taiyi = realm.maxRealmOrder >= 70 ? (state.taiyiEpochRiver + state.causalStability) / 200 : 0;
    const grand = realm.maxRealmOrder >= 74 ? (state.grandLuoDaoFruit + state.timelineFreedom) / 200 : 0;
    const king = realm.maxRealmOrder >= 78 ? (state.kingDomainAuthority + state.orthodoxyWeight) / 200 : 0;
    const emperor = realm.maxRealmOrder >= 82 ? (state.emperorMandate + state.worldAuthority) / 200 : 0;
    const extremity = realm.maxRealmOrder >= 86 ? Math.max(0, state.extremityAuthority) / 100 : 0;
    const supreme = realm.maxRealmOrder >= 90 ? (state.supremeDaoCore + state.supremeLawConsistency) / 200 : 0;
    const chaos = realm.maxRealmOrder >= 94 ? (state.chaosAffinity + state.chaosBody) / 200 : 0;
    const hongmeng = realm.maxRealmOrder >= 98 ? (state.hongmengSeed + state.primordialVitality) / 200 : 0;
    const opening = realm.maxRealmOrder >= 102 ? (state.heavenOpeningAuthority + state.innerCosmosStability) / 200 : 0;
    const worldLord = realm.maxRealmOrder >= 106 ? (state.worldCore + state.worldLifePotential) / 200 : 0;
    const eternity = realm.maxRealmOrder >= 110 ? (state.eternityAnchor + state.deathlessContinuity) / 200 : 0;
    const creation = realm.maxRealmOrder >= 114 ? (state.creationSource + state.genesisAuthority) / 200 : 0;
    const epoch = Math.log2(1 + Math.max(0, state.creationEpochs));
    const manifestCapacity = Math.max(0, manifestationCapacityOverride ?? state.manifestationCapacity);
    const manifested = Math.min(manifestCapacity, state.activeManifestationIds.length);
    const active = new Set(state.activeManifestationIds.slice(0, manifestCapacity));
    // Active Manifestation is a finite combat preset. Owning many mature systems does not
    // make all of them fire at once; each selected system emphasizes a different profile.
    const manifestAttack = (active.has('dao') ? 0.030 : 0) + (active.has('artifact') ? 0.026 : 0) + (active.has('technique') ? 0.020 : 0) + (active.has('origin') ? 0.012 : 0);
    const manifestDefense = (active.has('physique') ? 0.030 : 0) + (active.has('artifact') ? 0.018 : 0) + (active.has('faction') ? 0.014 : 0) + (active.has('origin') ? 0.010 : 0);
    const manifestSpirit = (active.has('soul') ? 0.034 : 0) + (active.has('domain') ? 0.026 : 0) + (active.has('dao') ? 0.014 : 0);
    const manifestMobility = (active.has('technique') ? 0.026 : 0) + (active.has('bloodline') ? 0.016 : 0) + (active.has('soul') ? 0.012 : 0);
    const manifestResolve = (active.has('physique') ? 0.026 : 0) + (active.has('faction') ? 0.022 : 0) + (active.has('domain') ? 0.018 : 0) + (active.has('origin') ? 0.014 : 0);
    const manifestControl = (active.has('domain') ? 0.030 : 0) + (active.has('soul') ? 0.022 : 0) + (active.has('dao') ? 0.014 : 0);
    const tags = [...entity.tags, 'HumanImmortal', 'ImmortalEssence'];
    if (realm.maxRealmOrder >= 50)
        tags.push('EarthImmortal');
    if (realm.maxRealmOrder >= 54)
        tags.push('HeavenImmortal');
    if (realm.maxRealmOrder >= 58)
        tags.push('TrueImmortal');
    if (realm.maxRealmOrder >= 62)
        tags.push('MysticImmortal');
    if (realm.maxRealmOrder >= 66)
        tags.push('GoldenImmortal');
    if (realm.maxRealmOrder >= 70)
        tags.push('TaiyiImmortal');
    if (realm.maxRealmOrder >= 74)
        tags.push('GrandLuoImmortal');
    if (realm.maxRealmOrder >= 78)
        tags.push('ImmortalKing');
    if (realm.maxRealmOrder >= 82)
        tags.push('ImmortalEmperor');
    if (realm.maxRealmOrder >= 86)
        tags.push('Extremity');
    if (realm.maxRealmOrder >= 90)
        tags.push('SupremeDao');
    if (realm.maxRealmOrder >= 94)
        tags.push('Chaos');
    if (realm.maxRealmOrder >= 98)
        tags.push('Hongmeng');
    if (realm.maxRealmOrder >= 102)
        tags.push('HeavenOpening');
    if (realm.maxRealmOrder >= 106)
        tags.push('WorldLord');
    if (realm.maxRealmOrder >= 110)
        tags.push('Eternal');
    if (realm.maxRealmOrder >= 114)
        tags.push('CreationLord');
    if (state.creationEpochs > 0)
        tags.push(`GenesisEpoch:${state.creationEpochs}`);
    for (const id of state.activeManifestationIds)
        tags.push(`Manifest:${id}`);
    const daoSuyCombatMultiplier = daoSuyCombatMultiplierV127(state, realm.maxRealmOrder);
    return { ...entity, tags: [...new Set(tags)], stats: { ...entity.stats,
            maxHp: entity.stats.maxHp * (1 + 0.10 * q + 0.10 * earth + 0.03 * truth + 0.035 * golden + 0.025 * king + 0.01 * extremity + 0.035 * chaos + 0.03 * hongmeng + 0.035 * worldLord + 0.04 * eternity + 0.02 * creation + 0.004 * epoch + 0.002 * manifested + manifestDefense),
            maxSpirit: entity.stats.maxSpirit * (1 + 0.12 * q + 0.10 * heaven + 0.04 * truth + 0.04 * mystic + 0.03 * taiyi + 0.02 * emperor + 0.03 * supreme + 0.04 * hongmeng + 0.035 * opening + 0.035 * creation + 0.004 * epoch + 0.002 * manifested + manifestSpirit),
            attack: entity.stats.attack * daoSuyCombatMultiplier * (1 + 0.08 * q + 0.04 * heaven + 0.08 * truth + 0.045 * mystic + 0.045 * golden + 0.05 * grand + 0.04 * king + 0.045 * emperor + 0.012 * extremity + 0.045 * supreme + 0.04 * chaos + 0.04 * hongmeng + 0.045 * opening + 0.04 * worldLord + 0.04 * eternity + 0.05 * creation + 0.005 * epoch + 0.002 * manifested + manifestAttack),
            defense: entity.stats.defense * daoSuyCombatMultiplier * (1 + 0.08 * q + 0.09 * earth + 0.03 * truth + 0.05 * golden + 0.035 * grand + 0.04 * king + 0.01 * extremity + 0.03 * supreme + 0.05 * chaos + 0.035 * hongmeng + 0.04 * opening + 0.045 * worldLord + 0.055 * eternity + 0.04 * creation + 0.005 * epoch + 0.002 * manifested + manifestDefense),
            mobility: entity.stats.mobility * (1 + 0.045 * heaven + 0.04 * taiyi + 0.035 * grand + 0.002 * manifested + manifestMobility),
            accuracy: entity.stats.accuracy * (1 + 0.04 * heaven + 0.03 * truth + 0.035 * mystic + 0.04 * grand + 0.002 * manifested + manifestMobility * 0.7),
            controlPower: entity.stats.controlPower * (1 + 0.04 * truth + 0.035 * mystic + 0.04 * king + 0.045 * emperor + 0.002 * manifested + manifestControl),
            resolve: entity.stats.resolve * (1 + 0.12 * q + 0.08 * earth + 0.05 * truth + 0.045 * golden + 0.04 * taiyi + 0.04 * grand + 0.04 * emperor + 0.01 * extremity + 0.002 * manifested + manifestResolve),
            actionSpeed: entity.stats.actionSpeed * (1 + 0.03 * q + 0.035 * heaven + 0.04 * taiyi + 0.035 * grand + 0.002 * manifested + manifestMobility * 0.8),
        } };
}
//# sourceMappingURL=immortal.js.map