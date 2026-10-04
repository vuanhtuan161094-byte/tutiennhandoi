# ĐỘC ĐẠO PRODUCTION REFERENCE — 2026-10-05

Status: READY preparation; not CLOSED/LOCKED. Runtime/source is authoritative.

## Ten skills

| Stable ID suffix | Name | Form / CN class | CD / Cast / Recovery (s) | Effects / channel | Five-stat family / baseline |
|---|---|---|---|---|---|
| basic | Tán Độc Chỉ | instant / zero | 0 / 0 / 1.05 | {"effects":[{"type":"damage","coefficient":0.75,"breakDamagePct":2},{"type":"addMark","mark":"Độc Tầng","stacks":1,"maxStacks":10}],"channel":null} | {"power":1.2} / 1.2 |
| bone | Hủ Cốt Tán | instant / low | 4 / 0 / 0.75 | {"effects":[{"type":"damage","coefficient":1.05,"breakDamagePct":3},{"type":"addMark","mark":"Độc Tầng","stacks":2,"maxStacks":10},{"type":"damageOverTime","coefficientPerTick":0.22,"ticks":4,"interval":1}],"channel":null} | {"power":1.2,"agility":1} / 2.2 |
| heart | Phệ Tâm Độc Ấn | cast / low | 6 / 0.8 / 0.75 | {"effects":[{"type":"damage","coefficient":1.2,"breakDamagePct":4},{"type":"addMark","mark":"Độc Tầng","stacks":1,"maxStacks":10},{"type":"damageOverTime","coefficientPerTick":0.28,"ticks":5,"interval":1}],"channel":null} | {"power":1.2,"sense":1.2} / 2.4 |
| insects | Vạn Trùng Thực Mạch | channel / medium | 8 / 0.4 / 0.9 | {"effects":[],"channel":{"duration":2.5,"baseHits":5,"effects":[{"type":"damage","coefficient":0.4,"breakDamagePct":2},{"type":"damageOverTime","coefficientPerTick":0.35,"ticks":5,"interval":1}]}} | {"power":1.2,"spirit":1.5} / 2.7 |
| mist | Độc Vụ Mê Thiên | deploy / medium | 10 / 0.6 / 0.9 | {"effects":[{"type":"addMark","mark":"Độc Tầng","stacks":2,"maxStacks":10},{"type":"damageOverTime","coefficientPerTick":1.03,"ticks":6,"interval":1}],"channel":null} | {"power":1.2,"sense":1.3,"agility":1.3} / 3.8 |
| transform | Chuyển Độc Hóa Kình | instant / low | 7 / 0 / 0.8 | {"effects":[{"type":"consumeMarkDamage","mark":"Độc Tầng","baseCoefficient":0.8,"coefficientPerStack":0.42,"maxConsume":2,"breakDamagePctPerStack":0}],"channel":null} | {"power":1.2,"agility":1.2} / 2.4 |
| guard | Nghịch Độc Hộ Mệnh | instant / medium | 10 / 0 / 0.85 | {"effects":[{"type":"shield","capacity":150,"stability":100,"duration":4}],"channel":null} | {"body":1.2} / 1.2 |
| consume | Phệ Độc Quy Nguyên | finisher / medium | 8 / 0.4 / 0.85 | {"effects":[{"type":"consumeMarkDamage","mark":"Độc Tầng","baseCoefficient":1.05,"coefficientPerStack":0.9,"maxConsume":4,"breakDamagePctPerStack":0}],"channel":null} | {"power":1.6,"sense":1.2} / 2.8 |
| calamity | Tam Sinh Độc Kiếp | cast / high | 12 / 1.4 / 1 | {"effects":[{"type":"damage","coefficient":1.4,"breakDamagePct":4},{"type":"addMark","mark":"Độc Tầng","stacks":2,"maxStacks":4},{"type":"damageOverTime","coefficientPerTick":0.32,"ticks":5,"interval":1}],"channel":null} | {"power":1.2,"spirit":1.5} / 2.7 |
| ultimate | Cửu U Vạn Độc Phệ Sinh | finisher / zero | 0 / 1.2 / 1.5 | {"effects":[{"type":"consumeMarkDamage","mark":"Độc Tầng","baseCoefficient":2.2,"coefficientPerStack":1.1,"maxConsume":4,"breakDamagePctPerStack":0}],"channel":null} | {"power":1.6,"sense":1.2} / 2.8 |

Stable prefix `skill.dao.poison.`. CN classes 0/8/16/28% CN Standard before canonical Practice and local mastery. Ultimate uses 100 Gauge, zero CN and canonical unavoidable damage. Basic/Actives use canonical Accuracy/Dodge. Channel resolves five authored ticks (canonical action-speed hit materialization), no per-tick stage. Targeted packets require a landed root; Mist deploy is the explicit field exception.

Main stage gains: Basic1, Bone2, Heart1, Mist2, Calamity2; Insects completed channel2. No ordinary root 0→4, including mastery. Full Consume/Ultimate snapshots and consumes ≤4 stages on canonical hit, ×1.5 only at Công Tâm, retains1. Transform ≤2, no ×1.5; per-stage cash-out below full payoff. P7 adds its explicit high-stack quality independently. Guard capacity uses authored TP power/100 before shared shield caps.

Poison packets snapshot effective five-stat power and coefficient, and read exact-bound live stage ×(1+0.08×stage). Base packets once/root, ≤12 ticks. Basic1000 each third landed Basic root: .20 coefficient,3 base ticks. Insects first landed channel tick: .35 coefficient,5 base ticks, retained on interruption; full completion1000: one additional .12 coefficient,8 base-tick packet. Mastery adds one finite tick to ordinary packets (Mist adds2), p4 adds at most1; all cap12. No tick rerolls Dodge, creates stage, generates Độc Tức, gains Gauge or generates a follow-up. Old-target packets finish without stage from another bound target.

## Eight passives

| ID | Name | Lv1 | Lv20 | Secondary |
|---|---|---|---|---|
| passive.v2.poison.p1 | Độc Tức Quyết | Không generic damage/Xuyên. | Không generic damage/Xuyên. | eligible stack / actual DoT only |
| passive.v2.poison.p2 | Dưỡng Độc Chân Kinh | 8% xác suất. | 25% xác suất. | eligible stack / actual DoT only |
| passive.v2.poison.p3 | Độc Tức Trường Tồn | +2s hold. | +8s hold; decay mỗi 2s. | eligible stack / actual DoT only |
| passive.v2.poison.p4 | Thực Cốt Chi Độc | Thêm một tick; Secondary chỉ hỗ trợ DoT thật. | Thêm một tick; không giảm Phòng. | eligible stack / actual DoT only |
| passive.v2.poison.p5 | Vạn Độc Vô Cực | +2 cap. | +10 cap. | eligible stack / actual DoT only |
| passive.v2.poison.p6 | Độc Sát Nhập Cốt | +4% mỗi nhóm10. | +12% mỗi nhóm10. | eligible stack / actual DoT only |
| passive.v2.poison.p7 | Phệ Tâm Chân Ý | +4% full payoff. | +10% full payoff; không Secondary core. | Main-only core event/payoff |
| passive.v2.poison.p8 | Độc Tức Bất Diệt | Hold tối thiểu thêm1s. | Hold tối thiểu thêm2s; không Nộ/read refresh. | Main-only core event/payoff |

Độc Tức base cap20, hold12s, decay1/s. P3 Lv20 hold20s and decay1/2s; P5 Lv20 cap30. P1 every3 eligible roots, P2 one8–25% roll/root. Main observes only real Poison application/landed roots, Secondary real landed Main roots; Basic and completed channels are one root each. p4 extends actual DoT by1 tick from10 stacks; p6 adds4–12% DoT coefficient per10 stacks. p7 Main full Công Tâm from20 stacks adds4–10% explicit coefficient. p8 atcap, real transition to4, raises hold to at least now+1–2s once/root; reads and visual ticks do not refresh.

## All 50 executable mastery milestones

Cumulative skill-local deltas; no synthetic stage, stage refunds, generic stat conversion, recursion or interruption bypass. The shared production decision path applies local effect, CN, cast/recovery/cooldown/Break deltas; finite packet/completion owners execute the authored Cực Ý exceptions.

| Skill suffix | 100 | 250 | 500 | 750 | 1000 |
|---|---|---|---|---|---|
| basic | Chiêu tích thế ổn định hơn: +3% hiệu quả chính. | Hiệu quả riêng +4%; không tự tạo Công Tâm hoặc hoàn stage. | Chiêu zero CN: +3% hiệu quả riêng. | Thu thế gọn hơn: giảm 4% Thu Chiêu. | Song Độc Chỉ: mỗi ba Basic landed roots đặt thêm một packet DoT ba tick hữu hạn. |
| bone | Chiêu tích thế ổn định hơn: +3% hiệu quả chính. | Hiệu quả riêng +4%; không tự tạo Công Tâm hoặc hoàn stage. | Vận chiêu thuần thục: giảm thêm 2% Chân Nguyên. | Thu thế gọn hơn: giảm 4% Thu Chiêu. | Cực Ý: thêm một tick hữu hạn vào packet DoT; không sinh stage hay proc. |
| heart | Chiêu tích thế ổn định hơn: +3% hiệu quả chính. | Hiệu quả riêng +4%; không tự tạo Công Tâm hoặc hoàn stage. | Vận chiêu thuần thục: giảm thêm 2% Chân Nguyên. | Thu thế gọn hơn: giảm 4% Thu Chiêu. | Cực Ý: thêm một tick hữu hạn vào packet DoT; không sinh stage hay proc. |
| insects | Dẫn pháp ổn định: +4% hiệu quả toàn lần dẫn. | Nhập dẫn nhanh hơn: giảm 4% Thi Triển. | Giảm thêm 3% Chân Nguyên. | Kết dẫn gọn hơn: giảm 5% Thu Chiêu. | Vạn Trùng Cực Ý: full completion đặt thêm một packet độc tám tick hữu hạn; không stage/proc và không thưởng khi bị ngắt. |
| mist | Chiêu tích thế ổn định hơn: +3% hiệu quả chính. | Hiệu quả riêng +4%; không tự tạo Công Tâm hoặc hoàn stage. | Vận chiêu thuần thục: giảm thêm 2% Chân Nguyên. | Thu thế gọn hơn: giảm 4% Thu Chiêu. | Độc Vụ Phong Giới: thêm hai tick hữu hạn vào field packet; không generic damage/giảm Phòng. |
| transform | Xả thế chính xác hơn: +4% hiệu quả chính. | Payoff khi xả tăng thêm 4%. | Giảm thêm 2% Chân Nguyên. | Giảm 4% Thu Chiêu sau lần xả. | Hiệu quả riêng +4%; không tự tạo Công Tâm hoặc hoàn stage. |
| guard | Hộ thân ổn định hơn: +5% hiệu quả khiên/hồi phục/hiệu quả chính. | Chuyển thủ sang nhịp kế nhanh hơn: giảm 3% Thu Chiêu. | Giảm thêm 3% Chân Nguyên. | Giảm thêm 3% Hồi Chiêu. | Cực Ý: +8% hiệu quả phòng thủ/hiệu quả chính. |
| consume | Kết chiêu sắc hơn: +5% hiệu quả chính. | Đòn kết có thêm +5% Phá Thế. | Giảm thêm 2% Chân Nguyên. | Giảm 4% Thu Chiêu sau sát chiêu. | Hiệu quả riêng +4%; không tự tạo Công Tâm hoặc hoàn stage. |
| calamity | Chiêu tích thế ổn định hơn: +3% hiệu quả chính. | Hiệu quả riêng +4%; không tự tạo Công Tâm hoặc hoàn stage. | Vận chiêu thuần thục: giảm thêm 2% Chân Nguyên. | Thu thế gọn hơn: giảm 4% Thu Chiêu. | Cực Ý: thêm một tick hữu hạn vào packet DoT; không sinh stage hay proc. |
| ultimate | Kết chiêu sắc hơn: +5% hiệu quả chính. | Đòn kết có thêm +5% Phá Thế. | Chiêu zero CN: +3% hiệu quả riêng. | Giảm 4% Thu Chiêu sau sát chiêu. | Hiệu quả riêng +4%; không tự tạo Công Tâm hoặc hoàn stage. |

## Main / Secondary / Auto / persistence

Main owns current-target Độc Chủng and Poison skills. Secondary receives only p1–p6 stack/actual-DoT utility; no Poison core, Active, Ultimate, Consume or rotation. No Main DoT means no fabricated DoT contribution. Auto uses actual equipped skills, target binding, stage, remaining packet coverage, CN affordability, emergency HP/shields and channel telegraph risk. Consume kits cash out stage4; sustain kits hold it; Transform needs existing Mist, stage≥2 and≥1.5s dwell; full-payoff kits reserve their core. Refresh in the last3 finite ticks. Ultimate holds at most4s, never indefinitely.

New CombatEngine construction is a new encounter, not a serialized event-queue resume API: it resets target core/coverage even if the target ID repeats. Hunt carry preserves only remaining Độc Tức hold/decay and resets the complete core. Runtime packets/actions stay combat-local; no arbitrary callback/token serialization or new global save authority. Existing offline Hunt derives rates from V3 representative combat; it does not fabricate per-kill Poison traces. Actual live Hunt settlement calls the tested carry authority.
