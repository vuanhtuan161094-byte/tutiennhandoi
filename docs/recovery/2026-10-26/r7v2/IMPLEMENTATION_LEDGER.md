# Implementation ledger

## Remote code milestones

| Remote main SHA | Tree SHA | Change | Evidence |
|---|---|---|---|
| `4f6712726c5f20de766df6999447cbd9c9b71618` | `a519d3147f7e99cbbffa1c91b5ae27fcc9375f87` | Original Boss candidate/hit feedback (initial Wood Guardian candidate). | Full gate on equivalent local tree; not owner-approved. |
| `6c581878e839a707d1943db4868d0b85a57375db` | `a66073079390ca7486e47297ff965579d2d61b32` | Fix prefight Boss preview to match the next canonical encounter; add contract guard. | Node contract 7/7; fight hash stayed `7865a49ac6db07f1855541a3b0998f6f7fbef37cf0665e812a4e502fc2ed4880`. |
| `0f3e0d12f45249afc8388196f6b2d7e5dde0414b` | `8bfb92459a03bdb710c7791f6599b3087c9e67f9` | Add original U Minh Xà PNG; map exact `serpent` only; mark Wood Guardian unmapped. | Full verifier on local source `4288063181586441947519305f5b3818d60469ba`; exact tree match. |

All three remote changes used current-head checks and expected-SHA fast-forward ref updates with `force=false`.

## Changed paths across code slice

- `dist/core/session.js`: read-only preview uses upcoming Boss seed.
- `qa/fixtures/combat-visual-metadata-baseline.json`, `qa/tests/combat-visual-metadata-contract-test.js`: baseline result hash and preview identity contract.
- `godot/art/candidate_r7v2/um_minh_xa/{README.md,um_minh_xa_boss.png}`: original candidate/provenance.
- `godot/art/candidate_r7v2/wood_guardian/README.md`: unmapped status.
- `godot/scripts/combat/combat_actor_placeholder.gd`, `godot/tests/unit/combat_view_model_test.gd`: archetype gate and test.

No combat coefficients, canonical outcomes/rewards, save schema, or offline settlement were changed in follow-up commits. The initial P1 commit was also limited to presentation and its test. Rollback: disable `TUTIEN_R7V2_BOSS_ART_CANDIDATE`; a later rollback should be a normal forward revert, never a force push.