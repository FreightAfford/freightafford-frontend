import { MailCheck, RotateCw } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type SubmitEvent,
} from "react";
import { useNavigate, useSearchParams } from "react-router";
import Button from "../../components/Button";
import KycChecklist from "../../components/auth/KycChecklist";
import TextLink from "../../components/auth/TextLink";
import { useResendOtp, useVerifyOtp } from "../../hooks/useAuthService";
import AuthSplitLayout from "../../layout/AuthSplitLayout";
import { AUTH_HEADING, AUTH_SUBMIT, TEXT_LINK } from "../../utils/authStyles";
import cn from "../../utils/cn";

const OTP_LENGTH = 6;

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email")!;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState<number>(60);
  const [error, setError] = useState<string | null>(null);

  const { verifyOtp, isPending } = useVerifyOtp();
  const { resendOtp, isPending: isResending } = useResendOtp();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onVerifyOtp = (otpCode: string) => {
    setError(null);
    verifyOtp({ email, otp: otpCode }, { onSuccess: () => navigate("/login") });
  };

  const handleInput = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();

    const joined = newOtp.join("");

    if (joined.length === OTP_LENGTH && !joined.includes(""))
      onVerifyOtp(joined);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
        return;
      }

      if (index > 0) inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const pasted = e.clipboardData?.getData("text").slice(0, OTP_LENGTH);

    if (!/^\d+$/.test(pasted)) return;

    const pasteArray = pasted?.split("");

    const newOtp = [...otp];

    pasteArray?.forEach((char, index) => {
      newOtp[index] = char;
      if (inputRefs.current[index]) inputRefs.current[index].value = char;
    });

    setOtp(newOtp);

    if (pasteArray.length === OTP_LENGTH) onVerifyOtp(pasteArray.join(""));
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length !== OTP_LENGTH) {
      setError("Enter the completed verification code.");
      return;
    }

    onVerifyOtp(code);
  };

  const handleResend = () => {
    resendOtp(email, { onSuccess: () => setTimer(60) });
  };
  return (
    // After confirming their email, people verify their business next, so
    // the checklist from sign-up stays beside them.
    <AuthSplitLayout aside={<KycChecklist />}>
      <h1 className={AUTH_HEADING}>Confirm your email</h1>
      <p className="mt-2 leading-relaxed text-slate-500">
        Enter the 6-digit code we sent to{" "}
        {email ? (
          <span className="font-medium break-all text-slate-900">{email}</span>
        ) : (
          "your email address"
        )}
        .
      </p>

      <form
        noValidate
        onSubmit={handleSubmit}
        onPaste={handlePaste}
        className="mt-8 space-y-5"
      >
        <fieldset>
          <legend className="font-display mb-1.5 block text-sm font-semibold text-slate-800">
            Verification code
          </legend>
          <div className="grid grid-cols-6 gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(e) => {
                  inputRefs.current[i] = e;
                }}
                onChange={(e) => handleInput(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                className={cn(
                  "font-display h-14 min-w-0 rounded-xl border bg-white text-center text-xl font-bold text-slate-900 transition-[border-color,box-shadow] duration-150 outline-none focus:shadow-[0_0_0_3px_rgb(30_144_255/0.15)] disabled:opacity-60",
                  error
                    ? "border-red-400 bg-red-50/50"
                    : digit
                      ? "focus:border-brand border-slate-300"
                      : "focus:border-brand border-slate-200 hover:border-slate-300",
                )}
                disabled={isPending}
              />
            ))}
          </div>
          {error && (
            <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>
          )}
        </fieldset>

        <Button
          icon={MailCheck}
          type="submit"
          size="lg"
          className={AUTH_SUBMIT}
          disabled={isPending}
          isLoading={isPending}
        >
          Confirm email
        </Button>
      </form>

      <p className="mt-6 text-slate-500">
        Didn't get it?{" "}
        {timer > 0 ? (
          <span className="font-medium text-slate-400">Resend in {timer}s</span>
        ) : (
          <button
            type="button"
            disabled={isPending || isResending}
            onClick={handleResend}
            className={`${TEXT_LINK} inline-flex items-center gap-1`}
          >
            <RotateCw aria-hidden="true" className="h-3.5 w-3.5" />
            {isResending ? "Sending…" : "Resend code"}
          </button>
        )}
      </p>
      <p className="mt-2 text-slate-500">
        Wrong email? <TextLink to="/register">Sign up again</TextLink>
      </p>
    </AuthSplitLayout>
  );
};
export default VerifyOtpPage;
