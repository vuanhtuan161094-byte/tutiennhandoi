import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCombatPresentationModelV1,COMBAT_PRESENTATION_MODEL_VERSION} from '../../modules/combat-presentation-architecture-v140.js';

const boss=buildCombatPresentationModelV1({
  model:{specialization:{mainDaoId:'sword'},endlessHunt:{bossReady:true,canFight:false,fightBlocker:'Thiếu điều kiện',currentZoneFloor:7,currentMap:{zoneName:'Kiếm Vực',primaryElement:'metal'},monster:{id:'boss.7',name:'Huyền Tê',level:77,grade:'Boss',gradeId:'boss',elementMatchup:'Kim'},farm:{available:true,floor:6,zoneName:'Kiếm Vực',spiritStonesPerHour:1234,demonCoresPerHour:5.5},productionV110:{boss:{readiness:{label:'Nguy hiểm',description:'Cần Phá Thế',tone:'danger'},mechanic:{name:'Lôi Khải',coveragePct:50,counterHint:'Phá giáp',counters:[{covered:true},{covered:false}]}}}}},
  live:{autoCombat:false},
});
assert.equal(boss.version,COMBAT_PRESENTATION_MODEL_VERSION);
assert.equal(boss.mode,'prefight');
assert.equal(boss.enemy.name,'Huyền Tê');
assert.equal(boss.enemy.isBoss,true);
assert.equal(boss.enemy.stageElement,'metal');
assert.equal(boss.boss.readiness.label,'Nguy hiểm');
assert.equal(boss.boss.mechanic.name,'Lôi Khải');
assert.equal(boss.boss.mechanic.counterSummary,'1/2 đối sách');
assert.equal(boss.challenge.blocked,true);
assert.equal(boss.challenge.blockedReason,'Thiếu điều kiện');
assert.equal(boss.challenge.progressionLabel,'Boss tầng 7 · thắng mở tầng kế');
assert.equal(boss.farm.label,'CHIẾN LỢI PHẨM');
assert.match(boss.farm.detail,/Linh Thạch\/h/);
assert.doesNotMatch(boss.farm.detail,/Boss.*(?:rơi|thưởng)/i,'Boss challenge must not mint direct loot');

const farm=buildCombatPresentationModelV1({model:{endlessHunt:{currentMap:{primaryElement:'water'},monster:{id:'boss.8',name:'Boss',grade:'Boss',gradeId:'boss'},farm:{available:true,floor:7,mobName:'Thủy Yêu',mobLevel:21,mobElements:['water'],spiritStonesPerHour:200,demonCoresPerHour:2}}},live:{autoCombat:true}});
assert.equal(farm.mode,'farm');
assert.equal(farm.enemy.name,'Thủy Yêu');
assert.equal(farm.enemy.isBoss,false);
assert.equal(farm.farm.active,true);
assert.equal(farm.farm.label,'ĐANG SĂN ẢO');

const source=fs.readFileSync('modules/combat-presentation-architecture-v140.js','utf8');
const start=source.indexOf('export function buildCombatPresentationModelV1('),end=source.indexOf('\nexport function publishCombatPresentationModelV1',start);
assert.ok(start>=0&&end>start,'canonical presentation builder must remain bounded');
const body=source.slice(start,end);
assert.match(body,/productionV110/,'builder must consume backend-authored production context');
assert.doesNotMatch(body,/querySelector|document\.|localStorage|sessionStorage|fetch\s*\(|\/api\//,'canonical presentation model must remain pure and DOM/backend-action free');
console.log('Combat presentation model boundary PASS · direct model → presentation snapshot · Boss progression ≠ Hunt economy');
