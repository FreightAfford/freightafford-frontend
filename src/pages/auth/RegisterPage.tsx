import { Link } from "react-router";
import AuthLayout from "../../layout/AuthLayout";
import { Check, CheckCircle2, ShieldCheck, Ship } from "lucide-react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Checkbox from "../../components/Checkbox";
import Button from "../../components/Button";
import { useState } from "react";

const RegisterPage = () => {
  const [isSubmitted] = useState<boolean>(false);

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
              We've sent an OTP link to your email address. Please check your
              inbox and spam folder to proceed with your email verification.
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-brand hover:text-brand/80 font-medium transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-md">
        <Card className="border border-white/20 p-4 shadow-2xl backdrop-blur-sm">
          <form className="space-y-6">
            <Input
              label="Full Name"
              placeholder="Frank Andy"
              autoComplete="name"
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="franklin@example.com"
              autoComplete="email"
              required
            />
            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Strength: Strong
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-1/2 bg-green-400" />
                </div>
              </div>
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />

            <Checkbox
              label={
                <span>
                  I accept the{" "}
                  <Link to="/terms" className="text-slate-900 hover:underline">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/freight-rules"
                    className="text-slate-900 hover:underline"
                  >
                    Freight Rules
                  </Link>
                </span>
              }
            />

            <Button type="submit" size="lg" className="w-full">
              Register
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500">
                  Secure Registration
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-4 text-slate-400">
              <ShieldCheck className="h-6 w-6" />
              <Check className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
};
export default RegisterPage;
