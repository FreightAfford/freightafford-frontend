import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import cn from "../utils/cn";

interface SectionProps extends ComponentPropsWithoutRef<"section"> {
  containerClassName?: string;
  className?: string;
  children: ReactNode;
}
const Section = ({
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) => {
  return (
    <section
      className={cn("max-small-tablet:py-16 max-mobile:py-14 py-24", className)}
      {...props}
    >
      <div
        className={cn(
          "max-small-tablet:px-4 mx-auto max-w-7xl px-8",
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
};
export default Section;
