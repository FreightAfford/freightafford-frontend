import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import Checkbox from "../../../../components/Checkbox";
import ApplicationSummary from "../../../../components/kyc/ApplicationSummary";
import { useSubmitKyc } from "../../../../hooks/useKycService";
import type { KycApplication, KycStepId } from "../../../../types/kyc";
import { TEXT_LINK } from "../../../../utils/authStyles";
import { declarationSchema } from "../../../../validations/kycValidation";
import { FormSection, StepActions } from "./parts";
import { completedSteps } from "./steps";

const ReviewStep = ({
  application,
  onEdit,
}: {
  application: KycApplication;
  onEdit: (step: KycStepId) => void;
}) => {
  const { submitKyc, isPending } = useSubmitKyc();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(declarationSchema),
    defaultValues: { declaration: false },
  });

  const done = completedSteps(application);
  const unfinished = (Object.keys(done) as (keyof typeof done)[]).filter(
    (step) => !done[step],
  );

  const edit = (step: KycStepId) => (
    <button
      type="button"
      onClick={() => onEdit(step)}
      className={`${TEXT_LINK} inline-flex shrink-0 items-center gap-1 text-sm`}
    >
      <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
      Edit
    </button>
  );

  return (
    <form
      noValidate
      onSubmit={handleSubmit(() => submitKyc())}
      className="space-y-6"
    >
      {unfinished.length > 0 && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
          />
          <p className="text-sm text-red-700">
            Some details are missing. Finish{" "}
            {unfinished.map((step, i) => (
              <span key={step}>
                {i > 0 && (i === unfinished.length - 1 ? " and " : ", ")}
                <button
                  type="button"
                  onClick={() => onEdit(step)}
                  className="font-semibold capitalize underline underline-offset-2"
                >
                  {step}
                </button>
              </span>
            ))}{" "}
            before you submit.
          </p>
        </div>
      )}

      <ApplicationSummary
        application={application}
        sectionAction={edit}
        notes={application.reviewNotes}
      />

      <FormSection title="Declaration">
        <Checkbox
          {...register("declaration")}
          error={errors.declaration?.message}
          disabled={isPending}
          label="I confirm these details and documents are accurate, and that I'm allowed to submit them for this business."
        />
      </FormSection>

      <StepActions
        onBack={() => onEdit("authorisation")}
        isSaving={isPending}
        submitLabel="Submit for review"
        submitDisabled={unfinished.length > 0}
      />
    </form>
  );
};

export default ReviewStep;
