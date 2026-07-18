import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Eye, FileDown, Pencil, Save, Send } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import { quotationStatusLabels } from "@/data/mock/quotations"
import {
  calculateCommission,
  confirmDepositForQuotation,
  getOrderByQuotationId,
  getQuotations,
  sendQuotation,
  simulateCustomerQuotationEvent,
  updateQuotation,
} from "@/stores/workshopStorage"
import { formatCurrency } from "@/utils/formatCurrency"
import { exportElementToPdf } from "@/utils/generatePdf"

const filters = [
  { label: "Tất cả", value: "all" },
  { label: "Bản nháp", value: "draft" },
  { label: "Chờ gửi", value: "ready" },
  { label: "Đã gửi", value: "sent" },
  { label: "Khách chọn xưởng", value: "shortlisted" },
  { label: "Đang làm rõ", value: "clarifying" },
  { label: "Chờ khách xác nhận giá", value: "requoted" },
  { label: "Khách xác nhận giá", value: "customer_confirmed" },
  { label: "Đã chốt báo giá", value: "final_spec_confirmed" },
  { label: "Chờ xác nhận cọc", value: "pending_confirm" },
  { label: "Đơn đã tạo", value: "accepted" },
  { label: "Không được chọn", value: "lost" },
]

const workflowActions = [
  { label: "Khách đã xem", value: "viewed", allowedFrom: ["sent"] },
  { label: "Khách chọn xưởng", value: "shortlisted", allowedFrom: ["viewed"] },
  { label: "Cần trao đổi thêm", value: "clarifying", allowedFrom: ["shortlisted"] },
  { label: "Khách xác nhận báo giá", value: "customer_confirmed", allowedFrom: ["requoted"] },
  { label: "Chốt báo giá", value: "final_spec_confirmed", allowedFrom: ["customer_confirmed"] },
  { label: "Khách đã đặt cọc", value: "pending_confirm", allowedFrom: ["final_spec_confirmed"] },
  {
    label: "Hủy chọn",
    value: "cancelled_by_customer",
    allowedFrom: ["shortlisted", "clarifying", "requoted", "customer_confirmed", "final_spec_confirmed", "pending_confirm"],
  },
  {
    label: "Chọn xưởng khác",
    value: "lost",
    allowedFrom: ["sent", "viewed", "shortlisted", "clarifying", "requoted", "customer_confirmed", "final_spec_confirmed", "pending_confirm"],
  },
]

function canSendQuotation(status) {
  return ["draft", "ready", "revision_requested"].includes(status)
}

function canEditQuotation(status) {
  return ["draft", "ready", "revision_requested", "clarifying"].includes(status)
}

function canRunWorkflowAction(quotation, action) {
  return action.allowedFrom.includes(quotation.status)
}

function FlowHint({ quotation }) {
  const hints = {
    shortlisted: "Khách đã chọn xưởng bạn. Nếu còn thiếu thông tin, hãy chuyển sang bước trao đổi thêm với khách trước khi chốt lại báo giá.",
    clarifying: "Đang làm rõ thông tin. Hãy trao đổi với khách trong chat; khi đủ thông tin thì quay lại đây để sửa và confirm lại báo giá.",
    requoted: "Báo giá đã được confirm lại. Đang chờ khách xác nhận báo giá cuối.",
    customer_confirmed: "Khách đã xác nhận báo giá. Bước tiếp theo là hai bên xác nhận Phiếu thông số cuối.",
    final_spec_confirmed: "Hai bên đã xác nhận phiếu thông số cuối. Bước tiếp theo là khách thanh toán khoản đặt cọc đầu tiên.",
    pending_confirm: "Khách đã thanh toán khoản cọc đầu tiên. Xưởng cần xác nhận đã nhận cọc để tạo đơn và bắt đầu sản xuất.",
  }

  if (!hints[quotation.status]) return null

  return (
    <div className="rounded-[14px] border border-[#ead8ca] bg-[#fff1e8] px-4 py-3 text-left">
      <p className="text-[14px] font-semibold text-[#854f19]">{hints[quotation.status]}</p>
      {quotation.status === "clarifying" && (
        <Link
          to={`${ROUTES.messages}?requestId=${quotation.requestId}&quotationId=${quotation.id}`}
          className="mt-3 inline-flex h-9 items-center rounded-[12px] bg-white px-3 text-[13px] font-bold text-[#854f19] ring-1 ring-[#ead8ca] hover:bg-[#fffdf9]"
        >
          Mở trao đổi với khách
        </Link>
      )}
    </div>
  )
}

function QuotationPreview({ quotation, previewRef }) {
  const customerProductPrice = Number(quotation.productSubtotal || 0) + Number(quotation.commissionAmount || 0)
  const rows = [
    ["Mã báo giá", quotation.id],
    ["Mã yêu cầu", quotation.requestId],
    ["Xưởng báo giá", quotation.workshopName],
    ["Khách hàng", quotation.customerName],
    ["Sản phẩm", quotation.product],
    ["Thời gian hoàn thành", quotation.productionTime],
    ["Bảo hành", quotation.warranty || "12 tháng"],
    ["Ngày tạo", quotation.createdAt],
    ["Ngày gửi", quotation.sentAt],
    ["Trạng thái", quotationStatusLabels[quotation.status]],
  ]

  return (
    <div className="overflow-auto rounded-[16px] border border-[#ead8ca] bg-[#f1e8de] p-2 sm:p-4">
      <div ref={previewRef} className="mx-auto min-h-[720px] w-full max-w-[794px] bg-white p-4 text-left text-[#231a11] shadow-[0_20px_60px_rgba(82,68,58,0.18)] sm:min-h-[980px] sm:p-10">
        <header className="flex flex-col items-start justify-between gap-4 border-b border-[#ead8ca] pb-5 sm:flex-row sm:gap-6 sm:pb-6">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#854f19]">WoodSpec Workshop</p>
            <h2 className="mt-2 text-[24px] font-black leading-tight sm:text-[30px]">Báo giá sản phẩm</h2>
            <p className="mt-2 text-[14px] text-[#52443a]">Bản xem trước nội dung khách sẽ thấy.</p>
          </div>
          <img src="/logo.jpg" alt="WoodSpec" className="size-12 object-contain sm:size-16" />
        </header>

        <section className="mt-7">
          <h3 className="text-[18px] font-black">Thông tin báo giá</h3>
          <div className="mt-3 overflow-hidden rounded-[12px] border border-[#ead8ca]">
            {rows.map(([label, value]) => (
              <div key={label} className="grid border-b border-[#ead8ca] text-[14px] last:border-b-0 sm:grid-cols-[180px_1fr]">
                <div className="bg-[#fff8f5] px-4 py-3 font-bold text-[#854f19]">{label}</div>
                <div className="px-4 py-3 font-semibold text-[#231a11]">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <h3 className="text-[18px] font-black">Tổng báo giá gửi khách</h3>
          <div className="mt-3 overflow-hidden rounded-[12px] border border-[#ead8ca]">
            <div className="grid border-b border-[#ead8ca] text-[14px] sm:grid-cols-[1fr_180px]">
              <div className="px-4 py-3 font-semibold text-[#231a11]">Giá sản phẩm</div>
              <div className="bg-[#fff8f5] px-4 py-3 font-bold text-[#854f19] sm:text-right">{formatCurrency(customerProductPrice)}</div>
            </div>
            <div className="grid border-b border-[#ead8ca] text-[14px] sm:grid-cols-[1fr_180px]">
              <div className="px-4 py-3 font-semibold text-[#231a11]">Vận chuyển/lắp đặt</div>
              <div className="bg-[#fff8f5] px-4 py-3 font-bold text-[#854f19] sm:text-right">{formatCurrency(quotation.serviceFee)}</div>
            </div>
            <div className="grid bg-[#854f19] text-white sm:grid-cols-[1fr_180px]">
              <div className="px-4 py-4 text-[16px] font-black">Tổng báo giá</div>
              <div className="px-4 pb-4 text-[16px] font-black sm:py-4 sm:text-right">{formatCurrency(quotation.total)}</div>
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-[12px] bg-[#fff1e8] p-5">
          <h3 className="text-[16px] font-black">Ghi chú xưởng</h3>
          <p className="mt-3 text-[14px] leading-7 text-[#52443a]">{quotation.note}</p>
        </section>

        <section className="mt-5 rounded-[12px] bg-[#fffdf9] p-5">
          <h3 className="text-[16px] font-black">Điều kiện thực hiện</h3>
          <p className="mt-3 text-[14px] leading-7 text-[#52443a]">
            Báo giá cuối có hiệu lực sau khi khách xác nhận, hai bên chốt Phiếu thông số cuối và xưởng xác nhận khoản đặt cọc đầu tiên.
          </p>
        </section>

        <footer className="mt-10 border-t border-[#ead8ca] pt-5 text-[12px] text-[#8a796b]">
          Xưởng gỗ WoodSpec · Báo giá được tạo từ dữ liệu yêu cầu khách hàng.
        </footer>
      </div>
    </div>
  )
}

function QuotationEditForm({ quotation, onSave }) {
  const [form, setForm] = useState({
    productSubtotal: quotation.productSubtotal,
    serviceFee: quotation.serviceFee,
    productionTime: quotation.productionTime,
    warranty: quotation.warranty || "12 tháng",
    note: quotation.note || "Báo giá theo thông số khách hàng đã gửi.",
  })

  const productSubtotal = Number(String(form.productSubtotal).replace(/\D/g, "")) || 0
  const serviceFee = Number(String(form.serviceFee).replace(/\D/g, "")) || 0
  const customerTotal = calculateCommission(productSubtotal, serviceFee).total
  const isRequote = quotation.status === "clarifying"

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave({
      productSubtotal: Number(String(form.productSubtotal).replace(/\D/g, "")) || 0,
      serviceFee: Number(String(form.serviceFee).replace(/\D/g, "")) || 0,
      productionTime: form.productionTime,
      warranty: form.warranty,
      note: form.note,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[16px] border border-[#ead8ca] bg-white p-4 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)] sm:p-5">
      <div className="flex items-center gap-2">
        <Pencil size={18} className="text-[#854f19]" />
        <h3 className="text-[17px] font-bold leading-tight text-[#231a11] sm:text-[18px]">
          {isRequote ? `Đăng báo giá thay đổi ${quotation.id}` : `Chỉnh sửa báo giá ${quotation.id}`}
        </h3>
      </div>
      {isRequote && (
        <p className="mt-2 rounded-[13px] bg-[#fff1e8] px-4 py-3 text-[13px] font-semibold text-[#854f19]">
          Sau khi trao đổi đủ thông tin với khách, sửa lại chi phí/thời gian nếu cần rồi đăng lại báo giá thay đổi.
        </p>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-[13px] font-bold text-[#52443a]">Giá xưởng báo</span>
          <input value={form.productSubtotal} onChange={(event) => updateField("productSubtotal", event.target.value)} className="mt-2 h-11 w-full rounded-[13px] border border-[#ead8ca] px-3 outline-none focus:border-[#854f19]" />
        </label>
        <label className="block">
          <span className="text-[13px] font-bold text-[#52443a]">Vận chuyển/lắp đặt/phát sinh</span>
          <input value={form.serviceFee} onChange={(event) => updateField("serviceFee", event.target.value)} className="mt-2 h-11 w-full rounded-[13px] border border-[#ead8ca] px-3 outline-none focus:border-[#854f19]" />
        </label>
        <label className="block">
          <span className="text-[13px] font-bold text-[#52443a]">Thời gian hoàn thành</span>
          <input value={form.productionTime} onChange={(event) => updateField("productionTime", event.target.value)} className="mt-2 h-11 w-full rounded-[13px] border border-[#ead8ca] px-3 outline-none focus:border-[#854f19]" />
        </label>
        <label className="block">
          <span className="text-[13px] font-bold text-[#52443a]">Bảo hành</span>
          <input value={form.warranty} onChange={(event) => updateField("warranty", event.target.value)} className="mt-2 h-11 w-full rounded-[13px] border border-[#ead8ca] px-3 outline-none focus:border-[#854f19]" />
        </label>
        <label className="block md:col-span-2">
          <span className="text-[13px] font-bold text-[#52443a]">Ghi chú xưởng</span>
          <textarea value={form.note} onChange={(event) => updateField("note", event.target.value)} className="mt-2 min-h-28 w-full rounded-[13px] border border-[#ead8ca] p-3 outline-none focus:border-[#854f19]" />
        </label>
      </div>

      <div className="mt-4 rounded-[13px] border border-[#ead8ca] bg-[#fffdf9] p-3">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a796b]">Tổng khách sẽ thấy</p>
        <p className="mt-1 text-[22px] font-black text-[#231a11]">{formatCurrency(customerTotal)}</p>
        <p className="mt-1 text-[13px] leading-5 text-[#52443a]">
          Hệ thống tự cộng hoa hồng vào giá xưởng báo trước khi hiển thị cho khách.
        </p>
      </div>


      <button type="submit" className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[13px] bg-[#854f19] px-4 text-[14px] font-bold text-white sm:w-auto">
        <Save size={17} />
        {isRequote ? "Đăng báo giá thay đổi" : "Lưu báo giá"}
      </button>
    </form>
  )
}

function DepositConfirmPanel({ quotation, onConfirm }) {
  const [form, setForm] = useState({
    depositAmount: Math.round(quotation.total * 0.3),
    depositMethod: "Chuyển khoản trực tiếp cho xưởng",
    depositReceivedAt: new Date().toLocaleDateString("vi-VN"),
    depositNote: "Xưởng đã nhận khoản cọc đầu tiên từ khách.",
  })

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onConfirm({
      ...form,
      depositAmount: Number(String(form.depositAmount).replace(/\D/g, "")) || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[16px] border border-[#ead8ca] bg-white p-4 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)] sm:p-5">
      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#854f19]">Xác nhận cọc</p>
      <h3 className="mt-2 text-[18px] font-black text-[#231a11]">Xưởng xác nhận đã nhận cọc đầu tiên</h3>
      <p className="mt-2 text-[13px] leading-5 text-[#8a796b]">
        Khi xưởng xác nhận đã nhận khoản cọc đầu tiên từ khách, hệ thống tạo đơn để bắt đầu theo dõi sản xuất.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-[13px] font-bold text-[#52443a]">Số tiền cọc đã nhận</span>
          <input value={form.depositAmount} onChange={(event) => updateField("depositAmount", event.target.value)} className="mt-2 h-10 w-full rounded-[13px] border border-[#ead8ca] px-3 outline-none focus:border-[#854f19]" />
        </label>
        <label className="block">
          <span className="text-[13px] font-bold text-[#52443a]">Ngày nhận cọc</span>
          <input value={form.depositReceivedAt} onChange={(event) => updateField("depositReceivedAt", event.target.value)} className="mt-2 h-10 w-full rounded-[13px] border border-[#ead8ca] px-3 outline-none focus:border-[#854f19]" />
        </label>
        <label className="block md:col-span-2">
          <span className="text-[13px] font-bold text-[#52443a]">Hình thức nhận</span>
          <input value={form.depositMethod} onChange={(event) => updateField("depositMethod", event.target.value)} className="mt-2 h-10 w-full rounded-[13px] border border-[#ead8ca] px-3 outline-none focus:border-[#854f19]" />
        </label>
        <label className="block md:col-span-2">
          <span className="text-[13px] font-bold text-[#52443a]">Ghi chú</span>
          <textarea value={form.depositNote} onChange={(event) => updateField("depositNote", event.target.value)} className="mt-2 min-h-20 w-full rounded-[13px] border border-[#ead8ca] p-3 outline-none focus:border-[#854f19]" />
        </label>
      </div>

      <button type="submit" className="mt-4 h-10 w-full rounded-[13px] bg-[#854f19] px-4 text-[14px] font-bold text-white">
        Xác nhận đã nhận cọc
      </button>
    </form>
  )
}

function QuotationActionPanel({ quotation, onClarify, onEdit, onFinalize }) {
  if (["draft", "ready", "sent", "viewed", "requoted", "final_spec_confirmed", "pending_confirm", "lost", "cancelled_by_customer", "rejected", "accepted"].includes(quotation.status)) {
    if (quotation.status !== "accepted") return null
    const order = getOrderByQuotationId(quotation.id)

    return (
      <div className="rounded-[16px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
        <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#854f19]">Đã chốt</p>
        <h3 className="mt-2 text-[18px] font-black text-[#231a11]">Đơn đã được tạo sau khi xác nhận cọc</h3>
        <p className="mt-2 text-[14px] text-[#52443a]">Theo dõi sản xuất và giao hàng trong menu Đơn hàng.</p>
        {order && (
          <Link
            to={`${ROUTES.orders}?orderId=${order.id}&quotationId=${quotation.id}&requestId=${quotation.requestId}`}
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-[13px] bg-[#854f19] px-4 text-[14px] font-bold text-white hover:bg-[#6f4114] sm:w-auto"
          >
            Xem đơn hàng
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-[16px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#854f19]">Hành động sau khi khách chọn xưởng</p>
      <h3 className="mt-2 text-[18px] font-black text-[#231a11]">Trao đổi, đăng lại hoặc chốt báo giá</h3>
      <p className="mt-2 text-[14px] leading-6 text-[#52443a]">
        Nếu còn thiếu thông tin thì chuyển qua trò chuyện. Khi đã đủ thông tin, đăng báo giá thay đổi nếu có sửa giá/thời gian. Khi khách xác nhận báo giá, xưởng chốt báo giá để chuyển sang bước cọc.
      </p>
        <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
        {["shortlisted", "clarifying"].includes(quotation.status) && (
          <button
            type="button"
            onClick={onClarify}
            className="inline-flex h-10 items-center justify-center rounded-[13px] border border-[#ead8ca] bg-white px-4 text-[14px] font-bold text-[#854f19] hover:bg-[#fff1e8]"
          >
            Chuyển qua trò chuyện
          </button>
        )}
        {quotation.status === "clarifying" && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-10 items-center justify-center rounded-[13px] border border-[#ead8ca] bg-white px-4 text-[14px] font-bold text-[#854f19] hover:bg-[#fff1e8]"
          >
            Đăng báo giá thay đổi
          </button>
        )}
        {quotation.status === "customer_confirmed" && (
          <button
            type="button"
            onClick={onFinalize}
            className="inline-flex h-10 items-center justify-center rounded-[13px] bg-[#854f19] px-4 text-[14px] font-bold text-white hover:bg-[#6f4114]"
          >
            Chốt báo giá
          </button>
        )}
      </div>
    </div>
  )
}

function QuotationPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const routeQuotationId = searchParams.get("quotationId")
  const routeRequestId = searchParams.get("requestId")
  const routeMode = searchParams.get("mode")
  const [activeFilter, setActiveFilter] = useState("all")
  const [quotationList, setQuotationList] = useState(() => getQuotations())
  const [selectedQuotation, setSelectedQuotation] = useState(() => {
    const quotations = getQuotations()
    return quotations.find((quotation) => quotation.id === routeQuotationId || quotation.requestId === routeRequestId) || quotations[0] || null
  })
  const [mode, setMode] = useState("preview")
  const [isExporting, setIsExporting] = useState(false)
  const [message, setMessage] = useState("")
  const previewRef = useRef(null)
  const selectedPanelRef = useRef(null)

  const visibleQuotations = useMemo(
    () => (activeFilter === "all" ? quotationList : quotationList.filter((item) => item.status === activeFilter)),
    [activeFilter, quotationList],
  )

  useEffect(() => {
    const nextQuotation = quotationList.find((quotation) => quotation.id === routeQuotationId || quotation.requestId === routeRequestId)

    if (!nextQuotation) return

    setSelectedQuotation((current) => (current?.id === nextQuotation.id ? current : nextQuotation))
    setActiveFilter("all")
    if (routeMode === "edit") setMode("edit")
  }, [quotationList, routeMode, routeQuotationId, routeRequestId])

  const refreshQuotations = (nextSelectedId = selectedQuotation?.id) => {
    const nextQuotations = getQuotations()
    setQuotationList(nextQuotations)
    setSelectedQuotation(nextQuotations.find((quotation) => quotation.id === nextSelectedId) || nextQuotations[0] || null)
  }

  const selectQuotation = (quotation, nextMode, options = {}) => {
    setSelectedQuotation(quotation)
    setMode(nextMode)
    setMessage("")
    setSearchParams({
      quotationId: quotation.id,
      requestId: quotation.requestId,
      ...(nextMode === "edit" ? { mode: "edit" } : {}),
    })

    if (options.scrollToPreview) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          selectedPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        })
      })
    }
  }

  const handleSave = (patch) => {
    const nextPatch =
      selectedQuotation.status === "clarifying"
        ? { ...patch, status: "requoted", requotedAt: new Date().toLocaleDateString("vi-VN") }
        : { ...patch, status: selectedQuotation.status === "sent" ? "sent" : "ready" }
    const updatedQuotation = updateQuotation(selectedQuotation.id, nextPatch)
    refreshQuotations(updatedQuotation.id)
    setMode("preview")
    setSearchParams({ quotationId: updatedQuotation.id, requestId: updatedQuotation.requestId })
    setMessage(selectedQuotation.status === "clarifying" ? "Đã đăng báo giá thay đổi. Khi hai bên thống nhất, bấm Chốt báo giá." : "Đã lưu báo giá.")
  }

  const handleSend = (quotation) => {
    const updatedQuotation = sendQuotation(quotation.id)
    refreshQuotations(updatedQuotation.id)
    setMode("preview")
    setSearchParams({ quotationId: updatedQuotation.id, requestId: updatedQuotation.requestId })
    setMessage(`Đã gửi báo giá ${updatedQuotation.id}.`)
  }

  const handleWorkflowAction = (status) => {
    const action = workflowActions.find((item) => item.value === status)
    if (!action || !canRunWorkflowAction(selectedQuotation, action)) {
      setMessage("Chưa thể chuyển sang bước này. Hãy đi theo đúng thứ tự của luồng báo giá.")
      return
    }

    const updatedQuotation = simulateCustomerQuotationEvent(selectedQuotation.id, status)
    refreshQuotations(updatedQuotation.id)
    setMode("preview")
    setSearchParams({ quotationId: updatedQuotation.id, requestId: updatedQuotation.requestId })
    setMessage(`Đã chuyển trạng thái: ${quotationStatusLabels[status]}.`)
  }

  const handleClarify = () => {
    if (selectedQuotation.status === "shortlisted") {
      const updatedQuotation = simulateCustomerQuotationEvent(selectedQuotation.id, "clarifying")
      refreshQuotations(updatedQuotation.id)
    }

    navigate(`${ROUTES.messages}?requestId=${selectedQuotation.requestId}&quotationId=${selectedQuotation.id}`)
  }

  const handleFinalizeQuotation = () => {
    const finalizedQuotation = updateQuotation(selectedQuotation.id, {
      status: "pending_confirm",
      finalSpecConfirmedAt: new Date().toLocaleDateString("vi-VN"),
    })
    refreshQuotations(finalizedQuotation.id)
    setMode("preview")
    setSearchParams({ quotationId: finalizedQuotation.id, requestId: finalizedQuotation.requestId })
    setMessage("Đã chốt báo giá. Đang chờ khách thanh toán khoản đặt cọc đầu tiên và xưởng xác nhận đã nhận cọc.")
  }

  const handleDepositConfirm = (depositData) => {
    const result = confirmDepositForQuotation(selectedQuotation.id, depositData)
    if (!result) {
      setMessage("Chỉ có thể xác nhận cọc sau khi báo giá đã chốt.")
      return
    }

    refreshQuotations(result.quotation.id)
    setMode("preview")
    setSearchParams({ quotationId: result.quotation.id, requestId: result.quotation.requestId })
    setMessage(`Đã xác nhận cọc và tạo đơn ${result.order.id}. Có thể bắt đầu sản xuất trong menu Đơn hàng.`)
  }

  const exportQuotation = async (quotation) => {
    selectQuotation(quotation, "preview")
    setIsExporting(true)

    window.requestAnimationFrame(async () => {
      try {
        await exportElementToPdf(previewRef.current, `bao-gia-${quotation.id}.pdf`)
      } finally {
        setIsExporting(false)
      }
    })
  }

  if (!selectedQuotation) {
    return (
      <section className="rounded-[18px] border border-[#ead8ca] bg-white p-8 text-center shadow-[0_18px_48px_rgba(82,68,58,0.08)]">
        <h2 className="text-[26px] font-bold text-[#231a11]">Chưa có báo giá</h2>
        <p className="mt-2 text-[#52443a]">Vào yêu cầu có trạng thái chờ báo giá để nhập giá đầu tiên.</p>
      </section>
    )
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[18px] border border-[#ead8ca] bg-white p-4 text-left shadow-[0_18px_48px_rgba(82,68,58,0.08)] sm:p-6">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#854f19]">Báo giá</p>
        <h2 className="mt-2 text-[30px] font-bold leading-tight text-[#231a11]">Quản lý và gửi báo giá</h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-6 text-[#52443a]">
          Giá được nhập ở trang chi tiết yêu cầu. Khi đã lưu, báo giá sẽ nằm ở đây để xưởng xem lại, sửa, gửi cho khách hoặc tải PDF.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-[13px] border border-[#ead8ca] bg-[#fffdf9] px-4 py-3">
            <p className="text-[13px] font-black text-[#231a11]">Chi tiết yêu cầu</p>
            <p className="mt-1 text-[13px] text-[#6a5b4f]">Nhập giá theo yêu cầu khách hàng đang xem.</p>
          </div>
          <div className="rounded-[13px] border border-[#ead8ca] bg-[#fff1e8] px-4 py-3">
            <p className="text-[13px] font-black text-[#231a11]">Menu Báo giá</p>
            <p className="mt-1 text-[13px] text-[#6a5b4f]">Quản lý tất cả báo giá đã lưu, gửi khách và xuất PDF.</p>
          </div>
        </div>
      </div>

      {message && <p className="rounded-[14px] border border-[#ead8ca] bg-[#fff1e8] px-4 py-3 text-left text-[14px] font-bold text-[#854f19]">{message}</p>}

      <div className="rounded-[18px] border border-[#ead8ca] bg-white p-3 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)] sm:p-5">
        <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-bold ${
                activeFilter === filter.value ? "border-[#854f19] bg-[#fff1e8] text-[#854f19]" : "border-[#ead8ca] text-[#52443a]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-[14px] border border-[#ead8ca]">
          {visibleQuotations.map((item) => (
            <div key={item.id} className={`grid gap-3 border-b border-[#ead8ca] p-3 last:border-b-0 sm:gap-4 sm:p-4 xl:grid-cols-[0.9fr_1fr_0.8fr_0.8fr_auto] ${selectedQuotation.id === item.id ? "bg-[#fffdf9]" : "bg-white"}`}>
              <button type="button" onClick={() => selectQuotation(item, "preview", { scrollToPreview: true })} className="text-left">
                <p className="font-bold text-[#231a11]">{item.id}</p>
                <p className="text-[14px] text-[#52443a]">{item.requestId}</p>
              </button>
              <button type="button" onClick={() => selectQuotation(item, "preview", { scrollToPreview: true })} className="text-left">
                <p className="font-semibold text-[#231a11]">{item.customerName}</p>
                <p className="text-[14px] text-[#52443a]">{item.product}</p>
              </button>
              <div>
                <p className="font-bold text-[#854f19]">{formatCurrency(item.total)}</p>
                <p className="text-[14px] text-[#52443a]">Khách thấy</p>
              </div>
              <div>
                <p className="text-[14px] text-[#52443a]">Tạo: {item.createdAt}</p>
                <p className="text-[14px] text-[#52443a]">Gửi: {item.sentAt}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center xl:justify-end">
                <span className="col-span-2 rounded-full bg-[#fff1e8] px-3 py-1 text-[12px] font-bold text-[#854f19] sm:col-span-1">{quotationStatusLabels[item.status]}</span>
                <button
                  type="button"
                  onClick={() => selectQuotation(item, "preview", { scrollToPreview: true })}
                  className={`inline-flex h-9 items-center justify-center gap-1 rounded-[12px] border px-3 text-[13px] font-bold hover:bg-[#fff1e8] ${
                    selectedQuotation.id === item.id ? "border-[#854f19] bg-[#fff1e8] text-[#854f19]" : "border-[#ead8ca] text-[#52443a]"
                  }`}
                >
                  <Eye size={16} />
                  {selectedQuotation.id === item.id && mode === "preview" ? "Đang xem" : "Xem"}
                </button>
                {canEditQuotation(item.status) && (
                  <button
                    type="button"
                    onClick={() => selectQuotation(item, "edit")}
                    title="Sửa giá, thời gian, bảo hành và ghi chú trước khi gửi khách"
                    aria-label="Sửa báo giá"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[12px] border border-[#ead8ca] px-3 text-[13px] font-bold text-[#52443a] hover:bg-[#fff1e8]"
                  >
                    <Pencil size={16} />
                    Sửa
                  </button>
                )}
                {canSendQuotation(item.status) && (
                  <button
                    type="button"
                    onClick={() => handleSend(item)}
                    title="Gửi báo giá này cho khách hàng"
                    aria-label="Gửi báo giá cho khách"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[12px] border border-[#ead8ca] px-3 text-[13px] font-bold text-[#52443a] hover:bg-[#fff1e8]"
                  >
                    <Send size={16} />
                    Gửi
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => exportQuotation(item)}
                  disabled={isExporting && selectedQuotation.id === item.id}
                  title="Tải báo giá này thành file PDF"
                  aria-label="Xuất báo giá PDF"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[12px] border border-[#ead8ca] px-3 text-[13px] font-bold text-[#52443a] hover:bg-[#fff1e8] disabled:cursor-wait disabled:opacity-60"
                >
                  <FileDown size={16} />
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {mode === "preview" ? (
        <div ref={selectedPanelRef} className="scroll-mt-5 space-y-4">
          <FlowHint quotation={selectedQuotation} />
          <QuotationActionPanel
            quotation={selectedQuotation}
            onClarify={handleClarify}
            onEdit={() => setMode("edit")}
            onFinalize={handleFinalizeQuotation}
          />
          {selectedQuotation.status === "pending_confirm" && (
            <DepositConfirmPanel quotation={selectedQuotation} onConfirm={handleDepositConfirm} />
          )}

          {["lost", "cancelled_by_customer", "rejected"].includes(selectedQuotation.status) && (
            <p className="rounded-[14px] border border-[#ead8ca] bg-white px-4 py-3 text-left text-[14px] font-semibold text-[#a33a22]">
              Báo giá này đã đóng, không còn hành động sản xuất hay cập nhật tiến độ.
            </p>
          )}

          <div className="rounded-[18px] border border-[#ead8ca] bg-white p-3 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)] sm:p-5">
            <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#854f19]">Báo giá đang chọn</p>
                <h3 className="mt-1 text-[18px] font-bold text-[#231a11]">Xem trước {selectedQuotation.id}</h3>
                <p className="mt-1 text-[14px] text-[#52443a]">Đây là nội dung khách sẽ thấy khi xưởng gửi báo giá hoặc xuất PDF.</p>
              </div>
              <div className="grid gap-2 sm:flex sm:flex-wrap">
                {canSendQuotation(selectedQuotation.status) && (
                  <button type="button" onClick={() => handleSend(selectedQuotation)} className="inline-flex h-10 items-center justify-center gap-2 rounded-[13px] border border-[#ead8ca] bg-white px-4 text-[14px] font-bold text-[#854f19] transition hover:bg-[#fff1e8]">
                    <Send size={17} />
                    Gửi báo giá
                  </button>
                )}
                <button type="button" onClick={() => exportQuotation(selectedQuotation)} disabled={isExporting} className="inline-flex h-10 items-center justify-center gap-2 rounded-[13px] bg-[#854f19] px-4 text-[14px] font-bold text-white transition hover:bg-[#6f4114] disabled:cursor-wait disabled:opacity-70">
                  <FileDown size={17} />
                  {isExporting ? "Đang xuất..." : "Xuất PDF"}
                </button>
              </div>
            </div>
            <QuotationPreview quotation={selectedQuotation} previewRef={previewRef} />
          </div>

          <details className="rounded-[18px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
            <summary className="cursor-pointer text-[14px] font-bold text-[#854f19]">Công cụ test nội bộ</summary>
            <p className="mt-3 text-[14px] text-[#52443a]">
              Dùng khi cần giả lập việc khách xem, chọn xưởng, xác nhận báo giá hoặc hai bên chốt thông số trong bản MVP.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {workflowActions.map((action) => (
                <button
                  key={action.value}
                  type="button"
                  onClick={() => handleWorkflowAction(action.value)}
                  disabled={!canRunWorkflowAction(selectedQuotation, action)}
                  className="rounded-[12px] border border-[#ead8ca] px-3 py-2 text-[13px] font-bold text-[#52443a] hover:bg-[#fff1e8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </details>
        </div>
      ) : (
        <QuotationEditForm key={selectedQuotation.id} quotation={selectedQuotation} onSave={handleSave} />
      )}
    </section>
  )
}

export default QuotationPage
