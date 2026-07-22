import { create } from "zustand"
import { persist } from "zustand/middleware"

import { materialOptions } from "@/data/reference/materials"
import { productTemplates } from "@/data/reference/products"
import { calculateEstimatedPrice, dimensionLimits, layoutOptions } from "@/features/configurator/utils"
import { createQuoteRequest, validateQuoteRequest } from "@/features/rfq/utils"
import { generateSpec } from "@/utils/generateSpec"

const defaultProduct = productTemplates[1]
const defaultMaterial = materialOptions[1]
const defaultColor = defaultMaterial.colors[0]
const defaultLayout = layoutOptions[0]
const defaultDesignDetails = {
  doorStyle: "open",
  handleStyle: "edge-pull",
  shelfStyle: "grid",
  backPanel: "partial",
  boardThickness: 18,
  doorThickness: 18,
  shelfThickness: 18,
  compartmentColumns: 3,
  compartmentRows: 3,
  deskDrawerCount: 3,
  cableHole: false,
  ventSlots: false,
  displayItems: "books-decor",
  toeKick: false,
  seatPad: false,
}
const defaultRequestDetails = {
  initialPrompt: "",
  placement: "Phòng làm việc tại nhà",
  usage: "Làm việc, học tập và lưu trữ đồ dùng hằng ngày.",
  compartmentNote: "Ưu tiên khoang mở dễ lấy đồ, kích thước theo bố cục đang chọn.",
  accessories: "Phụ kiện đóng êm cơ bản, tay nắm gọn.",
  referenceImage: "",
  budget: 9000000,
  expectedTimeline: "Trong 2-3 tuần",
  installationCondition: "Nhà có thang máy hoặc lối vận chuyển thuận tiện.",
  region: "TP.HCM",
  workshopLimit: 3,
  requestStatus: "draft",
  finalConfirmed: false,
}
const defaultOrderDetails = {
  orderStatus: "not-started",
  depositStatus: "pending",
  depositPercent: 35,
  depositAmount: 0,
  depositPaidAt: "",
  workshopDepositConfirmedAt: "",
  productionStatus: "waiting-deposit",
  productionStageIndex: 0,
  productionUpdatedAt: "",
  deliveryStatus: "not-ready",
  deliveryUpdatedAt: "",
  customerReceivedAt: "",
  finalPaymentStatus: "pending",
  finalPaymentPaidAt: "",
  approvedChangeCost: 0,
  commissionRate: 0.08,
  paymentFeeRate: 0.01,
}
const legacyMixedDoorStyle = ["open", "mixed"].join("-")

function normalizeText(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
}

function toMillimeters(rawValue, unit = "", compactMeterDecimal = "") {
  const value = Number.parseFloat(String(rawValue).replace(",", "."))
  if (Number.isNaN(value)) {
    return null
  }

  if (unit === "m" && compactMeterDecimal) {
    const decimalText = String(compactMeterDecimal)
    const decimalValue = Number.parseInt(decimalText, 10) / 10 ** decimalText.length
    return Math.round((value + decimalValue) * 1000)
  }

  if (unit === "m" || (!unit && value > 0 && value <= 10)) {
    return Math.round(value * 1000)
  }

  if (unit === "cm") {
    return Math.round(value * 10)
  }

  return Math.round(value)
}

function clampDimension(field, value) {
  const limit = dimensionLimits[field]
  if (!limit || !value) {
    return value
  }

  return Math.min(Math.max(value, limit.min), limit.max)
}

function supportsSeatPad(productId, dimensions = {}) {
  return productId === "shoe-cabinet" && (dimensions.height ?? 0) <= 1000
}

function normalizeDesignDetailsForProduct(details = {}, productId, dimensions = {}) {
  const nextDetails = { ...details }

  if (nextDetails.doorStyle === legacyMixedDoorStyle) {
    nextDetails.doorStyle = "two-doors"
  }

  if (!supportsSeatPad(productId, dimensions)) {
    nextDetails.seatPad = false
  }

  if (nextDetails.shelfStyle === "flat") {
    nextDetails.compartmentColumns = Math.max(1, nextDetails.compartmentColumns ?? 1)
  }

  if (nextDetails.shelfStyle === "none") {
    nextDetails.compartmentColumns = 1
    nextDetails.compartmentRows = 1
  }

  return nextDetails
}

function getPromptDimensions(promptText, baseDimensions) {
  const text = normalizeText(promptText)
  const nextDimensions = { ...baseDimensions }
  const explicitMatches = [
    ["width", /(?:rong|ngang|dai|chieu dai|be ngang|be dai)[^\d]{0,24}(\d+(?:[.,]\d+)?)\s*(mm|cm|m)?\s*(\d{1,2})?/g],
    ["height", /(?:cao|chieu cao)[^\d]{0,24}(\d+(?:[.,]\d+)?)\s*(mm|cm|m)?\s*(\d{1,2})?/g],
    ["depth", /(?:sau|chieu sau|do sau)[^\d]{0,24}(\d+(?:[.,]\d+)?)\s*(mm|cm|m)?\s*(\d{1,2})?/g],
  ]

  explicitMatches.forEach(([field, pattern]) => {
    let match = pattern.exec(text)
    while (match) {
      const value = toMillimeters(match[1], match[2], match[3])
      if (value) {
        nextDimensions[field] = clampDimension(field, value)
      }
      match = pattern.exec(text)
    }
  })

  const sizeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(?:[x×]\s*(\d+(?:[.,]\d+)?))?\s*(mm|cm|m)?/)
  if (sizeMatch) {
    const unit = sizeMatch[4] || ""
    const width = toMillimeters(sizeMatch[1], unit)
    const height = toMillimeters(sizeMatch[2], unit)
    const depth = sizeMatch[3] ? toMillimeters(sizeMatch[3], unit) : null

    if (width) {
      nextDimensions.width = clampDimension("width", width)
    }
    if (height) {
      nextDimensions.height = clampDimension("height", height)
    }
    if (depth) {
      nextDimensions.depth = clampDimension("depth", depth)
    }
  }

  return nextDimensions
}

function getPromptDesignDetails(promptText, baseDetails, productId) {
  const text = normalizeText(promptText)
  const nextDetails = { ...baseDetails }

  const pairMatch = text.match(/(\d+)\s*(?:doi giay|doi)/)
  if (pairMatch && productId === "shoe-cabinet") {
    const pairs = Number.parseInt(pairMatch[1], 10)
    nextDetails.compartmentColumns = Math.max(2, nextDetails.compartmentColumns ?? 2)
    nextDetails.compartmentRows = Math.min(6, Math.max(3, Math.ceil(pairs / (nextDetails.compartmentColumns * 2))))
    nextDetails.shelfStyle = "tilted"
  }

  const columnsMatch = text.match(/(\d+)\s*(?:cot|o ngang|khoang ngang)/)
  if (columnsMatch) {
    nextDetails.compartmentColumns = Math.min(6, Math.max(1, Number.parseInt(columnsMatch[1], 10)))
  }

  const rowsMatch = text.match(/(\d+)\s*(?:tang|hang|o cao|khoang cao|khoang)/)
  if (rowsMatch) {
    nextDetails.compartmentRows = Math.min(8, Math.max(1, Number.parseInt(rowsMatch[1], 10)))
  }

  const boardMatch = text.match(/(?:van|tam)[^\d]{0,16}(\d{2})\s*mm/)
  if (boardMatch) {
    nextDetails.boardThickness = Math.min(30, Math.max(12, Number.parseInt(boardMatch[1], 10)))
  }

  const doorThicknessMatch = text.match(/(?:canh|cua)[^\d]{0,16}(\d{2})\s*mm/)
  if (doorThicknessMatch) {
    nextDetails.doorThickness = Math.min(30, Math.max(12, Number.parseInt(doorThicknessMatch[1], 10)))
  }

  const shelfThicknessMatch = text.match(/(?:ke|dot)[^\d]{0,16}(\d{2})\s*mm/)
  if (shelfThicknessMatch) {
    nextDetails.shelfThickness = Math.min(30, Math.max(12, Number.parseInt(shelfThicknessMatch[1], 10)))
  }

  if (/(dong kin|canh kin|cua kin|kin lai|che lai|lich su)/.test(text)) {
    nextDetails.doorStyle = "two-doors"
    nextDetails.backPanel = "closed"
  }

  if (/(khe thoang|thoang khi|cua chop|canh chop)/.test(text)) {
    nextDetails.doorStyle = "slatted"
    nextDetails.ventSlots = true
  }

  if (/(ghe ngoi|cho ngoi|dem ngoi|ngoi thay)/.test(text) && productId === "shoe-cabinet") {
    nextDetails.seatPad = true
  }

  if (/(ngan keo|hoc keo|ray keo)/.test(text)) {
    nextDetails.doorStyle = "drawers"
  }

  if (/(lo luon day|luon day|day dien|day sac|o dien|cap)/.test(text)) {
    nextDetails.cableHole = true
  }

  if (/(ke mo|khoang mo|trung bay|lay do nhanh)/.test(text) && !/(dong kin|canh kin|cua kin)/.test(text)) {
    nextDetails.doorStyle = "open"
  }

  if (/(khong tay nam|am tay|khoet canh)/.test(text)) {
    nextDetails.handleStyle = "edge-pull"
  } else if (/(tay nam doc|thanh doc)/.test(text)) {
    nextDetails.handleStyle = "vertical-bar"
  } else if (/(num tron|tay nam tron)/.test(text)) {
    nextDetails.handleStyle = "round-knob"
  }

  if (/(dat san|chan de|chan lui|nep chan)/.test(text)) {
    nextDetails.toeKick = true
  }

  return nextDetails
}

function getLayoutFromPromptDetails(details, fallbackLayout) {
  if (details.doorStyle === "drawers") {
    return layoutOptions.find((item) => item.id === "drawers-bottom") ?? fallbackLayout
  }

  if (["two-doors", "slatted"].includes(details.doorStyle)) {
    return layoutOptions.find((item) => item.id === "two-doors") ?? fallbackLayout
  }

  return fallbackLayout
}

function resetRequestProgress(details) {
  return {
    ...details,
    requestStatus: "draft",
    finalConfirmed: false,
  }
}

function resetOrderProgress() {
  return { ...defaultOrderDetails }
}

function createConfiguration(overrides = {}) {
  const configuration = {
    product: defaultProduct,
    productName: defaultProduct.name,
    dimensions: defaultProduct.defaultDimensions,
    material: defaultMaterial,
    color: defaultColor,
    layout: defaultLayout,
    designDetails: defaultDesignDetails,
    requestDetails: defaultRequestDetails,
    orderDetails: defaultOrderDetails,
    generatedSpec: null,
    quoteRequest: null,
    selectedQuoteId: "",
    ...overrides,
  }
  const product = productTemplates.find((item) => item.id === configuration.product?.id) ?? defaultProduct
  const material = materialOptions.find((item) => item.id === configuration.material?.id) ?? defaultMaterial
  const color = material.colors.find((item) => item.id === configuration.color?.id) ?? material.colors[0]
  const layout = layoutOptions.find((item) => item.id === configuration.layout?.id) ?? defaultLayout
  const normalizedConfiguration = {
    ...configuration,
    product,
    productName: product.name,
    material,
    color,
    layout,
  }
  const normalizedDetails = normalizeDesignDetailsForProduct(normalizedConfiguration.designDetails, product.id, normalizedConfiguration.dimensions)
  const configurationWithDetails = {
    ...normalizedConfiguration,
    designDetails: normalizedDetails,
  }

  return {
    ...configurationWithDetails,
    estimatedPrice: calculateEstimatedPrice(configurationWithDetails),
  }
}

const defaultConfiguration = createConfiguration()

export const useConfiguratorStore = create(
  persist(
    (set, get) => ({
      configuration: defaultConfiguration,

      setProduct: (productId) =>
        set((state) => {
          const product = productTemplates.find((item) => item.id === productId) ?? state.configuration.product
          return {
            configuration: createConfiguration({
              ...state.configuration,
              product,
              productName: product.name,
              dimensions: product.defaultDimensions,
              requestDetails: resetRequestProgress(state.configuration.requestDetails),
              orderDetails: resetOrderProgress(),
              quoteRequest: null,
              selectedQuoteId: "",
              generatedSpec: null,
            }),
          }
        }),

      setProductDesign: (productId, design = {}) =>
        set((state) => {
          const product = productTemplates.find((item) => item.id === productId) ?? state.configuration.product
          const material = materialOptions.find((item) => item.id === design.materialId) ?? state.configuration.material
          const color = material.colors.find((item) => item.id === design.colorId) ?? material.colors[0]
          const layout = layoutOptions.find((item) => item.id === design.layoutId) ?? state.configuration.layout

          return {
            configuration: createConfiguration({
              ...state.configuration,
              product,
              productName: product.name,
              dimensions: product.defaultDimensions,
              material,
              color,
              layout,
              designDetails: {
                ...defaultDesignDetails,
                ...(design.designDetails ?? {}),
              },
              requestDetails: resetRequestProgress(state.configuration.requestDetails),
              orderDetails: resetOrderProgress(),
              quoteRequest: null,
              selectedQuoteId: "",
              generatedSpec: null,
            }),
          }
        }),

      applyPromptSuggestion: (suggestion, promptText) =>
        set((state) => {
          const product = productTemplates.find((item) => item.id === suggestion.productId) ?? state.configuration.product
          const material = materialOptions.find((item) => item.id === suggestion.materialId) ?? state.configuration.material
          const color = material.colors.find((item) => item.id === suggestion.colorId) ?? material.colors[0]
          const suggestionLayout = layoutOptions.find((item) => item.id === suggestion.layoutId) ?? state.configuration.layout
          const effectivePrompt = promptText || suggestion.prompt || ""
          const baseDimensions = suggestion.dimensions ?? product.defaultDimensions
          const baseDesignDetails = {
            ...defaultDesignDetails,
            ...(suggestion.designDetails ?? {}),
          }
          const dimensions = getPromptDimensions(effectivePrompt, baseDimensions)
          const designDetails = getPromptDesignDetails(effectivePrompt, baseDesignDetails, product.id)
          const layout = getLayoutFromPromptDetails(designDetails, suggestionLayout)

          return {
            configuration: createConfiguration({
              ...state.configuration,
              product,
              productName: product.name,
              dimensions,
              material,
              color,
              layout,
              designDetails,
              requestDetails: resetRequestProgress({
                ...state.configuration.requestDetails,
                ...(suggestion.requestDetails ?? {}),
                initialPrompt: effectivePrompt,
              }),
              orderDetails: resetOrderProgress(),
              quoteRequest: null,
              selectedQuoteId: "",
              generatedSpec: null,
            }),
          }
        }),

      updateDimensions: (dimensions) =>
        set((state) => ({
          configuration: createConfiguration({
            ...state.configuration,
            dimensions: {
              ...state.configuration.dimensions,
              ...dimensions,
            },
            requestDetails: resetRequestProgress(state.configuration.requestDetails),
            orderDetails: resetOrderProgress(),
            quoteRequest: null,
            selectedQuoteId: "",
            generatedSpec: null,
          }),
        })),

      setMaterial: (materialId) =>
        set((state) => {
          const material = materialOptions.find((item) => item.id === materialId) ?? state.configuration.material
          return {
            configuration: createConfiguration({
              ...state.configuration,
              material,
              color: material.colors[0],
              requestDetails: resetRequestProgress(state.configuration.requestDetails),
              orderDetails: resetOrderProgress(),
              quoteRequest: null,
              selectedQuoteId: "",
              generatedSpec: null,
            }),
          }
        }),

      setColor: (colorId) =>
        set((state) => {
          const color = state.configuration.material.colors.find((item) => item.id === colorId) ?? state.configuration.color
          return {
            configuration: createConfiguration({
              ...state.configuration,
              color,
              requestDetails: resetRequestProgress(state.configuration.requestDetails),
              orderDetails: resetOrderProgress(),
              quoteRequest: null,
              selectedQuoteId: "",
              generatedSpec: null,
            }),
          }
        }),

      setLayout: (layoutId) =>
        set((state) => {
          const layout = layoutOptions.find((item) => item.id === layoutId) ?? state.configuration.layout
          return {
            configuration: createConfiguration({
              ...state.configuration,
              layout,
              requestDetails: resetRequestProgress(state.configuration.requestDetails),
              orderDetails: resetOrderProgress(),
              quoteRequest: null,
              selectedQuoteId: "",
              generatedSpec: null,
            }),
          }
        }),

      updateRequestDetails: (details) =>
        set((state) => ({
          configuration: createConfiguration({
            ...state.configuration,
            requestDetails: {
              ...state.configuration.requestDetails,
              ...details,
              requestStatus: "draft",
              finalConfirmed: false,
            },
            orderDetails: resetOrderProgress(),
            quoteRequest: null,
            selectedQuoteId: "",
            generatedSpec: null,
          }),
        })),

      updateDesignDetails: (details) =>
        set((state) => ({
          configuration: createConfiguration({
            ...state.configuration,
            designDetails: {
              ...state.configuration.designDetails,
              ...details,
            },
            requestDetails: resetRequestProgress(state.configuration.requestDetails),
            orderDetails: resetOrderProgress(),
            quoteRequest: null,
            selectedQuoteId: "",
            generatedSpec: null,
          }),
        })),

      markSpecReady: () =>
        set((state) => ({
          configuration: {
            ...state.configuration,
            requestDetails: {
              ...state.configuration.requestDetails,
              requestStatus: state.configuration.requestDetails.requestStatus === "draft" ? "ready-to-send" : state.configuration.requestDetails.requestStatus,
            },
            generatedSpec: generateSpec(state.configuration),
          },
        })),

      submitQuoteRequest: () => {
        const configuration = get().configuration
        const errors = validateQuoteRequest(configuration)

        if (errors.length > 0) {
          return { ok: false, errors }
        }

        const quoteRequest = createQuoteRequest()
        set((state) => ({
          configuration: {
            ...state.configuration,
            quoteRequest,
            selectedQuoteId: "",
            orderDetails: resetOrderProgress(),
            requestDetails: {
              ...state.configuration.requestDetails,
              requestStatus: "sent",
              finalConfirmed: false,
            },
            generatedSpec: generateSpec(state.configuration),
          },
        }))

        return { ok: true, quoteRequest }
      },

      markQuotesViewed: () =>
        set((state) => {
          if (state.configuration.requestDetails.requestStatus !== "sent") {
            return state
          }

          return {
            configuration: {
              ...state.configuration,
              requestDetails: {
                ...state.configuration.requestDetails,
                requestStatus: "quoted",
              },
            },
          }
        }),

      selectQuote: (quoteId) =>
        set((state) => {
          if (state.configuration.selectedQuoteId && state.configuration.selectedQuoteId !== quoteId) {
            return state
          }

          return {
            configuration: {
              ...state.configuration,
              selectedQuoteId: quoteId,
              orderDetails: resetOrderProgress(),
              requestDetails: {
                ...state.configuration.requestDetails,
                finalConfirmed: false,
              },
            },
          }
        }),

      cancelSelectedQuote: () =>
        set((state) => ({
          configuration: {
            ...state.configuration,
            selectedQuoteId: "",
            orderDetails: resetOrderProgress(),
            requestDetails: {
              ...state.configuration.requestDetails,
              requestStatus: state.configuration.requestDetails.requestStatus === "final-confirmed" ? "quoted" : state.configuration.requestDetails.requestStatus,
              finalConfirmed: false,
            },
          },
        })),

      confirmFinalSpec: () =>
        set((state) => ({
          configuration: {
            ...state.configuration,
            requestDetails: {
              ...state.configuration.requestDetails,
              requestStatus: "final-confirmed",
              finalConfirmed: true,
            },
            orderDetails: {
              ...state.configuration.orderDetails,
              orderStatus: state.configuration.orderDetails.orderStatus === "not-started" ? "waiting-deposit" : state.configuration.orderDetails.orderStatus,
            },
          },
        })),

      payDeposit: ({ quotePrice, depositRate }) => {
        const depositAmount = Math.round((quotePrice * depositRate) / 100000) * 100000
        const paidAt = new Date().toISOString()

        set((state) => ({
          configuration: {
            ...state.configuration,
            orderDetails: {
              ...state.configuration.orderDetails,
              orderStatus: "in-production",
              depositStatus: "confirmed",
              depositPercent: Math.round(depositRate * 100),
              depositAmount,
              depositPaidAt: paidAt,
              workshopDepositConfirmedAt: paidAt,
              productionStatus: "in-production",
              productionUpdatedAt: paidAt,
            },
          },
        }))
      },

      completeProductionStage: (maxStageIndex) =>
        set((state) => {
          const currentIndex = state.configuration.orderDetails.productionStageIndex ?? 0
          const nextIndex = Math.min(currentIndex + 1, maxStageIndex)
          const isCompleted = nextIndex >= maxStageIndex

          return {
            configuration: {
              ...state.configuration,
              orderDetails: {
                ...state.configuration.orderDetails,
                orderStatus: isCompleted ? "ready-for-delivery" : "in-production",
                productionStatus: isCompleted ? "completed" : "in-production",
                productionStageIndex: nextIndex,
                deliveryStatus: isCompleted ? "preparing" : state.configuration.orderDetails.deliveryStatus,
                productionUpdatedAt: new Date().toISOString(),
              },
            },
          }
        }),

      updateDeliveryStatus: (deliveryStatus) =>
        set((state) => ({
          configuration: {
            ...state.configuration,
            orderDetails: {
              ...state.configuration.orderDetails,
              orderStatus: deliveryStatus === "delivered" ? "delivered" : "delivering",
              deliveryStatus,
              deliveryUpdatedAt: new Date().toISOString(),
            },
          },
        })),

      confirmCustomerReceived: () =>
        set((state) => ({
          configuration: {
            ...state.configuration,
            orderDetails: {
              ...state.configuration.orderDetails,
              orderStatus: "received",
              deliveryStatus: "delivered",
              customerReceivedAt: new Date().toISOString(),
            },
          },
        })),

      payFinalAmount: () =>
        set((state) => ({
          configuration: {
            ...state.configuration,
            orderDetails: {
              ...state.configuration.orderDetails,
              orderStatus: "completed",
              finalPaymentStatus: "paid",
              finalPaymentPaidAt: new Date().toISOString(),
            },
          },
        })),

      generateConfigurationSpec: () =>
        set((state) => ({
          configuration: {
            ...state.configuration,
            requestDetails: {
              ...state.configuration.requestDetails,
              requestStatus: state.configuration.requestDetails.requestStatus === "draft" ? "ready-to-send" : state.configuration.requestDetails.requestStatus,
            },
            generatedSpec: generateSpec(state.configuration),
          },
        })),

      resetConfiguration: () => set({ configuration: defaultConfiguration }),
    }),
    {
      name: "woodspec_configurator",
      partialize: (state) => ({ configuration: state.configuration }),
      merge: (persistedState, currentState) => {
        const persistedConfiguration = persistedState?.configuration ?? {}

        return {
          ...currentState,
          configuration: createConfiguration({
            ...currentState.configuration,
            ...persistedConfiguration,
            requestDetails: {
              ...defaultRequestDetails,
              ...(persistedConfiguration.requestDetails ?? {}),
            },
            orderDetails: {
              ...defaultOrderDetails,
              ...(persistedConfiguration.orderDetails ?? {}),
            },
            designDetails: {
              ...defaultDesignDetails,
              ...(persistedConfiguration.designDetails ?? {}),
            },
          }),
        }
      },
    }
  )
)
