import { Anchor, Route, Ship, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import LockedSchedules from "../../../components/app/schedule/LockedSchedules";
import PointToPoint from "../../../components/app/schedule/PointToPoint";
import PortCalls from "../../../components/app/schedule/PortCalls";
import VesselSchedule from "../../../components/app/schedule/VesselSchedule";
import SmallLoader from "../../../components/SmallLoader";
import { useUser } from "../../../hooks/useAuthService";
import { useKycStatus } from "../../../hooks/useKycService";
import { useUrlState } from "../../../hooks/useUrlState";
import cn from "../../../utils/cn";
import { stagger } from "../../../utils/motion";

type View = "ports" | "routes" | "vessel";

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
  {
    id: "vessel",
    label: "Vessel schedule",
    icon: Ship,
    blurb:
      "Every port one vessel calls at, where it is now and the cargo deadlines ahead.",
  },
];

// Sailing schedules: one category, with a tab for each way to search. Staff
// always see it; customers once their business is verified (the API checks
// the same).
const Schedules = () => {
  const { params, update } = useUrlState();
  const current = VIEWS.find((v) => v.id === params.get("view")) ?? VIEWS[0];
  const view = current.id;

  const { user, isPending: userPending } = useUser();
  const isCustomer = user?.role === "customer";
  const { status, isPending: kycPending } = useKycStatus(isCustomer);

  // Wait to know who's looking, so a customer never sees the search first
  if (userPending || (isCustomer && kycPending))
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
        <SmallLoader /> Loading…
      </div>
    );

  // Unverified customers see what verification unlocks, with no search
  if (isCustomer && status !== "approved") return <LockedSchedules />;

  return (
    <>
      <motion.div {...stagger(0)} className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Sailing schedules</h1>
        <p className="mt-1 max-w-xl text-slate-500">
          Find Maersk sailings by port, by route or by vessel. All times are
          local to each port.
        </p>
      </motion.div>

      <motion.div {...stagger(1)} className="mb-6">
        <div
          role="tablist"
          aria-label="Schedule type"
          // Three equal tabs on small screens, so none wraps on its own
          className="small-tablet:inline-flex small-tablet:w-auto grid w-full grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1"
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
                "focus-visible:ring-brand/40 small-tablet:flex-row small-tablet:gap-2 small-tablet:px-3.5 small-tablet:text-sm flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-center text-xs leading-tight font-semibold transition-colors outline-none focus-visible:ring-2",
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
        {view === "routes" ? (
          <PointToPoint />
        ) : view === "vessel" ? (
          <VesselSchedule />
        ) : (
          <PortCalls />
        )}
      </div>
    </>
  );
};
export default Schedules;
