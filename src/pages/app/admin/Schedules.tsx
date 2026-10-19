import { Anchor, Route, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import PointToPoint from "../../../components/app/schedule/PointToPoint";
import PortCalls from "../../../components/app/schedule/PortCalls";
import { useUrlState } from "../../../hooks/useUrlState";
import cn from "../../../utils/cn";
import { stagger } from "../../../utils/motion";

type View = "ports" | "routes";

const VIEWS: { id: View; label: string; icon: LucideIcon; blurb: string }[] = [
  {
    id: "ports",
    label: "Port calls",
    icon: Anchor,
    blurb:
      "Vessels arriving at and leaving one port, with their cargo deadlines.",
  },
  {
    id: "routes",
    label: "Point to point",
    icon: Route,
    blurb:
      "Every sailing between two ports, with transit time, stops and cargo deadlines.",
  },
];

// Sailing schedules: one category, with a tab for each way to search.
const AdminSchedules = () => {
  const { params, update } = useUrlState();
  const view: View = params.get("view") === "routes" ? "routes" : "ports";
  const current = VIEWS.find((v) => v.id === view)!;

  return (
    <>
      <motion.div {...stagger(0)} className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Sailing schedules</h1>
        <p className="mt-1 max-w-xl text-slate-500">
          Find Maersk sailings by port or by route. All times are local to each
          port.
        </p>
      </motion.div>

      <motion.div {...stagger(1)} className="mb-6">
        <div
          role="tablist"
          aria-label="Schedule type"
          className="inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-slate-100 p-1"
        >
          {VIEWS.map((v) => (
            <button
              key={v.id}
              id={`tab-${v.id}`}
              type="button"
              role="tab"
              aria-selected={v.id === view}
              aria-controls="schedule-panel"
              onClick={() => update({ view: v.id === "ports" ? "" : v.id })}
              className={cn(
                "focus-visible:ring-brand/40 flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2",
                v.id === view
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              <v.icon
                aria-hidden="true"
                className={cn(
                  "h-4 w-4",
                  v.id === view ? "text-brand" : "text-slate-400",
                )}
              />
              {v.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-500">{current.blurb}</p>
      </motion.div>

      <div id="schedule-panel" role="tabpanel" aria-labelledby={`tab-${view}`}>
        {view === "routes" ? <PointToPoint /> : <PortCalls />}
      </div>
    </>
  );
};
export default AdminSchedules;
