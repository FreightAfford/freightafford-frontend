import {
  CalendarCheck,
  FileSearch,
  FileText,
  FileUp,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Receipt,
  ShieldCheck,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router";
import { useLogout, useUser } from "../../hooks/useAuthService";
import { useKycStatus } from "../../hooks/useKycService";
import cn from "../../utils/cn";
import Logo from "../Logo";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

type NavItem = { name: string; icon: LucideIcon; path: string };
type NavGroup = { label?: string; items: NavItem[] };

// Grouped by what people come to do, so related pages sit together.
const CUSTOMER_NAV: NavGroup[] = [
  {
    items: [{ name: "Overview", icon: LayoutDashboard, path: "/app/customer" }],
  },
  {
    label: "Shipping",
    items: [
      {
        name: "Freight requests",
        icon: FileSearch,
        path: "/app/customer/requests",
      },
      { name: "Bookings", icon: CalendarCheck, path: "/app/customer/bookings" },
      { name: "Documents", icon: FileText, path: "/app/customer/documents" },
      { name: "Invoices", icon: Receipt, path: "/app/customer/invoices" },
    ],
  },
  {
    label: "Account",
    items: [
      {
        name: "Verification",
        icon: ShieldCheck,
        path: "/app/customer/verification",
      },
      { name: "Profile", icon: User, path: "/app/customer/profile" },
    ],
  },
  {
    label: "Help",
    items: [
      { name: "Live chat", icon: MessageSquare, path: "/app/customer/chats" },
      { name: "Support", icon: HelpCircle, path: "/app/customer/support" },
    ],
  },
];

const ADMIN_NAV: NavGroup[] = [
  {
    items: [{ name: "Overview", icon: LayoutDashboard, path: "/app/admin" }],
  },
  {
    label: "Shipping",
    items: [
      {
        name: "Freight requests",
        icon: FileSearch,
        path: "/app/admin/requests",
      },
      { name: "Bookings", icon: CalendarCheck, path: "/app/admin/bookings" },
      { name: "Documents", icon: FileUp, path: "/app/admin/documents" },
      { name: "Invoices", icon: Receipt, path: "/app/admin/invoices" },
    ],
  },
  {
    label: "Customers",
    items: [
      { name: "Users", icon: Users, path: "/app/admin/users" },
      {
        name: "Verifications",
        icon: ShieldCheck,
        path: "/app/admin/verifications",
      },
    ],
  },
  {
    label: "Support",
    items: [
      { name: "Live chat", icon: MessageSquare, path: "/app/admin/chats" },
      { name: "Tickets", icon: FileText, path: "/app/admin/tickets" },
    ],
  },
];

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { logout, isPending } = useLogout();
  const isCustomer = user?.role === "customer";
  const { status } = useKycStatus(isCustomer);

  const onLogout = () =>
    logout(undefined, { onSuccess: () => navigate("/login") });

  const groups = user?.role === "admin" ? ADMIN_NAV : CUSTOMER_NAV;
  // A small marker on Verification until the business is verified.
  const verificationPending = isCustomer && !!status && status !== "approved";
  const close = () => setIsOpen(false);

  return (
    <>
      {isOpen && (
        <div
          className="max-tablet:block fixed inset-0 z-45 hidden bg-slate-900/50 backdrop-blur-sm"
          onClick={close}
        />
      )}
      <aside
        className={cn(
          "tablet:translate-x-0 bg-harbour absolute top-0 bottom-0 left-0 z-50 w-64 text-slate-300 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between px-5">
            <Link to="/" className="flex items-center" onClick={close}>
              <Logo className="-ml-2 h-9" />
            </Link>
            <button
              onClick={close}
              aria-label="Close menu"
              className="max-tablet:flex hidden rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav
            aria-label="Dashboard"
            className="scrollbar-on-dark flex-1 overflow-y-auto px-3 pt-2 pb-4"
          >
            {groups.map((group, index) => (
              <div
                key={group.label ?? index}
                className={cn(index > 0 && "mt-5")}
              >
                {group.label && (
                  <p className="mb-1.5 px-3 text-xs font-semibold text-slate-500">
                    {group.label}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        end={
                          item.path === "/app/customer" ||
                          item.path === "/app/admin"
                        }
                        onClick={close}
                        className={({ isActive }) =>
                          cn(
                            "flex h-10 items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-medium whitespace-nowrap transition-colors",
                            isActive
                              ? "bg-brand text-white"
                              : "text-slate-300 hover:bg-white/5 hover:text-white",
                          )
                        }
                      >
                        <item.icon
                          aria-hidden="true"
                          className="h-[18px] w-[18px] shrink-0"
                        />
                        <span className="min-w-0 truncate">{item.name}</span>
                        {item.path.endsWith("/verification") &&
                          verificationPending && (
                            <span
                              title="Not verified yet"
                              className="bg-ochre ml-auto h-2 w-2 shrink-0 rounded-full"
                            >
                              <span className="sr-only">Not verified yet</span>
                            </span>
                          )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 p-3">
            <button
              onClick={onLogout}
              disabled={isPending}
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-medium transition-colors",
                isPending
                  ? "bg-red-500/10 text-red-400"
                  : "text-slate-400 hover:bg-red-500/10 hover:text-red-400",
              )}
            >
              {isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <LogOut
                  aria-hidden="true"
                  className="h-[18px] w-[18px] shrink-0"
                />
              )}
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
