export function parseBlueprintDimensions(value = "") {
  const dimensions = value
    .match(/\d+(?:[.,]\d+)?/g)
    ?.slice(0, 3)
    .map((part) => Number(part.replace(",", ".")))

  return dimensions?.length === 3 ? dimensions : [100, 50, 75]
}

export function getBlueprintDimensions(value) {
  const [widthValue, depth, height] = parseBlueprintDimensions(value)

  return [
    ["Dài / rộng", `${widthValue} cm`],
    ["Chiều sâu", `${depth} cm`],
    ["Chiều cao", `${height} cm`],
  ]
}
