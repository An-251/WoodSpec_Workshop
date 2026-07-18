import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"

import { requestStatusLabels } from "@/data/mock/requests"
import { getQuotations, getRequests } from "@/stores/workshopStorage"

const filters = [
  { label: "Tất cả", value: "all" },
  { label: "Mới nhận", value: "new" },
  { label: "Cần thêm thông tin", value: "need_more_info" },
  { label: "Đang trao đổi", value: "discussing" },
  { label: "Chờ báo giá", value: "ready_to_quote" },
  { label: "Đã báo giá", value: "quoted" },
  { label: "Đã chốt", value: "accepted" },
]

function RequestsPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [requestList] = useState(() => getRequests())
  const [quotationList] = useState(() => getQuotations())

  const visibleRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return requestList.filter((request) => {
      const hasQuotation = quotationList.some((quotation) => quotation.requestId === request.id)
      const effectiveStatus = hasQuotation && request.status !== "accepted" ? "quoted" : request.status
      const matchesFilter = activeFilter === "all" || effectiveStatus === activeFilter
      const searchableText = [
        request.id,
        request.customerName,
        request.productType,
        request.productName,
        request.area,
        request.purpose,
      ]
        .join(" ")
        .toLowerCase()

      return matchesFilter && (!normalizedSearch || searchableText.includes(normalizedSearch))
    })
  }, [activeFilter, quotationList, requestList, search])

  return (
    <section className="space-y-5">
      <div className="rounded-[18px] border border-[#ead8ca] bg-white p-6 text-left shadow-[0_18px_48px_rgba(82,68,58,0.08)]">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#854f19]">Yêu cầu khách hàng</p>
        <h2 className="mt-2 text-[30px] font-bold leading-tight text-[#231a11]">Danh sách yêu cầu báo giá</h2>
        <p className="mt-2 text-[15px] text-[#52443a]">Xem nhu cầu, thông số và trạng thái xử lý của từng khách hàng.</p>
      </div>

      <div className="rounded-[18px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-full border px-3 py-1.5 text-[13px] font-bold ${
                  activeFilter === filter.value
                    ? "border-[#854f19] bg-[#fff1e8] text-[#854f19]"
                    : "border-[#ead8ca] text-[#52443a]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <label className="flex h-10 min-w-[260px] items-center gap-2 rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] px-3 text-[#52443a]">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
              placeholder="Tìm mã, khách hàng, sản phẩm"
            />
          </label>
        </div>

        <div className="mt-5 overflow-hidden rounded-[14px] border border-[#ead8ca]">
          {visibleRequests.map((item) => {
            const hasQuotation = quotationList.some((quotation) => quotation.requestId === item.id)
            const effectiveStatus = hasQuotation && item.status !== "accepted" ? "quoted" : item.status

            return (
              <div key={item.id} className="grid gap-4 border-b border-[#ead8ca] bg-white p-4 last:border-b-0 xl:grid-cols-[1fr_1fr_1fr_auto]">
                <div>
                  <p className="font-bold text-[#231a11]">{item.id}</p>
                  <p className="text-[14px] text-[#52443a]">{item.customerName}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#231a11]">{item.productType}</p>
                  <p className="text-[14px] text-[#52443a]">{item.purpose}</p>
                </div>
                <div>
                  <p className="text-[14px] text-[#52443a]">{item.area} · {item.sentAt}</p>
                  <p className="text-[14px] text-[#52443a]">{item.budget} · {item.expectedTime}</p>
                </div>
                <div className="flex items-center gap-3 xl:justify-end">
                  <span className="rounded-full bg-[#fff1e8] px-3 py-1 text-[12px] font-bold text-[#854f19]">
                    {requestStatusLabels[effectiveStatus]}
                  </span>
                  <Link to={`/requests/${item.id}`} className="rounded-[12px] bg-[#854f19] px-3 py-2 text-[13px] font-bold text-white">
                    Xem
                  </Link>
                </div>
              </div>
            )
          })}

          {visibleRequests.length === 0 && (
            <div className="bg-[#fffdf9] p-8 text-center text-[14px] font-semibold text-[#8a796b]">
              Không có yêu cầu phù hợp.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default RequestsPage
