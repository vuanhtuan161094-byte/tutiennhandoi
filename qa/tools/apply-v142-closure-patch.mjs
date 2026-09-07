import fs from 'node:fs';

function replaceOnce(text,before,after,label){
  const count=text.split(before).length-1;
  if(count!==1)throw new Error(`${label}: expected 1 match, got ${count}`);
  return text.replace(before,after);
}

function patchGameplay(){
  const path='dist/core/gameplay.js';
  let text=fs.readFileSync(path,'utf8');
  const fragmentImport="import { EQUIPMENT_FRAGMENT_CRAFT_COST_V142, EQUIPMENT_FRAGMENT_UPGRADE_RATIO_V142 } from './equipment-fragments-v142.js';\n";
  const setFragmentImport="import { EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142 } from './equipment-set-fragments-v142.js';\n";
  text=text.replace(fragmentImport,'').replace(setFragmentImport,'');
  if(!text.includes('EQUIPMENT_FRAGMENT_CRAFT_COST_UI_V142 = 50')){
    const marker="import { EQUIPMENT_ATTIRE_SLOTS_V142, EQUIPMENT_JEWELRY_SLOTS_V142, EQUIPMENT_MAX_ENHANCEMENT_V142, EQUIPMENT_SET_CATALOG_V142, EQUIPMENT_SLOT_LABELS_V142, EQUIPMENT_SLOTS_V142, equipmentRankIndexFromRealmOrderV142, equipmentRankNameV142, equipmentSetDefinitionV142 } from './equipment-v142.js';";
    text=replaceOnce(text,marker,`${marker}\nconst EQUIPMENT_FRAGMENT_CRAFT_COST_UI_V142 = 50;\nconst EQUIPMENT_FRAGMENT_REFINE_RATIO_UI_V142 = 3;\nconst EQUIPMENT_SET_ENGRAVE_COST_UI_V142 = 50;`,'gameplay local V142 economy snapshot');
  }
  text=text.replaceAll('EQUIPMENT_FRAGMENT_CRAFT_COST_V142','EQUIPMENT_FRAGMENT_CRAFT_COST_UI_V142');
  text=text.replaceAll('EQUIPMENT_FRAGMENT_UPGRADE_RATIO_V142','EQUIPMENT_FRAGMENT_REFINE_RATIO_UI_V142');
  text=text.replaceAll('EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142','EQUIPMENT_SET_ENGRAVE_COST_UI_V142');
  const oldTransfer="            transferEligibleTargetIds: (item.enhancementLevel ?? 0) > 0 ? state.equipment.items.filter(candidate => candidate.id !== item.id && candidate.slot === item.slot && (candidate.enhancementLevel ?? 0) < (item.enhancementLevel ?? 0)).map(candidate => candidate.id) : [],";
  const newTransfer="            transferEligibleTargetIds: (item.enhancementLevel ?? 0) > 0 ? state.equipment.items.filter(candidate => candidate.id !== item.id && candidate.slot === item.slot && (candidate.enhancementLevel ?? 0) < (item.enhancementLevel ?? 0) && (candidate.schema !== 'equipment.v142' || (item.enhancementLevel ?? 0) <= EQUIPMENT_MAX_ENHANCEMENT_V142)).map(candidate => candidate.id) : [],";
  if(text.includes(oldTransfer))text=replaceOnce(text,oldTransfer,newTransfer,'V142 transfer read-model cap');
  fs.writeFileSync(path,text);
}

function patchApp(){
  const path='app.js';
  let text=fs.readFileSync(path,'utf8');
  const old="  const daoLive=Boolean(sys?.capabilities?.daoInscriptionRuntimeLive),socketVisible=Boolean(sys?.capabilities?.socketGems)||v138245SocketState(selected).total>0;";
  const next="  const daoLive=!selected?.isV142&&Boolean(sys?.capabilities?.daoInscriptionRuntimeLive),socketVisible=!selected?.isV142&&(Boolean(sys?.capabilities?.socketGems)||v138245SocketState(selected).total>0);";
  if(text.includes(old))text=replaceOnce(text,old,next,'V142 retired UI lanes');
  fs.writeFileSync(path,text);
}

function patchSession(){
  const path='dist/core/session.js';
  let text=fs.readFileSync(path,'utf8');
  const methods=[
    ['engraveDaoInscriptionV115','Trang bị V142 không dùng Đạo Văn.'],
    ['socketEquipmentGemV128','Trang bị V142 không dùng Ngũ Hành Ngọc.'],
    ['upgradeEquipmentGemV128','Trang bị V142 không dùng Ngũ Hành Ngọc.'],
    ['unsocketEquipmentGemV128','Trang bị V142 không dùng Ngũ Hành Ngọc.'],
  ];
  for(const [method,message] of methods){
    const start=text.indexOf(`    ${method}(`);
    if(start<0)throw new Error(`session method missing: ${method}`);
    const result=text.indexOf('        const result =',start);
    if(result<0)throw new Error(`session result marker missing: ${method}`);
    const prefix=text.slice(start,result);
    if(!prefix.includes("item.schema === 'equipment.v142'")){
      const guard=`        if (item.schema === 'equipment.v142')\n            throw new Error('${message}');\n`;
      text=text.slice(0,result)+guard+text.slice(result);
    }
  }
  fs.writeFileSync(path,text);
}

function patchEquipment(){
  const path='dist/core/equipment.js';
  let text=fs.readFileSync(path,'utf8');
  if(!text.includes("const targetMaxEnhancement = target.schema === 'equipment.v142'")){
    const marker="    const targetLevel = clampEnhancement(target.enhancementLevel ?? 0);";
    const add=`${marker}\n    const targetMaxEnhancement = target.schema === 'equipment.v142' ? EQUIPMENT_MAX_ENHANCEMENT_V142 : EQUIPMENT_MAX_ENHANCEMENT;\n    if (sourceLevel > targetMaxEnhancement)\n        throw new Error(\`Trang bị đích chỉ cho phép Cường Hóa tối đa +\${targetMaxEnhancement}.\`);`;
    text=replaceOnce(text,marker,add,'V142 transfer core cap');
  }
  fs.writeFileSync(path,text);
}

patchGameplay();
patchApp();
patchSession();
patchEquipment();
console.log('V142 closure integrity patch applied');
