import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  FileSignature,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";
import { useKycStatus } from "../../hooks/useKycService";
import { completedSteps } from "../../pages/app/customer/verification/steps";
import type { KycStepId } from "../../types/kyc";
import cn from "../../utils/cn";
import Button from "../Button";
import VerificationBanner from "./VerificationBanner";

const VERIFY_PATH = "/app/customer/verification";

type FormStep = Exclude<KycStepId, "review">;

// What each step asks for, so people know what to have ready.
const STEPS: {
  id: FormStep;
  label: string;
  needs: string;
  icon: LucideIcon;
}[] = [
  {
    id: "business",
    label: "Business",
    needs: "CAC and NEPC certificates, business address",
    icon: Building2,
  },
  {
    id: "directors",
    label: "Directors",
    needs: "A valid ID for each director or owner",
    icon: Users,
  },
  {
    id: "authorisation",
    label: "Authorisation",
    needs: "Your company's signed letter of authority",
    icon: FileSignature,
  },
];

// Overview's fuller take on the banner: for customers who are still filling
// in their details, it shows each step and what it needs.
const VerificationCard = () => {
  const { application, status, nextStep } = useKycStatus();
  if (!application || !status || status === "approved") return null;

  // Once submitted (or reviewed), the banner says everything needed.
  if (status !== "not_started" && status !== "draft")
    return <VerificationBanner className="mb-8" />;

  const done = completedSteps(application);
  const doneCount = STEPS.filter((step) => done[step.id]).length;
  const upNext = STEPS.find((step) => !done[step.id])?.id;
  const started = status === "draft";

  return (
    <section
      aria-labelledby="verify-title"
      className="max-mobile:p-5 mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgb(15_23_43/0.04)]"
    >
      <div className="max-small-tablet:flex-col max-small-tablet:items-stretch flex items-center gap-5">
        <span className="bg-brand/10 text-brand max-small-tablet:hidden flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
          <ShieldCheck aria-hidden="true" className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="verify-title"
            className="font-display text-lg font-bold text-slate-900"
          >
            {started
              ? "Finish verifying your business"
              : "Verify your business to start booking"}
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
            We check every account before its first booking. Your progress is
            saved as you go.
          </p>
        </div>
        <Link
          to={`${VERIFY_PATH}?step=${nextStep ?? "business"}`}
          className="max-small-tablet:w-full shrink-0"
        >
          <Button
            icon={started ? ArrowRight : ShieldCheck}
            className="max-small-tablet:w-full h-11 rounded-xl px-5 font-semibold"
          >
            {started ? "Continue" : "Start verification"}
          </Button>
        </Link>
      </div>

      {/* Progress: one segment per step. */}
      <div className="mt-6 flex items-center gap-3">
        <div
          role="progressbar"
          aria-label="Verification progress"
          aria-valuemin={0}
          aria-valuemax={STEPS.length}
          aria-valuenow={doneCount}
          className="flex flex-1 gap-1.5"
        >
          {STEPS.map((step) => (
            <span
              key={step.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                done[step.id] ? "bg-kelp" : "bg-slate-200",
              )}
            />
          ))}
        </div>
        <span className="shrink-0 text-sm font-medium text-slate-500 tabular-nums">
          {doneCount} of {STEPS.length} done
        </span>
      </div>

      <ol className="max-small-tablet:grid-cols-1 max-small-tablet:divide-x-0 max-small-tablet:divide-y mt-4 grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
        {STEPS.map((step) => {
          const finished = done[step.id];
          const isNext = step.id === upNext;
          const Icon = finished ? Check : step.icon;
          return (
            <li key={step.id}>
              <Link
                to={`${VERIFY_PATH}?step=${step.id}`}
                className={cn(
                  "group focus-visible:ring-brand flex h-full items-start gap-3 p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                  isNext
                    ? "bg-brand/[0.04] hover:bg-brand/[0.07]"
                    : "hover:bg-slate-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    finished
                      ? "bg-kelp/10 text-kelp"
                      : isNext
                        ? "bg-brand/10 text-brand"
                        : "bg-slate-100 text-slate-400",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className="h-[18px] w-[18px]"
                    strokeWidth={finished ? 2.75 : 2}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-display font-semibold text-slate-900">
                      {step.label}
                    </span>
                    {finished ? (
                      <span className="text-kelp text-xs font-semibold">
                        Done
                      </span>
                    ) : (
                      isNext && (
                        <span className="text-brand text-xs font-semibold">
                          Up next
                        </span>
                      )
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-slate-500">
                    {step.needs}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="mt-2 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500"
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default VerificationCard;
