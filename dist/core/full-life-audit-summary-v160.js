import { buildFullLifeEconomyPacingAuditV160 } from './full-life-economy-pacing-v160.js';
import { buildFullLifeAcquisitionAuditV160 } from './full-life-acquisition-v160.js';

export const FULL_LIFE_AUDIT_SUMMARY_V160_SCHEMA = 'full-life-audit-summary.v160';

const round = (value, digits = 3) => Number(Number(value || 0).toFixed(digits));

function manualAcquisitionFinding(acquisition) {
  const sample1000 = acquisition.gacha.samples.filter(x => x.pulls === 1000);
  const late = sample1000.find(x => x.stageIndex === 28);
  const early = sample1000.find(x => x.stageIndex === 0);
  return {
    id: 'manual-max-envelope-is-acquisition-constrained',
    severity: 'constraint',
    evidence: {
      recurringBoundJadePerDay: acquisition.gacha.recurringBoundJadePerDay,
      daysFor100PullsIfAllRecurringJade: acquisition.gacha.samples.find(x => x.pulls === 100)?.calendarDaysIfAllRecurringBoundJadeWentHere,
      daysFor1000PullsIfAllRecurringJade: late?.calendarDaysIfAllRecurringBoundJadeWentHere,
      earlyTargetFragmentsAt1000: early?.targetFragments,
      earlyTotalFragmentsForLv1000: early?.totalFragmentsForLv1000,
      earlyAffordableGatesAt1000: early?.affordableGates,
      lateTargetFragmentsAt1000: late?.targetFragments,
      lateTotalFragmentsForLv1000: late?.totalFragmentsForLv1000,
      lateAffordableGatesAt1000: late?.affordableGates,
      competingBannerCount: acquisition.gacha.categoryBannerCount,
    },
    conclusion: 'Do not nerf Công Pháp from the theoretical all-max Tu Vi envelope alone. Production Vạn Tượng acquisition is a strong gate and shares Bound Jade with seven other category banners.',
  };
}

function spiritualRootFinding(acquisition) {
  const lv1000 = acquisition.spiritualRoot.find(x => x.level === 1000);
  const lv10000 = acquisition.spiritualRoot.find(x => x.level === 10000);
  return {
    id: 'spiritual-root-is-hunt-and-realm-gated',
    severity: 'constraint',
    evidence: {
      lv1000CultivationBonusPct: lv1000?.cultivationBonusPctBase,
      lv1000CumulativeTendonCost: lv1000?.cumulativeTendonCost,
      lv1000Ascensions: lv1000?.ascensionsNeeded,
      lv10000CultivationBonusPct: lv10000?.cultivationBonusPctBase,
      lv10000CumulativeTendonCost: lv10000?.cumulativeTendonCost,
      lv10000Ascensions: lv10000?.ascensionsNeeded,
      virtualOriginPityKills: lv10000?.virtualOriginPityKills,
    },
    conclusion: 'Linh Căn is not a free percent accelerator. Every 100-level gate consumes realm-tier Bản Nguyên, tying long-run growth to real Hunt progression.',
  };
}

function reincarnationFinding(acquisition) {
  const r = acquisition.reincarnation;
  const terminal = r.rewards.find(x => x.order === 117);
  return {
    id: 'reincarnation-is-multi-life-budget',
    severity: 'constraint',
    evidence: {
      treeMaxRp: r.totalTreeMaxCostRp,
      fateUnlockRp: r.fateBuildTotalUnlockCostRp,
      combinedRp: r.combinedTreeAndFateCostRp,
      terminalRepeatRp: terminal?.repeatRp,
      terminalMaxRpGainRepeatRp: terminal?.maxRpGainNodeRepeatRp,
      simpleTerminalRepeatLivesForTreeOnly: r.simpleTerminalRepeatLivesForTreeOnly,
    },
    conclusion: 'Luân Hồi acceleration belongs to multi-life pacing. Its full power cannot be assumed in a first-life completion envelope.',
  };
}

function retreatFinding(pacing) {
  const authoredPcts = [...new Set(pacing.rows.filter(x => !x.terminal).map(x => x.retreat.authored3hProgressPct))].sort((a, b) => a - b);
  return {
    id: 'retreat-is-authored-realm-percent-not-rate-derived',
    severity: 'review',
    evidence: {
      dailyBankHours: pacing.scope.retreatDailyBankHours,
      authoredProgressPcts: authoredPcts,
      baselineDays: pacing.totals.authoredBaselineDays,
      steadyDaysWithDailyRetreat: pacing.totals.baselineWithDailyRetreatSteadyDays,
    },
    conclusion: 'Current runtime grants an authored percentage of the current realm requirement. Therefore Bế Quan does not automatically scale with Công Pháp/Linh Căn rate growth; Phase B should explicitly decide whether this is the intended long-run relation.',
  };
}

function baselineFindings(pacing) {
  return pacing.flags.filter(x => x.id === 'baseline-duration-jump').map(x => ({
    ...x,
    conclusion: x.order === 1
      ? 'Luyện Khí entry is a sharp baseline pacing jump and should be playtested as an intentional first retention gate.'
      : x.order === 10
        ? 'Trúc Cơ entry is a sharp pacing jump exactly where many systems unlock; onboarding and pacing must be evaluated together.'
        : 'Authored baseline duration jumps sharply here and needs player-journey review.',
  }));
}

export function buildFullLifeAuditSummaryV160() {
  const pacing = buildFullLifeEconomyPacingAuditV160();
  const acquisition = buildFullLifeAcquisitionAuditV160();
  const rawManualRunawayCount = pacing.flags.filter(x => x.id === 'manual-max-envelope-runaway').length;
  const unresolvedRaw = pacing.flags.filter(x => x.id === 'specific-fragment-pacing-unresolved');
  const findings = [
    ...baselineFindings(pacing),
    retreatFinding(pacing),
    manualAcquisitionFinding(acquisition),
    spiritualRootFinding(acquisition),
    reincarnationFinding(acquisition),
    {
      id: 'raw-manual-max-envelope-reconciled',
      severity: 'diagnostic',
      evidence: {
        rawRunawayRows: rawManualRunawayCount,
        baselineDays: pacing.totals.authoredBaselineDays,
        allUnlockedManualsLv100Days: pacing.totals.allUnlockedManualsLv100PassiveDaysEnvelope,
        allUnlockedManualsLv500Days: pacing.totals.allUnlockedManualsLv500PassiveDaysEnvelope,
        allUnlockedManualsMaxDays: pacing.totals.allUnlockedManualsMaxPassiveDaysEnvelope,
      },
      conclusion: 'The max-manual envelope is useful as an upper bound only. Acquisition evidence prevents treating it as a normal-life calendar forecast.',
    },
  ];
  return {
    schema: FULL_LIFE_AUDIT_SUMMARY_V160_SCHEMA,
    status: 'measurement-complete-balance-not-applied',
    productionAuthority: true,
    totals: pacing.totals,
    boundJade: pacing.boundJade,
    findings,
    reconciliation: {
      rawSpecificFragmentFlags: unresolvedRaw.length,
      acquisitionAuditPresent: acquisition.gacha.samples.length > 0,
      unresolvedAfterReconciliation: 0,
      note: 'The raw pacing module intentionally surfaces missing specific-fragment acquisition. The acquisition module measures it through production Vạn Tượng; this combined summary resolves that measurement gap without pretending the economy is balanced.',
    },
    nextPhase: {
      id: 'phase-b-economy-pacing-fixes',
      priorities: [
        'Review Bế Quan relation to accelerated Tu Vi rate before changing numbers.',
        'Playtest/order-model the sharp Luyện Khí and Trúc Cơ baseline jumps.',
        'Build a realistic player-spend profile across eight Vạn Tượng banners instead of all-jade-to-one-banner envelopes.',
        'Keep Công Pháp max power; balance acquisition and usable progression before touching its authored effects.',
        'Leave exact multi-life Luân Hồi optimization for the dedicated multi-life phase.',
      ],
    },
  };
}
