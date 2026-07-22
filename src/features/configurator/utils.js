export const layoutOptions = [
  {
    id: "open-shelves",
    name: "Kệ mở",
    description: "Các khoang mở dễ trưng bày và lấy đồ.",
    columns: 3,
    rows: 3,
    doors: 0,
    drawers: 0,
  },
  {
    id: "two-doors",
    name: "Hai cánh tủ",
    description: "Cân bằng giữa lưu trữ kín và bố cục gọn.",
    columns: 2,
    rows: 2,
    doors: 2,
    drawers: 0,
  },
  {
    id: "drawers-bottom",
    name: "Kệ và ngăn kéo",
    description: "Kệ phía trên, ngăn kéo thấp cho đồ nhỏ.",
    columns: 3,
    rows: 3,
    doors: 0,
    drawers: 3,
  },
]

export const dimensionLimits = {
  width: { min: 800, max: 2200 },
  height: { min: 700, max: 2400 },
  depth: { min: 300, max: 700 },
}

export function calculateEstimatedPrice(configuration) {
  const { dimensions, product, material, layout } = configuration
  const volumeFactor = (dimensions.width * dimensions.height * dimensions.depth) / 100000000
  const productBase = product?.basePrice ?? 6500000
  const materialMultiplier = material?.priceMultiplier ?? 1
  const layoutCost = (layout?.doors ?? 0) * 450000 + (layout?.drawers ?? 0) * 650000

  return Math.round((productBase + volumeFactor * 1350000 + layoutCost) * materialMultiplier / 100000) * 100000
}

export function getPreviewMetrics(dimensions) {
  const maxWidth = 420
  const maxHeight = 320
  const widthRatio = maxWidth / dimensions.width
  const heightRatio = maxHeight / dimensions.height
  const scale = Math.min(widthRatio, heightRatio)
  const previewWidth = Math.max(180, Math.round(dimensions.width * scale))
  const previewHeight = Math.max(160, Math.round(dimensions.height * scale))

  return {
    x: Math.round((560 - previewWidth) / 2),
    y: Math.round((390 - previewHeight) / 2),
    width: previewWidth,
    height: previewHeight,
  }
}
