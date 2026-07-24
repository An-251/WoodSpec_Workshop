import {
  ArrowLeft,
  Download,
  Expand,
  Focus,
  Grid3X3,
  Minus,
  Plus,
  Ruler,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ROUTES } from "@/constants/routes"
import { getOpenRequest } from "@/data/reference/workshopFlow"
import { BlueprintDrawing, BlueprintExportSheet } from "@/features/workshop/components/BlueprintViewer"
import { getBlueprintDimensions } from "@/features/workshop/utils/blueprint"

const views = [
  { id: "front", label: "Mặt đứng" },
  { id: "top", label: "Mặt bằng" },
  { id: "side", label: "Mặt bên" },
]

function WorkshopBlueprintPage() {
  const { requestId } = useParams()
  const request = getOpenRequest(requestId)
  const [activeView, setActiveView] = useState("front")
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [showDimensions, setShowDimensions] = useState(true)
  const [showNotes, setShowNotes] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const viewerRef = useRef(null)
  const exportSvgRef = useRef(null)
  const blueprint = request.blueprint || {}

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === viewerRef.current)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  function changeZoom(amount) {
    setZoom((current) => Math.min(1.75, Math.max(0.75, Number((current + amount).toFixed(2)))))
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    await viewerRef.current?.requestFullscreen()
  }

  function downloadSvg() {
    if (!exportSvgRef.current) return

    const source = new XMLSerializer().serializeToString(exportSvgRef.current)
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${source}`], {
      type: "image/svg+xml;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${request.reference}-blueprint-3-mat.svg`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <header className="sticky top-0 z-20 -mx-4 -mt-6 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={ROUTES.workshopRequestDetail(request.id)}
              aria-label="Quay lại hồ sơ yêu cầu"
              title="Quay lại hồ sơ yêu cầu"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">Blueprint · {request.reference}</h1>
                <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                  {blueprint.revision || "R01"}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {request.product} · {request.customer}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={toggleFullscreen}>
              <Expand />
              {isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            </Button>
            <Button type="button" onClick={downloadSvg}>
              <Download />
              Tải SVG
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <section
          ref={viewerRef}
          className="min-w-0 overflow-hidden rounded-lg border border-border bg-card shadow-gallery-sm fullscreen:flex fullscreen:flex-col fullscreen:rounded-none"
        >
          <div className="flex flex-col gap-3 border-b border-border bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-fit max-w-full overflow-x-auto rounded-lg border border-border bg-muted p-1" aria-label="Chọn mặt chiếu">
              {views.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveView(view.id)}
                  className={`h-8 whitespace-nowrap rounded-md px-3 text-sm font-semibold transition ${
                    activeView === view.id
                      ? "bg-card text-foreground shadow-gallery-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-pressed={activeView === view.id}
                >
                  {view.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => changeZoom(-0.25)}
                disabled={zoom <= 0.75}
                aria-label="Thu nhỏ bản vẽ"
                title="Thu nhỏ"
              >
                <Minus />
              </Button>
              <span className="w-14 text-center text-xs font-semibold tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => changeZoom(0.25)}
                disabled={zoom >= 1.75}
                aria-label="Phóng to bản vẽ"
                title="Phóng to"
              >
                <Plus />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setZoom(1)}
                aria-label="Đưa bản vẽ về vừa khung"
                title="Vừa khung"
              >
                <Focus />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 border-b border-border bg-surface-subtle px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Grid3X3 className="size-4" />
              Lưới
              <Switch checked={showGrid} onCheckedChange={setShowGrid} size="sm" aria-label="Hiện lưới bản vẽ" />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Ruler className="size-4" />
              Kích thước
              <Switch checked={showDimensions} onCheckedChange={setShowDimensions} size="sm" aria-label="Hiện đường kích thước" />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <span className="text-xs font-bold">Aa</span>
              Chú thích
              <Switch checked={showNotes} onCheckedChange={setShowNotes} size="sm" aria-label="Hiện chú thích bản vẽ" />
            </label>
          </div>

          <div className="min-h-[420px] flex-1 overflow-auto bg-[#e8eeec] p-3 sm:p-6">
            <div
              className="mx-auto aspect-[20/13] min-w-[620px] overflow-hidden border border-[#b8cac9] bg-[#fffdf9] shadow-gallery-md transition-[width] duration-200"
              style={{ width: `${zoom * 100}%` }}
            >
              <BlueprintDrawing
                request={request}
                view={activeView}
                showGrid={showGrid}
                showDimensions={showDimensions}
                showNotes={showNotes}
                className="block size-full"
              />
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-border bg-card p-5 shadow-gallery-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold text-foreground">Thông tin bản vẽ</h2>
              <span className="text-xs font-semibold text-muted-foreground">Bản tham chiếu</span>
            </div>
            <dl className="mt-4 divide-y divide-border text-sm">
              {[
                ["Số bản vẽ", blueprint.drawingNumber || `${request.reference}-BP`],
                ["Bản sửa", blueprint.revision || "R01"],
                ["Tỉ lệ", blueprint.scale || "1:20"],
                ["Cập nhật", blueprint.updatedAt || "24/07/2026"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-semibold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 shadow-gallery-sm">
            <h2 className="font-bold text-foreground">Kích thước tổng thể</h2>
            <dl className="mt-4 grid grid-cols-3 gap-2">
              {getBlueprintDimensions(request.dimensions).map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-md border border-border bg-surface-subtle p-3">
                  <dt className="text-[11px] leading-4 text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-sm font-bold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 shadow-gallery-sm">
            <h2 className="font-bold text-foreground">Ghi chú gia công</h2>
            <ul className="mt-4 space-y-3">
              {(blueprint.notes || request.specification.slice(0, 4).map(([label, value]) => `${label}: ${value}`)).map((note, index) => (
                <li key={note} className="flex gap-3 text-sm leading-5 text-muted-foreground">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                    {index + 1}
                  </span>
                  {note}
                </li>
              ))}
            </ul>
          </section>

          <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm leading-5">
            <p className="font-semibold text-warning">Kiểm tra trước khi cắt</p>
            <p className="mt-1 text-muted-foreground">
              Đối chiếu kích thước thực tế tại công trình và chốt bản sửa cuối cùng trước khi sản xuất.
            </p>
          </div>
        </aside>
      </div>

      <div className="pointer-events-none fixed left-[-10000px] top-0" aria-hidden="true">
        <BlueprintExportSheet
          request={request}
          showGrid={showGrid}
          showDimensions={showDimensions}
          showNotes={showNotes}
          svgRef={exportSvgRef}
        />
      </div>
    </div>
  )
}

export default WorkshopBlueprintPage
