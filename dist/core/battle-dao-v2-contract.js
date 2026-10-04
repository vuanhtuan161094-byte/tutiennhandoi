export const BATTLE_DAO_V2_SCHEMA = 'battle-dao.v2';
// Formation production transactions are action-local; reads never commit or refresh.
export function formationMain(e, skill) { return e.combatBuildV117?.battleDaoV2Enabled === true && e.combatBuildV117.mainDaoId === 'formation' && skill?.id?.startsWith('skill.dao.formation.'); }
export function formationLevel(e,n) { const id=`passive.v2.formation.p${n}`; return e.combatBuildV117?.learnedDaoPassiveIdsV118?.includes(id) ? Math.max(1,Math.min(20,e.combatBuildV117.passiveLevelsV125?.[id]??1)) : 0; }
export function formationScale(l,a,b) { return l ? a+(b-a)*(l-1)/19 : 0; }
export function formationTier(e,s) { return e.combatBuildV117?.skillPracticeTierV125?.[s.id]??0; }
export function formationCanUse(e,s) {
 const c=e.battleDaoStateV2?.formation?.core,k=s.id.split('.').at(-1);
 if(!formationMain(e,s)||!c)return false;
 if(k==='basic')return true;
 if(k==='deploy')return !c.deployed;
 if(!c.deployed)return false;
 const need={small_activate:25,full_activate:70,convert:20}[k]??0;
 return c.nurture+1e-9>=need;
}
export function prepareFormation(e,target,s,a,now) {
 if(!formationMain(e,s)||!a.battleDaoV2)return;
 const c=e.battleDaoStateV2.formation.core,k=s.id.split('.').at(-1),st=e.battleDaoStateV2.formation.stack;
 const tx={kind:k,targetId:target.id,nurture:c.nurture,integrity:c.integrity,deployed:c.deployed,valid:formationCanUse(e,s),grand:k==='full_activate'&&c.nurture===100,rootActionId:a.battleDaoV2.rootActionId};
 a.battleDaoV2.daoData.formationTransaction=tx;
 if(!tx.valid)return;
 if(tx.grand)a.effectBonusPct+=60;
 if(['small_activate','full_activate'].includes(k)&&st?.stacks>=10)a.effectBonusPct+=Math.floor(st.stacks/10)*formationScale(formationLevel(e,6),2,6);
 if(k==='ultimate')a.effectBonusPct+=c.nurture*.6;
}
export function commitFormation(e,target,s,a,now) {
 const tx=a?.battleDaoV2?.daoData?.formationTransaction;
 if(!formationMain(e,s)||!tx||tx.committed||!tx.valid||(a.battleDaoV2.procDepth??0)>0||!e.alive)return;
 const k=tx.kind,c=e.battleDaoStateV2.formation.core;
 if(s.channel&&!a.battleDaoV2.daoData.formationChannelCompleted)return;
 if(['small_activate','full_activate','ultimate','basic'].includes(k)&&((!target.alive && !(a.battleDaoV2.directDamagingHitCount>0))||target.id!==tx.targetId))return;
 if(!formationCanUse(e,s))return;
 tx.committed=true;
 const before={nurture:c.nurture,integrity:c.integrity,deployed:c.deployed},st=e.battleDaoStateV2.formation.stack,tier=formationTier(e,s);
 const primary=e.baseStats?.primaryStatsV5??{};
 const weights=s.fiveStatScalingV5??{},baseline=s.fiveStatBaselineCoefficientV5??1;
 const localPower=Object.entries(weights).reduce((sum,[key,w])=>sum+(primary[key]??100)*w,0)/(100*baseline);
 const efficiency=Math.min(1.75,Math.max(.5,localPower))+(st?.stacks??0)*formationScale(formationLevel(e,1),.001,.003);
 let gain=0,wear=0,spend=0,repair=0,recovered=0;
 if(k==='deploy'){c.deployed=true;c.nurture=0;c.integrity=100;}
 if(c.deployed){
  if(k==='basic')gain=8;
  if(k==='nourish')gain=30;
  if(k==='seal')gain=20;
  if(gain){gain=Math.min(60,gain*efficiency*(1+(tier>=100?.05:0)+(tier>=250?.10:0)+(tier>=1000?.10:0)));c.nurture=Math.min(100,c.nurture+gain);}
  if(k==='fortify')repair=20*Math.min(1.75,Math.max(.5,localPower))*(1+(st?.stacks??0)*formationScale(formationLevel(e,4),.002,.005)+(tier>=100?.2:0)+(tier>=1000?.2:0));
  if(k==='convert'){spend=20;repair=20*Math.min(1.75,Math.max(.5,localPower))*(1+(st?.stacks??0)*formationScale(formationLevel(e,4),.002,.005)+(tier>=100?.2:0)+(tier>=1000?.2:0));}
  if(k==='small_activate'){spend=25;wear=8;}
  if(k==='full_activate'){spend=70;wear=20+(tx.grand?10:0);}
  if(k==='ultimate')wear=12;
  if(wear&&st?.stacks>=20)wear*=1-formationScale(formationLevel(e,7),.05,.15);
  if(tx.grand&&st?.stacks>=st?.cap)wear*=1-formationScale(formationLevel(e,8),.05,.10);
  c.nurture=Math.max(0,c.nurture-spend);c.integrity=Math.min(100,Math.max(0,c.integrity+repair-wear));
  if(k==='break'){recovered=Math.min(35,(tx.nurture+tx.integrity)*.12)*(tier>=100?1.2:1)*(tier>=1000?1.1:1);const cap=e.baseStats?.maxSpirit??100,standard=e.baseStats?.spiritStandard??100;e.spirit=Math.min(cap,e.spirit+standard*recovered/100);c.deployed=false;c.nurture=0;c.integrity=0;}
  if(c.integrity<=0){c.deployed=false;c.nurture=0;}
 }
 const event={kind:k,rootActionId:tx.rootActionId,grand:tx.grand,nurtureGenerated:gain,nurtureSpent:spend,nurtureWaste:Math.max(0,before.nurture+gain-100),integrityGenerated:repair,integritySpent:wear,recovered,before,after:{nurture:c.nurture,integrity:c.integrity,deployed:c.deployed}};
 c.lastTransaction=event;return event;
}
export function canGenerateDamagingFollowUpV2(b) { return b.followUpsUsed < b.followUpBudget; }
export function consumeDamagingFollowUpV2(b) {
    if (!canGenerateDamagingFollowUpV2(b))
        return b;
    return { ...b, followUpsUsed: b.followUpsUsed + 1 };
}
export function canUseDaoActiveV2(e, dao) { return e.mainDaoId === dao; }
export function canUseDaoCoreV2(e, dao) { return e.mainDaoId === dao; }
export function canLearnDaoPassiveV2(e, dao) { return e.mainDaoId === dao || e.secondaryDaoId === dao; }
export function daoPassiveStrengthV2(e, dao) { return canLearnDaoPassiveV2(e, dao) ? 1 : 0; }
export const SWORD_V2_DEFAULTS = {
    swordQiCap: 5,
    swordQiSkillDamagePctPerStack: 4,
    swordQiBreakPctPerStack: 3,
    swordQiFullFollowUpCoefficient: .40,
    swordQiFullFollowUpSpend: 2,
    swordIntentCap: 20,
    swordIntentDurationSeconds: 12,
    swordIntentDecayEverySeconds: 1,
    swordIntentActionsPerStack: 3,
};
export function createSwordCoreStateV2() { return { swordQi: 0, swordQiCap: SWORD_V2_DEFAULTS.swordQiCap }; }
export function createSwordIntentStateV2(now = 0) { return { id: 'swordIntent', stacks: 0, cap: SWORD_V2_DEFAULTS.swordIntentCap, durationSeconds: SWORD_V2_DEFAULTS.swordIntentDurationSeconds, expiresAt: now, decayEverySeconds: SWORD_V2_DEFAULTS.swordIntentDecayEverySeconds, directActionCounter: 0 }; }
export function addSwordIntentV2(state, amount, now) {
    const gain = Math.max(0, Math.floor(amount));
    if (gain <= 0)
        return state;
    return { ...state, stacks: Math.min(state.cap, state.stacks + gain), expiresAt: now + state.durationSeconds, nextDecayAt: undefined };
}
export function advanceSwordIntentDecayV2(state, now) {
    if (state.stacks <= 0)
        return { ...state, stacks: 0, nextDecayAt: undefined };
    if (now < state.expiresAt)
        return state;
    let next = state.nextDecayAt ?? state.expiresAt + state.decayEverySeconds;
    let stacks = state.stacks;
    while (stacks > 0 && now >= next) {
        stacks--;
        next += state.decayEverySeconds;
    }
    return { ...state, stacks, nextDecayAt: stacks > 0 ? next : undefined };
}
export const REMAINING_DAO_V2_DEFAULTS = {
    fist: { coreCap: 5, passiveStackCap: 20, passiveDurationSeconds: 12 },
    body: { coreCap: 100, passiveStackCap: 20, passiveDurationSeconds: 12 },
    spell: { coreCap: 3, passiveStackCap: 20, passiveDurationSeconds: 12 },
    poison: { coreCap: 4, passiveStackCap: 20, passiveDurationSeconds: 12 },
    artifact: { coreCap: 3, passiveStackCap: 20, passiveDurationSeconds: 12 },
    formation: { nurtureCap: 100, integrityCap: 100, passiveStackCap: 20, passiveDurationSeconds: 12 },
    mind: { echoEvery: 3, echoCoefficient: .35, passiveStackCap: 20, passiveDurationSeconds: 12, flowDurationSeconds: 5 },
};
export function createFistCoreStateV2() { return { fistForce: 0, fistForceCap: REMAINING_DAO_V2_DEFAULTS.fist.coreCap, fistDomainUntil: 0, basicActionCounter: 0, fistDamageBuffUntil: 0, fistDamageBuffPct: 0 }; }
export function createBodyCoreStateV2() { return { counterForce: 0, counterForceCap: REMAINING_DAO_V2_DEFAULTS.body.coreCap }; }
export function createSpellCoreStateV2() {
    return {
        schema: 'spell-dao.runtime.production.v1',
        lawWheelStage: 0,
        expectedForm: 'Tốc Pháp',
        quickCycle: false,
        dienPhapReady: false,
        completedCycles: 0,
        dienPhapCommits: 0,
        wastedReadyCycles: 0,
    };
}
export function createPoisonCoreStateV2() { return { poisonSeedStage: 0, poisonSeedCap: REMAINING_DAO_V2_DEFAULTS.poison.coreCap }; }
export function createArtifactCoreStateV2() { return { artifactSources: 1, artifactSourceCap: REMAINING_DAO_V2_DEFAULTS.artifact.coreCap }; }
export function createFormationCoreStateV2() { return { deployed: false, nurture: 0, nurtureCap: 100, integrity: 0, integrityCap: 100 }; }
export function createMindCoreStateV2() {
    return {
        eligibleActiveCount: 0,
        echoEvery: REMAINING_DAO_V2_DEFAULTS.mind.echoEvery,
        echoCoefficient: REMAINING_DAO_V2_DEFAULTS.mind.echoCoefficient,
        snapshot: undefined,
        flowUntil: 0,
        flowEligibleActiveCount: 0,
        observeResolvedTicks: 0,
        observeEarnedMarks: 0,
    };
}
//# sourceMappingURL=battle-dao-v2-contract.js.map

// Poison-owned target transactions. Pure reads never bind or refresh a target.
export const POISON_PREFIX = 'skill.dao.poison.';
export const poisonMain = e => e?.combatBuildV117?.battleDaoV2Enabled === true && e.combatBuildV117.mainDaoId === 'poison';
export const poisonSkill = (e, s) => poisonMain(e) && s?.id?.startsWith(POISON_PREFIX);
export const poisonStage = (e, targetId) => {
    const c = e.battleDaoStateV2?.poison?.core;
    return c?.targetId === targetId ? c.poisonSeedStage : 0;
};
export function poisonPassiveLevel(e, n) {
    const id = `passive.v2.poison.p${n}`;
    return e.combatBuildV117?.learnedDaoPassiveIdsV118?.includes(id) ? Math.max(1, Math.min(20, e.combatBuildV117.passiveLevelsV125?.[id] ?? 1)) : 0;
}
export const poisonScale = (lv, a, b) => lv ? a + (b-a)*(lv-1)/19 : 0;
export const poisonTier = (e, s) => Math.max(0, Math.min(1000, e.combatBuildV117?.skillPracticeTierV125?.[s.id] ?? 0));
export function preparePoisonAction(e, target, skill, action, now) {
    const data = action.battleDaoV2.daoData ??= {};
    const stage = poisonStage(e, target.id);
    const effect = skill.effects.find(x => x.type === 'consumeMarkDamage');
    data.poisonTransaction = { rootActionId:action.battleDaoV2.rootActionId, targetId:target.id, stageBefore:stage, congTam:stage===4, maxConsume:Math.min(4,effect?.maxConsume??0), committed:false, preparedAt:now };
}
export function poisonPayoffCoefficient(effect, tx, full) {
    const consumed = Math.min(tx?.stageBefore??0, tx?.maxConsume??0);
    return (effect.baseCoefficient + consumed*effect.coefficientPerStack) * (full && tx?.congTam ? 1.5 : 1);
}
export function commitPoisonConsume(e, target, action, hit, full) {
    const tx = action?.battleDaoV2?.daoData?.poisonTransaction;
    const c = e.battleDaoStateV2?.poison?.core;
    if (!hit || !tx || tx.committed || (action.battleDaoV2.procDepth??0)>0 || !poisonMain(e)
        || tx.rootActionId!==action.battleDaoV2.rootActionId || tx.targetId!==target.id || c?.targetId!==target.id || c.poisonSeedStage!==tx.stageBefore) return undefined;
    const consumed = Math.min(tx.stageBefore,tx.maxConsume);
    if (!consumed) return undefined;
    tx.committed=true;
    c.poisonSeedStage=Math.max(0,tx.stageBefore-consumed);
    if (full && tx.congTam) c.poisonSeedStage=Math.max(1,c.poisonSeedStage);
    c.consumeCommits=(c.consumeCommits??0)+1;
    return { consumed,stageBefore:tx.stageBefore,congTam:tx.congTam,full,stageAfter:c.poisonSeedStage,rootActionId:tx.rootActionId };
}
export function poisonDotUtility(e) {
    const st=e.battleDaoStateV2?.poison?.stack;
    if (!poisonPassiveLevel(e,1) || !st?.stacks) return { extraTicks:0,multiplier:1 };
    const p4=poisonPassiveLevel(e,4),p6=poisonPassiveLevel(e,6);
    return {extraTicks:p4 && st.stacks>=10 ? 1 : 0, multiplier:1+Math.floor(st.stacks/10)*poisonScale(p6,.04,.12)};
}
export function poisonObserveRoot(e, skill, action, now, chance) {
    const v2=action?.battleDaoV2;
    if (!v2 || e.combatBuildV117?.battleDaoV2Enabled!==true || v2.poisonObserved || (v2.procDepth??0)>0 || !poisonPassiveLevel(e,1)) return false;
    const eligible=poisonMain(e) ? skill.id.startsWith(POISON_PREFIX) && (v2.directDamagingHitCount>0 || v2.daoData?.poisonApplied) : v2.directDamagingHitCount>0;
    if (!eligible || (!poisonMain(e) && e.combatBuildV117?.secondaryDaoId!=='poison')) return false;
    v2.poisonObserved=true;
    const st=e.battleDaoStateV2?.poison?.stack;
    if (!st) return false;
    st.actionCounter=(st.actionCounter??0)+1;
    let gain=st.actionCounter>=3?1:0;
    st.actionCounter%=3;
    if (chance(poisonScale(poisonPassiveLevel(e,2),8,25))) gain++;
    if (gain) { st.stacks=Math.min(st.cap,st.stacks+gain);st.expiresAt=now+st.durationSeconds;st.nextDecayAt=undefined; }
    return gain>0;
}
export function poisonAutoWindow(e,target,suffix,now) {
    if (!poisonMain(e)) return false;
    const stage=poisonStage(e,target.id),core=e.battleDaoStateV2.poison.core;
    const coverage=core.targetId===target.id ? core.dotUntil??{} : {};
    const hp=e.hp/Math.max(1,e.baseStats.maxHp);
    if (suffix==='guard') return hp<.58 && !(e.shields??[]).some(s=>s.expiresAt>now && s.capacity>0);
    if (suffix==='consume') return stage===4;
    if (suffix==='transform') return stage>=2 && (coverage.mist??0)>now && now-(core.lastApplicationAt??now)>=1.5 && !e.skillIds.includes(POISON_PREFIX+'consume');
    if (suffix==='ultimate') {
        if (e.ultimateGaugeV117<100) { delete e.pendingSetFlagsV117.poisonUltimateHoldUntil;return false; }
        const until=e.pendingSetFlagsV117.poisonUltimateHoldUntil??=now+4;
        return stage===4 || now>=until;
    }
    if (suffix==='insects') return (!target.channeling && !(target.casting && target.casting.resolvesAt-target.casting.startedAt>=.75)) && (stage<4 || (coverage.insects??0)<=now+.5);
    if (suffix==='basic') return true;
    // Refresh near the final three finite ticks; overlap is bounded by real cooldown roots.
    return stage<4 || (coverage[suffix]??0)<=now+3;
}
