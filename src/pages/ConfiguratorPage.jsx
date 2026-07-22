import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import Cabinet3DPreview from "@/features/configurator/components/Cabinet3DPreview"
import PartInspectorPanel from "@/features/configurator/components/PartInspectorPanel"
import { useConfiguratorStore } from "@/stores/useConfiguratorStore"

function ConfiguratorPage() {
  const [selectedPart, setSelectedPart] = useState("overall")
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const configuration = useConfiguratorStore((state) => state.configuration)
  const updateDimensions = useConfiguratorStore((state) => state.updateDimensions)
  const setMaterial = useConfiguratorStore((state) => state.setMaterial)
  const setColor = useConfiguratorStore((state) => state.setColor)
  const updateDesignDetails = useConfiguratorStore((state) => state.updateDesignDetails)
  const updateRequestDetails = useConfiguratorStore((state) => state.updateRequestDetails)
  const markSpecReady = useConfiguratorStore((state) => state.markSpecReady)
  const isAppFlow = location.pathname.startsWith("/app")
  const stickyTopClass = isAppFlow ? "xl:top-6" : "xl:top-28"
  const layoutClass = inspectorOpen ? "xl:grid-cols-[minmax(0,1fr)_390px]" : "xl:grid-cols-[minmax(0,1fr)_72px]"
  const specReviewPath = isAppFlow ? ROUTES.appSpecReview : ROUTES.specReview

  const previewHeightClass = isAppFlow ? "xl:h-[calc(100vh-3rem)]" : "xl:h-[calc(100vh-9rem)]"

  function handleReviewSpec() {
    markSpecReady()
    navigate(specReviewPath)
  }

  return (
    <section className={`mx-auto grid w-full max-w-full items-start gap-6 py-3 xl:overflow-hidden ${layoutClass}`}>
      <div className={`min-w-0 ${previewHeightClass} xl:sticky ${stickyTopClass} xl:self-start`}>
        <Cabinet3DPreview
          configuration={configuration}
          selectedPart={selectedPart}
          onPartSelect={setSelectedPart}
          className="h-full"
        />
      </div>

      <PartInspectorPanel
        configuration={configuration}
        selectedPart={selectedPart}
        isOpen={inspectorOpen}
        onToggleOpen={() => setInspectorOpen((value) => !value)}
        onReviewSpec={handleReviewSpec}
        onSelectedPartChange={setSelectedPart}
        onDimensionsChange={updateDimensions}
        onMaterialChange={setMaterial}
        onColorChange={setColor}
        onDesignDetailsChange={updateDesignDetails}
        onRequestDetailsChange={updateRequestDetails}
        className={`xl:sticky ${stickyTopClass} ${previewHeightClass} xl:overflow-y-auto`}
      />
    </section>
  )
}

export default ConfiguratorPage
