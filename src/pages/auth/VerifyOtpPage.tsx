import { Link } from "react-router";
import AuthLayout from "../../layout/AuthLayout";
import { Ship } from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type InputEvent,
  type KeyboardEvent,
} from "react";

const VerifyOtpPage = () => {
  const otpArray = Array(6).fill("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>(otpArray);
  const [timer, setTimer] = useState<number>(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInput = (e: InputEvent<HTMLInputElement>, index: number) => {
    if (
      e.currentTarget.value.length > 0 &&
      index < inputRefs.current.length - 1
    )
      inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && e.currentTarget.value === "" && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent) => {
    const paste = e.clipboardData?.getData("text");
    const pasteArray = paste?.split("");
    pasteArray?.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
        inputRefs.current[index].focus();
      }
    });
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
          <form className="space-y-6">
            <div className="grid grid-cols-6 gap-2">
              {otpArray.map((_, i) => (
                <input
                  key={i}
                  ref={(e) => {
                    inputRefs.current[i] = e;
                  }}
                  onInput={(e) => handleInput(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="focus:ring-brand h-14 rounded-lg border border-slate-200 px-3 py-2 text-center text-xl font-bold transition-all focus:ring-2 focus:outline-none"
                  required
                />
              ))}
            </div>
            <Button type="submit" size="lg" className="w-full">
              Verify Code
            </Button>
            <div className="text-center">
              <button
                type="button"
                disabled={timer > 0}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
              >
                {timer > 0 ? `Resend code in ${timer}s` : "Resend code"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </AuthLayout>
  );
};
export default VerifyOtpPage;
