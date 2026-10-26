# R7 V2 — Open Game Production

**Date:** 2026-10-26 · **Repository:** [tutiennhandoi](https://github.com/vuanhtuan161094-byte/tutiennhandoi)

**Starting remote main:** `b2d3a9eba121aa2b87debcc72a36a76dc39f9579`

**Remote docs checkpoint before this slice:** `353c1c2863eeed47b0b5cd198a32e1b57a85aae0` · **tree:** `37e4a4ce3678e94b843ec2736bbf27a2bc1d74cc`

**Tested local source:** `4288063181586441947519305f5b3818d60469ba` · **tree:** `8bfb92459a03bdb710c7791f6599b3087c9e67f9`

**Remote code commits:** `4f6712726c5f20de766df6999447cbd9c9b71618`, `6c581878e839a707d1943db4868d0b85a57375db`, `0f3e0d12f45249afc8388196f6b2d7e5dde0414b`.
**State:** active production work; art is a candidate, not owner-approved/locked.

## Milestone

- Added original U Minh Xà Boss artwork, a 1254×1254 RGBA PNG, mapped only to canonical `serpent` Boss encounters behind the QA candidate flag.
- Fixed the read-only prefight preview to use the same next canonical enemy selection seed as the actual fight. Prefight and playback now agree on U Minh Xà. Actual fight result hash remained unchanged.
- Kept the generated Wood Guardian unmapped because it does not match this serpent encounter.
- Inspected real Godot 4.7.2 prefight/playback frames at 390×844 in an isolated checkout. Frames stay local because they include WIP player art with unclear redistribution rights.
- Added 10 original Ngự Khí skill-symbol SVG candidates in `godot/art/candidate_r7v2/ngukhi_icons/`; exact `skill.dao.artifact.*` mappings are opt-in via `TUTIEN_R7V2_NGUKHI_ICON_CANDIDATE=1`. The 390×844 candidate runtime capture passed Stagehand 20/20 and pixel validation. These are vector skill icons, not character/weapon artwork or authored animation; see the [icon manifest](../../../../godot/art/candidate_r7v2/ngukhi_icons/SHA256SUMS.csv).
- Full local verifier on the code baseline plus the candidate mapping test: PASS, GdUnit 94/94; the full verifier ran with the icon candidate flag off, then a separate candidate-flag-on runtime capture passed 20/20. Screenshots remain local-only because they show player art with unresolved redistribution rights.

## What this does not claim

No new skeletal animation, audio, ultimate VFX, Android/device QA, full player progression loop, seven other Dao visual kits, or production art approval. The Boss source art remains a static PNG with prompt/provenance note but no layered paint file. Ngự Khí icon art is an opt-in candidate, not a replacement for missing character or weapon artwork.

## Evidence and current playability

Full verifier on the isolated candidate worktree: PASS. GdUnit 94/94; canonical bridge smoke; isolated endgame Boss fixture smoke; bounded smoke; Stagehand Home 50/50, Combat 28/28, Home capture 9/9, Combat capture 20/20; screenshot pixel check PASS. A separate candidate-flag-on capture passed 20/20 and pixel validation. See [gates](GATES_AND_HANDOFF.md), [runtime evidence](RUNTIME_VISUAL_EVIDENCE_INDEX.md), [gameplay loop](REAL_GAMEPLAY_LOOP_QA.md).

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
