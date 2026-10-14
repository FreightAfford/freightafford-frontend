import { zodResolver } from "@hookform/resolvers/zod";
import { Container, Edit2, Hash, Plus, Save, X as XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useAddContainer } from "../../hooks/useBookingService";
import Button from "../Button";
import Input from "../Input";
import {
  containerSchema,
  type ContainerFormData,
} from "../../validations/bookingValidation";

interface ContainerManifestManagerProps {
  booking: any;
  freightRequest: any;
  userRole?: string;
}

const ContainerManifestManager = ({
  booking,
  freightRequest,
  userRole,
}: ContainerManifestManagerProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const targetCount = freightRequest?.containerQuantity || 1;
  const { mutate, isPending } = useAddContainer();

  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
    reset,
  } = useForm<ContainerFormData>({
    resolver: zodResolver(containerSchema),
    defaultValues: {
      containers: (booking.containers || []).map((number: string) => ({
        number,
      })),
    },
  });

  const { fields, append } = useFieldArray({
    control,
    name: "containers",
  });

  const handleStartEditing = () => {
    const currentContainers = booking.containers || [];
    const initialContainers = [...currentContainers];

    while (initialContainers.length < targetCount) initialContainers.push("");

    const finalContainers = initialContainers.slice(0, targetCount);

    reset({ containers: finalContainers.map((number) => ({ number })) });

    setIsEditing(true);
  };

  const onAddContainerManifest = (data: ContainerFormData) => {
    const containers = data.containers
      .map((c) => c.number.trim().toUpperCase())
      .filter((c) => c !== "");

    mutate(
      {
        bookingId: booking._id,
        containers,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          reset({ containers: containers.map((number) => ({ number })) });
        },
      },
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Container className="text-brand h-5 w-5" />
          <h3 className="font-bold text-slate-900">Container numbers</h3>
          {!isEditing &&
            booking.containers &&
            booking.containers.length > 0 && (
              <div className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {booking.containers.length} Unit
                {booking.containers.length > 1 && "s"}
              </div>
            )}
        </div>
        {userRole === "admin" &&
          booking.containers &&
          booking.containers.length > 0 &&
          !isEditing && (
            <Button
              icon={Edit2}
              type="button"
              variant="outline"
              size="sm"
              onClick={handleStartEditing}
            >
              Edit Manifest
            </Button>
          )}
      </div>

      {isEditing ? (
        <motion.form
          onSubmit={handleSubmit(onAddContainerManifest)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          <div className="max-medium-tablet:grid-cols-2 max-small-mobile:grid-cols-1 grid grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {fields.map((field, idx) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={field.id}
                  className="space-y-1"
                >
                  <div className="relative">
                    <Input
                      icon={Container}
                      aria-label={`Container ${idx + 1} number`}
                      {...register(`containers.${idx}.number` as const)}
                      disabled={isPending}
                      placeholder="ABCD1234567"
                      className="uppercase"
                      error={errors.containers?.[idx]?.number?.message}
                    />
                    {/* {fields.length > 1 && fields.length > 0 && ( */}
                    <button
                      type="button"
                      // onClick={() => remove(idx)}
                      className="absolute -top-2 -right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:border-red-200 hover:text-red-500"
                    >
                      {/* <X className="h-3 w-3" /> */}{" "}
                      <span className="text-[10px]">{idx + 1}</span>
                    </button>
                    {/* )} */}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {fields.length < targetCount && (
              <motion.button
                layout
                type="button"
                onClick={() => append({ number: "" })}
                className="hover:text-brand hover:border-brand/50 hover:bg-brand/5 group flex h-13 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition-all"
              >
                <Plus className="mb-1 h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-bold tracking-widest uppercase">
                  Add Unit
                </span>
              </motion.button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              icon={XIcon}
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              icon={Save}
              // onClick={handleSaveContainers}
              type="submit"
              disabled={isPending}
              isLoading={isPending}
            >
              {booking.containers.length > 0 ? "Update" : "Add"} Container
              {booking.freightRequest.containerQuantity > 1 && "s"}
            </Button>
          </div>
        </motion.form>
      ) : (
        <AnimatePresence mode="wait">
          {booking.containers && booking.containers.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-medium-tablet:grid-cols-2 max-small-mobile:grid-cols-1 grid grid-cols-3 gap-4"
            >
              {booking.containers.map((container: any, idx: number) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={idx}
                  className="group hover:border-brand/30 relative overflow-hidden rounded-xl border border-slate-200 bg-white px-2.5 py-4 transition-all duration-300 hover:shadow-md"
                >
                  {/* Decorative background element */}
                  <div className="absolute -top-2 -right-2 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
                    <Hash className="h-16 w-16 text-slate-900" />
                  </div>

                  <div className="relative z-10">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                        Unit {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <div className="bg-brand h-1.5 w-1.5 animate-pulse rounded-full" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="group-hover:text-brand font-mono text-lg font-black tracking-tight text-slate-900 transition-colors">
                        {container}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="bg-brand/20 h-full w-full" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3"
            >
              <p className="flex items-center gap-2.5 text-slate-500">
                <Container
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-slate-400"
                />
                No container numbers yet.
              </p>
              {userRole === "admin" && !isEditing && (
                <Button
                  icon={Plus}
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg bg-white px-3 text-sm font-semibold"
                  onClick={handleStartEditing}
                >
                  Add containers
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
export default ContainerManifestManager;
