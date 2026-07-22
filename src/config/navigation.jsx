import { Home, PackageCheck, ReceiptText, Wrench } from "lucide-react"

import { ROUTES } from "@/constants/routes"

export const publicNavItems = [
  { label: "Trang chủ", path: "/#home", sectionId: "home" },
  { label: "Bộ sưu tập", path: "/#collections", sectionId: "collections" },
  { label: "Quy trình", path: "/#process", sectionId: "process" },
  { label: "Liên hệ", path: "/#contact", sectionId: "contact" },
]

export const featureNavItems = [
  {
    label: "Hôm nay",
    description: "Việc cần xử lý ngay",
    path: ROUTES.dashboard,
    icon: Home,
  },
  {
    label: "Yêu cầu & báo giá",
    description: "Yêu cầu mới từ WoodSpec",
    path: ROUTES.workshopRequests,
    icon: ReceiptText,
  },
  {
    label: "Trong xưởng",
    description: "Đơn đã thắng, đang sản xuất",
    path: ROUTES.workshopBuilds,
    icon: Wrench,
  },
  {
    label: "Bàn giao",
    description: "Sẵn sàng giao khách",
    path: ROUTES.workshopHandover,
    icon: PackageCheck,
  },
]
