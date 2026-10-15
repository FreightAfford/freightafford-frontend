import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  Flag,
  MessageSquareWarning,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { Link, useParams } from "react-router";
import Button from "../../../../components/Button";
import EmptyState from "../../../../components/EmptyState";
import SmallLoader from "../../../../components/SmallLoader";
import ApplicationSummary from "../../../../components/kyc/ApplicationSummary";
import KycStatusBadge from "../../../../components/kyc/KycStatusBadge";
import { useConfirm } from "../../../../hooks/useConfirm";
import {
  useKycReview,
  useReviewKyc,
} from "../../../../hooks/useKycAdminService";
import type { KycReviewItem } from "../../../../services/api/kycAdmin";
import cn from "../../../../utils/cn";
import { fieldLabel } from "../../../../utils/kycFields";

const ACCOUNT_TYPES = { export_agent: "Export agent", exporter: "Exporter" };

const textareaClass =
  "focus:border-brand w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 leading-relaxed text-slate-900 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:shadow-[0_0_0_3px_rgb(30_144_255/0.15)]";

// The outcome of a review that's already been decided.
const Outcome = ({ application }: { application: KycReviewItem }) => {
  const when = application.reviewedAt
    ? moment(application.reviewedAt).format("D MMM YYYY, h:mm a")
    : null;
  const notes = Object.entries(application.reviewNotes);

  return (
    <div className="space-y-3">
      {application.status === "approved" && (
        <p className="text-kelp flex items-center gap-2 font-semibold">
          <BadgeCheck aria-hidden="true" className="h-5 w-5" />
          Verified{when && ` on ${when}`}
        </p>
      )}
      {application.status === "rejected" && (
        <>
          <p className="flex items-center gap-2 font-semibold text-red-700">
            <XCircle aria-hidden="true" className="h-5 w-5" />
            Rejected{when && ` on ${when}`}
          </p>
          {application.rejectionReason && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {application.rejectionReason}
            </p>
          )}
        </>
      )}
      {application.status === "changes_requested" && (
        <>
          <p className="flex items-center gap-2 font-semibold text-[#8a5f0a]">
            <MessageSquareWarning aria-hidden="true" className="h-5 w-5" />
            Changes requested{when && ` on ${when}`}
          </p>
          <ul className="space-y-2">
            {notes.map(([path, note]) => (
              <li key={path} className="bg-ochre/10 rounded-lg p-3 text-sm">
                <p className="font-semibold text-slate-900">
                  {fieldLabel(path, application)}
                </p>
                <p className="mt-0.5 text-slate-700">{note}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-500">
            It comes back to Awaiting review when the business submits again.
          </p>
        </>
      )}
    </div>
  );
};

const VerificationReview = () => {
  const { id = "" } = useParams();
  const { application, isPending, error } = useKycReview(id);
  const { review, isPending: isDeciding } = useReviewKyc();
  const { confirm, ConfirmDialog } = useConfirm();
  const [flags, setFlags] = useState<Record<string, string>>({});
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  if (isPending)
    return (
      <div className="py-24">
        <SmallLoader />
      </div>
    );

  if (error || !application)
    return (
      <EmptyState
        icon={<X className="h-10 w-10 text-red-500" />}
        title="Couldn't open this application"
        description={error?.message || "It may have been removed."}
        action={
          <Link to="/app/admin/verifications">
            <Button icon={ArrowLeft} variant="outline">
              Back to verifications
            </Button>
          </Link>
        }
      />
    );

  const reviewable =
    application.status === "submitted" || application.status === "in_review";
  const flagged = Object.keys(flags);
  const emptyNote = flagged.some((path) => !flags[path].trim());

  const toggleFlag = (path: string) =>
    setFlags((current) => {
      if (path in current) {
        const rest = { ...current };
        delete rest[path];
        return rest;
      }
      return { ...current, [path]: "" };
    });

  const approve = async () => {
    const ok = await confirm({
      title: "Verify this business?",
      message: `${application.business.legalName} will see live tracking on their bookings straight away.`,
      confirmText: "Verify business",
      cancelText: "Keep reviewing",
    });
    if (ok) review({ id, decision: "approve" });
  };

  const requestChanges = () =>
    review(
      {
        id,
        decision: "changes",
        notes: Object.fromEntries(
          flagged.map((path) => [path, flags[path].trim()]),
        ),
      },
      { onSuccess: () => setFlags({}) },
    );

  const reject = async () => {
    const ok = await confirm({
      title: "Reject this business?",
      message:
        "They won't be able to book, and they'll see your reason. Use Request changes instead if they can fix the problem.",
      confirmText: "Reject",
      cancelText: "Keep reviewing",
      variant: "danger",
    });
    if (ok)
      review(
        { id, decision: "reject", reason: reason.trim() },
        { onSuccess: () => setRejecting(false) },
      );
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to="/app/admin/verifications"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        All verifications
      </Link>

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            {application.business.legalName || "Unnamed business"}
          </h1>
          <KycStatusBadge status={application.status} />
        </div>
        <p className="mt-1 text-slate-500">
          {ACCOUNT_TYPES[application.accountType]}, submitted{" "}
          {moment(application.submittedAt).fromNow()} by{" "}
          <span className="font-medium text-slate-700">
            {application.applicant.fullname}
          </span>{" "}
          ({application.applicant.email})
        </p>
      </div>

      <div className="max-tablet:grid-cols-1 grid grid-cols-[minmax(0,1fr)_22rem] items-start gap-6">
        <ApplicationSummary
          application={application}
          notes={reviewable ? flags : application.reviewNotes}
          rowAction={
            reviewable
              ? (path) => {
                  const isFlagged = path in flags;
                  return (
                    <button
                      type="button"
                      onClick={() => toggleFlag(path)}
                      aria-pressed={isFlagged}
                      aria-label={`${isFlagged ? "Remove flag from" : "Flag"} ${fieldLabel(path, application)}`}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors",
                        isFlagged
                          ? "bg-ochre/20 hover:bg-ochre/30 text-[#8a5f0a]"
                          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
                      )}
                    >
                      <Flag
                        aria-hidden="true"
                        className={cn(
                          "h-3.5 w-3.5",
                          isFlagged && "fill-current",
                        )}
                      />
                      {isFlagged ? "Flagged" : "Flag"}
                    </button>
                  );
                }
              : undefined
          }
        />

        <aside className="tablet:sticky tablet:top-24 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Decision
          </h2>

          {!reviewable ? (
            <div className="mt-4">
              <Outcome application={application} />
            </div>
          ) : (
            <div className="mt-4 space-y-5">
              {flagged.length === 0 ? (
                <p className="text-sm leading-relaxed text-slate-500">
                  Check each detail against its document. If something needs
                  fixing, flag it and say what's wrong; the business sees your
                  note next to that field.
                </p>
              ) : (
                <ul className="space-y-3">
                  {flagged.map((path) => (
                    <li key={path}>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <label
                          htmlFor={`note-${path}`}
                          className="font-display text-sm font-semibold text-slate-800"
                        >
                          {fieldLabel(path, application)}
                        </label>
                        <button
                          type="button"
                          onClick={() => toggleFlag(path)}
                          aria-label={`Remove flag from ${fieldLabel(path, application)}`}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <X aria-hidden="true" className="h-4 w-4" />
                        </button>
                      </div>
                      <textarea
                        id={`note-${path}`}
                        rows={2}
                        autoFocus={!flags[path]}
                        value={flags[path]}
                        onChange={(event) =>
                          setFlags((current) => ({
                            ...current,
                            [path]: event.target.value,
                          }))
                        }
                        placeholder="What needs to change?"
                        className={textareaClass}
                      />
                    </li>
                  ))}
                </ul>
              )}

              <div className="space-y-2">
                {flagged.length === 0 ? (
                  <Button
                    icon={ShieldCheck}
                    onClick={approve}
                    disabled={isDeciding || rejecting}
                    className="h-11 w-full rounded-xl font-semibold"
                  >
                    Verify business
                  </Button>
                ) : (
                  <>
                    <Button
                      icon={MessageSquareWarning}
                      onClick={requestChanges}
                      disabled={isDeciding || emptyNote}
                      isLoading={isDeciding}
                      className="h-11 w-full rounded-xl font-semibold"
                    >
                      Request changes ({flagged.length})
                    </Button>
                    {emptyNote && (
                      <p className="text-center text-sm text-slate-500">
                        Add a note to every flagged field.
                      </p>
                    )}
                  </>
                )}

                {!rejecting ? (
                  <Button
                    icon={Ban}
                    variant="outline"
                    onClick={() => setRejecting(true)}
                    disabled={isDeciding}
                    className="h-11 w-full rounded-xl font-semibold text-red-700 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                ) : (
                  <div className="space-y-2 rounded-xl border border-red-200 bg-red-50/60 p-3">
                    <label
                      htmlFor="reject-reason"
                      className="font-display block text-sm font-semibold text-slate-800"
                    >
                      Reason for rejecting
                    </label>
                    <textarea
                      id="reject-reason"
                      rows={3}
                      autoFocus
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="The business will see this."
                      className={textareaClass}
                    />
                    <div className="flex gap-2">
                      <Button
                        icon={X}
                        variant="outline"
                        onClick={() => setRejecting(false)}
                        className="h-10 flex-1 rounded-lg bg-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        icon={Ban}
                        onClick={reject}
                        disabled={!reason.trim() || isDeciding}
                        isLoading={isDeciding}
                        className="h-10 flex-1 rounded-lg bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
      {ConfirmDialog}
    </div>
  );
};

export default VerificationReview;
