import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Ship } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import { useForgotPassword } from "../../hooks/useAuthService";
import AuthLayout from "../../layout/AuthLayout";
import {
  forgotPasswordSchema,
  type ForgotPasswordValue,
} from "../../validations/authValidation";

const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const { forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValue>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onForgotPassword = (data: ForgotPasswordValue) => {
    forgotPassword(data.email, { onSuccess: () => setIsSubmitted(true) });
  };

  if (isSubmitted)
    return (
      <AuthLayout>
        <div className="mx-auto w-full max-w-md">
          <Card className="max-mobile:p-4 rounded-2xl border border-white/20 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">
              Check your email
            </h2>
            <p className="mb-8 leading-relaxed text-slate-600">
              We've sent a password reset link to your email address. Please
              check your inbox and spam folder.
            </p>
            <Link to="/login">
              <Button variant="outline" className="h-12 w-full">
                Back to Login
              </Button>
            </Link>
          </Card>
        </div>
      </AuthLayout>
    );
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
          Reset your password
        </h2>
        <p className="mt-2 text-center text-slate-400">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-md">
        <Card className="border border-white/20 p-4 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit(onForgotPassword)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="franklin@example.com"
              {...register("email")}
              error={errors.email?.message}
              disabled={isPending}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPending}
              isLoading={isPending}
            >
              Send Reset Link
            </Button>
          </form>
        </Card>
      </div>
    </AuthLayout>
  );
};
export default ForgotPasswordPage;
