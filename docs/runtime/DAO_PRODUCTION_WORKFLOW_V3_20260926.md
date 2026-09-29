# DAO PRODUCTION WORKFLOW V3 — 2026-09-26

Status: **ACTIVE / LOCKED**

This is the canonical workflow for reopening or producing a Main Dao. Current `main`, `CURRENT_CHECKPOINT.md`, the active Dao contract/spec, live source and registered gates outrank historical audit notes.

## 0. Required entry sequence

1. Refresh `main`.
2. Read `AGENTS.md`.
3. Read `CURRENT_CHECKPOINT.md`.
4. Read `docs/DEVELOPMENT_PROTOCOL.md`.
5. Read this workflow and the active Dao contract/spec.
6. Search → narrow → patch → targeted proof → active gate → scoped closure.

Closed systems are read-only unless a proven regression or explicit user request reopens them.

## 1. Scope lock

Before production changes, lock:

- feature id `dao-<id>`;
- Dao identity and combat role;
- allowed production files and shared seams;
- explicitly deferred systems;
- 10-skill structure;
- passive/resource model;
- five-stat ownership;
- Auto intent;
- deterministic benchmark archetypes and target bands.

Register the feature in `qa/runners/feature-closure-manifest.js` with `closureReady:false`.

Do not pull unrelated Pháp Bảo, Linh Thú, Tri Kỷ, Equipment, Alchemy, Economy or Reincarnation-wide balance into a Dao slice merely because a global audit is red.

## 2. Contract before code

The active contract must define:

- all 10 production skills and roles;
- passive ownership boundaries;
- short/long-cycle resources, generation, spend and caps;
- CL / TP / TPH / LL / TT scaling families;
- forbidden generic multipliers or duplicate authority;
- Auto priority intent;
- benchmark archetypes, bands and identity metrics.

Do not tune coefficients while these remain ambiguous.

## 3. Runtime seam audit

Audit before tuning:

- skill metadata and `canUse` gates;
- action prepare/finish hooks;
- resource snapshot/spend/generate timing;
- mastery, multi-hit and channel behavior;
- CC / Break / status paths;
- AI conditions and fallback behavior;
- Ultimate hold/fire rules;
- PvP snapshot/replay;
- Hunt and offline/virtual Hunt;
- legacy/NPC five-stat snapshots;
- save/restore compatibility where applicable.

A stale compatibility gate must be repaired before benchmark work.

## 4. Correctness implementation

Implement only the authored contract. Add narrow regression tests for repaired seams.

Exit condition:

- targeted correctness tests pass;
- no authored skill is blocked by a stale gate;
- no obsolete resource/metadata path owns live behavior;
- no duplicate mechanic authority was introduced.

**No balance tuning yet.**

## 5. Production-path parity

Before benchmark evidence is accepted, prove the relevant consumers:

- canonical CombatKernel V3 / `CombatEngine` path;
- PvE/Boss;
- PvP;
- Auto/tactical rotation;
- Hunt/offline representative combat;
- save/carry state where applicable;
- five-stat materialization/provenance;
- required locked Dao regressions.

A benchmark must not be the first place parity defects are discovered.

## 6. Identity-valid deterministic benchmark

Every benchmark must prove both:

1. numerical result;
2. the intended archetype actually executed its defining mechanic.

Examples: Counter success > 0, Break/Broken occurs, channel completes, stack threshold is reached, resource generation/spend/payoff occurs, or Ultimate/domain events occur.

If the defining mechanic count is zero, the DPS result is invalid evidence. Fix the harness or production path first.

Use deterministic seeds and paired comparisons where practical. Do not tune from one-seed noise.

## 7. Minimal tuning

- change one feature-owned lever at a time;
- prefer the skill/passive/resource lever owned by the miss;
- reject global multipliers for relative-archetype problems;
- preserve healthy resource cadence;
- rerun only affected evidence;
- stop when the target band is reached.

## 8. Feature-scoped closure

Canonical commands:

```cmd
node qa\runners\v140-backend-gates.js feature-info <feature-id>
node qa\runners\v140-backend-gates.js feature <feature-id>
```

Canonical one-click Windows closure:

```cmd
DONG_BO_VA_TEST_FEATURE.cmd <feature-id>
```

The feature manifest must remain `closureReady:false` until correctness, parity, identity-valid benchmark, target bands and required regressions are complete. Only then flip it to `true` and run exact-SHA feature closure.

There is no separate Dao compatibility launcher. `DONG_BO_VA_TEST_FEATURE.cmd` is the only Dao feature closure entry point.

## 9. Full-game audit is separate

`node qa/runners/v140-backend-gates.js closure` is the whole-game audit.

Classify any failure before patching it:

- shared regression caused by this slice → blocking;
- stale expectation for a retired model → fix/retire that expectation in its own scope;
- unrelated balance debt → defer;
- harness/runner defect → repair the harness/runner without gameplay retuning.

Never make an unrelated subsystem green opportunistically during Dao closure.

## 10. Closure record and checkpoint

After exact-SHA feature closure passes:

- write one dated closure record;
- record gameplay SHA and final closure SHA separately when relevant;
- record benchmark bands/results and scoped gate evidence;
- record deferred full-game debt;
- update `CURRENT_CHECKPOINT.md` with compact current state only;
- leave implementation history to Git history and the minimum required closure evidence.

## 11. Locked regression policy

Sword and Fist are locked. Include their narrow regression/contract gates only when shared risk warrants it. A regression is blocking; a desire to rebalance a locked Dao is not.

## 12. New Dao handoff

Normal path:

`Scope Lock → Contract → Runtime Seam Audit → Correctness → Parity → Identity-valid Benchmark → Minimal Tune → FULL CLEAN → Feature Closure → Lock`

If the slice starts cycling, classify whether the problem is contract ambiguity, an un-audited legacy seam, or invalid benchmark identity before changing more gameplay.