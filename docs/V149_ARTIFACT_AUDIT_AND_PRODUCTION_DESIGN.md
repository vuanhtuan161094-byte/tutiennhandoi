# V149 — PHÁP BẢO AUDIT, PRODUCTION DESIGN & CLOSURE

**Status:** CLOSED / LOCKED  
**Date:** 2026-09-10  
**Base:** `feature/v148-confidant-rebuild` @ `69016cf5e9b8fe8623a478029d9abeb64be21a47`  
**Working branch:** `feature/v149-artifact-rebuild`  
**Implementation HEAD validated:** `d54139ba79cd4c94258f0e73ad6146a69c206873`  
**Canonical QA run:** `34449454949` — PASS  
**Main:** LOCKED / DO NOT MERGE unless explicitly requested.

## 1. Canonical authority

- Production artifact state remains `collectionV12316`.
- Equipped Pháp Bảo authority: `collectionV12316.activeArtifactIds`.
- Active Chí Bảo authority: `collectionV12316.economyV12325.activeRelicId`.
- `state.artifacts` is legacy world-relic/reincarnation history compatibility only; it cannot supply production combat power or overwrite the canonical loadout.
- Pháp Kỹ resolve as ordinary entity triggers inside the shared CombatEngine / CombatKernel V2. V149 introduces no second combat resolver.

## 2. Production roster

V149 preserves exactly 12 authored Pháp Bảo:

1. Trấn Linh Chung — phòng thủ / hộ chủ.
2. Dẫn Lôi Kính — setup Lôi Ấn / Bảo Khí.
3. Lôi Phạt Kiếm — lôi burst / finisher.
4. Phá Vọng Kính — anti-dodge / Phá Vọng.
5. Chấn Sơn Ấn — phá khiên / break.
6. Đoạn Huyết Hồ — anti-heal / DoT.
7. Tử Phủ Minh Đăng — Bảo Khí engine / sustain.
8. Kim Đan Hỏa Đỉnh — burn / ramp.
9. Tinh Lạc Kiếm Hạp — crit follow-up / multi-hit.
10. Dưỡng Hồn Liên — cleanse / sustain.
11. Nguyên Anh Phân Hồn Phiên — echo / follow-up.
12. Thanh Linh Hồ Lô — Chân Nguyên engine.

8 Chí Bảo adjacent giữ nguyên authority và progression cũ.

## 3. Progression contract

### Finite authored progression

- Slot Pháp Bảo: 0 / 2 / 3 / 4 theo realm-order canonical.
- Luyện Hóa: Lv1–100.
- Bảo Giai: I–V.
- Grade milestones/passive/Pháp Kỹ cũ được giữ nguyên.
- Luyện Bảo Các vẫn cho bounded cost discount.

### Bảo Hồn ∞

Điều kiện mở: **owned + Luyện Hóa 100 + Bảo Giai V**.

Bảo Hồn là integer rank không giới hạn, được lưu namespaced trên progress Pháp Bảo. Mỗi rank chỉ cộng raw additive theo profile riêng của món:

- Công Lực;
- Thể Phách;
- Phòng Ngự.

Bảo Hồn không tạo tăng vô hạn cho damage %, HP %, defense %, cooldown %, action speed %, Bảo Khí %, global multiplier hay các % khác.

Chỉ Pháp Bảo đang trang bị mới kích hoạt raw Bảo Hồn. Rank của món tháo ra vẫn được lưu nhưng không cộng combat stat.

Bảo Hồn dùng **Luyện Bảo Tinh Hoa** hiện có làm permanent sink. Không tạo currency/material mới. Specific fragment + Thiên Tinh Pháp Bảo vẫn là sink hữu hạn của Bảo Giai.

## 4. Bounded all-owned bonuses

Bảo Vận/Fortune giữ hard caps hiện hữu:

- Artifact power <= 12%.
- Bảo Khí gain <= 10%.
- Cooldown recovery <= 6%.
- Chí Bảo power <= 8%.

Bảo Hồn rank không tạo Fortune point mới và không làm các cap trên tăng.

## 5. Pháp Bảo tham gia combat

V149 khóa Pháp Bảo là **combat-active system**, không phải stat-only:

- Pháp Kỹ thật được inject vào CombatEntity.
- Trigger phản ứng với event combat thật như OnHit, OnCrit, OnDamageTaken, OnEnemyHeal, OnShieldBreak, OnTargetDodge.
- Bảo Khí là resource combat dùng chung và do shared CombatEngine xử lý.
- Presentation layer có Pháp Bảo call-in actor khi Pháp Kỹ/Chí Bảo kích hoạt; HUD hiển thị Bảo Khí, raw Bảo Hồn và combo readiness.
- V149 không tạo HP/target lifecycle riêng cho Pháp Bảo; cơ chế chiến đấu vẫn thuộc chủ thể người chơi và shared CombatKernel.

## 6. Combo contract — KHÔNG khóa theo bộ

Quy tắc canonical V149:

> Combo dựa trên **event / trạng thái / mark / resource**, không dựa trên việc hai Pháp Bảo có cùng bộ hay không.

Do đó Pháp Bảo khác nhóm vẫn combo nếu cơ chế khớp. `hardSetLock = false`; `sharedBaoQi = true`.

V149 định nghĩa interoperability role cho cả 12 Pháp Bảo. Hai cross-artifact mark combo trực tiếp đã live trong shared CombatEngine:

- **Dẫn Lôi Kính → Lôi Phạt Kiếm:** Dẫn Lôi Kính tạo `Lôi Ấn`; Lôi Phạt Kiếm tiêu tối đa 3 Lôi Ấn để gây bonus damage + break theo số tầng.
- **Phá Vọng Kính → Tinh Lạc Kiếm Hạp:** Phá Vọng Kính tạo `Phá Vọng`; Tinh Lạc Kiếm Hạp có thể tiêu 1 tầng để tăng follow-up damage.

Các Pháp Bảo reactive/engine khác tương tác chéo tự nhiên qua event chung: địch hồi máu, né, phá khiên, crit, thấp máu, OnHit, Bảo Khí, Chân Nguyên. Không có resolver combo thứ hai.

## 7. Read-model / UI authority cleanup

- `GameplayFacade.overview()` và `artifacts()` đọc canonical collection state.
- Player-facing artifact view không còn dùng legacy `state.artifacts.activeIds` làm production authority.
- Legacy world-relic history vẫn được bảo toàn cho save cũ.
- Economy DTO expose Bảo Hồn rank, raw provenance, next cost, combo metadata và explicit `percentageGrowth:false`.
- Combat HUD expose aggregate Bảo Hồn raw và matched combo marks.

## 8. Save safety

Migration V149 là additive + idempotent:

- save V88 cũ khởi tạo Bảo Hồn = 0;
- negative/non-finite rank clamp về 0;
- Lv/Giai/equip hiện có không đổi;
- item IDs và currencies cũ không đổi;
- legacy world-relic state còn đọc được nhưng không cấp production combat power.

## 9. V129 cross-build balance lock

Permanent test: `qa/tests/v149-artifact-v129-balance-test.js`.

Ba archetype canonical:

| Build | BASE | V88 | V149 | Artifact share final | Combo V149 increment |
|---|---:|---:|---:|---:|---:|
| Kiếm–Kim · thiên Công | 285,585 | 417,690 | 449,159 | 36.4% | +7.5% |
| Thể–Thổ · sinh tồn | 90,059 | 141,498 | 149,008 | 39.6% | +5.3% |
| Tâm–Thủy · khống chế | 145,867 | 293,755 | 323,651 | 54.9% | +10.2% |

Tổng gain so với không có Pháp Bảo có thể khác mạnh giữa các build vì V88 vốn tương tác khác với baseline DPS. V149 vì vậy khóa riêng phần power mới: combo increment phải <20% trên cùng package V88, artifact share final <60%, spread share <25pp. Gate hiện PASS.

## 10. Permanent QA

- `qa/tests/v149-artifact-core-test.js` — **24/24 PASS**.
- `qa/tests/v149-artifact-production-test.js` — **17/17 PASS**.
- `qa/tests/v149-artifact-combo-test.js` — **15/15 PASS**.
- `qa/tests/v149-artifact-v129-balance-test.js` — **PASS**.
- Backend fast — **15/15 PASS**.
- Frontend fast — **6/6 PASS**.
- Backend closure — **83/83 PASS**.
- Frontend closure — **20/20 PASS**.
- V140–V148 canonical regression steps in workflow — PASS.

Canonical QA evidence: GitHub Actions run `34449454949` on implementation HEAD `d54139ba79cd4c94258f0e73ad6146a69c206873`.

## 11. Closure decision

V149 is **CLOSED / LOCKED**. Do not reopen the system because older duplicate source/save fields still exist. Reopen only for a real regression or a new explicit gameplay request.
