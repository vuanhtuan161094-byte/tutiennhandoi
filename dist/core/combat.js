import { formationMain, formationLevel, formationScale, createFormationCoreStateV2 } from './battle-dao-v2-contract.js';
import { artifactMain, artifactLevel, artifactScale, artifactTier, commitArtifact, createArtifactCoreStateV2, ARTIFACT_COMMAND_SUFFIXES_V1 } from './battle-dao-v2-contract.js';
import { addGenericStackV2 } from './battle-dao-v2-runtime.js';
import { effectiveStats } from './stats.js';
import { fiveStatSkillPowerV5 } from './combat-rules.js';
import { createPoisonCoreStateV2 } from './battle-dao-v2-contract.js';
import { addPoisonSeedStageV2 } from './battle-dao-v2-runtime.js';
import { poisonSkill, poisonStage, poisonTier, poisonDotUtility, poisonPassiveLevel, poisonScale, poisonPayoffCoefficient, commitPoisonConsume, poisonObserveRoot } from './battle-dao-v2-contract.js';
import { CombatEngine as CombatEngineBaseM2B } from './combat-m2b-base.js';
import { claimDamagingFollowUpV2, recordDamageOutcomeV2 } from './battle-dao-v2-runtime.js';
import {
    MIND_V2_MARK,
    MIND_V2_MARK_CAP,
    captureMindDamagePacketV2,
    mindEchoResolvedV2,
    mindGuardShieldBreakV2,
    mindMasteryBasicFollowUpV2,
    mindMasteryEchoBreakBonusPctV2,
    mindMasteryExtraDirectHitsV2,
    mindMasteryShieldMultiplierV2,
    mindMasteryTierV2,
    resolveMindConsumeDamageV2,
    resolveMindUltimateInterferenceV2,
} from './mind-dao-v2-runtime.js';
import { skillRuntimeV117, skillSlotClassV117 } from './skill-runtime-v117.js';

class PoisonCombatEngine extends CombatEngineBaseM2B {
    instantiate(def) {
        const entity=super.instantiate(def);
        // A new CombatEngine is a new encounter, not an event-queue resume API.
        // Saved Hunt/passive state may carry; target packets/stage cannot.
        const core=entity.battleDaoStateV2?.poison?.core;
        if (core) entity.battleDaoStateV2.poison.core={...createPoisonCoreStateV2(),dotUntil:{},congTamEntries:0,consumeCommits:0};
        return entity;
    }
    resolveEffectAddMarkV141(source,target,effect,tag,now,id,cd,action,skill,...rest) {
        if (!poisonSkill(source,skill)) return super.resolveEffectAddMarkV141(source,target,effect,tag,now,id,cd,action,skill,...rest);
        if (skill.channel || (action?.battleDaoV2?.directDamagingHitCount??0)<=0 && skill.runtimeV117.form!=='deploy') return;
        this.poisonApplyStage(source,target,skill,action,effect.stacks,now);
    }
    poisonApplyStage(source,target,skill,action,amount,now) {
        const data=action.battleDaoV2.daoData??={};
        if (data.poisonStageApplied || (action.battleDaoV2.procDepth??0)>0 || !target.alive) return;
        data.poisonStageApplied=true;data.poisonApplied=true;
        const before=poisonStage(source,target.id),gained=addPoisonSeedStageV2(source,target.id,Math.min(3,amount),now);
        const core=source.battleDaoStateV2.poison.core;
        if (before===0 && core.poisonSeedStage===4) throw new Error('Poison ordinary root skipped setup');
        if (gained>0) core.lastApplicationAt=now;
        if (core.targetId!==data.poisonCoverageTarget) { data.poisonCoverageTarget=core.targetId; }
        if (before<4 && core.poisonSeedStage===4) {
            core.congTamEntries=(core.congTamEntries??0)+1;
            const st=source.battleDaoStateV2.poison.stack,p8=poisonPassiveLevel(source,8);
            if (st?.stacks>=st?.cap && p8) {st.expiresAt=Math.max(st.expiresAt,now+poisonScale(p8,1,2));st.nextDecayAt=undefined;}
        }
        this.log(now,'mark','Độc Chủng application.',source.id,target.id,skill.id,{poisonSeedGain:gained,poisonStageBefore:before,poisonSeedStage:core.poisonSeedStage,poisonCongTamEntry:before<4&&core.poisonSeedStage===4,rootActionId:action.battleDaoV2.rootActionId});
    }
    resolveEffectConsumeMarkDamageV141(source,target,effect,tag,now,id,cd,action,skill,...rest) {
        if (!poisonSkill(source,skill)) return super.resolveEffectConsumeMarkDamageV141(source,target,effect,tag,now,id,cd,action,skill,...rest);
        const tx=action?.battleDaoV2?.daoData?.poisonTransaction;
        if (!tx || tx.payoffResolved || tx.targetId!==target.id || !target.alive || (action.battleDaoV2.procDepth??0)>0) return;
        const core=source.battleDaoStateV2.poison.core;
        if (tx.stageBefore>0 && (core.targetId!==target.id || core.poisonSeedStage!==tx.stageBefore)) return;
        tx.payoffResolved=true;
        const full=!id.endsWith('.transform');
        const ctx=this.damageContextFromEffect(source,{type:'damage',coefficient:poisonPayoffCoefficient(effect,tx,full),breakDamagePct:Math.min(8,tx.stageBefore*2)},tag,skill,id,cd,action);
        const p7=poisonPassiveLevel(source,7),st=source.battleDaoStateV2.poison.stack;
        if (full && tx.congTam && st?.stacks>=20) ctx.coefficient*=1+poisonScale(p7,.04,.10);
        const outcome=this.applyDamage(source,target,ctx,now);
        recordDamageOutcomeV2(action,tag,outcome);
        const commit=commitPoisonConsume(source,target,action,outcome.hit,full);
        this.log(now,'resource','Poison payoff resolution.',source.id,target.id,id,{poisonConsume:commit??null,poisonConsumeMiss:!outcome.hit,poisonPayoffCoefficient:ctx.coefficient,rootActionId:tx.rootActionId});
    }
    resolveEffectDamageOverTimeV141(source,target,effect,tag,now,id,cd,action,skill,...rest) {
        if (!poisonSkill(source,skill)) {
            if (source.combatBuildV117?.battleDaoV2Enabled && source.combatBuildV117?.secondaryDaoId==='poison') {
                const utility=poisonDotUtility(source);
                effect={...effect,coefficientPerTick:effect.coefficientPerTick*utility.multiplier,ticks:Math.min(12,effect.ticks+utility.extraTicks)};
            }
            return super.resolveEffectDamageOverTimeV141(source,target,effect,tag,now,id,cd,action,skill,...rest);
        }
        if ((action?.battleDaoV2?.directDamagingHitCount??0)<=0 && skill.runtimeV117.form!=='deploy') return;
        const data=action.battleDaoV2.daoData??={};
        const packetKey=rest[0]==='mastery'?'completed-insects-mastery':'base';
        data.poisonPackets??={};
        if (data.poisonPackets[packetKey] || (action.battleDaoV2.procDepth??0)>0) return;
        data.poisonPackets[packetKey]=true;
        data.poisonDotApplied=true;data.poisonApplied=true;
        const tier=poisonTier(source,skill),utility=poisonDotUtility(source);
        const ticks=Math.min(12,effect.ticks+utility.extraTicks+(tier>=1000?(id.endsWith('.mist')?2:1):0));
        const power=fiveStatSkillPowerV5(effectiveStats(source,this.registry,now),skill.fiveStatScalingV5,skill.fiveStatBaselineCoefficientV5);
        const suffix=id.split('.').at(-1);
        const core=source.battleDaoStateV2.poison.core;
        core.dotUntil??={};core.dotUntil[suffix]=Math.max(core.dotUntil[suffix]??0,now+ticks*effect.interval);
        const dot={poisonPacket:true,sourceSkillId:id,rootActionId:action.battleDaoV2.rootActionId,procDepth:0,followUpBudget:0,
            coefficient:effect.coefficientPerTick*(1+Math.max(0,action.effectBonusPct??0)/100)*utility.multiplier,
            fiveStatScalingV5:{...skill.fiveStatScalingV5},fiveStatBaselineCoefficientV5:skill.fiveStatBaselineCoefficientV5,snapshotPower:power,
            totalTicks:ticks,remainingTicks:ticks,interval:effect.interval,appliedAt:now};
        this.schedule({time:now+dot.interval,kind:'dotTick',actorId:source.id,targetId:target.id,skillId:id,dot});
        this.log(now,'resource','Finite Poison packet applied.',source.id,target.id,id,{poisonDotApplied:true,poisonScheduledTicks:ticks,poisonDotUntil:now+ticks*dot.interval,poisonMistDeploy:suffix==='mist',rootActionId:dot.rootActionId});
    }
    handleDotTick(source,target,id,dot,now) {
        if (!dot.poisonPacket) return super.handleDotTick(source,target,id,dot,now);
        if (!source.alive || !target.alive) {this.log(now,'info','Poison tick suppressed.',source.id,target.id,id,{poisonSuppressedTick:true});return;}
        const stage=poisonStage(source,target.id);
        const outcome=this.applyDamage(source,target,{sourceTag:'DoT',coefficient:0,flatDamage:dot.snapshotPower*dot.coefficient*(1+stage*.08),breakDamagePct:0,canCrit:false,canDodge:false,canHeart:false,unavoidable:true,trueDamage:false,procCoefficient:0,skillId:id,runtimeEffectBonusPct:0,runtimeBreakBonusPct:0,cooldownDamageBonusPct:0},now);
        if(!target.alive && source.battleDaoStateV2?.poison?.core?.targetId===target.id) {const c=source.battleDaoStateV2.poison.core;c.targetId=undefined;c.poisonSeedStage=0;c.dotUntil={};}
        this.log(now,'resource','Poison tick resolved.',source.id,target.id,id,{poisonResolvedTick:true,poisonDotDamage:outcome.hpDamage,poisonLiveStage:stage,rootActionId:dot.rootActionId});
        if (source.alive&&target.alive&&dot.remainingTicks>1) this.schedule({time:now+dot.interval,kind:'dotTick',actorId:source.id,targetId:target.id,skillId:id,dot:{...dot,remainingTicks:dot.remainingTicks-1}});
    }
    handleChannelEnd(actor,target,id,token,now) {
        const channel=actor.channeling;
        if (id==='skill.dao.poison.insects' && poisonSkill(actor,this.registry.skill(id)) && channel?.token===token && channel.skillId===id && channel.resolvedHits===channel.totalHits && target.alive) {
            const skill=this.registry.skill(id),action=channel.runtimeV117;
            if ((action?.battleDaoV2?.directDamagingHitCount??0)>0) {
                this.poisonApplyStage(actor,target,skill,action,2,now);
                if(poisonTier(actor,skill)>=1000)this.resolveEffectDamageOverTimeV141(actor,target,{coefficientPerTick:.12,ticks:8,interval:1},'ActiveHit',now,id,0,action,skill,'mastery');
            }
            this.log(now,'resource','Vạn Trùng completed.',actor.id,target.id,id,{poisonChannelCompleted:true});
        }
        return super.handleChannelEnd(actor,target,id,token,now);
    }
    finishBattleDaoV2Action(actor,target,skill,action,now) {
        const result=super.finishBattleDaoV2Action(actor,target,skill,action,now);
        const data=action?.battleDaoV2?.daoData;
        if (poisonSkill(actor,skill) && skill.id.endsWith('.basic') && poisonTier(actor,skill)>=1000 && !data?.poisonBasicMasteryProcessed && (action.battleDaoV2.directDamagingHitCount??0)>0 && target.alive) {
            data.poisonBasicMasteryProcessed=true;
            const c=actor.battleDaoStateV2.poison.core;c.basicMasteryCount=(c.basicMasteryCount??0)+1;
            if(c.basicMasteryCount%3===0)this.resolveEffectDamageOverTimeV141(actor,target,{coefficientPerTick:.20,ticks:3,interval:1},'ActiveHit',now,skill.id,0,action,skill);
        }
        if (poisonObserveRoot(actor,skill,action,now,p=>this.rng.chance(p))) this.log(now,'resource','Độc Tức root generation.',actor.id,actor.id,skill.id,{poisonStack:actor.battleDaoStateV2.poison.stack.stacks,rootActionId:action.battleDaoV2.rootActionId});
        const core=actor.battleDaoStateV2?.poison?.core;
        if (core && (!actor.alive || !target.alive && core.targetId===target.id)) {core.targetId=undefined;core.poisonSeedStage=0;core.dotUntil={};}
        return result;
    }
    resolveEffectShieldV141(source,target,effect,tag,now,id,cd,action,skill,...rest) {
        if (poisonSkill(source,skill)) {
            const power=fiveStatSkillPowerV5(effectiveStats(source,this.registry,now),skill.fiveStatScalingV5,skill.fiveStatBaselineCoefficientV5);
            effect={...effect,capacity:effect.capacity*power/100};
        }
        return super.resolveEffectShieldV141(source,target,effect,tag,now,id,cd,action,skill,...rest);
    }
    applyDamage(source,target,ctx,now) {
        const outcome=super.applyDamage(source,target,ctx,now);
        const c=target.battleDaoStateV2?.poison?.core;
        if(c && !target.alive) {c.targetId=undefined;c.poisonSeedStage=0;c.dotUntil={};}
        return outcome;
    }
}

class ArtifactCombatEngine extends PoisonCombatEngine {
    instantiate(def) {
        const e=super.instantiate(def);
        if(e.battleDaoStateV2?.artifact?.core && e.combatBuildV117?.mainDaoId!=='artifact')delete e.battleDaoStateV2.artifact.core;
        if(e.battleDaoStateV2?.artifact?.core && !def.initialBattleDaoStateV2?.artifactHuntCarryV1)e.battleDaoStateV2.artifact.core=createArtifactCoreStateV2();
        const core=e.battleDaoStateV2?.artifact?.core;
        if(core){core.artifactSourceCap=3;core.artifactSources=Math.max(1,Math.min(3,Number.isFinite(core.artifactSources)?core.artifactSources:1));}
        if(e.battleDaoStateV2)delete e.battleDaoStateV2.artifactHuntCarryV1;
        return e;
    }
    resolveEffects(source,target,effects,tag,now,id,cd,action,...rest) {
        const skill=this.registry.skills.get(id),tx=action?.battleDaoV2?.daoData?.artifactTransaction;
        if(artifactMain(source,skill)&&tx){
            if(!tx.valid||tx.payloadResolved||(action.battleDaoV2.procDepth??0)>0)return;
            if(!commitArtifact(source,target,skill,action,now))return;
            tx.payloadResolved=true;
        }
        return super.resolveEffects(source,target,effects,tag,now,id,cd,action,...rest);
    }
    resolveEffectShieldV141(source,target,effect,tag,now,id,cd,action,skill,...rest) {
        if(artifactMain(source,skill)){
            const power=fiveStatSkillPowerV5(effectiveStats(source,this.registry,now),skill.fiveStatScalingV5,skill.fiveStatBaselineCoefficientV5),st=source.battleDaoStateV2.artifact.stack;
            const utility=1+(st?.stacks??0)*artifactScale(artifactLevel(source,4),.0015,.005);
            effect={...effect,capacity:effect.capacity*power/100*utility};
        }
        return super.resolveEffectShieldV141(source,target,effect,tag,now,id,cd,action,skill,...rest);
    }
    finishBattleDaoV2Action(actor,target,skill,action,now) {
        const result=super.finishBattleDaoV2Action(actor,target,skill,action,now),st=actor.battleDaoStateV2?.artifact?.stack;
        const d=st&&action?.battleDaoV2?(action.battleDaoV2.daoData??={}):action?.battleDaoV2?.daoData,tx=d?.artifactTransaction;
        const secondary=actor.combatBuildV117?.secondaryDaoId==='artifact',main=artifactMain(actor,skill),eligible=secondary||main&&tx?.committed;
        if(eligible&&d&&!d.artifactObserved&&(action.battleDaoV2.procDepth??0)===0){
            d.artifactObserved=true;
            if(st&&artifactLevel(actor,1)){
                st.actionCounter=(st.actionCounter??0)+1;let gain=0;
                if(st.actionCounter>=3){gain++;st.actionCounter-=3;}
                const p2=artifactLevel(actor,2);if(p2&&this.rng.chance(artifactScale(p2,10,30)))gain++;
                if(gain)addGenericStackV2(actor,'artifact',gain,now);
            }
            const c=actor.battleDaoStateV2?.artifact?.core;
            if(main&&c&&st?.stacks>=st?.cap&&artifactLevel(actor,8)&&(tx.kind==='merge'||ARTIFACT_COMMAND_SUFFIXES_V1.includes(tx.kind)&&tx.sourceCount>1)){
                st.expiresAt=Math.max(st.expiresAt,now+artifactScale(artifactLevel(actor,8),1,2));st.nextDecayAt=undefined;c.nextFollowupBonusPct=artifactScale(artifactLevel(actor,8),6,15);
            }
        }
        if(main&&tx?.committed&&!tx.followupProcessed&&ARTIFACT_COMMAND_SUFFIXES_V1.includes(tx.kind)&&(action.battleDaoV2.directDamagingHitCount??0)>0){
            tx.followupProcessed=true;
            if(tx.sourceCount>1){
                const claim=claimDamagingFollowUpV2(action,{kind:'intrinsic',id:'intrinsic.v2.artifact.source_followup'});
                if(claim){
                    const c=actor.battleDaoStateV2.artifact.core,tier=artifactTier(actor,skill);
                    const efficiency=1+(tier>=100?.1:0)+(tier>=1000?.15:0)+Math.floor((st?.stacks??0)/10)*artifactScale(artifactLevel(actor,6),.04,.12)+(c.nextFollowupBonusPct??0)/100;
                    const power=fiveStatSkillPowerV5(effectiveStats(actor,this.registry,now),skill.fiveStatScalingV5,skill.fiveStatBaselineCoefficientV5);
                    const follow={kind:'artifactSnapshot',sourceSkillId:skill.id,targetId:target.id,rootActionId:tx.rootActionId,sourceCount:tx.sourceCount,snapshotPower:power,coefficient:(tx.sourceCount-1)*.25*efficiency,procDepth:1,followUpBudget:0,claim};
                    c.nextFollowupBonusPct=0;
                    this.schedule({time:now+.08,kind:'v2FollowUp',actorId:actor.id,targetId:target.id,skillId:skill.id,v2FollowUp:follow});
                    this.log(now,'resource','Khí Linh shared follow-up scheduled.',actor.id,target.id,skill.id,{artifactFollowupScheduled:true,artifactFollowup:follow});
                }
            }
        }
        return result;
    }
    handleV2FollowUp(actor,target,follow,now) {
        if(follow?.kind!=='artifactSnapshot')return super.handleV2FollowUp(actor,target,follow,now);
        if(follow.resolved)return;follow.resolved=true;
        if(!actor.alive||!target.alive||target.id!==follow.targetId){this.log(now,'info','Khí Linh follow-up suppressed.',actor.id,target.id,follow.sourceSkillId,{artifactFollowupSuppressed:true,rootActionId:follow.rootActionId});return;}
        const outcome=this.applyDamage(actor,target,{sourceTag:'ProcHit',coefficient:0,flatDamage:follow.snapshotPower*follow.coefficient,breakDamagePct:0,canCrit:true,canDodge:true,canHeart:false,unavoidable:false,trueDamage:false,procCoefficient:0,skillId:follow.sourceSkillId,runtimeEffectBonusPct:0,runtimeBreakBonusPct:0,cooldownDamageBonusPct:0},now);
        this.log(now,'resource','Khí Linh shared follow-up resolved.',actor.id,target.id,follow.sourceSkillId,{artifactFollowupResolved:true,artifactFollowupDamage:outcome.hpDamage,rootActionId:follow.rootActionId,sourceCount:follow.sourceCount});
    }
}

class FormationCombatEngine extends ArtifactCombatEngine {
    resolveEffects(source,target,effects,tag,now,id,cd,action,...rest) {
        const skill=this.registry.skills.get(id),tx=action?.battleDaoV2?.daoData?.formationTransaction;
        if(formationMain(source,skill) && !skill.channel && tx){
            if(!tx.valid || tx.payloadResolved || (['basic','small_activate','full_activate','ultimate'].includes(tx.kind) && (!target.alive || target.id!==tx.targetId)))return;
            tx.payloadResolved=true;
        }
        return super.resolveEffects(source,target,effects,tag,now,id,cd,action,...rest);
    }
    resolveEffectShieldV141(source,target,effect,tag,now,id,cd,action,skill,...rest) {
        if(formationMain(source,skill)){
            const power=fiveStatSkillPowerV5(effectiveStats(source,this.registry,now),skill.fiveStatScalingV5,skill.fiveStatBaselineCoefficientV5);
            effect={...effect,capacity:effect.capacity*power/100};
        }
        return super.resolveEffectShieldV141(source,target,effect,tag,now,id,cd,action,skill,...rest);
    }
    instantiate(def) {
        const e=super.instantiate(def);
        if(e.battleDaoStateV2?.formation?.core && !def.initialBattleDaoStateV2?.formationHuntCarryV1) e.battleDaoStateV2.formation.core=createFormationCoreStateV2();
        if(e.battleDaoStateV2)delete e.battleDaoStateV2.formationHuntCarryV1;
        return e;
    }
    handleChannelEnd(actor,target,id,token,now) {
        const ch=actor.channeling;
        if(id==='skill.dao.formation.nourish' && ch?.token===token && ch.resolvedHits===ch.totalHits && ch.totalHits>0 && ch.runtimeV117?.battleDaoV2) ch.runtimeV117.battleDaoV2.daoData.formationChannelCompleted=true;
        return super.handleChannelEnd(actor,target,id,token,now);
    }
    finishBattleDaoV2Action(actor,target,skill,action,now) {
        const result=super.finishBattleDaoV2Action(actor,target,skill,action,now);
        const st=actor.battleDaoStateV2?.formation?.stack;
        const d=st && action?.battleDaoV2 ? (action.battleDaoV2.daoData??={}) : action?.battleDaoV2?.daoData;
        const secondary=actor.combatBuildV117?.secondaryDaoId==='formation';
        const eligible=secondary || formationMain(actor,skill) && d?.formationTransaction?.committed;
        if(st && formationLevel(actor,1) && d && !d.formationObserved && eligible && (action.battleDaoV2.procDepth??0)===0){
            d.formationObserved=true;
            if(st.lastSkillId!==skill.id){
                st.lastSkillId=skill.id;
                let gain=1;
                const p2=formationLevel(actor,2);
                if(p2 && this.rng.chance(formationScale(p2,10,30)))gain++;
                addGenericStackV2(actor,'formation',gain,now);
                if(!secondary && st.stacks>=st.cap && d.formationTransaction?.grand && formationLevel(actor,8)){st.expiresAt=Math.max(st.expiresAt,now+formationScale(formationLevel(actor,8),1,2));st.nextDecayAt=undefined;}
            }
        }
        return result;
    }
}

function isMainMindSkillV2(source, skill) {
    return Boolean(skill)
        && source?.combatBuildV117?.battleDaoV2Enabled === true
        && source?.combatBuildV117?.mainDaoId === 'mind'
        && skillRuntimeV117(skill).daoBinding === 'mind';
}

/**
 * M2C Thần Niệm mastery seam.
 *
 * combat-m2b-base.js is the closed M1/M2A/M2B owner. This wrapper adds only
 * authored Mind mastery behavior and one proven M1 Ultimate-control repair.
 */
export class CombatEngine extends FormationCombatEngine {
    damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction) {
        const ctx = super.damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction);
        const masteryArmorPen = Math.max(0, Number(effect?.mindMasteryArmorPenBonusPct ?? 0));
        if (masteryArmorPen > 0)
            ctx.runtimeArmorPenBonusPct = Math.max(0, Number(ctx.runtimeArmorPenBonusPct ?? 0)) + masteryArmorPen;
        return ctx;
    }

    resolveEffectDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {
        const result = super.resolveEffectDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);
        if (!target.alive || !isMainMindSkillV2(source, skill) || defaultSourceTag !== 'ActiveHit' || (runtimeAction?.battleDaoV2?.procDepth ?? 0) !== 0)
            return result;
        for (const packet of mindMasteryExtraDirectHitsV2(source, skill, runtimeAction)) {
            if (!source.alive || !target.alive)
                break;
            const extraEffect = {
                ...effect,
                coefficient: Math.max(0, Number(packet.coefficient ?? 0)),
                breakDamagePct: Math.max(0, Number(packet.breakDamagePct ?? 0)),
                mindMasteryArmorPenBonusPct: Math.max(0, Number(packet.armorPenBonusPct ?? 0)),
            };
            super.resolveEffectDamageV141(source, target, extraEffect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);
        }
        return result;
    }

    resolveEffectConsumeMarkDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {
        if (!isMainMindSkillV2(source, skill) || skill.id !== 'skill.dao.mind.ultimate' || effect?.mark !== MIND_V2_MARK)
            return super.resolveEffectConsumeMarkDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);

        const tx = resolveMindConsumeDamageV2(source, target, skill, effect, runtimeAction);
        if (!tx)
            return;
        this.log(now, 'mark', `${source.name} tiêu hao ${tx.consumed} tầng ${MIND_V2_MARK}.`, source.id, target.id, skillId, {
            consumed: tx.consumed,
            mindSealBefore: tx.before,
            mindSealAfter: tx.after,
            mindSealCap: MIND_V2_MARK_CAP,
            mindV2: true,
        });

        const interference = resolveMindUltimateInterferenceV2(source, target, skill, tx, now);
        if (interference.targetCastDelaySeconds > 0)
            this.applyDaoMindDelay(target, interference.targetCastDelaySeconds, now);
        if (interference.mentalPulseSeconds > 0)
            this.applyStatus(source, target, 'status.mind.interference_stagger', interference.mentalPulseSeconds, 1, now, skill.id);

        const sealV2 = this.elementalContextV133(source, skill, skill.elementalCoefficients, runtimeAction);
        const ctx = {
            sourceTag: effect.sourceTag ?? defaultSourceTag,
            coefficient: tx.coefficient,
            breakDamagePct: tx.breakDamagePct,
            canCrit: true,
            canDodge: true,
            canHeart: true,
            unavoidable: skill.unavoidable ?? false,
            trueDamage: false,
            procCoefficient: 1,
            skillId,
            elementalCoefficients: sealV2.elementalCoefficients,
            primaryElement: sealV2.primaryElement,
            cooldownDamageBonusPct,
            runtimeEffectBonusPct: Math.max(0, runtimeAction?.effectBonusPct ?? 0),
            runtimeBreakBonusPct: Math.max(0, runtimeAction?.breakBonusPct ?? 0),
            mindRootActionV2: runtimeAction,
        };
        captureMindDamagePacketV2(source, skill, runtimeAction, ctx);
        const outcome = this.applyDamage(source, target, ctx, now);
        recordDamageOutcomeV2(runtimeAction, effect.sourceTag ?? defaultSourceTag, outcome);
        if (outcome.hpDamage > 0)
            this.generateBloodBreath(source, outcome.hpDamage, effect.sourceTag ?? defaultSourceTag, now);
    }

    resolveEffectShieldV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {
        if (!isMainMindSkillV2(source, skill) || skill.id !== 'skill.dao.mind.guard')
            return super.resolveEffectShieldV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);
        const multiplier = mindMasteryShieldMultiplierV2(source, skill);
        const authored = multiplier === 1 ? effect : {
            ...effect,
            capacity: Math.max(0, Number(effect.capacity ?? 0)) * multiplier,
            maxHpPct: Math.max(0, Number(effect.maxHpPct ?? 0)) * multiplier,
            attackCoefficient: Math.max(0, Number(effect.attackCoefficient ?? 0)) * multiplier,
        };
        const before = source.shields.length;
        const result = super.resolveEffectShieldV141(source, target, authored, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);
        if (mindMasteryTierV2(source, skill) >= 250) {
            for (const shield of source.shields.slice(before))
                shield.mindGuardMasteryRootEligible = true;
        }
        return result;
    }

    absorbWithShields(source, target, incoming, now, skillId, sourceTag = 'Environment') {
        const candidates = target.shields.filter(shield => shield.mindGuardMasteryRootEligible === true && shield.capacity > 0 && shield.expiresAt > now);
        const absorbed = super.absorbWithShields(source, target, incoming, now, skillId, sourceTag);
        for (const shield of candidates) {
            if (shield.capacity > 0 || shield.mindGuardMasteryRewarded)
                continue;
            shield.mindGuardMasteryRewarded = true;
            const gained = mindGuardShieldBreakV2(target, now);
            if (gained > 0)
                this.log(now, 'resource', `${target.name} hộ thức vỡ, tích +${gained} Niệm Lực.`, target.id, target.id, shield.sourceSkillId, {
                    mindGuardMasteryStackGain: gained,
                    mindPassiveStack: target.battleDaoStateV2?.mind?.stack?.stacks ?? 0,
                    mindV2: true,
                });
        }
        return absorbed;
    }

    handleChannelEnd(actor, target, skillId, token, now) {
        const channel = actor.channeling;
        if (channel?.token === token && channel.skillId === skillId && skillId === 'skill.dao.mind.observe') {
            const skill = this.registry.skill(skillId);
            const complete = (channel.resolvedHits ?? 0) >= (channel.totalHits ?? 0) && (channel.totalHits ?? 0) > 0;
            if (complete && channel.runtimeV117?.battleDaoV2) {
                channel.runtimeV117.battleDaoV2.mindObserveCompleted = true;
                if (mindMasteryTierV2(actor, skill) >= 1000 && !channel.runtimeV117.battleDaoV2.mindObserveExtremeExtraHitIssued) {
                    channel.runtimeV117.battleDaoV2.mindObserveExtremeExtraHitIssued = true;
                    this.resolveEffects(actor, target, skill.channel?.effects ?? [], 'ActiveHit', now, skill.id, channel.cooldownDamageBonusPct, channel.runtimeV117);
                }
            }
        }
        return super.handleChannelEnd(actor, target, skillId, token, now);
    }

    finishBattleDaoV2Action(actor, target, skill, action, now) {
        const beforeFollowUps = Math.max(0, Number(action?.battleDaoV2?.followUpsUsed ?? 0));
        const result = super.finishBattleDaoV2Action(actor, target, skill, action, now);
        if (!isMainMindSkillV2(actor, skill) || !action?.battleDaoV2)
            return result;

        const masteryStackGain = Math.max(0, Number(action.battleDaoV2.mindMasteryStackGainResolved ?? 0));
        if (masteryStackGain > 0)
            this.log(now, 'resource', `${actor.name} nhận thêm +${masteryStackGain} Niệm Lực từ Thuần Thục.`, actor.id, actor.id, skill.id, {
                mindMasteryStackGain: masteryStackGain,
                mindPassiveStack: actor.battleDaoStateV2?.mind?.stack?.stacks ?? 0,
                mindV2: true,
            });

        if (skillSlotClassV117(skill) !== 'basic') {
            const afterFollowUps = Math.max(0, Number(action.battleDaoV2.followUpsUsed ?? 0));
            if (afterFollowUps > beforeFollowUps) {
                const core = actor.battleDaoStateV2?.mind?.core;
                if (core)
                    core.nextEchoBonusPct = 0;
            }
            return result;
        }

        if (!target.alive)
            return result;
        const follow = mindMasteryBasicFollowUpV2(actor, skill, action, pct => this.rng.chance(pct));
        if (!follow)
            return result;
        const claim = claimDamagingFollowUpV2(action, { kind: 'intrinsic', id: 'intrinsic.v2.mind.mastery.basic_needle' });
        if (!claim)
            return result;
        this.schedule({
            time: now + follow.delay,
            kind: 'v2FollowUp',
            actorId: actor.id,
            targetId: target.id,
            skillId: skill.id,
            v2FollowUp: {
                kind: 'mindMasteryBasic',
                sourceSkillId: skill.id,
                targetId: target.id,
                label: 'Niệm Châm bồi',
                coefficient: follow.coefficient,
                breakDamagePct: follow.breakDamagePct,
                gaugeGain: follow.gaugeGain,
                claim,
            },
        });
        return result;
    }

    handleV2FollowUp(actor, target, follow, now) {
        if (follow?.kind === 'mindMasteryBasic') {
            if (!actor.alive || !target.alive || (follow.targetId && follow.targetId !== target.id))
                return;
            const outcome = this.applyDamage(actor, target, {
                sourceTag: 'ProcHit',
                coefficient: Math.max(0, Number(follow.coefficient ?? 0)),
                breakDamagePct: Math.max(0, Number(follow.breakDamagePct ?? 0)),
                canCrit: true,
                canDodge: true,
                canHeart: true,
                unavoidable: false,
                trueDamage: false,
                procCoefficient: 0,
                skillId: follow.sourceSkillId,
                elementalCoefficients: undefined,
                primaryElement: undefined,
                cooldownDamageBonusPct: 0,
                runtimeEffectBonusPct: 0,
                runtimeBreakBonusPct: 0,
            }, now);
            let gaugeGain = 0;
            if (outcome.hit && Math.max(0, Number(follow.gaugeGain ?? 0)) > 0) {
                const before = Math.max(0, Number(actor.ultimateGaugeV117 ?? 0));
                actor.ultimateGaugeV117 = Math.min(100, before + Math.max(0, Number(follow.gaugeGain ?? 0)));
                gaugeGain = actor.ultimateGaugeV117 - before;
            }
            this.log(now, 'resource', `${actor.name} phát ${follow.label}.`, actor.id, target.id, follow.sourceSkillId, {
                ...follow.claim,
                damage: outcome.hpDamage,
                gaugeGain,
                v2FollowUp: true,
                mindMastery: true,
                mindV2: true,
            });
            return;
        }

        if (follow?.kind === 'mindSnapshot') {
            const masteryBreakPct = mindMasteryEchoBreakBonusPctV2(actor, target, follow.sourceSkillId);
            const authored = masteryBreakPct > 0 ? {
                ...follow,
                payload: (follow.payload ?? []).map(packet => packet?.type === 'damage'
                    ? { ...packet, breakDamagePct: Math.max(0, Number(packet.breakDamagePct ?? 0)) * (1 + masteryBreakPct / 100) }
                    : packet),
            } : follow;
            const valid = actor.alive && target.alive && (!follow.targetId || follow.targetId === target.id);
            const result = super.handleV2FollowUp(actor, target, authored, now);
            if (valid)
                mindEchoResolvedV2(actor);
            return result;
        }

        return super.handleV2FollowUp(actor, target, follow, now);
    }
}
