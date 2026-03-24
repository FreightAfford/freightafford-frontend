import { Link, useNavigate, useParams } from "react-router";
import AuthLayout from "../../layout/AuthLayout";
import { Ship } from "lucide-react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useResetPassword } from "../../hooks/useAuthService";
import { useForm } from "react-hook-form";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "../../validations/authValidation";
import { zodResolver } from "@hookform/resolvers/zod";

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
    <AuthLayout>
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="group flex items-center justify-center gap-2">
          <div className="bg-brand/10 group-hover:bg-brand/20 rounded-xl p-2 transition-colors">
            <Ship className="text-brand h-10 w-10" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Freight Afford
          </span>
        </Link>
        <h2 className="mt-8 text-center text-3xl font-extrabold text-white">
          Set New Password
        </h2>
        <p className="mt-2 text-center text-slate-400">
          Please enter your new password below to secure your account.
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-md">
        <Card className="border border-white/20 p-4 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit(onResetPassword)} className="space-y-6">
            <Input
              label="New Password"
              type="password"
              placeholder="************"
              {...register("password")}
              error={errors.password?.message}
              disabled={isPending}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="************"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              disabled={isPending}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isPending}
              disabled={isPending}
            >
              Reset Password
            </Button>
          </form>
        </Card>
      </div>
    </AuthLayout>
  );
};
export default ResetPasswordPage;
