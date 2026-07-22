import { RouterProvider } from "react-router-dom"

import { router } from "@/app/router"
import AppToaster from "@/features/notifications/components/AppToaster"

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <AppToaster />
    </>
  )
}

export default App
