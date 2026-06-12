import { AlertCircle, AlertTriangle, HelpCircle } from "lucide-react";
import * as React from "react";
import Button from "../Button";
import Modal from "../Modal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger" | "warning";
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Yes, Proceed",
  cancelText = "No, Cancel",
  variant = "primary",
  isLoading: externalLoading,
}) => {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const isLoading = externalLoading ?? internalLoading;

  const handleConfirm = async () => {
    try {
      if (externalLoading === undefined) setInternalLoading(true);
      await onConfirm();
    } finally {
      if (externalLoading === undefined) setInternalLoading(false);
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 sm:mx-0 sm:h-10 sm:w-10">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
        );
      case "warning":
        return (
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
        );
      case "primary":
      default:
        return (
          <div className="bg-brand/10 text-brand mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10">
            <HelpCircle className="h-6 w-6" aria-hidden="true" />
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} size="sm">
      <div className="p-2 sm:flex sm:items-start">
        {getIcon()}
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 className="font-sans text-lg leading-6 font-bold text-slate-900">
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-sm leading-relaxed text-slate-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:mt-8 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="w-full font-medium text-slate-700 sm:w-auto"
        >
          {cancelText}
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          isLoading={isLoading}
          disabled={isLoading}
          className={`w-full font-semibold sm:w-auto ${
            variant === "danger"
              ? "bg-red-600 text-white hover:bg-red-700 hover:opacity-100 focus-visible:ring-red-500"
              : variant === "warning"
                ? "bg-amber-600 text-white hover:bg-amber-700 hover:opacity-100 focus-visible:ring-amber-500"
                : ""
          }`}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
