import {
  Anchor,
  ArrowLeftRight,
  CalendarDays,
  CirclePlay,
  Database,
  MapPinned,
  MessageSquare,
  PackageCheck,
  Route,
  Ship,
  UserPlus,
} from "lucide-react";
import {
  MotionConfig,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import Button from "../../components/Button";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import PlayTutorial from "../../components/PlayTutorial";
import Section from "../../components/Section";
import { CONTACT_EMAIL } from "../../utils/contact";
import { scrollToSection } from "../../utils/scroll";
import cn from "../../utils/cn";

// Shared scroll-in motion: short distances, one easing, staggered children.
const EASE = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

// Board rows slide in from the left, like a schedule filling in.
const row: Variants = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
};

const stagger = (gap: number, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

const inView = (amount = 0.25) =>
  ({
    initial: "hidden",
    whileInView: "show",
    viewport: { once: true, amount },
  }) as const;

const TAGLINE_BEATS = ["Book smarter.", "Ship faster.", "Pay less."];
const TAGLINE = TAGLINE_BEATS.join(" ");

// Character offset at which each beat starts in the overall typing count.
const BEAT_STARTS = TAGLINE_BEATS.map((_, i) =>
  TAGLINE_BEATS.slice(0, i).reduce((sum, beat) => sum + beat.length, 0),
);
const BEAT_ENDS = BEAT_STARTS.map(
  (start, i) => start + TAGLINE_BEATS[i].length,
);
const TOTAL_CHARS = BEAT_ENDS[BEAT_ENDS.length - 1];

// Plus Jakarta Sans sets wide space before full stops and commas at display
// sizes; pull them back toward the preceding letter.
const tuck = (text: string) =>
  text.split(/([.,?])/).map((part, i) =>
    /^[.,?]$/.test(part) ? (
      <span key={i} className="-ml-[0.07em]">
        {part}
      </span>
    ) : (
      part
    ),
  );

const TYPE_SPEED = 60;
const BEAT_PAUSE = 700;
const SETTLE_PAUSE = 3400;
const RESTART_PAUSE = 500;
// Containers land first, then the stencilling starts.
const LANDING_DELAY = 1300;

const useTypewriter = (enabled: boolean) => {
  const [count, setCount] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => setStarted(true), LANDING_DELAY);
    return () => clearTimeout(timer);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !started) return;

    const delay =
      count === 0
        ? RESTART_PAUSE
        : count >= TOTAL_CHARS
          ? SETTLE_PAUSE
          : BEAT_ENDS.includes(count)
            ? BEAT_PAUSE
            : TYPE_SPEED;

    const timer = setTimeout(
      () => setCount((c) => (c >= TOTAL_CHARS ? 0 : c + 1)),
      delay,
    );
    return () => clearTimeout(timer);
  }, [count, enabled, started]);

  return enabled ? count : TOTAL_CHARS;
};

const CONTAINERS = [
  {
    serial: "FAFU 220431 7",
    type: "22G1",
    body: "bg-ochre text-harbour",
    rail: "bg-[#b9851c]",
    offset: "ml-[6%] mr-0",
  },
  {
    serial: "FAFU 418806 2",
    type: "45G1",
    body: "bg-brand text-white",
    rail: "bg-[#136fd0]",
    offset: "ml-0 mr-[8%]",
  },
  {
    serial: "FAFU 305172 4",
    type: "22G1",
    body: "bg-kelp text-white",
    rail: "bg-[#205a4d]",
    offset: "ml-[3%] mr-[2%]",
  },
];

const Container = ({
  index,
  typedCount,
  showCaret,
  animateIn,
}: {
  index: number;
  typedCount: number;
  showCaret: boolean;
  animateIn: boolean;
}) => {
  const container = CONTAINERS[index];
  const beat = TAGLINE_BEATS[index];
  const typed = beat.slice(
    0,
    Math.max(0, Math.min(beat.length, typedCount - BEAT_STARTS[index])),
  );

  return (
    <motion.div
      initial={animateIn ? { y: -140, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        // Bottom box is lowered first, like a crane building the stack.
        delay: 0.2 + (CONTAINERS.length - 1 - index) * 0.28,
        duration: 0.55,
        ease: [0.22, 1.2, 0.36, 1],
      }}
      className={cn(
        "relative aspect-[2.6] overflow-hidden rounded-[3px]",
        container.body,
        container.offset,
      )}
    >
      {/* Corrugated side panel */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.10) 0 7px, rgb(0 0 0 / 0.10) 7px 14px)",
        }}
      />
      <div className={cn("absolute inset-x-0 top-0 h-[7%]", container.rail)} />
      <div
        className={cn("absolute inset-x-0 bottom-0 h-[7%]", container.rail)}
      />
      {[
        "top-0 left-0",
        "top-0 right-0",
        "bottom-0 left-0",
        "bottom-0 right-0",
      ].map((corner) => (
        <div
          key={corner}
          className={cn("absolute h-[14%] w-[4%] bg-black/25", corner)}
        />
      ))}

      <div className="absolute top-[13%] left-[6%] text-[clamp(0.5rem,1vw,0.7rem)] leading-tight font-semibold opacity-80">
        <p>{container.serial}</p>
        <p>{container.type}</p>
      </div>
      <p className="absolute top-[13%] right-[6%] text-right text-[clamp(0.5rem,1vw,0.7rem)] leading-tight font-semibold opacity-70">
        MAX GROSS 30,480 KG
        <br />
        TARE 2,200 KG
      </p>

      <p className="font-display absolute bottom-[16%] left-[6%] text-[clamp(1.6rem,3.6vw,2.9rem)] leading-none font-extrabold tracking-tight">
        {tuck(typed)}
        {showCaret && (
          <span className="ml-1 inline-block h-[0.8em] w-[0.12em] animate-pulse bg-current align-[-0.05em]" />
        )}
      </p>
    </motion.div>
  );
};

const ContainerStack = () => {
  const prefersReducedMotion = useReducedMotion();
  const typedCount = useTypewriter(!prefersReducedMotion);

  const activeBeat = BEAT_ENDS.findIndex((end) => typedCount < end);
  const caretOn = activeBeat === -1 ? TAGLINE_BEATS.length - 1 : activeBeat;

  return (
    <div className="relative">
      <p className="sr-only">{TAGLINE}</p>
      <div aria-hidden="true" className="flex flex-col gap-[6px]">
        {CONTAINERS.map((container, i) => (
          <Container
            key={container.serial}
            index={i}
            typedCount={typedCount}
            showCaret={!prefersReducedMotion && caretOn === i}
            animateIn={!prefersReducedMotion}
          />
        ))}
      </div>
    </div>
  );
};

const HeroBackdrop = () => (
  <div aria-hidden="true" className="absolute inset-0 -z-10">
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 55% 65% at 75% 70%, rgb(30 144 255 / 0.28), transparent 70%), linear-gradient(to bottom, #061a31, var(--color-harbour))",
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgb(255 255 255 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.06) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage:
          "radial-gradient(ellipse 80% 80% at 60% 40%, #000 25%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 80% at 60% 40%, #000 25%, transparent 100%)",
      }}
    />
  </div>
);

const SAMPLE_SAILINGS = [
  {
    destination: "Rotterdam",
    code: "NLRTM",
    vessel: "Atlantic Venture",
    departs: "18 Oct",
    cutOff: "15 Oct",
    transit: 21,
  },
  {
    destination: "Antwerp",
    code: "BEANR",
    vessel: "Gulf Meridian",
    departs: "21 Oct",
    cutOff: "18 Oct",
    transit: 23,
  },
  {
    destination: "Valencia",
    code: "ESVLC",
    vessel: "Lagos Star",
    departs: "25 Oct",
    cutOff: "22 Oct",
    transit: 18,
  },
];

const SailingBoard = () => (
  <motion.figure className="w-full" variants={rise} {...inView(0.35)}>
    <div className="bg-harbour overflow-hidden rounded-xl text-white shadow-[0_30px_60px_-30px_rgba(10,35,66,0.55)]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
        <div>
          <p className="text-sm text-slate-300">Sailings from</p>
          <p className="font-display text-xl font-bold">Apapa, Lagos</p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
          <span className="bg-live h-2 w-2 rounded-full" />
          Maersk
        </span>
      </div>

      <motion.ul variants={stagger(0.12, 0.35)}>
        {SAMPLE_SAILINGS.map((sailing, i) => (
          <motion.li
            key={sailing.code}
            variants={row}
            className={cn(
              "grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-6 py-4 not-last:border-b not-last:border-white/10",
              i === 0 && "bg-brand/15",
            )}
          >
            <div className="min-w-0">
              <p className="font-semibold">
                {sailing.destination}{" "}
                <span className="font-normal text-slate-400">
                  {sailing.code}
                </span>
              </p>
              <p className="truncate text-sm text-slate-400">
                {sailing.vessel}, cut-off {sailing.cutOff}
              </p>
            </div>
            <div className="text-right tabular-nums">
              <p className="font-semibold">{sailing.departs}</p>
              <p className="text-sm text-slate-400">{sailing.transit} days</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>

      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-6 py-4 text-sm">
        <span className="text-slate-300">20ft dry, cocoa beans</span>
        <span className="bg-brand rounded-md px-3 py-1.5 font-medium">
          Book sailing
        </span>
      </div>
    </div>
    <figcaption className="mt-3 text-sm text-slate-500">
      Example of the schedule view. Real sailings come from the carrier.
    </figcaption>
  </motion.figure>
);

const SERVICES = [
  {
    icon: CalendarDays,
    title: "Ocean Commercial Schedules",
    desc: "Compare sailings and pick the departure that fits your timeline.",
  },
  {
    icon: PackageCheck,
    title: "Ocean Bookings",
    desc: "Book your cargo space online, without phone calls, emails or waiting around.",
  },
  {
    icon: MapPinned,
    title: "Ocean Track & Trace",
    desc: "Follow your cargo from origin to destination, using data straight from the carrier.",
  },
  {
    icon: Route,
    title: "Point-to-Point Routing",
    desc: "See your route options from origin to destination, with transit details laid out clearly.",
  },
  {
    icon: Anchor,
    title: "Port Schedules",
    desc: "Plan around real port calls and cut-off dates, not guesswork.",
  },
  {
    icon: Ship,
    title: "Vessel Schedules",
    desc: "Know which vessels are sailing, when, and where they're headed.",
  },
  {
    icon: Database,
    title: "Commodities & Locations",
    desc: "Search the carriers' own commodity and location data so every booking starts accurate.",
  },
];

const AUDIENCES = [
  {
    title: "Exporters",
    desc: "You have goods to ship and deadlines to meet, not time to learn five different carrier portals. Freightafford gives you one simple place to book, track and manage your shipments, at a fraction of the cost of going direct.",
  },
  {
    title: "Export Agents",
    desc: "Your clients depend on you to get it right. Serve more of them with less admin, compare carriers faster and keep every booking organized in one dashboard. Work with us on a contract or commission basis, whichever suits your business.",
  },
  {
    title: "Small & Growing Businesses",
    desc: "Big shipping lines can feel built for big shippers. We make ocean freight accessible to businesses of every size, with clear pricing and no hidden surprises.",
  },
];

const UPCOMING_CARRIERS = [
  "MSC (Mediterranean Shipping Company)",
  "CMA CGM",
  "Hapag-Lloyd",
  "COSCO Shipping Lines",
  "Ocean Network Express (ONE)",
  "Evergreen Line",
  "Pacific International Lines (PIL)",
];

const LandingPage = () => {
  const [playTutorial, setPlayTutorial] = useState<boolean>(false);
  const location = useLocation();
  const section = (location.state as { section?: string } | null)?.section;

  // Arriving from another page via a navbar section link: glide to it once
  // the page has laid out.
  useEffect(() => {
    if (!section) return;
    const timer = setTimeout(() => scrollToSection(section), 150);
    return () => clearTimeout(timer);
  }, [section, location.key]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white">
        <NavBar adaptive />

        <PlayTutorial
          playTutorial={playTutorial}
          onCloseTutorial={() => setPlayTutorial(false)}
        />

        {/* Hero: a container stack on the quay, stencilled with the tagline */}
        <section
          data-nav-surface="hero"
          className="relative isolate -mt-16 overflow-hidden text-white"
        >
          <HeroBackdrop />
          <div className="max-small-tablet:px-4 max-tablet:grid-cols-1 max-tablet:gap-14 max-mobile:pt-22 mx-auto grid max-w-7xl grid-cols-[1.05fr_1fr] items-end gap-16 px-8 pt-24">
            <motion.div
              className="max-tablet:pb-0 pb-24"
              variants={stagger(0.1, 0.1)}
              initial="hidden"
              animate="show"
            >
              <motion.h1
                variants={rise}
                className="font-display max-medium-tablet:text-6xl max-mobile:text-5xl max-small-mobile:text-[2.75rem] text-7xl leading-[0.98] font-extrabold tracking-tight text-balance"
              >
                {tuck("Ocean freight, made seamless.")}
              </motion.h1>

              <motion.p
                variants={rise}
                className="max-mobile:text-lg mt-7 max-w-xl text-xl leading-relaxed text-slate-300"
              >
                Check schedules, book shipments and track cargo across major
                shipping lines from one platform. Built for Nigerian exporters
                and export agents who are tired of doing it the hard way.
              </motion.p>

              <motion.div
                variants={rise}
                className="max-small-mobile:flex-col mt-10 flex gap-4"
              >
                <Link to="/register" className="max-small-mobile:w-full">
                  <Button
                    icon={Ship}
                    size="lg"
                    className="max-small-mobile:w-full"
                  >
                    Start Booking
                  </Button>
                </Link>
                <Button
                  icon={CirclePlay}
                  size="lg"
                  variant="outline"
                  onClick={() => setPlayTutorial(true)}
                  className="max-small-mobile:w-full border-white/30 text-white hover:bg-white/10"
                >
                  See How It Works
                </Button>
              </motion.div>

              <motion.p
                variants={rise}
                className="mt-8 flex items-start gap-3 text-sm leading-relaxed text-slate-300"
              >
                <span className="relative mt-1.5 flex h-2 w-2 shrink-0">
                  <span className="bg-live absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:animate-none" />
                  <span className="bg-live relative inline-flex h-2 w-2 rounded-full" />
                </span>
                Live today. Connected to shipping line systems. Moving real
                cargo from Nigeria.
              </motion.p>
            </motion.div>

            <ContainerStack />
          </div>

          {/* Quay edge the stack rests on */}
          <div aria-hidden="true" className="h-4 bg-[#16395f]" />
          <div aria-hidden="true" className="bg-brand/40 h-1" />
        </section>

        {/* Services */}
        <Section
          id="services"
          data-nav-surface="mist"
          className="bg-mist scroll-mt-16"
        >
          <div className="max-tablet:grid-cols-1 max-tablet:gap-12 grid grid-cols-[1fr_1fr] items-center gap-16">
            <motion.div variants={stagger(0.1)} {...inView()}>
              <motion.h2
                variants={rise}
                className="font-display text-harbour max-small-mobile:text-3xl text-5xl leading-[1.05] font-extrabold tracking-tight text-balance"
              >
                {tuck("Everything you need to move cargo, in one place.")}
              </motion.h2>
              <motion.p
                variants={rise}
                className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600"
              >
                No more calling carrier offices or chasing confirmations.
                Freightafford brings the information straight to your dashboard,
                powered by shipping lines' own systems.
              </motion.p>
            </motion.div>
            <SailingBoard />
          </div>

          <motion.div
            variants={stagger(0.07)}
            {...inView(0.15)}
            className="max-small-tablet:grid-cols-2 max-medium-mobile:grid-cols-1 mt-20 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200"
          >
            {SERVICES.map((service) => (
              <motion.div
                key={service.title}
                variants={rise}
                className="bg-white p-8"
              >
                <service.icon
                  className="text-brand h-6 w-6"
                  strokeWidth={1.75}
                />
                <h3 className="text-harbour mt-5 text-lg font-semibold">
                  {service.title}
                </h3>
                <p className="mt-2 leading-relaxed text-slate-600">
                  {service.desc}
                </p>
              </motion.div>
            ))}

            <motion.div
              variants={rise}
              className="bg-harbour max-small-tablet:col-span-1 max-medium-mobile:col-span-1 col-span-2 flex flex-col justify-between gap-6 p-8 text-white"
            >
              <ArrowLeftRight className="text-ochre h-7 w-7" />
              <div>
                <p className="font-display text-2xl leading-snug font-bold">
                  Your carrier is congested? Your cargo doesn't have to be.
                </p>
                <p className="mt-3 max-w-lg leading-relaxed text-slate-300">
                  Switch between carriers from the same account, with no new
                  registration and no starting over.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </Section>

        {/* Who it's for */}
        <Section
          id="who-its-for"
          data-nav-surface="white"
          className="scroll-mt-16"
        >
          <motion.h2
            variants={rise}
            {...inView()}
            className="font-display text-harbour max-small-mobile:text-3xl max-w-3xl text-5xl leading-[1.05] font-extrabold tracking-tight text-balance"
          >
            {tuck("Built for the people who keep Nigerian exports moving.")}
          </motion.h2>

          <motion.div
            variants={stagger(0.14)}
            {...inView(0.2)}
            className="mt-16 border-t border-slate-200"
          >
            {AUDIENCES.map((audience) => (
              <motion.div
                key={audience.title}
                variants={rise}
                className="max-small-tablet:grid-cols-1 max-small-tablet:gap-3 grid grid-cols-[5fr_7fr] gap-12 border-b border-slate-200 py-10"
              >
                <h3 className="font-display text-harbour max-small-mobile:text-3xl text-4xl leading-tight font-bold tracking-tight">
                  {audience.title}
                </h3>
                <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
                  {audience.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </Section>

        {/* Shipping lines: a departures board */}
        <Section
          id="shipping-lines"
          data-nav-surface="harbour"
          className="bg-harbour scroll-mt-16 text-white"
        >
          <div className="max-tablet:grid-cols-1 max-tablet:gap-12 grid grid-cols-[1fr_1.25fr] gap-16">
            <motion.div variants={stagger(0.1)} {...inView()}>
              <motion.h2
                variants={rise}
                className="font-display max-small-mobile:text-3xl text-5xl leading-[1.05] font-extrabold tracking-tight text-balance"
              >
                {tuck("Connected to the world's leading shipping lines.")}
              </motion.h2>
              <motion.p
                variants={rise}
                className="mt-6 text-lg leading-relaxed text-slate-300"
              >
                Freightafford integrates with carrier systems so you get
                accurate, up-to-date information, and more lines are joining
                soon.
              </motion.p>
            </motion.div>

            <motion.div
              variants={rise}
              {...inView(0.2)}
              className="overflow-hidden rounded-xl border border-white/10 bg-[#061a31]"
            >
              <div className="bg-live/10 flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
                <div>
                  <p className="font-display text-2xl font-bold">Maersk Line</p>
                  <p className="mt-1 text-slate-300">
                    Schedules, bookings and tracking, available today.
                  </p>
                </div>
                <span className="text-live flex shrink-0 items-center gap-2 text-sm font-semibold">
                  <span className="bg-live h-2 w-2 rounded-full" />
                  Live now
                </span>
              </div>

              <motion.ul variants={stagger(0.06, 0.3)}>
                {UPCOMING_CARRIERS.map((carrier) => (
                  <motion.li
                    key={carrier}
                    variants={row}
                    className="flex items-center justify-between gap-4 border-b border-white/5 px-6 py-3.5"
                  >
                    <span className="text-slate-200">{carrier}</span>
                    <span className="text-ochre shrink-0 text-sm">
                      Coming soon
                    </span>
                  </motion.li>
                ))}
                <motion.li
                  variants={row}
                  className="px-6 py-3.5 text-slate-400"
                >
                  And more
                </motion.li>
              </motion.ul>
            </motion.div>
          </div>

          <p className="mt-14 max-w-3xl text-xs leading-relaxed text-slate-400">
            Freightafford International Logistics Limited is an independent
            third-party freight provider. We are not affiliated with or endorsed
            by the shipping lines listed. All carrier names and marks belong to
            their respective owners.
          </p>
        </Section>

        {/* Closing CTA */}
        <Section data-nav-surface="brand" className="bg-brand text-white">
          <motion.div
            variants={stagger(0.1)}
            {...inView()}
            className="max-w-4xl"
          >
            <motion.h2
              variants={rise}
              className="font-display max-small-mobile:text-4xl text-6xl leading-[1.02] font-extrabold tracking-tight text-balance"
            >
              {tuck("Your next shipment starts here.")}
            </motion.h2>
            <motion.p
              variants={rise}
              className="mt-6 max-w-xl text-lg leading-relaxed text-white/85"
            >
              Stop chasing shipping lines. Create your account, check live
              schedules and make your next booking in minutes.
            </motion.p>
            <motion.div
              variants={rise}
              className="max-small-mobile:flex-col mt-10 flex gap-4"
            >
              <Link to="/register" className="max-small-mobile:w-full">
                <Button
                  icon={UserPlus}
                  size="lg"
                  className="text-harbour max-small-mobile:w-full bg-white hover:bg-slate-100 hover:opacity-100"
                >
                  Create Your Account
                </Button>
              </Link>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="max-small-mobile:w-full"
              >
                <Button
                  icon={MessageSquare}
                  size="lg"
                  variant="outline"
                  className="max-small-mobile:w-full border-white/50 text-white hover:bg-white/10"
                >
                  Talk to Our Team
                </Button>
              </a>
            </motion.div>
          </motion.div>
          <p className="font-display mt-20 border-t border-white/25 pt-6 text-lg font-semibold">
            Freightafford. Ocean freight, made seamless.
          </p>
        </Section>

        <Footer />
      </div>
    </MotionConfig>
  );
};
export default LandingPage;
