# TRẬN ĐẠO PRODUCTION REFERENCE — 2026-10-05

Status: candidate preparation; not CLOSED/LOCKED. Identity BỐ → DƯỠNG ↔ HỘ → KÍCH.

| Stable suffix | Name | Form / CN | CD / Cast / Recovery | Effects | Five-stat / baseline |
|---|---|---|---|---|---|
| basic | Khắc Văn Điểm Trận | instant / zero | 0 / 0 / 1.1 | [{"type":"damage","coefficient":0.7,"breakDamagePct":2}] | {"power":0.1,"sense":1.9} / 2 |
| deploy | Bố Trận Khai Môn | deploy / low | 5 / 1 / 0.9 | [{"type":"damage","coefficient":0.55,"breakDamagePct":2}] | {"spirit":1.2,"sense":0.8} / 2 |
| nourish | Tụ Linh Dưỡng Trận | channel / low | 6 / 0.3 / 0.9 | [] | {"spirit":1.3,"sense":0.7} / 2 |
| fortify | Hộ Nhãn Cố Trận | instant / low | 7 / 0 / 0.15 | [{"type":"shield","capacity":80,"stability":100,"duration":3}] | {"body":1.3,"sense":0.7} / 2 |
| small_activate | Tiểu Kích Trận | instant / low | 4 / 0 / 0.75 | [{"type":"damage","coefficient":2.5,"breakDamagePct":14}] | {"power":0.1,"sense":2.1} / 2.2 |
| full_activate | Toàn Kích Trận | cast / medium | 9 / 1 / 1 | [{"type":"damage","coefficient":4.8,"breakDamagePct":32}] | {"power":1.6,"sense":0.9} / 2.5 |
| seal | Phong Trận Dưỡng Thế | instant / low | 10 / 0 / 0.8 | [] | {"spirit":1.2,"sense":0.8} / 2 |
| convert | Chuyển Nhãn Hóa Thế | instant / low | 18 / 0 / 0.15 | [] | {"body":1,"spirit":1} / 2 |
| break | Phá Trận Hồi Nguyên | finisher / zero | 10 / 0.4 / 0.9 | [] | {"spirit":1.2,"sense":0.8} / 2 |
| ultimate | Chu Thiên Tinh Đấu Đại Trận | cast / zero | 0 / 2 / 1.7 | [{"type":"damage","coefficient":10,"breakDamagePct":55}] | {"power":0.1,"sense":2.5} / 2.6 |

## Eight passives

| ID | Role | Lv1 | Lv20 |
|---|---|---|---|
| passive.v2.formation.p1 | Successful distinct Formation root +1; Secondary distinct Main roots for bounded CN utility. | Nurture +0.1%/stack; Secondary CN -0.1%/stack, cap3%. | Nurture +0.3%/stack; Secondary CN max3%. |
| passive.v2.formation.p2 | One extra-stack roll per eligible distinct root. | 10% extra +1. | 30% extra +1. |
| passive.v2.formation.p3 | Longer duration and slower decay; no read refresh. | +2s hold; decay1/s. | +8s hold; decay1/2s. |
| passive.v2.formation.p4 | Fortify/Convert restoration efficiency; never creates nurture. | Restoration +0.2%/stack. | Restoration +0.5%/stack. |
| passive.v2.formation.p5 | Trận Văn cap. | Cap+2. | Cap+10. |
| passive.v2.formation.p6 | Main activation-local quality at each10 stacks. | Activation +2%/10stacks. | Activation +6%/10stacks. |
| passive.v2.formation.p7 | Main integrity wear reduction at20 stacks. | Wear -5% at20. | Wear -15% at20. |
| passive.v2.formation.p8 | Main cap Grand stability and event-owned hold. | Grand wear -5%; Grand event hold1s. | Grand wear -10%; Grand event hold2s. |

## Fifty executable mastery milestones

| Skill | 100 | 250 | 500 | 750 | 1000 |
|---|---|---|---|---|---|
| basic | Dưỡng package +5%. | Dưỡng package +10%, cap60 mỗi root. | Thu Chiêu chiêu -5%. | Thu Chiêu thêm -5%. | Cực Ý: Dưỡng package thêm10%, không floor. |
| deploy | Thi Triển -10%. | Chân Nguyên chiêu -3%. | Thu Chiêu chiêu -5%. | Hồi Chiêu chiêu -5%. | Cực Ý: Thi Triển thêm -15%; vẫn0 Dưỡng/100 Bền. |
| nourish | Dưỡng package +5%. | Dưỡng package +10%, cap60 mỗi root. | Thu Chiêu chiêu -5%. | Hồi Chiêu chiêu -5%. | Cực Ý: Dưỡng package thêm10%, không floor. |
| fortify | Hiệu suất hồi Bền +20%. | Chân Nguyên chiêu -3%. | Thu Chiêu chiêu -5%. | Hồi Chiêu chiêu -5%. | Cực Ý: hiệu suất hồi Bền thêm20%. |
| small_activate | Hiệu quả riêng +5%. | Chân Nguyên chiêu -3%. | Thu Chiêu chiêu -5%. | Hồi Chiêu chiêu -5%. | Cực Ý: hiệu quả riêng thêm10%, không bypass setup. |
| full_activate | Hiệu quả riêng +5%. | Chân Nguyên chiêu -3%. | Thu Chiêu chiêu -5%. | Hồi Chiêu chiêu -5%. | Cực Ý: hiệu quả riêng thêm10%, không bypass setup. |
| seal | Dưỡng package +5%. | Dưỡng package +10%, cap60 mỗi root. | Thu Chiêu chiêu -5%. | Hồi Chiêu chiêu -5%. | Cực Ý: Dưỡng package thêm10%, không floor. |
| convert | Hiệu suất hồi Bền +20%. | Chân Nguyên chiêu -3%. | Thu Chiêu chiêu -5%. | Hồi Chiêu chiêu -5%. | Cực Ý: hiệu suất hồi Bền thêm20%. |
| break | CN thu hồi +20%. | Thi Triển -10%. | Thu Chiêu chiêu -5%. | Thu Chiêu thêm -5%. | CN thu hồi thêm10% từ giá trị thật. |
| ultimate | Hiệu quả riêng +5%. | Uy lực riêng thêm5%, vẫn đọc Dưỡng thật. | Thu Chiêu chiêu -5%. | Thu Chiêu thêm -5%. | Cực Ý: hiệu quả riêng thêm10%, không bypass setup. |

Main owns core/Active/Ultimate/Auto; Secondary root diversity only gives bounded CN utility. See production contract for transaction/interrupt and lifecycle. Hunt carries committed core with a one-encounter carry marker consumed at construction; fresh session reset starts absent. Pending actions/channel callbacks are never serialized. Frontend uses actual projection meters; nurture100 highlights Đại Thành via existing full styling.
