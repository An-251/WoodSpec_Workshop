import { toast } from "sonner"

import { notificationMessages } from "@/features/notifications/config/notificationMessages"

function showNotification(type, message) {
  toast[type](message.title, {
    description: message.description,
  })
}

export const notify = {
  authLoginSuccess: () =>
    showNotification("success", notificationMessages.auth.loginSuccess),
  authLoginError: () =>
    showNotification("error", notificationMessages.auth.loginError),
  specGenerated: () =>
    showNotification("success", notificationMessages.configurator.specGenerated),
  configuratorReset: () =>
    showNotification("info", notificationMessages.configurator.resetSuccess),
  quoteRequestError: (description) =>
    showNotification("error", {
      ...notificationMessages.configurator.quoteRequestError,
      description: description || notificationMessages.configurator.quoteRequestError.description,
    }),
  quoteRequestSent: () =>
    showNotification("success", notificationMessages.configurator.quoteRequestSent),
}
