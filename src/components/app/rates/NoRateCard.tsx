import {
  BellRing,
  CheckCircle2,
  Container,
  NotebookPen,
  SearchX,
} from "lucide-react";
import moment from "moment";
import { useState, type ReactNode } from "react";
import type { RateContainerSize } from "../../../data/rates";
import { useSearchCommodities } from "../../../hooks/useCommodityService";
import { useRequestRate } from "../../../hooks/useRateService";
import type { Commodity } from "../../../services/api/commodity";
import type { RatePort, RateRequest } from "../../../services/api/rate";
import { portLabel, rateSizeLabel } from "../../../utils/rates";
import Button from "../../Button";
import Select from "../../Select";
import Textarea from "../../Textarea";
import CommoditySelect from "../CommoditySelect";

const ANY = "any";

interface NoRateCardProps {
  origin: RatePort;
  destination: RatePort;
  // The sizes the customer can ask about: all four, or only the ones the
  // lane has no rate for.
  sizes: readonly RateContainerSize[];
  // The size they filtered by, if any.
  size?: RateContainerSize;
  // Their open request for this lane, from the search.
  request: RateRequest | null;
  // A slim prompt under existing rates, rather than the whole card.
  compact?: boolean;
  // The compact prompt's wording, when the default (missing sizes) doesn't fit.
  prompt?: ReactNode;
  // The commodity of the rate on screen, when asking for another size of it.
  forCommodity?: { name: string; code?: string };
}

// When a lane (or a size on it) has no contract rate: say so, and let the
// customer ask for one. Admin is notified only when they click.
const NoRateCard = ({
  origin,
  destination,
  sizes,
  size,
  request,
  compact,
  prompt,
  forCommodity,
}: NoRateCardProps) => {
  const { requestRate, isPending } = useRequestRate();
  const [expanded, setExpanded] = useState(!compact);
  // The size they filtered by, or the only one missing, else any size.
  const [chosen, setChosen] = useState<string>(
    size ?? (sizes.length === 1 ? sizes[0] : ANY),
  );
  const [note, setNote] = useState("");
  // Contract rates are agreed per commodity, so a request needs one. Asking
  // for another size of a rate starts from that rate's commodity: its Maersk
  // code when it has one, else an exact name match from the search.
  const [picked, setPicked] = useState<Commodity | null>(
    forCommodity?.code
      ? {
          code: forCommodity.code,
          name: forCommodity.name,
          hsCodes: [],
          cargoTypes: [],
        }
      : null,
  );
  const [touched, setTouched] = useState(!!forCommodity?.code);
  const { commodities: matches } = useSearchCommodities(
    forCommodity && !touched ? forCommodity.name : "",
  );
  const suggested =
    forCommodity && !touched
      ? (matches.find(
          (c) => c.name.toLowerCase() === forCommodity.name.toLowerCase(),
        ) ?? null)
      : null;
  const commodity = picked ?? suggested;
  const setCommodity = (next: Commodity | null) => {
    setTouched(true);
    setPicked(next);
  };
  const [tried, setTried] = useState(false);
  const lane = `${portLabel(origin)} to ${portLabel(destination)}`;

  // Already asked: show where it stands instead of the form.
  if (request)
    return (
      <div className="border-kelp/30 bg-kelp/5 flex items-start gap-3 rounded-2xl border p-4 @xl:p-5">
        <CheckCircle2
          aria-hidden="true"
          className="text-kelp mt-0.5 h-5 w-5 shrink-0"
        />
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-slate-900">
            You asked for a rate on{" "}
            {moment(request.createdAt).format("D MMM YYYY")}
          </p>
          <p className="mt-0.5 text-slate-700">
            {request.commodity.name},{" "}
            {request.containerSize
              ? rateSizeLabel(request.containerSize)
              : "any container size"}
          </p>
          <p className="mt-0.5 text-slate-600">
            Our team has been notified and will email you when the rate is
            ready.
          </p>
        </div>
      </div>
    );

  const submit = () => {
    setTried(true);
    if (!commodity) return;
    requestRate({
      origin,
      destination,
      commodity: { code: commodity.code, name: commodity.name },
      containerSize: chosen === ANY ? undefined : (chosen as RateContainerSize),
      note: note.trim() || undefined,
    });
  };

  const form = (
    <div className="grid gap-4">
      <div className="grid gap-4 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
        <CommoditySelect
          label="Commodity"
          placeholder="Search, e.g. iron ore or cashew nuts"
          value={commodity}
          onChange={setCommodity}
          error={
            tried && !commodity
              ? "Choose a commodity from the search results"
              : undefined
          }
          disabled={isPending}
        />
        <Select
          label="Container size"
          icon={Container}
          options={[
            { value: ANY, label: "Any size" },
            ...sizes.map((s) => ({ value: s, label: rateSizeLabel(s) })),
          ]}
          value={chosen}
          onChange={setChosen}
          disabled={isPending}
        />
        {forCommodity && !commodity && (
          <p className="-mt-2 text-sm text-slate-500 @2xl:col-start-1">
            This rate is for{" "}
            <span className="font-medium text-slate-700">
              {forCommodity.name.toLowerCase()}
            </span>
            . Choose the matching commodity.
          </p>
        )}
      </div>
      <Textarea
        label="Note for our team"
        optional
        icon={NotebookPen}
        rows={2}
        maxLength={500}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={isPending}
        placeholder="Volume or timing, e.g. 4 containers a month from January"
      />
      <div>
        <Button
          icon={BellRing}
          onClick={submit}
          isLoading={isPending}
          className="h-11 rounded-xl px-5 font-semibold"
        >
          Ask for a rate
        </Button>
      </div>
    </div>
  );

  if (compact)
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 @xl:p-5">
        <div className="flex flex-col gap-3 @xl:flex-row @xl:items-center @xl:justify-between">
          <p className="text-sm text-slate-600">
            {prompt ?? (
              <>
                <span className="font-semibold text-slate-900">
                  Need another size?
                </span>{" "}
                We don't have a rate for{" "}
                {sizes.map((s) => rateSizeLabel(s)).join(", ")} on this lane
                yet.
              </>
            )}
          </p>
          {!expanded && (
            <Button
              variant="outline"
              icon={BellRing}
              onClick={() => setExpanded(true)}
              className="h-10 shrink-0 self-start rounded-xl font-semibold @xl:self-auto"
            >
              Ask for a rate
            </Button>
          )}
        </div>
        {expanded && <div className="mt-4">{form}</div>}
      </div>
    );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm @xl:p-7">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 @md:flex"
        >
          <SearchX className="text-brand h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-900">
            {size
              ? `No ${rateSizeLabel(size)} rate for this lane yet`
              : "No contract rate for this lane yet"}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            We don't have a contract rate from {lane}
            {size ? ` for a ${rateSizeLabel(size)}` : ""}. Ask for one and our
            team will be notified to price it for you.
          </p>
        </div>
      </div>
      <div className="mt-5">{form}</div>
    </div>
  );
};

export default NoRateCard;
