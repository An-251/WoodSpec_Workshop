import { TEST_DATA_STORAGE_KEYS } from "@/constants/storageKeys"
import {
  appendTestEvent,
  createTestSessionId,
  endTestSession,
  isEmailAddress,
  normalizeTesterEmail,
  resetTestDataForEmail,
  startTestSession,
} from "@/services/testSessionService"

const AUTH_KEY = "woodspec_workshop_auth"
const TEST_IDENTITY_KEY = "woodspec_test_identity"

function dispatchTestSessionEvent(name) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(name))
  }
}

export function startTestIdentity(email) {
  const normalizedEmail = normalizeTesterEmail(email)

  if (!isEmailAddress(normalizedEmail)) {
    return {
      ok: false,
      message: "Vui lòng nhập email hợp lệ để định danh phiên test.",
    }
  }

  const identity = {
    isAuthenticated: true,
    username: normalizedEmail,
    email: normalizedEmail,
    testerEmail: normalizedEmail,
    displayName: normalizedEmail,
    role: "tester",
    testMode: true,
    sessionId: createTestSessionId(),
    loginAt: Date.now(),
  }

  resetTestDataForEmail(normalizedEmail, TEST_DATA_STORAGE_KEYS)
  localStorage.setItem(AUTH_KEY, JSON.stringify(identity))
  localStorage.setItem(TEST_IDENTITY_KEY, JSON.stringify(identity))
  startTestSession(identity)
  appendTestEvent(identity, {
    type: "app_login",
    target: "Email login",
  })
  dispatchTestSessionEvent("woodspec-test-session-started")

  return {
    ok: true,
    identity,
  }
}

export function getTestIdentity() {
  try {
    const rawIdentity = localStorage.getItem(TEST_IDENTITY_KEY)
    if (!rawIdentity) return null

    const identity = JSON.parse(rawIdentity)
    return identity?.testMode && identity?.sessionId ? identity : null
  } catch {
    localStorage.removeItem(TEST_IDENTITY_KEY)
    return null
  }
}

export function login(email) {
  return startTestIdentity(email)
}

export function logout() {
  endTestSession(getTrackingAuth())
  clearStoredAuth()
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(TEST_IDENTITY_KEY)
  dispatchTestSessionEvent("woodspec-test-session-ended")
}

export function getAuth() {
  try {
    const rawAuth = localStorage.getItem(AUTH_KEY)
    if (!rawAuth) return null

    const auth = JSON.parse(rawAuth)
    return auth?.isAuthenticated ? auth : null
  } catch {
    localStorage.removeItem(AUTH_KEY)
    return null
  }
}

export function getTrackingAuth() {
  return getAuth() || getTestIdentity()
}

export function isAuthenticated() {
  return Boolean(getAuth())
}
