import { createBrowserRouter } from "react-router";
import DashboardLayout from "../layout/DashboardLayout";
import RootLayout from "../layout/RootLayout";
import AdminBookings from "../pages/app/admin/Bookings";
import AdminDocuments from "../pages/app/admin/Documents";
import AdminInvoices from "../pages/app/admin/Invoices";
import AdminLogs from "../pages/app/admin/Logs";
import AdminOverview from "../pages/app/admin/Overview";
import AdminRequests from "../pages/app/admin/Requests";
import AdminUsers from "../pages/app/admin/Users";
import CustomerBookings from "../pages/app/customer/Bookings";
import CustomerDocuments from "../pages/app/customer/Documents";
import CustomerInvoices from "../pages/app/customer/Invoices";
import CustomerOverview from "../pages/app/customer/Overview";
import CustomerProfile from "../pages/app/customer/Profile";
import CustomerRequests from "../pages/app/customer/Requests";
import BookingDetails from "../pages/app/shared/BookingDetails";
import RequestDetails from "../pages/app/shared/RequestDetails";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";
import FreightRulesPage from "../pages/home/FreightRulesPage";
import LandingPage from "../pages/home/LandingPage";
import TermsPage from "../pages/home/TermsPage";
import ProtectedRoute from "./ProtectedRoute";
import Unauthorized from "./Unauthorized";
import InvoiceDetails from "../pages/app/shared/InvoiceDetails";

const AppRoutes = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      // Public Routes
      { path: "/", Component: LandingPage },
      { path: "/freight-rules", Component: FreightRulesPage },
      { path: "/terms", Component: TermsPage },

      // Unauthorized
      { path: "/unauthorized", Component: Unauthorized },
      // Auth Routes
      { path: "/register", Component: RegisterPage },
      { path: "/verify-otp", Component: VerifyOtpPage },
      { path: "/login", Component: LoginPage },
      { path: "/forgot-password", Component: ForgotPasswordPage },
      { path: "/reset-password/:token", Component: ResetPasswordPage },

      // Customer Routes
      {
        path: "/app/customer",
        Component: () => (
          <ProtectedRoute allowedRoles={["customer"]}>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, Component: CustomerOverview },
          { path: "requests", Component: CustomerRequests },
          { path: "requests/:id", Component: RequestDetails },
          { path: "bookings", Component: CustomerBookings },
          { path: "bookings/:id", Component: BookingDetails },
          { path: "documents", Component: CustomerDocuments },
          { path: "invoices", Component: CustomerInvoices },
          { path: "invoices/:id", Component: InvoiceDetails },
          { path: "profile", Component: CustomerProfile },
        ],
      },

      // Admin Routes
      {
        path: "/app/admin",
        Component: () => (
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, Component: AdminOverview },
          { path: "requests", Component: AdminRequests },
          { path: "requests/:id", Component: RequestDetails },
          { path: "bookings", Component: AdminBookings },
          { path: "bookings/:id", Component: BookingDetails },
          // { path: "schedule", Component: AdminSchedules },
          { path: "documents", Component: AdminDocuments },
          { path: "invoices", Component: AdminInvoices },
          { path: "invoices/:id", Component: InvoiceDetails },
          { path: "users", Component: AdminUsers },
          { path: "logs", Component: AdminLogs },
        ],
      },
    ],
  },
]);

export default AppRoutes;
