import { ArrowRight, Check, MapPin, Star } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import { WorkflowSteps, WorkshopCard, WorkshopPageHeader } from "@/features/workshop/components/WorkshopUI"
import { FLOW_STATUS, toWorkshopProject, useWorkshopFlowStore } from "@/stores/useWorkshopFlowStore"

function WorkshopHandoverDetailPage() {
  const { projectId } = useParams()
  const statusById = useWorkshopFlowStore((state) => state.statusById)
  const handoverCompletedById = useWorkshopFlowStore((state) => state.handoverCompletedById)
  const completeHandoverStep = useWorkshopFlowStore((state) => state.completeHandoverStep)
  const project = toWorkshopProject({ id: projectId }, statusById)
  const completedCount = handoverCompletedById[project.id] || 0
  const visibleSteps = project.handoverSteps.slice(0, Math.min(project.handoverSteps.length, completedCount + 1))
  const isComplete = project.flowStatus === FLOW_STATUS.closed

  function markCurrentDone() {
    completeHandoverStep(project.id, project.handoverSteps.length)
  }

  return (
    <div className="space-y-8">
      <WorkshopPageHeader
        title={`Bàn giao · ${project.customer}`}
        subtitle={`${project.product} · ${project.reference}`}
        backTo={ROUTES.workshopHandover}
        backLabel="Tất cả bàn giao"
      />

      <WorkflowSteps activeIndex={isComplete ? 5 : 4} completedThrough={isComplete ? 5 : 4} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {isComplete ? (
            <WorkshopCard className="bg-success/10 p-10 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success text-success-foreground">
                <Star className="size-7" />
              </div>
              <h2 className="mt-5 text-3xl font-bold text-foreground">Dự án hoàn tất, làm tốt lắm.</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                {project.customer} đã nhận {project.product}. Bạn có thể nhờ khách để lại đánh giá công khai cho xưởng.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-gallery-sm transition duration-200 hover:bg-foreground">
                  <Star className="size-4" />
                  Xin đánh giá
                </button>
                <Link to={ROUTES.dashboard} className="inline-flex h-11 items-center rounded-full px-4 font-medium text-muted-foreground transition duration-200 hover:text-foreground">
                  Về hôm nay
                </Link>
              </div>
            </WorkshopCard>
          ) : (
            <WorkshopCard className="p-6">
              <h2 className="text-2xl font-bold text-foreground">Hoàn tất bàn giao</h2>
              <p className="mt-2 text-muted-foreground">Đi từng bước một. Khi xong, hệ thống sẽ đóng dự án.</p>

              <div className="mt-5 space-y-3">
                {visibleSteps.map(([title, description], index) => {
                  const isDone = index < completedCount
                  const isCurrent = index === completedCount

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
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                          Đánh dấu xong
                          <ArrowRight className="size-4" />
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </WorkshopCard>
          )}
        </div>

        <aside className="space-y-4">
          <WorkshopCard className="p-5">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <MapPin className="size-4 text-primary" />
              Địa chỉ giao hàng
            </p>
            <p className="mt-3 text-sm leading-6">{project.deliveryAddress}</p>
            <button className="mt-4 text-sm font-medium text-primary">Mở bản đồ →</button>
          </WorkshopCard>

          <WorkshopCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Điều khoản thương mại</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Tổng báo giá</dt>
                <dd className="font-semibold">{project.quoteTotal}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Đặt cọc đã nhận</dt>
                <dd className="font-semibold">{project.deposit}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">Số còn lại được xử lý trực tiếp giữa xưởng và khách.</p>
          </WorkshopCard>
        </aside>
      </div>
    </div>
  )
}

export default WorkshopHandoverDetailPage
