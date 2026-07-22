import { MessageSquare, Send } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { StatusPill } from "./WorkshopUI"

export default function CustomerChatDialog({ isOpen, onOpenChange, request }) {
  const [draftMessage, setDraftMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: "customer-brief",
      role: "customer",
      text: request?.notes || "Khách muốn xưởng tư vấn thêm trước khi báo giá.",
      time: "Khách gửi trong brief",
    },
    {
      id: "workshop-template",
      role: "workshop",
      text: "Chào anh/chị, xưởng đã nhận brief. Em sẽ rà lại bản vẽ và hỏi thêm nếu cần trước khi gửi báo giá.",
      time: "Tin nhắn mẫu",
    },
  ])

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-6 gap-0">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                <MessageSquare className="size-5 text-primary" />
                Hỏi khách hàng: {request?.customer}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Trao đổi nhanh để làm rõ vật liệu, kích thước, thời gian hoặc điều kiện lắp đặt trước khi báo giá.
              </DialogDescription>
            </div>
            <StatusPill tone="muted">Hội thoại MVP</StatusPill>
          </div>
        </DialogHeader>

        {/* Message history */}
        <div className="flex-1 my-4 max-h-[40vh] min-h-[250px] space-y-3 overflow-y-auto rounded-lg border border-border bg-surface-elevated p-4">
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
                  <p className={`mt-2 text-[11px] ${isWorkshop ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Templates suggestions */}
        <div className="flex flex-wrap gap-2 mb-4">
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

        {/* Input form */}
        <form onSubmit={sendMessage} className="flex flex-col gap-3 sm:flex-row pt-4 border-t border-border">
          <input
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
            className="h-11 min-w-0 flex-1 rounded-full border border-input bg-card px-4 text-foreground outline-none transition duration-200 placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/30"
            placeholder="Nhập câu hỏi gửi khách..."
            autoFocus
          />
          <Button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-gallery-sm transition duration-200 hover:bg-foreground"
          >
            Gửi tin
            <Send className="size-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
