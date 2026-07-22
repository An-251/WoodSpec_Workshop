import { Label } from "@/components/ui/label"
import { dimensionLimits } from "@/features/configurator/utils"

const dimensionFields = [
  {
    key: "width",
    label: "Ngang trái-phải",
    shortLabel: "Rộng",
    hint: "Chiều ngang khi nhìn trực diện sản phẩm.",
    min: dimensionLimits.width.min,
    max: dimensionLimits.width.max,
    step: 50,
  },
  {
    key: "height",
    label: "Từ sàn lên",
    shortLabel: "Cao",
    hint: "Chiều cao tính từ sàn đến đỉnh sản phẩm.",
    min: dimensionLimits.height.min,
    max: dimensionLimits.height.max,
    step: 50,
  },
  {
    key: "depth",
    label: "Từ trước ra sau",
    shortLabel: "Sâu",
    hint: "Độ sâu tính từ mặt trước vào phía tường.",
    min: dimensionLimits.depth.min,
    max: dimensionLimits.depth.max,
    step: 25,
  },
]

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function toCentimeters(value) {
  return Math.round(value / 10)
}

function DimensionForm({ dimensions, onChange }) {
  function handleChange(field, rawValue) {
    const nextValue = Number.parseInt(rawValue, 10)
    if (Number.isNaN(nextValue)) {
      return
    }

    onChange({
      [field.key]: clamp(nextValue, field.min, field.max),
    })
  }

  return (
    <div>
      <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#847468]">Kích thước</h2>
      <p className="mb-4 text-xs leading-5 text-[#735b2d]">
        Bạn có thể nhìn theo cm cho dễ hình dung; hệ thống vẫn giữ mm để bản vẽ chính xác.
      </p>
      <div className="space-y-5">
        {dimensionFields.map((field) => (
          <div key={field.key} className="rounded-lg border border-[#ead8ca] bg-[#fffaf6] p-3">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <Label htmlFor={field.key} className="font-semibold text-[#52443a]">
                  {field.label}
                </Label>
                <p className="mt-1 text-xs leading-5 text-[#847468]">{field.hint}</p>
              </div>
              <div className="text-right">
                <input
                  id={`${field.key}-number`}
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={dimensions[field.key]}
                  onChange={(event) => handleChange(field, event.target.value)}
                  className="h-9 w-28 rounded-lg border border-[#d7c3b5] bg-white px-3 text-right text-sm font-bold text-[#854f19] outline-none focus:border-[#854f19]"
                />
                <p className="mt-1 text-xs font-semibold text-[#735b2d]">
                  khoảng {toCentimeters(dimensions[field.key])} cm
                </p>
              </div>
            </div>
            <input
              id={field.key}
              type="range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={dimensions[field.key]}
              onChange={(event) => handleChange(field, event.target.value)}
              className="w-full accent-[#854f19]"
            />
            <div className="mt-1 flex justify-between text-xs text-[#847468]">
              <span>{toCentimeters(field.min)} cm</span>
              <span>{field.shortLabel}: {dimensions[field.key]} mm</span>
              <span>{toCentimeters(field.max)} cm</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DimensionForm
