import { useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, HelpCircle, LogOut, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import TestSessionTracker from "@/components/common/TestSessionTracker"
import { featureNavItems } from "@/config/navigation"
import { ROUTES } from "@/constants/routes"
import { endTestSession } from "@/services/testSessionService"
import { useAuthStore } from "@/stores/useAuthStore"

function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  async function handleLogout() {
    await endTestSession("logout")
    logout()
    navigate(ROUTES.login)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="grid min-h-screen transition-[grid-template-columns] duration-300"
        style={{
          gridTemplateColumns: isCollapsed ? "88px minmax(0, 1fr)" : "270px minmax(0, 1fr)",
        }}
      >
        <aside className="group/sidebar sticky top-0 flex h-screen min-h-0 flex-col border-r border-border bg-surface-subtle px-4 py-5">
          <div className="relative mb-7 flex items-center justify-between gap-2">
            <NavLink
              to={ROUTES.dashboard}
              className={`flex min-w-0 items-center overflow-hidden ${isCollapsed ? "justify-center" : "justify-start"}`}
            >
              <img src="/logo.png" alt="WoodSpec" className="size-11 shrink-0 rounded-md object-cover object-left" />
              <div className={`ml-3 min-w-0 transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                <span className="block text-xl font-bold leading-none text-foreground">WoodSpec</span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">Bảng điều phối xưởng</span>
              </div>
            </NavLink>
            <button
              type="button"
              aria-label={isCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
              className={`flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary shadow-gallery-sm transition duration-200 hover:border-primary/40 hover:bg-muted ${
                isCollapsed ? "absolute left-14 top-1 opacity-0 group-hover/sidebar:opacity-100" : ""
              }`}
              onClick={() => setIsCollapsed((current) => !current)}
            >
              {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <nav className="space-y-1">
              {featureNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg transition duration-200 ${
                      isActive ? "bg-card text-foreground shadow-gallery-sm" : "text-muted-foreground hover:bg-card hover:text-foreground"
                    } ${isCollapsed ? "mx-auto size-12 justify-center px-0 py-0" : "px-3 py-3"}`
                  }
                >
                  <item.icon className="size-5 shrink-0" />
                  <span className={`min-w-0 ${isCollapsed ? "sr-only" : ""}`}>
                    <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className={`mt-4 space-y-4 transition-all duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
            {!isCollapsed ? (
              <div className="rounded-lg border border-border bg-card p-4 shadow-gallery-sm">
                <p className="flex items-center gap-2 font-semibold text-foreground">
                  <HelpCircle className="size-4 text-primary" />
                  Lần đầu dùng?
                </p>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  Mỗi màn hình đều làm rõ bước tiếp theo. Cứ theo nút đang nổi bật.
                </p>
              </div>
            ) : null}

            <div className="rounded-lg border border-border bg-card p-4 shadow-gallery-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <UserRound className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{user?.email || user?.name || "Người dùng"}</p>
                  <p className="text-xs text-muted-foreground">Phiên đang ghi log</p>
                </div>
              </div>
              <Button type="button" variant="outline" className="mt-3 w-full" onClick={handleLogout}>
                <LogOut />
                Đăng xuất
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 lg:px-8">
          <TestSessionTracker />
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
