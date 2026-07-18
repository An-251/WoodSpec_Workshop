# Cập Nhật Gần Nhất

## Cập nhật ngày 16/07/2026

- Xóa phần hiển thị template 2D còn sót trên trang chủ.
- Trang chủ không còn import dữ liệu bản vẽ/template 2D; phần mẫu nổi bật chuyển sang ảnh nội thất thật để giữ cảm giác showroom chuyên nghiệp.
- Sửa lỗi chữ tiếng Việt ở homepage bị tách dấu/khoảng cách bằng cách bỏ kiểu chữ serif ở các tiêu đề lớn và dùng hệ chữ sans ổn định hơn.
- Sửa menu trang chủ:
  - bỏ đường dẫn cũ `#problems` và `#features`;
  - chỉ giữ các mục đang có section thật: `#home`, `#collections`, `#process`, `#contact`;
  - sửa nhãn menu tiếng Việt có dấu.
- Xóa `id="contact"` trùng ở footer để liên kết “Liên hệ” trỏ đúng section liên hệ trong trang chủ.
- Sau khi đăng nhập, các card gợi ý trên dashboard chuyển từ bản vẽ 2D sang mô hình 3D rút gọn.
- Trang cấu hình sản phẩm chỉ còn mô hình 3D làm phần xem trước chính; đã bỏ khối bản vẽ 2D bên dưới.
- Trang rà soát thông số cũng chuyển preview sản phẩm sang mô hình 3D để đồng bộ trải nghiệm sau đăng nhập.
- Sửa phần “Phác thảo sản phẩm” thành “Phác thảo sản phẩm 3D” và chỉnh mô tả để khớp với luồng chỉnh trực tiếp trên mô hình 3D.
- Cập nhật mô tả trong form chi tiết từ “bản vẽ hai chiều” sang “mô hình 3D”.
- Cập nhật prompt hệ thống gửi Gemini để nhắc template được dùng cho mô hình 3D thay vì SVG.
- Xóa file preview 2D cũ vì không còn nơi nào trong ứng dụng sử dụng.

## Nội dung đã hoàn thành

- Thiết kế lại trang chủ theo phong cách showroom nội thất cao cấp:
  - hero dùng ảnh nội thất toàn màn hình, chữ serif lớn và lời giới thiệu rõ ràng;
  - thêm các khối nội dung theo hướng bộ sưu tập, mẫu nổi bật, quy trình và lời kêu gọi đăng nhập;
  - giữ tone gỗ, kem, nâu trầm và cam đất để đồng bộ với nhận diện WoodSpec;
  - bỏ cảm giác công cụ kỹ thuật khô cứng ở trang trước khi đăng nhập.
- Bổ sung ảnh nội thất thật cho trang chủ để tạo cảm giác chuyên nghiệp và trực quan hơn khi người dùng vừa vào web.
- Dọn phần CSS animation cũ của trang chủ không còn dùng sau khi chuyển sang bố cục showroom.
- Thêm thư viện `three` để dựng mô hình sản phẩm ba chiều trong trang cấu hình.
- Tạo component `Cabinet3DPreview` cho phần xem trước ba chiều:
  - dựng thân tủ, hông, nóc, đáy, hậu, đợt kệ và vách chia;
  - hiển thị cánh, hộc kéo, tay nắm, khe thoáng, lỗ luồn dây, nẹp chân và đệm ngồi theo cấu hình;
  - phản ánh kích thước, vật liệu, màu hoàn thiện, số ô, số hàng và độ dày ván từ dữ liệu hiện tại;
  - hỗ trợ thao tác kéo ngang để xoay góc nhìn sản phẩm.
- Đưa mô hình ba chiều lên làm phần xem trước chính trong trang cấu hình sản phẩm.
- Giữ bản vẽ SVG hai chiều bên dưới mô hình ba chiều để dùng như bản vẽ kỹ thuật và phục vụ bảng thông số.
- Chỉnh lại layout trang cấu hình trong khu vực có sidebar để tránh canvas ba chiều bị tràn ngang.
- Giữ phần chỉnh chi tiết hiện có để người dùng có thể sửa từng phần sau khi đã đối đáp với AI và chọn mẫu:
  - kiểu mặt/cánh;
  - kiểu tay nắm;
  - kiểu kệ/khoang;
  - hậu sản phẩm;
  - số ô theo chiều ngang;
  - số ô theo chiều cao;
  - độ dày ván;
  - độ dày cánh;
  - độ dày đợt/kệ;
  - lỗ luồn dây;
  - khe thoáng;
  - nẹp chân/đế;
  - đệm ngồi.
- Tiếp tục giữ luồng AI hiện tại:
  - người dùng đối đáp bằng văn bản hoặc giọng nói;
  - Gemini tổng hợp câu trả lời thành prompt ngắn gọn;
  - hệ thống chỉ hiển thị mẫu sau khi người dùng đã đối đáp hoặc chốt prompt;
  - nếu Gemini không tạo được mẫu riêng, hệ thống dùng bộ mẫu nội bộ phù hợp.

## File đã chỉnh

- `package.json`
- `package-lock.json`
- `src/pages/HomePage.jsx`
- `src/index.css`
- `src/pages/ConfiguratorPage.jsx`
- `src/features/configurator/components/Cabinet3DPreview.jsx`
- `src/features/configurator/components/Cabinet3DCardPreview.jsx`
- `src/features/configurator/components/ConfigSidebar.jsx`
- `src/features/configurator/components/InteriorDetailForm.jsx`
- `src/features/catalog/components/DashboardDesignAssistant.jsx`
- `src/pages/SpecReviewPage.jsx`
- `src/layouts/MainLayout.jsx`
- `src/config/navigation.jsx`
- `src/services/geminiInterviewService.js`
- `docs/LATEST_UPDATE.md`

## File đã xóa

- `src/features/configurator/components/Cabinet2DPreview.jsx`

## Đã kiểm tra

- `npm.cmd run lint` chạy thành công.
- `npm.cmd run build` chạy thành công.
- Đã mở trang chủ trên trình duyệt local và xác nhận hero cùng ảnh nội thất tải được.
- Đã đăng nhập qua giao diện, vào trang cấu hình và xác nhận canvas ba chiều xuất hiện, có kích thước hiển thị hợp lệ và không có lỗi console.
- Build còn cảnh báo bundle lớn hơn 500 kB do thêm Three.js; cảnh báo này không chặn ứng dụng chạy.
