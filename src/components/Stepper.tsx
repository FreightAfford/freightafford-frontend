import { AlertCircle, Check } from "lucide-react";
import cn from "../utils/cn";

export type StepState = "done" | "current" | "upcoming" | "attention";

interface StepperProps<Id extends string> {
  steps: readonly { id: Id; label: string }[];
  states: Record<Id, StepState>;
  onStepClick?: (id: Id) => void;
  className?: string;
}

const STATE_TEXT: Record<StepState, string> = {
  done: "completed",
  current: "current step",
  upcoming: "not started",
  attention: "needs changes",
};

// Numbered because the steps are a real sequence. Done steps and steps that
// need changes can be revisited; upcoming ones can't be skipped to.
const Stepper = <Id extends string>({
  steps,
  states,
  onStepClick,
  className,
}: StepperProps<Id>) => {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => states[step.id] === "current"),
  );

  return (
    <nav aria-label="Verification progress" className={className}>
      {/* Phones: one line of text over a segmented bar. */}
      <div className="max-small-tablet:block hidden">
        <p className="text-sm text-slate-500">
          Step {currentIndex + 1} of {steps.length}
        </p>
        <p className="font-display text-lg font-bold text-slate-900">
          {steps[currentIndex]?.label}
        </p>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {steps.map((step) => (
            <span
              key={step.id}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                states[step.id] === "done" && "bg-kelp",
                states[step.id] === "current" && "bg-brand",
                states[step.id] === "attention" && "bg-ochre",
                states[step.id] === "upcoming" && "bg-slate-200",
              )}
            />
          ))}
        </div>
      </div>

      <ol className="max-small-tablet:hidden flex items-center">
        {steps.map((step, index) => {
          const state = states[step.id];
          const clickable =
            onStepClick && (state === "done" || state === "attention");
          const content = (
            <>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  state === "done" && "bg-kelp text-white",
                  state === "current" &&
                    "bg-brand ring-brand/20 text-white ring-4",
                  state === "attention" && "bg-ochre text-harbour",
                  state === "upcoming" &&
                    "border border-slate-300 bg-white text-slate-500",
                )}
              >
                {state === "done" ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : state === "attention" ? (
                  <AlertCircle className="h-4 w-4" strokeWidth={2.5} />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "font-medium whitespace-nowrap",
                  state === "upcoming" ? "text-slate-500" : "text-slate-900",
                )}
              >
                {step.label}
              </span>
              <span className="sr-only">, {STATE_TEXT[state]}</span>
            </>
          );

          return (
            <li
              key={step.id}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1",
              )}
            >
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(step.id)}
                  className="focus-visible:ring-brand -m-1.5 flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-slate-100 focus-visible:ring-2 focus-visible:outline-none"
                >
                  {content}
                </button>
              ) : (
                <span className="flex items-center gap-2.5">{content}</span>
              )}
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mx-4 h-px min-w-6 flex-1",
                    state === "done" ? "bg-kelp" : "bg-slate-200",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
