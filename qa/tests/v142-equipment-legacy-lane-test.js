import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EQUIPMENT_TRANSFER_GEM_RESOURCE, transferEquipmentEnhancement } from '../../dist/core/equipment.js';

const gameplayAdapter=fs.readFileSync('dist/core/gameplay.js','utf8');
const gameplayBase=fs.existsSync('dist/core/gameplay-v149-base.js')?fs.readFileSync('dist/core/gameplay-v149-base.js','utf8'):'';
const gameplay=`${gameplayAdapter}\n${gameplayBase}`;
const session=fs.readFileSync('dist/core/session.js','utf8');
const app=fs.readFileSync('app.js','utf8');

assert.doesNotMatch(gameplay,/from '\.\/equipment-fragments-v142\.js'/,'Read-model không được kéo fragment authority module vào initial graph.');
assert.doesNotMatch(gameplay,/from '\.\/equipment-set-fragments-v142\.js'/,'Read-model không được kéo Set-fragment authority module vào initial graph.');
assert.ok(gameplay.includes('EQUIPMENT_FRAGMENT_CRAFT_COST_UI_V142 = 50'),'UI read-model giữ snapshot 50 mảnh mà không import mutation authority.');
assert.ok(gameplay.includes('EQUIPMENT_FRAGMENT_REFINE_RATIO_UI_V142 = 3'),'UI read-model giữ snapshot tỷ lệ 3:1.');
assert.ok(gameplay.includes('EQUIPMENT_SET_ENGRAVE_COST_UI_V142 = 50'),'UI read-model giữ snapshot 50 Tàn Ấn.');

for(const method of ['engraveDaoInscriptionV115','socketEquipmentGemV128','upgradeEquipmentGemV128','unsocketEquipmentGemV128']){
  const start=session.indexOf(`    ${method}(`);
  assert.ok(start>=0,`missing ${method}`);
  const end=session.indexOf('\n    }',start);
  const block=session.slice(start,end);
  assert.ok(block.includes("item.schema === 'equipment.v142'"),`${method} phải chặn V142 ở backend.`);
  assert.match(block,/không dùng Đạo Văn|không dùng Ngũ Hành Ngọc/,`${method} cần lỗi V142 rõ nghĩa.`);
}

assert.ok(app.includes("const daoLive=!selected?.isV142&&Boolean(sys?.capabilities?.daoInscriptionRuntimeLive)"),'UI phải ẩn Đạo Văn khi chọn món V142.');
assert.ok(app.includes("socketVisible=!selected?.isV142&&"),'UI phải ẩn Khảm Ngọc khi chọn món V142.');

function item(id, schema, enhancementLevel){
  return { id, schema, slot:'weapon', enhancementLevel, source:{seed:1}, grade:'mundane', tier:0, stats:{attack:1} };
}
{
  const source=item('legacy20','equipment.v1',20);
  const target=item('v142','equipment.v142',0);
  const state={items:[source,target],equipped:{}};
  const inventory={ [EQUIPMENT_TRANSFER_GEM_RESOURCE]:1 };
  assert.throws(()=>transferEquipmentEnhancement(state,source.id,target.id,inventory),/\+15/,'Không được chuyển +20 legacy vào món V142 +15 cap.');
  assert.equal(inventory[EQUIPMENT_TRANSFER_GEM_RESOURCE],1,'Transfer bị từ chối không được tiêu Ngọc.');
  assert.equal(source.enhancementLevel,20);
  assert.equal(target.enhancementLevel,0);
}
{
  const source=item('legacy15','equipment.v1',15);
  const target=item('v142ok','equipment.v142',0);
  const state={items:[source,target],equipped:{}};
  const inventory={ [EQUIPMENT_TRANSFER_GEM_RESOURCE]:1 };
  const result=transferEquipmentEnhancement(state,source.id,target.id,inventory);
  assert.equal(result.transferredLevel,15);
  assert.equal(target.enhancementLevel,15);
  assert.equal(inventory[EQUIPMENT_TRANSFER_GEM_RESOURCE],0);
}

console.log('V142 equipment retired lanes and transfer cap PASS');
