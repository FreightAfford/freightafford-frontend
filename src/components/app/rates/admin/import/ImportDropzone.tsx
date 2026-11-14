import {
  AlertCircle,
  Download,
  FileSpreadsheet,
  UploadCloud,
} from "lucide-react";
import { useId, useRef, useState, type DragEvent } from "react";
import cn from "../../../../../utils/cn";

interface ImportDropzoneProps {
  onFile: (file: File) => void;
  error: string | null;
  onDownloadTemplate: () => void;
  downloading: boolean;
}

// Where the import starts: what files work, and a drop area.
const ImportDropzone = ({
  onFile,
  error,
  onDownloadTemplate,
  downloading,
}: ImportDropzoneProps) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div className="@container space-y-5">
      <div className="grid gap-3 @2xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="font-display text-sm font-bold text-slate-900">
            A Maersk quote
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Upload the quote file exactly as Maersk sent it (.xlsx). Every lane
            and container size is read, with its charges and the free time from
            the D&amp;D sheet.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="font-display text-sm font-bold text-slate-900">
            Our rates template
          </p>
          <p className="mt-1 text-sm text-slate-600">
            For rates from anywhere else: one row per charge, per size.
          </p>
          <button
            type="button"
            onClick={onDownloadTemplate}
            disabled={downloading}
            className="text-brand hover:bg-brand/10 focus-visible:ring-brand/40 mt-2 -ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Preparing…" : "Download the template"}
          </button>
        </div>
      </div>

      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging
            ? "border-brand bg-brand/5"
            : error
              ? "border-red-300 bg-red-50/40 hover:border-red-400"
              : "hover:border-brand border-slate-300 bg-slate-50/60 hover:bg-white",
        )}
      >
        <span className="bg-brand/10 text-brand flex h-12 w-12 items-center justify-center rounded-full">
          {dragging ? (
            <FileSpreadsheet className="h-6 w-6" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </span>
        <span>
          <span className="font-semibold text-slate-900">Choose a file</span>{" "}
          <span className="text-slate-600">or drop it here</span>
        </span>
        <span className="text-sm text-slate-500">
          .xlsx or .csv, up to 5 MB
        </span>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            // Clear it, so choosing the same file again reads it again.
            e.target.value = "";
            if (file) onFile(file);
          }}
        />
      </label>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default ImportDropzone;
