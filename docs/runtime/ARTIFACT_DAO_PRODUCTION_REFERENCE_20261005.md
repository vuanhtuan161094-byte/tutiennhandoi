# NGỰ KHÍ ĐẠO PRODUCTION REFERENCE — 2026-10-05

Status: READY candidate preparation; NOT CLOSED/LOCKED. Identity PHÂN → NGỰ → HỢP / THU.

CL=power; TP=body; TPH=agility; LL=spirit; TT=sense. Weighted skill power divided by authored baseline; TPH only Mobility, no damage shortcut.

| Suffix | Name | Form / CN | CD / Cast / Recovery | Effects | Five-stat / baseline |
|---|---|---|---|---|---|
| basic | Ngự Khí Linh Chỉ | instant / zero | 0 / 0 / 1 | [{"type":"damage","coefficient":0.7,"breakDamagePct":4}] | {"power":1.2,"sense":0.8} / 2 |
| deploy | Phân Khí Thành Binh | deploy / low | 8 / 0.8 / 0.85 | [{"type":"damage","coefficient":0.6,"breakDamagePct":2}] | {"spirit":1.3,"sense":0.7} / 2 |
| guard | Huyền Kính Hộ Chủ | instant / low | 7 / 0 / 0.75 | [{"type":"shield","capacity":190,"stability":100,"duration":4}] | {"body":1.3,"sense":0.7} / 2 |
| strike | Phá Không Ngự Kích | instant / medium | 5 / 0 / 0.8 | [{"type":"damage","coefficient":2.1,"breakDamagePct":24}] | {"power":1.5,"sense":1} / 2.5 |
| sync | Bách Khí Đồng Minh | instant / high | 10 / 0 / 1 | [{"type":"damage","coefficient":11.5,"breakDamagePct":18}] | {"power":1,"sense":1.5} / 2.5 |
| recall | Quy Khí Hồi Nguyên | instant / low | 9 / 0 / 0.85 | [{"type":"shield","capacity":90,"stability":100,"duration":4}] | {"spirit":1,"body":1} / 2 |
| split | Phân Quang Ngự Khí | deploy / low | 10 / 1 / 0.9 | [{"type":"damage","coefficient":1.3,"breakDamagePct":6}] | {"spirit":1.2,"sense":0.8} / 2 |
| merge | Hợp Khí Quy Nhất | cast / medium | 12 / 1 / 1 | [{"type":"damage","coefficient":1.6,"breakDamagePct":10}] | {"power":1.3,"sense":1.2} / 2.5 |
| suppress | Vạn Bảo Trấn Không | cast / high | 11 / 1.1 / 1.05 | [{"type":"damage","coefficient":3.2,"breakDamagePct":34}] | {"power":1.5,"sense":1} / 2.5 |
| ultimate | Chư Thiên Vạn Bảo Triều Tông | cast / zero | 0 / 1.5 / 1.6 | [{"type":"damage","coefficient":6.2,"breakDamagePct":48}] | {"power":1.3,"sense":1.3} / 2.6 |

## Eight passives Lv1–20

| ID / Name | Role | Lv1 | Lv20 |
|---|---|---|---|
| passive.v2.artifact.p1 / Khí Cảm Quyết | Every3 successful eligible roots +1, generated packets never count. | Every3 roots +1. | Every3 roots +1. |
| passive.v2.artifact.p2 / Dưỡng Khí Chân Kinh | One extra-stack roll per real root. | 10% chance. | 30% chance. |
| passive.v2.artifact.p3 / Khí Cảm Trường Tồn | Long hold/slower decay; pure reads. | +2s hold; decay1/s. | +8s hold; decay1/2s. |
| passive.v2.artifact.p4 / Hộ Chủ Linh Quang | Guard/Recall shield and bounded Secondary CN/shield utility. | Main shield +0.15%/stack; Secondary bounded3%CN/5%shield. | Main shield +0.5%/stack; Recall CN +0.3%/stack; Secondary bounded3%CN/5%shield. |
| passive.v2.artifact.p5 / Vạn Khí Vô Cực | Stack cap only, never source cap. | Stack cap+2. | Stack cap+10. |
| passive.v2.artifact.p6 / Bảo Khí Tương Sinh | Main shared-follow-up efficiency per10 stacks. | Follow-up +4%/10stacks. | Follow-up +12%/10stacks. |
| passive.v2.artifact.p7 / Ngự Tâm Nhất Ý | Main Recall/Merge CN efficiency at20 stacks. | Recall/Merge CN -4% at20. | Recall/Merge CN -10% at20. |
| passive.v2.artifact.p8 / Khí Cảm Bất Diệt | Real multi-source Command/Merge peak event: bounded hold/next follow-up or merge quality. | Hold1s; next follow-up+6%, merge quality3%. | Hold2s; next follow-up+15%, merge quality8%. |

## Fifty executable mastery milestones

| Skill | 100 | 250 | 500 | 750 | 1000 |
|---|---|---|---|---|---|
| basic | Hiệu quả riêng +5%; eligible multi-source follow-up +10%. | Hiệu quả riêng thêm4%. | Thu Chiêu -5%. | Thu Chiêu thêm5%. | Cực Ý: hiệu quả riêng +8%; shared follow-up +15%, không thêm proc. |
| deploy | Thi Triển -10%. | Chân Nguyên chiêu -3%. | Thu Chiêu -5%. | Hồi Chiêu -5%. | Cực Ý: Thu Chiêu thêm10%; vẫn chỉ +1/cap3. |
| guard | Hiệu quả riêng +5%; eligible multi-source follow-up +10%. | Chân Nguyên chiêu -3%. | Thu Chiêu -5%. | Hồi Chiêu -5%. | Cực Ý: hiệu quả riêng +8%; shared follow-up +15%, không thêm proc. |
| strike | Hiệu quả riêng +5%; eligible multi-source follow-up +10%. | Chân Nguyên chiêu -3%. | Thu Chiêu -5%. | Hồi Chiêu -5%. | Cực Ý: hiệu quả riêng +8%; shared follow-up +15%, không thêm proc. |
| sync | Hiệu quả riêng +5%; eligible multi-source follow-up +10%. | Chân Nguyên chiêu -3%. | Thu Chiêu -5%. | Hồi Chiêu -5%. | Cực Ý: hiệu quả riêng +8%; shared follow-up +15%, không thêm proc. |
| recall | CN thu hồi +20%, chỉ sau exactly-1 source commit. | Chân Nguyên chiêu -3%. | Thu Chiêu -5%. | Hồi Chiêu -5%. | Cực Ý: CN thu hồi thêm10%; vẫn chỉ -1. |
| split | Thi Triển -10%. | Chân Nguyên chiêu -3%. | Thu Chiêu -5%. | Hồi Chiêu -5%. | Cực Ý: Thu Chiêu thêm10%; vẫn chỉ +1/cap3. |
| merge | Hiệu quả riêng +5%; eligible multi-source follow-up +10%. | Chân Nguyên chiêu -3%. | Thu Chiêu -5%. | Hồi Chiêu -5%. | Cực Ý: merge-local Command quality +10%; không rebuild trong window. |
| suppress | Hiệu quả riêng +5%; eligible multi-source follow-up +10%. | Chân Nguyên chiêu -3%. | Thu Chiêu -5%. | Hồi Chiêu -5%. | Cực Ý: hiệu quả riêng +8%; shared follow-up +15%, không thêm proc. |
| ultimate | Hiệu quả riêng +5%; eligible multi-source follow-up +10%. | Hiệu quả riêng thêm4%. | Thu Chiêu -5%. | Thu Chiêu thêm5%. | Cực Ý: hiệu quả riêng +8%; shared follow-up +15%, không thêm proc. |

Source management: starts1/cap3; Deploy/Split exactly+1; Recall exactly-1, bounded real CN and shield; Merge snapshots≥2→1 and a6s window. Command +12% per extra source exactly once. Window Command bonus100% per merged extra source×(1+quality), no generic damage authority. Follow-up coefficient(extra sources×0.25)×bounded mastery/Khí Cảm efficiency, one shared budget/root, snapshot power/provenance, no recursive generation. Ultimate Gauge100/CN0; real effective count, no cap4/source generation. Guard shield scales TP+TT; Recall CN utility LL+TP. Secondary bounded utility only.
