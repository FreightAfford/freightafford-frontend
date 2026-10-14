import { Activity, RefreshCw, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useUpdateBookingStatus } from "../../hooks/useBookingService";
import Select from "../Select";
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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: { status: initialStatus || "awaiting_confirmation" },
  });

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
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <Select
            icon={Activity}
            {...field}
            label="Shipment Status"
            options={statusOptions}
            error={errors.status?.message}
            disabled={isPending}
          />
        )}
      />
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button
          icon={X}
          onClick={onCancel}
          type="button"
          variant="outline"
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          icon={RefreshCw}
          type="submit"
          isLoading={isPending}
          disabled={isPending}
        >
          Update Status
        </Button>
      </div>
    </form>
  );
};

export default UpdateStatusForm;
