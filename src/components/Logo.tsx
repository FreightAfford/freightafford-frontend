import type { CSSProperties } from "react";
import cn from "../utils/cn";

const LOGO_SRC = "/freightafford-logo-full.svg";

// The SVG is used as a mask so the logo takes the current text colour:
// brand blue by default, or e.g. `text-white` on a brand-blue surface.
const maskStyle: CSSProperties = {
  maskImage: `url(${LOGO_SRC})`,
  WebkitMaskImage: `url(${LOGO_SRC})`,
  maskSize: "contain",
  WebkitMaskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "left center",
  WebkitMaskPosition: "left center",
};

const Logo = ({ className }: { className?: string }) => (
  <span
    role="img"
    aria-label="Freightafford"
    style={maskStyle}
    className={cn(
      // Matches the artwork's 731 × 161 proportions.
      "text-brand inline-block aspect-[731/161] h-8 shrink-0 bg-current",
      className,
    )}
  />
);

export default Logo;
