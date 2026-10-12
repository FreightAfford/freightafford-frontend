import { Link } from "react-router";
import { CONTACT_EMAIL } from "../utils/contact";
import cn from "../utils/cn";
import Logo from "./Logo";

// A row of containers along the top edge, echoing the stack in the hero.
// Widths are 20ft (1) and 40ft (2) boxes, repeated to fill the row.
const CONTAINER_ROW = [
  { span: 2, color: "bg-ochre" },
  { span: 1, color: "bg-[#3f7cbf]" },
  { span: 2, color: "bg-kelp" },
  { span: 1, color: "bg-[#16395f]" },
  { span: 1, color: "bg-ochre" },
  { span: 2, color: "bg-[#3f7cbf]" },
  { span: 1, color: "bg-kelp" },
  { span: 2, color: "bg-[#16395f]" },
  { span: 1, color: "bg-[#3f7cbf]" },
  { span: 2, color: "bg-ochre" },
  { span: 1, color: "bg-kelp" },
  { span: 1, color: "bg-[#3f7cbf]" },
];

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
    links: [
      { label: "Talk to our team", href: `mailto:${CONTACT_EMAIL}` },
    ],
  },
];

const linkClass =
  "text-slate-300 transition-colors hover:text-white focus-visible:text-white";

const Footer = () => {
  return (
    <footer data-nav-surface="harbour" className="bg-harbour text-white">
      <div aria-hidden="true" className="flex h-2.5 gap-[3px] overflow-hidden">
        {[...CONTAINER_ROW, ...CONTAINER_ROW].map((box, i) => (
          <span
            key={i}
            className={cn("min-w-0", box.color)}
            style={{ flexGrow: box.span, flexBasis: 0 }}
          />
        ))}
      </div>

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
