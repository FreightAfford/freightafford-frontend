import type { KycStatus } from "../../types/kyc";
import cn from "../../utils/cn";

const STYLES: Record<KycStatus, { label: string; className: string }> = {
  not_started: {
    label: "Not started",
    className: "bg-slate-100 text-slate-600",
  },
  draft: { label: "In progress", className: "bg-slate-100 text-slate-600" },
  submitted: { label: "New", className: "bg-brand/10 text-[#136fd0]" },
  in_review: { label: "In review", className: "bg-ochre/15 text-[#8a5f0a]" },
  changes_requested: {
    label: "Changes requested",
    className: "bg-ochre/15 text-[#8a5f0a]",
  },
  approved: { label: "Verified", className: "bg-kelp/10 text-kelp" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700" },
};

const KycStatusBadge = ({
  status,
  className,
}: {
  status: KycStatus;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap",
      STYLES[status].className,
      className,
    )}
  >
    {STYLES[status].label}
  </span>
);

export default KycStatusBadge;
