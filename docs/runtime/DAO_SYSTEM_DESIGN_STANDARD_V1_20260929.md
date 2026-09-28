# DAO SYSTEM DESIGN STANDARD V1 — 2026-09-29

Status: **CANONICAL / ACTIVE**

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main`  
Companion execution workflow: `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`

This document defines **what a complete Battle Dao must contain and how its design must be expressed**. The Workflow V3 document defines **how that design is audited, implemented, benchmarked and closed**.

A future Dao is not considered design-complete because it has ten named skills. It is complete only when identity, resources, skills, passives, mastery, five-stat ownership, Auto behavior, build archetypes, runtime transaction semantics, UI contract, parity and evidence are all explicit.

Current source/runtime remains gameplay authority. For an already CLOSED / LOCKED Dao, this standard and its reference spec document the locked system; they do not silently reopen or retune it.

---

## 1. Global principles

1. Every Dao must have a **distinct combat identity** that can be stated in one sentence.
2. Every Dao must define what it **does not own**, especially where roles could overlap with another Dao.
3. Every Dao must have a readable combat loop with 3–4 named steps.
4. Main-Dao core mechanics and Secondary-Dao passive contribution are separate ownership lanes.
5. A resource exists only when it creates a meaningful decision/cadence. Internal counters do not automatically become player-facing resource bars.
6. Correctness precedes balance. A skill description is not proof that the production runtime performs the mechanic.
7. A build archetype is valid only if its defining mechanic actually executes in the production runtime.
8. No Dao may invent a sixth primary stat, a hidden global damage axis, a parallel control system or a parallel Ultimate economy.
9. Closed Daos are regression locks. New Dao work may repair a shared seam only when evidence proves the new slice requires it.
10. The player may hybridize beyond the canonical benchmark archetypes. Canonical archetypes are balance/evidence anchors, not hard build restrictions.

---

## 2. Current Dao separation matrix

This matrix protects role separation. Rows marked **LOCKED** are production authority. Rows marked **OPEN / DIRECTION** are design direction only until their own production slice closes.

| Dao | Status | Primary identity | Core lane | Long-cycle lane | Canonical archetypes |
|---|---|---|---|---|---|
| Kiếm | CLOSED / LOCKED | precision / burst / finisher | Kiếm Khí | Kiếm Ý | Trọng Trảm / Lưu Quang / Ngự Kiếm |
| Quyền | CLOSED / LOCKED | close pressure / Break / counter bruiser | Quyền Thế | Liên Kình | Trọng Quyền / Liên Hoàn / Phản Quyền |
| Thần Niệm | OPEN | mental pressure / tactical interference / control | Thần Ấn + Niệm Ảnh cadence | Niệm Lực | planned: Nhiễu Thức / Niệm Ảnh / Bạo Ấn |
| Thể | OPEN / DIRECTION | mitigation / endurance / retaliation | Phản Thế | Huyết Khí | to be production-designed |
| Pháp | OPEN / DIRECTION | spell-form rotation / resource management | Pháp Luân | Pháp Ý | to be production-designed |
| Độc | OPEN / DIRECTION | attrition / target erosion | Độc Chủng | Độc Tức | to be production-designed |
| Trận | OPEN / DIRECTION | setup / field / delayed activation | Dưỡng Độ + Độ Bền | Trận Văn | to be production-designed |
| Ngự Khí | OPEN / DIRECTION | multi-source artifact command | Nguồn Pháp Bảo | Khí Cảm | to be production-designed |

Unopened rows are not numeric locks. Their production slice must still pass this standard from the beginning.

### Role-collision rule

Each Dao contract must contain:
- **primary role** — what this Dao should be best known for;
- **secondary role** — one or two supporting strengths;
- **weaknesses / tradeoffs**;
- **forbidden ownership** — mechanics that would erase another Dao's identity.

Examples already locked:
- Quyền may briefly interrupt/stagger, but is not the sustained hard-control Dao.
- Thần Niệm may deal damage, but must not become “Kiếm burst with TT names”.
- TPH must not become a hidden global Action Speed stat merely to make a fast archetype work.

---

## 3. Mandatory Dao blueprint

Before production tuning, every Dao spec must answer all of the following.

### 3.1 Identity block

- Internal id and player-facing name.
- Status: OPEN / IMPLEMENTING / CLOSED / LOCKED.
- One-sentence identity.
- Primary role.
- Secondary roles.
- Strengths.
- Weaknesses.
- Forbidden role/mechanic collisions.
- Signature visual/gameplay moments.

### 3.2 Core loop block

Write the loop in 3–4 readable stages, for example:
- Kiếm: `KHÍ → Ý → TRẢM`.
- Quyền: `THẾ → KÌNH → TRỌNG`.

The loop must describe real production actions, not marketing copy. Each stage must map to at least one measurable runtime event/state.

### 3.3 Resource block

For every stored resource or cadence mechanic define:
- player-facing name and internal field/id;
- owner: self / target / battlefield state;
- Main-only or passive/Secondary-eligible;
- cap and temporary overcap rules;
- exact generation events;
- exact spend events;
- spend minimum/maximum;
- commit timing;
- decay/expiry/refresh;
- carry across kills/encounters;
- target-swap behavior;
- death/reset behavior;
- save/restore behavior where applicable;
- miss/dodge/interrupt/refund behavior;
- UI visibility.

A Dao should normally distinguish:
- **short-cycle core** — moment-to-moment decision resource;
- **long-cycle passive stack/state** — sustained combat progression;
- optionally a **cadence/payoff mechanic** that is not necessarily another resource bar.

Do not add a third resource merely because an internal counter exists.

---

## 4. Mandatory 10-skill package

Every production Dao has exactly:
- **1 Basic**;
- **8 learnable Actives**;
- **1 Ultimate**.

The player may learn all eight Actives but equips at most **5 Active slots** in combat. Basic and Ultimate use their own slot classes.

### 4.1 Active progression

The eight Bản Đạo V2 rows unlock at realm orders:

`10 → 18 → 34 → 46 → 62 → 74 → 90 → 102`

Each row pairs:
- one Active skill;
- one Dao passive.

The Dao spec must record the pairings rather than listing skills/passives as unrelated catalogs.

### 4.2 Canonical skill forms

Available forms are:
- `instant` — Tức Thời;
- `cast` — Thi Triển;
- `channel` — Dẫn Pháp;
- `charge` — Tụ Lực;
- `combo` — Liên Kích;
- `finisher` — Kết Liễu;
- `counter` — Phản Kích;
- `deploy` — Triển Khai.

A Dao **does not need every form**. A form is chosen only when it reinforces the Dao identity. Do not add Counter to every Dao, or Channel/Combo merely to make the table look complete.

### 4.3 Cost classes

Shared authored cost classes are:
- `zero` = 0% standard CN;
- `low` = 8%;
- `medium` = 16%;
- `high` = 28%.

A locked Dao may have explicit fixed CN costs where its production contract intentionally overrides the generic class semantics, as Sword currently does.

### 4.4 Required skill data card

Every one of the ten skills must explicitly define:
- stable id;
- Vietnamese name;
- slot: Basic / Active / Ultimate;
- form;
- role in the Dao loop;
- CN cost or cost class;
- cooldown;
- cast time;
- recovery time;
- damage/heal/shield/Break/control package;
- resource generation;
- resource spend and minimum requirement;
- five-stat scaling family and final production weights;
- Ultimate Gauge generation/cost behavior;
- Auto intent/priority window;
- targeting and boss interaction where relevant;
- interruption behavior;
- multi-hit/root-action semantics;
- five mastery milestones.

A skill may intentionally do very low damage if its job is setup, defense or control. Do not force every skill into the same DPS shape.

---

## 5. Runtime transaction semantics — mandatory

Every spender/setup skill must state **when the transaction commits**.

Possible boundaries include:
- action selected / cost payment;
- cast start;
- cast resolve;
- each channel tick;
- channel completion;
- successful hit;
- successful control/counter outcome.

The contract must answer the edge cases explicitly:
- interrupted before resolve: refund or no spend?
- skill resolves then target dodges: refund or no refund?
- target dies before resolution?
- target changes?
- boss resists control after resource spend?
- generated follow-up fails to land?

### Channel rule

A Channel must state whether rewards occur:
- upfront;
- per completed tick;
- only on full completion;
- or by a documented hybrid formula.

If the description says interruption loses unfinished progress, the implementation must not award the entire completion payoff at channel start.

### Multi-hit rule

Multi-hit packages remain one root action unless the contract explicitly says otherwise. Resource gain, passive gain, Gauge and proc/follow-up budgets must not accidentally multiply once per visual hit.

### Generated follow-up rule

Generated hits/echoes/images use canonical provenance/proc-depth/follow-up budgets. They may not recursively regenerate themselves or replay resource transactions unless explicitly whitelisted and bounded.

---

## 6. Eight-passive package

Every Dao has **8 Bản Đạo passives**, paired with the eight Active unlock rows.

Passive level range: **1–20**.

Each passive must define:
- its role in the Dao loop;
- event ownership;
- Lv1 behavior;
- Lv20 behavior;
- whether it modifies core cap, long-cycle cap, duration, decay, generation, payoff, defense, control or Ultimate cadence;
- Main-only vs Secondary-passive availability.

### Passive quality rules

1. Avoid eight generic “+damage” nodes.
2. At least part of the tree must reinforce resource cadence/identity, not only final DPS.
3. Read functions must not mutate timers or refresh state. Refresh/decay mutation belongs to combat events.
4. A capstone must create a bounded signature payoff rather than an infinite proc loop.
5. Secondary Dao passives must not silently grant Main-only core resources/Active skills.

---

## 7. Skill mastery / Thuần thục standard

Every one of the ten skills has five authored milestones:
- **100 — Tiểu Thành**;
- **250 — Đại Thành**;
- **500 — Hóa Cảnh**;
- **750 — Viên Mãn**;
- **1000 — Cực Ý**.

Raw practice may continue to use the existing 0–1,000,000 XP authority; player-facing derived mastery remains 0–1000.

### Mastery design rule

The five milestones should form a progression arc, not five generic damage bumps. Across the five milestones a skill should normally cover several of:
- role reinforcement;
- resource interaction;
- conditional payoff;
- timing/cast/recovery improvement;
- Break/control/defense specialization;
- extra hit/form transformation;
- Cực Ý identity transformation.

Cực Ý should be memorable but bounded. It may not bypass global proc/control/Ultimate rules.

---

## 8. Five-primary-stat standard

The only primary stats are:
- **Công Lực (CL / power)** — offensive power anchor;
- **Thể Phách (TP / body)** — +20 HP and +1 Defense per point;
- **Thân Pháp (TPH / agility)** — +1 Mobility per point;
- **Linh Lực (LL / spirit)** — +1 Max Chân Nguyên per point;
- **Thần Thức (TT / sense)** — +1 Accuracy, +1 Control, +1 Resolve per point.

Hard prohibitions:
- no sixth primary stat;
- no Physical/Magic split;
- no hidden Realm damage multiplier;
- no generic TPH → Action Speed;
- no generic TT → damage;
- no automatic Crit from CL;
- no requirement that hybrid skill weights sum to one fixed total.

Every production skill must carry an explicit five-stat family/weight after its migration is closed. Legacy fallback to Attack is not acceptable as final production authority for a newly closed Dao.

Hybrid scaling is allowed only when it creates a real archetype. If a TPH/TT/TP build cannot become viable without reallocating back into CL, benchmark evidence should drive a skill-local coefficient correction rather than a global stat rule.

---

## 9. Control, Break and boss rules

Every Dao spec must separate:
- direct damage;
- Break / Thất Thế;
- soft control;
- interrupt;
- short stagger;
- disabling hard control.

Break is not hard CC.

Any hard/disabling control must route through the canonical:
- Control vs Resolve contest;
- Control Pressure;
- chain limit;
- immunity window;
- boss effectiveness/resistance rules.

Do not implement a Dao-local parallel stun/root/silence system.

The Dao contract must explicitly state how much control identity it owns relative to other Daos.

---

## 10. Ultimate standard

Every Dao has one Ultimate in a dedicated Ultimate slot.

Baseline contract:
- Ultimate Gauge max/cost: **100**;
- Ultimate does not generate Gauge from itself;
- CN cost is normally zero unless the Dao contract explicitly justifies otherwise;
- resource interaction must be explicit;
- `unavoidable` means the hit cannot be Dodged; it does not mean control bypasses Resolve/boss immunity;
- Ultimate cannot start recursive follow-up/resource generation loops;
- Auto must define whether the Ultimate fires immediately at 100 Gauge or may hold briefly for a signature payoff window.

---

## 11. Main Dao / Secondary Dao ownership

Bản Đạo V2 canonical ownership:
- **Main Dao** owns Active skills, Ultimate and Main-only core resource/runtime.
- **Secondary Dao** does not receive its Active/Ultimate rotation.
- Secondary contribution, where allowed, comes through explicitly learned/eligible passive semantics.

Every Dao spec must list:
- Main-only core mechanics;
- Secondary-eligible passive mechanics;
- states that must never appear when the Dao is only Secondary.

Auto must not synthesize secondary-Dao Active rules.

---

## 12. Auto-combat standard

Auto is production gameplay, not a benchmark convenience.

Every Dao spec must define priority intent for:
- emergency defense;
- tactical reaction/counter/interrupt if owned;
- generator/setup;
- resource spender;
- Break window;
- finisher;
- Ultimate hold/fire;
- fallback Basic.

A resource spender must gate on the resource it actually spends. An internal cadence counter cannot substitute for target marks or another resource merely because both are numeric.

Fallback behavior must not bypass tactical gates. Counter skills must not fire as generic fallback if the counter condition is false.

Manual/Auto semantics must use the same resource and control ownership.

---

## 13. Three canonical production archetypes

Every Dao must define exactly **three canonical benchmark archetypes** before balance closure.

These are balance anchors, not hard limits on player builds.

The three should normally cover:
1. **damage/reference archetype** — establishes the 100% sustained-output anchor;
2. **core-mechanic archetype** — maximizes the Dao's distinctive loop;
3. **utility/alternative archetype** — trades part of raw output for another legitimate identity such as Counter, Control, Channel, sustain or setup.

The three builds must differ through real skill/resource/stat decisions, not only labels.

### Benchmark fairness contract

Default golden-example convention unless a Dao contract documents a reason to differ:
- 5 equipped Active slots;
- Basic + Ultimate included separately;
- equal total primary-stat allocation budget;
- all compared builds use equivalent passive/mastery completion;
- deterministic CombatKernel V3 path;
- 180-second sustained target;
- 12 deterministic seeds;
- mean plus spread;
- one reference build normalized to 100%;
- identity counters must be non-zero.

A run is invalid evidence when the named mechanic did not execute.

Examples:
- Counter build requires real successful counters.
- Channel build requires completed channels and no false resource cancellation.
- resource-spender build requires generation, spend and payoff.
- control build requires real control/interference events.
- echo build requires bounded echo events and no recursion.

---

## 14. UI / player readability contract

For every Dao, UI must make the real gameplay loop understandable without reading source code.

The spec must define:
- which core resource gets a visible meter/pips;
- which passive stack gets a visible compact indicator;
- which target-local mark is shown on the target;
- cap and temporary overcap presentation;
- spender readiness/highlight;
- Cực Ý/capstone state;
- Ultimate readiness;
- short descriptions for generator/spender/control roles;
- tooltips for resource commit/refund rules where player expectations could differ.

Do not expose internal counters as player resources unless the design intentionally promotes them.

---

## 15. Runtime parity requirements

Before a Dao can be balance-closed, prove the same authored semantics through the consumers relevant to that Dao:
- CombatKernel V3;
- PvE/Boss;
- Auto rotation;
- PvP snapshot/replay where applicable;
- Hunt preview;
- offline/virtual Hunt representation;
- save/restore/carry state;
- Main/Secondary ownership;
- five-stat materialization/provenance.

Benchmark must not be the first place a parity defect is discovered.

---

## 16. Required Dao reference/spec structure

Every `*_DAO_REFERENCE_SPEC_*` or open production spec should use this order:

1. Authority / status.
2. Identity and forbidden overlap.
3. Core loop.
4. Resource/state model.
5. Realm unlock tree.
6. Ten-skill table.
7. Per-skill mastery 100/250/500/750/1000.
8. Eight-passive table.
9. Five-stat map.
10. Control/Break contract.
11. Ultimate contract.
12. Main/Secondary ownership.
13. Auto priority intent.
14. Three canonical archetypes with 5-skill loadouts and stat allocation.
15. Runtime transaction/edge-case rules.
16. UI/readability requirements.
17. Benchmark/evidence contract.
18. Locked/deferred boundaries.

A missing section must be explicitly marked `UNRESOLVED`; do not silently infer it during implementation.

---

## 17. Definition of design-complete

A Dao is **DESIGN COMPLETE** only when:
- identity and forbidden overlaps are explicit;
- loop is measurable;
- resource ownership/caps/generate/spend/commit timing are explicit;
- all 10 skills have complete data cards;
- all 10 skills have five mastery milestones;
- all 8 passives have Lv1–Lv20 intent and event ownership;
- five-stat map is explicit;
- control/Break boundaries are explicit;
- Ultimate behavior is explicit;
- Main/Secondary behavior is explicit;
- Auto intent is explicit;
- exactly 3 canonical archetypes are defined;
- runtime edge cases are specified;
- UI-readable states are listed;
- benchmark identity evidence is defined.

A Dao is **PRODUCTION CLOSED / LOCKED** only after the separate Workflow V3 correctness, parity, deterministic benchmark, tuning, exact-SHA Full Clean and scoped feature closure requirements pass.

---

## 18. Golden references

Locked examples created under this standard:
- `docs/runtime/SWORD_DAO_REFERENCE_SPEC_V1_20260929.md`
- `docs/runtime/FIST_DAO_REFERENCE_SPEC_V1_20260929.md`

Open Dao work should read both references before authoring a new spec. They demonstrate that the same structural standard can support very different combat identities without forcing identical mechanics.
