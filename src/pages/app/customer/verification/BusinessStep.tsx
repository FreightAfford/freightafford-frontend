import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building,
  Building2,
  FileBadge,
  Hash,
  Map as MapIcon,
  MapPin,
  Receipt,
  Ship,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import DateInput from "../../../../components/DateInput";
import FileDropzone from "../../../../components/FileDropzone";
import Input from "../../../../components/Input";
import Select from "../../../../components/Select";
import { NIGERIAN_STATES } from "../../../../data/nigeria";
import {
  useKycAutosave,
  useSaveKycDraft,
} from "../../../../hooks/useKycService";
import {
  CAC_TYPE_LABELS,
  type BusinessDetails,
  type CacType,
} from "../../../../types/kyc";
import {
  businessStepSchema,
  type BusinessStepInput,
  type BusinessStepValues,
} from "../../../../validations/kycValidation";
import { FieldGrid, FormSection, StepActions } from "./parts";
import { useUploadTracker } from "./useUploadTracker";
import { tomorrow } from "./steps";

const CAC_OPTIONS = (Object.keys(CAC_TYPE_LABELS) as CacType[]).map(
  (value) => ({ value, label: CAC_TYPE_LABELS[value] }),
);

const BusinessStep = ({
  business,
  onDone,
}: {
  business: BusinessDetails;
  onDone: () => void;
}) => {
  const { saveDraft, isPending } = useSaveKycDraft();
  const { uploading, onBusyChange } = useUploadTracker();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessStepInput, unknown, BusinessStepValues>({
    resolver: zodResolver(businessStepSchema),
    defaultValues: business,
  });

  // Saved as they type, so a refresh never loses anything.
  const values = useWatch({ control });
  const autosave = useKycAutosave(
    { business: values as BusinessDetails },
    uploading,
  );

  // Never save while a new file is still uploading: the old one would be kept.
  const onSubmit = (values: BusinessStepValues) =>
    uploading
      ? undefined
      : saveDraft({ business: values }, { onSuccess: onDone });

  const document = (
    name:
      | "cacCertificate"
      | "tinCertificate"
      | "nepcCertificate"
      | "address.proofOfAddress",
    label: string,
    hint: string,
  ) => (
    <div className="col-span-full">
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <FileDropzone
            onBusyChange={onBusyChange}
            label={label}
            hint={hint}
            value={field.value ?? null}
            onChange={field.onChange}
            error={fieldState.error?.message}
            disabled={isPending}
          />
        )}
      />
    </div>
  );

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection
        title="Company registration"
        description="As registered with the Corporate Affairs Commission (CAC)."
      >
        <FieldGrid>
          <div className="col-span-full">
            <Input
              icon={Building2}
              label="Registered business name"
              placeholder="Okafor Agro Exports Ltd"
              {...register("legalName")}
              error={errors.legalName?.message}
              disabled={isPending}
            />
          </div>
          <Controller
            control={control}
            name="cacType"
            render={({ field }) => (
              <Select
                icon={FileBadge}
                label="Registration type"
                options={CAC_OPTIONS}
                {...field}
                error={errors.cacType?.message}
                disabled={isPending}
              />
            )}
          />
          <Input
            icon={Hash}
            label="CAC number"
            placeholder="RC 1234567"
            {...register("cacNumber")}
            error={errors.cacNumber?.message}
            disabled={isPending}
          />
          {document(
            "cacCertificate",
            "CAC certificate",
            "The full certificate, with the RC or BN number readable",
          )}
        </FieldGrid>
      </FormSection>

      <FormSection
        title="Tax registration"
        description="Optional. Add it if your business has a TIN from FIRS or the Joint Tax Board."
      >
        <FieldGrid>
          <div className="col-span-full">
            <Input
              icon={Receipt}
              label="Tax identification number (optional)"
              placeholder="12345678-0001"
              {...register("tin")}
              error={errors.tin?.message}
              disabled={isPending}
            />
          </div>
          {document(
            "tinCertificate",
            "TIN certificate",
            "The certificate or FIRS/JTB letter showing your TIN",
          )}
        </FieldGrid>
      </FormSection>

      <FormSection
        title="Export registration"
        description="Your exporter registration with the Nigerian Export Promotion Council (NEPC)."
      >
        <FieldGrid>
          <Input
            icon={Ship}
            label="NEPC registration number"
            placeholder="As on the certificate"
            {...register("nepcNumber")}
            error={errors.nepcNumber?.message}
            disabled={isPending}
          />
          <Controller
            control={control}
            name="nepcExpiry"
            render={({ field, fieldState }) => (
              <DateInput
                {...field}
                label="Certificate expiry date"
                placeholder="Choose the expiry date"
                min={tomorrow()}
                error={fieldState.error?.message}
                disabled={isPending}
              />
            )}
          />
          {document(
            "nepcCertificate",
            "NEPC certificate",
            "Must still be in date",
          )}
        </FieldGrid>
      </FormSection>

      <FormSection
        title="Business address"
        description="Where the business operates. The proof of address must show this address."
      >
        <FieldGrid>
          <div className="col-span-full">
            <Input
              icon={MapPin}
              label="Street address"
              placeholder="14 Wharf Road, Apapa"
              autoComplete="street-address"
              {...register("address.street")}
              error={errors.address?.street?.message}
              disabled={isPending}
            />
          </div>
          <Input
            icon={Building}
            label="City or town"
            placeholder="Lagos"
            autoComplete="address-level2"
            {...register("address.city")}
            error={errors.address?.city?.message}
            disabled={isPending}
          />
          <Controller
            control={control}
            name="address.state"
            render={({ field }) => (
              <Select
                icon={MapIcon}
                label="State"
                placeholder="Choose a state"
                options={NIGERIAN_STATES}
                {...field}
                error={errors.address?.state?.message}
                disabled={isPending}
              />
            )}
          />
          {document(
            "address.proofOfAddress",
            "Proof of address",
            "An electricity, water or waste bill dated within the last 3 months",
          )}
        </FieldGrid>
      </FormSection>

      <StepActions
        isSaving={isPending}
        waitingForUploads={uploading}
        autosave={autosave}
      />
    </form>
  );
};

export default BusinessStep;
