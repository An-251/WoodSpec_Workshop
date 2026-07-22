import { dimensionLimits } from "@/features/configurator/utils"

const quoteVisibleStatuses = new Set(["sent", "quoted", "final-confirmed"])

function isBlank(value) {
  return !String(value ?? "").trim()
}

export function canViewQuotes(status) {
  return quoteVisibleStatuses.has(status)
}

export function validateQuoteRequest(configuration) {
  const details = configuration.requestDetails ?? {}
  const errors = []

  if (!configuration.product?.id) errors.push("Vui lòng chọn loại sản phẩm.")
  if (!configuration.material?.id) errors.push("Vui lòng chọn vật liệu.")
  if (!configuration.color?.id) errors.push("Vui lòng chọn màu hoàn thiện.")
  if (!configuration.layout?.id) errors.push("Vui lòng chọn bố cục.")

  const dimensions = configuration.dimensions ?? {}
  if (!dimensions.width || dimensions.width < dimensionLimits.width.min || dimensions.width > dimensionLimits.width.max) {
    errors.push(`Chiều rộng phải nằm trong khoảng ${dimensionLimits.width.min}-${dimensionLimits.width.max} mm.`)
  }
  if (!dimensions.height || dimensions.height < dimensionLimits.height.min || dimensions.height > dimensionLimits.height.max) {
    errors.push(`Chiều cao phải nằm trong khoảng ${dimensionLimits.height.min}-${dimensionLimits.height.max} mm.`)
  }
  if (!dimensions.depth || dimensions.depth < dimensionLimits.depth.min || dimensions.depth > dimensionLimits.depth.max) {
    errors.push(`Chiều sâu phải nằm trong khoảng ${dimensionLimits.depth.min}-${dimensionLimits.depth.max} mm.`)
  }

  if (isBlank(details.placement)) errors.push("Vui lòng nhập vị trí đặt sản phẩm.")
  if (isBlank(details.usage)) errors.push("Vui lòng nhập công năng sử dụng.")
  if (!Number.isFinite(Number(details.budget)) || Number(details.budget) <= 0) errors.push("Vui lòng nhập ngân sách dự kiến.")
  if (isBlank(details.expectedTimeline)) errors.push("Vui lòng nhập thời gian mong muốn.")
  if (isBlank(details.installationCondition)) errors.push("Vui lòng nhập điều kiện lắp đặt.")

  return errors
}

export function createQuoteRequest() {
  const now = new Date()
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("")
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase()

  return {
    id: `WS-${datePart}-${randomPart}`,
    submittedAt: now.toISOString(),
  }
}
