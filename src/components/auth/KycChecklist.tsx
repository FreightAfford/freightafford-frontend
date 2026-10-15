import {
  Building2,
  FileSignature,
  Home,
  IdCard,
  Receipt,
  Ship,
} from "lucide-react";

const REQUIREMENTS = [
  {
    icon: Building2,
    title: "CAC registration",
    detail: "Your RC or BN number and the certificate",
  },
  {
    icon: Receipt,
    title: "Tax identification number",
    detail: "If you have one, with the certificate from FIRS or JTB",
  },
  {
    icon: Ship,
    title: "NEPC registration",
    detail: "Your exporter certificate, still in date",
  },
  {
    icon: IdCard,
    title: "Director or owner ID",
    detail: "NIN slip, international passport or driver's licence",
  },
  {
    icon: Home,
    title: "Proof of business address",
    detail: "A utility bill dated within the last 3 months",
  },
  {
    icon: FileSignature,
    title: "Letter of authority",
    detail: "On your company letterhead, signed by a director",
  },
];

// Shown beside sign-up so people can gather documents before they start.
const KycChecklist = () => (
  <div>
    <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.1rem)] leading-tight font-extrabold tracking-tight">
      What you'll need to verify your business
    </h2>
    <p className="mt-3 max-w-md leading-relaxed text-slate-300">
      You can request freight straight after signing up. Verifying your business
      unlocks live tracking; have these ready, and save your progress to finish
      later.
    </p>

    <ul className="mt-8 space-y-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
      {REQUIREMENTS.map(({ icon: Icon, title, detail }) => (
        <li
          key={title}
          className="flex items-start gap-4 bg-[#0c2747]/95 px-5 py-4"
        >
          <Icon
            aria-hidden="true"
            className="text-ochre mt-0.5 h-5 w-5 shrink-0"
          />
          <div>
            <p className="font-semibold text-white">{title}</p>
            <p className="text-sm text-slate-400">{detail}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default KycChecklist;
