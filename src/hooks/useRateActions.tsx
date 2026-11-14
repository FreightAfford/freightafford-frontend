import { CalendarX2, Trash2 } from "lucide-react";
import type { Rate } from "../services/api/rate";
import { rateSizeLabel } from "../utils/rates";
import { useConfirm } from "./useConfirm";
import { useDeleteRate, useExpireRate } from "./useRateService";

const rateName = (rate: Rate) => (
  <span className="font-medium text-slate-800">
    {rate.origin.city} → {rate.destination.city},{" "}
    {rateSizeLabel(rate.containerSize)}
  </span>
);

// Expire and delete, each asked first. Shared by the rates list and the
// page for one rate.
export const useRateActions = () => {
  const { confirm, ConfirmDialog } = useConfirm();
  const { expireRate } = useExpireRate();
  const { deleteRate } = useDeleteRate();

  const confirmExpire = async (rate: Rate) => {
    const ok = await confirm({
      title: "Expire this rate?",
      message: (
        <>
          {rateName(rate)} will end yesterday, so customers stop seeing it at
          once. It stays in the list, and you can edit its dates later.
        </>
      ),
      confirmText: "Expire rate",
      variant: "warning",
      icon: CalendarX2,
    });
    if (ok) expireRate(rate._id);
  };

  const confirmDelete = async (rate: Rate, onDeleted?: () => void) => {
    const ok = await confirm({
      title: "Delete this rate?",
      message: (
        <>
          {rateName(rate)} will be removed for good. Freight requests already
          made from it aren't affected. To stop offering it but keep the record,
          expire it instead.
        </>
      ),
      confirmText: "Delete rate",
      variant: "danger",
      icon: Trash2,
    });
    if (ok) deleteRate(rate._id, { onSuccess: () => onDeleted?.() });
  };

  return { confirmExpire, confirmDelete, ConfirmDialog };
};
