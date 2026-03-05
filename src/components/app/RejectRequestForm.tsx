import Button from "../Button";

const RejectRequestForm = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <form className="space-y-6">
      <div className="space-y-1.5">
        <label className="font-medium text-slate-700">
          Reason for Rejection
        </label>
        <textarea
          className="flex min-h-30 w-full rounded-md border border-slate-200 bg-white px-3 py-2 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
          placeholder="Explain why this request is being rejected..."
        />
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="bg-red-600 hover:bg-red-700"
        >
          Confirm Rejection
        </Button>
      </div>
    </form>
  );
};
export default RejectRequestForm;
