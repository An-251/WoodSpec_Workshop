import { Link, useRouteError } from "react-router-dom"
import { AlertTriangle, Home, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"

function ErrorPage() {
  const error = useRouteError()
  const message = error?.message || "Ứng dụng gặp lỗi khi hiển thị trang này."

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-12 lg:px-10">
      <div className="w-full rounded-xl border border-[#ead8ca] bg-white p-8 text-left shadow-[0_8px_30px_rgba(43,33,24,0.08)]">
        <div className="flex size-12 items-center justify-center rounded-lg bg-[#fff7e6] text-[#b7791f]">
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-normal text-[#231a11]">
          Có lỗi khi mở trang
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#52443a]">
          WoodSpec chưa thể hiển thị nội dung này. Bạn có thể quay lại trang chủ hoặc đăng nhập để tiếp tục.
        </p>
        <div className="mt-5 rounded-lg border border-[#ead8ca] bg-[#fff8f5] p-4 text-sm text-[#735b2d]">
          {message}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={ROUTES.login}>
            <Button className="bg-[#854f19] hover:bg-[#7a4a22]">
              <LogIn />
              Đăng nhập
            </Button>
          </Link>
          <Link to={ROUTES.home}>
            <Button variant="outline" className="border-[#d7c3b5] bg-white text-[#854f19]">
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
