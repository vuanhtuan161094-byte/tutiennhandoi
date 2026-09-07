import { buildDongfuV99 } from './dongfu-v99.js';
export function evaluateAlphaReadiness(api) {
    const integrity = api.getSaveIntegrity();
    const telemetry = api.getTelemetry();
    const early = api.getEarlyGameSlice();
    const flow = api.getFlow();
    const overview = api.getOverview();
    const blockers = [];
    const warnings = [];
    if (!integrity.ok)
        blockers.push(...integrity.errors.map(error => `Save integrity: ${error}`));
    if (flow.actions.length === 0)
        blockers.push('Không có hành động hợp lệ trong player flow hiện tại.');
    if ((overview.cultivation.requiredTuVi ?? 0) < 0)
        blockers.push('Cultivation V140 trả về requiredTuVi không hợp lệ.');
    if (telemetry.health.band !== 'healthy')
        warnings.push(...telemetry.health.warnings.slice(0, 4));
    if (early.decisionDensity === 'thin')
        warnings.push('Decision density early-game đang mỏng; cần theo dõi trong closed alpha.');
    warnings.push(...integrity.warnings.slice(0, 3));
    const checks = [
        { id: 'api', label: 'Game API boundary', ok: api.apiVersion === 'game-api.v1', detail: `${api.apiVersion} · client chỉ nhận DTO` },
        { id: 'save', label: 'Save integrity', ok: integrity.ok, detail: integrity.ok ? 'Không có reference hỏng.' : `${integrity.errors.length} lỗi cần xử lý.` },
        { id: 'flow', label: 'Playable flow', ok: flow.actions.length > 0, detail: `${flow.actions.length} hành động khả dụng · phase ${flow.phase}` },
        { id: 'early', label: 'Early-game slice', ok: early.progressPct >= 0 && early.progressPct <= 100, detail: `${early.stage.name} · ${early.progressPct.toFixed(0)}% · decision ${early.decisionDensity}` },
        { id: 'telemetry', label: 'Telemetry', ok: telemetry.schema === 'playtest-telemetry.v1', detail: `${telemetry.actions.total} hành động được đo trong đời hiện tại.` },
        { id: 'reincarnation', label: 'Reincarnation planner', ok: api.getReincarnationPlanner().schema === 'reincarnation-planner.v1', detail: 'Có preview riêng; không cần mutate save để xem kế hoạch.' },
    ];
    if (!checks.find(check => check.id === 'api').ok)
        blockers.push('Game API version không tương thích client.');
    const score = Math.max(0, Math.min(100, 100 - blockers.length * 30 - warnings.length * 5));
    const status = blockers.length ? 'blocked' : warnings.length ? 'playable-with-warnings' : 'ready';
    return { schema: 'alpha-readiness.v1', status, score, blockers, warnings: [...new Set(warnings)], checks };
}

function stripCatalogItemsV129(category = {}) {
    if (!category || typeof category !== 'object') return category;
    const { items: _items, ...summary } = category;
    return summary;
}
function manualIndexItemV129(item = {}) {
    return { id:item.id, category:item.category, name:item.name, realmStageIndex:item.realmStageIndex, realmName:item.realmName, unlocked:item.unlocked };
}
function projectCatalogV129(catalog, itemCategories = [], { manualStage = null } = {}) {
    if (!catalog || typeof catalog !== 'object') return catalog;
    const full = new Set((itemCategories || []).map(String));
    const stage = Number(manualStage);
    return {
        ...catalog,
        categories: Array.isArray(catalog.categories)
            ? catalog.categories.map(category => {
                const id=String(category?.category || '');
                if(!full.has(id))return stripCatalogItemsV129(category);
                if(id==='manual'&&Number.isFinite(stage)&&Array.isArray(category?.items))return {...category,items:category.items.map(item=>Number(item?.realmStageIndex||0)===stage?item:manualIndexItemV129(item))};
                return category;
            })
            : catalog.categories,
    };
}
function parseSubviewV129(subview = '') {
    const [sectionRaw,stageRaw] = String(subview || '').split(':');
    const stage=Number(stageRaw);
    return {section:sectionRaw||'',manualStage:Number.isFinite(stage)?stage:null};
}
function parseInventorySubviewV129(subview = '') {
    const [viewRaw,itemRaw] = String(subview || '').split('|');
    return { view:viewRaw||'equipped', selectedItemId:itemRaw||'' };
}
function collectionWorkshopCategoriesV129(section = '') {
    switch (parseSubviewV129(section).section || 'home') {
        case 'scripture': return ['manual', 'heart'];
        case 'artifact': return ['artifact', 'relic'];
        case 'beast': return ['pet'];
        case 'companion': return ['companion'];
        case 'bloodline': return ['bloodline'];
        case 'physique': return ['physique'];
        default: return [];
    }
}

function projectDaoSkillV129(skill = {}) {
    const keys=['id','name','description','dao','slot','realmGate','spiritCostClass','spiritCostStandardPct','cooldown','castTime','recoveryTime','form','domains','damageCoefficientPct','breakDamagePct','effectSummary','daoResourceSummary','practiceRoleV126'];
    const out={}; for(const key of keys) if(skill[key]!==undefined) out[key]=Array.isArray(skill[key])?[...skill[key]]:skill[key];
    return out;
}
function projectSpecializationPreviewV129(preview, keep = null) {
    if(!preview||typeof preview!=='object')return preview;
    const allowed=keep instanceof Set&&keep.size?keep:null;
    return {...preview,daos:Array.isArray(preview.daos)?preview.daos.filter(group=>!allowed||allowed.has(String(group?.dao||''))).map(group=>({dao:group.dao,guide:group.guide,core:group.core,skills:(group.skills||[]).map(projectDaoSkillV129)})):preview.daos};
}

const WEB_VIEW_BUILDERS_V140 = Object.freeze({
    cultivation: (api) => ({ overview: api.getOverview(), character: api.getCharacterCultivationV140(), flow: api.getFlow(), daoSuy: api.getDaoSuyV127(), alchemy: api.getAlchemyV112() }),
    character: (api) => ({ character: api.getCharacter(), equipment: api.getEquipmentEquippedV129(), equipmentSystem: api.getEquipmentSystem() }),
    inventory: (api, now, core, subview) => {
        const inv=parseInventorySubviewV129(subview);
        return {
            equipment: api.getEquipmentInventoryV129(inv.selectedItemId), equipmentSystem: api.getEquipmentSystem(), artifacts: api.getArtifacts(),
            collectionEconomy: projectCatalogV129(api.getCollectionEconomyV12326(now), ['artifact', 'relic']),
        };
    },
    skills: (api) => {
        const specialization = api.getSpecializationV125();
        const preview = api.getSpecializationPreviewV125();
        const keep = new Set([specialization?.mainDaoId, specialization?.secondaryDaoId].filter(Boolean).map(String));
        const specializationPreview = projectSpecializationPreviewV129(preview, keep);
        return { character: api.getCharacterSkillsV129(), specialization, specializationPreview };
    },
    dongfu: (api, now, core, subview) => {
        const alchemy = api.getAlchemyV112();
        const forging = api.getForgingV12328(now);
        const rawCollection = api.getCollectionV12316(now);
        const rawCollectionEconomy = api.getCollectionEconomyV12326(now);
        const character = api.getCharacterDongfuV129();
        const parsedSubview=parseSubviewV129(subview);
        const itemCategories = collectionWorkshopCategoriesV129(subview);
        const manualStage=parsedSubview.manualStage??Number(rawCollectionEconomy?.manualBanner?.selectedRealmStageIndex);
        const collection = projectCatalogV129(rawCollection, []);
        const collectionEconomy = projectCatalogV129(rawCollectionEconomy, itemCategories,{manualStage});
        return {
            character: { name: character?.name, originProgression: character?.originProgression }, alchemy, forging, collection, collectionEconomy,
            dongfu: buildDongfuV99({ collection: rawCollection, collectionEconomy: rawCollectionEconomy, alchemy, forging, originProgression: character.originProgression }),
        };
    },
    dungeons: (api, now) => ({
        dungeons: api.getDungeons(), endlessHunt: api.getEndlessHunt(), flow: api.getFlow(),
        collection: projectCatalogV129(api.getCollectionV12316(now), []),
        collectionEconomy: projectCatalogV129(api.getCollectionEconomyV12326(now), []),
        economyActivity: api.getEconomyActivityV89(now),
    }),
    hunt: (api) => ({
        character: api.getCharacterHuntV129(), endlessHunt: api.getEndlessHunt(), specialization: api.getSpecializationV125(), reincarnation: api.getReincarnation(),
    }),
    pvp: (api, now) => ({
        pvp: api.getPvpV91(now), collection: projectCatalogV129(api.getCollectionV12316(now), []),
        collectionEconomy: projectCatalogV129(api.getCollectionEconomyV12326(now), []),
    }),
    collection: (api, now, core, subview) => {
        const rawCollection=api.getCollectionV12316(now),rawEconomy=api.getCollectionEconomyV12326(now),parsed=parseSubviewV129(subview);
        const category=parsed.section||'manual',manualStage=parsed.manualStage??Number(rawEconomy?.manualBanner?.selectedRealmStageIndex);
        return {collection:projectCatalogV129(rawCollection,[]),collectionEconomy:projectCatalogV129(rawEconomy,[category],{manualStage})};
    },
    guide: (api, now) => ({ playerExperience: api.getPlayerExperienceV105(now), build: api.getBuild(), flow: api.getFlow() }),
    overview: (api, now) => ({ character: api.getCharacterOverviewV129(), playerExperience: api.getPlayerExperienceV105(now), endlessHunt: api.getEndlessHunt() }),
    path: (api) => {
        const specialization=api.getSpecializationV125(),preview=api.getSpecializationPreviewV125();
        const keep=new Set([specialization?.mainDaoId,specialization?.secondaryDaoId].filter(Boolean).map(String));
        const specializationPreview=projectSpecializationPreviewV129(preview,keep);
        return {character:api.getCharacterSkillsV129(),specialization,specializationPreview};
    },
    roots: (api) => ({ character: api.getCharacterRootV129(), spiritualRoots: api.getSpiritualRootsV131(), elementSeals: api.getElementSealsV133() }),
    locations: (api) => ({ locations: api.getLocations() }),
    journal: (api) => ({ journal: api.getJournal(), worldHistory: api.getWorldHistory() }),
    power: (api) => ({ personalPower: api.getPersonalPower() }),
    soul: (api) => ({ soul: api.getSoul() }),
    faction: (api) => ({ faction: api.getFaction() }),
    social: (api) => ({ social: api.getSocial() }),
    dao: (api) => ({ dao: api.getDao() }),
    myriadLives: (api) => ({ myriadLives: api.getMyriadLives() }),
    economy: (api, now) => ({ economy: api.getEconomyV111(), economyActivity: api.getEconomyActivityV89(now), economyProduction: api.getEconomyProductionV111(now) }),
    build: (api, now) => ({ build: api.getBuild(), collectionEconomy: projectCatalogV129(api.getCollectionEconomyV12326(now), ['artifact','relic']) }),
    combat: (api) => {
        const dungeons = api.getDungeons();
        const combatReview = api.getCombatReview();
        let nextBossIntel;
        const overview = api.getOverview();
        if (overview.nextChallenge) {
            try { nextBossIntel = api.getBossIntel(overview.nextChallenge.dungeonId, overview.nextChallenge.floor); }
            catch { /* locked boss */ }
        }
        return { dungeons, combatReview, nextBossIntel };
    },
    reincarnation: (api, now) => ({
        reincarnationPlanner: api.getReincarnationPlanner(), reincarnationProgress: api.getReincarnationProgressV2(now),
        permanentPotential: api.getPermanentPotentialV2(), myriadLives: api.getMyriadLives(),
    }),
    automation: (api) => ({ automation: api.getAutomation() }),
    telemetry: (api) => ({ telemetry: api.getTelemetry(), earlyGame: api.getEarlyGameSlice() }),
    alpha: (api) => ({ saveIntegrity: api.getSaveIntegrity(), alpha: evaluateAlphaReadiness(api) }),
    devlab: (api, now) => ({
        character: api.getCharacter(), specialization: api.getSpecializationV125(), specializationPreview: api.getSpecializationPreviewV125(),
        collection: api.getCollectionV12316(now), collectionEconomy: api.getCollectionEconomyV12326(now),
        spiritualRoots: api.getSpiritualRootsV131(), elementSeals: api.getElementSealsV133(), build: api.getBuild(),
    }),
});

/**
 * V140 performance transport: rebuild only the always-visible shell plus the currently active view.
 * Full buildWebClientSnapshot remains the compatibility contract for load/new/tests.
 */

function memoizedReadApiV140(api) {
    const cache=new Map(),bound=new Map();
    return new Proxy(api,{
        get(target,prop,receiver){
            const value=Reflect.get(target,prop,receiver);
            if(typeof value!=='function')return value;
            if(bound.has(prop))return bound.get(prop);
            const fn=String(prop).startsWith('get')?((...args)=>{
                let key=String(prop);
                if(args.length)try{key+=`:${JSON.stringify(args)}`;}catch{key+=`:argc${args.length}`;}
                if(cache.has(key))return cache.get(key);
                const result=value.apply(target,args);cache.set(key,result);return result;
            }):value.bind(target);
            bound.set(prop,fn);return fn;
        }
    });
}

export function buildWebClientViewPatch(api, view = 'cultivation', nowUnixMs = Date.now(), subview = '') {
    api = memoizedReadApiV140(api);
    const clientCore = api.getClientCoreV140();
    const core = {
        schema: 'web-client-view-patch.v140', clientVersion: '1.40.0', generatedAtUnixMs: nowUnixMs, apiVersion: api.apiVersion,
        overview: clientCore.overview, inventory: api.getInventory(), shell: clientCore.shell,
    };
    const builder = WEB_VIEW_BUILDERS_V140[String(view || 'cultivation')] || WEB_VIEW_BUILDERS_V140.cultivation;
    return { ...core, ...builder(api, nowUnixMs, core, subview), activeView: String(view || 'cultivation'), activeSubview: String(subview || '') };
}

export function buildWebClientSnapshot(api, nowUnixMs = Date.now()) {
    api = memoizedReadApiV140(api);
    // Sync real-time production before reading inventory/equipment so one refresh is internally consistent.
    const alchemy = api.getAlchemyV112();
    const forging = api.getForgingV12328(nowUnixMs);
    const overview = api.getOverview();
    const character = api.getCharacter();
    const collection = api.getCollectionV12316(nowUnixMs);
    const collectionEconomy = api.getCollectionEconomyV12326(nowUnixMs);
    const dongfu = buildDongfuV99({ collection, collectionEconomy, alchemy, forging, originProgression: character.originProgression });
    const soul = api.getSoul();
    const dao = api.getDao();
    const daoSuy = api.getDaoSuyV127();
    const playerExperience = api.getPlayerExperienceV105(nowUnixMs);
    let nextBossIntel;
    if (overview.nextChallenge) {
        try {
            nextBossIntel = api.getBossIntel(overview.nextChallenge.dungeonId, overview.nextChallenge.floor);
        }
        catch { /* locked/invalid boss should not break the whole client snapshot */ }
    }
    return {
        schema: 'web-client-snapshot.v1', clientVersion: '1.40.0', generatedAtUnixMs: nowUnixMs, apiVersion: api.apiVersion,
        overview, character, inventory: api.getInventory(), equipment: api.getEquipment(), equipmentSystem: api.getEquipmentSystem(), artifacts: api.getArtifacts(), flow: api.getFlow(), journal: api.getJournal(), worldHistory: api.getWorldHistory(), locations: api.getLocations(), personalPower: api.getPersonalPower(), soul, faction: api.getFaction(), social: api.getSocial(), dao, daoSuy, myriadLives: api.getMyriadLives(), playerExperience, dungeons: api.getDungeons(), endlessHunt: api.getEndlessHunt(), build: api.getBuild(), specialization: api.getSpecializationV125(), specializationPreview: api.getSpecializationPreviewV125(), spiritualRoots: api.getSpiritualRootsV131(), collection, collectionEconomy, dongfu, economy: api.getEconomyV111(), economyActivity: api.getEconomyActivityV89(nowUnixMs), economyProduction: api.getEconomyProductionV111(nowUnixMs), pvp: api.getPvpV91(nowUnixMs), alchemy, forging, reincarnation: api.getReincarnation(), reincarnationPlanner: api.getReincarnationPlanner(), reincarnationProgress: api.getReincarnationProgressV2(nowUnixMs), permanentPotential: api.getPermanentPotentialV2(), automation: api.getAutomation(), telemetry: api.getTelemetry(), earlyGame: api.getEarlyGameSlice(), saveIntegrity: api.getSaveIntegrity(), combatReview: api.getCombatReview(), nextBossIntel, alpha: evaluateAlphaReadiness(api),
    };
}
//# sourceMappingURL=client-shell.js.map