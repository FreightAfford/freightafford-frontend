import { Container } from "lucide-react";
import LockedFeature, { LockedBadge } from "../LockedFeature";

const BENEFITS = [
  "Our Maersk contract rates, ready when you need them",
  "Every charge listed: freight, origin and destination",
  "Ask for any lane we haven't priced yet",
];

// A sample rate card, dimmed, so customers see what's waiting for them
const RatePreview = () => (
  <div
    aria-hidden="true"
    className="relative rounded-xl border border-slate-200 bg-slate-50 p-4 select-none"
  >
    <div className="pointer-events-none opacity-60 blur-[0.5px]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5">
          <span className="bg-brand/10 text-brand flex h-9 w-9 items-center justify-center rounded-lg">
            <Container className="h-4 w-4" />
          </span>
          <span className="font-display leading-tight font-bold text-slate-900">
            40ft
            <span className="block text-xs font-normal text-slate-500">
              High Cube
            </span>
          </span>
        </span>
        <span className="bg-kelp/10 text-kelp rounded-full px-2.5 py-1 text-xs font-semibold">
          Valid today
        </span>
      </div>
      <p className="mt-4 text-xs text-slate-500">Per container</p>
      <p className="font-display text-xl font-bold text-slate-900">USD 2,837</p>
      <p className="text-xs font-semibold text-slate-600">+ NGN 210,000</p>
      <div className="mt-4 space-y-1.5">
        {["Basic ocean freight", "Bunker adjustment", "Terminal handling"].map(
          (label) => (
            <span
              key={label}
              className="flex justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600"
            >
              {label}
              <span className="h-2 w-12 self-center rounded bg-slate-200" />
            </span>
          ),
        )}
      </div>
    </div>
    <LockedBadge />
  </div>
);

// What an unverified customer sees on Contract rates.
const LockedRates = () => (
  <LockedFeature
    title="Contract rates"
    description="Verify your business to see our Maersk contract rates for your lanes."
    reviewingDescription="Your business verification is being reviewed. You'll see our Maersk contract rates once it's approved."
    headline="Know what a container costs before you ask"
    benefits={BENEFITS}
    preview={<RatePreview />}
  />
);

export default LockedRates;
