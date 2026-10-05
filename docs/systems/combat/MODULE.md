# MODULE — COMBAT

Status: **ACTIVE — PRESENTATION PHASE**

## Purpose

Own combat gameplay authority and expose truthful combat state to presentation.

## Authority map

| Area | State | Owner |
|---|---|---|
| Combat Backend V3 | CLOSED / LOCKED | JS Combat runtime |
| Kiếm | CLOSED / LOCKED | Dao runtime/content |
| Quyền | CLOSED / LOCKED | Dao runtime/content |
| Thể | CLOSED / LOCKED | Dao runtime/content |
| Thần Niệm | CLOSED / LOCKED | Dao runtime/content |
| Pháp | CLOSED / LOCKED | Dao runtime/content |
| Độc | CLOSED / LOCKED | Dao runtime/content |
| Trận | CLOSED / LOCKED | Dao runtime/content |
| Ngự Khí | CLOSED / LOCKED | Dao runtime/content |
| Combat UI/UX V1 | ACTIVE | Presentation layer |
| Core Balance 8 Đạo | DEFERRED | Not opened |

## Depends on

- Core Runtime
- five-stat authority
- Hunt/Boss activity state
- skill/passive/mastery content

## Provides

- battle outcomes;
- HP/CN/Gauge/Break state;
- cast/channel/interrupt events;
- Dao core resources;
- Auto decisions;
- presentation-safe combat projections.

## Must NOT own

- UI geometry;
- art;
- screen navigation;
- external collection Pháp Bảo/Chí Bảo authority;
- auxiliary-system redesign while Combat UI is active.

## Current action

**Combat UI/UX V1 C0**.

Control:
- `docs/systems/combat-ui/MODULE.md`
- `docs/ui/COMBAT_UI_UX_V1_PLAN_20261005.md`

Do not open Core Balance until explicitly requested.
