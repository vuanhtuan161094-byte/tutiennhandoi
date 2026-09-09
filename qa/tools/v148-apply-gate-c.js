import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');const write=(p,s)=>fs.writeFileSync(p,s);
function rep(s,a,b,label){if(!s.includes(a))throw new Error(`V148 Gate C anchor missing: ${label}`);return s.replace(a,b);}

// Confidant authority: preserve earned legacy abilities and lock infinite raw until finite tree completion.
{
 const p='dist/core/confidant-v87.js';let s=read(p);
 s=rep(s,
 "  return {earned,used,available:Math.max(0,earned-used),tree,branches:(CONFIDANT_HEART_BRANCHES_V148[id]??[]).map(x=>({...x,level:tree[x.id]??0,maxLevel:CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148})),repeatableRaw:tree.raw};",
 "  const repeatableUnlocked=tree.assist>=CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148&&tree.guard>=CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148&&tree.harmony>=CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148;\n  return {earned,used,available:Math.max(0,earned-used),tree,branches:(CONFIDANT_HEART_BRANCHES_V148[id]??[]).map(x=>({...x,level:tree[x.id]??0,maxLevel:CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148})),repeatableRaw:tree.raw,repeatableUnlocked};",
 'repeatable unlock summary');
 s=rep(s,
 "  if(key!=='raw'&&tree[key]>=CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148)throw new Error('Nhánh Tâm Ý này đã đạt cấp tối đa.');\n  tree[key]+=1;p.confidantHeartV148=tree;",
 "  if(key!=='raw'&&tree[key]>=CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148)throw new Error('Nhánh Tâm Ý này đã đạt cấp tối đa.');\n  if(key==='raw'&&(tree.assist<CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148||tree.guard<CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148||tree.harmony<CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148))throw new Error('Cần hoàn thiện cả 3 nhánh Tâm Ý trước khi mở RAW lặp vô hạn.');\n  tree[key]+=1;p.confidantHeartV148=tree;",
 'raw branch gate');
 s=rep(s,
 "  const assistScale=relation*(stars>=10?1.12:1);",
 "  const legacyAssist=Boolean(p.legacyAssistUpgradeV148),legacyGuard=Boolean(p.legacyGuardUnlockedV148),legacyHarmony=Boolean(p.legacyHarmonyUnlockedV148);\n  const assistScale=relation*((stars>=10||legacyAssist)?1.12:1);",
 'legacy combat flags');
 s=rep(s,
 "cooldown:Math.max(4,d.assist.cooldown*(stars>=10?.82:1))",
 "cooldown:Math.max(4,d.assist.cooldown*((stars>=10||legacyAssist)?.82:1))",
 'legacy assist cooldown');
 s=rep(s,
 "  if(intimacy>=150&&stars>=3)out.push({id:`confidant.v148.${d.id}.guard`",
 "  if(legacyGuard||(intimacy>=150&&stars>=3))out.push({id:`confidant.v148.${d.id}.guard`",
 'legacy guard unlock');
 s=rep(s,
 "  if(intimacy>=250&&stars>=5){",
 "  if(legacyHarmony||(intimacy>=250&&stars>=5)){",
 'legacy harmony unlock');
 s=rep(s,
 "  return {schema:CONFIDANT_SCHEMA_V148,compatibilitySchema:CONFIDANT_SCHEMA_V87,id:d.id,code:d.code,name:d.name,title:d.title,fantasy:d.fantasy,asset:d.asset,combatStyle:d.combatStyle,intimacy,maxIntimacy,stars,maxStars:null,heartPower,active:state?.activeCompanionId===id,specialty:{...d.specialty,unlocked:intimacy>=30,strengthPct:specialty?.strengthPct??0},assist:{...d.assist,unlocked:true,upgraded:stars>=10},guard:{...d.guard,unlocked:intimacy>=150&&stars>=3,upgraded:stars>=20},harmony:{...d.harmony,unlocked:intimacy>=250&&stars>=5,upgraded:stars>=50,gaugeMax:CONFIDANT_HARMONY_GAUGE_MAX_V148,cooldown:undefined},heartTree,gaugeProfile:(CONFIDANT_GAUGE_PROFILE_V148[id]??[]).map(x=>({...x})),milestones:{guard:{stars:3,intimacy:150},harmony:{stars:5,intimacy:250},assistII:10,guardII:20,harmonyII:50,capstone:100}};",
 "  const legacyAssist=Boolean(p.legacyAssistUpgradeV148),legacyGuard=Boolean(p.legacyGuardUnlockedV148),legacyHarmony=Boolean(p.legacyHarmonyUnlockedV148);\n  return {schema:CONFIDANT_SCHEMA_V148,compatibilitySchema:CONFIDANT_SCHEMA_V87,id:d.id,code:d.code,name:d.name,title:d.title,fantasy:d.fantasy,asset:d.asset,combatStyle:d.combatStyle,intimacy,maxIntimacy,stars,maxStars:null,heartPower,active:state?.activeCompanionId===id,specialty:{...d.specialty,unlocked:intimacy>=30,strengthPct:specialty?.strengthPct??0},assist:{...d.assist,unlocked:true,upgraded:stars>=10||legacyAssist},guard:{...d.guard,unlocked:legacyGuard||(intimacy>=150&&stars>=3),upgraded:stars>=20},harmony:{...d.harmony,unlocked:legacyHarmony||(intimacy>=250&&stars>=5),upgraded:stars>=50,gaugeMax:CONFIDANT_HARMONY_GAUGE_MAX_V148,cooldown:undefined},heartTree,gaugeProfile:(CONFIDANT_GAUGE_PROFILE_V148[id]??[]).map(x=>({...x})),legacyPreserved:{assist:legacyAssist,guard:legacyGuard,harmony:legacyHarmony},milestones:{guard:{stars:3,intimacy:150},harmony:{stars:5,intimacy:250},assistII:10,guardII:20,harmonyII:50,capstone:100}};",
 'legacy view flags');
 s=rep(s,
 "    if(!Number.isFinite(Number(p.stars)))p.stars=clampInt(p.advance,0,4)*5;\n    else p.stars=Math.max(0,Math.floor(Number(p.stars)));",
 "    const hadStars=Number.isFinite(Number(p.stars)),legacyLevel=Math.max(1,Math.floor(Number(p.level)||1)),legacyFate=clampInt(p.advance,0,4)+1;\n    if(!hadStars){\n      if(legacyLevel>=50)p.legacyAssistUpgradeV148=true;\n      if(legacyLevel>=70&&legacyFate>=2)p.legacyGuardUnlockedV148=true;\n      if(legacyLevel>=100&&legacyFate>=5)p.legacyHarmonyUnlockedV148=true;\n      p.stars=clampInt(p.advance,0,4)*5;\n    } else p.stars=Math.max(0,Math.floor(Number(p.stars)));",
 'migration preservation flags');
 write(p,s);
}

// Collection authority: all specialty consumers use V148 and old exported summary is patched to V148.
{
 const p='dist/core/collection-progression-v12316.js';let s=read(p);
 s=s.replaceAll('activeConfidantSpecialtyV87(state)','activeConfidantSpecialtyV148(state)');
 s=rep(s,'export function collectionSummaryV12316(container, now = Date.now()) {','function collectionSummaryV12316LegacyV148(container, now = Date.now()) {','legacy summary rename');
 s += `\n\n// V148 canonical compatibility read-model: legacy V12316 callers still receive current Tri Kỷ progression.\nexport function collectionSummaryV12316(container,now=Date.now()){\n  const out=collectionSummaryV12316LegacyV148(container,now);\n  const state=cloneCollectionProgressStateV12316(container?.collectionV12316);migrateConfidantsV148(state);\n  const cat=out.categories?.find(x=>x.category==='companion');\n  if(cat){\n    cat.confidantFortune=confidantFortuneSummaryV148(state);cat.activeSpecialty=activeConfidantSpecialtyV148(state);\n    cat.items=cat.items.map(item=>{\n      const p=state.items?.[item.id]??{owned:false,level:1,stars:0,advance:0,specificFragments:0};const owned=Boolean(p.owned),view=confidantViewV148(state,item.id),cap=confidantIntimacyCapV148(p);\n      return {...item,progress:{...p},confidant:view,active:state.activeCompanionId===item.id,strengthenCost:owned&&p.level<cap?facilityDiscountedCostV99(state,'companion',confidantIntimacyCostV148(p)):undefined,advanceCost:owned?CONFIDANT_FRAGMENT_PER_STAR_V148:undefined};\n    });\n  }\n  const summary=collectionConfidantV87Summary(state);out.confidantV87=summary;out.confidantV148=summary;return out;\n}\n`;
 write(p,s);
}

// Dev max surfaces target the finite 100★ capstone milestone, not retired Duyên V.
{
 const p='dist/core/gacha-collection-economy-v12325.js';let s=read(p);
 s=rep(s,
 "        p.specificFragments = Math.max(p.specificFragments, 9999);",
 "        p.specificFragments = Math.max(p.specificFragments, 9999);\n        if (d.category === 'companion') { p.stars = 100; p.level = 5100; p.advance = 4; p.confidantV148Migrated = true; p.confidantHeartV148 ??= { assist: 10, guard: 10, harmony: 10, raw: 0 }; }",
 'economy dev max companion');
 write(p,s);
}
{
 const p='dist/core/collection-workshop-gacha-v12326.js';let s=read(p);
 s=rep(s,
 "        p.specificFragments = 9999;\n    }\n} return e; }",
 "        p.specificFragments = 9999;\n        if (d.category === 'companion') { p.stars = 100; p.level = 5100; p.advance = 4; p.confidantV148Migrated = true; p.confidantHeartV148 ??= { assist: 10, guard: 10, harmony: 10, raw: 0 }; }\n    }\n} return e; }",
 'workshop dev max companion');
 s=rep(s,"return { schema: COLLECTION_WORKSHOP_SCHEMA_V12326, artifactV88: structuredClone(legacy.artifactV88), active: structuredClone(legacy.active), confidantV87: structuredClone(legacy.confidantV87),",
 "return { schema: COLLECTION_WORKSHOP_SCHEMA_V12326, artifactV88: structuredClone(legacy.artifactV88), active: structuredClone(legacy.active), confidantV87: structuredClone(legacy.confidantV87), confidantV148: structuredClone(legacy.confidantV148 ?? legacy.confidantV87),",
 'workshop root V148 summary');
 write(p,s);
}

// Remove retired progression wording and correctly lock repeatable raw UI.
{
 const p='app.js';let s=read(p);
 s=rep(s,"subtitle:'8 Tri Kỷ · 1 Đồng Hành · Thân Mật 1–100 + Duyên I–V · Sở Trường, Trợ Chiến, Hộ Đạo và Tâm Ý.'",
 "subtitle:'8 Tri Kỷ · 1 Đồng Hành · Thân Mật ∞ + Duyên ★∞ · Tâm Lực, Đồng Tâm, Tâm Ý và Sở Trường.'",
 'Tri Kỷ facility subtitle');
 s=rep(s,"${Number(heart.available||0)<=0?'disabled':''}>+1 Raw</button>","${Number(heart.available||0)<=0||!heart.repeatableUnlocked?'disabled':''}>+1 Raw</button>",'repeatable raw UI lock');
 write(p,s);
}

// Closure regression additions.
{
 const p='qa/tests/v148-confidant-rebuild-test.js';let s=read(p);
 s=rep(s,"import { CONFIDANTS_V87, CONFIDANT_FRAGMENT_PER_STAR_V148, CONFIDANT_GACHA_FRAGMENT_ROLL_V148, CONFIDANT_DUPLICATE_FRAGMENT_V148, migrateConfidantsV148, confidantStarsV148, confidantIntimacyCapV148, confidantEffectiveIntimacyV148, confidantFortuneSummaryV148, confidantCombatTriggersV148, confidantHeartPointSummaryV148 } from '../../dist/core/confidant-v87.js';",
 "import { CONFIDANTS_V87, CONFIDANT_FRAGMENT_PER_STAR_V148, CONFIDANT_GACHA_FRAGMENT_ROLL_V148, CONFIDANT_DUPLICATE_FRAGMENT_V148, migrateConfidantsV148, confidantStarsV148, confidantIntimacyCapV148, confidantEffectiveIntimacyV148, confidantFortuneSummaryV148, confidantCombatTriggersV148, confidantHeartPointSummaryV148, confidantViewV148 } from '../../dist/core/confidant-v87.js';",
 'test V148 view import');
 s=rep(s,"import { createCollectionProgressStateV12316, grantCollectionItemV12316, strengthenCollectionItemV12316, advanceCollectionItemV12316, spendCollectionConfidantHeartPointV148, collectionCultivationMultiplierV12316 } from '../../dist/core/collection-progression-v12316.js';",
 "import { createCollectionProgressStateV12316, grantCollectionItemV12316, strengthenCollectionItemV12316, advanceCollectionItemV12316, spendCollectionConfidantHeartPointV148, collectionCultivationMultiplierV12316, collectionSummaryV12316 } from '../../dist/core/collection-progression-v12316.js';",
 'test collection summary import');
 s=rep(s,"assert.equal(confidantIntimacyCapV148({stars:100}),5100);assert.ok(confidantEffectiveIntimacyV148({level:5000})<1000,'infinite intimacy uses diminishing effective growth');",
 "assert.equal(confidantIntimacyCapV148({stars:100}),5100);assert.ok(confidantEffectiveIntimacyV148({level:5000})<1000,'infinite intimacy uses diminishing effective growth');\nassert.equal(confidantViewV148(legacy,'companion.1').harmony.unlocked,true,'legacy max Duyên V/Thân Mật100 keeps earned Harmony');\nconst legacyGuard=createCollectionProgressStateV12316();legacyGuard.items['companion.2']={owned:true,level:70,advance:1,specificFragments:0};legacyGuard.confidantV87Migrated=true;migrateConfidantsV148(legacyGuard);assert.equal(confidantViewV148(legacyGuard,'companion.2').guard.unlocked,true,'legacy Guard unlock is preserved');",
 'legacy migration tests');
 s=rep(s,"s.items['companion.1'].stars=20;const hp=confidantHeartPointSummaryV148(s.items['companion.1'],'companion.1');assert.equal(hp.earned,2);spendCollectionConfidantHeartPointV148(s,'companion.1','assist');assert.equal(confidantHeartPointSummaryV148(s.items['companion.1'],'companion.1').tree.assist,1);",
 "s.items['companion.1'].stars=20;const hp=confidantHeartPointSummaryV148(s.items['companion.1'],'companion.1');assert.equal(hp.earned,2);assert.equal(hp.repeatableUnlocked,false);assert.throws(()=>spendCollectionConfidantHeartPointV148(s,'companion.1','raw'),/hoàn thiện cả 3 nhánh/);spendCollectionConfidantHeartPointV148(s,'companion.1','assist');assert.equal(confidantHeartPointSummaryV148(s.items['companion.1'],'companion.1').tree.assist,1);",
 'raw branch test');
 s=rep(s,"const eco=collectionEconomySummaryV12325(s,undefined,Date.now(),117),cc=eco.categories.find(x=>x.category==='companion'),mq=cc.items.find(x=>x.id==='companion.1');assert.equal(mq.confidant.schema,'confidant.v148');assert.equal(mq.advanceCost,10);assert.equal(mq.confidant.maxIntimacy,1100);",
 "const eco=collectionEconomySummaryV12325(s,undefined,Date.now(),117),cc=eco.categories.find(x=>x.category==='companion'),mq=cc.items.find(x=>x.id==='companion.1');assert.equal(mq.confidant.schema,'confidant.v148');assert.equal(mq.advanceCost,10);assert.equal(mq.confidant.maxIntimacy,1100);\nconst container={collectionV12316:s},compat=collectionSummaryV12316(container),compatMq=compat.categories.find(x=>x.category==='companion').items.find(x=>x.id==='companion.1');assert.equal(compatMq.confidant.schema,'confidant.v148','legacy summary route returns V148 confidant read model');assert.equal(compatMq.advanceCost,10);",
 'compat read model test');
 s=rep(s,"assert.match(app,/100 Đồng Tâm/);","assert.match(app,/100 Đồng Tâm/);assert.doesNotMatch(app,/Thân Mật 1–100 \+ Duyên I–V/);",'retired UI wording test');
 write(p,s);
}
console.log('V148 Gate C closure patch applied');
