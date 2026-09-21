# Video -> Godot Animation Tool

Tool nội bộ cho pipeline asset động của **Game Tu Tiên Nhàn Dỗi**.

## Mục tiêu

`tools/video_to_godot_animation.py` chuyển video nguồn thành animation candidate ổn định cho Godot:

`video -> sample FPS -> chroma key -> union crop -> stable canvas -> dedupe -> atlas -> metadata -> SpriteFrames .tres`

Tool không thay đổi gameplay/backend và không tự đưa asset vào `approved/`.

## Cài dependency

Windows:

```bat
py -3 -m pip install -r tools\video_animation_requirements.txt
```

Tool ưu tiên `ffmpeg` trong PATH. Nếu máy chưa có FFmpeg system, package `imageio-ffmpeg` trong requirements cung cấp binary fallback.

## Tự kiểm tool

```bat
TAO_ANIMATION_TU_VIDEO.cmd --self-test
```

Self-test tạo video-frame giả trong thư mục tạm và kiểm:

- chroma key nền hồng;
- crop chung cho toàn animation;
- frame dedupe + duration;
- lossless WebP atlas;
- preview/contact sheet;
- Godot `SpriteFrames .tres` với AtlasTexture.

## Ví dụ Home thiền

Nếu đoạn thiền cần lấy nằm từ giây 0 đến giây 3:

```bat
TAO_ANIMATION_TU_VIDEO.cmd "D:\video\meditation.mp4" ^
  --name home_meditation_idle ^
  --start 0 ^
  --end 3 ^
  --fps 10 ^
  --key-color auto ^
  --pivot center
```

Mặc định output candidate nằm tại:

```text
assets/_pipeline/video_animation/home_meditation_idle/
  frames/
  atlas.webp
  animation.json
  preview.webp
  contact_sheet.webp
```

Không cần cắt 30 PNG bằng tay. Với 3 giây × 10 FPS, FFmpeg sample khoảng 30 frame trước dedupe.

## Cài candidate vào Godot

Chỉ dùng khi muốn test runtime:

```bat
TAO_ANIMATION_TU_VIDEO.cmd "D:\video\meditation.mp4" ^
  --name home_meditation_idle ^
  --start 0 ^
  --end 3 ^
  --fps 10 ^
  --key-color auto ^
  --install-res-dir res://art/candidate/home/home_meditation_idle
```

Tool tạo:

```text
godot/art/candidate/home/home_meditation_idle/
  home_meditation_idle_atlas.webp
  home_meditation_idle.json
  home_meditation_idle.tres
```

Godot có thể nạp trực tiếp:

```gdscript
const MEDITATION_FRAMES: SpriteFrames = preload(
    "res://art/candidate/home/home_meditation_idle/home_meditation_idle.tres"
)
```

Sau khi install candidate resource phải chạy `KIEM_TRA_GAME.cmd`.

## Chroma key

`--key-color auto` là mặc định. Tool lấy mẫu viền từ đầu/giữa/cuối đoạn video, tìm màu nền chiếm ưu thế rồi dùng màu đó làm key.

Các tham số chính:

- `--key-tolerance 48`: vùng màu bị xóa hoàn toàn.
- `--key-feather 28`: vùng chuyển alpha mềm ở viền.
- `--despill 0.22`: giảm ám màu nền ở pixel bán trong suốt.
- `--alpha-threshold 8`: ngưỡng foreground dùng để tìm crop.
- `--padding 8`: viền trong suốt thêm quanh union crop.

Nếu source đã có alpha hoặc không muốn xóa nền:

```bat
--key-color none
```

## Stable canvas / pivot

Tool không crop từng frame riêng. Nó tính bbox của tất cả frame rồi lấy **một union crop duy nhất**, nên kích thước/canvas của mọi frame bằng nhau.

Đây là phần chống rung vị trí quan trọng nhất khi đưa vào `AnimatedSprite2D`.

`--pivot center` và `--pivot bottom-center` được ghi vào metadata. SpriteFrames dùng cùng một atlas cell size nên pivot không trôi theo từng frame.

## Frame dedupe

Các frame liên tiếp gần giống nhau được gộp. Tool không làm animation chạy nhanh lên: số frame bị gộp được lưu vào `durationFrames`, và `.tres` dùng giá trị đó làm duration multiplier.

Muốn gần như không dedupe:

```bat
--dedupe-threshold 0
```

## Lifecycle asset

Quy tắc repo vẫn giữ nguyên:

`video source -> assets/_pipeline candidate -> runtime review -> user approval -> approved -> integrated -> locked`

Không tự copy candidate vào `godot/art/approved/**` trước khi có approval.

## Khi nào cần AI matting

Nền hồng/xanh phẳng: ưu tiên chroma key vì nhanh và deterministic.

Chỉ cân nhắc RVM/rembg khi source có tóc/vải bán trong suốt hoặc nền không đồng nhất đến mức chroma key không giữ được viền. AI matting không nằm trong dependency mặc định của tool để tránh kéo PyTorch/model nặng vào repo game.
