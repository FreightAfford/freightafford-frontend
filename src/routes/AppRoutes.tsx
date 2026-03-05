import { createBrowserRouter } from "react-router";
import LandingPage from "../pages/home/LandingPage";
import RootLayout from "../layout/RootLayout";
import FreightRulesPage from "../pages/home/FreightRulesPage";
import TermsPage from "../pages/home/TermsPage";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";
import CustomerOverview from "../pages/app/customer/Overview";
import CustomerRequests from "../pages/app/customer/Requests";
import CustomerBookings from "../pages/app/customer/Bookings";
import CustomerDocuments from "../pages/app/customer/Documents";
import CustomerInvoices from "../pages/app/customer/Invoices";
import CustomerProfile from "../pages/app/customer/Profile";
import AdminOverview from "../pages/app/admin/Overview";
import AdminBookings from "../pages/app/admin/Bookings";
import AdminRequests from "../pages/app/admin/Requests";
import AdminSchedules from "../pages/app/admin/Schedules";
import AdminDocuments from "../pages/app/admin/Documents";
import AdminInvoices from "../pages/app/admin/Invoices";
import AdminUsers from "../pages/app/admin/Users";
import AdminLogs from "../pages/app/admin/Logs";
import DashboardLayout from "../layout/DashboardLayout";

const AppRoutes = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      // Public Routes
      { path: "/", Component: LandingPage },
      { path: "/freight-rules", Component: FreightRulesPage },
      { path: "/terms", Component: TermsPage },

      // Auth Routes
      { path: "/register", Component: RegisterPage },
      { path: "/verify-otp", Component: VerifyOtpPage },
      { path: "/login", Component: LoginPage },
      { path: "/forgot-password", Component: ForgotPasswordPage },
      { path: "/reset-password/:token", Component: ResetPasswordPage },

      // Customer Routes
      {
        path: "/app/customer",
        Component: DashboardLayout,
        children: [
          { index: true, Component: CustomerOverview },
          { path: "requests", Component: CustomerRequests },
          { path: "bookings", Component: CustomerBookings },
          { path: "documents", Component: CustomerDocuments },
          { path: "invoices", Component: CustomerInvoices },
          { path: "profile", Component: CustomerProfile },
        ],
      },

      // Admin Routes
      {
        path: "/app/admin",
        Component: DashboardLayout,
        children: [
          { index: true, Component: AdminOverview },
          { path: "requests", Component: AdminRequests },
          { path: "bookings", Component: AdminBookings },
          { path: "schedule", Component: AdminSchedules },
          { path: "documents", Component: AdminDocuments },
          { path: "invoices", Component: AdminInvoices },
          { path: "users", Component: AdminUsers },
          { path: "logs", Component: AdminLogs },
        ],
      },
    ],
  },
]);

export default AppRoutes;
