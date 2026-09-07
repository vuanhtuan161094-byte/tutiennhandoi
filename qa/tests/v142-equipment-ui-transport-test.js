import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameplay=fs.readFileSync('dist/core/gameplay.js','utf8');
const dispatch=fs.readFileSync('dist/core/gameplay-dispatch.js','utf8');
const client=fs.readFileSync('dist/core/client-shell.js','utf8');
const app=fs.readFileSync('app.js','utf8');

assert.match(gameplay,/from '\.\/equipment-v142\.js'/,'Gameplay read model phải import V142 equipment definitions.');
assert.ok(gameplay.includes("const v142Item = item.schema === 'equipment.v142';"),'Item read model phải nhận diện V142.');
assert.ok(gameplay.includes('rankName: v142Item ? item.equipmentRankName'),'UI phải nhận tên bậc V142.');
assert.ok(gameplay.includes('maxEnhancementLevel'),'UI item phải nhận cap cường hóa riêng.');
assert.ok(gameplay.includes('const v142Summary = this.session.equipmentV142Summary();'),'equipmentSystem phải expose fragment/crafting summary V142.');
assert.ok(gameplay.includes('fragmentRows:'),'equipmentSystem phải expose hàng mảnh theo bậc.');
assert.ok(gameplay.includes('setRows:'),'equipmentSystem phải expose Tàn Ấn/Set V142.');

for(const type of ['craftEquipmentV142','refineEquipmentFragmentsV142','mergeEquipmentV142','engraveEquipmentSetV142']){
  assert.ok(dispatch.includes(`case '${type}':`),`Gameplay dispatch thiếu ${type}.`);
}

assert.ok(client.includes('equipmentSystem: api.getEquipmentSystem()'),'Inventory transport phải mang equipmentSystem tới client.');
assert.ok(app.includes('function v142EquipmentCraftPanel'),'Frontend phải có panel Luyện Trang Bị V142.');
assert.ok(app.includes('data-v142-craft-rank'),'Frontend phải có nút craft 50 mảnh.');
assert.ok(app.includes('data-v142-refine'),'Frontend phải có nút tinh luyện 3:1.');
assert.ok(app.includes('data-v142-merge'),'Frontend phải có nút hợp 3 món.');
assert.ok(app.includes('data-v142-engrave'),'Frontend phải có nút Khắc Bộ bằng Tàn Ấn.');
assert.ok(app.includes("perform({type:'craftEquipmentV142'"),'Frontend craft phải đi qua canonical perform transport.');
assert.ok(app.includes("perform({type:'refineEquipmentFragmentsV142'"),'Frontend refine phải đi qua canonical perform transport.');
assert.ok(app.includes("perform({type:'mergeEquipmentV142'"),'Frontend merge phải đi qua canonical perform transport.');
assert.ok(app.includes("perform({type:'engraveEquipmentSetV142'"),'Frontend engrave phải đi qua canonical perform transport.');
assert.ok(app.includes('x.maxEnhancementLevel??'),'Frontend phải tôn trọng +15 V142 thay vì hard-code +20.');

console.log('V142 equipment UI transport PASS');
