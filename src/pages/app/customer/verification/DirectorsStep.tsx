import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Hash, IdCard, Plus, User } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import DateInput from "../../../../components/DateInput";
import FileDropzone from "../../../../components/FileDropzone";
import Input from "../../../../components/Input";
import Select from "../../../../components/Select";
import { useSaveKycDraft } from "../../../../hooks/useKycService";
import {
  ID_TYPE_LABELS,
  type Director,
  type IdType,
} from "../../../../types/kyc";
import {
  directorsStepSchema,
  type DirectorsStepInput,
  type DirectorsStepValues,
} from "../../../../validations/kycValidation";
import {
  AddButton,
  FieldGrid,
  FormSection,
  RemoveButton,
  StepActions,
} from "./parts";
import { useUploadTracker } from "./useUploadTracker";
import { newDirector, tomorrow } from "./steps";

const ID_OPTIONS = (Object.keys(ID_TYPE_LABELS) as IdType[]).map((value) => ({
  value,
  label: ID_TYPE_LABELS[value],
}));

const ID_PLACEHOLDERS: Record<IdType, string> = {
  nin: "11 digits",
  passport: "A12345678",
  drivers_licence: "As on the licence",
};

const DirectorsStep = ({
  directors,
  onDone,
  onBack,
}: {
  directors: Director[];
  onDone: () => void;
  onBack: () => void;
}) => {
  const { saveDraft, isPending } = useSaveKycDraft();
  const { uploading, onBusyChange } = useUploadTracker();
  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<DirectorsStepInput, unknown, DirectorsStepValues>({
    resolver: zodResolver(directorsStepSchema),
    defaultValues: {
      directors: directors.length ? directors : [newDirector()],
    },
  });
  // The director's own `id` is kept; the field array tracks rows by `key`.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "directors",
    keyName: "key",
  });
  const idTypes = useWatch({ control, name: "directors" })?.map(
    (director) => director.idType,
  );

  // Never save while a new file is still uploading: the old one would be kept.
  const onSubmit = (values: DirectorsStepValues) =>
    uploading
      ? undefined
      : saveDraft({ directors: values.directors }, { onSuccess: onDone });

  // Going back keeps what's been typed, finished or not.
  const goBack = () =>
    saveDraft({ directors: getValues("directors") }, { onSuccess: onBack });

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {fields.map((field, index) => {
        const idType = idTypes?.[index] ?? "nin";
        const fieldErrors = errors.directors?.[index];
        return (
          <FormSection
            key={field.key}
            title={
              fields.length > 1 ? `Director ${index + 1}` : "Director or owner"
            }
            description={
              index === 0
                ? "Someone who owns or runs the business. Their name must match their ID."
                : undefined
            }
            action={
              fields.length > 1 && (
                <RemoveButton
                  label="Remove"
                  onClick={() => remove(index)}
                  disabled={isPending}
                />
              )
            }
          >
            <FieldGrid>
              <Input
                variant="icon"
                icon={User}
                label="Full name"
                placeholder="As on their ID"
                {...register(`directors.${index}.fullName`)}
                error={fieldErrors?.fullName?.message}
                disabled={isPending}
              />
              <Input
                variant="icon"
                icon={Briefcase}
                label="Role"
                placeholder="Managing Director"
                {...register(`directors.${index}.role`)}
                error={fieldErrors?.role?.message}
                disabled={isPending}
              />
              <Select
                variant="icon"
                icon={IdCard}
                label="ID type"
                options={ID_OPTIONS}
                {...register(`directors.${index}.idType`)}
                error={fieldErrors?.idType?.message}
                disabled={isPending}
              />
              <Input
                variant="icon"
                icon={Hash}
                label="ID number"
                placeholder={ID_PLACEHOLDERS[idType]}
                inputMode={idType === "nin" ? "numeric" : undefined}
                {...register(`directors.${index}.idNumber`)}
                error={fieldErrors?.idNumber?.message}
                disabled={isPending}
              />
              {idType !== "nin" && (
                <Controller
                  control={control}
                  name={`directors.${index}.idExpiry`}
                  render={({ field: expiry, fieldState }) => (
                    <DateInput
                      {...expiry}
                      label="ID expiry date"
                      placeholder="Choose the expiry date"
                      min={tomorrow()}
                      error={fieldState.error?.message}
                      disabled={isPending}
                    />
                  )}
                />
              )}
              <div className="col-span-full">
                <Controller
                  control={control}
                  name={`directors.${index}.idDocument`}
                  render={({ field: document, fieldState }) => (
                    <FileDropzone
                      onBusyChange={onBusyChange}
                      label="Copy of the ID"
                      hint={
                        idType === "nin"
                          ? "The NIN slip or card, with all four corners visible"
                          : "The photo page, with all four corners visible and no glare"
                      }
                      value={document.value ?? null}
                      onChange={document.onChange}
                      error={fieldState.error?.message}
                      disabled={isPending}
                    />
                  )}
                />
              </div>
            </FieldGrid>
          </FormSection>
        );
      })}

      <AddButton onClick={() => append(newDirector())} disabled={isPending}>
        <Plus aria-hidden="true" className="h-5 w-5" />
        Add another director
      </AddButton>
      {errors.directors?.root?.message && (
        <p className="text-sm font-medium text-red-600">
          {errors.directors.root.message}
        </p>
      )}

      <StepActions
        onBack={goBack}
        isSaving={isPending}
        waitingForUploads={uploading}
      />
    </form>
  );
};

export default DirectorsStep;
