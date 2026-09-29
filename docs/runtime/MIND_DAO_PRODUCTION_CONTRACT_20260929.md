# THẦN NIỆM DAO PRODUCTION CONTRACT — 2026-09-29

Status: **M2B CLOSED / M2C OPEN — PASSIVE ARCHITECTURE CLOSED; MASTERY OWNERSHIP NEXT; PRODUCTION TUNING NOT AUTHORIZED**

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

Thần Niệm remains under the V3 sequence: **correctness → parity → identity-valid deterministic benchmark → minimal tuning → scoped closure**. The feature manifest remains `closureReady:false`; M2B closure is not whole-feature closure and does not authorize coefficient tuning.

## 1. Production identity

Thần Niệm is the **mental pressure / tactical interference / control Dao**.

Canonical readable loop:

**`ẤN → NHIỄU → ẢNH / KÍCH`**

It wins by placing target-local Thần Ấn, spending marks for tactical interference or burst/Break, building long-cycle Niệm Lực, and using sandboxed Niệm Ảnh as a delayed cadence payoff. Hard control remains bounded by canonical Control vs Resolve, control pressure, chain limits, immunity and boss rules.

Forbidden drift:
- no generic `TT → all damage` multiplier;
- no permanent control chain;
- no recursive echo/proc engine;
- no third independent resource;
- no reopening Sword/Quyền/Ngũ Hành equipment balance to tune Mind.

## 2. Canonical resources and state

### Thần Ấn — target-local short cycle

- owner: current target;
- hard cap: **5**;
- built by authored Main-Mind skills only;
- spend commits exactly once at root resolution;
- switching target never transfers marks;
- Niệm Ảnh may never repeat add/consume transactions.

Current production build/spend semantics are owned by the V2 Mind runtime and guarded by M1 tests, including Observe progress, Nhiễu spend, Bạo Ấn/Ultimate consume, and Phân Lưu bonus generation.

### Niệm Lực — self long cycle

- base cap: **20**;
- P5 candidate maximum cap: **30**;
- base hold: **12s**;
- base decay: **1 stack/s** after hold expiry;
- P3 owns hold/decay tuning;
- carries across Hunt kills under existing V2 semantics;
- reads/UI projections may synchronize elapsed timers but may not refresh the P8 peak hold.

### Niệm Ảnh — cadence mechanic, not a third resource

- Main-only;
- every **3 eligible normal Mind Active roots**;
- delay **0.6s**;
- baseline replay coefficient **35%**;
- safety ceiling **70%** after authored additions;
- stores only sanitized damage/heal/shield/Break packets;
- no Chân Nguyên/Gauge/Thần Ấn/Niệm Lực replay;
- no channel/deploy/summon duplication;
- no recursion;
- shared follow-up budget remains authoritative.

Basic and Ultimate do not advance the ordinary cadence unless a future implemented mastery explicitly says otherwise.

## 3. Ten-skill inventory

The production inventory remains exactly:

1. `skill.dao.mind.basic` — Linh Tê Niệm Châm.
2. `skill.dao.mind.mark` — Lạc Niệm Thành Ấn.
3. `skill.dao.mind.split` — Phân Thần Truy Niệm.
4. `skill.dao.mind.interfere` — Nhiễu Thần Chỉ.
5. `skill.dao.mind.guard` — Tâm Kính Hộ Thức.
6. `skill.dao.mind.chase` — Truy Hồn Niệm Ấn.
7. `skill.dao.mind.burst` — Bạo Ấn Phá Thức.
8. `skill.dao.mind.observe` — Tịch Niệm Quan Tâm.
9. `skill.dao.mind.flow` — Vạn Niệm Phân Lưu.
10. `skill.dao.mind.ultimate` — Vạn Niệm Quy Nhất · Tịch Chiếu.

No extra production skill may be added during this slice without reopening the contract.

## 4. Five-stat ownership — M2A CLOSED

All ten Mind skills now carry explicit `fiveStatScalingV5` families.

Locked ownership direction:
- **CL / power** — direct-damage anchor;
- **TT / sense** — Accuracy / Control / Resolve authority plus explicitly authored mental skill scaling;
- **TPH / agility** — selected split/chase/echo-oriented local scaling only;
- **TP / body** — Tâm Kính defensive/shield contribution only where authored;
- **LL / spirit** — Max Chân Nguyên capacity, not a hidden damage stat.

There is no global TT damage multiplier. Exact coefficients remain benchmark/tuning work and are not authorized by M2A closure alone.

## 5. Passive ownership — M2B CLOSED

Canonical V2 progression remains exactly P1–P8.

- **P1 — Niệm Lực Quyết:** unlocks Niệm Lực; Main converts 10-stack groups into Niệm Ảnh/control quality; Secondary-safe lane is Resolve only.
- **P2 — Dưỡng Niệm Chân Kinh:** one bounded extra-stack chance per eligible gain event.
- **P3 — Niệm Lực Trường Tồn:** hold/decay ownership; passive/stat reads do not refresh the peak timer.
- **P4 — Minh Tâm Chân Ý:** Main action-local Accuracy + Control Power; Secondary-safe Resolve only.
- **P5 — Vạn Niệm Vô Cực:** increases Niệm Lực cap only; never changes Thần Ấn cap.
- **P6 — Thần Niệm Lăng Thiên:** Main Nhiễu potency + Niệm Ảnh Break quality; no generic Skill Damage.
- **P7 — Nhất Niệm Phá Vọng:** at Niệm Lực ≥20, procDepth-0 Main-Mind direct packets gain action-local Armor Pen only while the target is under current mental pressure (Thần Ấn, Nhiễu, or marks consumed by the current root).
- **P8 — Niệm Lực Bất Diệt:** cap-state peak refresh is event-owned; Main gains Niệm Ảnh/Nhiễu/control quality, Secondary gets bounded Resolve; no generic all-skill damage or Gauge gain.

Ownership rules:
- `mind-dao-v2-runtime.js` is the Mind-specific passive output owner;
- generic `remainingDaoPassiveBonusesV2()` must remain mutation-free for Mind output;
- generic P8 damage/Gauge and read-owned refresh branches must exclude Mind;
- Main-only action-local Accuracy/Control/Armor Pen must not leak to Secondary Mind;
- Secondary Mind may observe the long-cycle passive stack on the character's own eligible roots but may not gain Mind Active/Core/Ultimate authority.

M2B runtime candidate: `24c608f1764c9e5a34c65e5c66602e3e30d3a499`. Detailed audit: `docs/runtime/MIND_DAO_M2B_CLOSURE_AUDIT_20260929.md`.

## 6. M1 correctness state — CLOSED

The previously identified M1 blockers are resolved and now treated as regression guards, not current defects:
- V2-owned Thần Ấn generation/spend;
- mark-based Nhiễu eligibility/transaction;
- zero-mark normal Bạo Ấn rejection;
- Observe mark gain by resolved channel progress;
- Phân Lưu 5s state and bounded bonus-mark cadence;
- sanitized Niệm Ảnh replay with shared follow-up budget and non-recursion;
- Ultimate excluded from ordinary echo cadence;
- P8 timer refresh moved out of passive/stat reads.

## 7. M2C — Mastery architecture OPEN

The ten mastery rows in `mind-dao-v2.js` remain authored design intent until runtime ownership is proven.

M2C must classify and implement each milestone by ownership type:
- pure numeric skill-local modifier;
- root-action behavior change;
- snapshot/echo modifier;
- Thần Ấn transaction modifier;
- Niệm Lực event modifier;
- control/Break modifier;
- timing/cast/recovery modifier.

Mastery must not create a second echo counter, a third resource lane, duplicate Gauge/resource events, or bypass control/boss/follow-up-budget rules.

No balance tuning is authorized during M2C.

## 8. M3 parity requirements

Before benchmark work, prove semantic parity for:
- manual CombatKernel V3 path;
- Auto rotation;
- PvE/Boss;
- PvP;
- Hunt/offline representative combat;
- save/restore/carry state where applicable;
- Secondary Mind passive-only behavior;
- locked Sword and Quyền regressions after shared-seam changes.

## 9. Deterministic benchmark — M4 BLOCKED

Feature command remains:

`tools\web\RUN_MIND_M5_BENCHMARK.cmd`

The launcher intentionally remains fail-closed until M3 parity is complete and M4 installs the real identity-valid deterministic harness. The current feature manifest benchmark contract gate remains a placeholder.

Planned archetypes remain:
- **Bạo Ấn** — normalized damage reference 100%;
- **Niệm Ảnh** — target 88–98% of Bạo Ấn, with 15–30% real echo contribution;
- **Nhiễu Thức** — target 75–90% of Bạo Ấn and highest real interference/control metric.

Any run with zero defining mechanic is invalid evidence.

## 10. Phase state

- **M0 — CLOSED** — scope / contract / registry.
- **M1 — CLOSED** — runtime correctness / ownership.
- **M2A — CLOSED** — explicit five-stat migration.
- **M2B — CLOSED** — passive architecture / ownership.
- **M2C — OPEN** — mastery architecture / ownership.
- **M3 — OPEN AFTER M2C** — rotation and parity.
- **M4 — BLOCKED** — deterministic identity harness.
- **M5 — BLOCKED** — minimal tuning.
- **M6 — BLOCKED** — exact clean feature-scoped closure.

`dao-mind` must remain `closureReady:false` until M3/M4/M5 evidence and required regressions are complete. Whole-feature production tuning/closure is not authorized by this M2B close.
