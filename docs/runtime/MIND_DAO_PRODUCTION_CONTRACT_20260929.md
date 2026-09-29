# THẦN NIỆM DAO PRODUCTION CONTRACT — 2026-09-29

Status: **M3 CLOSED / M4 OPEN — PRODUCTION-PATH PARITY CLOSED; DETERMINISTIC IDENTITY HARNESS NEXT; PRODUCTION TUNING NOT AUTHORIZED**

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

Thần Niệm remains under the V3 sequence: **correctness → parity → identity-valid deterministic benchmark → minimal tuning → scoped closure**. The feature manifest remains `closureReady:false`; M3 closure is not whole-feature closure and does not authorize coefficient tuning.

## 1. Production identity

Thần Niệm is the **mental pressure / tactical interference / control Dao**.

Canonical readable loop:

**`ẤN → NHIỄU → ẢNH / KÍCH`**

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

### Niệm Lực — self long cycle

- base cap: **20**;
- P5 candidate maximum cap: **30**;
- base hold: **12s**;
- base decay: **1 stack/s** after hold expiry;
- carries across Hunt kills under current V2 semantics;
- reads/UI projections may synchronize elapsed timers but may not refresh the P8 peak hold.

### Niệm Ảnh — cadence mechanic, not a third resource

- Main-only;
- baseline every **3 eligible normal Mind Active roots**;
- canonical echo delay **0.6s**;
- baseline replay coefficient **35%**;
- safety ceiling **70%** after authored additions;
- stores only sanitized damage/heal/shield/Break packets;
- no Chân Nguyên/Gauge/Thần Ấn/Niệm Lực replay;
- no channel/deploy/summon duplication;
- no recursion;
- shared follow-up budget remains authoritative.

Basic and Ultimate do not advance the ordinary cadence except where an implemented mastery explicitly modifies cadence behavior without creating a second counter.

## 3. Ten-skill inventory

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

No extra production skill may be added without reopening the contract.

## 4. Five-stat ownership — M2A CLOSED

All ten Mind skills carry explicit `fiveStatScalingV5` families.

Locked direction:
- **CL / power** — direct-damage anchor;
- **TT / sense** — Accuracy / Control / Resolve authority plus explicitly authored mental-skill scaling;
- **TPH / agility** — selected split/chase/echo-local scaling only;
- **TP / body** — Tâm Kính defensive/shield contribution only where authored;
- **LL / spirit** — Max Chân Nguyên capacity, not hidden damage.

There is no global TT damage multiplier.

## 5. Passive ownership — M2B CLOSED

Canonical V2 progression remains exactly P1–P8.

- P1 unlocks Niệm Lực; Main converts 10-stack groups into echo/control quality; Secondary-safe lane is Resolve only.
- P2 allows one bounded extra-stack chance per eligible gain event.
- P3 owns hold/decay; reads do not refresh peak timing.
- P4 gives Main action-local Accuracy + Control Power; Secondary-safe Resolve only.
- P5 increases Niệm Lực cap only.
- P6 gives Main Nhiễu potency + Niệm Ảnh Break quality; no generic Skill Damage.
- P7 gives action-local Armor Pen only under current mental pressure and only on procDepth-0 Main-Mind direct packets.
- P8 peak refresh is event-owned; Main gains echo/Nhiễu/control quality, Secondary gets bounded Resolve.

M2B runtime candidate: `24c608f1764c9e5a34c65e5c66602e3e30d3a499`. Detailed audit: `docs/runtime/MIND_DAO_M2B_CLOSURE_AUDIT_20260929.md`.

## 6. M1 correctness state — CLOSED

Regression guards retain:
- V2-owned Thần Ấn generation/spend;
- mark-based Nhiễu eligibility/transaction;
- zero-mark normal Bạo Ấn rejection;
- Observe mark gain by resolved channel progress;
- Phân Lưu bounded state and bonus-mark cadence;
- sanitized Niệm Ảnh replay with shared follow-up budget and non-recursion;
- Ultimate excluded from ordinary snapshot/cadence authority;
- P8 timer refresh outside passive/stat reads;
- Ultimate 3+ mark soft Nhiễu and 5-mark canonical mental-control pulse.

## 7. M2C — Mastery architecture CLOSED

All ten mastery rows in `mind-dao-v2.js` own exactly the authored 100 / 250 / 500 / 750 / 1000 milestones through the Mind runtime owner and narrow combat/decision hooks.

Closed ownership classes:
- pure numeric skill-local modifier;
- root-action behavior change;
- snapshot/echo modifier;
- Thần Ấn transaction-safe modifier;
- Niệm Lực event modifier;
- control/Break modifier;
- timing/cast/recovery modifier.

M2C locks:
- mastery authority is Main-Mind-only unless an existing passive-safe Secondary lane explicitly says otherwise;
- root extra-hit packages are procDepth-0 and once/root;
- no mastery replays Thần Ấn consume/gain through Niệm Ảnh;
- no second echo counter or third resource lane;
- all echoes remain sanitized, non-recursive, capped at 70% coefficient and subject to the shared follow-up budget;
- Observe 1000 sixth-hit behavior occurs only on completed channel resolution;
- Flow 1000 reuses the existing state/cadence owner rather than creating independent recursion;
- Ultimate may schedule only a bounded echo of a pre-existing snapshot and does not create a normal snapshot;
- Nhiễu/Ultimate control remains under canonical control/boss rules;
- Nhiễu mastery 500 applies authored echo-Break bonus based on the **current target being under Nhiễu**, independent of which eligible Mind skill produced the snapshot;
- Ultimate mastery 1000 improves ordinary Niệm Ảnh cadence interval by 25% during Tịch Chiếu Niệm Vực while preserving the canonical **0.6s** echo delay and fractional cadence credit.

M2C semantic-alignment candidate: `17ec773bb057e7e6145bea10de91e532bff0efdf`. Detailed audit: `docs/runtime/MIND_DAO_M2C_CLOSURE_AUDIT_20260929.md`.

No production balance tuning is authorized by M2C closure.

## 8. M3 production-path parity — CLOSED

Parity has been audited across:
- manual/shared CombatKernel V3 authority;
- Auto/tactical rotation inputs;
- PvE/Boss consumers;
- PvP;
- Hunt/offline representative combat;
- save/restore/carry state where applicable;
- Secondary Mind passive-only behavior;
- locked Sword and Quyền regressions after shared-seam changes.

Production consumers converge on canonical CombatKernel V3 / `CombatEngine`; no alternate Mind mechanic engine was found. Hunt carry preserves durable `battleDaoStateV2`; action-local Thần Ấn/Niệm Ảnh transactions remain combat-owned. Auto/tactical layers choose actions but do not resolve Mind mechanics independently.

Registered gate: `qa/tests/mind-dao-m3-consumer-parity-test.js`.  
Detailed audit: `docs/runtime/MIND_DAO_M3_CLOSURE_AUDIT_20260929.md`.

M3 made no coefficient or balance changes.

## 9. Deterministic benchmark — M4 OPEN

Feature command remains:

`tools\web\RUN_MIND_M5_BENCHMARK.cmd`

The launcher remains fail-closed until M4 installs the real identity-valid deterministic harness and replaces the current feature-manifest benchmark contract placeholder.

Planned archetypes remain:
- **Bạo Ấn** — normalized damage reference 100%;
- **Niệm Ảnh** — target 88–98% of Bạo Ấn, with 15–30% real echo contribution;
- **Nhiễu Thức** — target 75–90% of Bạo Ấn and highest real interference/control metric.

Any run with zero defining mechanic is invalid evidence.

M4 authorizes harness/baseline construction only. Coefficient tuning remains blocked until an identity-valid deterministic baseline exists.

## 10. Phase state

- **M0 — CLOSED** — scope / contract / registry.
- **M1 — CLOSED** — runtime correctness / ownership.
- **M2A — CLOSED** — explicit five-stat migration.
- **M2B — CLOSED** — passive architecture / ownership.
- **M2C — CLOSED** — mastery architecture / ownership.
- **M3 — CLOSED** — production-path parity.
- **M4 — OPEN** — deterministic identity harness / baseline.
- **M5 — BLOCKED** — minimal tuning.
- **M6 — BLOCKED** — exact clean feature-scoped closure.

`dao-mind` must remain `closureReady:false` until M4/M5 evidence and required regressions are complete. Whole-feature production tuning/closure is not authorized by this M3 close.