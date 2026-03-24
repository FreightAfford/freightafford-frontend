import { Ship } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type SubmitEvent,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import Button from "../../components/Button";
import Card from "../../components/Card";
import AuthLayout from "../../layout/AuthLayout";
import { useResendOtp, useVerifyOtp } from "../../hooks/useAuthService";

const OTP_LENGTH = 6;

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email")!;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState<number>(60);
  const [error, setError] = useState<string | null>(null);
  console.log(email);
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
          Verify your email
        </h2>
        <p className="mt-2 text-center text-slate-400">
          We've sent a 6-digit code to your email address.
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-md">
        <Card
          className="border border-white/20 p-4 shadow-2xl backdrop-blur-sm"
          onPaste={handlePaste}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-6 gap-2">
              {otp.map((_, i) => (
                <input
                  key={i}
                  ref={(e) => {
                    inputRefs.current[i] = e;
                  }}
                  onChange={(e) => handleInput(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="focus:ring-brand h-14 rounded-lg border border-slate-200 px-3 py-2 text-center text-xl font-bold transition-all focus:ring-2 focus:outline-none"
                  disabled={isPending}
                />
              ))}
            </div>

            {error && <p className="text-center text-red-500">{error}</p>}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPending}
              isLoading={isPending}
            >
              Verify Code
            </Button>
            <div className="text-center">
              <button
                type="button"
                disabled={timer > 0 || isPending}
                onClick={handleResend}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
              >
                {timer > 0
                  ? `Resend code in ${timer}s`
                  : isResending
                    ? "Sending..."
                    : "Resend code"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </AuthLayout>
  );
};
export default VerifyOtpPage;
