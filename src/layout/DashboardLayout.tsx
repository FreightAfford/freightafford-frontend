import { useState } from "react";
import Sidebar from "../components/app/Sidebar";
import Topbar from "../components/app/Topbar";
import { Outlet } from "react-router";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="tablet:pl-64 flex min-h-screen flex-col">
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
