import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MessageCircle,
  MessageCircleCheck,
  MessageSquare,
  Paperclip,
  RotateCcw,
  Send,
  User,
  User2,
  X,
} from "lucide-react";
import moment from "moment";
import { AnimatePresence, motion } from "motion/react";
import {
  useState,
  type ChangeEvent,
  type ReactNode,
  type SubmitEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router";
import StatusBadge from "../../../components/app/StatusBadge";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import SmallLoader from "../../../components/SmallLoader";
import {
  useGetSingleTicket,
  useReplyToTicketMessage,
  useUpdateTicketStatus,
} from "../../../hooks/useTicketService";
import cn from "../../../utils/cn";
import { formatFileSize } from "../../../utils/helpers";

const SectionCard = ({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) => (
  <div
    className={cn(
      "overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm",
      className,
    )}
  >
    {title && (
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const InfoRow = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  icon: any;
}) => (
  <div className="flex items-start gap-3">
    <div className="text-slate-400">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">
        {label}
      </p>
      <div className="mt-1 font-semibold text-slate-900">{value}</div>
    </div>
  </div>
);

const ControlButton = ({
  icon,
  label,
  onClick,
  active,
  isLoading,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  isLoading: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={isLoading || active}
    className={cn(
      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all disabled:cursor-not-allowed",
      active
        ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
        : "border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50",
    )}
  >
    {isLoading ? (
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    ) : (
      <span className={cn(active ? "text-slate-200" : "text-brand")}>
        {icon}
      </span>
    )}
    {label}
  </button>
);

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { reply, isSending } = useReplyToTicketMessage();
  const { updateStatus } = useUpdateTicketStatus();
  const { ticket, messages, isPending, error } = useGetSingleTicket(id!);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleReply = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim()) return;

    const formData = new FormData();

    formData.append("message", message);

    files.forEach((file) => formData.append("files", file));

    reply(
      { ticketId: id!, formData },
      {
        onSuccess: () => {
          setMessage("");
          setFiles([]);
        },
      },
    );
  };

  const handleStatusUpdate = (status: "resolved" | "closed" | "open") => {
    setUpdatingStatus(status);
    updateStatus(
      { ticketId: id!, status },
      { onSettled: () => setUpdatingStatus(null) },
    );
  };

  if (isPending) return <SmallLoader />;

  if (error)
    return (
      <EmptyState
        icon={<X className="h-10 w-10 text-red-500" />}
        title="Error loading tickets"
        description={error.message || "An unexpected error has occured."}
        action={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go back
          </Button>
        }
      />
    );

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="group mb-4 flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </button>
      {/* Header Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="mb-1 flex items-center gap-2">
          <div className="text-brand leading-none font-semibold">
            {ticket.ticket_id}
          </div>
          <StatusBadge status={ticket.status} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 capitalize">
          {ticket.subject}
        </h2>
      </motion.div>
      {/* Main Content: 2 Column Layout */}
      {/* Main Workspace (Thread + Reply) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="col-span-8 flex flex-col gap-6"
      >
        <div className="flex max-h-200 min-h-150 flex-col rounded-2xl border border-slate-100 bg-white shadow-sm">
          {/* Thread Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                {ticket.assigned_to.fullname
                  .toUpperCase()
                  .split(" ")
                  .map((n: any) => n[0])
                  .join("")}
              </div>
              <span className="font-medium text-slate-600">
                Conversation Thread
              </span>
            </div>
            {/* <button className="p-1 text-slate-400 hover:text-slate-600">
                <MoreVertical className="h-5 w-5" />
              </button> */}
          </div>

          {/* Message List */}
          <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/10 p-6">
            <AnimatePresence mode="popLayout">
              {messages.map((message: any) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex max-w-[85%] flex-col",
                    message.direction === "outbound"
                      ? "ml-auto items-end"
                      : "mr-auto items-start",
                  )}
                >
                  <div className="mb-1.5 flex items-center gap-2 px-1">
                    <span className="text-sm font-semibold text-slate-800 capitalize">
                      {message.direction === "outbound"
                        ? ticket.assigned_to.fullname
                        : "Customer"}
                    </span>
                    <span className="text-xs leading-none text-slate-400">
                      {moment(message.createdAt).format("DD/MM/YYYY hh:mm A")}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl border p-4 text-sm leading-relaxed whitespace-pre-wrap",
                      message.direction === "outbound"
                        ? "rounded-tr-none border-slate-900 bg-slate-900 text-white"
                        : "rounded-tl-none border-slate-200 bg-white text-slate-600 shadow-sm",
                    )}
                  >
                    {message.content}
                  </div>
                  {message.attachments && message.attachments.length > 0 && (
                    <div
                      className={cn(
                        "mt-4 flex flex-wrap gap-3",
                        message.direction === "outbound"
                          ? "justify-end"
                          : "justify-start",
                      )}
                    >
                      {message.attachments.map((file: any, index: number) => (
                        <Link
                          target="_blank"
                          to={file.url}
                          key={index}
                          className="hover:border-brand/40 group flex w-fit min-w-50 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:shadow-sm"
                        >
                          <div className="group-hover:bg-brand/5 group-hover:text-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="mb-0.5 max-w-35 truncate leading-tight font-semibold text-slate-900">
                              {file.filename}
                            </span>
                            <span className="text-[10px] leading-none font-medium tracking-wider text-slate-400 uppercase">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Reply Composer */}
          <div className="border-t border-slate-100 p-6">
            <form onSubmit={handleReply}>
              {/* Attachment Previews */}
              {files.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="group relative">
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-8 shadow-sm">
                        <FileText className="text-brand h-5 w-5" />
                        <span className="max-w-30 truncate text-sm font-bold text-slate-700">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                placeholder="Write your response"
                className="focus:ring-brand/10 focus:border-brand min-h-30 w-full resize-none rounded-xl border border-slate-50 bg-slate-200 p-4 text-sm transition-all focus:bg-white focus:ring-2 focus:outline-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <div className="mt-4 flex items-center justify-between">
                <input
                  id="ticket-files"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="ticket-files"
                  className="hover:text-brand hover:bg-brand/5 rounded-lg p-2 text-slate-400 transition-colors"
                >
                  <Paperclip className="h-5 w-5" />
                </label>
                <Button disabled={isSending} isLoading={isSending}>
                  {!isSending && <Send className="mr-2 h-4.5 w-4.5" />}
                  Post Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Side Panels */}
      <div className="flex flex-col gap-6">
        <SectionCard title="Ticket Information">
          <div className="max-small-tablet:grid-cols-2 max-small-mobile:grid-cols-1 grid grid-cols-3 gap-6">
            <InfoRow
              label="Phase"
              value={<StatusBadge status={ticket.status} />}
              icon={MessageSquare}
            />
            <InfoRow
              label="Assigned"
              value={
                <span className="capitalize">
                  {ticket.assigned_to.fullname}
                </span>
              }
              icon={User}
            />
            <InfoRow
              label="Created On"
              value={moment(ticket.createdAt).format("LLL")}
              icon={Calendar}
            />
            <InfoRow
              label="Last Update"
              value={moment(ticket.updatedAt).format("LLL")}
              icon={Clock}
            />
            <InfoRow
              label="Last Message At"
              value={moment(ticket.last_message_at).format("LLL")}
              icon={MessageSquare}
            />
            <InfoRow
              label="Customer"
              value={ticket.customer_email}
              icon={User2}
            />
            <InfoRow
              label="Inbound (From)"
              value={
                messages.filter(
                  (message: any) => message.direction === "inbound",
                ).length
              }
              icon={MessageCircle}
            />
            <InfoRow
              label="Outbound (To)"
              value={
                messages.filter(
                  (message: any) => message.direction === "outbound",
                ).length
              }
              icon={MessageCircleCheck}
            />
          </div>
        </SectionCard>

        {/* <SectionCard title="Customer">
          <div className="flex items-center gap-4">
            <div className="bg-brand/10 text-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold">
              {ticket.customer_email[0].toUpperCase()}
            </div>
            <div className="truncate">
              <p className="mb-1 leading-none font-bold text-slate-900 capitalize">
                {ticket.customer_email.split("@")[0].replace(".", " ")}
              </p>
              <p className="truncate text-sm text-slate-500">
                {ticket.customer_email}
              </p>
            </div>
          </div>
        </SectionCard> */}
        {/* <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-400">History</span>
                <span className="font-bold text-slate-900">4 tickets</span>
              </div>
              <Button
                variant="outline"
                className="h-9 w-full rounded-lg text-sm"
              >
                View Customer Profile
              </Button>
            </div> */}
        <SectionCard title="Quick Controls">
          <div className="max-small-mobile:grid-cols-1 grid grid-cols-3 gap-4">
            <ControlButton
              icon={<X className="h-4 w-4" />}
              label="Close Ticket"
              onClick={() => handleStatusUpdate("closed")}
              active={ticket.status === "closed"}
              isLoading={updatingStatus === "closed"}
            />
            <ControlButton
              icon={<RotateCcw className="h-4 w-4" />}
              label="Open Thread"
              onClick={() => handleStatusUpdate("open")}
              active={ticket.status === "open"}
              isLoading={updatingStatus === "open"}
            />
            <ControlButton
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Resolve Issue"
              onClick={() => handleStatusUpdate("resolved")}
              active={ticket.status === "resolved"}
              isLoading={updatingStatus === "resolved"}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
export default TicketDetails;
