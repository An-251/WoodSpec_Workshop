import { FileText, Maximize2, MessageSquare, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import { getOpenRequest } from "@/data/reference/workshopFlow"
import { BlueprintDrawing } from "@/features/workshop/components/BlueprintViewer"
import { FieldGrid, StatusPill, WorkflowSteps, WorkshopCard, WorkshopPageHeader } from "@/features/workshop/components/WorkshopUI"
import CustomerChatDialog from "@/features/workshop/components/CustomerChatDialog"

function WorkshopRequestDetailPage() {
  const { requestId } = useParams()
  const request = getOpenRequest(requestId)
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="space-y-8">
      <WorkshopPageHeader
        title={request.customer}
        subtitle={`${request.item} · ${request.reference} · Phân phối ${request.distributedAt}`}
        backTo={ROUTES.workshopRequests}
        backLabel="Tất cả yêu cầu"
      />

      <WorkflowSteps activeIndex={0} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <WorkshopCard className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Quyết định của xưởng</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground">Bạn có muốn báo giá dự án này không?</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Xem các phần bên dưới. Khi sẵn sàng, hãy gửi báo giá sơ bộ để khách so sánh với các xưởng đã xác minh khác.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={ROUTES.workshopQuotation(request.id)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-gallery-sm transition duration-200 hover:bg-foreground"
              >
                <FileText className="size-4" />
                Báo giá
              </Link>
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 font-medium text-foreground transition duration-200 hover:border-primary/35 hover:bg-muted"
              >
                <MessageSquare className="size-4" />
                Hỏi khách
              </button>
            </div>
          </WorkshopCard>

          <WorkshopCard className="p-6">
            <h3 className="text-xl font-bold text-foreground">1. Tóm tắt khách hàng</h3>
            <p className="mt-1 text-sm text-muted-foreground">Nhu cầu khách mô tả bằng lời của họ.</p>
            <blockquote className="mt-4 text-lg text-muted-foreground">"{request.summary}"</blockquote>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {[
                ["Ngân sách", request.budget],
                ["Cần trước", request.deadline],
                ["Ưu tiên", request.priority],
                ["Số lượng", request.quantity],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-border bg-surface-elevated p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-md border border-border bg-surface-elevated p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ghi chú khách hàng</p>
              <p className="mt-2 text-foreground">{request.notes}</p>
            </div>
          </WorkshopCard>

          <WorkshopCard className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">2. Bản vẽ kỹ thuật</h3>
                <p className="mt-1 text-sm text-muted-foreground">Tài liệu quan trọng nhất để lập báo giá.</p>
              </div>
              <Link
                to={ROUTES.workshopBlueprint(request.id)}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold transition duration-200 hover:border-primary/35 hover:bg-muted"
              >
                <Maximize2 className="size-4" />
                Mở Blueprint
              </Link>
            </div>
            <Link
              to={ROUTES.workshopBlueprint(request.id)}
              className="mt-4 block aspect-[20/9] min-h-[220px] overflow-hidden rounded-lg border border-[#b8cac9] bg-[#fffdf9] transition hover:border-primary/50"
              aria-label={`Mở Blueprint ${request.reference}`}
            >
              <BlueprintDrawing
                request={request}
                view="front"
                showNotes={false}
                className="size-full object-contain"
              />
            </Link>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{request.blueprint?.drawingNumber || `${request.reference}-BP`}</span>
              <span>Bản sửa {request.blueprint?.revision || "R01"} · Tỉ lệ {request.blueprint?.scale || "1:20"}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {request.dimensions.split(" x ").map((part, index) => (
                <StatusPill key={part} tone="muted">
                  {["Dài", "Rộng", "Cao"][index]} {part}
                </StatusPill>
              ))}
            </div>
          </WorkshopCard>

          <WorkshopCard className="p-6">
            <h3 className="text-xl font-bold text-foreground">3. Bối cảnh lắp đặt</h3>
            <p className="mt-1 text-sm text-muted-foreground">Hiểu không gian trước khi báo giá.</p>
            <div className="mt-4">
              <FieldGrid items={request.installContext} />
            </div>
            <div className="mt-4 rounded-md border border-warning/30 bg-warning/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-warning">Lưu ý lắp đặt</p>
              <p className="mt-2">{request.installationNotes}</p>
            </div>
          </WorkshopCard>

          <WorkshopCard className="p-6">
            <h3 className="text-xl font-bold text-foreground">4. Bảng thông số</h3>
            <div className="mt-4 divide-y divide-border">
              {request.specification.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-right font-medium">{value}</span>
                </div>
              ))}
            </div>
          </WorkshopCard>
        </div>

        <aside className="space-y-4">
          <WorkshopCard className="p-5">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="size-4" />
              Yêu cầu mở
            </p>
            <p className="text-sm leading-6">
              Yêu cầu này được phân phối đến <strong>14 xưởng đã xác minh</strong>. Khách sẽ chọn một xưởng sau khi so sánh báo giá.
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Báo giá đã gửi</dt>
                <dd className="font-semibold">{request.quotesSubmitted}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Dự kiến quyết định</dt>
                <dd className="font-semibold">{request.decisionExpected}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Trạng thái</dt>
                <dd><StatusPill tone={request.statusTone}>{request.status}</StatusPill></dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Mã</dt>
                <dd className="font-semibold">{request.reference}</dd>
              </div>
            </dl>
          </WorkshopCard>

          <WorkshopCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Khách hàng</p>
            <p className="mt-4 font-semibold text-foreground">{request.customer}</p>
            <p className="mt-1 text-sm text-muted-foreground">Danh tính đã xác minh bởi WoodSpec.</p>
            <p className="mt-4 text-sm text-muted-foreground">Thông tin liên hệ trực tiếp chỉ được chia sẻ sau khi khách chọn xưởng của bạn.</p>
          </WorkshopCard>
        </aside>
      </div>

      <CustomerChatDialog
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
        request={request}
      />
    </div>
  )
}

export default WorkshopRequestDetailPage

