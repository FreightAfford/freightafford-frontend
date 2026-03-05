import Button from "../Button";
import Input from "../Input";

const CounterOfferForm = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <form className="space-y-6">
      <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-slate-500">Customer's Proposed Price</p>
        <p className="text-2xl font-bold text-slate-900">$2,750</p>
      </div>
      <Input
        label="Your Counter Price (USD)"
        type="number"
        placeholder="e.g. 2600"
      />
      <div className="space-y-1.5">
        <label className="font-medium text-slate-700">
          Reason / Message to Customer
        </label>
        <textarea
          className="focus-visible:ring-brand flex min-h-25 w-full rounded-md border border-slate-200 bg-white px-3 py-2 focus-visible:ring-2 focus-visible:outline-none"
          placeholder="Explain why you are countering this price..."
        />
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Send Counter Offer</Button>
      </div>
    </form>
  );
};
export default CounterOfferForm;
