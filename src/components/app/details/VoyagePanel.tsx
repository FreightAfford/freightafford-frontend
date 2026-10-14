import { Anchor, Check, Copy, Ship } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import cn from "../../../utils/cn";

const day = (value?: string) =>
  value ? moment(value).format("D MMM YYYY") : undefined;

const CopyValue = ({ label, value }: { label: string; value?: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked: nothing to do, the value is still on screen.
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 py-2.5 pr-2 pl-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-500">{label}</p>
        <p
          className={cn(
            "truncate font-semibold tabular-nums",
            value ? "text-slate-900" : "font-medium text-slate-400",
          )}
          title={value}
        >
          {value || "Not assigned yet"}
        </p>
      </div>
      {value && (
        <button
          type="button"
          onClick={copy}
          aria-label={
            copied ? `${label} copied` : `Copy ${label.toLowerCase()}`
          }
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            copied
              ? "text-kelp bg-kelp/10"
              : "text-slate-400 hover:bg-white hover:text-slate-700",
          )}
        >
          {copied ? (
            <Check aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Copy aria-hidden="true" className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
};

// The carrier and vessel as three quiet zones: who is carrying it, when it
// sails and arrives, and the references people copy into emails.
const VoyagePanel = ({
  shippingLine,
  vessel,
  vesselImo,
  voyage,
  carrierRef,
  bookingNumber,
  sailingDate,
  eta,
  etaEstimated,
}: {
  shippingLine?: string;
  vessel?: string;
  vesselImo?: string;
  voyage?: string;
  carrierRef?: string;
  bookingNumber: string;
  sailingDate?: string;
  eta?: string;
  // The arrival date came from carrier tracking, not a confirmed ETA.
  etaEstimated?: boolean;
}) => {
  const days =
    sailingDate && eta
      ? Math.max(0, moment(eta).diff(moment(sailingDate), "days"))
      : undefined;

  return (
    <section
      aria-labelledby="voyage-title"
      className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 @xl:p-6"
    >
      <div className="@container">
        <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @4xl:gap-10">
          {/* Who is carrying it */}
          <div className="min-w-0">
            <h2
              id="voyage-title"
              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-500"
            >
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                <Anchor aria-hidden="true" className="text-brand h-4 w-4" />
                {shippingLine || "Carrier not assigned"}
              </span>
              {voyage && (
                <>
                  <span aria-hidden="true" className="text-slate-300">
                    /
                  </span>
                  Voyage {voyage}
                </>
              )}
            </h2>
            <p
              className={cn(
                "font-display mt-2 line-clamp-2 text-xl leading-snug font-bold break-words @xl:text-2xl",
                vessel ? "text-slate-900" : "text-slate-400",
              )}
              title={vessel}
            >
              {vessel || "Vessel to be assigned"}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Ship aria-hidden="true" className="h-4 w-4 text-slate-400" />
              {vesselImo ? `IMO ${vesselImo}` : "IMO not available"}
            </p>
          </div>

          {/* When it sails and arrives */}
          <div className="min-w-0 @4xl:border-l @4xl:border-slate-100 @4xl:pl-10">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <div>
                <p className="text-sm text-slate-500">Departs</p>
                <p
                  className={cn(
                    "mt-0.5 font-semibold whitespace-nowrap",
                    sailingDate ? "text-slate-900" : "text-slate-400",
                  )}
                >
                  {day(sailingDate) ?? "To be confirmed"}
                </p>
              </div>
              <div aria-hidden="true" className="relative flex items-center">
                <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300" />
                <span className="h-px flex-1 bg-slate-200" />
                <span className="h-2 w-2 shrink-0 rounded-full border-2 border-slate-300 bg-white" />
                {days !== undefined && (
                  <span className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white px-2 text-xs font-medium whitespace-nowrap text-slate-500">
                    {days} days
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">
                  {etaEstimated ? "Arrives (estimated)" : "Arrives"}
                </p>
                <p
                  className={cn(
                    "mt-0.5 font-semibold whitespace-nowrap",
                    !eta
                      ? "text-slate-400"
                      : etaEstimated
                        ? "text-[#9a6a0c]"
                        : "text-slate-900",
                  )}
                >
                  {day(eta) ?? "To be confirmed"}
                </p>
              </div>
            </div>
            {days !== undefined && (
              <p className="sr-only">{days} days at sea</p>
            )}
          </div>
        </div>

        {/* The references people copy into emails */}
        <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 @xl:grid-cols-2">
          <CopyValue label="Carrier booking no." value={carrierRef} />
          <CopyValue label="Our reference" value={bookingNumber} />
        </div>
      </div>
    </section>
  );
};

export default VoyagePanel;
