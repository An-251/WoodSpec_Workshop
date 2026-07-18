export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  requests: "/requests",
  requestDetail: "/requests/:requestId",
  quotations: "/quotations",
  orders: "/orders",
  messages: "/messages",
  notifications: "/notifications",
  profile: "/profile",
  interactionLogs: "/interaction-logs",
  viewLogs: "/viewlogs",
}

export const NAV_GROUPS = [
  {
    label: "Tổng quan",
    items: [
      {
        label: "Tổng quan",
        path: ROUTES.dashboard,
        icon: "dashboard",
      },
    ],
  },
  {
    label: "Công việc",
    items: [
      {
        label: "Yêu cầu khách hàng",
        path: ROUTES.requests,
        icon: "inbox",
      },
      {
        label: "Báo giá",
        path: ROUTES.quotations,
        icon: "fileText",
      },
      {
        label: "Đơn hàng",
        path: ROUTES.orders,
        icon: "orders",
      },
      {
        label: "Trao đổi",
        path: ROUTES.messages,
        icon: "message",
      },
    ],
  },
  {
    label: "Tài khoản",
    items: [
      {
        label: "Thông báo",
        path: ROUTES.notifications,
        icon: "bell",
      },
      {
        label: "Hồ sơ xưởng",
        path: ROUTES.profile,
        icon: "store",
      },
    ],
  },
]

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items)
