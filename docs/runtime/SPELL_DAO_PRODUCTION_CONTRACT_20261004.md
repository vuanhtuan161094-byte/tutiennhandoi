# PHÁP ĐẠO PRODUCTION CONTRACT — 2026-10-04

Status: **READY FOR EXACT-SHA USER CLOSURE — NOT CLOSED/LOCKED; closureReady:true**
Feature id: `dao-spell`
Source baseline: `de2d04a3f2b0453bc6d3776659841d8944a6dd84`
Workflow: `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`

## 1. Identity and boundary

Pháp manages Chân Nguyên and executes a fixed sequence of three spell forms to complete Pháp Luân, open Diễn Pháp, then release the payoff at the right time:

**VẬN PHÁP → HOÀN LUÂN → DIỄN PHÁP**

It owns resource planning, ordered spell-form rotation and committed cast/channel payoff. It does not own generic spell damage, cooldown, action-speed, TT damage or LL damage bonuses; ranged Kiếm identity; or an extra Ultimate economy. Hard control remains in shared canonical control rules. Main owns Pháp Luân and Diễn Pháp. Secondary receives only explicitly eligible passive effects, never core, Active, Ultimate or Auto state.

Allowed scope is dao-spell content/runtime/Auto/parity/benchmark, focused QA, and a shared seam only when a failing regression test proves a feature-local solution insufficient. Kiếm, Quyền, Thể, Thần Niệm, Combat Backend V3 and Equipment retirement are regression locks. Tri Kỷ, Linh Thú, external Pháp Bảo/Chí Bảo, Equipment, Alchemy, Economy, Reincarnation and collection balance are deferred.

## 2. Core and transaction state

The sole short-cycle Main resource is a sequential Pháp Luân, with no parallel `spellSeal` resource. Core stores `stage` (0–2), `expectedForm`, `dienPhapReady`, completed-cycle count, and action-local transaction snapshots. Expected forms, in order, are **Tốc Pháp → Thi Triển → Dẫn Pháp**. The initial expected form is Tốc Pháp.

Only skills explicitly marked eligible can advance the wheel. A completed eligible action advances exactly one matching step. The wrong form or a repeated form neither advances nor resets progress. Emergency defense/recovery never clears it. Completing Dẫn Pháp opens one Diễn Pháp readiness and returns the wheel to Tốc Pháp. Read/projection functions do not mutate this state.

Instant/root actions commit their matching form after resolution; Cast commits only after cast resolution. Dẫn Pháp commits only after full channel completion. A canceled/ interrupted cast/channel does not commit the form or grant completion rewards. Resolved channel ticks, including their actual CN payments, remain; unresolved ticks and full-completion bonuses do not. A multi-hit or channel is one root action.

Diễn Pháp is a one-shot readiness flag, not a meter. Only eligible payoff skills (`burst` and `break`) can snapshot and spend it. Apply its authored action-local damage/Break effect at prepare from the snapshot, but consume readiness only after the payoff action resolves; an interruption before resolve preserves readiness. One root can consume at most one readiness; generated follow-ups cannot consume it again. Basic, setup, defense/recovery and Ultimate do not spend or generate readiness. Basic may complete the first Tốc form only. Ultimate has its own channel payoff and cannot bypass or mutate the wheel.

Base Chân Nguyên is charged at the existing action-start boundary. Explicit per-tick channel costs are charged only for resolved ticks and are not refunded. No separate spell resource is added. Pháp Ý follows the V2 0–20 base stack, 12-second hold and one stack per second decay model; P5 may raise its cap to 30, P3 owns duration/decay, and P1 unlocks it. Main gains stacks from eligible resolved roots that actually paid CN; Secondary passive semantics never instantiate Main core. At this slice's contract, transient wheel/readiness reset between Hunt monsters; Pháp Ý may carry by existing V2 behavior. This is runtime state, not a new save authority.

## 3. Ten-skill kit and wheel/payoff eligibility

Stable IDs are preserved. Kit remains exactly 1 Basic, 8 Actives, 1 Ultimate; equip at most 5 Actives.

| ID suffix | Role and form | Core contract |
|---|---|---|
| basic | Chân Nguyên-safe fallback / Tốc Pháp | completed Instant advances the matching first step only; never spends Diễn Pháp; small CN recovery |
| light | Tốc Pháp, Instant | eligible first step; CL/TPH local family |
| channel | offensive Dẫn Pháp, Channel | eligible third step only on full completion |
| restore | CN recovery, Channel | per resolved tick; not wheel eligible |
| shield | emergency defense, Instant | not wheel eligible; never resets it |
| seal | Thi Triển setup, Cast | eligible second step after cast resolve; no seal resource |
| burst | Bạo Pháp, heavy Cast | Diễn Pháp payoff eligible; high CN cost |
| break | Break alternative, Cast | Diễn Pháp payoff eligible; Break remains distinct from CC |
| transform | CN circulation utility, Instant | no wheel bypass, no seal spend, no generic next-skill damage buff |
| ultimate | Đại Pháp, Ultimate Channel | gauge 100, zero CN baseline; full ticks resolve normally; wheel/readiness unchanged |

The benchmark equips Basic + exactly five Actives + Ultimate. Full descriptions, timing, costs, coefficients, scaling families and mastery are owned by live skill metadata and tested against this contract; this table does not override those runtime fields.

## 4. Pháp Ý passives

All eight stable IDs `passive.v2.spell.p1..p8` remain paired to the existing eight Active unlock rows. Levels remain 1–20; reads are pure; event mutations occur on resolved root/completion events. Re-author effects away from the generic Spell-wide damage/recovery bonuses.

| Passive | Production ownership |
|---|---|
| p1 Pháp Ý Quyết | unlocks Main Pháp Ý; eligible real CN-paid Main roots generate the long-cycle stack; Secondary contribution is bounded CN sustain only |
| p2 Dẫn Pháp Chân Kinh | bounded extra stack chance on one eligible gain event; Secondary-safe bounded CN sustain |
| p3 Pháp Ý Trường Tồn | duration and decay only; Main and passive projection share timer authority |
| p4 Tụ Linh Chân Giải | bounded CN efficiency on authored Pháp actions; no generic damage |
| p5 Vạn Pháp Vô Cực | raises Pháp Ý cap only |
| p6 Pháp Uy Lăng Thiên | improves completed wheel/eligible payoff action-locally; never generic Spell damage |
| p7 Hồi Nguyên Thông Huyền | threshold CN recovery/cost utility; never generic recovery/CDR |
| p8 Pháp Ý Bất Diệt | bounded, event-refreshed peak state improving a completed cycle/payoff; no generic damage/Gauge or recursive proc |

Secondary Pháp may receive only the explicitly Secondary-safe CN sustain semantics from learned passives. It never receives the Main stack's generic output, wheel, readiness, cast bonus, Active/Ultimate or Auto rotation.

## 5. Five-stat ownership

Only CL/power, TP/body, TPH/agility, LL/spirit, TT/sense exist. All ten spell skill records carry explicit `fiveStatScalingV5` and baseline metadata. Damage-bearing coefficients are skill-local: CL owns direct output; TPH participates only on authored quick/rotation skills; TT only on authored channel/control-precision skills; TP only on real defense; LL owns Max CN/capacity and authored CN management, not generic damage. Utility skills may declare a family for provenance but must not turn that metadata into an unimplemented hidden damage effect. No weights are forced to sum to a fixed total.

Initial 300-point archetype allocations and their exact 5-Active loadouts are fixed for benchmark fairness:

| Archetype | power | body | agility | spirit | sense | Active loadout |
|---|---:|---:|---:|---:|---:|---|
| Bạo Pháp | 165 | 25 | 20 | 65 | 25 | seal, channel, burst, break, restore |
| Luân Pháp | 115 | 25 | 85 | 55 | 20 | light, seal, channel, burst, restore |
| Dẫn Pháp | 90 | 30 | 20 | 65 | 95 | seal, channel, restore, shield, break |

Each totals 300. Basic and Ultimate are equipped separately. All eight passives are Lv20 and all ten skill mastery tiers are 1000 for the canonical 180-second benchmark.

## 6. Auto, parity and benchmark

Auto prioritizes emergency survival, avoiding a projected CN stall, the exact expected wheel form, and then a valid payoff. Bạo Pháp holds readiness for Burst when practical; Luân Pháp minimizes completed-cycle time; Dẫn Pháp uses Channel only when CN and interruption conditions allow. Ultimate fires at 100 Gauge under a bounded tactical window. Manual and Auto use the same production transactions.

Benchmark uses production CombatKernel V3, 12 deterministic seeds, 180 seconds and the fixed profiles above. Initial target bands: Bạo Pháp 100% reference; Luân Pháp 90–97%; Dẫn Pháp 85–93%. Each run must prove wheel steps/cycles, readiness/spend/waste, channels started/completed/interrupted, CN spent/restored/low-CN time, Pháp Ý uptime, Ultimate count, Break, and DPS/spread. Luân Pháp must lead cycle cadence; Dẫn Pháp must complete real channels; Bạo Pháp must spend real readiness on a heavy payoff. Invalid identity runs cannot support tuning. Tune one Pháp-owned lever per iteration only after correctness and parity pass.

Parity covers Combat/PvE/Boss, Auto, PvP, Hunt and offline/virtual paths, Secondary ownership, root-action/follow-up limits, and deterministic transient-state reset/carry. Required locks remain protected by their registered regression gates.

## 7. Phases and closure

P0 contract and manifest; P1 wheel/payoff/CN transaction correctness; P2A five-stat metadata; P2B passive ownership; P2C mastery; P3 consumer parity; P4 identity-valid deterministic benchmark; P5 one-lever local tuning; P6 exact-candidate closure preparation. The manifest stays `closureReady:false` until all required correctness, parity, identity and target-band evidence passes. Only then may the documented user Windows command run scoped closure. This contract never marks Pháp CLOSED / LOCKED.

Deferred/global systems and all other Dao remain outside tuning scope.

## 8. Final P6 evidence

All 39 scoped prerequisites passed before readiness was enabled. Light mastery 1000 prepares matching Thi Triển/Dẫn Pháp cast/recovery ×0.65 after a genuine Light-led Tốc completion. Full cycle completion returns at most 1.5s Burst cooldown, once; it does not skip forms. Zero-CN skill mastery 500 grants an actual local effect instead of an unused cost discount. Offensive channel pays an additional 4% CN Standard/s per resolved tick. Final channel family: CL 1.2 + TT 4.8, baseline 6; Light damage coefficient 3 and offensive channel tick coefficient 3. Allocation/loadouts remained fixed.

Offline Hunt derives its rate from the V3 representative battle; virtual farming is aggregate accounting, not a separate Spell engine or a fabricated per-kill identity trace. Actual normal-monster settlement uses activity.js → carryBattleDaoV2StateToNextMonsterV2 → session initial state. Normal kills reset Spell short-cycle state and rebase Pháp Ý; boss/death resets the Hunt cycle. Secondary paid-root observation includes Sword/unbound roots despite their early return from generic Dao core processing.

Full kit/all 50 milestones: `SPELL_DAO_PRODUCTION_REFERENCE_20261004.md`. Source-hashed 36-run evidence: `SPELL_DAO_BENCHMARK_EVIDENCE_20261004.json`. Acceptance boundary and tuning record: `SPELL_DAO_CLOSURE_PREPARATION_20261004.md`.

P3 seam correction: the fixed Bạo/Dẫn loadouts lack `light`. Basic is explicitly eligible for the actual Instant Tốc step so all three kits can execute the ordered wheel without changing loadouts. It does not bypass any form or generate Pháp Ý from zero CN. P2C replaces unsupported mastery promises with executable skill-local deltas at all five milestones.
