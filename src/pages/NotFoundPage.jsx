import { Link } from "react-router-dom"

import { ROUTES } from "@/constants/routes"

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fff8f5] px-5 text-center">
      <div className="max-w-[460px] rounded-[18px] border border-[#ead8ca] bg-white p-7 shadow-[0_18px_48px_rgba(82,68,58,0.08)]">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#854f19]">404</p>
        <h1 className="mt-2 text-[30px] font-bold text-[#231a11]">Không tìm thấy trang</h1>
        <p className="mt-2 text-[#52443a]">Đường dẫn này không có trong WoodSpec Workshop.</p>
        <Link
          to={ROUTES.dashboard}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-[14px] bg-[#854f19] px-5 font-bold text-white"
        >
          Quay về tổng quan
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage
