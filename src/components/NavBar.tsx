import { Menu, Ship, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useUser } from "../hooks/useAuthService";
import Button from "./Button";

const NavBar = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Freight Rules", path: "/freight-rules" },
    { name: "Terms", path: "/terms" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md">
      <div className="max-small-tablet:px-4 mx-auto max-w-7xl px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Ship className="text-brand h-8 w-8" />
            <span className="text-secondary text-xl font-bold tracking-tight">
              Freight Afford
            </span>
          </Link>
          <div className="max-mobile:hidden flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="max-mobile:hidden flex items-center gap-4">
            {user ? (
              <Link to={`/app/${user.role}`}>
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button size="sm" variant="ghost">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Create Account</Button>
                </Link>
              </>
            )}
          </div>

          <div className="max-mobile:flex hidden">
            <button
              onClick={() => setIsOpen((open) => !open)}
              className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="max-mobile:block hidden w-full border-t border-slate-100 bg-white"
          >
            <div className="space-y-1 px-4 pt-2 pb-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  {link.name}
                </NavLink>
              ))}
              <div className="mt-4 border-t border-slate-100 pt-4 pb-2">
                <div className="flex flex-col gap-2">
                  {user ? (
                    <Link to={`/app/${user.role}`}>
                      <Button className="w-full">Dashboard</Button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/login" className="block">
                        <Button variant="outline" className="w-full">
                          Log in
                        </Button>
                      </Link>
                      <Link to="/register" className="block">
                        <Button className="w-full">Create Account</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
export default NavBar;
