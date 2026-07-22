import { createBrowserRouter } from "react-router-dom"

import ProtectedRoute from "@/features/auth/ProtectedRoute"
import AppLayout from "@/layouts/AppLayout"
import ErrorPage from "@/pages/ErrorPage"
import MainLayout from "@/layouts/MainLayout"
import NotFoundPage from "@/pages/NotFoundPage"
import { protectedRoutes, publicRoutes } from "@/config/routeConfig"
import { ROUTES } from "@/constants/routes"

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      ...publicRoutes,
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        errorElement: <ErrorPage />,
        children: protectedRoutes,
      },
    ],
  },
])
