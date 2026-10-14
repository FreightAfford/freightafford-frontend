import type { LucideIcon } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import cn from "../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  // Shown on the left of the label; the spinner takes its place while loading.
  icon?: LucideIcon;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      icon: Icon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary: "bg-brand text-foreground hover:opacity-90 shadow-sm",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      outline:
        "border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900",
      ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
    };

    const sizes = {
      sm: "h-8 gap-1.5 px-3 text-xs",
      md: "h-10 gap-2 px-4 py-2",
      lg: "h-12 gap-2 px-8 text-lg",
    };

    const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-[18px] w-[18px]";

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors focus-visible:ring-slate-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <span
            aria-hidden="true"
            className={cn(
              "shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
              iconSize,
            )}
          />
        ) : (
          Icon && (
            <Icon aria-hidden="true" className={cn("shrink-0", iconSize)} />
          )
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
