import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/Button";
import Input from "../../components/Input";
import AccountAside from "../../components/auth/AccountAside";
import TextLink from "../../components/auth/TextLink";
import { useForgotPassword } from "../../hooks/useAuthService";
import AuthSplitLayout from "../../layout/AuthSplitLayout";
import { AUTH_HEADING, AUTH_SUBMIT } from "../../utils/authStyles";
import {
  forgotPasswordSchema,
  type ForgotPasswordValue,
} from "../../validations/authValidation";

const ForgotPasswordPage = () => {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValue>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onForgotPassword = (data: ForgotPasswordValue) => {
    forgotPassword(data.email, { onSuccess: () => setSentTo(data.email) });
  };

  if (sentTo)
    return (
      <AuthSplitLayout aside={<AccountAside />}>
        <span className="bg-kelp/10 text-kelp flex h-12 w-12 items-center justify-center rounded-xl">
          <MailCheck aria-hidden="true" className="h-6 w-6" />
        </span>
        <h1 className={`${AUTH_HEADING} mt-6`}>Check your email</h1>
        <p className="mt-2 leading-relaxed text-slate-500">
          We've sent a password reset link to{" "}
          <span className="font-medium break-all text-slate-900">{sentTo}</span>
          . If it isn't in your inbox, check your spam folder.
        </p>
        <p className="mt-8 text-slate-500">
          Remembered it? <TextLink to="/login">Log in</TextLink>
        </p>
      </AuthSplitLayout>
    );

  return (
    <AuthSplitLayout aside={<AccountAside />}>
      <h1 className={AUTH_HEADING}>Reset your password</h1>
      <p className="mt-2 text-slate-500">
        Enter the email you signed up with and we'll send you a reset link.
      </p>

      <form
        noValidate
        onSubmit={handleSubmit(onForgotPassword)}
        className="mt-8 space-y-5"
      >
        <Input
          icon={Mail}
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          {...register("email")}
          error={errors.email?.message}
          disabled={isPending}
        />
        <Button
          icon={Mail}
          type="submit"
          size="lg"
          className={AUTH_SUBMIT}
          disabled={isPending}
          isLoading={isPending}
        >
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-slate-500">
        Remembered it? <TextLink to="/login">Log in</TextLink>
      </p>
    </AuthSplitLayout>
  );
};
export default ForgotPasswordPage;
