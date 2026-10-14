import { zodResolver } from "@hookform/resolvers/zod";
import { PenLine } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import DateInput from "../../../../components/DateInput";
import FileDropzone from "../../../../components/FileDropzone";
import Select from "../../../../components/Select";
import { useSaveKycDraft } from "../../../../hooks/useKycService";
import type { Authorisation, Director } from "../../../../types/kyc";
import {
  authorisationStepSchema,
  type AuthorisationStepInput,
  type AuthorisationStepValues,
} from "../../../../validations/kycValidation";
import { FieldGrid, FormSection, StepActions } from "./parts";
import { useUploadTracker } from "./useUploadTracker";
import { today } from "./steps";

// One letter from the customer's own company, not one per exporter: it
// confirms the person using this account may book shipments for the company.
const AuthorisationStep = ({
  authorisation,
  directors,
  onDone,
  onBack,
}: {
  authorisation: Authorisation;
  directors: Director[];
  onDone: () => void;
  onBack: () => void;
}) => {
  const { saveDraft, isPending } = useSaveKycDraft();
  const { uploading, onBusyChange } = useUploadTracker();
  const signers = directors
    .map((director) => director.fullName)
    .filter(Boolean);
  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<AuthorisationStepInput, unknown, AuthorisationStepValues>({
    resolver: zodResolver(authorisationStepSchema),
    defaultValues: {
      ...authorisation,
      // Directors may have been renamed since; drop a name that's gone.
      signedBy: signers.includes(authorisation.signedBy)
        ? authorisation.signedBy
        : "",
    },
  });

  // Never save while a new file is still uploading: the old one would be kept.
  const onSubmit = (values: AuthorisationStepValues) =>
    uploading
      ? undefined
      : saveDraft({ authorisation: values }, { onSuccess: onDone });

  const goBack = () =>
    saveDraft({ authorisation: getValues() }, { onSuccess: onBack });

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection
        title="Letter of authority"
        description="A letter from your company confirming that you can book shipments for it on Freightafford. It should be on your company letterhead, name you, and be signed by one of the directors you added."
      >
        <FieldGrid>
          <Select
            variant="icon"
            icon={PenLine}
            label="Signed by"
            placeholder="Choose a director"
            options={signers}
            {...register("signedBy")}
            error={errors.signedBy?.message}
            disabled={isPending}
          />
          <Controller
            control={control}
            name="issuedOn"
            render={({ field, fieldState }) => (
              <DateInput
                {...field}
                label="Date on the letter"
                placeholder="Choose the date it was signed"
                max={today()}
                error={fieldState.error?.message}
                disabled={isPending}
              />
            )}
          />
          <div className="col-span-full">
            <Controller
              control={control}
              name="letter"
              render={({ field, fieldState }) => (
                <FileDropzone
                  onBusyChange={onBusyChange}
                  label="Letter of authority"
                  hint="On company letterhead, signed and dated by a director"
                  value={field.value ?? null}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={isPending}
                />
              )}
            />
          </div>
        </FieldGrid>
      </FormSection>

      <StepActions
        onBack={goBack}
        isSaving={isPending}
        waitingForUploads={uploading}
      />
    </form>
  );
};

export default AuthorisationStep;
