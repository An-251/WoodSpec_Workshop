import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ArrowLeft, BadgeCheck, CalendarDays, CheckCircle2, Clock3, Hammer, Inbox, MapPin, ReceiptText, ShieldCheck, Star, Truck } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { quoteOptions } from "@/data/reference/quotes"
import { workshops } from "@/data/reference/workshops"
import { canViewQuotes } from "@/features/rfq/utils"
import { generateQuoteOptions, getLeadTimeStart, getQuoteBreakdown, getWarrantyMonths } from "@/features/quotes/utils"
import { useConfiguratorStore } from "@/stores/useConfiguratorStore"
import { formatCurrency } from "@/utils/formatCurrency"

const sortOptions = [
  { id: "price", label: "Giá thấp" },
  { id: "leadTime", label: "Giao nhanh" },
  { id: "warranty", label: "Bảo hành" },
]

function QuotesPage() {
  const configuration = useConfiguratorStore((state) => state.configuration)
  const markQuotesViewed = useConfiguratorStore((state) => state.markQuotesViewed)
  const selectQuote = useConfiguratorStore((state) => state.selectQuote)
  const cancelSelectedQuote = useConfiguratorStore((state) => state.cancelSelectedQuote)
  const confirmFinalSpec = useConfiguratorStore((state) => state.confirmFinalSpec)
  const confirmationRef = useRef(null)
  const shouldScrollToConfirmationRef = useRef(false)
  const { dimensions } = configuration
  const details = configuration.requestDetails
  const location = useLocation()
  const isAppFlow = location.pathname.startsWith("/app")
  const specReviewPath = isAppFlow ? ROUTES.appSpecReview : ROUTES.specReview
  const orderProgressPath = ROUTES.appOrderProgress
  const [sortBy, setSortBy] = useState("price")
  const selectedQuoteId = configuration.selectedQuoteId ?? ""
  const quoteRequestStatus = details.requestStatus
  const shouldShowQuotes = canViewQuotes(quoteRequestStatus)

  useEffect(() => {
    if (quoteRequestStatus === "sent") {
      markQuotesViewed()
    }
  }, [markQuotesViewed, quoteRequestStatus])

  useEffect(() => {
    if (!selectedQuoteId || !shouldScrollToConfirmationRef.current) {
      return
    }

    shouldScrollToConfirmationRef.current = false
    window.setTimeout(() => {
      confirmationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 80)
  }, [selectedQuoteId])

  const allQuotes = useMemo(() => {
    return generateQuoteOptions({ configuration, quoteOptions, workshops, sortBy })
  }, [configuration, sortBy])

  const quotes = allQuotes.slice(0, details.workshopLimit ?? 3)
  const lowestPrice = Math.min(...quotes.map((quote) => quote.price))
  const fastestLeadTime = Math.min(...quotes.map((quote) => getLeadTimeStart(quote.leadTime)))
  const longestWarranty = Math.max(...quotes.map((quote) => getWarrantyMonths(quote.warranty)))

  function handleSelectQuote(quoteId) {
    if (quoteId === selectedQuoteId) {
      return
    }

    shouldScrollToConfirmationRef.current = true
    selectQuote(quoteId)

    toast.warning("Cần chốt thông số cuối", {
      description: "Vui lòng kiểm tra và xác nhận bảng thông số cuối trước khi tiếp tục đặt cọc.",
    })
  }

  if (!shouldShowQuotes) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-8 text-left lg:px-10">
        <div className="w-full rounded-xl border border-[#e5e5e5] bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex size-12 items-center justify-center rounded-lg bg-[#f7f7f5] text-[#6f665c]">
            <Inbox className="size-6" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-[#0a0a0a]">Bạn cần gửi yêu cầu trước khi xem báo giá</h1>
          <p className="mt-3 text-sm leading-7 text-[#525252]">
            Hãy kiểm tra bảng thông số và bấm “Đặt đồ / nhận báo giá”. Sau đó WoodSpec sẽ tạo yêu cầu và hiển thị các báo giá phù hợp.
          </p>
          <Link to={specReviewPath}>
            <Button className="mt-6 bg-[#0a0a0a] hover:bg-[#262626]">
              Quay lại bảng thông số
            </Button>
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-left lg:px-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-[#f7f7f5] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6f665c]">
            <ReceiptText className="size-4" />
            Báo giá xưởng
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-normal text-[#0a0a0a] md:text-4xl">
            So sánh báo giá xưởng
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#525252]">
            Các báo giá được tính từ cấu hình hiện tại để minh họa cách WoodSpec chuyển bảng thông số
            thành danh sách lựa chọn có thể so sánh.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#525252]">
            <span className="rounded-md border border-[#e5e5e5] bg-white px-2 py-1">Khu vực: {details.region}</span>
            <span className="rounded-md border border-[#e5e5e5] bg-white px-2 py-1">Gửi {quotes.length} xưởng phù hợp</span>
            <span className="rounded-md border border-[#e5e5e5] bg-white px-2 py-1">
              Trạng thái: {details.requestStatus === "draft" ? "Bản nháp" : details.finalConfirmed ? "Đã xác nhận cuối" : "Đã có báo giá"}
            </span>
            {configuration.quoteRequest?.id && (
              <span className="rounded-md border border-[#e5e5e5] bg-white px-2 py-1">Mã yêu cầu: {configuration.quoteRequest.id}</span>
            )}
          </div>
        </div>
        <Link to={specReviewPath}>
          <Button variant="outline" className="border-[#d4d4d4] bg-white text-[#6f665c]">
            <ArrowLeft />
            Quay lại thông số
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#737373]">Sản phẩm</p>
          <h2 className="mt-2 text-lg font-semibold text-[#0a0a0a]">{configuration.productName}</h2>
          <p className="mt-2 text-sm text-[#525252]">
            {dimensions.width} x {dimensions.height} x {dimensions.depth} mm
          </p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#737373]">Giá ước tính</p>
          <strong className="mt-2 block text-2xl text-[#6f665c]">{formatCurrency(configuration.estimatedPrice)}</strong>
          <p className="mt-2 text-sm text-[#525252]">Dùng để đối chiếu với báo giá xưởng.</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-[#f7f7f5] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#737373]">Gợi ý nhanh</p>
          <strong className="mt-2 block text-lg text-[#0a0a0a]">
            {quotes[0]?.workshop.name} đang đứng đầu theo bộ lọc
          </strong>
          <p className="mt-2 text-sm text-[#525252]">Bạn có thể đổi tiêu chí để ưu tiên giá, tốc độ hoặc bảo hành.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#0a0a0a]">Sắp xếp báo giá</p>
          <p className="mt-1 text-xs text-[#737373]">Bảng so sánh dùng dữ liệu tham khảo để bạn dễ đối chiếu phương án.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSortBy(option.id)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                sortBy === option.id
                  ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                  : "border-[#d4d4d4] bg-white text-[#525252] hover:border-[#6f665c]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5">
        {quotes.map((quote) => {
          const isLowestPrice = quote.price === lowestPrice
          const isFastest = getLeadTimeStart(quote.leadTime) === fastestLeadTime
          const isLongestWarranty = getWarrantyMonths(quote.warranty) === longestWarranty
          const isSelected = selectedQuoteId === quote.id
          const isLockedByOtherQuote = Boolean(selectedQuoteId) && !isSelected
          const breakdown = getQuoteBreakdown(quote.price, quote)

          return (
            <Fragment key={quote.id}>
              <article
              className={`grid gap-5 rounded-xl border bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] lg:grid-cols-[1.1fr_1.4fr_260px] ${
                isSelected || isLowestPrice ? "border-[#6f665c]" : "border-[#e5e5e5]"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-[#0a0a0a]">{quote.workshop.name}</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[#525252]">
                      <MapPin className="size-4" />
                      {quote.workshop.location}
                    </p>
                  </div>
                  {quote.workshop.verified && (
                    <Badge className="rounded-md bg-[#eef8f1] text-[#2f7d4e]">
                      <BadgeCheck className="size-3" />
                      Đã xác minh
                    </Badge>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {quote.tags.map((tag) => (
                    <Badge key={tag} className="rounded-md bg-[#e8e5df] text-[#525252]">
                      {tag}
                    </Badge>
                  ))}
                  {isSelected && <Badge className="rounded-md bg-[#0a0a0a] text-white">Đang chọn</Badge>}
                </div>

                <div className="mt-5 grid gap-3 text-sm text-[#525252] sm:grid-cols-2">
                  <span className="flex items-center gap-2">
                    <Star className="size-4 text-[#6f665c]" />
                    {quote.workshop.rating} / 5 đánh giá
                  </span>
                  <span className="flex items-center gap-2">
                    <Hammer className="size-4 text-[#6f665c]" />
                    {quote.workshop.completedOrders} đơn đã làm
                  </span>
                </div>

                <div className="mt-5 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4 text-sm text-[#525252]">
                  <p className="font-semibold text-[#0a0a0a]">Hồ sơ xưởng</p>
                  <div className="mt-3 grid gap-2">
                    <p>Số điện thoại/Zalo: <strong>{quote.workshop.zalo}</strong></p>
                    <p>Thế mạnh: {quote.workshop.specialties.join(", ")}</p>
                    <p>Hoàn thành trung bình: {quote.workshop.averageLeadTime}</p>
                    <p>Chính sách bảo hành: {quote.workshop.warrantyPolicy}</p>
                    <p>Sản phẩm đã làm: {quote.workshop.portfolio.join(", ")}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 text-sm text-[#525252] md:grid-cols-2">
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
                  <p className="flex items-center gap-2 font-semibold text-[#0a0a0a]">
                    <CheckCircle2 className="size-4 text-[#6f665c]" />
                    Vật liệu
                  </p>
                  <p className="mt-2 leading-6">{quote.materialNote}</p>
                </div>
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
                  <p className="flex items-center gap-2 font-semibold text-[#0a0a0a]">
                    <Truck className="size-4 text-[#6f665c]" />
                    Giao và lắp đặt
                  </p>
                  <p className="mt-2 leading-6">{quote.deliveryNote}</p>
                </div>
                <div className="rounded-lg border border-[#e5e5e5] bg-white p-4 md:col-span-2">
                  <p className="flex items-center gap-2 font-semibold text-[#0a0a0a]">
                    <ShieldCheck className="size-4 text-[#6f665c]" />
                    Điểm tin cậy
                  </p>
                  <p className="mt-2 leading-6">{quote.trustNote}</p>
                </div>
                <div className="rounded-lg border border-[#e5e5e5] bg-white p-4 md:col-span-2">
                  <p className="font-semibold text-[#0a0a0a]">Bảng báo giá chuẩn hóa</p>
                  <dl className="mt-3 grid gap-2">
                    <div className="flex justify-between gap-4">
                      <dt>Giá vật liệu/gỗ</dt>
                      <dd className="font-semibold">{formatCurrency(breakdown.materialCost)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Tiền công</dt>
                      <dd className="font-semibold">{formatCurrency(breakdown.laborCost)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Chi phí phụ kiện</dt>
                      <dd className="font-semibold">{formatCurrency(breakdown.accessoryCost)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Vận chuyển</dt>
                      <dd className="font-semibold">{formatCurrency(breakdown.transportCost)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Lắp đặt</dt>
                      <dd className="font-semibold">{formatCurrency(breakdown.installationCost)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-[#e5e5e5] pt-2">
                      <dt>Đặt cọc dự kiến</dt>
                      <dd className="font-semibold">{formatCurrency(breakdown.deposit)}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs leading-5 text-[#525252]">Điều kiện phát sinh: {quote.conditionNote}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-5 rounded-lg bg-[#f7f7f5] p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#737373]">Báo giá</p>
                  <strong className="mt-2 block text-2xl text-[#6f665c]">{formatCurrency(quote.price)}</strong>
                  <Badge className="mt-3 rounded-md bg-white text-[#525252]">{quote.responseStatus}</Badge>
                </div>

                <dl className="space-y-3 text-sm text-[#525252]">
                  <div className="flex justify-between gap-3">
                    <dt className="flex items-center gap-2">
                      <Clock3 className="size-4" />
                      Thời gian
                    </dt>
                    <dd className="font-semibold text-[#0a0a0a]">{quote.leadTime}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="flex items-center gap-2">
                      <CalendarDays className="size-4" />
                      Bảo hành
                    </dt>
                    <dd className="font-semibold text-[#0a0a0a]">{quote.warranty}</dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-2">
                  {isLowestPrice && <Badge className="rounded-md bg-[#0a0a0a] text-white">Giá tốt nhất</Badge>}
                  {isFastest && <Badge className="rounded-md bg-[#e8e5df] text-[#525252]">Nhanh nhất</Badge>}
                  {isLongestWarranty && <Badge className="rounded-md bg-[#eef8f1] text-[#2f7d4e]">Bảo hành dài nhất</Badge>}
                </div>

                <Button
                  type="button"
                  disabled={isLockedByOtherQuote}
                  className={`w-full ${
                    isSelected
                      ? "bg-[#2f7d4e] hover:bg-[#25663f]"
                      : isLockedByOtherQuote
                        ? "bg-[#d4d4d4] text-white"
                        : "bg-[#0a0a0a] hover:bg-[#262626]"
                  }`}
                  onClick={() => handleSelectQuote(quote.id)}
                >
                  {isSelected ? "Đã chọn xưởng này" : isLockedByOtherQuote ? "Hủy xưởng đang chọn để đổi" : "Chọn xưởng này"}
                </Button>
              </div>
            </article>

              {isSelected && (
                <div
                  ref={confirmationRef}
                  className={`scroll-mt-6 rounded-xl border p-5 text-sm leading-7 ${
                    details.finalConfirmed ? "border-[#a8d5b5] bg-[#eef8f1] text-[#2f7d4e]" : "border-[#d4d4d4] bg-[#f7f7f5] text-[#6f665c]"
                  }`}
                >
                  <strong>Đã chọn {quote.workshop.name}.</strong> Báo giá {formatCurrency(quote.price)}, thời gian {quote.leadTime},
                  bảo hành {quote.warranty}. Muốn đổi xưởng, hãy hủy lựa chọn hiện tại trước.
                  {!details.finalConfirmed && (
                    <p className="mt-2 font-semibold text-[#0a0a0a]">
                      Cần chốt bảng thông số cuối trước khi xác nhận báo giá và tiếp tục đặt cọc.
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      className="bg-[#2f7d4e] hover:bg-[#25663f]"
                      onClick={confirmFinalSpec}
                      disabled={details.finalConfirmed}
                    >
                      {details.finalConfirmed ? "Đã xác nhận báo giá" : "Xác nhận báo giá"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#a8d5b5] bg-white text-[#2f7d4e] hover:bg-[#eef8f1]"
                      onClick={cancelSelectedQuote}
                    >
                      Hủy chọn xưởng
                    </Button>
                  </div>
                </div>
              )}

              {details.finalConfirmed && isSelected && (
                <div className="rounded-xl border border-[#6f665c] bg-[#f7f7f5] p-5 text-sm leading-7 text-[#525252]">
                  <strong className="text-[#0a0a0a]">Bản xác nhận báo giá đã được ghi nhận.</strong>
                  <p className="mt-1">
                    Kích thước, vật liệu, màu, công năng, phụ kiện, báo giá, thời gian hoàn thành, bảo hành và điều kiện phát sinh
                    cần được xưởng đo/kiểm tra lại trước khi sản xuất.
                  </p>
                  <Link to={orderProgressPath}>
                    <Button className="mt-4 bg-[#0a0a0a] hover:bg-[#262626]">
                      Tiếp tục đặt cọc và theo dõi đơn hàng
                    </Button>
                  </Link>
                </div>
              )}
            </Fragment>
          )
        })}
      </div>

      <div className="rounded-xl border border-[#d4d4d4] bg-[#f7f7f5] p-5 text-sm leading-7 text-[#6f665c]">
        Các mức giá là dữ liệu tham khảo. Báo giá cuối cùng cần được xưởng xác nhận sau khi khảo sát hiện trạng,
        phụ kiện, vận chuyển và điều kiện lắp đặt.
      </div>
    </section>
  )
}

export default QuotesPage
