import { CalendarRange, Package } from "lucide-react";
import type { Rate } from "../../../services/api/rate";
import cn from "../../../utils/cn";
import {
  formatValidity,
  rateSizeLabel,
  shipmentTotals,
} from "../../../utils/rates";

const number = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });

// Sums one basis, by currency.
const byCurrency = (rate: Rate, basis: "container" | "document") => {
  const totals = new Map<string, number>();
  rate.charges
    .filter((c) => c.basis === basis)
    .forEach((c) =>
      totals.set(c.currency, (totals.get(c.currency) ?? 0) + c.amount),
    );
  return totals;
};

const CELL = "px-3 py-2 whitespace-nowrap";
const NUM = "text-right tabular-nums";

// The contract rate a freight request starts from: what it covers, then
// one row per currency with the per-container and per-document charges
// and the total for the containers entered. Currencies are never added
// together.
const RateQuoteSummary = ({
  rate,
  containers,
}: {
  rate: Rate;
  containers: number;
}) => {
  const perContainer = byCurrency(rate, "container");
  const perDocument = byCurrency(rate, "document");
  // Shipment totals give the currency order: USD first, then as they appear
  const totals = shipmentTotals(rate.charges, containers);
  const count = `${containers} ${containers === 1 ? "container" : "containers"}`;

  return (
    <div className="bg-mist/60 rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold text-slate-900">
            <Package aria-hidden="true" className="text-brand h-4 w-4" />
            {rate.commodity}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">
            {rateSizeLabel(rate.containerSize)} · {rate.origin.city} to{" "}
            {rate.destination.city}
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-slate-600 tabular-nums">
          <CalendarRange
            aria-hidden="true"
            className="h-4 w-4 text-slate-400"
          />
          Valid {formatValidity(rate.validFrom, rate.validTo)}
        </p>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[26rem] border-collapse text-sm">
          <caption className="sr-only">
            Contract rate by currency, for {count}
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <th scope="col" className={cn(CELL, "text-left font-semibold")}>
                Currency
              </th>
              <th scope="col" className={cn(CELL, NUM, "font-semibold")}>
                Per container
              </th>
              <th scope="col" className={cn(CELL, NUM, "font-semibold")}>
                Per document
              </th>
              <th scope="col" className={cn(CELL, NUM, "font-semibold")}>
                Total for {count}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {totals.map((t) => (
              <tr key={t.currency}>
                <th
                  scope="row"
                  className={cn(CELL, "text-left font-semibold text-slate-900")}
                >
                  {t.currency}
                </th>
                <td className={cn(CELL, NUM, "text-slate-700")}>
                  {perContainer.has(t.currency) ? (
                    number(perContainer.get(t.currency)!)
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className={cn(CELL, NUM, "text-slate-700")}>
                  {perDocument.has(t.currency) ? (
                    number(perDocument.get(t.currency)!)
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className={cn(CELL, NUM, "font-bold text-slate-900")}>
                  {number(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Each currency is billed separately. Floating charges can change before
        your cargo ships, and our team confirms the final price.
      </p>
    </div>
  );
};

export default RateQuoteSummary;
