import { useEffect } from "react";
import { useUser } from "../../../hooks/useAuthService";
import { socketService } from "../../../services/socket/socket.service";
import CSODashboard from "./CSODashboard";
import CustomerChatView from "./CustomerChatView";

// ─── ChatInterface ────────────────────────────────────────────────────────────
//
// Entry point for the chat system.
// Connects the socket when mounted and disconnects on unmount.
// Delegates to CSODashboard or CustomerChatView based on user role.
// ─────────────────────────────────────────────────────────────────────────────

const ChatInterface = () => {
  const { user } = useUser();
  const isCSO = user?.role === "admin";

  // Connect socket when the chat interface mounts.
  // Since the JWT is in an HTTP-only cookie and apiClient uses
  // withCredentials:true, the cookie is forwarded automatically.
  useEffect(() => {
    socketService.connect();

    return () => {
      // Disconnect when the user navigates away from the chat section entirely
      socketService.disconnect();
    };
  }, []);

  // useEffect(() => {
  //   const s = socketService.getSocket();

  //   s.on("connect", () => console.log("[SOCKET] Connected:", s.id));
  //   s.on("connect_error", (err) =>
  //     console.error("[SOCKET] Error:", err.message),
  //   );
  //   s.on("disconnect", (reason) =>
  //     console.log("[SOCKET] Disconnected:", reason),
  //   );

  //   socketService.connect();

  //   console.log("[SOCKET] connect() called, connected:", s.connected);
  // }, []);

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-125px)] max-tablet:h-[calc(100vh-100px)] max-mobile:h-[calc(100vh-80px)] overflow-hidden rounded-xl border border-slate-200 bg-green-400 shadow-sm">
      {isCSO ? <CSODashboard /> : <CustomerChatView />}
    </div>
  );
};

export default ChatInterface;
