import { Ship } from "lucide-react";
import { Link } from "react-router";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid grid-cols-4 gap-8">
          <div className="max-medium-mobile:col-span-4 col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <Ship className="text-brand h-6 w-6" />
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Freight Afford
              </span>
            </Link>
            <p className="max-medium-mobile:max-w-full mt-4 max-w-sm text-sm text-slate-500">
              Simplifying container freight booking through structured
              negotiation and transparent compliance.
            </p>
          </div>
          <div className="max-medium-mobile:col-span-2">
            <h3 className="text-sm font-semibold tracking-wider text-slate-900 uppercase">
              Platform
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/login"
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div className="max-medium-mobile:col-span-2">
            <h3 className="text-sm font-semibold tracking-wider text-slate-900 uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/freight-rules"
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  Freight Rules
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Freight Afford. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
