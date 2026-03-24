import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  File,
  Hash,
  X,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import StatusBadge from "../../../components/app/StatusBadge";
import SubmitPaymentProofForm from "../../../components/app/SubmitPaymentProofForm";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import SmallLoader from "../../../components/SmallLoader";
import { useUser } from "../../../hooks/useAuthService";
import {
  useGetInvoiceByBooking,
  useVerifyPayment,
} from "../../../hooks/useInvoiceService";
import { formatFileSize } from "../../../utils/helpers";

const InvoiceDetails = () => {
  const { user } = useUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoice, error, isPending } = useGetInvoiceByBooking(id!);
  const { verify, isPending: isVerifying } = useVerifyPayment(id!);
  const [isAction, setIsAction] = useState<"approve" | "reject">("approve");
  const [isSubmitProofModalOpen, setIsSubmitProofModalOpen] =
    useState<boolean>(false);

  if (isPending) return <SmallLoader />;

  console.log(invoice);

  if (error)
    return (
      <div className="p-12 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <p className="text-lg font-medium text-slate-900">
          Error loading invoice
        </p>
        <p className="text-slate-500">
          {error.message} or there was a server error.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="hover:text-brand mb-4 flex items-center gap-2 text-slate-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Invoices
        </button>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              #{invoice.invoiceNumber}
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <StatusBadge
                status={
                  invoice.status === "awaiting_verification"
                    ? "pending"
                    : invoice.status
                }
              />
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm text-slate-500">
                Created on {moment(invoice.createdAt).format("ll")}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open(invoice.documentUrl, "_blank")}
            >
              <Download className="h-5 w-5" /> Download{" "}
              {formatFileSize(invoice.fileSize)}
            </Button>
            {user.role === "customer" &&
              invoice.status === "awaiting_verification" && (
                <Button
                  onClick={() => setIsSubmitProofModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <File className="h-5 w-5" /> Submit Payment Proof
                </Button>
              )}
            {user.role === "admin" &&
              invoice.status === "awaiting_verification" && (
                <>
                  <Button
                    className="flex items-center gap-2"
                    disabled={isAction === "approve" && isVerifying}
                    isLoading={isAction === "approve" && isVerifying}
                    onClick={() => {
                      setIsAction("approve");
                      verify({ invoiceId: invoice._id, action: "approve" });
                    }}
                  >
                    <CheckCircle className="h-4 w-4" /> Mark as Paid
                  </Button>
                  <Button
                    isLoading={isAction === "reject" && isVerifying}
                    disabled={isAction === "reject" && isVerifying}
                    className="flex items-center gap-2 bg-red-500"
                    onClick={() => {
                      setIsAction("reject");
                      verify({ invoiceId: invoice._id, action: "reject" });
                    }}
                  >
                    <X className="h-4 w-4" /> Reject Ref
                  </Button>
                </>
              )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {invoice.status === "awaiting_verification" && (
          <div className="space-y-1 rounded-xl border border-yellow-100 bg-yellow-50 p-4">
            <div className="flex items-center gap-2 text-lg font-bold text-yellow-800">
              <Clock className="h-6 w-6" /> Payment Awaiting Verification
            </div>
            <p className="text-yellow-700">
              The customer has submitted payment proof. Please review the
              reference and document before approving.
            </p>
          </div>
        )}
        <div className="space-y-8">
          {/* Invoice Summary */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-slate-900">
              Invoice Summary
            </h2>
            <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-slate-50 p-2">
                  <Calendar className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium tracking-wider text-slate-500 uppercase">
                    Due Date
                  </p>
                  <p className="font-semibold text-slate-900">
                    {moment(invoice.dueDate).format("ll")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-slate-50 p-2">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium tracking-wider text-slate-500 uppercase">
                    Amount Due
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {invoice.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium tracking-wider text-slate-500 uppercase">
                    Mark Paid At
                  </p>
                  <p className="font-semibold text-slate-900">
                    {invoice.paidAt
                      ? moment(invoice.paidAt).format("lll")
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-slate-50 p-2">
                  <Hash className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium tracking-wider text-slate-500 uppercase">
                    Payment Reference
                  </p>
                  <p className="font-semibold text-slate-900">
                    {invoice.paymentReference
                      ? invoice.paymentReference
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-slate-50 p-2">
                  <ExternalLink className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <div className="text-sm font-medium tracking-wider text-slate-500 uppercase">
                    Payment Proof
                  </div>
                  {invoice.paymentProofUrl ? (
                    <Link
                      to={invoice.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand font-medium hover:underline"
                    >
                      View Submitted Proof
                    </Link>
                  ) : (
                    <span className="font-semibold">N/A</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Associated Booking
              </h2>
              <button
                onClick={() =>
                  navigate(`/app/${user.role}/bookings/${invoice.booking._id}`)
                }
                className="text-brand max-medium-mobile:text-sm flex items-center gap-1 font-medium hover:underline"
              >
                <span className="max-medium-mobile:hidden">View</span> Booking
                <ExternalLink className="h-5 w-5" />
              </button>
            </div>
            <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium tracking-wider text-slate-500 uppercase">
                  Booking Number
                </p>
                <p className="font-semibold text-slate-900">
                  {invoice.booking.bookingNumber || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium tracking-wider text-slate-500 uppercase">
                  Shipping Line
                </p>
                <p className="font-semibold text-slate-900">
                  {invoice.booking.shippingLine || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium tracking-wider text-slate-500 uppercase">
                  Status
                </p>
                <p className="font-semibold text-slate-900 capitalize">
                  {invoice.booking.status.replace("_", " ") || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Customer Info */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-slate-900">
              Customer Info
            </h2>

            <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-sm font-medium tracking-wider text-slate-500 uppercase">
                  company
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-brand/10 text-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold">
                    {invoice.customer?.["companyName"].charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="line-clamp-1 font-semibold text-slate-900">
                      {invoice.customer.companyName || "N/A"}
                    </p>
                    <p className="line-clamp-1 text-sm text-slate-500">
                      {invoice.customer.country || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium tracking-wider text-slate-500 uppercase">
                  profile
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-brand/10 text-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold">
                    {invoice.customer?.fullname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="line-clamp-1 font-semibold text-slate-900 capitalize">
                      {invoice.customer.fullname || "N/A"}
                    </p>
                    <p className="line-clamp-1 text-sm text-slate-500">
                      {invoice.customer.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isSubmitProofModalOpen}
        onClose={() => setIsSubmitProofModalOpen(false)}
        title="Submit Payment Proof"
      >
        <SubmitPaymentProofForm
          bookingId={invoice.booking._id}
          invoice={{
            invoiceId: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
          }}
          onCancel={() => setIsSubmitProofModalOpen(false)}
        />
      </Modal>
    </>
  );
};
export default InvoiceDetails;
