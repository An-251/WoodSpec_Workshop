import { Navigate, Outlet, useLocation } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import { useAuthStore } from "@/stores/useAuthStore"

function ProtectedRoute() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export default ProtectedRoute
