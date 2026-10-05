# SYSTEM INDEX — MODULE ROUTER

Use this file to identify the owning module. Do not preload every system.

## Routing order

For a normal task:

1. `/CURRENT_CHECKPOINT.md`
2. if the task is project-wide/new major system: `/GAME_MASTER_MAP.md`
3. this index
4. the owning `MODULE.md`
5. active contract/spec named by that module
6. exact live source/test regions required

Governance standard: `docs/systems/MODULE_CONTROL_STANDARD.md`.

## Major modules

| Module | Current state | Control file | Search anchors |
|---|---|---|---|
| Core Runtime | CLOSED / LOCKED + LIVE | `docs/systems/core-runtime/MODULE.md` | runtime, save, bridge, session |
| Combat | ACTIVE presentation phase | `docs/systems/combat/MODULE.md` | combat, dao, boss, break, auto |
| Progression | LIVE / mixed | `docs/systems/progression/MODULE.md` | cultivation, retreat, spiritual-root, manual, reincarnation |
| Character Build | LIVE / REWORK PLANNED | `docs/systems/character-build/MODULE.md` | stats, equipment, artifact, relic |
| Economy | LIVE / per-system audit | `docs/systems/economy/MODULE.md` | currency, source, sink, alchemy, inventory |
| World / Activities | LIVE / mixed | `docs/systems/world-activities/MODULE.md` | hunt, boss, dungeon, farm |
| Social / Companion | DEFERRED / REWORK PLANNED | `docs/systems/social-companion/MODULE.md` | confidant, companion, pet, beast |
| Presentation / UI | ACTIVE | `docs/systems/presentation/MODULE.md` | ui, hud, godot, presentation |
| Combat UI/UX | ACTIVE C0 | `docs/systems/combat-ui/MODULE.md` | combat hud, skill rail, telegraph, dao widget |

## Feature routes

| System | Owning major module | Typical authority |
|---|---|---|
| Tu Luyện / Bế Quan | Progression | live cultivation core + current tests |
| Săn Yêu / Resource PvE | World / Activities | Hunt runtime + integration tests |
| Linh Căn | Progression | V145 authority + current tests |
| Công Pháp | Progression | manual progression/combat consumer |
| Trang Bị / Set | Character Build | equipment engine + combat consumer tests |
| Đan / Luyện Đan | Economy | alchemy runtime + tests |
| Pháp Bảo / Chí Bảo | Character Build | artifact/relic collection authority |
| Linh Thú | Social / Companion | pet/beast authority |
| Tri Kỷ | Social / Companion | confidant authority |
| Phân Thân | Progression / audit routing | clone authority + migration/regression tests |
| Luân Hồi | Progression | reincarnation/fate authority |
| Động Phủ | World/Economy boundary | production/transport tests |
| Endgame | World / Activities | continuity + journey tests |
| UI | Presentation | live UI/presentation source + visual gates |

Version numbers in old filenames do not make a document authoritative by themselves.
