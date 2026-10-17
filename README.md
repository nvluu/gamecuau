# THÁP CỦ ẤU 🐃

Game xếp củ ấu trên xe gỗ, dùng Phaser 3 và Matter.js. Đồ họa được vẽ bằng Phaser, âm thanh tổng hợp bằng Web Audio; không cần backend hoặc tài khoản.

## Chạy thử

Cần Node.js 22 trở lên và npm.

```sh
npm ci
npm run dev
```

Mở địa chỉ Vite hiển thị. Trên điện thoại cùng mạng, dùng địa chỉ Network. Game giữ khung dọc 360 × 640, tự thu phóng theo màn hình.

```sh
npm run build
npm run preview
```

Bản xuất tĩnh nằm trong `dist/`. `base: './'` hỗ trợ đường dẫn repository trên GitHub Pages.

## Cách chơi

Bấm **Bắt đầu**. Củ ấu xuất hiện đứng yên ở vị trí ngang ngẫu nhiên phía trên, giới hạn trong bề ngang thân xe hiện tại (kể cả khi củ xoay). Giữ ngón tay ở vùng chơi dưới thanh điểm và kéo trái/phải để di chuyển củ; nhấc ngón tay để thả. Trên máy tính, giữ chuột, kéo rồi thả nút chuột. Củ đứng ổn định được tính một điểm; củ mới xuất hiện ngay ở vị trí ngang ngẫu nhiên sau mỗi lần thả. Mỗi củ rơi khỏi xe xuống dưới vùng chơi mất một mạng, kể cả củ đã ghi điểm. Mất ba mạng kết thúc lượt và quay ngay về màn hình đầu, hiển thị số củ vừa xếp và kỷ lục. Bấm Bắt đầu để chơi lượt mới. Điểm là số củ đã xếp thành công trong lượt; củ rơi sau đó không trừ điểm đã ghi.

Khi vào chơi, dòng “Đủ 15 củ xe to ra” xuất hiện phía trên. Đạt 15 điểm, dòng chữ ẩn đi, thùng xe và mặt đỡ vật lý mở rộng chiều ngang một lần để chứa thêm củ; hai bánh tách riêng nên vẫn tròn. Khi chơi lượt mới, xe trở về kích thước ban đầu. Camera đi lên theo tháp. Củ ấu không tự di chuyển ngang. Củ mới có góc xoay ngẫu nhiên và luôn hiển thị phía dưới các củ đã thả; góc xoay được giữ nguyên khi thả. Màn hình đầu nhúng video YouTube và có nút Bắt đầu; game không có nút âm thanh. Kỷ lục lưu bằng localStorage; nếu trình duyệt chặn lưu trữ, game vẫn chơi được. Không có quay chậm hoặc chia sẻ điểm.

## GitHub Pages

1. Đẩy mã nguồn lên nhánh `main`.
2. Trong repository, mở **Settings → Pages → Source → GitHub Actions**.
3. Workflow `.github/workflows/pages.yml` sẽ cài dependencies bằng lockfile, build và triển khai `dist/` khi có push lên `main`; cũng có thể chạy thủ công trong Actions.

Không cần secret riêng. Chưa có deployment nào được thực hiện chỉ bằng việc tạo workflow này.

## Cấu trúc

- `src/main.js`: scene, vật lý, vòng chơi, UI và âm thanh.
- `src/assets/`: ảnh PNG trong suốt do người dùng cung cấp (`ca1png.png`: củ ấu, `ca2png.png`: trâu) và xe gỗ SVG. Ảnh giữ nguyên tỷ lệ, được đóng gói cùng game.
- `src/style.css`: khung hiển thị và hỗ trợ cảm ứng.
- `vite.config.js`: cấu hình build tĩnh.
- `.github/workflows/pages.yml`: build và triển khai Pages.

Củ ấu dùng đa giác lồi bám theo hai sừng nghiêng và đáy ảnh; tâm ảnh được căn với tâm vật lý để không bị nhảy vị trí khi thả. Đây là xấp xỉ va chạm. Có thể tinh chỉnh ma sát, tốc độ và thời gian ổn định trong scene sau các lượt chơi thử.

Phông Noto Sans được đóng gói cùng game (Latin và tiếng Việt, trọng lượng 400/700/800), không phụ thuộc Google Fonts hoặc phông cài trên máy. Canvas đợi tải phông trước khi tạo chữ.
