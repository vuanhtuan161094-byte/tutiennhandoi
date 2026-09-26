# DAO NEW SLICE TEMPLATE V3

Use this file as the starting checklist for the next Main Dao. Copy the headings into a dated Dao production contract; do not treat this template itself as gameplay authority.

## 1. Scope

- Feature id: `dao-<id>`
- Dao name:
- Open reason:
- Allowed production areas:
- Shared seams allowed only with evidence:
- Explicitly deferred systems:
- Locked Dao that must remain regression-protected:
- Feature manifest status: `closureReady: false`

## 2. Identity

- Primary combat identity:
- Secondary identity:
- What this Dao must be best/strong at internally:
- What it must deliberately not become:
- Hard-CC policy:
- Resource/tempo policy:

## 3. Five-stat ownership

For each family, state whether it is primary, secondary, utility-only, capacity-only, or forbidden as generic damage scaling.

- CL / power:
- TP / body:
- TPH / agility:
- LL / spirit:
- TT / sense:

## 4. Resources

### Short-cycle resource

- id:
- cap:
- generation:
- spend:
- payoff:
- overflow rule:

### Long-cycle resource / stack

- id:
- cap:
- duration/decay:
- generation:
- thresholds:
- carry/reset policy:

## 5. Ten production skills

For each skill record:

- id + Vietnamese name;
- role;
- slot class;
- cast/recovery/cooldown/CN/Gauge;
- five-stat family;
- base effect package;
- resource generation/spend;
- Break/control/status behavior;
- mastery 100/250/500/750/1000;
- Auto condition;
- identity metric used by benchmark.

## 6. Passives

For every passive record:

- exact owner mechanic;
- level scaling;
- threshold/cap interaction;
- forbidden overlap with other passives;
- benchmark observable.

## 7. Auto rotation

Write the priority intent before coding. Include:

- interrupt/reaction priority;
- resource setup;
- payoff conditions;
- Broken/mark/stack conditions;
- bounded Ultimate hold if any;
- filler/basic fallback;
- generic AI fallback restrictions.

## 8. Runtime seam audit

Audit and record findings for:

- `canUse` / form gates;
- AI condition availability;
- action prepare/finish hooks;
- multi-hit/channel resolution;
- resource snapshot timing;
- CC/Break/status runtime;
- PvP scaling/snapshot;
- Hunt preview;
- offline/virtual Hunt;
- legacy/NPC five-stat snapshots;
- restore/save compatibility.

No balance tuning before this audit is complete.

## 9. Benchmark contract

Define three or more fixed-budget internal archetypes.

For each:

- allocation;
- exact 5 Active slots + Basic + Ultimate;
- mastery/passive state;
- deterministic duration/seeds;
- relative target band;
- identity assertions.

Identity assertion examples:

- Counter success > 0;
- Break count > 0;
- channel completes > 0;
- stack threshold reached;
- resource spend/payoff > 0;
- Ultimate/domain opens > 0.

A build with zero defining identity events is invalid benchmark evidence even if it reports DPS.

## 10. Tune log

For every balance change record:

- measured miss;
- selected local lever;
- why a global multiplier is rejected/accepted;
- expected directional effect;
- actual rerun result;
- stop decision once inside band.

## 11. Feature closure manifest

Register `dao-<id>` in `qa/runners/feature-closure-manifest.js`.

During development:

`closureReady: false`

Before final closure, verify manifest contains:

- shared CombatKernel regression gates;
- five-stat/parity gates;
- this Dao's production contract/migration tests;
- previously locked Dao regressions only where shared risk warrants them;
- benchmark contract test;
- no unrelated subsystem balance audits.

After identity-valid benchmark + target bands PASS:

`closureReady: true`

Then run:

```cmd
DONG_BO_VA_TEST_FEATURE.cmd dao-<id>
```

## 12. Closure record

Record:

- final gameplay SHA;
- final feature-closure SHA;
- Fast/Full Clean result;
- benchmark means/bands/identity metrics;
- scoped gate count/result;
- any full-game audit debt outside scope;
- explicit `CLOSED / LOCKED` disposition.
