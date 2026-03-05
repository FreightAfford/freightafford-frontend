import { Download, Eye, FileText } from "lucide-react";

const CustomerDocuments = () => {
  const documents = [
    {
      id: 1,
      name: "Bill of Lading - FA-98210",
      type: "PDF",
      size: "1.2 MB",
      date: "Oct 22, 2023",
    },
    {
      id: 2,
      name: "Packing List - FA-98210",
      type: "PDF",
      size: "0.8 MB",
      date: "Oct 22, 2023",
    },
    {
      id: 3,
      name: "Commercial Invoice - FA-98210",
      type: "PDF",
      size: "1.1 MB",
      date: "Oct 22, 2023",
    },
  ];
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <p className="mt-1 text-slate-500">
          Access and download your shipping documents.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {documents.map((document) => (
          <div
            key={document.id}
            className="hover:border-brand/30 flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-colors"
          >
            <div className="max-small-mobile:gap-2 flex items-center gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>

              <div>
                <h3 className="line-clamp-1 font-semibold text-slate-900">
                  {document.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {document.type} • {document.size} •{" "}
                  <span className="max-small-mobile:hidden">Uploaded on</span>{" "}
                  {document.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="hover:text-brand hover:bg-brand/5 rounded-lg p-2 text-slate-400 transition-colors">
                <Eye className="h-5 w-5" />
              </button>
              <button className="hover:text-brand hover:bg-brand/5 rounded-lg p-2 text-slate-400 transition-colors">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default CustomerDocuments;
