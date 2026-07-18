import { BrowserRouter, Route, Routes } from "react-router-dom"

import ProtectedRoute from "@/app/ProtectedRoute"
import TestSessionTracker from "@/components/common/TestSessionTracker"
import { ROUTES } from "@/constants/routes"
import MainLayout from "@/layouts/MainLayout"
import HomePage from "@/pages/HomePage"
import LoginPage from "@/pages/LoginPage"
import DashboardPage from "@/pages/DashboardPage"
import RequestsPage from "@/pages/RequestsPage"
import RequestDetailPage from "@/pages/RequestDetailPage"
import QuotationPage from "@/pages/QuotationPage"
import OrdersPage from "@/pages/OrdersPage"
import MessagesPage from "@/pages/MessagesPage"
import NotificationsPage from "@/pages/NotificationsPage"
import ProfilePage from "@/pages/ProfilePage"
import InteractionLogsPage from "@/pages/InteractionLogsPage"
import NotFoundPage from "@/pages/NotFoundPage"

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.viewLogs} element={<InteractionLogsPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path={ROUTES.dashboard} element={<DashboardPage />} />
            <Route path={ROUTES.requests} element={<RequestsPage />} />
            <Route path={ROUTES.requestDetail} element={<RequestDetailPage />} />
            <Route path={ROUTES.quotations} element={<QuotationPage />} />
            <Route path={ROUTES.orders} element={<OrdersPage />} />
            <Route path={ROUTES.messages} element={<MessagesPage />} />
            <Route path={ROUTES.notifications} element={<NotificationsPage />} />
            <Route path={ROUTES.profile} element={<ProfilePage />} />
            <Route path={ROUTES.interactionLogs} element={<InteractionLogsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <TestSessionTracker />
    </BrowserRouter>
  )
}

export default AppRouter
