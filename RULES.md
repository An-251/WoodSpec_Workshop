# Quy tắc phát triển WoodSpec

## Phạm vi

- Tập trung vào giao diện cấu hình nội thất gỗ và quy trình gửi báo giá.
- Không thêm máy chủ, cơ sở dữ liệu, thanh toán, thực tế tăng cường, dựng hình ba chiều hoặc xuất bản vẽ sản xuất nếu chưa được yêu cầu.
- Dữ liệu tham khảo đặt trong `src/data/reference`.

## Cấu trúc

- `src/pages`: trang theo tuyến đường.
- `src/features`: thành phần và logic theo chức năng.
- `src/components/common`: thành phần dùng chung.
- `src/components/ui`: thành phần giao diện nền tảng.
- `src/stores`: trạng thái dùng chung.
- `src/utils`: hàm tiện ích.
- `src/constants`: hằng số.

## Giao diện

- Dùng Tailwind CSS.
- Dùng thành phần shadcn/ui khi phù hợp.
- Dùng biểu tượng từ `lucide-react`.
- Dùng tiếng Việt thống nhất trong nội dung hiển thị.
- Bản vẽ sản phẩm phải dựng bằng SVG và cập nhật theo kích thước, màu, vật liệu, bố cục.

## Kiểm tra

Trước khi bàn giao, chạy:

```bash
npm run build
```
