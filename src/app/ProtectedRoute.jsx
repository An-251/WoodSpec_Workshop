import { Navigate, Outlet, useLocation } from "react-router-dom"

import { isAuthenticated } from "@/services/authService"
import { ROUTES } from "@/constants/routes"

function ProtectedRoute() {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
