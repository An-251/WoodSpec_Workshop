function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function normalizeColor(hex) {
  return typeof hex === "string" && /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#a69c91"
}

function getDarkerColor(hex) {
  const value = normalizeColor(hex).replace("#", "")
  const r = Math.max(0, Number.parseInt(value.slice(0, 2), 16) - 42)
  const g = Math.max(0, Number.parseInt(value.slice(2, 4), 16) - 46)
  const b = Math.max(0, Number.parseInt(value.slice(4, 6), 16) - 54)

  return `rgb(${r}, ${g}, ${b})`
}

function Cabinet3DCardPreview({ configuration, className = "" }) {
  const { dimensions, color, layout, designDetails = {}, product } = configuration
  const columns = clamp(designDetails.compartmentColumns ?? layout.columns ?? 3, 1, 6)
  const rows = clamp(designDetails.compartmentRows ?? layout.rows ?? 3, 1, 6)
  const bodyColor = normalizeColor(color?.hex)
  const edgeColor = getDarkerColor(bodyColor)
  const ratio = clamp(dimensions.width / Math.max(dimensions.height, 1), 0.55, 2.4)
  const isDesk = product.id === "study-desk"
  const isLow = ["tv-console", "sideboard"].includes(product.id)
  const width = isDesk ? "76%" : isLow ? "78%" : ratio > 1 ? "74%" : "54%"
  const height = isDesk ? "34%" : isLow ? "38%" : ratio > 1 ? "46%" : "70%"
  const depth = clamp(dimensions.depth / 10, 26, 58)
  const frontStyle = {
    "--body-color": bodyColor,
    "--edge-color": edgeColor,
    "--depth": `${depth}px`,
    width,
    height,
  }

  return (
    <div className={`relative overflow-hidden bg-[#efe9df] ${className}`} aria-label={`Mô hình 3D ${configuration.productName}`}>
      <div className="absolute inset-x-8 bottom-8 h-8 rounded-full bg-[#171717]/12 blur-xl" />
      <div className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 [perspective:900px]">
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center [transform-style:preserve-3d] [transform:rotateX(8deg)_rotateY(-24deg)]" style={frontStyle}>
          <div className="absolute inset-0 rounded-md border-[5px] border-[var(--edge-color)] bg-[linear-gradient(135deg,rgba(255,255,255,0.4),var(--body-color)_44%,rgba(74,42,18,0.24))] shadow-[0_18px_32px_rgba(0,0,0,0.10)] [transform:translateZ(var(--depth))]">
            {!isDesk && (
              <div className="grid h-full w-full gap-[3px] p-[10px]" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
                {Array.from({ length: columns * rows }).map((_, index) => (
                  <div
                    key={index}
                    className="relative border border-[var(--edge-color)]/55 bg-white/10 shadow-inner"
                  >
                    {(designDetails.doorStyle === "two-doors" || designDetails.doorStyle === "slatted") && index < columns && (
                      <span className="absolute inset-1 rounded-sm bg-white/18 shadow-inner" />
                    )}
                    {designDetails.ventSlots && index < columns && (
                      <span className="absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 bg-white/70 shadow-[0_8px_0_rgba(255,255,255,0.55),0_-8px_0_rgba(255,255,255,0.55)]" />
                    )}
                    {index % 5 === 1 && <span className="absolute bottom-2 left-2 h-1/4 w-1/2 rounded-full bg-white/55" />}
                  </div>
                ))}
              </div>
            )}
            {isDesk && (
              <div className="absolute inset-x-2 top-4 h-8 rounded-sm bg-white/18 shadow-inner" />
            )}
            {(designDetails.handleStyle === "vertical-bar" || designDetails.doorStyle !== "open") && (
              <span className="absolute right-[18%] top-1/2 h-16 w-1.5 -translate-y-1/2 rounded-full bg-[var(--edge-color)]" />
            )}
          </div>
          <div className="absolute inset-y-0 right-0 w-[var(--depth)] rounded-r-md bg-[linear-gradient(90deg,var(--edge-color),var(--body-color))] [transform:rotateY(90deg)_translateZ(calc(var(--depth)/2))_translateX(calc(var(--depth)/2))]" />
          <div className="absolute inset-x-0 top-0 h-[var(--depth)] rounded-t-md bg-[linear-gradient(180deg,rgba(255,255,255,0.36),var(--body-color))] [transform:rotateX(90deg)_translateZ(calc(var(--depth)/2))_translateY(calc(var(--depth)/-2))]" />
          {(designDetails.toeKick || isLow || isDesk) && (
            <div className="absolute -bottom-5 left-[15%] right-[15%] h-5 rounded-sm bg-[var(--edge-color)] [transform:translateZ(calc(var(--depth)*0.8))]" />
          )}
        </div>
      </div>
    </div>
  )
}

export default Cabinet3DCardPreview
