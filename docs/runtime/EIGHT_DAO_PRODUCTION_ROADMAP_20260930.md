# EIGHT DAO PRODUCTION ROADMAP — 2026-09-30

Status: **PLANNING / SOURCE-AUDITED**  
Audit baseline: `02affea58e2a3675fe950e6cb055cfda8e77ae4a`

This roadmap sequences the remaining Main Dao production work under `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`.
It is a planning artifact only: no gameplay coefficient, balance target, or closure status is changed by this document.

## 1. Current state

- **Kiếm Đạo / Sword** — CLOSED / LOCKED.
- **Quyền Đạo / Fist** — CLOSED / LOCKED.
- **Thần Niệm Đạo / Mind** — ACTIVE; M4 deterministic identity benchmark is the next local action. M5/M6 remain blocked until identity-valid M4 evidence exists.
- **Thể Đạo / Body** — V2 content/runtime skeleton exists, not yet productionized under the current five-stat workflow.
- **Pháp Đạo / Spell** — V2 content/runtime skeleton exists, not yet productionized under the current five-stat workflow.
- **Độc Đạo / Poison** — V2 content/runtime skeleton exists, not yet productionized under the current five-stat workflow.
- **Ngự Khí Đạo / Artifact Dao** — V2 content/runtime skeleton exists, not yet productionized under the current five-stat workflow.
- **Trận Đạo / Formation** — V2 content/runtime skeleton exists, not yet productionized under the current five-stat workflow.

Only `dao-sword`, `dao-fist`, and `dao-mind` currently have registered feature-closure manifests. New Dao manifests must be added with `closureReady:false` only when that Dao is explicitly opened.

## 2. Shared audit findings for the five unopened Dao

All five already have:

- one Main-Dao core identity/resource;
- ten production skill IDs (Basic + eight progression actives + Ultimate);
- eight passive rows;
- ten mastery rows with milestones 100 / 250 / 500 / 750 / 1000;
- realm-gated progression tree;
- generic Battle Dao V2 runtime state and current CombatKernel integration seams.

The major gap relative to Sword/Fist/Mind production standard is that the five unopened Dao skills have not yet been migrated to explicit `fiveStatScalingV5` ownership in the skill pack.

Therefore the job is **not** to redesign them from zero. Each Dao should preserve its authored identity, then be migrated through the current production workflow:

`Scope Lock → Contract → Runtime Seam Audit → Correctness → Five-stat Ownership → Passive/Mastery Authority → Production Parity → Identity-valid Benchmark → Minimal Tune → FULL CLEAN → Feature Closure → Lock`

## 3. Locked sequence after Mind

### Dao 4 — Thể Đạo (`dao-body`)

**Identity already present:** `Chân Thân · Phản Thế` + `Huyết Khí`.

Core behavior:
- Phản Thế grows from real mitigated/blocked pressure;
- defensive state converts into damage/reduction and counter payoff;
- Huyết Khí rewards sustained incoming pressure;
- skill kit already contains shield, counter, channel defense, recovery, Break and finisher roles.

**Why first:** closest shared seams to the already-closed Quyền work: counter timing, incoming damage, mitigation, Break, recovery and survival. It is the lowest-risk next migration while still exercising defensive five-stat ownership.

Primary risks to audit:
- Phản Thế must come from real mitigation, not synthetic self-generation;
- shield/heal scaling must not duplicate TP/defensive stat authority;
- counter identity must execute in Auto/PvE/PvP/Hunt, not only in benchmark fixtures;
- Ultimate must not create practical immortality.

Benchmark identities should include at least: **Phản Kình / Bất Động / Huyết Khí sustain**.

### Dao 5 — Pháp Đạo (`dao-spell`)

**Identity already present:** `Pháp Luân` with three form buckets: Tốc Pháp / Cast / Dẫn Pháp + `Pháp Ý`.

Core behavior:
- different spell forms fill the Pháp Luân;
- full wheel creates Diễn Pháp payoff;
- spirit economy, channel completion and form diversity are core to identity.

**Why second:** broader than Thể but still structurally clean. It exercises Spirit cost/recovery, channel/cast/instant form ownership and rotation logic without target-bound state or multi-source follow-up ownership.

Primary risks to audit:
- exact form classification and completed-channel semantics;
- Chân Nguyên cost/recovery under five-stat LL ownership;
- Auto must actually rotate forms instead of spamming the numerically strongest action;
- Diễn Pháp must be spent once per intended root action.

Benchmark identities should include at least: **Tam Pháp Luân / Dẫn Pháp / Bạo Pháp**.

### Dao 6 — Độc Đạo (`dao-poison`)

**Identity already present:** target-bound `Độc Chủng` stage 0–4 + `Độc Tức`.

Core behavior:
- build poison stage on the current target;
- DoT receives stage-dependent payoff;
- stage 4 Công Tâm empowers Consume then resets/retains according to authored rules.

**Why third:** requires more state correctness than Pháp because the core is target-bound and interacts with DoT/consume timing. Target switching and persistence must be proven before any balance evidence is trusted.

Primary risks to audit:
- target swap/reset ownership;
- DoT snapshot vs live scaling;
- Consume must spend the correct target state exactly once;
- Hunt kill transitions must not leak target-local Độc Chủng while passive carry rules remain correct.

Benchmark identities should include at least: **Dưỡng Độc / Công Tâm Phệ Độc / DoT áp lực**.

### Dao 7 — Ngự Khí Đạo (`dao-artifact`)

**Identity already present:** `Bản Mệnh Khí Linh`, 1–3 `artifactSources`, command/deploy/recall/merge flow and bounded generated follow-up budget.

Core behavior:
- additional sources strengthen Artifact Command;
- secondary sources generate one bounded shared follow-up path;
- Deploy / Recall / Merge changes source topology.

**Why fourth:** technically distinct from ordinary skill resources and has naming/domain overlap with the separate player collection **Pháp Bảo/Chí Bảo** systems. Production work must prove that Main Dao authority does not accidentally rebalance or duplicate those deferred collection systems.

Primary risks to audit:
- strict separation between **Ngự Khí Đạo internal source state** and collection Pháp Bảo/Chí Bảo;
- no proc multiplication beyond follow-up budget;
- source count mutation must be deterministic through Deploy/Recall/Merge;
- five-stat scaling must not double-dip with external artifact triggers.

Benchmark identities should include at least: **Tam Khí / Hợp Khí / Command-follow-up**.

### Dao 8 — Trận Đạo (`dao-formation`)

**Identity already present:** `Chủ Trận` with `Dưỡng Độ` + `Độ Bền`, plus `Trận Văn`.

Core behavior:
- deploy one formation;
- nurture and fortify two different state axes;
- activation spends nurture;
- Đại Thành at 100 nurture modifies activation and integrity;
- formation lifecycle includes deployment, conversion and teardown.

**Why last:** highest state-machine complexity of the unopened five. It has dual mutable resources, deploy lifecycle, channel, activation payoff, defensive conversion and explicit teardown. Doing it after Body/Spell/Poison/Artifact lets the current five-stat/parity/benchmark pattern stabilize before the most stateful Dao.

Primary risks to audit:
- deployed / nurture / integrity invariants;
- no activation without a valid Chủ Trận;
- no double spend between nurture and integrity;
- lifecycle across death, Hunt transitions, save/restore and replay;
- Auto must maintain formation before trying to spend it.

Benchmark identities should include at least: **Dưỡng Trận / Đại Thành Toàn Kích / Hộ Nhãn duy trì**.

## 4. Per-Dao production phases

Every newly opened Dao should follow the same phase template.

### P0 — Scope + Contract
- register `dao-<id>` manifest with `closureReady:false`;
- lock identity, ten skills, passive/core model, five-stat families, Auto intent and benchmark identities;
- explicitly defer unrelated collection/global-balance systems.

### P1 — Core correctness
- audit runtime state creation;
- generation/spend/reset/cap rules;
- skill `canUse` gates;
- action prepare/finish timing;
- deterministic save/clone behavior where applicable.

### P2 — Five-stat migration
- assign explicit CL / TP / TPH / LL / TT scaling families to all ten skills;
- prohibit generic hidden total-damage multipliers as a substitute for authored stat ownership;
- add narrow migration/authority gate.

### P3 — Passive + mastery authority
- prove all eight passives have one runtime owner;
- prove every mastery milestone has an executable owner or explicitly classify presentation-only text;
- no duplicate mechanic engines.

### P4 — Consumer parity
- CombatKernel V3 / CombatEngine;
- manual + Auto/tactical;
- PvE/Boss;
- PvP;
- Hunt/offline representative path;
- Secondary Dao passive-only lane where applicable;
- locked Sword/Fist/Mind regression surfaces when shared seams are touched.

### P5 — Identity-valid deterministic benchmark
- deterministic multi-seed matrix;
- equal five-stat budget across compared archetypes;
- defining mechanic counters must be >0 or the run is invalid;
- benchmark is diagnostic only and cannot auto-tune.

### P6 — Minimal tuning
- only after P0–P5 correctness/parity/identity are green;
- change Dao-owned levers only;
- one lever at a time;
- stop once authored target bands pass.

### P7 — Closure
- exact clean FULL CLEAN;
- set feature manifest `closureReady:true` only when evidence is complete;
- run `DONG_BO_VA_TEST_FEATURE.cmd <feature-id>`;
- write closure record;
- lock the Dao before opening the next one.

## 5. Global balance intentionally deferred until all eight Dao are production-locked

Do **not** use current cross-system balance debt to retune a Dao while producing the remaining five.

After all eight Dao are locked, open one separate **Global Balance V2** audit covering:

- eight Main Dao;
- five-stat build archetypes;
- Tri Kỷ;
- Linh Thú;
- player collection Pháp Bảo;
- Chí Bảo;
- other cross-system contributors only when they materially change combat power.

Ngũ Hành Equipment Set/Gem authority remains retired and must not be restored for this audit.

The current V148 Confidant and V149 Artifact balance failures are deferred balance evidence, not permission to retune those systems during Dao production.

## 6. Immediate next action

Mind remains the current opened Dao.

When the local Windows machine is available:

```cmd
git pull --ff-only origin main
git rev-parse HEAD
tools\web\RUN_MIND_M5_BENCHMARK.cmd --no-pause
```

Retain:
- `qa\output\mind-m4-benchmark.json`;
- launcher/benchmark log.

Then:
- valid M4 result → decide whether M5 needs any Mind-owned tuning;
- if target bands already pass, skip unnecessary tuning;
- M6 exact closure → lock Mind;
- open **Thể Đạo** next.

## 7. Evidence status

This roadmap is based on source audit of current `main` only.

- Source audit: **DONE**.
- Gameplay modifications: **NONE from this roadmap**.
- New tests executed for this roadmap: **NOT CLAIMED**.
- Exact-SHA runtime/CI evidence for the unopened Dao: **NOT CLAIMED**.
- Production/closure status of unopened Dao: **NOT CLAIMED**.
