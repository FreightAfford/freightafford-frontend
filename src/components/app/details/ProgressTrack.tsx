import { Check, X } from "lucide-react";
import cn from "../../../utils/cn";

export type TrackStep = {
  label: string;
  detail?: string;
  state: "done" | "current" | "upcoming" | "stopped";
};

// Where a request or booking is in its journey. Steps sit in a row when the
// page is wide and stack when it's narrow.
const ProgressTrack = ({
  steps,
  label,
}: {
  steps: TrackStep[];
  label: string;
}) => (
  <section
    aria-label={label}
    className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 @xl:p-6"
  >
    <div className="@container">
      <ol className="grid gap-0 @2xl:auto-cols-fr @2xl:grid-flow-col">
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          const nextDone =
            !last &&
            (steps[index + 1].state === "done" ||
              steps[index + 1].state === "current" ||
              steps[index + 1].state === "stopped");
          return (
            <li
              key={step.label}
              aria-current={step.state === "current" ? "step" : undefined}
              className="relative flex gap-3 pb-5 last:pb-0 @2xl:flex-col @2xl:gap-2.5 @2xl:pr-4 @2xl:pb-0"
            >
              {/* Connector to the next step. */}
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-8 bottom-0 left-[15px] w-0.5 rounded-full @2xl:top-[15px] @2xl:right-0 @2xl:bottom-auto @2xl:left-10 @2xl:h-0.5 @2xl:w-auto",
                    nextDone ? "bg-kelp" : "bg-slate-200",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  step.state === "done" && "bg-kelp text-white",
                  step.state === "current" &&
                    "bg-brand text-white ring-4 ring-[#1e90ff]/15",
                  step.state === "upcoming" &&
                    "border-2 border-slate-200 bg-white text-slate-400",
                  step.state === "stopped" && "bg-red-500 text-white",
                )}
              >
                {step.state === "done" ? (
                  <Check
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={3}
                  />
                ) : step.state === "stopped" ? (
                  <X aria-hidden="true" className="h-4 w-4" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </span>
              <div className="min-w-0 pt-1 @2xl:pt-0">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    step.state === "upcoming"
                      ? "text-slate-400"
                      : "text-slate-900",
                    step.state === "stopped" && "text-red-700",
                  )}
                >
                  {step.label}
                </p>
                {step.detail && (
                  <p className="mt-0.5 text-sm text-slate-500">{step.detail}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  </section>
);

export default ProgressTrack;
