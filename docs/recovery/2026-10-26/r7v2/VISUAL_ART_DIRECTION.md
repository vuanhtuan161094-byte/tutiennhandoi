# Visual art direction — R7 V2 working candidate

**Not owner-approved.** Source A remains the game baseline.

## Working direction

Jade/teal body, ivory underside/mist, restrained antique-gold details; a continuous serpent coil with readable head/eye direction at portrait scale; transparent RGBA and aspect-fit with no head/tail crop. Keep enemy, player, telegraph, projectile, hit result and HUD lanes distinct. Canonical cast/wind-up/hit events may drive presentation, but no invented combat timing or outcome.

The visually inspected Warm Snow screenshot suggests a contrast/negative-space test: player and Boss stay distinct while a bright impact focal cue is readable against a relatively clean arena. Its linked footage was unavailable, so no timing claim is made. Guigu Boss indexes suggest checking enemy-specific tells; AFK Journey mode docs/video metadata suggest making Boss variation and reward progress understandable. These are hypotheses only; no reference assets, code, effect shapes or UI were copied.

## Implemented candidate

A new original 1254×1254 RGBA U Minh Xà image is conditionally mapped only to Boss archetype `serpent`. Prefight preview now resolves the exact next enemy identity used by the canonical fight. New real Godot frames show matching “Thủ Tầng · U Minh Xà” in prefight/playback.

The Ngự Khí HUD has a separate original vector candidate set: 10 jade/ivory/gold skill symbols, exact-ID mapped behind an opt-in flag. At 390×844, the 44×44 active slots and 54×54 ultimate remain visually distinct in actual prefight/playback frames. This candidate changes only skill icon presentation; it does not add new character/weapon artwork, authored motion, or per-Dao combat effects. The icons are not approved/locked.

The isolated high-realm Boss fixture exposed a missing demon illustration, so a second original Vô Diện Yêu image was created and mapped only to archetype `demon` behind the same Boss candidate flag. Its ink-navy/plum robe, ivory mask, jade spectral ribbons, and restrained gold trim read as a different silhouette from the serpent. This is a static 1060×1484 PNG; no rig, animation, or layered paint file is included, and the art remains unapproved. The canonical encounter was captured at 390×844 through the defeat result.

That result capture also exposed the old centered result label crossing both actor silhouettes. The result now uses a compact framed panel in the lower-right open lane; four portrait viewport assertions verify that the panel remains on-screen and does not intersect either actor. The runtime screenshot confirms the intended placement on the 390×844 layout.

## Remaining gaps / iteration gate

The image is static with existing restrained presentation motion. There is no new skeletal rig, authored frame animation, hit-react, audio or ultimate climax. Editable layered paint source is unavailable. Runtime frames include WIP player art with unknown redistribution rights and remain local. Review silhouette, alpha fringe, scale, overlap, telegraph and impact at 390×844 and 1280×720; Android device QA separately. Owner approval is required before production lock or broadening the art direction.
