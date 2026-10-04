# ĐỘC ĐẠO CLOSURE PREPARATION — 2026-10-05

**READY FOR EXACT-SHA USER CLOSURE — NOT YET CLOSED/LOCKED**

Initial HEAD: `d1573bdf046a734c7493a4a3f45aaedc5faf4805`. Final candidate is the commit containing this preparation; the final response reports its exact SHA and clean evidence. No push or user acceptance is implied.

## Final production authority

**GIEO → DƯỠNG → CÔNG TÂM → GIỮ HOẶC PHỆ**. Main-only current-target Độc Chủng 0–4. Read/damage/projection functions do not bind/reset. Explicit applications discard old stage on a new binding; no target dictionary. Hybrid finite DoTs keep source/root/coefficient/five-stat snapshots and read stage only from the exact current bound target. Old packets finish with stage0 after a swap and cannot retarget core. Target death/new encounter/Hunt carry clear the target core.

Consume snapshots target, stage, Công Tâm, max consume and root. It commits once after canonical hit, including complete shield absorption. Interrupt, miss/dodge, dead/stale target and generated follow-up do not spend. One ×1.5 Công Tâm authority applies only to full Consume/Ultimate. Full consume retains1; Transform spends≤2 with lower per-stage payoff and no ×1.5. Calamity gains2, never0→4. Insects applies one finite packet after its first landed channel tick, retains resolved effects after interruption, and only full completion grants2stage plus its bounded mastery packet.

[Production reference](POISON_DAO_PRODUCTION_REFERENCE_20261005.md) records all ten stable skills, eight passives, 50 executable mastery milestones, costs, timing, effects and explicit five-stat weights. Độc Tức is root/event-owned, not visual-tick generated. Its outputs are finite DoT longevity/efficiency, Main high-stack full payoff quality and real Công Tâm peak hold; no generic damage/armor penetration/Gauge/CDR. Secondary owns eligible p1–p6 stack/actual-DoT utility only.

Auto is loadout-sensitive: emergency Guard, full stage4 Consume for equipped consume kits, conditional partial Transform with real Mist and dwell, sustained finite refresh, safe channel, bounded four-second Ultimate hold and Basic fallback. Manual shares the same transactions. Compiled PvE/Boss/PvP/Hunt and representative offline paths use CombatKernel V3. Existing offline rate accounting is not a fabricated per-kill Poison trace. New CombatEngine construction resets complete target core; no arbitrary callback/token serialization or new save authority.

## Fixed canonical benchmark

CombatKernel V3; 3 archetypes ×12 seeds ×180s = **36 runs**. Shared base100 each primary axis plus300 allocation; all8passives Lv20 and all10mastery tiers1000; Basic + exactly5Actives + Ultimate. Stats/loadouts/seeds/duration/target remained fixed. Neutral target has HP50m/Defense200 and ordinary incoming pressure. Emergency Guard is tested separately with real low HP; zero Guard usage in this neutral matrix is expected.

| Archetype | CL/TP/TPH/LL/TT | Five Actives | DPS mean [min–max] | Relative / band | stage4 entries / uptime(s) | normal full / partial Consume | mean stage consumed | DoT share | Identity |
|---|---|---|---|---|---|---|---|---|---|
| Công Tâm | 155/25/15/30/75 | bone,heart,insects,consume,calamity | 508.683 [482.131–522.566] | 100% reference | 14.833 /121.351 | 7.833 /0 | 4 | 43.313% | 12/12 |
| Vạn Độc | 105/25/20/90/60 | bone,heart,insects,mist,calamity | 459.488 [450.563–466.888] | 90.329% /90–97 | 7 /156.347 | 0 /0 | 4 (Ultimate) | 63.561% | 12/12 |
| Độc Vụ | 85/30/60/30/95 | bone,heart,mist,transform,guard | 461.636 [442.886–471.358] | 90.751% /85–92 | 22.417 /123.169 | 0 /15.583 | 3.948 | 61.257% | 12/12 |

Vạn Độc leads actual DoT applications93.917, resolved ticks594.250, uptime179.278s and stage4hold156.347s; its LL-family Insects/Calamity actually contribute. Công Tâm consumes genuine stage4setup, with meaningful full-payoff damage. Độc Vụ deploys real Mist and partial Transform using authored TT/TPH families. Bands overlap; both alternatives remain within their individually locked bands.

[Committed 36-run JSON](POISON_DAO_BENCHMARK_EVIDENCE_20261005.json) contains each run's damage/skill/casts, stage0–4time, first Công Tâm, entries/hold, full/partial counts and average stage, invalid miss attempts, DoT application/scheduled/resolved/suppressed ticks, damage/share, Mist uptime, channel start/completion/interruption/unfinished, Calamity/Transform/Guard, CN spent/restored/low time, Độc Tức uptime/threshold/cap, Ultimate, target-stage leaks and duplicate transactions. **Leaks0; duplicate transactions0.** The gate reruns all36, compares all results plus normalized source SHA-256, and replays the paired first seed exactly. Observer wrappers delegate once and restore in `finally`.

## P4/P5 decisions

Identity-invalid diagnostics were not used for DPS tuning. Vạn Độc initially failed the required application/tick/uptime lead. Bounded Cực Ý completion packet, finite Mist duration and landed channel packet ownership completed that identity without upfront stage or interruption rewards. Valid P4 baseline: Vạn Độc72.451%, Độc Vụ69.795%.

One primary tuning lever: **Mist DoT coefficient0.25→1.03**. Measured all36 again: Vạn Độc90.329%, Độc Vụ90.751%; correctness/identity/bands PASS. Retained, then stopped. No other Dao, global calibration, stat law, equipment or deferred family was retuned.

## QA and protected locks

All **44/44 scoped prerequisites** passed before readiness. Five Poison gates cover production/five-stat/mastery, target/landed transactions and real shield, consumer/channel/Auto/carry/save parity, all eight passives/legacy retirement, and deterministic benchmark. The other39gates preserve Combat V3 and locked Sword/Fist/Body/Mind/Spell. Ngũ Hành retirement also remains in local-CI preflight.

Four scoped QA expectations changed: registered feature inventory includes Poison; Sword's exclusion inventory recognizes separately opened Poison; Mind remains excluded from generic p8 while Poison now owns its peak event; Spell's accepted whole-file digest stays pinned to its historical exact closure while **all36 complete Spell gameplay outputs still compare exactly**. Its archived evidence was not rewritten, and its gameplay was not changed.

Frontend performance initially rejected two new eager modules (208 versus budget206). Poison helpers/class were placed in the already loaded contract/combat files. The graph remains206modules,4380.7KiB and the existing4.40MiB budget is preserved. No performance threshold was relaxed.

Legacy production paths retired: V1 Độc Tầng cannot shadow current target stage; old long/fast/devour/reverse variants, `passive.dao.poison.*`, full-consume/retention/build-penalty/set/epoch/pool hooks are inert in V2 Poison. Frozen compatibility data remains where callers/tests exist. Generic stage/stack direct damage/armor penetration/execute/Gauge, read-owned binding, prepare-time spend, double-dip, one-root0→4 and blind Auto rotation have no V2 authority. Retired equipment authority was not restored.

## Exact candidate boundary

After commit, run `node qa/local/run-local-ci.mjs full --require-clean` and `node qa/runners/v140-backend-gates.js feature dao-poison` directly to retain clean exact-SHA evidence without resetting an unpushed candidate. This preparation is not user Windows acceptance; whole-game Canonical closure remains a separate audit.

The canonical launcher fetches GitHub and resets to `origin/main`. Publish the local commit before using it, then record its printed exact SHA:

```cmd
git push origin main
DONG_BO_VA_TEST_FEATURE.cmd dao-poison
```

Require exact-SHA FULL CLEAN + scoped closure PASS on the user's Windows machine before recording Độc CLOSED/LOCKED.

## Changed files

Production (8): `dist/content/battle-dao-skill-pack-v118.js`, `dist/content/poison-dao-v2.js`, `dist/core/ai.js`, `dist/core/battle-dao-rotation-v127.js`, `dist/core/battle-dao-skill-growth-v126.js`, `dist/core/battle-dao-v2-contract.js`, `dist/core/battle-dao-v2-runtime-base.js`, `dist/core/combat.js`.

QA/launcher (11): `qa/runners/feature-closure-manifest.js`, `qa/benchmarks/poison-dao-p4-benchmark.js`, `qa/tests/poison-dao-production-contract-test.js`, `qa/tests/poison-dao-transaction-test.js`, `qa/tests/poison-dao-consumer-parity-test.js`, `qa/tests/poison-dao-passive-legacy-test.js`, `qa/tests/poison-dao-benchmark-contract-test.js`, `qa/tests/feature-closure-framework-test.js`, `qa/tests/sword-dao-five-stat-migration-test.js`, `qa/tests/mind-dao-m2-passive-architecture-test.js`, `qa/tests/spell-dao-benchmark-contract-test.js`, `tools/web/RUN_POISON_P4_BENCHMARK.cmd`.

Docs/evidence (9): `CURRENT_CHECKPOINT.md`, `docs/runtime/POISON_DAO_PRODUCTION_CONTRACT_20261005.md`, `docs/runtime/POISON_DAO_PRODUCTION_REFERENCE_20261005.md`, `docs/runtime/POISON_DAO_BENCHMARK_EVIDENCE_20261005.json`, this preparation, `docs/runtime/SPELL_DAO_PRODUCTION_CLOSURE_20261005.md`, and the minimal Spell acceptance status updates in `SPELL_DAO_PRODUCTION_CONTRACT_20261004.md`, `SPELL_DAO_PRODUCTION_REFERENCE_20261004.md`, `SPELL_DAO_CLOSURE_PREPARATION_20261004.md`.
