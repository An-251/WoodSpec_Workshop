import { Link, useLocation } from "react-router-dom"
import { ArrowRight, Banknote, CheckCircle2, CircleDollarSign, ClipboardCheck, CreditCard, Hammer, PackageCheck, Truck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { quoteOptions } from "@/data/reference/quotes"
import { workshops } from "@/data/reference/workshops"
import { generateQuoteOptions, getQuoteBreakdown } from "@/features/quotes/utils"
import { useConfiguratorStore } from "@/stores/useConfiguratorStore"
import { formatCurrency } from "@/utils/formatCurrency"

const productionStages = [
  "Xác nhận thông số cuối",
  "Chuẩn bị vật liệu",
  "Cắt ván",
  "Làm khung",
  "Làm chân bàn hoặc chân tủ",
  "Làm mặt bàn hoặc thân tủ",
  "Làm cánh tủ, ngăn kéo hoặc khoang kệ",
  "Hoàn thiện sản phẩm",
  "Kiểm tra chất lượng và đóng gói",
]

const orderStatusLabels = {
  "not-started": "Chưa bắt đầu",
  "waiting-deposit": "Chờ đặt cọc",
  "deposit-paid": "Khách đã đặt cọc",
  "in-production": "Đang sản xuất",
  "ready-for-delivery": "Sẵn sàng giao hàng",
  delivering: "Đang giao hàng",
  delivered: "Đã giao hàng",
  received: "Khách đã nhận hàng",
  completed: "Hoàn tất đơn hàng",
}

function formatDateTime(value) {
  if (!value) {
    return "Chưa có"
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

function StepCard({ icon: Icon, label, title, children }) {
  return (
    <article className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#f7f7f5] text-[#6f665c]">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f665c]">{label}</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#0a0a0a]">{title}</h2>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  )
}

function OrderProgressPage() {
  const location = useLocation()
  const isAppFlow = location.pathname.startsWith("/app")
  const quotesPath = isAppFlow ? ROUTES.appQuotes : ROUTES.quotes
  const configuration = useConfiguratorStore((state) => state.configuration)
  const payDeposit = useConfiguratorStore((state) => state.payDeposit)
  const completeProductionStage = useConfiguratorStore((state) => state.completeProductionStage)
  const updateDeliveryStatus = useConfiguratorStore((state) => state.updateDeliveryStatus)
  const confirmCustomerReceived = useConfiguratorStore((state) => state.confirmCustomerReceived)
  const payFinalAmount = useConfiguratorStore((state) => state.payFinalAmount)
  const details = configuration.requestDetails
  const orderDetails = configuration.orderDetails
  const quotes = generateQuoteOptions({ configuration, quoteOptions, workshops, sortBy: "price" })
  const selectedQuote = quotes.find((quote) => quote.id === configuration.selectedQuoteId)
  const canStartOrder = Boolean(selectedQuote && details.finalConfirmed)

  if (!canStartOrder) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-8 text-left lg:px-10">
        <div className="w-full rounded-xl border border-[#e5e5e5] bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex size-12 items-center justify-center rounded-lg bg-[#f7f7f5] text-[#6f665c]">
            <ClipboardCheck className="size-6" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-[#0a0a0a]">Cần chọn xưởng và xác nhận thông số cuối</h1>
          <p className="mt-3 text-sm leading-7 text-[#525252]">
            Luồng đặt cọc và theo dõi sản xuất chỉ mở sau khi khách hàng đã chọn một xưởng và chốt bảng thông số cuối cùng.
          </p>
          <Link to={quotesPath}>
            <Button className="mt-6 bg-[#0a0a0a] hover:bg-[#262626]">
              <ArrowRight />
              Báo giá
            </Button>
          </Link>
        </div>
      </section>
    )
  }

  const breakdown = getQuoteBreakdown(selectedQuote.price, selectedQuote)
  const depositAmount = orderDetails.depositAmount || breakdown.deposit
  const totalOrderValue = selectedQuote.price + (orderDetails.approvedChangeCost ?? 0)
  const remainingAmount = Math.max(0, totalOrderValue - depositAmount)
  const productionPercent = Math.round(((orderDetails.productionStageIndex + 1) / productionStages.length) * 100)
  const depositPaid = orderDetails.depositStatus === "paid" || orderDetails.depositStatus === "confirmed"
  const depositReady = depositPaid
  const productionCompleted = orderDetails.productionStatus === "completed"
  const customerReceived = Boolean(orderDetails.customerReceivedAt)
  const orderCompleted = orderDetails.finalPaymentStatus === "paid"
  const visibleProductionStages = depositReady ? productionStages.slice(0, orderDetails.productionStageIndex + 1) : []

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-left lg:px-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-[#f7f7f5] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6f665c]">
            <PackageCheck className="size-4" />
            Theo dõi đơn hàng
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-normal text-[#0a0a0a] md:text-4xl">
            Đặt cọc, sản xuất và nhận hàng
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#525252]">
            Sau khi khách hàng đã chọn xưởng và chốt thông số cuối, WoodSpec hỗ trợ theo dõi đặt cọc, tiến độ sản xuất, giao hàng và thanh toán phần còn lại.
          </p>
        </div>
        <Link to={quotesPath}>
          <Button variant="outline" className="border-[#d4d4d4] bg-white text-[#6f665c]">
            <ArrowRight />
            Báo giá
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#737373]">Xưởng đã chọn</p>
          <strong className="mt-2 block text-lg text-[#0a0a0a]">{selectedQuote.workshop.name}</strong>
          <p className="mt-2 text-sm text-[#525252]">{selectedQuote.workshop.location}</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#737373]">Tổng báo giá</p>
          <strong className="mt-2 block text-2xl text-[#6f665c]">{formatCurrency(selectedQuote.price)}</strong>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#737373]">Đặt cọc</p>
          <strong className="mt-2 block text-2xl text-[#6f665c]">{formatCurrency(depositAmount)}</strong>
          <p className="mt-2 text-sm text-[#525252]">{orderDetails.depositPercent || Math.round(selectedQuote.depositRate * 100)}% giá trị báo giá</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-[#f7f7f5] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#737373]">Trạng thái</p>
          <strong className="mt-2 block text-lg text-[#0a0a0a]">{orderStatusLabels[orderDetails.orderStatus] ?? "Đang xử lý"}</strong>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <StepCard icon={CreditCard} label="Bước 9" title="Thanh toán khoản đặt cọc đầu tiên">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
                <p className="font-semibold text-[#0a0a0a]">Thông tin thanh toán</p>
                <dl className="mt-3 space-y-2 text-sm text-[#525252]">
                  <div className="flex justify-between gap-4">
                    <dt>Tổng giá trị báo giá</dt>
                    <dd className="font-semibold">{formatCurrency(selectedQuote.price)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Phần trăm đặt cọc</dt>
                    <dd className="font-semibold">{orderDetails.depositPercent || Math.round(selectedQuote.depositRate * 100)}%</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Số tiền đặt cọc</dt>
                    <dd className="font-semibold">{formatCurrency(depositAmount)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Phương thức</dt>
                    <dd className="font-semibold">Chuyển khoản</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs leading-5 text-[#525252]">
                  Điều kiện hoàn hoặc hủy cọc cần được xác nhận trong điều khoản báo giá trước khi sản xuất.
                </p>
              </div>

              <div className="rounded-lg border border-[#e5e5e5] bg-white p-4">
                <p className="font-semibold text-[#0a0a0a]">Khách xác nhận đặt cọc</p>
                <dl className="mt-3 space-y-2 text-sm text-[#525252]">
                  <div className="flex justify-between gap-4">
                    <dt>Trạng thái thanh toán</dt>
                    <dd className="font-semibold">{depositPaid ? "Đã đặt cọc" : "Chưa đặt cọc"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Thời điểm đặt cọc</dt>
                    <dd className="text-right font-semibold">{formatDateTime(orderDetails.depositPaidAt)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button disabled={depositPaid} className="bg-[#0a0a0a] hover:bg-[#262626]" onClick={() => payDeposit({ quotePrice: selectedQuote.price, depositRate: selectedQuote.depositRate })}>
                    <CreditCard />
                    {depositPaid ? "Đã cọc" : "Đặt cọc"}
                  </Button>
                </div>
              </div>
            </div>
          </StepCard>

          {depositReady && (
            <StepCard icon={Hammer} label="Bước 10" title="Cập nhật tiến độ sản xuất">
              <div className="mb-5 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#0a0a0a]">Tiến độ hiện tại</p>
                    <p className="mt-1 text-sm text-[#525252]">Cập nhật gần nhất: {formatDateTime(orderDetails.productionUpdatedAt)}</p>
                  </div>
                  <Badge className="rounded-md bg-[#0a0a0a] text-white">{productionPercent}%</Badge>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e5e5e5]">
                  <div className="h-full rounded-full bg-[#0a0a0a]" style={{ width: `${productionPercent}%` }} />
                </div>
              </div>

              <div className="space-y-3">
                {visibleProductionStages.map((stage, index) => {
                  const isDone = index < orderDetails.productionStageIndex || productionCompleted
                  const isCurrent = !productionCompleted && index === orderDetails.productionStageIndex

                  return (
                    <div key={stage} className={`flex items-center gap-3 rounded-lg border p-3 ${isCurrent ? "border-[#6f665c] bg-[#f7f7f5]" : "border-[#e5e5e5] bg-white"}`}>
                      <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDone ? "bg-[#2f7d4e] text-white" : isCurrent ? "bg-[#0a0a0a] text-white" : "bg-[#f5f5f4] text-[#525252]"}`}>
                        {isDone ? <CheckCircle2 className="size-4" /> : index + 1}
                      </span>
                      <span className="text-sm font-semibold text-[#0a0a0a]">{stage}</span>
                    </div>
                  )
                })}
              </div>

              <Button disabled={productionCompleted} className="mt-5 bg-[#0a0a0a] hover:bg-[#262626]" onClick={() => completeProductionStage(productionStages.length - 1)}>
                <Hammer />
                {productionCompleted ? "Hoàn tất" : "Tiếp theo"}
              </Button>
            </StepCard>
          )}

          {productionCompleted && (
            <StepCard icon={Truck} label="Bước 11" title="Nhận hàng và thanh toán phần còn lại">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
                  <p className="font-semibold text-[#0a0a0a]">Theo dõi giao hàng</p>
                  <p className="mt-2 text-sm leading-6 text-[#525252]">
                    Khi sản phẩm đã hoàn thiện, khách hàng có thể theo dõi trạng thái giao và xác nhận khi đơn đã đến nơi.
                  </p>
                  <Button disabled={orderDetails.deliveryStatus === "delivered"} className="mt-4 bg-[#0a0a0a] hover:bg-[#262626]" onClick={() => updateDeliveryStatus("delivered")}>
                    <Truck />
                    {orderDetails.deliveryStatus === "delivered" ? "Đã nhận" : "Đã nhận"}
                  </Button>
                </div>

                {orderDetails.deliveryStatus === "delivered" && (
                  <div className="rounded-lg border border-[#e5e5e5] bg-white p-4">
                    <p className="font-semibold text-[#0a0a0a]">Kiểm tra sản phẩm</p>
                    <p className="mt-2 text-sm leading-6 text-[#525252]">
                      Khách hàng kiểm tra sản phẩm theo bảng thông số đã chốt trước khi thanh toán phần còn lại.
                    </p>
                    <Button disabled={customerReceived} variant="outline" className="mt-4 border-[#d4d4d4] bg-white text-[#6f665c]" onClick={confirmCustomerReceived}>
                      <CheckCircle2 />
                      {customerReceived ? "Đã xác nhận" : "Xác nhận"}
                    </Button>
                  </div>
                )}

                {customerReceived && (
                  <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
                    <p className="font-semibold text-[#0a0a0a]">Thanh toán còn lại</p>
                    <p className="mt-2 text-sm leading-6 text-[#525252]">
                      Số tiền còn lại: <strong>{formatCurrency(remainingAmount)}</strong>
                    </p>
                    <Button disabled={orderCompleted} className="mt-4 bg-[#0a0a0a] hover:bg-[#262626]" onClick={payFinalAmount}>
                      <Banknote />
                      {orderCompleted ? "Đã trả" : "Thanh toán"}
                    </Button>
                  </div>
                )}
              </div>
            </StepCard>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 text-[#6f665c]">
              <CircleDollarSign className="size-5" />
              <h2 className="text-xl font-semibold text-[#0a0a0a]">Quyết toán</h2>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt>Tổng giá trị đơn</dt>
                <dd className="font-semibold">{formatCurrency(totalOrderValue)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Đã đặt cọc</dt>
                <dd className="font-semibold">{formatCurrency(depositAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Còn lại khách thanh toán</dt>
                <dd className="font-semibold">{formatCurrency(remainingAmount)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-[#e5e5e5] bg-[#f7f7f5] p-5 text-sm leading-6 text-[#525252]">
            <div className="flex items-center gap-2 font-semibold text-[#0a0a0a]">
              <Banknote className="size-4 text-[#6f665c]" />
              Điều kiện hoàn tất
            </div>
            <p className="mt-2">
              Đơn hàng được xem là hoàn tất khi khách xác nhận đúng hàng và thanh toán toàn bộ phần còn lại.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default OrderProgressPage
