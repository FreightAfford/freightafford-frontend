import {
  Anchor,
  CalendarDays,
  MapPin,
  Save as SaveIcon,
  Ship,
  X,
} from "lucide-react";
import Button from "../Button";
import Input from "../Input";

const SailingScheduleForm = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <form className="space-y-6">
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
        <Input
          icon={Ship}
          label="Vessel Name"
          placeholder="e.g. MAERSK SEOUL"
        />
        <Input icon={Anchor} label="Shipping Line" placeholder="e.g. Maersk" />
      </div>
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
        <Input icon={CalendarDays} label="ETD (Departure)" type="date" />
        <Input icon={CalendarDays} label="ETA (Arrival)" type="date" />
      </div>
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
        <Input
          icon={MapPin}
          label="Origin Port"
          placeholder="e.g. Shanghai (SHA)"
        />
        <Input
          icon={MapPin}
          label="Destination Port"
          placeholder="e.g. Los Angeles (LAX)"
        />
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button icon={X} type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button icon={SaveIcon} type="submit">
          Save Schedule
        </Button>
      </div>
    </form>
  );
};
export default SailingScheduleForm;
