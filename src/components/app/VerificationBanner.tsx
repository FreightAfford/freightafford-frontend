import {
  ArrowRight,
  Clock,
  Mail,
  MessageSquareWarning,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";
import { useKycStatus } from "../../hooks/useKycService";
import type { KycStatus } from "../../types/kyc";
import cn from "../../utils/cn";
import { CONTACT_EMAIL } from "../../utils/contact";
import Button from "../Button";

const VERIFY_PATH = "/app/customer/verification";

type Tone = "brand" | "ochre" | "red";

const TONES: Record<Tone, { box: string; icon: string }> = {
  brand: {
    box: "border-brand/25 bg-[#f2f8ff]",
    icon: "bg-brand/10 text-brand",
  },
  ochre: {
    box: "border-ochre/40 bg-ochre/10",
    icon: "bg-ochre/20 text-[#9a6a0c]",
  },
  red: { box: "border-red-200 bg-red-50", icon: "bg-red-100 text-red-600" },
};

type Content = {
  tone: Tone;
  icon: LucideIcon;
  title: string;
  body: string;
  action?: { label: string; to?: string; href?: string };
};

const content = (
  status: KycStatus,
  doneCount: number,
  totalSteps: number,
  nextStep?: string,
  noteStep?: string,
): Content | null => {
  switch (status) {
    case "not_started":
      return {
        tone: "brand",
        icon: ShieldCheck,
        title: "Verify your business to start booking",
        body: "Have your CAC certificate, NEPC certificate, a director's ID and your company's letter of authority ready.",
        action: { label: "Start verification", to: VERIFY_PATH },
      };
    case "draft":
      return {
        tone: "brand",
        icon: ShieldCheck,
        title: "Finish verifying your business",
        body: `${doneCount} of ${totalSteps} steps done. Your progress is saved, so you can pick up where you stopped.`,
        action: {
          label: "Continue",
          to: `${VERIFY_PATH}?step=${nextStep ?? "business"}`,
        },
      };
    case "submitted":
    case "in_review":
      return {
        tone: "ochre",
        icon: Clock,
        title: "We're reviewing your business details",
        body: "We'll email you when it's done. You can book shipments once your business is verified.",
      };
    case "changes_requested":
      return {
        tone: "ochre",
        icon: MessageSquareWarning,
        title: "Our team asked for changes",
        body: "Update the details we flagged and submit again to finish verification.",
        action: {
          label: "See what to change",
          to: `${VERIFY_PATH}?step=${noteStep ?? "review"}`,
        },
      };
    case "rejected":
      return {
        tone: "red",
        icon: XCircle,
        title: "We couldn't verify your business",
        body: "Contact our team to find out what's needed before you can book.",
        action: { label: "Contact our team", href: `mailto:${CONTACT_EMAIL}` },
      };
    default:
      return null;
  }
};

// Shown across the customer dashboard until the business is verified. It
// can't be dismissed: it's the one thing between the customer and booking.
const VerificationBanner = ({ className }: { className?: string }) => {
  const { application, status, doneCount, totalSteps, nextStep } =
    useKycStatus();
  if (!application || !status) return null;

  const noteStep = Object.keys(application.reviewNotes)[0]?.split(".")[0];
  const banner = content(status, doneCount, totalSteps, nextStep, noteStep);
  if (!banner) return null;

  const tone = TONES[banner.tone];
  const Icon = banner.icon;
  const action = banner.action;

  return (
    <div
      role="status"
      className={cn(
        "max-small-tablet:flex-col max-small-tablet:items-stretch flex items-center gap-4 rounded-2xl border p-4",
        tone.box,
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            tone.icon,
          )}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display font-bold text-slate-900">
            {banner.title}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
            {banner.body}
          </p>
        </div>
      </div>
      {action &&
        (action.to ? (
          <Link to={action.to} className="shrink-0">
            <Button
              icon={ArrowRight}
              className="max-small-tablet:w-full h-11 rounded-xl px-5 font-semibold"
            >
              {action.label}
            </Button>
          </Link>
        ) : (
          <a href={action.href} className="shrink-0">
            <Button
              variant="outline"
              icon={Mail}
              className="max-small-tablet:w-full h-11 rounded-xl bg-white px-5 font-semibold"
            >
              {action.label}
            </Button>
          </a>
        ))}
    </div>
  );
};

export default VerificationBanner;
