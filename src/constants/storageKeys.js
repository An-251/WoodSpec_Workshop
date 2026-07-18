export const WORKSHOP_STORAGE_KEYS = {
  requests: "woodspec_requests",
  quotations: "woodspec_quotations",
  orders: "woodspec_orders",
  messages: "woodspec_messages",
  notifications: "woodspec_notifications",
}

export const PROFILE_STORAGE_KEY = "woodspec_workshop_profile"

export const TEST_DATA_STORAGE_KEYS = [...Object.values(WORKSHOP_STORAGE_KEYS), PROFILE_STORAGE_KEY]
