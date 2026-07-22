import DimensionForm from "@/features/configurator/components/DimensionForm"
import InteriorDetailForm from "@/features/configurator/components/InteriorDetailForm"
import MaterialPicker from "@/features/configurator/components/MaterialPicker"
import RequirementForm from "@/features/configurator/components/RequirementForm"

function ConfigSidebar({
  configuration,
  onDimensionsChange,
  onMaterialChange,
  onColorChange,
  onDesignDetailsChange,
  onRequestDetailsChange,
  className = "",
}) {
  return (
    <aside className={`min-w-0 rounded-xl border border-[#ead8ca] bg-white p-6 text-left shadow-[0_4px_20px_rgba(43,33,24,0.08)] ${className}`}>
      <h1 className="text-2xl font-semibold text-[#231a11]">Phác thảo sản phẩm 3D</h1>
      <p className="mt-1 text-sm leading-6 text-[#52443a]">
        Mẫu đã được chọn từ phần gợi ý. Bạn có thể chỉnh kích thước, vật liệu và các chi tiết nhìn thấy trực tiếp trên mô hình 3D.
      </p>

      <div className="mt-6 space-y-7">
        <div className="rounded-lg border border-[#ead8ca] bg-[#fffaf6] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#847468]">Mẫu đang chọn</p>
          <p className="mt-2 text-lg font-semibold text-[#231a11]">{configuration.productName}</p>
          <p className="mt-1 text-sm leading-6 text-[#735b2d]">
            Không cần chọn lại loại sản phẩm. Các phần bên dưới dùng để tinh chỉnh mô hình và thông tin gửi xưởng.
          </p>
        </div>

        <DimensionForm dimensions={configuration.dimensions} onChange={onDimensionsChange} />

        <MaterialPicker
          selectedMaterial={configuration.material}
          selectedColor={configuration.color}
          onMaterialChange={onMaterialChange}
          onColorChange={onColorChange}
        />

        <InteriorDetailForm details={configuration.designDetails} dimensions={configuration.dimensions} onChange={onDesignDetailsChange} />

        <RequirementForm details={configuration.requestDetails} onChange={onRequestDetailsChange} />
      </div>
    </aside>
  )
}

export default ConfigSidebar
