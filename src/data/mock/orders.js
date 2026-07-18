export const orderStatusLabels = {
  confirmed: "Đã xác nhận / đã nhận cọc",
  in_production: "Đang sản xuất",
  shipping: "Đang vận chuyển",
  delivered: "Đã giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
}

export const productionItemStatusLabels = {
  pending: "Chưa xong",
  done: "Đã xong",
}

export const changeRequestStatusLabels = {
  pending: "Chờ hai bên xác nhận",
  confirmed: "Đã xác nhận áp dụng",
  rejected: "Không áp dụng",
}

export const finalSpecStatusLabels = {
  pending: "Chờ hai bên xác nhận",
  customer_confirmed: "Khách đã xác nhận",
  workshop_confirmed: "Xưởng đã xác nhận",
  confirmed: "Hai bên đã xác nhận",
}

export const orders = [
  {
    id: "DH-2407-001",
    requestId: "YC-2407-001",
    quotationId: "BG-2407-012",
    workshopId: "WS-WOODSPEC",
    customerName: "Nguyễn Minh An",
    product: "Tủ giày bo cong lối vào",
    total: 19585000,
    commissionRate: 0.05,
    commissionAmount: 885000,
    workshopReceivable: 18700000,
    depositAmount: 5875500,
    depositMethod: "Chuyển khoản trực tiếp cho xưởng",
    depositReceivedAt: "16/07/2026",
    depositNote: "Xưởng xác nhận đã nhận khoản cọc đầu tiên từ khách.",
    status: "in_production",
    deliveryEta: "",
    deliveryNote: "",
    completedAt: "",
    finalSpecConfirmation: {
      status: "confirmed",
      customerConfirmedAt: "15/07/2026",
      workshopConfirmedAt: "15/07/2026",
      history: [
        { actor: "customer", label: "Khách xác nhận phiếu thông số cuối", time: "15/07/2026" },
        { actor: "workshop", label: "Xưởng xác nhận phiếu thông số cuối", time: "15/07/2026" },
      ],
    },
    productionItems: [
      { id: "materials", label: "Chuẩn bị vật liệu", status: "done", updatedAt: "17/07/2026" },
      { id: "frame", label: "Làm khung", status: "done", updatedAt: "18/07/2026" },
      { id: "legs_or_body", label: "Chân bàn / thân tủ", status: "pending", updatedAt: "" },
      { id: "surface", label: "Mặt bàn / cánh tủ", status: "pending", updatedAt: "" },
      { id: "drawers", label: "Tủ / ngăn kéo", status: "pending", updatedAt: "" },
      { id: "finishing", label: "Hoàn thiện sản phẩm", status: "pending", updatedAt: "" },
    ],
    changeRequests: [],
    createdAt: "16/07/2026",
    updatedAt: "18/07/2026",
    timeline: [
      {
        status: "confirmed",
        label: "Xưởng xác nhận đã nhận cọc đầu tiên từ khách",
        time: "16/07/2026",
      },
      {
        status: "production_item",
        label: "Hoàn tất hạng mục: Chuẩn bị vật liệu",
        time: "17/07/2026",
      },
      {
        status: "production_item",
        label: "Hoàn tất hạng mục: Làm khung",
        time: "18/07/2026",
      },
    ],
  },
]
