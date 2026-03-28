import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUpdateBookingStatus } from "../../hooks/useBookingService";
import cn from "../../utils/cn";
import {
  updateStatusSchema,
  type UpdateStatusFormValues,
} from "../../validations/bookingValidation";
import Button from "../Button";

interface UpdateStatusFormProps {
  initialStatus?:
    | "awaiting_confirmation"
    | "confirmed"
    | "in_transit"
    | "arrived"
    | "delivered"
    | "cancelled";
  bookingId: string;
  onCancel: () => void;
}

const UpdateStatusForm = ({
  initialStatus,
  bookingId,
  onCancel,
}: UpdateStatusFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: { status: initialStatus || "awaiting_confirmation" },
  });

  const status = watch("status");

  const { updateStatus, isPending } = useUpdateBookingStatus();

  const statusOptions = [
    { value: "awaiting_confirmation", label: "Awaiting Confirmation" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in_transit", label: "In Transit" },
    { value: "arrived", label: "Arrived at Port" },
    { value: "delivered", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const onUpdateStatus = (data: UpdateStatusFormValues) =>
    updateStatus({ id: bookingId, data }, { onSuccess: () => onCancel() });

  return (
    <form onSubmit={handleSubmit(onUpdateStatus)} className="space-y-6">
      <div>
        <label className="mb-1 block font-medium text-slate-700">
          Shipment Status
        </label>
        <select
          {...register("status")}
          disabled={isPending}
          className={cn(
            "focus-visible:ring-brand flex h-12 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed",
            errors.status && "border-red-500 focus-visible:ring-red-500",
            status
              ? "text-slate-900"
              : isPending
                ? "text-slate-500"
                : "text-slate-500",
          )}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {errors.status && (
          <p className="mt-1 text-red-500">{errors.status.message}</p>
        )}
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button
          onClick={onCancel}
          type="button"
          variant="outline"
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending} disabled={isPending}>
          Update Shipping
        </Button>
      </div>
    </form>
  );
};

export default UpdateStatusForm;
