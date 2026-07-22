const API_URL = import.meta.env.VITE_INTERACTION_API_URL?.replace(/\/$/, "") ?? ""

function getJsonHeaders() {
  return {
    "Content-Type": "application/json",
  }
}

async function requestJson(path, options = {}) {
  if (!API_URL) {
    return null
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getJsonHeaders(),
      ...(options.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(`Interaction API failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function isInteractionApiConfigured() {
  return Boolean(API_URL)
}

export function getInteractionApiUrl() {
  return API_URL
}

export function createInteractionSession(payload) {
  return requestJson("/api/interaction/session", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function sendInteractionEvents({ sessionId, email, events }) {
  if (!sessionId || !email || !events?.length) {
    return Promise.resolve(null)
  }

  return requestJson("/api/interaction/events", {
    method: "POST",
    body: JSON.stringify({ sessionId, email, events }),
  })
}

export function endInteractionSession(sessionId, payload) {
  if (!sessionId) {
    return Promise.resolve(null)
  }

  return requestJson(`/api/interaction/session/${encodeURIComponent(sessionId)}/end`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function sendInteractionDisconnect(sessionId, payload) {
  if (!API_URL || !sessionId || !navigator.sendBeacon) {
    return false
  }

  const url = `${API_URL}/api/interaction/session/${encodeURIComponent(sessionId)}/disconnect`
  const body = JSON.stringify(payload)
  return navigator.sendBeacon(url, new Blob([body], { type: "application/json" }))
}

export async function fetchInteractionSessions({ email, limit = 100 } = {}) {
  const params = new URLSearchParams()
  params.set("limit", String(limit))

  if (email) {
    params.set("email", email.trim().toLowerCase())
  }

  const data = await requestJson(`/api/interaction/sessions?${params.toString()}`)
  return data?.sessions ?? []
}

export async function fetchInteractionEvents(sessionId, { limit = 1500 } = {}) {
  if (!sessionId) {
    return []
  }

  const params = new URLSearchParams()
  params.set("limit", String(limit))

  const data = await requestJson(`/api/interaction/sessions/${encodeURIComponent(sessionId)}/events?${params.toString()}`)
  return data?.events ?? []
}
