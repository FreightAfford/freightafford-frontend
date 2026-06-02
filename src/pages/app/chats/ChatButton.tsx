import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router";

// ─── ChatButton ───────────────────────────────────────────────────────────────
//
// Floating action button rendered globally in DashboardLayout for customers.
//
// When clicked from a generic page → navigates to /app/customer/chats with
// no context (general chat).
//
// When clicked from a request/booking detail page, the page passes context
// via chatContext prop → navigates with route state so CustomerChatView
// can pre-populate the session as request_linked automatically.
//
// Usage (generic, from layout — no change needed in DashboardLayout):
//   <ChatButton />
//
// Usage (contextual, from a request/booking detail page):
//   <ChatButton
//     chatContext={{
//       type: "request_linked",
//       freightRequestId: request._id,
//       bookingId: request.booking?._id,
//       label: request._id,
//       route: `${request.originPort} → ${request.destinationPort}`,
//     }}
//   />
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatContext {
  type: "general" | "request_linked";
  freightRequestId?: string;
  bookingId?: string;
  label?: string; // e.g. "REQ-2024-001" — shown in the chat banner
  route?: string; // e.g. "Shanghai → Hamburg" — shown in the chat banner
}

interface ChatButtonProps {
  chatContext?: ChatContext;
}

const ChatButton = ({ chatContext }: ChatButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/app/customer/chats", {
      // Passed as route state — invisible in the URL bar
      // CustomerChatView reads this via useLocation().state
      state: { chatContext: chatContext ?? { type: "general" } },
    });
  };

  return (
    <button
      onClick={handleClick}
      className="group fixed right-6 bottom-6 z-50 flex items-center overflow-hidden rounded-full bg-blue-600 px-4 py-4 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-blue-700"
    >
      <MessageCircle className="h-6 w-6 shrink-0" />
      <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-50 group-hover:opacity-100">
        Chat with Support
      </span>
    </button>
  );
};

export default ChatButton;
