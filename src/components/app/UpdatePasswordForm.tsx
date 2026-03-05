import Button from "../Button";
import Input from "../Input";

const UpdatePasswordForm = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <form className="space-y-6">
      <Input label="Current Password" type="password" placeholder="••••••••" />
      <Input label="New Password" type="password" placeholder="••••••••" />
      <Input label="Confirm Password" type="password" placeholder="••••••••" />
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Password</Button>
      </div>
    </form>
  );
};
export default UpdatePasswordForm;
