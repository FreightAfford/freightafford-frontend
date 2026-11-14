import { Plus, Trash2 } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import {
  CHARGE_BASES,
  CHARGE_PRESETS,
  CHARGE_STAGES,
  PAY_TERMS,
  type ChargeStage,
} from "../../../../data/rates";
import cn from "../../../../utils/cn";
import type {
  ChargeFormValues,
  RateFormValues,
} from "../../../../validations/rateValidation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { RowError, RowField, RowInput, RowSelect } from "./rateFormParts";
import { currencyOptions } from "../../../../utils/rates";

// Short labels, so the payment column stays narrow; "Either" is
// Maersk's "Prepaid or collect".
const PAY_OPTIONS = PAY_TERMS.map((p) =>
  p.value === "either" ? { ...p, label: "Either" } : p,
);

// Who usually pays each kind of charge on an export from West Africa.
const DEFAULT_PAY: Record<ChargeStage, ChargeFormValues["payTerm"]> = {
  freight: "prepaid",
  origin: "prepaid",
  destination: "collect",
};

// Column widths in the wide layout, shared by the headings and the rows.
const GRID =
  "@3xl:grid-cols-[4rem_minmax(0,1fr)_5.5rem_5rem_7.25rem_6.25rem_3.75rem_2.25rem] @3xl:items-start @3xl:gap-2";

const HEADINGS = [
  "Code",
  "Charge",
  "Amount",
  "Currency",
  "Basis",
  "Payment",
  "Floating",
];

const firstError = (errors?: FieldErrors<ChargeFormValues>) =>
  errors &&
  (
    errors.code ??
    errors.name ??
    errors.amount ??
    errors.currency ??
    errors.basis ??
    errors.payTerm
  )?.message;

// The charges of a rate, a block per charge type as on Maersk's quote. Each
// block's menu adds Maersk's usual charges for that stage, or a custom one.
const ChargesEditor = ({ disabled }: { disabled?: boolean }) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<RateFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "charges",
  });
  const charges = useWatch({ control, name: "charges" }) ?? [];
  const used = new Set(charges.map((c) => c.code?.toUpperCase()));

  const add = (stage: ChargeStage, preset?: (typeof CHARGE_PRESETS)[number]) =>
    append(
      {
        code: preset?.code ?? "",
        name: preset?.name ?? "",
        amount: NaN,
        currency: "USD",
        basis: preset?.basis ?? "container",
        stage,
        payTerm: DEFAULT_PAY[stage],
        floating: false,
      },
      // A preset already has its code and name, so go straight to the amount.
      {
        focusName: preset
          ? `charges.${fields.length}.amount`
          : `charges.${fields.length}.code`,
      },
    );

  return (
    <div className="@container space-y-4">
      {CHARGE_STAGES.map((stage) => {
        const rows = fields
          .map((field, index) => ({ field, index }))
          .filter(({ index }) => charges[index]?.stage === stage.value);
        const presets = CHARGE_PRESETS.filter(
          (p) => p.stage === stage.value && !used.has(p.code),
        );

        return (
          <div
            key={stage.value}
            className="overflow-hidden rounded-xl border border-slate-200"
          >
            <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-2.5">
              <h4 className="text-sm font-bold text-slate-900">
                {stage.label}
                <span className="ml-1.5 font-medium text-slate-400">
                  {rows.length}
                </span>
              </h4>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled}
                    className="text-brand focus-visible:ring-brand/40 hover:bg-brand/10 data-[state=open]:bg-brand/10 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" /> Add charge
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-80 w-80">
                  {presets.length > 0 && (
                    <>
                      <DropdownMenuLabel>Maersk charges</DropdownMenuLabel>
                      {presets.map((p) => (
                        <DropdownMenuItem
                          key={p.code}
                          onSelect={() => add(stage.value, p)}
                        >
                          <span className="w-9 shrink-0 font-mono text-xs font-semibold text-slate-500">
                            {p.code}
                          </span>
                          <span className="min-w-0">{p.name}</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onSelect={() => add(stage.value)}>
                    <Plus className="h-4 w-4 text-slate-500" /> Custom charge
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {rows.length === 0 ? (
              <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
                No {stage.label.toLowerCase()} yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border-t border-slate-100">
                <div
                  aria-hidden="true"
                  className={cn(
                    "hidden px-4 pt-2.5 pb-0 text-xs font-semibold text-slate-500 @3xl:grid",
                    GRID,
                  )}
                >
                  {HEADINGS.map((h) => (
                    <span
                      key={h}
                      className={cn(h === "Amount" && "text-right")}
                    >
                      {h}
                    </span>
                  ))}
                </div>
                {rows.map(({ field, index }) => {
                  const rowErrors = errors.charges?.[index];
                  return (
                    <div key={field.id} className="space-y-1.5 px-4 py-3">
                      <div className={cn("grid grid-cols-2 gap-3", GRID)}>
                        <RowField label="Code">
                          <RowInput
                            {...register(`charges.${index}.code`)}
                            placeholder="BAS"
                            maxLength={6}
                            invalid={!!rowErrors?.code}
                            disabled={disabled}
                            className="font-mono uppercase"
                          />
                        </RowField>
                        <RowField
                          label="Charge"
                          className="@max-3xl:col-span-2 @max-3xl:row-start-1"
                        >
                          <RowInput
                            {...register(`charges.${index}.name`)}
                            placeholder="Charge name"
                            invalid={!!rowErrors?.name}
                            disabled={disabled}
                          />
                        </RowField>
                        <RowField label="Amount">
                          <RowInput
                            type="number"
                            inputMode="decimal"
                            step="any"
                            min={0}
                            placeholder="0"
                            {...register(`charges.${index}.amount`, {
                              valueAsNumber: true,
                            })}
                            invalid={!!rowErrors?.amount}
                            disabled={disabled}
                          />
                        </RowField>
                        <RowField label="Currency">
                          <Controller
                            control={control}
                            name={`charges.${index}.currency`}
                            render={({ field: f }) => (
                              <RowSelect
                                label="Currency"
                                value={f.value}
                                onChange={f.onChange}
                                options={currencyOptions(f.value)}
                                invalid={!!rowErrors?.currency}
                                disabled={disabled}
                              />
                            )}
                          />
                        </RowField>
                        <RowField label="Basis">
                          <Controller
                            control={control}
                            name={`charges.${index}.basis`}
                            render={({ field: f }) => (
                              <RowSelect
                                label="Basis"
                                value={f.value}
                                onChange={f.onChange}
                                options={CHARGE_BASES}
                                disabled={disabled}
                              />
                            )}
                          />
                        </RowField>
                        <RowField label="Payment">
                          <Controller
                            control={control}
                            name={`charges.${index}.payTerm`}
                            render={({ field: f }) => (
                              <RowSelect
                                label="Payment"
                                value={f.value}
                                onChange={f.onChange}
                                options={PAY_OPTIONS}
                                disabled={disabled}
                              />
                            )}
                          />
                        </RowField>
                        <div className="col-span-2 flex items-end justify-between gap-2 @3xl:contents">
                          <label
                            title="A floating charge can change before shipment"
                            className="flex h-10 cursor-pointer items-center gap-2 text-sm text-slate-700 @3xl:justify-center @3xl:self-start"
                          >
                            <input
                              type="checkbox"
                              {...register(`charges.${index}.floating`)}
                              disabled={disabled}
                              className="accent-brand h-4 w-4"
                            />
                            <span className="@3xl:sr-only">Floating</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            disabled={disabled}
                            aria-label={`Remove ${charges[index]?.name || "charge"}`}
                            title="Remove charge"
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 @3xl:w-9 @3xl:self-start"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <RowError message={firstError(rowErrors)} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChargesEditor;
