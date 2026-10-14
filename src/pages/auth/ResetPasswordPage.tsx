import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import Button from "../../components/Button";
import PasswordInput from "../../components/PasswordInput";
import AccountAside from "../../components/auth/AccountAside";
import TextLink from "../../components/auth/TextLink";
import { useResetPassword } from "../../hooks/useAuthService";
import AuthSplitLayout from "../../layout/AuthSplitLayout";
import { AUTH_HEADING, AUTH_SUBMIT } from "../../utils/authStyles";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "../../validations/authValidation";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const { resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onResetPassword = (data: ResetPasswordValues) => {
    if (!token) return;

    resetPassword(
      { token, password: data.password },
      { onSuccess: () => navigate("/login") },
    );
  };

  return (
    <AuthSplitLayout aside={<AccountAside />}>
      <h1 className={AUTH_HEADING}>Set a new password</h1>
      <p className="mt-2 text-slate-500">
        Choose a password you haven't used here before.
      </p>

      <form
        noValidate
        onSubmit={handleSubmit(onResetPassword)}
        className="mt-8 space-y-5"
      >
        <PasswordInput
          variant="icon"
          icon={Lock}
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          {...register("password")}
          error={errors.password?.message}
          disabled={isPending}
        />
        <PasswordInput
          variant="icon"
          icon={Lock}
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Type it again"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          disabled={isPending}
        />
        <Button
          type="submit"
          size="lg"
          className={AUTH_SUBMIT}
          isLoading={isPending}
          disabled={isPending}
        >
          Reset password
        </Button>
      </form>

      <p className="mt-6 text-slate-500">
        Remembered it? <TextLink to="/login">Log in</TextLink>
      </p>
    </AuthSplitLayout>
  );
};
export default ResetPasswordPage;
