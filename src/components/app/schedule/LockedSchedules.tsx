import { ArrowRight, CheckCircle2, Clock, Lock } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useKycStatus } from "../../../hooks/useKycService";
import type { KycStatus } from "../../../types/kyc";
import cn from "../../../utils/cn";
import { stagger } from "../../../utils/motion";

const BENEFITS = [
  "Live Maersk sailings, not last month's PDF",
  "Know which sailings still take cargo before you book",
  "Every deadline in the port's own time",
];

const IN_REVIEW: KycStatus[] = ["submitted", "in_review"];

const ctaLabel = (status?: KycStatus) =>
  !status || status === "not_started"
    ? "Start verification"
    : status === "changes_requested" || status === "rejected"
      ? "Update your verification"
      : "Continue verification";

// A real route, dimmed, so customers see what's waiting for them
const RoutePreview = () => (
  <div
    aria-hidden="true"
    className="relative rounded-xl border border-slate-200 bg-slate-50 p-4 select-none"
  >
    <div className="pointer-events-none opacity-60 blur-[0.5px]">
      <div className="flex items-start justify-between gap-3 text-xs text-slate-500">
        <span>Departure</span>
        <span>Transit time</span>
      </div>
      <div className="mt-0.5 flex items-start justify-between gap-3">
        <span className="font-display font-bold text-slate-900">
          20 Oct 2026
        </span>
        <span className="font-display font-bold text-slate-900">
          33 days 4 hours
        </span>
      </div>
      <div className="relative mt-5 mb-1 flex items-center justify-between">
        <span
          className="absolute inset-x-1.5 top-1/2 border-t-2 border-dashed border-slate-300"
          aria-hidden="true"
        />
        <span className="bg-brand relative h-3 w-3 rounded-full ring-4 ring-slate-50" />
        <span className="relative h-3 w-3 rounded-full border-2 border-slate-400 bg-white" />
        <span className="bg-harbour relative h-3 w-3 rounded-full ring-4 ring-slate-50" />
      </div>
      <div className="flex items-start justify-between gap-2 text-xs text-slate-600">
        <span>Shanghai</span>
        <span className="text-center">Tanjung Pelepas</span>
        <span className="text-right">Apapa</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {["Container gate-in", "Shipping instructions"].map((label) => (
          <span
            key={label}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-600"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
    <span className="absolute inset-0 flex items-center justify-center">
      <span className="bg-harbour flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
        <Lock className="h-3.5 w-3.5" />
        Unlocks after verification
      </span>
    </span>
  </div>
);

// What an unverified customer sees on Sailing schedules: what they'd get,
// where their verification stands, and the one step that opens it.
const LockedSchedules = () => {
  const { status, doneCount, totalSteps } = useKycStatus();
  const reviewing = !!status && IN_REVIEW.includes(status);
  const progress = reviewing ? 1 : Math.min(doneCount / totalSteps, 1);

  return (
    <>
      <motion.div {...stagger(0)} className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Sailing schedules</h1>
        <p className="mt-1 max-w-2xl text-slate-500">
          {reviewing
            ? "Your business verification is being reviewed. You'll get access to port schedules, point to point routes and vessel schedules once it's approved."
            : "Verify your business to get access to port schedules, point to point routes and vessel schedules."}
        </p>
      </motion.div>

      <motion.section
        {...stagger(1)}
        aria-labelledby="locked-title"
        className="@container relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm @xl:p-7"
      >
        {/* A soft glow behind the content, kept to one corner */}
        <span
          aria-hidden="true"
          className="bg-brand/10 absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"
        />
        <div className="relative grid gap-6 @3xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @3xl:items-center @3xl:gap-10">
          <div className="min-w-0">
            <span className="bg-mist text-harbour inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
              <Lock aria-hidden="true" className="h-3.5 w-3.5" />
              Available to verified businesses
            </span>
            <h2
              id="locked-title"
              className="mt-3 text-xl leading-snug font-bold text-balance text-slate-900 @xl:text-2xl"
            >
              See every Maersk sailing before you book
            </h2>
            <ul className="mt-4 space-y-2">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="text-kelp mt-0.5 h-4 w-4 shrink-0"
                  />
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="mt-6 max-w-sm">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Your verification</span>
                <span className="font-semibold text-slate-900">
                  {reviewing
                    ? "Submitted"
                    : `${doneCount} of ${totalSteps} steps done`}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Verification progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"
              >
                <span
                  className={cn(
                    "block h-full rounded-full",
                    reviewing ? "bg-ochre" : "bg-brand",
                  )}
                  style={{ width: `${Math.max(progress * 100, 4)}%` }}
                />
              </div>
            </div>

            <div className="mt-5">
              {reviewing ? (
                <span className="bg-ochre/15 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-[#9a6a0c]">
                  <Clock aria-hidden="true" className="h-4 w-4" />
                  Under review: we'll email you when it's approved
                </span>
              ) : (
                <Link
                  to="/app/customer/verification"
                  className="bg-brand focus-visible:ring-brand/40 inline-flex h-11 items-center gap-2 rounded-xl px-5 font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
                >
                  {ctaLabel(status)}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          <RoutePreview />
        </div>
      </motion.section>
    </>
  );
};

export default LockedSchedules;
