# Cấu trúc hệ thống WoodSpec

```txt
src/
├─ app/
│  ├─ App.jsx
│  └─ router.jsx
├─ pages/
│  ├─ HomePage.jsx
│  ├─ DashboardPage.jsx
│  ├─ ConfiguratorPage.jsx
│  ├─ SpecReviewPage.jsx
│  ├─ QuotesPage.jsx
│  └─ NotFoundPage.jsx
├─ layouts/
│  ├─ MainLayout.jsx
│  └─ AppLayout.jsx
├─ features/
│  ├─ auth/
│  ├─ catalog/
│  ├─ configurator/
│  ├─ notifications/
│  └─ spec/
├─ components/
│  ├─ ui/
│  └─ common/
├─ data/
│  └─ reference/
├─ stores/
├─ utils/
├─ constants/
├─ main.jsx
└─ index.css
```

## Luồng sử dụng

1. Trang chủ giới thiệu quy trình cấu hình và báo giá.
2. Bảng điều khiển hiển thị danh sách sản phẩm.
3. Trang cấu hình cho phép chỉnh kích thước, vật liệu, màu và bố cục.
4. Trang rà soát tạo bảng thông số gửi xưởng.
5. Trang báo giá hiển thị các phương án tham khảo để so sánh.

## Nguyên tắc

- Bản vẽ sản phẩm dùng SVG và thay đổi theo thông số.
- Dữ liệu dài đặt trong `src/data/reference`.
- Trạng thái dùng chung đặt trong `src/stores`.
- Trang chỉ ghép thành phần, không chứa quá nhiều logic nghiệp vụ.
