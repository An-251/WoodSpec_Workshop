import { useEffect } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"

import { publicNavItems } from "@/config/navigation"
import { ROUTES } from "@/constants/routes"
import { useActiveSection } from "@/hooks/useActiveSection"

const sectionIds = publicNavItems.map((item) => item.sectionId)

function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeSection = useActiveSection(sectionIds)

  useEffect(() => {
    if (location.pathname !== ROUTES.home || !location.hash) {
      return
    }

    const sectionId = location.hash.replace("#", "")
    const timeoutId = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 80)

    return () => window.clearTimeout(timeoutId)
  }, [location.hash, location.pathname])

  function handleNavClick(event, item) {
    if (location.pathname !== ROUTES.home) {
      event.preventDefault()
      navigate(item.path)
      return
    }

    event.preventDefault()
    document.getElementById(item.sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
    window.history.replaceState(null, "", item.path)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="h-8 bg-primary" />
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-10">
          <NavLink to={ROUTES.home} className="flex items-center gap-3">
            <img src="/logo.png" alt="WoodSpec" className="h-10 w-auto object-contain" />
          </NavLink>

          <nav className="hidden items-center gap-8 text-xs font-semibold text-muted-foreground md:flex">
            {publicNavItems.map((item) => {
              const isActive = activeSection === item.sectionId

              return (
                <a
                  key={item.sectionId}
                  href={item.path}
                  onClick={(event) => handleNavClick(event, item)}
                  className={`relative px-1 py-2 transition-colors duration-200 ${isActive ? "text-primary" : "hover:text-primary"}`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-px origin-left rounded-full bg-primary transition-transform duration-200 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              )
            })}
          </nav>

          <div className="flex items-center gap-3 text-sm font-semibold">
            <NavLink to={ROUTES.login} className="text-xs text-foreground transition-colors duration-200 hover:text-primary">
              Đăng nhập
            </NavLink>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <img src="/logo.png" alt="WoodSpec" className="h-8 w-auto object-contain" />
          <p>2024 WoodSpec. Thiết kế cho báo giá rõ ràng.</p>
          <div className="flex gap-5">
            <span>Giới thiệu</span>
            <span>Hỗ trợ</span>
            <span>Điều khoản</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
