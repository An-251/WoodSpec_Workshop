const API_URL = (import.meta.env.VITE_INTERACTION_API_URL || "").replace(/\/$/, "")

async function requestJson(path) {
  if (!API_URL) {
    throw new Error("Chưa cấu hình VITE_INTERACTION_API_URL")
  }

  const response = await fetch(`${API_URL}${path}`)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || "Không thể tải dữ liệu log")
  }

  return data
}

export function isInteractionApiConfigured() {
  return Boolean(API_URL)
}

export function getInteractionApiUrl() {
  return API_URL
}

export async function fetchInteractionSessions({ email = "", limit = 50 } = {}) {
  const params = new URLSearchParams()
  if (email.trim()) params.set("email", email.trim().toLowerCase())
  params.set("limit", String(limit))

  const data = await requestJson(`/api/interaction/sessions?${params.toString()}`)
  return data.sessions || []
}

export async function fetchInteractionEvents(sessionId, { limit = 1000 } = {}) {
  const params = new URLSearchParams()
  params.set("limit", String(limit))

  const data = await requestJson(`/api/interaction/sessions/${encodeURIComponent(sessionId)}/events?${params.toString()}`)
  return data.events || []
}
