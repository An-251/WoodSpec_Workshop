import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LogIn, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROUTES } from "@/constants/routes"
import { notify } from "@/features/notifications/utils/notify"
import { beginTestSession } from "@/services/testSessionService"
import { useAuthStore } from "@/stores/useAuthStore"

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginCustomer = useAuthStore((state) => state.loginCustomer)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmail(normalizedEmail)) {
      setError("Vui lòng nhập email hợp lệ để bắt đầu lưu phiên khảo sát.")
      notify.authLoginError()
      return
    }

    setIsSubmitting(true)
    const session = await beginTestSession(normalizedEmail)
    loginCustomer({
      email: normalizedEmail,
      sessionId: session.sessionId,
      loginAt: session.loginAt,
    })
    notify.authLoginSuccess()
    navigate(location.state?.from || ROUTES.dashboard, { replace: true })
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12 text-left">
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-6 border-b border-[#e5e5e5] pb-5">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-normal text-[#0a0a0a]">
            <LogIn className="size-5 text-[#6f665c]" />
            Bắt đầu phiên khảo sát
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#525252]">
            Nhập email để WoodSpec ghi lại luồng thao tác trong quá trình bạn trải nghiệm ứng dụng.
          </p>
        </div>

        <div className="mb-5 rounded-lg bg-[#f7f7f5] p-4 text-sm leading-6 text-[#525252]">
          Không cần tài khoản hoặc mật khẩu. Email chỉ dùng để nhóm dữ liệu tương tác theo từng người khảo sát.
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email khảo sát</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#525252]" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError("")
                }}
                placeholder="ten@example.com"
                className="pl-10"
                autoComplete="email"
              />
            </div>
          </div>
          {error ? <p className="text-sm text-[#ba1a1a]">{error}</p> : null}
          <Button type="submit" className="w-full bg-[#0a0a0a] hover:bg-[#262626]" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Đang bắt đầu..." : "Bắt đầu lưu log"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-[#525252]">
          Quay lại{" "}
          <Link className="font-medium text-[#6f665c] underline" to={ROUTES.home}>
            trang chủ
          </Link>
        </p>
      </div>
    </section>
  )
}

export default LoginPage
