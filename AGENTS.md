# Hướng dẫn làm việc với WoodSpec

WoodSpec là giao diện cấu hình và gửi yêu cầu báo giá cho sản phẩm nội thất gỗ.

## Nguyên tắc chính

- Giữ ứng dụng gọn, rõ và dễ dùng.
- Dùng tiếng Việt thống nhất trong nội dung người dùng nhìn thấy.
- Không nhắc trạng thái thử nghiệm trong giao diện hoặc tài liệu bàn giao.
- Dữ liệu tham khảo đặt trong `src/data/reference`.
- Bản vẽ sản phẩm dùng SVG hai chiều, không kéo giãn ảnh để mô phỏng kích thước.

## Cấu trúc thư mục

- `src/pages`: trang theo tuyến đường.
- `src/features`: logic và thành phần theo chức năng.
- `src/components/common`: thành phần dùng chung.
- `src/components/ui`: thành phần giao diện nền tảng.
- `src/stores`: trạng thái dùng chung.
- `src/utils`: hàm tiện ích.
- `src/constants`: hằng số.

## Phạm vi hiện tại

- Chọn mẫu sản phẩm.
- Cấu hình kích thước, vật liệu, màu và bố cục.
- Xem bản vẽ hai chiều.
- Tạo bảng thông số.
- So sánh báo giá tham khảo.
