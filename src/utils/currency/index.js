/**
 * WoodSpec – Currency Utilities
 * Đơn vị tiền tệ mặc định: VND (đồng Việt Nam)
 */

const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

const VND_SHORT_FORMATTER = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
})

/**
 * Format số thành chuỗi tiền tệ VND đầy đủ.
 * @example formatVND(9000000) → "9.000.000 ₫"
 */
export function formatVND(value) {
  if (value === null || value === undefined || value === "") return "—"
  const num = Number(value)
  if (!Number.isFinite(num)) return "—"
  return VND_FORMATTER.format(num)
}

/**
 * Format số thành chuỗi rút gọn (triệu / nghìn), không có ký hiệu ₫.
 * @example formatVNDShort(9000000) → "9 triệu"
 * @example formatVNDShort(500000)  → "500 nghìn"
 */
export function formatVNDShort(value) {
  if (value === null || value === undefined || value === "") return "—"
  const num = Number(value)
  if (!Number.isFinite(num)) return "—"
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} tỷ`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")} triệu`
  if (num >= 1_000) return `${VND_SHORT_FORMATTER.format(Math.round(num / 1_000))} nghìn`
  return VND_SHORT_FORMATTER.format(num)
}

/**
 * Format khoảng ngân sách (min–max) sang VND.
 * @example formatVNDRange(5000000, 8000000) → "5 – 8 triệu ₫"
 */
export function formatVNDRange(min, max) {
  return `${formatVNDShort(min)} – ${formatVNDShort(max)} ₫`
}

/**
 * Alias để dùng thay cho `formatCurrency` cũ (backward-compatible).
 */
export const formatCurrency = formatVND
