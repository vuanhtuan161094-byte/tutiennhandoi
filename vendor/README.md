# Local PixiJS runtime

`dongfu-pixi-scene-v139.js` ưu tiên file local:

- `pixi-8.20.0.min.js`

Nếu file chưa tồn tại, runtime tự fallback sang jsDelivr và cuối cùng fallback về DOM scene nếu Pixi không tải được.

Trên máy có internet, chạy:

```bash
npm run vendor:pixi
```

Lệnh này tải đúng PixiJS 8.20.0 + LICENSE vào thư mục này. Không sửa backend/gameplay.
