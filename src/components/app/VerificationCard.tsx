import { Check } from "lucide-react";
import { Link } from "react-router";
import { useKycStatus } from "../../hooks/useKycService";
import { completedSteps } from "../../pages/app/customer/verification/steps";
import { KYC_STEPS } from "../../types/kyc";
import cn from "../../utils/cn";
import Button from "../Button";
import VerificationBanner from "./VerificationBanner";

// Overview's fuller take on the banner: for customers who are still filling
// in their details, it lists the steps so they can see what's left.
const VerificationCard = () => {
  const { application, status, nextStep } = useKycStatus();
  if (!application || !status || status === "approved") return null;

  // Once submitted (or reviewed), the banner says everything needed.
  if (status !== "not_started" && status !== "draft")
    return <VerificationBanner className="mb-8" />;

  const done = completedSteps(application);
  const steps = KYC_STEPS.filter(
    (step): step is Exclude<(typeof KYC_STEPS)[number], { id: "review" }> =>
      step.id !== "review",
  );

  return (
    <section className="border-brand/25 mb-8 rounded-2xl border bg-[#f2f8ff] p-6">
      <div className="max-small-tablet:flex-col max-small-tablet:items-start flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            {status === "not_started"
              ? "Verify your business to start booking"
              : "Finish verifying your business"}
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
            We check every account before its first booking. Your progress is
            saved as you go.
          </p>
        </div>
        <Link
          to={`/app/customer/verification?step=${nextStep ?? "business"}`}
          className="max-small-tablet:w-full shrink-0"
        >
          <Button className="max-small-tablet:w-full h-11 rounded-xl px-5 font-semibold">
            {status === "not_started" ? "Start verification" : "Continue"}
          </Button>
        </Link>
      </div>

      <ol className="max-small-tablet:grid-cols-1 mt-6 grid grid-cols-3 gap-3">
        {steps.map((step, index) => {
          const finished = done[step.id];
          return (
            <li
              key={step.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  finished
                    ? "bg-kelp text-white"
                    : "border border-slate-300 text-slate-500",
                )}
              >
                {finished ? (
                  <Check
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={3}
                  />
                ) : (
                  index + 1
                )}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-slate-900">
                  {step.label}
                </span>
                <span className="block text-sm text-slate-500">
                  {finished ? "Done" : "To do"}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default VerificationCard;
