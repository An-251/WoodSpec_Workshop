import { useState } from "react"
import { LogIn, MailCheck } from "lucide-react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import { getAuth, startTestIdentity } from "@/services/authService"

const navItems = [
  ["Trang chủ", ROUTES.home],
  ["Bộ sưu tập", "/#collections"],
  ["Quy trình", "/#process"],
  ["Liên hệ", "/#contact"],
]

function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e8ddd2] bg-white/94 shadow-[0_8px_30px_rgba(36,29,22,0.04)] backdrop-blur">
      <div className="mx-auto flex h-[82px] max-w-[1500px] items-center justify-between px-6 lg:px-10">
        <Link to={ROUTES.home} className="grid size-12 place-items-center overflow-hidden bg-[#fbf8f3]">
          <img src="/logo.jpg" alt="WoodSpec" className="size-full object-contain" />
        </Link>

        <nav className="hidden items-center gap-12 text-[15px] font-bold text-[#2b2118] md:flex">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} className="border-b-2 border-transparent py-2 transition hover:border-[#854f19] hover:text-[#854f19]">
              {label}
            </a>
          ))}
        </nav>

        <Link to={ROUTES.login} className="text-[15px] font-bold text-[#2b2118]">
          Đăng nhập
        </Link>
      </div>
    </header>
  )
}

function PublicFooter() {
  return (
    <footer className="border-t border-[#e8ddd2] bg-white">
      <div className="mx-auto flex min-h-24 max-w-[1500px] flex-col items-center justify-between gap-5 px-6 py-6 text-[14px] text-[#6a5b4f] md:flex-row lg:px-10">
        <img src="/logo.jpg" alt="WoodSpec" className="size-10 object-contain" />
        <p>2024 WoodSpec. Thiết kế cho báo giá rõ ràng.</p>
        <div className="flex gap-8">
          <a href="/#home">Giới thiệu</a>
          <a href="/#process">Hỗ trợ</a>
          <a href="/#contact">Điều khoản</a>
        </div>
      </div>
    </footer>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [testerEmail, setTesterEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const from = location.state?.from?.pathname || ROUTES.dashboard

  if (getAuth()) {
    return <Navigate to={from} replace />
  }

  const handleStartSession = (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    window.setTimeout(() => {
      const result = startTestIdentity(testerEmail)
      setLoading(false)

      if (!result.ok) {
        setError(result.message)
        return
      }

      navigate(from, { replace: true })
    }, 250)
  }

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#241d16]">
      <PublicHeader />

      <main className="grid min-h-[calc(100vh-178px)] place-items-center px-5 py-16">
        <div className="w-full max-w-[560px] rounded-[18px] border border-[#e0d2c4] bg-white p-10 text-left shadow-[0_24px_80px_rgba(133,79,25,0.10)]">
          <div className="flex items-center gap-3">
            <LogIn className="size-7 text-[#854f19]" />
            <h1 className="text-[30px] font-black leading-tight text-[#241d16]">Bắt đầu phiên test</h1>
          </div>

          <p className="mt-5 max-w-[450px] text-[16px] leading-7 text-[#6a5b4f]">
            Nhập email để định danh người test. Hệ thống sẽ bắt đầu ghi log thao tác và đưa bạn vào khu vực xưởng.
          </p>

          <div className="my-8 h-px bg-[#e8ddd2]" />

          <form onSubmit={handleStartSession} className="rounded-[16px] border border-[#ead8ca] bg-[#fffdf9] p-5">
            <div className="flex items-center gap-2">
              <MailCheck size={19} className="text-[#854f19]" />
              <h2 className="font-bold text-[#231a11]">Email định danh tester</h2>
            </div>
            <label className="mt-4 block">
              <span className="text-[14px] font-bold text-[#52443a]">Email</span>
              <input
                value={testerEmail}
                onChange={(event) => setTesterEmail(event.target.value)}
                className="mt-2 h-11 w-full rounded-[14px] border border-[#d8c8b8] bg-white px-4 text-[16px] text-[#241d16] outline-none transition focus:border-[#854f19] focus:ring-3 focus:ring-[#854f19]/15 disabled:bg-[#f5eee6] disabled:text-[#8a796b]"
                placeholder="ten@example.com"
                autoComplete="email"
              />
            </label>

            {error && (
              <p className="mt-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 h-12 w-full rounded-[14px] bg-[#854f19] px-4 text-[16px] font-bold text-white shadow-[0_14px_28px_rgba(133,79,25,0.24)] transition hover:bg-[#6f4114] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang bắt đầu..." : "Bắt đầu test"}
            </button>
          </form>

          <p className="mt-7 text-center text-[15px] text-[#6a5b4f]">
            Quay lại{" "}
            <Link to={ROUTES.home} className="font-semibold text-[#6f4114] underline underline-offset-4">
              trang chủ
            </Link>
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

export default LoginPage
