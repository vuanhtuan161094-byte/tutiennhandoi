# DAO PRODUCTION WORKFLOW V3 — 2026-09-26

This is the canonical workflow for reopening or producing a Main Dao after Sword and Fist closure.

The goal is to minimize iteration count without weakening evidence. The key rule is to separate **feature correctness/balance closure** from the **whole-game audit** from the beginning of the slice.

## 0. Operating principles

1. Current `main` is source of truth.
2. Read `AGENTS.md`, `CURRENT_CHECKPOINT.md`, `docs/DEVELOPMENT_PROTOCOL.md`, then this workflow before a new Dao slice.
3. Closed systems are read-only unless a real regression or explicit user request reopens them.
4. A Dao slice may touch only its declared scope plus shared combat seams proven necessary by evidence.
5. Full-game backend closure is an audit, not permission to retune unrelated systems.
6. Correctness is closed before balance tuning begins.
7. Benchmark DPS is invalid unless the benchmark also proves the intended build identity actually executed.
8. Tune the smallest feature-specific lever that fixes the measured miss. Do not use a global multiplier to fix a relative-archetype problem.
9. Exact-SHA evidence is required for closure.
10. One failed gate must be classified before any patch: production regression, stale expectation, harness defect, environment/runner defect, or out-of-scope audit debt.

## 1. Phase 0 — Scope lock

Before production code changes, create or update the Dao contract and feature manifest.

Lock:

- feature id, e.g. `dao-body`;
- Dao identity and combat role;
- allowed production files/systems;
- shared seams that may be changed if proven necessary;
- explicitly deferred systems;
- 10-skill structure;
- passive structure;
- resource model;
- five-stat family map;
- Auto intent;
- deterministic benchmark archetypes and target bands;
- feature closure manifest id.

A newly opened feature may be registered with `closureReady: false`. The generic closure runner must refuse to close it until the slice explicitly flips to `closureReady: true` after evidence is complete.

### Scope rule

Do not pull Pháp Bảo, Linh Thú, Tri Kỷ, Equipment balance, Alchemy, Economy, Reincarnation-wide balance, or other unrelated systems into a Dao slice merely because a global test is red.

## 2. Phase 1 — Contract before code

The contract must answer these before implementation:

- What is the Dao identity?
- What are the 10 production skills and their roles?
- What are the passives and their ownership boundaries?
- Which resources are short-cycle and long-cycle?
- Which skills generate/spend each resource?
- Which CL/TP/TPH/LL/TT families may scale each skill?
- Which mechanics are forbidden from leaking into generic damage/stat multipliers?
- What is the Auto priority intent?
- What are the internal archetypes and target bands?
- What evidence will prove each archetype identity?

Do not start numeric tuning while these remain ambiguous.

## 3. Phase 2 — Runtime seam audit

Before changing coefficients, audit all relevant production seams:

- skill metadata and `canUse` gates;
- action prepare/finish hooks;
- resource snapshot/spend/generate timing;
- mastery overrides and multi-hit packages;
- CC/control/Break paths;
- AI condition vocabulary and fallback behavior;
- Ultimate hold/fire rules;
- PvP snapshot/scaling;
- Hunt preview;
- offline/virtual Hunt representative combat;
- legacy/NPC five-stat snapshots;
- serialization/restore compatibility when applicable.

This phase exists to catch hidden legacy gates before benchmark work. Fist Counter demonstrated why this is mandatory: the skill logic was correct while a generic legacy counter gate prevented the skill from ever being selected.

## 4. Phase 3 — Correctness implementation

Implement only the authored contract:

- resources;
- gates;
- mastery behavior;
- control/Break behavior;
- five-stat scaling family;
- Auto rules;
- parity consumers.

Add targeted regression tests for every repaired legacy seam.

**No balance tuning yet.**

Exit condition:

- targeted correctness tests green;
- no known skill is blocked by a stale gate;
- no obsolete resource/metadata path owns live behavior.

## 5. Phase 4 — Parity before benchmark

Before accepting balance evidence, prove the production consumers:

- CombatKernel V3 path;
- PvE;
- PvP snapshot/replay payload where applicable;
- Hunt preview;
- offline/virtual Hunt;
- Auto rotation;
- five-stat materialization/provenance;
- compatibility behavior needed by already locked Dao.

A benchmark must not become the place where parity bugs are first discovered.

## 6. Phase 5 — Identity-valid deterministic benchmark

Every Dao benchmark must prove two things:

1. numerical outcome;
2. the intended archetype actually executed its defining mechanic.

Examples of identity assertions:

- Counter build: counter casts > 0 and successful counters > 0;
- Break build: Break events > 0 and/or target reaches the authored Broken state;
- Channel build: completed channel count > 0 and no false OOM cancellation;
- stack build: stack threshold reached and meaningful uptime > 0;
- resource-payoff build: generation > 0, spend > 0, payoff casts > 0;
- Ultimate/domain build: Ultimate and domain/open events > 0;
- DoT/mark build: mark/DoT application and consumption > 0.

If identity evidence is zero, the DPS number is **invalid evidence**. Fix the harness or production decision path first; do not tune coefficients from that run.

### Benchmark stability

Use deterministic seeds and paired comparisons where practical. Report mean plus enough spread information to detect a one-seed accident. Do not react to a sub-percent miss without checking identity and seed stability.

## 7. Phase 6 — Minimal tuning

Rules:

- change one lever at a time;
- prefer the skill/passive/resource lever owned by the underperforming archetype;
- do not change a global Dao multiplier when the problem is the ratio between archetypes;
- preserve resource cadence if it is already healthy;
- stop immediately when the target band is reached;
- rerun only the evidence affected by the change.

A small miss should receive a small local correction. Fist Q5 is the reference pattern: Liên Hoàn missed by ~0.5 percentage point, so only Tam Hoàn mastery's final hit was tuned rather than the global Fist multiplier.

## 8. Phase 7 — Feature scoped closure

Feature closure uses the registered manifest, not the whole backend directory sweep.

Generic commands:

```cmd
node qa\runners\v140-backend-gates.js feature-info <feature-id>
node qa\runners\v140-backend-gates.js feature <feature-id>
```

One-click Windows closure:

```cmd
DONG_BO_VA_TEST_FEATURE.cmd <feature-id>
```

The one-click closure performs:

1. clean update from `origin/main`;
2. Mode 5 FULL CLEAN exact-candidate proof;
3. feature-scoped backend closure;
4. clean-worktree verification;
5. exact SHA output.

`DONG_BO_VA_TEST_DAO.cmd` is retained only as a compatibility wrapper for the already closed Fist slice.

### Closure-ready rule

The feature manifest must remain `closureReady: false` until:

- correctness is complete;
- parity is complete;
- deterministic benchmark is identity-valid;
- target bands pass;
- required regression tests exist.

Only then change it to `closureReady: true` and run the closure launcher.

## 9. Phase 8 — Full-game audit is separate

`node qa/runners/v140-backend-gates.js closure` remains the whole-game directory sweep.

It may be run to discover debt, but an out-of-scope failure does not block a correctly scoped Dao closure unless it proves a shared regression caused by the candidate.

For every global failure, classify it:

- shared regression caused by this slice -> blocking, fix the responsible layer;
- stale test for a retired model -> record for that system's migration;
- unrelated balance failure -> defer to that system's audit;
- harness/runner defect -> repair the harness/runner without gameplay retuning.

Never make an unrelated system green opportunistically during Dao closure.

## 10. Phase 9 — Closure record and compact checkpoint

After exact-SHA feature closure passes:

- write one dated closure record;
- record final gameplay SHA separately from later QA/docs-only SHA when relevant;
- record benchmark targets/results;
- record the scoped gate result;
- record deferred full-game audit debt explicitly;
- update `CURRENT_CHECKPOINT.md` with only current state, not the whole implementation diary;
- leave detailed history in closure docs and Git history.

## 11. Standard Dao execution sequence

The normal path for the next Dao is:

`Scope Lock -> Contract -> Runtime Seam Audit -> Correctness -> Parity -> Identity-valid Benchmark -> Minimal Tune -> FULL CLEAN -> Feature Closure -> Lock`

Expected tuning loop:

- one correctness pass;
- one parity pass;
- one benchmark baseline;
- normally zero to two small tuning iterations;
- one exact-SHA scoped closure.

If the slice starts cycling more than this, stop and classify whether the real problem is contract ambiguity, an un-audited legacy seam, or an invalid benchmark identity.

## 12. Locked systems regression policy

Every new Dao closure must protect already locked shared combat behavior with narrow regression tests, but must not re-balance locked Dao.

Sword and Fist are currently locked. A future Dao may include their contract/regression tests in its feature manifest when shared code is touched. A red locked-Dao regression is blocking; a desire to improve its balance is not.

## 13. New Dao handoff checklist

At the start of a new chat:

1. refresh `main`;
2. read `AGENTS.md`;
3. read `CURRENT_CHECKPOINT.md`;
4. read `docs/DEVELOPMENT_PROTOCOL.md`;
5. read this V3 workflow;
6. inspect current source for the requested Dao;
7. create the new Dao contract and feature manifest with `closureReady: false`;
8. do not modify production coefficients until Phase 2 runtime seam audit is complete.

This workflow supersedes ad-hoc Dao closure sequencing learned during Sword/Fist development. Existing Sword/Fist closure records remain authoritative evidence for those locked slices.
