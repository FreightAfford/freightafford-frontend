import { RotateCw, Search, ShieldCheck, X } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Table, TableCell, TableRow } from "../../../../components/app/Table";
import Button from "../../../../components/Button";
import EmptyState from "../../../../components/EmptyState";
import SmallLoader from "../../../../components/SmallLoader";
import KycStatusBadge from "../../../../components/kyc/KycStatusBadge";
import { useKycReviews } from "../../../../hooks/useKycAdminService";
import type { KycQueue } from "../../../../services/api/kycAdmin";
import cn from "../../../../utils/cn";

const QUEUES: { id: KycQueue; label: string; empty: string }[] = [
  {
    id: "awaiting",
    label: "Awaiting review",
    empty: "No businesses are waiting. New submissions appear here.",
  },
  {
    id: "changes_requested",
    label: "Changes requested",
    empty: "No businesses have been asked for changes.",
  },
  { id: "approved", label: "Verified", empty: "No verified businesses yet." },
  { id: "rejected", label: "Rejected", empty: "No rejected businesses." },
];

const ACCOUNT_TYPES = { export_agent: "Export agent", exporter: "Exporter" };

const isQueue = (value: string | null): value is KycQueue =>
  QUEUES.some((queue) => queue.id === value);

// The queue of business verifications for our team. Awaiting review is
// sorted oldest first, so the business that's waited longest is on top.
const AdminVerifications = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("queue");
  const queue: KycQueue = isQueue(requested) ? requested : "awaiting";
  const search = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(search);

  const { applications, counts, isPending, error, refetch } = useKycReviews(
    queue,
    search,
  );

  const setParams = (next: { queue?: KycQueue; q?: string }) => {
    const params: Record<string, string> = {};
    const nextQueue = next.queue ?? queue;
    const nextSearch = next.q ?? search;
    if (nextQueue !== "awaiting") params.queue = nextQueue;
    if (nextSearch) params.q = nextSearch;
    setSearchParams(params);
  };

  if (error)
    return (
      <EmptyState
        icon={<X className="h-10 w-10 text-red-500" />}
        title="Couldn't load verifications"
        description={error.message || "Something went wrong. Try again."}
        action={
          <Button icon={RotateCw} variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        }
      />
    );

  const current = QUEUES.find((item) => item.id === queue)!;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Business verifications
        </h1>
        <p className="mt-1 text-slate-500">
          Check each business's details and documents before it can book.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="max-tablet:flex-col max-tablet:items-stretch flex items-center justify-between gap-4 border-b border-slate-100 p-4">
          <div
            role="tablist"
            aria-label="Verification queues"
            className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1"
          >
            {QUEUES.map((item) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={item.id === queue}
                onClick={() => setParams({ queue: item.id })}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                  item.id === queue
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                {item.label}
                {counts && counts[item.id] > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs",
                      item.id === "awaiting"
                        ? "bg-brand text-white"
                        : "bg-slate-200 text-slate-600",
                    )}
                  >
                    {counts[item.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              setParams({ q: searchInput.trim() });
            }}
            className="max-tablet:w-full group relative w-72"
          >
            <Search
              aria-hidden="true"
              className="group-focus-within:text-brand pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                if (!event.target.value) setParams({ q: "" });
              }}
              placeholder="Search business, applicant or CAC"
              aria-label="Search verifications"
              className="focus:border-brand h-11 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-11 text-[0.9375rem] text-slate-900 transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-slate-400 hover:border-slate-300 focus:shadow-[0_0_0_3px_rgb(30_144_255/0.15)]"
            />
          </form>
        </div>

        {isPending ? (
          <div className="p-10">
            <SmallLoader />
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="text-brand h-10 w-10" />}
            title={search ? "No matches" : "Nothing here"}
            description={
              search
                ? `Nothing in this list matches "${search}".`
                : current.empty
            }
          />
        ) : (
          <Table
            className="border-0"
            headers={[
              "Business",
              "Applicant",
              "CAC number",
              "Submitted",
              "Status",
            ]}
          >
            {applications.map((application) => (
              <TableRow
                key={application.id}
                onClick={() =>
                  navigate(`/app/admin/verifications/${application.id}`)
                }
              >
                <TableCell>
                  <p className="text-brand font-semibold">
                    {application.business.legalName || "Unnamed business"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {ACCOUNT_TYPES[application.accountType]}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-slate-900">
                    {application.applicant.fullname}
                  </p>
                  <p className="text-sm text-slate-500">
                    {application.applicant.email}
                  </p>
                </TableCell>
                <TableCell>
                  {application.business.cacType}{" "}
                  {application.business.cacNumber}
                </TableCell>
                <TableCell>
                  <span title={moment(application.submittedAt).format("LLL")}>
                    {moment(application.submittedAt).fromNow()}
                  </span>
                </TableCell>
                <TableCell>
                  <KycStatusBadge status={application.status} />
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
    </>
  );
};

export default AdminVerifications;
