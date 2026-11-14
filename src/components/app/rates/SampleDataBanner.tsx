import { FlaskConical } from "lucide-react";
import { RATES_MOCK } from "../../../services/api/rate";

// Shown while the rates pages run on made-up sample data, so nobody takes
// a test price for a real one. Disappears once the backend is connected.
const SampleDataBanner = () =>
  RATES_MOCK ? (
    <div
      role="note"
      className="border-ochre/40 bg-ochre/10 mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm text-[#7a5408]"
    >
      <FlaskConical aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <span className="font-semibold">Sample data.</span> These rates are made
        up for testing and reset when the page reloads. Real contract rates will
        show here once the rates backend is connected.
      </p>
    </div>
  ) : null;

export default SampleDataBanner;
