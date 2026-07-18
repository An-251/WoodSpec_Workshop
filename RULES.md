# Quy tắc phát triển WoodSpec Workshop

## Phạm vi

Chỉ xây dựng frontend cho Workshop Dashboard.

Không thêm:

- Backend
- Database
- Firebase
- Supabase
- API thật
- Authentication thật
- Thanh toán
- Chat realtime
- ThreeJS
- Canvas
- WebSocket

Dữ liệu sử dụng LocalStorage hoặc mock data.

---

## Công nghệ

- React
- Vite
- Tailwind CSS v4
- shadcn/ui
- React Router
- Lucide React
- React Hook Form
- Zod
- Sonner
- jsPDF
- html2canvas

---

## Cấu trúc

- `src/pages`
- `src/features`
- `src/components/common`
- `src/components/ui`
- `src/stores`
- `src/utils`
- `src/constants`
- `src/data/mock`

Không viết toàn bộ logic trong một file.

Ưu tiên chia component nhỏ.

---

## Dashboard

Dashboard gồm:

- Tổng số yêu cầu
- Đang chờ xử lý
- Đã báo giá
- Đã hoàn thành

Danh sách yêu cầu hiển thị dạng Table hoặc Card.

---

## Request

Request Detail gồm:

- Thông tin khách hàng
- Thông số sản phẩm
- Kích thước
- Vật liệu
- Màu sắc
- Ghi chú
- File đính kèm (mock)

Không chỉnh sửa thông tin khách hàng.

---

## Quotation

Quotation Form gồm:

- Chi phí vật liệu
- Chi phí nhân công
- Chi phí phụ kiện
- Chi phí vận chuyển
- Giảm giá
- Tổng tiền
- Thời gian hoàn thành
- Bảo hành
- Ghi chú

Có Preview trước khi xuất PDF.

---

## PDF

Xuất PDF bằng:

- jsPDF
- html2canvas

PDF gồm:

- Logo Workshop
- Thông tin khách hàng
- Thông số sản phẩm
- Chi tiết báo giá
- Điều khoản
- Chữ ký Workshop

---

## Authentication

Đây là MVP.

Không có Authentication thật.

Đăng nhập chỉ kiểm tra:

- Email đúng format
- Password không rỗng

Sau khi đăng nhập:

→ chuyển tới Dashboard.

Không phân quyền.

---

## UI

- Tailwind CSS
- shadcn/ui
- lucide-react

Phong cách:

- Dashboard
- Clean
- Professional
- Wood-inspired
- Sidebar layout

---

## Build

Trước khi bàn giao luôn chạy:

```bash
npm run build
```

Không được merge nếu build lỗi.