# Real gameplay loop QA

**Build:** Godot 4.7.2-stable official; isolated checkout; source SHA `4288063181586441947519305f5b3818d60469ba`. QA flags and disposable save were confined to the isolated environment. No real user save opened or modified.

| Segment | Actual run | Result | Not proven |
|---|---|---|---|
| Home | Stagehand runtime smoke and Home capture. | 50/50 runtime; 9/9 capture. | Physical mobile UX, real saved-account flow. |
| Cultivation/growth | No complete early/mid player progression. Endgame fixture initializes disposable realm state through canonical diagnostic route. | Player journey NOT RUN. | Breakthrough pacing, rewards, realm strength feel. |
| Character/preparation | Ngự Khí DTO/five active slots, prefight route. | PASS for tested screen/projection. | Other Dao/equipment and choice UX. |
| Hunt/Boss | P2 isolated fixture at realm order 114 / endless floor 21601; canonical Boss selection and Challenge. | PASS for diagnostic contract. | Normal-player reachability, balance, other Bosses. |
| Combat | Canonical events/playback; Boss label/art match; Stagehand Combat runtime 28/28 and visual capture 20/20. | PASS for scenario. | Both outcomes as separate forced cases, every Dao, mobile hardware, long-run/audio. |
| Result/aftermath | Fixture asserts battle-end/result fields and disposable aftermath still at realm 114. | PASS for fixture contract. | Player-facing reward clarity, claim/continue and next-step comprehension. |

Prefight capture: `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\godot-tools\stagehand-combat-visual\screenshots\combat-prefight-390x844.png`, SHA-256 `3186542D668ED3511716445E15BD5C62E6638D34CEDA59DA159B15330487CC49`.

Playback capture: `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026\artifacts\godot-tools\stagehand-combat-visual\screenshots\combat-playback-390x844.png`, SHA-256 `B3144BCA626E31F5B3712379C66932B0D41145A1D0FE08BA62648DE1F8C2567A`.

Both are genuine, pixel-validated 390×844 Godot captures. They stay local because player WIP art rights are unknown. Preview correction keeps actual result hash `7865a49ac6db07f1855541a3b0998f6f7fbef37cf0665e812a4e502fc2ed4880` unchanged.
