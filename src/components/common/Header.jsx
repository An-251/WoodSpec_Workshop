import { Bell, LogOut, Search } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { NAV_ITEMS, ROUTES } from "@/constants/routes"
import { notifications } from "@/data/mock/notifications"
import { logout } from "@/services/authService"

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPage = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))
  const unreadCount = notifications.filter((item) => item.unread).length

  const handleLogout = () => {
    logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#ead8ca]/80 bg-[#fff8f5]/86 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-5 md:px-7">
        <div className="min-w-0 text-left">
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#854f19]">
            WoodSpec / {currentPage?.label || "Xưởng gỗ"}
          </p>
          <h1 className="truncate text-[20px] font-bold leading-7 text-[#231a11]">
            Xưởng gỗ WoodSpec
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <label className="hidden h-10 w-[260px] items-center gap-2 rounded-[14px] border border-[#ead8ca] bg-white px-3 text-[#52443a] lg:flex">
            <Search size={17} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-[14px] outline-none placeholder:text-[#8a796b]"
              placeholder="Tìm yêu cầu, báo giá..."
            />
          </label>

          <Link
            to={ROUTES.notifications}
            aria-label="Thông báo"
            className="relative grid size-10 place-items-center rounded-[14px] border border-[#ead8ca] bg-white text-[#52443a] transition hover:bg-[#fff1e8] hover:text-[#854f19]"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#854f19] text-[11px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden h-10 items-center gap-2 rounded-[14px] border border-[#ead8ca] bg-white px-3 text-[13px] font-semibold text-[#52443a] transition hover:bg-[#fff1e8] hover:text-[#854f19] md:flex"
          >
            <LogOut size={17} />
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
