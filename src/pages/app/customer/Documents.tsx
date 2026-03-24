import { Clock, ExternalLink, Eye, FileText, Ship, Trash2 } from "lucide-react";
import moment from "moment";
import { Link, useNavigate } from "react-router";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import SmallLoader from "../../../components/SmallLoader";
import { useUser } from "../../../hooks/useAuthService";
import { useGetCustomerBLs } from "../../../hooks/useBLService";
import { formatFileSize, getStatusColor } from "../../../utils/helpers";

const CustomerDocuments = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { bls, isPending } = useGetCustomerBLs();
  if (isPending) return <SmallLoader />;

  console.log(bls);
  // const bls = [
  //   {
  //     id: 1,
  //     name: "Bill of Lading - FA-98210",
  //     type: "PDF",
  //     size: "1.2 MB",
  //     date: "Oct 22, 2023",
  //   },
  //   {
  //     id: 2,
  //     name: "Packing List - FA-98210",
  //     type: "PDF",
  //     size: "0.8 MB",
  //     date: "Oct 22, 2023",
  //   },
  //   {
  //     id: 3,
  //     name: "Commercial Invoice - FA-98210",
  //     type: "PDF",
  //     size: "1.1 MB",
  //     date: "Oct 22, 2023",
  //   },
  // ];
  return (
    <>
      <div className="mb-8">
        {bls.length ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900">
              Bill of Lading
            </h1>
            <p className="mt-1 text-slate-500">
              Access and download your shipping documents.
            </p>
          </>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-4">
        {bls &&
          bls?.map((bl: any) => {
            return (
              <div
                key={bl._id}
                className="hover:border-brand/20 hover:bg-brand/1 group max-small-mobile:items-end flex items-center justify-between gap-2 rounded-2xl border border-slate-50 p-4 transition-all"
              >
                <div className="max-small-mobile:flex-col max-small-mobile:items-start flex items-center gap-4">
                  <div className="bg-brand/5 group-hover:bg-brand flex h-16 w-16 shrink-0 items-center justify-center rounded-xl transition-all group-hover:text-white">
                    <FileText className="text-brand h-8 w-8 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <Link
                        to={bl.documentUrl}
                        target="_blank"
                        className="line-clamp-2 font-bold text-slate-900 capitalize"
                      >
                        {bl.type} Bill of Lading - {bl.booking.bookingNumber}
                      </Link>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-sm font-bold tracking-wider uppercase ${getStatusColor(bl.status)}`}
                      >
                        {bl.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm tracking-wider text-slate-400 uppercase">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4.5 w-4.5" />v{bl.version} •{" "}
                        {moment(bl.createdAt).format("ll")}
                      </span>
                      <span>{formatFileSize(bl.fileSize)}</span>
                    </div>
                  </div>
                </div>

                <div className="max-small-mobile:opacity-100 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-small-mobile:hidden hover:text-brand hover:bg-brand/5 rounded-lg p-2 text-slate-400 transition-all"
                    title="View Document"
                    to={bl.documentUrl}
                  >
                    <ExternalLink className="h-6 w-6" />
                  </Link>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => {
                        // deleteBL(bl._id);
                      }}
                      // disabled={isDeleting}
                      className="rounded-lg p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                      title="Delete Document"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {!bls?.length && (
        <EmptyState
          icon={<Ship className="text-brand h-10 w-10" />}
          title="No Bill of Lading Yet"
          description="No bill of lading document has been sent to you yet. Start by submitting your first request to receive shipping quotes."
          action={
            <Button
              className="flex items-center gap-2"
              onClick={() => navigate("/app/customer/bookings")}
            >
              <Eye className="h-6 w-6" />
              See Bookings
            </Button>
          }
        />
      )}
    </>
  );
};
export default CustomerDocuments;
