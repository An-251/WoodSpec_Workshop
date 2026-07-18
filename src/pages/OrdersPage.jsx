import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  BadgeDollarSign,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Hammer,
  PackageCheck,
  Plus,
  Truck,
  XCircle,
} from "lucide-react"

import { ROUTES } from "@/constants/routes"
import {
  changeRequestStatusLabels,
  finalSpecStatusLabels,
  orderStatusLabels,
  productionItemStatusLabels,
} from "@/data/mock/orders"
import {
  completeOrder,
  confirmOrderFinalSpec,
  createOrderChangeRequest,
  getOrders,
  resolveOrderChangeRequest,
  startOrderProduction,
  updateOrderDelivery,
  updateOrderStatus,
  updateProductionItem,
} from "@/stores/workshopStorage"
import { formatCurrency } from "@/utils/formatCurrency"

const orderSteps = [
  { value: "confirmed", label: "Đã nhận cọc", icon: CheckCircle2 },
  { value: "in_production", label: "Đang sản xuất", icon: PackageCheck },
  { value: "shipping", label: "Đang vận chuyển", icon: Truck },
  { value: "delivered", label: "Đã giao", icon: CheckCircle2 },
  { value: "completed", label: "Hoàn tất", icon: BadgeDollarSign },
]

const defaultChangeRequestForm = {
  title: "Khách muốn đổi màu hoàn thiện",
  description: "Khách đề nghị đổi sang màu óc chó sáng hơn bản đã chốt. Xưởng cần xác nhận lại chi phí và thời gian trước khi làm.",
  costDelta: "1500000",
  timeDelta: "Thêm 2 ngày",
}

function hasPendingChange(order) {
  return (order.changeRequests || []).some((item) => item.status === "pending")
}

function isProductionDone(order) {
  return (order.productionItems || []).every((item) => item.status === "done")
}

function OrderProgress({ status }) {
  const activeIndex = orderSteps.findIndex((step) => step.value === status)

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      {orderSteps.map((step, index) => {
        const Icon = step.icon
        const active = index <= activeIndex

        return (
          <div
            key={step.value}
            className={`rounded-[14px] border p-3 text-center ${
              active ? "border-[#854f19] bg-[#fff1e8] text-[#854f19]" : "border-[#ead8ca] bg-white text-[#8a796b]"
            }`}
          >
            <Icon className="mx-auto" size={18} />
            <p className="mt-2 text-[12px] font-bold">{step.label}</p>
          </div>
        )
      })}
    </div>
  )
}

function FinalSpecPanel({ order, onRefresh }) {
  const confirmation = order.finalSpecConfirmation
  const canConfirmCustomer = !confirmation.customerConfirmedAt
  const canConfirmWorkshop = !confirmation.workshopConfirmedAt

  const handleConfirm = (actor) => {
    confirmOrderFinalSpec(order.id, actor)
    onRefresh()
  }

  return (
    <div className="rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] p-4">
      <div className="flex items-start gap-3">
        <ClipboardCheck className="mt-0.5 text-[#854f19]" size={19} />
        <div>
          <p className="font-bold text-[#231a11]">Phiếu thông số cuối</p>
          <p className="mt-1 text-[13px] text-[#6a5b4f]">{finalSpecStatusLabels[confirmation.status]}</p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-[12px] bg-white px-3 py-2 text-[13px]">
          <p className="font-bold text-[#52443a]">Khách xác nhận</p>
          <p className="mt-1 text-[#8a796b]">{confirmation.customerConfirmedAt || "Chưa xác nhận"}</p>
        </div>
        <div className="rounded-[12px] bg-white px-3 py-2 text-[13px]">
          <p className="font-bold text-[#52443a]">Xưởng xác nhận</p>
          <p className="mt-1 text-[#8a796b]">{confirmation.workshopConfirmedAt || "Chưa xác nhận"}</p>
        </div>
      </div>

      {(canConfirmCustomer || canConfirmWorkshop) && (
        <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
          {canConfirmCustomer && (
            <button
              type="button"
              onClick={() => handleConfirm("customer")}
              className="h-9 rounded-[12px] border border-[#ead8ca] bg-white px-3 text-[13px] font-bold text-[#52443a]"
            >
              Mô phỏng khách xác nhận
            </button>
          )}
          {canConfirmWorkshop && (
            <button
              type="button"
              onClick={() => handleConfirm("workshop")}
              className="h-9 rounded-[12px] bg-[#854f19] px-3 text-[13px] font-bold text-white"
            >
              Xưởng xác nhận phiếu
            </button>
          )}
        </div>
      )}

      {confirmation.history?.length > 0 && (
        <div className="mt-3 space-y-2">
          {confirmation.history.map((item, index) => (
            <div key={`${item.actor}-${index}`} className="rounded-[12px] bg-white px-3 py-2 text-[13px] text-[#52443a]">
              <span className="font-bold">{item.time}</span> · {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductionPanel({ order, onRefresh, onNotice }) {
  const canUpdate = order.status === "in_production" && !hasPendingChange(order)

  const handleDone = (itemId) => {
    if (!canUpdate) {
      onNotice(
        hasPendingChange(order)
          ? "Đang có yêu cầu thay đổi chờ xác nhận. Hãy xử lý yêu cầu thay đổi trước rồi mới cập nhật tiến độ sản xuất."
          : "Cần bấm 'Bắt đầu sản xuất' trước, sau đó mới đánh dấu xong từng hạng mục.",
      )
      return
    }

    updateProductionItem(order.id, itemId)
    onRefresh()
    onNotice("Đã cập nhật xong một hạng mục sản xuất.")
  }

  return (
    <div className="rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] p-4">
      <div className="flex items-center gap-2">
        <Hammer size={18} className="text-[#854f19]" />
        <p className="font-bold text-[#231a11]">Tiến độ sản xuất theo hạng mục</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(order.productionItems || []).map((item) => (
          <div key={item.id} className="rounded-[13px] border border-[#ead8ca] bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-[#231a11]">{item.label}</p>
                <p className="mt-1 text-[12px] font-semibold text-[#8a796b]">{productionItemStatusLabels[item.status]}</p>
              </div>
              {item.status === "done" ? <CheckCircle2 className="text-[#854f19]" size={18} /> : <XCircle className="text-[#b5967d]" size={18} />}
            </div>
            {item.updatedAt && <p className="mt-2 text-[12px] text-[#8a796b]">Cập nhật: {item.updatedAt}</p>}
            {item.status !== "done" && (
              <button
                type="button"
                onClick={() => handleDone(item.id)}
                className={`mt-3 h-9 w-full rounded-[12px] border px-3 text-[13px] font-bold ${
                  canUpdate ? "border-[#854f19] bg-white text-[#52443a]" : "border-[#ead8ca] bg-[#fffdf9] text-[#8a796b]"
                }`}
              >
                Đánh dấu xong
              </button>
            )}
          </div>
        ))}
      </div>
      {hasPendingChange(order) && (
        <p className="mt-3 rounded-[12px] bg-[#fff1e8] px-3 py-2 text-[13px] font-semibold text-[#854f19]">
          Đang có yêu cầu thay đổi chờ xác nhận, nên tạm khóa cập nhật sản xuất để tránh làm sai thông số/chi phí.
        </p>
      )}
    </div>
  )
}

function ChangeRequestPanel({ order, onRefresh, onNotice }) {
  const [form, setForm] = useState(defaultChangeRequestForm)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleCreate = (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      onNotice("Cần nhập tên thay đổi trước khi tạo yêu cầu thay đổi.")
      return
    }

    createOrderChangeRequest(order.id, {
      ...form,
      costDelta: Number(String(form.costDelta).replace(/\D/g, "")) || 0,
    })
    setForm(defaultChangeRequestForm)
    onRefresh()
    onNotice("Đã tạo yêu cầu thay đổi. Hãy bấm xác nhận áp dụng hoặc không áp dụng để mở khóa các bước tiếp theo.")
  }

  const handleResolve = (changeRequestId, status) => {
    resolveOrderChangeRequest(order.id, changeRequestId, status)
    onRefresh()
    onNotice(status === "confirmed" ? "Đã xác nhận áp dụng thay đổi vào đơn hàng." : "Đã từ chối thay đổi, đơn hàng giữ theo thông số cũ.")
  }

  return (
    <div className="rounded-[14px] border border-[#ead8ca] bg-white p-4">
      <p className="font-bold text-[#231a11]">Yêu cầu thay đổi trong quá trình sản xuất</p>
      <p className="mt-1 text-[13px] text-[#8a796b]">
        Mọi thay đổi cần được hai bên xác nhận lại về thông số, chi phí và thời gian trước khi áp dụng. Xưởng nhập chi phí phát sinh, hệ thống tự cộng hoa hồng vào phần khách thấy.
      </p>

      <form onSubmit={handleCreate} className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="Ví dụ: Đổi màu hoàn thiện"
          className="h-10 rounded-[12px] border border-[#ead8ca] px-3 text-[13px] outline-none focus:border-[#854f19]"
        />
        <input
          value={form.costDelta}
          onChange={(event) => updateField("costDelta", event.target.value)}
          placeholder="Ví dụ: 1.500.000"
          className="h-10 rounded-[12px] border border-[#ead8ca] px-3 text-[13px] outline-none focus:border-[#854f19]"
        />
        <input
          value={form.timeDelta}
          onChange={(event) => updateField("timeDelta", event.target.value)}
          placeholder="Ví dụ: Thêm 2 ngày"
          className="h-10 rounded-[12px] border border-[#ead8ca] px-3 text-[13px] outline-none focus:border-[#854f19]"
        />
        <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-[#854f19] px-3 text-[13px] font-bold text-white">
          <Plus size={16} />
          Tạo yêu cầu thay đổi
        </button>
        <textarea
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Ví dụ: Khách muốn đổi màu, đổi phụ kiện hoặc đổi kích thước."
          className="min-h-20 rounded-[12px] border border-[#ead8ca] p-3 text-[13px] outline-none focus:border-[#854f19] md:col-span-2"
        />
      </form>

      <div className="mt-4 space-y-2">
        {(order.changeRequests || []).map((item) => (
          <div key={item.id} className="rounded-[13px] border border-[#ead8ca] bg-[#fffdf9] p-3">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <p className="font-bold text-[#231a11]">{item.title}</p>
                <p className="mt-1 text-[13px] text-[#52443a]">{item.description || "Không có mô tả"}</p>
                <p className="mt-2 text-[13px] text-[#8a796b]">
                  Chi phí xưởng báo: {formatCurrency(item.costDelta)} · Thời gian: {item.timeDelta || "Không đổi"}
                </p>
              </div>
              <span className="h-fit rounded-full bg-[#fff1e8] px-3 py-1 text-[12px] font-bold text-[#854f19]">
                {changeRequestStatusLabels[item.status]}
              </span>
            </div>
            {item.status === "pending" && (
              <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => handleResolve(item.id, "confirmed")}
                  className="h-9 rounded-[12px] bg-[#854f19] px-3 text-[13px] font-bold text-white"
                >
                  Xác nhận áp dụng
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve(item.id, "rejected")}
                  className="h-9 rounded-[12px] border border-[#ead8ca] px-3 text-[13px] font-bold text-[#a33a22]"
                >
                  Không áp dụng
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function DeliveryPanel({ order, onRefresh, onNotice }) {
  const [deliveryEta, setDeliveryEta] = useState(order.deliveryEta || "Dự kiến giao trong 3 ngày sau khi hoàn thiện")
  const [deliveryNote, setDeliveryNote] = useState(order.deliveryNote || "Xưởng sẽ gọi khách trước khi giao hàng.")
  const productionDone = isProductionDone(order)

  const handleShip = () => {
    if (hasPendingChange(order)) {
      onNotice("Đang có yêu cầu thay đổi chờ xác nhận. Hãy xử lý yêu cầu thay đổi trước khi chuyển sang vận chuyển.")
      return
    }

    if (!productionDone) {
      onNotice("Cần đánh dấu xong tất cả hạng mục sản xuất trước khi chuyển sang vận chuyển.")
      return
    }

    updateOrderDelivery(order.id, { deliveryEta, deliveryNote })
    onRefresh()
    onNotice("Đã chuyển đơn sang trạng thái đang vận chuyển.")
  }

  const handleDelivered = () => {
    updateOrderStatus(order.id, "delivered", "Xưởng đã giao hàng cho khách.")
    onRefresh()
    onNotice("Đã đánh dấu đơn hàng là đã giao.")
  }

  const handleComplete = () => {
    completeOrder(order.id)
    onRefresh()
    onNotice("Đơn hàng đã hoàn tất.")
  }

  return (
    <div className="rounded-[14px] border border-[#ead8ca] bg-white p-4">
      <div className="flex items-center gap-2">
        <CalendarClock size={18} className="text-[#854f19]" />
        <p className="font-bold text-[#231a11]">Giao hàng và hoàn tất</p>
      </div>

      {order.status === "in_production" && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={deliveryEta}
            onChange={(event) => setDeliveryEta(event.target.value)}
            placeholder="Ví dụ: Dự kiến giao trong 3 ngày sau khi hoàn thiện"
            className="h-10 rounded-[12px] border border-[#ead8ca] px-3 text-[13px] outline-none focus:border-[#854f19]"
          />
          <input
            value={deliveryNote}
            onChange={(event) => setDeliveryNote(event.target.value)}
            placeholder="Ví dụ: Xưởng sẽ gọi khách trước khi giao hàng"
            className="h-10 rounded-[12px] border border-[#ead8ca] px-3 text-[13px] outline-none focus:border-[#854f19]"
          />
          <button
            type="button"
            onClick={handleShip}
            className={`h-10 rounded-[12px] px-3 text-[13px] font-bold md:col-span-2 ${
              productionDone && !hasPendingChange(order) ? "bg-[#854f19] text-white" : "border border-[#ead8ca] bg-[#fffdf9] text-[#8a796b]"
            }`}
          >
            Chuyển sang vận chuyển
          </button>
        </div>
      )}

      {order.status === "shipping" && (
        <div className="mt-4">
          <p className="rounded-[12px] bg-[#fff1e8] px-3 py-2 text-[13px] font-semibold text-[#854f19]">
            Dự kiến khách nhận: {order.deliveryEta || "Chưa nhập"}
          </p>
          <button type="button" onClick={handleDelivered} className="mt-3 h-10 w-full rounded-[12px] bg-[#854f19] px-3 text-[13px] font-bold text-white">
            Đánh dấu đã giao
          </button>
        </div>
      )}

      {order.status === "delivered" && (
        <button type="button" onClick={handleComplete} className="mt-4 h-10 w-full rounded-[12px] bg-[#854f19] px-3 text-[13px] font-bold text-white">
          Hoàn tất đơn hàng
        </button>
      )}

      {order.status === "completed" && (
        <div className="mt-4 rounded-[13px] bg-[#fff1e8] p-4">
          <p className="font-bold text-[#231a11]">Đơn hàng thành công</p>
          <p className="mt-2 text-[13px] text-[#52443a]">Hoàn tất: {order.completedAt}</p>
          <p className="mt-2 text-[13px] text-[#52443a]">Hoa hồng WoodSpec: {formatCurrency(order.commissionAmount)}</p>
          <p className="mt-1 text-[13px] font-bold text-[#854f19]">
            Xưởng thực nhận: {formatCurrency(order.total)} - {formatCurrency(order.commissionAmount)} = {formatCurrency(order.workshopReceivable)}
          </p>
        </div>
      )}

      {order.status === "confirmed" && (
        <p className="mt-4 rounded-[12px] bg-[#fffdf9] px-3 py-2 text-[13px] text-[#8a796b]">
          Cần bắt đầu sản xuất và hoàn tất từng hạng mục trước khi nhập ETA giao hàng.
        </p>
      )}
    </div>
  )
}

function OrdersPage() {
  const [searchParams] = useSearchParams()
  const [orderList, setOrderList] = useState(() => getOrders())
  const [activeFilter, setActiveFilter] = useState("all")
  const [message, setMessage] = useState("")
  const selectedOrderRef = useRef(null)
  const selectedOrderId =
    searchParams.get("orderId") ||
    orderList.find((order) => order.quotationId === searchParams.get("quotationId") || order.requestId === searchParams.get("requestId"))?.id ||
    ""

  const visibleOrders = useMemo(
    () => {
      const filteredOrders = activeFilter === "all" ? orderList : orderList.filter((order) => order.status === activeFilter)
      if (!selectedOrderId) return filteredOrders

      return [...filteredOrders].sort((first, second) => {
        if (first.id === selectedOrderId) return -1
        if (second.id === selectedOrderId) return 1
        return 0
      })
    },
    [activeFilter, orderList, selectedOrderId],
  )

  useEffect(() => {
    if (!selectedOrderId) return

    setActiveFilter("all")
    window.requestAnimationFrame(() => {
      selectedOrderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }, [selectedOrderId])

  const refreshOrders = () => {
    setOrderList(getOrders())
  }

  const handleStartProduction = (order) => {
    if (order.status !== "confirmed") {
      setMessage("Đơn này không còn ở bước mới xác nhận, nên không thể bấm bắt đầu sản xuất tại đây.")
      return
    }

    if (order.finalSpecConfirmation?.status !== "confirmed") {
      setMessage("Cần chốt báo giá trước khi bắt đầu sản xuất.")
      return
    }

    if (hasPendingChange(order)) {
      setMessage("Đang có yêu cầu thay đổi chờ xác nhận. Hãy xử lý yêu cầu thay đổi trước khi bắt đầu sản xuất.")
      return
    }

    startOrderProduction(order.id)
    refreshOrders()
    setMessage("Đã bắt đầu sản xuất. Bây giờ có thể đánh dấu xong từng hạng mục ở phần tiến độ sản xuất.")
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[18px] border border-[#ead8ca] bg-white p-4 text-left shadow-[0_18px_48px_rgba(82,68,58,0.08)] sm:p-6">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#854f19]">Đơn hàng</p>
        <h2 className="mt-2 text-[30px] font-bold leading-tight text-[#231a11]">Theo dõi sản xuất và giao hàng</h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-6 text-[#52443a]">
          Đơn được tạo sau khi khách thanh toán khoản cọc đầu tiên và xưởng xác nhận đã nhận cọc. Sau đó xưởng cập nhật sản xuất, thay đổi, giao hàng và hoa hồng khi đơn hoàn tất.
        </p>
      </div>

      {message && (
        <p className="rounded-[14px] border border-[#ead8ca] bg-[#fff1e8] px-4 py-3 text-left text-[14px] font-bold text-[#854f19]">
          {message}
        </p>
      )}

      <div className="flex gap-2 overflow-x-auto rounded-[18px] border border-[#ead8ca] bg-white p-3 shadow-[0_14px_36px_rgba(82,68,58,0.06)] sm:flex-wrap sm:overflow-visible sm:p-4">
        {[{ label: "Tất cả", value: "all" }, ...orderSteps.map((step) => ({ label: step.label, value: step.value }))].map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-bold ${
              activeFilter === filter.value
                ? "border-[#854f19] bg-[#fff1e8] text-[#854f19]"
                : "border-[#ead8ca] text-[#52443a]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visibleOrders.map((order) => {
          const canStartProduction =
            order.status === "confirmed" && order.finalSpecConfirmation?.status === "confirmed" && !hasPendingChange(order)

          return (
            <article
              key={order.id}
              ref={order.id === selectedOrderId ? selectedOrderRef : null}
              className={`scroll-mt-5 rounded-[18px] border p-4 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)] sm:p-5 ${
                order.id === selectedOrderId ? "border-[#854f19] bg-[#fffdf9]" : "border-[#ead8ca] bg-white"
              }`}
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#854f19]">{order.id}</p>
                  <h3 className="mt-2 break-words text-[20px] font-black leading-tight text-[#231a11] sm:text-[22px]">{order.product}</h3>
                  <p className="mt-1 text-[14px] text-[#52443a]">
                    {order.customerName} · {order.requestId} · Báo giá {order.quotationId}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to={`/requests/${order.requestId}`}
                      className="inline-flex h-9 items-center rounded-[12px] border border-[#ead8ca] bg-white px-3 text-[13px] font-bold text-[#854f19] hover:bg-[#fff1e8]"
                    >
                      Xem yêu cầu
                    </Link>
                    <Link
                      to={`${ROUTES.quotations}?quotationId=${order.quotationId}&requestId=${order.requestId}`}
                      className="inline-flex h-9 items-center rounded-[12px] border border-[#ead8ca] bg-white px-3 text-[13px] font-bold text-[#854f19] hover:bg-[#fff1e8]"
                    >
                      Xem báo giá
                    </Link>
                  </div>
                </div>
                <div className="rounded-[14px] bg-[#fff1e8] px-4 py-3 text-left lg:text-right">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#854f19]">Trạng thái</p>
                  <p className="mt-1 text-[15px] font-black text-[#231a11]">{orderStatusLabels[order.status]}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] p-4">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a796b]">Tổng báo giá</p>
                  <p className="mt-2 break-words text-[18px] font-black text-[#231a11] sm:text-[20px]">{formatCurrency(order.total)}</p>
                </div>
                <div className="rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] p-4">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a796b]">Cọc đã nhận</p>
                  <p className="mt-2 break-words text-[18px] font-black text-[#231a11] sm:text-[20px]">{formatCurrency(order.depositAmount)}</p>
                </div>
                <div className="rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] p-4">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a796b]">Hoa hồng</p>
                  <p className="mt-2 break-words text-[18px] font-black text-[#a33a22] sm:text-[20px]">{formatCurrency(order.commissionAmount)}</p>
                </div>
                <div className="rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] p-4">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a796b]">Xưởng thực nhận</p>
                  <p className="mt-2 break-words text-[18px] font-black text-[#854f19] sm:text-[20px]">{formatCurrency(order.workshopReceivable)}</p>
                </div>
              </div>

              <div className="mt-5">
                <OrderProgress status={order.status} />
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-4">
                  <FinalSpecPanel order={order} onRefresh={refreshOrders} />
                  <ProductionPanel order={order} onRefresh={refreshOrders} onNotice={setMessage} />
                  <ChangeRequestPanel order={order} onRefresh={refreshOrders} onNotice={setMessage} />

                  <div className="rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] p-4">
                    <p className="font-bold text-[#231a11]">Lịch sử tiến độ</p>
                    <div className="mt-3 space-y-2">
                      {(order.timeline || []).map((item, index) => (
                        <div key={`${item.status}-${index}`} className="flex flex-col gap-1 rounded-[12px] bg-white px-3 py-2 text-[13px] sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <p className="font-semibold text-[#52443a]">{item.label}</p>
                          <span className="shrink-0 text-[#8a796b] sm:text-right">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[14px] border border-[#ead8ca] bg-white p-4">
                    <p className="font-bold text-[#231a11]">Hành động chính</p>
                    {order.status === "confirmed" ? (
                      <button
                        type="button"
                        onClick={() => handleStartProduction(order)}
                        className={`mt-4 h-11 w-full rounded-[13px] px-4 text-[14px] font-bold ${
                          canStartProduction ? "bg-[#854f19] text-white" : "border border-[#ead8ca] bg-[#fffdf9] text-[#8a796b]"
                        }`}
                      >
                        Bắt đầu sản xuất
                      </button>
                    ) : (
                      <p className="mt-4 rounded-[13px] bg-[#fff1e8] px-4 py-3 text-[14px] font-semibold text-[#854f19]">
                        {order.status === "confirmed"
                          ? "Cần chốt báo giá và xử lý yêu cầu thay đổi trước khi sản xuất."
                          : "Luồng hiện tại được xử lý ở các panel bên dưới."}
                      </p>
                    )}
                    <p className="mt-3 text-[13px] leading-5 text-[#8a796b]">
                      Phần này dùng để chuyển đơn từ báo giá đã chốt sang quy trình sản xuất.
                    </p>
                  </div>

                  <DeliveryPanel order={order} onRefresh={refreshOrders} onNotice={setMessage} />
                </div>
              </div>
            </article>
          )
        })}

        {visibleOrders.length === 0 && (
          <div className="rounded-[18px] border border-[#ead8ca] bg-white p-8 text-center text-[#8a796b] shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
            Chưa có đơn hàng phù hợp.
          </div>
        )}
      </div>
    </section>
  )
}

export default OrdersPage
