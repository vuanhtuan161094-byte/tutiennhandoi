# MAIN DAO QA SCOPE AUDIT — 2026-09-26

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main`

## 1. Why this audit exists

The current Backend `closure` mode is a **full-game directory sweep**: every backend `*test.js` is executed except the explicit transport/frontend/web-launcher/performance exclusions. That is appropriate for a whole-game canonical audit, but it is too broad as the final gate for a narrowly reopened Main Dao slice after the five-stat migration.

The user-local full backend closure on the verified Fist Q5 gameplay candidate reported **137/141 PASS**. The four failures were:

1. `reincarnation-v4-gameplay-balance-test.js` — still asserts the retired three-axis Potential model;
2. `v121-balance-production-test.js` — still asserts `defense` as a spendable Potential axis;
3. `v129-global-build-balance-test.js` — still owns a legacy three-axis cross-system balance matrix;
4. `v149-artifact-v129-balance-test.js` — Pháp Bảo combo benchmark is outside the current Dao slice and must be re-audited with the rest of the Artifact system rather than tuned opportunistically during Fist closure.

These failures are **not permission to edit those systems merely to make Fist green**.

## 2. Locked QA rule

Two different gates now coexist and must not be confused:

- `node qa/runners/v140-backend-gates.js closure`
  - full-game backend audit;
  - remains the directory sweep;
  - intentionally continues to expose deferred failures in systems that have not yet been re-audited after five-stat changes.

- `node qa/runners/v140-backend-gates.js dao`
  - scoped Main Dao closure;
  - only validates the five-stat foundation, CombatKernel V3 parity, locked Sword compatibility, Fist production contract, and the direct PvP/Hunt/Dao consumers exercised by the reopened Dao work.

**The full-game closure is not weakened, filtered, or redefined by the Dao gate.**

## 3. Dao scoped closure manifest

The scoped gate contains exactly the following risk-bearing tests:

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

Why these are in scope:

- Combat Backend Phase 1–9 protects the production CombatKernel V3 boundary used by Dao fights.
- Sword tests protect the already locked Sword implementation from shared Dao/runtime regressions.
- Fist tests own the current Quyền resource, mastery, counter, five-stat, Auto/Hunt/PvP parity and benchmark contracts.
- `v129-combat-parity` protects final personal CombatEntity consumption in PvE/PvP/offline Hunt.
- `v129-stat-provenance` protects the five root stats and their final CombatEntity materialization.
- `v98-dao-domain` protects canonical Main/Secondary Dao identity and Dao Domain linkage.

## 4. Explicitly deferred from Dao closure

Do **not** patch or rebalance these merely for Quyền closure:

- Pháp Bảo / Chí Bảo / Relic balance and combo matrices;
- Linh Thú;
- Tri Kỷ;
- Equipment/Set/Gem/Inscription balance matrices;
- Alchemy balance;
- Economy/source-sink pacing;
- Reincarnation-wide balance simulations;
- old V120/V121/V129 three-axis global balance-lab reports;
- Collection-wide power budgets;
- unrelated World/Faction/Social/Idle progression audits.

Those systems may still be run by global Fast/Full-game Closure for visibility. A failure in one of them is a signal for that system's future audit, not an instruction to silently retune it during a Dao slice.

## 5. Fist Q5 evidence already obtained before this QA-scope fix

Gameplay candidate: `35e028b17c6560784483e8d0f89e4dd2d8593228`.

Verified user-local evidence:

- exact-SHA FAST PASS;
- Backend Fast 37/37 PASS and Frontend Fast 20/20 PASS;
- Q4/Q5 benchmark targets PASS:
  - Trọng Quyền = 100%;
  - Liên Hoàn = 92.19% (target 92–98%);
  - Phản Quyền = 89.55% (target 85–92%) with live successful Counter activity;
- Mode 5 FULL CLEAN PASS with Browser Smoke 4/4 and clean worktree.

The commits after that gameplay SHA in this QA-scope repair are test/QA-only. They do not justify rerunning the three-archetype gameplay benchmark unless gameplay/runtime files change again.

## 6. One-click closure

Use:

`DONG_BO_VA_TEST_DAO.cmd`

It performs:

1. clean update to current `origin/main`;
2. FULL CLEAN local candidate proof;
3. scoped Backend Dao closure;
4. final clean-worktree check and exact SHA output.

Only after this scoped exact-SHA gate is green may the current Fist slice be recorded as CLOSED / LOCKED. The separate full-game `closure` result may remain red until its deferred systems are deliberately reopened and audited.
