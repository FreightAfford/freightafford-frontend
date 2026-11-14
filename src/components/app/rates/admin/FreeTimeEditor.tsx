import { Plus, Trash2, X } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  type FieldErrors,
} from "react-hook-form";
import { RATE_CURRENCIES } from "../../../../data/rates";
import type {
  FreeTimeFormValues,
  RateFormValues,
} from "../../../../validations/rateValidation";
import { RowError, RowField, RowInput, RowSelect } from "./rateFormParts";

// Maersk's usual wording, so a new entry needs only its days and charges.
const NEW_ENTRY: FreeTimeFormValues = {
  type: "Combined",
  days: 14,
  dayType: "Calendar days",
  startEvent: "Discharge",
  endEvent: "Gate-in empty",
  note: "",
  tiers: [],
};

const entryError = (errors?: FieldErrors<FreeTimeFormValues>) =>
  errors &&
  (
    errors.type ??
    errors.days ??
    errors.dayType ??
    errors.startEvent ??
    errors.endEvent ??
    errors.note
  )?.message;

// The daily charges after free time runs out, one step per row.
const Tiers = ({ entry, disabled }: { entry: number; disabled?: boolean }) => {
  const {
    control,
    register,
    getValues,
    formState: { errors },
  } = useFormContext<RateFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `freeTime.${entry}.tiers`,
  });

  // The next step starts the day after the last one ends.
  const addTier = () => {
    const tiers = getValues(`freeTime.${entry}.tiers`);
    const last = tiers[tiers.length - 1];
    const days = getValues(`freeTime.${entry}.days`);
    const fromDay = last
      ? (last.toDay ?? last.fromDay) + 1
      : (Number.isInteger(days) ? days : 0) + 1;
    append(
      { fromDay, toDay: undefined, amount: NaN, currency: "USD" },
      { focusName: `freeTime.${entry}.tiers.${fields.length}.toDay` },
    );
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500">
        Daily charge once free time ends
      </p>
      {fields.map((field, index) => {
        const tierErrors = errors.freeTime?.[entry]?.tiers?.[index];
        return (
          <div key={field.id} className="space-y-1">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] gap-2 @xl:grid-cols-[6rem_6rem_7.5rem_6rem_2.25rem] @xl:items-start">
              <RowField label="From day" wideLabel>
                <RowInput
                  type="number"
                  inputMode="numeric"
                  min={1}
                  {...register(`freeTime.${entry}.tiers.${index}.fromDay`, {
                    valueAsNumber: true,
                  })}
                  invalid={!!tierErrors?.fromDay}
                  disabled={disabled}
                />
              </RowField>
              <RowField label="To day" wideLabel>
                <RowInput
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="Onwards"
                  {...register(`freeTime.${entry}.tiers.${index}.toDay`, {
                    setValueAs: (v) =>
                      v === "" || v === null ? undefined : Number(v),
                  })}
                  invalid={!!tierErrors?.toDay}
                  disabled={disabled}
                />
              </RowField>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                aria-label={`Remove step ${index + 1}`}
                className="flex h-10 w-9 items-center justify-center self-end rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 @xl:order-last"
              >
                <X className="h-4 w-4" />
              </button>
              <RowField label="Per day" wideLabel>
                <RowInput
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  placeholder="0"
                  {...register(`freeTime.${entry}.tiers.${index}.amount`, {
                    valueAsNumber: true,
                  })}
                  invalid={!!tierErrors?.amount}
                  disabled={disabled}
                />
              </RowField>
              <RowField label="Currency" wideLabel>
                <Controller
                  control={control}
                  name={`freeTime.${entry}.tiers.${index}.currency`}
                  render={({ field: f }) => (
                    <RowSelect
                      label="Currency"
                      value={f.value}
                      onChange={f.onChange}
                      options={RATE_CURRENCIES}
                      disabled={disabled}
                    />
                  )}
                />
              </RowField>
            </div>
            <RowError
              message={
                (
                  tierErrors?.fromDay ??
                  tierErrors?.toDay ??
                  tierErrors?.amount ??
                  tierErrors?.root
                )?.message
              }
            />
          </div>
        );
      })}
      <button
        type="button"
        onClick={addTier}
        disabled={disabled}
        className="text-brand hover:bg-brand/10 focus-visible:ring-brand/40 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" /> Add a step
      </button>
    </div>
  );
};

// Detention and demurrage at the destination, as on Maersk's
// "D&D Freetime Details" sheet.
const FreeTimeEditor = ({ disabled }: { disabled?: boolean }) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<RateFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "freeTime",
  });

  return (
    <div className="@container space-y-3">
      {fields.map((field, index) => {
        const entryErrors = errors.freeTime?.[index];
        return (
          <div
            key={field.id}
            className="space-y-4 rounded-xl border border-slate-200 p-4"
          >
            <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_2.25rem] @2xl:items-end">
              <RowField label="Type" wideLabel>
                <RowInput
                  {...register(`freeTime.${index}.type`)}
                  placeholder="Combined"
                  invalid={!!entryErrors?.type}
                  disabled={disabled}
                />
              </RowField>
              <RowField label="Free days" wideLabel>
                <RowInput
                  type="number"
                  inputMode="numeric"
                  min={0}
                  {...register(`freeTime.${index}.days`, {
                    valueAsNumber: true,
                  })}
                  invalid={!!entryErrors?.days}
                  disabled={disabled}
                />
              </RowField>
              <RowField label="Counted in" wideLabel>
                <RowInput
                  {...register(`freeTime.${index}.dayType`)}
                  placeholder="Calendar days"
                  invalid={!!entryErrors?.dayType}
                  disabled={disabled}
                />
              </RowField>
              <RowField label="Starts at" wideLabel>
                <RowInput
                  {...register(`freeTime.${index}.startEvent`)}
                  placeholder="Discharge"
                  invalid={!!entryErrors?.startEvent}
                  disabled={disabled}
                />
              </RowField>
              <RowField label="Ends at" wideLabel>
                <RowInput
                  {...register(`freeTime.${index}.endEvent`)}
                  placeholder="Gate-in empty"
                  invalid={!!entryErrors?.endEvent}
                  disabled={disabled}
                />
              </RowField>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                aria-label={`Remove ${field.type || "free time"}`}
                title="Remove free time"
                className="flex h-10 w-10 items-center justify-center self-end justify-self-end rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 @2xl:w-9"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <RowField label="Note (optional)" wideLabel>
              <RowInput
                {...register(`freeTime.${index}.note`)}
                placeholder="e.g. Storage invoiced separately by the terminal"
                invalid={!!entryErrors?.note}
                disabled={disabled}
              />
            </RowField>
            <RowError message={entryError(entryErrors)} />
            <Tiers entry={index} disabled={disabled} />
          </div>
        );
      })}

      <button
        type="button"
        onClick={() =>
          append(NEW_ENTRY, { focusName: `freeTime.${fields.length}.days` })
        }
        disabled={disabled}
        className="hover:border-brand hover:text-brand focus-visible:ring-brand/40 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors outline-none focus-visible:ring-2 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" /> Add free time
      </button>
    </div>
  );
};

export default FreeTimeEditor;
