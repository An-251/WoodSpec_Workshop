import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Bell, FileText, Inbox, MessageSquare, PackageCheck, TrendingUp } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import { orderStatusLabels } from "@/data/mock/orders"
import { quotationStatusLabels } from "@/data/mock/quotations"
import { requestStatusLabels } from "@/data/mock/requests"
import { getNotifications, getOrders, getQuotations, getRequests } from "@/stores/workshopStorage"
import { formatCurrency } from "@/utils/formatCurrency"

function Panel({ title, to, children }) {
  return (
    <div className="flex h-[360px] min-h-0 flex-col rounded-[18px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
      <div className="mb-4 flex min-h-7 shrink-0 items-center justify-between gap-3">
        <h3 className="text-[20px] font-bold leading-7 text-[#231a11]">{title}</h3>
        {to && (
          <Link className="shrink-0 text-[13px] font-bold text-[#854f19] hover:text-[#6f4114]" to={to}>
            Xem tất cả
          </Link>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {children}
      </div>
    </div>
  )
}

function DashboardPage() {
  const [requestList] = useState(() => getRequests())
  const [quotationList] = useState(() => getQuotations())
  const [orderList] = useState(() => getOrders())
  const [notificationList] = useState(() => getNotifications())

  const stats = useMemo(
    () => [
      { label: "Yêu cầu mới", value: requestList.filter((request) => request.status === "new").length, icon: Inbox },
      {
        label: "Đang trao đổi",
        value: requestList.filter((request) => ["discussing", "need_more_info", "reviewing"].includes(request.status)).length,
        icon: MessageSquare,
      },
      { label: "Chờ báo giá", value: requestList.filter((request) => request.status === "ready_to_quote").length, icon: FileText },
      { label: "Báo giá đã gửi", value: quotationList.filter((quotation) => quotation.status === "sent").length, icon: TrendingUp },
      { label: "Đơn đang làm", value: orderList.filter((order) => ["confirmed", "in_production", "shipping"].includes(order.status)).length, icon: PackageCheck },
      {
        label: "Tổng giá trị báo giá",
        value: formatCurrency(quotationList.reduce((sum, quotation) => sum + Number(quotation.total || 0), 0)),
        icon: Bell,
      },
    ],
    [orderList, quotationList, requestList],
  )

  return (
    <section className="space-y-5">
      <div className="rounded-[18px] border border-[#ead8ca] bg-white p-6 text-left shadow-[0_18px_48px_rgba(82,68,58,0.08)]">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#854f19]">Tổng quan</p>
        <h2 className="mt-2 text-[30px] font-bold leading-tight text-[#231a11]">Bảng điều khiển xưởng gỗ</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[#52443a]">
          Theo dõi yêu cầu khách hàng, báo giá của xưởng, đơn đã xác nhận và tiến độ giao hàng.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <article key={item.label} className="rounded-[16px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
            <div className="grid size-11 place-items-center rounded-[14px] bg-[#fff1e8] text-[#854f19]">
              <item.icon size={20} />
            </div>
            <p className="mt-5 text-[28px] font-bold text-[#231a11]">{item.value}</p>
            <p className="text-[14px] text-[#52443a]">{item.label}</p>
          </article>
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Panel title="Yêu cầu gần đây" to={ROUTES.requests}>
          <div className="space-y-3">
            {requestList.map((item) => (
              <Link key={item.id} to={`/requests/${item.id}`} className="grid min-h-[64px] items-center gap-3 rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <div>
                  <p className="font-bold text-[#231a11]">{item.customerName}</p>
                  <p className="mt-0.5 text-[14px] text-[#52443a]">{item.productType} · {item.budget}</p>
                </div>
                <span className="h-fit justify-self-start rounded-full bg-[#fff1e8] px-3 py-1 text-[12px] font-bold text-[#854f19] md:justify-self-end">
                  {requestStatusLabels[item.status]}
                </span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Báo giá gần đây" to={ROUTES.quotations}>
          <div className="space-y-3">
            {quotationList.map((item) => (
              <Link key={item.id} to={`${ROUTES.quotations}?quotationId=${item.id}&requestId=${item.requestId}`} className="block min-h-[84px] rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#231a11]">{item.id}</p>
                    <p className="mt-0.5 text-[14px] text-[#52443a]">{item.customerName}</p>
                  </div>
                  <p className="shrink-0 text-right font-bold text-[#854f19]">{formatCurrency(item.total)}</p>
                </div>
                <p className="mt-2 text-[13px] text-[#52443a]">{quotationStatusLabels[item.status]}</p>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Đơn hàng mới" to={ROUTES.orders}>
          <div className="space-y-3">
            {orderList.map((item) => (
              <Link key={item.id} to={`${ROUTES.orders}?orderId=${item.id}&quotationId=${item.quotationId}&requestId=${item.requestId}`} className="block min-h-[80px] rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] px-4 py-3">
                <p className="font-bold text-[#231a11]">{item.id}</p>
                <p className="mt-1 text-[14px] text-[#52443a]">{item.customerName} · {item.product}</p>
                <p className="mt-2 text-[13px] font-bold text-[#854f19]">{orderStatusLabels[item.status]}</p>
              </Link>
            ))}
            {orderList.length === 0 && <p className="text-[14px] text-[#8a796b]">Chưa có đơn đã xác nhận.</p>}
          </div>
        </Panel>

        <Panel title="Thông báo mới" to={ROUTES.notifications}>
          <div className="space-y-3">
            {notificationList.map((item) => (
              <Link key={item.id} to={item.target} className="block min-h-[72px] rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] px-4 py-3">
                <p className="font-bold text-[#231a11]">{item.title}</p>
                <p className="mt-1 text-[14px] text-[#52443a]">{item.content}</p>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  )
}

export default DashboardPage
