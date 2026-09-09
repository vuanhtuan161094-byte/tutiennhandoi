import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>fs.writeFileSync(p,s);
function mustReplace(s,from,to,label){if(!s.includes(from))throw new Error(`V148 Gate A anchor missing: ${label}`);return s.replace(from,to);}
function mustCount(s,needle,min,label){const n=s.split(needle).length-1;if(n<min)throw new Error(`V148 Gate A expected ${min}+ ${label}, got ${n}`);}

// 1) Inline V148 authority into the existing confidant runtime module: no new runtime module.
{
  const path='dist/core/confidant-v87.js';
  let s=read(path);
  if(!s.includes("export const CONFIDANT_SCHEMA_V148")){
    const fragment=read('qa/tools/v148-confidant-core.txt');
    s=s.trimEnd()+"\n"+fragment.trim()+"\n";
    write(path,s);
  }
}

// 2) Route collection progression through V148 while retaining V147 pet authority.
{
  const path='dist/core/collection-progression-v12316.js';
  let s=read(path);
  s=mustReplace(s,
    "import { SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147, SPIRIT_BEAST_FRAGMENT_PER_STAR_V147, migrateSpiritBeastsV147, spiritBeastEffectiveLevelV147, spiritBeastLevelCapV147, spiritBeastStarEssenceCostV147, spiritBeastStarUpV147 } from './spirit-beast-v147.js';",
    "import { SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147, SPIRIT_BEAST_FRAGMENT_PER_STAR_V147, migrateSpiritBeastsV147, spiritBeastEffectiveLevelV147, spiritBeastLevelCapV147, spiritBeastStarEssenceCostV147, spiritBeastStarUpV147 } from './spirit-beast-v147.js';\nimport { CONFIDANT_DUPLICATE_FRAGMENT_V148, CONFIDANT_FRAGMENT_PER_STAR_V148, migrateConfidantsV148, confidantCombatTriggersV148, confidantViewV148, confidantFortuneSummaryV148, confidantIntimacyCostV148, confidantIntimacyCapV148, confidantStarEssenceCostV148, confidantStarUpV148, confidantStarsV148, activeConfidantSpecialtyV148, spendConfidantHeartPointV148 } from './confidant-v87.js';",
    'V148 collection import');
  s=mustReplace(s,"    migrateConfidantsV87(state);\n    migrateArtifactsV88(state);","    migrateConfidantsV87(state);\n    migrateConfidantsV148(state);\n    migrateArtifactsV88(state);",'ensure migration');
  s=mustReplace(s,
    "    total.defensePct += bond.defensePct;\n    const active = [...state.activeArtifactIds];",
    "    total.defensePct += bond.defensePct;\n    // V148: all owned Tri Kỷ contribute raw account progression only; no collection-wide percentage inflation.\n    const confidantFortuneV148 = confidantFortuneSummaryV148(state);\n    total.cultivationFlatPer15s += Math.max(0, Number(confidantFortuneV148.cultivationFlatPer15s)||0);\n    const active = [...state.activeArtifactIds];",
    'fortune raw stat');
  s=mustReplace(s,
    "    let enriched = { ...base, tags: [...new Set([...base.tags, 'CollectionV12316', 'ManualV127', 'SpiritBeastV86', 'ConfidantV87', 'ArtifactV88'])], stats, triggers: [...(base.triggers ?? []), ...spiritBeastCombatTriggersV86(state), ...confidantCombatTriggersV87(state)] };",
    "    let enriched = { ...base, tags: [...new Set([...base.tags, 'CollectionV12316', 'ManualV127', 'SpiritBeastV86', 'ConfidantV148', 'ArtifactV88'])], stats, triggers: [...(base.triggers ?? []), ...spiritBeastCombatTriggersV86(state), ...confidantCombatTriggersV148(state)] };",
    'combat trigger route');
  s=mustReplace(s,
    "export function collectionCultivationMultiplierV12316(state) {\n    if (!state) return 1;\n    const fortune = confidantFortuneSummaryV87(state), specialty = activeConfidantSpecialtyV87(state), specialtyPct = specialty?.unlocked && specialty.id === 'cultivation' ? specialty.strengthPct : 0;\n    const tree = manualTree(state), completed = manualCompletedRealmStagesV127(state).size;\n    const completePct = completed * (2 + Math.max(0, Math.min(1, tree.completedRealmCultivationBonusPct ?? 0)));\n    return 1 + (fortune.cultivationPct + specialtyPct + completePct) / 100;\n}\nexport function collectionConfidantV87Summary(state) { return { fortune: confidantFortuneSummaryV87(state), activeSpecialty: activeConfidantSpecialtyV87(state) }; }",
    "export function collectionCultivationMultiplierV12316(state) {\n    if (!state) return 1;\n    // V148 Phúc Duyên is raw. Only active Lạc Dao may provide the bounded cultivation specialty %.\n    const specialty = activeConfidantSpecialtyV148(state), specialtyPct = specialty?.unlocked && specialty.id === 'cultivation' ? specialty.strengthPct : 0;\n    const tree = manualTree(state), completed = manualCompletedRealmStagesV127(state).size;\n    const completePct = completed * (2 + Math.max(0, Math.min(1, tree.completedRealmCultivationBonusPct ?? 0)));\n    return 1 + (specialtyPct + completePct) / 100;\n}\nexport function collectionConfidantV87Summary(state) { migrateConfidantsV148(state); return { schema:'confidant.v148', fortune: confidantFortuneSummaryV148(state), activeSpecialty: activeConfidantSpecialtyV148(state) }; }",
    'cultivation and summary route');

  // Rename V147 exports, then provide V148 companion wrappers without breaking pet behavior.
  s=mustReplace(s,'export function grantCollectionItemV12316(state,id,fragmentAmount){','function grantCollectionItemV12316V147Canonical(state,id,fragmentAmount){','grant wrapper rename');
  s=mustReplace(s,'export function strengthenCollectionItemV12316(state,id,levels=1){','function strengthenCollectionItemV12316V147Canonical(state,id,levels=1){','strengthen wrapper rename');
  s=mustReplace(s,'export function advanceCollectionItemV12316(state,id){','function advanceCollectionItemV12316V147Canonical(state,id){','advance wrapper rename');

  s += `\n\n// V148 canonical collection wrappers.\nexport function grantCollectionItemV12316(state,id,fragmentAmount){\n  const def=collectionDefinitionV12316(id);\n  if(def.category!=='companion')return grantCollectionItemV12316V147Canonical(state,id,fragmentAmount);\n  migrateConfidantsV148(state);\n  const p=state.items[id]??(state.items[id]={owned:false,level:1,advance:0,stars:0,specificFragments:0,confidantHeartV148:{assist:0,guard:0,harmony:0,raw:0},confidantV148Migrated:true});\n  const first=!p.owned;p.owned=true;\n  if(!first)p.specificFragments=Math.max(0,Math.floor(Number(p.specificFragments)||0))+CONFIDANT_DUPLICATE_FRAGMENT_V148;\n  return {first,progress:{...p,confidantHeartV148:{...(p.confidantHeartV148??{})}},definition:def};\n}\n\nexport function strengthenCollectionItemV12316(state,id,levels=1){\n  const def=collectionDefinitionV12316(id);\n  if(def.category!=='companion')return strengthenCollectionItemV12316V147Canonical(state,id,levels);\n  migrateConfidantsV148(state);\n  const p=state.items?.[id];if(!p?.owned)throw new Error(\`Chưa sở hữu \${def.name}.\`);\n  const levelCap=confidantIntimacyCapV148(p);let done=0,cost=0;\n  for(let i=0;i<Math.max(1,Math.floor(Number(levels)||1));i++){\n    if(p.level>=levelCap)break;\n    const c=facilityDiscountedCostV99(state,'companion',confidantIntimacyCostV148(p));\n    if((state.genericFragments?.companion??0)<c)break;\n    state.genericFragments.companion-=c;p.level+=1;cost+=c;done+=1;\n  }\n  if(done<=0)throw new Error(\`Không đủ Đồng Tâm Ngọc hoặc đã đạt Thân Mật \${levelCap}.\`);\n  return {definition:def,levels:done,cost,levelCap,progress:{...p,confidantHeartV148:{...(p.confidantHeartV148??{})}}};\n}\n\nexport function advanceCollectionItemV12316(state,id){\n  const def=collectionDefinitionV12316(id);\n  if(def.category!=='companion')return advanceCollectionItemV12316V147Canonical(state,id);\n  const result=confidantStarUpV148(state,id,1);\n  return {...result,cost:CONFIDANT_FRAGMENT_PER_STAR_V148,advanceCost:CONFIDANT_FRAGMENT_PER_STAR_V148};\n}\n\nexport function spendCollectionConfidantHeartPointV148(state,id,branch){\n  return spendConfidantHeartPointV148(state,id,branch);\n}\n`;
  write(path,s);
}

// 3) CombatKernel V2: raw Tâm Lực damage + shared Đồng Tâm gauge, no parallel resolver.
{
  const path='dist/core/combat.js';
  let s=read(path);
  s=mustReplace(s,
    "            coefficient: effect.coefficient,\n            targetMaxHpPct: effect.targetMaxHpPct,",
    "            coefficient: effect.coefficient,\n            flatDamage: Math.max(0, Number(effect.flatDamage ?? 0)),\n            targetMaxHpPct: effect.targetMaxHpPct,",
    'damage context flat');
  mustCount(s,'srcStats.attack *',2,'raw damage formulas');
  s=mustReplace(s,"        const raw = srcStats.attack * ctx.coefficient + hpPart;","        const raw = srcStats.attack * ctx.coefficient + hpPart + Math.max(0, Number(ctx.flatDamage ?? 0));",'legacy flat damage');
  s=mustReplace(s,"        let raw = srcStats.attack * Math.max(0, ctx.coefficient) + hpPart;","        let raw = srcStats.attack * Math.max(0, ctx.coefficient) + hpPart + Math.max(0, Number(ctx.flatDamage ?? 0));",'locked flat damage');
  s=mustReplace(s,
    "            const runtime = trigger.runtimeV87, runtime88 = trigger.runtimeV88;",
    "            const runtime = trigger.runtimeV87, runtime88 = trigger.runtimeV88, runtime148 = trigger.runtimeV148;",
    'runtime148 read');
  s=mustReplace(s,
    "            const last = owner.triggerState[trigger.id]?.lastTriggeredAt ?? -Infinity;",
    "            if (runtime148?.kind === 'harmony') {\n                const gauge = Math.max(0, Number(owner.marks['__confidant_v148_harmony'] ?? 0));\n                if (gauge + 1e-9 < Math.max(1, Number(runtime148.harmonyCost ?? 100)))\n                    continue;\n            }\n            const last = owner.triggerState[trigger.id]?.lastTriggeredAt ?? -Infinity;",
    'harmony gate');
  s=mustReplace(s,
    "            if (effectiveChance <= 0 || !this.rng.chance(effectiveChance))\n                continue;\n            owner.triggerState[trigger.id] = { lastTriggeredAt: now };",
    "            if (effectiveChance <= 0 || !this.rng.chance(effectiveChance))\n                continue;\n            if (runtime148?.kind === 'gauge') {\n                const before = Math.max(0, Number(owner.marks['__confidant_v148_harmony'] ?? 0));\n                const after = Math.min(100, before + Math.max(0, Number(runtime148.gaugeGain ?? 0)) * Math.max(0, procCoefficient));\n                owner.marks['__confidant_v148_harmony'] = after;\n                if (before < 100 && after >= 100)\n                    this.log(now, 'resource', `Đồng Tâm đã viên mãn · có thể kích Tâm Ý Hợp Kích.`, owner.id, target.id, undefined, { confidantRuntime:'confidant.v148', confidantEvent:'gaugeReady', confidantId:runtime148.confidantId, confidantGauge:after });\n                continue;\n            }\n            if (runtime148?.kind === 'harmony') {\n                const cost = Math.max(1, Number(runtime148.harmonyCost ?? 100));\n                owner.marks['__confidant_v148_harmony'] = Math.max(0, Number(owner.marks['__confidant_v148_harmony'] ?? 0) - cost);\n            }\n            owner.triggerState[trigger.id] = { lastTriggeredAt: now };",
    'gauge and harmony spend');
  s=mustReplace(s,
    "            if (runtime) {\n                data.confidantRuntime = 'confidant.v87';",
    "            if (runtime) {\n                data.confidantRuntime = runtime148 ? 'confidant.v148' : 'confidant.v87';",
    'presentation runtime tag');
  s=mustReplace(s,
    "                data.oncePerBattle = Boolean(runtime.oncePerBattle);\n            }\n            if (runtime88) {",
    "                data.oncePerBattle = Boolean(runtime.oncePerBattle);\n                if (runtime148) data.confidantGauge = Math.max(0, Number(owner.marks['__confidant_v148_harmony'] ?? 0));\n            }\n            if (runtime88) {",
    'presentation gauge data');
  write(path,s);
}

// 4) Dedicated Gate A regression.
{
  const path='qa/tests/v148-confidant-rebuild-test.js';
  const t=`import assert from 'node:assert/strict';\nimport { CONFIDANTS_V87, CONFIDANT_FRAGMENT_PER_STAR_V148, CONFIDANT_GACHA_FRAGMENT_ROLL_V148, CONFIDANT_DUPLICATE_FRAGMENT_V148, migrateConfidantsV148, confidantStarsV148, confidantIntimacyCapV148, confidantEffectiveIntimacyV148, confidantFortuneSummaryV148, confidantCombatTriggersV148, confidantHeartPointSummaryV148 } from '../../dist/core/confidant-v87.js';\nimport { createCollectionProgressStateV12316, grantCollectionItemV12316, strengthenCollectionItemV12316, advanceCollectionItemV12316, spendCollectionConfidantHeartPointV148, collectionCultivationMultiplierV12316 } from '../../dist/core/collection-progression-v12316.js';\nimport { CombatEngine } from '../../dist/core/combat.js';\n\nassert.equal(CONFIDANTS_V87.length,8,'V148 keeps exactly eight confidants');\nassert.equal(CONFIDANT_FRAGMENT_PER_STAR_V148,10);assert.equal(CONFIDANT_GACHA_FRAGMENT_ROLL_V148,5);assert.equal(CONFIDANT_DUPLICATE_FRAGMENT_V148,10);\nconst legacy=createCollectionProgressStateV12316();legacy.items['companion.1']={owned:true,level:100,advance:4,specificFragments:0};legacy.confidantV87Migrated=true;migrateConfidantsV148(legacy);assert.equal(confidantStarsV148(legacy.items['companion.1']),20,'Duyên V migrates to 20 stars');assert.equal(confidantIntimacyCapV148(legacy.items['companion.1']),1100);assert.equal(migrateConfidantsV148(legacy).migrated,false,'migration is idempotent');\nassert.equal(confidantIntimacyCapV148({stars:100}),5100);assert.ok(confidantEffectiveIntimacyV148({level:5000})<1000,'infinite intimacy uses diminishing effective growth');\nconst s=createCollectionProgressStateV12316();s.items['companion.1']={owned:true,level:100,advance:0,stars:0,specificFragments:100,confidantHeartV148:{assist:0,guard:0,harmony:0,raw:0}};s.confidantV87Migrated=true;s.confidantV148Migrated=true;s.economyV12325={ascensionEssence:{companion:10}};\nfor(let i=0;i<4;i++)advanceCollectionItemV12316(s,'companion.1');assert.equal(s.items['companion.1'].stars,4);assert.equal(s.economyV12325.ascensionEssence.companion,10);advanceCollectionItemV12316(s,'companion.1');assert.equal(s.items['companion.1'].stars,5);assert.equal(s.economyV12325.ascensionEssence.companion,9,'5-star milestone consumes Duyên Tinh');\ns.genericFragments.companion=99999;const r=strengthenCollectionItemV12316(s,'companion.1',20);assert.ok(r.levelCap>=350);assert.equal(s.items['companion.1'].level,120);\ns.items['companion.1'].stars=20;const hp=confidantHeartPointSummaryV148(s.items['companion.1'],'companion.1');assert.equal(hp.earned,2);spendCollectionConfidantHeartPointV148(s,'companion.1','assist');assert.equal(confidantHeartPointSummaryV148(s.items['companion.1'],'companion.1').tree.assist,1);\nconst duplicateBefore=s.items['companion.1'].specificFragments;grantCollectionItemV12316(s,'companion.1');assert.equal(s.items['companion.1'].specificFragments-duplicateBefore,10,'duplicate grants fixed 10 fragments');\nconst fortune=confidantFortuneSummaryV148(s);assert.equal(fortune.cultivationPct,0);assert.equal(fortune.huntRewardPct,0);assert.equal(fortune.craftQualityPct,0);assert.ok(fortune.cultivationFlatPer15s>0);assert.ok(collectionCultivationMultiplierV12316(s)>=1);\nconst noActive={...s,activeCompanionId:undefined};assert.equal(confidantCombatTriggersV148(noActive).length,0,'only active confidant participates in combat');s.activeCompanionId='companion.1';s.items['companion.1'].level=300;s.items['companion.1'].stars=20;const triggers=confidantCombatTriggersV148(s);assert.ok(triggers.some(x=>x.runtimeV148?.kind==='gauge'));assert.ok(triggers.some(x=>x.runtimeV148?.kind==='harmony'&&!x.cooldown),'Harmony is gauge-driven, not cooldown-driven');\nconst engine=Object.create(CombatEngine.prototype);engine.rng={chance:()=>true};engine.log=()=>{};engine.resolveEffects=()=>{};const owner={id:'p',name:'P',triggers:[],triggerState:{},marks:{},baseStats:{maxHp:100,maxSpirit:100},hp:100,spirit:100};const target={id:'e',name:'E',baseStats:{maxHp:100,maxSpirit:100},hp:100,spirit:100};const gauge={id:'g',event:'OnHit',chancePct:100,effects:[],runtimeV148:{kind:'gauge',gaugeGain:60,confidantId:'companion.1'}};owner.triggers=[gauge];engine.fireTriggers(owner,target,'OnHit','ActiveHit',1,1);engine.fireTriggers(owner,target,'OnHit','ActiveHit',2,1);assert.equal(owner.marks.__confidant_v148_harmony,100,'gauge caps at 100');const harmony={id:'h',event:'OnHit',chancePct:100,effects:[],runtimeV87:{kind:'harmony',confidantId:'companion.1',confidantName:'Mộc Quỳnh',abilityName:'Hợp Kích',label:'TÂM Ý HỢP KÍCH'},runtimeV148:{kind:'harmony',harmonyCost:100}};owner.triggers=[harmony];engine.fireTriggers(owner,target,'OnHit','ActiveHit',3,1);assert.equal(owner.marks.__confidant_v148_harmony,0,'Harmony spends 100 gauge');\nconsole.log('V148 confidant rebuild Gate A PASS');\n`;
  write(path,t);
}

// Add V148 to canonical backend fast gate.
{
  const path='qa/runners/v140-backend-gates.js';let s=read(path);
  if(!s.includes("'v148-confidant-rebuild-test.js'"))s=mustReplace(s,"const FAST=['v140-cultivation-core-test.js','v147-spirit-beast-progression-test.js'","const FAST=['v140-cultivation-core-test.js','v147-spirit-beast-progression-test.js','v148-confidant-rebuild-test.js'",'backend fast gate');
  write(path,s);
}

console.log('V148 Gate A patch applied');
