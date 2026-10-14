import { Ship } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import cn from "../../../utils/cn";

type Port = { name?: string; code?: string };

const PortLabel = ({
  role,
  port,
  align,
}: {
  role: string;
  port: Port;
  align: "start" | "end";
}) => (
  <div className={align === "end" ? "min-w-0 @2xl:text-right" : "min-w-0"}>
    <p className="text-sm text-slate-400">{role}</p>
    <p className="font-display mt-0.5 text-lg leading-tight font-bold break-words text-white capitalize @xl:text-xl">
      {port.name || "Not set"}
    </p>
    {port.code && (
      <p className="mt-1 text-sm font-semibold tracking-wide text-[#8fb8e8]">
        {port.code}
      </p>
    )}
  </div>
);

// Dashes drawn as a gradient so they can drift toward the destination.
const DASHES_X =
  "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.28) 0 6px, transparent 6px 12px)";
const DASHES_Y =
  "repeating-linear-gradient(180deg, rgb(255 255 255 / 0.28) 0 6px, transparent 6px 12px)";

// The ship: rocks on the water, with a ripple spreading from it.
const ShipMarker = ({
  size,
  style,
  className,
}: {
  size: "sm" | "md";
  style: CSSProperties;
  className: string;
}) => (
  <span className={cn("absolute", className)} style={style}>
    <span className="relative flex">
      <span
        aria-hidden="true"
        className="bg-brand animate-ship-ripple absolute inset-0 rounded-full motion-reduce:hidden"
      />
      <span
        className={cn(
          "bg-brand relative flex items-center justify-center rounded-full ring-4 ring-[#0a2342]",
          size === "md" ? "h-9 w-9" : "h-7 w-7",
        )}
      >
        <Ship
          className={cn(
            "animate-ship-bob motion-reduce:animate-none",
            size === "md" ? "h-[18px] w-[18px]" : "h-3.5 w-3.5",
          )}
        />
      </span>
    </span>
  </span>
);

// The page's centrepiece: origin and destination joined by a shipping lane.
// `progress` (0 to 1) places the ship along the lane; `moving` sets the lane
// flowing while the cargo is at sea. Wide pages lay it out left to right,
// narrow ones top to bottom.
const RouteLane = ({
  origin,
  destination,
  progress = 0,
  moving = false,
  middle,
  footer,
}: {
  origin: Port;
  destination: Port;
  progress?: number;
  moving?: boolean;
  middle?: ReactNode;
  footer?: ReactNode;
}) => {
  const at = Math.min(1, Math.max(0, progress));
  // The ship marker stays clear of the port dots at either end.
  const along = (gap: number) =>
    `calc(${gap}px + (100% - ${gap * 2}px) * ${at})`;

  return (
    <section
      aria-label="Route"
      className="bg-harbour relative mb-6 overflow-hidden rounded-2xl p-5 text-white @xl:p-7"
    >
      {/* Faint swell lines, for a sense of open water. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 w-full text-white/[0.025]"
        preserveAspectRatio="none"
        viewBox="0 0 400 40"
      >
        <path
          d="M0 22 Q 25 14 50 22 T 100 22 T 150 22 T 200 22 T 250 22 T 300 22 T 350 22 T 400 22 V40 H0 Z"
          fill="currentColor"
        />
        <path
          d="M0 30 Q 25 23 50 30 T 100 30 T 150 30 T 200 30 T 250 30 T 300 30 T 350 30 T 400 30 V40 H0 Z"
          fill="currentColor"
        />
      </svg>

      <div className="@container relative">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] @2xl:items-center @2xl:gap-x-6">
          {/* Narrow: a vertical lane on the left of the two ports. */}
          <div
            aria-hidden="true"
            className="row-span-3 flex flex-col items-center py-1.5 @2xl:hidden"
          >
            <span className="h-3 w-3 shrink-0 rounded-full bg-white" />
            <span className="relative my-1 w-0.5 flex-1">
              <span
                className={cn(
                  "absolute inset-0",
                  moving && "motion-safe:animate-lane-y",
                )}
                style={{ backgroundImage: DASHES_Y }}
              />
              <span
                className="absolute inset-x-0 top-0 rounded-full bg-[#8fb8e8]"
                style={{ height: along(18) }}
              />
              <ShipMarker
                size="sm"
                className="left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ top: along(18) }}
              />
            </span>
            <span className="h-3 w-3 shrink-0 rounded-full border-2 border-white" />
          </div>

          <PortLabel role="Origin" port={origin} align="start" />

          {/* Wide: a horizontal lane between the ports. */}
          <div className="min-w-0 py-5 @2xl:py-0">
            <div
              aria-hidden="true"
              className="relative hidden h-9 items-center @2xl:flex"
            >
              <span className="h-3 w-3 shrink-0 rounded-full bg-white" />
              <span className="relative mx-1 h-0.5 flex-1">
                <span
                  className={cn(
                    "absolute inset-0",
                    moving && "motion-safe:animate-lane-x",
                  )}
                  style={{ backgroundImage: DASHES_X }}
                />
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#8fb8e8]/20 to-[#8fb8e8]"
                  style={{ width: along(20) }}
                />
                <ShipMarker
                  size="md"
                  className="top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: along(20) }}
                />
              </span>
              <span className="h-3 w-3 shrink-0 rounded-full border-2 border-white" />
            </div>
            {middle && (
              <div className="text-sm text-slate-300 @2xl:mt-3 @2xl:text-center">
                {middle}
              </div>
            )}
          </div>

          <PortLabel role="Destination" port={destination} align="end" />
        </div>

        {footer && (
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-sm text-slate-300">
            {footer}
          </div>
        )}
      </div>
    </section>
  );
};

export default RouteLane;
