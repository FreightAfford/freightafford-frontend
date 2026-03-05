import Button from "../Button";
import Input from "../Input";

const FreightRequestForm = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <form className="space-y-6">
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-medium text-slate-700">Container Size</label>
          <select className="focus-visible:ring-brand flex h-12 w-full rounded-md border border-slate-200 bg-white px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">
            <option value="20ft Std">20ft Standard</option>
            <option value="40ft Std">40ft Standard</option>
            <option value="40ft HC">40ft High Cube</option>
            <option value="45ft HC">45ft High Cube</option>
          </select>
        </div>
        <Input
          label="Proposed Price (USD)"
          type="number"
          placeholder="e.g. 2500"
        />
      </div>
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
        <Input label="Origin Port" placeholder="e.g. Shanghai, CN" />
        <Input label="Destination Port" placeholder="e.g. Los Angeles, US" />
      </div>
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
        <Input label="Commodity" placeholder="e.g. Electronics" />
        <Input label="Weight (kg)" type="number" placeholder="e.g. 15000" />
      </div>
      <Input label="Ready Date" type="date" />
      <div className="space-y-1.5">
        <label className="font-medium text-slate-700">Additional Notes</label>
        <textarea
          className="focus-visible:ring-brand flex min-h-20 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          placeholder="Any special requirements..."
        />
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button onClick={onCancel} type="button" variant="ghost">
          Cancel
        </Button>
        <Button type="submit">Submit Request</Button>
      </div>
    </form>
  );
};
export default FreightRequestForm;
