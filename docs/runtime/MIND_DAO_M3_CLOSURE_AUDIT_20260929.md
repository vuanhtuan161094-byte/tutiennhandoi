# THẦN NIỆM DAO — M3 PRODUCTION-PATH PARITY CLOSURE AUDIT — 2026-09-29

Status: **M3 CLOSED / M4 OPEN**

Feature: `dao-mind`  
Branch: `main`  
Audited source baseline: `503011df4cf38f7cd80516fe66de86540c79d927`  
M3 parity gate commit: `ee86e719c47d8f3f57f33ea95b676373224ea73c`  
M3 gate registration commit: `ee57079fe1f8f3f58cfb1d32d2b83d1e6ba99165`

## Scope

M3 proves that the already-closed Mind correctness, five-stat, passive and mastery semantics reach production consumers through the same canonical CombatKernel V3 / CombatEngine authority. M3 does **not** tune coefficients and does not make `dao-mind` whole-feature closure-ready.

The registered proof is `qa/tests/mind-dao-m3-consumer-parity-test.js`. It is retained in the `dao-mind` feature manifest together with the shared Combat V3 parity gates, M1/M2A/M2B/M2C Mind guards, and locked Sword/Quyền regressions.

## Consumer findings

### Manual / shared CombatKernel V3

- `dist/core/combat-kernel-v2.js` imports the canonical `CombatEngine` from `dist/core/combat.js`.
- `runCompiledCombatEncounterV3()` delegates to `runCombatKernelV3()` and preserves encounter identity without installing a Dao-specific alternate engine.
- The existing shared Combat V3 parity matrix remains part of the feature-scoped gate set.

### Auto rotation

- Auto/tactical layers choose AI/rotation/profile inputs; they do not own a second Mind resolution engine.
- Production session encounters still terminate in `runCompiledCombatEncounterV3()`.
- PvP explicitly reports `full-auto-tactical` while resolving the actual match through the same compiled V3 encounter.

### PvE / Boss

- Session-owned content-event and other production encounter paths use the compiled V3 runner.
- Boss mechanics are prepared as encounter/entity inputs and remain under CombatKernel/CombatEngine resolution; there is no Mind-only Boss damage/control authority.

### PvP

- `challengePvpV91()` compiles a canonical encounter and calls `runCompiledCombatEncounterV3(encounter, registry)`.
- Replay metadata records `engineVersion: 'combat.v3'`.
- PvP entity snapshots preserve the player build; no separate PvP Mind transaction implementation exists.

### Hunt / offline representative combat

- `resolveEndlessHuntWithCombatKernelV3()` delegates the shared Hunt bridge to `runCompiledCombatEncounterV3`.
- Session representative farm and active Hunt/Boss combat call the V3 Hunt bridge.
- `resolveEndlessHuntFight()` settles the combat result/reward and does not replace CombatKernel as the winner/mechanic authority.
- The production session no longer calls the V2 Hunt bridge or V2 compiled encounter runner.

### Save / restore / carry state

- Combat actions resolve synchronously inside CombatEngine; M1/M2C action-local Thần Ấn/Niệm Ảnh transaction state is not reconstructed as an independent save-time engine.
- Hunt carry forwards the durable `battleDaoStateV2` through `initialBattleDaoStateV2` using a structured clone.
- Niệm Lực carry therefore remains on the existing durable Battle Dao state lane; target-local/action-local state does not become a second offline authority.

### Secondary Mind

- M2B remains the ownership guard: Secondary Mind receives only the bounded Resolve-safe passive lane and does not gain Mind Active/Core/Ultimate/mastery authority.
- M3 adds no consumer-specific exception to that ownership rule.

### Locked Sword / Quyền regressions

The `dao-mind` manifest still includes the shared Combat V3 gates plus the locked Sword and Fist regression suites, including `sword-dao-f6-harness-contract-test.js` and `fist-dao-counter-runtime-test.js`. M3 introduces no shared-seam gameplay change requiring retuning either locked Dao.

## M3 result

No production consumer was found to own an alternate Mind combat mechanic or to justify a coefficient/gameplay change. The narrow correction for M3 is therefore **proof/registration only** rather than a fabricated runtime modification.

M3 closes production-path parity. The next phase is M4: install an identity-valid deterministic benchmark harness. The existing `RUN_MIND_M5_BENCHMARK.cmd` launcher remains fail-closed until that M4 harness and benchmark contract gate exist.

## Evidence / limitations

Source audit baseline: `503011df4cf38f7cd80516fe66de86540c79d927`.

Registered M3 gate:
- `qa/tests/mind-dao-m3-consumer-parity-test.js`

Required retained regression evidence in the feature manifest:
- shared Combat V3 closure/parity gates;
- Sword locked regression gates;
- Fist locked regression gates;
- Mind M1/M2A/M2B/M2C guards.

No GitHub Actions run is claimed for the exact M3 gate commits in this audit. Consistent with the M2C closure record, this closes **M3 production-path ownership/parity from audited source + registered guards**, not whole-feature FULL CLEAN evidence.

## State after M3

- M0 — CLOSED
- M1 — CLOSED
- M2A — CLOSED
- M2B — CLOSED
- M2C — CLOSED
- **M3 — CLOSED** — production-path parity
- **M4 — OPEN** — identity-valid deterministic benchmark harness
- M5 — BLOCKED — minimal tuning
- M6 — BLOCKED — exact clean feature closure

`dao-mind` remains `closureReady:false`.