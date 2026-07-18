import { NavLink, useNavigate } from "react-router-dom"
import {
  Activity,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PackageCheck,
  Store,
  UserRound,
  X,
} from "lucide-react"

import { NAV_GROUPS, ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"
import { getAuth, logout } from "@/services/authService"

const icons = {
  activity: Activity,
  dashboard: LayoutDashboard,
  inbox: Inbox,
  fileText: FileText,
  orders: PackageCheck,
  message: MessageSquare,
  bell: Bell,
  store: Store,
}

function BrandMark() {
  return (
    <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-white shadow-[0_10px_28px_rgba(133,79,25,0.12)] ring-1 ring-[#ead8ca]">
      <img src="/logo.jpg" alt="WoodSpec" className="size-full object-contain" />
    </div>
  )
}

function Sidebar({ collapsed, mobileOpen = false, onCloseMobile, onToggle }) {
  const navigate = useNavigate()
  const auth = getAuth()
  const accountName = auth?.testMode ? auth.email : "Xưởng gỗ WoodSpec"
  const accountLabel = auth?.testMode ? "Phiên test" : "Tài khoản xưởng"

  const handleLogout = () => {
    logout()
    onCloseMobile?.()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[286px] max-w-[86vw] flex-col border-r border-[#ead8ca] bg-[#fff8f5] shadow-[12px_0_32px_rgba(82,68,58,0.08)] transition-transform duration-300 ease-out lg:z-30 lg:max-w-none lg:transition-[width]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        collapsed ? "lg:w-[76px]" : "lg:w-[280px]",
      )}
    >
      <div className={cn("flex items-center gap-3 px-5 pb-6 pt-7", collapsed && "lg:justify-center lg:px-3")}>
        <BrandMark />
        {(!collapsed || mobileOpen) && (
          <div className="min-w-0 text-left">
            <p className="truncate text-[18px] font-bold leading-5 text-[#231a11]">WoodSpec</p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#854f19]">Xưởng gỗ</p>
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label="Đóng menu"
        onClick={onCloseMobile}
        className="absolute right-4 top-7 grid size-9 place-items-center rounded-[13px] border border-[#ead8ca] bg-white text-[#854f19] shadow-[0_8px_20px_rgba(82,68,58,0.10)] lg:hidden"
      >
        <X size={18} />
      </button>

      <button
        type="button"
        aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
        onClick={onToggle}
        className="absolute -right-4 top-8 hidden size-8 place-items-center rounded-full border border-[#ead8ca] bg-white text-[#854f19] shadow-[0_8px_20px_rgba(82,68,58,0.12)] transition hover:bg-[#fff1e8] lg:grid"
      >
        {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
      </button>

      <nav className={cn("flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-2", collapsed && "lg:items-center lg:px-3")}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className={cn("w-full", collapsed && "lg:flex lg:flex-col lg:items-center")}>
            {(!collapsed || mobileOpen) && (
              <p className="mb-2 px-3 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a796b]">
                {group.label}
              </p>
            )}

            <div className="flex flex-col gap-2">
              {group.items.map((item) => {
                const Icon = icons[item.icon]

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed && !mobileOpen ? item.label : undefined}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex h-12 items-center rounded-[14px] text-[15px] font-semibold transition-all",
                        collapsed ? "w-full gap-3 px-4 lg:w-12 lg:justify-center lg:px-0" : "w-full gap-3 px-4",
                        isActive
                          ? "bg-[#854f19] text-white shadow-[0_12px_22px_rgba(133,79,25,0.28)]"
                          : "text-[#52443a] hover:bg-[#fff1e8] hover:text-[#231a11]",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={20}
                          strokeWidth={isActive ? 2.35 : 2}
                          className={cn(
                            "shrink-0",
                            isActive ? "text-white" : "text-[#52443a] group-hover:text-[#854f19]",
                          )}
                        />
                        {(!collapsed || mobileOpen) && <span className="truncate lg:hidden">{item.label}</span>}
                        {!collapsed && <span className="hidden truncate lg:inline">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn("px-4 pb-6", collapsed && "lg:px-3")}>
        <div
          className={cn(
            "border border-[#ead8ca] bg-white/78 shadow-[0_12px_26px_rgba(82,68,58,0.08)] backdrop-blur",
            collapsed ? "rounded-[16px] p-3 lg:rounded-[22px] lg:p-2" : "rounded-[16px] p-3",
          )}
        >
          <div className={cn("flex items-center gap-3", collapsed && "lg:justify-center")}>
            <div className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-[#ffe2a9] text-[#854f19]">
              <UserRound size={19} />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0 text-left">
                <p className="truncate text-[14px] font-bold text-[#231a11]">{accountName}</p>
                <p className="truncate text-[12px] text-[#7b6b5d]">{accountLabel}</p>
              </div>
            )}
          </div>

          <button
            type="button"
            title={collapsed && !mobileOpen ? "Đăng xuất" : undefined}
            onClick={handleLogout}
            className={cn(
              "mt-3 flex h-10 items-center justify-center rounded-[13px] border border-[#ead8ca] bg-white text-[13px] font-semibold text-[#52443a] transition hover:border-[#854f19] hover:bg-[#fff1e8] hover:text-[#854f19]",
              collapsed ? "w-full gap-2 lg:w-10 lg:gap-0" : "w-full gap-2",
            )}
          >
            <LogOut size={17} />
            {(!collapsed || mobileOpen) && <span className="lg:hidden">Đăng xuất</span>}
            {!collapsed && <span className="hidden lg:inline">Đăng xuất</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
