import { Link, useLocation } from "react-router-dom"
import { FileText, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { notify } from "@/features/notifications/utils/notify"
import { formatCurrency } from "@/utils/formatCurrency"

function ConfiguratorActionBar({ estimatedPrice, onGenerateSpec, onReset }) {
  const location = useLocation()
  const isAppFlow = location.pathname.startsWith("/app")
  const specReviewPath = isAppFlow ? ROUTES.appSpecReview : ROUTES.specReview

  function handleGenerateSpec() {
    onGenerateSpec()
    notify.specGenerated()
  }

  function handleReset() {
    onReset()
    notify.configuratorReset()
  }

  return (
    <div className="rounded-xl border border-[#ead8ca] bg-white p-4 shadow-[0_4px_20px_rgba(43,33,24,0.08)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#847468]">Giá ước tính</p>
          <strong className="mt-1 block text-2xl text-[#854f19]">{formatCurrency(estimatedPrice)}</strong>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to={specReviewPath} onClick={handleGenerateSpec}>
            <Button className="w-full bg-[#854f19] hover:bg-[#7a4a22] sm:w-auto">
              <FileText />
              Tạo bảng thông số
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            className="border-[#d7c3b5] bg-white text-[#854f19]"
            onClick={handleReset}
          >
            <RotateCcw />
            Đặt lại
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfiguratorActionBar
