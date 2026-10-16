import moment from "moment";
import type { MaerskTracking } from "../../../services/api/booking";

// The line under the route lane: the latest actual Maersk event when there
// is one, otherwise the booking status in words.
const LaneStatus = ({
  tracking,
  status,
}: {
  tracking?: MaerskTracking;
  status: string;
}) => {
  const latest = [...(tracking?.events ?? [])]
    .reverse()
    .find((e) => e.classifier === "ACT");
  if (latest)
    return (
      <p>
        <span className="font-semibold text-white">{latest.label}</span>
        {latest.location?.name && `, ${latest.location.name}`}
        <span className="block text-slate-400">
          {moment.parseZone(latest.dateTime).format("D MMM, HH:mm")} port time
        </span>
      </p>
    );
  const text: Record<string, string> = {
    awaiting_confirmation: "Waiting for carrier confirmation",
    confirmed: "Confirmed, waiting to sail",
    in_transit: "At sea",
    arrived: "Arrived at destination port",
    delivered: "Delivered",
    cancelled: "Booking cancelled",
  };
  return <p className="font-semibold text-white">{text[status] ?? status}</p>;
};

export default LaneStatus;
