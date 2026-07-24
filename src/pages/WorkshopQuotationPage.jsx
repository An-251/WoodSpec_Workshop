import { ArrowRight, CheckCircle2, Plus, Send, Trash2 } from "lucide-react"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import { WorkflowSteps, WorkshopCard, WorkshopPageHeader } from "@/features/workshop/components/WorkshopUI"
import { FLOW_STATUS, getFlowItem, useWorkshopFlowStore } from "@/stores/useWorkshopFlowStore"
import { formatVND } from "@/utils/currency"

const initialLineItems = [
  { id: "main-product", label: "Thi công sản phẩm chính", quantity: 1, price: 35_000_000 },
  { id: "material", label: "Vật liệu gỗ sồi FSC", quantity: 1, price: 10_000_000 },
  { id: "finish", label: "Hoàn thiện bề mặt", quantity: 1, price: 5_000_000 },
  { id: "delivery", label: "Giao hàng & lắp đặt", quantity: 1, price: 3_750_000 },
]

function WorkshopQuotationPage() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const statusById = useWorkshopFlowStore((state) => state.statusById)
  const submitQuotation = useWorkshopFlowStore((state) => state.submitQuotation)
  const markCustomerSelected = useWorkshopFlowStore((state) => state.markCustomerSelected)
  const [lineItems, setLineItems] = useState(initialLineItems)
  const request = getFlowItem(requestId, statusById)
  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
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

  function addLineItem() {
    setLineItems((current) => [
      ...current,
      {
        id: `cost-${Date.now()}`,
        label: "",
        quantity: 1,
        price: 0,
      },
    ])
  }

  function updateLineItem(itemId, field, value) {
    setLineItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: field === "label" ? value : Math.max(0, Number(value) || 0),
            }
          : item,
      ),
    )
  }

  function removeLineItem(itemId) {
    setLineItems((current) => current.filter((item) => item.id !== itemId))
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
            <div className="mt-5 overflow-x-auto rounded-lg border border-border">
              <div className="grid min-w-[760px] grid-cols-[minmax(220px,1fr)_90px_160px_160px_44px] bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Mô tả</span>
                <span>Số lượng</span>
                <span>Đơn giá</span>
                <span className="text-right">Thành tiền</span>
                <span className="sr-only">Thao tác</span>
              </div>
              {lineItems.map((item) => (
                <div key={item.id} className="grid min-w-[760px] grid-cols-[minmax(220px,1fr)_90px_160px_160px_44px] items-center border-t border-border px-4 py-3">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(event) => updateLineItem(item.id, "label", event.target.value)}
                    placeholder="Nhập mô tả chi phí"
                    aria-label="Mô tả chi phí"
                    readOnly={isAwaiting || isSelected}
                    className="mr-3 h-9 min-w-0 rounded-md border border-input bg-card px-3 text-sm font-medium outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 read-only:border-transparent read-only:px-0 read-only:focus:ring-0"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(event) => updateLineItem(item.id, "quantity", event.target.value)}
                    aria-label={`Số lượng ${item.label || "dòng chi phí"}`}
                    readOnly={isAwaiting || isSelected}
                    className="h-9 w-16 rounded-md border border-input bg-card px-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 read-only:border-transparent read-only:px-0 read-only:focus:ring-0"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={item.price}
                    onChange={(event) => updateLineItem(item.id, "price", event.target.value)}
                    aria-label={`Đơn giá ${item.label || "dòng chi phí"}`}
                    readOnly={isAwaiting || isSelected}
                    className="h-9 w-36 rounded-md border border-input bg-card px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 read-only:border-transparent read-only:px-0 read-only:focus:ring-0"
                  />
                  <span className="text-right font-semibold">{formatVND(item.quantity * item.price)}</span>
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    disabled={isAwaiting || isSelected}
                    aria-label={`Xóa ${item.label || "dòng chi phí"}`}
                    title="Xóa dòng chi phí"
                    className="ml-auto flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addLineItem}
                disabled={isAwaiting || isSelected}
                className="flex w-full min-w-[760px] items-center justify-center gap-2 border-t border-border py-3 text-sm font-semibold text-primary transition duration-200 hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                <Plus className="size-4" />
                {isAwaiting || isSelected ? "Báo giá đã khóa" : "Thêm dòng chi phí"}
              </button>
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
