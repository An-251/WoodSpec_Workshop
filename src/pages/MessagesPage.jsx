import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { FileText, Send } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import { addMessage, getConversations, getQuotationByRequestId } from "@/stores/workshopStorage"

function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const routeRequestId = searchParams.get("requestId")
  const sourceQuotationId = searchParams.get("quotationId")
  const [conversationList, setConversationList] = useState(() => getConversations())
  const [activeRequestId, setActiveRequestId] = useState(() => routeRequestId || getConversations()[0]?.requestId || "")
  const [draftMessage, setDraftMessage] = useState("")

  const activeConversation = useMemo(
    () => conversationList.find((conversation) => conversation.requestId === activeRequestId) || conversationList[0],
    [activeRequestId, conversationList],
  )
  const activeQuotation = activeConversation ? getQuotationByRequestId(activeConversation.requestId) : null

  useEffect(() => {
    if (routeRequestId && routeRequestId !== activeRequestId) setActiveRequestId(routeRequestId)
  }, [activeRequestId, routeRequestId])

  const handleSubmit = (event) => {
    event.preventDefault()
    const content = draftMessage.trim()
    if (!content || !activeConversation) return

    addMessage(activeConversation.requestId, { content })
    setConversationList(getConversations())
    setDraftMessage("")
  }

  const handleSelectConversation = (requestId) => {
    setActiveRequestId(requestId)
    setSearchParams({
      requestId,
      ...(sourceQuotationId ? { quotationId: sourceQuotationId } : {}),
    })
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[18px] border border-[#ead8ca] bg-white p-6 text-left shadow-[0_18px_48px_rgba(82,68,58,0.08)]">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#854f19]">Trao đổi</p>
        <h2 className="mt-2 text-[30px] font-bold leading-tight text-[#231a11]">Trao đổi với khách hàng</h2>
        <p className="mt-2 text-[15px] text-[#52443a]">Tin nhắn được lưu bằng LocalStorage để mô phỏng quy trình phản hồi khách hàng.</p>
      </div>

      <div className="grid min-h-[560px] overflow-hidden rounded-[18px] border border-[#ead8ca] bg-white text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)] lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-[#ead8ca] bg-[#fffdf9] p-4 lg:border-b-0 lg:border-r">
          <div className="space-y-3">
            {conversationList.map((item) => (
              <button
                key={item.requestId}
                type="button"
                onClick={() => handleSelectConversation(item.requestId)}
                className={`w-full rounded-[14px] border p-4 text-left ${
                  item.requestId === activeConversation?.requestId ? "border-[#854f19] bg-[#fff1e8]" : "border-[#ead8ca] bg-white"
                }`}
              >
                <p className="font-bold text-[#231a11]">{item.customerName}</p>
                <p className="mt-1 text-[14px] text-[#52443a]">{item.product}</p>
                <p className="mt-2 text-[12px] font-bold text-[#8a796b]">{item.messages.length} tin nhắn</p>
              </button>
            ))}
          </div>
        </aside>

        {activeConversation ? (
          <div className="flex min-h-0 flex-col">
            <div className="border-b border-[#ead8ca] p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="font-bold text-[#231a11]">{activeConversation.customerName}</p>
                  <p className="text-[14px] text-[#52443a]">{activeConversation.requestId} · {activeConversation.product}</p>
                </div>
                <Link
                  to={`${ROUTES.quotations}?requestId=${activeConversation.requestId}${activeQuotation?.id ? `&quotationId=${activeQuotation.id}` : sourceQuotationId ? `&quotationId=${sourceQuotationId}` : ""}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[13px] border border-[#ead8ca] bg-white px-4 text-[14px] font-bold text-[#854f19] hover:bg-[#fff1e8]"
                >
                  <FileText size={17} />
                  Quay lại báo giá
                </Link>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-[#fff8f5] p-5">
              {activeConversation.messages.map((message) => (
                <div
                  key={`${message.time}-${message.content}`}
                  className={`max-w-[720px] rounded-[16px] p-4 ${
                    message.from === "workshop"
                      ? "ml-auto bg-[#854f19] text-white"
                      : "bg-white text-[#231a11] ring-1 ring-[#ead8ca]"
                  }`}
                >
                  <p className="text-[14px] leading-6">{message.content}</p>
                  <p className={`mt-2 text-[12px] ${message.from === "workshop" ? "text-white/75" : "text-[#8a796b]"}`}>{message.time}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-3 border-t border-[#ead8ca] bg-white p-4">
              <input
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                className="h-11 min-w-0 flex-1 rounded-[14px] border border-[#ead8ca] px-4 outline-none focus:border-[#854f19]"
                placeholder="Nhập nội dung trao đổi"
              />
              <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#854f19] px-4 font-bold text-white">
                <Send size={17} />
                Gửi
              </button>
            </form>
          </div>
        ) : (
          <div className="grid place-items-center p-8 text-center text-[#8a796b]">Chưa có cuộc trao đổi.</div>
        )}
      </div>
    </section>
  )
}

export default MessagesPage
