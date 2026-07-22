import { CalendarDays, Image, MapPin, PackageCheck, WalletCards } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const fieldClass =
  "min-h-20 w-full resize-y rounded-lg border border-[#d7c3b5] bg-white px-3 py-2 text-sm leading-6 text-[#231a11] outline-none focus:border-[#854f19]"

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
        <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#847468]">
          Yêu cầu sử dụng
        </h2>
        <p className="text-xs leading-5 text-[#735b2d]">
          Các thông tin này giúp xưởng báo giá trên cùng một cơ sở.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="placement" className="text-[#52443a]">
          <MapPin className="size-4 text-[#854f19]" />
          Vị trí đặt
        </Label>
        <Input
          id="placement"
          value={details.placement}
          onChange={(event) => updateField("placement", event.target.value)}
          className="h-10 border-[#d7c3b5] bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="usage" className="text-[#52443a]">
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
        <Label htmlFor="compartmentNote" className="text-[#52443a]">
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
        <Label htmlFor="accessories" className="text-[#52443a]">
          <PackageCheck className="size-4 text-[#854f19]" />
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
        <Label htmlFor="referenceImage" className="text-[#52443a]">
          <Image className="size-4 text-[#854f19]" />
          Hình tham khảo
        </Label>
        <Input
          id="referenceImage"
          value={details.referenceImage}
          onChange={(event) => updateField("referenceImage", event.target.value)}
          placeholder="Dán liên kết ảnh hoặc mô tả ảnh tham khảo"
          className="h-10 border-[#d7c3b5] bg-white"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="budget" className="text-[#52443a]">
            <WalletCards className="size-4 text-[#854f19]" />
            Ngân sách dự kiến
          </Label>
          <Input
            id="budget"
            type="number"
            step="500000"
            value={details.budget}
            onChange={(event) => updateNumber("budget", event.target.value)}
            className="h-10 border-[#d7c3b5] bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedTimeline" className="text-[#52443a]">
            <CalendarDays className="size-4 text-[#854f19]" />
            Thời gian mong muốn
          </Label>
          <Input
            id="expectedTimeline"
            value={details.expectedTimeline}
            onChange={(event) => updateField("expectedTimeline", event.target.value)}
            className="h-10 border-[#d7c3b5] bg-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="installationCondition" className="text-[#52443a]">
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
          <Label htmlFor="region" className="text-[#52443a]">
            Khu vực gửi báo giá
          </Label>
          <Input
            id="region"
            value={details.region}
            onChange={(event) => updateField("region", event.target.value)}
            className="h-10 border-[#d7c3b5] bg-white"
          />
        </div>
      </div>
    </div>
  )
}

export default RequirementForm
