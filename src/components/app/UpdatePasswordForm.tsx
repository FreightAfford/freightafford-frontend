import { useForm } from "react-hook-form";
import { useChangePassword } from "../../hooks/useAuthService";
import Button from "../Button";
import Input from "../Input";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../../validations/authValidation";
import { zodResolver } from "@hookform/resolvers/zod";

const UpdatePasswordForm = ({ onCancel }: { onCancel: () => void }) => {
  const { changePassword, isPending } = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePassword = (data: ChangePasswordFormValues) =>
    changePassword(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          reset();
          onCancel();
        },
      },
    );
  return (
    <form onSubmit={handleSubmit(onChangePassword)} className="space-y-6">
      <Input
        label="Current Password"
        type="password"
        placeholder="••••••••"
        {...register("currentPassword")}
        error={errors.currentPassword?.message}
      />
      <Input
        label="New Password"
        type="password"
        placeholder="••••••••"
        {...register("newPassword")}
        error={errors.newPassword?.message}
      />
      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />
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
          Update Password
        </Button>
      </div>
    </form>
  );
};
export default UpdatePasswordForm;
