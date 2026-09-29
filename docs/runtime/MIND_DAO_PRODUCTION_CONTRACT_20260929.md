# THẦN NIỆM DAO PRODUCTION CONTRACT — 2026-09-29

Status: **M2A CLOSED / M2B OPEN — PASSIVE + MASTERY ARCHITECTURE IN IMPLEMENTATION; PRODUCTION TUNING NOT AUTHORIZED**

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main` only  
Feature id: `dao-mind`  
Opening source SHA: `71bfb42b89294f94244d4d766d67165afd5b11f5`

Parent locks:
- Combat Backend V3 — CLOSED / LOCKED.
- Sword Dao Production V1 — CLOSED / LOCKED.
- Fist / Quyền Dao Production V1 — CLOSED / LOCKED.
- Dao Production Workflow V3 — ACTIVE / LOCKED.
- Ngũ Hành Equipment Retirement — CLOSED / LOCKED.

This contract opens Thần Niệm under the same production discipline learned from Kiếm and Quyền: **contract first → runtime seam correctness → parity → identity-valid deterministic benchmark → minimal tuning → scoped closure**. A benchmark result is invalid when the defining Thần Niệm mechanic did not actually fire.

## 1. Scope lock

### In scope

- `dist/content/mind-dao-v2.js`.
- Thần Niệm rows only in `dist/content/battle-dao-skill-pack-v118.js`.
- Thần Niệm state/defaults in `dist/core/battle-dao-v2-contract.js`.
- Thần Niệm runtime ownership in `dist/core/battle-dao-v2-runtime.js`.
- Necessary Thần Niệm compatibility seams in `dist/core/battle-dao-combat-v118.js`.
- Thần Niệm Auto rules in `dist/core/battle-dao-rotation-v127.js` and narrowly required AI conditions.
- Shared CombatKernel / control / Hunt / PvP seams only when a proven Thần Niệm correctness or parity defect requires them.
- QA harnesses, feature manifest, docs, launcher.

### Explicitly deferred

Do not pull these systems into this slice merely to make a global test green:
- Artifact / Relic;
- Spirit Beast;
- Confidant;
- Equipment balance;
- Alchemy balance;
- Economy;
- Reincarnation-wide balance;
- Collection-wide power budgets;
- other unopened Dao production slices.

Sword and Quyền remain regression locks, not tuning targets.

## 2. Production identity

Thần Niệm is the **mental pressure / tactical interference / control Dao**.

It should win by:
1. placing **Thần Ấn** on the target;
2. choosing whether to spend those marks for disruption or damage;
3. building long-cycle **Niệm Lực** through sustained mental actions;
4. using **Niệm Ảnh** as a delayed, sandboxed echo of selected actions;
5. creating bounded control windows under the canonical Control vs Resolve, pressure, chain-limit, immunity and boss rules.

Thần Niệm is the primary home for meaningful hard-control gameplay, but hard control must be **sparse, contestable and boss-resistant**. It must never become permanent stun/root/silence/suppression chaining or bypass canonical control immunity.

Thần Niệm is not:
- Kiếm burst with different names;
- Quyền counter / Break bruiser;
- a generic TT-to-damage conversion engine;
- a third elemental system;
- a reason to reopen Ngũ Hành equipment gameplay.

## 3. Canonical resource model

There are **two stored resource lanes** plus one core cadence mechanic. Do not invent a third independent resource.

### 3.1 Thần Ấn — target-local short cycle

- Stored on the target as mark `Thần Ấn`.
- Normal cap: **5**.
- Built by authored Thần Niệm skills.
- Spent by disruption / burst payoffs.
- Target-local: changing target must not magically transfer the target's marks.

Current working build/spend map:
- Basic: +1.
- Lạc Niệm Thành Ấn: +2.
- Phân Thần Truy Niệm: +2.
- Truy Hồn Niệm Ấn: +1.
- Tịch Niệm Quan Tâm: +3 only through the completed authored action/channel semantics; timing must be verified before production lock.
- Vạn Niệm Phân Lưu: +2.
- Nhiễu Thần Chỉ: intended spend 1–3 for interference.
- Bạo Ấn Phá Thức: spend up to 5 for burst/Break.
- Ultimate: spend up to 5 for final payoff.

### 3.2 Niệm Lực — self long cycle

Existing V2 passive-stack authority is retained as the long-cycle lane:
- player-facing name: **Niệm Lực**;
- p1 unlocks it;
- base cap 20;
- base hold 12s;
- after hold expires, decay 1 stack/s;
- p3 modifies duration/decay;
- p5 modifies cap;
- carries across Hunt kills under the existing V2 carry model.

The current p1/p6/p7/p8 generic damage/Armor Pen package is **not automatically accepted as final Thần Niệm identity**. M1/M2 must audit which bonuses should move toward echo/interference/control rather than allowing Niệm Lực to become another generic damage stack.

### 3.3 Niệm Ảnh — core cadence/payoff, not a resource bar

`mindEchoCounter` is an internal cadence counter, not a third player-facing resource.

Baseline authored intent already present in `mind-dao-v2.js`:
- main-Dao only;
- eligible Thần Niệm Active actions create/update a sanitized snapshot;
- every 3 eligible Active actions arms/fires a **Niệm Ảnh** after 0.6s;
- baseline echo coefficient 35%;
- no extra CN charge;
- no Ultimate Gauge generation from the echo;
- no summon/channel duplication;
- no recursive echo;
- shared follow-up/event budget must remain authoritative.

Minimum snapshot safety contract:
- root/procDepth-0 source only;
- no resource generation/spend replay;
- no Thần Ấn add/consume replay;
- no Ultimate/Gauge replay;
- no passive re-trigger loop;
- damage/heal/shield/Break may be replayed only from a sanitized packet;
- any control effect replay must be explicitly whitelisted and must still route through canonical Control vs Resolve / boss / chain-immunity rules.

Basic and Ultimate do not advance the ordinary 3-Active cadence unless an authored mastery explicitly says otherwise. Ultimate may have its own explicit echo interaction without becoming a new snapshot source.

## 4. Five-stat ownership

The five primary stats remain exactly CL / TP / TPH / LL / TT.

Current audit fact: the ten V118 Thần Niệm skills do **not** yet carry `fiveStatScalingV5`. `fiveStatSkillPowerV5()` therefore falls back to effective Attack, so current damage is effectively on the legacy CL/Attack lane; there is no hidden TT damage mapping.

Production ownership direction:
- **CL** — direct-damage anchor.
- **TT** — primary control / Accuracy / Resolve / mental-effect authority. TT may appear in explicitly authored skill-specific mental scaling later, but there is no global TT damage multiplier.
- **TPH** — only explicit tempo/chase skill scaling where justified; never generic Action Speed from TPH.
- **TP** — defensive/shield-specific contribution only where explicitly authored.
- **LL** — Max Chân Nguyên capacity only unless a future skill explicitly states otherwise.

Exact per-skill five-stat weights are **M2 work** and may not be tuned before M1 correctness is complete.

## 5. Current ten-skill inventory

The existing ten-skill set is the working production inventory; do not add random skills during M0/M1.

1. `skill.dao.mind.basic` — Linh Tê Niệm Châm — Basic / +1 Thần Ấn.
2. `skill.dao.mind.mark` — Lạc Niệm Thành Ấn — fast mark build.
3. `skill.dao.mind.split` — Phân Thần Truy Niệm — mark build / multi-hit candidate.
4. `skill.dao.mind.interfere` — Nhiễu Thần Chỉ — tactical interference spender.
5. `skill.dao.mind.guard` — Tâm Kính Hộ Thức — defensive mental guard.
6. `skill.dao.mind.chase` — Truy Hồn Niệm Ấn — cast / snapshot-oriented chase.
7. `skill.dao.mind.burst` — Bạo Ấn Phá Thức — mark-spend damage/Break.
8. `skill.dao.mind.observe` — Tịch Niệm Quan Tâm — channel / observation / setup.
9. `skill.dao.mind.flow` — Vạn Niệm Phân Lưu — deploy/state / pressure support.
10. `skill.dao.mind.ultimate` — Vạn Niệm Quy Nhất · Tịch Chiếu — unavoidable Ultimate payoff under boss/control rules.

Mastery numbers in `mind-dao-v2.js` are **candidate authored content**, not closure authority yet. M1/M2 must prove the runtime actually owns each promised mechanic before any coefficient is balanced.

## 6. Passive ownership

Canonical V2 progression already contains p1–p8:
- p1 Niệm Lực Quyết;
- p2 Dưỡng Niệm Chân Kinh;
- p3 Niệm Lực Trường Tồn;
- p4 Minh Tâm Chân Ý;
- p5 Vạn Niệm Vô Cực;
- p6 Thần Niệm Lăng Thiên;
- p7 Nhất Niệm Phá Vọng;
- p8 Niệm Lực Bất Diệt.

The older five `passive.dao.mind.*` entries in V118 coexist as an older compatibility/content lane. M1 must identify their surviving authority and must not create a third passive family.

Rules learned from Quyền:
- passive/stat reads must not mutate combat timers merely because UI/combat code asked for a read;
- event-owned refresh must happen on an eligible root action, not inside a bonus getter;
- Main-only core and Secondary-passive semantics must remain separate.

## 7. Runtime seam audit — M1 blockers

### Finding A — Nhiễu ownership is bypassed under V2

`prepareBattleDaoActionV118()` / `finishBattleDaoActionV118()` suppress V1 Dao resource/signature mutation when V2 is enabled. The existing `mindInterfere` block that consumes 1–3 Thần Ấn and applies cast/recovery interference sits inside that suppressed V1 path.

Result: the current V2 Thần Niệm runtime does not own the promised Nhiễu Thần Chỉ mark-spend/interference behavior through that legacy block.

**M1 requirement:** move/rebuild this behavior under the V2 owner, not by re-enabling the whole V1 Dao path.

### Finding B — Auto Burst gates on the wrong semantic

Current Auto uses `mindEchoCounter >= 2` to choose `skill.dao.mind.burst`, while Burst actually consumes target `Thần Ấn`.

**M1 requirement:** Auto must gate a mark spender on actual target mark state / intended tactical window, not on internal Niệm Ảnh cadence.

### Finding C — Niệm Ảnh runtime does not match the authored snapshot contract

The catalog describes a whitelisted snapshot replay. Current V2 runtime stores snapshot metadata, then computes a delayed damage coefficient from the just-finished action's HP damage. It does not yet replay the authored sanitized damage/heal/shield/Break packet.

**M1 requirement:** establish one canonical sanitized snapshot packet and prove non-recursion/event-budget behavior.

### Finding D — five-stat migration is not done

All ten current Thần Niệm skills lack `fiveStatScalingV5`; the fallback is Attack/CL.

**M2 requirement:** add explicit per-skill five-stat families only after M1 mechanics are correct.

### Finding E — Niệm Lực p8 refresh is still read-owned

The generic remaining-Dao bonus getter can extend a cap-state stack timer for non-Fist Dao, including Mind. Quyền already taught that refresh must be event-owned rather than caused by a read.

**M1 requirement:** Thần Niệm peak-state refresh must be attached to eligible action events, not stat/bonus reads.

### Finding F — channel/deploy timing must be proven

Tịch Niệm Quan Tâm and Vạn Niệm Phân Lưu promise setup/state behavior. Before tuning, tests must prove mark gain/state creation occurs at the intended completion/event boundary and cannot be duplicated by interrupted channel/proc replay.

## 8. Control contract

Thần Niệm owns control identity, but all disabling control must remain inside canonical combat rules:
- TT/Control vs Resolve contest;
- control pressure;
- control-chain limit;
- immunity window;
- boss resistance/effectiveness;
- no generated proc may bypass those gates.

M1 may add/repair a **bounded mental interrupt/stagger window** only after identifying the canonical control API. It must not introduce a parallel stun implementation in Thần Niệm code.

Soft interference such as cast delay/recovery pressure remains valid and should be a defining output even when a boss resists hard control.

## 9. Auto / parity contract

Before benchmark/tuning, prove the same semantic loop in:
- manual CombatKernel V3 path;
- Auto rotation;
- PvE/Boss;
- PvP;
- Hunt/offline settlement path where combat is represented;
- save/restore / carry state;
- Secondary Dao passive-only behavior.

Auto priorities must express the same resource semantics as manual play:
- react to target cast/channel for Nhiễu;
- do not spend Burst without Thần Ấn;
- do not confuse `mindEchoCounter` with spendable marks;
- build when marks are low;
- use Ultimate only under a valid authored payoff window.

## 10. Deterministic benchmark contract — planned, BLOCKED in M0

Feature manifest benchmark command: `tools\web\RUN_MIND_M5_BENCHMARK.cmd`.

The launcher is intentionally blocked until correctness + parity exist. It must be replaced by a real deterministic harness before `closureReady:true`.

Planned benchmark archetypes:
- **Nhiễu Thức** — mark-spend/control pressure; highest real interference/control output, lowest damage target.
- **Niệm Ảnh** — echo/snapshot cadence; meaningful non-zero echo share without recursion.
- **Bạo Ấn** — mark-spend damage/Break; damage reference, lower control pressure than Nhiễu Thức.

Candidate identity bands to validate after the first correct baseline (not tuning authority yet):
- Bạo Ấn normalized damage reference: 100%.
- Niệm Ảnh damage: 88–98% of Bạo Ấn.
- Nhiễu Thức damage: 75–90% of Bạo Ấn.
- Niệm Ảnh echo contribution: target 15–30% of its total damage in a valid sustained benchmark.
- Nhiễu Thức must produce non-zero real interference/control events and exceed both other archetypes on the benchmark control metric.
- All three must build and spend Thần Ấn in the intended loop.

A run is **INVALID** if the defining mechanic is zero/unreachable, including:
- Niệm Ảnh archetype with zero echo events;
- Nhiễu Thức with zero real interference/control events;
- Bạo Ấn with zero Thần Ấn spend;
- recursive echo or event-budget violation;
- benchmark using a different runtime path from production.

Do not tune against invalid runs.

## 11. Phase sequence

### M0 — Scope / contract / registry
- create this contract;
- register `dao-mind` with `closureReady:false`;
- install fail-closed benchmark placeholder;
- add structural contract gate.

### M1 — Runtime correctness / ownership
- V2-owned Thần Ấn interference;
- canonical sanitized Niệm Ảnh snapshot;
- event-owned Niệm Lực refresh;
- target-mark projection/Auto conditions;
- channel/deploy completion semantics;
- no recursion / no duplicate authority.

### M2 — Five-stat migration + skill/passive architecture
- explicit CL/TT/TPH/TP families;
- no generic TT damage multiplier;
- finalize control allocation and mastery ownership;
- update contract gate from M0 baseline to production contract.

### M3 — Rotation / parity
- Auto/manual parity;
- PvE/PvP/Hunt/save/carry/Secondary-passive parity.

### M4 — Deterministic harness
- replace blocked benchmark launcher;
- prove identity counters are non-zero and runtime-valid;
- establish first correct baseline.

### M5 — Minimal tuning
- tune only Thần Niệm-specific coefficients/priority windows necessary to enter target bands;
- do not retune Sword/Quyền or deferred systems.

### M6 — Scoped closure
- flip manifest to `closureReady:true` only after correctness, parity, valid benchmark and target bands pass;
- Full Clean + `DONG_BO_VA_TEST_FEATURE.cmd dao-mind`;
- record exact clean Windows evidence SHA;
- then close/lock.

## 12. M0 exit condition

M0 is complete when this contract, feature manifest, fail-closed benchmark guard and structural contract test are committed on `main`. **M0 completion is not gameplay closure and is not authorization to tune coefficients.**
