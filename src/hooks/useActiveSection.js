import { useEffect, useState } from "react"

export function useActiveSection(sectionIds) {
  const [activeSection, setActiveSection] = useState(() => {
    const hashSection = window.location.hash.replace("#", "")
    return sectionIds.includes(hashSection) ? hashSection : sectionIds[0]
  })

  useEffect(() => {
    let frameId = null

    function updateActiveSection() {
      const scrollPosition = window.scrollY + 150
      const documentBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8

      if (documentBottom) {
        setActiveSection(sectionIds[sectionIds.length - 1])
        return
      }

      const currentSection = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .filter((section) => section.offsetTop <= scrollPosition)
        .at(-1)

      if (currentSection?.id) {
        setActiveSection(currentSection.id)
      }
    }

    function requestUpdate() {
      if (frameId) {
        return
      }

      frameId = window.requestAnimationFrame(() => {
        updateActiveSection()
        frameId = null
      })
    }

    updateActiveSection()
    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)
    window.addEventListener("hashchange", updateActiveSection)

    return () => {
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)
      window.removeEventListener("hashchange", updateActiveSection)

      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [sectionIds])

  return activeSection
}
