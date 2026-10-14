import { CalendarClock, Container, Package, Weight } from "lucide-react";
import moment from "moment";
import type { ReactNode } from "react";
import { containersLabel } from "../../../utils/format";
import { Panel } from "./DetailParts";

type Cargo = {
  commodity?: string;
  commodityCode?: string;
  containerQuantity?: number;
  containerSize?: string;
  cargoWeight?: number;
  cargoReadyDate?: string;
};

// Cargo at full page width: commodity names can be very long, so the
// commodity leads on its own line and the rest sits in one row beneath.
// Extra sections (notes, container numbers) go in as children.
const CargoPanel = ({
  cargo,
  children,
}: {
  cargo: Cargo;
  children?: ReactNode;
}) => {
  const facts = [
    {
      icon: Container,
      label: "Containers",
      value: containersLabel(cargo.containerQuantity, cargo.containerSize),
    },
    {
      icon: Weight,
      label: "Cargo weight",
      value: `${(cargo.cargoWeight ?? 0).toLocaleString()} kg`,
    },
    {
      icon: CalendarClock,
      label: "Cargo ready",
      value: cargo.cargoReadyDate
        ? moment(cargo.cargoReadyDate).format("D MMM YYYY")
        : "Not set",
    },
  ];

  return (
    <Panel title="Cargo" icon={Package} className="mb-6">
      <div className="@container">
        <p className="text-sm text-slate-500">Commodity</p>
        <p className="font-display mt-1 text-lg leading-snug font-bold break-words text-slate-900 capitalize @xl:text-xl">
          {cargo.commodity || "Not set"}
        </p>
        {cargo.commodityCode && (
          <p className="mt-1 text-sm text-slate-500">
            Code {cargo.commodityCode}
          </p>
        )}

        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-slate-100 pt-5 @md:grid-cols-3">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <dt className="text-sm text-slate-500">{label}</dt>
                <dd className="font-semibold text-slate-900">{value}</dd>
              </div>
            </div>
          ))}
        </dl>

        {children}
      </div>
    </Panel>
  );
};

export default CargoPanel;
