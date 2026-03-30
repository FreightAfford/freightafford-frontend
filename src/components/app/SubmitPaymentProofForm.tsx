import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Upload, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSubmitProofPayment } from "../../hooks/useInvoiceService";
import { formatFileSize } from "../../utils/helpers";
import {
  submitPaymentProofSchema,
  type submitPaymentFormValues,
} from "../../validations/invoiceValidation";
import Button from "../Button";
import Input from "../Input";

interface SubmitPaymentProofProps {
  onCancel: () => void;
  bookingId: string;
  invoice: { invoiceId: string; invoiceNumber: string };
}

const SubmitPaymentProofForm = ({
  bookingId,
  onCancel,
  invoice,
}: SubmitPaymentProofProps) => {
  const { submitProof, isPending } = useSubmitProofPayment(bookingId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    reset,
    setValue,
  } = useForm<submitPaymentFormValues>({
    resolver: zodResolver(submitPaymentProofSchema),
    mode: "onChange",
  });

  const onSubmitPaymentProof = (data: submitPaymentFormValues) =>
    submitProof(
      { invoiceId: invoice.invoiceId, data },
      {
        onSuccess: () => {
          reset();
          setSelectedFile(null);
          onCancel();
        },
      },
    );
  return (
    <form onSubmit={handleSubmit(onSubmitPaymentProof)} className="space-y-6">
      <div className="bg-brand/5 border-brand/10 mb-6 rounded-xl border p-4">
        <p className="text-slate-600">
          Please upload your bank transfer receipt or payment confirmation for
          invoice
          <span className="text-brand ml-1 font-bold">
            {invoice.invoiceNumber}
          </span>
          .
        </p>
      </div>

      <Input
        label="Payment Reference Number"
        placeholder="e.g. TRX-123456789"
        {...register("paymentReference")}
        error={errors.paymentReference?.message}
        disabled={isPending}
      />

      <div className="space-y-1.5">
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
          <p className="font-medium text-red-500">{errors.file.message}</p>
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
                setValue("file", new DataTransfer().files);
              }}
              disabled={isPending}
              className="ml-2 shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending} disabled={isPending}>
          Submit Payment
        </Button>
      </div>
    </form>
  );
};
export default SubmitPaymentProofForm;
