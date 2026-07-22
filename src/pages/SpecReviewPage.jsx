import { createPortal } from "react-dom"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { CheckCircle2, FileText, Printer, Send, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import Cabinet3DCardPreview from "@/features/configurator/components/Cabinet3DCardPreview"
import { notify } from "@/features/notifications/utils/notify"
import CustomerRequirementSection from "@/features/spec/components/CustomerRequirementSection"
import { useConfiguratorStore } from "@/stores/useConfiguratorStore"
import { formatCurrency } from "@/utils/formatCurrency"
import { generateSpec } from "@/utils/generateSpec"

function formatCmFromMm(value = 0) {
  const cm = value / 10
  return Number.isInteger(cm) ? String(cm) : cm.toFixed(1).replace(/\.0$/, "")
}

function formatDimensionLabel(dimensions) {
  return `${formatCmFromMm(dimensions.width)} x ${formatCmFromMm(dimensions.height)} x ${formatCmFromMm(dimensions.depth)} cm`
}

function formatBriefValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Chưa cung cấp"
  }

  if (typeof value === "number") {
    return formatCurrency(value)
  }

  return value
}

function buildBriefRows(configuration) {
  const details = configuration.requestDetails ?? {}
  const rows = [
    ["Nhu cầu ban đầu", details.initialPrompt],
    ["Vật dụng khách muốn làm", configuration.productName],
    ["Không gian đặt sản phẩm", details.placement],
    ["Công năng chính", details.usage],
    ["Số ngăn, tầng hoặc cánh mong muốn", details.compartmentNote],
    ["Phụ kiện khách có nhắc tới", details.accessories],
    ["Điều kiện lắp đặt", details.installationCondition],
    ["Ngân sách dự kiến", details.budget],
    ["Thời gian mong muốn", details.expectedTimeline],
    ["Khu vực", details.region],
  ]

  return rows.map(([label, value]) => ({ label, value: formatBriefValue(value) }))
}

function BriefTable({ rows, compact = false }) {
  if (!rows.length) {
    return null
  }

  return (
    <div className={compact ? "woodspec-print-table" : "overflow-hidden rounded-xl border border-border"}>
      <table className={compact ? "" : "w-full border-collapse text-sm"}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={compact ? "" : "border-b border-border last:border-b-0"}>
              <th className={compact ? "" : "w-52 bg-muted px-4 py-3 text-left align-top font-semibold text-muted-foreground"}>
                {row.label}
              </th>
              <td className={compact ? "" : "px-4 py-3 leading-6 text-foreground"}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PrintSpecDocument({ configuration, displaySpec, briefRows, notes, statusLabel }) {
  const dimensions = configuration.dimensions

  return createPortal(
    <div className="woodspec-print-root" aria-hidden="true">
      <article className="woodspec-print-document">
        <header className="woodspec-print-header">
          <div>
            <p className="woodspec-print-kicker">WoodSpec</p>
            <h1>Bản thông số gửi xưởng</h1>
            <p>Tài liệu tổng hợp nhu cầu khách hàng, hình 3D xem nhanh và các thông tin cần xác nhận trước khi báo giá.</p>
          </div>
          <div className="woodspec-print-meta">
            <span>Mã yêu cầu</span>
            <strong>{configuration.quoteRequest?.id ?? "Chưa tạo"}</strong>
            <span>Trạng thái</span>
            <strong>{statusLabel}</strong>
          </div>
        </header>

        <section className="woodspec-print-grid">
          <div className="woodspec-print-card">
            <p className="woodspec-print-kicker">Sản phẩm</p>
            <h2>{configuration.productName}</h2>
            <dl className="woodspec-print-list">
              <div>
                <dt>Kích thước</dt>
                <dd>{formatDimensionLabel(dimensions)}</dd>
              </div>
              <div>
                <dt>Vật liệu</dt>
                <dd>{configuration.material.name}</dd>
              </div>
              <div>
                <dt>Màu hoàn thiện</dt>
                <dd>{configuration.color.name}</dd>
              </div>
              <div>
                <dt>Giá ước tính</dt>
                <dd>{formatCurrency(configuration.estimatedPrice)}</dd>
              </div>
            </dl>
          </div>

          <div className="woodspec-print-card woodspec-print-preview-card">
            <p className="woodspec-print-kicker">Hình 3D xem nhanh</p>
            <Cabinet3DCardPreview configuration={configuration} className="woodspec-print-preview" />
          </div>
        </section>

        <section className="woodspec-print-section">
          <p className="woodspec-print-kicker">Brief từ cuộc trò chuyện AI</p>
          <h2>Ngữ cảnh khách hàng</h2>
          <BriefTable rows={briefRows} compact />
        </section>

        <section className="woodspec-print-section">
          <p className="woodspec-print-kicker">Thông tin khách hàng có thể xác nhận</p>
          <div className="woodspec-print-requirements">
            {displaySpec.customerRequirements?.map((section) => (
              <div key={section.title} className="woodspec-print-requirement">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <ul>
                  {section.items.map((item) => (
                    <li key={`${section.title}-${item.label}`}>
                      <strong>{item.label}:</strong> {item.value}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="woodspec-print-section">
          <p className="woodspec-print-kicker">Ghi chú gửi xưởng</p>
          <ul className="woodspec-print-notes">
            {notes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <footer className="woodspec-print-signatures">
          <div>
            <span>Khách hàng xác nhận</span>
          </div>
          <div>
            <span>Xưởng tiếp nhận</span>
          </div>
        </footer>
      </article>
    </div>,
    document.body,
  )
}

function SpecReviewPage() {
  const configuration = useConfiguratorStore((state) => state.configuration)
  const submitQuoteRequest = useConfiguratorStore((state) => state.submitQuoteRequest)
  const { dimensions, generatedSpec } = configuration
  const details = configuration.requestDetails
  const displaySpec = generatedSpec?.customerRequirements ? generatedSpec : generateSpec(configuration)
  const location = useLocation()
  const navigate = useNavigate()
  const isAppFlow = location.pathname.startsWith("/app")
  const quotesPath = isAppFlow ? ROUTES.appQuotes : ROUTES.quotes
  const configuratorPath = isAppFlow ? ROUTES.appConfigurator : ROUTES.configurator
  const notes = displaySpec.notes ?? []
  const briefRows = buildBriefRows(configuration)
  const statusLabel =
    {
      draft: "Bản nháp",
      "ready-to-send": "Sẵn sàng gửi",
      sent: "Đã gửi yêu cầu",
      quoted: "Đã có báo giá",
      "final-confirmed": "Đã xác nhận cuối",
    }[details.requestStatus] ?? "Bản nháp"

  function handleSubmitQuoteRequest() {
    const result = submitQuoteRequest()

    if (!result.ok) {
      notify.quoteRequestError(result.errors[0])
      return
    }

    notify.quoteRequestSent()
    navigate(quotesPath)
  }

  async function handleShareDocument() {
    const shareText = `WoodSpec - ${configuration.productName}: ${formatDimensionLabel(dimensions)}, ${configuration.material.name}, ${configuration.color.name}.`

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Bản thông số WoodSpec",
          text: shareText,
          url: window.location.href,
        })
        return
      }

      await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`)
    } catch {
      await navigator.clipboard?.writeText?.(`${shareText}\n${window.location.href}`)
    }
  }

  function handlePrintDocument() {
    const currentTitle = document.title
    document.title = `WoodSpec - ${configuration.productName}`
    window.print()
    window.setTimeout(() => {
      document.title = currentTitle
    }, 500)
  }

  return (
    <>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 text-left lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary">
              <FileText className="size-4" />
              Bảng thông số
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-normal text-foreground md:text-4xl">
              Rà soát yêu cầu sản phẩm
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              Kiểm tra cấu hình đã chọn, ngữ cảnh khách hàng đã trao đổi với trợ lý và các thông tin cần gửi xưởng báo giá.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-border bg-card text-muted-foreground" onClick={handlePrintDocument}>
              <Printer />
              In tài liệu
            </Button>
            <Button variant="outline" className="border-border bg-card text-muted-foreground" onClick={handleShareDocument}>
              <Send />
              Chia sẻ
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <article className="rounded-xl border border-border bg-card p-6 shadow-gallery-sm">
              <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">{configuration.product.name}</p>
                  <h2 className="mt-1 text-2xl font-semibold text-foreground">{configuration.productName}</h2>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Giá ước tính</p>
                  <strong className="text-2xl text-primary">{formatCurrency(configuration.estimatedPrice)}</strong>
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Rộng</dt>
                    <dd className="font-bold">{formatCmFromMm(dimensions.width)} cm</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Cao</dt>
                    <dd className="font-bold">{formatCmFromMm(dimensions.height)} cm</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Sâu</dt>
                    <dd className="font-bold">{formatCmFromMm(dimensions.depth)} cm</dd>
                  </div>
                </dl>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Vật liệu chính</dt>
                    <dd className="text-right font-bold">{configuration.material.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Màu hoàn thiện</dt>
                    <dd className="font-bold">{configuration.color.name}</dd>
                  </div>
                </dl>
              </div>
            </article>

            <article className="rounded-xl border border-border bg-card p-6 shadow-gallery-sm">
              <div className="border-b border-border pb-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Brief từ cuộc trò chuyện AI</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Ngữ cảnh gửi xưởng</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Phần này ghi lại nhu cầu khách đã trao đổi với trợ lý để xưởng hiểu mục đích sử dụng trước khi đọc thông số chi tiết.
                </p>
              </div>
              <div className="mt-5">
                <BriefTable rows={briefRows} />
              </div>
            </article>

            <CustomerRequirementSection sections={displaySpec.customerRequirements} />

            <article className="rounded-xl border border-border bg-card p-6 shadow-gallery-sm">
              <h2 className="text-2xl font-semibold text-foreground">Lưu ý gửi xưởng</h2>
              <div className="mt-5 grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
                {notes.map((item) => (
                  <p key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </p>
                ))}
              </div>
            </article>
          </div>

          <aside className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-6 shadow-gallery-sm">
              <h2 className="text-2xl font-semibold text-foreground">Tóm tắt gửi báo giá</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt>Vật liệu</dt>
                  <dd className="text-right font-semibold">{configuration.material.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Thông tin cần xác nhận</dt>
                  <dd className="font-semibold">{displaySpec.customerRequirements?.length ?? 0} nhóm</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Ngân sách</dt>
                  <dd className="font-semibold">{details.budget ? formatCurrency(details.budget) : "Chưa cung cấp"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Thời gian mong muốn</dt>
                  <dd className="text-right font-semibold">{details.expectedTimeline || "Chưa cung cấp"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Trạng thái</dt>
                  <dd className="font-semibold">{statusLabel}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-4 text-lg font-bold text-primary">
                  <dt>Tổng ước tính</dt>
                  <dd>{formatCurrency(configuration.estimatedPrice)}</dd>
                </div>
              </dl>
              <Button className="mt-6 w-full bg-primary hover:bg-primary/95 text-primary-foreground" onClick={handleSubmitQuoteRequest}>
                Đặt đồ / nhận báo giá
              </Button>
              <Link to={configuratorPath}>
                <Button variant="outline" className="mt-3 w-full border-border bg-card text-primary hover:bg-muted">
                  <SlidersHorizontal />
                  Sửa cấu hình
                </Button>
              </Link>
              <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
                Bảng này chỉ thu thập yêu cầu ở mức khách hàng hiểu được.
              </p>
            </div>

            <div className="rounded-xl bg-muted p-5 text-sm leading-6 text-muted-foreground">
              <strong>Chi tiết chuyên môn được ẩn</strong>
              <p className="mt-2">
                Xưởng sẽ tự xử lý độ dày ván, liên kết, mã phụ kiện, dung sai, bản vẽ sản xuất và danh sách cắt sau khi nhận yêu cầu.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <PrintSpecDocument configuration={configuration} displaySpec={displaySpec} briefRows={briefRows} notes={notes} statusLabel={statusLabel} />
    </>
  )
}

export default SpecReviewPage
