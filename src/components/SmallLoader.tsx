import { Loader2 } from "lucide-react";

const SmallLoader = () => {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="text-brand h-10 w-10 animate-spin" />
    </div>
  );
};
export default SmallLoader;
