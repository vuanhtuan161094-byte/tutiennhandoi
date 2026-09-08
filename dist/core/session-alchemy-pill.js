import { daoSuyStatusV127 } from './dao-suy-v127.js';
import { WORLD_YEARS_PER_REAL_HOUR } from './realtime-balance.js';
import { cultivationRealmV140 } from './cultivation-v140.js';
import { majorRealmIndexForRealmOrder } from '../content/realm-maps.js';
import { ALCHEMY_BUFF_DURATION_REAL_MINUTES, ALCHEMY_BUFF_PILL_DAILY_CAP, ALCHEMY_DAO_SUY_PILL_CAP_PER_MAJOR_REALM, ALCHEMY_LIFESPAN_PILL_CAP_PCT, ALCHEMY_TEMP_STAT_PILL_CAP_PER_TIER, activeAlchemyBuff, alchemyCombatBuffEffect, alchemyDaoSuyPillRelief, alchemyForbiddenPillCost, alchemyInjuryPillHeal, alchemyLifespanPillPct, alchemyPillName, alchemyPillRealmEfficiency, alchemyPermanentStatGain, alchemyTemporaryStatGain, daoPillStat, emptyAlchemyAllocation, ensureAlchemyV112State, isAlchemyBuffFamily, lifePillStat, parseAlchemyPillResourceId, permanentPillCap, syncAlchemyBuffDailyQuota } from './alchemy-v112.js';
import { PILL_QUALITY_MULTIPLIER } from './recovery.js';
import { reincarnationTreeRuntimeModifierV136 } from './reincarnation-progression-v1102.js';
import {
    ALCHEMY_V146_CULTIVATION_PILL_CAP_PER_MAJOR_REALM,
    ALCHEMY_V146_PERMANENT_PILL_CAP_PER_FAMILY_MAJOR_LIFE,
    alchemyCultivationPillRawGainV146,
    alchemyPermanentFamilyStatV146,
    alchemyPermanentQuotaKeyV146,
    alchemyPermanentRawGainV146,
    alchemyPillNameV146,
    parseAlchemyPillResourceIdV146,
} from './alchemy-v146.js';

function currentMajorRealmIndexV146(state) {
    const order = Math.max(0, Math.floor(Number(state?.realm?.maxRealmOrder) || 0));
    return order <= 0 ? 0 : majorRealmIndexForRealmOrder(order);
}

function v146RealmEfficiency(currentMajor, pillMajor) {
    const current = Math.max(0, Math.floor(Number(currentMajor) || 0));
    const pill = Math.max(0, Math.floor(Number(pillMajor) || 0));
    if (pill > current) return 0;
    const gap = current - pill;
    if (gap <= 0) return 1;
    if (gap === 1) return .4;
    if (gap === 2) return .1;
    return 0;
}

function pillDisplayName(desc, isV146) {
    return isV146
        ? alchemyPillNameV146(desc.family, desc.majorRealmIndex, desc.quality)
        : alchemyPillName(desc.family, desc.realmTier, desc.quality);
}

// V146 canonical pill consumer. V112 IDs remain readable for old saves, but new V146 IDs own
// realm-indexed pills and the permanent Công/HP/Phòng loop.
export function useSessionAlchemyPillV141(resourceId) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const v146Desc = parseAlchemyPillResourceIdV146(resourceId);
        const legacyDesc = v146Desc ? undefined : parseAlchemyPillResourceId(resourceId);
        const desc = v146Desc ?? legacyDesc;
        if (!desc)
            throw new Error(`Không phải Đan Dược canonical: ${resourceId}`);
        const isV146 = Boolean(v146Desc);
        const count = Math.max(0, Math.floor(this.stateValue.inventory[resourceId] ?? 0));
        if (count <= 0)
            throw new Error('Không còn viên đan này.');
        const currentMajor = currentMajorRealmIndexV146(this.stateValue);
        const legacyCurrentTier = this.currentAlchemyTier();
        const eff = isV146
            ? v146RealmEfficiency(currentMajor, desc.majorRealmIndex)
            : alchemyPillRealmEfficiency(legacyCurrentTier, desc.realmTier);
        if (eff <= 0)
            throw new Error('Đan thấp hơn cảnh giới hiện tại quá xa hoặc vượt quá cảnh giới hiện tại nên vô hiệu.');
        const alchemy = ensureAlchemyV112State(this.stateValue.economy), qualityMultiplier = PILL_QUALITY_MULTIPLIER[desc.quality];
        let summary = '';
        let effect = {};
        if (desc.family === 'cultivation') {
            const majorKey = String(currentMajor);
            const used = Math.max(0, Math.floor(alchemy.life.cultivationPillsUsedByMajorRealm[majorKey] ?? 0));
            if (used >= ALCHEMY_V146_CULTIVATION_PILL_CAP_PER_MAJOR_REALM)
                throw new Error(`Đại cảnh hiện tại đã hấp thu đủ ${ALCHEMY_V146_CULTIVATION_PILL_CAP_PER_MAJOR_REALM} Tu Vi Đan.`);
            if (isV146 && desc.majorRealmIndex !== currentMajor)
                throw new Error('Tu Vi Đan V146 phải đúng đại cảnh hiện tại; Đan cũ không thể thay Tu Luyện của cảnh mới.');
            const required = Math.max(1, cultivationRealmV140(this.stateValue.realm.maxRealmOrder).requiredTuVi);
            const pillTreePct = reincarnationTreeRuntimeModifierV136(this.stateValue.inheritedOrigins, 'cultivation.cultivationPillGainPct');
            const requestedGain = alchemyCultivationPillRawGainV146(required, Math.max(1, currentMajor), desc.quality, pillTreePct) * (isV146 ? 1 : eff);
            const granted = this.grantTuViV140(requestedGain, 'alchemy-pill');
            const gain = Math.max(0, Number(granted.gained ?? requestedGain) || 0);
            alchemy.life.cultivationPillsUsedByMajorRealm[majorKey] = used + 1;
            alchemy.telemetry.cultivationPillsConsumed++;
            effect = { gain, usedAfter: used + 1, cap: ALCHEMY_V146_CULTIVATION_PILL_CAP_PER_MAJOR_REALM, majorRealmIndex: currentMajor };
            summary = `Tu Vi +${gain.toFixed(0)} · hấp thu ${used + 1}/${ALCHEMY_V146_CULTIVATION_PILL_CAP_PER_MAJOR_REALM}`;
        }
        else if (desc.family === 'daoSuy') {
            const status = daoSuyStatusV127(this.stateValue.immortal, this.stateValue.realm.maxRealmOrder, this.stateValue.inheritedOrigins);
            if (!status.active)
                throw new Error('Tĩnh Suy Đan chỉ có tác dụng từ Nhân Tiên trở lên.');
            if (status.value <= 1e-9)
                throw new Error('Hiện không có Đạo Suy cần hóa giải.');
            const majorKey = String(currentMajor);
            const used = Math.max(0, Math.floor(alchemy.life.daoSuyPillsUsedByMajorRealm[majorKey] ?? 0));
            if (used >= ALCHEMY_DAO_SUY_PILL_CAP_PER_MAJOR_REALM)
                throw new Error(`Đại cảnh hiện tại đã dùng đủ ${ALCHEMY_DAO_SUY_PILL_CAP_PER_MAJOR_REALM} Tĩnh Suy Đan.`);
            const before = status.value;
            const requested = alchemyDaoSuyPillRelief(desc.quality) * eff;
            this.stateValue.immortal.daoSuy = Math.max(0, before - requested);
            const after = this.stateValue.immortal.daoSuy;
            const relief = before - after;
            alchemy.life.daoSuyPillsUsedByMajorRealm[majorKey] = used + 1;
            alchemy.telemetry.daoSuyPillsConsumed++;
            effect = { before, after, relief, requestedRelief: requested, usedAfter: used + 1, cap: ALCHEMY_DAO_SUY_PILL_CAP_PER_MAJOR_REALM, realmEfficiency: eff };
            summary = `Đạo Suy -${relief.toFixed(1)} → ${after.toFixed(1)}/100 · ${used + 1}/${ALCHEMY_DAO_SUY_PILL_CAP_PER_MAJOR_REALM} viên đại cảnh này`;
        }
        else if (desc.family === 'injury') {
            const before = Math.max(0, Math.min(100, this.stateValue.injury));
            if (before <= 0)
                throw new Error('Hiện không có Thương Thế cần trị.');
            const requested = alchemyInjuryPillHeal(Math.max(1, isV146 ? Math.min(8, Math.ceil(desc.majorRealmIndex / 4)) : desc.realmTier), desc.quality) * eff, heal = Math.min(before, requested);
            this.stateValue.injury = Math.max(0, before - heal);
            alchemy.telemetry.injuryPillsConsumed++;
            effect = { injuryBefore: before, injuryReduced: heal, injuryAfter: this.stateValue.injury };
            summary = `Thương Thế -${heal.toFixed(1)} → ${this.stateValue.injury.toFixed(1)}/100`;
        }
        else if (isAlchemyBuffFamily(desc.family)) {
            syncAlchemyBuffDailyQuota(alchemy, Date.now());
            const active = activeAlchemyBuff(alchemy, this.stateValue.worldTimeYears);
            if (active)
                throw new Error(`Đang còn hiệu lực ${alchemyPillName(active.family, active.realmTier, active.quality)}; mỗi thời điểm chỉ duy trì 1 Đan buff.`);
            if (alchemy.life.buffDaily.used >= ALCHEMY_BUFF_PILL_DAILY_CAP)
                throw new Error(`Hôm nay đã dùng đủ ${ALCHEMY_BUFF_PILL_DAILY_CAP} Đan buff.`);
            const compatibilityTier = isV146 ? Math.max(1, Math.min(8, Math.ceil(desc.majorRealmIndex / 4))) : desc.realmTier;
            const stats = alchemyCombatBuffEffect(desc.family, compatibilityTier, desc.quality, eff), durationYears = ALCHEMY_BUFF_DURATION_REAL_MINUTES / 60 * WORLD_YEARS_PER_REAL_HOUR;
            const buff = { family: desc.family, realmTier: compatibilityTier, majorRealmIndex: isV146 ? desc.majorRealmIndex : undefined, quality: desc.quality, startedWorldYear: this.stateValue.worldTimeYears, expiresWorldYear: this.stateValue.worldTimeYears + durationYears, ...stats };
            alchemy.life.activeBuff = buff;
            alchemy.life.buffDaily.used++;
            alchemy.telemetry.buffPillsConsumed++;
            let penalty = undefined;
            if (desc.family === 'forbidden') {
                const cost = alchemyForbiddenPillCost(desc.quality);
                this.stateValue.injury = Math.min(100, this.stateValue.injury + cost.injury);
                penalty = { injury: cost.injury, injuryAfter: this.stateValue.injury };
            }
            effect = { buff: { ...buff }, dailyUsed: alchemy.life.buffDaily.used, dailyCap: ALCHEMY_BUFF_PILL_DAILY_CAP, penalty };
            const statBits = [stats.powerFlat ? `Công +${stats.powerFlat}` : '', stats.bodyFlat ? `Khí Huyết +${stats.bodyFlat * 20}` : '', stats.defenseFlat ? `Phòng +${stats.defenseFlat}` : '', stats.spiritFlat ? `Chân Nguyên +${stats.spiritFlat}` : ''].filter(Boolean).join(' · ');
            summary = `${statBits} trong ${ALCHEMY_BUFF_DURATION_REAL_MINUTES} phút · hôm nay ${alchemy.life.buffDaily.used}/${ALCHEMY_BUFF_PILL_DAILY_CAP}${penalty ? ` · phản phệ Thương Thế +${penalty.injury}` : ''}`;
        }
        else if (desc.family === 'lifespan') {
            const baseNow = Math.max(1, this.stateValue.lifespanYears - alchemy.life.lifespanPillBonusYears);
            alchemy.life.maxBaseLifespanObserved = Math.max(alchemy.life.maxBaseLifespanObserved, baseNow);
            const cap = alchemy.life.maxBaseLifespanObserved * ALCHEMY_LIFESPAN_PILL_CAP_PCT, remaining = Math.max(0, cap - alchemy.life.lifespanPillBonusYears);
            if (remaining <= 1e-9)
                throw new Error('Thọ Nguyên Đan đã đạt giới hạn +10% lifespan cơ sở của đời này.');
            const requested = alchemy.life.maxBaseLifespanObserved * alchemyLifespanPillPct(desc.quality) * eff, gain = Math.min(remaining, requested);
            this.stateValue.lifespanYears += gain;
            alchemy.life.lifespanPillBonusYears += gain;
            alchemy.telemetry.lifespanPillsConsumed++;
            effect = { gain, cap, used: alchemy.life.lifespanPillBonusYears };
            summary = `Thọ Nguyên +${gain.toFixed(2)} năm (${(alchemy.life.lifespanPillBonusYears / cap * 100).toFixed(0)}% hạn mức đời)`;
        }
        else if (isV146 && alchemyPermanentFamilyStatV146(desc.family)) {
            const quotaKey = alchemyPermanentQuotaKeyV146(desc.family, desc.majorRealmIndex);
            const used = Math.max(0, Math.floor(alchemy.life.temporaryStatPillsUsedByTier[quotaKey] ?? 0));
            const cap = ALCHEMY_V146_PERMANENT_PILL_CAP_PER_FAMILY_MAJOR_LIFE;
            if (used >= cap)
                throw new Error(`${pillDisplayName(desc, true)} đời này đã dùng đủ ${cap} viên ở ${desc.majorRealmIndex === 0 ? 'Phàm Nhân' : `đại cảnh ${desc.majorRealmIndex}`}. Luân Hồi sẽ mở lại quota; stat đã hấp thu không mất.`);
            if (desc.majorRealmIndex > currentMajor)
                throw new Error('Chưa đạt đại cảnh tương ứng nên chưa thể hấp thu viên Đan này.');
            const stat = alchemyPermanentFamilyStatV146(desc.family);
            const gain = alchemyPermanentRawGainV146(desc.family, Math.max(1, desc.majorRealmIndex), desc.quality);
            const perm = this.metaValue.reincarnationProgress.alchemyPermanentStats ?? (this.metaValue.reincarnationProgress.alchemyPermanentStats = emptyAlchemyAllocation());
            if (stat === 'attack') perm.power = Math.max(0, Number(perm.power) || 0) + gain;
            else if (stat === 'maxHp') {
                // Existing combat compatibility stores body in physique units (1 body = 20 Max HP).
                // V146 is player-facing raw HP; hpRawV146 preserves the authored number for provenance/UI.
                perm.body = Math.max(0, Number(perm.body) || 0) + gain / 20;
                perm.hpRawV146 = Math.max(0, Number(perm.hpRawV146) || 0) + gain;
            }
            else if (stat === 'defense') perm.defense = Math.max(0, Number(perm.defense) || 0) + gain;
            alchemy.life.temporaryStatPillsUsedByTier[quotaKey] = used + 1;
            alchemy.telemetry.permanentPillsConsumed++;
            const label = stat === 'attack' ? 'Công' : stat === 'maxHp' ? 'HP' : 'Phòng';
            effect = { stat, gain, permanent: true, majorRealmIndex: desc.majorRealmIndex, usedAfter: used + 1, cap };
            summary = `${label} vĩnh viễn +${gain.toLocaleString('vi-VN')} · đời này ${used + 1}/${cap} viên tại đại cảnh này`;
        }
        else {
            // V112 compatibility only. New V146 production no longer authors temporary stat pills or Đạo Đan.
            const lifeStat = lifePillStat(desc.family), daoStat = daoPillStat(desc.family);
            if (lifeStat) {
                const key = `${desc.family}.t${desc.realmTier}`, used = Math.max(0, Math.floor(Math.max(alchemy.life.temporaryStatPillsUsedByTier[key] ?? 0, alchemy.life.temporaryStatPillsUsedByTier[String(desc.realmTier)] ?? 0)));
                if (used >= ALCHEMY_TEMP_STAT_PILL_CAP_PER_TIER)
                    throw new Error(`${alchemyPillName(desc.family, desc.realmTier, desc.quality)} đã chạm hạn mức legacy ${ALCHEMY_TEMP_STAT_PILL_CAP_PER_TIER} viên.`);
                const gain = alchemyTemporaryStatGain(desc.realmTier, desc.quality) * eff;
                alchemy.life.lifeStatBonus[lifeStat] += gain;
                alchemy.life.temporaryStatPillsUsedByTier[key] = used + 1;
                alchemy.telemetry.temporaryStatPillsConsumed++;
                effect = { stat: lifeStat, gain, usedAfter: used + 1, cap: ALCHEMY_TEMP_STAT_PILL_CAP_PER_TIER, legacy: true };
                summary = `Đan legacy đời hiện tại +${gain}`;
            }
            else if (daoStat) {
                const cap = permanentPillCap(alchemy.rank, alchemy.turn, this.alchemyProductionModifiersV85().permanentPillCapFlat ?? 0);
                if (alchemy.life.permanentPillsUsed >= cap)
                    throw new Error(`Đã dùng đủ ${cap} Đạo Đan legacy ở Đan Đạo hiện tại.`);
                const gain = alchemyPermanentStatGain(desc.quality);
                const perm = this.metaValue.reincarnationProgress.alchemyPermanentStats ?? (this.metaValue.reincarnationProgress.alchemyPermanentStats = emptyAlchemyAllocation());
                perm[daoStat] += gain;
                alchemy.life.permanentPillsUsed++;
                alchemy.telemetry.permanentPillsConsumed++;
                effect = { stat: daoStat, gain, usedAfter: alchemy.life.permanentPillsUsed, cap, legacy: true };
                summary = `${daoStat} legacy vĩnh viễn +${gain}`;
            }
            else
                throw new Error('Họ đan chưa có effect runtime.');
        }
        this.stateValue.inventory[resourceId] = count - 1;
        const permanentV146 = isV146 && Boolean(alchemyPermanentFamilyStatV146(desc.family));
        const event = { id: `alchemy.pill.use.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: permanentV146 || daoPillStat(desc.family) ? 18 : desc.family === 'forbidden' ? 16 : 8, message: `Dùng ${pillDisplayName(desc, isV146)}: ${summary}.`, locationId: this.stateValue.locationId, tags: ['AlchemyPill', isV146 ? 'V146' : 'Legacy', desc.family, desc.quality], data: { resourceId, family: desc.family, majorRealmIndex: isV146 ? desc.majorRealmIndex : undefined, tier: desc.realmTier, quality: desc.quality, effect } };
        this.historyValue.append(event);
        this.actionIndexValue += 1;
        return { resourceId, name: pillDisplayName(desc, isV146), summary, effect, remaining: count - 1, state: this.state, alchemy: this.alchemyV112Summary() };
    
}
