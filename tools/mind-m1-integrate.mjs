import fs from 'node:fs';

const lines = xs => xs.join('\n');
function load(path) { return fs.readFileSync(path, 'utf8'); }
function save(path, text) { fs.writeFileSync(path, text); }
function replaceExact(text, label, before, after) {
  const count = text.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly once, found ${count}`);
  return text.replace(before, after);
}
function replaceRange(text, label, startMarker, endMarker, replacement) {
  const start = text.indexOf(startMarker);
  if (start < 0) throw new Error(`${label}: start marker missing`);
  if (text.indexOf(startMarker, start + startMarker.length) >= 0) throw new Error(`${label}: start marker not unique`);
  const end = text.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`${label}: end marker missing`);
  return text.slice(0, start) + replacement + text.slice(end);
}

{
  const path = 'dist/core/battle-dao-v2-runtime.js';
  let text = load(path);
  const contractImport = "import { createArtifactCoreStateV2, createBodyCoreStateV2, createFistCoreStateV2, createFormationCoreStateV2, createMindCoreStateV2, createPoisonCoreStateV2, createSpellCoreStateV2 } from './battle-dao-v2-contract.js';";
  text = replaceExact(text, 'mind helper import', contractImport, contractImport + "\nimport { finishMindRootV2 } from './mind-dao-v2-runtime.js';");
  text = replaceExact(text, 'mind p8 read-owned refresh', lines([
    "            if (dao !== 'fist') {",
    "                st.expiresAt = Math.max(st.expiresAt, now + scale(l8, 1, 2));",
    "                st.nextDecayAt = undefined;",
    "            }",
  ]), lines([
    "            if (dao !== 'fist' && dao !== 'mind') {",
    "                st.expiresAt = Math.max(st.expiresAt, now + scale(l8, 1, 2));",
    "                st.nextDecayAt = undefined;",
    "            }",
  ]));
  text = replaceRange(text, 'mind core finish delegation',
    "    if (main && dao === 'mind' && active) {",
    "    // Passive-stack mechanics are deliberately generic:",
    lines([
      "    if (main && dao === 'mind') {",
      "        const mind = finishMindRootV2(entity, target, skill, action, now);",
      "        out.notices.push(...mind.notices);",
      "        if (mind.flowBonusMarkGain > 0)",
      "            out.notices.push({ message: `${entity.name} Phân Lưu bồi +${mind.flowBonusMarkGain} Thần Ấn.`, data: { mindFlowBonusMarkGain: mind.flowBonusMarkGain, mindMarks: target.marks['Thần Ấn'] ?? 0 } });",
      "        if (mind.echo) {",
      "            const claim = claimDamagingFollowUpV2(action, { kind: 'intrinsic', id: 'intrinsic.v2.mind.echo' });",
      "            if (claim)",
      "                out.followUp = { kind: 'mind', delay: mind.echo.delay, coefficient: mind.echo.coefficient, breakDamagePct: 0, label: 'Niệm Ảnh', payload: mind.echo.packets, payloadId: mind.echo.payloadId, claim };",
      "        }",
      "    }",
      "",
    ])
  );
  text = replaceRange(text, 'mind passive event-owned p8',
    "        else if (passiveDao === 'mind') {",
    "    }\n    return out;",
    lines([
      "        else if (passiveDao === 'mind') {",
      "            const slot = skillSlotClassV117(skill);",
      "            const eligible = slot === 'active' || slot === 'ultimate';",
      "            if (eligible) {",
      "                let gain = slot === 'ultimate' ? 2 : 1;",
      "                if (hasPassiveN(entity, 'mind', 2) && chance(scale(passiveLevelN(entity, 'mind', 2), 10, 30)))",
      "                    gain++;",
      "                addGenericStackV2(entity, 'mind', gain, now);",
      "                const st = holderV2(entity, 'mind')?.stack;",
      "                if (st && st.stacks >= st.cap && hasPassiveN(entity, 'mind', 8))",
      "                    refreshGenericStackV2(entity, 'mind', now);",
      "            }",
      "        }",
      "",
    ])
  );
  text = replaceExact(text, 'hide internal mind cadence projection', lines([
    "    if (s.mind?.core)",
    "        out.mindEchoCounter = s.mind.core.eligibleActiveCount;",
  ]), lines([
    "    if (s.mind?.core && (s.mind.core.flowUntil ?? 0) > now)",
    "        out.mindFlowUntil = s.mind.core.flowUntil;",
  ]));
  save(path, text);
}

{
  const path = 'dist/core/combat.js';
  let text = load(path);
  const daoImport = "import { addPoisonSeedStageV2, battleDaoV2BreakMultiplier, battleDaoV2Enabled, battleDaoV2HealShieldMultiplier, battleDaoV2IncomingDamageMultiplier, battleDaoV2OutgoingMultiplier, consumePoisonSeedStageV2, createBattleDaoRuntimeStateV2, claimDamagingFollowUpV2, finishFistCoreActionV2, finishRemainingDaoActionV2, fistV2EffectsForSkill, onBattleDaoV2HpDamageTaken, onBattleDaoV2Mitigation, v2ResourceProjection, recordDamageOutcomeV2, resolveSwordIntentAfterRootV2, swordIntentBonusesV2, swordQiGenerateAfterActionV2, swordV2CapstoneFollowUp, swordV2ChannelProfile, swordV2CritHeartBonusPct, swordV2DirectDamageMultiplier, swordV2EffectsForSkill, syncBattleDaoV2Timers } from './battle-dao-v2-runtime.js';";
  text = replaceExact(text, 'mind runtime import', daoImport, daoImport + "\nimport { addMindMarksV2, captureMindDamagePacketV2, captureMindHealPacketV2, captureMindShieldPacketV2, mindObserveProgressV2, resolveMindConsumeDamageV2, resolveMindInterfereV2 } from './mind-dao-v2-runtime.js';");

  const effectsPair = lines([
    "        const resolvedEffects = fistV2EffectsForSkill(actor, skill, runtimeAction, pct => this.rng.chance(pct), swordEffects);",
    "        this.resolveEffects(actor, target, resolvedEffects, 'ActiveHit', now, skill.id, cooldownDamageBonusPct, runtimeAction);",
  ]);
  text = replaceExact(text, 'resolve mind interfere at root resolution', effectsPair, lines([
    "        const resolvedEffects = fistV2EffectsForSkill(actor, skill, runtimeAction, pct => this.rng.chance(pct), swordEffects);",
    "        const mindInterfere = resolveMindInterfereV2(actor, target, skill, runtimeAction, now);",
    "        if (mindInterfere.consumed > 0) {",
    "            this.log(now, 'mark', `${actor.name} tiêu hao ${mindInterfere.consumed} tầng Thần Ấn.`, actor.id, target.id, skill.id, { consumed: mindInterfere.consumed, mindMarks: target.marks['Thần Ấn'] ?? 0 });",
    "            this.applyDaoMindDelay(target, mindInterfere.targetCastDelaySeconds, now);",
    "            if (mindInterfere.mentalStaggerSeconds > 0)",
    "                this.applyStatus(actor, target, 'status.mind.interference_stagger', mindInterfere.mentalStaggerSeconds, 1, now, skill.id);",
    "        }",
    "        this.resolveEffects(actor, target, resolvedEffects, 'ActiveHit', now, skill.id, cooldownDamageBonusPct, runtimeAction);",
  ]));

  const channelResolve = "        this.resolveEffects(actor, target, effects, 'ActiveHit', now, skill.id, channel.cooldownDamageBonusPct, channel.runtimeV117);";
  text = replaceExact(text, 'observe progressive channel marks', channelResolve, lines([
    channelResolve,
    "        const observedMarks = mindObserveProgressV2(actor, target, skill, channel.runtimeV117, channel.resolvedHits, channel.totalHits);",
    "        if (observedMarks > 0)",
    "            this.log(now, 'mark', `${actor.name} Quan Tâm tích +${observedMarks} Thần Ấn (${target.marks['Thần Ấn'] ?? 0}/5).`, actor.id, target.id, skill.id, { mindObserveMarkGain: observedMarks, mindMarks: target.marks['Thần Ấn'] ?? 0, resolvedTicks: channel.resolvedHits, totalTicks: channel.totalHits });",
  ]));

  const followSchedule = "            this.schedule({ time: now + remaining.followUp.delay, kind: 'v2FollowUp', actorId: actor.id, targetId: target.id, skillId: skill.id, v2FollowUp: { coefficient: remaining.followUp.coefficient, breakDamagePct: remaining.followUp.breakDamagePct, sourceSkillId: skill.id, label: remaining.followUp.label, claim: remaining.followUp.claim } });";
  text = replaceExact(text, 'carry mind followup payload', followSchedule, "            this.schedule({ time: now + remaining.followUp.delay, kind: 'v2FollowUp', actorId: actor.id, targetId: target.id, skillId: skill.id, v2FollowUp: { kind: remaining.followUp.kind, coefficient: remaining.followUp.coefficient, breakDamagePct: remaining.followUp.breakDamagePct, sourceSkillId: skill.id, label: remaining.followUp.label, payload: remaining.followUp.payload, payloadId: remaining.followUp.payloadId, claim: remaining.followUp.claim } });");

  text = replaceRange(text, 'execute sanitized mind payload',
    "    handleV2FollowUp(actor, target, follow, now) {",
    "    scheduleNextActionAfterRecovery(actor, target, skill, now, runtimeAction) {",
    lines([
      "    handleV2FollowUp(actor, target, follow, now) {",
      "        if (!actor.alive || !target.alive)",
      "            return;",
      "        const sourceSkill = this.registry.skill(follow.sourceSkillId);",
      "        if (follow.kind === 'mind' && Array.isArray(follow.payload)) {",
      "            let damage = 0;",
      "            for (const packet of follow.payload) {",
      "                if (!actor.alive || !target.alive)",
      "                    break;",
      "                if (packet.type === 'damage') {",
      "                    const outcome = this.applyDamage(actor, target, { sourceTag: 'ProcHit', coefficient: Math.max(0, packet.coefficient) * Math.max(0, follow.coefficient), breakDamagePct: Math.max(0, packet.breakDamagePct) * Math.max(0, follow.coefficient), canCrit: packet.canCrit !== false, canDodge: packet.canDodge !== false, canHeart: packet.canHeart !== false, unavoidable: false, trueDamage: false, procCoefficient: 0, skillId: follow.sourceSkillId, elementalCoefficients: undefined, primaryElement: undefined, cooldownDamageBonusPct: 0, runtimeEffectBonusPct: 0, runtimeBreakBonusPct: 0, fiveStatScalingV5: sourceSkill?.fiveStatScalingV5, fiveStatBaselineCoefficientV5: sourceSkill?.fiveStatBaselineCoefficientV5 }, now);",
      "                    damage += outcome.hpDamage;",
      "                }",
      "                else if (packet.type === 'shield') {",
      "                    this.applyDirectShield(actor, actor, { type: 'shield', capacity: Math.max(0, packet.capacity) * follow.coefficient, maxHpPct: Math.max(0, packet.maxHpPct) * follow.coefficient, attackCoefficient: Math.max(0, packet.attackCoefficient) * follow.coefficient, stability: packet.stability, duration: packet.duration }, now, follow.sourceSkillId);",
      "                }",
      "                else if (packet.type === 'heal') {",
      "                    const healTarget = packet.target === 'target' ? target : actor;",
      "                    const srcStats = effectiveStats(actor, this.registry, now);",
      "                    const maxHp = combatMaxHp(healTarget.baseStats);",
      "                    const amount = (Math.max(0, packet.flat) + maxHp * Math.max(0, packet.maxHpPct) / 100 + srcStats.attack * Math.max(0, packet.attackCoefficient)) * follow.coefficient;",
      "                    this.applyHeal(actor, healTarget, amount, now, follow.sourceSkillId);",
      "                }",
      "            }",
      "            this.log(now, 'resource', `${actor.name} phát ${follow.label}.`, actor.id, target.id, follow.sourceSkillId, { ...follow.claim, damage, v2FollowUp: true, mindSnapshot: true, payloadId: follow.payloadId ?? '' });",
      "            return;",
      "        }",
      "        const outcome = this.applyDamage(actor, target, { sourceTag: 'ProcHit', coefficient: Math.max(0, follow.coefficient), breakDamagePct: Math.max(0, follow.breakDamagePct), canCrit: true, canDodge: true, canHeart: true, unavoidable: false, trueDamage: false, procCoefficient: 0, skillId: follow.sourceSkillId, elementalCoefficients: undefined, primaryElement: undefined, cooldownDamageBonusPct: 0, runtimeEffectBonusPct: 0, runtimeBreakBonusPct: 0, fiveStatScalingV5: sourceSkill?.fiveStatScalingV5, fiveStatBaselineCoefficientV5: sourceSkill?.fiveStatBaselineCoefficientV5 }, now);",
      "        this.log(now, 'resource', `${actor.name} phát ${follow.label}.`, actor.id, target.id, follow.sourceSkillId, { ...follow.claim, damage: outcome.hpDamage, v2FollowUp: true });",
      "    }",
      "",
    ])
  );

  text = replaceExact(text, 'capture direct mind damage', lines([
    "                    const outcome = this.applyDamage(source, target, this.damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction), now);",
    "                    recordDamageOutcomeV2(runtimeAction, effect.sourceTag ?? defaultSourceTag, outcome);",
  ]), lines([
    "                    const damageContext = this.damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction);",
    "                    captureMindDamagePacketV2(source, skill, runtimeAction, damageContext);",
    "                    const outcome = this.applyDamage(source, target, damageContext, now);",
    "                    recordDamageOutcomeV2(runtimeAction, effect.sourceTag ?? defaultSourceTag, outcome);",
  ]));

  text = replaceExact(text, 'capture mind heal', lines([
    "                    const base = ((effect.flat ?? 0) + maxHp * ((effect.maxHpPct ?? 0) / 100) + srcStats.attack * (effect.attackCoefficient ?? 0)) * runtimeEffectMultiplier;",
    "                    this.applyHeal(source, healTarget, base, now, skillId);",
  ]), lines([
    "                    const base = ((effect.flat ?? 0) + maxHp * ((effect.maxHpPct ?? 0) / 100) + srcStats.attack * (effect.attackCoefficient ?? 0)) * runtimeEffectMultiplier;",
    "                    captureMindHealPacketV2(source, skill, runtimeAction, effect, runtimeEffectMultiplier);",
    "                    this.applyHeal(source, healTarget, base, now, skillId);",
  ]));

  text = replaceExact(text, 'capture mind shield', lines([
    "                    const scaled = { ...effect, capacity: effect.capacity * shieldRuntimeMultiplier, maxHpPct: (effect.maxHpPct ?? 0) * shieldRuntimeMultiplier, attackCoefficient: (effect.attackCoefficient ?? 0) * shieldRuntimeMultiplier };",
    "                    this.applyDirectShield(source, target, scaled, now, skillId);",
  ]), lines([
    "                    const scaled = { ...effect, capacity: effect.capacity * shieldRuntimeMultiplier, maxHpPct: (effect.maxHpPct ?? 0) * shieldRuntimeMultiplier, attackCoefficient: (effect.attackCoefficient ?? 0) * shieldRuntimeMultiplier };",
    "                    captureMindShieldPacketV2(source, skill, runtimeAction, effect, shieldRuntimeMultiplier);",
    "                    this.applyDirectShield(source, target, scaled, now, skillId);",
  ]));

  text = replaceRange(text, 'canonical mind mark generation',
    "                    if (battleDaoV2Enabled(source) && dao === 'mind' && effect.mark === 'Thần Ấn') {",
    "                    const before = target.marks[effect.mark] ?? 0;",
    lines([
      "                    if (battleDaoV2Enabled(source) && dao === 'mind' && effect.mark === 'Thần Ấn') {",
      "                        if (skill?.id === 'skill.dao.mind.observe')",
      "                            break;",
      "                        const gained = addMindMarksV2(source, target, effect.stacks);",
      "                        if (gained > 0)",
      "                            this.log(now, 'mark', `${target.name} nhận Thần Ấn: ${target.marks['Thần Ấn'] ?? 0}/5.`, source.id, target.id, skillId, { mindMarkGain: gained, mindMarks: target.marks['Thần Ấn'] ?? 0 });",
      "                        break;",
      "                    }",
      "",
    ])
  );

  text = replaceRange(text, 'canonical mind consume damage',
    "                    if (battleDaoV2Enabled(source) && dao === 'mind' && effect.mark === 'Thần Ấn') {",
    "                    const poisonFull = dao === 'poison' && sig === 'poisonConsume'",
    lines([
      "                    if (battleDaoV2Enabled(source) && dao === 'mind' && effect.mark === 'Thần Ấn') {",
      "                        const mind = resolveMindConsumeDamageV2(source, target, skill, effect, runtimeAction);",
      "                        const sealV2 = this.elementalContextV133(source, skill, skill?.elementalCoefficients, runtimeAction);",
      "                        const context = { sourceTag: effect.sourceTag ?? defaultSourceTag, coefficient: mind?.coefficient ?? effect.baseCoefficient, breakDamagePct: mind?.breakDamagePct ?? 0, canCrit: true, canDodge: true, canHeart: true, unavoidable: skill?.unavoidable ?? false, trueDamage: false, procCoefficient: 1, skillId, elementalCoefficients: sealV2.elementalCoefficients, primaryElement: sealV2.primaryElement, cooldownDamageBonusPct, runtimeEffectBonusPct: Math.max(0, runtimeAction?.effectBonusPct ?? 0), runtimeBreakBonusPct: Math.max(0, runtimeAction?.breakBonusPct ?? 0) };",
      "                        captureMindDamagePacketV2(source, skill, runtimeAction, context);",
      "                        this.log(now, 'mark', `${source.name} tiêu hao ${mind?.consumed ?? 0} tầng Thần Ấn.`, source.id, target.id, skillId, { consumed: mind?.consumed ?? 0, mindMarks: target.marks['Thần Ấn'] ?? 0 });",
      "                        const outcome = this.applyDamage(source, target, context, now);",
      "                        recordDamageOutcomeV2(runtimeAction, effect.sourceTag ?? defaultSourceTag, outcome);",
      "                        if (outcome.hpDamage > 0)",
      "                            this.generateBloodBreath(source, outcome.hpDamage, effect.sourceTag ?? defaultSourceTag, now);",
      "                        break;",
      "                    }",
      "",
    ])
  );
  save(path, text);
}

console.log('MIND M1 INTEGRATION PATCH APPLIED');