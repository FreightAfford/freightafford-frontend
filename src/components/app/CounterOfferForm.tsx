import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCounterFreightRequest } from "../../hooks/useFreightService";
import {
  counterFreightSchema,
  type CounterFreightFormValues,
} from "../../validations/freightValidation";
import Button from "../Button";
import Input from "../Input";

const CounterOfferForm = ({
  request,
  onCancel,
}: {
  request: any;
  onCancel: () => void;
}) => {
  const { counterRequest, isPending } = useCounterFreightRequest(request?._id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CounterFreightFormValues>({
    resolver: zodResolver(counterFreightSchema),
  });

  const onCounterFreight = (data: CounterFreightFormValues) =>
    counterRequest({ id: request._id, data }, { onSuccess: () => onCancel() });

  return (
    <form onSubmit={handleSubmit(onCounterFreight)} className="space-y-6">
      <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-slate-500">Customer's Proposed Price</p>
        <p className="text-2xl font-bold text-slate-900">
          ${request?.proposedPrice.toLocaleString()}
        </p>
      </div>
      <Input
        label="Your Counter Price (USD)"
        type="number"
        placeholder="e.g. 2600"
        {...register("counterPrice", { valueAsNumber: true })}
        error={errors.counterPrice?.message}
        disabled={isPending}
      />
      <div className="space-y-1.5">
        <label className="font-medium text-slate-700">
          Reason / Message to Customer
        </label>
        <textarea
          className="focus-visible:ring-brand flex min-h-25 w-full rounded-md border border-slate-200 bg-white px-3 py-2 focus-visible:ring-2 focus-visible:outline-none"
          placeholder="Explain why you are countering this price..."
          {...register("reason")}
          disabled={isPending}
        />
        {errors.reason && (
          <p className="font-medium text-red-500">{errors.reason.message}</p>
        )}
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          Send Counter Offer
        </Button>
      </div>
    </form>
  );
};
export default CounterOfferForm;
