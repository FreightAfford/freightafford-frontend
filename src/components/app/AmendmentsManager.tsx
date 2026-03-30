import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clock,
  ExternalLink,
  FileText,
  MessageSquare,
  Plus,
  Upload,
  X,
} from "lucide-react";
import moment from "moment";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import {
  useCreateAmendment,
  useGetAmendmentsByBooking,
} from "../../hooks/useAmendmentService";
import cn from "../../utils/cn";
import { formatFileSize, getStatusColor } from "../../utils/helpers";
import {
  amendmentSchema,
  type AmendmentFormValues,
} from "../../validations/amendment.validation";
import Button from "../Button";

const AmendmentsManager = ({
  bookingId,
  role,
}: {
  bookingId: string;
  role: string;
}) => {
  const [amendmentType, setAmendmentType] = useState<"text" | "pdf">("text");
  const [seeMore, setSeeMore] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { createAmendment, isPending } = useCreateAmendment();
  const {
    amendments,
    isPending: isLoading,
    error,
  } = useGetAmendmentsByBooking(bookingId!);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    trigger,
  } = useForm<AmendmentFormValues>({
    resolver: zodResolver(amendmentSchema),
  });

  const onCreateAmendment = (data: AmendmentFormValues) => {
    createAmendment(
      {
        bookingId,
        content: data.content!,
        file: data.file!,
      },
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
          <MessageSquare className="text-brand h-7 w-7" />
          Amendments
        </h2>
        {role === "customer" && (
          <Button
            onClick={() => setShowForm(true)}
            size="sm"
            variant="outline"
            className="text-sm"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Amendment
          </Button>
        )}
      </div>
      <AnimatePresence mode="wait">
        {showForm && (
          <>
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 rounded-2xl border border-slate-100 bg-white p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-bold tracking-wider text-slate-900 uppercase">
                  Request Amendment
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-full p-2 transition-colors hover:bg-slate-100"
                >
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>
              <form
                onSubmit={handleSubmit(onCreateAmendment)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <label className="mb-1.5 block text-sm font-medium tracking-wider text-slate-500 uppercase">
                    Amendment Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setAmendmentType("text")}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 border-slate-100 p-4 text-slate-500 transition-all outline-none hover:border-slate-200",
                        amendmentType === "text" &&
                          "border-brand hover:border-brand bg-brand/5 text-brand",
                      )}
                    >
                      <FileText className="h-6 w-6" />
                      <span className="text-sm font-medium uppercase">
                        Text{" "}
                        <span className="max-small-mobile:hidden">
                          Correction
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmendmentType("pdf")}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 border-slate-100 p-4 text-slate-500 transition-all outline-none hover:border-slate-200",
                        amendmentType === "pdf" &&
                          "border-brand bg-brand/5 text-brand hover:border-brand",
                      )}
                    >
                      <Upload className="h-6 w-6" />
                      <span className="text-sm font-medium uppercase">
                        <span className="max-small-mobile:hidden">Upload</span>{" "}
                        PDF
                      </span>
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {amendmentType === "text" ? (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-2"
                    >
                      <label className="mb-1.5 block text-sm font-medium tracking-wider text-slate-500 uppercase">
                        Corrections Details
                      </label>
                      <textarea
                        {...register("content")}
                        disabled={isPending}
                        placeholder="Describe the changes needed (e.g., 'Consignee address should be...', 'Change weight to...')"
                        className="focus-visible:ring-brand flex h-30 w-full rounded-md border border-slate-200 bg-white px-3 py-2 ring-offset-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      {errors.content && (
                        <p className="font-medium text-red-500">
                          {errors.content.message}
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pdf"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <label className="mb-1.5 block text-sm font-medium tracking-wider text-slate-500 uppercase">
                        Upload Marked Draft
                      </label>

                      <div className="relative">
                        <input
                          id="amend-file"
                          type="file"
                          accept=".pdf"
                          className="hidden"
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
                          htmlFor="amend-file"
                          className={`hover:border-brand hover:bg-brand/2 group flex h-30 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 transition-all`}
                        >
                          <div className="bg-brand/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                            <Upload className="text-brand h-6 w-6" />
                          </div>
                          <p className="text-slate-500 group-hover:text-slate-700">
                            Click or drag to upload
                          </p>
                          <span className="mt-1 text-xs tracking-tighter text-slate-400 uppercase">
                            PDF up to 5MB
                          </span>
                        </label>
                      </div>
                      {errors.file && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.file.message}
                        </p>
                      )}
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
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isPending}
                    isLoading={isPending}
                  >
                    Submit{" "}
                    <span className="max-small-mobile:hidden ml-1">
                      Request
                    </span>
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <motion.div
        key="list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
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

        {!isLoading && amendments && amendments.length > 0 && (
          <div className="space-y-4">
            {amendments.map((amendment: any) => {
              const isFile = !!amendment.fileUrl;

              return (
                <div
                  key={amendment._id}
                  className="hover:border-brand/20 hover:bg-brand/1 group max-small-mobile:items-end flex items-start justify-between gap-2 rounded-2xl border border-slate-50 p-4 transition-all"
                >
                  {/* LEFT */}
                  <div className="max-small-mobile:flex-col max-small-mobile:items-start flex items-start gap-4">
                    {/* ICON */}
                    <div className="bg-brand/5 group-hover:bg-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all">
                      {isFile ? (
                        <FileText className="text-brand h-6 w-6 group-hover:text-white" />
                      ) : (
                        <MessageSquare className="text-brand h-6 w-6 group-hover:text-white" />
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0">
                      {/* HEADER */}
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        {isFile ? (
                          <Link
                            to={amendment.fileUrl}
                            target="_blank"
                            className="text-sm font-bold text-slate-900"
                          >
                            PDF Amendment
                          </Link>
                        ) : (
                          <p className="text-sm font-bold text-slate-900">
                            Text Amendment
                          </p>
                        )}

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${getStatusColor(
                            "draft",
                          )}`}
                        >
                          draft
                        </span>
                      </div>

                      {/* BODY */}
                      {isFile ? (
                        <div className="flex items-center gap-3 text-[10px] tracking-wider text-slate-400 uppercase">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />v
                            {amendment.draftVersion} •{" "}
                            {moment(amendment.createdAt).format("ll")}
                          </span>
                          <span>{formatFileSize(amendment.fileSize)}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p
                            onClick={() => setSeeMore((see) => !see)}
                            className={cn(
                              "max-w-xl text-sm text-slate-600 transition-all hover:text-slate-900",
                              seeMore && "line-clamp-3",
                            )}
                          >
                            {amendment.content}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] tracking-wider text-slate-400 uppercase">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />v
                              {amendment.draftVersion} •{" "}
                              {moment(amendment.createdAt).format("ll")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT ACTIONS */}
                  <div className="max-small-mobile:opacity-100 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {isFile && (
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        className="max-small-mobile:hidden hover:text-brand hover:bg-brand/5 rounded-lg p-2 text-slate-400 transition-all"
                        title="View Document"
                        to={amendment.fileUrl}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(!amendments?.length || error) && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <FileText className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              No Amendments here
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Click to send amendment.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
export default AmendmentsManager;
