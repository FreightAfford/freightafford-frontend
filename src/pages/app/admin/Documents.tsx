import Button from "../../../components/Button";
import { FileUp, Filter, Search } from "lucide-react";

const AdminDocuments = () => {
  return (
    <>
      <div className="max-medium-mobile:flex-col max-medium-mobile:items-start mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Documents Management
          </h1>
          <p className="mt-1 text-slate-500">
            Upload and manage shipping documents for all bookings.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <FileUp className="h-4 w-4" /> Upload Document
        </Button>
      </div>
      <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
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
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
          <FileUp className="h-8 w-8 text-slate-300" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-900">
          No documents selected
        </h2>
        <p className="max-w-md text-slate-500">
          Select a booking or use the search bar to find documents to manage.
        </p>
      </div>
    </>
  );
};
export default AdminDocuments;
