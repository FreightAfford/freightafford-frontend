import {
  ArrowLeft,
  CalendarRange,
  CalendarX2,
  Container,
  Copy,
  History,
  Info,
  Package,
  Pencil,
  Repeat,
  Timer,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import moment from "moment";
import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import RateFormModal, {
  type RateFormSource,
} from "../../../components/app/rates/admin/RateFormModal";
import RateStatusBadge from "../../../components/app/rates/admin/RateStatusBadge";
import RateFreeTime from "../../../components/app/rates/RateFreeTime";
import RateTable from "../../../components/app/rates/RateTable";
import SampleDataBanner from "../../../components/app/rates/SampleDataBanner";
import Button from "../../../components/Button";
import ErrorState from "../../../components/ErrorState";
import SmallLoader from "../../../components/SmallLoader";
import { useRateActions } from "../../../hooks/useRateActions";
import { useGetRate } from "../../../hooks/useRateService";
import {
  formatTransit,
  formatValidity,
  rateSizeLabel,
  rateStatus,
} from "../../../utils/rates";
import { stagger } from "../../../utils/motion";

const LIST = "/app/admin/rates";

// One labelled fact about the rate.
const Fact = ({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) => (
  <div className="flex min-w-0 items-start gap-2.5">
    <Icon
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
    />
    <div className="min-w-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-sm font-semibold break-words text-slate-900">
        {children}
      </dd>
    </div>
  </div>
);

// Admin: one contract rate in full, laid out like the Maersk quote, with
// the same actions as the list's row menu.
const AdminRateDetails = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Back to the list as it was left: page, search and filters.
  const back: string =
    (location.state as { back?: string } | null)?.back ?? LIST;

  const { rate, isPending, error, refetch } = useGetRate(id);
  const { confirmExpire, confirmDelete, ConfirmDialog } = useRateActions();

  const [form, setForm] = useState<{
    source: RateFormSource;
    open: boolean;
    key: number;
  } | null>(null);
  const openForm = (source: RateFormSource) =>
    setForm((f) => ({ source, open: true, key: (f?.key ?? 0) + 1 }));

  const backLink = (
    <Link
      to={back}
      className="text-brand focus-visible:ring-brand/40 -ml-1 inline-flex items-center gap-1.5 rounded-md px-1 text-sm font-semibold outline-none hover:underline focus-visible:ring-2"
    >
      <ArrowLeft aria-hidden="true" className="h-4 w-4" />
      All rates
    </Link>
  );

  if (isPending)
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
        <SmallLoader /> Loading…
      </div>
    );

  if (error || !rate)
    return (
      <>
        <div className="mb-4">{backLink}</div>
        <ErrorState resource="rate" error={error} onRetry={() => refetch()} />
      </>
    );

  const expired = rateStatus(rate) === "expired";

  return (
    <div className="@container space-y-5 pb-20">
      <motion.div {...stagger(0)}>
        {backLink}
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="text-2xl font-bold text-slate-900">
                {rate.origin.city} → {rate.destination.city}
              </h1>
              <RateStatusBadge rate={rate} />
            </div>
            <p className="mt-1 text-slate-500">
              {rate.origin.code} → {rate.destination.code} · {rate.commodity} ·{" "}
              {rateSizeLabel(rate.containerSize)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              icon={Pencil}
              onClick={() => openForm({ kind: "edit", rate })}
              className="rounded-xl bg-white"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              icon={Copy}
              onClick={() => openForm({ kind: "duplicate", rate })}
              className="rounded-xl bg-white"
            >
              Duplicate
            </Button>
            {!expired && (
              <Button
                variant="outline"
                icon={CalendarX2}
                onClick={() => confirmExpire(rate)}
                className="rounded-xl bg-white"
              >
                Expire now
              </Button>
            )}
            <Button
              variant="outline"
              icon={Trash2}
              onClick={() =>
                confirmDelete(rate, () => navigate(back, { replace: true }))
              }
              className="rounded-xl border-red-200 bg-white text-red-600 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div {...stagger(1)}>
        <SampleDataBanner />
      </motion.div>

      <motion.div {...stagger(2)}>
        <dl className="grid gap-x-6 gap-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm @xl:grid-cols-2 @3xl:px-5 @4xl:grid-cols-3">
          <Fact icon={CalendarRange} label="Valid">
            <span className="tabular-nums">
              {formatValidity(rate.validFrom, rate.validTo)}
            </span>
          </Fact>
          <Fact icon={Package} label="Commodity">
            {rate.commodity}
            {rate.commodityCode && (
              <span className="ml-1.5 text-xs font-medium text-slate-400">
                {rate.commodityCode}
              </span>
            )}
          </Fact>
          <Fact icon={Container} label="Container size">
            {rate.containerSize} ({rateSizeLabel(rate.containerSize)})
          </Fact>
          <Fact icon={Repeat} label="Service mode">
            {rate.serviceMode || "—"}
          </Fact>
          <Fact icon={Timer} label="Transit time">
            {formatTransit(rate.transitHours) || "—"}
          </Fact>
          <Fact icon={History} label="Last updated">
            {moment(rate.updatedAt).format("D MMM YYYY, HH:mm")}
            {rate.updatedBy && (
              <span className="block text-xs font-normal text-slate-500">
                by {rate.updatedBy}
              </span>
            )}
          </Fact>
        </dl>
      </motion.div>

      <motion.section {...stagger(3)} aria-labelledby="charges-title">
        <h2
          id="charges-title"
          className="mb-1 text-lg font-bold text-slate-900"
        >
          Charges
        </h2>
        <p className="mb-3 text-sm text-slate-500">
          For one container, with document charges billed once per bill of
          lading.
        </p>
        <RateTable rate={rate} containers={1} />
      </motion.section>

      {rate.freeTime?.length ? (
        <motion.div {...stagger(4)}>
          <RateFreeTime
            freeTime={rate.freeTime}
            place={rate.destination.city}
          />
        </motion.div>
      ) : null}

      {rate.remarks && (
        <motion.p
          {...stagger(5)}
          className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
        >
          <Info
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
          />
          {rate.remarks}
        </motion.p>
      )}

      {form && (
        <RateFormModal
          key={form.key}
          isOpen={form.open}
          source={form.source}
          onClose={() => setForm((f) => f && { ...f, open: false })}
        />
      )}
      {ConfirmDialog}
    </div>
  );
};

export default AdminRateDetails;
