import fs from 'node:fs';

function replaceOnce(text,before,after,label){
  const count=text.split(before).length-1;
  if(count!==1)throw new Error(`${label}: expected 1 match, got ${count}`);
  return text.replace(before,after);
}
function patchGameplay(){
  const path='dist/core/gameplay.js';
  let text=fs.readFileSync(path,'utf8');
  if(!text.includes("from './equipment-v142.js'")){
    const marker="import { CANONICAL_EQUIPMENT_SLOTS, EQUIPMENT_SLOT_LABELS, EQUIPMENT_ANTI_DOWNGRADE_RESOURCE, EQUIPMENT_ENHANCE_ESSENCE_RESOURCE, EQUIPMENT_MAX_ENHANCEMENT, EQUIPMENT_TRANSFER_GEM_RESOURCE, effectiveEquipmentStats, enhancementBonusPct, enhancementDowngradeChancePct, enhancementEssenceCost, enhancementSuccessChancePct, equipmentAffixLinesV114, equipmentGradeIndex, equipmentGradeName, equipmentPower, equipmentQualityName, equipmentSlotGroup, equipmentTierName, equipmentTraitName, equippedItems } from './equipment.js';";
    const add=`${marker}\nimport { EQUIPMENT_ATTIRE_SLOTS_V142, EQUIPMENT_JEWELRY_SLOTS_V142, EQUIPMENT_MAX_ENHANCEMENT_V142, EQUIPMENT_SET_CATALOG_V142, EQUIPMENT_SLOT_LABELS_V142, EQUIPMENT_SLOTS_V142, equipmentRankIndexFromRealmOrderV142, equipmentRankNameV142, equipmentSetDefinitionV142 } from './equipment-v142.js';\nimport { EQUIPMENT_FRAGMENT_CRAFT_COST_V142, EQUIPMENT_FRAGMENT_UPGRADE_RATIO_V142 } from './equipment-fragments-v142.js';\nimport { EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142 } from './equipment-set-fragments-v142.js';`;
    text=replaceOnce(text,marker,add,'gameplay V142 imports');
  }
  if(!text.includes("const v142Item = item.schema === 'equipment.v142';")){
    text=replaceOnce(text,
      "        const liveSet = isLiveEquipmentSetV12310(item.setId);",
      "        const v142Item = item.schema === 'equipment.v142';\n        const v142Set = v142Item ? equipmentSetDefinitionV142(item.setId) : undefined;\n        const maxEnhancementLevel = v142Item ? EQUIPMENT_MAX_ENHANCEMENT_V142 : EQUIPMENT_MAX_ENHANCEMENT;\n        const liveSet = isLiveEquipmentSetV12310(item.setId);",
      'gameplay V142 item identity');
    text=replaceOnce(text,
      "            slotLabel: EQUIPMENT_SLOT_LABELS[item.slot] ?? item.slot,",
      "            slotLabel: v142Item ? (EQUIPMENT_SLOT_LABELS_V142[item.slot] ?? item.slot) : (EQUIPMENT_SLOT_LABELS[item.slot] ?? item.slot),",
      'gameplay V142 slot label');
    text=replaceOnce(text,
      "            enhancementLevel: item.enhancementLevel ?? 0,\n            enhancementBonusPct: enhancementBonusPct(item.enhancementLevel ?? 0),",
      "            enhancementLevel: item.enhancementLevel ?? 0,\n            maxEnhancementLevel,\n            isV142: v142Item,\n            rankIndex: v142Item ? item.equipmentRankIndex : undefined,\n            rankName: v142Item ? item.equipmentRankName : undefined,\n            enhancementBonusPct: enhancementBonusPct(item.enhancementLevel ?? 0),",
      'gameplay V142 item fields');
    text=replaceOnce(text,
      "            setId: liveSet ? item.setId : undefined,\n            setName: liveSet ? setNames.get(item.setId)?.name : undefined,\n            setCategory: liveSet ? 'attire' : undefined,",
      "            setId: v142Set?.id ?? (liveSet ? item.setId : undefined),\n            setName: v142Set?.name ?? (liveSet ? setNames.get(item.setId)?.name : undefined),\n            setCategory: v142Set?.category ?? (liveSet ? 'attire' : undefined),",
      'gameplay V142 set fields');
    const start=text.indexOf('    equipmentItemReadModelV129('),end=text.indexOf('    equipmentInventoryV129(',start);
    if(start<0||end<=start)throw new Error('gameplay item read block not found');
    let block=text.slice(start,end);
    block=block.replaceAll('(item.enhancementLevel ?? 0) < EQUIPMENT_MAX_ENHANCEMENT','(item.enhancementLevel ?? 0) < maxEnhancementLevel');
    text=text.slice(0,start)+block+text.slice(end);
  }
  if(!text.includes('const v142FragmentWallet = { ...(state.equipmentFragmentsV142?.byRank ?? {}) };')){
    text=replaceOnce(text,
      "        const power = equipmentPower(state.equipment, this.registry.equipmentSets);",
      "        const power = equipmentPower(state.equipment, this.registry.equipmentSets);\n        const v142FragmentWallet = { ...(state.equipmentFragmentsV142?.byRank ?? {}) };\n        const v142SetFragmentWallet = { ...(state.equipmentSetFragmentsV142?.bySetId ?? {}) };\n        const v142MaxRankIndex = equipmentRankIndexFromRealmOrderV142(state.realm.maxRealmOrder);",
      'gameplay V142 wallet reads');
    text=replaceOnce(text,
      "        return {\n            schema: 'equipment-system.v106',",
      `        const v142SetRows = EQUIPMENT_SET_CATALOG_V142.map(set => {\n            const canonicalSlots = set.category === 'attire' ? EQUIPMENT_ATTIRE_SLOTS_V142 : EQUIPMENT_JEWELRY_SLOTS_V142;\n            const owned = state.equipment.items.filter(item => item.schema === 'equipment.v142' && item.setId === set.id);\n            const equippedPieces = owned.filter(item => state.equipment.equipped[item.slot] === item.id).length;\n            const ownedSlotIds = new Set(owned.map(item => item.slot));\n            const fragmentBalance = Math.max(0, Number(v142SetFragmentWallet[set.id] ?? 0));\n            return {\n                setId:set.id,setName:set.name,category:set.category,identity:set.element ? \`Ngũ Hành · \${set.element}\` : 'Trang Sức',tags:['EquipmentV142',set.element ?? 'Jewelry'],description:\`Bộ V142 · \${set.category === 'attire' ? '6 Y Trang' : '4 Trang Sức'} · Khắc bằng Tàn Ấn.\`,\n                unlocked:fragmentBalance>0||owned.length>0,ownedPieces:owned.length,ownedSlotCount:ownedSlotIds.size,equippedPieces,maxPieces:canonicalSlots.length,duplicatePieces:Math.max(0,owned.length-ownedSlotIds.size),\n                ownedSlots:canonicalSlots.filter(slot=>ownedSlotIds.has(slot)).map(slot=>({slot,slotLabel:EQUIPMENT_SLOT_LABELS_V142[slot]??slot,itemCount:owned.filter(item=>item.slot===slot).length})),\n                missingSlots:canonicalSlots.filter(slot=>!ownedSlotIds.has(slot)).map(slot=>({slot,slotLabel:EQUIPMENT_SLOT_LABELS_V142[slot]??slot})),\n                thresholds:set.bonuses.map(def=>({pieces:def.pieces,name:def.name,description:def.name,active:equippedPieces>=def.pieces})),\n                fragmentBalance,engraveCost:EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142,\n                acquisition:{targetDungeonName:set.category==='attire'?'Ngũ Hành Đạo Khố':'Linh Bội Bảo Khố',repeatTargetDrops:true,firstClearUnlocksCraft:false},\n            };\n        });\n        const v142ActiveSets = v142SetRows.filter(set=>set.equippedPieces>0).map(set=>({setId:set.setId,setName:set.setName,category:set.category,equippedPieces:set.equippedPieces,maxPieces:set.maxPieces,thresholds:set.thresholds,pieces:[]}));\n        return {\n            schema: 'equipment-system.v106',`,
      'gameplay V142 set rows');
    text=replaceOnce(text,
      "            sets, setCatalog,\n        };",
      "            v142: { schema:'equipment-ui.v142', craftCostPerItem:EQUIPMENT_FRAGMENT_CRAFT_COST_V142, refineRatio:EQUIPMENT_FRAGMENT_UPGRADE_RATIO_V142, setEngraveCostPerItem:EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142, maxEnhancementLevel:EQUIPMENT_MAX_ENHANCEMENT_V142, maxRankIndex:v142MaxRankIndex, slots:EQUIPMENT_SLOTS_V142.map(slot=>({id:slot,label:EQUIPMENT_SLOT_LABELS_V142[slot]??slot,group:EQUIPMENT_ATTIRE_SLOTS_V142.includes(slot)?'attire':'jewelry'})), fragmentRows:Array.from({length:v142MaxRankIndex+1},(_,rankIndex)=>({rankIndex,rankName:equipmentRankNameV142(rankIndex),balance:Math.max(0,Number(v142FragmentWallet[rankIndex]??0)),craftCost:EQUIPMENT_FRAGMENT_CRAFT_COST_V142,craftable:Math.max(0,Number(v142FragmentWallet[rankIndex]??0))>=EQUIPMENT_FRAGMENT_CRAFT_COST_V142,refinable:rankIndex<v142MaxRankIndex&&Math.max(0,Number(v142FragmentWallet[rankIndex]??0))>=EQUIPMENT_FRAGMENT_UPGRADE_RATIO_V142})), setRows:v142SetRows, itemCount:state.equipment.items.filter(item=>item.schema==='equipment.v142').length },\n            sets:[...sets,...v142ActiveSets], setCatalog:[...setCatalog,...v142SetRows],\n        };",
      'gameplay V142 system return');
  }
  fs.writeFileSync(path,text);
}

function patchDispatch(){
  const path='dist/core/gameplay-dispatch.js';
  let text=fs.readFileSync(path,'utf8');
  if(!text.includes("case 'craftEquipmentV142':")){
    const marker="                case 'enhanceEquipment': {";
    const cases=`                case 'craftEquipmentV142': {\n                    const report = this.session.craftEquipmentV142(command.slot, command.rankIndex);\n                    return this.result(command.type, beforeYear, [\`Luyện thành \${report.item.name}; tiêu \${report.fragmentCost} Mảnh Trang Bị.\`], report);\n                }\n                case 'refineEquipmentFragmentsV142': {\n                    const report = this.session.refineEquipmentFragmentsV142(command.fromRank, command.batches ?? 1);\n                    return this.result(command.type, beforeYear, [\`Tinh luyện Mảnh Trang Bị \${command.fromRank} → \${Number(command.fromRank)+1} theo tỷ lệ 3:1.\`], report);\n                }\n                case 'mergeEquipmentV142': {\n                    const report = this.session.mergeEquipmentV142(command.mainItemId, command.fodderItemAId, command.fodderItemBId);\n                    return this.result(command.type, beforeYear, [\`Hợp thành thành công: \${report.item.name}.\`], report);\n                }\n                case 'engraveEquipmentSetV142': {\n                    const report = this.session.engraveEquipmentSetV142(command.itemId, command.setId);\n                    return this.result(command.type, beforeYear, [\`Khắc Bộ \${report.setName} lên \${report.item.name}; tiêu \${report.cost} Tàn Ấn.\`], report);\n                }\n${marker}`;
    text=replaceOnce(text,marker,cases,'dispatch V142 commands');
  }
  fs.writeFileSync(path,text);
}

function patchApp(){
  const path='app.js';
  let text=fs.readFileSync(path,'utf8');
  if(!text.includes("v142CraftSlot:'weapon'")) text=replaceOnce(text,'visibleLimit:72};','visibleLimit:72,v142CraftSlot:\'weapon\'};','app V142 craft slot state');
  text=text.replace("['forge','Luyện Đồ','+20']","['forge','Luyện Đồ',sys?.v142?'+15 V142':'+20']");
  text=text.replace("const current=Number(x.enhancementLevel||0),max=Number(sys?.enhancement?.maxLevel||20),maxed=current>=max;","const current=Number(x.enhancementLevel||0),max=Number(x.maxEnhancementLevel??sys?.enhancement?.maxLevel??20),maxed=current>=max;");
  text=text.replace('Trang bị đã đạt +20. Không còn lần Cường Hóa tiếp theo.','Trang bị đã đạt giới hạn Cường Hóa hiện tại.');
  text=text.replace("const maxed=Number(x.enhancementLevel||0)>=20,protection=resourceQuantity('resource.enhancement_protection_talisman');","const maxed=Number(x.enhancementLevel||0)>=Number(x.maxEnhancementLevel??20),protection=resourceQuantity('resource.enhancement_protection_talisman');");
  if(!text.includes('function v142EquipmentCraftPanel')){
    const marker='function v13821Workshop(gear,selected,sys){';
    const panel=`function v142EquipmentCraftPanel(sys,selected){\n  const v=sys?.v142;if(!v)return '';\n  const slots=v.slots||[];if(!slots.some(x=>x.id===inventoryUi.v142CraftSlot))inventoryUi.v142CraftSlot=slots[0]?.id||'weapon';\n  const rows=(v.fragmentRows||[]).filter(x=>Number(x.balance||0)>0||Number(x.rankIndex)===Number(v.maxRankIndex));\n  const slotOptions=slots.map(x=>\`<option value="\${esc(x.id)}" \${inventoryUi.v142CraftSlot===x.id?'selected':''}>\${esc(x.label)}</option>\`).join('');\n  const fragmentRows=rows.map(x=>\`<article class="v13821-cost-line \${x.craftable?'ok':''}"><span><b>\${esc(x.rankName)}</b><small>Mảnh \${num(x.balance)} / \${num(x.craftCost)}</small></span><div class="tag-row"><button class="button primary" data-v142-craft-rank="\${x.rankIndex}" \${x.craftable?'':'disabled'}>Luyện 1 món</button><button class="button ghost" data-v142-refine="\${x.rankIndex}" \${x.refinable?'':'disabled'}>3 → 1 bậc trên</button></div></article>\`).join('');\n  const selectedV142=Boolean(selected?.isV142),same=selectedV142?(model.equipment||[]).filter(x=>x.isV142&&x.id!==selected.id&&x.slot===selected.slot&&Number(x.rankIndex)===Number(selected.rankIndex)):[];\n  const merge=selectedV142&&same.length>=2?\`<button class="button primary" data-v142-merge="\${esc(selected.id)}" data-v142-fodder-a="\${esc(same[0].id)}" data-v142-fodder-b="\${esc(same[1].id)}">Hợp 3 món → \${esc((v.fragmentRows||[]).find(r=>Number(r.rankIndex)===Number(selected.rankIndex)+1)?.rankName||'bậc trên')}</button>\`:'';\n  const setRows=(v.setRows||[]).filter(set=>selectedV142&&set.category===selected.slotGroup);\n  const engrave=setRows.length?\`<div class="v13821-cost-grid"><strong>Khắc Bộ cho \${esc(selected.name)}</strong>\${setRows.map(set=>\`<article><span>\${esc(set.setName)}</span><b>\${num(set.fragmentBalance)} / \${num(set.engraveCost)} Tàn Ấn</b><button class="button ghost" data-v142-engrave="\${esc(selected.id)}" data-v142-set-id="\${esc(set.setId)}" \${Number(set.fragmentBalance)>=Number(set.engraveCost)?'':'disabled'}>Khắc Bộ</button></article>\`).join('')}</div>\`:'';\n  return \`<section class="card v142-equipment-workshop"><header><div><small>V142 · LUYỆN TRANG BỊ</small><strong>50 Mảnh cùng bậc → 1 món</strong><span>3 mảnh bậc dưới → 1 mảnh bậc trên · Săn Yêu/Phó Bản chỉ rơi mảnh.</span></div><b>+\${num(v.maxEnhancementLevel)} MAX</b></header><label><span>Ô muốn luyện</span><select data-v142-craft-slot>\${slotOptions}</select></label><div class="v13821-cost-grid">\${fragmentRows||'<span>Chưa có Mảnh Trang Bị.</span>'}</div>\${merge?\`<div class="tag-row"><span>Giữ món đang chọn làm món chính.</span>\${merge}</div>\`:''}\${engrave}</section>\`;\n}\n${marker}`;
    text=replaceOnce(text,marker,panel,'app V142 craft panel');
    text=replaceOnce(text,
      '  const forgeBody=`${head}${v13821Workshop(gear,selected,sys)}`;',
      '  const forgeBody=`${head}${v142EquipmentCraftPanel(sys,selected)}${v13821Workshop(gear,selected,sys)}`;',
      'app V142 forge panel mount');
  }
  if(!text.includes("perform({type:'craftEquipmentV142'")){
    const marker="  qsaV129('[data-enhance]').forEach(btn=>btn.onclick=async()=>";
    const handlers=`  qsaV129('[data-v142-craft-slot]').forEach(select=>select.onchange=()=>{inventoryUi.v142CraftSlot=select.value;renderPreservingUi();});\n  qsaV129('[data-v142-craft-rank]').forEach(btn=>btn.onclick=()=>perform({type:'craftEquipmentV142',slot:inventoryUi.v142CraftSlot,rankIndex:Number(btn.dataset.v142CraftRank)}));\n  qsaV129('[data-v142-refine]').forEach(btn=>btn.onclick=()=>perform({type:'refineEquipmentFragmentsV142',fromRank:Number(btn.dataset.v142Refine),batches:1}));\n  qsaV129('[data-v142-merge]').forEach(btn=>btn.onclick=async()=>{const main=(model.equipment||[]).find(x=>x.id===btn.dataset.v142Merge);if(!main)return;const ok=await confirmAction('Hợp Trang Bị',\`Giữ \${main.name} làm món chính, tiêu 2 món cùng ô/cùng bậc để tăng 1 bậc. Tiếp tục?\`);if(ok)perform({type:'mergeEquipmentV142',mainItemId:btn.dataset.v142Merge,fodderItemAId:btn.dataset.v142FodderA,fodderItemBId:btn.dataset.v142FodderB});});\n  qsaV129('[data-v142-engrave]').forEach(btn=>btn.onclick=async()=>{const item=(model.equipment||[]).find(x=>x.id===btn.dataset.v142Engrave),set=(model.equipmentSystem?.v142?.setRows||[]).find(x=>x.setId===btn.dataset.v142SetId);if(!item||!set)return;const ok=await confirmAction('Khắc Bộ',\`Khắc \${set.setName} lên \${item.name}; tiêu \${num(set.engraveCost)} Tàn Ấn. Khắc lại Bộ khác sẽ thay Bộ hiện tại. Tiếp tục?\`);if(ok)perform({type:'engraveEquipmentSetV142',itemId:item.id,setId:set.setId});});\n${marker}`;
    text=replaceOnce(text,marker,handlers,'app V142 action handlers');
  }
  fs.writeFileSync(path,text);
}

patchGameplay();
patchDispatch();
patchApp();
console.log('V142 equipment UI transport patch applied');
