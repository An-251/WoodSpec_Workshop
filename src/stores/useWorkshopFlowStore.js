import { create } from "zustand"

import { awaitingDecision, completedProjects, openRequests, workshopProjects } from "@/data/reference/workshopFlow"

export const FLOW_STATUS = {
  open: "open",
  awaiting: "awaiting",
  selected: "selected",
  depositConfirmed: "depositConfirmed",
  inProduction: "inProduction",
  readyHandover: "readyHandover",
  closed: "closed",
}

export const flowFilters = [
  { id: "open", label: "Yêu cầu mở" },
  { id: "awaiting", label: "Chờ quyết định" },
  { id: "selected", label: "Đã chọn" },
  { id: "closed", label: "Đã đóng" },
  { id: "all", label: "Tất cả" },
]

const initialStatusById = {
  ...Object.fromEntries(openRequests.map((request) => [request.id, FLOW_STATUS.open])),
  ...Object.fromEntries(awaitingDecision.map((request) => [request.id, FLOW_STATUS.awaiting])),
  "nora-bianchi": FLOW_STATUS.inProduction,
  "studio-verde": FLOW_STATUS.selected,
  "andres-klein": FLOW_STATUS.depositConfirmed,
  ...Object.fromEntries(completedProjects.map((project) => [project.id, FLOW_STATUS.closed])),
}

const initialBuildCompletedById = {
  "nora-bianchi": 3,
  "studio-verde": 0,
  "andres-klein": 0,
}

const initialHandoverCompletedById = {
  "nora-bianchi": 2,
}

const allBaseItems = [...openRequests, ...awaitingDecision, ...workshopProjects, ...completedProjects]

const statusMeta = {
  [FLOW_STATUS.open]: {
    label: "Yêu cầu mới",
    tone: "amber",
    nextStep: "Xem yêu cầu",
    filter: "open",
  },
  [FLOW_STATUS.awaiting]: {
    label: "Đã gửi báo giá",
    tone: "neutral",
    nextStep: "Xem báo giá",
    filter: "awaiting",
  },
  [FLOW_STATUS.selected]: {
    label: "Bạn được chọn",
    tone: "green",
    nextStep: "Xác nhận cọc",
    filter: "selected",
  },
  [FLOW_STATUS.depositConfirmed]: {
    label: "Đã xác nhận cọc",
    tone: "green",
    nextStep: "Bắt đầu sản xuất",
    filter: "selected",
  },
  [FLOW_STATUS.inProduction]: {
    label: "Đang sản xuất",
    tone: "amber",
    nextStep: "Cập nhật tiến độ",
    filter: "selected",
  },
  [FLOW_STATUS.readyHandover]: {
    label: "Sẵn sàng bàn giao",
    tone: "green",
    nextStep: "Bàn giao",
    filter: "selected",
  },
  [FLOW_STATUS.closed]: {
    label: "Hoàn tất",
    tone: "green",
    nextStep: "Xem tổng kết",
    filter: "closed",
  },
}

const defaultBuildSteps = [
  ["Cắt vật liệu", "Bấm khi làm xong"],
  ["Lắp ráp", "Sắp tới"],
  ["Chà nhám", "Sắp tới"],
  ["Phủ hoàn thiện", "Sắp tới"],
  ["Kiểm tra chất lượng", "Sắp tới"],
  ["Sẵn sàng bàn giao", "Sắp tới"],
]

const defaultHandoverSteps = [
  ["Hẹn lịch bàn giao với khách", "Thống nhất ngày và địa chỉ"],
  ["Đã chất hàng và đang giao", "Xác nhận sản phẩm rời xưởng"],
  ["Đã bàn giao cho khách", "Khách nhận sản phẩm hoàn thiện"],
  ["Đóng đơn", "Đánh dấu dự án hoàn tất"],
]

export function getBaseFlowItem(itemId) {
  return allBaseItems.find((item) => item.id === itemId) || allBaseItems[0]
}

export function getFlowRows(statusById) {
  return allBaseItems.map((item) => decorateFlowItem(item, statusById[item.id] || initialStatusById[item.id]))
}

export function decorateFlowItem(item, status) {
  const meta = statusMeta[status] || statusMeta[FLOW_STATUS.open]

  return {
    ...item,
    flowStatus: status,
    flowFilter: meta.filter,
    status: meta.label,
    statusTone: meta.tone,
    nextStep: meta.nextStep,
    quotesSubmitted: item.quotesSubmitted || "5/12 xưởng đã báo",
    deadline: item.deadline || "10/07",
    material: item.material || "Gỗ phong cứng",
    product: item.product || item.item,
    dimensions: item.dimensions || "180 x 90 x 75 cm",
    quoteTotal: item.quoteTotal || "53.750.000 ₫",
    deposit: item.deposit || "26.875.000 ₫",
  }
}

export function getFlowItem(itemId, statusById) {
  const item = getBaseFlowItem(itemId)
  return decorateFlowItem(item, statusById[itemId] || initialStatusById[itemId])
}

export function toWorkshopProject(item, statusById) {
  const flowItem = getFlowItem(item.id, statusById)

  if (flowItem.buildSteps) {
    return flowItem
  }

  return {
    ...flowItem,
    item: flowItem.item,
    product: flowItem.product || flowItem.item,
    finish: flowItem.finish || "Hoàn thiện mờ tự nhiên",
    progress: 0,
    stepIndex: 0,
    buildSteps: defaultBuildSteps,
    handoverSteps: defaultHandoverSteps,
    deliveryAddress: flowItem.deliveryAddress || "Địa chỉ sẽ được chia sẻ sau khi khách chọn xưởng",
  }
}

export const useWorkshopFlowStore = create((set) => ({
  statusById: initialStatusById,
  buildCompletedById: initialBuildCompletedById,
  handoverCompletedById: initialHandoverCompletedById,

  submitQuotation: (itemId) =>
    set((state) => ({
      statusById: { ...state.statusById, [itemId]: FLOW_STATUS.awaiting },
    })),

  markCustomerSelected: (itemId) =>
    set((state) => ({
      statusById: { ...state.statusById, [itemId]: FLOW_STATUS.selected },
      buildCompletedById: { ...state.buildCompletedById, [itemId]: state.buildCompletedById[itemId] || 0 },
    })),

  confirmDeposit: (itemId) =>
    set((state) => ({
      statusById: { ...state.statusById, [itemId]: FLOW_STATUS.depositConfirmed },
      buildCompletedById: { ...state.buildCompletedById, [itemId]: state.buildCompletedById[itemId] || 0 },
    })),

  startProduction: (itemId) =>
    set((state) => ({
      statusById: { ...state.statusById, [itemId]: FLOW_STATUS.inProduction },
      buildCompletedById: { ...state.buildCompletedById, [itemId]: state.buildCompletedById[itemId] || 0 },
    })),

  completeBuildStep: (itemId, totalSteps) =>
    set((state) => {
      const nextCompleted = Math.min(totalSteps, (state.buildCompletedById[itemId] || 0) + 1)
      const nextStatus = nextCompleted >= totalSteps ? FLOW_STATUS.readyHandover : FLOW_STATUS.inProduction

      return {
        statusById: { ...state.statusById, [itemId]: nextStatus },
        buildCompletedById: { ...state.buildCompletedById, [itemId]: nextCompleted },
        handoverCompletedById: { ...state.handoverCompletedById, [itemId]: state.handoverCompletedById[itemId] || 0 },
      }
    }),

  completeHandoverStep: (itemId, totalSteps) =>
    set((state) => {
      const nextCompleted = Math.min(totalSteps, (state.handoverCompletedById[itemId] || 0) + 1)
      const nextStatus = nextCompleted >= totalSteps ? FLOW_STATUS.closed : FLOW_STATUS.readyHandover

      return {
        statusById: { ...state.statusById, [itemId]: nextStatus },
        handoverCompletedById: { ...state.handoverCompletedById, [itemId]: nextCompleted },
      }
    }),
}))
