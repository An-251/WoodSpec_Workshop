import { materialOptions } from "@/data/reference/materials"
import { productTemplates } from "@/data/reference/products"
import { layoutOptions } from "@/features/configurator/utils"

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions"
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-3.5-flash"
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""
const legacyMixedDoorStyle = ["open", "mixed"].join("-")

const SYSTEM_INSTRUCTION = `
Bạn là trợ lý phỏng vấn thiết kế nội thất gỗ cho WoodSpec.
Mục tiêu là hỏi khách hàng tự nhiên như một người tư vấn, không hỏi thuật ngữ thợ mộc khó hiểu.
Câu đầu đã được ứng dụng hỏi để xác định khách muốn làm vật dụng gì.
Từ câu tiếp theo, hãy hỏi một câu ngắn dựa trên câu trả lời trước đó.
Chỉ hỏi về thông tin khách hàng trả lời được: công năng, đồ cần chứa, vị trí đặt, kiểu mở/kín, màu thích, kích thước ước lượng, ngân sách hoặc thời gian.
Khi đã đủ thông tin để chọn mẫu, đặt ready=true và tạo prompt chính bằng tiếng Việt.
Luôn trả về JSON thuần, không markdown, không giải thích.
Schema:
{
  "reply": "câu phản hồi ngắn thể hiện đã hiểu khách",
  "question": "câu hỏi tiếp theo, để trống nếu ready=true",
  "hint": "ví dụ trả lời ngắn",
  "ready": false,
  "prompt": "prompt chính nếu đã đủ thông tin"
}
`

function extractJson(text = "") {
  const trimmedText = text.trim()
  const jsonMatch = trimmedText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : trimmedText

  return JSON.parse(jsonText)
}

function getOutputText(data) {
  if (typeof data.output_text === "string") {
    return data.output_text
  }

  return data.steps
    ?.flatMap((step) => step.content ?? step.contents ?? [])
    ?.map((content) => content.text)
    ?.filter(Boolean)
    ?.join("\n")
}

function clampNumber(value, min, max, fallback) {
  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return fallback
  }

  return Math.min(Math.max(Math.round(numberValue), min), max)
}

function sanitizeGeneratedTemplate(rawTemplate, prompt) {
  const product = productTemplates.find((item) => item.id === rawTemplate.productId) ?? productTemplates[1]
  const material = materialOptions.find((item) => item.id === rawTemplate.materialId) ?? materialOptions[0]
  const color = material.colors.find((item) => item.id === rawTemplate.colorId) ?? material.colors[0]
  const layout = layoutOptions.find((item) => item.id === rawTemplate.layoutId) ?? layoutOptions[0]
  const dimensions = rawTemplate.dimensions ?? {}
  const designDetails = rawTemplate.designDetails ?? {}
  const requestDetails = rawTemplate.requestDetails ?? {}

  return {
    id: "ai-generated-template",
    label: rawTemplate.label || `Mẫu AI cho ${product.name.toLowerCase()}`,
    productId: product.id,
    materialId: material.id,
    colorId: color.id,
    layoutId: layout.id,
    prompt: rawTemplate.prompt || prompt,
    dimensions: {
      width: clampNumber(dimensions.width, 800, 2200, product.defaultDimensions.width),
      height: clampNumber(dimensions.height, 700, 2400, product.defaultDimensions.height),
      depth: clampNumber(dimensions.depth, 300, 700, product.defaultDimensions.depth),
    },
    designDetails: {
      doorStyle: designDetails.doorStyle === legacyMixedDoorStyle ? "two-doors" : designDetails.doorStyle || "two-doors",
      handleStyle: designDetails.handleStyle || "edge-pull",
      shelfStyle: designDetails.shelfStyle || "grid",
      backPanel: designDetails.backPanel || "closed",
      boardThickness: clampNumber(designDetails.boardThickness, 12, 30, 18),
      doorThickness: clampNumber(designDetails.doorThickness, 12, 30, 18),
      shelfThickness: clampNumber(designDetails.shelfThickness, 12, 30, 18),
      compartmentColumns: clampNumber(designDetails.compartmentColumns, 1, 5, layout.columns),
      compartmentRows: clampNumber(designDetails.compartmentRows, 1, 6, layout.rows),
      cableHole: Boolean(designDetails.cableHole),
      ventSlots: Boolean(designDetails.ventSlots),
      displayItems: designDetails.displayItems || "custom",
      toeKick: Boolean(designDetails.toeKick),
      seatPad: Boolean(designDetails.seatPad),
    },
    requestDetails: {
      placement: requestDetails.placement || "Vị trí theo mô tả của khách hàng.",
      usage: requestDetails.usage || prompt,
      compartmentNote: requestDetails.compartmentNote || "Cấu hình được Gemini đề xuất từ mô tả khách hàng.",
      accessories: requestDetails.accessories || "Phụ kiện cơ bản, xưởng xác nhận lại khi báo giá.",
      budget: clampNumber(requestDetails.budget, 3000000, 30000000, product.basePrice + 3000000),
      expectedTimeline: requestDetails.expectedTimeline || "Trong 3-4 tuần",
      installationCondition: requestDetails.installationCondition || "Cần đo đạc thực tế trước khi sản xuất.",
      region: requestDetails.region || "TP.HCM",
    },
    keywords: Array.isArray(rawTemplate.keywords) && rawTemplate.keywords.length > 0
      ? rawTemplate.keywords
      : [product.name.toLowerCase(), layout.name.toLowerCase()],
    score: 99,
    confidence: 98,
    generatedByAi: true,
  }
}

export function hasGeminiApiKey() {
  return Boolean(GEMINI_API_KEY.trim())
}

export async function requestGeminiInterviewTurn({ answers, transcript, turnCount }) {
  if (!hasGeminiApiKey()) {
    throw new Error("Thiếu VITE_GEMINI_API_KEY.")
  }

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      system_instruction: SYSTEM_INSTRUCTION,
      input: JSON.stringify({
        instruction: "Sinh bước phỏng vấn tiếp theo cho khách hàng WoodSpec.",
        answers,
        latest_answer: transcript,
        turn_count: turnCount,
      }),
      generation_config: {
        temperature: 0.4,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini trả về HTTP ${response.status}.`)
  }

  const data = await response.json()
  const outputText = getOutputText(data)

  if (!outputText) {
    throw new Error("Gemini không trả về nội dung.")
  }

  const parsed = extractJson(outputText)

  return {
    reply: parsed.reply || "Mình đã ghi nhận ý của anh chị.",
    question: parsed.question || "",
    hint: parsed.hint || "Trả lời theo nhu cầu thực tế của anh chị.",
    ready: Boolean(parsed.ready),
    prompt: parsed.prompt || "",
  }
}

export async function requestGeminiFinalPrompt({ answers }) {
  if (!hasGeminiApiKey()) {
    throw new Error("Thiếu VITE_GEMINI_API_KEY.")
  }

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      system_instruction: `
Bạn là trợ lý WoodSpec chuyên tổng hợp nhu cầu nội thất gỗ.
Hãy đọc các câu trả lời của khách hàng, loại bỏ lỗi lặp và câu thừa, rồi tạo một prompt chính ngắn gọn bằng tiếng Việt.
Prompt phải đủ để chọn template trong hệ thống, nên ưu tiên: vật dụng, vị trí đặt, công năng, sức chứa, kiểu đóng/mở, màu hoặc cảm giác thiết kế, kích thước nếu có.
Không hỏi lại. Không dùng markdown. Trả về JSON thuần.
Schema:
{
  "reply": "câu xác nhận ngắn",
  "prompt": "prompt chính ngắn gọn, tối đa 45 từ"
}
`,
      input: JSON.stringify({
        instruction: "Tổng hợp và chuẩn hóa câu trả lời khách hàng thành prompt chính.",
        answers,
      }),
      generation_config: {
        temperature: 0.2,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini trả về HTTP ${response.status}.`)
  }

  const data = await response.json()
  const outputText = getOutputText(data)

  if (!outputText) {
    throw new Error("Gemini không trả về nội dung.")
  }

  const parsed = extractJson(outputText)

  return {
    reply: parsed.reply || "Mình đã tổng hợp lại nhu cầu của anh chị.",
    prompt: parsed.prompt || "",
  }
}

export async function requestGeminiGeneratedTemplate({ prompt }) {
  if (!hasGeminiApiKey()) {
    throw new Error("Thiếu VITE_GEMINI_API_KEY.")
  }

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      system_instruction: `
Bạn là trợ lý thiết kế nội thất gỗ cho WoodSpec.
Hãy tạo một template sản phẩm khớp với prompt của khách hàng.
Template phải dùng đúng id trong danh sách cho phép để ứng dụng hiển thị mô hình 3D và cho người dùng chỉnh tiếp.
Không tạo ảnh. Không markdown. Trả về JSON thuần.

productId được phép: ${productTemplates.map((item) => item.id).join(", ")}
materialId được phép: ${materialOptions.map((item) => item.id).join(", ")}
layoutId được phép: ${layoutOptions.map((item) => item.id).join(", ")}
colorId phải thuộc materialId đã chọn.
doorStyle: open, two-doors, slatted, drawers
handleStyle: none, edge-pull, round-knob, vertical-bar
shelfStyle: none, grid, flat, tilted
backPanel: none, partial, closed, accent

Schema:
{
  "label": "tên mẫu ngắn",
  "productId": "id sản phẩm",
  "materialId": "id vật liệu",
  "colorId": "id màu",
  "layoutId": "id bố cục",
  "prompt": "prompt đã chuẩn hóa",
  "dimensions": { "width": 1200, "height": 1800, "depth": 400 },
  "designDetails": {
    "doorStyle": "two-doors",
    "handleStyle": "edge-pull",
    "shelfStyle": "grid",
    "backPanel": "closed",
    "boardThickness": 18,
    "doorThickness": 18,
    "shelfThickness": 18,
    "compartmentColumns": 3,
    "compartmentRows": 3,
    "cableHole": false,
    "ventSlots": false,
    "displayItems": "custom",
    "toeKick": true,
    "seatPad": false
  },
  "requestDetails": {
    "placement": "vị trí đặt",
    "usage": "công năng chính",
    "compartmentNote": "ghi chú số khoang hoặc cách chia",
    "accessories": "phụ kiện khách có thể hiểu",
    "budget": 9000000,
    "expectedTimeline": "Trong 3-4 tuần",
    "installationCondition": "điều kiện lắp đặt",
    "region": "TP.HCM"
  },
  "keywords": ["từ khóa 1", "từ khóa 2"]
}
`,
      input: JSON.stringify({
        instruction: "Tạo template nội thất gỗ khớp nhất với prompt khách hàng.",
        prompt,
      }),
      generation_config: {
        temperature: 0.35,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini trả về HTTP ${response.status}.`)
  }

  const data = await response.json()
  const outputText = getOutputText(data)

  if (!outputText) {
    throw new Error("Gemini không trả về nội dung.")
  }

  return sanitizeGeneratedTemplate(extractJson(outputText), prompt)
}
