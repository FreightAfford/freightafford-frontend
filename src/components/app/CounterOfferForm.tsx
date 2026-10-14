import { DollarSign, HandCoins, MessageSquareText, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useConfirm } from "../../hooks/useConfirm";
import { useCounterFreightRequest } from "../../hooks/useFreightService";
import {
  counterFreightSchema,
  type CounterFreightFormValues,
} from "../../validations/freightValidation";
import Button from "../Button";
import Input from "../Input";
import Textarea from "../Textarea";

const CounterOfferForm = ({
  request,
  onCancel,
}: {
  request: any;
  onCancel: () => void;
}) => {
  const { confirm, ConfirmDialog } = useConfirm();
  const { counterRequest, isPending } = useCounterFreightRequest(request?._id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CounterFreightFormValues>({
    resolver: zodResolver(counterFreightSchema),
  });

  const onCounterFreight = async (data: CounterFreightFormValues) => {
    const ok = await confirm({
      title: "Confirm Counter Offer",
      message: "Are you sure you want to send this counter offer?",
      confirmText: "Yes, Send",
      cancelText: "No, Cancel",
      variant: "warning",
    });

    if (ok)
      counterRequest(
        { id: request._id, data },
        { onSuccess: () => onCancel() },
      );
  };

  return (
    <form onSubmit={handleSubmit(onCounterFreight)} className="space-y-6">
      <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-slate-500">Customer's Proposed Price</p>
        <p className="text-2xl font-bold text-slate-900">
          ${request?.proposedPrice.toLocaleString()}
        </p>
      </div>
      <Input
        icon={DollarSign}
        label="Your Counter Price (USD)"
        type="number"
        placeholder="e.g. 2600"
        {...register("counterPrice", { valueAsNumber: true })}
        error={errors.counterPrice?.message}
        disabled={isPending}
      />
      <Textarea
        icon={MessageSquareText}
        label="Reason / Message to Customer"
        rows={4}
        placeholder="Explain why you are countering this price..."
        {...register("reason")}
        error={errors.reason?.message}
        disabled={isPending}
      />
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button
          icon={X}
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          icon={HandCoins}
          type="submit"
          isLoading={isPending}
          disabled={isPending}
        >
          Send Counter Offer
        </Button>
      </div>
      {ConfirmDialog}
    </form>
  );
};
export default CounterOfferForm;
