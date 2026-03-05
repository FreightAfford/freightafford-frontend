import type { ComponentPropsWithoutRef, ReactNode } from "react";
import cn from "../utils/cn";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  title?: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}
const Card = ({
  title,
  description,
  className,
  children,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
      {...props}
    >
      {(title || description) && (
        <div className="flex flex-col space-y-1.5 p-6">
          {title && (
            <h3 className="text-2xl leading-none font-semibold tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      )}

      <div className={cn(`p-6 pt-0`, !title && !description && "pt-6")}>
        {children}
      </div>
    </div>
  );
};

export default Card;
