import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"

function NotFoundPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-4 px-4 py-12 text-left lg:px-10">
      <h1 className="text-3xl font-semibold tracking-normal text-[#0a0a0a]">
        Không tìm thấy trang
      </h1>
      <p className="text-[#525252]">Trang này không tồn tại hoặc đã được di chuyển.</p>
      <div className="flex flex-wrap gap-3">
        <Link to={ROUTES.home}>
          <Button className="bg-[#0a0a0a] hover:bg-[#262626]">Về trang chủ</Button>
        </Link>
        <Link to={ROUTES.login}>
          <Button variant="outline" className="border-[#d4d4d4] bg-white text-[#6f665c]">
            Đăng nhập
          </Button>
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
