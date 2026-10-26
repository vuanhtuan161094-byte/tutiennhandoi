# R7 V2 — Open Game Production

**Date:** 2026-10-26 · **Repository:** [tutiennhandoi](https://github.com/vuanhtuan161094-byte/tutiennhandoi)  
**Starting remote main:** `b2d3a9eba121aa2b87debcc72a36a76dc39f9579`  
**Tested local source:** `4288063181586441947519305f5b3818d60469ba` · **tree:** `8bfb92459a03bdb710c7791f6599b3087c9e67f9`  
**Remote code commits:** `4f6712726c5f20de766df6999447cbd9c9b71618`, `6c581878e839a707d1943db4868d0b85a57375db`, `0f3e0d12f45249afc8388196f6b2d7e5dde0414b`.  
**State:** active production work; art is a candidate, not owner-approved/locked.

## Milestone

- Added original U Minh Xà Boss artwork, a 1254×1254 RGBA PNG, mapped only to canonical `serpent` Boss encounters behind the QA candidate flag.
- Fixed the read-only prefight preview to use the same next canonical enemy selection seed as the actual fight. Prefight and playback now agree on U Minh Xà. Actual fight result hash remained unchanged.
- Kept the generated Wood Guardian unmapped because it does not match this serpent encounter.
- Inspected real Godot 4.7.2 prefight/playback frames at 390×844 in an isolated checkout. Frames stay local because they include WIP player art with unclear redistribution rights.

## What this does not claim

No new skeletal animation, audio, ultimate VFX, Android/device QA, full player progression loop, seven other Dao visual kits, or production art approval. The source art remains a static PNG with prompt/provenance note but no layered paint file.

## Evidence and current playability

Full verifier on exact tested tree: PASS. GdUnit 93/93; canonical bridge smoke; isolated endgame Boss fixture smoke; bounded smoke; Stagehand Home 50/50, Combat 28/28, Home capture 9/9, Combat capture 20/20; screenshot pixel check PASS. See [gates](GATES_AND_HANDOFF.md), [runtime evidence](RUNTIME_VISUAL_EVIDENCE_INDEX.md), [gameplay loop](REAL_GAMEPLAY_LOOP_QA.md).

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