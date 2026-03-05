import Button from "../Button";
import Input from "../Input";

const SailingScheduleForm = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <form className="space-y-6">
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
        <Input label="Vessel Name" placeholder="e.g. MAERSK SEOUL" />
        <Input label="Shipping Line" placeholder="e.g. Maersk" />
      </div>
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
        <Input label="ETD (Departure)" type="date" placeholder="date" />
        <Input label="ETA (Arrival)" type="date" placeholder="e.g. Maersk" />
      </div>
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
        <Input label="Origin Port" placeholder="e.g. Shanghai (SHA)" />
        <Input label="Destination Port" placeholder="e.g. Los Angeles (LAX)" />
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Schedule</Button>
      </div>
    </form>
  );
};
export default SailingScheduleForm;
