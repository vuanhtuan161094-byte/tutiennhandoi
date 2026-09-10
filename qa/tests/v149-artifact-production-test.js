import assert from 'node:assert/strict';
import {buildRegistry} from '../../dist/content/registry.js';
import {thanhHaWorld} from '../../dist/content/world.js';
import {adventureEnemies} from '../../dist/content/entities.js';
import {createPlayableAdventureState,playablePlayerProfile} from '../../dist/content/adventure.js';
import {SimulationSession} from '../../dist/core/session.js';
import {GameplayFacade} from '../../dist/core/gameplay.js';
import {ARTIFACTS_V88,ARTIFACT_SCHEMA_V149} from '../../dist/core/artifact-v88.js';

let pass=0;
const check=(v,m)=>{assert.ok(v,m);pass++;console.log(`✓ ${m}`)};
const equal=(a,b,m)=>{assert.deepEqual(a,b,m);pass++;console.log(`✓ ${m}`)};

const registry=buildRegistry();
const state=createPlayableAdventureState();
state.realm.maxRealmOrder=22;
const session=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,14901,state);
const gameplay=new GameplayFacade(session,registry,thanhHaWorld);
session.devCollectionGrantV12326();

const artifact=ARTIFACTS_V88.find(x=>x.id==='artifact.thunder_punishment_sword');
const canonical=session.stateValue.collectionV12316;
const progress=canonical.items[artifact.id];
check(progress.owned&&progress.level===100&&progress.advance===4,'DEV production fixture owns a Lv100 / Bảo Giai V artifact');
session.equipCollectionV12325(artifact.id,0);
check(canonical.activeArtifactIds[0]===artifact.id,'Public equip action writes canonical collectionV12316 artifact slot');

const legacyBefore=structuredClone(session.stateValue.artifacts);
session.stateValue.artifacts.activeIds=[];
const materialBefore=canonical.genericFragments.artifact;
const result=session.strengthenCollectionV12325(artifact.id,1);
check(result.mode==='baoHon'&&result.baoHonRanks===1&&result.strengthenLabel==='Bảo Hồn','Existing public strengthen action switches to Bảo Hồn after Lv100 + Giai V');
check(canonical.items[artifact.id].artifactV149?.baoHonRank===1,'Public action persists namespaced V149 Bảo Hồn rank on canonical item progress');
check(canonical.genericFragments.artifact===materialBefore-result.cost,'Public Bảo Hồn action consumes the existing canonical artifact strengthening material');
check(result.summary?.artifactV149?.schema===ARTIFACT_SCHEMA_V149&&result.summary.artifactV149.infinite===true&&result.summary.artifactV149.percentageGrowth===false,'Public economy summary exposes infinite raw-only V149 contract');
const category=result.summary.categories.find(x=>x.category==='artifact');
const row=category.items.find(x=>x.id===artifact.id);
check(category.genericFragmentName==='Luyện Bảo Tinh Hoa','Player-facing economy names the real V12326/V12329 strengthening material');
check(row.strengthenMode==='baoHon'&&row.strengthenLabel==='Bảo Hồn'&&row.strengthenCost===row.v149.nextCost,'Maxed artifact UI DTO exposes the next Bảo Hồn sink instead of stale Luyện Hóa 100 cost');
check(row.v149.baoHonRank===1&&row.v149.rawCurrent.attack>0&&row.v149.percentGrowth===false,'Artifact item DTO exposes Bảo Hồn rank, raw stat provenance and no percent growth');

const overview=gameplay.overview();
check(overview.build.activeArtifactCount===1&&overview.build.artifactAuthority==='collectionV12316.activeArtifactIds','Player overview counts canonical V88/V149 artifact loadout, not legacy state.artifacts');
const artifactRows=gameplay.artifacts();
const activeRow=artifactRows.find(x=>x.id===artifact.id);
check(activeRow?.active===true&&activeRow.authority==='collectionV12316.activeArtifactIds'&&activeRow.v149?.baoHonRank===1,'Player artifacts view reads canonical V149 progress/loadout authority');
check(!artifactRows.some(x=>x.authority!=='collectionV12316.activeArtifactIds'),'Player artifacts view no longer mixes legacy world-relic authority into production loadout');

equal(session.stateValue.artifacts.items,legacyBefore.items,'V149 production reads/actions do not delete or rewrite legacy world-relic item history');
check(session.stateValue.artifacts.activeIds.length===0,'Legacy world-relic activeIds remain independent compatibility state and cannot overwrite canonical equip state');
check(canonical.activeArtifactIds[0]===artifact.id,'Canonical artifact equip survives a conflicting empty legacy activeIds state');

const entity=session.personalCombatEntity();
check(entity.combatBuildV117?.artifactV88?.v149Schema===ARTIFACT_SCHEMA_V149&&entity.combatBuildV117.artifactV88.raw.attack>0,'Canonical personal CombatEntity receives V149 raw stats through existing V88 CombatKernel composition');
check(entity.triggers.some(x=>x.runtimeV88?.kind==='artifactSkill'&&x.runtimeV88.itemId===artifact.id),'Public V149 loadout still resolves Pháp Kỹ through shared runtimeV88 trigger contract');

console.log(`\nV149 ARTIFACT PRODUCTION: ${pass}/${pass} PASS`);
