import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clock,
  ExternalLink,
  FileText,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import moment from "moment";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { useDeleteBL, useGetBL, useUploadBL } from "../../hooks/useBLService";
import { formatFileSize, getStatusColor } from "../../utils/helpers";
import {
  uploadBLSchema,
  type UploadBLValues,
} from "../../validations/blValidation";
import Button from "../Button";

interface BillOfLadingManagerProps {
  bookingId: string;
  role: boolean;
}

export const BillOfLadingManager = ({
  bookingId,
  role,
}: BillOfLadingManagerProps) => {
  const { uploadBL, isPending } = useUploadBL();
  const { bls, isPending: isLoading } = useGetBL(bookingId);
  const { deleteBL, isPending: isDeleting } = useDeleteBL();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    trigger,
  } = useForm<UploadBLValues>({
    resolver: zodResolver(uploadBLSchema),
  });

  const onUploadBL = (data: UploadBLValues) => {
    uploadBL(
      { bookingId, type: data.type, file: data.file },
      {
        onSuccess: () => {
          reset();
          setSelectedFile(null);
          setShowForm(false);
        },
      },
    );
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FileText className="text-brand h-7 w-7" />
          Bill of Lading
        </h2>
        {role && (
          <Button
            variant="outline"
            size="sm"
            className="text-sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add BL
          </Button>
        )}
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-8 rounded-2xl border border-slate-100 bg-slate-50 p-6 duration-300"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold tracking-wider text-slate-900 uppercase">
                Upload New BL
              </h3>
              <button
                disabled={isPending}
                onClick={() => {
                  reset();
                  setSelectedFile(null);
                  setShowForm(false);
                }}
                className="rounded-full p-2 transition-colors hover:bg-slate-200"
              >
                <X className="h-6 w-6 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onUploadBL)} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-slate-500 uppercase">
                  BL Type
                </label>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      value="house"
                      {...register("type")}
                      className="text-brand focus:ring-brand"
                      disabled={isPending}
                    />
                    <span className="text-sm text-slate-700">House BL</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      value="master"
                      {...register("type")}
                      className="text-brand focus:ring-brand"
                      disabled={isPending}
                    />
                    <span className="text-sm text-slate-700">Master BL</span>
                  </label>
                </div>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type="file"
                  id="bl-file"
                  className="hidden"
                  accept="application/pdf"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files) {
                      setSelectedFile(files[0]);
                      setValue("file", files);
                      await trigger("file");
                    }
                  }}
                  disabled={isPending}
                />
                <label
                  htmlFor="bl-file"
                  className="hover:border-brand hover:bg-brand/2 group flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 transition-all"
                >
                  <div className="bg-brand/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                    <Upload className="text-brand h-6 w-6" />
                  </div>
                  <span className="text-slate-500 group-hover:text-slate-700">
                    Click to select document
                  </span>
                  <span className="mt-1 text-xs tracking-tighter text-slate-400 uppercase">
                    PDF up to 5MB
                  </span>
                </label>
                {errors.file && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.file.message}
                  </p>
                )}
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between rounded-xl bg-white p-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate font-medium text-slate-800"
                        title={selectedFile.name}
                      >
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-slate-400">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setValue("file", undefined as any);
                    }}
                    disabled={isPending}
                    className="ml-2 shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isPending}
                  disabled={isPending}
                >
                  Upload{" "}
                  <span className="max-small-mobile:hidden ml-1">Document</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setSelectedFile(null);
                    setShowForm(false);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-slate-50"
              />
            ))}
          </div>
        )}
        {!isLoading && bls?.length > 0 && (
          <>
            {bls?.map((bl: any) => {
              return (
                <div
                  key={bl._id}
                  className="hover:border-brand/20 hover:bg-brand/1 group max-small-mobile:items-end flex items-center justify-between gap-2 rounded-2xl border border-slate-50 p-4 transition-all"
                >
                  <div className="max-small-mobile:flex-col max-small-mobile:items-start flex items-center gap-4">
                    <div className="bg-brand/5 group-hover:bg-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all group-hover:text-white">
                      <FileText className="text-brand h-6 w-6 group-hover:text-white" />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <Link
                          to={bl.documentUrl}
                          target="_blank"
                          className="text-sm font-bold text-slate-900 capitalize"
                        >
                          {bl.type} Bill of Lading
                        </Link>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${getStatusColor(bl.status)}`}
                        >
                          {bl.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] tracking-wider text-slate-400 uppercase">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />v{bl.version} •{" "}
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
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    {role && (
                      <button
                        onClick={() => {
                          deleteBL(bl._id);
                        }}
                        disabled={isDeleting}
                        className="rounded-lg p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                        title="Delete Document"
                      >
                        {isDeleting ? "..." : <Trash2 className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {!bls?.length && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <FileText className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              No Bill of Lading Document
            </p>
            <p className="mt-1 text-xs text-slate-400">
              A draft would be sent in due time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
