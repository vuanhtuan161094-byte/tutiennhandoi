# MODULE CONTROL STANDARD

Status: **ACTIVE GOVERNANCE STANDARD**

## 1. Purpose

Every meaningful game system must have one clear control entry. The goal is to stop project knowledge from being spread across old chat history, version reports and unrelated code files.

The hierarchy is:

`GAME_MASTER_MAP → docs/systems/INDEX → MODULE.md → contract/spec → tests/gates → closure`

## 2. Required MODULE.md sections

A module control file should contain, at minimum:

1. **Status**
2. **Purpose / player-facing role**
3. **Authority**
4. **Depends on**
5. **Provides**
6. **Must NOT own**
7. **Submodules / state table**
8. **Active phase / next action**
9. **Canonical docs**
10. **Source anchors**
11. **Tests / gates**
12. **Known debt / deferred scope**
13. **Closure evidence**, when closed

Small modules may keep all of this in one file. Large modules may link to separate DESIGN, CONTRACT, TEST_PLAN and CLOSURE files.

## 3. Status vocabulary

Use only these broad states unless a module-specific workflow defines a stricter sub-state:

- CLOSED / LOCKED
- LIVE
- ACTIVE
- READY
- REWORK PLANNED
- DEFERRED
- LEGACY / COMPAT
- AUDIT NEEDED

Never call a system CLOSED merely because implementation exists.

## 4. Dependency rule

A module must name dependencies explicitly.

Example:

`Combat UI → Combat Backend + 8 Dao + Hunt + Boss`

Presentation may read authoritative projections from those dependencies. It may not silently become a second gameplay owner.

## 5. Authority rule

Each gameplay fact has one production owner.

A MODULE.md must identify:
- state owner;
- mutation owner;
- presentation owner;
- save owner where relevant.

If ownership is unclear, mark the item **AUDIT NEEDED** instead of guessing.

## 6. Closure rule

Closure requires the workflow appropriate to the module.

Backend/gameplay:
- correctness;
- parity;
- required benchmark when applicable;
- exact candidate;
- scoped gate;
- closure record.

UI/presentation:
- real runtime candidate;
- technical gate;
- screenshot/runtime evidence;
- explicit user visual approval;
- closure record/checkpoint update.

## 7. Documentation rule

Do not create duplicate historical specs just to record status.

MODULE.md should point to existing canonical docs. Historical docs remain history unless current checkpoint/module explicitly promotes them.

## 8. Update rule

When a module changes state:
1. update its MODULE.md;
2. update CURRENT_CHECKPOINT if it affects current work;
3. update GAME_MASTER_MAP only if the high-level project state or dependency map changed.

This keeps the root files compact.
