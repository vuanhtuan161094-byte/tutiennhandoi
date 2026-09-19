# GODOT TOOLING CHECKPOINT — 2026-09-19

Status: STATIC CANDIDATE

Active migration target:
- Godot 4.7.2 stable
- viewport 390x844
- canonical JS runtime through V179 remains gameplay authority/oracle

Pinned agent skills:
- godot-ui
- godot-architecture
- godot-headless-workflow
- godot-code-review
- godot-animation
- godot-shaders-vfx
- godot-debugging
- godot-stagehand

Pinned tooling:
- Stagehand v0.4.1 @ 82c6cb96f3cccb067081db17f4c4c8582562e98b
- GdUnit4 v6.2.1 @ 08ffc7c65b61b1b2edd545616061a99973c13ce1
- exact lock: tools/godot/TOOLING_LOCK.json

Entry points:
- SETUP_GODOT_TOOLING.cmd
- VERIFY_GODOT_LOCAL.cmd
- APPROVE_GODOT_HOME_BASELINE.cmd

Normal verification:
import -> parse-check -> GdUnit4 -> canonical bridge smoke -> bounded Godot smoke -> Stagehand structural smoke -> visual capture/diff

Visual policy:
- no baseline: deterministic 390x844 capture only
- baseline promotion requires explicit user approval
- committed baseline: automatic Stagehand screenshot diff
- never refresh baseline just to make a regression green

Current proof state:
- repository integration audited statically
- JSON scenario files parse successfully
- Stagehand addon vendored completely
- autoload/version/checksum wiring present
- local Windows/Godot execution NOT YET PROVEN

Do not call this toolchain PASS until VERIFY_GODOT_LOCAL.cmd succeeds on the user's Godot 4.7.2 machine.
