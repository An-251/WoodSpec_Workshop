import { ArrowRight, BadgeCheck, ReceiptText, Users, Wrench } from "lucide-react"
import { Link } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import { DashboardCharts } from "@/features/workshop/components/DashboardCharts"
import { StatusPill, Thumbnail, WorkshopCard, WorkshopPageHeader } from "@/features/workshop/components/WorkshopUI"
import { FLOW_STATUS, getFlowRows, useWorkshopFlowStore } from "@/stores/useWorkshopFlowStore"

function getRowPath(row) {
  if (row.flowStatus === FLOW_STATUS.open) return ROUTES.workshopRequestDetail(row.id)
  if (row.flowStatus === FLOW_STATUS.awaiting) return ROUTES.workshopQuotation(row.id)
  if (row.flowStatus === FLOW_STATUS.readyHandover) return ROUTES.workshopHandoverDetail(row.id)
  return ROUTES.workshopBuildDetail(row.id)
}

function RequestRow({ row }) {
  return (
    <Link
      to={getRowPath(row)}
      className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated p-3 transition duration-200 hover:border-primary/35 hover:bg-card"
    >
      <Thumbnail label={row.customer} tone={row.statusTone === "green" ? "green" : row.statusTone === "neutral" ? "neutral" : "amber"} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground">{row.customer}</p>
          <span className="text-xs text-muted-foreground">{row.distributedAt || row.submittedAt || row.reference}</span>
        </div>
        <p className="truncate text-sm text-muted-foreground">{row.item}</p>
        <StatusPill tone={row.statusTone}>{row.status}</StatusPill>
      </div>
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-primary">
        {row.nextStep}
        <ArrowRight className="size-4" />
      </span>
    </Link>
  )
}

function MetricCard({ icon: Icon, label, value, note }) {
  return (
    <WorkshopCard className="p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="size-5 text-white" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{note}</p>
        </div>
      </div>
    </WorkshopCard>
  )
}

function DashboardPage() {
  const statusById = useWorkshopFlowStore((state) => state.statusById)
  const rows = getFlowRows(statusById)
  const openRows = rows.filter((row) => row.flowStatus === FLOW_STATUS.open)
  const awaitingRows = rows.filter((row) => row.flowStatus === FLOW_STATUS.awaiting)
  const selectedRows = rows.filter((row) =>
    [FLOW_STATUS.selected, FLOW_STATUS.depositConfirmed, FLOW_STATUS.inProduction, FLOW_STATUS.readyHandover].includes(row.flowStatus),
  )
  const leadRow = openRows[0] || awaitingRows[0] || selectedRows[0]

  return (
    <div className="space-y-8">
      <WorkshopPageHeader title="Chào buổi sáng" subtitle="Những việc cần xử lý hôm nay được gom gọn tại đây." />

      <WorkshopCard className="p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center text-white gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-primary">
              <Wrench className="size-4 text-white" />
              Bắt đầu
            </span>
            <h2 className="mt-4 text-3xl font-bold text-foreground">
              Bạn có {openRows.length} yêu cầu mới cần xem lại.
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Xem brief, gửi báo giá, chờ khách chọn, xác nhận cọc, rồi cập nhật sản xuất và bàn giao trên cùng một luồng.
            </p>
          </div>
          {leadRow ? (
            <Link
              to={getRowPath(leadRow)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-gallery-md transition duration-200 hover:bg-foreground"
            >
              Tiếp tục
              <ArrowRight className="size-5" />
            </Link>
          ) : null}
        </div>
      </WorkshopCard>

      <div className="grid gap-5 md:grid-cols-3">
        <MetricCard icon={ReceiptText} label="Yêu cầu đang chờ" value={openRows.length} note={openRows[0] ? `Mới nhất: ${openRows[0].customer}` : "Không còn yêu cầu mới"} />
        <MetricCard icon={Users} label="Báo giá đang so sánh" value={awaitingRows.length} note="Khách sẽ chọn một xưởng để đi tiếp" />
        <MetricCard icon={BadgeCheck} label="Dự án đã thắng" value={selectedRows.length} note="Cần cập nhật tiến độ đều" />
      </div>

      <DashboardCharts />

      <div className="grid gap-5 xl:grid-cols-3">
        <WorkshopCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Yêu cầu mở</h3>
              <p className="text-sm text-muted-foreground">Brief mới, quyết định có báo giá</p>
            </div>
            <span className="text-sm text-muted-foreground">{openRows.length}</span>
          </div>
          <div className="space-y-3">
            {openRows.map((row) => <RequestRow key={row.id} row={row} />)}
          </div>
        </WorkshopCard>

        <WorkshopCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Chờ khách quyết định</h3>
              <p className="text-sm text-muted-foreground">Báo giá đang được so sánh</p>
            </div>
            <span className="text-sm text-muted-foreground">{awaitingRows.length}</span>
          </div>
          <div className="space-y-3">
            {awaitingRows.map((row) => <RequestRow key={row.id} row={row} />)}
          </div>
        </WorkshopCard>

        <WorkshopCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Bạn đã được chọn</h3>
              <p className="text-sm text-muted-foreground">Đặt cọc, sản xuất, bàn giao</p>
            </div>
            <span className="text-sm text-muted-foreground">{selectedRows.length}</span>
          </div>
          <div className="space-y-3">
            {selectedRows.map((row) => <RequestRow key={row.id} row={row} />)}
          </div>
        </WorkshopCard>
      </div>
    </div>
  )
}

export default DashboardPage
