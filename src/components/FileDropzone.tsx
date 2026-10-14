import { FileText, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import {
  useRemoveKycDocument,
  useUploadKycDocument,
} from "../hooks/useKycService";
import type { KycDocument } from "../types/kyc";
import cn from "../utils/cn";
import { formatFileSize } from "../utils/helpers";
import { checkKycFile, KYC_FILE_ACCEPT } from "../validations/kycValidation";

interface FileDropzoneProps {
  label: string;
  // What makes a good upload for this document, e.g. "All four corners visible".
  hint?: string;
  value: KycDocument | null;
  onChange: (document: KycDocument | null) => void;
  error?: string;
  disabled?: boolean;
  // Told when an upload starts and ends, so a form can wait for it.
  onBusyChange?: (busy: boolean) => void;
}

type Upload = { name: string; size: number; percent: number };

const FileDropzone = ({
  label,
  hint,
  value,
  onChange,
  error,
  disabled,
  onBusyChange,
}: FileDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [upload, setUpload] = useState<Upload | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadDocument } = useUploadKycDocument();
  const { removeDocument, isPending: isRemoving } = useRemoveKycDocument();

  const message = problem ?? error;
  const busy = disabled || upload !== null || isRemoving;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const fileProblem = checkKycFile(file);
    setProblem(fileProblem);
    if (fileProblem) return;

    const previous = value;
    setUpload({ name: file.name, size: file.size, percent: 0 });
    onBusyChange?.(true);
    try {
      const response = await uploadDocument({
        file,
        onProgress: (percent) =>
          setUpload((current) => current && { ...current, percent }),
      });
      onChange(response.data);
      // A replaced file is no longer needed.
      if (previous) removeDocument(previous.id).catch(() => {});
    } catch (err) {
      setProblem(
        (err as { message?: string })?.message ??
          "The upload didn't finish. Check your connection and try again.",
      );
    } finally {
      setUpload(null);
      onBusyChange?.(false);
    }
  };

  const openPicker = () => inputRef.current?.click();

  const handleRemove = async () => {
    if (!value) return;
    setProblem(null);
    try {
      await removeDocument(value.id);
      onChange(null);
    } catch {
      setProblem("The file couldn't be removed. Try again.");
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (!busy) handleFile(event.dataTransfer.files[0]);
  };

  const isImage = value?.mimeType.startsWith("image/");

  return (
    <div className="w-full space-y-1.5">
      <p
        id={`${id}-label`}
        className="font-display text-sm font-semibold text-slate-800"
      >
        {label}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={KYC_FILE_ACCEPT}
        className="hidden"
        tabIndex={-1}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          // Allow picking the same file again after an error.
          event.target.value = "";
        }}
      />

      {upload ? (
        <div
          className="rounded-xl border border-slate-200 bg-white p-3"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <FileIcon />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-800">
                {upload.name}
              </p>
              <p className="text-sm text-slate-500">
                Uploading… {upload.percent}%
              </p>
            </div>
          </div>
          <div
            role="progressbar"
            aria-labelledby={`${id}-label`}
            aria-valuenow={upload.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="bg-brand h-full rounded-full transition-[width] duration-150"
              style={{ width: `${upload.percent}%` }}
            />
          </div>
        </div>
      ) : value ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border bg-white p-3",
            message ? "border-red-300" : "border-slate-200",
          )}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
        >
          {isImage && value.previewUrl ? (
            <img
              src={value.previewUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-md border border-slate-200 object-cover"
            />
          ) : (
            <FileIcon />
          )}
          <div className="min-w-0 flex-1">
            {value.previewUrl ? (
              <a
                href={value.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand block truncate font-medium text-slate-800 hover:underline"
                title={value.name}
              >
                {value.name}
              </a>
            ) : (
              <p
                className="truncate font-medium text-slate-800"
                title={value.name}
              >
                {value.name}
              </p>
            )}
            <p className="text-sm text-slate-500">
              {formatFileSize(value.size)} · Uploaded
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <IconButton
              label={`Replace ${label}`}
              onClick={openPicker}
              disabled={busy}
            >
              <RefreshCw className="h-4 w-4" />
            </IconButton>
            <IconButton
              label={`Remove ${label}`}
              onClick={handleRemove}
              disabled={busy}
              danger
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={busy}
          aria-labelledby={`${id}-label`}
          aria-describedby={
            cn(hint && `${id}-hint`, message && `${id}-error`) || undefined
          }
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "focus-visible:ring-brand group flex w-full items-center gap-4 rounded-xl border-2 border-dashed px-4 py-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
            isDragging
              ? "border-brand bg-brand/5"
              : message
                ? "border-red-300 bg-red-50/40 hover:border-red-400"
                : "hover:border-brand/60 border-slate-200 bg-slate-50/60 hover:bg-white",
          )}
        >
          <span className="bg-brand/10 text-brand flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
            <UploadCloud className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-medium text-slate-800">
              {isDragging ? "Drop to upload" : "Choose a file or drag it here"}
            </span>
            <span className="block text-sm text-slate-500">
              PDF, JPG or PNG, up to 5 MB
            </span>
          </span>
        </button>
      )}

      {hint && !message && (
        <p id={`${id}-hint`} className="text-sm text-slate-500">
          {hint}
        </p>
      )}
      {message && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-sm font-medium text-red-600"
        >
          {message}
        </p>
      )}
    </div>
  );
};

const FileIcon = () => (
  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
    <FileText className="h-5 w-5" />
  </span>
);

const IconButton = ({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "focus-visible:ring-brand flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50",
      danger
        ? "hover:bg-red-50 hover:text-red-600"
        : "hover:bg-slate-100 hover:text-slate-800",
    )}
  >
    {children}
  </button>
);

export default FileDropzone;
