import { Download, FileText, MessageSquare, Send, ShieldCheck, ZoomIn } from "lucide-react"
import { useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import { getOpenRequest } from "@/data/reference/workshopFlow"
import { FieldGrid, StatusPill, WorkflowSteps, WorkshopCard, WorkshopPageHeader } from "@/features/workshop/components/WorkshopUI"

function WorkshopRequestDetailPage() {
  const { requestId } = useParams()
  const request = getOpenRequest(requestId)
  const chatRef = useRef(null)
  const [draftMessage, setDraftMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: "customer-brief",
      role: "customer",
      text: request.notes || "Khách muốn xưởng tư vấn thêm trước khi báo giá.",
      time: "Khách gửi trong brief",
    },
    {
      id: "workshop-template",
      role: "workshop",
      text: "Chào anh/chị, xưởng đã nhận brief. Em sẽ rà lại bản vẽ và hỏi thêm nếu cần trước khi gửi báo giá.",
      time: "Tin nhắn mẫu",
    },
  ])

  function openCustomerChat() {
    chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function sendMessage(event) {
    event.preventDefault()
    const text = draftMessage.trim()

    if (!text) return

    setMessages((current) => [
      ...current,
      {
        id: `workshop-${Date.now()}`,
        role: "workshop",
        text,
        time: "Vừa gửi",
      },
    ])
    setDraftMessage("")
  }

  return (
    <div className="space-y-8">
      <WorkshopPageHeader
        title={request.customer}
        subtitle={`${request.item} · ${request.reference} · Phân phối ${request.distributedAt}`}
        backTo={ROUTES.workshopRequests}
        backLabel="Tất cả yêu cầu"
      />

      <WorkflowSteps activeIndex={0} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <WorkshopCard className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Quyết định của xưởng</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground">Bạn có muốn báo giá dự án này không?</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Xem các phần bên dưới. Khi sẵn sàng, hãy gửi báo giá sơ bộ để khách so sánh với các xưởng đã xác minh khác.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={ROUTES.workshopQuotation(request.id)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-gallery-sm transition duration-200 hover:bg-foreground"
              >
                <FileText className="size-4" />
                Báo giá
              </Link>
              <button
                type="button"
                onClick={openCustomerChat}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 font-medium text-foreground transition duration-200 hover:border-primary/35 hover:bg-muted"
              >
                <MessageSquare className="size-4" />
                Hỏi khách
              </button>
            </div>
          </WorkshopCard>

          <WorkshopCard className="p-6" ref={chatRef}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold text-foreground">
                  <MessageSquare className="size-5 text-primary" />
                  Hỏi khách
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Trao đổi nhanh để làm rõ vật liệu, kích thước, thời gian hoặc điều kiện lắp đặt trước khi báo giá.
                </p>
              </div>
              <StatusPill tone="muted">Hội thoại MVP</StatusPill>
            </div>

            <div className="mt-5 max-h-80 space-y-3 overflow-y-auto rounded-lg border border-border bg-surface-elevated p-4">
              {messages.map((message) => {
                const isWorkshop = message.role === "workshop"

                return (
                  <div key={message.id} className={`flex ${isWorkshop ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[78%] rounded-lg px-4 py-3 text-sm shadow-gallery-sm ${
                        isWorkshop ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground"
                      }`}
                    >
                      <p className="leading-6">{message.text}</p>
                      <p className={`mt-2 text-[11px] ${isWorkshop ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{message.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Anh/chị cho em xin ảnh vị trí lắp đặt được không?",
                "Anh/chị ưu tiên vật liệu hay ngân sách hơn?",
                "Thời gian bàn giao mong muốn là ngày nào?",
              ].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => setDraftMessage(template)}
                  className="rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition duration-200 hover:border-primary/35 hover:text-foreground"
                >
                  {template}
                </button>
              ))}
            </div>

            <form onSubmit={sendMessage} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                className="h-11 min-w-0 flex-1 rounded-full border border-input bg-card px-4 text-foreground outline-none transition duration-200 placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/30"
                placeholder="Nhập câu hỏi gửi khách..."
              />
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-gallery-sm transition duration-200 hover:bg-foreground"
              >
                Gửi tin
                <Send className="size-4" />
              </button>
            </form>
          </WorkshopCard>

          <WorkshopCard className="p-6">
            <h3 className="text-xl font-bold text-foreground">1. Tóm tắt khách hàng</h3>
            <p className="mt-1 text-sm text-muted-foreground">Nhu cầu khách mô tả bằng lời của họ.</p>
            <blockquote className="mt-4 text-lg text-muted-foreground">"{request.summary}"</blockquote>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {[
                ["Ngân sách", request.budget],
                ["Cần trước", request.deadline],
                ["Ưu tiên", request.priority],
                ["Số lượng", request.quantity],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-border bg-surface-elevated p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-md border border-border bg-surface-elevated p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ghi chú khách hàng</p>
              <p className="mt-2 text-foreground">{request.notes}</p>
            </div>
          </WorkshopCard>

          <WorkshopCard className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">2. Bản vẽ kỹ thuật</h3>
                <p className="mt-1 text-sm text-muted-foreground">Tài liệu quan trọng nhất để lập báo giá.</p>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm transition duration-200 hover:border-primary/35 hover:bg-muted">
                  <ZoomIn className="size-4" />
                  Phóng to
                </button>
                <button className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm transition duration-200 hover:border-primary/35 hover:bg-muted">
                  <Download className="size-4" />
                  Tải xuống
                </button>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-border bg-[#cfe1e8]">
              <svg viewBox="0 0 900 330" className="h-[260px] w-full">
                <rect width="900" height="330" fill="#cfe1e8" />
                <path d="M140 95h620l-42 44H182z" fill="#f2e8dc" stroke="#bfa990" strokeWidth="5" />
                <path d="M185 139h34v155h-34zM686 139h34v155h-34zM292 139h22v115h-22zM590 139h22v115h-22z" fill="#d9d1c7" />
                <path d="M230 188h430v18H230z" fill="#aeb5b6" />
                <path d="M180 294h45M682 294h45" stroke="#737373" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {request.dimensions.split(" x ").map((part, index) => (
                <StatusPill key={part} tone="muted">
                  {["Dài", "Rộng", "Cao"][index]} {part}
                </StatusPill>
              ))}
            </div>
          </WorkshopCard>

          <WorkshopCard className="p-6">
            <h3 className="text-xl font-bold text-foreground">3. Bối cảnh lắp đặt</h3>
            <p className="mt-1 text-sm text-muted-foreground">Hiểu không gian trước khi báo giá.</p>
            <div className="mt-4">
              <FieldGrid items={request.installContext} />
            </div>
            <div className="mt-4 rounded-md border border-warning/30 bg-warning/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-warning">Lưu ý lắp đặt</p>
              <p className="mt-2">{request.installationNotes}</p>
            </div>
          </WorkshopCard>

          <WorkshopCard className="p-6">
            <h3 className="text-xl font-bold text-foreground">4. Bảng thông số</h3>
            <div className="mt-4 divide-y divide-border">
              {request.specification.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-right font-medium">{value}</span>
                </div>
              ))}
            </div>
          </WorkshopCard>
        </div>

        <aside className="space-y-4">
          <WorkshopCard className="p-5">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="size-4" />
              Yêu cầu mở
            </p>
            <p className="text-sm leading-6">
              Yêu cầu này được phân phối đến <strong>14 xưởng đã xác minh</strong>. Khách sẽ chọn một xưởng sau khi so sánh báo giá.
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Báo giá đã gửi</dt>
                <dd className="font-semibold">{request.quotesSubmitted}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Dự kiến quyết định</dt>
                <dd className="font-semibold">{request.decisionExpected}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Trạng thái</dt>
                <dd><StatusPill tone={request.statusTone}>{request.status}</StatusPill></dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Mã</dt>
                <dd className="font-semibold">{request.reference}</dd>
              </div>
            </dl>
          </WorkshopCard>

          <WorkshopCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Khách hàng</p>
            <p className="mt-4 font-semibold text-foreground">{request.customer}</p>
            <p className="mt-1 text-sm text-muted-foreground">Danh tính đã xác minh bởi WoodSpec.</p>
            <p className="mt-4 text-sm text-muted-foreground">Thông tin liên hệ trực tiếp chỉ được chia sẻ sau khi khách chọn xưởng của bạn.</p>
          </WorkshopCard>
        </aside>
      </div>
    </div>
  )
}

export default WorkshopRequestDetailPage
