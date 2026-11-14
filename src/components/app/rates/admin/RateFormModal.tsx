import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, Container } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useWatch,
  type Resolver,
} from "react-hook-form";
import { RATE_CONTAINER_SIZES } from "../../../../data/rates";
import { useGetRates, useSaveRate } from "../../../../hooks/useRateService";
import type {
  Rate,
  RateCharge,
  RateRequest,
} from "../../../../services/api/rate";
import {
  formatTotals,
  formatValidity,
  overlaps,
  rateSizeLabel,
  rateTotals,
  toPortLocation,
  toRatePort,
} from "../../../../utils/rates";
import {
  EMPTY_RATE_FORM,
  formToRateInput,
  rateFormSchema,
  rateToForm,
  type RateFormOutput,
  type RateFormValues,
} from "../../../../validations/rateValidation";
import Button from "../../../Button";
import DateInput from "../../../DateInput";
import Input from "../../../Input";
import Modal from "../../../Modal";
import Select from "../../../Select";
import Textarea from "../../../Textarea";
import CommoditySelect from "../../CommoditySelect";
import PortPair from "../../PortPair";
import ChargesEditor from "./ChargesEditor";
import FreeTimeEditor from "./FreeTimeEditor";
import { FormSection } from "./rateFormParts";

// Where the form starts: a blank rate (maybe with a lane filled in), an
// existing rate to change, or a copy of one to save as new.
export type RateFormSource =
  | {
      kind: "add";
      initial?: Partial<RateFormValues>;
      // The customer request this rate answers, if any.
      request?: RateRequest;
    }
  | { kind: "edit"; rate: Rate }
  | { kind: "duplicate"; rate: Rate };

const TITLES = {
  add: "Add rate",
  edit: "Edit rate",
  duplicate: "Duplicate rate",
};

const startValues = (source: RateFormSource): RateFormValues => {
  if (source.kind !== "add") return rateToForm(source.rate);
  return {
    ...EMPTY_RATE_FORM,
    validFrom: moment().format("YYYY-MM-DD"),
    ...source.initial,
  };
};

const SIZE_OPTIONS = RATE_CONTAINER_SIZES.map((c) => ({
  value: c.value,
  label: `${c.value} (${c.size} ${c.kind})`,
}));

// The charges entered so far, totalled per container and per B/L.
const LiveTotals = ({ charges }: { charges: RateFormValues["charges"] }) => {
  const counted = charges.filter(
    (c) => Number.isFinite(c.amount) && c.currency,
  ) as unknown as RateCharge[];
  const { perContainer, perDocument } = rateTotals(counted);
  return (
    <dl className="grid gap-x-6 gap-y-1 rounded-xl bg-slate-50 px-4 py-3 text-sm @lg:grid-cols-2">
      <div className="flex justify-between gap-3 @lg:block">
        <dt className="text-slate-500">Per container</dt>
        <dd className="font-semibold text-slate-900 tabular-nums">
          {formatTotals(perContainer)}
        </dd>
      </div>
      <div className="flex justify-between gap-3 @lg:block">
        <dt className="text-slate-500">Per document (B/L)</dt>
        <dd className="font-semibold text-slate-900 tabular-nums">
          {formatTotals(perDocument)}
        </dd>
      </div>
    </dl>
  );
};

// Other rates for the same lane, commodity and size whose dates overlap
// this one. Customers see one rate per size, the one updated last, so an
// overlap usually means one of them should end sooner.
const useOverlaps = (values: RateFormValues, ownId?: string) => {
  const { origin, destination, containerSize, commodity, validFrom, validTo } =
    values;
  const ready = !!(
    origin &&
    destination &&
    containerSize &&
    commodity &&
    validFrom &&
    validTo &&
    validTo >= validFrom
  );
  const { rates } = useGetRates(
    {
      search: ready ? `${origin!.code} ${destination!.code}` : undefined,
      containerSize,
      limit: 100,
    },
    ready,
  );
  if (!ready) return [];
  return rates.filter(
    (r) =>
      r._id !== ownId &&
      r.origin.code === origin!.code &&
      r.destination.code === destination!.code &&
      r.containerSize === containerSize &&
      r.commodity.trim().toLowerCase() ===
        commodity!.name.trim().toLowerCase() &&
      overlaps(r, { validFrom, validTo }),
  );
};

interface RateFormModalProps {
  isOpen: boolean;
  source: RateFormSource;
  onClose: () => void;
}

const RateForm = ({
  source,
  onClose,
  onTitleChange,
}: {
  source: RateFormSource;
  onClose: () => void;
  onTitleChange: (title: string) => void;
}) => {
  const [editingId, setEditingId] = useState(
    source.kind === "edit" ? source.rate._id : undefined,
  );
  // Sizes saved from this form with "Save and add another size".
  const [savedSizes, setSavedSizes] = useState<string[]>([]);
  const [intent, setIntent] = useState<"close" | "another">("close");
  const { saveRate, isPending } = useSaveRate();

  const form = useForm<RateFormValues, unknown, RateFormOutput>({
    resolver: zodResolver(rateFormSchema) as unknown as Resolver<
      RateFormValues,
      unknown,
      RateFormOutput
    >,
    defaultValues: startValues(source),
  });
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = form;

  const watched = useWatch({ control }) as RateFormValues;
  const clashes = useOverlaps(watched, editingId);

  const onSubmit = (data: RateFormOutput) =>
    saveRate(
      { id: editingId, input: formToRateInput(data) },
      {
        onSuccess: () => {
          if (intent === "close") return onClose();
          // Same lane and charges, ready for the next size: only the size
          // and the amounts usually change.
          const saved = [...savedSizes, data.containerSize];
          // The next size in the list after this one, not yet saved here.
          const from = RATE_CONTAINER_SIZES.findIndex(
            (c) => c.value === data.containerSize,
          );
          const next = [
            ...RATE_CONTAINER_SIZES.slice(from + 1),
            ...RATE_CONTAINER_SIZES.slice(0, from),
          ].find((c) => !saved.includes(c.value))?.value;
          setSavedSizes(saved);
          setEditingId(undefined);
          onTitleChange(TITLES.add);
          reset({ ...getValues(), containerSize: next });
          // Back to the top of the modal's scrolling body only; scrollIntoView
          // would also shift the modal itself on short screens.
          document
            .getElementById("rate-form-top")
            ?.closest(".overflow-y-auto")
            ?.scrollTo({ top: 0 });
        },
      },
    );

  const chargesError = errors.charges?.message ?? errors.charges?.root?.message;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="@container space-y-8"
      >
        <div id="rate-form-top" className="scroll-mt-6 space-y-3 empty:hidden">
          {savedSizes.length > 0 && (
            <div
              role="status"
              className="border-kelp/25 bg-kelp/10 text-kelp flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Saved{" "}
                <span className="font-semibold">
                  {savedSizes.map(rateSizeLabel).join(", ")}
                </span>
                . The lane and charges are kept: pick the next size and change
                the amounts.
              </p>
            </div>
          )}
          {source.kind === "duplicate" && savedSizes.length === 0 && (
            <p className="text-sm text-slate-500">
              A copy of the rate. Change the size, dates or commodity, then save
              it as a new rate. The original stays as it is.
            </p>
          )}
          {source.kind === "add" &&
            source.request &&
            savedSizes.length === 0 && (
              <p className="text-sm text-slate-500">
                For{" "}
                <span className="font-medium text-slate-700">
                  {source.request.customer.company ||
                    source.request.customer.name}
                </span>
                's request
                {source.request.containerSize
                  ? ""
                  : " (any size: pick the size to price first)"}
                . Saving the rate resolves the request, and the customer can see
                it straight away.
                {source.request.note && (
                  <span className="mt-1 block text-slate-600 italic">
                    “{source.request.note}”
                  </span>
                )}
              </p>
            )}
        </div>

        <FormSection
          title="Lane"
          description="Search by city or port name and pick from the list."
        >
          <Controller
            control={control}
            name="origin"
            render={({ field: originField }) => (
              <Controller
                control={control}
                name="destination"
                render={({ field: destField }) => (
                  <PortPair
                    id="rate-route"
                    origin={
                      originField.value
                        ? toPortLocation(originField.value)
                        : null
                    }
                    destination={
                      destField.value ? toPortLocation(destField.value) : null
                    }
                    onOriginChange={(loc) =>
                      originField.onChange(loc ? toRatePort(loc) : null)
                    }
                    onDestinationChange={(loc) =>
                      destField.onChange(loc ? toRatePort(loc) : null)
                    }
                    originError={!!errors.origin}
                    destinationError={!!errors.destination}
                    error={
                      errors.origin?.message ?? errors.destination?.message
                    }
                    originPlaceholder="Search a city or port, e.g. Lagos"
                    destinationPlaceholder="Search a city or port, e.g. Rotterdam"
                    disabled={isPending}
                  />
                )}
              />
            )}
          />
        </FormSection>

        <FormSection
          title="Rate details"
          description="As they read on the Maersk quote."
        >
          <div className="grid gap-5 @xl:grid-cols-2">
            <Controller
              control={control}
              name="containerSize"
              render={({ field }) => (
                <Select
                  label="Container size"
                  icon={Container}
                  placeholder="Choose a size"
                  options={SIZE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.containerSize?.message}
                  disabled={isPending}
                />
              )}
            />
            <Controller
              control={control}
              name="commodity"
              render={({ field }) => (
                <CommoditySelect
                  label="Commodity"
                  placeholder="Search, e.g. cashew or cocoa"
                  value={
                    field.value
                      ? { ...field.value, hsCodes: [], cargoTypes: [] }
                      : null
                  }
                  onChange={(c) =>
                    field.onChange(c ? { code: c.code, name: c.name } : null)
                  }
                  error={errors.commodity?.message}
                  disabled={isPending}
                />
              )}
            />
            <Controller
              control={control}
              name="validFrom"
              render={({ field }) => (
                <DateInput
                  label="Valid from"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.validFrom?.message}
                  disabled={isPending}
                />
              )}
            />
            <Controller
              control={control}
              name="validTo"
              render={({ field }) => (
                <DateInput
                  label="Valid to"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  min={watched.validFrom || undefined}
                  hint="Both days are included."
                  error={errors.validTo?.message}
                  disabled={isPending}
                />
              )}
            />
            <Input
              label="Service mode"
              optional
              placeholder="CY/CY"
              {...register("serviceMode")}
              error={errors.serviceMode?.message}
              disabled={isPending}
            />
            <Input
              label="Transit time"
              optional
              placeholder="59d 8h"
              hint='Days and hours, as Maersk writes it: "59d 8h".'
              {...register("transit")}
              error={errors.transit?.message}
              disabled={isPending}
            />
          </div>

          {clashes.length > 0 && (
            <div
              role="alert"
              className="border-ochre/40 bg-ochre/10 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm text-[#7a5408]"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">
                  Overlaps{" "}
                  {clashes.length === 1
                    ? "another rate"
                    : `${clashes.length} other rates`}
                </p>
                <p className="mt-0.5">
                  This lane, commodity and size already has a rate for{" "}
                  {clashes
                    .map((r) => formatValidity(r.validFrom, r.validTo))
                    .join(", ")}
                  . Customers see only one per size, the one updated last, so
                  shorten one of them or expire the older rate. You can still
                  save.
                </p>
              </div>
            </div>
          )}
        </FormSection>

        <FormSection
          title="Charges"
          description="Amounts for one container, or once per bill of lading for document charges. Zero-rated charges can stay in, as Maersk lists them."
        >
          <ChargesEditor disabled={isPending} />
          {chargesError && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {chargesError}
            </p>
          )}
          <LiveTotals charges={watched.charges ?? []} />
        </FormSection>

        <FormSection
          title="Free time at destination"
          description="Detention and demurrage, from Maersk's D&D free time sheet. Leave it empty if the quote has none."
        >
          <FreeTimeEditor disabled={isPending} />
        </FormSection>

        <Textarea
          label="Remarks"
          optional
          rows={3}
          placeholder="Anything customers should know about this rate"
          {...register("remarks")}
          error={errors.remarks?.message}
          disabled={isPending}
        />

        <div className="max-medium-mobile:-mx-4 max-medium-mobile:-mb-4 max-medium-mobile:px-4 max-medium-mobile:-bottom-4 sticky -bottom-6 z-20 -mx-6 -mb-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="outline"
            onClick={() => setIntent("another")}
            isLoading={isPending && intent === "another"}
            disabled={isPending}
            className="rounded-xl"
          >
            Save and add another size
          </Button>
          <Button
            type="submit"
            onClick={() => setIntent("close")}
            isLoading={isPending && intent === "close"}
            disabled={isPending}
            className="max-small-mobile:w-full rounded-xl"
          >
            {editingId ? "Save changes" : "Save rate"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

// The form opens fresh each time; the page gives it a new key per opening.
const RateFormModal = ({ isOpen, source, onClose }: RateFormModalProps) => {
  const [title, setTitle] = useState(TITLES[source.kind]);
  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} size="2xl">
      <RateForm source={source} onClose={onClose} onTitleChange={setTitle} />
    </Modal>
  );
};

export default RateFormModal;
