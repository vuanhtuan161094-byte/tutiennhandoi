# Implementation ledger

## Remote code milestones

| Remote main SHA | Tree SHA | Change | Evidence |
|---|---|---|---|
| `4f6712726c5f20de766df6999447cbd9c9b71618` | `a519d3147f7e99cbbffa1c91b5ae27fcc9375f87` | Original Boss candidate/hit feedback (initial Wood Guardian candidate). | Full gate on equivalent local tree; not owner-approved. |
| `6c581878e839a707d1943db4868d0b85a57375db` | `a66073079390ca7486e47297ff965579d2d61b32` | Fix prefight Boss preview to match the next canonical encounter; add contract guard. | Node contract 7/7; fight hash stayed `7865a49ac6db07f1855541a3b0998f6f7fbef37cf0665e812a4e502fc2ed4880`. |
| `0f3e0d12f45249afc8388196f6b2d7e5dde0414b` | `8bfb92459a03bdb710c7791f6599b3087c9e67f9` | Add original U Minh Xà PNG; map exact `serpent` only; mark Wood Guardian unmapped. | Full verifier on local source `4288063181586441947519305f5b3818d60469ba`; exact tree match. |
| `3df9eba5a0966b73c3b20c53c90fa2e39488410e` | `e93f07371c3f2c8f64677d9f7614213380564cbe` | Add 10 original, opt-in Ngự Khí skill-symbol SVG candidates, exact-ID HUD resolver, focused test, and updated evidence/report. | Full verifier 94/94 plus candidate-flag-on Stagehand capture 20/20 and pixel validation; candidate remains unapproved. |

## Ngự Khí icon candidate slice

- Added 10 original SVG skill symbols and an SHA-256/size manifest under `godot/art/candidate_r7v2/ngukhi_icons/`; exact skill IDs are mapped only while `TUTIEN_R7V2_NGUKHI_ICON_CANDIDATE=1` is set.
- `godot/scripts/combat/combat_skill_slot.gd` selects these icons for exact artifact skill IDs; fallback and approved art paths remain unchanged when the flag is off. `godot/tests/unit/combat_skill_candidate_icons_test.gd` checks gating, mapping, and non-Ngụ Khí fallback.
- Runtime evidence: actual 390×844 prefight/playback capture with both Boss and icon candidate flags enabled; Stagehand 20/20 and screenshot pixel validation PASS. Local-only images contain existing player art with unknown redistribution rights.
- Full isolated verifier passed with candidate flag off: GdUnit 94/94, canonical bridge/P2 fixture/bounded smoke, Home 50/50, Combat 28/28, Home capture 9/9, Combat capture 20/20, screenshot pixel gate PASS. No coefficients, canonical outcomes/rewards, save schema, or authority changed.

All three remote changes used current-head checks and expected-SHA fast-forward ref updates with `force=false`.

## Changed paths across code slice

- `dist/core/session.js`: read-only preview uses upcoming Boss seed.
- `qa/fixtures/combat-visual-metadata-baseline.json`, `qa/tests/combat-visual-metadata-contract-test.js`: baseline result hash and preview identity contract.
- `godot/art/candidate_r7v2/um_minh_xa/{README.md,um_minh_xa_boss.png}`: original candidate/provenance.
- `godot/art/candidate_r7v2/wood_guardian/README.md`: unmapped status.
- `godot/scripts/combat/combat_actor_placeholder.gd`, `godot/tests/unit/combat_view_model_test.gd`: archetype gate and test.
- `godot/art/candidate_r7v2/ngukhi_icons/*.svg`, `SHA256SUMS.csv`, `README.md`: original opt-in Ngự Khí skill-symbol candidates and manifest.
- `godot/scripts/combat/combat_skill_slot.gd`, `godot/tests/unit/combat_skill_candidate_icons_test.gd`: exact-ID candidate selection and candidate contract test.

No combat coefficients, canonical outcomes/rewards, save schema, or offline settlement were changed in follow-up commits. The initial P1 commit was also limited to presentation and its test. Rollback: disable `TUTIEN_R7V2_BOSS_ART_CANDIDATE`; a later rollback should be a normal forward revert, never a force push.
