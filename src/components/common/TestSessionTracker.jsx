import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

import {
  disconnectTestSession,
  getStoredTestSession,
  recordTestEvent,
} from "@/services/testSessionService"
import { useAuthStore } from "@/stores/useAuthStore"

function getElementLabel(element) {
  if (!element) {
    return "Không xác định"
  }

  const label =
    element.getAttribute("aria-label") ||
    element.getAttribute("title") ||
    element.name ||
    element.id ||
    element.innerText ||
    element.value ||
    element.tagName

  return String(label).replace(/\s+/g, " ").trim().slice(0, 120) || element.tagName
}

function getTrackableElement(target) {
  return target?.closest?.("button,a,input,select,textarea,[role='button']")
}

function TestSessionTracker() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const lastPathRef = useRef("")

  useEffect(() => {
    if (!user || !getStoredTestSession()) {
      return
    }

    const path = `${location.pathname}${location.search}${location.hash}`

    if (lastPathRef.current === path) {
      return
    }

    lastPathRef.current = path
    recordTestEvent("route_view", path)
  }, [location.hash, location.pathname, location.search, user])

  useEffect(() => {
    if (!user) {
      return undefined
    }

    function handleClick(event) {
      const element = getTrackableElement(event.target)

      if (!element) {
        return
      }

      recordTestEvent("click", getElementLabel(element), {
        tagName: element.tagName,
        inputType: element.getAttribute("type") || undefined,
      })
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        recordTestEvent("visibility_hidden", "Tab hoặc cửa sổ bị ẩn")
      }
    }

    function handlePageHide() {
      disconnectTestSession("pagehide")
    }

    document.addEventListener("click", handleClick, true)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("pagehide", handlePageHide)

    return () => {
      document.removeEventListener("click", handleClick, true)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("pagehide", handlePageHide)
    }
  }, [user])

  return null
}

export default TestSessionTracker
