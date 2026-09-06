import { daoSuyStatusV127 } from './dao-suy-v127.js';
import { WORLD_YEARS_PER_REAL_HOUR } from './realtime-balance.js';
import { cultivationRealmV140 } from './cultivation-v140.js';
import { majorRealmIndexForRealmOrder } from '../content/realm-maps.js';
import { ALCHEMY_BUFF_DURATION_REAL_MINUTES, ALCHEMY_BUFF_PILL_DAILY_CAP, ALCHEMY_CULTIVATION_PILL_CAP_PER_MAJOR_REALM, ALCHEMY_DAO_SUY_PILL_CAP_PER_MAJOR_REALM, ALCHEMY_LIFESPAN_PILL_CAP_PCT, ALCHEMY_TEMP_STAT_PILL_CAP_PER_TIER, activeAlchemyBuff, alchemyCombatBuffEffect, alchemyCultivationPillPct, alchemyDaoSuyPillRelief, alchemyForbiddenPillCost, alchemyInjuryPillHeal, alchemyLifespanPillPct, alchemyPillName, alchemyPillRealmEfficiency, alchemyPermanentStatGain, alchemyTemporaryStatGain, daoPillStat, emptyAlchemyAllocation, ensureAlchemyV112State, isAlchemyBuffFamily, lifePillStat, parseAlchemyPillResourceId, permanentPillCap, syncAlchemyBuffDailyQuota } from './alchemy-v112.js';
import { PILL_QUALITY_MULTIPLIER } from './recovery.js';
import { reincarnationTreeRuntimeModifierV136 } from './reincarnation-progression-v1102.js';

// V141: canonical pill consumption/effect accounting is isolated from the central session container.
export function useSessionAlchemyPillV141(resourceId) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const desc = parseAlchemyPillResourceId(resourceId);
        if (!desc)
            throw new Error(`Không phải Đan Dược canonical: ${resourceId}`);
        const count = Math.max(0, Math.floor(this.stateValue.inventory[resourceId] ?? 0));
        if (count <= 0)
            throw new Error('Không còn viên đan này.');
        const currentTier = this.currentAlchemyTier(), eff = alchemyPillRealmEfficiency(currentTier, desc.realmTier);
        if (eff <= 0)
            throw new Error('Đan thấp hơn cảnh giới hiện tại quá xa nên vô hiệu.');
        const alchemy = ensureAlchemyV112State(this.stateValue.economy), qualityMultiplier = PILL_QUALITY_MULTIPLIER[desc.quality];
        let summary = '';
        let effect = {};
        if (desc.family === 'cultivation') {
            const majorKey = String(majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder));
            const used = Math.max(0, Math.floor(alchemy.life.cultivationPillsUsedByMajorRealm[majorKey] ?? 0));
            if (used >= ALCHEMY_CULTIVATION_PILL_CAP_PER_MAJOR_REALM)
                throw new Error(`Đại cảnh hiện tại đã hấp thu đủ ${ALCHEMY_CULTIVATION_PILL_CAP_PER_MAJOR_REALM} Tu Vi Đan.`);
            const required = Math.max(1, cultivationRealmV140(this.stateValue.realm.maxRealmOrder).requiredTuVi);
            const pillTreePct = reincarnationTreeRuntimeModifierV136(this.stateValue.inheritedOrigins, 'cultivation.cultivationPillGainPct');
            const requestedGain = required * (alchemyCultivationPillPct(desc.realmTier) / 100) * qualityMultiplier * eff * (1 + pillTreePct / 100);
            const granted = this.grantTuViV140(requestedGain, 'alchemy-pill');
            const gain = Math.max(0, Number(granted.gained ?? requestedGain) || 0);
            alchemy.life.cultivationPillsUsedByMajorRealm[majorKey] = used + 1;
            alchemy.telemetry.cultivationPillsConsumed++;
            effect = { gain, usedAfter: used + 1, cap: ALCHEMY_CULTIVATION_PILL_CAP_PER_MAJOR_REALM };
            summary = `Tu Vi +${gain.toFixed(0)} · hấp thu ${used + 1}/${ALCHEMY_CULTIVATION_PILL_CAP_PER_MAJOR_REALM}`;
        }
        else if (desc.family === 'daoSuy') {
            const status = daoSuyStatusV127(this.stateValue.immortal, this.stateValue.realm.maxRealmOrder, this.stateValue.inheritedOrigins);
            if (!status.active)
                throw new Error('Tĩnh Suy Đan chỉ có tác dụng từ Nhân Tiên trở lên.');
            if (status.value <= 1e-9)
                throw new Error('Hiện không có Đạo Suy cần hóa giải.');
            const majorKey = String(majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder));
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
            const requested = alchemyInjuryPillHeal(desc.realmTier, desc.quality) * eff, heal = Math.min(before, requested);
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
            const stats = alchemyCombatBuffEffect(desc.family, desc.realmTier, desc.quality, eff), durationYears = ALCHEMY_BUFF_DURATION_REAL_MINUTES / 60 * WORLD_YEARS_PER_REAL_HOUR;
            const buff = { family: desc.family, realmTier: desc.realmTier, quality: desc.quality, startedWorldYear: this.stateValue.worldTimeYears, expiresWorldYear: this.stateValue.worldTimeYears + durationYears, ...stats };
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
            const statBits = [stats.powerFlat ? `Công Lực +${stats.powerFlat}` : '', stats.bodyFlat ? `Thể Phách +${stats.bodyFlat}` : '', stats.defenseFlat ? `Phòng Ngự +${stats.defenseFlat}` : '', stats.spiritFlat ? `Chân Nguyên +${stats.spiritFlat}` : ''].filter(Boolean).join(' · ');
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
        else {
            const lifeStat = lifePillStat(desc.family), daoStat = daoPillStat(desc.family);
            if (lifeStat) {
                const key = `${desc.family}.t${desc.realmTier}`, used = Math.max(0, Math.floor(Math.max(alchemy.life.temporaryStatPillsUsedByTier[key] ?? 0, alchemy.life.temporaryStatPillsUsedByTier[String(desc.realmTier)] ?? 0)));
                if (used >= ALCHEMY_TEMP_STAT_PILL_CAP_PER_TIER)
                    throw new Error(`${alchemyPillName(desc.family, desc.realmTier, desc.quality)} đã chạm hạn mức ${ALCHEMY_TEMP_STAT_PILL_CAP_PER_TIER} viên của family/tier trong đời.`);
                const gain = alchemyTemporaryStatGain(desc.realmTier, desc.quality) * eff;
                alchemy.life.lifeStatBonus[lifeStat] += gain;
                alchemy.life.temporaryStatPillsUsedByTier[key] = used + 1;
                alchemy.telemetry.temporaryStatPillsConsumed++;
                effect = { stat: lifeStat, gain, usedAfter: used + 1, cap: ALCHEMY_TEMP_STAT_PILL_CAP_PER_TIER };
                summary = `${lifeStat} đời hiện tại +${gain} · ${used + 1}/${ALCHEMY_TEMP_STAT_PILL_CAP_PER_TIER}`;
            }
            else if (daoStat) {
                const cap = permanentPillCap(alchemy.rank, alchemy.turn, this.alchemyProductionModifiersV85().permanentPillCapFlat ?? 0);
                if (alchemy.life.permanentPillsUsed >= cap)
                    throw new Error(`Đã dùng đủ ${cap} Đạo Đan vĩnh viễn ở Đan Đạo hiện tại.`);
                const gain = alchemyPermanentStatGain(desc.quality);
                const perm = this.metaValue.reincarnationProgress.alchemyPermanentStats ?? (this.metaValue.reincarnationProgress.alchemyPermanentStats = emptyAlchemyAllocation());
                perm[daoStat] += gain;
                alchemy.life.permanentPillsUsed++;
                alchemy.telemetry.permanentPillsConsumed++;
                effect = { stat: daoStat, gain, usedAfter: alchemy.life.permanentPillsUsed, cap };
                summary = `${daoStat} vĩnh viễn +${gain} (${alchemy.life.permanentPillsUsed}/${cap} Đạo Đan đời này)`;
            }
            else
                throw new Error('Họ đan chưa có effect runtime.');
        }
        this.stateValue.inventory[resourceId] = count - 1;
        const event = { id: `alchemy.pill.use.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: daoPillStat(desc.family) ? 18 : desc.family === 'forbidden' ? 16 : 8, message: `Dùng ${alchemyPillName(desc.family, desc.realmTier, desc.quality)}: ${summary}.`, locationId: this.stateValue.locationId, tags: ['AlchemyPill', desc.family, desc.quality], data: { resourceId, family: desc.family, tier: desc.realmTier, quality: desc.quality, effect } };
        this.historyValue.append(event);
        this.actionIndexValue += 1;
        return { resourceId, name: alchemyPillName(desc.family, desc.realmTier, desc.quality), summary, effect, remaining: count - 1, state: this.state, alchemy: this.alchemyV112Summary() };
    
}
