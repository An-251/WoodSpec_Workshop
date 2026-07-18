import { useEffect, useMemo, useState } from "react"
import { Download } from "lucide-react"
import { useLocation } from "react-router-dom"

import { clearStoredAuth, getTrackingAuth } from "@/services/authService"
import {
  appendTestEvent,
  disconnectTestSession,
  exportCurrentTestLog,
  getTestSessionSummary,
} from "@/services/testSessionService"

function describeTarget(target) {
  const element = target?.closest?.("button, a, input, textarea, select, [role='button']")
  if (!element) return target?.tagName?.toLowerCase?.() || "screen"

  const isField = ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)
  const label =
    element.getAttribute("aria-label") ||
    element.getAttribute("title") ||
    element.placeholder ||
    element.name ||
    (isField ? element.type : element.innerText) ||
    element.tagName

  return String(label || "screen").replace(/\s+/g, " ").trim().slice(0, 120)
}

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function TestSessionTracker() {
  const location = useLocation()
  const [auth, setAuth] = useState(() => getTrackingAuth())
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [summary, setSummary] = useState(() => getTestSessionSummary(getTrackingAuth()))
  const isActive = Boolean(auth?.testMode)

  const filename = useMemo(() => {
    const email = String(auth?.email || auth?.testerEmail || "tester").replace(/[^a-z0-9]+/gi, "_")
    return `woodspec-test-log-${email}.json`
  }, [auth?.email, auth?.testerEmail])

  useEffect(() => {
    const refreshAuth = () => {
      const nextAuth = getTrackingAuth()
      setAuth(nextAuth)
      setSummary(getTestSessionSummary(nextAuth))
    }

    window.addEventListener("woodspec-test-session-started", refreshAuth)
    window.addEventListener("woodspec-test-session-ended", refreshAuth)
    window.addEventListener("storage", refreshAuth)

    return () => {
      window.removeEventListener("woodspec-test-session-started", refreshAuth)
      window.removeEventListener("woodspec-test-session-ended", refreshAuth)
      window.removeEventListener("storage", refreshAuth)
    }
  }, [])

  useEffect(() => {
    if (!isActive) return undefined

    const tick = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - auth.loginAt) / 1000)))
      setSummary(getTestSessionSummary(auth))
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [auth, isActive])

  useEffect(() => {
    if (!isActive) return

    appendTestEvent(auth, {
      type: "route_view",
      target: location.pathname,
      path: location.pathname,
    })
    setSummary(getTestSessionSummary(auth))
  }, [auth, isActive, location.pathname])

  useEffect(() => {
    if (!isActive) return undefined

    const handleClick = (event) => {
      appendTestEvent(auth, {
        type: "click",
        target: describeTarget(event.target),
        path: window.location.pathname,
      })
      setSummary(getTestSessionSummary(auth))
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [auth, isActive])

  useEffect(() => {
    if (!isActive) return undefined

    let hasDisconnected = false
    const disconnect = (reason) => {
      if (hasDisconnected) return
      hasDisconnected = true
      disconnectTestSession(auth, reason)
      clearStoredAuth()
    }

    const handlePageHide = () => disconnect("pagehide")
    const handleBeforeUnload = () => disconnect("beforeunload")
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        appendTestEvent(auth, {
          type: "visibility_hidden",
          target: "Document hidden",
          path: window.location.pathname,
        })
        setSummary(getTestSessionSummary(auth))
      }
    }

    window.addEventListener("pagehide", handlePageHide)
    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("pagehide", handlePageHide)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [auth, isActive])

  if (!isActive) return null

  const handleExport = () => {
    const log = exportCurrentTestLog(auth)
    if (log) downloadJson(filename, log)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-[14px] border border-[#ead8ca] bg-white/95 px-4 py-3 text-left text-[#231a11] shadow-[0_18px_50px_rgba(36,29,22,0.16)] backdrop-blur">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#854f19]">Phiên test</p>
        <p className="mt-1 max-w-[220px] truncate text-[13px] font-bold">{auth.email || auth.testerEmail}</p>
        <p className="mt-0.5 text-[12px] text-[#6a5b4f]">
          {elapsedSeconds}s · {summary.actionCount} thao tác
        </p>
      </div>
      <button
        type="button"
        onClick={handleExport}
        className="grid size-10 place-items-center rounded-[12px] bg-[#854f19] text-white transition hover:bg-[#6f4114]"
        aria-label="Tải log phiên test"
        title="Tải log phiên test"
      >
        <Download size={17} />
      </button>
    </div>
  )
}

export default TestSessionTracker
