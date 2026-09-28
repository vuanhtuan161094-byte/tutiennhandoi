# Thần Niệm Đạo — Skill Form / Thần Ấn Lock

Status: **M0.5 STRUCTURAL LOCK / M1 CORRECTNESS PENDING**

Workflow authority: `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`
Parent contract: `docs/runtime/MIND_DAO_PRODUCTION_CONTRACT_20260929.md`

This lock is intentionally structural. It does **not** authorize damage/control coefficient tuning or `closureReady:true`.

## 1. Production shape inherited from Kiếm / Quyền

Thần Niệm follows the same production package shape already proven by Kiếm and Quyền:

- 1 Basic;
- 8 realm-unlocked normal Active skills;
- 1 Ultimate;
- maximum 5 normal Active skills equipped at once; Basic and Ultimate remain separate slots;
- 8 V2 passives, one per Bản Đạo realm row;
- passive level cap 20;
- skill proficiency / Thuần thục tier cap 1000;
- canonical proficiency milestones: 100 / 250 / 500 / 750 / 1000 = Tiểu Thành / Đại Thành / Hóa Cảnh / Viên Mãn / Cực Ý.

Ten authored skills do **not** mean all eight normal Actives are equipped simultaneously.

## 2. Canonical skill-form sheet

| Skill | Slot | Form | Cost class | CD | Cast | Recovery | Thần Ấn role |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Linh Tê Niệm Châm | Basic | instant | zero | 0 | 0 | 1.10 | build +1 |
| Lạc Niệm Thành Ấn | Active | instant | low | 4 | 0 | 0.75 | build +2 |
| Phân Thần Truy Niệm | Active | instant | medium | 6 | 0 | 0.80 | build +2 |
| Nhiễu Thần Chỉ | Active | instant | medium | 7 | 0 | 0.80 | spend 1–3 |
| Tâm Kính Hộ Thức | Active | instant | medium | 9 | 0 | 0.85 | neutral / defense |
| Truy Hồn Niệm Ấn | Active | cast | low | 6 | 0.80 | 0.75 | build +1 |
| Bạo Ấn Phá Thức | Active | finisher | medium | 8 | 0.45 | 0.85 | spend all current, max 5 |
| Tịch Niệm Quan Tâm | Active | channel | medium | 10 | 0.40 | 0.90 | build up to +3 through completed channel progress |
| Vạn Niệm Phân Lưu | Active | deploy | high | 12 | 0.80 | 1.00 | build +2 on successful deploy resolution |
| Vạn Niệm Quy Nhất · Tịch Chiếu | Ultimate | finisher | zero / 100 Ultimate Gauge | 0 | 1.20 | 1.50 | spend all current, max 5 |

Cost classes keep the shared V117 standard: zero=0%, low=8%, medium=16%, high=28% of standard Chân Nguyên unless an authored override exists.

The form set is intentionally identity-driven. Thần Niệm is **not required** to contain Counter, Charge or Combo merely because Kiếm/Quyền use those forms. Counter remains a defining Quyền seam; forcing every form into every Dao would erase identity.

## 3. Thần Ấn authority

### 3.1 Storage and cap

- Thần Ấn is a **target-local short-cycle mark**.
- Ordinary hard cap: **5**.
- Marks never transfer when the player changes target.
- Builders clamp at 5; overcap does not bank hidden value.
- Thần Ấn is not Niệm Lực and is not `mindEchoCounter`.

### 3.2 Spend commit timing

Canonical rule, aligned with the committed-resource behavior used by production Kiếm/Quyền:

> Thần Ấn is consumed exactly once when the authored spender reaches its root-action **resolution/commit event**, before the resulting damage/control outcome is rolled.

Consequences:

- cancelled/interrupted before resolution -> spend 0;
- invalid/dead target before resolution -> spend 0 because the action never resolves against a valid target;
- once the spender resolves, Dodge / control resistance / boss reduction does **not** refund Thần Ấn;
- a spender may never consume the same marks again through Niệm Ảnh or any generated follow-up;
- Niệm Ảnh must replay only a sanitized post-spend packet and must never re-run `consumeMarkDamage` or `mindInterfere` spending.

This is deliberate: the resource pays for the committed attempt, not only for a successful CC roll. Otherwise players could repeatedly attempt control for free until it lands.

### 3.3 Per-skill spend rules

**Nhiễu Thần Chỉ**

- requires at least 1 Thần Ấn to be eligible as a tactical spender;
- at root resolution consumes `min(3, current Thần Ấn)`;
- 1/2/3 marks scale the bounded interference package;
- boss/control resistance reduces the result, never the committed cost;
- no hard-stun identity is granted by default.

**Bạo Ấn Phá Thức**

- requires at least 1 Thần Ấn;
- at root resolution consumes all current Thần Ấn, capped at 5;
- spent count is snapshotted once for damage/Break payoff;
- a miss after resolution still spends the committed marks;
- its Niệm Ảnh snapshot may contain sanitized damage/Break only, never a second Consume.

**Vạn Niệm Quy Nhất · Tịch Chiếu**

- Ultimate still requires the canonical 100 Ultimate Gauge but does **not** require Thần Ấn to be cast;
- at root resolution consumes all current Thần Ấn, capped at 5;
- zero marks keeps the authored base Ultimate packet; marks amplify the signature payoff;
- Ultimate is Tất Trúng, still subject to boss/control laws for any interference component;
- Ultimate neither enters the ordinary 3-Active Niệm Ảnh cadence nor creates a normal snapshot unless a later mastery explicitly authors a bounded post-Ultimate echo.

## 4. Build timing

Builders that resolve as ordinary root effects add their marks only once per root action:

- Basic +1;
- Lạc Niệm +2;
- Phân Thần +2;
- Truy Hồn +1;
- Vạn Niệm Phân Lưu +2 after successful Deploy resolution.

### Tịch Niệm Quan Tâm — required M1 correction

Current source places `+3 Thần Ấn` in the root `effects`, so all three marks are granted before the channel actually completes. That contradicts its authored text.

M1 must move this to channel-owned progress:

- total authored reward remains +3 at a full 5-hit channel;
- earned total at any point is `floor(3 * resolvedHits / totalHits)`;
- marks are granted only when that earned total increases;
- interruption keeps only already-earned marks and never grants the unfinished remainder;
- channel-end may finalize any remaining earned mark but may not duplicate marks already granted by ticks.

For the current 5-hit baseline this naturally awards the three marks at progress thresholds equivalent to hits 2, 4 and 5.

## 5. Auto-rotation contract

M1/M3 Auto must read the same resource that the spender actually consumes.

- `mindEchoCounter` is an internal Niệm Ảnh cadence counter and must **never** gate Bạo Ấn spending.
- Nhiễu priority may open when the target is casting/channeling **and** target Thần Ấn >=1.
- Bạo Ấn must gate on target Thần Ấn; threshold/tactical preference is tuned later, but never on echo cadence.
- Ultimate may use a mark-aware preferred window but must retain a bounded fallback so 100 Gauge cannot deadlock forever.

## 6. Progression lock

Every one of the ten Mind skills must keep an authored mastery row with exactly these five stages:

- 100 — Tiểu Thành
- 250 — Đại Thành
- 500 — Hóa Cảnh
- 750 — Viên Mãn
- 1000 — Cực Ý

The existing mastery text in `dist/content/mind-dao-v2.js` is candidate authored content. M1/M2 may correct semantics, but may not remove stages or create a sixth stage.

Eight V2 passives remain `passive.v2.mind.p1` ... `p8`, with runtime level cap 20. The older `passive.dao.mind.*` lane remains compatibility/content debt until M1 establishes the surviving authority; it must not become a second live passive progression family.

## 7. M1 acceptance before any tuning

Before five-stat coefficients or numerical balance are authored, tests must prove:

1. 10-skill / 8-passive / 5-active-slot structure;
2. exact form/slot/cost/cast/recovery metadata;
3. Thần Ấn cap 5 and target-local ownership;
4. Nhiễu/Bạo Ấn spend exactly once at root resolution;
5. pre-resolution interruption does not spend;
6. post-resolution miss/resist does not refund;
7. Observe partial-channel marks are progress-owned, not granted up front;
8. Niệm Ảnh cannot spend marks, recurse, or duplicate channel/deploy state;
9. Auto reads target Thần Ấn rather than `mindEchoCounter` for spend decisions;
10. all five mastery milestones remain present for all ten skills.

Only after these correctness gates pass does M2 five-stat migration begin.
