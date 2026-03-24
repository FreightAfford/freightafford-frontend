import { Ship } from "lucide-react";

const Loader = () => {
  return (
    <div className="max-small-mobile:px-4 relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-900 px-8 py-12">
      <div className="bg-brand/20 absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-brand/20 absolute bottom-0 left-0 -mt-20 -mr-20 h-96 w-96 rounded-full blur-3xl" />
      <div className="flex flex-col items-center">
        <Ship className="text-brand h-20 w-20 animate-pulse" />
        <span className="text-brand text-2xl font-bold tracking-tight">
          Freight Afford
        </span>
      </div>
    </div>
  );
};

export default Loader;
