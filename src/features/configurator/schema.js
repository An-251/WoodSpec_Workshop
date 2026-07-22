import { z } from "zod"

import { dimensionLimits } from "@/features/configurator/utils"

export const configuratorSchema = z.object({
  productId: z.string().min(1, "Vui lòng chọn mẫu sản phẩm."),
  dimensions: z.object({
    width: z
      .number()
      .min(dimensionLimits.width.min, `Chiều rộng tối thiểu ${dimensionLimits.width.min} mm.`)
      .max(dimensionLimits.width.max, `Chiều rộng tối đa ${dimensionLimits.width.max} mm.`),
    height: z
      .number()
      .min(dimensionLimits.height.min, `Chiều cao tối thiểu ${dimensionLimits.height.min} mm.`)
      .max(dimensionLimits.height.max, `Chiều cao tối đa ${dimensionLimits.height.max} mm.`),
    depth: z
      .number()
      .min(dimensionLimits.depth.min, `Chiều sâu tối thiểu ${dimensionLimits.depth.min} mm.`)
      .max(dimensionLimits.depth.max, `Chiều sâu tối đa ${dimensionLimits.depth.max} mm.`),
  }),
  materialId: z.string().min(1, "Vui lòng chọn vật liệu."),
  colorId: z.string().min(1, "Vui lòng chọn màu hoàn thiện."),
  layoutId: z.string().min(1, "Vui lòng chọn bố cục."),
})
