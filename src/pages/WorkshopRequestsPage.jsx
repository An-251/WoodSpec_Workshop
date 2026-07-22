import { ArrowRight, SlidersHorizontal, UsersRound } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"

import { ROUTES } from "@/constants/routes"
import { StatusPill, Thumbnail, WorkshopCard, WorkshopPageHeader } from "@/features/workshop/components/WorkshopUI"
import { FLOW_STATUS, flowFilters, getFlowRows, useWorkshopFlowStore } from "@/stores/useWorkshopFlowStore"

function getRowPath(row) {
  if (row.flowStatus === FLOW_STATUS.open) return ROUTES.workshopRequestDetail(row.id)
  if (row.flowStatus === FLOW_STATUS.awaiting) return ROUTES.workshopQuotation(row.id)
  if (row.flowStatus === FLOW_STATUS.closed) return ROUTES.workshopHandover
  return ROUTES.workshopBuildDetail(row.id)
}

function RequestTableRow({ row }) {
  return (
    <Link
      to={getRowPath(row)}
      className="grid gap-3 border-t border-border px-5 py-4 transition duration-200 hover:bg-muted lg:grid-cols-[1.5fr_1fr_0.8fr_1fr_0.8fr] lg:items-center"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Thumbnail label={row.customer} tone={row.statusTone === "green" ? "green" : row.statusTone === "neutral" ? "neutral" : "amber"} />
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{row.customer}</p>
          <p className="truncate text-sm text-muted-foreground">
            {row.item} · {row.material}
          </p>
        </div>
      </div>
      <StatusPill tone={row.statusTone}>{row.status}</StatusPill>
      <span className="text-sm text-foreground">{row.deadline}</span>
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <UsersRound className="size-4" />
        {row.quotesSubmitted}
      </span>
      <span className="inline-flex items-center justify-start gap-2 font-medium text-primary lg:justify-end">
        {row.nextStep}
        <ArrowRight className="size-4" />
      </span>
    </Link>
  )
}

function WorkshopRequestsPage() {
  const [activeFilter, setActiveFilter] = useState("open")
  const statusById = useWorkshopFlowStore((state) => state.statusById)
  const allRows = getFlowRows(statusById)
  const rows = activeFilter === "all" ? allRows : allRows.filter((row) => row.flowFilter === activeFilter)

  return (
    <div className="space-y-8">
      <WorkshopPageHeader
        title="Yêu cầu & báo giá"
        subtitle="Mọi yêu cầu mới WoodSpec phân phối đến xưởng của bạn sẽ nằm tại đây."
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="size-5 text-muted-foreground" />
          {flowFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeFilter === filter.id
                  ? "border-primary bg-primary text-primary-foreground shadow-gallery-sm"
                  : "border-border bg-card text-foreground hover:border-primary/35 hover:bg-muted"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Đang hiển thị {rows.length} trong {allRows.length}
        </p>
      </div>

      <WorkshopCard className="overflow-hidden">
        <div className="hidden grid-cols-[1.5fr_1fr_0.8fr_1fr_0.8fr] bg-muted px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:grid">
          <span>Khách hàng & sản phẩm</span>
          <span>Trạng thái</span>
          <span>Hạn</span>
          <span>So sánh</span>
          <span className="text-right">Bước tiếp theo</span>
        </div>
        {rows.length ? (
          rows.map((row) => <RequestTableRow key={row.id} row={row} />)
        ) : (
          <p className="border-t border-border p-8 text-center text-muted-foreground">Chưa có đơn nào trong trạng thái này.</p>
        )}
      </WorkshopCard>
    </div>
  )
}

export default WorkshopRequestsPage
