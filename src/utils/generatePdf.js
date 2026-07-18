import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

export async function exportElementToPdf(element, fileName) {
  if (!element) return

  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
  })

  const imageData = canvas.toDataURL("image/png")
  const orientation = canvas.width > canvas.height ? "landscape" : "portrait"
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const availableWidth = pageWidth - margin * 2
  const availableHeight = pageHeight - margin * 2
  const imageRatio = canvas.width / canvas.height

  let renderWidth = availableWidth
  let renderHeight = renderWidth / imageRatio

  if (renderHeight > availableHeight) {
    renderHeight = availableHeight
    renderWidth = renderHeight * imageRatio
  }

  const x = (pageWidth - renderWidth) / 2
  const y = margin

  pdf.addImage(imageData, "PNG", x, y, renderWidth, renderHeight)
  pdf.save(fileName)
}
