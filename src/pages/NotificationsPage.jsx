import { useState } from "react"
import { Link } from "react-router-dom"
import { Bell, CheckCheck } from "lucide-react"

import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/stores/workshopStorage"

function NotificationsPage() {
  const [notificationList, setNotificationList] = useState(() => getNotifications())

  const handleMarkAllRead = () => {
    setNotificationList(markAllNotificationsRead())
  }

  const handleRead = (notificationId) => {
    setNotificationList(markNotificationRead(notificationId))
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[18px] border border-[#ead8ca] bg-white p-6 text-left shadow-[0_18px_48px_rgba(82,68,58,0.08)]">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#854f19]">Thông báo</p>
        <div className="mt-2 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="text-[30px] font-bold leading-tight text-[#231a11]">Thông báo mới từ khách hàng</h2>
            <p className="mt-2 text-[15px] text-[#52443a]">Theo dõi yêu cầu mới, phản hồi tin nhắn và thay đổi trạng thái báo giá.</p>
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#ead8ca] bg-white px-4 font-bold text-[#854f19]"
          >
            <CheckCheck size={17} />
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notificationList.map((item) => (
          <article key={item.id} className="flex gap-4 rounded-[16px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
            <div className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[#fff1e8] text-[#854f19]">
              <Bell size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-[#231a11]">{item.title}</h3>
                {item.unread && <span className="rounded-full bg-[#854f19] px-2 py-0.5 text-[11px] font-bold text-white">Chưa đọc</span>}
              </div>
              <p className="mt-1 text-[14px] text-[#52443a]">{item.content}</p>
              <p className="mt-2 text-[12px] text-[#8a796b]">{item.time}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={item.target}
                  onClick={() => handleRead(item.id)}
                  className="rounded-[12px] bg-[#854f19] px-3 py-2 text-[13px] font-bold text-white"
                >
                  Mở
                </Link>
                {item.unread && (
                  <button
                    type="button"
                    onClick={() => handleRead(item.id)}
                    className="rounded-[12px] border border-[#ead8ca] px-3 py-2 text-[13px] font-bold text-[#52443a]"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default NotificationsPage
