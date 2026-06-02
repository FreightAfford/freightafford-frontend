// ─── Chat Types ───────────────────────────────────────────────────────────────
//
// Single source of truth for all chat-related TypeScript interfaces.
// Mirrors the backend models exactly.
// ─────────────────────────────────────────────────────────────────────────────

// ── Primitives ────────────────────────────────────────────────────────────────

export type SessionStatus = "waiting" | "active" | "closed" | "reassigned";
export type SessionType = "general" | "request_linked";
export type MessageStatus = "sent" | "delivered" | "read";
export type MessageType = "text" | "system";
export type SenderRole = "customer" | "cso";

// ── Participants ──────────────────────────────────────────────────────────────

export interface ChatUser {
  _id: string;
  fullname: string;
  email: string;
  role: "customer" | "admin";
  status: "active" | "inactive" | "suspended";
  phoneNumber?: string;
  companyName?: string;
}

// ── Linked context ────────────────────────────────────────────────────────────

export interface LinkedFreightRequest {
  _id: string;
  originPort: string;
  destinationPort: string;
  status: string;
  containerSize: string;
  containerQuantity: number;
  proposedPrice: number;
  adminCounterPrice?: number;
}

export interface LinkedBooking {
  _id: string;
  bookingNumber: string;
  vessel?: string;
  sailingDate?: string;
  status: string;
  shippingLine?: string;
}

// ── Session ───────────────────────────────────────────────────────────────────

export interface ChatSessionMetadata {
  acceptedAt?: string;
  closedAt?: string;
  reassignedAt?: string;
  closedBy?: string;
  previousCSOId?: string;
}

export interface ChatSession {
  _id: string;
  type: SessionType;
  status: SessionStatus;
  customer: ChatUser;
  assignedCSO?: ChatUser;
  freightRequest?: LinkedFreightRequest;
  booking?: LinkedBooking;
  queuePosition: number;
  metadata: ChatSessionMetadata;
  createdAt: string;
  updatedAt: string;
  // Injected client-side after bulk unread fetch
  unreadCount?: number;
}

// ── Message ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  _id: string;
  session: string;
  sender: {
    _id: string;
    fullname: string;
    role: string;
  };
  senderRole: SenderRole;
  content: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

// ── API Payloads ──────────────────────────────────────────────────────────────

export interface CreateSessionPayload {
  type: SessionType;
  freightRequestId?: string;
  bookingId?: string;
}

export interface ReassignSessionPayload {
  toCSOId: string;
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface PaginatedMessages {
  messages: ChatMessage[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SessionsResponse {
  sessions: ChatSession[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AvailableCSO {
  _id: string;
  fullname: string;
  email: string;
}

// ── Socket Event Payloads ─────────────────────────────────────────────────────

export interface SocketMessage {
  _id: string;
  sessionId: string;
  sender: {
    _id: string;
    fullname: string;
    role: string;
  };
  senderRole: SenderRole;
  content: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: string;
}

export interface SocketSessionUpdate {
  sessionId: string;
  status: SessionStatus;
  assignedCSO?: { _id: string; fullname: string };
  closedBy?: string;
  reassignedTo?: string;
}

export interface SocketTyping {
  sessionId: string;
  userId: string;
  fullname: string;
}

export interface SocketReadReceipt {
  sessionId: string;
  status: "delivered" | "read";
  byUserId: string;
}

export interface SocketQueueUpdate {
  sessionId: string;
  queuePosition: number;
}

export interface SocketNewSession {
  sessionId: string;
  type: SessionType | "reassigned";
  customer: { _id: string; fullname: string };
  queuePosition: number;
  freightRequest?: LinkedFreightRequest;
  booking?: LinkedBooking;
  createdAt: string;
  message?: string; // present on reassigned notifications
}

export interface SocketPresenceUpdate {
  type?: "initial_snapshot";
  userId?: string;
  fullname?: string;
  status?: "online" | "offline";
  onlineCSOs?: { userId: string; status: "online" }[];
}

export interface SocketError {
  event: string;
  message: string;
}
