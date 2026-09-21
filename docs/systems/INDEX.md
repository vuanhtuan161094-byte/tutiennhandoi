# SYSTEM INDEX — MINIMAL CONTEXT ROUTER

Use this file only to decide which subsystem to open. Do not preload every system.

## Routing rule

For each task, read in this order:

1. `/CURRENT_CHECKPOINT.md`
2. the active version/workflow spec only when the checkpoint names one
3. this index only if the affected subsystem is unclear
4. exact live source/test regions for that subsystem

Stop reading when enough authority exists to implement safely.

## System routes

| System | Search anchors | Typical authority |
|---|---|---|
| Tu Luyện / Bế Quan | `cultivation`, `retreat`, `tuVi` | live cultivation core + current contract tests |
| Săn Yêu / Resource PvE | `hunt`, `resource-pve`, `firstClear` | Hunt runtime + integration tests |
| Linh Căn | `spiritual-root`, `linhCan`, `banNguyen` | Spiritual Root core/runtime + current tests |
| Công Pháp | `manual`, `manual-progression`, `fragment` | manual progression/combat consumer + current tests |
| Trang Bị / Set | `equipment`, `set`, `setBonus` | equipment/set engine + combat consumer tests |
| Đan / Luyện Đan | `alchemy`, `pill`, `herb` | Alchemy production/runtime + current tests |
| Pháp Bảo / Chí Bảo | `artifact`, `relic` | artifact/relic production/combat tests |
| Linh Thú | `pet`, `beast` | pet/beast authority + source/sink tests |
| Tri Kỷ | `confidant`, `companion` | confidant runtime + combat integration |
| Phân Thân | `clone`, `phanThan` | clone authority + migration/regression tests |
| Luân Hồi | `reincarnation`, `fate`, `RP` | reincarnation tree/Fate tests |
| Động Phủ | `dongfu`, `cave` | production/transport tests |
| Endgame | `endgame`, `continuity` | continuity + player-journey tests |
| UI | `ui`, `hud`, `transport`, `presentation` | live UI/presentation source + frontend tests |

## Context limits

Normal task target: 1 checkpoint + 1 active-version spec + 2–5 source regions + targeted tests.

Do not open historical version reports, raw simulation output, complete CI logs, or whole large source files unless the task specifically requires them.

Version numbers in legacy filenames are not authority by themselves. Determine authority from live imports/consumers and current tests.
