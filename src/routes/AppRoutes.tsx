import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import Loader from "../components/Loader";
import DashboardLayout from "../layout/DashboardLayout";
import RootLayout from "../layout/RootLayout";
import NotFound from "../pages/errors/NotFound";
import RootErrorBoundary from "../pages/errors/RootErrorBoundary";
import ProtectedRoute from "./ProtectedRoute";
import Unauthorized from "./Unauthorized";

const LandingPage = lazy(() => import("../pages/home/LandingPage"));
const TermsPage = lazy(() => import("../pages/home/TermsPage"));
const FreightRulesPage = lazy(() => import("../pages/home/FreightRulesPage"));

// Auth Pages
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));
const VerifyOtpPage = lazy(() => import("../pages/auth/VerifyOtpPage"));

// Customer Pages
const CustomerOverview = lazy(() => import("../pages/app/customer/Overview"));
const CustomerRequests = lazy(() => import("../pages/app/customer/Requests"));
const RequestDetails = lazy(() => import("../pages/app/shared/RequestDetails"));
const CustomerBookings = lazy(() => import("../pages/app/customer/Bookings"));
const BookingDetails = lazy(() => import("../pages/app/shared/BookingDetails"));
const CustomerDocuments = lazy(() => import("../pages/app/customer/Documents"));
const CustomerInvoices = lazy(() => import("../pages/app/customer/Invoices"));
const InvoiceDetails = lazy(() => import("../pages/app/shared/InvoiceDetails"));
const CustomerProfile = lazy(() => import("../pages/app/customer/Profile"));

// Admin Pages
const AdminOverview = lazy(() => import("../pages/app/admin/Overview"));
const AdminRequests = lazy(() => import("../pages/app/admin/Requests"));
const AdminBookings = lazy(() => import("../pages/app/admin/Bookings"));
const AdminDocuments = lazy(() => import("../pages/app/admin/Documents"));
const AdminInvoices = lazy(() => import("../pages/app/admin/Invoices"));
const AdminLogs = lazy(() => import("../pages/app/admin/Logs"));
const AdminUsers = lazy(() => import("../pages/app/admin/Users"));


const Suspended = (Component: React.FC) => (props: any) => (
  <Suspense fallback={<Loader />}>
    <Component {...props} />
  </Suspense>
);

const AppRoutes = createBrowserRouter([
  {
    path: "/",
    ErrorBoundary: RootErrorBoundary,
    Component: RootLayout,
    children: [
      // Public Routes
      { path: "/", Component: Suspended(LandingPage) },
      { path: "/freight-rules", Component: Suspended(FreightRulesPage) },
      { path: "/terms", Component: Suspended(TermsPage) },

      // Unauthorized
      { path: "/unauthorized", Component: Unauthorized },

      // Not Found
      { path: "*", Component: NotFound },

      // Auth Routes
      { path: "/register", Component: Suspended(RegisterPage) },
      { path: "/verify-otp", Component: Suspended(VerifyOtpPage) },
      { path: "/login", Component: Suspended(LoginPage) },
      { path: "/forgot-password", Component: Suspended(ForgotPasswordPage) },
      { path: "/reset-password/:token", Component: Suspended(ResetPasswordPage) },

      // Customer Routes
      {
        path: "/app/customer",
        Component: () => (
          <ProtectedRoute allowedRoles={["customer"]}>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, Component: Suspended(CustomerOverview) },
          { path: "requests", Component: Suspended(CustomerRequests) },
          { path: "requests/:id", Component: Suspended(RequestDetails) },
          { path: "bookings", Component: Suspended(CustomerBookings) },
          { path: "bookings/:id", Component: Suspended(BookingDetails) },
          { path: "documents", Component: Suspended(CustomerDocuments) },
          { path: "invoices", Component: Suspended(CustomerInvoices) },
          { path: "invoices/:id", Component: Suspended(InvoiceDetails) },
          { path: "profile", Component: Suspended(CustomerProfile) },
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
          { index: true, Component: Suspended(AdminOverview )},
          { path: "requests", Component: Suspended(AdminRequests) },
          { path: "requests/:id", Component: Suspended(RequestDetails) },
          { path: "bookings", Component: Suspended(AdminBookings) },
          { path: "bookings/:id", Component: Suspended(BookingDetails) },
          // { path: "schedule", Component: AdminSchedules },
          { path: "documents", Component: Suspended(AdminDocuments) },
          { path: "invoices", Component: Suspended(AdminInvoices) },
          { path: "invoices/:id", Component: Suspended(InvoiceDetails) },
          { path: "users", Component: Suspended(AdminUsers) },
          { path: "logs", Component: Suspended(AdminLogs) },
        ],
      },
    ],
  },
]);

export default AppRoutes;
