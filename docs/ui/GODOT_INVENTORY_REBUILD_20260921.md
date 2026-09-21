# Godot Inventory / Equipment Rebuild — 2026-09-21

Status: STATIC CANDIDATE DESIGN

## Goal

Rebuild the player-facing Kho Đồ / Trang Bị experience around the locked V165 / V142 equipment authority without reviving retired progression lanes.

This is a presentation + transport slice. Gameplay/save authority remains unchanged.

## Canonical equipment truth

V142 equipment uses only:

- Bậc `equipmentRankIndex / rankName`;
- Cường Hóa `+0..+15`;
- authored Affix;
- V142 Set engraving / resonance;
- 10 canonical slots.

Retired for V142 player-facing UI:

- Grade / Quality / Tier as progression;
- Đạo Văn;
- Ngũ Hành Ngọc / Gem sockets;
- old V116/V128 progression actions.

Compatibility data may remain in backend/save migration, but it must not appear as a current V142 progression lane.

## Screen ownership

Character remains hero-first and shows only:

- 10 currently equipped slots;
- three core stats;
- Tăng Điểm;
- quick destinations.

The Character `Trang Bị` action and tapping any equipment slot open the full-screen **Kho Đồ** surface.

Kho Đồ is not a seventh bottom-navigation destination.

## Kho Đồ information architecture

### Header

- title: `Kho Đồ`;
- item count;
- close/back;
- current slot filter when opened from a Character slot.

### Resource strip

Always visible:

- Khí Luyện Tinh Hoa;
- Bùa Chống Tụt;
- Ngọc Chuyển Cường Hóa.

Do not show legacy Đạo Văn fragments or Gem blanks in the V142 inventory surface.

### Primary tabs

1. `TẤT CẢ`
2. `Y TRANG` — 6 attire slots
3. `TRANG SỨC` — 4 jewelry slots
4. `SET`
5. `VẬT PHẨM`
6. `LUYỆN`

No dashboard-like duplicate summary cards.

## Item card

Two-column portrait grid.

The player must understand the item before opening detail.

Visible on card:

- slot icon;
- Bậc;
- `+Cường Hóa`;
- item name;
- Set identity chip if present;
- equipped marker;
- contextual strength signal.

Do not display:

- legacy Grade / Quality / Tier;
- raw internal IDs;
- Dao/Gem state;
- long affix descriptions;
- crafting source text.

### Strength signal

Do not invent an item power score.

Use canonical values:

1. compare effective stats when heavy detail is loaded;
2. otherwise compare Bậc;
3. if same Bậc, compare Cường Hóa.

Labels:

- `▲ NÂNG CẤP` when the candidate dominates the currently equipped item;
- `▼ THẤP HƠN` when it is dominated;
- `↔ ĐỔI LỐI CHƠI` when gains/losses are mixed;
- `≈ TƯƠNG ĐƯƠNG` when effectively equal;
- `SO SÁNH` when heavy detail is deferred.

## Item detail

A bottom detail layer opens over Kho Đồ.

Order:

1. item name;
2. slot + Bậc + Cường Hóa;
3. strength/comparison summary;
4. primary effective stats;
5. Affix lines and roll quality;
6. Set name and Set progress;
7. source;
8. actions.

Primary actions:

- `TRANG BỊ`;
- `CƯỜNG HÓA`.

Cường Hóa displays:

- target enhancement level;
- success chance;
- Tinh Hoa cost;
- downgrade chance;
- optional `DÙNG BÙA`.

## Set visual language

Set identity changes border/accent treatment, not the underlying item rank.

Attire:

- Kim — pale gold / white-metal accent;
- Mộc — jade accent;
- Thủy — cyan / deep-blue accent;
- Hỏa — red / ember accent;
- Thổ — amber / earth accent.

Jewelry sets each use a distinct accent derived from Set identity.

Set tab shows:

- set name;
- owned/equipped piece count;
- canonical slots;
- 2/4/6 or 2/4 threshold states;
- Tàn Ấn balance.

Thresholds must read from canonical V142 Set definitions. No UI-owned bonus math.

## Materials

V142 inventory materials:

- Khí Luyện Tinh Hoa;
- Bùa Chống Tụt;
- Ngọc Chuyển Cường Hóa;
- Mảnh Trang Bị by Bậc;
- Tàn Ấn by Set;
- Affix materials only when their live V142 action is exposed.

Kho Đồ also lists canonical generic inventory resources by backend-provided name/quantity. Equipment core resources are not duplicated in this list, and legacy Đạo Văn/Gem resources remain hidden. Pháp Bảo and Linh Thú stay on their owning progression screens rather than becoming generic bag rows.

## Progression separation

Kho Đồ owns browsing, compare, equip and quick enhance.

The `LUYỆN` tab is the focused item-production flow:

- Luyện Trang Bị from Mảnh;
- 3:1 Mảnh refinement;
- 3-item same-slot/same-rank merge;
- Set engraving with Tàn Ấn;
- Affix Tái Luyện / Tinh Luyện;
- enhancement transfer.

These actions must continue to call locked canonical backend commands. UI must not duplicate their rules. Merge selection is explicit: one retained main item plus two fodders; equipped, locked and Set items are protected from being selected as fodder by the Godot surface.

## Deletion / retirement rules

Remove from the new Godot V142 experience:

- legacy Grade/Quality/Tier labels;
- Đạo Văn controls;
- Gem socket controls;
- duplicate 10-slot inventory list inside Character detail sheet;
- repeated resource rows per item card;
- long always-expanded item details;
- fake power scores.

Backend compatibility code is not deleted as part of this presentation slice because it is required for old-save normalization.
