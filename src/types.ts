export interface ChatMessage {
  _id: string;
  session: string;
  sender: string;
  senderRole: "customer" | "cso" | "admin";
  message: string;
  type: "text" | "image" | "file" | "system";
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Chat related types
export interface ChatUser {
  id: string;
  fullname: string;
  email: string;
  role: "customer" | "agent" | "cso" | "admin";
  avatar?: string;
  onlineStatus: boolean;
}

export interface ChatSession {
  _id: string;
  customer: ChatUser | string;
  assignedTo?: ChatUser | string | null;
  status: "active" | "waiting" | "closed";
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCountCustomer: number;
  unreadCountCSO: number;
  createdAt: string;
  updatedAt: string;
  relatedRequest?: RelatedRequest;
  bookingInfo?: BookingInfo;
}

export interface RelatedRequest {
  id: string;
  type: "quote" | "booking" | "inquiry";
  status: string;
  origin: string;
  destination: string;
  details: string;
}

export interface BookingInfo {
  id: string;
  vessel?: string;
  eta?: string;
  etd?: string;
  containerType?: string;
}
