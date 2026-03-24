import { Clock, ExternalLink, Eye, FileText, Ship, Trash2 } from "lucide-react";
import moment from "moment";
import { Link, useNavigate } from "react-router";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import SmallLoader from "../../../components/SmallLoader";
import { useUser } from "../../../hooks/useAuthService";
import { useGetBLs } from "../../../hooks/useBLService";
import { formatFileSize, getStatusColor } from "../../../utils/helpers";

const AdminDocuments = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { bls, isPending } = useGetBLs();

  if (isPending) return <SmallLoader />;
  return (
    <>
      <div className="max-medium-mobile:flex-col max-medium-mobile:items-start mb-8 flex items-center justify-between gap-4">
        {bls.length ? (
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bill of Lading Management
            </h1>
            <p className="mt-1 text-slate-500">
              Manage shipping documents for all bookings.
            </p>
          </div>
        ) : null}
        {/* <Button className="flex items-center gap-2">
          <FileUp className="h-4 w-4" /> Upload Document
        </Button> */}
      </div>
      {/* <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by booking number or customer..."
              className="focus:ring-brand/50 focus:border-brand w-full rounded-xl border border-slate-100 bg-slate-50 py-2 pr-4 pl-10 focus:ring-1 focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div> */}
      {/* <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
          <FileUp className="h-8 w-8 text-slate-300" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-900">
          No documents selected
        </h2>
        <p className="max-w-md text-slate-500">
          Select a booking or use the search bar to find documents to manage.
        </p>
      </div> */}
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

      {!bls.length && (
        <EmptyState
          icon={<Ship className="text-brand h-10 w-10" />}
          title="No Bill of Lading Yet"
          description="No booking has been created yet. Customers need to submit their first request to receive shipping quotes."
          action={
            <Button
              className="flex items-center gap-2"
              onClick={() => navigate("/app/admin/bookings")}
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
export default AdminDocuments;
