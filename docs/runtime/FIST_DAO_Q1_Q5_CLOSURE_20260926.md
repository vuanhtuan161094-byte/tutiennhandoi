# FIST DAO PRODUCTION Q1–Q5 CLOSURE — 2026-09-26

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main`

## Status

**QUYỀN ĐẠO Q1–Q5: CLOSED / LOCKED.**

This closure record supersedes any older `DESIGN LOCK`, `CANDIDATE`, `QA PENDING`, or `Q5 pending` status text in `docs/runtime/FIST_DAO_PRODUCTION_CONTRACT_20260926.md`.

Reopen Quyền only for:

- a proven production regression;
- an explicitly requested new Quyền feature/rebalance;
- a separately scoped shared-combat migration with parity evidence.

Do not reopen Quyền merely because unrelated full-game balance tests remain deferred after the five-stat migration.

## 1. Locked production identity

Quyền remains the close-range **pressure / Break / counter bruiser** Dao defined by the production contract.

Locked structure:

- five-stat identity: CL primary; TP for heavy/body/counter; TPH for combo/reaction; LL capacity only; TT utility only;
- short-cycle resource: **Quyền Thế** (`fistForce`), normal cap 5;
- long-cycle passive stack: **Liên Kình**, base cap 20 and passive-expanded cap 30;
- exactly 10 production skills and 8 passives;
- Trọng Thế payoff limited to Heavy / Pressure / Finisher / Ultimate;
- brief disruption only, not long hard-CC chaining;
- production CombatKernel V3, PvP, Hunt/offline and Auto parity preserved.

Final Q5 tuning keeps Tam Hoàn Liên Kình mastery 1000 at the validated four-hit package `55% + 55% + 55% + 125%`.

## 2. Gameplay candidate and benchmark proof

Final gameplay/balance candidate before QA-only closure infrastructure:

`35e028b17c6560784483e8d0f89e4dd2d8593228`

User-local exact-SHA evidence on that gameplay candidate:

- FAST exact-SHA PASS;
- clean worktree;
- Backend Fast: **37/37 PASS**;
- Frontend Fast: **20/20 PASS**;
- Mode 5 FULL CLEAN PASS;
- Runtime Browser Smoke: **4/4 PASS**;
- strict browser summary PASS.

Deterministic Q4/Q5 benchmark, 12 seeds × 180 seconds per archetype:

- **Trọng Quyền:** reference **100%**;
- **Liên Hoàn:** **92.19%**, target **92–98%**, PASS;
- **Phản Quyền:** **89.55%**, target **85–92%**, PASS;
- Phản Quyền produced live successful Counter activity, so its identity proof is behavioral rather than DPS-only.

The separate Counter validation also demonstrated live Hồi Thân cast/success activity after the legacy boss-counter-window gate was corrected for Fist.

## 3. Counter regression correction

During Q4, Hồi Thân Phản Quyền exposed a real production defect: legacy generic `counter` gating required `activeCounterWindow`, while the new Fist contract requires a live target cast/channel window.

The production correction:

- Fist Hồi Thân uses target cast/channel timing;
- generic AI fallback does not spam tactical Counter skills;
- Sword's pre-existing counter gate remains unchanged.

Targeted CombatKernel regression coverage is retained in `fist-dao-counter-runtime-test.js`.

## 4. Scoped closure rationale

The historical backend `closure` mode is a whole-game directory sweep. After the five-stat migration, a user-local run reported **137/141 PASS** because four unrelated/global simulations remain stale or require their own deliberate re-audit:

- `reincarnation-v4-gameplay-balance-test.js`;
- `v121-balance-production-test.js`;
- `v129-global-build-balance-test.js`;
- `v149-artifact-v129-balance-test.js`.

Those failures are outside this Quyền slice. They must not be "fixed" by opportunistically retuning Pháp Bảo, Linh Thú, Tri Kỷ, Luân Hồi, Equipment, Alchemy, Economy, or other systems simply to make Fist closure green.

The scope decision is documented in `docs/runtime/DAO_QA_SCOPE_AUDIT_20260926.md`.

The full-game closure remains unchanged and may continue to expose deferred cross-system audit debt. The Dao closure is a separate feature-slice gate, not a weakening of the global audit.

## 5. Final exact-SHA closure proof

QA-scope infrastructure candidate/final closure SHA:

`7c8b777c7f5a527e8871ab783bc64a9add4e94dd`

User-local one-click `DONG_BO_VA_TEST_DAO.cmd` result:

- `main`;
- exact SHA `7c8b777c7f5a527e8871ab783bc64a9add4e94dd`;
- clean worktree / `dirty=false`;
- exact-SHA evidence: YES;
- Local CI FULL CLEAN: **23/23 steps PASS**;
- Backend Fast PASS;
- Frontend Fast PASS;
- Runtime Browser Smoke PASS;
- Strict Browser Smoke PASS;
- scoped Main Dao Backend Closure: **15/15 PASS**;
- final banner: **`DAO FULL CLEAN + SCOPED CLOSURE: PASS`**.

The uploaded local-ci artifact for this run reports:

- status `PASS`;
- mode `full`;
- SHA `7c8b777c7f5a527e8871ab783bc64a9add4e94dd`;
- branch `main`;
- exact-SHA evidence `YES`;
- passed steps `23`;
- failed steps `0`.

## 6. Locked QA set

The scoped Dao closure is intentionally limited to 15 risk-bearing tests:

1. `dao-closure-scope-contract-test.js`
2. `combat-backend-phase1-3-regression-test.js`
3. `combat-backend-phase4-6-regression-test.js`
4. `combat-backend-phase7-8-parity-test.js`
5. `combat-backend-phase9-cutover-test.js`
6. `sword-dao-production-contract-test.js`
7. `sword-dao-five-stat-migration-test.js`
8. `sword-dao-f6-harness-contract-test.js`
9. `fist-dao-five-stat-migration-test.js`
10. `fist-dao-counter-runtime-test.js`
11. `fist-dao-q4-harness-contract-test.js`
12. `fist-dao-q5-chain-tuning-test.js`
13. `v129-combat-parity-test.js`
14. `v129-stat-provenance-test.js`
15. `v98-dao-domain-test.js`

Final result: **15/15 PASS**.

## 7. Deferred systems remain separate

This closure does not claim a new balance audit for:

- Pháp Bảo / Chí Bảo / Relic;
- Linh Thú;
- Tri Kỷ;
- Equipment/Set/Gem/Inscription;
- Alchemy;
- Economy;
- global Reincarnation balance;
- collection-wide/global V120/V121/V129 balance simulations.

Audit and migrate those systems only when explicitly opened as their own slice.

## Final disposition

**QUYỀN ĐẠO Q1–Q5 — CLOSED / LOCKED.**

No further Quyền tuning is justified by current evidence. Preserve the validated resource, skill, passive, Counter, Auto and benchmark behavior until a real regression or explicit new design request reopens the slice.
