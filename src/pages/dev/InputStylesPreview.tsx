import {
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PasswordInput from "../../components/PasswordInput";
import cn from "../../utils/cn";

// DEV ONLY (/dev/input-styles): input field variations to choose from.
// Each card shows the same fields; "Work email" is drawn in its focused
// state so it can be compared without clicking. Everything is typeable.

type FieldProps = {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
  focused?: boolean;
  kind?: "text" | "phone" | "password";
  icon?: LucideIcon;
};

type BoxStyle = {
  label: string;
  box: string;
  // The same look twice: once as focus-within:, once applied directly for
  // the always-focused sample (Tailwind needs both spelled out).
  focusWithin: string;
  focusStatic: string;
  error: string;
  input: string;
  prefix: string;
  errorText: string;
  icons?: boolean;
};

const EyeToggle = ({
  shown,
  onToggle,
  className,
}: {
  shown: boolean;
  onToggle: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={shown ? "Hide password" : "Show password"}
    className={cn(
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:text-slate-700",
      className,
    )}
  >
    {shown ? (
      <EyeOff className="h-[18px] w-[18px]" />
    ) : (
      <Eye className="h-[18px] w-[18px]" />
    )}
  </button>
);

const makeField = (style: BoxStyle) => {
  const Field = ({
    label,
    placeholder,
    defaultValue,
    error,
    focused,
    kind = "text",
    icon: Icon,
  }: FieldProps) => {
    const id = useId();
    const [shown, setShown] = useState(false);
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className={style.label}>
          {label}
        </label>
        <div
          className={cn(
            "flex items-center",
            style.box,
            style.focusWithin,
            focused && style.focusStatic,
            error && style.error,
          )}
        >
          {style.icons && Icon && (
            <Icon
              aria-hidden="true"
              className="ml-4 h-[18px] w-[18px] shrink-0 text-slate-400"
            />
          )}
          {kind === "phone" && <span className={style.prefix}>+234</span>}
          <input
            id={id}
            type={kind === "password" && !shown ? "password" : "text"}
            placeholder={placeholder}
            defaultValue={defaultValue}
            className={cn(
              "min-w-0 flex-1 bg-transparent outline-none",
              style.input,
            )}
          />
          {kind === "password" && (
            <EyeToggle
              shown={shown}
              onToggle={() => setShown((s) => !s)}
              className="mr-1.5"
            />
          )}
        </div>
        {error && <p className={style.errorText}>{error}</p>}
      </div>
    );
  };
  return Field;
};

const STYLES: {
  name: string;
  note: string;
  style: BoxStyle;
  surface?: string;
}[] = [
  {
    name: "Current",
    note: "What the forms use today, for comparison.",
    style: {
      label: "leading-none font-medium tracking-wide text-slate-700",
      box: "h-12 rounded-md border border-slate-200 bg-white",
      focusWithin:
        "focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2",
      focusStatic: "ring-2 ring-brand ring-offset-2",
      error: "border-red-500",
      input: "h-full px-3 placeholder:text-slate-500",
      prefix:
        "flex h-full w-14 shrink-0 items-center justify-center border-r border-slate-200 text-slate-600",
      errorText: "font-medium text-red-500",
    },
  },
  {
    name: "Soft filled",
    note: "Grey fill, no border. Turns white with a blue ring on focus.",
    style: {
      label: "block text-sm font-semibold text-slate-800",
      box: "h-12 rounded-xl bg-slate-100 transition-[background-color,box-shadow]",
      focusWithin:
        "focus-within:bg-white focus-within:shadow-[0_0_0_2px_var(--color-brand)]",
      focusStatic: "bg-white shadow-[0_0_0_2px_var(--color-brand)]",
      error: "bg-red-50 shadow-[0_0_0_1.5px_rgb(239_68_68)]",
      input: "h-full px-4 text-slate-900 placeholder:text-slate-400",
      prefix: "pl-4 pr-1 font-medium text-slate-500",
      errorText: "text-sm font-medium text-red-600",
    },
  },
  {
    name: "Bold outline",
    note: "Taller, firmer border, rounder corners. Blue border and soft glow on focus.",
    style: {
      label: "block text-sm font-semibold text-slate-900",
      box: "h-14 rounded-xl border-[1.5px] border-slate-300 bg-white transition-[border-color,box-shadow]",
      focusWithin:
        "focus-within:border-brand focus-within:shadow-[0_0_0_4px_rgb(30_144_255/0.15)]",
      focusStatic: "border-brand shadow-[0_0_0_4px_rgb(30_144_255/0.15)]",
      error: "border-red-500 shadow-[0_0_0_4px_rgb(239_68_68/0.12)]",
      input:
        "h-full px-4 text-[1.0625rem] text-slate-900 placeholder:text-slate-400",
      prefix:
        "flex h-full shrink-0 items-center border-r-[1.5px] border-slate-200 px-4 font-semibold text-slate-700",
      errorText: "text-sm font-medium text-red-600",
    },
  },
  {
    name: "Underline",
    note: "No box, just a line. The line turns blue and thicker on focus.",
    style: {
      label: "block text-sm font-medium text-slate-500",
      box: "h-11 border-b-[1.5px] border-slate-300 transition-colors",
      focusWithin:
        "focus-within:border-brand focus-within:shadow-[0_1.5px_0_var(--color-brand)]",
      focusStatic: "border-brand shadow-[0_1.5px_0_var(--color-brand)]",
      error: "border-red-500",
      input:
        "h-full px-0 text-[1.0625rem] font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400",
      prefix: "pr-3 font-semibold text-slate-500",
      errorText: "text-sm font-medium text-red-600",
    },
  },
  {
    name: "Icon-led",
    note: "An icon at the start of every field. Chosen for Register and Login.",
    style: {
      label: "block text-sm font-semibold text-slate-800",
      box: "h-13 rounded-xl border border-slate-200 bg-white transition-[border-color,box-shadow]",
      focusWithin:
        "focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgb(30_144_255/0.15)]",
      focusStatic: "border-brand shadow-[0_0_0_3px_rgb(30_144_255/0.15)]",
      error: "border-red-400 bg-red-50/50",
      input: "h-full px-3 text-slate-900 placeholder:text-slate-400",
      prefix: "pl-2.5 font-medium text-slate-500",
      errorText: "text-sm font-medium text-red-600",
      icons: true,
    },
  },
  {
    name: "Raised",
    note: "White fields lifted off a grey card with a soft shadow, no border.",
    surface: "bg-mist",
    style: {
      label: "block text-sm font-semibold text-slate-800",
      box: "h-12 rounded-lg bg-white shadow-[0_1px_2px_rgb(10_35_66/0.06),0_2px_8px_rgb(10_35_66/0.06)] transition-shadow",
      focusWithin:
        "focus-within:shadow-[0_0_0_2px_var(--color-brand),0_4px_14px_rgb(30_144_255/0.18)]",
      focusStatic:
        "shadow-[0_0_0_2px_var(--color-brand),0_4px_14px_rgb(30_144_255/0.18)]",
      error:
        "shadow-[0_0_0_1.5px_rgb(239_68_68),0_2px_8px_rgb(239_68_68/0.12)]",
      input: "h-full px-4 text-slate-900 placeholder:text-slate-400",
      prefix: "pl-4 pr-1 font-medium text-slate-500",
      errorText: "text-sm font-medium text-red-600",
    },
  },
  {
    name: "Harbour ink",
    note: "Navy text and borders from the landing page. Ochre focus bar along the left edge.",
    style: {
      label: "block text-sm font-bold text-harbour",
      box: "h-12 rounded-lg border border-harbour/20 bg-white transition-[border-color,box-shadow]",
      focusWithin:
        "focus-within:border-harbour focus-within:shadow-[inset_4px_0_0_var(--color-ochre)]",
      focusStatic: "border-harbour shadow-[inset_4px_0_0_var(--color-ochre)]",
      error: "border-red-500 shadow-[inset_4px_0_0_rgb(239_68_68)]",
      input:
        "h-full px-4 font-medium text-harbour placeholder:font-normal placeholder:text-slate-400",
      prefix: "pl-4 pr-1 font-bold text-harbour/70",
      errorText: "text-sm font-semibold text-red-600",
    },
  },
];

// Floating label: the label sits inside the field and moves onto the border.
const FloatingField = ({
  label,
  placeholder,
  defaultValue,
  error,
  focused,
  kind = "text",
}: FieldProps) => {
  const id = useId();
  const [shown, setShown] = useState(false);
  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "focus-within:border-brand relative flex h-14 items-center rounded-xl border border-slate-300 bg-white transition-[border-color,box-shadow] focus-within:shadow-[0_0_0_1px_var(--color-brand)]",
          focused && "border-brand shadow-[0_0_0_1px_var(--color-brand)]",
          error && "border-red-500 shadow-[0_0_0_1px_rgb(239_68_68)]",
        )}
      >
        {kind === "phone" && (
          <span className="pl-4 font-medium text-slate-500">+234</span>
        )}
        <input
          id={id}
          type={kind === "password" && !shown ? "password" : "text"}
          // A space keeps :placeholder-shown working while showing nothing.
          placeholder={kind === "phone" ? placeholder : " "}
          defaultValue={defaultValue}
          className="peer h-full min-w-0 flex-1 bg-transparent px-4 pt-1 text-slate-900 outline-none placeholder:text-slate-400"
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-3 bg-white px-1 text-slate-500 transition-all duration-150",
            // Resting: inside the field. Raised: on the top border.
            "top-1/2 -translate-y-1/2 text-base",
            "peer-focus:text-brand peer-focus:top-0 peer-focus:text-[0.8125rem] peer-focus:font-medium",
            "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[0.8125rem] peer-[:not(:placeholder-shown)]:font-medium",
            (focused || kind === "phone") &&
              "top-0 text-[0.8125rem] font-medium",
            focused && "text-brand",
            error && "text-red-600 peer-focus:text-red-600",
          )}
        >
          {label}
        </label>
        {kind === "password" && (
          <EyeToggle
            shown={shown}
            onToggle={() => setShown((s) => !s)}
            className="mr-2"
          />
        )}
      </div>
      {error && (
        <p className="pl-4 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
};

const SampleForm = ({ Field }: { Field: (props: FieldProps) => ReactNode }) => (
  <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
    <Field label="Full name" defaultValue="Adaeze Okafor" icon={User} />
    <Field
      label="Work email"
      placeholder="adaeze@company.com"
      focused
      icon={Mail}
    />
    <Field
      label="Phone number"
      placeholder="803 123 4567"
      kind="phone"
      icon={Phone}
    />
    <Field
      label="Company name"
      placeholder="As registered with CAC"
      error="Enter your company's name"
      icon={Building2}
    />
    <Field
      label="Password"
      defaultValue="Harbour#2026"
      kind="password"
      icon={Lock}
    />
    <Button type="submit" size="lg" className="w-full">
      Create account
    </Button>
  </form>
);

const VARIANTS = [
  ...STYLES.map((variant) => ({ ...variant, Field: makeField(variant.style) })),
  {
    name: "Floating label",
    note: "The label starts inside the field and moves up onto the border when you type.",
    surface: undefined,
    Field: FloatingField,
  },
];

// Label font options, shown on the real Register fields (Icon-led input).
// Fonts outside the app's own are loaded only on this page.
const LABEL_FONTS = [
  { name: "Inter", note: "Today's label font, same as body text." },
  {
    name: "Plus Jakarta Sans",
    note: "The headline font. Labels would match the page titles.",
  },
  { name: "Manrope", note: "Geometric and open, slightly technical." },
  { name: "DM Sans", note: "Low contrast and compact, very clean." },
  { name: "Outfit", note: "Round and friendly geometric." },
  { name: "Sora", note: "Wide and modern, a little futuristic." },
  { name: "IBM Plex Sans", note: "Engineered and businesslike." },
  { name: "Space Grotesk", note: "Quirky grotesque with character." },
];

const EXTRA_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&family=DM+Sans:wght@500;600;700&family=Outfit:wght@500;600;700&family=Sora:wght@500;600;700&family=IBM+Plex+Sans:wght@500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap";

const useExtraFonts = () =>
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = EXTRA_FONTS_URL;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

const LabelFonts = () => {
  useExtraFonts();
  return (
    <div className="max-tablet:grid-cols-2 max-small-tablet:grid-cols-1 mt-10 grid grid-cols-4 gap-6">
      {LABEL_FONTS.map((font, i) => (
        <section
          key={font.name}
          // Every label inside this card takes the font being compared.
          style={{ "--label-font": `"${font.name}"` } as CSSProperties}
          className="rounded-2xl border border-slate-200 bg-white p-6 [&_label]:[font-family:var(--label-font)]"
        >
          <h3 className="text-lg font-bold text-slate-900">
            {i + 1}.{" "}
            <span style={{ fontFamily: `"${font.name}"` }}>{font.name}</span>
          </h3>
          <p className="mt-1 text-sm text-slate-500">{font.note}</p>
          <div className="mt-6 space-y-5">
            <Input
              variant="icon"
              icon={User}
              label="Full name"
              defaultValue="Adaeze Okafor"
            />
            <Input
              variant="icon"
              icon={Mail}
              label="Work email"
              placeholder="adaeze@company.com"
            />
            <PasswordInput
              variant="icon"
              icon={Lock}
              label="Password"
              defaultValue="Harbour#2026"
            />
          </div>
        </section>
      ))}
    </div>
  );
};

const InputStylesPreview = () => (
  <div className="max-small-mobile:px-4 min-h-screen bg-slate-50 px-8 py-14">
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
        Input fields
      </h1>

      <h2 className="font-display mt-10 text-2xl font-extrabold tracking-tight text-slate-900">
        Label fonts
      </h2>
      <p className="mt-2 max-w-2xl text-slate-500">
        The chosen Icon-led fields with eight label fonts. Only the labels
        change; the typed text stays Inter.
      </p>
      <LabelFonts />

      <h2 className="font-display mt-16 text-2xl font-extrabold tracking-tight text-slate-900">
        Input styles
      </h2>
      <p className="mt-2 max-w-2xl text-slate-500">
        Eight options, each with the same fields. In each card, Work email shows
        the focused state and Company name shows an error. Click and type to try
        them.
      </p>

      <div className="max-tablet:grid-cols-2 max-small-tablet:grid-cols-1 mt-10 grid grid-cols-3 gap-6">
        {VARIANTS.map((variant, i) => (
          <section
            key={variant.name}
            className={cn(
              "rounded-2xl border border-slate-200 p-6",
              variant.surface ?? "bg-white",
            )}
          >
            <div className="mb-6">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {String.fromCharCode(65 + i)}. {variant.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{variant.note}</p>
            </div>
            <SampleForm Field={variant.Field} />
          </section>
        ))}
      </div>
    </div>
  </div>
);

export default InputStylesPreview;
