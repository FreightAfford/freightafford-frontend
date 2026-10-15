import { MessageSquareWarning } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import SmallLoader from "../../../../components/SmallLoader";
import Stepper from "../../../../components/Stepper";
import { useKyc } from "../../../../hooks/useKycService";
import { KYC_STEPS, type KycStepId } from "../../../../types/kyc";
import AuthorisationStep from "./AuthorisationStep";
import BusinessStep from "./BusinessStep";
import DirectorsStep from "./DirectorsStep";
import ReviewStep from "./ReviewStep";
import { fieldLabel } from "../../../../utils/kycFields";
import StatusScreen from "./StatusScreen";
import {
  completedSteps,
  firstOpenStep,
  isReviewedStatus,
  stepStates,
} from "./steps";

const STEP_IDS = KYC_STEPS.map((step) => step.id) as KycStepId[];

const isStep = (value: string | null): value is KycStepId =>
  STEP_IDS.includes(value as KycStepId);

// Business verification (KYC): four steps, saved as the customer moves
// between them. The current step lives in the URL (?step=directors) so a
// reload or the back button keeps their place.
const Verification = () => {
  const { application, isPending } = useKyc();
  const [searchParams, setSearchParams] = useSearchParams();
  const topRef = useRef<HTMLDivElement>(null);
  const requestedStep = searchParams.get("step");

  // Arriving without ?step= picks the first unfinished step; pin it, so an
  // autosave that finishes the step doesn't jump them to the next one.
  useEffect(() => {
    if (!application || isStep(requestedStep)) return;
    setSearchParams({ step: firstOpenStep(application) }, { replace: true });
  }, [application, requestedStep, setSearchParams]);

  if (isPending || !application)
    return (
      <div className="py-24">
        <SmallLoader />
      </div>
    );

  const requested = searchParams.get("step");
  const done = completedSteps(application);
  // Review is only reachable once the three form steps are filled in.
  const step: KycStepId =
    isStep(requested) &&
    (requested !== "review" || Object.values(done).every(Boolean))
      ? requested
      : firstOpenStep(application);

  const goTo = (next: KycStepId) => {
    setSearchParams({ step: next });
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const nextOf = (id: KycStepId) => STEP_IDS[STEP_IDS.indexOf(id) + 1];
  const prevOf = (id: KycStepId) => STEP_IDS[STEP_IDS.indexOf(id) - 1];

  const notes = Object.entries(application.reviewNotes);

  return (
    <div ref={topRef} className="mx-auto max-w-4xl scroll-mt-24">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
          Verify your business
        </h1>
        <p className="mt-1 max-w-2xl text-slate-500">
          We check every account before its first booking. Your progress is
          saved as you type.
        </p>
      </div>

      {isReviewedStatus(application.status) ? (
        <StatusScreen
          application={{ ...application, status: application.status }}
        />
      ) : (
        <>
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white px-6 py-5">
            <Stepper
              steps={KYC_STEPS}
              states={stepStates(application, step)}
              onStepClick={goTo}
            />
          </div>

          {application.status === "changes_requested" && notes.length > 0 && (
            <div
              role="alert"
              className="border-ochre/40 bg-ochre/10 mb-6 flex gap-3 rounded-xl border p-4"
            >
              <MessageSquareWarning
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-[#9a6a0c]"
              />
              <div>
                <p className="font-semibold text-slate-900">
                  Our team asked for changes
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {notes.map(([path, note]) => (
                    <li key={path}>
                      <span className="font-semibold">
                        {fieldLabel(path, application)}:
                      </span>{" "}
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {step === "business" && (
            <BusinessStep
              business={application.business}
              onDone={() => goTo(nextOf("business"))}
            />
          )}
          {step === "directors" && (
            <DirectorsStep
              directors={application.directors}
              onDone={() => goTo(nextOf("directors"))}
              onBack={() => goTo(prevOf("directors"))}
            />
          )}
          {step === "authorisation" && (
            <AuthorisationStep
              authorisation={application.authorisation}
              directors={application.directors}
              onDone={() => goTo(nextOf("authorisation"))}
              onBack={() => goTo(prevOf("authorisation"))}
            />
          )}
          {step === "review" && (
            <ReviewStep application={application} onEdit={goTo} />
          )}
        </>
      )}
    </div>
  );
};

export default Verification;
