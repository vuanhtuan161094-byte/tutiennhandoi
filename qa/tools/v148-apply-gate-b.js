import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');const write=(p,s)=>fs.writeFileSync(p,s);
function rep(s,a,b,label){if(!s.includes(a))throw new Error(`V148 Gate B anchor missing: ${label}`);return s.replace(a,b);}
function regexRep(s,re,b,label){if(!re.test(s))throw new Error(`V148 Gate B regex anchor missing: ${label}`);return s.replace(re,b);}

// Economy read model: dynamic intimacy cap, infinite stars, raw fortune.
{
 const p='dist/core/gacha-collection-economy-v12325.js';let s=read(p);
 s=rep(s,"import { SPIRIT_BEAST_FRAGMENT_PER_STAR_V147, spiritBeastLevelCapV147, spiritBeastStarEssenceCostV147, spiritBeastViewV147 } from './spirit-beast-v147.js';",
 "import { SPIRIT_BEAST_FRAGMENT_PER_STAR_V147, spiritBeastLevelCapV147, spiritBeastStarEssenceCostV147, spiritBeastViewV147 } from './spirit-beast-v147.js';\nimport { CONFIDANT_FRAGMENT_PER_STAR_V148, migrateConfidantsV148, confidantStarsV148, confidantIntimacyCapV148, confidantIntimacyCostV148, confidantStarEssenceCostV148, confidantViewV148, confidantFortuneSummaryV148, activeConfidantSpecialtyV148 } from './confidant-v87.js';",
 'economy V148 import');
 s=rep(s,"export function collectionEconomySummaryV12325(state,foundation,now=Date.now(),realmOrder=10){\n  const out=collectionEconomySummaryV12325LegacyV146(state,foundation,now,realmOrder);",
 "export function collectionEconomySummaryV12325(state,foundation,now=Date.now(),realmOrder=10){\n  migrateConfidantsV148(state);\n  const out=collectionEconomySummaryV12325LegacyV146(state,foundation,now,realmOrder);",
 'summary migration');
 s=rep(s,"  cat.items=cat.items.map(item=>{","  cat.items=cat.items.map(item=>{",'pet map anchor');
 s=rep(s,"  });\n  return out;\n}",`  });
  const companionCat=out.categories?.find(x=>x.category==='companion');
  if(companionCat){
    const fortune=confidantFortuneSummaryV148(state),activeSpecialty=activeConfidantSpecialtyV148(state);
    companionCat.confidantFortune=fortune;companionCat.activeSpecialty=activeSpecialty;
    companionCat.items=companionCat.items.map(item=>{
      const progress={...(item.progress??{})},stars=confidantStarsV148(progress);progress.stars=stars;
      const live={...progress,stars},viewState={items:{[item.id]:live},activeCompanionId:state?.activeCompanionId};
      const view=confidantViewV148(viewState,item.id),owned=Boolean(progress.owned),levelCap=confidantIntimacyCapV148(live);
      return {...item,progress,confidant:view,active:state?.activeCompanionId===item.id,
        strengthenCost:owned&&Number(progress.level??1)<levelCap?facilityDiscountedCostV99(state,'companion',confidantIntimacyCostV148(live)):undefined,
        advanceCost:owned?CONFIDANT_FRAGMENT_PER_STAR_V148:undefined,
        ascensionCost:owned?confidantStarEssenceCostV148(stars):undefined};
    });
    out.confidantV87={fortune,activeSpecialty};out.confidantV148={fortune,activeSpecialty};
  }
  return out;
}`,'summary companion append');
 write(p,s);
}

// Explicit eight-confidant gacha: rarity is probability, not fragment bundle size.
{
 const p='dist/core/collection-workshop-gacha-v12326.js';let s=read(p);
 s=rep(s,"const ROLE = { manual: 'Nền chỉ số · Tu Vi · utility', heart: 'Build Bản Đạo · stat + mechanic', artifact: '2/3/4 slot · Bảo Tính + Pháp Kỹ · Bảo Khí', relic: '1 slot · Chí Bảo đổi luật build', pet: 'Trợ chiến · 1 Nội Tại + 3 kỹ năng · Linh Khế toàn bộ', companion: 'Thân Mật 1–100 · Duyên I–V · Sở Trường · Trợ Chiến/Hộ Đạo/Tâm Ý', bloodline: 'Độ Thuần · Bậc Huyết · chỉ số huyết mạch', physique: 'Cảnh Luyện Thể · chỉ số thân thể' };",
 "const ROLE = { manual: 'Nền chỉ số · Tu Vi · utility', heart: 'Build Bản Đạo · stat + mechanic', artifact: '2/3/4 slot · Bảo Tính + Pháp Kỹ · Bảo Khí', relic: '1 slot · Chí Bảo đổi luật build', pet: 'Trợ chiến · Sao vô hạn · Linh Khế active', companion: 'Thân Mật ∞ · Duyên ★∞ · Tâm Lực · Đồng Tâm · Tâm Ý', bloodline: 'Độ Thuần · Bậc Huyết · chỉ số huyết mạch', physique: 'Cảnh Luyện Thể · chỉ số thân thể' };",
 'role label');
 s=rep(s,"import { SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147, SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147 } from './spirit-beast-v147.js';",
 "import { SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147, SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147 } from './spirit-beast-v147.js';\nimport { CONFIDANT_GACHA_FRAGMENT_ROLL_V148, CONFIDANT_DUPLICATE_FRAGMENT_V148 } from './confidant-v87.js';",
 'workshop V148 import');
 s=rep(s,"export function gachaCollectionV12326(state,inventory,banner,count,seed,usePremium=false,knownHeartPassiveIds=[],realmOrder=117){\n  return normalizePetPullsV147(state,gachaCollectionV12326LegacyV146(state,inventory,banner,count,seed,usePremium,knownHeartPassiveIds,realmOrder));\n}",
 `function gachaCollectionV12326V147Canonical(state,inventory,banner,count,seed,usePremium=false,knownHeartPassiveIds=[],realmOrder=117){
  return normalizePetPullsV147(state,gachaCollectionV12326LegacyV146(state,inventory,banner,count,seed,usePremium,knownHeartPassiveIds,realmOrder));
}

export const CONFIDANT_GACHA_WEIGHTS_V148=Object.freeze({
  'companion.1':8,'companion.2':15,'companion.3':8,'companion.4':15,'companion.5':22,'companion.6':22,'companion.7':2,'companion.8':8,
});
function weightedConfidantV148(rng,minGrade){
  const floor=minGrade?GRADE_ORDER.indexOf(minGrade):0;
  const pool=collectionCatalogV12326('companion').filter(x=>GRADE_ORDER.indexOf(x.grade)>=floor);
  const total=pool.reduce((n,x)=>n+(CONFIDANT_GACHA_WEIGHTS_V148[x.id]??0),0);let r=rng.next()*Math.max(1,total);
  for(const d of pool){r-=CONFIDANT_GACHA_WEIGHTS_V148[d.id]??0;if(r<=0)return d;}return pool.at(-1);
}
function gachaConfidantV148(state,inventory,banner,count,seed,usePremium=false){
  const def=GACHA_BANNERS_V12326.find(x=>x.id===banner);if(!def||def.category!=='companion')throw new Error('Banner Tri Kỷ không tồn tại.');
  const e=ensureCollectionWorkshopV12326(state),t=e.tracks[banner];count=Math.max(1,Math.min(10,Math.floor(count)));
  const cost=count===10?1440:160*count,key=usePremium?'immortalJade':'boundImmortalJade';if(state.currencies[key]<cost)throw new Error('Không đủ Tiên Ngọc để Duyên Khế Tri Kỷ.');state.currencies[key]-=cost;
  const rng=new SeededRng(seed>>>0),results=[];
  for(let i=0;i<count;i++){
    let pity,minGrade,kind,item,grade;
    if(t.sinceImmortal>=119){pity='120';minGrade='immortal';kind=rng.next()<.08?'item':'fragment';}
    else if(t.sinceHeaven>=59){pity='60';minGrade='heaven';kind=rng.next()<.08?'item':'fragment';}
    else if(t.sinceMystic>=9){pity='10';minGrade='mystic';kind=rng.next()<.08?'item':'fragment';}
    else {const r=rng.next();kind=r<.74?'material':r<.82?'breakthrough':r<.98?'fragment':'item';}
    let row={category:'companion',categoryLabel:CATEGORY_LABEL.companion,kind,pity};
    if(kind==='material'){
      const amount=strengthAmount('companion');addStrengthMaterialV12326(state,inventory,'companion',amount);row={...row,name:MATERIAL_NAME_V12326.companion,amount};
    }else if(kind==='breakthrough'){
      const amount=1;addBreakMaterialV12326(state,inventory,'companion',amount);row={...row,name:BREAK_NAME_V12326.companion,amount};
    }else{
      item=weightedConfidantV148(rng,minGrade);grade=item.grade;
      if(kind==='fragment'){
        addFragments(state,e,item,CONFIDANT_GACHA_FRAGMENT_ROLL_V148);row={...row,id:item.id,name:item.name,grade:item.grade,gradeLabel:item.gradeLabel,amount:CONFIDANT_GACHA_FRAGMENT_ROLL_V148,fragments:CONFIDANT_GACHA_FRAGMENT_ROLL_V148,first:false,featured:item.id==='companion.7',rateUpEligible:false};
      }else{
        const g=directGrant(state,e,item,new Set());row={...row,id:item.id,name:item.name,grade:item.grade,gradeLabel:item.gradeLabel,amount:1,fragments:g.first?0:CONFIDANT_DUPLICATE_FRAGMENT_V148,first:g.first,featured:item.id==='companion.7',rateUpEligible:false};
      }
    }
    updateTrack(t,grade);results.push(row);e.history.unshift({pull:t.pulls,bannerId:banner,category:'companion',kind:row.kind,itemId:row.id,name:row.name,grade:row.grade,gradeLabel:row.gradeLabel,amount:row.amount,first:row.first,featured:row.featured,currency:key});
  }
  e.history=e.history.slice(0,120);return {schema:COLLECTION_WORKSHOP_SCHEMA_V12326,bannerId:banner,bannerName:def.name,cost,currency:key,results,track:{...t},companionPool:'explicit-v148',pity:{mystic:\`\${t.sinceMystic}/10\`,heaven:\`\${t.sinceHeaven}/60\`,immortal:\`\${t.sinceImmortal}/120\`,featuredGuaranteed:false}};
}
export function gachaCollectionV12326(state,inventory,banner,count,seed,usePremium=false,knownHeartPassiveIds=[],realmOrder=117){
  if(banner==='banner.companion')return gachaConfidantV148(state,inventory,banner,count,seed,usePremium);
  return gachaCollectionV12326V147Canonical(state,inventory,banner,count,seed,usePremium,knownHeartPassiveIds,realmOrder);
}`,'gacha V148 override');
 write(p,s);
}

// Raw Phúc Duyên consumers + Tâm Ý action in the Session authority.
{
 const p='dist/core/session.js';let s=read(p);
 s=rep(s,"collectionConfidantV87Summary, collectionDefinitionV12316, syncCollectionManualTreeV127, collectionSummaryV12316 as deriveCollectionSummaryV12316, cloneCollectionProgressStateV12316, ensureCollectionProgressStateV12316,",
 "collectionConfidantV87Summary, collectionDefinitionV12316, spendCollectionConfidantHeartPointV148 as spendConfidantHeartPointProgressV148, syncCollectionManualTreeV127, collectionSummaryV12316 as deriveCollectionSummaryV12316, cloneCollectionProgressStateV12316, ensureCollectionProgressStateV12316,",
 'session import');
 s=s.replaceAll("huntRewardPct = confidant.fortune.huntRewardPct + (specialty?.unlocked && specialty.id === 'hunt' ? specialty.strengthPct : 0), huntRewardMultiplier = 1 + huntRewardPct / 100;",
 "huntRewardPct = specialty?.unlocked && specialty.id === 'hunt' ? specialty.strengthPct : 0, huntRewardMultiplier = 1 + huntRewardPct / 100, confidantResourceFlat = Math.max(0, Number(confidant.fortune.resourceMastery)||0);");
 s=rep(s,"const spiritStones = this.fateSpiritStoneGainV4(deterministicJitteredTotalV77((kills * farm.spiritStonesPerKill + eliteKills * farm.spiritStonesPerKill * 2.5) * huntRewardMultiplier * regularRewardMultiplier, rng, .075));",
 "const spiritStones = this.fateSpiritStoneGainV4(deterministicJitteredTotalV77((kills * farm.spiritStonesPerKill + eliteKills * farm.spiritStonesPerKill * 2.5) * huntRewardMultiplier * regularRewardMultiplier + kills * confidantResourceFlat, rng, .075));",
 'virtual hunt raw');
 s=rep(s,"spiritStones = this.fateSpiritStoneGainV4(Math.max(0, Math.round(result.spiritStones * map.rewardDepthMultiplier * economyBandScale(map.majorRealmIndex) * fateMods.rewardMultiplier * fateEvent.rewardMultiplier * farmReward.multiplier * huntRewardMultiplier)) + fateEvent.spiritStoneDelta);",
 "spiritStones = this.fateSpiritStoneGainV4(Math.max(0, Math.round(result.spiritStones * map.rewardDepthMultiplier * economyBandScale(map.majorRealmIndex) * fateMods.rewardMultiplier * fateEvent.rewardMultiplier * farmReward.multiplier * huntRewardMultiplier)) + fateEvent.spiritStoneDelta + confidantResourceFlat);",
 'real hunt raw');
 s=rep(s,"fortuneQuality = Math.max(0, confidant.fortune.craftQualityPct);","fortuneQuality = Math.max(0, Number(confidant.fortune.craftMastery)||0);",'alchemy raw craft');
 s=rep(s,"+ Math.max(0, confidant.fortune.craftQualityPct), masteryGainMultiplier:","+ Math.max(0, Number(confidant.fortune.craftMastery)||0), masteryGainMultiplier:",'forging raw craft');
 s=rep(s,"    collectionSummaryV12316(nowUnixMs = Date.now()) {",
 `    spendConfidantHeartPointV148(itemId, branch) {
        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
        const state = ensureCollectionProgressStateV12316(this.stateValue);
        const result = spendConfidantHeartPointProgressV148(state, itemId, branch);
        this.actionIndexValue += 1;
        return { ...result, collection: this.collectionEconomyV12326() };
    }
    collectionSummaryV12316(nowUnixMs = Date.now()) {`,'session heart method');
 write(p,s);
}

// API/action path for Tâm Ý tree.
{
 let p='dist/core/gameplay.js',s=read(p);s=rep(s,"    collectionAdvanceV12325(itemId) { return this.session.advanceCollectionV12325(itemId); }","    collectionAdvanceV12325(itemId) { return this.session.advanceCollectionV12325(itemId); }\n    confidantHeartV148(itemId, branch) { return this.session.spendConfidantHeartPointV148(itemId, branch); }",'gameplay heart');write(p,s);
 p='dist/core/game-api.js';s=read(p);s=rep(s,"    advanceCollectionV12325(itemId) { return this.#game.collectionAdvanceV12325(itemId); }","    advanceCollectionV12325(itemId) { return this.#game.collectionAdvanceV12325(itemId); }\n    spendConfidantHeartV148(itemId, branch) { return this.#game.confidantHeartV148(itemId, branch); }",'api heart');write(p,s);
 p='standalone-runtime.js';s=read(p);s=rep(s,"      case'collectionAdvanceV12325':result=rt.api.advanceCollectionV12325(String(body.itemId??''));break;","      case'collectionAdvanceV12325':result=rt.api.advanceCollectionV12325(String(body.itemId??''));break;\n      case'confidantHeartV148':result=rt.api.spendConfidantHeartV148(String(body.itemId??''),String(body.branch??''));break;",'runtime heart action');write(p,s);
}

// Presentation module stays same filename to preserve frontend module budget.
{
 const p='modules/confidant-presentation-v87.js';let s=read(p);
 s=rep(s,"<small>Thân Mật ${Number(c.intimacy||1)}/100 · Duyên ${esc(c.fateLabel||'I')} · ${esc(c.specialty?.name||'Sở Trường')}</small>","<small>Thân Mật ${Number(c.intimacy||1)}/${Number(c.maxIntimacy||100)} · Duyên ★${Number(c.stars||0)} · Tâm Lực ${Number(c.heartPower||0).toLocaleString('vi-VN')}</small>",'HUD V148');
 s=rep(s,"if(!c||event?.confidantRuntime!=='confidant.v87')return false;","if(!c||!['confidant.v87','confidant.v148'].includes(event?.confidantRuntime))return false;",'presentation accept V148');
 s=rep(s,"metadata:{feature:'ConfidantV87'","metadata:{feature:'ConfidantV148'",'presentation metadata');
 s=rep(s,"payload?.confidantRuntime==='confidant.v87'","['confidant.v87','confidant.v148'].includes(payload?.confidantRuntime)",'presentation event bind');
 write(p,s);
}

// Main collection UI: V148 view, dynamic cap/stars, Tâm Ý controls.
{
 const p='app.js';let s=read(p);
 s=regexRep(s,/function v87ConfidantPanel\(selected,cat\)\{[\s\S]*?\n\}\n\nfunction v88ArtifactSlotUnlockLabel/,
 `function v87ConfidantPanel(selected,cat){
  const c=selected?.confidant;if(!c)return'';
  const fortune=cat?.confidantFortune||model.collectionEconomy?.confidantV148?.fortune||model.collectionEconomy?.confidantV87?.fortune||{},special=cat?.activeSpecialty||model.collectionEconomy?.confidantV148?.activeSpecialty||model.collectionEconomy?.confidantV87?.activeSpecialty;
  const lock=(ok,text)=>ok?\`<span class="ready">Đã mở</span>\`:\`<span class="locked">\${esc(text)}</span>\`,heart=c.heartTree||{},branches=heart.branches||[];
  const tree=branches.map(b=>\`<article><span>\${esc(b.name)} · \${num(b.level||0)}/\${num(b.maxLevel||10)}</span><small>\${esc(b.description||'')}</small><button class="button ghost" data-confidant-heart-v148="\${esc(c.id)}" data-confidant-heart-branch="\${esc(b.id)}" \${Number(heart.available||0)<=0||Number(b.level||0)>=Number(b.maxLevel||10)?'disabled':''}>+1 Tâm Ý</button></article>\`).join('');
  return \`<section class="v87-confidant-panel" data-confidant-v148="\${esc(c.id)}"><header><div><span>TRI KỶ V148 · \${c.active?'ĐỒNG HÀNH':'SỞ HỮU'}</span><h3>\${esc(c.name)}</h3><small>\${esc(c.title||'')}</small></div><b>Thân Mật \${num(c.intimacy||1)}/\${num(c.maxIntimacy||100)} · Duyên ★\${num(c.stars||0)}</b></header><div class="v86-beast-stats"><i><small>TÂM LỰC</small><b>\${num(c.heartPower||0)}</b></i><i><small>ĐIỂM TÂM Ý</small><b>\${num(heart.available||0)}/\${num(heart.earned||0)}</b></i><i><small>ĐỒNG TÂM</small><b>0 → 100</b></i></div><div class="v87-confidant-grid"><article><span>SỞ TRƯỜNG</span><b>\${esc(c.specialty?.name||'Chưa mở')}</b><small>\${esc(c.specialty?.description||'')}</small>\${lock(c.specialty?.unlocked,'Mở ở Thân Mật 30')}\${c.specialty?.unlocked?\`<em>Hiệu lực có trần \${num(c.specialty?.strengthPct||0,2)}%</em>\`:''}</article><article><span>TRỢ CHIẾN</span><b>\${esc(c.assist?.name||'')}</b><small>\${esc(c.assist?.description||'')}</small>\${c.assist?.upgraded?'<em>10★ · đã cường hóa</em>':''}</article><article><span>HỘ ĐẠO · 1 LẦN/TRẬN</span><b>\${esc(c.guard?.name||'')}</b><small>\${esc(c.guard?.description||'')}</small>\${lock(c.guard?.unlocked,'Cần Thân Mật 150 + 3★')}</article><article><span>TÂM Ý HỢP KÍCH</span><b>\${esc(c.harmony?.name||'')}</b><small>\${esc(c.harmony?.description||'')}</small>\${lock(c.harmony?.unlocked,'Cần Thân Mật 250 + 5★')}<em>Không cooldown · đủ 100 Đồng Tâm tự kích</em></article></div><div class="v87-confidant-grid">\${tree}<article><span>RAW LẶP VÔ HẠN · Lv\${num(heart.repeatableRaw||0)}</span><small>Sau các nhánh mechanic, Điểm Tâm Ý tiếp tục tăng Tâm Lực raw.</small><button class="button ghost" data-confidant-heart-v148="\${esc(c.id)}" data-confidant-heart-branch="raw" \${Number(heart.available||0)<=0?'disabled':''}>+1 Raw</button></article></div><div class="v87-fortune-overview"><strong>Phúc Duyên RAW · \${num(fortune.owned||0)}/\${num(fortune.total||8)} Tri Kỷ</strong><small>Tu Vi +\${num(fortune.cultivationFlatPer15s||0)} /15s · Tài nguyên +\${num(fortune.resourceMastery||0)} raw · Chế tác +\${num(fortune.craftMastery||0)} raw</small>\${c.active&&special?.unlocked?\`<em>Đồng Hành: \${esc(special.name)} · hiệu lực có trần \${num(special.strengthPct||0,2)}%</em>\`:''}</div></section>\`;
}

function v88ArtifactSlotUnlockLabel`, 'confidant panel');
 // Dynamic controls in main collection surface.
 s=regexRep(s,/selected\.category==='companion'\?`<button class="button ghost" data-collection-strengthen-v12325="\$\{esc\(selected\.id\)\}"[\s\S]*?<\/button>`:selected\.category==='artifact'/,
 `selected.category==='companion'?\`<button class="button ghost" data-collection-strengthen-v12325="\${esc(selected.id)}" \${Number(sp.level||1)>=Number(selected.confidant?.maxIntimacy||100)||genericOwned<strengthenCost?'disabled':''}>Tăng Thân Mật · \${num(strengthenCost)} \${esc(cat.genericFragmentName||'Đồng Tâm Ngọc')}</button><button class="button gold" data-collection-advance-v12325="\${esc(selected.id)}" \${fragmentOwned<advanceCost||essenceOwned<essenceCost?'disabled':''}>Tăng Duyên ★\${num(selected.confidant?.stars||0)} → ★\${num(Number(selected.confidant?.stars||0)+1)} · \${num(advanceCost)} Mảnh\${essenceCost?\` + \${num(essenceCost)} \${esc(cat.ascensionName||'Duyên Tinh')}\`:''}</button>\`:selected.category==='artifact'`, 'companion controls');
 s=rep(s,"selected.category==='companion'?`Thân Mật ${num(selected.confidant?.intimacy||sp.level||1)}/100 · Duyên ${esc(selected.confidant?.fateLabel||'I')}`:","selected.category==='companion'?`Thân Mật ${num(selected.confidant?.intimacy||sp.level||1)}/${num(selected.confidant?.maxIntimacy||100)} · Duyên ★${num(selected.confidant?.stars||0)} · Tâm Lực ${num(selected.confidant?.heartPower||0)}`:",'main progress');
 s=rep(s,"  qsaV129('[data-collection-advance-v12325]').forEach(btn=>btn.onclick=()=>action({action:'collectionAdvanceV12325',itemId:btn.dataset.collectionAdvanceV12325}));",
 "  qsaV129('[data-collection-advance-v12325]').forEach(btn=>btn.onclick=()=>action({action:'collectionAdvanceV12325',itemId:btn.dataset.collectionAdvanceV12325}));\n  qsaV129('[data-confidant-heart-v148]').forEach(btn=>btn.onclick=()=>action({action:'confidantHeartV148',itemId:btn.dataset.confidantHeartV148,branch:btn.dataset.confidantHeartBranch}));",'heart UI action');
 write(p,s);
}

// Expand dedicated test to cover Gate B wiring and explicit gacha.
{
 const p='qa/tests/v148-confidant-rebuild-test.js';let s=read(p);
 s=rep(s,"import { CombatEngine } from '../../dist/core/combat.js';",
 "import { CombatEngine } from '../../dist/core/combat.js';\nimport { collectionEconomySummaryV12325 } from '../../dist/core/gacha-collection-economy-v12325.js';\nimport { gachaCollectionV12326, CONFIDANT_GACHA_WEIGHTS_V148 } from '../../dist/core/collection-workshop-gacha-v12326.js';\nimport fs from 'node:fs';",'test imports');
 s=rep(s,"console.log('V148 confidant rebuild Gate A PASS');",
 `const eco=collectionEconomySummaryV12325(s,undefined,Date.now(),117),cc=eco.categories.find(x=>x.category==='companion'),mq=cc.items.find(x=>x.id==='companion.1');assert.equal(mq.confidant.schema,'confidant.v148');assert.equal(mq.advanceCost,10);assert.equal(mq.confidant.maxIntimacy,1100);
assert.equal(Object.values(CONFIDANT_GACHA_WEIGHTS_V148).reduce((a,b)=>a+b,0),100);assert.equal(CONFIDANT_GACHA_WEIGHTS_V148['companion.7'],2);assert.ok(CONFIDANT_GACHA_WEIGHTS_V148['companion.7']<CONFIDANT_GACHA_WEIGHTS_V148['companion.1']);
const gs=createCollectionProgressStateV12316();gs.currencies.boundImmortalJade=9999999;gs.economyV12325={ascensionEssence:{manual:0,heart:0,artifact:0,relic:0,pet:0,companion:0},genericFragments:{heart:0,relic:0},extraItems:{},tracks:{},history:[],daily:{dayKey:'',clearedIds:[]}};const inv={};let specific=0,items=0;for(let i=0;i<800;i++){const row=gachaCollectionV12326(gs,inv,'banner.companion',1,148000+i,false,[],117).results[0];if(row.id)assert.ok(/^companion\\.[1-8]$/.test(row.id));if(row.kind==='fragment'){specific++;assert.equal(row.fragments,5);}if(row.kind==='item'&&!row.first){items++;assert.equal(row.fragments,10);}}assert.ok(specific>20,'companion banner produces fixed-5 specific fragments');assert.ok(items>=0);
const app=fs.readFileSync('app.js','utf8'),runtime=fs.readFileSync('standalone-runtime.js','utf8'),presentation=fs.readFileSync('modules/confidant-presentation-v87.js','utf8'),sessionSrc=fs.readFileSync('dist/core/session.js','utf8');assert.match(app,/TRI KỶ V148/);assert.match(app,/Duyên ★/);assert.match(app,/TÂM LỰC/);assert.match(app,/100 Đồng Tâm/);assert.match(runtime,/confidantHeartV148/);assert.match(presentation,/confidant\.v148/);assert.match(sessionSrc,/craftMastery/);assert.match(sessionSrc,/resourceMastery/);
console.log('V148 confidant rebuild Gate B PASS');`,'extend Gate B test');
 write(p,s);
}

console.log('V148 Gate B patch applied');
