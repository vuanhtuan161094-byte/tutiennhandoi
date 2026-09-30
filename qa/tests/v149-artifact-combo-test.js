import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ARTIFACTS_V88,
  ARTIFACT_COMBO_SCHEMA_V149,
  ARTIFACT_COMBO_RULES_V149,
  artifactComboSummaryV149,
  artifactCombatRuntimeV88,
  artifactViewV88,
  applyArtifactsV88ToEntity,
} from '../../dist/core/artifact-v88.js';

let pass=0;
const check=(value,message)=>{assert.ok(value,message);pass++;console.log(`✓ ${message}`)};
const item=()=>({owned:true,level:100,advance:4,specificFragments:0,artifactV149:{schema:'artifact.production.v149',baoHonRank:0}});
const ids={
  guide:'artifact.thunder_guiding_mirror',
  thunder:'artifact.thunder_punishment_sword',
  sight:'artifact.true_sight_mirror',
  swordBox:'artifact.starfall_sword_box',
};
const state={
  schema:'collection-progression.v12316',
  genericFragments:{manual:0,artifact:0,pet:0,companion:0},
  items:Object.fromEntries(ARTIFACTS_V88.map(d=>[d.id,item()])),
  activeArtifactIds:[ids.guide,ids.thunder,ids.sight,ids.swordBox],
  cave:{level:1,facilities:[{id:'artifact',level:1}]},
  economyV12325:{relicV88Migrated:true,extraItems:{},activeRelicId:undefined},
  artifactV88Migrated:true,
};

check(Object.keys(ARTIFACT_COMBO_RULES_V149).length===12,'V149 authors one combo/interoperability rule for every production Pháp Bảo');
check(Object.values(ARTIFACT_COMBO_RULES_V149).every(r=>!('setId' in r)&&!('requiredSet' in r)),'V149 combo grammar has no hard set membership requirement');

const combo=artifactComboSummaryV149(state);
check(combo.schema===ARTIFACT_COMBO_SCHEMA_V149&&combo.hardSetLock===false&&combo.sharedBaoQi===false&&combo.resourceMode==='trigger-cooldown','V150 supersedes shared Bảo Khí: V149 combo now runs on trigger/cooldown with no hard set lock');
check(combo.matchedMarks.includes('Lôi Ấn')&&combo.matchedMarks.includes('Phá Vọng'),'Different equipped Pháp Bảo expose matched producer/consumer marks');

const runtime=artifactCombatRuntimeV88(state);
const byItem=id=>runtime.triggers.find(t=>t.runtimeV88?.itemId===id);
const guide=byItem(ids.guide),thunder=byItem(ids.thunder),sight=byItem(ids.sight),swordBox=byItem(ids.swordBox);
check(guide?.effects.some(e=>e.type==='addMark'&&e.mark==='Lôi Ấn'),'Dẫn Lôi Kính really produces Lôi Ấn inside shared CombatEngine effects');
const thunderConsume=thunder?.effects.find(e=>e.type==='consumeMarkDamage'&&e.mark==='Lôi Ấn');
check(thunderConsume?.maxConsume===3&&thunderConsume.baseCoefficient===0&&thunderConsume.coefficientPerStack>0,'Lôi Phạt Kiếm consumes up to 3 Lôi Ấn for scaled bonus damage');
check(sight?.effects.some(e=>e.type==='addMark'&&e.mark==='Phá Vọng'),'Phá Vọng Kính Giai V really produces Phá Vọng mark');
const sightConsume=swordBox?.effects.find(e=>e.type==='consumeMarkDamage'&&e.mark==='Phá Vọng');
check(sightConsume?.maxConsume===1&&sightConsume.baseCoefficient===0&&sightConsume.coefficientPerStack>0,'Tinh Lạc Kiếm Hạp can consume Phá Vọng from another artifact for follow-up damage');
check(thunder.runtimeV88?.comboV149?.consumes?.[0]?.mark==='Lôi Ấn'&&thunder.runtimeV88.hardSetLock===false,'Runtime trigger carries inspectable cross-artifact combo metadata');
check([guide,thunder,sight,swordBox].every(t=>t.runtimeV88?.resourceMode==='trigger-cooldown'&&!('baoQiCost' in t.runtimeV88)&&!('baoQiGain' in t.runtimeV88)),'All combo triggers are resource-free after V150');

const base={id:'P',name:'Artifact Combo Tester',tags:[],stats:{attack:1000,physique:1000,defense:1000},triggers:[],skillIds:[],aiProfile:{name:'idle',rules:[]}};
const entity=applyArtifactsV88ToEntity(base,state);
const artifactTriggers=entity.triggers.filter(t=>t.runtimeV88?.kind==='artifactSkill');
check(artifactTriggers.length===4&&new Set(artifactTriggers.map(t=>t.id)).size===4,'Entity injects exactly one live Pháp Kỹ trigger per equipped artifact, with no adapter duplication');
check(entity.combatBuildV117?.artifactV88?.comboV149?.matchedMarks.includes('Lôi Ấn'),'CombatEntity exposes active combo provenance without a second resolver');
check(entity.combatBuildV117?.artifactV88?.resourceV150?.baoQiEnabled===false,'CombatEntity declares V150 resource-free artifact activation');

const thunderView=artifactViewV88(state,ids.thunder);
check(thunderView?.comboV149?.kind==='finisher'&&thunderView?.v149?.hardSetLock===false,'Artifact detail read-model explains finisher combo and no-set-lock rule');
check(thunderView?.resourceV150?.baoQiEnabled===false&&!('baoQiCost' in thunderView.skill),'Artifact detail no longer exposes a Bảo Khí cost');

const combat=[
  fs.readFileSync('./dist/core/combat-m1-base.js','utf8'),
  fs.readFileSync('./dist/core/combat-m2b-base.js','utf8'),
  fs.readFileSync('./dist/core/combat.js','utf8'),
].join('\n');
check(combat.includes("case 'consumeMarkDamage':")&&combat.includes('resolveEffectConsumeMarkDamageV141'),'Combo damage is executed by the existing shared CombatEngine mark consumer');
const adapter=fs.readFileSync('./dist/core/artifact-v88.js','utf8');
check(!adapter.includes('class ArtifactCombat')&&!adapter.includes('new CombatEngine'),'Artifact adapter does not introduce a second combat resolver/engine');
const hud=fs.readFileSync('./modules/artifact-presentation-v88.js','utf8');
check(hud.includes('data-artifact-v149-raw')&&hud.includes('Combo ${v.matchedMarks')&&hud.includes('combatParticipant:true'),'Combat HUD exposes Bảo Hồn/raw, combo readiness and Pháp Bảo call-in participation');
check(!hud.includes('data-artifact-v88-baoqi')&&hud.includes('Trigger + hồi chiêu'),'Combat HUD no longer exposes the removed resource bar');

console.log(`\nV149/V150 ARTIFACT COMBO: ${pass}/${pass} PASS`);
