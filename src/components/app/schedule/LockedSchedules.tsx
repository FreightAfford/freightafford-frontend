import LockedFeature, { LockedBadge } from "../LockedFeature";

const BENEFITS = [
  "Live Maersk sailings, not last month's PDF",
  "Know which sailings still take cargo before you book",
  "Every deadline in the port's own time",
];

// A real route, dimmed, so customers see what's waiting for them
const RoutePreview = () => (
  <div
    aria-hidden="true"
    className="relative rounded-xl border border-slate-200 bg-slate-50 p-4 select-none"
  >
    <div className="pointer-events-none opacity-60 blur-[0.5px]">
      <div className="flex items-start justify-between gap-3 text-xs text-slate-500">
        <span>Departure</span>
        <span>Transit time</span>
      </div>
      <div className="mt-0.5 flex items-start justify-between gap-3">
        <span className="font-display font-bold text-slate-900">
          20 Oct 2026
        </span>
        <span className="font-display font-bold text-slate-900">
          33 days 4 hours
        </span>
      </div>
      <div className="relative mt-5 mb-1 flex items-center justify-between">
        <span
          className="absolute inset-x-1.5 top-1/2 border-t-2 border-dashed border-slate-300"
          aria-hidden="true"
        />
        <span className="bg-brand relative h-3 w-3 rounded-full ring-4 ring-slate-50" />
        <span className="relative h-3 w-3 rounded-full border-2 border-slate-400 bg-white" />
        <span className="bg-harbour relative h-3 w-3 rounded-full ring-4 ring-slate-50" />
      </div>
      <div className="flex items-start justify-between gap-2 text-xs text-slate-600">
        <span>Shanghai</span>
        <span className="text-center">Tanjung Pelepas</span>
        <span className="text-right">Apapa</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {["Container gate-in", "Shipping instructions"].map((label) => (
          <span
            key={label}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-600"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
    <LockedBadge />
  </div>
);

// What an unverified customer sees on Sailing schedules.
const LockedSchedules = () => (
  <LockedFeature
    title="Sailing schedules"
    description="Verify your business to get access to port schedules, point to point routes and vessel schedules."
    reviewingDescription="Your business verification is being reviewed. You'll get access to port schedules, point to point routes and vessel schedules once it's approved."
    headline="See every Maersk sailing before you book"
    benefits={BENEFITS}
    preview={<RoutePreview />}
  />
);

export default LockedSchedules;
