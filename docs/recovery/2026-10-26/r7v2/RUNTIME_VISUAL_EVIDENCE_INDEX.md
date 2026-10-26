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
| Vô Diện Yêu original art | [Candidate PNG](../../../../godot/art/candidate_r7v2/vo_dien_yeu/vo_dien_yeu_boss.png) · [SHA-256 manifest](../../../../godot/art/candidate_r7v2/vo_dien_yeu/SHA256SUMS.csv) | 2,547,816 B · 1060×1484 RGBA | `5D4DD1DB4BD563393EB6B51AB1AB9ADB71F4FFF53F102671E242A702957ACF13` | Original static art candidate, exact archetype `demon`, opt-in. |
| Endgame demon prefight | `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\r7v2-endgame-boss-result-ui\screenshots\combat-prefight-390x844.png` | 206,799 B · 390×844 | `953AF02CD58598D76992FDDF50FA52D56D23F4055E4ABDA42CBB2595A234A797` | Genuine Godot capture; candidate Boss image visible; local-only due player-art rights. |
| Endgame demon playback | `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\r7v2-endgame-boss-result-ui\screenshots\combat-playback-390x844.png` | 175,890 B · 390×844 | `F2DA1ACEBCB82E1633EAD95192E35A3D7C7FEB87948412F14E40DB23F3FAB59F` | Genuine canonical runtime frame; local-only due player-art rights. |
| Endgame demon result | `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\r7v2-endgame-boss-result-ui\screenshots\combat-endgame-result-390x844.png` | 210,278 B · 390×844 | `8CB91C5B227E272C4A303FDAAE612257E28F63A1B7CE6258F8285522CB0C647D` | Genuine result frame; displays canonical **THẤT BẠI** in the new lower-right panel; local-only due player-art rights. |

Stagehand report: `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\godot-tools\stagehand-combat-visual\report.json` (20 pass / 0 fail / 0 skipped). JUnit is adjacent at `...\stagehand-combat-visual\junit.xml`. Full verifier artifacts: `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\godot-tools`.

Candidate-flag-on Stagehand report: `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\godot-tools\stagehand-combat-visual-icon-candidate\report.json` (20 pass / 0 fail / 0 skipped); `pixel-validation.json` reports PASS for both frames. The full verifier was separately run with the icon flag off and its mapping test explicitly exercises both flag states.

A local path plus hash is an evidence record, not a URL or a remotely accessible file.

Endgame report: `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\r7v2-endgame-boss-result-ui\report.json` (21 pass / 0 fail / 0 skipped). `pixel-validation.json` reports PASS for all three frames. These screenshot files are not included in the GitHub commit; their absolute paths resolve only on this machine.

## Boss danger telegraph — source SHA `69a49c6b8add53f8e363717e312656c4ae07bf59`

These are actual Godot 4.7.2 Stagehand captures at 390×844 from the disposable canonical realm-114 Boss QA route. They include existing player art with unresolved redistribution rights, so the images remain local-only and are not GitHub URLs.

| Evidence | Absolute local path | Size/dimensions | SHA-256 | Classification |
|---|---|---|---|---|
| Boss danger telegraph active | `C:\Users\Admin\Documents\Codex\TND_R7V2_GAMEPLAY_20261026\artifacts\godot-tools\stagehand-r7v2-telegraph\screenshots\combat-boss-telegraph-active-390x844.png` | 66,943 B · 390×844 | `D0AA658A575F88E4C2E61E38732DEFD9A6681E5802C151447B5323C89F7DC424` | Genuine canonical runtime capture; local-only. |
| Telegraph cleared at cast completion | `C:\Users\Admin\Documents\Codex\TND_R7V2_GAMEPLAY_20261026\artifacts\godot-tools\stagehand-r7v2-telegraph\screenshots\combat-boss-telegraph-cleared-390x844.png` | 60,109 B · 390×844 | `CF6657DB4A89ACC1CBF358F10C4C4B7DCEDAC0CCD6BBA9E6376A0B7CCF1857D7` | Genuine canonical runtime capture after marker expiry; local-only. |
| Canonical endgame result | `C:\Users\Admin\Documents\Codex\TND_R7V2_GAMEPLAY_20261026\artifacts\godot-tools\stagehand-r7v2-telegraph\screenshots\combat-boss-telegraph-result-390x844.png` | 65,222 B · 390×844 | `9A6D3A823854298AF95C2BB9E1DAB7C72D50449332915D6E49C58A5A894D4BEB` | Genuine canonical runtime result capture; local-only. |

Stagehand report: `C:\Users\Admin\Documents\Codex\TND_R7V2_GAMEPLAY_20261026\artifacts\godot-tools\stagehand-r7v2-telegraph\report.json` (15 pass / 0 fail / 0 skipped; Godot 4.7.2 stable). `pixel-validation.json` reports valid 390×844 images for all three frames. The report, images, disposable QA save, and test logs are not uploaded; the local paths above do not resolve from GitHub.
