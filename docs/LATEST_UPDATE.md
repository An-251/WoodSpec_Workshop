# Cập Nhật Gần Nhất

## Cập nhật ngày 18/07/2026

### Tắt tự đọc câu hỏi và ổn định khung 3D responsive

- Xóa hoàn toàn phần tự đọc câu hỏi bằng `speechSynthesis` trong trợ lý thiết kế để ứng dụng không tự phát giọng nói khi AI hỏi tiếp.
- Giữ lại nút `Nói` và luồng nhận diện giọng nói bằng Web Speech API để khách hàng vẫn có thể nhập nhu cầu bằng giọng nói.
- Cập nhật cleanup của trợ lý để chỉ dừng nhận diện giọng nói khi rời trang hoặc làm lại cuộc trò chuyện, không còn gọi thao tác đọc câu hỏi.
- Tối ưu canvas mô hình 3D để luôn bám `100%` chiều rộng và chiều cao của khung chứa, tránh lệch tỉ lệ trên các máy có DPI hoặc kích thước màn hình khác nhau.
- Thêm cơ chế tự tính khoảng cách camera theo bounding box của sản phẩm và lon Coca tham chiếu, giúp bàn, tủ và kệ luôn nằm trọn trong khung xem thay vì bị cắt mất một góc.
- Cập nhật resize 3D bằng kích thước thực của container và giới hạn pixel ratio, giúp khung 3D ổn định hơn trên laptop, màn hình ngoài và các trình duyệt khác nhau.

### Đăng nhập bằng email và ghi log khảo sát

- Đọc tài liệu hướng dẫn ghi interaction log trong `D:\1.ky7\EXE101\cp3\message.txt`.
- Đổi trang đăng nhập sang luồng chỉ nhập email, bỏ hoàn toàn ô tài khoản và mật khẩu.
- Khi người dùng nhập email hợp lệ, hệ thống tạo `sessionId`, lưu phiên khảo sát và cho vào khu vực khách hàng.
- Thêm cấu hình `VITE_INTERACTION_API_URL=http://localhost:5500` vào `.env` và `.env.example` để frontend biết backend ghi log.
- Thêm service `interactionApi` để gửi session, gửi event, kết thúc session, gửi disconnect bằng `navigator.sendBeacon` và hỗ trợ đọc lại log khi cần.
- Thêm service `testSessionService` để quản lý phiên khảo sát theo email, tạo event `login`, `app_login`, `logout`, `disconnect` và các event thao tác.
- Thêm `TestSessionTracker` để tự ghi `route_view`, `click`, `visibility_hidden` và `disconnect` trong quá trình khách dùng ứng dụng.
- Gắn tracker vào khu vực khách hàng để sau khi đăng nhập bằng email, mọi thao tác chính được ghi theo session hiện tại.
- Đổi phần hiển thị người dùng trong sidebar sang email và trạng thái “Phiên đang ghi log”.
- Khi đăng xuất, hệ thống gửi event `logout`, đánh dấu session kết thúc và xóa session local.
- Dọn trang hướng dẫn đăng ký cũ để không còn hiển thị tài khoản/mật khẩu được cấp.
- Xóa file tài khoản cứng cũ vì không còn dùng trong luồng khảo sát.

## Cập nhật ngày 17/07/2026

### Tinh gọn rà soát thông số và luồng đặt cọc

- Xóa khối “Ảnh 3D xem nhanh” khỏi trang rà soát thông số để trang này chỉ tập trung vào thông tin khách đã chọn, brief từ trợ lý và các yêu cầu cần gửi xưởng.
- Khi khách hàng bấm chọn xưởng, hệ thống hiển thị thông báo cần chốt bảng thông số cuối trước khi xác nhận xưởng và tiếp tục đặt cọc.
- Thêm cảnh báo trực tiếp ngay trong khối xưởng đã chọn nếu bảng thông số cuối chưa được xác nhận.
- Sửa thao tác bấm lại vào xưởng đang chọn để không làm mất trạng thái chốt thông số cuối.
- Đơn giản hóa luồng đặt cọc: khách hàng bấm “Thanh toán đặt cọc” là có thể xem tiếp tiến trình sản xuất, không cần bước xưởng xác nhận đã nhận cọc.
- Dọn nút và nội dung “xưởng xác nhận đã nhận cọc” khỏi trang theo dõi đơn hàng.
- Đổi các thao tác giao hàng/nhận hàng sang góc nhìn khách hàng: khách xác nhận đã nhận hàng, kiểm tra đúng thông số và thanh toán phần còn lại.
- Xóa các dòng quyết toán nội bộ như hoa hồng, phí thanh toán và xưởng thực nhận khỏi trang khách hàng để giao diện không bị lệch vai trò.

### Bổ sung bản in tài liệu gửi xưởng

- Sửa nút “In tài liệu” trên trang rà soát thông số để khi bấm sẽ mở hộp thoại in của trình duyệt, người dùng có thể chọn “Lưu dưới dạng PDF”.
- Tạo bố cục in riêng khổ A4, chỉ giữ nội dung cần gửi xưởng và ẩn sidebar, nút bấm, bố cục ứng dụng khi xuất PDF.
- Thêm phần “Hình 3D xem nhanh” vào tài liệu in, dùng hình 3D của cấu hình hiện tại thay cho hình minh họa cũ.
- Thêm bảng “Brief từ cuộc trò chuyện AI” để ghi lại nhu cầu ban đầu, vật dụng khách muốn làm, không gian đặt, công năng, số ngăn/tầng/cánh, phụ kiện, điều kiện lắp đặt, ngân sách, thời gian và khu vực.
- Hiển thị brief này ngay trên trang rà soát để khách hàng và xưởng cùng kiểm tra ngữ cảnh trước khi đọc bảng thông số chi tiết.
- Sửa lại nội dung tiếng Việt trên trang rà soát thông số cho rõ ràng và thống nhất hơn.
- Gắn hành động cho nút “Chia sẻ”: ưu tiên Web Share API nếu trình duyệt hỗ trợ, nếu không thì sao chép thông tin tóm tắt và đường dẫn hiện tại.

### Cập nhật theo góp ý của thầy về trải nghiệm và thước đo

- Đọc lại đoạn góp ý của thầy và chốt các điểm cần ưu tiên cho MVP:
  - giao diện trò chuyện phải giống khung chat quen thuộc, không bắt người dùng học một flow mới;
  - người dùng cần có sản phẩm cơ bản thật nhanh, phần tinh chỉnh chi tiết để sau;
  - mô hình 3D phải được dựng theo từng mảnh để khách hàng bấm vào chi tiết và chỉnh trực tiếp;
  - dữ liệu trò chuyện cần được tóm tắt thành brief dễ hiểu cho thợ mộc;
  - mô hình cần có vật tham chiếu quen thuộc để người dùng hình dung đúng tỉ lệ.
- Thay người tham chiếu trong cảnh 3D bằng model lon Coca do người dùng cung cấp.
- Chuẩn hóa lon Coca theo kích thước thực tế gần đúng của lon 330 ml: cao khoảng 11,5 cm, đường kính khoảng 6,6 cm.
- Hiển thị một lon Coca kích thước thật cạnh chân sản phẩm, kèm nhãn “1 lon = 11,5 cm” để người dùng có vật quen thuộc so tỉ lệ nhanh hơn.
- Dùng model `coca-reference.glb` dung lượng khoảng 1,17 MB, không cần Draco hoặc bước nén bổ sung.
- Dọn model người tham chiếu và bộ giải mã Draco khỏi thư mục public vì không còn dùng trong luồng hiện tại.
- Gỡ dependency nén GLB cũ khỏi dự án để bản build gọn hơn.
- Bỏ khối giá ước tính và nút thao tác khỏi ngay dưới mô hình 3D để khu vực xem/chỉnh mô hình không bị phân tâm.
- Thêm khả năng đóng/mở bảng “Chỉnh chi tiết”, giúp người dùng mở rộng không gian xem mô hình khi cần.
- Đổi các thông số người dùng chỉnh trong bảng chi tiết từ milimét sang centimét; dữ liệu nội bộ vẫn giữ milimét để mô hình và bảng kỹ thuật chính xác.
- Bỏ thanh thước gỗ trong mô hình 3D, chỉ giữ một lon Coca kích thước thật làm vật tham chiếu nhẹ nhàng.
- Chỉnh lại chiều cao trang cấu hình để khung mô hình 3D vừa màn hình hơn, hạn chế việc người dùng phải cuộn mới xem hết.
- Canh lại camera 3D về tâm sản phẩm và kéo góc nhìn gần hơn, giúp sản phẩm vẫn nằm giữa khu xem khi bảng chỉnh chi tiết được ẩn.
- Sửa logic “Đợt ngang”: không hiển thị “Số ô theo chiều ngang” khi bố cục không có ô chia dọc; chỉ giữ số đợt/tầng và độ dày kệ.
- Giới hạn “Đệm ngồi phía trên” chỉ cho tủ giày thấp, tránh hiện tùy chọn vô lý trên kệ sách, tủ cao hoặc các template không phù hợp.
- Loại bỏ kiểu mặt/cánh dạng lai giữa khoang mở và khoang kín vì lựa chọn này gây nhiều lỗi hiển thị và khó giải thích với khách hàng.
- Thêm lớp chuẩn hóa dữ liệu cấu hình để template hoặc câu trả lời AI có thông số không hợp logic thì hệ thống tự bỏ phần không phù hợp trước khi dựng mô hình.
- Tách lại bảng chỉnh chi tiết theo đúng ngữ cảnh: phần cánh tủ và ngăn kéo không còn lặp tùy chọn tay nắm; phần thân tủ không còn chứa hậu tủ hoặc chân đế.
- Chỉnh nút cuối bảng chi tiết để lần đầu đưa người dùng sang phần thông tin gửi xưởng, còn khi đã ở phần này thì bấm tiếp sẽ chuyển sang trang rà soát thông số.
- Thay mô hình 3D tương tác trên trang rà soát bằng ảnh xem nhanh tĩnh, giúp trang rà soát tập trung vào thông tin cần xác nhận trước khi gửi báo giá.
- Viết form luồng khách hàng từ đăng nhập, đối đáp với trợ lý, chọn mẫu, cấu hình, gửi xưởng, đặt cọc, theo dõi sản xuất, giao hàng đến hoàn tất đơn hàng và tính số tiền xưởng thực nhận trong `docs/WOODSPEC_ORDER_FLOW_FORM.md`.
- Bổ sung luồng thật trong ứng dụng sau bước chọn xưởng: đặt cọc, xưởng xác nhận cọc, cập nhật tiến độ sản xuất, giao hàng, khách xác nhận nhận đúng hàng và thanh toán phần còn lại.
- Thêm trang “Theo dõi đơn hàng” vào khu vực khách hàng để mô phỏng các trạng thái sau khi bảng thông số cuối đã được chốt.
- Tách bộ chỉnh chi tiết riêng cho bàn học, không còn dùng nhóm của tủ như cánh tủ, hậu tủ, kệ và khoang; mô hình 3D của bàn học có thể bấm vào mặt bàn, chân bàn, hộc bàn, ngăn kéo và tay nắm.
- Sửa mô hình bàn học: bỏ vân gỗ bị vẽ sai trong khoảng ngồi và thêm chân bàn trước/sau rõ hơn để không còn cảm giác bàn bị thiếu chân.

### Chỉnh logic mô hình 3D theo phản hồi mới

- Thêm lớp áo, quần và giày dạng mesh nhẹ cho người tham chiếu 1,7 m để không còn hiển thị như model giải phẫu thô.
- Đổi hướng người tham chiếu để khi mở góc nhìn chuẩn, người đứng cùng chiều quan sát với sản phẩm.
- Sửa lỗi khi chuột rời khỏi vùng mô hình hoặc bấm hụt vào nền thì hệ thống tự chuyển phần đang chọn về “Tổng thể”.
- Khi người dùng chọn “Hậu tủ” hoặc “Lỗ luồn dây”, camera tự xoay ra phía sau sản phẩm để đúng ngữ cảnh chỉnh mặt hậu.
- Di chuyển lỗ luồn dây từ mặt trước về mặt hậu tủ, đúng với logic lắp đặt thực tế.
- Giữ nguyên chi tiết đang chọn khi người dùng thao tác trên bảng thông số, tránh cảm giác mô hình tự nhảy trạng thái.

## Cập nhật ngày 16/07/2026

### Cập nhật theo góp ý mới

- Đổi slogan trong khu vực trợ lý thiết kế thành: “WoodSpec biến ý tưởng nội thất gỗ thành thiết kế sẵn sàng báo giá.”
- Bỏ khối hiển thị “Cuộc trò chuyện nhanh” khỏi giao diện để phần trò chuyện gọn và sang hơn.
- Bỏ khối “Prompt đã chốt” khỏi giao diện người dùng. Prompt vẫn được xử lý trong nền để đề xuất mẫu, nhưng không làm rối màn hình.
- Giữ cơ chế tự xử lý nhanh trong nền để người dùng không phải thao tác nhiều sau khi đã mô tả nhu cầu.
- Thêm mô hình người tham chiếu cao khoảng 170 cm trong cảnh 3D để người dùng dễ hình dung tỉ lệ chiều cao và chiều rộng của sản phẩm.
- Nén model người tham chiếu từ khoảng 260 MB xuống còn khoảng 12 MB trước khi đưa vào ứng dụng.
- Thêm bộ giải mã Draco để tải model người đã nén trong trình duyệt.
- Thay người tham chiếu tự dựng bằng model người GLB thật do người dùng cung cấp.
- Chuẩn hóa model người về chiều cao 1,7 m và đặt cạnh sản phẩm như một thước đo trực quan.
- Nâng tương tác mô hình 3D:
  - kéo ngang/dọc để xoay góc nhìn quanh sản phẩm;
  - hỗ trợ xoay 360 độ quanh vật dụng;
  - cuộn chuột để phóng to/thu nhỏ;
  - thêm nút phóng to, thu nhỏ và đưa góc nhìn về trạng thái chuẩn.
- Đảo lại chiều kéo chuột để thao tác xoay camera tự nhiên hơn.
- Tối ưu lại việc chọn chi tiết 3D để đổi phần đang chọn mà không phải dựng lại toàn bộ cảnh 3D.

### Trợ lý thiết kế dạng hội thoại

- Thay phần hỏi đáp từng câu bằng giao diện trò chuyện giống ứng dụng nhắn tin.
- Người dùng chỉ cần nhập hoặc nói nhu cầu tự nhiên, ví dụ: muốn làm tủ giày cho lối vào, sức chứa bao nhiêu đôi, thích kín hay thoáng, có cần chỗ ngồi hay không.
- Thêm bộ đếm 30 giây cho cuộc trò chuyện nhanh. Khi đủ dữ liệu hoặc hết thời gian, hệ thống tự chốt nhu cầu và hiển thị mẫu phù hợp.
- Thêm nút “Tạo mẫu ngay” để người dùng bỏ qua phần hỏi tiếp nếu cảm thấy thông tin đã đủ.
- Giữ hỗ trợ nhập giọng nói bằng Web Speech API.
- Khi có Gemini API, hệ thống dùng Gemini để hỏi tiếp theo ngữ cảnh, tổng hợp prompt và tạo thêm một mẫu riêng phù hợp với mô tả.
- Khi chưa có Gemini API hoặc Gemini không phản hồi, hệ thống tự chuyển sang bộ hỏi đáp nội bộ và vẫn đề xuất mẫu có sẵn.
- Không hiển thị sẵn mẫu trước khi người dùng bắt đầu trò chuyện hoặc tạo mẫu.

### Chỉnh mô hình 3D theo từng chi tiết

- Trang cấu hình sản phẩm không còn dùng sidebar phác thảo dài.
- Mô hình 3D trở thành khu vực thao tác chính.
- Người dùng có thể bấm trực tiếp vào từng phần trên mô hình 3D để chọn nhóm chi tiết cần chỉnh.
- Các phần có thể chọn gồm:
  - tổng thể;
  - vật liệu;
  - thân tủ;
  - kệ và khoang;
  - cánh tủ;
  - ngăn kéo;
  - tay nắm;
  - hậu tủ;
  - chân/đế;
  - lỗ luồn dây;
  - đệm ngồi;
  - thông tin gửi xưởng.
- Thêm hiệu ứng nhận diện phần đang chọn trên mô hình 3D.
- Thêm bảng “Chỉnh chi tiết” ở cạnh mô hình. Bảng này chỉ hiển thị thông số liên quan đến phần đang chọn, giúp người dùng không phải kéo qua một danh sách quá dài.
- Các thông số có thể chỉnh trực tiếp gồm:
  - chiều ngang, chiều cao, chiều sâu;
  - vật liệu và màu hoàn thiện;
  - độ dày ván;
  - độ dày cánh;
  - độ dày đợt/kệ;
  - số ô theo chiều ngang;
  - số ô theo chiều cao;
  - kiểu kệ/khoang;
  - kiểu mặt/cánh;
  - kiểu tay nắm;
  - hậu sản phẩm;
  - khe thoáng;
  - lỗ luồn dây;
  - nẹp chân/đế;
  - đệm ngồi;
  - thông tin khách hàng cần gửi xưởng.

### Dữ liệu tương tác thô

- Tạo module nền `src/features/rid/ridTracker.js` để chuẩn bị ghi dữ liệu tương tác thô cho giai đoạn khảo sát.
- Module này có khả năng ghi:
  - phiên sử dụng;
  - lượt chuyển trang;
  - thao tác nhấp chuột;
  - tọa độ nhấp chuột để phục vụ bản đồ nhiệt;
  - thay đổi trường nhập;
  - gửi biểu mẫu;
  - trạng thái hoàn thành nhiệm vụ;
  - xuất dữ liệu JSON/CSV;
  - gửi dữ liệu về endpoint ngoài nếu cấu hình `VITE_RID_ENDPOINT`.
- Phần này mới là lớp nền kỹ thuật, chưa đưa nút xuất dữ liệu vào giao diện để tránh làm rối trải nghiệm cấu hình sản phẩm.

## File đã chỉnh

- `src/features/catalog/components/DashboardDesignAssistant.jsx`
- `src/features/configurator/components/Cabinet3DPreview.jsx`
- `src/features/configurator/components/PartInspectorPanel.jsx`
- `src/pages/ConfiguratorPage.jsx`
- `src/pages/SpecReviewPage.jsx`
- `src/pages/QuotesPage.jsx`
- `src/pages/OrderProgressPage.jsx`
- `src/stores/useConfiguratorStore.js`
- `src/pages/LoginPage.jsx`
- `src/pages/RegisterPage.jsx`
- `src/stores/useAuthStore.js`
- `src/services/interactionApi.js`
- `src/services/testSessionService.js`
- `src/components/common/TestSessionTracker.jsx`
- `src/layouts/AppLayout.jsx`
- `src/index.css`
- `.env`
- `.env.example`
- `src/features/rid/ridTracker.js`
- `public/models/coca-reference.glb`
- `package-lock.json`
- `docs/LATEST_UPDATE.md`

## Đã kiểm tra

- `npm.cmd run lint` chạy thành công.
- `npm.cmd run build` chạy thành công.
- Build vẫn có cảnh báo bundle lớn do thư viện Three.js, nhưng cảnh báo này không chặn ứng dụng chạy.
