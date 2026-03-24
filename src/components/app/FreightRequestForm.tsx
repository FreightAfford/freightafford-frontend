import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreateFreightRequest } from "../../hooks/useFreightService";
import cn from "../../utils/cn";
import {
  freightRequestSchema,
  type FreightRequestFormValues,
} from "../../validations/freightValidation";
import Button from "../Button";
import Input from "../Input";

const FreightRequestForm = ({ onCancel }: { onCancel: () => void }) => {
  const today = new Date().toISOString().split("T")[0];
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 3);

  const formattedDate = defaultDate.toISOString().split("T")[0];
  const { createRequest, isPending } = useCreateFreightRequest();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FreightRequestFormValues>({
    resolver: zodResolver(freightRequestSchema),
    defaultValues: { cargoReadyDate: formattedDate },
  });

  const containerSize = watch("containerSize");

  const onCreateRequest = (data: FreightRequestFormValues) =>
    createRequest(data, { onSuccess: () => onCancel() });

  return (
    <form onSubmit={handleSubmit(onCreateRequest)} className="space-y-6">
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-medium text-slate-700">Container Size</label>
          <select
            disabled={isPending}
            {...register("containerSize")}
            className={cn(
              "focus-visible:ring-brand flex h-12 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed",
              errors.containerSize &&
                "border-red-500 focus-visible:ring-red-500",
              containerSize
                ? "text-slate-900"
                : isPending
                  ? "text-slate-500"
                  : "text-slate-500",
            )}
          >
            <option value="">Add container size</option>
            <option value="20ft Std">20ft Standard</option>
            <option value="40ft Std">40ft Standard</option>
            <option value="40ft HC">40ft High Cube</option>
            <option value="45ft HC">45ft High Cube</option>
          </select>

          {errors.containerSize && (
            <p className="font-medium text-red-500">
              {errors.containerSize.message}
            </p>
          )}
        </div>
        <Input
          label="Container Quantity"
          type="number"
          placeholder="e.g. 2"
          {...register("containerQuantity", { valueAsNumber: true })}
          error={errors.containerQuantity?.message}
          disabled={isPending}
        />

        <Input
          label="Proposed Price (USD)"
          type="number"
          placeholder="e.g. 2500"
          {...register("proposedPrice", { valueAsNumber: true })}
          error={errors.proposedPrice?.message}
          disabled={isPending}
        />
        <Input
          label="Weight (kg)"
          type="number"
          placeholder="e.g. 15000"
          {...register("cargoWeight", { valueAsNumber: true })}
          error={errors.cargoWeight?.message}
          disabled={isPending}
        />
      </div>
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
        <Input
          label="Origin Port"
          placeholder="e.g. Shanghai, CN"
          {...register("originPort")}
          error={errors.originPort?.message}
          disabled={isPending}
        />
        <Input
          label="Destination Port"
          placeholder="e.g. Los Angeles, US"
          {...register("destinationPort")}
          error={errors.destinationPort?.message}
          disabled={isPending}
        />
      </div>
      <Input
        label="Commodity"
        placeholder="e.g. Electronics"
        {...register("commodity")}
        error={errors.commodity?.message}
        disabled={isPending}
      />
      <Input
        label="Ready Date"
        type="date"
        min={today}
        {...register("cargoReadyDate")}
        error={errors.cargoReadyDate?.message}
        disabled={isPending}
        className="default:text-slate-500"
      />
      <div className="space-y-1.5">
        <label className="font-medium text-slate-700">Additional Notes</label>
        <textarea
          {...register("notes")}
          disabled={isPending}
          className="focus-visible:ring-brand flex min-h-20 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          placeholder="Any special requirements..."
        />
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button onClick={onCancel} type="button" variant="ghost">
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          Submit Request
        </Button>
      </div>
    </form>
  );
};

export default FreightRequestForm;
