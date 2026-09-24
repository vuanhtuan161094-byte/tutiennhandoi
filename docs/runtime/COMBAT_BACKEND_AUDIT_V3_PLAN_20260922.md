# COMBAT BACKEND AUDIT & V3 MIGRATION PLAN — 2026-09-22

Status: **IMPLEMENTED / PRODUCTION CUTOVER CLOSED / LOCKED 2026-09-24**

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main`  
Audit source snapshot: `017ac7ace77c754e956325830f85c2580a5455fa`

## 1. Executive conclusion

Combat gameplay is not fundamentally broken, but the current backend is carrying several generations of compatibility code inside the same runtime path.

The correct next move is **not** to rewrite balance/formulas from scratch. The correct move is a **strangler migration to CombatKernel V3**:

1. keep V2 frozen as the deterministic oracle;
2. first lock/fix confirmed authority defects with narrow regression tests;
3. introduce one canonical CombatEntity factory and one encounter compiler;
4. build V3 as a deterministic modular kernel beside V2;
5. parity-test V2 vs V3 on the same seed/entity snapshots;
6. migrate Hunt/Dungeon/PvP/Content Event/benchmarks one consumer at a time;
7. only then retire V2 compatibility branches.

This preserves the valuable parts of V168 — deterministic combat, seeded PvP replay, stat composition semantics, existing authored skills/Đạo/Set/Artifact behavior — while removing the current god-object architecture.

## 2. Current live authority map

### 2.1 Player CombatEntity composition

The intended single-source builder is:

`SimulationSession.personalCombatEntityForState(state)`

Current canonical order:

1. Character;
2. Equipment / Set;
3. Collection;
4. Reincarnation Artifact talents;
5. Đạo;
6. Integration;
7. Great Vehicle;
8. Immortal;
9. Reincarnation combat talents;
10. Birth combat origins;
11. Alchemy life/permanent/temporary combat bonuses.

This order matches the V168 authority intent and must become the only player-entity construction path.

### 2.2 Battle execution

Current primary path:

`CombatEntity → applyCombatPacingV124 → runCombatKernelV2 → CombatEngine → battle result/logs`

`combat-kernel-v2.js` is only a thin wrapper. Most runtime authority actually lives in:

- `combat.js`;
- `combat-decision.js`;
- `stats.js`;
- `combat-rules.js`;
- Battle Đạo/Five Element runtime modules;
- artifact/pet/confidant trigger payloads;
- Boss preparation/runtime helpers.

### 2.3 Current consumers

| Consumer | Kernel | Player entity source | Notes |
|---|---|---|---|
| Endless Hunt / Boss | V2 | canonical builder | Live Boss outcome; Boss win is progression-only |
| PvP | V2 | canonical/current snapshot | Seeded replay re-runs same kernel |
| Dungeon challenge | V2 | **manual duplicate builder** | Authority drift found |
| Content Event combat | V2 | **manual duplicate builder** | Authority drift found |
| Đạo Suy | V2 | canonical builder | Good reference consumer |
| Equipment intelligence | V2 + hunt profile helper | canonical builder | helper currently contains a confirmed runtime bug |
| Web combat presentation | V2 logs → presentation adapters | presentation-only | not suitable as Godot's final contract |
| Godot bridge | none yet | none | good opportunity to introduce clean typed Combat transport |

## 3. Confirmed authority/correctness defects

### C1 — Kernel timeout can execute events after maxDuration

Severity: **HIGH**

Current loop checks `now <= maxDuration` before shifting the next event. Example:

- current `now = 119`;
- next queued event is at `124`;
- `maxDuration = 120`;
- loop condition still passes;
- event at 124 is processed.

Consequences:

- battle duration may exceed the requested hard cap;
- a delayed skill can resolve after timeout;
- a result that should be draw/timeout can become win/loss.

Required regression:

- schedule a lethal resolve strictly beyond maxDuration;
- assert it never executes;
- assert battle finalizes at/before the cap with the expected draw/final state.

### C2 — Dungeon player CombatEntity bypasses V168 canonical builder

Severity: **CRITICAL**

`session-dungeon.js` manually rebuilds the player entity instead of calling
`personalCombatEntityForState()`.

The Dungeon chain differs from the canonical chain:

- it does not apply Birth combat origins;
- it does not apply Alchemy combat bonuses;
- it applies Fate Embryo/Mệnh Thai through `applyFateEmbryoToEntity`.

The main Session explicitly reports Mệnh Thai as retired in Luân Hồi V4, but the Dungeon path can still apply its legacy stat multipliers when old/restored state contains it.

Therefore the same player can have different Combat stats depending on which activity launches the fight.

Required fix:

- all Dungeon player construction must route through the canonical entity factory;
- retired Fate Embryo power must not re-enter via Dungeon compatibility code.

### C3 — Content Event combat bypasses V168 canonical builder

Severity: **CRITICAL**

`resolveContentEvent()` also manually rebuilds the player.

It omits at least:

- Birth combat origins;
- Alchemy combat bonuses.

Therefore Content Event battles can disagree with Hunt/PvP/current character power.

Required fix:

- route through the same canonical entity factory;
- only change identity/id for encounter-local use after the entity is fully composed.

### C4 — `buildHuntCombatProfileV130()` contains undefined variables

Severity: **HIGH**

In `hunt-real-combat-v130.js`, `skillTotals()` reads:

- `origin.cyclePct`;
- `origin.costPct`;
- `milestone.cyclePct`;
- `milestone.costPct`.

Neither `origin` nor `milestone` is declared/imported in the file.

This is a real ReferenceError path when the helper is executed.

The helper is still called by `equipmentBuildIntelligence()` for:

- Max HP benchmark normalization;
- Spirit sustain;
- control pressure;
- heal/shield throughput.

Required action:

- do not silently invent the missing semantics;
- either restore their explicit source from the intended authored profile with a regression test, or replace this helper's use with metrics derived directly from CombatKernel events;
- preferred V3 direction: remove expected-value combat duplication and derive benchmark metrics from the real kernel.

### C5 — Retired Mệnh Thai can re-enter combat through Dungeon

Severity: **HIGH / save-dependent**

The live Session says Mệnh Thai is retired, yet `fate-embryo.js` still contains active stat transforms and Dungeon still calls them.

For fresh states this may often be inert, but restored historical states can carry data that activates the multiplier.

This is a compatibility-boundary leak and should be closed by C2.

## 4. High-risk semantic inconsistencies

### H1 — Defeat policy is fragmented

Current examples:

- Hunt: applies Hunt-specific injury amount;
- Content Event: calls `applyCombatDeathPenalty()`;
- Dungeon: adds `14 + floor × 2` injury and then calls `applyCombatDeathPenalty()`, which adds another 15 injury;
- Luân Hồi V4 says combat defeat is recoverable and does not reduce lifespan.

The Dungeon double application may be intentional difficulty tuning, but there is no single explicit defeat-policy owner.

V3 should separate:

`Combat outcome` from `activity settlement`.

Each activity can choose an explicit named policy, but the policy must be authored in one settlement layer rather than accumulated incidentally.

### H2 — Content Event defeat copy is stale

`applyCombatDeathPenalty()` now returns `lostYears: 0`, yet Content Event copy can still say combat death reduced 0.1% maximum lifespan when `applied` is true.

This is presentation/settlement semantic debt, not a damage-kernel issue.

### H3 — Hunt skill practice uses estimated casts while Dungeon uses actual casts

Dungeon counts real `castStart` logs from CombatKernel.

Endless Hunt instead calls `estimateBattleDaoCastCountsV125(..., battleSeconds, ...)` after already running a real battle.

This can credit a skill that was not actually cast or miss a cast produced by the real rotation.

Preferred fix:

- expose canonical cast counts in CombatResult summary;
- every activity consumes that same summary.

### H4 — Boss behavior has multiple pre-kernel owners

Current Boss behavior is compiled from more than one layer:

- Endless Hunt Boss mechanic wrapper;
- `prepareBossGameplayV2`;
- tags/dominant element fallback;
- phases/counter windows;
- skill/AI injection.

This can be valid, but the source of a Boss mechanic is difficult to trace.

V3 should compile all of this once into an explicit `CombatEncounterPlan`.

## 5. Confirmed retired/dead machinery inside live Combat code

### D1 — V119 Technique runtime

V144 compatibility explicitly neutralizes V103/V119 live Combat runtime.

However CombatEngine and combat-decision still contain branches for:

- deferred wound/debt;
- demon backlash;
- shield consumption;
- cooldown return;
- blood sacrifice;
- technique cast/cost/recovery modifiers;
- other V119-specific flags.

They currently resolve to neutral values in canonical production state, but they remain in the core control flow.

Do not port these branches to V3. Keep legacy restore/migration at the edge only.

### D2 — Bảo Khí resource

V150 explicitly removed Bảo Khí:

- `baoQiMax = 0`;
- `baseGainPerAction = 0`;
- no BaoQi gameplay resource;
- Artifact skills are regulated by trigger/cooldown/state.

Yet CombatEngine and `hunt-combat-stream.js` still carry BaoQi fields/marks/presentation mappings.

Do not expose Bảo Khí to Godot.

Remove it from V3 core/event contracts. Preserve compatibility reads only if an old save requires them.

### D3 — Old Hunt expected-value winner resolver

`resolveHuntRealCombatV130()` still contains an independent HP-race model.

Current live Endless Hunt passes real CombatKernel V2 results into settlement, so this old resolver is not the normal Boss authority.

V3 should not retain a second possible winner authority. There must be exactly one battle outcome source.

## 6. Core architecture problems

### A1 — `CombatEngine` is a god object

`combat.js` is ~1,700 lines and owns or directly knows about:

- scheduler;
- decisions;
- casts/channels;
- cooldowns;
- damage;
- Crit/Hội Tâm;
- dodge;
- shields;
- healing;
- statuses/control;
- break;
- trigger dispatch;
- Boss phases;
- counter windows;
- anti-death;
- Five Element Set mechanics;
- Sword/Body/Poison/Formation/Artifact-specific behavior;
- legacy Technique behavior;
- Battle Đạo resources;
- combat logging.

A new Đạo/mechanic currently tends to add another conditional into the shared kernel.

### A2 — Live V117 + V118 + Battle Đạo V2 form a hybrid modifier pipeline

A single action can pass through:

- Five Element runtime V117;
- Battle Đạo combat V118;
- Battle Đạo V2 runtime;
- skill practice/growth;
- legacy V119 neutral hooks;
- Set/runtime modifiers.

Do not call this double-counting without parity evidence, but the composition order is difficult to reason about and easy to regress.

V3 needs an explicit modifier pipeline with named stages and provenance.

### A3 — Locked vs legacy damage is selected by entity flags

`CombatEngine` uses the modern locked path only if both entities have
`combatModel === 'locked-v1'`.

Otherwise it can fall into legacy damage/heal/status rules.

A forgotten flag on a synthetic entity can therefore silently change combat semantics.

V3 should normalize entities at the boundary and reject unsupported combat models rather than choose a second hidden ruleset.

### A4 — Event queue re-sorts on every insertion

`schedule()` pushes then sorts the full queue.

This is acceptable at current encounter sizes but is not a good foundation for more animated/event-rich Combat.

V3 should use a stable priority queue/min-heap keyed by:

`time → deterministic sequence/order`.

### A5 — Human text logs are doing too much

`battle.logs` are simultaneously used for:

- debugging;
- analytics;
- progression cast counts;
- presentation;
- Boss counter windows;
- combat stream conversion.

This makes log text/data shape an implicit API.

V3 should emit typed events first; readable message strings should be derived presentation.

## 7. Systems worth preserving

The audit does **not** justify throwing away everything.

Preserve these contracts:

1. deterministic seeded execution;
2. PvP replay from exact entity snapshots + seed;
3. V168 stat composition order;
4. materialized Max HP authority;
5. separate Crit layers and Hội Tâm semantics;
6. current defense/penetration/reduction formulas unless balance work explicitly reopens them;
7. Battle Đạo authored skill data and progression;
8. Artifact/Relic trigger-cooldown model after V150;
9. Boss phase/counter-window gameplay semantics;
10. Boss progression-only / Săn Ảo economy separation;
11. activity settlement outside the Combat kernel.

## 8. Recommended Combat V3 architecture

```text
AdventureState
    │
    ▼
CombatEntityFactory
    │
    ├── player canonical composition
    └── enemy canonical composition
    │
    ▼
CombatEncounterCompiler
    │
    ├── pacing
    ├── boss phases/mechanics
    ├── AI/rotation
    └── encounter limits
    │
    ▼
CombatKernelV3
    │
    ├── Scheduler
    ├── ActionResolver
    ├── DamageResolver
    ├── ResourceRuntime
    ├── StatusControlRuntime
    ├── ShieldBreakRuntime
    ├── TriggerBus
    ├── DaoRuntime
    └── BossPhaseRuntime
    │
    ▼
CombatResultV3
    ├── outcome/finalState
    ├── typed events
    ├── cast counts
    ├── damage/heal/shield summary
    ├── phase/counter summary
    └── deterministic replay metadata
    │
    ├── Hunt settlement
    ├── Dungeon settlement
    ├── PvP settlement/replay
    ├── Content Event settlement
    ├── benchmark/intelligence
    └── Godot Combat bridge/view model
```

### 8.1 CombatEntityFactory

Single player factory.

No activity may manually reproduce the composition chain.

Factory output should include:

- normalized `combatModel`;
- immutable authored skill/triggers/phases where practical;
- explicit provenance metadata for debug/tests;
- no retired Fate Embryo/Technique/Bảo Khí authority.

### 8.2 CombatEncounterCompiler

Own all encounter-specific shaping before the kernel:

- enemy scaling;
- Boss tags/archetype;
- Boss phase definitions;
- counter windows;
- timeout;
- pacing;
- selected mode.

Kernel receives a complete encounter and does not invent content from UI or settlement context.

### 8.3 CombatKernelV3 core

Keep the kernel generic.

Content-specific behavior should enter through typed runtime handlers/effects rather than checks such as
`if skillId === ...` spread through the core.

Suggested core event ordering contract:

`scheduled time → sequence → action begin → resource payment → resolve → hit result → damage/heal/shield/status → trigger dispatch → phase/death → recovery/next decision`.

### 8.4 Typed CombatEvent contract

Minimum families:

- `battle.started`
- `action.cast_started`
- `action.resolved`
- `hit.missed`
- `hit.heart`
- `hit.critical`
- `damage.applied`
- `heal.applied`
- `shield.applied`
- `shield.absorbed`
- `shield.broken`
- `status.applied`
- `status.removed`
- `resource.changed`
- `break.changed`
- `boss.phase_entered`
- `boss.counter_opened`
- `boss.counter_succeeded`
- `boss.counter_failed`
- `trigger.fired`
- `entity.defeated`
- `battle.ended`

Each event should carry numeric authority fields directly. Godot must never reverse-parse display text.

### 8.5 CombatResult summary

Include at least:

- winner/loser/draw/timeout;
- authoritative duration;
- final HP/resource state;
- cast count by skill;
- damage/healing/shield by source;
- dodges/Crit/Hội Tâm;
- Boss phases/counter results;
- seed/replay identity.

This removes the need for every activity to rescan raw logs differently.

## 9. Migration strategy

### Phase 0 — Guard current V2 before refactor

Add regression tests for:

1. hard timeout boundary;
2. canonical CombatEntity parity across Hunt/Dungeon/Content Event/PvP entry points;
3. retired Mệnh Thai cannot re-enter combat;
4. `buildHuntCombatProfileV130` execution;
5. Hunt practice cast counts from actual battle;
6. no Bảo Khí in player-facing live Combat contract.

Then fix only confirmed failures.

### Phase 1 — Canonical factories

Extract:

- `CombatEntityFactory`;
- `CombatEncounterCompiler`.

Migrate existing V2 consumers to these factories while V2 kernel remains unchanged.

This alone removes a large amount of authority drift with low gameplay risk.

### Phase 2 — Typed event adapter on V2

Before V3, create the final typed `CombatEventV1` contract from V2 output.

Godot can integrate against this stable shape while V3 is developed behind it.

### Phase 3 — Kernel V3 beside V2

Do not overwrite `CombatEngine`.

Run V2 and V3 from the same immutable encounter snapshot and seed.

### Phase 4 — Parity matrix

Required dimensions:

- ordinary fight;
- Boss;
- phase + counter window;
- Dungeon;
- PvP;
- Content Event;
- all 8 Battle Đạo identities;
- Five Element combinations;
- Set mechanics;
- Artifact/Relic triggers;
- pet/confidant triggers;
- anti-death;
- long fight/resource sustain;
- timeout edge cases.

For deterministic replacement, compare:

- winner/draw/timeout;
- duration;
- final HP/resource;
- cast counts;
- key resource/phase/counter state;
- aggregate damage/heal/shield;
- replay repeatability.

Do not require human log strings to be byte-identical.

### Phase 5 — Consumer cutover

Recommended order:

1. benchmark/intelligence;
2. Content Event;
3. Dungeon;
4. Hunt/Boss;
5. PvP last, because replay/integrity is the strictest deterministic contract.

### Phase 6 — retirement

Only after all parity gates:

- remove legacy damage path from V3;
- remove neutral V119 Combat hooks;
- remove BaoQi core/presentation fields;
- retire old Hunt outcome resolver from production;
- reduce V2 to compatibility/replay support for historical snapshots if needed.

## 10. Godot Combat transport decision

Do not expose raw `battle.logs` as the primary Godot API.

Add a dedicated bridge surface later, for example:

- `GET /combat/overview`
- `POST /combat/challenge`
- `GET /combat/replay/:id` or an equivalent deterministic action result

The response should contain:

- `CombatViewModel` / encounter metadata;
- typed Combat events;
- authoritative player/Boss HP/resource values;
- Boss phase/counter state;
- read-only skill state;
- final result/settlement reference.

Godot remains a presentation consumer. It must not decide damage, skill triggers, rewards, Boss phase, or victory.

## 11. Test gaps found

Current authority tests are strong around state ownership/stat provenance, but the audit found missing guards for:

- timeout event boundary;
- activity-to-activity player entity equality;
- Content Event/Dungeon inclusion of Birth + Alchemy;
- retired Fate Embryo leakage;
- Hunt-profile helper runtime execution;
- real cast-count progression parity;
- typed event schema;
- all-consumer Combat parity matrix.

These gaps explain why V168 could be “locked” while orchestration drift still existed outside the central stat test.

## 12. Final disposition

### Keep

- authored gameplay/balance;
- deterministic RNG;
- Combat formulas;
- V168 composition order;
- Battle Đạo content;
- Boss phase/counter semantics;
- PvP replay principle;
- progression/economy separation.

### Rewrite structurally

- entity construction ownership;
- encounter compilation;
- scheduler;
- kernel decomposition;
- trigger/event architecture;
- result summary;
- Godot transport.

### Retire from new kernel

- legacy damage fallback;
- V119 neutral Combat machinery;
- BaoQi runtime/presentation;
- duplicate old Hunt winner model;
- retired Mệnh Thai power path;
- activity-specific raw-log parsing for cast counts/analytics.

### Rule

**Đập kiến trúc, không đập số.**

Balance/formulas are changed only when a separate balance issue is proven and intentionally opened.

## 13. Verification status

The original 2026-09-22 document began as a static audit. The proposed migration has since been implemented and closed.

Exact verified runtime SHA: `00f944feeebe99778beec0c1d727060e47dfc5ec`.

User-local closure evidence:

- `V140 BACKEND CLOSURE: 134/134 PASS`
- `V140 FRONTEND CLOSURE: 34/34 PASS`
- `FULL CLEAN + CANONICAL: PASS`
- exact SHA reported by the local gate: `00f944f`

Production new-fight consumers now use the CombatKernel V3 boundary. V2 remains intentionally available only as the frozen deterministic parity oracle and historical `combat.v2` PvP replay compatibility path.

The V3 facade still executes the locked V168 CombatEngine through `combat-engine.v168-compat`; this was the deliberate strangler-migration decision. Internal engine decomposition is a separate optional maintenance scope, not an incomplete requirement of this closure.

Canonical closure record: `docs/runtime/COMBAT_BACKEND_V3_CLOSURE_20260924.md`.

**Disposition: CLOSED / LOCKED.**
