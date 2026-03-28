import {
  CalendarCheck,
  FileSearch,
  FileText,
  FileUp,
  LayoutDashboard,
  LogOut,
  Receipt,
  Ship,
  User,
  Users,
  X,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router";
import { useLogout, useUser } from "../../hooks/useAuthService";
import cn from "../../utils/cn";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { logout, isPending } = useLogout();

  const onLogout = () =>
    logout(undefined, { onSuccess: () => navigate("/login") });

  const customerLinks = [
    { name: "Overview", icon: LayoutDashboard, path: "/app/customer" },
    {
      name: "My Freight Requests",
      icon: FileSearch,
      path: "/app/customer/requests",
    },
    {
      name: "My Bookings",
      icon: CalendarCheck,
      path: "/app/customer/bookings",
    },
    {
      name: "Documents",
      icon: FileText,
      path: "/app/customer/documents",
    },
    { name: "Invoices", icon: Receipt, path: "/app/customer/invoices" },
    { name: "Profile", icon: User, path: "/app/customer/profile" },
  ];

  const adminLinks = [
    { name: "Overview", icon: LayoutDashboard, path: "/app/admin" },
    { name: "Freight Requests", icon: FileSearch, path: "/app/admin/requests" },
    { name: "Bookings", icon: CalendarCheck, path: "/app/admin/bookings" },
    // { name: "Sailing Schedule", icon: Calendar, path: "/app/admin/schedule" },
    { name: "Documents", icon: FileUp, path: "/app/admin/documents" },
    { name: "Invoices", icon: Receipt, path: "/app/admin/invoices" },
    { name: "Users", icon: Users, path: "/app/admin/users" },
    // { name: "Audit Logs", icon: History, path: "/app/admin/logs" },
  ];
  
  const links = user.role === "admin" ? adminLinks : customerLinks;

  return (
    <>
      {isOpen && (
        <div
          className="max-tablet:block fixed inset-0 z-40 hidden bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={cn(
          "tablet:translate-x-0 fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between p-6">
            <Link to="/" className="flex items-center gap-2">
              <Ship className="text-brand h-8 w-8" />
              <span className="text-xl font-bold tracking-tight text-white">
                Freight Afford
              </span>
            </Link>
            <button className="hidden p-1 text-slate-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={
                  link.path.endsWith("app/customer") ||
                  link.path.endsWith("app/admin")
                }
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all",
                    isActive
                      ? "bg-brand shadow-brand/20 text-white shadow-lg"
                      : "hover:bg-white/5 hover:text-white",
                  )
                }
              >
                <link.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    "group-hover:text-white",
                  )}
                />
                {link.name}
              </NavLink>
            ))}
          </nav>
          {/* Footer */}
          <div className="border-t border-white/5 p-4">
            <button
              onClick={onLogout}
              disabled={isPending}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${isPending ? "bg-red-500/10 text-red-400" : "text-slate-400 hover:bg-red-500/10 hover:text-red-400"}`}
            >
              {isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <LogOut className="h-5 w-5" />
              )}
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
