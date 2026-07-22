import { Link } from "react-router-dom"
import { UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"

function RegisterPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-10 text-left">
      <div className="rounded-xl border border-[#ead8ca] bg-white p-8 shadow-[0_4px_20px_rgba(43,33,24,0.08)]">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-normal text-[#231a11]">
          <UserPlus className="size-5 text-[#854f19]" />
          Bắt đầu bằng email khảo sát
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#52443a]">
          WoodSpec không yêu cầu tạo tài khoản. Người tham gia chỉ cần nhập email để hệ thống ghi lại phiên sử dụng và nhóm dữ liệu khảo sát.
        </p>

        <div className="mt-6 rounded-xl border border-[#ead8ca] bg-[#fff1e8] p-5 text-sm leading-6 text-[#735b2d]">
          Sau khi nhập email, ứng dụng sẽ ghi các thao tác chính như chuyển trang, bấm nút, ẩn tab, đóng tab và đăng xuất.
        </div>

        <Link to={ROUTES.login}>
          <Button className="mt-6 w-full bg-[#854f19] hover:bg-[#7a4a22]">
            Nhập email để bắt đầu
          </Button>
        </Link>
      </div>
    </section>
  )
}

export default RegisterPage
