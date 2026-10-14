import { forwardRef, type ComponentProps, type FocusEvent } from "react";
import {
  formatNationalNumber,
  NG_DIAL_CODE,
  toNationalNumber,
} from "../utils/phone";
import Input from "./Input";

type PhoneInputProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "startAdornment"
>;

// A Nigerian phone field. People can type 0803…, 803… or +234803…; on blur a
// valid number is tidied to "803 123 4567". Store it with
// normalizeNigerianPhone() from utils/phone.
const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onBlur, placeholder = "803 123 4567", ...props }, ref) => {
    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      const national = toNationalNumber(event.target.value);
      if (national) event.target.value = formatNationalNumber(national);
      onBlur?.(event);
    };

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={placeholder}
        startAdornment={<span className="font-medium">{NG_DIAL_CODE}</span>}
        onBlur={handleBlur}
        {...props}
      />
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
