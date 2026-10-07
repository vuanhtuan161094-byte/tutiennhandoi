# Ngự Khí persistent artifact actors — 2026-10-07

Status: **GODOT TECHNICAL GATE PASS; VISUAL CANDIDATE — NOT APPROVED**.

Opening live `main`: `5b50227269fc5768944508379654c3e06e27d2a5`.
Exact tested runtime/test implementation: `4f78097d0cb55a95a69040abbc8391475c0b2e90`.
The subsequent evidence commit changes documentation only; it does not replace the tested runtime SHA.

## Audit and change

The old V3 renderer loaded large painted skill overlays and animated their scale/rotation/alpha alongside disposable procedural weapons. It conveyed a temporary effect rather than a group of artifacts controlled by the player. Runtime loading of those full painted overlays is now removed. Existing external V3 assets are retained as historical/concept material, not runtime authority.

The existing transport already supplies `artifactSourcesV2`, the projected `artifactMergeActive` flag (canonical backend `artifactMergeActiveV1`), and `combat.daoProjection` updates. No backend transport or gameplay extension was needed. The V1 Idle + ten skill animation registry and player actor are unchanged; no animation was regenerated and no canonical ID changed.

## Ownership and authority

| Component | Responsibility |
| --- | --- |
| `ArtifactActor` | Replaceable solid blade, octagonal mirror, talisman seal or crowned/winged Great Artifact silhouette; independent transform, facing, hover, arced motion and bounded nine-point trail. |
| `ArtifactActorGroup` | Three persistent source nodes plus one Great Artifact node, created once. Reconcile visible source count 0–3; responsive homes; select/command existing actors; converge and restore formations. |
| `ArtifactCombatDirector` | Route canonical events, coordinate skill beats and eight reusable transparent cosmetic echoes. Cancel stale choreography on interruption/topology changes. |
| `ArtifactCombatVfx` | Short contact helper only: small floor portal/ripple, sparks, impact flash, six fragments and expanding ring. No full-frame PNG, particle army or actor ownership. |
| `CombatScreen` | Bind DTO state and forward canonical presentation events to the director; retain existing V1 actor and damage feedback. |

`skill.cast.start` starts the retained player animation and artifact windup. `skill.travel` releases travel toward the actual enemy presentation target. `combat.damage` triggers impact/return and existing target feedback; shield/heal events trigger self presentation. `combat.resource` for `artifactSourcesV2` and `combat.daoProjection` reconcile topology. Enemy casts, unknown skills and unknown state fail safely. Battle boundaries and player interruption cancel motion.

Merge does not invent a six-second window. A brief 0.5s cosmetic convergence introduces a distinct Great Artifact, whose persistence depends on the projected real Merge flag. Flag exit restores the actual source count and clears pending Ultimate echoes. Ordinary unchanged topology updates do not restart actor motion. The test advances 100s without clearing an active Merge flag and verifies that the Great Artifact remains.

Motion settle budgets (normally 1.4s, Ultimate 2.3s) affect choreography only. They never alter resources, cooldown, damage, hit/miss or Merge lifetime. Echoes are smaller and transparent and are never counted as real sources. No local simulated hit or extra damage event is emitted.

## Exact ten skills

All IDs below use prefix `skill.dao.artifact.`; Idle uses the same persistent source formation between casts.

| Suffix / canonical name | Choreography |
| --- | --- |
| `basic` — Ngự Khí Linh Chỉ | One existing artifact winds back, launches on travel, impacts on actual damage, then returns on an arc. |
| `deploy` — Phân Khí Thành Binh | Upward summon motion with transparent echoes; authoritative resource update settles the new count. |
| `guard` — Huyền Kính Hộ Chủ | Mirror when available moves ahead of the player and faces the enemy; expanded defensive rim/ripple, then return. |
| `strike` — Phá Không Ngự Kích | One artifact charges and launches; actual impact retains heavy target flash/punch and arced return. |
| `sync` — Bách Khí Đồng Minh | Available real artifacts align and launch together with staggered visual motion. No extra hit authority. |
| `recall` — Quy Khí Hồi Nguyên | A real actor returns toward the body center and fades for absorption; remaining formation follows actual resource count. |
| `split` — Phân Quang Ngự Khí | Existing actors spread laterally with translucent separation echoes; count changes only from the transport. |
| `merge` — Hợp Khí Quy Nhất | Active sources converge; real flag introduces the persistent distinct Great Artifact. |
| `suppress` — Vạn Bảo Trấn Không | Real active artifacts form a sealing formation around the enemy; the Great Artifact takes the same command when merged. |
| `ultimate` — Chư Thiên Vạn Bảo Triều Tông | Still anticipation → pooled summon → coordinated facing → staggered volley on travel → actual impact cleanup/return. The Great Artifact leads while merged. |

## Verification at the implementation SHA

Windows Godot 4.7.2, native primary viewport 390×844. All final commands below exited 0.

| Check | Final result / evidence |
| --- | --- |
| Targeted GdUnit: persistent actors, contact helper, retained player actor | 15/15; `qa/output/artifact-persistent-unit-retry.log`. Final full gate includes these suites. |
| `KIEM_TRA_GAME.cmd` | PASS; 92/92 GdUnit, zero failures/errors/orphans; import/parse, bridge/P2 fixture and bounded smoke PASS. `qa/output/artifact-persistent-full-gate-proof.log`. |
| Stagehand runtime | Home 50/50; canonical Combat 28/28. |
| Native capture + exported pixel validation | Home 9/9; canonical Combat 20/20; screenshot pixels PASS. |
| Persistent-actor debug showcase | 23/23; seven inspected native PNGs; `qa/output/artifact-persistent-visual-proof.log`. |
| JS visual metadata/gameplay regression | `node qa/tests/combat-visual-metadata-contract-test.js`: 6/6, exact 480 generators / 12 V3 fights retain gameplay/RNG results. |
| Artifact locked-contract regressions | `node qa/tests/artifact-dao-transaction-test.js` and `node qa/tests/artifact-dao-production-parity-test.js`: PASS. |
| Protected source diff | No changes under `src`, `dist`, `godot/backend`, or V1 player actor/animation registry relative to opening HEAD. |
| Ordinary save preservation | SHA256 remains `7893E5CB59864CEC72CA5C9E5BBF712F8D161B9A5F9BB67F72D986BBC06826A7` for `godot/.runtime/godot-bridge-save.json`. Fixture runs use isolated saves. |

Earlier failed runs are not final proof: the Combat smoke used an obsolete nonempty Tactical Lane placeholder after the preceding HUD change, allowing route re-entry before canonical playback. It now requires `_combat_cursor > 0`. Native capture encountered HP timeouts; capture now waits for the pending canonical action to finish before Challenge and for a real playback cursor. The HP and pixel assertions remain strict. A separate synchronized native capture passed 20/20 before the final full gate. One targeted run passed assertions but crashed during native disposal with exit -1073741819; the unchanged retry exited 0. These results are recorded as failures/retries, not hidden as green runs.

## Actual runtime evidence and review

Canonical combat, not synthetic gameplay:

- `artifacts/godot-tools/stagehand-combat-visual/screenshots/combat-prefight-390x844.png`
- `artifacts/godot-tools/stagehand-combat-visual/screenshots/combat-playback-390x844.png`

Debug-only synthetic presentation fixtures, not gameplay/closure proof, in `qa/output/artifact-persistent-review-proof/screenshots/`:

- `artifact-idle-1-390x844.png`, `artifact-idle-2-390x844.png`, `artifact-idle-3-390x844.png`
- `artifact-guard-390x844.png`, `artifact-merge-390x844.png`
- `artifact-ultimate-390x844.png`, `artifact-merge-exit-390x844.png`

All nine PNGs were inspected after the final runtime commit. Distinct source silhouettes, Guard placement, persistent Great Artifact and clean echo removal at Merge exit are visible. Actor geometry tests cover 360, 390 and 430 widths; this task does not claim actual device performance or auxiliary viewport screenshot approval.

Run `XEM_TOAN_BO_NGUKHI.cmd` for manual review. In the showcase: `1/2/3` select explicit source fixtures, `M` merged fixture, `G` Guard, `U` Ultimate, `B` Basic; Space/Enter reviews Idle and all ten retained skill clips. Synthetic fixtures are restricted to debug code.

Reproduce the required Windows gate from repository root:

```powershell
$env:GODOT_BIN = 'E:\Godot_v4.7.2-stable_win64_console.exe'
.\KIEM_TRA_GAME.cmd
node qa/tests/combat-visual-metadata-contract-test.js
node qa/tests/artifact-dao-transaction-test.js
node qa/tests/artifact-dao-production-parity-test.js
```

Reproduce the separate showcase capture:

```powershell
$env:TUTIEN_GODOT_BRIDGE_SAVE = Join-Path (Get-Location) 'qa/output/artifact-showcase-disposable-save.json'
.\.tools\godot\stagehand\godot-stagehand.exe run godot/tests/stagehand/artifact_persistent_visual.json --out-dir qa/output/artifact-persistent-review-proof --godot-bin 'E:\Godot_v4.7.2-stable_win64_console.exe'
```

## Scope, checkout context and remaining debt

Backend damage/coefficient/cooldown/cast/recovery/CN/AI/RNG/resource/save/Hunt/topology/shared follow-up/Ultimate logic and balance of all eight Dao remain untouched. No new heavy dependency, camera shake, hitstop or audio pipeline was added. This is a narrow Ngự Khí presentation slice, not completion or closure of all GCombat-4 widgets.

The source changes are committed, but this checkout has pre-existing launcher/readme WIP and untracked installed candidate art (`godot/art/candidate/`, `v3_assets/`). They were preserved and excluded from these commits. Consequently this proof is **exact runtime SHA in the existing working tree, not exact-SHA FULL CLEAN**. No overall clean-checkout claim is made. Unit logic uses native fallback and does not require those optional binaries; the inspected V1 art appearance depends on the local installation and is not guaranteed by a fresh clone.

Remaining visual debt: native silhouettes/materials are replaceable candidate art; the user-approved V1 clips contain baked pink weapons/aura which can compete with the new source-count language; large V1 poses overlap the existing lower HUD region; motion/impact/layout calibration and mobile-device performance still need user review. Still images and state tests do not approve cinematic timing. No animation/art regeneration was attempted to disguise these limits.

**No VISUAL APPROVED, production-approved, CLOSED or LOCKED status is granted by this record. Explicit user visual acceptance remains outstanding.**

## File inventory

New runtime/test files:

- `godot/scripts/combat/artifact_actor.gd`
- `godot/scripts/combat/artifact_actor_group.gd`
- `godot/scripts/combat/artifact_combat_director.gd`
- `godot/tests/unit/artifact_persistent_actor_test.gd`
- `godot/tests/stagehand/artifact_persistent_visual.json`

Modified runtime/test files:

- `godot/scripts/combat/artifact_combat_vfx.gd`
- `godot/scripts/combat/combat_screen.gd`
- `godot/scripts/combat/combat_dao_widget.gd`
- `godot/scripts/debug/ngukhi_showcase.gd`
- `godot/tests/unit/artifact_combat_vfx_test.gd`
- `godot/tests/stagehand/combat_runtime_smoke.json`
- `godot/tests/stagehand/combat_visual_capture.json`

Documentation: this proof (new), `CURRENT_CHECKPOINT.md`, `docs/systems/combat-ui/MODULE.md`, and the historical V1/V3 candidate record `docs/ui/GODOT_COMBAT_NGU_KHI_ANIMATION_CANDIDATE_20261006.md`.
