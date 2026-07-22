import { ArrowRight, Camera, Check, ClipboardList, CreditCard, Play } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import { WorkflowSteps, WorkshopCard, WorkshopPageHeader } from "@/features/workshop/components/WorkshopUI"
import { FLOW_STATUS, toWorkshopProject, useWorkshopFlowStore } from "@/stores/useWorkshopFlowStore"

function WorkshopBuildDetailPage() {
  const { projectId } = useParams()
  const statusById = useWorkshopFlowStore((state) => state.statusById)
  const buildCompletedById = useWorkshopFlowStore((state) => state.buildCompletedById)
  const confirmDeposit = useWorkshopFlowStore((state) => state.confirmDeposit)
  const startProduction = useWorkshopFlowStore((state) => state.startProduction)
  const completeBuildStep = useWorkshopFlowStore((state) => state.completeBuildStep)
  const project = toWorkshopProject({ id: projectId }, statusById)
  const completedCount = buildCompletedById[project.id] || 0
  const visibleSteps = project.buildSteps.slice(0, Math.min(project.buildSteps.length, completedCount + 1))
  const buildProgress = Math.round((completedCount / project.buildSteps.length) * 100)
  const isSelected = project.flowStatus === FLOW_STATUS.selected
  const isDepositConfirmed = project.flowStatus === FLOW_STATUS.depositConfirmed
  const isProduction = project.flowStatus === FLOW_STATUS.inProduction
  const isReadyHandover = project.flowStatus === FLOW_STATUS.readyHandover
  const activeStep = isSelected ? 3 : isDepositConfirmed ? 4 : isReadyHandover ? 5 : 4

  function markCurrentDone() {
    completeBuildStep(project.id, project.buildSteps.length)
  }

  return (
    <div className="space-y-8">
      <WorkshopPageHeader
        title={project.customer}
        subtitle={`${project.product} · ${project.reference} · hạn ${project.deadline}`}
        backTo={ROUTES.workshopBuilds}
        backLabel="Tất cả đơn trong xưởng"
      />

      <WorkflowSteps activeIndex={activeStep} completedThrough={isSelected ? 2 : isDepositConfirmed || isProduction ? 3 : 4} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {isSelected ? (
            <WorkshopCard className="p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <CreditCard className="size-5" />
                Khách đã chọn xưởng
              </p>
              <h2 className="mt-3 text-3xl font-bold text-foreground">Xác nhận đặt cọc để mở bước sản xuất.</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Khi nhận được cọc, bấm xác nhận. Đơn sẽ chuyển sang trạng thái “Đã xác nhận cọc” và cho phép bắt đầu sản xuất.
              </p>
              <button
                type="button"
                onClick={() => confirmDeposit(project.id)}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-gallery-sm transition duration-200 hover:bg-foreground"
              >
                <Check className="size-4" />
                Xác nhận
              </button>
            </WorkshopCard>
          ) : null}

          {isDepositConfirmed ? (
            <WorkshopCard className="p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-success">
                <Check className="size-5" />
                Đã xác nhận cọc
              </p>
              <h2 className="mt-3 text-3xl font-bold text-foreground">Sẵn sàng bắt đầu sản xuất.</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">Bấm bắt đầu để mở checklist sản xuất từng bước.</p>
              <button
                type="button"
                onClick={() => startProduction(project.id)}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-gallery-sm transition duration-200 hover:bg-foreground"
              >
                <Play className="size-4" />
                Bắt đầu
              </button>
            </WorkshopCard>
          ) : null}

          {isProduction || isReadyHandover ? (
            <WorkshopCard className="p-6">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Vị trí hiện tại trong sản xuất</h2>
                  <p className="mt-2 text-muted-foreground">Bấm hoàn tất từng bước. Bước kế tiếp sẽ tự hiện ra ngay sau đó.</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-foreground">{buildProgress}%</p>
                  <p className="text-sm text-muted-foreground">hoàn tất</p>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${buildProgress}%` }} />
              </div>

              <div className="mt-5 space-y-3">
                {visibleSteps.map(([title, description], index) => {
                  const isDone = index < completedCount
                  const isCurrent = index === completedCount && !isReadyHandover

                  return (
                    <button
                      key={title}
                      type="button"
                      disabled={!isCurrent}
                      onClick={markCurrentDone}
                      className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition duration-200 ${
                        isDone
                          ? "border-success/25 bg-success/10"
                          : isCurrent
                            ? "border-primary/35 bg-card shadow-gallery-sm hover:bg-muted"
                            : "border-border bg-card"
                      }`}
                    >
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full font-bold ${
                          isDone ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {isDone ? <Check className="size-5" /> : index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-foreground">{title}</span>
                        <span className="text-sm text-muted-foreground">{description}</span>
                      </span>
                      {isCurrent ? <ArrowRight className="size-5 text-primary" /> : null}
                    </button>
                  )
                })}
              </div>

              {isReadyHandover ? (
                <div className="mt-5 flex justify-end">
                  <Link
                    to={ROUTES.workshopHandoverDetail(project.id)}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-gallery-sm transition duration-200 hover:bg-foreground"
                  >
                    Bàn giao
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              ) : null}
            </WorkshopCard>
          ) : null}

          <WorkshopCard className="p-6">
            <h3 className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Camera className="size-5 text-primary" />
              Ảnh tiến độ
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Ảnh giúp khách yên tâm và giảm hỏi lại.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="aspect-[4/3] rounded-lg bg-[linear-gradient(135deg,#f5f5f4,#ffffff_45%,#e5e5e5)]" />
              ))}
              <button className="flex aspect-[4/3] flex-col items-center justify-center rounded-lg border border-dashed border-primary/35 bg-surface-elevated text-primary transition duration-200 hover:bg-muted">
                <Camera className="size-7" />
                <span className="mt-2 text-sm font-medium">Ảnh</span>
              </button>
            </div>
          </WorkshopCard>
        </div>

        <aside className="space-y-4">
          <WorkshopCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thông số đã duyệt</p>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Sản phẩm", project.item],
                ["Vật liệu", project.material],
                ["Kích thước", project.dimensions],
                ["Hoàn thiện", project.finish],
                ["Hạn", project.deadline],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <Link to={ROUTES.workshopRequests} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
              <ClipboardList className="size-4" />
              Brief
            </Link>
          </WorkshopCard>

          <WorkshopCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Điều khoản thương mại</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Báo giá</dt>
                <dd className="font-semibold">{project.quoteTotal}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Đặt cọc</dt>
                <dd className="font-semibold">{project.deposit}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              WoodSpec ghi nhận thông tin để điều phối. Thanh toán phần còn lại do xưởng và khách xử lý trực tiếp.
            </p>
          </WorkshopCard>
        </aside>
      </div>
    </div>
  )
}

export default WorkshopBuildDetailPage
