import { create } from "zustand"

const storageKey = "woodspec_user"

function getStoredUser() {
  try {
    const value = localStorage.getItem(storageKey)
    const user = value ? JSON.parse(value) : null

    if (!user?.email || !user?.sessionId) {
      localStorage.removeItem(storageKey)
      return null
    }

    return user
  } catch {
    return null
  }
}

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  loginCustomer: ({ email, sessionId, loginAt }) => {
    const normalizedEmail = String(email).trim().toLowerCase()
    const user = {
      email: normalizedEmail,
      username: normalizedEmail,
      name: normalizedEmail,
      role: "khách hàng khảo sát",
      sessionId,
      loginAt,
    }

    localStorage.setItem(storageKey, JSON.stringify(user))
    set({ user })
  },
  logout: () => {
    localStorage.removeItem(storageKey)
    set({ user: null })
  },
}))
