import Button from "../Button";
import Input from "../Input";

const CreateInvoiceForm = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <form className="space-y-6">
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
        <Input label="Invoice Number" />
        <Input label="Customer Name" placeholder="e.g. Global Trade Co." />
      </div>
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
        <Input
          label="Amount (USD)"
          type="number"
          step="0.01"
          placeholder="0.00"
        />
        <Input label="Due Date" type="date" />
      </div>

      <div className="5 space-y-1">
        <label className="font-medium text-slate-700">
          Description / Line Items
        </label>
        <textarea
          className="focus-visible:ring-brand flex min-h-25 w-full rounded-md border border-slate-200 bg-white px-3 py-2 focus-visible:ring-2 focus-visible:outline-none"
          placeholder="e.g. Freight charges for SHA-LAX shipment..."
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  );
};
export default CreateInvoiceForm;
