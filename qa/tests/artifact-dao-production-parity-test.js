import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildRegistry} from '../../dist/content/registry.js';
import {artifactDaoV2} from '../../dist/content/artifact-dao-v2.js';
import {battleDaoSkillGrowthProfileV126} from '../../dist/core/battle-dao-skill-growth-v126.js';
import {remainingDaoPassiveBonusesV2,v2ResourceProjection} from '../../dist/core/battle-dao-v2-runtime.js';
import {runCombatKernelV3,runCompiledCombatEncounterV3} from '../../dist/core/combat-kernel-v2.js';
import {CombatEngine} from '../../dist/core/combat.js';
import {canUseBattleDaoSkillV118} from '../../dist/core/battle-dao-combat-v118.js';
import {createArtifactP4Player,createArtifactP4Target,ARTIFACT_P4_PROFILES} from '../benchmarks/artifact-dao-p4-benchmark.js';
import {setupArtifact} from './artifact-dao-transaction-test.js';
const registry=buildRegistry();assert.equal(artifactDaoV2.passives.length,8);assert.equal(artifactDaoV2.mastery.length,10);
for(const row of artifactDaoV2.mastery){const s=registry.skill(row.skillId);assert(s.fiveStatScalingV5);assert(!s.fiveStatScalingV5.agility);assert.equal(Object.keys(row.milestones).length,5);const g=battleDaoSkillGrowthProfileV126(s,1000);assert.equal(g.milestones.length,5);assert.equal(g.daoRefundPct,0);assert.equal(g.daoGeneratePct,0);}
{
 const{e}=setupArtifact();const st=e.battleDaoStateV2.artifact.stack;st.stacks=30;st.cap=30;st.expiresAt=20;const before=structuredClone(e.battleDaoStateV2.artifact),bonuses=remainingDaoPassiveBonusesV2(e,25);for(const k of ['directDamagePct','breakPct','gaugeGainPct','recoveryReductionPct'])assert.equal(bonuses[k],0);assert(v2ResourceProjection(e,25).artifactPassiveStack<30);assert.deepEqual(e.battleDaoStateV2.artifact,before,'expired reads do not mutate timers');
}
for(const mode of ['pve','pvp','hunt','boss']){
 const entities=[createArtifactP4Player(ARTIFACT_P4_PROFILES[0]),createArtifactP4Target()],raw=runCombatKernelV3({registry,seed:64001,entities,maxDuration:18,mode:'simulation'}),compiled=runCompiledCombatEncounterV3({schema:'combat-encounter.v1',encounterId:'artifact-'+mode,activity:mode,mode:'simulation',seed:64001,entities,maxDuration:18,metadata:{}},registry);assert.deepEqual(compiled.battle.finalState,raw.battle.finalState);assert.deepEqual(compiled.combatResult.summary,raw.combatResult.summary);
}
{
 const p=createArtifactP4Player(ARTIFACT_P4_PROFILES[0]);p.combatBuildV117.mainDaoId='sword';p.combatBuildV117.secondaryDaoId='artifact';p.skillIds=['skill.dao.sword.basic'];p.aiProfile={rules:[{skillId:p.skillIds[0],priority:100,conditions:[{type:'always'}]}]};const engine=new CombatEngine(registry,64001,[p,createArtifactP4Target()]),[e,t]=[...engine.entities.values()];assert.equal(e.battleDaoStateV2.artifact.core,undefined);assert(!canUseBattleDaoSkillV118(e,registry.skill('skill.dao.artifact.deploy')));
 for(let i=0;i<3;i++){engine.handleDecision(e,t,i*2);if(e.casting)engine.handleSkillResolve(e,t,p.skillIds[0],e.casting.token,i*2);e.nextActionAt=0;}assert(e.battleDaoStateV2.artifact.stack.stacks>0);assert.equal(engine.queue.filter(x=>x.v2FollowUp?.kind==='artifactSnapshot').length,0);assert.equal(e.battleDaoStateV2.artifact.core,undefined);
}
for(const file of ['battle-dao-v2-contract.js','combat.js']){const source=fs.readFileSync(new URL('../../dist/core/'+file,import.meta.url),'utf8');assert(!/artifactCollection|collectionArtifacts|relicRuntime/.test(source),'feature must not access external collection authority');}
console.log('ARTIFACT10/8/50/five-stat, pure reads/no generic bonuses, Main/Secondary, compiled parity/collection boundary PASS');
