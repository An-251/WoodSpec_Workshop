export const notifications = [
  {
    id: "TB-001",
    title: "Đơn Minh An đang sản xuất",
    content: "DH-2407-001 đã nhận cọc và xưởng đã hoàn tất chuẩn bị vật liệu, làm khung.",
    time: "Vừa xong",
    unread: true,
    target: "/orders?orderId=DH-2407-001&quotationId=BG-2407-012&requestId=YC-2407-001",
    type: "order",
  },
  {
    id: "TB-002",
    title: "Báo giá Minh An đã tạo đơn",
    content: "BG-2407-012 thuộc yêu cầu YC-2407-001 đã chuyển thành đơn DH-2407-001.",
    time: "Hôm nay",
    unread: true,
    target: "/quotations?quotationId=BG-2407-012&requestId=YC-2407-001",
    type: "quotation",
  },
  {
    id: "TB-003",
    title: "Case phụ đang trao đổi",
    content: "Lê Hoàng Nhi đã xác nhận vị trí ổ điện, xưởng có thể quay lại báo giá để đăng bản thay đổi.",
    time: "Hôm qua",
    unread: false,
    target: "/messages?requestId=YC-2407-002&quotationId=BG-2407-013",
    type: "message",
  },
]
