import { CalendarDays, Image, MapPin, PackageCheck, WalletCards } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const fieldClass =
  "min-h-20 w-full resize-y rounded-lg border border-[#d4d4d4] bg-white px-3 py-2 text-sm leading-6 text-[#0a0a0a] outline-none focus:border-[#6f665c]"

function RequirementForm({ details, onChange }) {
  function updateField(field, value) {
    onChange({ [field]: value })
  }

  function updateNumber(field, value) {
    const nextValue = Number.parseInt(value, 10)
    if (!Number.isNaN(nextValue)) {
      onChange({ [field]: nextValue })
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#737373]">
          Yêu cầu sử dụng
        </h2>
        <p className="text-xs leading-5 text-[#525252]">
          Các thông tin này giúp xưởng báo giá trên cùng một cơ sở.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="placement" className="text-[#525252]">
          <MapPin className="size-4 text-[#6f665c]" />
          Vị trí đặt
        </Label>
        <Input
          id="placement"
          value={details.placement}
          onChange={(event) => updateField("placement", event.target.value)}
          className="h-10 border-[#d4d4d4] bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="usage" className="text-[#525252]">
          Công năng sử dụng
        </Label>
        <textarea
          id="usage"
          value={details.usage}
          onChange={(event) => updateField("usage", event.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="compartmentNote" className="text-[#525252]">
          Số ngăn, số tầng, số cánh
        </Label>
        <textarea
          id="compartmentNote"
          value={details.compartmentNote}
          onChange={(event) => updateField("compartmentNote", event.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accessories" className="text-[#525252]">
          <PackageCheck className="size-4 text-[#6f665c]" />
          Phụ kiện mong muốn
        </Label>
        <textarea
          id="accessories"
          value={details.accessories}
          onChange={(event) => updateField("accessories", event.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="referenceImage" className="text-[#525252]">
          <Image className="size-4 text-[#6f665c]" />
          Hình tham khảo
        </Label>
        <Input
          id="referenceImage"
          value={details.referenceImage}
          onChange={(event) => updateField("referenceImage", event.target.value)}
          placeholder="Dán liên kết ảnh hoặc mô tả ảnh tham khảo"
          className="h-10 border-[#d4d4d4] bg-white"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="budget" className="text-[#525252]">
            <WalletCards className="size-4 text-[#6f665c]" />
            Ngân sách dự kiến
          </Label>
          <Input
            id="budget"
            type="number"
            step="500000"
            value={details.budget}
            onChange={(event) => updateNumber("budget", event.target.value)}
            className="h-10 border-[#d4d4d4] bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedTimeline" className="text-[#525252]">
            <CalendarDays className="size-4 text-[#6f665c]" />
            Thời gian mong muốn
          </Label>
          <Input
            id="expectedTimeline"
            value={details.expectedTimeline}
            onChange={(event) => updateField("expectedTimeline", event.target.value)}
            className="h-10 border-[#d4d4d4] bg-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="installationCondition" className="text-[#525252]">
          Điều kiện lắp đặt
        </Label>
        <textarea
          id="installationCondition"
          value={details.installationCondition}
          onChange={(event) => updateField("installationCondition", event.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
        <div className="space-y-2">
          <Label htmlFor="region" className="text-[#525252]">
            Khu vực gửi báo giá
          </Label>
          <Input
            id="region"
            value={details.region}
            onChange={(event) => updateField("region", event.target.value)}
            className="h-10 border-[#d4d4d4] bg-white"
          />
        </div>
      </div>
    </div>
  )
}

export default RequirementForm
