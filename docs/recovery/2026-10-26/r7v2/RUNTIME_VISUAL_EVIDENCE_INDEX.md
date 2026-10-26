# Runtime visual evidence index

Classification: **genuine Godot captures, local-only**. They were not composited or reconstructed. They include player art with unknown public redistribution rights.

| Evidence | Absolute local path | Size/dimensions | SHA-256 | Classification |
|---|---|---|---|---|
| Prefight | `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\godot-tools\stagehand-combat-visual\screenshots\combat-prefight-390x844.png` | 190,673 B · 390×844 | `3186542D668ED3511716445E15BD5C62E6638D34CEDA59DA159B15330487CC49` | Canonical runtime; U Minh Xà art and label. |
| Playback | `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\godot-tools\stagehand-combat-visual\screenshots\combat-playback-390x844.png` | 159,872 B · 390×844 | `B3144BCA626E31F5B3712379C66932B0D41145A1D0FE08BA62648DE1F8C2567A` | Canonical playback; matching Boss, changed HP/event state. |
| Ngự Khí icon candidate — prefight | `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\godot-tools\stagehand-combat-visual-icon-candidate\screenshots\combat-prefight-390x844.png` | 196,343 B · 390×844 | `706F782599673926015E931B16C89227A637AAC130F96C0C783F2B62A2E3630E` | Genuine Godot runtime; Boss and icon candidates enabled. Local-only due player-art distribution uncertainty. |
| Ngự Khí icon candidate — playback | `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\godot-tools\stagehand-combat-visual-icon-candidate\screenshots\combat-playback-390x844.png` | 164,878 B · 390×844 | `E85CAC87D4D71E390AE1A07DC782338D3CCB400A621EB4AAF2435EFF7F6B3FBF` | Genuine canonical playback frame; candidate HUD art enabled. Local-only due player-art distribution uncertainty. |
| Original art | [U Minh Xà candidate PNG](../../../../godot/art/candidate_r7v2/um_minh_xa/um_minh_xa_boss.png) | 2,339,497 B · 1254×1254 RGBA | `988BC0BFF96FE6B12CB7E7A5870C823E6808EF69C7DD28BD944CF3A33126CA8C` | GitHub asset; original candidate, not runtime screenshot. |
| Candidate icon manifest | [10 Ngự Khí SVGs + SHA-256](../../../../godot/art/candidate_r7v2/ngukhi_icons/SHA256SUMS.csv) | 10 files · 11,125 B SVG total | Per-file hashes in linked manifest | Original authored symbol artwork; GitHub asset, opt-in only. |

Stagehand report: `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\godot-tools\stagehand-combat-visual\report.json` (20 pass / 0 fail / 0 skipped). JUnit is adjacent at `...\stagehand-combat-visual\junit.xml`. Full verifier artifacts: `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\godot-tools`.

Candidate-flag-on Stagehand report: `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\godot-tools\stagehand-combat-visual-icon-candidate\report.json` (20 pass / 0 fail / 0 skipped); `pixel-validation.json` reports PASS for both frames. The full verifier was separately run with the icon flag off and its mapping test explicitly exercises both flag states.

A local path plus hash is an evidence record, not a URL or a remotely accessible file.
