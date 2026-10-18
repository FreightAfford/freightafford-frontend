import {
  AlertTriangle,
  CircleHelp,
  OctagonAlert,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import cn from "../../utils/cn";
import Button from "../Button";

export type ConfirmVariant = "primary" | "success" | "warning" | "danger";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: ReactNode;
  // Extra content under the message, such as a list of what's about to change.
  details?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  // Replaces the variant's icon in the badge and on the confirm button.
  icon?: LucideIcon;
  isLoading?: boolean;
}

const VARIANTS: Record<
  ConfirmVariant,
  { icon: LucideIcon; badge: string; button: string }
> = {
  primary: {
    icon: CircleHelp,
    badge: "bg-brand/10 text-brand ring-brand/15",
    button: "bg-brand text-white hover:bg-[#1a7fe0] hover:opacity-100",
  },
  success: {
    icon: ShieldCheck,
    badge: "bg-kelp/10 text-kelp ring-kelp/15",
    button: "bg-kelp text-white hover:bg-[#256858] hover:opacity-100",
  },
  warning: {
    icon: AlertTriangle,
    badge: "bg-ochre/15 text-[#8a5f0a] ring-ochre/25",
    button: "bg-[#b07d14] text-white hover:bg-[#946810] hover:opacity-100",
  },
  danger: {
    icon: OctagonAlert,
    badge: "bg-red-50 text-red-600 ring-red-100",
    button: "bg-red-600 text-white hover:bg-red-700 hover:opacity-100",
  },
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  icon,
  isLoading: externalLoading,
}: ConfirmationModalProps) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading ?? internalLoading;
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const messageId = useId();

  const style = VARIANTS[variant];
  const Icon = icon ?? style.icon;

  const close = () => {
    if (!isLoading) onClose();
  };

  const handleConfirm = async () => {
    try {
      if (externalLoading === undefined) setInternalLoading(true);
      await onConfirm();
    } finally {
      if (externalLoading === undefined) setInternalLoading(false);
    }
  };

  // Lock the page behind, start focus on the safe choice for destructive
  // actions, and hand focus back to whatever opened the dialog.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (variant === "danger" ? cancelRef : confirmRef).current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, [isOpen, variant]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const items = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="small-mobile:items-center small-mobile:p-6 fixed inset-0 z-[60] flex items-end justify-center p-3"
          onKeyDown={onKeyDown}
        >
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          />
          <motion.div
            ref={panelRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={messageId}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-12px_rgb(15_23_42/0.35)] ring-1 ring-slate-900/5"
          >
            <div className="small-mobile:px-6 small-mobile:pt-6 px-5 pt-5 pb-4">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
                    style.badge,
                  )}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h2
                    id={titleId}
                    className="font-display text-lg leading-snug font-bold text-slate-900"
                  >
                    {title}
                  </h2>
                  <div
                    id={messageId}
                    className="mt-1.5 text-sm leading-relaxed text-pretty text-slate-600"
                  >
                    {message}
                  </div>
                </div>
              </div>
              {details && (
                <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  {details}
                </div>
              )}
            </div>

            <div className="small-mobile:flex-row small-mobile:justify-end small-mobile:px-6 flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
              <Button
                ref={cancelRef}
                variant="outline"
                onClick={close}
                disabled={isLoading}
                className="small-mobile:h-10 small-mobile:w-auto h-11 w-full rounded-xl bg-white font-semibold text-slate-700 focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                {cancelText}
              </Button>
              <Button
                ref={confirmRef}
                icon={Icon}
                onClick={handleConfirm}
                isLoading={isLoading}
                className={cn(
                  "small-mobile:h-10 small-mobile:w-auto h-11 w-full rounded-xl font-semibold focus-visible:ring-2 focus-visible:ring-offset-2",
                  style.button,
                )}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
