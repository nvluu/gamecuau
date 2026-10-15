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

Bấm **Bắt đầu**, chạm vùng chơi dưới thanh điểm hoặc nhấp chuột để thả củ đang di chuyển. Củ đứng ổn định được tính một điểm; củ tiếp theo xuất hiện ngay sau mỗi lần thả, ở vị trí ngang và hướng di chuyển ngẫu nhiên. Mỗi củ rơi khỏi xe xuống dưới vùng chơi mất một mạng, kể cả củ đã ghi điểm. Mất ba mạng kết thúc lượt và quay ngay về màn hình đầu, hiển thị số củ vừa xếp và kỷ lục. Bấm Bắt đầu để chơi lượt mới. Điểm là số củ đã xếp thành công trong lượt; củ rơi sau đó không trừ điểm đã ghi.

Camera đi lên theo tháp. Tốc độ di chuyển tăng theo số củ đã thả. Màn hình đầu nhúng video YouTube và có nút Bắt đầu; game không có nút âm thanh. Kỷ lục lưu bằng localStorage; nếu trình duyệt chặn lưu trữ, game vẫn chơi được. Không có quay chậm hoặc chia sẻ điểm.

## GitHub Pages

1. Đẩy mã nguồn lên nhánh `main`.
2. Trong repository, mở **Settings → Pages → Source → GitHub Actions**.
3. Workflow `.github/workflows/pages.yml` sẽ cài dependencies bằng lockfile, build và triển khai `dist/` khi có push lên `main`; cũng có thể chạy thủ công trong Actions.

Không cần secret riêng. Chưa có deployment nào được thực hiện chỉ bằng việc tạo workflow này.

## Cấu trúc

- `src/main.js`: scene, đồ họa, vật lý, vòng chơi, UI và âm thanh.
- `src/style.css`: khung hiển thị và hỗ trợ cảm ứng.
- `vite.config.js`: cấu hình build tĩnh.
- `.github/workflows/pages.yml`: build và triển khai Pages.

MVP dùng thân và hai sừng ghép thành vật thể vật lý để giữ nhận diện củ ấu. Đây là xấp xỉ va chạm, chưa phải đường cong chi tiết. Có thể tinh chỉnh ma sát, tốc độ và thời gian ổn định trong scene sau các lượt chơi thử.

Phông Noto Sans được đóng gói cùng game (Latin và tiếng Việt, trọng lượng 400/700/800), không phụ thuộc Google Fonts hoặc phông cài trên máy. Canvas đợi tải phông trước khi tạo chữ.
