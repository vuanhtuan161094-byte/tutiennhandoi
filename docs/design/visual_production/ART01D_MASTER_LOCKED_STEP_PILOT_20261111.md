# ART-01D — Pixel-locked master and anchored footstep pilot

Date: 2026-11-11
Repo: `vuanhtuan161094-byte/tutiennhandoi`
Head observed before documentation: `d8fc731a7f5447911d9498d69dd5f282558a9cd6`
Status: **CANDIDATE / TECHNICAL STEP STUDY ONLY / NOT A COMPLETE CAST / NOT APPROVED**

## Decision based on actual images

Two AI generations attempted during this slice reverted to an unrelated **chibi/UI presentation poster** rather than editing the exact original full-body heroine. Those images were rejected immediately. **Do not reuse poster art as source assets, do not claim their fake 16/24 frames or technical labels represent real Godot sprites.**

Instead, a deterministic, code-reproducible *local mesh-warp* test was built using one single existing 1086×1448 edited master (`ngự_khí_đạo_fantasy_heroine_cutout.png`). The original user-approved image `image(7).png` remains the identity authority. **Important: the edited source master's face is similar but not identical to that original; the test preserves its pixels across output frames, not their parity with the approved original.**

## Deliverable in current conversation

ZIP: `TND_ART01D_MASTER_LOCK_STEP_PILOT.zip` (35,327,108 bytes)
SHA-256: `41cff653741916db31b38cbcf59dcc003fc2baa0e2bc1ca9af202e81e3ad4d65`

Content:
- `unchanged_editable_master_source.png` (bit-identical to input edited master)
- `cleaned_master_candidate.png` alpha-edge hygiene candidate (non-destructive, original untouched)
- **21** 1086×1448 RGBA rendered source frames, all on the **same canvas**
- actual source-rendered 390×844 GIFs on dark/light backgrounds (**1.68 seconds** each), plus anchor diagnostic GIF
- five-stage dark/light contact sheets
- `build_art01d_anchor_motion.py` reproducible code + `QA_REPORT.json`
- separate Godot source-only candidate `qa_step_stage.tscn`, `qa_step_stage.gd`, `step_spriteframes.tres` and PNG frame resources under `godot_drop_in/art/candidate_r7v2/visual_production/art01d_master_lock/`.

Motion stages: ready → weight shift → limited left shoe lift → limited left shoe plant → settle. Not an authored hand seal. Anchor source support right heel `(674,1350)`; screen anchor `(225,748)`; fixed `0.455` scale, fixed 390×844 viewport, no per-frame cropping/recenter.

## QA actually run

- Source image identity by SHA-256 preserved; 21 PNGs render as 1086×1448 RGBA.
- **Exact facial pixel lock across 21 cels: max absolute channel difference 0** in designated source-space ROI (340,80,710,310); this does not prove fidelity to the approved original portrait.
- **Planted shoe texture-tracking drift <= 1 original-source pixel** across 21 frames; it is a practical measure, not a claim of zero true anatomical movement.
- Original asset ZIP CRC clean.
- GIFs decoded as 21 frames, 390×844, 1.68s duration.
- Manual check of five-frame dark/light contact sheet + zoomed shoes showed some true local foot motion but at actual mobile size it is **too subtle to accept as complete combat stepping**.
- Red/purple edge halos may remain in semi-transparent hair/fabric; artist masking work still open.
- **Godot 4.7.2 not installed in current tool environment; no Godot import/parser/runtime/Stagehand test.**
- No changes to canonical JS combat/gameplay, SaveService, production art or Godot game source.

## Next hard gates

1. Exact face/costume master: compare against actual user-provided 11-Nov original, use localized retouch rather than regenerating head/body; do not promote any near-lookalike as identical.
2. Draw actual coherent 3-keypose **stand → step → hand seal** at high resolution with repaired hidden torso/arm/leg pixels. This limited mesh warp is not a substitute for connected anatomical keyposes.
3. Confirm realistic foot planting and head/shoulder/waist continuity with actual full-size light/dark GIF playback, no ghost hands, no skirt tearing.
4. Only when the three keyposes are visually accepted, author inbetweens and assemble a full nonlooping Cast. Keep 3 treasures/VFX separate and event-cued.
5. Run Godot 4.7.2 import, parse, `KIEM_TRA_GAME.cmd`, screenshot/video 390×844; user explicitly approves before asset promotion.

This file documents a **standalone conversation-delivered package only**. The actual binary PNGs are **not present on GitHub main** until physically installed; no code integration or runtime pass is claimed.
