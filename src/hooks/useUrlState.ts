import { useSearchParams } from "react-router";

// Page settings kept in the URL, so a reload or a shared link keeps them.
// `update` merges keys in place; an empty value removes the key.
export const useUrlState = () => {
  const [params, setParams] = useSearchParams();

  const update = (next: Record<string, string>) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) =>
      value ? merged.set(key, value) : merged.delete(key),
    );
    setParams(merged, { replace: true });
  };

  return { params, update };
};
