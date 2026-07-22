const RID_EVENTS_KEY = "woodspec_rid_events"
const RID_PROFILE_KEY = "woodspec_rid_profile"
const RID_SESSION_KEY = "woodspec_rid_session"
const RID_ROUTE_EVENT = "woodspec:rid-route-change"
const MAX_EVENTS = 5000

let trackerInitialized = false
let lastRoute = ""
let endpointQueue = []
let flushTimer = null
const inputTimers = new WeakMap()

function getNow() {
  return new Date().toISOString()
}

function getRandomId(prefix) {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readStorage(key, fallback) {
  if (typeof window === "undefined") {
    return fallback
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function getSession() {
  if (typeof window === "undefined") {
    return {
      id: "server",
      startedAt: Date.now(),
    }
  }

  try {
    const savedSession = JSON.parse(window.sessionStorage.getItem(RID_SESSION_KEY) || "null")

    if (savedSession?.id) {
      return savedSession
    }
  } catch {
    // Ignore malformed session data and create a new one.
  }

  const session = {
    id: getRandomId("session"),
    startedAt: Date.now(),
  }

  window.sessionStorage.setItem(RID_SESSION_KEY, JSON.stringify(session))
  return session
}

export function getRidProfile() {
  const savedProfile = readStorage(RID_PROFILE_KEY, null)

  if (savedProfile?.participantId) {
    return {
      enabled: true,
      scenario: "Khảo sát luồng cấu hình",
      taskGoal: "",
      ...savedProfile,
    }
  }

  return {
    participantId: `KS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    enabled: true,
    scenario: "Khảo sát luồng cấu hình",
    taskGoal: "",
  }
}

export function updateRidProfile(profilePatch) {
  const nextProfile = {
    ...getRidProfile(),
    ...profilePatch,
  }

  writeStorage(RID_PROFILE_KEY, nextProfile)
  window.dispatchEvent(new CustomEvent("woodspec:rid-profile-updated", { detail: nextProfile }))

  recordRidEvent("survey_profile_updated", "Cập nhật thông tin khảo sát", {
    participantId: nextProfile.participantId,
    scenario: nextProfile.scenario,
    enabled: nextProfile.enabled,
  }, { force: true })

  return nextProfile
}

export function getRidEvents() {
  return readStorage(RID_EVENTS_KEY, [])
}

function saveRidEvents(events) {
  writeStorage(RID_EVENTS_KEY, events.slice(-MAX_EVENTS))
  window.dispatchEvent(new CustomEvent("woodspec:rid-events-updated", { detail: { count: events.length } }))
}

function getViewport() {
  if (typeof window === "undefined") {
    return {}
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
  }
}

function getScrollPosition() {
  if (typeof window === "undefined") {
    return {}
  }

  return {
    x: Math.round(window.scrollX),
    y: Math.round(window.scrollY),
  }
}

function getRoute() {
  if (typeof window === "undefined") {
    return ""
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

function getElementText(element) {
  const text = element?.innerText || element?.textContent || element?.value || element?.ariaLabel || ""
  return text.replace(/\s+/g, " ").trim().slice(0, 120)
}

function getTrackableElement(target) {
  if (!target) {
    return null
  }

  const element = target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement
  return element?.closest?.("button, a, input, textarea, select, [role='button'], [data-rid]") ?? element
}

function getTargetMeta(target) {
  const element = getTrackableElement(target)

  if (!element) {
    return null
  }

  return {
    tag: element.tagName?.toLowerCase(),
    id: element.id || "",
    name: element.getAttribute("name") || "",
    role: element.getAttribute("role") || "",
    type: element.getAttribute("type") || "",
    href: element.getAttribute("href") || "",
    dataRid: element.getAttribute("data-rid") || "",
    ariaLabel: element.getAttribute("aria-label") || "",
    text: getElementText(element),
  }
}

function getInputMeta(target) {
  const element = getTrackableElement(target)

  if (!element || !["input", "textarea", "select"].includes(element.tagName?.toLowerCase())) {
    return null
  }

  const type = element.getAttribute("type") || element.tagName.toLowerCase()
  const isSensitive = ["password", "email", "tel"].includes(type)
  const value = element.value ?? ""

  return {
    field: element.getAttribute("name") || element.id || element.getAttribute("aria-label") || element.placeholder || "unknown",
    type,
    valueLength: String(value).length,
    valuePreview: isSensitive ? "[ẩn]" : String(value).slice(0, 160),
    checked: type === "checkbox" || type === "radio" ? Boolean(element.checked) : undefined,
  }
}

function queueEndpointEvent(event) {
  const endpoint = import.meta.env.VITE_RID_ENDPOINT

  if (!endpoint || typeof window === "undefined") {
    return
  }

  endpointQueue.push(event)
  window.clearTimeout(flushTimer)
  flushTimer = window.setTimeout(flushRidEvents, 1200)
}

export async function flushRidEvents() {
  const endpoint = import.meta.env.VITE_RID_ENDPOINT

  if (!endpoint || endpointQueue.length === 0) {
    return
  }

  const payload = {
    project: import.meta.env.VITE_RID_PROJECT_ID || "woodspec",
    events: endpointQueue.splice(0, endpointQueue.length),
  }

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    endpointQueue.unshift(...payload.events)
  }
}

export function recordRidEvent(type, name, data = {}, options = {}) {
  if (typeof window === "undefined") {
    return null
  }

  const profile = getRidProfile()

  if (profile.enabled === false && !options.force) {
    return null
  }

  const session = getSession()
  const event = {
    id: getRandomId("event"),
    type,
    name,
    timestamp: getNow(),
    elapsedMs: Date.now() - session.startedAt,
    sessionId: session.id,
    participantId: profile.participantId,
    scenario: profile.scenario,
    route: getRoute(),
    viewport: getViewport(),
    scroll: getScrollPosition(),
    data,
  }
  const nextEvents = [...getRidEvents(), event].slice(-MAX_EVENTS)

  saveRidEvents(nextEvents)
  queueEndpointEvent(event)
  return event
}

function recordRouteView(source = "history") {
  const route = getRoute()

  if (route === lastRoute) {
    return
  }

  lastRoute = route
  recordRidEvent("route_view", "Chuyển trang", { route, source })
}

function handleClick(event) {
  const target = getTargetMeta(event.target)
  const x = Math.round(event.clientX)
  const y = Math.round(event.clientY)

  recordRidEvent("click", "Nhấp chuột", {
    target,
    x,
    y,
    pageX: Math.round(event.pageX),
    pageY: Math.round(event.pageY),
    normalizedX: window.innerWidth ? Number((x / window.innerWidth).toFixed(4)) : 0,
    normalizedY: window.innerHeight ? Number((y / window.innerHeight).toFixed(4)) : 0,
  })
}

function handleInput(event) {
  const element = getTrackableElement(event.target)
  const inputMeta = getInputMeta(element)

  if (!inputMeta) {
    return
  }

  window.clearTimeout(inputTimers.get(element))
  inputTimers.set(
    element,
    window.setTimeout(() => {
      recordRidEvent("input_change", "Thay đổi trường nhập", {
        target: getTargetMeta(element),
        input: inputMeta,
      })
    }, 500)
  )
}

function handleSubmit(event) {
  recordRidEvent("form_submit", "Gửi biểu mẫu", {
    target: getTargetMeta(event.target),
  })
}

function patchHistoryMethod(methodName) {
  const originalMethod = window.history[methodName]

  if (originalMethod.__woodspecRidPatched) {
    return
  }

  window.history[methodName] = function patchedHistoryMethod(...args) {
    const result = originalMethod.apply(this, args)
    window.dispatchEvent(new Event(RID_ROUTE_EVENT))
    return result
  }

  window.history[methodName].__woodspecRidPatched = true
}

export function initRidTracker() {
  if (typeof window === "undefined" || trackerInitialized) {
    return () => {}
  }

  trackerInitialized = true
  patchHistoryMethod("pushState")
  patchHistoryMethod("replaceState")
  recordRidEvent("session_start", "Bắt đầu phiên khảo sát", { userAgent: window.navigator.userAgent }, { force: true })
  recordRouteView("init")

  window.addEventListener("click", handleClick, true)
  window.addEventListener("input", handleInput, true)
  window.addEventListener("change", handleInput, true)
  window.addEventListener("submit", handleSubmit, true)
  window.addEventListener("popstate", () => recordRouteView("popstate"))
  window.addEventListener(RID_ROUTE_EVENT, () => recordRouteView("history"))
  window.addEventListener("beforeunload", () => {
    recordRidEvent("session_end", "Kết thúc phiên khảo sát", {}, { force: true })

    if (endpointQueue.length > 0 && import.meta.env.VITE_RID_ENDPOINT && navigator.sendBeacon) {
      const payload = JSON.stringify({
        project: import.meta.env.VITE_RID_PROJECT_ID || "woodspec",
        events: endpointQueue,
      })
      navigator.sendBeacon(import.meta.env.VITE_RID_ENDPOINT, new Blob([payload], { type: "application/json" }))
    }
  })

  return () => {
    window.removeEventListener("click", handleClick, true)
    window.removeEventListener("input", handleInput, true)
    window.removeEventListener("change", handleInput, true)
    window.removeEventListener("submit", handleSubmit, true)
  }
}

function downloadTextFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function csvCell(value) {
  const normalized = value == null ? "" : String(value)
  return `"${normalized.replace(/"/g, '""')}"`
}

export function exportRidJson() {
  const profile = getRidProfile()
  const session = getSession()
  const events = getRidEvents()
  const payload = {
    exportedAt: getNow(),
    profile,
    session,
    summary: getRidSummary(events),
    events,
  }

  recordRidEvent("session_export", "Xuất dữ liệu JSON", { format: "json", eventCount: events.length }, { force: true })
  downloadTextFile(`woodspec-rid-${profile.participantId}.json`, JSON.stringify(payload, null, 2), "application/json")
}

export function exportRidCsv() {
  const profile = getRidProfile()
  const events = getRidEvents()
  const headers = [
    "timestamp",
    "sessionId",
    "participantId",
    "type",
    "name",
    "route",
    "elapsedMs",
    "targetText",
    "x",
    "y",
    "valueLength",
    "data",
  ]
  const rows = events.map((event) => [
    event.timestamp,
    event.sessionId,
    event.participantId,
    event.type,
    event.name,
    event.route,
    event.elapsedMs,
    event.data?.target?.text,
    event.data?.x,
    event.data?.y,
    event.data?.input?.valueLength,
    JSON.stringify(event.data ?? {}),
  ].map(csvCell).join(","))

  recordRidEvent("session_export", "Xuất dữ liệu CSV", { format: "csv", eventCount: events.length }, { force: true })
  downloadTextFile(`woodspec-rid-${profile.participantId}.csv`, [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8")
}

export function clearRidEvents() {
  writeStorage(RID_EVENTS_KEY, [])
  recordRidEvent("survey_data_cleared", "Xóa dữ liệu khảo sát trên máy", {}, { force: true })
}

export function getRidSummary(events = getRidEvents()) {
  const firstEvent = events[0]
  const lastEvent = events.at(-1)
  const clicks = events.filter((event) => event.type === "click")
  const pageViews = events.filter((event) => event.type === "route_view")
  const inputs = events.filter((event) => event.type === "input_change")
  const completions = events.filter((event) => event.type === "task_completed")

  return {
    eventCount: events.length,
    clickCount: clicks.length,
    pageViewCount: pageViews.length,
    inputChangeCount: inputs.length,
    completionCount: completions.length,
    startedAt: firstEvent?.timestamp,
    endedAt: lastEvent?.timestamp,
    durationMs: lastEvent?.elapsedMs ?? 0,
    routes: [...new Set(pageViews.map((event) => event.route))],
  }
}
