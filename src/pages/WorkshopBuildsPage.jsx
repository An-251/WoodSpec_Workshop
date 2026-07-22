import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import { Thumbnail, WorkshopCard, WorkshopPageHeader } from "@/features/workshop/components/WorkshopUI"
import { FLOW_STATUS, getFlowRows, toWorkshopProject, useWorkshopFlowStore } from "@/stores/useWorkshopFlowStore"

function WorkshopBuildsPage() {
  const statusById = useWorkshopFlowStore((state) => state.statusById)
  const buildCompletedById = useWorkshopFlowStore((state) => state.buildCompletedById)
  const rows = getFlowRows(statusById)
    .filter((row) =>
      [FLOW_STATUS.selected, FLOW_STATUS.depositConfirmed, FLOW_STATUS.inProduction, FLOW_STATUS.readyHandover].includes(row.flowStatus),
    )
    .map((row) => toWorkshopProject(row, statusById))

  return (
    <div className="space-y-8">
      <WorkshopPageHeader title="Trong xưởng" subtitle="Các dự án bạn đã được chọn và đang sản xuất." />

      <div className="grid gap-5 xl:grid-cols-2">
        {rows.map((project) => {
          const completedCount = buildCompletedById[project.id] || 0
          const progress = project.flowStatus === FLOW_STATUS.readyHandover ? 100 : Math.round((completedCount / project.buildSteps.length) * 100)

          return (
            <WorkshopCard key={project.id} className="p-5">
              <div className="flex items-start gap-4">
                <Thumbnail label={project.customer} tone={progress > 0 ? "green" : "neutral"} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#737373]">{project.reference}</p>
                  <h2 className="text-xl font-bold text-[#0a0a0a]">{project.customer}</h2>
                  <p className="text-[#525252]">{project.product}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-[#737373]">Tiến độ</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#f5f5f4]">
                  <div className="h-full rounded-full bg-[#0a0a0a]" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="text-sm text-[#737373]">Hạn {project.deadline}</p>
                <Link
                  to={project.flowStatus === FLOW_STATUS.readyHandover ? ROUTES.workshopHandoverDetail(project.id) : ROUTES.workshopBuildDetail(project.id)}
                  className="inline-flex items-center gap-2 font-medium text-[#6f665c]"
                >
                  {project.nextStep}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </WorkshopCard>
          )
        })}
      </div>
    </div>
  )
}

export default WorkshopBuildsPage