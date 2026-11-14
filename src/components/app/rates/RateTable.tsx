import { PAY_TERMS } from "../../../data/rates";
import type { Rate } from "../../../services/api/rate";
import cn from "../../../utils/cn";
import {
  chargeQuantity,
  chargesByStage,
  shipmentTotals,
} from "../../../utils/rates";

const COLUMNS = [
  "Basis",
  "Payment",
  "Quantity",
  "Currency",
  "Unit price",
  "Total price",
];
// Unit and total price line up on the right.
const NUMERIC_FROM = 4;

const payLabel = (term: string) =>
  PAY_TERMS.find((p) => p.value === term)?.label ?? term;

const number = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });

const CELL = "px-4 py-3 whitespace-nowrap @2xl:px-5";
const NUMERIC = "text-right tabular-nums";
// The charge column stays put while the figures scroll sideways on phones.
const PIN = "sticky left-0 z-10";

interface RateTableProps {
  rate: Rate;
  // How many containers the customer is pricing.
  containers: number;
}

// One rate laid out like a Maersk quote: a section per charge type, each
// charge with its basis, who pays, quantity, currency, unit and total
// price, then a total for each currency the shipment is billed in.
const RateTable = ({ rate, containers }: RateTableProps) => {
  const sections = chargesByStage(rate.charges);
  const totals = shipmentTotals(rate.charges, containers);

  return (
    <div className="@container overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <caption className="sr-only">
            Charges for {containers} × {rate.containerSize}
          </caption>
          {sections.map(({ stage, label, charges }) => (
            // A table has one thead, so each section's heading row opens
            // its own tbody.
            <tbody key={stage} className="divide-y divide-slate-100">
              <tr className="border-y border-slate-200">
                <th
                  scope="colgroup"
                  className={cn(
                    CELL,
                    PIN,
                    "min-w-44 bg-[#e7ebf0] text-left font-bold text-slate-900 @2xl:w-[34%]",
                  )}
                >
                  {label}
                </th>
                {COLUMNS.map((col, i) => (
                  <th
                    key={col}
                    scope="col"
                    className={cn(
                      CELL,
                      "bg-slate-50 font-semibold text-slate-700",
                      i >= NUMERIC_FROM ? NUMERIC : "text-left",
                    )}
                  >
                    {col}
                  </th>
                ))}
              </tr>
              {charges.map((c) => {
                const qty = chargeQuantity(c, containers);
                return (
                  <tr key={`${c.code}-${c.currency}`}>
                    <th
                      scope="row"
                      className={cn(
                        CELL,
                        PIN,
                        "min-w-44 bg-white text-left font-normal whitespace-normal text-slate-800",
                      )}
                    >
                      {c.name}
                      {c.structure === "floating" && (
                        <span
                          title="This charge can change before your cargo ships"
                          className="bg-ochre/15 ml-2 inline-block rounded px-1.5 py-0.5 align-middle text-[10px] font-semibold text-[#9a6a0c]"
                        >
                          Floating
                        </span>
                      )}
                    </th>
                    <td className={cn(CELL, "text-slate-600")}>
                      {c.basis === "document" ? "Document" : "Container"}
                    </td>
                    <td className={cn(CELL, "text-slate-600")}>
                      {payLabel(c.payTerm)}
                    </td>
                    <td className={cn(CELL, "text-slate-600 tabular-nums")}>
                      {qty}
                    </td>
                    <td className={cn(CELL, "text-slate-600")}>{c.currency}</td>
                    <td className={cn(CELL, NUMERIC, "text-slate-600")}>
                      {number(c.amount)}
                    </td>
                    <td
                      className={cn(
                        CELL,
                        NUMERIC,
                        "font-medium text-slate-900",
                      )}
                    >
                      {number(c.amount * qty)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ))}
          {/* Charges are billed in their own currency, so there's a total
              for each one rather than a converted grand total. */}
          <tfoot className="border-t-2 border-slate-200 bg-slate-50">
            {totals.map((t, i) => (
              <tr
                key={t.currency}
                className={cn(i > 0 && "border-t border-slate-200")}
              >
                <th
                  scope="row"
                  className={cn(
                    CELL,
                    PIN,
                    "bg-slate-50 text-left font-bold text-slate-900",
                  )}
                >
                  Total in {t.currency}
                </th>
                <td
                  colSpan={COLUMNS.length}
                  className={cn(
                    CELL,
                    NUMERIC,
                    "font-display text-base font-bold text-slate-900",
                  )}
                >
                  {t.currency} {number(t.amount)}
                </td>
              </tr>
            ))}
          </tfoot>
        </table>
      </div>
      <p className="border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500 @2xl:px-5">
        For {containers} {containers === 1 ? "container" : "containers"} and one
        set of documents. Each charge is billed in the currency shown, so
        there's a total for each currency. Floating charges can change before
        your cargo ships.
      </p>
    </div>
  );
};

export default RateTable;
