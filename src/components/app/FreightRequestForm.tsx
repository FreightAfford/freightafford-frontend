import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpDown, Minus, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useConfirm } from "../../hooks/useConfirm";
import { useCreateFreightRequest } from "../../hooks/useFreightService";
import {
  formatPortLabel,
  type PortLocation,
} from "../../services/api/location";
import cn from "../../utils/cn";
import {
  freightRequestSchema,
  type FreightRequestFormValues,
} from "../../validations/freightValidation";
import Button from "../Button";
import Input from "../Input";
import PortSelect from "./PortSelect";

const CONTAINER_SIZES = [
  { value: "20ft Std", size: "20ft", kind: "Standard" },
  { value: "40ft Std", size: "40ft", kind: "Standard" },
  { value: "40ft HC", size: "40ft", kind: "High cube" },
  { value: "45ft HC", size: "45ft", kind: "High cube" },
] as const;

const MAX_COPIES = 50;

const FieldGroup = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <fieldset className="space-y-4">
    <legend className="mb-3 text-lg font-semibold text-slate-900">
      {title}
    </legend>
    {children}
  </fieldset>
);

const FreightRequestForm = ({ onCancel }: { onCancel: () => void }) => {
  const today = new Date().toISOString().split("T")[0];
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 3);
  const formattedDate = defaultDate.toISOString().split("T")[0];

  const { createRequest, isPending } = useCreateFreightRequest();
  const { confirm, ConfirmDialog } = useConfirm();
  const [copies, setCopies] = useState<number>(1);
  const [origin, setOrigin] = useState<PortLocation | null>(null);
  const [destination, setDestination] = useState<PortLocation | null>(null);

  // Tracks which button triggered the current submit, so onSuccess knows whether to close or clone
  const [submitIntent, setSubmitIntent] = useState<"done" | "clone">("done");

  const emptyValues = {
    cargoReadyDate: formattedDate,
    originPortCode: "",
    destinationPortCode: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<FreightRequestFormValues>({
    resolver: zodResolver(freightRequestSchema),
    defaultValues: emptyValues,
  });

  const setPort = (
    field: "originPortCode" | "destinationPortCode",
    loc: PortLocation | null,
  ) => {
    if (field === "originPortCode") setOrigin(loc);
    else setDestination(loc);
    setValue(field, loc?.code ?? "", { shouldValidate: isSubmitted });
  };

  const swapPorts = () => {
    const [nextOrigin, nextDestination] = [destination, origin];
    setPort("originPortCode", nextOrigin);
    setPort("destinationPortCode", nextDestination);
  };

  const onCreateRequest = async (data: FreightRequestFormValues) => {
    const route =
      origin && destination
        ? `${formatPortLabel(origin)} to ${formatPortLabel(destination)}`
        : "this route";

    const ok = await confirm({
      title: copies > 1 ? `Send ${copies} requests?` : "Send this request?",
      message:
        copies > 1
          ? `${copies} identical requests for ${route} will go to our team for pricing.`
          : `Your request for ${route} will go to our team for pricing.`,
      confirmText: copies > 1 ? `Send ${copies} requests` : "Send request",
      cancelText: "Keep editing",
      variant: "primary",
    });

    if (!ok) return;

    createRequest(
      { data, quantity: copies },
      {
        onSuccess: () => {
          if (submitIntent === "clone") {
            reset(emptyValues);
            setOrigin(null);
            setDestination(null);
            setCopies(1);
          } else {
            onCancel();
          }
        },
      },
    );
  };

  const routeError =
    errors.originPortCode?.message ?? errors.destinationPortCode?.message;

  return (
    <form
      onSubmit={handleSubmit(onCreateRequest)}
      className="space-y-8"
      noValidate
    >
      <FieldGroup title="Route">
        <div
          className={cn(
            "relative rounded-lg border border-slate-200 bg-white focus-within:border-slate-300",
            routeError && "border-red-500",
          )}
        >
          {/* Dashed lane between the origin dot and destination ring */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-7 bottom-7 left-[20px] border-l-2 border-dashed border-slate-300"
          />
          <PortSelect
            label="Origin port"
            prefix="From"
            marker="origin"
            placeholder="City, e.g. Shanghai"
            value={origin}
            onChange={(loc) => setPort("originPortCode", loc)}
            invalid={!!errors.originPortCode}
            disabled={isPending}
            className="border-b border-slate-200"
          />
          <PortSelect
            label="Destination port"
            prefix="To"
            marker="destination"
            placeholder="City, e.g. Lagos"
            value={destination}
            onChange={(loc) => setPort("destinationPortCode", loc)}
            invalid={!!errors.destinationPortCode}
            disabled={isPending}
          />
          <button
            type="button"
            onClick={swapPorts}
            disabled={isPending || (!origin && !destination)}
            aria-label="Swap origin and destination"
            title="Swap origin and destination"
            className="hover:border-brand hover:text-brand focus-visible:ring-brand absolute top-1/2 right-3 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
        {routeError && (
          <p role="alert" className="-mt-2 font-medium text-red-500">
            {routeError}
          </p>
        )}
      </FieldGroup>

      <FieldGroup title="Cargo">
        <div
          role="radiogroup"
          aria-label="Container size"
          className="max-medium-mobile:grid-cols-2 grid grid-cols-4 gap-2"
        >
          {CONTAINER_SIZES.map((c) => (
            <label key={c.value} className="group relative cursor-pointer">
              <input
                type="radio"
                value={c.value}
                disabled={isPending}
                {...register("containerSize")}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "peer-checked:border-brand peer-checked:bg-brand/5 peer-focus-visible:ring-brand flex h-full flex-col rounded-lg border border-slate-200 px-3 py-2.5 transition-colors peer-checked:shadow-[inset_0_0_0_1px_var(--color-brand)] peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 hover:border-slate-300",
                  errors.containerSize && "border-red-500",
                )}
              >
                <span className="group-has-checked:text-brand font-semibold text-slate-900">
                  {c.size}
                </span>
                <span className="text-sm text-slate-500">{c.kind}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.containerSize && (
          <p role="alert" className="-mt-2 font-medium text-red-500">
            {errors.containerSize.message}
          </p>
        )}

        <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
          <Input
            label="Containers"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="e.g. 2"
            {...register("containerQuantity", { valueAsNumber: true })}
            error={errors.containerQuantity?.message}
            disabled={isPending}
          />
          <Input
            label="Cargo weight (kg)"
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="e.g. 15000"
            {...register("cargoWeight", { valueAsNumber: true })}
            error={errors.cargoWeight?.message}
            disabled={isPending}
          />
          <Input
            label="Commodity"
            placeholder="e.g. Electronics"
            {...register("commodity")}
            error={errors.commodity?.message}
            disabled={isPending}
          />
          <Input
            label="Cargo ready date"
            type="date"
            min={today}
            {...register("cargoReadyDate")}
            error={errors.cargoReadyDate?.message}
            disabled={isPending}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Your offer">
        <div className="space-y-1.5">
          <Input
            label="Proposed price (USD)"
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="e.g. 2500"
            {...register("proposedPrice", { valueAsNumber: true })}
            error={errors.proposedPrice?.message}
            disabled={isPending}
          />
          {!errors.proposedPrice && (
            <p className="text-sm text-slate-500">
              We'll accept it or send you a counter-offer.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="freight-notes" className="font-medium text-slate-700">
            Notes <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="freight-notes"
            {...register("notes")}
            disabled={isPending}
            rows={3}
            className="focus-visible:ring-brand flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Hazardous goods, temperature control, handling needs…"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-slate-700" id="copies-label">
              Copies
            </p>
            <p className="text-sm text-slate-500">
              Sends separate requests with these details.
            </p>
          </div>
          <div
            role="group"
            aria-labelledby="copies-label"
            className="flex h-11 items-center rounded-md border border-slate-200"
          >
            <button
              type="button"
              onClick={() => setCopies((n) => Math.max(1, n - 1))}
              disabled={isPending || copies <= 1}
              aria-label="Fewer copies"
              className="focus-visible:ring-brand flex h-full w-10 items-center justify-center text-slate-500 hover:text-slate-900 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min={1}
              max={MAX_COPIES}
              value={copies}
              aria-label="Number of copies"
              onChange={(e) =>
                setCopies(
                  Math.min(
                    MAX_COPIES,
                    Math.max(1, Number(e.target.value) || 1),
                  ),
                )
              }
              disabled={isPending}
              className="h-full w-12 [appearance:textfield] border-x border-slate-200 text-center font-semibold tabular-nums focus-visible:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setCopies((n) => Math.min(MAX_COPIES, n + 1))}
              disabled={isPending || copies >= MAX_COPIES}
              aria-label="More copies"
              className="focus-visible:ring-brand flex h-full w-10 items-center justify-center text-slate-500 hover:text-slate-900 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </FieldGroup>

      <div className="max-small-mobile:flex-col-reverse max-small-mobile:items-stretch flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <Button onClick={onCancel} type="button" variant="ghost">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="outline"
          isLoading={isPending && submitIntent === "clone"}
          onClick={() => setSubmitIntent("clone")}
        >
          Send and start another
        </Button>
        <Button
          type="submit"
          isLoading={isPending && submitIntent === "done"}
          onClick={() => setSubmitIntent("done")}
        >
          {copies > 1 ? `Send ${copies} requests` : "Send request"}
        </Button>
        {ConfirmDialog}
      </div>
    </form>
  );
};

export default FreightRequestForm;
