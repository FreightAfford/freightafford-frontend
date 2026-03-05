import Button from "../Button";
import Input from "../Input";

const EditProfileForm = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <form className="space-y-6">
      <Input label="Full Name" placeholder="Frank Andy" />
      <Input
        label="Email Address"
        type="email"
        placeholder="frank@example.com"
      />
      <Input
        label="Phone Number"
        type="phone"
        placeholder="+234 916 581 2629"
      />
      <Input label="Location" placeholder="Nkanu West, EU" />
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};
export default EditProfileForm;
