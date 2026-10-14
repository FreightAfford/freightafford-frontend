import { Anchor, Hash, Ship, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useUpdateBookingShipping } from "../../hooks/useBookingService";
import {
  updateShippingSchema,
  type UpdateBookingShippingFormValues,
} from "../../validations/bookingValidation";
import Button from "../Button";
import DateInput from "../DateInput";
import Input from "../Input";
import Select from "../Select";
import VesselSelect from "./VesselSelect";

interface UpdateShippingFormProps {
  bookingId: string;
  initialData: {
    shippingLine?: string;
    vessel?: string;
    vesselImo?: string;
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
    control,
    setValue,
  } = useForm<UpdateBookingShippingFormValues>({
    resolver: zodResolver(updateShippingSchema),
    defaultValues: {
      shippingLine: initialData.shippingLine || "",
      vessel: initialData.vessel || "",
      vesselImo: initialData.vesselImo || undefined,
      sailingDate: initialData.sailingDate
        ? new Date(initialData.sailingDate).toISOString().split("T")[0]
        : today,
      carrierBookingNumber: initialData.carrierBookingNumber || "",
    },
  });
  const { isPending, updateBookingShipping } = useUpdateBookingShipping();

  const vesselImo = watch("vesselImo");
  const onUpdateBookingShipping = (data: UpdateBookingShippingFormValues) =>
    updateBookingShipping(
      { id: bookingId, data },
      { onSuccess: () => onCancel() },
    );

  return (
    <form onSubmit={handleSubmit(onUpdateBookingShipping)}>
      <div className="space-y-4 pb-4">
        <Controller
          control={control}
          name="shippingLine"
          render={({ field }) => (
            <Select
              icon={Anchor}
              {...field}
              label="Shipping Line"
              placeholder="Select Shipping Line"
              options={["Maersk", "CMA CGM", "MSC", "Hapag-Lloyd"]}
              error={errors.shippingLine?.message}
              disabled={isPending}
            />
          )}
        />

        <Controller
          name="vessel"
          control={control}
          render={({ field }) => (
            <VesselSelect
              label="Vessel Name"
              placeholder="e.g. Maersk Eindhoven"
              value={field.value}
              imo={vesselImo}
              onChange={(name, imo) => {
                field.onChange(name);
                setValue("vesselImo", imo);
              }}
              error={errors.vessel?.message}
              disabled={isPending}
            />
          )}
        />
        <Controller
          control={control}
          name="sailingDate"
          render={({ field }) => (
            <DateInput
              {...field}
              label="Sailing Date (ETD)"
              min={today}
              error={errors.sailingDate?.message}
              disabled={isPending}
            />
          )}
        />
        <Input
          icon={Hash}
          label="Carrier Booking Number"
          placeholder="e.g. MSK123456789"
          {...register("carrierBookingNumber")}
          error={errors.carrierBookingNumber?.message}
          disabled={isPending}
        />
      </div>
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
          icon={Ship}
          type="submit"
          isLoading={isPending}
          disabled={isPending}
        >
          Update Shipping
        </Button>
      </div>
    </form>
  );
};

export default UpdateShippingForm;
