import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Menu } from "lucide-react"

import Sidebar from "@/components/common/Sidebar"
import { cn } from "@/lib/utils"

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#231a11]">
      <button
        type="button"
        aria-label="Mở menu"
        onClick={() => setMobileMenuOpen(true)}
        className="fixed left-4 top-4 z-40 grid size-11 place-items-center rounded-[14px] border border-[#ead8ca] bg-white text-[#854f19] shadow-[0_10px_24px_rgba(82,68,58,0.14)] lg:hidden"
      >
        <Menu size={21} />
      </button>

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-[#231a11]/42 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onToggle={() => setCollapsed((value) => !value)}
      />

      <div
        className={cn(
          "min-h-screen transition-[padding-left] duration-300 ease-out",
          "pl-0 lg:pl-[280px]",
          collapsed && "lg:pl-[76px]",
        )}
      >
        <main className="mx-auto w-full max-w-[1280px] px-4 pb-5 pt-20 md:px-7 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
