# PHÁP ĐẠO PRODUCTION REFERENCE — 2026-10-04

Status: CLOSED / LOCKED after [user exact-SHA acceptance](SPELL_DAO_PRODUCTION_CLOSURE_20261005.md). Runtime/source is authoritative.

## Ten skills

| Skill | Name | Form | CN class | CD / Cast / Recovery (s) | Base effects | Five-stat family / baseline |
|---|---|---|---|---|---|---|
| skill.dao.spell.basic | Dẫn Khí Pháp Chỉ | instant | zero | 0 / 0 / 1.05 | {"effects":[{"type":"damage","coefficient":0.9,"breakDamagePct":3},{"type":"restoreSpirit","flat":4}],"channel":null} | {"power":1.2} / 1.2 |
| skill.dao.spell.light | Linh Quang Thuật | instant | low | 3 / 0 / 0.7 | {"effects":[{"type":"damage","coefficient":3,"breakDamagePct":6}],"channel":null} | {"power":1.2,"agility":1} / 2.2 |
| skill.dao.spell.channel | Huyền Pháp Liên Châu | channel | medium | 7 / 0.4 / 0.9 | {"effects":[],"channel":{"duration":2,"baseHits":4,"spiritCostStandardPctPerSecond":4,"effects":[{"type":"damage","coefficient":3,"breakDamagePct":3}]}} | {"power":1.2,"sense":4.8} / 6 |
| skill.dao.spell.restore | Tụ Linh Quy Nguyên | channel | zero | 12 / 0.3 / 1 | {"effects":[{"type":"restoreSpirit","flat":10}],"channel":{"duration":2.5,"baseHits":5,"effects":[{"type":"restoreSpirit","flat":6}]}} | {"spirit":1} / 1 |
| skill.dao.spell.shield | Pháp Thuẫn Hộ Tâm | instant | medium | 9 / 0 / 0.75 | {"effects":[{"type":"shield","capacity":230,"stability":100,"duration":4.5}],"channel":null} | {"body":1.2} / 1.2 |
| skill.dao.spell.seal | Ngưng Pháp Thành Ấn | cast | low | 5 / 1 / 0.7 | {"effects":[{"type":"damage","coefficient":0.75,"breakDamagePct":4}],"channel":null} | {"power":1.5} / 1.5 |
| skill.dao.spell.burst | Chân Nguyên Bạo Pháp | cast | high | 10 / 1.5 / 1 | {"effects":[{"type":"damage","coefficient":3.4,"breakDamagePct":20}],"channel":null} | {"power":3} / 3 |
| skill.dao.spell.break | Phá Giới Pháp Ấn | cast | medium | 9 / 1.4 / 0.9 | {"effects":[{"type":"damage","coefficient":2.35,"breakDamagePct":40}],"channel":null} | {"power":1.5,"sense":1.2} / 2.7 |
| skill.dao.spell.transform | Vạn Tượng Quy Pháp | instant | zero | 15 / 0 / 0.8 | {"effects":[{"type":"restoreSpirit","flat":18}],"channel":null} | {"spirit":1} / 1 |
| skill.dao.spell.ultimate | Thái Nhất Vạn Pháp Triều Tông | channel | zero | 0 / 0.7 / 1.5 | {"effects":[],"channel":{"duration":4,"baseHits":8,"effects":[{"type":"damage","coefficient":0.92,"breakDamagePct":6}]}} | {"power":2.5,"sense":1.5} / 4 |

Costs are 0/8/16/28% of CN Standard before authored mastery/passive efficiency. Offensive Channel adds 4% CN Standard/s, paid per resolved tick. LL affects CN capacity; LL utility metadata does not create hidden damage. Basic completes only the Tốc step; Light completes that step faster and its Lv1000 mastery prepares the genuine next two forms. Burst and Break are the only Diễn Pháp spenders. Ultimate requires Gauge 100 and leaves the wheel/readiness unchanged.

## Eight passives

| Passive | Lv1 | Lv20 | Event / Secondary boundary |
|---|---|---|---|
| passive.v2.spell.p1 · Pháp Ý Quyết | Mở stack Pháp Ý 0–20; không tăng sát thương chung. | Mở stack Pháp Ý 0–20; không tăng sát thương chung. | Paid root unlock/generation; Secondary observes its Main paid roots once |
| passive.v2.spell.p2 · Dẫn Pháp Chân Kinh | 10% cơ hội thêm một tầng. | 30% cơ hội thêm một tầng. | One bounded gain roll per paid root; Secondary same generation |
| passive.v2.spell.p3 · Pháp Ý Trường Tồn | +2 giây hold; decay 1 tầng/giây. | +8 giây hold; decay 1 tầng/2 giây. | Timer only; Secondary same hold/decay |
| passive.v2.spell.p4 · Tụ Linh Chân Giải | Tối đa 2% giảm CN cho Main Pháp; Secondary nhận CN utility có giới hạn. | Tối đa 5% giảm CN cho Main Pháp; Secondary nhận CN utility có giới hạn. | Main authored Spell CN efficiency; Secondary 1–3% CN utility at ten stacks |
| passive.v2.spell.p5 · Vạn Pháp Vô Cực | +2 trần Pháp Ý. | +10 trần Pháp Ý. | Cap only; Secondary stack cap |
| passive.v2.spell.p6 · Pháp Uy Lăng Thiên | +4% hiệu quả action-local khi dùng Diễn Pháp. | +12% hiệu quả action-local khi dùng Diễn Pháp. | Eligible Diễn Pháp snapshot only; Secondary has no payoff |
| passive.v2.spell.p7 · Hồi Nguyên Thông Huyền | Tại trần nền 20 tầng: giảm thêm 4% CN Pháp. | Tại 20 tầng trở lên: giảm thêm 10% CN Pháp. | Main threshold CN utility; Secondary has no Main skill payoff |
| passive.v2.spell.p8 · Pháp Ý Bất Diệt | +10% payoff; hoàn vòng/resolve Diễn Pháp gia hạn hold 1 giây. | +20% payoff; hoàn vòng/resolve Diễn Pháp gia hạn hold 2 giây; không sinh thêm Nộ. | Peak snapshot + real full-cycle/payoff refresh; Secondary has no core event |

## All 50 mastery milestones

Every delta is skill-local and cumulative; no form synthesis, interrupt bypass, readiness refund, extra follow-up, or generic stat multiplier. Zero-CN skills receive an effective local effect bonus at 500 instead of a meaningless cost discount. Utility effect bonuses affect actual Spell CN recovery. Light 1000 prepares matching Thi Triển/Dẫn Pháp cast/recovery ×0.65 and, only after full cycle completion, returns at most 1.5s of Burst cooldown. The transaction is one-shot and stops at a fresh cycle.

| Skill | 100 | 250 | 500 | 750 | 1000 |
|---|---|---|---|---|---|
| skill.dao.spell.basic | Chiêu tích thế ổn định hơn: +3% hiệu quả chính. | Hiệu quả riêng của chiêu +3%; vẫn cần hoàn thành đúng form. | Chiêu không tiêu Chân Nguyên: hiệu quả riêng tăng thêm 3%. | Thu thế gọn hơn: giảm 4% Thu Chiêu. | Hiệu quả riêng của chiêu +3%; vẫn cần hoàn thành đúng form. |
| skill.dao.spell.light | Bộc phát ổn định hơn: +4% hiệu quả chính. | Uy lực phá nhịp tăng: +4% Phá Thế. | Giảm thêm 3% Chân Nguyên. | Khởi chiêu nhanh hơn: giảm 4% Thi Triển. | Linh Quang Cực Ý: +7% hiệu quả riêng; đúng chuỗi giảm 35% cast/recovery Thi Triển/Dẫn Pháp; full completion rút tối đa 1,5s CD Bạo Pháp. |
| skill.dao.spell.channel | Dẫn pháp ổn định: +4% hiệu quả toàn lần dẫn. | Nhập dẫn nhanh hơn: giảm 4% Thi Triển. | Giảm thêm 3% Chân Nguyên. | Kết dẫn gọn hơn: giảm 5% Thu Chiêu. | Hiệu quả riêng của chiêu +3%; vẫn cần hoàn thành đúng form. |
| skill.dao.spell.restore | Hộ thân ổn định hơn: +5% hiệu quả khiên/hồi phục/hiệu quả chính. | Chuyển thủ sang nhịp kế nhanh hơn: giảm 3% Thu Chiêu. | Chiêu không tiêu Chân Nguyên: hiệu quả riêng tăng thêm 3%. | Giảm thêm 3% Hồi Chiêu. | Cực Ý: +8% hiệu quả phòng thủ/hiệu quả chính. |
| skill.dao.spell.shield | Hộ thân ổn định hơn: +5% hiệu quả khiên/hồi phục/hiệu quả chính. | Chuyển thủ sang nhịp kế nhanh hơn: giảm 3% Thu Chiêu. | Giảm thêm 3% Chân Nguyên. | Giảm thêm 3% Hồi Chiêu. | Cực Ý: +8% hiệu quả phòng thủ/hiệu quả chính. |
| skill.dao.spell.seal | Chiêu tích thế ổn định hơn: +3% hiệu quả chính. | Hiệu quả riêng của chiêu +3%; vẫn cần hoàn thành đúng form. | Vận chiêu thuần thục: giảm thêm 2% Chân Nguyên. | Thu thế gọn hơn: giảm 4% Thu Chiêu. | Hiệu quả riêng của chiêu +3%; vẫn cần hoàn thành đúng form. |
| skill.dao.spell.burst | Bộc phát ổn định hơn: +4% hiệu quả chính. | Uy lực phá nhịp tăng: +4% Phá Thế. | Giảm thêm 3% Chân Nguyên. | Khởi chiêu nhanh hơn: giảm 4% Thi Triển. | Cực Ý: +7% hiệu quả chính. |
| skill.dao.spell.break | Đường Phá rõ hơn: +8% hiệu quả Phá Thế của chiêu. | Thế phá ổn định: +4% hiệu quả chính. | Giảm thêm 2% Chân Nguyên khi vận chiêu. | Thu thế nhanh hơn: giảm 4% Thu Chiêu. | Cực Ý: +12% Phá Thế và +4% hiệu quả chính. |
| skill.dao.spell.transform | Hộ thân ổn định hơn: +5% hiệu quả khiên/hồi phục/hiệu quả chính. | Chuyển thủ sang nhịp kế nhanh hơn: giảm 3% Thu Chiêu. | Chiêu không tiêu Chân Nguyên: hiệu quả riêng tăng thêm 3%. | Giảm thêm 3% Hồi Chiêu. | Cực Ý: +8% hiệu quả phòng thủ/hiệu quả chính. |
| skill.dao.spell.ultimate | Dẫn pháp ổn định: +4% hiệu quả toàn lần dẫn. | Nhập dẫn nhanh hơn: giảm 4% Thi Triển. | Chiêu không tiêu Chân Nguyên: hiệu quả riêng tăng thêm 3%. | Kết dẫn gọn hơn: giảm 5% Thu Chiêu. | Hiệu quả riêng của chiêu +3%; vẫn cần hoàn thành đúng form. |
