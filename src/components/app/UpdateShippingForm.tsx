import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUpdateBookingShipping } from "../../hooks/useBookingService";
import cn from "../../utils/cn";
import {
  updateShippingSchema,
  type UpdateBookingShippingFormValues,
} from "../../validations/bookingValidation";
import Button from "../Button";
import Input from "../Input";

interface UpdateShippingFormProps {
  bookingId: string;
  initialData: {
    shippingLine?: string;
    vessel?: string;
    sailingDate?: string;
    carrierBookingNumber?: string;
  };
  onCancel: () => void;
}

const UpdateShippingForm = ({
  initialData,
  onCancel,
  bookingId,
}: UpdateShippingFormProps) => {
  const today = new Date().toISOString().split("T")[0];
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UpdateBookingShippingFormValues>({
    resolver: zodResolver(updateShippingSchema),
    defaultValues: {
      shippingLine: initialData.shippingLine || "",
      vessel: initialData.vessel || "",
      sailingDate: initialData.sailingDate
        ? new Date(initialData.sailingDate).toISOString().split("T")[0]
        : today,
      carrierBookingNumber: initialData.carrierBookingNumber || "",
    },
  });
  const { isPending, updateBookingShipping } = useUpdateBookingShipping();

  const shippingLine = watch("shippingLine");
  const onUpdateBookingShipping = (data: UpdateBookingShippingFormValues) =>
    updateBookingShipping(
      { id: bookingId, data },
      { onSuccess: () => onCancel() },
    );

  return (
    <form onSubmit={handleSubmit(onUpdateBookingShipping)}>
      <div className="space-y-4 pb-4">
        <div>
          <label className="mb-1 block font-medium text-slate-700">
            Shipping Line
          </label>
          <select
            disabled={isPending}
            {...register("shippingLine")}
            className={cn(
              "focus-visible:ring-brand flex h-12 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed",
              errors.shippingLine &&
                "border-red-500 focus-visible:ring-red-500",
              shippingLine
                ? "text-slate-900"
                : isPending
                  ? "text-slate-500"
                  : "text-slate-500",
            )}
          >
            <option value="">Select Shipping Line</option>
            <option value="Maersk">Maersk</option>
            <option value="CMA CGM">CMA CGM</option>
            <option value="MSC">MSC</option>
            <option value="Hapag-Lloyd">Hapag-Lloyd</option>
          </select>
          {errors.shippingLine && (
            <p className="mt-1 text-red-500">{errors.shippingLine.message}</p>
          )}
        </div>

        <Input
          label="Vessel Name"
          placeholder="e.g. Maersk Eindhoven"
          {...register("vessel")}
          error={errors.vessel?.message}
          disabled={isPending}
        />
        <Input
          label="Sailing Date (ETD)"
          type="date"
          {...register("sailingDate")}
          error={errors.sailingDate?.message}
          min={today}
          disabled={isPending}
        />
        <Input
          label="Carrier Booking Number"
          placeholder="e.g. MSK123456789"
          {...register("carrierBookingNumber")}
          error={errors.carrierBookingNumber?.message}
          disabled={isPending}
        />
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

export default UpdateShippingForm;
