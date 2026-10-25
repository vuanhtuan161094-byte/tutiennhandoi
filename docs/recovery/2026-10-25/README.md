# Tu Tiên Nhàn Dỗi — Recovery audit (2026-10-25)

This directory is the documentation handoff for the recovery audit requested for **25 October 2026**. The audit was completed shortly after midnight on **26 October 2026 (Asia/Saigon)**.

## Audit snapshot and limits

- **Tested source SHA:** `0919d8ce287e12c1add0e22b3840d1a898a9021e`.
- **GitHub `main` HEAD observed for the audit:** `0919d8ce287e12c1add0e22b3840d1a898a9021e` (fetched 26 October 2026 before this documentation handoff).
- The local Godot gate passed against an isolated C: clone at that SHA with the exact one-file line-ending difference and 45 untracked local WIP files overlaid. This is not a fresh GitHub-only build.
- Godot 4.7.2, Windows, 390×844. High-realm Godot runtime and complete fight/result/aftermath remain **BLOCKED — NO AUTHORIZED TEST STATE**. No result screen, video, V3 runtime comparison, or new visual approval is claimed.
- The report preserves the audit’s PASS/FAIL/BLOCKED and candidate statuses. A test PASS is not owner approval or full-game closure.
- No save, WIP asset, source video, raw art, raw log, or binary capture is included in this handoff. Distribution rights for candidate art/screenshots were not confirmed; see [`evidence/EVIDENCE_INDEX.md`](evidence/EVIDENCE_INDEX.md) for local-only evidence paths and SHA-256. Those machine-local paths are not accessible from GitHub.
- The test clone was isolated on C:. The original E: source remained read-only; no launcher update/reset was run there.

## Reports

1. [Executive summary](01_EXECUTIVE_SUMMARY.md)
2. [GitHub and local audit](02_GITHUB_AND_LOCAL_AUDIT.md)
3. [Asset inventory](03_ASSET_INVENTORY.csv)
4. [Gameplay system status](04_GAMEPLAY_SYSTEM_STATUS.md)
5. [Runtime QA report](05_RUNTIME_QA_REPORT.md)
6. [UI/UX visual audit](06_UI_UX_VISUAL_AUDIT.md)
7. [Detailed recovery roadmap](07_RECOVERY_ROADMAP.md)
8. [Next Codex task](08_NEXT_CODEX_TASK.md)
9. [SHA-256 manifest](MANIFEST_SHA256.csv)
10. [Evidence index](evidence/EVIDENCE_INDEX.md)
11. [Long-run R2–R5 Codex execution plan (26/10/2026)](09_LONG_RUN_R2_R5_CODEX_EXECUTION_20261026.md) — owner-authorized instructions; **not** completion proof

The roadmap orders work as R1-HANDOFF, R2-ASSET, R3-ENDGAME, R4-VISUAL, R5-COMBAT-UI, and R6-GAME-COMPLETION. Core Balance and auxiliary rework remain deferred; no gameplay, runtime, tests, or production assets were changed for this handoff.
