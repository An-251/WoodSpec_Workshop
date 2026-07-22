import { Cable, DoorOpen, GripVertical, Layers3, PanelTop, Wind } from "lucide-react"

const selectClass =
  "h-10 w-full rounded-lg border border-[#d7c3b5] bg-white px-3 text-sm font-semibold text-[#231a11] outline-none focus:border-[#854f19]"

const detailGroups = [
  {
    key: "doorStyle",
    label: "Kiểu mặt/cánh",
    icon: DoorOpen,
    options: [
      ["open", "Mở hoàn toàn"],
      ["two-doors", "Hai cánh kín"],
      ["slatted", "Cánh có khe thoáng"],
      ["drawers", "Hộc kéo"],
    ],
  },
  {
    key: "handleStyle",
    label: "Kiểu tay nắm",
    icon: GripVertical,
    options: [
      ["none", "Không tay nắm"],
      ["edge-pull", "Khoét cạnh"],
      ["round-knob", "Núm tròn"],
      ["vertical-bar", "Thanh dọc"],
    ],
  },
  {
    key: "shelfStyle",
    label: "Kiểu kệ/khoang",
    icon: Layers3,
    options: [
      ["none", "Không chia kệ"],
      ["grid", "Ô chia đều"],
      ["flat", "Đợt ngang"],
      ["tilted", "Kệ nghiêng"],
    ],
  },
  {
    key: "backPanel",
    label: "Hậu sản phẩm",
    icon: PanelTop,
    options: [
      ["none", "Không hậu"],
      ["partial", "Hậu một phần"],
      ["closed", "Hậu kín"],
      ["accent", "Hậu nhấn màu"],
    ],
  },
]

function ToggleButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
        active ? "border-[#854f19] bg-[#fff1e8] text-[#854f19]" : "border-[#d7c3b5] bg-white text-[#735b2d] hover:border-[#854f19]"
      }`}
    >
      {children}
    </button>
  )
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

function InteriorDetailForm({ details = {}, dimensions, onChange }) {
  const cellSize = getCellSize(details, dimensions)

  function updateField(field, value) {
    onChange({ [field]: value })
  }

  function toggleField(field) {
    onChange({ [field]: !details[field] })
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
          Chi tiết bản vẽ
        </h2>
        <p className="text-xs leading-5 text-[#735b2d]">
          Tinh chỉnh các phần nhìn thấy trên mô hình 3D trước khi gửi thông số.
        </p>
      </div>

      <div className="grid gap-4">
        {detailGroups.map((group) => {
          const Icon = group.icon

          return (
            <label key={group.key} className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-[#52443a]">
                <Icon className="size-4 text-[#854f19]" />
                {group.label}
              </span>
              <select value={details[group.key] ?? group.options[0][0]} onChange={(event) => updateField(group.key, event.target.value)} className={selectClass}>
                {group.options.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )
        })}
      </div>

      <div className="grid gap-3 rounded-lg border border-[#ead8ca] bg-[#fffaf6] p-3">
        <p className="text-sm font-semibold text-[#231a11]">Thông số cấu tạo</p>
        <p className="rounded-lg bg-white px-3 py-2 text-sm leading-6 text-[#735b2d]">
          Một ô ước tính: <strong>{cellSize.width} x {cellSize.height} x {cellSize.depth} mm</strong>
        </p>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#52443a]">Số ô theo chiều ngang</span>
          <input
            type="number"
            min="1"
            max="6"
            value={details.compartmentColumns ?? 3}
            onChange={(event) => updateNumber("compartmentColumns", event.target.value)}
            className="h-10 w-full rounded-lg border border-[#d7c3b5] bg-white px-3 text-sm font-semibold text-[#231a11] outline-none focus:border-[#854f19]"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#52443a]">Số ô theo chiều cao</span>
          <input
            type="number"
            min="1"
            max="8"
            value={details.compartmentRows ?? 3}
            onChange={(event) => updateNumber("compartmentRows", event.target.value)}
            className="h-10 w-full rounded-lg border border-[#d7c3b5] bg-white px-3 text-sm font-semibold text-[#231a11] outline-none focus:border-[#854f19]"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[#52443a]">Dày ván</span>
            <input
              type="number"
              min="12"
              max="30"
              step="1"
              value={details.boardThickness ?? 18}
              onChange={(event) => updateNumber("boardThickness", event.target.value)}
              className="h-10 w-full rounded-lg border border-[#d7c3b5] bg-white px-3 text-sm font-semibold text-[#231a11] outline-none focus:border-[#854f19]"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[#52443a]">Dày cánh</span>
            <input
              type="number"
              min="12"
              max="30"
              step="1"
              value={details.doorThickness ?? 18}
              onChange={(event) => updateNumber("doorThickness", event.target.value)}
              className="h-10 w-full rounded-lg border border-[#d7c3b5] bg-white px-3 text-sm font-semibold text-[#231a11] outline-none focus:border-[#854f19]"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[#52443a]">Dày đợt/kệ</span>
            <input
              type="number"
              min="12"
              max="30"
              step="1"
              value={details.shelfThickness ?? 18}
              onChange={(event) => updateNumber("shelfThickness", event.target.value)}
              className="h-10 w-full rounded-lg border border-[#d7c3b5] bg-white px-3 text-sm font-semibold text-[#231a11] outline-none focus:border-[#854f19]"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <ToggleButton active={details.cableHole} onClick={() => toggleField("cableHole")}>
          <span className="inline-flex items-center gap-2">
            <Cable className="size-4" />
            Lỗ luồn dây
          </span>
        </ToggleButton>
        <ToggleButton active={details.ventSlots} onClick={() => toggleField("ventSlots")}>
          <span className="inline-flex items-center gap-2">
            <Wind className="size-4" />
            Khe thoáng
          </span>
        </ToggleButton>
        <ToggleButton active={details.toeKick} onClick={() => toggleField("toeKick")}>
          Nẹp chân/đế
        </ToggleButton>
        <ToggleButton active={details.seatPad} onClick={() => toggleField("seatPad")}>
          Đệm ngồi
        </ToggleButton>
      </div>
    </div>
  )
}

export default InteriorDetailForm
