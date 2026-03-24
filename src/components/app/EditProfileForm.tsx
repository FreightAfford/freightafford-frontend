import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUpdateUserProfile } from "../../hooks/useAuthService";
import {
  profileSchema,
  type ProfileFormValues,
} from "../../validations/authValidation";
import Button from "../Button";
import Input from "../Input";

const EditProfileForm = ({
  initialData,
  onCancel,
}: {
  onCancel: () => void;
  initialData: {
    fullname: string;
    email: string;
    phoneNumber: string;
    companyName: string;
    companyAddress: string;
    country: string;
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const { updateUserProfile, isPending } = useUpdateUserProfile();

  const onUpdateProfile = (data: ProfileFormValues) => {
    updateUserProfile(data, { onSuccess: () => onCancel() });
  };
  return (
    <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
      <Input
        label="Full Name"
        placeholder="Frank Andy"
        {...register("fullname")}
        error={errors.fullname?.message}
        disabled={isPending}
        className="capitalize"
      />
      <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-6">
        <Input
          label="Phone Number"
          type="phone"
          placeholder="+234 916 581 2629"
          {...register("phoneNumber")}
          error={errors.phoneNumber?.message}
          disabled={isPending}
        />
        <Input
          label="Country"
          placeholder="Nigeria"
          {...register("country")}
          error={errors.country?.message}
          disabled={isPending}
        />
      </div>
      <div className="space-y-6 border-t border-slate-100 pt-4">
        <h4 className="font-bold tracking-wider text-slate-900 uppercase">
          Company Information
        </h4>
        <Input
          label="Company Name"
          placeholder="Logistics Corp"
          {...register("companyName")}
          error={errors.companyName?.message}
          disabled={isPending}
        />
        <Input
          label="Company Address"
          placeholder="123 Business Ave, Suite 100"
          {...register("companyAddress")}
          error={errors.companyAddress?.message}
          disabled={isPending}
        />
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} isLoading={isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};
export default EditProfileForm;
