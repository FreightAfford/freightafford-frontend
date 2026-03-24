import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Container,
  FileText,
  MapPin,
  MessageSquare,
  Package,
  User,
  Weight,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import SmallLoader from "../../../components/SmallLoader";
import CounterOfferForm from "../../../components/app/CounterOfferForm";
import RejectRequestForm from "../../../components/app/RejectRequestForm";
import StatusBadge from "../../../components/app/StatusBadge";
import { useUser } from "../../../hooks/useAuthService";
import {
  useAcceptFreightRequest,
  useGetFreightRequest,
  useRespondToCounter,
} from "../../../hooks/useFreightService";
import cn from "../../../utils/cn";

const RequestDetails = () => {
  const { user } = useUser();
  const [isCounterModalOpen, setIsCounterModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isDecision, setIsDecision] = useState<"accept" | "reject">("accept");
  const navigate = useNavigate();
  const { id } = useParams();
  const { request, isPending, error } = useGetFreightRequest(id!);
  const { respondToCounter, isPending: isResponding } = useRespondToCounter(
    request?._id,
  );
  const { acceptFreight, isPending: isAccepting } = useAcceptFreightRequest(
    request?._id,
  );
  const handleDecision = (decision: "accept" | "reject") =>
    respondToCounter({ id: request._id, decision });
  const handleAccept = () => acceptFreight(request?._id);

  if (isPending) return <SmallLoader />;

  if (error)
    return (
      <div className="p-12 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <p className="text-lg font-medium text-slate-900">
          Error Loading Request
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
          className="group mb-4 flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Requests
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                Request #{request._id?.slice(-8) || "N/A"}
              </h1>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-slate-500">
              Submitted on {moment(request.createdAt).format("ll")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* <Button variant="outline">Download PDF</Button> */}
            {/* {request.status === "pending" && <Button>Edit Request</Button>} */}
            {user.role === "admin" && (
              <>
                {(request.status === "pending" ||
                  request.status === "countered") && (
                  <Button
                    className="flex items-center gap-2 bg-green-500"
                    title="Approve Request"
                    disabled={isAccepting}
                    onClick={handleAccept}
                    isLoading={isAccepting}
                  >
                    <CheckCircle2 className="h-6 w-6" /> Accept
                  </Button>
                )}
                {request.status === "pending" && (
                  <Button
                    onClick={() => setIsCounterModalOpen(true)}
                    title="Send Counter Offer"
                    className="flex items-center gap-2 bg-indigo-500"
                  >
                    <AlertCircle className="h-6 w-6" /> Counter
                  </Button>
                )}

                {(request.status === "pending" ||
                  request.status === "countered") && (
                  <Button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="flex items-center gap-2 bg-red-500"
                    title="Reject Request"
                  >
                    <XCircle className="h-6 w-6" /> Reject
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-small-desktop:gap-4 max-small-tablet:grid-cols-1 grid grid-cols-3 gap-8">
        {/* Left Column: Main Info */}
        <div className="max-small-desktop:space-y-4 col-span-2 space-y-8">
          {/* Route & Container Section */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <MapPin className="text-brand h-7 w-7" />
              Shipment Details
            </h2>

            <div className="max-small-mobile:grid-cols-1 grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                    Route
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-brand h-2.5 w-2.5 rounded-full" />
                      <div className="h-8 w-px bg-slate-100" />
                      <div className="border-brand h-2.5 w-2.5 rounded-full border-2" />
                    </div>
                    <div className="flex flex-col gap-4">
                      <span className="font-medium text-slate-900">
                        {request.originPort || "Origin Not Specified"}
                      </span>
                      <span className="font-medium text-slate-900">
                        {request.destinationPort || "Destination Not Specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                    Container
                  </label>
                  <div className="mt-2 flex items-center gap-2 text-slate-900">
                    <Container className="h-6 w-6 text-slate-400" />
                    <span className="font-medium uppercase">
                      {request.containerQuantity}
                      <span className="mx-2 lowercase">x</span>
                      {request.containerSize}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                    Commodity
                  </label>
                  <div className="mt-2 flex items-center gap-2 text-slate-900">
                    <Package className="h-6 w-6 text-slate-400" />
                    <span className="font-medium">{request.commodity}</span>
                  </div>
                </div>

                <div className="max-small-desktop:grid-cols-1 max-tablet:grid-cols-2 max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                      Weight
                    </label>
                    <div className="mt-2 flex items-center gap-2 text-slate-900">
                      <Weight className="h-6 w-6 text-slate-400" />
                      <span className="font-medium">
                        {request.cargoWeight?.toLocaleString() || "0"} kg
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                      Ready Date
                    </label>
                    <div className="mt-2 flex items-center gap-2 text-slate-900">
                      <Calendar className="h-6 w-6 text-slate-400" />
                      <span className="font-medium">
                        {moment(request.cargoReadyDate).format("l")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <FileText className="text-brand h-7 w-7" />
              Additional Notes
            </h2>
            <div className="rounded-xl bg-slate-50 p-4 leading-relaxed text-slate-600">
              {request.notes ||
                "No additional notes provided for this request."}
            </div>
          </div>

          {(request.status === "countered" ||
            request.status === "rejected") && (
            <div
              className={cn(
                "rounded-2xl border p-6 shadow-sm",
                request.status === "countered"
                  ? "border-purple-100 bg-purple-50"
                  : "border-red-100 bg-red-50",
              )}
            >
              <h2
                className={cn(
                  "mb-4 flex items-center gap-2 text-xl font-semibold",
                  request.status === "countered"
                    ? "text-purple-900"
                    : "text-red-900",
                )}
              >
                {request.status === "countered" ? (
                  <>
                    <MessageSquare className="h-7 w-7" /> Counter Offer Details
                  </>
                ) : (
                  <>
                    <FileText className="h-7 w-7" /> Rejection Reason
                  </>
                )}
              </h2>

              {request.status === "countered" && (
                <div className="mb-4">
                  <p className="mb-1 text-sm font-medium text-purple-700">
                    Counter Price
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${request.adminCounterPrice?.toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <p
                  className={cn(
                    "mb-1 font-medium",
                    request.status === "countered"
                      ? "text-purple-700"
                      : "text-red-700",
                  )}
                >
                  {request.status === "countered" ? "Admin Message" : "Reason"}
                </p>
                <p
                  className={cn(
                    "leading-relaxed",
                    request.status === "countered"
                      ? "text-purple-800"
                      : "text-red-800",
                  )}
                >
                  {request.status === "countered"
                    ? request.counterReason
                    : request.rejectionReason ||
                      "You couldn't agreed to our counter offer."}
                </p>
              </div>

              {request.status === "countered" && user.role === "customer" && (
                <div className="mt-6 flex gap-3">
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    isLoading={isResponding && isDecision === "accept"}
                    disabled={isResponding}
                    onClick={() => {
                      setIsDecision("accept");
                      handleDecision("accept");
                    }}
                  >
                    Accept Counter
                  </Button>
                  <Button
                    variant="outline"
                    className="border-purple-200 text-purple-700 hover:bg-purple-100"
                    isLoading={isResponding && isDecision === "reject"}
                    disabled={isResponding}
                    onClick={() => {
                      setIsDecision("reject");
                      handleDecision("reject");
                    }}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          )}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <Clock className="text-brand h-7 w-7" />
              Request History
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-brand/10 flex h-8 w-8 items-center justify-center rounded-full">
                    <Check className="text-brand h-4 w-4" />
                  </div>
                  <div className="h-full w-px bg-slate-100" />
                </div>
                <div className="pb-6">
                  <p className="font-medium text-slate-900">
                    Request Submitted
                  </p>
                  <p className="text-slate-500">
                    Your request has been received and is pending review.
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {moment(request.createdAt).format("LLLL")}
                  </p>
                </div>
              </div>

              {request.adminActionAt && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        request.status === "accepted"
                          ? "bg-green-100"
                          : "bg-orange-100",
                      )}
                    >
                      {request.status === "accepted" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {request.status === "accepted"
                        ? "Request Accepted"
                        : request.status === "rejected"
                          ? "Request Rejected"
                          : "Counter Offer Received"}
                    </p>
                    <p className="text-slate-500">
                      {request.status === "accepted"
                        ? "The admin has accepted your request. You can now proceed to booking."
                        : request.status === "rejected"
                          ? "The admin has rejected your request."
                          : "The admin has sent a counter offer for your review."}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {moment(request.adminActionAt).format("LLLL")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="max-small-desktop:space-y-4 space-y-8">
          {/* Pricing Card */}
          <div className="max-small-desktop:px-4 max-tablet:p-6 rounded-2xl bg-slate-900 p-6 text-white shadow-lg shadow-slate-200">
            <h3 className="mb-4 text-sm font-medium tracking-wider text-slate-400 uppercase">
              Proposed Price
            </h3>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold">
                ${request.proposedPrice?.toLocaleString() || "0"}
              </span>
              <span className="text-xs text-slate-400">USD</span>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Size</span>
                <span>
                  {request.containerSize
                    .toUpperCase()
                    .replace("STD", "STANDARD")
                    .replace("HC", "HIGH CUBE")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Quantity</span>
                <span>{request.containerQuantity}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 font-bold">
                <span>Total</span>
                <span>${(request.proposedPrice || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="max-small-desktop:px-4 max-tablet:p-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <User className="text-brand h-6 w-6" />
              Customer Info
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 uppercase">
                  {request.customer.fullname?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="line-clamp-1 font-medium text-slate-900 capitalize">
                    {request.customer.fullname || "Unknown Customer"}
                  </p>
                  <p className="text-sm text-slate-500">Verified Customer</p>
                </div>
              </div>
              <Link to="/app/customer/profile">
                <Button variant="outline" className="h-9 w-full text-sm">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
          {/* <div className="max-small-desktop:px-4 max-tablet:p-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="h-10 w-full justify-start text-sm font-normal"
              >
                <File className="mr-2 h-5 w-5" /> Check Invoice
              </Button>
              <Button
                variant="ghost"
                className="h-10 w-full justify-start text-sm font-normal"
              >
                <FileText className="mr-2 h-5 w-5" /> View Documents
              </Button>
            </div>
          </div> */}
        </div>
      </div>
      <Modal
        isOpen={isCounterModalOpen}
        onClose={() => setIsCounterModalOpen(false)}
        title="Send Counter Offer"
      >
        <CounterOfferForm
          request={request}
          onCancel={() => setIsCounterModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Freight Requests"
      >
        <RejectRequestForm onCancel={() => setIsRejectModalOpen(false)} />
      </Modal>
    </>
  );
};

export default RequestDetails;
