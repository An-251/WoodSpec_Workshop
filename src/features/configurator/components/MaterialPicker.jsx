import { CheckCircle2 } from "lucide-react"

import { materialOptions } from "@/data/reference/materials"

function MaterialPicker({ selectedMaterial, selectedColor, onMaterialChange, onColorChange }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#847468]">
          Vật liệu
        </h2>
        <div className="grid gap-3">
          {materialOptions.map((material) => {
            const isSelected = material.id === selectedMaterial.id

            return (
              <button
                key={material.id}
                type="button"
                onClick={() => onMaterialChange(material.id)}
                className={`rounded-lg border p-4 text-left transition ${
                  isSelected
                    ? "border-[#854f19] bg-[#fff8f5]"
                    : "border-[#d7c3b5] bg-white hover:border-[#854f19]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#231a11]">{material.name}</p>
                    <p className="mt-1 text-xs leading-5 text-[#52443a]">{material.description}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="size-5 shrink-0 text-[#854f19]" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#847468]">
          Màu hoàn thiện
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {selectedMaterial.colors.map((color) => {
            const isSelected = color.id === selectedColor.id

            return (
              <button
                key={color.id}
                type="button"
                title={color.name}
                onClick={() => onColorChange(color.id)}
                className={`rounded-lg border bg-white p-2 text-left transition ${
                  isSelected ? "border-2 border-[#854f19]" : "border-[#d7c3b5] hover:border-[#854f19]"
                }`}
              >
                <span
                  className="block h-12 rounded-lg border border-black/10 shadow-inner"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="mt-2 block text-xs font-semibold text-[#52443a]">{color.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MaterialPicker
