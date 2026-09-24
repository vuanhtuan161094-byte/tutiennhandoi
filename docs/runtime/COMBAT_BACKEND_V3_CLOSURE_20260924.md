# COMBAT BACKEND V3 CLOSURE — 2026-09-24

Status: **CLOSED / LOCKED**

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main`  
Exact verified runtime SHA: `00f944feeebe99778beec0c1d727060e47dfc5ec`

## Scope closed

Combat Backend V3 production migration is closed as a structural/runtime-boundary migration.

No intentional balance rewrite was included. Existing V168 combat formulas, authored Battle Đạo content, Set/Artifact/Relic mechanics, Boss phase/counter semantics, rewards, and progression remain the gameplay authority unless separately reopened.

Production consumers now route through the V3 boundary:

- equipment benchmark/intelligence;
- Content Event combat;
- Đạo Suy combat;
- Dungeon combat;
- live Endless Hunt/Boss;
- representative/offline Hunt TTK sampling;
- new PvP fights.

Historical PvP replay remains explicitly engine-versioned. Missing/`combat.v2` replay payloads continue to use the frozen V2 compatibility oracle; new `combat.v3` replay payloads use V3.

## Closed defects / debt guards

The migration closure includes guards for:

- hard timeout boundary;
- canonical CombatEntity composition across activities;
- retired Mệnh Thai/Fate Embryo power leakage;
- broken Hunt profile execution path;
- actual kernel cast-count progression for Hunt;
- explicit activity settlement policy;
- typed `combat-result.v1` / `combat-event.v1` contract;
- deterministic V2↔V3 parity;
- all eight Battle Đạo identities in parity coverage;
- V150 Bảo Khí not reappearing in the live player-facing Combat stream;
- production read-model/transport metadata reporting CombatKernel V3 rather than stale V2 labels.

## Runtime model

`CombatKernelV3` is the production strangler boundary.

It intentionally executes the locked V168 `CombatEngine` through the `combat-engine.v168-compat` executor. This closure therefore does **not** claim that the internal 1,700-line engine has already been decomposed into final independent scheduler/resolver subsystems.

That deeper internal extraction is optional future maintenance work. It must not alter balance/formulas without a separately proven and explicitly opened scope.

## V2 disposition

CombatKernel V2 is not production authority for new fights.

It remains only for:

1. deterministic parity/oracle tests;
2. historical `combat.v2` PvP replay compatibility;
3. compatibility aliases where old callers may still exist.

Do not delete the V2 oracle while historical replay or parity coverage still depends on it.

## Verification evidence

User-local exact-SHA verification on `00f944feeebe99778beec0c1d727060e47dfc5ec`:

- `V140 BACKEND CLOSURE: 134/134 PASS`
- `V140 FRONTEND CLOSURE: 34/34 PASS`
- `FULL CLEAN + CANONICAL: PASS`
- exact SHA reported by the one-click gate: `00f944f`

The same one-click workflow also completed the required clean candidate path before Canonical closure.

## Closure rule

Combat Backend V3 production migration is **CLOSED / LOCKED**.

Reopen only for:

- a proven regression;
- a new explicitly requested combat feature;
- or a separately scoped internal-engine retirement/refactor with parity evidence.

Do not reopen balance merely to continue architectural cleanup.
