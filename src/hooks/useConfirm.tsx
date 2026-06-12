import { useState, useRef } from "react";
import { ConfirmationModal } from "../components/app/ConfirmationModal";
interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger" | "warning";
}

export const useConfirm = () => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleClose = () => {
    resolveRef.current?.(false);
    setOptions(null);
  };

  const handleConfirm = () => {
    resolveRef.current?.(true);
    setOptions(null);
  };

  const ConfirmDialog = options ? (
    <ConfirmationModal
      isOpen={!!options}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
    />
  ) : null;

  return { confirm, ConfirmDialog };
};
