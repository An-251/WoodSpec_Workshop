# Form Luồng Khách Hàng WoodSpec

Tài liệu này mô tả các bước khách hàng đi từ đăng nhập, tạo sản phẩm, gửi bảng thông số cho xưởng đến đặt cọc, theo dõi sản xuất, giao hàng và hoàn tất đơn hàng.

## 1. Đăng nhập vào WoodSpec

- Khách hàng mở ứng dụng WoodSpec.
- Khách hàng bấm đăng nhập.
- Hệ thống xác nhận tài khoản và đưa khách hàng vào bảng điều khiển.
- Dữ liệu cần ghi nhận:
  - thời điểm đăng nhập;
  - thiết bị sử dụng;
  - người dùng có đăng nhập thành công hay không.

## 2. Bắt đầu trò chuyện với trợ lý thiết kế

- Khách hàng nhập hoặc nói nhu cầu bằng ngôn ngữ tự nhiên.
- Ví dụ: “Tôi cần tủ giày cho lối vào, chứa khoảng 20 đôi, có chỗ ngồi và nhìn kín gọn.”
- Trợ lý hỏi thêm nếu thông tin còn thiếu.
- Hệ thống tóm tắt nhu cầu thành prompt ngắn gọn.
- Dữ liệu cần ghi nhận:
  - nội dung khách hàng nhập;
  - số lượt trao đổi;
  - thời gian từ lúc bắt đầu đến lúc có mẫu đề xuất;
  - prompt cuối cùng.

## 3. Hệ thống đề xuất mẫu sản phẩm

- Hệ thống dùng prompt đã chốt để chọn mẫu phù hợp trong thư viện.
- Nếu có nhiều mẫu phù hợp, khách hàng xem các mẫu đề xuất và chọn một mẫu.
- Nếu thông tin mô tả có kích thước hoặc chi tiết rõ ràng, hệ thống tự áp dụng vào mẫu trước khi khách hàng vào cấu hình.
- Dữ liệu cần ghi nhận:
  - mẫu được đề xuất;
  - mẫu khách hàng chọn;
  - mức độ khớp giữa prompt và mẫu;
  - khách hàng có cần đổi mẫu hay không.

## 4. Cấu hình sản phẩm trên mô hình 3D

- Khách hàng xem mô hình 3D của sản phẩm đã chọn.
- Khách hàng có thể xoay, phóng to, thu nhỏ và bấm vào từng phần để chỉnh.
- Các nhóm chỉnh chính:
  - tổng thể;
  - vật liệu;
  - thân tủ;
  - kệ và khoang;
  - cánh tủ;
  - ngăn kéo;
  - tay nắm;
  - hậu tủ;
  - chân hoặc đế;
  - thông tin gửi xưởng.
- Dữ liệu cần ghi nhận:
  - chi tiết nào được bấm nhiều nhất;
  - thông số nào được chỉnh;
  - số lần thay đổi kích thước;
  - khách hàng có ẩn/mở bảng chỉnh chi tiết hay không.

## 5. Kiểm tra thông tin gửi xưởng

- Khách hàng nhập các thông tin mà khách hàng có thể trả lời.
- Các thông tin nên hỏi:
  - vị trí đặt sản phẩm;
  - công năng sử dụng;
  - số ngăn, số tầng, số cánh mong muốn;
  - phụ kiện mong muốn;
  - hình tham khảo;
  - ngân sách dự kiến;
  - thời gian mong muốn;
  - điều kiện lắp đặt;
  - khu vực gửi báo giá.
- Không hiển thị các thông tin quá chuyên môn như mã phụ kiện, dung sai cắt, liên kết kỹ thuật hoặc danh sách cắt chi tiết.
- Dữ liệu cần ghi nhận:
  - trường nào khách hàng điền đầy đủ;
  - trường nào bị bỏ trống;
  - khách hàng mất bao lâu để hoàn tất phần gửi xưởng.

## 6. Rà soát bảng thông số

- Khách hàng xem lại cấu hình đã chọn.
- Trang này hiển thị ảnh xem nhanh tĩnh thay vì mô hình 3D tương tác.
- Hệ thống hiển thị:
  - tên sản phẩm;
  - kích thước;
  - vật liệu;
  - màu hoàn thiện;
  - giá ước tính;
  - các yêu cầu khách hàng đã cung cấp;
  - lưu ý gửi xưởng.
- Dữ liệu cần ghi nhận:
  - khách hàng có quay lại sửa cấu hình hay không;
  - nhóm thông tin nào khiến khách hàng quay lại sửa;
  - thời gian rà soát trước khi gửi báo giá.

## 7. Gửi yêu cầu báo giá cho xưởng

- Khách hàng bấm gửi yêu cầu báo giá.
- Hệ thống kiểm tra thông tin bắt buộc.
- Nếu còn thiếu, hệ thống báo rõ phần cần bổ sung.
- Nếu đủ, hệ thống tạo yêu cầu báo giá và gửi tới danh sách xưởng phù hợp.
- Dữ liệu cần ghi nhận:
  - yêu cầu gửi thành công hay thất bại;
  - lỗi thiếu thông tin nếu có;
  - thời điểm gửi yêu cầu;
  - số xưởng được gửi yêu cầu.

## 8. So sánh báo giá và chốt xưởng

- Khách hàng xem danh sách báo giá từ các xưởng.
- Mỗi báo giá nên có:
  - giá dự kiến;
  - thời gian hoàn thành;
  - vật liệu đề xuất;
  - bảo hành;
  - ghi chú từ xưởng.
- Khách hàng chọn một xưởng để tiếp tục.
- Dữ liệu cần ghi nhận:
  - xưởng được chọn;
  - báo giá được chọn;
  - tiêu chí khách hàng ưu tiên: giá, thời gian, bảo hành hoặc uy tín.

## 9. Thanh toán khoản đặt cọc đầu tiên

- Sau khi chọn xưởng, khách hàng xem số tiền đặt cọc cần thanh toán.
- Hệ thống hiển thị:
  - tổng giá trị báo giá;
  - phần trăm đặt cọc;
  - số tiền đặt cọc;
  - phương thức thanh toán;
  - điều kiện hoàn hoặc hủy cọc.
- Khách hàng thanh toán khoản đặt cọc.
- Xưởng nhận thông báo đã có đặt cọc.
- Xưởng xác nhận bắt đầu xử lý đơn hàng.
- Dữ liệu cần ghi nhận:
  - thời điểm tạo yêu cầu đặt cọc;
  - số tiền đặt cọc;
  - trạng thái thanh toán;
  - thời điểm xưởng xác nhận đã nhận cọc.

## 10. Cập nhật tiến độ sản xuất

- Xưởng cập nhật tiến độ theo từng giai đoạn hoặc hạng mục.
- Các giai đoạn gợi ý:
  - xác nhận thông số cuối;
  - chuẩn bị vật liệu;
  - cắt ván;
  - làm khung;
  - làm chân bàn hoặc chân tủ;
  - làm mặt bàn hoặc thân tủ;
  - làm cánh tủ, ngăn kéo hoặc khoang kệ;
  - xử lý bề mặt;
  - hoàn thiện sản phẩm;
  - kiểm tra chất lượng;
  - đóng gói.
- Dữ liệu cần ghi nhận:
  - giai đoạn hiện tại;
  - phần trăm hoàn thành;
  - hình ảnh cập nhật từ xưởng;
  - ghi chú của xưởng;
  - thời gian dự kiến hoàn thành giai đoạn tiếp theo.

## 11. Nhận hàng và thanh toán phần còn lại

- Khi sản phẩm hoàn thiện, xưởng cập nhật trạng thái giao hàng.
- Khách hàng nhận hàng và kiểm tra sản phẩm theo bảng thông số đã chốt.
- Nếu sản phẩm đúng yêu cầu, khách hàng xác nhận đã nhận đúng hàng.
- Sau khi xác nhận đúng hàng, khách hàng thanh toán toàn bộ khoản còn lại.
- Hệ thống hiển thị:
  - trạng thái giao hàng;
  - thời điểm giao hàng;
  - số tiền đã đặt cọc;
  - số tiền còn lại cần thanh toán;
  - thời điểm khách hàng xác nhận nhận hàng;
  - thời điểm thanh toán phần còn lại.
- Dữ liệu cần ghi nhận:
  - thời điểm bàn giao cho vận chuyển;
  - trạng thái giao hàng;
  - thời gian giao thực tế;
  - xác nhận khách hàng đã nhận hàng;
  - trạng thái thanh toán phần còn lại.

## 12. Xử lý yêu cầu thay đổi nếu phát sinh

- Khách hàng có thể trao đổi với xưởng nếu cần làm rõ hoặc thay đổi trong quá trình sản xuất.
- Mọi thay đổi phải được hai bên xác nhận lại trước khi áp dụng.
- Mỗi yêu cầu thay đổi cần có:
  - nội dung thay đổi;
  - thông số bị ảnh hưởng;
  - chi phí phát sinh nếu có;
  - thời gian phát sinh nếu có;
  - xác nhận của khách hàng;
  - xác nhận của xưởng.
- Dữ liệu cần ghi nhận:
  - số yêu cầu thay đổi;
  - trạng thái từng yêu cầu: đang chờ, đã duyệt, hoặc từ chối  đã áp dụng;
  - chi phí phát sinh;
  - số ngày phát sinh;
  - lịch sử xác nhận của hai bên.

## 13. Hoàn tất đơn hàng và tính số tiền xưởng thực nhận

- Đơn hàng được xem là thành công khi:
  - sản phẩm đã giao đến khách hàng;
  - khách hàng xác nhận đã nhận hàng;
  - không còn khiếu nại đang mở;
  - khoản thanh toán còn lại đã hoàn tất.
- WoodSpec khấu trừ hoa hồng sau khi đơn hàng thành công.
- Công thức gợi ý:

```text
Tổng giá trị đơn hàng = Giá báo giá cuối + Chi phí phát sinh đã được duyệt
Hoa hồng WoodSpec = Tổng giá trị đơn hàng x Tỷ lệ hoa hồng
Phí thanh toán = Tổng giá trị đơn hàng x Tỷ lệ phí thanh toán
Số tiền xưởng thực nhận = Tổng giá trị đơn hàng - Hoa hồng WoodSpec - Phí thanh toán
```

- Ví dụ:

```text
Tổng giá trị đơn hàng: 10.000.000 đ
Hoa hồng WoodSpec: 8% = 800.000 đ
Phí thanh toán: 1% = 100.000 đ
Số tiền xưởng thực nhận: 10.000.000 - 800.000 - 100.000 = 9.100.000 đ
```

- Dữ liệu cần ghi nhận:
  - tổng giá trị đơn hàng;
  - chi phí phát sinh đã duyệt;
  - tỷ lệ hoa hồng;
  - số tiền hoa hồng;
  - phí thanh toán;
  - số tiền xưởng thực nhận;
  - trạng thái quyết toán.

## Trạng thái chính của đơn hàng

```text
Đã đăng nhập
-> Đã mô tả nhu cầu
-> Đã chọn mẫu
-> Đã cấu hình sản phẩm
-> Đã rà soát bảng thông số
-> Đã gửi yêu cầu báo giá
-> Đã chọn xưởng
-> Đã đặt cọc
-> Đang sản xuất
-> Đang giao hàng
-> Đã nhận hàng
-> Đã hoàn tất
-> Đã quyết toán cho xưởng
```

## Dữ liệu nên thu để phục vụ khảo sát

- Thời gian hoàn thành từng bước.
- Số lần khách hàng quay lại sửa.
- Số lượt tương tác với trợ lý thiết kế.
- Số mẫu khách hàng xem trước khi chọn.
- Các thông số khách hàng chỉnh nhiều nhất.
- Tỷ lệ gửi yêu cầu báo giá thành công.
- Tỷ lệ khách hàng chọn xưởng sau khi xem báo giá.
- Tỷ lệ đặt cọc thành công.
- Số yêu cầu thay đổi trong quá trình sản xuất.
- Thời gian từ đặt cọc đến giao hàng.
- Tỷ lệ đơn hàng hoàn tất.
