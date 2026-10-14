import { FileText, MessageSquareWarning } from "lucide-react";
import moment from "moment";
import type { ReactNode } from "react";
import { FormSection } from "../../pages/app/customer/verification/parts";
import {
  ID_TYPE_LABELS,
  type KycApplication,
  type KycDocument,
} from "../../types/kyc";
import cn from "../../utils/cn";
import { formatFileSize } from "../../utils/helpers";

type Section = "business" | "directors" | "authorisation";

interface SummaryProps {
  application: KycApplication;
  // Shown at the top right of each section, e.g. the customer's "Edit".
  sectionAction?: (section: Section) => ReactNode;
  // Shown at the end of each row, e.g. the reviewer's "Flag".
  rowAction?: (path: string) => ReactNode;
  // Notes to show under the rows they're about, keyed by field path.
  notes?: Record<string, string>;
}

const date = (value: string) =>
  value ? moment(value).format("D MMM YYYY") : "";

const Document = ({ document }: { document: KycDocument | null }) =>
  document ? (
    <span className="flex min-w-0 items-center gap-2">
      <FileText
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-slate-400"
      />
      {document.previewUrl ? (
        <a
          href={document.previewUrl}
          target="_blank"
          rel="noreferrer"
          className="text-brand truncate hover:underline"
        >
          {document.name}
        </a>
      ) : (
        <span className="truncate">{document.name}</span>
      )}
      <span className="shrink-0 text-sm font-normal text-slate-400">
        {formatFileSize(document.size)}
      </span>
    </span>
  ) : (
    <span className="font-medium text-red-600">Missing</span>
  );

const SummaryRow = ({
  label,
  note,
  action,
  children,
}: {
  label: string;
  note?: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <div className={cn("py-3", note && "bg-ochre/10 -mx-3 rounded-lg px-3")}>
    <div className="max-small-mobile:grid-cols-[minmax(0,1fr)_auto] grid grid-cols-[minmax(0,13rem)_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-0.5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="max-small-mobile:col-start-1 max-small-mobile:row-start-2 min-w-0 font-medium break-words text-slate-900">
        {children || <span className="text-slate-400">Not given</span>}
      </dd>
      <div className="max-small-mobile:col-start-2 max-small-mobile:row-span-2 max-small-mobile:row-start-1">
        {action}
      </div>
    </div>
    {note && (
      <p className="mt-2 flex gap-2 text-sm text-[#7a5408]">
        <MessageSquareWarning
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        {note}
      </p>
    )}
  </div>
);

// The whole application, read-only, in the order the customer filled it in.
const ApplicationSummary = ({
  application,
  sectionAction,
  rowAction,
  notes = {},
}: SummaryProps) => {
  const { business, directors, authorisation } = application;

  return (
    <div className="space-y-6">
      <FormSection title="Business" action={sectionAction?.("business")}>
        <dl className="divide-y divide-slate-100">
          <SummaryRow
            note={notes["business.legalName"]}
            action={rowAction?.("business.legalName")}
            label="Registered name"
          >
            {business.legalName}
          </SummaryRow>
          <SummaryRow
            note={notes["business.cacNumber"]}
            action={rowAction?.("business.cacNumber")}
            label="CAC number"
          >
            {business.cacNumber && `${business.cacType} ${business.cacNumber}`}
          </SummaryRow>
          <SummaryRow
            note={notes["business.cacCertificate"]}
            action={rowAction?.("business.cacCertificate")}
            label="CAC certificate"
          >
            <Document document={business.cacCertificate} />
          </SummaryRow>
          <SummaryRow
            note={notes["business.tin"]}
            action={rowAction?.("business.tin")}
            label="TIN"
          >
            {business.tin}
          </SummaryRow>
          {business.tin && (
            <SummaryRow
              note={notes["business.tinCertificate"]}
              action={rowAction?.("business.tinCertificate")}
              label="TIN certificate"
            >
              <Document document={business.tinCertificate} />
            </SummaryRow>
          )}
          <SummaryRow
            note={notes["business.nepcNumber"]}
            action={rowAction?.("business.nepcNumber")}
            label="NEPC number"
          >
            {business.nepcNumber}
          </SummaryRow>
          <SummaryRow
            note={notes["business.nepcExpiry"]}
            action={rowAction?.("business.nepcExpiry")}
            label="NEPC expiry"
          >
            {date(business.nepcExpiry)}
          </SummaryRow>
          <SummaryRow
            note={notes["business.nepcCertificate"]}
            action={rowAction?.("business.nepcCertificate")}
            label="NEPC certificate"
          >
            <Document document={business.nepcCertificate} />
          </SummaryRow>
          <SummaryRow
            note={notes["business.address"]}
            action={rowAction?.("business.address")}
            label="Address"
          >
            {[
              business.address.street,
              business.address.city,
              business.address.state,
            ]
              .filter(Boolean)
              .join(", ")}
          </SummaryRow>
          <SummaryRow
            note={notes["business.address.proofOfAddress"]}
            action={rowAction?.("business.address.proofOfAddress")}
            label="Proof of address"
          >
            <Document document={business.address.proofOfAddress} />
          </SummaryRow>
        </dl>
      </FormSection>

      <FormSection
        title={directors.length === 1 ? "Director" : "Directors"}
        action={sectionAction?.("directors")}
      >
        <div className="space-y-6">
          {directors.map((director, index) => (
            <dl key={director.id} className="divide-y divide-slate-100">
              <SummaryRow
                note={notes[`directors.${index}.fullName`]}
                action={rowAction?.(`directors.${index}.fullName`)}
                label="Name"
              >
                {director.fullName}
                {director.role && (
                  <span className="font-normal text-slate-500">
                    , {director.role}
                  </span>
                )}
              </SummaryRow>
              <SummaryRow
                note={notes[`directors.${index}.idNumber`]}
                action={rowAction?.(`directors.${index}.idNumber`)}
                label="ID"
              >
                {director.idNumber &&
                  `${ID_TYPE_LABELS[director.idType]} ${director.idNumber}`}
              </SummaryRow>
              {director.idType !== "nin" && (
                <SummaryRow
                  note={notes[`directors.${index}.idExpiry`]}
                  action={rowAction?.(`directors.${index}.idExpiry`)}
                  label="ID expiry"
                >
                  {date(director.idExpiry)}
                </SummaryRow>
              )}
              <SummaryRow
                note={notes[`directors.${index}.idDocument`]}
                action={rowAction?.(`directors.${index}.idDocument`)}
                label="ID copy"
              >
                <Document document={director.idDocument} />
              </SummaryRow>
            </dl>
          ))}
        </div>
      </FormSection>

      <FormSection
        title="Authorisation"
        action={sectionAction?.("authorisation")}
      >
        <dl className="divide-y divide-slate-100">
          <SummaryRow
            note={notes["authorisation.signedBy"]}
            action={rowAction?.("authorisation.signedBy")}
            label="Signed by"
          >
            {authorisation.signedBy}
          </SummaryRow>
          <SummaryRow
            note={notes["authorisation.issuedOn"]}
            action={rowAction?.("authorisation.issuedOn")}
            label="Date on the letter"
          >
            {date(authorisation.issuedOn)}
          </SummaryRow>
          <SummaryRow
            note={notes["authorisation.letter"]}
            action={rowAction?.("authorisation.letter")}
            label="Letter of authority"
          >
            <Document document={authorisation.letter} />
          </SummaryRow>
        </dl>
      </FormSection>
    </div>
  );
};

export default ApplicationSummary;
