import { Link } from "react-router";
import { CONTACT_EMAIL } from "../utils/contact";
import ContainerRow from "./ContainerRow";
import Logo from "./Logo";

type FooterLink =
  | { label: string; to: string }
  | { label: string; href: string };

const LINK_GROUPS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Start booking", to: "/register" },
      { label: "Log in", to: "/login" },
    ],
  },
  {
    title: "Contact",
    links: [{ label: "Talk to our team", href: `mailto:${CONTACT_EMAIL}` }],
  },
];

const linkClass =
  "text-slate-300 transition-colors hover:text-white focus-visible:text-white";

const Footer = () => {
  return (
    <footer data-nav-surface="harbour" className="bg-harbour text-white">
      <ContainerRow />

      <div className="max-small-tablet:px-4 mx-auto max-w-7xl px-8 pt-16 pb-10">
        <div className="max-small-tablet:grid-cols-2 max-small-tablet:gap-y-12 grid grid-cols-[2fr_1fr_1fr] gap-12">
          <div className="max-small-tablet:col-span-2">
            <Link to="/" className="inline-flex">
              <Logo className="-ml-3 h-11" />
            </Link>
            <p className="mt-4 max-w-sm leading-relaxed text-slate-300">
              Check schedules, book shipments and track cargo across major
              shipping lines, all from one platform. Built for Nigerian
              exporters and export agents.
            </p>
            <p className="mt-6 flex items-center gap-2.5 text-sm text-slate-400">
              <span className="bg-live h-2 w-2 shrink-0 rounded-full" />
              Live with Maersk Line. More shipping lines coming soon.
            </p>
          </div>

          {LINK_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="font-display font-semibold text-white">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {"to" in link ? (
                      <Link to={link.to} className={linkClass}>
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="max-small-tablet:flex-col max-small-tablet:items-start mt-16 flex items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Freightafford International
            Logistics Limited. All rights reserved.
          </p>
          <p>Independent third-party freight provider.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
