import { ArrowRight, CheckCircle2, Send } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import { WorkflowSteps, WorkshopCard, WorkshopPageHeader } from "@/features/workshop/components/WorkshopUI"
import { FLOW_STATUS, getFlowItem, useWorkshopFlowStore } from "@/stores/useWorkshopFlowStore"
import { formatVND } from "@/utils/currency"

const lineItems = [
  ["Thi công sản phẩm chính", 1, 35_000_000],
  ["Vật liệu gỗ sồi FSC", 1, 10_000_000],
  ["Hoàn thiện bề mặt", 1, 5_000_000],
  ["Giao hàng & lắp đặt", 1, 3_750_000],
]

function WorkshopQuotationPage() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const statusById = useWorkshopFlowStore((state) => state.statusById)
  const submitQuotation = useWorkshopFlowStore((state) => state.submitQuotation)
  const markCustomerSelected = useWorkshopFlowStore((state) => state.markCustomerSelected)
  const request = getFlowItem(requestId, statusById)
  const total = lineItems.reduce((sum, [, qty, price]) => sum + qty * price, 0)
  const deposit = Math.round(total * 0.5)
  const isAwaiting = request.flowStatus === FLOW_STATUS.awaiting
  const isSelected = ![FLOW_STATUS.open, FLOW_STATUS.awaiting].includes(request.flowStatus)

  function handleSubmitQuotation() {
    submitQuotation(request.id)
  }

  function handleCustomerSelected() {
    markCustomerSelected(request.id)
    navigate(ROUTES.workshopBuildDetail(request.id))
  }

  return (
    <div className="space-y-8">
      <WorkshopPageHeader
        title={`Báo giá cho ${request.customer}`}
        subtitle={`${request.item} · ${request.reference}`}
        backTo={ROUTES.workshopRequestDetail(request.id)}
        backLabel="Quay lại yêu cầu"
      />

      <WorkflowSteps activeIndex={isSelected ? 3 : isAwaiting ? 2 : 1} completedThrough={isSelected ? 2 : isAwaiting ? 1 : 0} />

      {isAwaiting ? (
        <WorkshopCard className="p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-success">
                <CheckCircle2 className="size-5" />
                Báo giá đã gửi cho khách
              </p>
              <h2 className="mt-3 text-3xl font-bold text-foreground">Đang chờ khách so sánh và quyết định.</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Trong MVP, bấm nút dưới để mô phỏng khách chọn xưởng của bạn. Sau đó đơn sẽ chuyển sang bước xác nhận đặt cọc.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCustomerSelected}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-gallery-md transition duration-200 hover:bg-foreground"
            >
              Khách chọn xưởng này
              <ArrowRight className="size-5" />
            </button>
          </div>
        </WorkshopCard>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <WorkshopCard className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Báo giá của bạn</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground">Chuẩn bị báo giá sơ bộ</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Khách sẽ so sánh báo giá này với các xưởng khác. Tách chi phí rõ ràng giúp khách dễ tin tưởng và dễ ra quyết định hơn.
            </p>
          </WorkshopCard>

          <WorkshopCard className="p-6">
            <h3 className="text-xl font-bold text-foreground">Các dòng chi phí</h3>
            <div className="mt-5 overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-[minmax(0,1fr)_90px_160px_160px] bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Mô tả</span>
                <span>Số lượng</span>
                <span>Đơn giá</span>
                <span className="text-right">Thành tiền</span>
              </div>
              {lineItems.map(([label, qty, price]) => (
                <div key={label} className="grid grid-cols-[minmax(0,1fr)_90px_160px_160px] border-t border-border px-4 py-4">
                  <span className="font-medium">{label}</span>
                  <span>{qty}</span>
                  <span>{formatVND(price)}</span>
                  <span className="text-right font-semibold">{formatVND(qty * price)}</span>
                </div>
              ))}
              <button className="w-full border-t border-border py-3 text-sm font-medium text-primary transition duration-200 hover:bg-muted">+ Thêm dòng chi phí</button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-border bg-surface-elevated p-4">
                <p className="text-sm text-muted-foreground">Tổng báo giá</p>
                <p className="mt-2 text-2xl font-bold">{formatVND(total)}</p>
              </div>
              <div className="rounded-md border border-border bg-surface-elevated p-4">
                <p className="text-sm text-muted-foreground">Thời gian thi công</p>
                <p className="mt-2 text-lg font-semibold">4 tuần</p>
              </div>
              <div className="rounded-md border border-border bg-surface-elevated p-4">
                <p className="text-sm text-muted-foreground">Đặt cọc đề xuất</p>
                <p className="mt-2 text-lg font-semibold">50% ({formatVND(deposit)})</p>
              </div>
            </div>
          </WorkshopCard>

          <WorkshopCard className="p-6">
            <h3 className="text-xl font-bold text-foreground">Tin nhắn gửi khách</h3>
            <p className="mt-1 text-sm text-muted-foreground">Một lời nhắn ngắn giúp khách hiểu cách tiếp cận của xưởng.</p>
            <textarea
              className="mt-4 min-h-36 w-full rounded-lg border border-input bg-card p-4 text-foreground outline-none transition duration-200 focus:border-ring focus:ring-2 focus:ring-ring/30"
              defaultValue={`Chào ${request.customer},\n\nCảm ơn bạn đã gửi brief chi tiết. Bên dưới là báo giá sơ bộ của xưởng. Chúng tôi có thể điều chỉnh nếu bạn cần thay đổi vật liệu, kích thước hoặc thời gian giao hàng.\n\nWoodSpec`}
              readOnly={isAwaiting || isSelected}
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                disabled={isAwaiting || isSelected}
                onClick={handleSubmitQuotation}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-gallery-sm transition duration-200 hover:bg-foreground disabled:bg-muted disabled:text-muted-foreground"
              >
                {isAwaiting || isSelected ? "Đã gửi báo giá" : "Gửi báo giá"}
                <Send className="size-4" />
              </button>
            </div>
          </WorkshopCard>
        </div>

        <aside className="space-y-4">
          <WorkshopCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tóm tắt yêu cầu</p>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Sản phẩm", request.item],
                ["Vật liệu", request.material],
                ["Kích thước", request.dimensions],
                ["Hạn mong muốn", request.deadline],
                ["Ngân sách", request.budget || "50.000.000 – 87.000.000 ₫"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </WorkshopCard>
        </aside>
      </div>
    </div>
  )
}

export default WorkshopQuotationPage
