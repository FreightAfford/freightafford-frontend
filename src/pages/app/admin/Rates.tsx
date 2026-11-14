import { Inbox, Plus, Tags, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import RateFormModal, {
  type RateFormSource,
} from "../../../components/app/rates/admin/RateFormModal";
import RatesTable from "../../../components/app/rates/admin/RatesTable";
import SampleDataBanner from "../../../components/app/rates/SampleDataBanner";
import Button from "../../../components/Button";
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
          // Step 5 of the contract rates checklist fills this tab.
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Rate requests from customers will be listed here.
          </div>
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
