# ROADMAP PRODUCTION 8 ĐẠO — 2026-09-30

Status: **PLANNING / CANONICAL SEQUENCE**

Companion authorities:
- `CURRENT_CHECKPOINT.md`
- `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`
- `docs/runtime/DAO_SYSTEM_DESIGN_STANDARD_V1_20260929.md`
- `docs/runtime/DAO_NEW_SLICE_TEMPLATE_V3.md`

This roadmap fixes the production sequence only. It does **not** reopen locked Dao, does not authorize global balance retuning, and does not replace each Dao's future dated production contract.

## 1. Current state

1. **Kiếm Đạo** — CLOSED / LOCKED.
2. **Quyền Đạo** — CLOSED / LOCKED.
3. **Thần Niệm Đạo** — ACTIVE; M4 deterministic identity benchmark is the immediate next execution step. M5/M6 remain blocked until valid M4 evidence exists.
4. **Thể Đạo** — OPEN / DIRECTION only.
5. **Pháp Đạo** — OPEN / DIRECTION only.
6. **Độc Đạo** — OPEN / DIRECTION only.
7. **Trận Đạo** — OPEN / DIRECTION only.
8. **Ngự Khí Đạo** — OPEN / DIRECTION only.

The five unopened Dao already have historical V2 content/runtime scaffolding (core state, passive stack, eight passives, ten mastery rows, skill tree). These files are input material, not production closure evidence. Each Dao must still be re-audited against the current five-stat and CombatKernel V3 standards.

## 2. Locked production order

`Thần Niệm → Thể → Pháp → Độc → Trận → Ngự Khí → Global Balance 8 Đạo`

### Why this order

- **Thể next:** closes the highest immediate role-collision risk with locked Quyền. Quyền owns close pressure / Break / counter-bruiser; Thể must instead own mitigation / endurance / retaliation.
- **Pháp after Thể:** validates the current LL/CN economy and cast/channel/form seams without target-owned state complexity.
- **Độc after Pháp:** adds target-owned attrition state, DoT cadence, consume semantics and target-swap behavior after general cast/channel seams are already production-proven.
- **Trận after Độc:** dual-resource battlefield setup (`Dưỡng Độ` + `Độ Bền`) and deploy/delayed-payoff semantics make it a higher-complexity state machine.
- **Ngự Khí last:** its multi-source command/follow-up model sits closest to the separate Pháp Bảo/Chí Bảo collection systems. Closing it last makes the ownership boundary explicit before the final global auxiliary-system balance audit.

## 3. Common phase model for Dao 4–8

Every remaining Dao follows the same production phases.

### P0 — Scope / contract / fail-closed registration
- Create dated production contract from `DAO_NEW_SLICE_TEMPLATE_V3.md`.
- Register `dao-<id>` in `qa/runners/feature-closure-manifest.js` with `closureReady:false`.
- Declare allowed production files, shared seams and deferred external systems.
- Carry forward regression protection for all previously locked Dao where shared risk warrants it.

### P1 — Core mechanic / transaction correctness
- Audit short-cycle resource and long-cycle stack ownership.
- Define generation/spend/commit/refund/reset/save semantics.
- Fix only the smallest responsible runtime seams.
- Add targeted correctness tests before balance work.

### P2A — Five-stat ownership
- Every Basic / 8 Active / Ultimate gets explicit CL/TP/TPH/LL/TT scaling family/weights.
- No generic TT→damage, TPH→Action Speed, sixth stat, hidden global damage axis, or legacy Attack fallback as final production authority.

### P2B — Eight passives
- Replace generic historical assumptions with explicit owner/event semantics.
- Main-only vs Secondary-eligible behavior must be testable.
- Read helpers must not mutate timers/state.

### P2C — Ten skill mastery rows
- Runtime-own all 100/250/500/750/1000 milestones.
- Cực Ý transformations must be bounded and must not bypass shared proc/control/Ultimate budgets.

### P3 — Consumer parity
Audit the same mechanic through:
- manual CombatKernel V3;
- Auto/tactical;
- PvE/Boss;
- PvP;
- Hunt/offline/virtual Hunt;
- save/restore/carry;
- Secondary Dao passive lane;
- locked-Dao regression surfaces.

### P4 — Identity-valid deterministic benchmark
Default anchor:
- 3 canonical archetypes;
- Basic + Ultimate + exactly 5 Active slots;
- equal total five-stat budget;
- equivalent passive/mastery completion;
- 12 deterministic seeds × 180 s;
- production CombatKernel V3;
- non-zero identity counters required.

A zero-identity run is invalid evidence even if it reports DPS.

### P5 — Minimal local tune
- Tune only if P4 valid evidence misses the Dao's target bands.
- Prefer Dao-owned skill/resource/passive levers.
- Do not change locked Dao or auxiliary collection systems to rescue a new Dao benchmark.
- Stop once the target band passes.

### P6 — Exact closure / lock
- FULL CLEAN exact SHA.
- `DONG_BO_VA_TEST_FEATURE.cmd dao-<id>`.
- `closureReady:true` only after correctness, parity, valid benchmark and target bands pass.
- Dated closure record.
- Mark Dao CLOSED / LOCKED.

## 4. Dao 4 — Thể Đạo

Historical V2 direction:
- core: `Phản Thế` 0–100;
- long cycle: `Huyết Khí`;
- existing motifs: Guard, Counter, Bất Động/Channel, Break, Recover, Finisher.

Production identity target:
- **primary:** mitigation / endurance / retaliation;
- **secondary:** shield/heal sustain and defensive Break payoff;
- **must not become:** Quyền Đạo with more HP, sustained hard-control Dao, or generic highest-DPS bruiser.

Five-stat direction to validate, not numeric lock:
- TP: primary defensive/capacity anchor;
- CL: retaliation/payoff damage;
- TT: Resolve/control-resistance or precise retaliation utility only where authored;
- LL: CN capacity for defensive skill cadence where needed;
- TPH: mobility/positioning utility, not generic attack speed.

Provisional benchmark identities:
1. **Bất Động** — mitigation/sustain reference;
2. **Phản Thế** — retaliation/counter-force payoff;
3. **Huyết Khí** — long-fight endurance/threshold build.

Critical audit risk:
- separate reactive retaliation from Quyền's active pressure/counter-bruiser identity.

## 5. Dao 5 — Pháp Đạo

Historical V2 direction:
- core: `Pháp Luân` with Tốc Pháp / Cast / Dẫn Pháp forms;
- long cycle: `Pháp Ý`;
- payoff: full form rotation opens `Diễn Pháp` burst/Break window.

Production identity target:
- **primary:** spell-form rotation / resource management;
- **secondary:** sustained CN efficiency, channel/cast payoff;
- **must not become:** generic ranged Kiếm burst or passive CDR engine.

Five-stat direction to validate:
- LL: primary capacity/cadence anchor;
- CL: direct spell payoff;
- TT: accuracy/control/resolve interactions for seal/break utility;
- TPH: mobility/form utility only;
- TP: defensive fallback, not damage conversion.

Provisional benchmark identities:
1. **Bạo Pháp** — CL/LL damage reference;
2. **Luân Pháp** — full three-form rotation identity;
3. **Dẫn Pháp** — channel/resource-efficiency alternative.

Critical audit risks:
- channel completion ownership;
- form snapshot/consume timing;
- no false full-completion reward on interrupted channel.

## 6. Dao 6 — Độc Đạo

Historical V2 direction:
- target-owned `Độc Chủng` stage 0–4;
- stage 4 `Công Tâm`;
- long cycle `Độc Tức`;
- DoT/setup → consume payoff.

Production identity target:
- **primary:** attrition / target erosion;
- **secondary:** staged setup and conditional execute/consume payoff;
- **must not become:** instant burst Dao whose DoT names are cosmetic, or sustained hard-control owner.

Five-stat direction to validate:
- TT: setup/control-pressure/accuracy identity;
- LL: sustained DoT/resource cadence where authored;
- CL: direct consume/payoff damage;
- TPH: application/positioning utility only;
- TP: survival only.

Provisional benchmark identities:
1. **Công Tâm** — staged consume payoff;
2. **Vạn Độc** — sustained DoT/attrition;
3. **Độc Vụ** — erosion/setup utility.

Critical audit risks:
- target swap and target death;
- DoT provenance and proc depth;
- stage consume commit/refund timing;
- Hunt kill carry without leaking target-owned state to the next enemy.

## 7. Dao 7 — Trận Đạo

Historical V2 direction:
- `Dưỡng Độ` 0–100;
- `Độ Bền` 0–100;
- long cycle `Trận Văn`;
- deploy/nourish/fortify → activation payoff.

Production identity target:
- **primary:** setup / field / delayed activation;
- **secondary:** battlefield protection and planned Break windows;
- **must not become:** instant spell burst with two decorative resource bars.

Five-stat direction to validate:
- TT: setup precision/control/field authority;
- LL: field/resource sustain;
- CL: activation payoff;
- TP: fortification/shield alternative;
- TPH: tactical mobility only.

Provisional benchmark identities:
1. **Toàn Kích** — delayed damage payoff;
2. **Dưỡng Trận** — setup/field cycle identity;
3. **Hộ Trận** — durability/protection alternative.

Critical audit risks:
- two-resource atomicity;
- deploy lifecycle;
- channel completion;
- field expiry/replace/reset behavior;
- delayed activation ownership across Hunt/offline transitions.

## 8. Dao 8 — Ngự Khí Đạo

Historical V2 direction:
- `Nguồn Pháp Bảo` / Bản Mệnh Khí Linh, normally 1–3 sources;
- long cycle `Khí Cảm`;
- generated follow-up from auxiliary sources under follow-up budget.

Production identity target:
- **primary:** multi-source artifact command;
- **secondary:** source merge/split/guard cadence;
- **must not become:** the external Pháp Bảo/Chí Bảo collection system, infinite proc engine, or generic summon multiplier.

Five-stat direction to validate:
- CL: command/direct payoff;
- TT: multi-source command precision/coordination where authored;
- LL: source sustain/CN cadence;
- TP: guard/shield alternative;
- TPH: movement utility only, never generic action-speed scaling.

Provisional benchmark identities:
1. **Tam Ngự** — multi-source sustained command;
2. **Hợp Khí** — merge/payoff burst;
3. **Hộ Chủ** — shield/control/sustain alternative.

Critical audit risks:
- strict ownership boundary with collection Pháp Bảo and Chí Bảo;
- generated hit provenance;
- one bounded follow-up budget;
- no recursive source generation;
- save/carry of Dao core state must not copy external artifact combat state.

## 9. Global Balance only after all 8 Dao are closed

Do **not** globally retune these families during individual Dao production unless a proven correctness regression requires a narrow fix:
- Tri Kỷ;
- Linh Thú;
- Pháp Bảo / Chí Bảo;
- equipment balance;
- alchemy balance;
- economy;
- reincarnation/global progression balance;
- collection/global balance.

After all 8 Dao are CLOSED / LOCKED, open one separate **Global Balance V2** audit:

`8 Dao × representative five-stat archetypes × auxiliary combat systems`

Goals:
- compare Dao baseline without auxiliaries;
- measure auxiliary contribution share by Dao/build;
- verify each auxiliary identity remains intact;
- detect systems that disproportionately amplify one stat family or one Dao;
- tune auxiliary-owned levers first;
- never reopen a locked Dao merely to compensate for an overpowered external system.

The current V148 Tri Kỷ and V149 Artifact cross-build balance failures remain explicit deferred global-balance debt; they are not permission to weaken thresholds opportunistically during Thần Niệm or the next Dao slices.

## 10. Immediate next action

Current gameplay work remains **Thần Niệm M4**.

When the local Windows machine is available:

```cmd
git pull --ff-only origin main
git rev-parse HEAD
tools\web\RUN_MIND_M5_BENCHMARK.cmd --no-pause
```

Retain and inspect:
- `qa\output\mind-m4-benchmark.json`;
- launcher log/evidence.

Decision after M4:
- valid + inside target bands → skip unnecessary M5 tuning and proceed toward M6 closure;
- valid + outside target bands → M5 minimal Mind-owned tuning only;
- zero defining mechanics → benchmark invalid; repair harness/runtime identity before any tuning.

After Thần Niệm closes, open **Thể Đạo P0** using this roadmap and the canonical new-slice template.
