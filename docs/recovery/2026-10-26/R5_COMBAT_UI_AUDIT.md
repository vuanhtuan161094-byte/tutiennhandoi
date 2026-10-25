# R5 — Combat UI, 8 Đạo, feedback, telegraph và Auto

## Phép chiếu canonical

`godot/backend/combat_presentation.mjs::projectDaoForGodot` đọc projection từ Battle Dao runtime V2, không tính lại tài nguyên chiến đấu trong UI.

| Đạo | DTO meters | Flags / detail | Boundary |
|---|---|---|---|
| Kiếm | `swordQi`, `swordIntentV2` | — | Giới hạn lấy từ projection canonical |
| Quyền | `fistForce`, `fistPassiveStack` | `fistDomain` | Flag theo thời hạn runtime |
| Thể | `counterForce` | `bodyPerfect` | Ẩn `bodyPassiveStack` compatibility/Huyết Khí |
| Pháp | `lawWheel`, `spellPassiveStack` | `dienPhapReady`, `expectedForm` | Form/ready do projection sở hữu |
| Độc | `poisonSeedStage`, `poisonPassiveStack` | `poisonHeart` | Độc Chủng đánh dấu target-owned |
| Trận | `formationNurtureV2`, `formationIntegrityV2`, `formationPassiveStack` | `formationDeployed`, `formationGrandReady` | 2 flags canonical |
| Ngự Khí | `artifactSourcesV2`, `artifactPassiveStack` | `artifactMergeActive`, `mergedFrom` | `artifactSourcesV2` hiển thị ba ô ◆/◇ |
| Thần Niệm | `mindMarkCount`, `mindPassiveStack` | `mindFlow` | Thần Ấn target-owned; giữ mark khi projection resource khác đến |

Bridge smoke duyệt đủ 8 id, kiểm tra projection không mutate entity nguồn, meter nằm trong range, Body không trả meter cũ, và target ownership của Độc/Thần Niệm. Có kiểm tra thứ tự event khi Dao projection đi cùng `battle.end`.

## Combat feedback và Auto UX

- `CombatTacticalLane` ưu tiên Boss telegraph > cửa phản công/interrupt > break/phase > shield/Dao payoff; progress chỉ lấy từ `castTime` được export. Test Godot hiện có bao phủ priority/cast progress.
- `CombatSkillRail` trình bày 5 active, basic và ultimate từ combat DTO; cooldown, cast/channel state, readiness và gauge chỉ đổi khi event backend gửi. Slot không phải nút giả.
- Stagehand kiểm tra đủ 5 active của Ngự Khí, Challenge thật, event cursor và playback.
- `AUTO ON` hiện là label hiển thị cố định, vì Boss challenge dùng canonical AI rotation; DTO snapshot đang gán `auto.enabled=true`, không có toggle/action authoritative. Đây không phải tương tác Auto hoàn chỉnh. Không tự chế toggle hoặc suy ra Auto OFF; cần quyết định UX/API trước khi thực hiện.

## Follow-up

1. Làm rõ Auto nghĩa là “AI luân chuyển skill”, “Auto săn”, hay lựa chọn manual/auto trước khi đổi control.
2. Thêm runtime capture/fixture mỗi main Dao khi backend có setup canonical tương ứng; hiện mới có capture Ngự Khí.
3. Kiểm chứng boss prefight/playback identity theo encounter snapshot; không tự đổi tên từ visual evidence.
4. Giữ lane/player non-overlap gate trong 4 viewport portrait; mở rộng landscape/mobile sau khi có device QA.
