import type { ComponentProps } from "react";
import { Link } from "react-router";
import { TEXT_LINK } from "../../utils/authStyles";
import cn from "../../utils/cn";

// A blue inline link with an underline on hover, for the auth pages.
const TextLink = ({ className, ...props }: ComponentProps<typeof Link>) => (
  <Link className={cn(TEXT_LINK, className)} {...props} />
);

export default TextLink;
