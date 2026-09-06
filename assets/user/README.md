# Kho ảnh người dùng

Thư mục này là nơi thay ảnh mà không cần sửa `app.js` hoặc CSS.

## 1. Skin nhân vật

- Đặt ảnh PNG/WebP nền trong suốt vào `characters/`.
- Nên crop sát nhân vật, không để nền phong cảnh trong file skin.
- Khuyến nghị: tỉ lệ dọc khoảng 2:3 đến 9:16, chiều cao từ 1400 px trở lên.
- Avatar riêng (nếu có) đặt trong `avatars/`.
- Thêm skin vào `catalog.json`:

```json
{
  "id": "skin.user.thanh_van",
  "name": "Thanh Vân Tiên Tử",
  "asset": "/assets/user/characters/thanh-van.png",
  "avatar": "/assets/user/avatars/thanh-van.png",
  "variants": {
    "character": "/assets/user/characters/thanh-van.png",
    "inventory": "/assets/user/characters/thanh-van.png"
  },
  "unlocked": true,
  "layout": {
    "widthPct": 68,
    "heightPct": 96,
    "xPct": 50,
    "yPct": 1
  }
}
```

`layout` là tùy chọn, giúp mỗi skin có tỉ lệ khác nhau mà không sửa CSS.

## 2. Background

- Đặt ảnh vào `backgrounds/`.
- Khuyến nghị 1080x1920 hoặc lớn hơn, không chứa nhân vật và không chứa UI.
- Thêm vào `catalog.json`:

```json
{
  "id": "bg.user.tien_son",
  "name": "Tiên Sơn",
  "asset": "/assets/user/backgrounds/tien-son.webp",
  "variants": {
    "character": "/assets/user/backgrounds/tien-son.webp",
    "inventory": "/assets/user/backgrounds/tien-son.webp"
  },
  "unlocked": true,
  "layout": {
    "positionX": 50,
    "positionY": 50,
    "scale": 1
  }
}
```

## 3. Ảnh trang bị

Không cần sửa code. Map trực tiếp theo `equipment id` từ backend:

```json
"equipment": {
  "byId": {
    "equipment.qingfeng_sword": "/assets/user/equipment/qingfeng-sword.png"
  },
  "bySlot": {
    "weapon": "/assets/user/equipment/default-weapon.png",
    "head": "/assets/user/equipment/default-head.png"
  }
}
```

Thứ tự ưu tiên: `byId` -> `bySlot` -> asset fallback có sẵn trong game.

## 4. Ảnh skill

Map theo đúng `skill id` backend:

```json
"skills": {
  "byId": {
    "skill.basic_strike": "/assets/user/skills/basic-strike.png",
    "skill.thunder_finger": "/assets/user/skills/thunder-finger.png"
  }
}
```

Skill mới từ backend vẫn tự xuất hiện trên UI. Nếu chưa map ảnh, UI dùng icon fallback.

## 5. Quy tắc quan trọng

- Ảnh nhân vật và background luôn là hai layer độc lập.
- Không nhét screenshot UI vào background.
- Không cần rebuild TypeScript khi chỉ đổi ảnh hoặc sửa `catalog.json`; restart web server là đủ để catalog server đọc lại.
- Gameplay, chỉ số, skill, trang bị vẫn do backend quyết định. File này chỉ quyết định asset hiển thị.

## 6. Variant theo màn hình

`asset` là ảnh mặc định. Nếu muốn một skin/background có biến thể riêng cho từng màn, thêm `variants`:

- `character`: màn Nhân Vật
- `inventory`: màn Hành Trang
- về sau có thể thêm `cultivation`, `hunt`, `combat` mà không đổi cấu trúc catalog.

Nếu variant không tồn tại, frontend tự quay về `asset`.
