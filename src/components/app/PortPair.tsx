import { ArrowUpDown, CircleDot, MapPin } from "lucide-react";
import type { PortLocation } from "../../services/api/location";
import cn from "../../utils/cn";
import { FieldMessage } from "../field";
import PortSelect from "./PortSelect";

interface PortPairProps {
  origin: PortLocation | null;
  destination: PortLocation | null;
  onOriginChange: (location: PortLocation | null) => void;
  onDestinationChange: (location: PortLocation | null) => void;
  originError?: boolean;
  destinationError?: boolean;
  // The message under the card, for whichever end is wrong.
  error?: string;
  disabled?: boolean;
  originPlaceholder?: string;
  destinationPlaceholder?: string;
  // Ties the message to the card for screen readers; unique per page.
  id?: string;
}

// One card for a whole route: origin over destination, joined by a shipping
// lane, with a swap button between them. Each end gets the full width, so
// long port names show in full and the two ends always line up. Used by the
// freight request form and the contract rates pages.
const PortPair = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  originError,
  destinationError,
  error,
  disabled,
  originPlaceholder = "Search a city or port, e.g. Shanghai",
  destinationPlaceholder = "Search a city or port, e.g. Lagos",
  id = "route",
}: PortPairProps) => {
  const swap = () => {
    onOriginChange(destination);
    onDestinationChange(origin);
  };

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "@container rounded-xl border bg-white transition-[border-color,box-shadow] duration-150",
          originError || destinationError
            ? "border-red-400"
            : "focus-within:border-brand border-slate-200 focus-within:shadow-[0_0_0_3px_rgb(30_144_255/0.15)] hover:border-slate-300",
        )}
      >
        <PortSelect
          label="Origin port"
          kicker="From"
          end="origin"
          icon={CircleDot}
          placeholder={originPlaceholder}
          value={origin}
          onChange={onOriginChange}
          error={originError}
          disabled={disabled}
          className="rounded-t-xl"
        />
        <div className="relative ml-16 h-px bg-slate-100">
          <button
            type="button"
            onClick={swap}
            disabled={disabled || (!origin && !destination)}
            aria-label="Swap origin and destination"
            title="Swap origin and destination"
            className="hover:border-brand hover:text-brand focus-visible:ring-brand absolute top-1/2 right-12 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-slate-300"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
        <PortSelect
          label="Destination port"
          kicker="To"
          end="destination"
          icon={MapPin}
          placeholder={destinationPlaceholder}
          value={destination}
          onChange={onDestinationChange}
          error={destinationError}
          disabled={disabled}
          className="rounded-b-xl"
        />
      </div>
      <FieldMessage id={id} error={error} />
    </div>
  );
};

export default PortPair;
