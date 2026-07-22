import { CheckCircle2, ChevronLeft, Info, Palette, PanelRightClose, PanelRightOpen, Ruler, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { materialOptions } from "@/data/reference/materials"
import { dimensionLimits } from "@/features/configurator/utils"
import RequirementForm from "@/features/configurator/components/RequirementForm"

const partOptions = [
  ["overall", "Tổng thể"],
  ["material", "Vật liệu"],
  ["carcass", "Thân tủ"],
  ["shelf", "Kệ và khoang"],
  ["door", "Cánh tủ"],
  ["drawer", "Ngăn kéo"],
  ["handle", "Tay nắm"],
  ["back", "Hậu tủ"],
  ["base", "Chân/đế"],
  ["request", "Thông tin gửi xưởng"],
]

const deskPartOptions = [
  ["overall", "Tổng thể"],
  ["material", "Vật liệu"],
  ["desktop", "Mặt bàn"],
  ["legs", "Chân bàn"],
  ["deskStorage", "Hộc bàn"],
  ["drawer", "Ngăn kéo"],
  ["handle", "Tay nắm"],
  ["cable", "Lỗ luồn dây"],
  ["request", "Thông tin gửi xưởng"],
]

const doorStyleOptions = [
  ["open", "Mở hoàn toàn"],
  ["two-doors", "Hai cánh kín"],
  ["slatted", "Cánh có khe thoáng"],
  ["drawers", "Hộc kéo"],
]

const handleStyleOptions = [
  ["none", "Không tay nắm"],
  ["edge-pull", "Khoét cạnh"],
  ["round-knob", "Núm tròn"],
  ["vertical-bar", "Thanh dọc"],
]

const shelfStyleOptions = [
  ["none", "Không chia kệ"],
  ["grid", "Ô chia đều"],
  ["flat", "Đợt ngang"],
  ["tilted", "Kệ nghiêng"],
]

const backPanelOptions = [
  ["none", "Không hậu"],
  ["partial", "Hậu một phần"],
  ["closed", "Hậu kín"],
  ["accent", "Hậu nhấn màu"],
]

const dimensionFields = [
  ["width", "Ngang", "Chiều ngang khi nhìn trực diện"],
  ["height", "Cao", "Từ sàn lên đỉnh sản phẩm"],
  ["depth", "Sâu", "Từ mặt trước vào phía tường"],
]

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function formatCmFromMm(value) {
  const cm = value / 10
  return Number.isInteger(cm) ? String(cm) : cm.toFixed(1).replace(/\.0$/, "")
}

function getCellSize(details, dimensions = {}) {
  const board = details.boardThickness ?? 18
  const shelf = details.shelfThickness ?? 18
  const columns = Math.max(1, details.compartmentColumns ?? 3)
  const rows = Math.max(1, details.compartmentRows ?? 3)
  const width = Math.max(0, Math.round(((dimensions.width ?? 0) - board * 2 - board * (columns - 1)) / columns))
  const height = Math.max(0, Math.round(((dimensions.height ?? 0) - board * 2 - shelf * (rows - 1)) / rows))
  const depth = Math.max(0, Math.round((dimensions.depth ?? 0) - board))

  return { width, height, depth }
}

function canUseSeatPad(configuration) {
  return configuration.product?.id === "shoe-cabinet" && (configuration.dimensions?.height ?? 0) <= 1000
}

function NumberControl({ label, description, value, min, max, step = 1, suffix = "cm", displayFactor = 10, onChange }) {
  const displayValue = value / displayFactor
  const displayMin = min / displayFactor
  const displayMax = max / displayFactor
  const displayStep = step / displayFactor

  function handleChange(rawValue) {
    const nextValue = Number.parseFloat(rawValue)

    if (!Number.isNaN(nextValue)) {
      onChange(clamp(Math.round(nextValue * displayFactor), min, max))
    }
  }

  return (
    <label className="block rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3">
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="block text-sm font-semibold text-[#0a0a0a]">{label}</span>
          {description && <span className="mt-1 block text-xs leading-5 text-[#525252]">{description}</span>}
        </span>
        <span className="shrink-0 rounded-lg border border-[#d4d4d4] bg-white px-3 py-2 text-sm font-bold text-[#6f665c]">
          {Number.isInteger(displayValue) ? displayValue : displayValue.toFixed(1)} {suffix}
        </span>
      </span>
      <input
        type="range"
        min={displayMin}
        max={displayMax}
        step={displayStep}
        value={displayValue}
        onChange={(event) => handleChange(event.target.value)}
        className="mt-3 w-full accent-[#6f665c]"
      />
      <input
        type="number"
        min={displayMin}
        max={displayMax}
        step={displayStep}
        value={displayValue}
        onChange={(event) => handleChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-[#d4d4d4] bg-white px-3 text-sm font-semibold text-[#0a0a0a] outline-none focus:border-[#6f665c]"
      />
    </label>
  )
}

function SelectControl({ label, value, options, onChange }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#525252]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-[#d4d4d4] bg-white px-3 text-sm font-semibold text-[#0a0a0a] outline-none focus:border-[#6f665c]"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function ToggleControl({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-lg border px-3 py-3 text-left text-sm font-semibold transition ${
        active ? "border-[#6f665c] bg-[#f7f7f5] text-[#6f665c]" : "border-[#d4d4d4] bg-white text-[#525252] hover:border-[#6f665c]"
      }`}
    >
      {children}
      {active && <CheckCircle2 className="size-4" />}
    </button>
  )
}

function PartInspectorPanel({
  configuration,
  selectedPart,
  isOpen = true,
  onToggleOpen,
  onReviewSpec,
  onSelectedPartChange,
  onDimensionsChange,
  onMaterialChange,
  onColorChange,
  onDesignDetailsChange,
  onRequestDetailsChange,
  className = "",
}) {
  const { dimensions, designDetails = {}, material, color } = configuration
  const cellSize = getCellSize(designDetails, dimensions)
  const isDesk = configuration.product?.id === "study-desk"
  const availablePartOptions = isDesk ? deskPartOptions : partOptions
  const activePart = availablePartOptions.some(([value]) => value === selectedPart) ? selectedPart : "overall"
  const selectedPartLabel = availablePartOptions.find(([value]) => value === activePart)?.[1] ?? "Tổng thể"
  const shelfStyle = designDetails.shelfStyle ?? "grid"
  const supportsSeatPad = canUseSeatPad(configuration)

  function updateNumber(field, value) {
    onDesignDetailsChange({ [field]: value })
  }

  function updateField(field, value) {
    onDesignDetailsChange({ [field]: value })
  }

  function toggleField(field) {
    onDesignDetailsChange({ [field]: !designDetails[field] })
  }

  function renderSelectedControls() {
    if (activePart === "request") {
      return <RequirementForm details={configuration.requestDetails} onChange={onRequestDetailsChange} />
    }

    if (activePart === "material") {
      return (
        <div className="space-y-5">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#0a0a0a]">Vật liệu chính</h3>
            <div className="grid gap-2">
              {materialOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onMaterialChange(item.id)}
                  className={`rounded-lg border p-3 text-left text-sm transition ${
                    item.id === material.id ? "border-[#6f665c] bg-[#f7f7f5]" : "border-[#d4d4d4] bg-white hover:border-[#6f665c]"
                  }`}
                >
                  <span className="font-semibold text-[#0a0a0a]">{item.name}</span>
                  <span className="mt-1 block text-xs leading-5 text-[#525252]">{item.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#0a0a0a]">Màu hoàn thiện</h3>
            <div className="grid grid-cols-3 gap-2">
              {material.colors.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  title={item.name}
                  onClick={() => onColorChange(item.id)}
                  className={`rounded-lg border bg-white p-2 text-left transition ${
                    item.id === color.id ? "border-2 border-[#6f665c]" : "border-[#d4d4d4] hover:border-[#6f665c]"
                  }`}
                >
                  <span className="block h-10 rounded-md border border-black/10 shadow-inner" style={{ backgroundColor: item.hex }} />
                  <span className="mt-2 block text-xs font-semibold text-[#525252]">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (activePart === "overall") {
      return (
        <div className="space-y-3">
          {dimensionFields.map(([key, label, description]) => {
            const limit = dimensionLimits[key]

            return (
              <NumberControl
                key={key}
                label={label}
                description={description}
                value={dimensions[key]}
                min={limit.min}
                max={limit.max}
                step={key === "depth" ? 25 : 50}
                onChange={(value) => onDimensionsChange({ [key]: value })}
              />
            )
          })}
        </div>
      )
    }

    if (isDesk && activePart === "desktop") {
      return (
        <div className="space-y-3">
          <NumberControl label="Độ dày mặt bàn" description="Độ dày phần mặt bàn phía trên" value={designDetails.boardThickness ?? 18} min={12} max={40} onChange={(value) => updateNumber("boardThickness", value)} />
          <NumberControl label="Độ sâu mặt bàn" description="Khoảng từ mép trước vào phía tường" value={dimensions.depth} min={dimensionLimits.depth.min} max={dimensionLimits.depth.max} step={25} onChange={(value) => onDimensionsChange({ depth: value })} />
        </div>
      )
    }

    if (isDesk && activePart === "legs") {
      return (
        <div className="space-y-3">
          <NumberControl label="Độ dày chân bàn" description="Độ dày khung/chân đỡ mô phỏng trên bản xem 3D" value={designDetails.boardThickness ?? 18} min={12} max={40} onChange={(value) => updateNumber("boardThickness", value)} />
          <NumberControl label="Chiều cao bàn" description="Từ sàn lên mặt bàn" value={dimensions.height} min={dimensionLimits.height.min} max={dimensionLimits.height.max} step={50} onChange={(value) => onDimensionsChange({ height: value })} />
        </div>
      )
    }

    if (isDesk && activePart === "deskStorage") {
      return (
        <div className="space-y-3">
          <NumberControl label="Số hộc kéo" value={designDetails.deskDrawerCount ?? designDetails.compartmentRows ?? 3} min={1} max={5} suffix="hộc" displayFactor={1} onChange={(value) => updateNumber("deskDrawerCount", value)} />
          <NumberControl label="Độ dày ván hộc" value={designDetails.boardThickness ?? 18} min={12} max={30} onChange={(value) => updateNumber("boardThickness", value)} />
        </div>
      )
    }

    if (activePart === "carcass") {
      return (
        <div className="space-y-3">
          <NumberControl label="Độ dày ván" value={designDetails.boardThickness ?? 18} min={12} max={30} onChange={(value) => updateNumber("boardThickness", value)} />
        </div>
      )
    }

    if (activePart === "shelf" || activePart === "divider") {
      const isGridShelf = shelfStyle === "grid"
      const isFlatShelf = shelfStyle === "flat"

      return (
        <div className="space-y-3">
          <p className="rounded-lg bg-[#fafafa] px-3 py-2 text-sm leading-6 text-[#525252]">
            {isGridShelf ? "Một ô ước tính" : "Một khoang ước tính"}:{" "}
            <strong>
              {formatCmFromMm(isGridShelf ? cellSize.width : Math.max(0, dimensions.width - (designDetails.boardThickness ?? 18) * 2))} x {formatCmFromMm(cellSize.height)} x {formatCmFromMm(cellSize.depth)} cm
            </strong>
          </p>
          <SelectControl label="Kiểu kệ/khoang" value={designDetails.shelfStyle ?? "grid"} options={shelfStyleOptions} onChange={(value) => updateField("shelfStyle", value)} />
          {isGridShelf && (
            <NumberControl label="Số ô theo chiều ngang" value={designDetails.compartmentColumns ?? 3} min={1} max={6} suffix="ô" displayFactor={1} onChange={(value) => updateNumber("compartmentColumns", value)} />
          )}
          {shelfStyle !== "none" && (
            <NumberControl
              label={isFlatShelf ? "Số đợt/tầng" : "Số ô theo chiều cao"}
              value={designDetails.compartmentRows ?? 3}
              min={1}
              max={8}
              suffix={isFlatShelf ? "đợt" : "ô"}
              displayFactor={1}
              onChange={(value) => updateNumber("compartmentRows", value)}
            />
          )}
          <NumberControl label="Độ dày đợt/kệ" value={designDetails.shelfThickness ?? 18} min={12} max={30} onChange={(value) => updateNumber("shelfThickness", value)} />
        </div>
      )
    }

    if (activePart === "door") {
      return (
        <div className="space-y-3">
          <SelectControl label="Kiểu mặt/cánh" value={designDetails.doorStyle ?? "open"} options={doorStyleOptions} onChange={(value) => updateField("doorStyle", value)} />
          <NumberControl label="Độ dày cánh" value={designDetails.doorThickness ?? 18} min={12} max={30} onChange={(value) => updateNumber("doorThickness", value)} />
          <ToggleControl active={designDetails.ventSlots} onClick={() => toggleField("ventSlots")}>Thêm khe thoáng</ToggleControl>
        </div>
      )
    }

    if (activePart === "drawer") {
      return (
        <div className="space-y-3">
          {!isDesk && <SelectControl label="Kiểu ngăn kéo" value={designDetails.doorStyle ?? "drawers"} options={[["drawers", "Hộc kéo"]]} onChange={(value) => updateField("doorStyle", value)} />}
          {isDesk && <NumberControl label="Số hộc kéo" value={designDetails.deskDrawerCount ?? designDetails.compartmentRows ?? 3} min={1} max={5} suffix="hộc" displayFactor={1} onChange={(value) => updateNumber("deskDrawerCount", value)} />}
          <NumberControl label="Độ dày mặt kéo" value={designDetails.doorThickness ?? 18} min={12} max={30} onChange={(value) => updateNumber("doorThickness", value)} />
        </div>
      )
    }

    if (activePart === "handle") {
      return (
        <div className="space-y-3">
          <SelectControl label="Kiểu tay nắm" value={designDetails.handleStyle ?? "edge-pull"} options={handleStyleOptions} onChange={(value) => updateField("handleStyle", value)} />
          {!isDesk && <ToggleControl active={designDetails.ventSlots} onClick={() => toggleField("ventSlots")}>Hiện khe thoáng trên cánh</ToggleControl>}
        </div>
      )
    }

    if (activePart === "back") {
      return (
        <div className="space-y-3">
          <SelectControl label="Hậu sản phẩm" value={designDetails.backPanel ?? "partial"} options={backPanelOptions} onChange={(value) => updateField("backPanel", value)} />
          <ToggleControl active={designDetails.cableHole} onClick={() => toggleField("cableHole")}>Thêm lỗ luồn dây</ToggleControl>
        </div>
      )
    }

    if (activePart === "base") {
      return (
        <div className="space-y-3">
          <ToggleControl active={designDetails.toeKick} onClick={() => toggleField("toeKick")}>Nẹp chân/đế lùi</ToggleControl>
          {supportsSeatPad && <ToggleControl active={designDetails.seatPad} onClick={() => toggleField("seatPad")}>Đệm ngồi phía trên</ToggleControl>}
        </div>
      )
    }

    if (activePart === "seat") {
      if (!supportsSeatPad) {
        return (
          <p className="rounded-lg bg-[#fafafa] px-3 py-2 text-sm leading-6 text-[#525252]">
            Đệm ngồi chỉ phù hợp với tủ giày thấp. Sản phẩm hiện tại không cần thông số này.
          </p>
        )
      }

      return (
        <div className="space-y-3">
          <ToggleControl active={designDetails.seatPad} onClick={() => toggleField("seatPad")}>Bật/tắt đệm ngồi</ToggleControl>
          <NumberControl label="Độ dày ván thân" value={designDetails.boardThickness ?? 18} min={12} max={30} onChange={(value) => updateNumber("boardThickness", value)} />
        </div>
      )
    }

    if (activePart === "cable") {
      return (
        <div className="space-y-3">
          <ToggleControl active={designDetails.cableHole} onClick={() => toggleField("cableHole")}>Bật/tắt lỗ luồn dây</ToggleControl>
          <SelectControl label="Hậu sản phẩm" value={designDetails.backPanel ?? "partial"} options={backPanelOptions} onChange={(value) => updateField("backPanel", value)} />
        </div>
      )
    }

    return null
  }

  if (!isOpen) {
    return (
      <aside className={`rounded-xl border border-[#e5e5e5] bg-white p-3 text-left shadow-[0_4px_20px_rgba(0,0,0,0.05)] ${className}`}>
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex h-full min-h-40 w-full flex-col items-center justify-start gap-3 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-2 py-4 text-[#6f665c] transition hover:border-[#6f665c]"
          aria-label="Mở bảng chỉnh chi tiết"
        >
          <PanelRightOpen className="size-5" />
          <span className="[writing-mode:vertical-rl] text-xs font-bold uppercase tracking-[0.14em]">Chỉnh chi tiết</span>
          <ChevronLeft className="size-4" />
        </button>
      </aside>
    )
  }

  return (
    <aside className={`rounded-xl border border-[#e5e5e5] bg-white p-5 text-left shadow-[0_4px_20px_rgba(0,0,0,0.05)] ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-[#f7f7f5] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6f665c]">
            <SlidersHorizontal className="size-4" />
            Chỉnh chi tiết
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-[#0a0a0a]">{selectedPartLabel}</h1>
          <p className="mt-1 text-sm leading-6 text-[#525252]">
            Bấm vào mô hình 3D hoặc chọn nhóm bên dưới để chỉnh đúng phần đang quan tâm.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleOpen}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[#d4d4d4] bg-white text-[#6f665c] transition hover:border-[#6f665c] hover:bg-[#f7f7f5]"
          aria-label="Đóng bảng chỉnh chi tiết"
        >
          <PanelRightClose className="size-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {availablePartOptions.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelectedPartChange(value)}
            className={`rounded-lg border px-3 py-2 text-left text-xs font-bold transition ${
              activePart === value ? "border-[#6f665c] bg-[#f7f7f5] text-[#6f665c]" : "border-[#d4d4d4] bg-white text-[#525252] hover:border-[#6f665c]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#0a0a0a]">
          <Info className="size-4 text-[#6f665c]" />
          {configuration.productName}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#525252]">
          {formatCmFromMm(configuration.dimensions.width)} x {formatCmFromMm(configuration.dimensions.height)} x {formatCmFromMm(configuration.dimensions.depth)} cm · {configuration.material.name} · {configuration.color.name}
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {activePart === "material" ? (
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#737373]">
            <Palette className="size-4" />
            Bề mặt và màu sắc
          </p>
        ) : (
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#737373]">
            <Ruler className="size-4" />
            Thông số có thể chỉnh
          </p>
        )}
        {renderSelectedControls()}
      </div>

      <Button
        type="button"
        className="mt-5 w-full bg-[#0a0a0a] hover:bg-[#262626]"
        onClick={() => {
          if (activePart === "request") {
            onReviewSpec?.()
            return
          }

          onSelectedPartChange("request")
        }}
      >
        {activePart === "request" ? "Rà soát thông số" : "Kiểm tra thông tin gửi xưởng"}
      </Button>
    </aside>
  )
}

export default PartInspectorPanel
