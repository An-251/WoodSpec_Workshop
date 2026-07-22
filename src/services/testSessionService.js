import {
  createInteractionSession,
  endInteractionSession,
  sendInteractionDisconnect,
  sendInteractionEvents,
} from "@/services/interactionApi"

const TEST_SESSION_KEY = "woodspec_test_session"

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase()
}

function createSessionId() {
  const randomText = Math.random().toString(36).slice(2, 8)
  return `test-${Date.now()}-${randomText}`
}

function getViewport() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Saigon"
}

function getElapsedSeconds(session) {
  if (!session?.loginAt) {
    return 0
  }

  return Math.max(0, Math.round((Date.now() - session.loginAt) / 1000))
}

function saveSession(session) {
  window.localStorage.setItem(TEST_SESSION_KEY, JSON.stringify(session))
}

export function getStoredTestSession() {
  try {
    const value = window.localStorage.getItem(TEST_SESSION_KEY)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function clearStoredTestSession() {
  window.localStorage.removeItem(TEST_SESSION_KEY)
}

export function buildInteractionEvent(type, target, session = getStoredTestSession(), extra = {}) {
  return {
    type,
    target,
    path: window.location.pathname,
    elapsedSeconds: getElapsedSeconds(session),
    at: Date.now(),
    ...extra,
  }
}

export async function beginTestSession(email) {
  const normalizedEmail = normalizeEmail(email)
  const loginAt = Date.now()
  const session = {
    sessionId: createSessionId(),
    email: normalizedEmail,
    displayName: normalizedEmail,
    role: "tester",
    testMode: true,
    loginAt,
  }

  saveSession(session)

  const payload = {
    ...session,
    userAgent: window.navigator.userAgent,
    timezone: getTimezone(),
    referrer: document.referrer,
    path: window.location.pathname,
    viewport: getViewport(),
  }

  try {
    await createInteractionSession(payload)
    await sendInteractionEvents({
      sessionId: session.sessionId,
      email: session.email,
      events: [
        buildInteractionEvent("login", "Nhập email bắt đầu phiên", session),
        buildInteractionEvent("app_login", session.email, session),
      ],
    })
  } catch {
    // Cho phép người dùng tiếp tục dùng ứng dụng ngay cả khi backend ghi log chưa sẵn sàng.
  }

  return session
}

export function recordTestEvent(type, target, extra = {}) {
  const session = getStoredTestSession()

  if (!session?.sessionId || !session?.email) {
    return
  }

  sendInteractionEvents({
    sessionId: session.sessionId,
    email: session.email,
    events: [buildInteractionEvent(type, target, session, extra)],
  }).catch(() => {})
}

export async function endTestSession(reason = "logout") {
  const session = getStoredTestSession()

  if (!session?.sessionId || !session?.email) {
    clearStoredTestSession()
    return
  }

  try {
    await sendInteractionEvents({
      sessionId: session.sessionId,
      email: session.email,
      events: [buildInteractionEvent("logout", reason, session)],
    })
    await endInteractionSession(session.sessionId, {
      logoutAt: Date.now(),
      path: window.location.pathname,
    })
  } catch {
    // Không chặn đăng xuất nếu backend chưa phản hồi.
  } finally {
    clearStoredTestSession()
  }
}

export function disconnectTestSession(reason = "pagehide") {
  const session = getStoredTestSession()

  if (!session?.sessionId || !session?.email) {
    return
  }

  const event = buildInteractionEvent("disconnect", reason, session)
  const payload = {
    sessionId: session.sessionId,
    email: session.email,
    disconnectedAt: Date.now(),
    reason,
    path: window.location.pathname,
    event,
  }

  sendInteractionDisconnect(session.sessionId, payload)
}
