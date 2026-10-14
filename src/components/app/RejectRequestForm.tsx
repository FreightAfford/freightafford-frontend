import { Ban, MessageSquareText, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useConfirm } from "../../hooks/useConfirm";
import { useRejectFreightRequest } from "../../hooks/useFreightService";
import {
  rejectFreightSchema,
  type RejectFreightFormValues,
} from "../../validations/freightValidation";
import Button from "../Button";
import Textarea from "../Textarea";

const RejectRequestForm = ({
  request,
  onCancel,
}: {
  request: any;
  onCancel: () => void;
}) => {
  const { confirm, ConfirmDialog } = useConfirm();
  const { isPending, rejectRequest } = useRejectFreightRequest(request?._id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectFreightFormValues>({
    resolver: zodResolver(rejectFreightSchema),
  });

  const onRejectFreight = async (data: RejectFreightFormValues) => {
    const ok = await confirm({
      title: "Confirm Rejection",
      message: "Are you sure you want to reject this freight request?",
      confirmText: "Yes, Reject",
      cancelText: "No, Cancel",
      variant: "danger",
    });

    if (ok)
      rejectRequest({ id: request._id, data }, { onSuccess: () => onCancel() });
  };
  return (
    <form onSubmit={handleSubmit(onRejectFreight)} className="space-y-6">
      <Textarea
        icon={MessageSquareText}
        label="Reason for Rejection"
        rows={4}
        placeholder="Explain why this request is being rejected..."
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
          icon={Ban}
          type="submit"
          variant="primary"
          disabled={isPending}
          isLoading={isPending}
          className="bg-red-600 hover:bg-red-700"
        >
          Confirm Rejection
        </Button>
      </div>
      {ConfirmDialog}
    </form>
  );
};
export default RejectRequestForm;
