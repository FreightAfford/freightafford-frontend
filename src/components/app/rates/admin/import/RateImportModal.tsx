import { AlertCircle, CheckCircle2, FileUp } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCommitRateImport } from "../../../../../hooks/useRateService";
import type { ImportResult } from "../../../../../services/api/rate";
import Button from "../../../../Button";
import Modal from "../../../../Modal";
import SmallLoader from "../../../../SmallLoader";
import ImportDropzone from "./ImportDropzone";
import ImportReview from "./ImportReview";
import { useRateImport } from "./useRateImport";

const FOOTER =
  "max-medium-mobile:-mx-4 max-medium-mobile:-mb-4 max-medium-mobile:px-4 max-medium-mobile:-bottom-4 sticky -bottom-6 z-20 -mx-6 -mb-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4";

const saveFile = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Bulk import: choose a file → it's read and matched → review → import.
// Nothing is saved until "Import" is pressed.
const ImportWindow = ({ onClose }: { onClose: () => void }) => {
  const state = useRateImport();
  const { commitImport, isPending: saving } = useCommitRateImport();
  const [result, setResult] = useState<ImportResult | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadTemplate = async () => {
    setDownloading(true);
    try {
      const { buildTemplate, TEMPLATE_FILE_NAME } =
        await import("../../../../../utils/rateImport/buildTemplate");
      saveFile(await buildTemplate(), TEMPLATE_FILE_NAME);
    } catch {
      toast.error("The template couldn't be made. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  const save = () => {
    setSaveError(null);
    commitImport(
      {
        rates: state.toSave.map((r) => ({
          rate: r.input!,
          replaces: r.check!.replaces,
        })),
        mappings: state.mappings,
      },
      {
        onSuccess: setResult,
        onError: (err) =>
          setSaveError(
            (err as { message?: string } | null)?.message ??
              "The rates couldn't be saved. Nothing was imported; try again.",
          ),
      },
    );
  };

  if (result)
    return (
      <div className="space-y-6 py-4 text-center">
        <span className="bg-kelp/10 text-kelp mx-auto flex h-14 w-14 items-center justify-center rounded-full">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <div>
          <p className="font-display text-lg font-bold text-slate-900">
            {result.created + result.replaced}{" "}
            {result.created + result.replaced === 1 ? "rate" : "rates"} imported
          </p>
          <p className="mt-1 text-slate-600">
            {result.created} new, {result.replaced} replaced
            {result.resolvedRequests
              ? `, and ${result.resolvedRequests} customer rate ${result.resolvedRequests === 1 ? "request" : "requests"} answered`
              : ""}
            . Verified customers can see them now.
          </p>
        </div>
        <Button onClick={onClose} className="rounded-xl">
          Done
        </Button>
      </div>
    );

  if (state.reading)
    return (
      <p className="flex items-center justify-center gap-2 py-16 text-slate-600">
        <SmallLoader /> Reading {state.file?.name}…
      </p>
    );

  if (!state.parsed)
    return (
      <ImportDropzone
        onFile={state.readFile}
        error={state.fileError}
        onDownloadTemplate={downloadTemplate}
        downloading={downloading}
      />
    );

  const busy = state.matching || state.checking;
  const count = state.toSave.length;
  // Why Import is off, in a few words.
  const reason = busy
    ? "Checking…"
    : state.waiting
      ? `Match the ${state.unmatched.filter((u) => !u.chosen).length === 1 ? "name" : "names"} above to import ${state.waiting === 1 ? "the last rate" : `${state.waiting} more rates`}`
      : !count
        ? "Nothing ticked can be imported"
        : null;

  return (
    <>
      <ImportReview state={state} />

      {saveError && (
        <p
          role="alert"
          className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {saveError}
        </p>
      )}

      <div className={`${FOOTER} mt-6`}>
        {reason && <p className="mr-auto text-sm text-slate-500">{reason}</p>}
        <Button
          type="button"
          variant="ghost"
          onClick={state.reset}
          disabled={saving}
        >
          Choose another file
        </Button>
        <Button
          type="button"
          icon={FileUp}
          onClick={save}
          isLoading={saving}
          disabled={saving || busy || !count || state.waiting > 0}
          className="max-small-mobile:w-full rounded-xl"
        >
          Import {count} {count === 1 ? "rate" : "rates"}
        </Button>
      </div>
    </>
  );
};

interface RateImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// The page gives it a new key per opening, so each import starts fresh.
const RateImportModal = ({ isOpen, onClose }: RateImportModalProps) => (
  <Modal title="Import rates" isOpen={isOpen} onClose={onClose} size="2xl">
    <ImportWindow onClose={onClose} />
  </Modal>
);

export default RateImportModal;
