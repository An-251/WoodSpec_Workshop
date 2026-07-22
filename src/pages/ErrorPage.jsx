import { Link, useRouteError } from "react-router-dom"
import { AlertTriangle, Home, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"

function ErrorPage() {
  const error = useRouteError()
  const message = error?.message || "Ứng dụng gặp lỗi khi hiển thị trang này."

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-12 lg:px-10">
      <div className="w-full rounded-xl border border-[#e5e5e5] bg-white p-8 text-left shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
        <div className="flex size-12 items-center justify-center rounded-lg bg-[#f7f7f5] text-[#6f665c]">
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-normal text-[#0a0a0a]">
          Có lỗi khi mở trang
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#525252]">
          WoodSpec chưa thể hiển thị nội dung này. Bạn có thể quay lại trang chủ hoặc đăng nhập để tiếp tục.
        </p>
        <div className="mt-5 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4 text-sm text-[#525252]">
          {message}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={ROUTES.login}>
            <Button className="bg-[#0a0a0a] hover:bg-[#262626]">
              <LogIn />
              Đăng nhập
            </Button>
          </Link>
          <Link to={ROUTES.home}>
            <Button variant="outline" className="border-[#d4d4d4] bg-white text-[#6f665c]">
              <Home />
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ErrorPage
