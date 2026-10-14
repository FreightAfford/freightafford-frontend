import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Lock, LogIn, Mail, MailWarning } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PasswordInput from "../../components/PasswordInput";
import AccountAside from "../../components/auth/AccountAside";
import TextLink from "../../components/auth/TextLink";
import { useLogin, useResendOtp } from "../../hooks/useAuthService";
import AuthSplitLayout from "../../layout/AuthSplitLayout";
import { getKycApi } from "../../services/api/kyc";
import { AUTH_HEADING, AUTH_SUBMIT } from "../../utils/authStyles";
import {
  loginSchema,
  type LoginFormValues,
} from "../../validations/authValidation";

type LoginProblem =
  | { kind: "unverified"; email: string }
  | { kind: "error"; message: string };

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isPending } = useLogin();
  const queryClient = useQueryClient();
  const { resendOtp, isPending: isResending } = useResendOtp();
  const [problem, setProblem] = useState<LoginProblem | null>(null);

  // Set by ProtectedRoute when someone was sent here from a dashboard page.
  const from = (location.state as { from?: string } | null)?.from;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onLogin = (data: LoginFormValues) => {
    setProblem(null);
    login(data, {
      onSuccess: async (res) => {
        const home = res.role === "admin" ? "/app/admin" : "/app/customer";
        // Only go back to a page this role can open.
        if (from?.startsWith(home)) return navigate(from, { replace: true });

        // Customers who haven't finished verifying go straight to it: it's
        // the only thing they can usefully do before booking.
        if (res.role === "customer") {
          const kyc = await queryClient
            .fetchQuery({ queryKey: ["kyc"], queryFn: getKycApi })
            .catch(() => null);
          const status = kyc?.data.status;
          if (status === "not_started" || status === "draft")
            return navigate("/app/customer/verification", { replace: true });
        }
        navigate(home, { replace: true });
      },
      onError: (error: unknown) => {
        const { statusCode, message } = (error ?? {}) as {
          statusCode?: number;
          message?: string;
        };
        if (statusCode === 403)
          return setProblem({ kind: "unverified", email: data.email });
        setProblem({
          kind: "error",
          message:
            statusCode === 401
              ? "That email and password don't match. Check them and try again, or reset your password."
              : (message ?? "Login didn't go through. Try again."),
        });
      },
    });
  };

  const sendCode = (email: string) =>
    resendOtp(email, {
      onSuccess: () =>
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`),
    });

  return (
    <AuthSplitLayout aside={<AccountAside />}>
      <h1 className={AUTH_HEADING}>Log in</h1>
      <p className="mt-2 text-slate-500">
        New to Freightafford?{" "}
        <TextLink to="/register">Create an account</TextLink>
      </p>

      <form
        noValidate
        onSubmit={handleSubmit(onLogin)}
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
        <div className="space-y-2">
          <PasswordInput
            icon={Lock}
            label="Password"
            {...register("password")}
            error={errors.password?.message}
            disabled={isPending}
          />
          <div className="flex justify-end">
            <TextLink to="/forgot-password" className="text-sm">
              Forgot password?
            </TextLink>
          </div>
        </div>

        {problem?.kind === "unverified" && (
          <div
            role="alert"
            className="border-ochre/40 bg-ochre/10 flex gap-3 rounded-xl border p-4"
          >
            <MailWarning
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[#9a6a0c]"
            />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">
                Confirm your email first
              </p>
              <p className="mt-1 text-sm text-slate-600">
                We'll send a new 6-digit code to{" "}
                <span className="font-medium break-all text-slate-900">
                  {problem.email}
                </span>
                .
              </p>
              <Button
                icon={Mail}
                type="button"
                size="sm"
                className="mt-3"
                onClick={() => sendCode(problem.email)}
                isLoading={isResending}
              >
                Send code
              </Button>
            </div>
          </div>
        )}

        {problem?.kind === "error" && (
          <div
            role="alert"
            className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
            />
            <p className="text-sm text-red-700">{problem.message}</p>
          </div>
        )}

        <Button
          icon={LogIn}
          type="submit"
          size="lg"
          className={AUTH_SUBMIT}
          disabled={isPending}
          isLoading={isPending}
        >
          Log in
        </Button>
      </form>
    </AuthSplitLayout>
  );
};
export default LoginPage;
