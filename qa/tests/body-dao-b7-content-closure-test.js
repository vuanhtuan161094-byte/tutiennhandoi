import assert from 'node:assert/strict';
import {
  bodyCoreV2,
  bodyPassiveStackV2,
  bodyPassivesV2,
  bodySkillMasteryV2,
  bodyTreeV2,
} from '../../dist/content/body-dao-v2.js';

assert.equal(bodyCoreV2.productionAuthority,'body-dao.runtime.production.v1');
assert.match(bodyCoreV2.summary,/Phản Thế 0–100/);
assert.match(bodyCoreV2.summary,/không tự cộng sát thương hay giảm thương/);
assert(!bodyCoreV2.summary.includes('Mỗi 20 Phản Thế +3%'),'B7 must retire legacy hold-resource damage text');

assert.equal(bodyPassiveStackV2.retiredForMainBody,true);
assert.equal(bodyPassiveStackV2.productionMainBody,false);
assert.match(bodyPassiveStackV2.summary,/không sinh, không hiển thị và không nhận hiệu ứng chiến đấu từ Huyết Khí/);

assert.equal(bodyPassivesV2.length,8,'Body must keep eight stable passive rows');
assert.deepEqual(
  bodyPassivesV2.map(x=>x.id),
  Array.from({length:8},(_,i)=>`passive.v2.body.p${i+1}`),
  'Body passive ids are save/content compatibility authority',
);
const passiveText=JSON.stringify(bodyPassivesV2);
for(const stale of [
  'mỗi incoming root action làm mất HP nhận +1 tầng',
  'Tăng giới hạn Huyết Khí',
  'Mỗi Huyết Khí tăng thêm Phòng Ngự',
  'Khi Huyết Khí ≥20',
]) assert(!passiveText.includes(stale),`B7 stale Main-Body Huyết Khí text remains: ${stale}`);
assert.match(bodyPassivesV2[5].summary,/chủ động tiêu Phản Thế/,'p6 must describe intentional Recover spend');
assert.match(bodyPassivesV2[7].summary,/cash-out Phản Thế/,'p8 must describe actual cash-out cycle');

assert.equal(bodySkillMasteryV2.length,10,'Body must keep ten stable mastery rows');
assert.deepEqual(bodySkillMasteryV2.map(x=>x.skillId),[
  'skill.dao.body.basic',
  'skill.dao.body.guard',
  'skill.dao.body.transform',
  'skill.dao.body.immovable',
  'skill.dao.body.counter',
  'skill.dao.body.elephant',
  'skill.dao.body.break',
  'skill.dao.body.recover',
  'skill.dao.body.finisher',
  'skill.dao.body.ultimate',
]);
for(const row of bodySkillMasteryV2){
  assert.equal(row.productionExtraMechanics,false,`${row.skillId}: unsupported Body-specific mastery overrides must remain retired`);
  assert.deepEqual(Object.keys(row.milestones),['100','250','500','750','1000'],`${row.skillId}: keep mastery milestone shape for UI/save compatibility`);
}
const elephant=bodySkillMasteryV2.find(x=>x.skillId==='skill.dao.body.elephant');
assert.equal(elephant.productionName,'Nhiên Huyết Chấn Thân');
const masteryText=JSON.stringify(bodySkillMasteryV2);
for(const stale of ['Long Tượng Trấn Thiên','Long Tượng Trấn Thể','channel 2,0s','shockwave 100%']){
  assert(!masteryText.includes(stale),`B7 stale unsupported mastery promise remains: ${stale}`);
}

assert.equal(bodyTreeV2.length,8);
assert.equal(bodyTreeV2.find(x=>x.realm==='heaven')?.activeSkillId,'skill.dao.body.elephant','stable elephant id must remain bound in Body tree');

console.log('BODY DAO B7 CONTENT CLOSURE: PASS');
