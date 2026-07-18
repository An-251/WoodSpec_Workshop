import { useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { BadgeDollarSign, Download, FileImage, FileText, Save } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import { requestStatusLabels } from "@/data/mock/requests"
import {
  calculateCommission,
  createQuotationFromRequest,
  getQuotationByRequestId,
  getRequestById,
} from "@/stores/workshopStorage"
import { formatCurrency } from "@/utils/formatCurrency"
import { exportElementToPdf } from "@/utils/generatePdf"

function InfoBlock({ title, items }) {
  return (
    <div className="rounded-[16px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
      <h3 className="text-[18px] font-bold text-[#231a11]">{title}</h3>
      <dl className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a796b]">{item.label}</dt>
            <dd className="mt-1 text-[14px] font-semibold text-[#231a11]">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function RoughCabinetDrawing({ request }) {
  return (
    <svg viewBox="0 0 860 720" className="h-auto w-full bg-white" role="img" aria-label="Bản vẽ kỹ thuật thô">
      <defs>
        <marker id="techArrow" markerHeight="6" markerWidth="6" orient="auto" refX="3" refY="3">
          <path d="M0,0 L6,3 L0,6 Z" fill="#222" />
        </marker>
        <linearGradient id="softShade" x1="0" x2="1">
          <stop offset="0" stopColor="#f7f7f7" />
          <stop offset="0.5" stopColor="#cccccc" />
          <stop offset="1" stopColor="#fafafa" />
        </linearGradient>
        <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#b7b7b7" strokeWidth="1" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="860" height="720" fill="#fff" />

      <g transform="translate(36 32)">
        <text x="0" y="0" fill="#222" fontSize="12" fontWeight="700">Mã: {request.id}</text>
        <text x="0" y="22" fill="#222" fontSize="12">Sản phẩm: {request.productName}</text>
        <text x="0" y="44" fill="#222" fontSize="12">Kích thước tổng: {request.dimensions}</text>
      </g>

      <g transform="translate(70 116)" stroke="#222" strokeWidth="1.6" fill="none">
        <text x="150" y="-18" textAnchor="middle" fill="#222" stroke="none" fontSize="13" fontWeight="700">MẶT ĐỨNG TỦ</text>
        <rect x="0" y="0" width="300" height="250" fill="url(#softShade)" />
        <rect x="18" y="18" width="264" height="214" />
        <line x1="106" y1="18" x2="106" y2="232" />
        <line x1="194" y1="18" x2="194" y2="232" />
        <line x1="18" y1="92" x2="282" y2="92" />
        <line x1="18" y1="162" x2="282" y2="162" />
        <rect x="120" y="176" width="60" height="44" rx="2" />
        <circle cx="92" cy="126" r="3" fill="#222" />
        <circle cx="208" cy="126" r="3" fill="#222" />
        <line x1="-34" y1="0" x2="-34" y2="250" markerStart="url(#techArrow)" markerEnd="url(#techArrow)" />
        <text x="-52" y="130" transform="rotate(-90 -52 130)" textAnchor="middle" fill="#222" stroke="none" fontSize="11">1100</text>
        <line x1="0" y1="274" x2="300" y2="274" markerStart="url(#techArrow)" markerEnd="url(#techArrow)" />
        <text x="150" y="294" textAnchor="middle" fill="#222" stroke="none" fontSize="11">1700</text>
      </g>

      <g transform="translate(500 116)" stroke="#222" strokeWidth="1.6" fill="none">
        <text x="105" y="-18" textAnchor="middle" fill="#222" stroke="none" fontSize="13" fontWeight="700">MẶT BÊN TỦ</text>
        <path d="M0 28 L210 0 L210 250 L0 250 Z" fill="url(#softShade)" />
        <path d="M18 42 L192 18 L192 232 L18 232 Z" />
        <line x1="35" y1="104" x2="192" y2="84" />
        <line x1="35" y1="168" x2="192" y2="148" />
        <line x1="246" y1="0" x2="246" y2="250" markerStart="url(#techArrow)" markerEnd="url(#techArrow)" />
        <text x="264" y="130" transform="rotate(-90 264 130)" textAnchor="middle" fill="#222" stroke="none" fontSize="11">1100</text>
        <line x1="0" y1="274" x2="210" y2="274" markerStart="url(#techArrow)" markerEnd="url(#techArrow)" />
        <text x="105" y="294" textAnchor="middle" fill="#222" stroke="none" fontSize="11">380</text>
      </g>

      <g transform="translate(118 465)" stroke="#222" strokeWidth="1.6" fill="none">
        <text x="150" y="-18" textAnchor="middle" fill="#222" stroke="none" fontSize="13" fontWeight="700">MẶT BẰNG TỦ</text>
        <rect x="0" y="0" width="300" height="120" fill="url(#hatch)" />
        <rect x="0" y="0" width="300" height="120" />
        <line x1="100" y1="0" x2="100" y2="120" />
        <line x1="200" y1="0" x2="200" y2="120" />
        <line x1="0" y1="144" x2="300" y2="144" markerStart="url(#techArrow)" markerEnd="url(#techArrow)" />
        <text x="150" y="164" textAnchor="middle" fill="#222" stroke="none" fontSize="11">1700</text>
        <line x1="334" y1="0" x2="334" y2="120" markerStart="url(#techArrow)" markerEnd="url(#techArrow)" />
        <text x="352" y="68" transform="rotate(-90 352 68)" textAnchor="middle" fill="#222" stroke="none" fontSize="11">380</text>
      </g>

      <g transform="translate(545 455)" stroke="#222" strokeWidth="1.4" fill="none">
        <text x="90" y="-18" textAnchor="middle" fill="#222" stroke="none" fontSize="13" fontWeight="700">CHI TIẾT KHOANG</text>
        <rect x="0" y="0" width="180" height="150" fill="url(#softShade)" />
        <rect x="18" y="18" width="144" height="114" />
        <line x1="18" y1="56" x2="162" y2="56" />
        <line x1="18" y1="94" x2="162" y2="94" />
      </g>

      <g transform="translate(36 670)">
        <text x="0" y="0" fill="#222" fontSize="12" fontWeight="700">Vật liệu: {request.material} · Màu: {request.color}</text>
        <text x="0" y="24" fill="#555" fontSize="12">Bản vẽ thô dùng để kiểm tra kích thước và bố cục trước khi lập báo giá.</text>
      </g>
    </svg>
  )
}

function PdfPreview({ request, previewRef }) {
  const needs = [
    ["Khách muốn làm", request.productName],
    ["Dùng để", request.purpose],
    ["Đặt tại", request.space],
    ["Số người sử dụng", request.users],
    ["Yêu cầu độ bền", request.durability],
    ["Phong cách mong muốn", request.style],
    ["Ngân sách dự kiến", request.budget],
    ["Thời gian mong muốn", request.expectedTime],
  ]

  const specs = [
    ["Kích thước", request.dimensions],
    ["Vật liệu", request.material],
    ["Màu sắc", request.color],
    ["Số ngăn", request.compartments],
    ["Số cánh cửa", request.doors],
    ["Số ngăn kéo", request.drawers],
    ["Phụ kiện", request.accessories],
    ["Lắp đặt", request.install],
  ]

  return (
    <div className="overflow-auto rounded-[16px] border border-[#ead8ca] bg-[#f1e8de] p-4">
      <div ref={previewRef} className="mx-auto min-h-[1120px] w-full max-w-[794px] bg-white text-left text-[#231a11] shadow-[0_20px_60px_rgba(82,68,58,0.18)]">
        <header className="flex min-h-16 items-center justify-between gap-6 bg-[#8f2447] px-7 py-4 text-white">
          <h2 className="text-[25px] font-black leading-tight">01. Bản vẽ chi tiết {request.productName}</h2>
          <img src="/logo.jpg" alt="WoodSpec" className="size-12 bg-white object-contain" />
        </header>

        <section className="mx-8 mt-7 grid grid-cols-2 gap-4 rounded-[10px] border border-[#d6d6d6] bg-[#fafafa] p-4 text-[13px]">
          <div><p className="font-bold text-[#333]">Mã yêu cầu</p><p className="mt-1 font-semibold">{request.id}</p></div>
          <div><p className="font-bold text-[#333]">Khách hàng</p><p className="mt-1 font-semibold">{request.customerName}</p></div>
          <div><p className="font-bold text-[#333]">Sản phẩm</p><p className="mt-1 font-semibold">{request.productName}</p></div>
          <div><p className="font-bold text-[#333]">Khu vực</p><p className="mt-1 font-semibold">{request.area}</p></div>
        </section>

        <section className="mx-8 mt-7"><RoughCabinetDrawing request={request} /></section>

        <section className="mx-8 mt-7">
          <h3 className="text-[18px] font-black">Nội dung nhu cầu khách hàng</h3>
          <div className="mt-3 overflow-hidden rounded-[10px] border border-[#d6d6d6]">
            {needs.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[180px_1fr] border-b border-[#d6d6d6] text-[13px] last:border-b-0">
                <div className="bg-[#f4f4f4] px-4 py-3 font-bold text-[#333]">{label}</div>
                <div className="px-4 py-3 font-semibold text-[#231a11]">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-8 mt-7">
          <h3 className="text-[18px] font-black">Bảng thông số gửi xưởng</h3>
          <div className="mt-3 overflow-hidden rounded-[10px] border border-[#d6d6d6]">
            {specs.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[180px_1fr] border-b border-[#d6d6d6] text-[13px] last:border-b-0">
                <div className="bg-[#f4f4f4] px-4 py-3 font-bold text-[#333]">{label}</div>
                <div className="px-4 py-3 font-semibold text-[#231a11]">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-8 mt-7 rounded-[10px] bg-[#f7f7f7] p-4">
          <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#333]">Ghi chú khách hàng</p>
          <p className="mt-2 text-[14px] leading-6 text-[#52443a]">{request.note}</p>
        </section>

        <footer className="mt-8 bg-[#8f2447] px-8 py-4 text-center text-[20px] font-black text-white">WoodSpec Workshop</footer>
      </div>
    </div>
  )
}

function QuotationEntryPanel({ request, savedQuotation, onSave }) {
  const [form, setForm] = useState({
    productSubtotal: savedQuotation?.productSubtotal || "37200000",
    serviceFee: savedQuotation?.serviceFee || "2000000",
    productionTime: savedQuotation?.productionTime || request.expectedTime || "",
    warranty: savedQuotation?.warranty || "12 tháng",
    note: savedQuotation?.note || "Báo giá đã bao gồm vật tư, gia công theo kích thước khách gửi và lắp đặt cơ bản tại công trình.",
  })
  const [error, setError] = useState("")
  const [savedNotice, setSavedNotice] = useState(savedQuotation ? "Báo giá sơ bộ đã được lưu cho yêu cầu này." : "")

  const productSubtotal = Number(String(form.productSubtotal).replace(/\D/g, ""))
  const serviceFee = Number(String(form.serviceFee).replace(/\D/g, ""))
  const customerTotal = calculateCommission(productSubtotal, serviceFee).total

  const updateField = (field, value) => {
    setError("")
    setSavedNotice("")
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!productSubtotal) {
      setError("Cần nhập giá sản phẩm trước khi lưu báo giá. Bạn có thể sửa số mẫu đang có sẵn.")
      return
    }

    const saved = onSave({
      ...form,
      productSubtotal,
      serviceFee,
    })

    if (!saved) {
      setError("Chưa lưu được báo giá. Bạn thử bấm lại hoặc kiểm tra dữ liệu vừa nhập.")
      return
    }

    setSavedNotice("Đã lưu báo giá sơ bộ. Báo giá này đã nằm trong menu Báo giá để gửi cho khách khi cần.")
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[16px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
      <div className="flex items-center gap-2">
        <BadgeDollarSign size={19} className="text-[#854f19]" />
        <h3 className="text-[18px] font-bold text-[#231a11]">Nhập báo giá sơ bộ</h3>
      </div>
      <p className="mt-2 text-[14px] leading-6 text-[#52443a]">
        Dựa trên yêu cầu khách gửi và bản vẽ thô. Sau khi khách chọn xưởng, nếu thiếu thông tin thì trao đổi thêm ở phần chat rồi quay lại sửa báo giá.
      </p>

      <label className="mt-4 block">
        <span className="text-[13px] font-bold text-[#52443a]">Giá xưởng báo</span>
        <input
          value={form.productSubtotal}
          onChange={(event) => updateField("productSubtotal", event.target.value)}
          placeholder="Ví dụ: 37.200.000"
          className="mt-2 h-10 w-full rounded-[13px] border border-[#ead8ca] px-3 text-[14px] outline-none focus:border-[#854f19]"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-[13px] font-bold text-[#52443a]">Vận chuyển/lắp đặt/phát sinh</span>
        <input
          value={form.serviceFee}
          onChange={(event) => updateField("serviceFee", event.target.value)}
          placeholder="Ví dụ: 2.000.000"
          className="mt-2 h-10 w-full rounded-[13px] border border-[#ead8ca] px-3 text-[14px] outline-none focus:border-[#854f19]"
        />
      </label>

      <div className="mt-4 rounded-[13px] border border-[#ead8ca] bg-[#fffdf9] p-3">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a796b]">Tổng khách sẽ thấy</p>
        <p className="mt-1 text-[22px] font-black text-[#231a11]">{formatCurrency(customerTotal)}</p>
        <p className="mt-1 text-[13px] leading-5 text-[#52443a]">
          Xưởng chỉ nhập giá xưởng báo và chi phí phát sinh. Hệ thống tự cộng hoa hồng để hiển thị cho khách.
        </p>
      </div>

      {error && <p className="mt-3 rounded-[12px] bg-[#fff1e8] px-3 py-2 text-[13px] font-semibold text-[#a33a22]">{error}</p>}

      <label className="mt-4 block">
        <span className="text-[13px] font-bold text-[#52443a]">Thời gian hoàn thành</span>
        <input
          value={form.productionTime}
          onChange={(event) => updateField("productionTime", event.target.value)}
          className="mt-2 h-10 w-full rounded-[13px] border border-[#ead8ca] px-3 text-[14px] outline-none focus:border-[#854f19]"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-[13px] font-bold text-[#52443a]">Bảo hành</span>
        <input
          value={form.warranty}
          onChange={(event) => updateField("warranty", event.target.value)}
          className="mt-2 h-10 w-full rounded-[13px] border border-[#ead8ca] px-3 text-[14px] outline-none focus:border-[#854f19]"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-[13px] font-bold text-[#52443a]">Ghi chú báo giá</span>
        <textarea
          value={form.note}
          onChange={(event) => updateField("note", event.target.value)}
          className="mt-2 min-h-24 w-full rounded-[13px] border border-[#ead8ca] p-3 text-[14px] outline-none focus:border-[#854f19]"
        />
      </label>

      <button type="submit" className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[13px] bg-[#854f19] px-3 text-[14px] font-bold text-white">
        <Save size={17} />
        {savedNotice ? "Lưu lại thay đổi" : "Lưu báo giá sơ bộ"}
      </button>

      {savedNotice && (
        <div className="mt-3 rounded-[13px] border border-[#d9ead2] bg-[#f4fbf0] p-3 text-[13px] font-semibold text-[#3f6b2f]">
          <p>{savedNotice}</p>
          <Link to={`${ROUTES.quotations}?requestId=${request.id}${savedQuotation?.id ? `&quotationId=${savedQuotation.id}` : ""}`} className="mt-2 inline-flex font-black text-[#854f19]">
            Xem trong menu Báo giá
          </Link>
        </div>
      )}
    </form>
  )
}

function RequestDetailPage() {
  const { requestId } = useParams()
  const [request, setRequest] = useState(() => getRequestById(requestId))
  const [savedQuotation, setSavedQuotation] = useState(() => (request ? getQuotationByRequestId(request.id) : null))
  const pdfRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)
  const [message, setMessage] = useState("")

  if (!request) {
    return (
      <section className="rounded-[18px] border border-[#ead8ca] bg-white p-8 text-center shadow-[0_18px_48px_rgba(82,68,58,0.08)]">
        <h2 className="text-[26px] font-bold text-[#231a11]">Không tìm thấy yêu cầu</h2>
        <Link to={ROUTES.requests} className="mt-4 inline-flex rounded-[13px] bg-[#854f19] px-4 py-2 font-bold text-white">
          Quay lại danh sách
        </Link>
      </section>
    )
  }

  const handleExportPdf = async () => {
    setIsExporting(true)
    try {
      await exportElementToPdf(pdfRef.current, `ban-ve-tho-${request.id}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleSaveQuotation = (quotationData) => {
    const quotation = createQuotationFromRequest(request, quotationData)
    setSavedQuotation(quotation)
    setRequest(getRequestById(request.id))
    setMessage("Đã lưu báo giá sơ bộ. Khi cần gửi cho khách hoặc tải PDF, vào menu Báo giá.")
    return quotation
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[18px] border border-[#ead8ca] bg-white p-6 text-left shadow-[0_18px_48px_rgba(82,68,58,0.08)]">
        <Link to={ROUTES.requests} className="text-[14px] font-bold text-[#854f19]">Quay lại danh sách</Link>
        <div className="mt-3 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#854f19]">{request.id}</p>
            <h2 className="mt-2 text-[30px] font-bold leading-tight text-[#231a11]">{request.productName}</h2>
            <p className="mt-2 text-[15px] text-[#52443a]">{request.customerName} · {request.area}</p>
          </div>
          <span className="h-fit rounded-full bg-[#fff1e8] px-3 py-1 text-[13px] font-bold text-[#854f19]">
            {requestStatusLabels[request.status]}
          </span>
        </div>
      </div>

      {message && (
        <p className="rounded-[14px] border border-[#ead8ca] bg-[#fff1e8] px-4 py-3 text-left text-[14px] font-bold text-[#854f19]">
          {message}
        </p>
      )}

      <InfoBlock
        title="Thông tin khách hàng"
        items={[
          { label: "Họ tên", value: request.customerName },
          { label: "Số điện thoại", value: request.phone },
          { label: "Email", value: request.email },
          { label: "Địa chỉ", value: request.address },
          { label: "Khu vực", value: request.area },
        ]}
      />

      <InfoBlock
        title="Nhu cầu sản phẩm"
        items={[
          { label: "Loại sản phẩm", value: request.productType },
          { label: "Mục đích", value: request.purpose },
          { label: "Không gian", value: request.space },
          { label: "Số người sử dụng", value: request.users },
          { label: "Độ bền", value: request.durability },
          { label: "Phong cách", value: request.style },
          { label: "Ngân sách", value: request.budget },
          { label: "Thời gian", value: request.expectedTime },
        ]}
      />

      <InfoBlock
        title="Thông số kỹ thuật"
        items={[
          { label: "Kích thước", value: request.dimensions },
          { label: "Vật liệu", value: request.material },
          { label: "Màu sắc", value: request.color },
          { label: "Số ngăn", value: request.compartments },
          { label: "Số cánh cửa", value: request.doors },
          { label: "Số ngăn kéo", value: request.drawers },
          { label: "Phụ kiện", value: request.accessories },
          { label: "Lắp đặt", value: request.install },
          { label: "Vận chuyển", value: request.shipping },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[16px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
          <div>
            <h3 className="text-[18px] font-bold text-[#231a11]">Preview PDF bản vẽ thô</h3>
            <p className="mt-1 text-[14px] text-[#52443a]">Kiểm tra bản PDF sẽ xuất trước khi tải file về máy.</p>
          </div>

          <div className="mt-4">
            <PdfPreview request={request} previewRef={pdfRef} />
          </div>

          <div className="mt-4 flex flex-col justify-between gap-3 rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] p-4 md:flex-row md:items-center">
            <div>
              <p className="font-bold text-[#231a11]">Đã xem preview</p>
              <p className="mt-1 text-[14px] text-[#52443a]">Nút bên phải sẽ xuất đúng nội dung trong khung preview A4 phía trên.</p>
            </div>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[13px] bg-[#854f19] px-4 text-[14px] font-bold text-white transition hover:bg-[#6f4114] disabled:cursor-wait disabled:opacity-70"
            >
              <Download size={17} />
              {isExporting ? "Đang xuất..." : "Xuất PDF"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {["Thông số sản phẩm.pdf", "Ảnh tham khảo.jpg"].map((file, index) => (
              <div key={file} className="rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] p-4">
                {index === 1 ? <FileImage className="text-[#854f19]" /> : <FileText className="text-[#854f19]" />}
                <p className="mt-3 font-bold text-[#231a11]">{file}</p>
                <p className="mt-1 text-[13px] text-[#52443a]">Tài liệu khách gửi</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <QuotationEntryPanel request={request} savedQuotation={savedQuotation} onSave={handleSaveQuotation} />
          {savedQuotation && (
            <div className="rounded-[13px] border border-[#ead8ca] bg-white p-4 text-left">
              <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#854f19]">Báo giá đã nhập</p>
              <p className="mt-2 text-[24px] font-black text-[#231a11]">{formatCurrency(savedQuotation.total)}</p>
              <p className="mt-1 text-[14px] text-[#52443a]">Đây là tổng tiền khách sẽ thấy khi xưởng gửi báo giá.</p>
              <p className="mt-3 rounded-[12px] bg-[#fff1e8] px-3 py-2 text-[13px] font-semibold text-[#854f19]">
                Báo giá sơ bộ này đã nằm trong menu Báo giá để gửi khách hoặc tải PDF khi cần.
              </p>
              <Link
                to={`${ROUTES.quotations}?requestId=${request.id}&quotationId=${savedQuotation.id}`}
                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-[13px] bg-[#854f19] px-3 text-[14px] font-bold text-white"
              >
                Mở báo giá
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default RequestDetailPage
