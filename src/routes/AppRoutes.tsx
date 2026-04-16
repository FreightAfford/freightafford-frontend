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
import InvoiceDetails from "../pages/app/shared/InvoiceDetails";
import RequestDetails from "../pages/app/shared/RequestDetails";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";
import NotFound from "../pages/errors/NotFound";
import RootErrorBoundary from "../pages/errors/RootErrorBoundary";
import FreightRulesPage from "../pages/home/FreightRulesPage";
import LandingPage from "../pages/home/LandingPage";
import TermsPage from "../pages/home/TermsPage";
import ProtectedRoute from "./ProtectedRoute";
import Unauthorized from "./Unauthorized";
import UserDetails from "../pages/app/shared/UserDetails";

// const LandingPage = lazy(() => import("../pages/home/LandingPage"));
// const TermsPage = lazy(() => import("../pages/home/TermsPage"));
// const FreightRulesPage = lazy(() => import("../pages/home/FreightRulesPage"));

// // Auth Pages
// const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
// const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
// const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));
// const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));
// const VerifyOtpPage = lazy(() => import("../pages/auth/VerifyOtpPage"));

// // Customer Pages
// const CustomerOverview = lazy(() => import("../pages/app/customer/Overview"));
// const CustomerRequests = lazy(() => import("../pages/app/customer/Requests"));
// const RequestDetails = lazy(() => import("../pages/app/shared/RequestDetails"));
// const CustomerBookings = lazy(() => import("../pages/app/customer/Bookings"));
// const BookingDetails = lazy(() => import("../pages/app/shared/BookingDetails"));
// const CustomerDocuments = lazy(() => import("../pages/app/customer/Documents"));
// const CustomerInvoices = lazy(() => import("../pages/app/customer/Invoices"));
// const InvoiceDetails = lazy(() => import("../pages/app/shared/InvoiceDetails"));
// const CustomerProfile = lazy(() => import("../pages/app/customer/Profile"));

// // Admin Pages
// const AdminOverview = lazy(() => import("../pages/app/admin/Overview"));
// const AdminRequests = lazy(() => import("../pages/app/admin/Requests"));
// const AdminBookings = lazy(() => import("../pages/app/admin/Bookings"));
// const AdminDocuments = lazy(() => import("../pages/app/admin/Documents"));
// const AdminInvoices = lazy(() => import("../pages/app/admin/Invoices"));
// const AdminLogs = lazy(() => import("../pages/app/admin/Logs"));
// const AdminUsers = lazy(() => import("../pages/app/admin/Users"));

// const Suspended = (Component: React.FC) => (props: any) => (
//   <Suspense fallback={<Loader />}>
//     <Component {...props} />
//   </Suspense>
// );

const AppRoutes = createBrowserRouter([
  {
    path: "/",
    ErrorBoundary: RootErrorBoundary,
    Component: RootLayout,
    children: [
      // Public Routes
      { path: "/", Component: LandingPage },
      { path: "/freight-rules", Component: FreightRulesPage },
      { path: "/terms", Component: TermsPage },

      // Unauthorized
      { path: "/unauthorized", Component: Unauthorized },

      // Not Found
      { path: "*", Component: NotFound },

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
          { path: "users/:id", Component: UserDetails },
          { path: "logs", Component: AdminLogs },
        ],
      },
    ],
  },
]);

export default AppRoutes;
