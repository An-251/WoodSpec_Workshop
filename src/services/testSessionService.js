const TEST_LOGS_KEY = "woodspec_test_logs"
const MAX_EVENTS_PER_SESSION = 700
const INTERACTION_API_URL = (import.meta.env.VITE_INTERACTION_API_URL || "").replace(/\/$/, "")
const DISCONNECTED_SESSION_IDS = new Set()

function getClientContext() {
  if (typeof window === "undefined") return {}

  return {
    userAgent: window.navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer,
    path: window.location.pathname,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  }
}

function postInteraction(path, body, preferBeacon = false) {
  if (!INTERACTION_API_URL || typeof window === "undefined") return

  const url = `${INTERACTION_API_URL}${path}`
  const payload = JSON.stringify(body)

  if (preferBeacon && navigator.sendBeacon) {
    const sent = navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }))
    if (sent) return
  }

  window
    .fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: preferBeacon,
    })
    .catch(() => {})
}

function patchInteraction(path, body, preferBeacon = false) {
  if (!INTERACTION_API_URL || typeof window === "undefined") return

  window
    .fetch(`${INTERACTION_API_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      keepalive: preferBeacon,
    })
    .catch(() => {})
}

function sendRemoteSession(auth) {
  if (!auth?.testMode) return

  postInteraction("/api/interaction/session", {
    sessionId: auth.sessionId,
    email: auth.email || auth.username,
    displayName: auth.displayName,
    role: auth.role,
    testMode: auth.testMode,
    loginAt: auth.loginAt,
    ...getClientContext(),
  })
}

function sendRemoteEvents(auth, events, preferBeacon = false) {
  if (!auth?.testMode || !events.length) return

  postInteraction(
    "/api/interaction/events",
    {
      sessionId: auth.sessionId,
      email: auth.email || auth.username,
      events,
    },
    preferBeacon,
  )
}

function endRemoteSession(auth) {
  if (!auth?.testMode) return

  patchInteraction(
    `/api/interaction/session/${encodeURIComponent(auth.sessionId)}/end`,
    {
      logoutAt: Date.now(),
      path: typeof window === "undefined" ? "" : window.location.pathname,
    },
    true,
  )
}

function sendRemoteDisconnect(auth, event, reason) {
  if (!auth?.testMode) return

  postInteraction(
    `/api/interaction/session/${encodeURIComponent(auth.sessionId)}/disconnect`,
    {
      sessionId: auth.sessionId,
      email: auth.email || auth.username,
      disconnectedAt: event.at,
      reason,
      path: typeof window === "undefined" ? "" : window.location.pathname,
      event,
    },
    true,
  )
}

export function normalizeTesterEmail(value) {
  return String(value || "").trim().toLowerCase()
}

export function isEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(String(value || "").trim())
}

export function sanitizeStorageSegment(value) {
  return normalizeTesterEmail(value).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
}

export function createTestSessionId() {
  const randomValue = Math.random().toString(36).slice(2, 8)
  return `test-${Date.now()}-${randomValue}`
}

export function getScopedStorageKey(baseKey, auth) {
  if (!auth?.testMode) return baseKey
  const emailSegment = sanitizeStorageSegment(auth.email || auth.username)
  return `woodspec_test_${emailSegment}_${baseKey}`
}

export function resetTestDataForEmail(email, baseKeys) {
  if (typeof window === "undefined") return

  const authLike = {
    testMode: true,
    email: normalizeTesterEmail(email),
  }

  baseKeys.forEach((baseKey) => {
    window.localStorage.removeItem(getScopedStorageKey(baseKey, authLike))
  })
}

function readLogStore() {
  if (typeof window === "undefined") return { version: 1, testers: {} }

  try {
    const rawValue = window.localStorage.getItem(TEST_LOGS_KEY)
    if (!rawValue) return { version: 1, testers: {} }
    const parsedValue = JSON.parse(rawValue)

    return {
      version: 1,
      testers: parsedValue?.testers || {},
    }
  } catch {
    window.localStorage.removeItem(TEST_LOGS_KEY)
    return { version: 1, testers: {} }
  }
}

function writeLogStore(store) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TEST_LOGS_KEY, JSON.stringify(store))
  }

  return store
}

function ensureSession(store, auth) {
  const email = normalizeTesterEmail(auth?.email || auth?.username)
  const sessionId = auth?.sessionId
  if (!email || !sessionId) return null

  const tester = store.testers[email] || {
    email,
    sessions: [],
  }

  let session = tester.sessions.find((item) => item.sessionId === sessionId)
  if (!session) {
    session = {
      sessionId,
      loginAt: auth.loginAt || Date.now(),
      events: [],
    }
    tester.sessions = [session, ...tester.sessions].slice(0, 20)
  }

  store.testers[email] = tester
  return session
}

function buildTestEvent(auth, session, event) {
  const at = event.at || Date.now()
  const loginAt = auth.loginAt || session.loginAt || at

  return {
    at,
    elapsedSeconds: Math.max(0, Math.floor((at - loginAt) / 1000)),
    path: typeof window === "undefined" ? "" : window.location.pathname,
    ...event,
  }
}

export function appendTestEvent(auth, event) {
  if (!auth?.testMode) return null

  const store = readLogStore()
  const session = ensureSession(store, auth)
  if (!session) return null

  const nextEvent = buildTestEvent(auth, session, event)
  session.events = [
    ...(session.events || []),
    nextEvent,
  ].slice(-MAX_EVENTS_PER_SESSION)

  writeLogStore(store)
  sendRemoteEvents(auth, [nextEvent])
  return session
}

export function disconnectTestSession(auth, reason = "pagehide") {
  if (!auth?.testMode || DISCONNECTED_SESSION_IDS.has(auth.sessionId)) return null

  DISCONNECTED_SESSION_IDS.add(auth.sessionId)

  const store = readLogStore()
  const session = ensureSession(store, auth)
  if (!session) return null

  const nextEvent = buildTestEvent(auth, session, {
    type: "disconnect",
    target: reason,
  })

  session.disconnectAt = nextEvent.at
  session.disconnectReason = reason
  session.events = [
    ...(session.events || []),
    nextEvent,
  ].slice(-MAX_EVENTS_PER_SESSION)

  writeLogStore(store)
  sendRemoteDisconnect(auth, nextEvent, reason)
  return session
}

export function startTestSession(auth) {
  if (!auth?.testMode) return null

  const store = readLogStore()
  const session = ensureSession(store, auth)
  if (!session) return null

  session.loginAt = auth.loginAt
  session.logoutAt = null
  session.events = [
    {
      type: "login",
      at: auth.loginAt,
      elapsedSeconds: 0,
      path: typeof window === "undefined" ? "" : window.location.pathname,
      target: "Test session started",
    },
  ]

  writeLogStore(store)
  sendRemoteSession(auth)
  sendRemoteEvents(auth, session.events)
  return session
}

export function endTestSession(auth) {
  if (!auth?.testMode) return null

  const session = appendTestEvent(auth, {
    type: "logout",
    target: "Logout",
  })

  if (!session) return null

  const store = readLogStore()
  const email = normalizeTesterEmail(auth.email || auth.username)
  const tester = store.testers[email]
  const targetSession = tester?.sessions.find((item) => item.sessionId === auth.sessionId)
  if (targetSession) {
    targetSession.logoutAt = Date.now()
    writeLogStore(store)
  }

  endRemoteSession(auth)
  return targetSession
}

export function getTestSessionSummary(auth) {
  if (!auth?.testMode) return { actionCount: 0, eventCount: 0 }

  const store = readLogStore()
  const email = normalizeTesterEmail(auth.email || auth.username)
  const session = store.testers[email]?.sessions.find((item) => item.sessionId === auth.sessionId)

  return {
    actionCount: session?.events?.filter((event) => event.type === "click").length || 0,
    eventCount: session?.events?.length || 0,
  }
}

export function exportCurrentTestLog(auth) {
  if (!auth?.testMode) return null

  const store = readLogStore()
  const email = normalizeTesterEmail(auth.email || auth.username)
  const session = store.testers[email]?.sessions.find((item) => item.sessionId === auth.sessionId)

  return session
    ? {
        email,
        ...session,
      }
    : null
}
