import { WORKSHOP_STORAGE_KEYS } from "@/constants/storageKeys"
import { conversations as mockConversations } from "@/data/mock/messages"
import { notifications as mockNotifications } from "@/data/mock/notifications"
import { orders as mockOrders } from "@/data/mock/orders"
import { quotations as mockQuotations } from "@/data/mock/quotations"
import { requests as mockRequests } from "@/data/mock/requests"
import { getAuth } from "@/services/authService"
import { getScopedStorageKey } from "@/services/testSessionService"

export const CURRENT_WORKSHOP = {
  id: "WS-WOODSPEC",
  name: "Xưởng gỗ WoodSpec",
}

export const COMMISSION_RATE = 0.05
export const STORAGE_KEYS = WORKSHOP_STORAGE_KEYS

const DEMO_DATA_VERSION = "customer-flow-20260718-2"
const DEMO_DATA_VERSION_KEY = "woodspec_demo_data_version"

const QUOTATION_CUSTOMER_TRANSITIONS = {
  sent: ["viewed", "lost", "rejected"],
  viewed: ["shortlisted", "lost", "rejected"],
  shortlisted: ["clarifying", "cancelled_by_customer", "lost"],
  clarifying: ["requoted", "cancelled_by_customer", "lost"],
  requoted: ["customer_confirmed", "revision_requested", "cancelled_by_customer", "lost"],
  customer_confirmed: ["final_spec_confirmed", "cancelled_by_customer", "lost"],
  final_spec_confirmed: ["pending_confirm", "cancelled_by_customer", "lost"],
  pending_confirm: ["cancelled_by_customer", "lost"],
}

const PRODUCTION_ITEMS_TEMPLATE = [
  { id: "materials", label: "Chuẩn bị vật liệu", status: "pending", updatedAt: "" },
  { id: "frame", label: "Làm khung", status: "pending", updatedAt: "" },
  { id: "legs_or_body", label: "Chân bàn / thân tủ", status: "pending", updatedAt: "" },
  { id: "surface", label: "Mặt bàn / cánh tủ", status: "pending", updatedAt: "" },
  { id: "drawers", label: "Tủ / ngăn kéo", status: "pending", updatedAt: "" },
  { id: "finishing", label: "Hoàn thiện sản phẩm", status: "pending", updatedAt: "" },
]

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function readStorage(key, fallback) {
  if (typeof window === "undefined") return clone(fallback)
  const auth = getAuth()
  ensureDemoDataVersion(auth)
  const scopedKey = getScopedStorageKey(key, auth)

  try {
    const rawValue = window.localStorage.getItem(scopedKey)
    if (!rawValue) {
      const initialValue = clone(fallback)
      window.localStorage.setItem(scopedKey, JSON.stringify(initialValue))
      return initialValue
    }

    return JSON.parse(rawValue)
  } catch {
    const initialValue = clone(fallback)
    window.localStorage.setItem(scopedKey, JSON.stringify(initialValue))
    return initialValue
  }
}

function writeStorage(key, value) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(getScopedStorageKey(key, getAuth()), JSON.stringify(value))
  }

  return value
}

function ensureDemoDataVersion(auth) {
  if (typeof window === "undefined") return

  const versionKey = getScopedStorageKey(DEMO_DATA_VERSION_KEY, auth)
  if (window.localStorage.getItem(versionKey) === DEMO_DATA_VERSION) return

  Object.values(STORAGE_KEYS).forEach((key) => {
    window.localStorage.removeItem(getScopedStorageKey(key, auth))
  })
  window.localStorage.setItem(versionKey, DEMO_DATA_VERSION)
}

function today() {
  return new Date().toLocaleDateString("vi-VN")
}

function nowTime() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function nextId(prefix) {
  return `${prefix}-${Date.now().toString().slice(-6)}`
}

function appendTimeline(order, item) {
  return [...(order.timeline || []), { time: today(), ...item }]
}

export function calculateCommission(productSubtotal, serviceFee = 0, commissionRate = COMMISSION_RATE) {
  const safeProductSubtotal = Number(productSubtotal) || 0
  const safeServiceFee = Number(serviceFee) || 0
  const commissionAmount = Math.round(safeProductSubtotal * commissionRate)
  const total = safeProductSubtotal + safeServiceFee + commissionAmount

  return {
    productSubtotal: safeProductSubtotal,
    serviceFee: safeServiceFee,
    total,
    commissionRate,
    commissionAmount,
    workshopReceivable: safeProductSubtotal + safeServiceFee,
  }
}

function calculateOrderSettlement(order) {
  const total = Number(order.total) || 0
  const commissionRate = order.commissionRate ?? COMMISSION_RATE
  const commissionAmount = Number(order.commissionAmount) || Math.round((total * commissionRate) / (1 + commissionRate))

  return {
    commissionRate,
    commissionAmount,
    workshopReceivable: total - commissionAmount,
  }
}

function defaultFinalSpecConfirmation(date = today()) {
  return {
    status: "confirmed",
    customerConfirmedAt: date,
    workshopConfirmedAt: date,
    history: [
      { actor: "customer", label: "Khách xác nhận phiếu thông số cuối", time: date },
      { actor: "workshop", label: "Xưởng xác nhận phiếu thông số cuối", time: date },
    ],
  }
}

function normalizeFinalSpecConfirmation(value, fallbackDate) {
  if (!value?.status) return defaultFinalSpecConfirmation(fallbackDate)

  return {
    status: value.status,
    customerConfirmedAt: value.customerConfirmedAt || "",
    workshopConfirmedAt: value.workshopConfirmedAt || "",
    history: value.history || [],
  }
}

function pendingFinalSpecConfirmation() {
  return {
    status: "pending",
    customerConfirmedAt: "",
    workshopConfirmedAt: "",
    history: [],
  }
}

function normalizeProductionItems(items = []) {
  return PRODUCTION_ITEMS_TEMPLATE.map((template) => ({
    ...template,
    ...(items.find((item) => item.id === template.id) || {}),
  }))
}

function normalizeQuotation(quotation) {
  const productSubtotal = quotation.productSubtotal ?? quotation.total ?? 0
  const serviceFee = quotation.serviceFee ?? 0
  const commission = calculateCommission(productSubtotal, serviceFee, quotation.commissionRate ?? COMMISSION_RATE)
  const hasFinalSpec = ["final_spec_confirmed", "pending_confirm", "accepted"].includes(quotation.status)
  const finalSpecDate = quotation.finalSpecConfirmedAt || quotation.sentAt || today()

  return {
    workshopId: CURRENT_WORKSHOP.id,
    workshopName: CURRENT_WORKSHOP.name,
    warranty: "12 tháng",
    note: "Báo giá theo thông số khách hàng đã gửi.",
    ...quotation,
    ...commission,
    finalSpecConfirmation:
      quotation.finalSpecConfirmation || (hasFinalSpec ? defaultFinalSpecConfirmation(finalSpecDate) : pendingFinalSpecConfirmation()),
  }
}

function normalizeOrder(order) {
  const normalizedStatus = order.status === "pending_workshop_confirm" ? "confirmed" : order.status
  const normalizedTimeline = (order.timeline || []).map((item) => ({
    ...item,
    status: item.status === "pending_workshop_confirm" ? "confirmed" : item.status,
    label: String(item.label || "").includes("WoodSpec")
      ? "Xưởng xác nhận đã nhận cọc đầu tiên từ khách"
      : item.label,
  }))
  const baseOrder = {
    depositMethod: "Xưởng tự ghi nhận",
    depositReceivedAt: order.updatedAt || today(),
    depositNote: "Khách đặt cọc trực tiếp cho xưởng.",
    deliveryEta: "",
    deliveryNote: "",
    completedAt: "",
    changeRequests: [],
    ...order,
    status: normalizedStatus,
    finalSpecConfirmation: normalizeFinalSpecConfirmation(order.finalSpecConfirmation, order.depositReceivedAt || order.createdAt || today()),
    productionItems: normalizeProductionItems(order.productionItems),
    timeline: normalizedTimeline.length
      ? normalizedTimeline
      : [
          {
            status: normalizedStatus,
            label: "Xưởng xác nhận đã nhận cọc đầu tiên từ khách",
            time: order.updatedAt || today(),
          },
        ],
  }

  return {
    ...baseOrder,
    depositAmount: Number(baseOrder.depositAmount) || Math.round((Number(baseOrder.total) || 0) * 0.3),
    depositMethod: baseOrder.depositMethod || "Xưởng tự ghi nhận",
    depositReceivedAt: baseOrder.depositReceivedAt || baseOrder.updatedAt || today(),
    depositNote: baseOrder.depositNote || "Khách đặt cọc trực tiếp cho xưởng.",
    ...calculateOrderSettlement(baseOrder),
  }
}

export function getRequests() {
  return readStorage(STORAGE_KEYS.requests, mockRequests)
}

export function saveRequests(nextRequests) {
  return writeStorage(STORAGE_KEYS.requests, nextRequests)
}

export function getRequestById(requestId) {
  return getRequests().find((request) => request.id === requestId)
}

export function updateRequest(requestId, patch) {
  let updatedRequest = null
  const nextRequests = getRequests().map((request) => {
    if (request.id !== requestId) return request
    updatedRequest = { ...request, ...patch }
    return updatedRequest
  })

  saveRequests(nextRequests)
  return updatedRequest
}

export function updateRequestStatus(requestId, status) {
  return updateRequest(requestId, { status })
}

export function getQuotations() {
  const quotations = readStorage(STORAGE_KEYS.quotations, mockQuotations).map(normalizeQuotation)
  saveQuotations(quotations)
  return quotations
}

export function saveQuotations(nextQuotations) {
  return writeStorage(STORAGE_KEYS.quotations, nextQuotations.map(normalizeQuotation))
}

export function upsertQuotation(quotation) {
  const normalizedQuotation = normalizeQuotation(quotation)
  const quotations = getQuotations()
  const existingIndex = quotations.findIndex((item) => item.id === normalizedQuotation.id)
  const nextQuotations =
    existingIndex >= 0
      ? quotations.map((item) => (item.id === normalizedQuotation.id ? { ...item, ...normalizedQuotation } : item))
      : [normalizedQuotation, ...quotations]

  saveQuotations(nextQuotations)
  return nextQuotations.find((item) => item.id === normalizedQuotation.id)
}

export function getQuotationByRequestId(requestId) {
  return getQuotations().find((quotation) => quotation.requestId === requestId)
}

export function getQuotationById(quotationId) {
  return getQuotations().find((quotation) => quotation.id === quotationId)
}

export function createQuotationFromRequest(request, data) {
  const existingQuotation = getQuotationByRequestId(request.id)
  const commission = calculateCommission(data.productSubtotal, data.serviceFee, COMMISSION_RATE)
  const quotation = {
    id: existingQuotation?.id || nextId("BG"),
    requestId: request.id,
    workshopId: CURRENT_WORKSHOP.id,
    workshopName: CURRENT_WORKSHOP.name,
    customerName: request.customerName,
    product: request.productName,
    ...commission,
    productionTime: data.productionTime || request.expectedTime,
    warranty: data.warranty || "12 tháng",
    note: data.note || "Báo giá theo thông số khách hàng đã gửi.",
    createdAt: existingQuotation?.createdAt || today(),
    sentAt: existingQuotation?.sentAt || "Chờ gửi",
    status: existingQuotation?.status === "sent" ? "sent" : "ready",
  }

  const savedQuotation = upsertQuotation(quotation)
  updateRequestStatus(request.id, "quoted")
  addNotification({
    title: "Đã tạo báo giá",
    content: `${request.customerName} có báo giá mới cho ${request.productName}.`,
    target: `/quotations?quotationId=${savedQuotation.id}&requestId=${request.id}`,
    type: "quotation",
  })

  return savedQuotation
}

export function updateQuotation(quotationId, patch) {
  let updatedQuotation = null
  const nextQuotations = getQuotations().map((quotation) => {
    if (quotation.id !== quotationId) return quotation
    updatedQuotation = normalizeQuotation({ ...quotation, ...patch })
    return updatedQuotation
  })

  saveQuotations(nextQuotations)
  return updatedQuotation
}

export function sendQuotation(quotationId) {
  const currentQuotation = getQuotationById(quotationId)
  if (!currentQuotation || !["draft", "ready", "revision_requested"].includes(currentQuotation.status)) {
    return currentQuotation || null
  }

  const updatedQuotation = updateQuotation(quotationId, {
    status: "sent",
    sentAt: today(),
  })

  if (updatedQuotation) {
    updateRequestStatus(updatedQuotation.requestId, "quoted")
    addNotification({
      title: "Đã gửi báo giá",
      content: `${updatedQuotation.id} đã được đánh dấu là đã gửi cho ${updatedQuotation.customerName}.`,
      target: `/quotations?quotationId=${updatedQuotation.id}&requestId=${updatedQuotation.requestId}`,
      type: "quotation",
    })
  }

  return updatedQuotation
}

export function simulateCustomerQuotationEvent(quotationId, status) {
  const currentQuotation = getQuotationById(quotationId)
  const allowedStatuses = QUOTATION_CUSTOMER_TRANSITIONS[currentQuotation?.status] || []

  if (!currentQuotation || !allowedStatuses.includes(status)) {
    return currentQuotation || null
  }

  const patch =
    status === "final_spec_confirmed"
      ? {
          status,
          finalSpecConfirmedAt: today(),
          finalSpecConfirmation: defaultFinalSpecConfirmation(today()),
        }
      : status === "requoted"
        ? {
            status,
            requotedAt: today(),
          }
      : { status }

  const updatedQuotation = updateQuotation(quotationId, patch)
  const statusMessages = {
    clarifying: "Xưởng đang làm rõ thông tin còn thiếu sau khi được khách chọn.",
    requoted: "Xưởng đã confirm lại báo giá, đang chờ khách xác nhận.",
    customer_confirmed: "Khách đã xác nhận báo giá cuối.",
    viewed: "Khách đã xem báo giá.",
    shortlisted: "Khách đang chọn tạm xưởng bạn.",
    final_spec_confirmed: "Hai bên đã xác nhận Phiếu thông số cuối.",
    pending_confirm: "Khách đã thanh toán khoản cọc đầu tiên, đang chờ xưởng xác nhận đã nhận cọc.",
    cancelled_by_customer: "Khách đã hủy chọn trước khi xác nhận.",
    lost: "Khách đã chọn xưởng khác.",
    rejected: "Khách đã từ chối báo giá.",
  }

  addNotification({
    title: "Cập nhật trạng thái báo giá",
    content: `${updatedQuotation.id}: ${statusMessages[status] || "Trạng thái đã thay đổi."}`,
    target: `/quotations?quotationId=${updatedQuotation.id}&requestId=${updatedQuotation.requestId}`,
    type: "quotation",
  })

  return getQuotationById(quotationId)
}

export function confirmDepositForQuotation(quotationId, depositData = {}) {
  const currentQuotation = getQuotationById(quotationId)
  if (!currentQuotation || currentQuotation.status !== "pending_confirm") return null

  const quotation = updateQuotation(quotationId, { status: "accepted" })
  const order = createOrderFromQuotation(quotation, depositData)

  addNotification({
    title: "Đã xác nhận cọc",
    content: `${quotation.customerName} đã đặt cọc đầu tiên cho xưởng. Đơn ${order.id} đã được tạo để theo dõi sản xuất.`,
    target: `/orders?orderId=${order.id}&quotationId=${quotation.id}&requestId=${quotation.requestId}`,
    type: "order",
  })

  return {
    quotation: getQuotationById(quotationId),
    order,
  }
}

export function getOrders() {
  const orders = readStorage(STORAGE_KEYS.orders, mockOrders).map(normalizeOrder)
  saveOrders(orders)
  return orders
}

export function saveOrders(nextOrders) {
  return writeStorage(STORAGE_KEYS.orders, nextOrders.map(normalizeOrder))
}

export function getOrderByQuotationId(quotationId) {
  return getOrders().find((order) => order.quotationId === quotationId)
}

export function createOrderFromQuotation(quotation, depositData = {}) {
  const existingOrder = getOrderByQuotationId(quotation.id)
  if (existingOrder) return existingOrder

  const depositAmount = Number(depositData.depositAmount) || Math.round(quotation.total * 0.3)
  const order = normalizeOrder({
    id: nextId("DH"),
    requestId: quotation.requestId,
    quotationId: quotation.id,
    workshopId: quotation.workshopId,
    customerName: quotation.customerName,
    product: quotation.product,
    total: quotation.total,
    commissionRate: quotation.commissionRate ?? COMMISSION_RATE,
    commissionAmount: quotation.commissionAmount,
    workshopReceivable: quotation.workshopReceivable,
    depositAmount,
    depositMethod: depositData.depositMethod || "Xưởng tự ghi nhận",
    depositReceivedAt: depositData.depositReceivedAt || today(),
    depositNote: depositData.depositNote || "Khách đặt cọc trực tiếp cho xưởng.",
    status: "confirmed",
    finalSpecConfirmation: quotation.finalSpecConfirmation,
    productionItems: normalizeProductionItems(),
    changeRequests: [],
    deliveryEta: "",
    deliveryNote: "",
    createdAt: today(),
    updatedAt: today(),
    timeline: [
      {
        status: "confirmed",
        label: "Xưởng xác nhận đã nhận cọc đầu tiên từ khách",
        time: today(),
      },
    ],
  })

  saveOrders([order, ...getOrders()])
  return order
}

export function updateOrderStatus(orderId, status, label) {
  let updatedOrder = null
  const nextOrders = getOrders().map((order) => {
    if (order.id !== orderId) return order

    updatedOrder = normalizeOrder({
      ...order,
      status,
      updatedAt: today(),
      timeline: appendTimeline(order, { status, label }),
    })

    return updatedOrder
  })

  saveOrders(nextOrders)

  if (updatedOrder) {
    addNotification({
      title: "Đã cập nhật tiến độ đơn hàng",
      content: `${updatedOrder.id}: ${label}`,
      target: `/orders?orderId=${updatedOrder.id}&quotationId=${updatedOrder.quotationId}&requestId=${updatedOrder.requestId}`,
      type: "order",
    })
  }

  return updatedOrder
}

export function confirmOrderFinalSpec(orderId, actor) {
  let updatedOrder = null
  const nextOrders = getOrders().map((order) => {
    if (order.id !== orderId) return order

    const currentConfirmation = normalizeFinalSpecConfirmation(order.finalSpecConfirmation, order.createdAt || today())
    const event = {
      actor,
      label: actor === "customer" ? "Khách xác nhận phiếu thông số cuối" : "Xưởng xác nhận phiếu thông số cuối",
      time: today(),
    }
    const nextConfirmation = {
      ...currentConfirmation,
      customerConfirmedAt: actor === "customer" ? today() : currentConfirmation.customerConfirmedAt,
      workshopConfirmedAt: actor === "workshop" ? today() : currentConfirmation.workshopConfirmedAt,
      history: [...(currentConfirmation.history || []), event],
    }

    nextConfirmation.status =
      nextConfirmation.customerConfirmedAt && nextConfirmation.workshopConfirmedAt
        ? "confirmed"
        : nextConfirmation.customerConfirmedAt
          ? "customer_confirmed"
          : "workshop_confirmed"

    updatedOrder = normalizeOrder({
      ...order,
      finalSpecConfirmation: nextConfirmation,
      updatedAt: today(),
      timeline: appendTimeline(order, { status: "final_spec", label: event.label }),
    })

    return updatedOrder
  })

  saveOrders(nextOrders)
  return updatedOrder
}

export function startOrderProduction(orderId) {
  const order = getOrders().find((item) => item.id === orderId)
  if (!order || order.finalSpecConfirmation?.status !== "confirmed") return order || null

  return updateOrderStatus(orderId, "in_production", "Xưởng bắt đầu sản xuất sau khi phiếu thông số cuối đã được xác nhận.")
}

export function updateProductionItem(orderId, itemId) {
  let updatedOrder = null
  const nextOrders = getOrders().map((order) => {
    if (order.id !== orderId) return order

    const productionItems = normalizeProductionItems(order.productionItems).map((item) =>
      item.id === itemId ? { ...item, status: "done", updatedAt: today() } : item,
    )
    const completedItem = productionItems.find((item) => item.id === itemId)

    updatedOrder = normalizeOrder({
      ...order,
      status: order.status === "confirmed" ? "in_production" : order.status,
      productionItems,
      updatedAt: today(),
      timeline: appendTimeline(order, {
        status: "production_item",
        label: `Hoàn tất hạng mục: ${completedItem?.label || itemId}`,
      }),
    })

    return updatedOrder
  })

  saveOrders(nextOrders)
  return updatedOrder
}

export function createOrderChangeRequest(orderId, data) {
  let updatedOrder = null
  const nextOrders = getOrders().map((order) => {
    if (order.id !== orderId) return order

    const changeRequest = {
      id: nextId("TD"),
      title: data.title || "Yêu cầu thay đổi",
      description: data.description || "",
      costDelta: Number(data.costDelta) || 0,
      timeDelta: data.timeDelta || "",
      status: "pending",
      createdAt: today(),
      resolvedAt: "",
    }

    updatedOrder = normalizeOrder({
      ...order,
      changeRequests: [changeRequest, ...(order.changeRequests || [])],
      updatedAt: today(),
      timeline: appendTimeline(order, {
        status: "change_request",
        label: `Khách gửi yêu cầu thay đổi: ${changeRequest.title}`,
      }),
    })

    return updatedOrder
  })

  saveOrders(nextOrders)
  return updatedOrder
}

export function resolveOrderChangeRequest(orderId, changeRequestId, status) {
  let updatedOrder = null
  const nextOrders = getOrders().map((order) => {
    if (order.id !== orderId) return order

    let appliedCostDelta = 0
    const changeRequests = (order.changeRequests || []).map((item) => {
      if (item.id !== changeRequestId || item.status !== "pending") return item
      if (status === "confirmed") appliedCostDelta = Number(item.costDelta) || 0
      return {
        ...item,
        status,
        resolvedAt: today(),
      }
    })
    const commissionRate = order.commissionRate ?? COMMISSION_RATE
    const appliedCommissionDelta = status === "confirmed" ? Math.round(appliedCostDelta * commissionRate) : 0

    updatedOrder = normalizeOrder({
      ...order,
      total: Number(order.total) + appliedCostDelta + appliedCommissionDelta,
      commissionAmount: Number(order.commissionAmount) + appliedCommissionDelta,
      workshopReceivable: Number(order.workshopReceivable) + appliedCostDelta,
      changeRequests,
      updatedAt: today(),
      timeline: appendTimeline(order, {
        status: "change_request",
        label:
          status === "confirmed"
            ? "Hai bên đã xác nhận yêu cầu thay đổi, chi phí/thời gian được áp dụng."
            : "Yêu cầu thay đổi đã bị từ chối, không áp dụng vào đơn.",
      }),
    })

    return updatedOrder
  })

  saveOrders(nextOrders)
  return updatedOrder
}

export function updateOrderDelivery(orderId, deliveryData = {}) {
  let updatedOrder = null
  const nextOrders = getOrders().map((order) => {
    if (order.id !== orderId) return order

    const deliveryEta = deliveryData.deliveryEta || order.deliveryEta || "Theo lịch xưởng đã báo"
    updatedOrder = normalizeOrder({
      ...order,
      status: "shipping",
      deliveryEta,
      deliveryNote: deliveryData.deliveryNote || order.deliveryNote || "",
      updatedAt: today(),
      timeline: appendTimeline(order, {
        status: "shipping",
        label: `Đang vận chuyển. Dự kiến khách nhận: ${deliveryEta}`,
      }),
    })

    return updatedOrder
  })

  saveOrders(nextOrders)
  return updatedOrder
}

export function completeOrder(orderId) {
  let updatedOrder = null
  const nextOrders = getOrders().map((order) => {
    if (order.id !== orderId) return order

    updatedOrder = normalizeOrder({
      ...order,
      status: "completed",
      completedAt: today(),
      updatedAt: today(),
      timeline: appendTimeline(order, {
        status: "completed",
        label: "Đơn hàng hoàn tất. Hệ thống ghi nhận hoa hồng và số tiền xưởng thực nhận.",
      }),
    })

    return updatedOrder
  })

  saveOrders(nextOrders)
  return updatedOrder
}

export function getConversations() {
  return readStorage(STORAGE_KEYS.messages, mockConversations)
}

export function saveConversations(nextConversations) {
  return writeStorage(STORAGE_KEYS.messages, nextConversations)
}

export function addMessage(requestId, message) {
  let targetConversation = null
  const nextConversations = getConversations().map((conversation) => {
    if (conversation.requestId !== requestId) return conversation

    targetConversation = {
      ...conversation,
      messages: [
        ...conversation.messages,
        {
          from: "workshop",
          time: nowTime(),
          ...message,
        },
      ],
    }

    return targetConversation
  })

  saveConversations(nextConversations)

  if (targetConversation) {
    addNotification({
      title: "Đã gửi tin nhắn",
      content: `Xưởng đã phản hồi ${targetConversation.customerName}.`,
      target: `/messages?requestId=${targetConversation.requestId}`,
      type: "message",
    })
  }

  return targetConversation
}

export function getNotifications() {
  return readStorage(STORAGE_KEYS.notifications, mockNotifications)
}

export function saveNotifications(nextNotifications) {
  return writeStorage(STORAGE_KEYS.notifications, nextNotifications)
}

export function addNotification(notification) {
  const nextNotification = {
    id: nextId("TB"),
    time: "Vừa xong",
    unread: true,
    ...notification,
  }
  const nextNotifications = [nextNotification, ...getNotifications()]
  saveNotifications(nextNotifications)
  return nextNotification
}

export function markNotificationRead(notificationId) {
  const nextNotifications = getNotifications().map((notification) =>
    notification.id === notificationId ? { ...notification, unread: false } : notification,
  )
  return saveNotifications(nextNotifications)
}

export function markAllNotificationsRead() {
  const nextNotifications = getNotifications().map((notification) => ({ ...notification, unread: false }))
  return saveNotifications(nextNotifications)
}
