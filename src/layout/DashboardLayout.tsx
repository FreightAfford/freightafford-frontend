import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "../components/app/Sidebar";
import Topbar from "../components/app/Topbar";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <div className="relative mx-auto min-h-screen max-w-360 bg-slate-50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="tablet:pl-64 flex h-screen flex-col overflow-auto">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="max-mobile:p-4 flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
