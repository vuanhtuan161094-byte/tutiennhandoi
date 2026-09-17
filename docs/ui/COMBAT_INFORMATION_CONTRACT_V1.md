# Combat Information Contract V1

Status: active contract for Combat Readability — Batch A.

## Purpose

Combat UI is a projection of runtime/backend-authored truth. It may prioritize, hide, truncate, or relocate information for readability, but it must not calculate new gameplay truth, infer rewards, reverse-parse formatted numbers, or imply actions that the runtime does not support.

Canonical flow:

`CombatKernel / endlessHunt model → Combat Presentation Model V1 → DOM renderer / Pixi presentation`

## Information priority

| Priority | Information | Authoritative presentation source | Visibility / decision supported |
| --- | --- | --- | --- |
| P0 — combat vital | Enemy/Boss identity: `enemy.name`, `enemy.level`, `enemy.isBoss`, `enemy.element` / `enemy.stageElement` | `Combat Presentation Model V1.enemy`, mapped from `endlessHunt.monster`, `endlessHunt.farm`, and current map | Keep readable whenever the enemy HUD is visible. Answers “what am I fighting?” |
| P0 — combat vital | Player/enemy HP, poise and existing combat resources | Existing Hunt V2 runtime-rendered vitals. These are not re-authored by `Combat Presentation Model V1` in Batch A. | Keep readable during active combat. Bars must consume authoritative ratio/magnitude; formatted K/M/B text is display-only. |
| P1 — Boss tactical | Boss readiness: `boss.readiness.label`, `description`, `tone` | `endlessHunt.productionV110.boss.readiness` through `Combat Presentation Model V1.boss.readiness` | Prefight context. Answers whether the player is ready / what the current assessment is. |
| P1 — Boss tactical | Boss mechanic: `boss.mechanic.name`, `counterSummary`; deeper `description`, `coveragePct`, `counterHint` stay available to detailed views | `endlessHunt.productionV110.boss.mechanic` / canonical fallback already mapped by `Combat Presentation Model V1` | Prefight summary + compact active-combat affordance. Answers “what mechanic matters and how much counter coverage exists?” |
| P1 — challenge | `challenge.floor`, `ready`, `canFight`, `blocked`, `blockedReason`, `progressionLabel` | `endlessHunt.currentZoneFloor/currentMap`, `bossReady`, `canFight`, `fightBlocker` through `Combat Presentation Model V1.challenge` | Show progression purpose in prefight; show blocker only when blocked. Answers “can I challenge and what does winning advance?” |
| P2 — economy/context | `farm.available`, `active`, `floor`, `zoneName`, `label`, `detail` | `endlessHunt.farm` through `Combat Presentation Model V1.farm` | Săn Ảo/action-deck context only. It must not be presented as a direct Boss drop/reward. |
| P2 — context | Enemy grade / map element metadata | `Combat Presentation Model V1.enemy` | Secondary metadata; may be truncated before P0/P1 information. |

## Boss briefing hierarchy

The prefight Boss briefing is intentionally tactical, not an economy card:

1. Boss identity + level/element + progression purpose.
2. Readiness/current assessment.
3. Mechanic + counter coverage.
4. Block reason only when the challenge is blocked.

Săn Ảo remains in the Hunt/action-deck context. Do not duplicate Săn Ảo income or “reward” copy inside the Boss briefing.

During active combat, the prefight briefing and challenge controls disappear. The compact Boss mechanic affordance may remain unless a higher-priority critical signal suppresses it.

## Locked semantics

- Direct Boss challenge is progression-only. It does not directly mint Linh Thạch, equipment, Ngọc, or timed-farm settlement.
- Săn Ảo is the economy settlement path. Farm copy must remain explicitly associated with Săn Ảo/Hunt context.
- UI may format authoritative values but may not reverse-parse formatted K/M/B strings into HP or other gameplay magnitudes.
- UI must not synthesize power score, drop chance, recommended stats, difficulty ratings, phases, rewards, or status truth when no authoritative field exists.
- Unsupported or empty information is omitted rather than guessed.
- Presentation modules do not call gameplay mutation APIs or write save state.

## Batch A boundary

Batch A may change information ordering, copy, visibility, and semantic grouping. It must not change actor positions, battlefield composition, combat interactions, VFX, skill behavior, damage, rewards, save data, balance, or Boss progression logic.
