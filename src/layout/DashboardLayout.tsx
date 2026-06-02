import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "../components/app/Sidebar";
import Topbar from "../components/app/Topbar";
import { useUser } from "../hooks/useAuthService";
import ChatButton from "../pages/app/chats/ChatButton";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const { user } = useUser();

  return (
    <div className="relative mx-auto min-h-screen max-w-375 bg-slate-50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="tablet:pl-64 flex h-screen flex-col overflow-auto">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="max-mobile:p-4 flex-1 p-8">
          <div className="mx-auto max-w-full">
            <Outlet />
            {user?.role === "cso" || user?.role === "admin" ? null : (
              <ChatButton />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
