import { Link } from "react-router";
import AuthLayout from "../../layout/AuthLayout";
import { Ship } from "lucide-react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import cn from "../../utils/cn";
import { useState } from "react";

const LoginPage = () => {
  const [role, setRole] = useState<"customer" | "admin">("customer");
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
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-brand hover:text-brand/80 font-medium transition-colors"
          >
            Register for free
          </Link>
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-md">
        <Card className="border border-white/20 p-4 shadow-2xl backdrop-blur-sm">
          <form className="space-y-6">
            <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={cn(
                  "flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium transition-all",
                  role === "customer"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={cn(
                  "flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium transition-all",
                  role === "admin"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                Admin
              </button>
            </div>
            <Input
              label="Email Address"
              type="email"
              placeholder={
                role === "customer"
                  ? "franklin@example.com"
                  : "admin@freightafford.com"
              }
              autoComplete="email"
              required
            />
            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="************"
                autoComplete="current-password"
                required
              />
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  title="Forgot Password"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full">
              Log in
            </Button>
          </form>
        </Card>
      </div>
    </AuthLayout>
  );
};
export default LoginPage;
