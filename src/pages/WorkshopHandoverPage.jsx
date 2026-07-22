import { ArrowRight, PackageCheck, Truck } from "lucide-react"
import { Link } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import { Thumbnail, WorkshopCard, WorkshopPageHeader } from "@/features/workshop/components/WorkshopUI"
import { FLOW_STATUS, getFlowRows, toWorkshopProject, useWorkshopFlowStore } from "@/stores/useWorkshopFlowStore"

function WorkshopHandoverPage() {
  const statusById = useWorkshopFlowStore((state) => state.statusById)
  const rows = getFlowRows(statusById)
  const readyProjects = rows.filter((row) => row.flowStatus === FLOW_STATUS.readyHandover).map((row) => toWorkshopProject(row, statusById))
  const closedProjects = rows.filter((row) => row.flowStatus === FLOW_STATUS.closed)

  return (
    <div className="space-y-8">
      <WorkshopPageHeader title="Bàn giao & hoàn tất" subtitle="Các dự án đã xong hoặc sẵn sàng rời xưởng." />

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#1f140c]">
          <Truck className="size-5 text-[#82461c]" />
          Sẵn sàng bàn giao
        </h2>
        <WorkshopCard className="overflow-hidden">
          {readyProjects.length ? (
            readyProjects.map((project) => (
              <Link
                key={project.id}
                to={ROUTES.workshopHandoverDetail(project.id)}
                className="flex items-center gap-4 p-5 transition hover:bg-[#fff8ef]"
              >
                <Thumbnail label={project.customer} tone="green" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#1f140c]">{project.customer}</p>
                  <p className="text-sm text-[#654f40]">
                    {project.product} · {project.reference}
                  </p>
                </div>
                <ArrowRight className="size-5 text-[#82461c]" />
              </Link>
            ))
          ) : (
            <p className="p-8 text-center text-[#7b6250]">Hiện chưa có đơn nào cần bàn giao.</p>
          )}
        </WorkshopCard>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#1f140c]">
          <PackageCheck className="size-5 text-[#4aa064]" />
          Vừa hoàn tất
        </h2>
        <WorkshopCard className="overflow-hidden">
          {closedProjects.map((project) => (
            <div key={project.id} className="flex items-center gap-4 p-5">
              <Thumbnail label={project.customer} tone="neutral" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#1f140c]">{project.customer}</p>
                <p className="text-sm text-[#654f40]">
                  {project.item} · {project.completedAt || "vừa hoàn tất"}
                </p>
              </div>
            </div>
          ))}
        </WorkshopCard>
      </section>
    </div>
  )
}

export default WorkshopHandoverPage
