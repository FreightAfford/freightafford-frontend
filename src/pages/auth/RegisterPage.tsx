import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Building2,
  Lock,
  Mail,
  Package,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";
import Button from "../../components/Button";
import Checkbox from "../../components/Checkbox";
import Input from "../../components/Input";
import PasswordInput from "../../components/PasswordInput";
import PhoneInput from "../../components/PhoneInput";
import KycChecklist from "../../components/auth/KycChecklist";
import TextLink from "../../components/auth/TextLink";
import { useRegister } from "../../hooks/useAuthService";
import AuthSplitLayout from "../../layout/AuthSplitLayout";
import { AUTH_HEADING, AUTH_SUBMIT } from "../../utils/authStyles";
import cn from "../../utils/cn";
import { normalizeNigerianPhone } from "../../utils/phone";
import {
  registerSchema,
  type RegisterFormValues,
} from "../../validations/authValidation";

const ACCOUNT_TYPES = [
  {
    value: "export_agent",
    icon: Briefcase,
    title: "Export agent",
    detail: "I book shipments for exporters",
  },
  {
    value: "exporter",
    icon: Package,
    title: "Exporter",
    detail: "I ship my own goods",
  },
] as const;

const calculatePasswordStrength = (password: string) => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", width: "25%", color: "bg-red-400" };
  if (score === 2)
    return { label: "Fair", width: "50%", color: "bg-yellow-400" };
  if (score === 3) return { label: "Good", width: "75%", color: "bg-blue-400" };

  return { label: "Strong", width: "100%", color: "bg-green-500" };
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { accountType: "export_agent", acceptAgreement: false },
  });

  const passwordValue = useWatch({ control, name: "password" }) || "";
  const accountType = useWatch({ control, name: "accountType" });
  const strength = calculatePasswordStrength(passwordValue);

  const { register: registerUser, isPending } = useRegister();

  const onRegister = (data: RegisterFormValues) => {
    const payload = {
      accountType: data.accountType,
      fullname: data.fullname,
      email: data.email,
      phoneNumber: normalizeNigerianPhone(data.phoneNumber) ?? undefined,
      companyName: data.companyName,
      password: data.password,
      acceptTerms: true,
      acceptedFreightRules: true,
    };

    registerUser(payload, {
      onSuccess: () =>
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`),
    });
  };

  return (
    <AuthSplitLayout aside={<KycChecklist />}>
      <h1 className={AUTH_HEADING}>Create your account</h1>
      <p className="mt-2 text-slate-500">
        Already have an account? <TextLink to="/login">Log in</TextLink>
      </p>

      <form
        noValidate
        onSubmit={handleSubmit(onRegister)}
        className="mt-8 space-y-5"
      >
        <fieldset disabled={isPending}>
          <legend className="font-display mb-1.5 text-sm font-semibold text-slate-800">
            How will you use Freightafford?
          </legend>
          <div className="max-small-mobile:grid-cols-1 grid grid-cols-2 gap-3">
            {ACCOUNT_TYPES.map(({ value, icon: Icon, title, detail }) => (
              <label
                key={value}
                className={cn(
                  "has-focus-visible:ring-brand relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2",
                  accountType === value
                    ? "border-brand bg-brand/5"
                    : "border-slate-200 hover:border-slate-300",
                )}
              >
                <input
                  type="radio"
                  value={value}
                  className="sr-only"
                  {...register("accountType")}
                />
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    accountType === value ? "text-brand" : "text-slate-400",
                  )}
                />
                <span>
                  <span className="font-display block font-semibold text-slate-900">
                    {title}
                  </span>
                  <span className="block text-sm leading-snug text-slate-500">
                    {detail}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {errors.accountType && (
            <p className="mt-1.5 text-sm font-medium text-red-600">
              {errors.accountType.message}
            </p>
          )}
        </fieldset>

        <Input
          icon={User}
          label="Full name"
          autoComplete="name"
          placeholder="Adaeze Okafor"
          {...register("fullname")}
          error={errors.fullname?.message}
          disabled={isPending}
        />
        <Input
          icon={Mail}
          label="Work email"
          type="email"
          autoComplete="email"
          placeholder="adaeze@company.com"
          {...register("email")}
          error={errors.email?.message}
          disabled={isPending}
        />
        <PhoneInput
          icon={Phone}
          label="Phone number"
          {...register("phoneNumber")}
          error={errors.phoneNumber?.message}
          disabled={isPending}
        />
        <Input
          icon={Building2}
          label="Company name"
          autoComplete="organization"
          placeholder="As registered with CAC"
          {...register("companyName")}
          error={errors.companyName?.message}
          disabled={isPending}
        />

        <div className="space-y-2">
          <PasswordInput
            icon={Lock}
            label="Password"
            autoComplete="new-password"
            hint={passwordValue ? undefined : "At least 8 characters"}
            {...register("password")}
            error={errors.password?.message}
            disabled={isPending}
          />
          {passwordValue && (
            <div className="space-y-1" aria-live="polite">
              <span className="text-sm text-slate-500">
                Strength: {strength.label}
              </span>
              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: strength.width }}
                />
              </div>
            </div>
          )}
        </div>

        <Checkbox
          disabled={isPending}
          error={errors.acceptAgreement?.message}
          {...register("acceptAgreement")}
          label={
            <span>
              I accept the <TextLink to="/terms">Terms & Conditions</TextLink>{" "}
              and <TextLink to="/freight-rules">Freight Rules</TextLink>
            </span>
          }
        />

        <Button
          icon={UserPlus}
          type="submit"
          size="lg"
          className={AUTH_SUBMIT}
          disabled={isPending}
          isLoading={isPending}
        >
          Create account
        </Button>
      </form>
    </AuthSplitLayout>
  );
};
export default RegisterPage;
