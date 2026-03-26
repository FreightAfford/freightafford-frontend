import {
  AlertCircle,
  Anchor,
  ArrowLeft,
  ChartNoAxesGantt,
  CheckCircle2,
  Clock,
  Container,
  FileText,
  History,
  Info,
  MapPin,
  Package,
  Plus,
  Ship,
  User,
  Weight,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { BillOfLadingManager } from "../../../components/app/BillOfLadingManager";
import CreateInvoiceForm from "../../../components/app/CreateInvoiceForm";
import StatusBadge from "../../../components/app/StatusBadge";
import UpdateShippingForm from "../../../components/app/UpdateShippingForm";
import UpdateStatusForm from "../../../components/app/UpdateStatusForm";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import SmallLoader from "../../../components/SmallLoader";
import { useUser } from "../../../hooks/useAuthService";
import { useGetSingleBooking } from "../../../hooks/useBookingService";
import { useGetInvoiceByBooking } from "../../../hooks/useInvoiceService";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { booking, isPending, sbError } = useGetSingleBooking(id!);
  // const { events, isPending: isTracking } = useGetBookingTrackingEvents(id!);
  const { isPending: isLoading, invoice } = useGetInvoiceByBooking(id!);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isUpdateShippingModalOpen, setIsUpdateShippingModalOpen] =
    useState<boolean>(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] =
    useState<boolean>(false);

  if (isPending || isLoading) return <SmallLoader />;

  if (sbError)
    return (
      <div className="p-12 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <p className="text-lg font-medium text-slate-900">
          Error Loading Booking
        </p>
        <p className="text-slate-500">
          {sbError.message} or there was a server error.
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
          Back to Bookings
        </button>

        <div className="max-medium-mobile:flex-col max-medium-mobile:items-start flex items-center justify-between gap-4">
          <div>
            <div className="max-medium-mobile:gap-1 mb-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                Booking #{booking.bookingNumber.split("-")[2] || "N/A"}
              </h1>
              <StatusBadge
                status={
                  booking.status === "awaiting_confirmation"
                    ? "pending"
                    : booking.status
                }
              />
            </div>
            <p className="text-slate-500">
              Created on {moment(booking.createdAt).format("ll")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* <Button variant="outline">Download Confirmation</Button> */}
            {user?.role === "admin" && (
              <>
                <Button
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Invoice
                </Button>
                <Button onClick={() => setIsUpdateShippingModalOpen(true)}>
                  <Ship className="mr-2" /> Shipping
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsUpdateStatusModalOpen(true)}
                >
                  <ChartNoAxesGantt className="mr-2" /> Status
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Shipment Route Visual */}
      {booking.freightRequest && (
        <div className="max-small-tablet:mb-6 mb-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="max-medium-mobile:flex-col relative flex items-center justify-between gap-8">
            <div className="max-medium-mobile:w-full z-10 flex flex-col items-start gap-2 bg-white pr-4">
              <div className="bg-brand/10 flex h-12 w-12 items-center justify-center rounded-full">
                <Anchor className="text-brand h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                  Origin Port
                </p>
                <p className="text-lg font-bold text-slate-900 capitalize">
                  {booking.freightRequest.originPort}
                </p>
              </div>
            </div>

            <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-2 md:w-auto">
              <div className="absolute top-6 right-0 left-0 h-px bg-slate-200" />
              <div className="z-10 flex flex-col items-center bg-white px-4">
                <Ship className="mb-1 h-7 w-7 text-slate-400" />
                <div className="text-brand flex items-center gap-2 font-semibold capitalize">
                  <span>{booking.vessel || "Vessel TBA"}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {booking.sailingDate
                    ? `ETD: ${moment(booking.sailingDate).format("ll")}`
                    : "ETD TBA"}
                </p>
              </div>
            </div>

            <div className="max-medium-mobile:w-full z-10 flex flex-col items-end gap-2 bg-white pl-4">
              <div className="bg-brand/10 flex h-12 w-12 items-center justify-center rounded-full">
                <MapPin className="text-brand h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                  Destination Port
                </p>
                <p className="text-lg font-bold text-slate-900 capitalize">
                  {booking.freightRequest.destinationPort}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-small-desktop:grid-cols-1 max-tablet:grid-cols-3 max-small-tablet:gap-6 max-mobile:grid-cols-1 grid grid-cols-3 gap-8">
        {/* Left Column: Main Info */}
        <div className="max-small-desktop:col-span-1 max-mobile:col-span-1 max-tablet:col-span-2 max-small-tablet:space-y-6 col-span-2 space-y-8">
          {/* Carrier & Vessel Details */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Ship className="text-brand h-7 w-7" />
              Carrier & Vessel Details
            </h2>

            <div className="max-small-mobile:grid-cols-1 max-small-mobile:gap-6 grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                    Shipping Line
                  </label>
                  <p className="mt-1 font-medium text-slate-900">
                    {booking.shippingLine || "Not Assigned"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                    Vessel Name
                  </label>
                  <p className="mt-1 font-medium text-slate-900">
                    {booking.vessel || "Not Assigned"}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                    Carrier Booking #
                  </label>
                  <p className="mt-1 font-mono text-xl font-medium text-slate-900">
                    {booking.carrierBookingNumber ||
                      booking.mainBookingNumber ||
                      "Not Assigned"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                    Internal Reference
                  </label>
                  <p className="mt-1 font-medium text-slate-900">
                    {booking.bookingNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cargo Specifications */}
          {booking.freightRequest && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Package className="text-brand h-7 w-7" />
                Cargo Specifications
              </h2>

              <div className="max-small-mobile:grid-cols-1 max-small-mobile:gap-6 grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                      Commodity
                    </label>
                    <p className="mt-1 font-medium text-slate-900 capitalize">
                      {booking.freightRequest.commodity}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                      Container Details
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <Container className="h-5 w-5 text-slate-400" />
                      <p className="font-medium text-slate-900">
                        {booking.freightRequest.containerQuantity} x{" "}
                        {booking.freightRequest.containerSize}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                      Total Weight
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <Weight className="h-5 w-5 text-slate-400" />
                      <p className="font-medium text-slate-900">
                        {booking.freightRequest.cargoWeight.toLocaleString()} kg
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                      Cargo Ready Date
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-slate-400" />
                      <p className="font-medium text-slate-900">
                        {moment(booking.freightRequest.cargoReadyDate).format(
                          "ll",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {booking.freightRequest.notes && (
                <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Info className="text-brand h-6 w-6" />
                    <span className="text-sm font-bold tracking-wider text-slate-900 uppercase">
                      Special Instructions
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    {booking.freightRequest.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Activity Log */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <History className="text-brand h-7 w-7" />
              Activity Log
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-brand/10 flex h-10 w-10 items-center justify-center rounded-full">
                    <CheckCircle2 className="text-brand h-5 w-5" />
                  </div>
                  <div className="my-2 w-px flex-1 bg-slate-100" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    Booking Status Updated
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Status changed to{" "}
                    <span className="text-brand font-medium uppercase">
                      {(booking.status || "").replace("_", " ")}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {moment(booking.updatedAt).format("LLLL")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="my-2 w-px flex-1 bg-slate-100" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Booking Created</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    System generated booking reference {booking.bookingNumber}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {moment(booking.createdAt).format("LLLL")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <BillOfLadingManager
            bookingId={booking._id}
            role={user.role === "admin"}
          />
        </div>

        {/* Right Column: Status & Timeline */}
        <div className="max-small-tablet:space-y-6 space-y-8">
          {/* Customer Info */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <User className="text-brand h-7 w-7" />
              Customer Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                  Company Name
                </label>
                <p className="mt-1 line-clamp-1 font-bold text-slate-900 capitalize">
                  {booking.customer.companyName || booking.customer.fullname}
                </p>
              </div>
              {typeof booking.customer === "object" && (
                <div>
                  <label className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                    Contact Email
                  </label>
                  <p className="mt-1 truncate text-slate-600">
                    {(booking.customer as any).email || "N/A"}
                  </p>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  navigate(
                    `/app/customer/requests/${booking.freightRequest?._id}`,
                  )
                }
              >
                Original Request
              </Button>
            </div>
          </div>
          {/* Financial Summary */}
          {booking.freightRequest && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <FileText className="text-brand h-7 w-7" />
                Cost Summary
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Freight Cost</span>
                  <span className="font-medium text-slate-900">
                    $
                    {(
                      booking.freightRequest.adminCounterPrice ||
                      booking.freightRequest.proposedPrice
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Ocean Freight</span>
                  <span className="font-medium text-slate-900">
                    $
                    {(
                      (booking.freightRequest.adminCounterPrice ||
                        booking.freightRequest.proposedPrice) * 0.85
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Local Charges</span>
                  <span className="font-medium text-slate-900">
                    $
                    {(
                      (booking.freightRequest.adminCounterPrice ||
                        booking.freightRequest.proposedPrice) * 0.15
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-brand text-xl font-bold">
                    $
                    {(
                      booking.freightRequest.adminCounterPrice ||
                      booking.freightRequest.proposedPrice
                    ).toLocaleString()}
                  </span>
                </div>
                {invoice && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      navigate(`/app/${user.role}/invoices/${booking._id}`)
                    }
                  >
                    Check Invoice
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Status Timeline */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">
              Tracking Timeline
            </h2>
            <div className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-px before:bg-slate-100">
              <div className="relative pl-8">
                <div className="absolute top-1.5 left-0 h-4 w-4 rounded-full border-4 border-white bg-green-500 shadow-sm" />
                <p className="text-sm font-medium text-slate-900">
                  Booking Created
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(booking.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="relative pl-8">
                <div
                  className={`absolute top-1.5 left-0 h-4 w-4 rounded-full border-4 border-white shadow-sm ${
                    [
                      "confirmed",
                      "in_transit",
                      "arrived",
                      "delivered",
                    ].includes(booking.status)
                      ? "bg-green-500"
                      : "bg-slate-200"
                  }`}
                />
                <p className="text-sm font-medium text-slate-900">
                  Booking Confirmed
                </p>
                {["confirmed", "in_transit", "arrived", "delivered"].includes(
                  booking.status,
                ) && (
                  <p className="text-xs text-slate-500">
                    Updated on {new Date(booking.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="relative pl-8">
                <div
                  className={`absolute top-1.5 left-0 h-4 w-4 rounded-full border-4 border-white shadow-sm ${
                    ["in_transit", "arrived", "delivered"].includes(
                      booking.status,
                    )
                      ? "bg-blue-500"
                      : "bg-slate-200"
                  }`}
                />
                <p className="text-sm font-medium text-slate-900">In Transit</p>
                {booking.status === "in_transit" && (
                  <p className="text-xs font-medium text-blue-600">
                    Currently at Sea
                  </p>
                )}
              </div>

              <div className="relative pl-8">
                <div
                  className={`absolute top-1.5 left-0 h-4 w-4 rounded-full border-4 border-white shadow-sm ${
                    ["arrived", "delivered"].includes(booking.status)
                      ? "bg-indigo-500"
                      : "bg-slate-200"
                  }`}
                />
                <p className="text-sm font-medium text-slate-900">
                  Arrived at Port
                </p>
              </div>

              <div className="relative pl-8">
                <div
                  className={`absolute top-1.5 left-0 h-4 w-4 rounded-full border-4 border-white shadow-sm ${
                    booking.status === "delivered"
                      ? "bg-green-600"
                      : "bg-slate-200"
                  }`}
                />
                <p className="text-sm font-medium text-slate-900">Delivered</p>
              </div>
            </div>
            {/* <Button variant="outline" className="w-full">
              Shipment track
            </Button>{" "} */}
          </div>
        </div>
      </div>

      <Modal
        title="Update Shipping Details"
        isOpen={isUpdateShippingModalOpen}
        onClose={() => setIsUpdateShippingModalOpen(false)}
      >
        <UpdateShippingForm
          bookingId={booking._id}
          initialData={{
            shippingLine: booking.shippingLine,
            vessel: booking.vessel,
            sailingDate: booking.sailingDate,
            carrierBookingNumber: booking.carrierBookingNumber,
          }}
          onCancel={() => setIsUpdateShippingModalOpen(false)}
        />
      </Modal>
      <Modal
        title="Update Booking Status"
        isOpen={isUpdateStatusModalOpen}
        onClose={() => setIsUpdateStatusModalOpen(false)}
      >
        <UpdateStatusForm
          initialStatus={booking.status}
          bookingId={booking._id}
          onCancel={() => setIsUpdateStatusModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Create New Invoice"
      >
        <CreateInvoiceForm
          bookingId={booking._id}
          onCancel={() => setIsInvoiceModalOpen(false)}
        />
      </Modal>
    </>
  );
};
export default BookingDetails;
