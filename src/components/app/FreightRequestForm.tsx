import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftRight,
  Boxes,
  CalendarClock,
  CircleDot,
  Container,
  CopyPlus,
  DollarSign,
  MapPin,
  Minus,
  NotebookPen,
  Plus,
  Send,
  Weight,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useConfirm } from "../../hooks/useConfirm";
import { useCreateFreightRequest } from "../../hooks/useFreightService";
import { useKycStatus } from "../../hooks/useKycService";
import type { Commodity } from "../../services/api/commodity";
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
import DateInput from "../DateInput";
import { FieldMessage } from "../field";
import { FIELD_LABEL } from "../fieldStyles";
import Input from "../Input";
import Textarea from "../Textarea";
import CommoditySelect from "./CommoditySelect";
import PortSelect from "./PortSelect";

const CONTAINER_SIZES = [
  { value: "20ft Std", size: "20ft", kind: "Standard" },
  { value: "40ft Std", size: "40ft", kind: "Standard" },
  { value: "40ft HC", size: "40ft", kind: "High Cube" },
  { value: "45ft HC", size: "45ft", kind: "High Cube" },
] as const;

const MAX_COPIES = 50;

// A titled block of the form, divided from the one above by a rule.
const FieldGroup = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <section className="space-y-5 border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
    <div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-0.5 text-sm text-slate-500">{description}</p>
    </div>
    {children}
  </section>
);

const FreightRequestForm = ({ onCancel }: { onCancel: () => void }) => {
  const today = new Date().toISOString().split("T")[0];
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 3);
  const formattedDate = defaultDate.toISOString().split("T")[0];

  const { createRequest, isPending } = useCreateFreightRequest();
  const { canBook } = useKycStatus();
  const { confirm, ConfirmDialog } = useConfirm();
  const [copies, setCopies] = useState<number>(1);
  const [origin, setOrigin] = useState<PortLocation | null>(null);
  const [destination, setDestination] = useState<PortLocation | null>(null);
  const [commodity, setCommodity] = useState<Commodity | null>(null);

  // Tracks which button triggered the current submit, so onSuccess knows whether to close or clone
  const [submitIntent, setSubmitIntent] = useState<"done" | "clone">("done");

  const emptyValues = {
    cargoReadyDate: formattedDate,
    originPortCode: "",
    destinationPortCode: "",
    commodityCode: "",
  };

  const {
    register,
    control,
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

  const pickCommodity = (next: Commodity | null) => {
    setCommodity(next);
    setValue("commodityCode", next?.code ?? "", {
      shouldValidate: isSubmitted,
    });
  };

  const swapPorts = () => {
    const [nextOrigin, nextDestination] = [destination, origin];
    setPort("originPortCode", nextOrigin);
    setPort("destinationPortCode", nextDestination);
  };

  const onCreateRequest = async (data: FreightRequestFormValues) => {
    // The page already disables "New request" until verified; this catches
    // any other way into the form.
    if (!canBook) {
      toast.error("Verify your business before you send a freight request.");
      return;
    }
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
            setCommodity(null);
            setCopies(1);
          } else {
            onCancel();
          }
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onCreateRequest)}
      className="space-y-6"
      noValidate
    >
      <FieldGroup
        title="Route"
        description="Search by city or port name and pick from the list."
      >
        <div className="max-medium-mobile:grid-cols-1 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3">
          <PortSelect
            label="Origin port"
            icon={CircleDot}
            placeholder="e.g. Shanghai"
            value={origin}
            onChange={(loc) => setPort("originPortCode", loc)}
            error={errors.originPortCode?.message}
            disabled={isPending}
          />
          <button
            type="button"
            onClick={swapPorts}
            disabled={isPending || (!origin && !destination)}
            aria-label="Swap origin and destination"
            title="Swap origin and destination"
            className="hover:border-brand hover:text-brand focus-visible:ring-brand max-medium-mobile:mt-0 max-medium-mobile:h-10 max-medium-mobile:justify-self-center mt-[1.6875rem] flex h-13 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeftRight className="max-medium-mobile:rotate-90 h-4 w-4" />
          </button>
          <PortSelect
            label="Destination port"
            icon={MapPin}
            placeholder="e.g. Lagos"
            value={destination}
            onChange={(loc) => setPort("destinationPortCode", loc)}
            error={errors.destinationPortCode?.message}
            disabled={isPending}
          />
        </div>
      </FieldGroup>

      <FieldGroup
        title="Cargo"
        description="What you are shipping and when it is ready to load."
      >
        <fieldset disabled={isPending} className="space-y-1.5">
          <legend className={cn(FIELD_LABEL, "mb-1.5")}>Container size</legend>
          <div className="max-medium-mobile:grid-cols-2 grid grid-cols-4 gap-3">
            {CONTAINER_SIZES.map((c) => (
              <label
                key={c.value}
                className={cn(
                  "has-focus-visible:ring-brand has-checked:border-brand has-checked:bg-brand/5 group relative flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-60",
                  errors.containerSize
                    ? "border-red-400 bg-red-50/50"
                    : "border-slate-200 hover:border-slate-300",
                )}
              >
                <input
                  type="radio"
                  value={c.value}
                  {...register("containerSize")}
                  className="sr-only"
                />
                <Container
                  aria-hidden="true"
                  className="group-has-checked:text-brand h-5 w-5 shrink-0 text-slate-400"
                />
                <span>
                  <span className="font-display block font-semibold text-slate-900">
                    {c.size}
                  </span>
                  <span className="block text-sm text-slate-500">{c.kind}</span>
                </span>
              </label>
            ))}
          </div>
          <FieldMessage
            id="container-size"
            error={errors.containerSize?.message}
          />
        </fieldset>

        <CommoditySelect
          label="Commodity"
          placeholder="Search, e.g. furniture or fish"
          value={commodity}
          onChange={pickCommodity}
          error={errors.commodityCode?.message}
          disabled={isPending}
        />

        <div className="max-medium-mobile:grid-cols-1 grid grid-cols-3 gap-4">
          <Input
            icon={Boxes}
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
            icon={Weight}
            label="Cargo weight"
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="e.g. 15000"
            endAdornment={
              <span className="pr-2.5 text-sm font-medium text-slate-400">
                kg
              </span>
            }
            {...register("cargoWeight", { valueAsNumber: true })}
            error={errors.cargoWeight?.message}
            disabled={isPending}
          />
          <Controller
            control={control}
            name="cargoReadyDate"
            render={({ field }) => (
              <DateInput
                {...field}
                icon={CalendarClock}
                label="Cargo ready date"
                min={today}
                error={errors.cargoReadyDate?.message}
                disabled={isPending}
              />
            )}
          />
        </div>
      </FieldGroup>

      <FieldGroup
        title="Your offer"
        description="Name your price. We will accept it or send you a counter-offer."
      >
        <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-5">
          <Input
            icon={DollarSign}
            label="Proposed price"
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="e.g. 2500"
            endAdornment={
              <span className="pr-2.5 text-sm font-medium text-slate-400">
                USD
              </span>
            }
            {...register("proposedPrice", { valueAsNumber: true })}
            error={errors.proposedPrice?.message}
            disabled={isPending}
          />

          <div className="space-y-1.5">
            <span id="copies-label" className={FIELD_LABEL}>
              Copies
            </span>
            <div
              role="group"
              aria-labelledby="copies-label"
              aria-describedby="copies-hint"
              className="focus-within:border-brand flex h-13 items-center rounded-xl border border-slate-200 bg-white transition-[border-color,box-shadow] duration-150 focus-within:shadow-[0_0_0_3px_rgb(30_144_255/0.15)] hover:border-slate-300"
            >
              <button
                type="button"
                onClick={() => setCopies((n) => Math.max(1, n - 1))}
                disabled={isPending || copies <= 1}
                aria-label="Fewer copies"
                className="flex h-full w-12 items-center justify-center rounded-l-xl text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
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
                className="h-full min-w-0 flex-1 [appearance:textfield] border-x border-slate-200 bg-transparent text-center font-semibold text-slate-900 tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setCopies((n) => Math.min(MAX_COPIES, n + 1))}
                disabled={isPending || copies >= MAX_COPIES}
                aria-label="More copies"
                className="flex h-full w-12 items-center justify-center rounded-r-xl text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p id="copies-hint" className="text-sm text-slate-500">
              Sends separate requests with these details.
            </p>
          </div>
        </div>

        <Textarea
          icon={NotebookPen}
          label="Notes"
          optional
          rows={3}
          {...register("notes")}
          disabled={isPending}
          placeholder="Hazardous goods, temperature control, handling needs…"
        />
      </FieldGroup>

      <div className="max-small-mobile:flex-col-reverse max-small-mobile:items-stretch flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <Button
          onClick={onCancel}
          type="button"
          variant="ghost"
          icon={X}
          className="h-12 rounded-xl px-5 font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="outline"
          icon={CopyPlus}
          isLoading={isPending && submitIntent === "clone"}
          onClick={() => setSubmitIntent("clone")}
          className="h-12 rounded-xl px-5 font-semibold"
        >
          Send and start another
        </Button>
        <Button
          type="submit"
          icon={Send}
          isLoading={isPending && submitIntent === "done"}
          onClick={() => setSubmitIntent("done")}
          className="h-12 rounded-xl px-6 font-semibold"
        >
          {copies > 1 ? `Send ${copies} requests` : "Send request"}
        </Button>
        {ConfirmDialog}
      </div>
    </form>
  );
};

export default FreightRequestForm;
