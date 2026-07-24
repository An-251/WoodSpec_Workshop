import { useId } from "react"

import { parseBlueprintDimensions } from "@/features/workshop/utils/blueprint"

function DimensionHorizontal({ x1, x2, y, objectY, label }) {
  const middle = (x1 + x2) / 2
  const labelWidth = Math.max(72, label.length * 8)

  return (
    <g color="#a64236">
      <path d={`M${x1} ${objectY}V${y + 7}M${x2} ${objectY}V${y + 7}M${x1} ${y}H${x2}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d={`M${x1} ${y - 6}V${y + 6}M${x2} ${y - 6}V${y + 6}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d={`M${x1} ${y}l9 -4v8zM${x2} ${y}l-9 -4v8z`} fill="currentColor" />
      <rect x={middle - labelWidth / 2} y={y - 13} width={labelWidth} height="26" rx="3" fill="#fffdf9" />
      <text x={middle} y={y + 5} fill="currentColor" fontSize="14" fontWeight="700" textAnchor="middle">
        {label}
      </text>
    </g>
  )
}

function DimensionVertical({ x, y1, y2, objectX, label }) {
  const middle = (y1 + y2) / 2
  const labelWidth = Math.max(72, label.length * 8)

  return (
    <g color="#a64236">
      <path d={`M${objectX} ${y1}H${x - 7}M${objectX} ${y2}H${x - 7}M${x} ${y1}V${y2}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d={`M${x - 6} ${y1}H${x + 6}M${x - 6} ${y2}H${x + 6}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d={`M${x} ${y1}l-4 9h8zM${x} ${y2}l-4 -9h8z`} fill="currentColor" />
      <g transform={`translate(${x}, ${middle}) rotate(-90)`}>
        <rect x={-labelWidth / 2} y="-13" width={labelWidth} height="26" rx="3" fill="#fffdf9" />
        <text y="5" fill="currentColor" fontSize="14" fontWeight="700" textAnchor="middle">
          {label}
        </text>
      </g>
    </g>
  )
}

function DrawingCaption({ viewLabel, request, showNotes }) {
  if (!showNotes) return null

  return (
    <g>
      <text x="68" y="72" fill="#164e5a" fontSize="20" fontWeight="800">
        {viewLabel.toUpperCase()}
      </text>
      <text x="68" y="96" fill="#6b5d5b" fontSize="13">
        {request.product} · Đơn vị: cm
      </text>
      <path d="M68 108H250" stroke="#d5695d" strokeWidth="3" />
    </g>
  )
}

function TableDrawing({ view, dimensions, showDimensions }) {
  const [length, depth, height] = dimensions
  const isTop = view === "top"
  const physicalWidth = view === "side" ? depth : length
  const physicalHeight = isTop ? depth : height
  const scale = Math.min(660 / physicalWidth, 350 / physicalHeight)
  const width = physicalWidth * scale
  const drawingHeight = physicalHeight * scale
  const x = 500 - width / 2
  const y = 305 - drawingHeight / 2
  const line = "#164e5a"
  const fill = "#ead6c8"

  if (isTop) {
    return (
      <g>
        <rect x={x} y={y} width={width} height={drawingHeight} rx="6" fill={fill} fillOpacity=".55" stroke={line} strokeWidth="3" />
        <path d={`M${x + 18} ${y + 18}H${x + width - 18}M${x + 18} ${y + drawingHeight - 18}H${x + width - 18}`} stroke={line} strokeDasharray="7 6" strokeOpacity=".5" />
        <path d={`M${x + width / 2} ${y - 12}V${y + drawingHeight + 12}M${x - 12} ${y + drawingHeight / 2}H${x + width + 12}`} stroke={line} strokeDasharray="10 7" strokeOpacity=".35" />
        {showDimensions ? (
          <>
            <DimensionHorizontal x1={x} x2={x + width} y={y + drawingHeight + 62} objectY={y + drawingHeight} label={`${length} cm`} />
            <DimensionVertical x={x - 62} y1={y} y2={y + drawingHeight} objectX={x} label={`${depth} cm`} />
          </>
        ) : null}
      </g>
    )
  }

  const topThickness = Math.max(14, 4 * scale)
  const legWidth = Math.max(15, 7 * scale)
  const inset = Math.min(width * 0.16, 60)
  const stretcherY = y + drawingHeight * 0.6

  return (
    <g>
      <rect x={x} y={y} width={width} height={topThickness} rx="3" fill={fill} stroke={line} strokeWidth="3" />
      <rect x={x + inset} y={y + topThickness} width={legWidth} height={drawingHeight - topThickness} fill={fill} fillOpacity=".65" stroke={line} strokeWidth="3" />
      <rect x={x + width - inset - legWidth} y={y + topThickness} width={legWidth} height={drawingHeight - topThickness} fill={fill} fillOpacity=".65" stroke={line} strokeWidth="3" />
      <path d={`M${x + inset + legWidth} ${stretcherY}H${x + width - inset - legWidth}`} stroke={line} strokeWidth="9" />
      <path d={`M${x + width / 2} ${y - 12}V${y + drawingHeight + 12}`} stroke={line} strokeDasharray="10 7" strokeOpacity=".35" />
      {showDimensions ? (
        <>
          <DimensionHorizontal x1={x} x2={x + width} y={y + drawingHeight + 62} objectY={y + drawingHeight} label={`${physicalWidth} cm`} />
          <DimensionVertical x={x - 62} y1={y} y2={y + drawingHeight} objectX={x} label={`${height} cm`} />
        </>
      ) : null}
    </g>
  )
}

function ChairDrawing({ view, dimensions, showDimensions }) {
  const [widthValue, depth, height] = dimensions
  const isTop = view === "top"
  const physicalWidth = view === "side" ? depth : widthValue
  const physicalHeight = isTop ? depth : height
  const scale = Math.min(480 / physicalWidth, 380 / physicalHeight)
  const width = physicalWidth * scale
  const drawingHeight = physicalHeight * scale
  const x = 500 - width / 2
  const y = 305 - drawingHeight / 2
  const line = "#164e5a"
  const fill = "#ead6c8"

  if (isTop) {
    return (
      <g>
        <rect x={x} y={y + 18} width={width} height={drawingHeight - 18} rx="8" fill={fill} fillOpacity=".55" stroke={line} strokeWidth="3" />
        <rect x={x - 5} y={y} width={width + 10} height="18" rx="4" fill={fill} stroke={line} strokeWidth="3" />
        <path d={`M${x + width / 2} ${y - 12}V${y + drawingHeight + 12}M${x - 12} ${y + drawingHeight / 2}H${x + width + 12}`} stroke={line} strokeDasharray="10 7" strokeOpacity=".35" />
        {showDimensions ? (
          <>
            <DimensionHorizontal x1={x} x2={x + width} y={y + drawingHeight + 62} objectY={y + drawingHeight} label={`${widthValue} cm`} />
            <DimensionVertical x={x - 62} y1={y} y2={y + drawingHeight} objectX={x} label={`${depth} cm`} />
          </>
        ) : null}
      </g>
    )
  }

  const seatY = y + drawingHeight * 0.53
  const rail = Math.max(10, scale * 3.5)
  const legInset = Math.min(16, width * 0.08)

  return (
    <g>
      {view === "front" ? (
        <>
          <rect x={x + legInset} y={y} width={rail} height={drawingHeight} fill={fill} stroke={line} strokeWidth="3" />
          <rect x={x + width - legInset - rail} y={y} width={rail} height={drawingHeight} fill={fill} stroke={line} strokeWidth="3" />
          <rect x={x + legInset} y={y + drawingHeight * 0.14} width={width - legInset * 2} height={drawingHeight * 0.2} rx="5" fill={fill} fillOpacity=".6" stroke={line} strokeWidth="3" />
          <rect x={x} y={seatY} width={width} height={Math.max(14, scale * 4)} rx="4" fill={fill} stroke={line} strokeWidth="3" />
        </>
      ) : (
        <>
          <path d={`M${x + rail * 1.5} ${y + drawingHeight}L${x + rail} ${y + drawingHeight * 0.06}Q${x + rail} ${y} ${x + rail * 1.7} ${y}`} fill="none" stroke={line} strokeWidth={rail} />
          <rect x={x} y={seatY} width={width} height={Math.max(14, scale * 4)} rx="4" fill={fill} stroke={line} strokeWidth="3" />
          <path d={`M${x + width - legInset} ${seatY + 8}L${x + width - legInset - rail * 0.2} ${y + drawingHeight}`} stroke={line} strokeWidth={rail} />
        </>
      )}
      <path d={`M${x + width / 2} ${y - 12}V${y + drawingHeight + 12}`} stroke={line} strokeDasharray="10 7" strokeOpacity=".35" />
      {showDimensions ? (
        <>
          <DimensionHorizontal x1={x} x2={x + width} y={y + drawingHeight + 62} objectY={y + drawingHeight} label={`${physicalWidth} cm`} />
          <DimensionVertical x={x - 62} y1={y} y2={y + drawingHeight} objectX={x} label={`${height} cm`} />
        </>
      ) : null}
    </g>
  )
}

function CabinetDrawing({ view, dimensions, showDimensions }) {
  const [widthValue, depth, height] = dimensions
  const isTop = view === "top"
  const physicalWidth = view === "side" ? depth : widthValue
  const physicalHeight = isTop ? depth : height
  const scale = Math.min(620 / physicalWidth, 380 / physicalHeight)
  const width = physicalWidth * scale
  const drawingHeight = physicalHeight * scale
  const x = 500 - width / 2
  const y = 305 - drawingHeight / 2
  const line = "#164e5a"

  return (
    <g>
      <rect x={x} y={y} width={width} height={drawingHeight} fill="#ead6c8" fillOpacity=".4" stroke={line} strokeWidth="3" />
      {view === "front" ? (
        <>
          <path d={`M${x + width / 2} ${y}V${y + drawingHeight}`} stroke={line} strokeWidth="2" />
          <path d={`M${x} ${y + drawingHeight / 3}H${x + width}M${x} ${y + drawingHeight * 2 / 3}H${x + width}`} stroke={line} strokeWidth="2" />
          <circle cx={x + width / 2 - 12} cy={y + drawingHeight / 2} r="4" fill={line} />
          <circle cx={x + width / 2 + 12} cy={y + drawingHeight / 2} r="4" fill={line} />
        </>
      ) : null}
      <path d={`M${x + width / 2} ${y - 12}V${y + drawingHeight + 12}M${x - 12} ${y + drawingHeight / 2}H${x + width + 12}`} stroke={line} strokeDasharray="10 7" strokeOpacity=".35" />
      {showDimensions ? (
        <>
          <DimensionHorizontal x1={x} x2={x + width} y={y + drawingHeight + 62} objectY={y + drawingHeight} label={`${physicalWidth} cm`} />
          <DimensionVertical x={x - 62} y1={y} y2={y + drawingHeight} objectX={x} label={`${physicalHeight} cm`} />
        </>
      ) : null}
    </g>
  )
}

export function BlueprintDrawing({
  request,
  view = "front",
  showGrid = true,
  showDimensions = true,
  showNotes = true,
  svgRef,
  className = "",
}) {
  const patternId = `blueprint-grid-${useId().replaceAll(":", "")}`
  const dimensions = parseBlueprintDimensions(request.dimensions)
  const normalizedProduct = request.product.toLocaleLowerCase("vi")
  const viewLabel = {
    front: "Mặt đứng",
    top: "Mặt bằng",
    side: "Mặt bên",
  }[view]
  const Drawing = normalizedProduct.includes("bàn")
    ? TableDrawing
    : normalizedProduct.includes("ghế")
      ? ChairDrawing
      : CabinetDrawing

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      width="1000"
      height="650"
      viewBox="0 0 1000 650"
      role="img"
      aria-labelledby={`${patternId}-title ${patternId}-description`}
      className={className}
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <title id={`${patternId}-title`}>{`${viewLabel} ${request.product}`}</title>
      <desc id={`${patternId}-description`}>{`Bản vẽ kỹ thuật ${request.dimensions}`}</desc>
      <defs>
        <pattern id={patternId} width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M20 0V100M40 0V100M60 0V100M80 0V100M0 20H100M0 40H100M0 60H100M0 80H100" fill="none" stroke="#d7e3e4" strokeWidth="1" />
          <path d="M100 0H0V100" fill="none" stroke="#bacfd1" strokeWidth="1.2" />
        </pattern>
      </defs>
      <rect width="1000" height="650" fill="#fffdf9" />
      {showGrid ? <rect width="1000" height="650" fill={`url(#${patternId})`} /> : null}
      <Drawing view={view} dimensions={dimensions} showDimensions={showDimensions} />
      <DrawingCaption viewLabel={viewLabel} request={request} showNotes={showNotes} />
      <g transform="translate(720 545)">
        <rect width="220" height="70" fill="#fffdf9" stroke="#164e5a" strokeWidth="1.5" />
        <path d="M0 27H220M76 27V70M150 27V70" stroke="#164e5a" strokeWidth="1" />
        <text x="10" y="18" fill="#164e5a" fontSize="11" fontWeight="700">{request.reference}</text>
        <text x="10" y="46" fill="#6b5d5b" fontSize="9">TỈ LỆ</text>
        <text x="10" y="62" fill="#164e5a" fontSize="12" fontWeight="700">{request.blueprint?.scale || "1:20"}</text>
        <text x="86" y="46" fill="#6b5d5b" fontSize="9">BẢN SỬA</text>
        <text x="86" y="62" fill="#164e5a" fontSize="12" fontWeight="700">{request.blueprint?.revision || "R01"}</text>
        <text x="160" y="46" fill="#6b5d5b" fontSize="9">ĐƠN VỊ</text>
        <text x="160" y="62" fill="#164e5a" fontSize="12" fontWeight="700">CM</text>
      </g>
    </svg>
  )
}
