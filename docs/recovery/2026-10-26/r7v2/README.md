# R7 V2 — Open Game Production

**Date:** 2026-10-26 · **Repository:** [tutiennhandoi](https://github.com/vuanhtuan161094-byte/tutiennhandoi)

**Starting remote main:** `b2d3a9eba121aa2b87debcc72a36a76dc39f9579`

**Remote docs checkpoint before the original R7 V2 code work:** `353c1c2863eeed47b0b5cd198a32e1b57a85aae0` · **tree:** `37e4a4ce3678e94b843ec2736bbf27a2bc1d74cc`

**Tested local source:** `4288063181586441947519305f5b3818d60469ba` · **tree:** `8bfb92459a03bdb710c7791f6599b3087c9e67f9`

**Remote R7 V2 code/art commits:** `4f6712726c5f20de766df6999447cbd9c9b71618`, `6c581878e839a707d1943db4868d0b85a57375db`, `0f3e0d12f45249afc8388196f6b2d7e5dde0414b`, `3df9eba5a0966b73c3b20c53c90fa2e39488410e`, `7d4ed24971c08fddd67575da316a3450adcc6bf1`, `a83eb7daf9251583d6edac0328a40a576ca2e7ce`; docs-only follow-ups `bbf2565fec54aa841292c194390f6a748e90e0b1` and this report refresh.
**State:** active production work; art is a candidate, not owner-approved/locked.

## Latest verified source slice — readable HUD for all eight Dao

- Source commit `a83eb7daf9251583d6edac0328a40a576ca2e7ce` (tree `fe8f2c38297be9ab67df3769f07df66838d471a0`, parent `7460c1d9716868ec03cc3fd74807838e551e6909`) adds a compact, Dao-colored primary resource display: discrete segments for small caps and a full-width, tinted track for larger pools. Secondary meters, active flags, tooltips, and resource-change feedback use the canonical DTO. “Thần Niệm” is abbreviated in the narrow title; its tooltip retains the full Dao name.
- A QA-only bridge fixture and F11 route now create each Dao through canonical realm/specialization/skill/loadout APIs in a disposable save. Actual Godot 4.7.2 captures cover the eight canonical pre-fight projections at 390×844; all 51 Stagehand steps passed and pixel validation passed 8/8. Images and hashes are listed in the [runtime evidence index](RUNTIME_VISUAL_EVIDENCE_INDEX.md); the screenshots stay local because existing player art rights are unresolved.
- Before/after in this slice refers to the HUD: before, only Ngự Khí had a dedicated resource treatment; after, each Dao has a colored title, canonical primary value, and a visible segmented or continuous meter. The previous state is established from the source diff; no paired baseline screenshot was captured. This does not verify Dao attack motion, launch/impact effects, an Auto toggle, physical Android, or owner visual acceptance.
- Gates for this source: full GdUnit 99/99; canonical and P2 bridge smoke PASS; all eight QA bridge fixture projections PASS; project-context parse PASS; Stagehand 51/51; screenshot pixel validation 8/8. The broader local verifier remains incomplete: its Home Stagehand scenario previously failed 42/43 on `CombatAction.disabled` (expected `true`, observed `false`); that state was not changed or re-labeled as passing here.
- No combat coefficients, authority, rewards, save schema, production asset files, or real saves changed. The HUD source slice is partial R5; event-specific combat feedback for each Dao and the full game loop remain open.

## Latest verified source slice — Boss danger telegraph

- Source commit `69a49c6b8add53f8e363717e312656c4ae07bf59` (tree `fce587e869992575a957f9608a9dab6e2fa9faaf`, parent `4e7b3c12ec435445924227ce2d0716f5c26825f3`) adds an event-timed target marker for canonical Boss casts and a severity label/progress lane. It consumes the backend's adjusted cast time and Boss danger metadata; ordinary enemy casts are not marked.
- **Before / after:** the source baseline showed enemy cast name/progress in the tactical lane but no danger marker anchored to the player target. The new runtime shows the severity ring at the player, advances it across the canonical cast interval, and clears it at completion. This changes player feedback only; hit resolution and outcome were not retuned. The before state is established from the source diff; this milestone did not capture a baseline screenshot.
- Focused GdUnit passed 15/15; the event projection assertion, GDScript parse checks, bounded headless runtime smoke, and actual Godot 4.7.2 Stagehand capture passed. Stagehand completed 15/15 and screenshot pixel validation passed 3/3. See [gates](GATES_AND_HANDOFF.md) and [runtime evidence](RUNTIME_VISUAL_EVIDENCE_INDEX.md).
- This is a narrow **R5 partial**. It changes presentation only; no combat coefficients, authority, rewards, or save schema changed. The eight-Dao combat slice and the full production gate remain open.
- A separate `Verify-GodotLocal.ps1 -SkipVisual` run imported the project but was blocked when Godot could not write the user's roaming editor settings. This source SHA is therefore not reported as passing that full verifier.
- The Boss telegraph source commit is `69a49c6b8add53f8e363717e312656c4ae07bf59`. The R2 asset-intake metadata handoff is commit `55ee96e07a1c95588aede668ee1e5b03f8ec3c18`, parent `2cc401cb18a42bfc93c46c61d390112970598c6a`.

## R2 asset preservation and import — local WIP remains unapproved

- Preserved the E: candidate pack byte-for-byte to `C:\Users\Admin\Documents\Codex\TND_R7V2_ASSET_RECOVERY_20261026\candidate-originals\`; all 34 files matched SHA-256 after copy. The source E: tree was not modified.
- Current snapshot: 11 Ngự Khí action groups, 34 files, 41,905,320 B. The previous report's 41,916,400 B is 11,080 B higher and remains unreconciled.
- Isolated Godot 4.7.2 import passed all 11 SpriteFrames resources and their atlas sizes, frame rectangles/counts, sidecar sample order, FPS, loop and RGBA8 alpha. The 10 unique referenced source-video files were not found in the inspected E: project tree; rights, character mapping and source order are unverified. The pack was not integrated into the game or uploaded.
- See the [per-file SHA inventory](ASSET_CANDIDATE_SHA256_20261026.csv), [11-action clip index](NGUKHI_WIP_CLIP_INDEX_20261026.csv), and [asset provenance record](ASSET_RIGHTS_AND_PROVENANCE.md).

## R4 Character screen runtime review — partial

- The real Character route was opened in Godot 4.7.2 at 390×844 against a fresh disposable QA bridge. The Stagehand capture now waits for `CharacterStatus` to show canonical equipment guidance before taking the frame; the DTO arrived 1.37 s after navigation. The revised scenario passed 6/6.
- The first fixed-delay capture showed the loading text with placeholder stats. The evidence-backed correction is to wait for DTO bind; no production UI/gameplay code changed. In the loaded frame, labels/slots remain in the viewport and the character art does not cover the stat/action controls. The art is existing WIP, so the image stays local pending distribution rights.
- This is a desktop Godot runtime capture at a mobile-sized viewport, not physical Android QA. Other Home/Character/Combat states and art approval remain open. See the [runtime evidence index](RUNTIME_VISUAL_EVIDENCE_INDEX.md).

## Milestone

- Added original U Minh Xà Boss artwork, a 1254×1254 RGBA PNG, mapped only to canonical `serpent` Boss encounters behind the QA candidate flag.
- Fixed the read-only prefight preview to use the same next canonical enemy selection seed as the actual fight. Prefight and playback now agree on U Minh Xà. Actual fight result hash remained unchanged.
- Kept the generated Wood Guardian unmapped because it does not match this serpent encounter.
- Inspected real Godot 4.7.2 prefight/playback frames at 390×844 in an isolated checkout. Frames stay local because they include WIP player art with unclear redistribution rights.
- Added 10 original Ngự Khí skill-symbol SVG candidates in `godot/art/candidate_r7v2/ngukhi_icons/`; exact `skill.dao.artifact.*` mappings are opt-in via `TUTIEN_R7V2_NGUKHI_ICON_CANDIDATE=1`. The 390×844 candidate runtime capture passed Stagehand 20/20 and pixel validation. These are vector skill icons, not character/weapon artwork or authored animation; see the [icon manifest](../../../../godot/art/candidate_r7v2/ngukhi_icons/SHA256SUMS.csv).
- Full local verifier on the code baseline plus the candidate mapping test: PASS, GdUnit 94/94; the full verifier ran with the icon candidate flag off, then a separate candidate-flag-on runtime capture passed 20/20. Screenshots remain local-only because they show player art with unresolved redistribution rights.

## New verified slice — Vô Diện Yêu and result clarity

- Generated an original 1060×1484 RGBA Vô Diện Yêu Boss illustration; SHA-256 `5D4DD1DB4BD563393EB6B51AB1AB9ADB71F4FFF53F102671E242A702957ACF13`. It is mapped only to the exact `demon` archetype behind `TUTIEN_R7V2_BOSS_ART_CANDIDATE=1`; it is a static, unapproved candidate with no layered paint source.
- Moved the end-of-battle result into a compact lower-right panel so it stays outside the player/Boss silhouettes on portrait layouts. A four-viewport unit assertion guards the safe area; no combat, authority, balance, or save code changed.
- The isolated canonical realm 114 / floor 21601 route completed through the result screen: Stagehand 21/21 and pixel validation PASS across three 390×844 captures. The observed result is **THẤT BẠI**; the outcome was not forced.
- Full local verifier after the UI change: PASS — GdUnit 94/94, bridge and P2 fixture smoke, bounded smoke, Stagehand Home 50/50, Combat 28/28, Home capture 9/9, Combat capture 20/20, pixel gate PASS. Separate endgame capture has its own report and screenshots; captures remain local-only because they include existing player art with unresolved redistribution rights.
- See the [Vô Diện image and manifest](../../../../godot/art/candidate_r7v2/vo_dien_yeu/README.md), [endgame runtime evidence](RUNTIME_VISUAL_EVIDENCE_INDEX.md), and [gate record](GATES_AND_HANDOFF.md).
- **Published milestone:** `7d4ed24971c08fddd67575da316a3450adcc6bf1` is verified on remote `main`; tree `7e23fdd9bbb0741aa62cbceb5cb5f8a8047e0f6f`. This report refresh records that exact SHA and the evidence index.

## What this does not claim

No authored skeletal character animation, audio, ultimate VFX, Android/device QA, full player progression loop, seven other Dao attack/VFX kits, or production art approval. Both Boss illustrations are static PNG candidates; the new Vô Diện image has no layered paint file. Ngự Khí icon art is an opt-in candidate, not a replacement for missing character or weapon artwork. Short gameplay segments from Warm Snow (30:51–31:07) and AFK Journey (15:15–15:18) were visually inspected; the brief samples do not establish full attack timing or audio behavior. Other reference entries remain listing/screenshot evidence only.

## Evidence and current playability

The earlier Vô Diện/result UI source (`7d4ed24971c08fddd67575da316a3450adcc6bf1`) passed its full local verifier: GdUnit 94/94, bridge/P2/bounded smoke, Home 50/50, Combat 28/28, Home capture 9/9, Combat capture 20/20 and screenshot pixel validation. Those results apply to that source state.

The latest R5 HUD source (`a83eb7daf9251583d6edac0328a40a576ca2e7ce`) passed full GdUnit 99/99, canonical bridge smoke, P2 fixture smoke, eight canonical Dao QA DTOs, project-context parse exit 0, actual Godot 4.7.2 Stagehand 51/51 and screenshot pixel validation 8/8. The wider `Verify-GodotLocal.ps1` run is not complete for this source state: its Home Stagehand scenario failed 42/43 at the `CombatAction.disabled` expectation. R5 screenshots remain local-only because existing player art rights are unresolved. The capture proves eight prefight HUD projections only; it does not prove eight distinct attacks or completion of the player progression loop. See [gates](GATES_AND_HANDOFF.md), [runtime evidence](RUNTIME_VISUAL_EVIDENCE_INDEX.md), [gameplay loop](REAL_GAMEPLAY_LOOP_QA.md).

## Documents

- [Reference games matrix](REFERENCE_GAMES_MATRIX.md)
- [Visual art direction](VISUAL_ART_DIRECTION.md)
- [Implementation ledger](IMPLEMENTATION_LEDGER.md)
- [Combat and 8 Dao](COMBAT_8_DAO_PLAYABLE_MATRIX.md)
- [Real gameplay loop QA](REAL_GAMEPLAY_LOOP_QA.md)
- [Asset rights and provenance](ASSET_RIGHTS_AND_PROVENANCE.md)
- [Runtime visual evidence](RUNTIME_VISUAL_EVIDENCE_INDEX.md)
- [Product backlog](PRODUCT_BACKLOG_NEXT.md)
- [Gates and handoff](GATES_AND_HANDOFF.md)

Core Balance and auxiliary rework remain inactive.
