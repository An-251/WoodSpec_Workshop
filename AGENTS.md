# Hướng dẫn làm việc với WoodSpec Workshop

WoodSpec Workshop là giao diện dành cho xưởng gỗ để tiếp nhận yêu cầu báo giá từ khách hàng, xem thông số sản phẩm và tạo báo giá.

## Nguyên tắc chính

- Giữ ứng dụng đơn giản, rõ ràng và dễ thao tác.
- Tập trung vào quy trình xử lý báo giá.
- Dùng tiếng Việt thống nhất trong toàn bộ giao diện.
- Không thêm tính năng ngoài phạm vi MVP.
- Dữ liệu tham khảo đặt trong `src/data/mock`.
- Mọi dữ liệu đều là mock và lưu bằng LocalStorage.

## Cấu trúc thư mục

- `src/pages`: các trang theo route.
- `src/features`: logic theo từng chức năng.
- `src/components/common`: component dùng chung.
- `src/components/ui`: shadcn/ui components.
- `src/stores`: state dùng chung.
- `src/utils`: helper functions.
- `src/constants`: constants.
- `src/data/mock`: dữ liệu giả lập.

## Chức năng hiện tại

- Đăng nhập giả lập.
- Dashboard.
- Danh sách yêu cầu báo giá.
- Xem chi tiết yêu cầu.
- Nhập báo giá.
- Xuất PDF báo giá.
- Gửi báo giá (mock).