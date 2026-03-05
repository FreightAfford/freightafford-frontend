import { Bell, Menu, Search, User } from "lucide-react";

const Topbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <header className="max-mobile:px-4 sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/80 px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          className="max-tablet:block hidden rounded-lg p-2 text-slate-500 hover:bg-slate-50"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="max-medium-mobile:w-full flex w-64 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full border-none bg-transparent text-sm outline-0 placeholder:text-slate-400 focus:ring-0"
          />
        </div>
      </div>

      <div className="max-medium-mobile:gap-2 flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50">
          <Bell className="h-5 w-5" />
          <span className="bg-brand absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-white" />
        </button>
        <div className="max-medium-mobile:hidden mx-2 h-8 w-px bg-slate-100" />
        <div className="flex items-center gap-3">
          <div className="max-medium-mobile:hidden text-right">
            <p className="leading-none font-semibold text-slate-900">
              Franklin Chidera
            </p>
            <p className="mt-1 text-sm text-slate-500 capitalize">Customer</p>
          </div>

          <div className="bg-brand/10 border-brand/20 flex h-10 w-10 items-center justify-center rounded-full border">
            <User className="text-brand h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
};
export default Topbar;
