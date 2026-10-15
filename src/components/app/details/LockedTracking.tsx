import {
  ArrowRight,
  Check,
  Clock,
  Lock,
  Mail,
  Radar,
  Ship,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";
import type { KycStatus } from "../../../types/kyc";
import cn from "../../../utils/cn";
import { CONTACT_EMAIL } from "../../../utils/contact";
import Button from "../../Button";

const VERIFY_PATH = "/app/customer/verification";

type Action = { label: string; icon: LucideIcon } & (
  | { to: string }
  | { href: string }
);

// The next move for each verification status.
const nextMove = (
  status?: KycStatus,
  nextStep?: string,
): { text: string; action: Action | null } => {
  switch (status) {
    case "submitted":
    case "in_review":
      return {
        text: "We're reviewing your business now. Live tracking opens here as soon as it's verified.",
        action: null,
      };
    case "changes_requested":
      return {
        text: "Our team asked for a few changes. Update them and live tracking opens once your business is verified.",
        action: {
          label: "See what to change",
          to: VERIFY_PATH,
          icon: ArrowRight,
        },
      };
    case "rejected":
      return {
        text: "We couldn't verify your business. Contact our team to find out what's needed.",
        action: {
          label: "Contact our team",
          href: `mailto:${CONTACT_EMAIL}`,
          icon: Mail,
        },
      };
    case "draft":
      return {
        text: "Finish verifying your business to follow your cargo at every step, from pick-up to delivery.",
        action: {
          label: "Continue verification",
          to: `${VERIFY_PATH}?step=${nextStep ?? "business"}`,
          icon: ArrowRight,
        },
      };
    default:
      return {
        text: "Verify your business to follow your cargo at every step, from pick-up to delivery. It takes a few minutes and your progress is saved.",
        action: {
          label: "Verify your business",
          to: VERIFY_PATH,
          icon: ArrowRight,
        },
      };
  }
};

// A faint picture of what's behind the lock: the milestone rail.
const PREVIEW = ["Picked up", "Gated in", "Departed", "Arrived", "Delivered"];

// Live tracking for customers whose business isn't verified yet. Freight
// requests and bookings stay open; only carrier tracking waits.
const LockedTracking = ({
  status,
  nextStep,
}: {
  status?: KycStatus;
  nextStep?: string;
}) => {
  const move = nextMove(status, nextStep);
  const reviewing = status === "submitted" || status === "in_review";
  const Icon = reviewing ? Clock : Lock;

  return (
    <section
      aria-labelledby="tracking-locked-title"
      className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 @xl:p-6"
    >
      <h2
        id="tracking-locked-title"
        className="mb-5 flex items-center gap-2.5 text-base font-bold text-slate-900"
      >
        <Radar aria-hidden="true" className="text-brand h-5 w-5" />
        Live tracking
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          <Lock aria-hidden="true" className="h-3 w-3" />
          Verified businesses
        </span>
      </h2>

      <div className="relative">
        {/* Preview of the rail, behind frosted glass */}
        <div
          aria-hidden="true"
          className="pointer-events-none grid grid-cols-5 gap-0 opacity-60 blur-[2px] select-none"
        >
          {PREVIEW.map((label, index) => (
            <div key={label} className="relative flex flex-col gap-2 pr-2">
              {index < PREVIEW.length - 1 && (
                <span
                  className={cn(
                    "absolute top-[11px] right-0 left-8 h-0.5 rounded-full",
                    index < 2 ? "bg-kelp" : "bg-slate-200",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative flex h-6 w-6 items-center justify-center rounded-full",
                  index < 2
                    ? "bg-kelp text-white"
                    : index === 2
                      ? "bg-brand text-white"
                      : "border-2 border-slate-200 bg-white",
                )}
              >
                {index < 2 && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                {index === 2 && <Ship className="h-3.5 w-3.5" />}
              </span>
              <span className="font-display truncate text-sm font-bold text-slate-700">
                {label}
              </span>
              <span className="h-2.5 w-14 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>

        {/* The message, over the preview */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/85 to-white" />
        <div className="relative -mt-6 flex flex-col items-center px-2 pb-1 text-center @xl:-mt-10">
          <span className="bg-harbour flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[0_8px_20px_-8px_rgb(10_35_66/0.6)]">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <p className="font-display mt-3 text-lg font-bold text-slate-900">
            {reviewing
              ? "Live tracking opens after review"
              : "See where your cargo is, live"}
          </p>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-600">
            {move.text}
          </p>
          {move.action &&
            ("to" in move.action ? (
              <Link to={move.action.to} className="mt-4">
                <Button
                  icon={move.action.icon}
                  className="h-11 rounded-xl px-5 font-semibold"
                >
                  {move.action.label}
                </Button>
              </Link>
            ) : (
              <a href={move.action.href} className="mt-4">
                <Button
                  icon={move.action.icon}
                  variant="outline"
                  className="h-11 rounded-xl px-5 font-semibold"
                >
                  {move.action.label}
                </Button>
              </a>
            ))}
        </div>
      </div>
    </section>
  );
};

export default LockedTracking;
