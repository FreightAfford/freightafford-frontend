// Nigerian mobile and landline numbers, stored as +234 followed by the
// 10-digit national number (the leading 0 dropped).

export const NG_DIAL_CODE = "+234";

/** The 10-digit national number, or null if the input isn't a Nigerian number. */
export const toNationalNumber = (input: string): string | null => {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("234")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  // 10-digit national numbers, i.e. mobiles (70…, 80…, 81…, 90…, 91…).
  // Older 7–8 digit landlines are not accepted.
  return /^[1-9]\d{9}$/.test(digits) ? digits : null;
};

/** "+2348031234567", or null if the input isn't a Nigerian number. */
export const normalizeNigerianPhone = (input: string): string | null => {
  const national = toNationalNumber(input);
  return national ? `${NG_DIAL_CODE}${national}` : null;
};

export const isNigerianPhone = (input: string) =>
  toNationalNumber(input) !== null;

/** "803 123 4567" — grouped for reading, from any accepted input. */
export const formatNationalNumber = (input: string) => {
  const digits = input.replace(/\D/g, "").replace(/^234/, "").replace(/^0/, "");
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)]
    .filter(Boolean)
    .join(" ");
};
