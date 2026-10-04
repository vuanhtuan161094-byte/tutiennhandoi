# PHÁP ĐẠO CLOSURE PREPARATION — 2026-10-04

**READY FOR EXACT-SHA USER CLOSURE — NOT CLOSED/LOCKED**

Initial HEAD: `de2d04a3f2b0453bc6d3776659841d8944a6dd84`. Candidate SHA is the commit containing this record; the final response reports its exact SHA and clean CI evidence. `dao-spell` remained `closureReady:false` until 39/39 prerequisites and identity-valid target-band evidence passed. It is now `closureReady:true`.

## Production result

Ordered Tốc → Thi Triển → Dẫn opens one Diễn Pháp. Only Burst/Break snapshot and commit that flag after resolution. Basic completes a genuine Tốc step for the fixed Bạo/Dẫn kits; it does not skip the subsequent forms or generate Pháp Ý from zero CN. Interrupted cast/channel retains progress/readiness and grants only resolved effects. Root transactions commit once; generated follow-ups cannot progress/spend/generate. Pháp Ý supports CN and explicit payoff, never generic damage/CDR. Main owns the core; Secondary observes real CN-paid roots for bounded CN support, including Sword's early-return route. Normal Hunt kills reset wheel/readiness and carry rebased Pháp Ý; bosses/death reset the Hunt cycle.

[Production reference](SPELL_DAO_PRODUCTION_REFERENCE_20261004.md) records all ten skills, eight passives, five-stat families, costs/timing/effects and all 50 executable mastery milestones.

## Canonical benchmark

CombatKernel V3; 3 profiles × 12 deterministic seeds × 180s = 36 runs. Equal +300 allocation over a shared base of 100 per primary axis; all eight passives Lv20, all ten mastery tiers 1000; Basic + exactly five Actives + Ultimate. Bands apply to the paired 12-seed mean DPS. Every run has valid wheel, payoff, paid channel and Ultimate identity.

| Archetype | Allocation CL/TP/TPH/LL/TT | Five Actives | DPS mean [min–max] | Relative | Cycles / readiness / spends | Channels completed / damage share | Valid |
|---|---|---|---|---|---|---|---|
| Bạo Pháp | 165/25/20/65/25 | seal, channel, burst, break, restore | 565.540 [544.142–590.087] | 100% | 16.917 / 16.917 / 16.917 | 21.667 / 46.019% | 12/12 |
| Luân Pháp | 115/25/85/55/20 | light, seal, channel, burst, restore | 511.038 [490.941–542.623] | 90.363% | 17.833 / 17.833 / 17.500 | 25.833 / 42.124% | 12/12 |
| Dẫn Pháp | 90/30/20/65/95 | seal, channel, restore, shield, break | 482.682 [474.636–493.684] | 85.349% | 17 / 16.833 / 16.833 | 21 / 62.253% | 12/12 |

Luân leads actual cycle and readiness cadence. Bạo spends real Diễn Pháp on heavy casts with 29.515% heavy contribution. Dẫn completes real channels with 62.253% channel contribution. All per-run CN spent/restored/regen, low-CN exposure, Pháp Ý uptime/threshold/cap time, interrupted/unfinished channels, Ultimate and Break data are in the committed [JSON evidence](SPELL_DAO_BENCHMARK_EVIDENCE_20261004.json). Low-CN exposure is measured as zero in this canonical matrix. Channel counts include recovery/Ultimate channels; offensive Dẫn completions are reported separately in each run.

The neutral target has normal incoming pressure/Break. Targeted tests separately prove interrupted, partial and insufficient-CN channels, including target death. This benchmark measures neutral sustained balance, not a claim about every PvP/Boss matchup.

Feature source digest, normalized LF SHA-256: `20dc5a9a4e509eaa87b2ffb91925c10e3574981d1f1b5173cfe578485d3bf9ed`. The benchmark gate reruns all 36 encounters, compares the entire result/source digest to the committed evidence, and replays the first seed deterministically. Interval instrumentation is observer-only: it calls the original engine method once and restores the prototype in `finally`.

## One-lever tuning record

Identity-invalid diagnostic matrices were not accepted as balance evidence. Dry heavy casts and short-Basic risk misclassification were repaired. Light mastery received a bounded genuine matching-form timing/completion benefit; the attempted recovery-only change was reverted. Valid P4 baseline: Luân 83.082%, Dẫn 65.265%.

| Iteration | One primary lever | Luân | Dẫn | Outcome |
|---|---|---:|---:|---|
| P5-1 | Light damage coefficient 1.5 → 3 | 94.349% | 65.265% | retain |
| P5-2 | Channel TT family 1.3 → 4.8; its normalized baseline 2.5 → 6 | 95.504% | 67.745% | retain; skill-local TT |
| P5-3 | Channel tick coefficient .58 → 1.8 | 92.837% | 79% | identity valid; Dẫn misses |
| P5-4 | Channel tick coefficient 1.8 → 3 | 91.154% | 85.952% | bands PASS; stop tuning |
| Final correctness replay | Zero-CN mastery 500 gets an actual local effect; p7 independence/p8 event/Secondary parity finalized | 90.363% | 85.349% | bands remain PASS; no further tune |

Allocation/loadouts stayed fixed throughout. No Sword/Fist/Body/Mind gameplay or global/deferred balance was tuned.

## Gates and acceptance boundary

P0/P1/P2A/P2B/P2C/P3 targeted gates PASS. P3 exercises real CombatEngine cast interruption, partial/full/insufficient-CN channel, target death, interrupted restore/payoff, duplicate callback/follow-up limits, Main/Secondary, Auto expected forms/emergency/payoff/Gauge, compiled PvP/Hunt/Boss V3 parity, actual Hunt carry caller, and JSON state restore. P4/P5 36-run identity/bands/evidence/replay PASS. Final prerequisites 39/39 PASS include shared Combat V3 parity and all registered locked Sword/Fist/Body/Mind regressions. Local Fast passed Backend 39/39 + Frontend 20/20 plus the current active/preflight gates.

Three stale QA expectations were narrowly updated: feature registry adds dao-spell; Sword exclusion inventory allows the separately opened Spell migration while preserving all exact Sword coefficients; Mind source regex preserves its exclusion and recognizes Spell-owned peak handling. No locked gameplay changed.

Legacy retired in production: `spellSeal` remains only frozen compatibility data and is absent from all ten production skill generators/spenders; unordered wheel fields reset on schema migration; generic Spell stack damage/recovery/Gauge modifiers were removed; Diễn Pháp spend is at resolve; blind legacy Auto was replaced with expected-form/CN/risk/payoff decisions.

FULL CLEAN and scoped closure are run directly on the local committed candidate after this record is committed. Local Codex evidence does not substitute for the user's final Windows acceptance. No whole-game Canonical closure or global/deferred retune is claimed. The root checkpoint remains unchanged because this slice is not yet user CLOSED/LOCKED.

## User Windows command

The canonical launcher fetches GitHub and resets tracked files to `origin/main`. The candidate must be published before that command; this task commits locally and does not push without a push request. From this repository, publish the candidate if still local, then run:

```cmd
git push origin main
DONG_BO_VA_TEST_FEATURE.cmd dao-spell
```

Record the exact SHA printed by the launcher. Require FULL CLEAN and scoped feature PASS on the user's Windows machine before calling Pháp CLOSED/LOCKED.

## Changed files

Production: `dist/content/battle-dao-skill-pack-v118.js`, `dist/content/spell-dao-v2.js`, `dist/core/ai.js`, `dist/core/battle-dao-rotation-v127.js`, `dist/core/battle-dao-skill-growth-v126.js`, `dist/core/battle-dao-v2-contract.js`, `dist/core/battle-dao-v2-runtime-base.js`, `dist/core/combat-decision.js`, `dist/core/combat-m1-base.js`.

QA: `qa/runners/feature-closure-manifest.js`, `qa/benchmarks/spell-dao-p4-benchmark.js`, `qa/tests/spell-dao-production-contract-test.js`, `qa/tests/spell-dao-p1-transaction-test.js`, `qa/tests/spell-dao-p2a-five-stat-test.js`, `qa/tests/spell-dao-p2b-passive-architecture-test.js`, `qa/tests/spell-dao-p2c-mastery-architecture-test.js`, `qa/tests/spell-dao-p3-consumer-parity-test.js`, `qa/tests/spell-dao-benchmark-contract-test.js`, `qa/tests/feature-closure-framework-test.js`, `qa/tests/sword-dao-five-stat-migration-test.js`, `qa/tests/mind-dao-m2-passive-architecture-test.js`, `tools/web/RUN_SPELL_P4_BENCHMARK.cmd`.

Docs/evidence: `docs/runtime/SPELL_DAO_PRODUCTION_CONTRACT_20261004.md`, `docs/runtime/SPELL_DAO_PRODUCTION_REFERENCE_20261004.md`, `docs/runtime/SPELL_DAO_BENCHMARK_EVIDENCE_20261004.json`, this preparation record.
