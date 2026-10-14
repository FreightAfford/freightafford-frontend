import { LayoutDashboard, LogIn, Menu, Ship, X } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router";
import { useUser } from "../hooks/useAuthService";
import cn from "../utils/cn";
import { scrollToSection } from "../utils/scroll";
import Button from "./Button";
import Logo from "./Logo";

// Text and control colours for a bar sitting on a light or dark surface.
const INK = {
  dark: {
    link: "text-slate-700 hover:text-slate-950",
    ghost: "text-slate-700 hover:text-slate-950",
    cta: "",
    menuButton: "text-slate-700 hover:bg-slate-900/5 hover:text-slate-950",
  },
  light: {
    link: "text-slate-200 hover:text-white",
    ghost: "text-slate-200 hover:bg-white/10 hover:text-white",
    cta: "",
    menuButton: "text-slate-200 hover:bg-white/10 hover:text-white",
  },
};

// Pages mark their sections with data-nav-surface; the bar takes on the
// colour of whichever one is underneath it.
const SURFACES = {
  white: { bar: "bg-white/80", ink: INK.dark },
  mist: { bar: "bg-mist/85", ink: INK.dark },
  harbour: { bar: "bg-harbour/85", ink: INK.light },
  hero: { bar: "bg-[#061a31]/85", ink: INK.light },
  brand: {
    bar: "bg-brand/90",
    // The brand-blue CTA button would vanish on a brand-blue bar.
    ink: { ...INK.light, cta: "bg-white text-harbour hover:bg-slate-100" },
  },
};

type Surface = keyof typeof SURFACES;

const NAV_HEIGHT = 64;

// Keeps the top-bar button on one line, a little smaller on small phones.
const BAR_CTA =
  "whitespace-nowrap max-small-mobile:h-9 max-small-mobile:px-3 max-small-mobile:text-sm";

const NAV_LINKS = [
  { name: "Services", section: "services" },
  { name: "Who it's for", section: "who-its-for" },
  { name: "Shipping lines", section: "shipping-lines" },
];

// Links to a landing-page section. On the landing page it glides there
// directly (a URL hash would make the router jump instantly); elsewhere it
// goes home first and the landing page picks up the section from state.
const SectionLink = ({
  section,
  className,
  children,
  onNavigate,
  delay = 0,
}: {
  section: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
  delay?: number;
}) => {
  const { pathname } = useLocation();
  return (
    <Link
      to="/"
      state={{ section }}
      className={className}
      onClick={(event) => {
        onNavigate?.();
        if (pathname !== "/") return;
        event.preventDefault();
        setTimeout(() => scrollToSection(section), delay);
      }}
    >
      {children}
    </Link>
  );
};

const useSurfaceBelow = (adaptive: boolean) => {
  const [surface, setSurface] = useState<Surface>("white");
  const [atTop, setAtTop] = useState<boolean>(true);

  useEffect(() => {
    if (!adaptive) return;

    const update = () => {
      setAtTop(window.scrollY < 8);
      const probe = NAV_HEIGHT / 2;
      const sections =
        document.querySelectorAll<HTMLElement>("[data-nav-surface]");
      let found: string = "white";
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= probe && rect.bottom > probe) {
          found = section.dataset.navSurface ?? "white";
        }
      });
      setSurface(found in SURFACES ? (found as Surface) : "white");
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [adaptive]);

  return { surface: adaptive ? surface : "white", atTop: adaptive && atTop };
};

const EASE = [0.22, 1, 0.36, 1] as const;

const drawerLinks: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const drawerLink: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
};

const MobileDrawer = ({
  isOpen,
  onClose,
  dashboardPath,
}: {
  isOpen: boolean;
  onClose: () => void;
  dashboardPath?: string;
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  // Rendered into <body>: the bar's backdrop blur would otherwise trap a
  // fixed-position drawer inside the 64px bar.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60">
          <motion.button
            aria-label="Close menu"
            className="absolute inset-0 cursor-default bg-[#030d1a]/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          <motion.aside
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="bg-harbour absolute inset-y-0 left-0 flex w-[min(85vw,22rem)] flex-col text-white shadow-[24px_0_60px_-20px_rgba(0,0,0,0.6)]"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="flex h-16 items-center justify-between px-4">
              <Link to="/" onClick={onClose} className="flex items-center">
                <Logo className="-ml-2 h-10" />
              </Link>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-md p-2 text-slate-300 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <motion.nav
              aria-label="Main"
              className="scrollbar-on-dark flex-1 overflow-y-auto px-4 pt-6"
              variants={drawerLinks}
              initial="hidden"
              animate="show"
            >
              <ul>
                {NAV_LINKS.map((link) => (
                  <motion.li key={link.section} variants={drawerLink}>
                    <SectionLink
                      section={link.section}
                      onNavigate={onClose}
                      delay={250}
                      className="font-display block rounded-lg px-3 py-3 text-2xl font-bold tracking-tight text-slate-100 hover:bg-white/5 hover:text-white"
                    >
                      {link.name}
                    </SectionLink>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>

            <div className="space-y-3 border-t border-white/10 p-4">
              {dashboardPath ? (
                <Link to={dashboardPath} onClick={onClose} className="block">
                  <Button icon={LayoutDashboard} size="lg" className="w-full">
                    Go to dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register" onClick={onClose} className="block">
                    <Button icon={Ship} size="lg" className="w-full">
                      Start booking
                    </Button>
                  </Link>
                  <Link to="/login" onClick={onClose} className="block">
                    <Button
                      icon={LogIn}
                      size="lg"
                      variant="outline"
                      className="w-full border-white/25 text-white hover:bg-white/10"
                    >
                      Log in
                    </Button>
                  </Link>
                </>
              )}
              <p className="flex items-center gap-2 pt-2 text-sm text-slate-400">
                <span className="bg-live h-2 w-2 shrink-0 rounded-full" />
                Live with Maersk Line
              </p>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

const NavBar = ({ adaptive = false }: { adaptive?: boolean }) => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const location = useLocation();
  const { surface, atTop } = useSurfaceBelow(adaptive);

  const theme = SURFACES[surface];
  const ink = theme.ink;
  const dashboardPath = user ? `/app/${user.role}` : undefined;
  const closeMenu = useCallback(() => setIsOpen(false), []);

  // Close the menu after navigating. Adjusting state while rendering avoids
  // the extra render pass a setState-in-effect would cause.
  const [lastLocationKey, setLastLocationKey] = useState(location.key);
  if (location.key !== lastLocationKey) {
    setLastLocationKey(location.key);
    setIsOpen(false);
  }

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,backdrop-filter] duration-500",
        atTop ? "bg-transparent" : cn(theme.bar, "backdrop-blur-md"),
      )}
    >
      <div className="max-small-tablet:px-4 mx-auto max-w-7xl px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className={cn(
                "max-small-tablet:inline-flex -ml-2 hidden items-center justify-center rounded-md p-2 transition-colors focus-visible:ring-2 focus-visible:ring-current/40 focus-visible:outline-none",
                ink.menuButton,
              )}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* The artwork has built-in side padding; pull it back to the gutter. */}
            <Link to="/" className="flex items-center">
              <Logo
                className={cn(
                  "max-small-tablet:ml-0 -ml-3 h-10 transition-colors duration-500",
                  surface === "brand" && "text-white",
                )}
              />
            </Link>
          </div>

          <ul className="max-small-tablet:hidden flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.section}>
                <SectionLink
                  section={link.section}
                  className={cn(
                    "text-[0.9375rem] font-medium transition-colors duration-300",
                    ink.link,
                  )}
                >
                  {link.name}
                </SectionLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {dashboardPath ? (
              <Link to={dashboardPath}>
                <Button
                  icon={LayoutDashboard}
                  size="md"
                  className={cn(BAR_CTA, ink.cta)}
                >
                  Go to dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="max-medium-mobile:hidden">
                  <Button
                    icon={LogIn}
                    size="md"
                    variant="ghost"
                    className={ink.ghost}
                  >
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    icon={Ship}
                    size="md"
                    className={cn(BAR_CTA, ink.cta)}
                  >
                    Start booking
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <MobileDrawer
        isOpen={isOpen}
        onClose={closeMenu}
        dashboardPath={dashboardPath}
      />
    </nav>
  );
};
export default NavBar;
