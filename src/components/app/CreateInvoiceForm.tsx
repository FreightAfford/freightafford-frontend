import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, FileUp, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { useUploadInvoice } from "../../hooks/useInvoiceService";
import { formatFileSize } from "../../utils/helpers";
import {
  uploadInvoiceSchema,
  type UploadInvoiceFormValues,
} from "../../validations/invoiceValidation";
import Button from "../Button";
import Input from "../Input";

const CreateInvoiceForm = ({
  bookingId,
  onCancel,
}: {
  bookingId: string;
  onCancel: () => void;
}) => {
  const today = new Date().toISOString().split("T")[0];
  const { id } = useParams();
  const { uploadInvoice, isPending } = useUploadInvoice(bookingId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    trigger,
  } = useForm<UploadInvoiceFormValues>({
    resolver: zodResolver(uploadInvoiceSchema),
    mode: "onChange",
    defaultValues: {
      dueDate: today,
    },
  });

  const onUploadInvoice = (data: UploadInvoiceFormValues) =>
    uploadInvoice(
      { bookingId: id!, data },
      {
        onSuccess: () => {
          reset();
          setSelectedFile(null);
          onCancel();
        },
      },
    );

  return (
    <form onSubmit={handleSubmit(onUploadInvoice)} className="space-y-6">
      <div>
        <input
          type="file"
          id="bl-file"
          className="hidden"
          accept="application/pdf"
          onChange={async (e) => {
            const files = e.target.files;
            if (files) {
              setSelectedFile(files[0]);
              setValue("invoice", files);
              await trigger("invoice");
            }
          }}
          disabled={isPending}
        />
        <label
          htmlFor="bl-file"
          className="hover:border-brand hover:bg-brand/2 group flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 transition-all"
        >
          <FileUp className="group-hover:text-brand mb-2 h-8 w-8 text-slate-300 transition-colors" />
          <span className="text-slate-500 group-hover:text-slate-700">
            Click to select document
          </span>
          <span className="mt-1 text-xs tracking-tighter text-slate-400 uppercase">
            PDF up to 5MB
          </span>
        </label>
        {errors.invoice && (
          <p className="mt-1 font-medium text-red-500">
            {errors.invoice.message}
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
                setValue("invoice", new DataTransfer().files);
              }}
              disabled={isPending}
              className="ml-2 shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <Input
        label="Due Date"
        type="date"
        {...register("dueDate")}
        error={errors.dueDate?.message}
        disabled={isPending}
        min={today}
      />

      <div className="5 space-y-1">
        <label className="font-medium text-slate-700">
          Description / Line Items
        </label>
        <textarea
          {...register("description")}
          disabled={isPending}
          className="focus-visible:ring-brand flex min-h-25 w-full rounded-md border border-slate-200 bg-white px-3 py-2 focus-visible:ring-2 focus-visible:outline-none"
          placeholder="e.g. Freight charges for SHA-LAX shipment..."
        />
        {errors.description && (
          <p className="font-medium text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} isLoading={isPending}>
          Create Invoice
        </Button>
      </div>
    </form>
  );
};
export default CreateInvoiceForm;
