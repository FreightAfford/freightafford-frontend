import type { LucideIcon } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import {
  ConfirmationModal,
  type ConfirmVariant,
} from "../components/app/ConfirmationModal";

interface ConfirmOptions {
  title: string;
  message: ReactNode;
  details?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: LucideIcon;
}

export const useConfirm = () => {
  // Options stay set after closing so the dialog keeps its content while it
  // animates out.
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    // A second call before the first is answered counts as a cancel.
    resolveRef.current?.(false);
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const settle = (value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = undefined;
    setIsOpen(false);
  };

  const ConfirmDialog = options ? (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={() => settle(false)}
      onConfirm={() => settle(true)}
      {...options}
    />
  ) : null;

  return { confirm, ConfirmDialog };
};
