import ConfiguratorPage from "@/pages/ConfiguratorPage"
import DashboardPage from "@/pages/DashboardPage"
import HomePage from "@/pages/HomePage"
import LoginPage from "@/pages/LoginPage"
import OrderProgressPage from "@/pages/OrderProgressPage"
import QuotesPage from "@/pages/QuotesPage"
import RegisterPage from "@/pages/RegisterPage"
import SpecReviewPage from "@/pages/SpecReviewPage"
import WorkshopBuildDetailPage from "@/pages/WorkshopBuildDetailPage"
import WorkshopBuildsPage from "@/pages/WorkshopBuildsPage"
import WorkshopHandoverDetailPage from "@/pages/WorkshopHandoverDetailPage"
import WorkshopHandoverPage from "@/pages/WorkshopHandoverPage"
import WorkshopQuotationPage from "@/pages/WorkshopQuotationPage"
import WorkshopRequestDetailPage from "@/pages/WorkshopRequestDetailPage"
import WorkshopRequestsPage from "@/pages/WorkshopRequestsPage"

export const publicRoutes = [
  { index: true, element: <HomePage /> },
  { path: "login", element: <LoginPage /> },
  { path: "register", element: <RegisterPage /> },
]

export const protectedRoutes = [
  { path: "dashboard", element: <DashboardPage /> },
  { path: "app/requests", element: <WorkshopRequestsPage /> },
  { path: "app/requests/:requestId", element: <WorkshopRequestDetailPage /> },
  { path: "app/requests/:requestId/quote", element: <WorkshopQuotationPage /> },
  { path: "app/builds", element: <WorkshopBuildsPage /> },
  { path: "app/builds/:projectId", element: <WorkshopBuildDetailPage /> },
  { path: "app/handover", element: <WorkshopHandoverPage /> },
  { path: "app/handover/:projectId", element: <WorkshopHandoverDetailPage /> },
  { path: "app/configurator", element: <ConfiguratorPage /> },
  { path: "app/spec-review", element: <SpecReviewPage /> },
  { path: "app/quotes", element: <QuotesPage /> },
  { path: "app/order-progress", element: <OrderProgressPage /> },
]
