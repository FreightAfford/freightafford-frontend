import { Inbox, Plus, Tags, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import RateFormModal, {
  type RateFormSource,
} from "../../../components/app/rates/admin/RateFormModal";
import RateRequestsTable from "../../../components/app/rates/admin/RateRequestsTable";
import RatesTable from "../../../components/app/rates/admin/RatesTable";
import SampleDataBanner from "../../../components/app/rates/SampleDataBanner";
import Button from "../../../components/Button";
import { useGetRateRequests } from "../../../hooks/useRateService";
import type { RateRequest } from "../../../services/api/rate";
import cn from "../../../utils/cn";
import { stagger } from "../../../utils/motion";

type Tab = "rates" | "requests";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "rates", label: "Rates", icon: Tags },
  { id: "requests", label: "Rate requests", icon: Inbox },
];

// Each tab keeps its own table settings in the URL; switching tabs drops them.
const TABLE_KEYS = ["page", "search", "sort", "status", "containerSize"];

// Admin: FreightAfford's Maersk contract rates, and what customers asked for.
const AdminRates = () => {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get("tab") === "requests" ? "requests" : "rates";

  const [form, setForm] = useState<{
    source: RateFormSource;
    open: boolean;
    key: number;
  }>({ source: { kind: "add" }, open: false, key: 0 });

  // Open requests, for the count on the tab. Saving a rate refreshes it.
  const { open: openRequests } = useGetRateRequests({
    status: "open",
    limit: 1,
  });

  // A rate for what the customer asked: their lane, commodity and size.
  const addRateFor = (request: RateRequest) =>
    openForm({
      kind: "add",
      request,
      initial: {
        origin: request.origin,
        destination: request.destination,
        commodity: request.commodity,
        containerSize: request.containerSize,
      },
    });

  const openForm = (source: RateFormSource) =>
    setForm((f) => ({ source, open: true, key: f.key + 1 }));
  const closeForm = () => setForm((f) => ({ ...f, open: false }));

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    const merged = new URLSearchParams(params);
    TABLE_KEYS.forEach((key) => merged.delete(key));
    if (next === "rates") merged.delete("tab");
    else merged.set("tab", next);
    setParams(merged, { replace: true });
  };

  return (
    <>
      <motion.div
        {...stagger(0)}
        className="mb-5 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contract rates</h1>
          <p className="mt-1 max-w-xl text-slate-500">
            Our Maersk contract rates. Verified customers can look them up and
            request a quote at a rate.
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => openForm({ kind: "add" })}
          className="rounded-xl"
        >
          Add rate
        </Button>
      </motion.div>

      <motion.div {...stagger(1)}>
        <SampleDataBanner />
      </motion.div>

      <motion.div {...stagger(2)} className="mb-5">
        <div
          role="tablist"
          aria-label="Rates"
          className="inline-flex gap-1 rounded-xl bg-slate-100 p-1"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={t.id === tab}
              aria-controls="rates-panel"
              onClick={() => switchTab(t.id)}
              className={cn(
                "focus-visible:ring-brand/40 flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2",
                t.id === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              <t.icon
                aria-hidden="true"
                className={cn(
                  "h-4 w-4",
                  t.id === tab ? "text-brand" : "text-slate-400",
                )}
              />
              {t.label}
              {t.id === "requests" && openRequests > 0 && (
                <span
                  className="bg-brand min-w-5 rounded-full px-1.5 text-center text-xs leading-5 font-bold text-white tabular-nums"
                  aria-label={`${openRequests} open`}
                >
                  {openRequests}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        {...stagger(3)}
        id="rates-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
      >
        {tab === "rates" ? (
          <RatesTable
            onEdit={(rate) => openForm({ kind: "edit", rate })}
            onDuplicate={(rate) => openForm({ kind: "duplicate", rate })}
          />
        ) : (
          <RateRequestsTable onAddRate={addRateFor} />
        )}
      </motion.div>

      <RateFormModal
        key={form.key}
        isOpen={form.open}
        source={form.source}
        onClose={closeForm}
      />
    </>
  );
};

export default AdminRates;
