# THẦN NIỆM DAO — M2B PASSIVE ARCHITECTURE CLOSURE AUDIT — 2026-09-29

Status: **M2B CLOSED / DAO-MIND STILL OPEN**

Feature: `dao-mind`  
Runtime candidate: `24c608f1764c9e5a34c65e5c66602e3e30d3a499`  
Integration parent: `17535845bc0ab4f3a54ffcffe02652ffb137d8b3`  
Guarded workflow run: `36519206674` — `Mind M2B guarded passive architecture` — **SUCCESS**

This audit closes only the **M2B passive architecture/ownership subphase**. It does not authorize Mastery tuning, deterministic balance tuning, or whole-feature closure. `dao-mind` remains `closureReady:false`.

## 1. Scope

Audited:
- `dist/content/mind-dao-v2.js` passive P1–P8 contract;
- `dist/core/mind-dao-v2-runtime.js` Mind-owned passive output;
- `dist/core/battle-dao-v2-runtime.js` generic passive compatibility and timer ownership;
- `dist/core/stats.js` Main action-local / Secondary-safe stat materialization;
- `dist/core/combat.js` action-local passive consumption;
- M1/M2A/M2B targeted tests and locked Sword/Quyền smoke evidence.

Explicitly not tuned:
- skill/mastery coefficients;
- global Main-Dao damage tuning;
- Sword or Quyền balance;
- deferred Artifact/Relic, Spirit Beast, Confidant, equipment, alchemy, economy, reincarnation or collection-wide balance.

## 2. Passive ownership audit

| Passive | Production ownership | Audit result |
| --- | --- | --- |
| P1 — Niệm Lực Quyết | Main: Niệm Ảnh + control/interference quality per 10 stacks. Secondary: Resolve only. | PASS |
| P2 — Dưỡng Niệm Chân Kinh | One bounded extra Niệm Lực chance on an eligible gain event. | PASS |
| P3 — Niệm Lực Trường Tồn | Niệm Lực hold/decay tuning; reads do not refresh P8 peak. | PASS |
| P4 — Minh Tâm Chân Ý | Main action-local Accuracy + Control Power. Secondary: Resolve only. | PASS |
| P5 — Vạn Niệm Vô Cực | Niệm Lực cap expansion only; Thần Ấn remains hard-capped at 5. | PASS |
| P6 — Thần Niệm Lăng Thiên | Main Nhiễu potency + Niệm Ảnh Break; no generic Skill Damage. | PASS |
| P7 — Nhất Niệm Phá Vọng | ProcDepth-0 Main-Mind direct packet Armor Pen only under current mental pressure. | PASS |
| P8 — Niệm Lực Bất Diệt | Event-owned peak refresh; Main echo/Nhiễu/control; Secondary Resolve; no generic damage/Gauge. | PASS |

## 3. Ownership invariants

### Generic passive output does not own Mind damage

`remainingDaoPassiveBonusesV2()` has an explicit mutation-free Mind output branch. The historical generic Mind Skill Damage / Gauge / Armor Pen package is retired from production authority.

The generic P8 branch excludes `mind`, so passive/stat reads cannot grant Mind generic damage/Gauge or extend its peak timer merely because a getter was called.

### Main and Secondary are separated

Main Mind receives the core-mechanic lanes only through Mind-owned runtime:
- Niệm Ảnh coefficient;
- action-local Accuracy;
- action-local Control Power;
- Nhiễu potency;
- Niệm Ảnh Break;
- conditional action-local Armor Pen.

Secondary Mind receives only the explicitly safe Resolve lane from P1/P4/P8. It does not gain Thần Ấn generation/spend, Niệm Ảnh core authority, Mind Active authority, or the Main-only output bonuses.

### P8 refresh is event-owned

The closure guard explicitly checks that calls to passive/stat readers leave `expiresAt` unchanged. Peak hold extension occurs from an eligible combat action event, not from `mindPassiveBonusesV2()`, `remainingDaoPassiveBonusesV2()` or `effectiveStats()` reads.

### P7 pressure is bounded

P7 Armor Pen is local to procDepth-0 Main-Mind direct packets and requires current pressure: target Thần Ấn, the current root's consumed marks, or active Nhiễu recovery pressure.

The compatibility recovery seam `daoRecoveryMultiplierForTargetV118()` consumes and deletes `mindRecoveryPenaltyPct` on the affected recovery, so Nhiễu does not become a permanent P7 qualifier.

## 4. Verification evidence

The guarded M2B integration workflow run `36519206674` completed successfully before producing runtime candidate `24c608f1764c9e5a34c65e5c66602e3e30d3a499`.

Successful guarded steps included:
- source syntax checks for Mind content/runtime/shared runtime/stats/combat;
- `mind-dao-m2-passive-architecture-test.js`;
- `mind-dao-m2-five-stat-test.js`;
- `mind-dao-m1-seal-transaction-test.js`;
- `mind-dao-m1-authority-test.js`;
- `mind-dao-production-contract-test.js`;
- `mind-dao-skill-form-contract-test.js`;
- locked Sword smoke: `sword-dao-f6-harness-contract-test.js`;
- locked Quyền smoke: `fist-dao-counter-runtime-test.js`.

The closure metadata follow-up expands the `dao-mind` scoped manifest so future feature closure cannot omit M1, M2A or M2B regression gates.

## 5. Closure decision

**M2B passive architecture is CLOSED** on runtime candidate `24c608f1764c9e5a34c65e5c66602e3e30d3a499`.

This decision locks:
- P1–P8 ownership boundaries;
- no generic Mind DPS/Gauge leakage;
- Main/Secondary separation;
- read-safe P8 timer semantics;
- action-local P7 Armor Pen semantics.

It does **not** close the whole `dao-mind` feature. The feature remains `closureReady:false` because the following work is still open:

1. **M2C — Mastery architecture/ownership**;
2. **M3 — Auto/manual/PvE/PvP/Hunt/save/Secondary parity**;
3. **M4 — identity-valid deterministic benchmark harness**;
4. **M5 — minimal Mind-owned tuning**;
5. **M6 — exact clean FULL CLEAN + feature-scoped closure**.

Next production action: audit and implement the ten mastery rows under M2C without balance tuning or reopening locked Sword/Quyền systems.
