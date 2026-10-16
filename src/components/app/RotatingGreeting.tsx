import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Fragment, useEffect, useState } from "react";

const NAME = "Shipper";
const INTERVAL = 4500;

const timeOfDay = (hour: number) => {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Burning the midnight oil";
};

const SHIPMENT_LINES: Record<string, string> = {
  confirmed: "Cargo is almost aboard",
  in_transit: "Cargo is at sea",
  arrived: "Cargo has made port",
  delivered: "Another one delivered",
};

const WEEKDAY_LINES: Record<number, string> = {
  1: "Fresh week, fresh freight",
  5: "Happy Friday",
};

// Built fresh on every turn, so the time of day stays right on a page left
// open for hours. The time-of-day line always comes first.
const greetings = (now: Date, shipmentStatus?: string) =>
  [
    timeOfDay(now.getHours()),
    shipmentStatus && SHIPMENT_LINES[shipmentStatus],
    "Welcome back",
    WEEKDAY_LINES[now.getDay()],
    "Ahoy",
  ].filter((line): line is string => !!line);

const word = {
  enter: { opacity: 0, y: "0.55em", filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
  leave: {
    opacity: 0,
    y: "-0.55em",
    filter: "blur(6px)",
    transition: { duration: 0.3, ease: "easeIn" as const },
  },
};

const Line = ({ text }: { text: string }) => (
  <>
    {`${text},`.split(" ").map((part, index) => (
      <Fragment key={index}>
        <motion.span variants={word} className="inline-block">
          {part}
        </motion.span>{" "}
      </Fragment>
    ))}
    <motion.span variants={word} className="text-brand inline-block">
      {NAME}
    </motion.span>
  </>
);

// The Overview headline: a greeting that turns over every few seconds, word
// by word. It pauses while hovered or while the tab is hidden, and holds
// still on the time-of-day line for people who prefer reduced motion.
const RotatingGreeting = ({ shipmentStatus }: { shipmentStatus?: string }) => {
  const reduceMotion = useReducedMotion();
  const [now, setNow] = useState(() => new Date());
  const [turn, setTurn] = useState(0);
  const [paused, setPaused] = useState(false);

  const lines = greetings(now, shipmentStatus);
  const rotating = !reduceMotion && lines.length > 1;
  const line = lines[rotating ? turn % lines.length : 0];

  useEffect(() => {
    if (!rotating || paused) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setNow(new Date());
      setTurn((value) => value + 1);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [rotating, paused]);

  return (
    <h1
      aria-label={`${lines[0]}, ${NAME}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="grid text-2xl font-bold text-slate-900"
    >
      {/* Every line, invisible, in the same cell: the heading keeps the
          height of the longest one, so the page never jumps. */}
      {lines.map((text) => (
        <span
          key={text}
          aria-hidden="true"
          className="invisible col-start-1 row-start-1"
        >
          {`${text}, ${NAME}`}
        </span>
      ))}
      <AnimatePresence initial={false}>
        <motion.span
          key={line}
          aria-hidden="true"
          className="col-start-1 row-start-1"
          initial="enter"
          animate="show"
          exit="leave"
          variants={{
            show: { transition: { staggerChildren: 0.06 } },
            leave: { transition: { staggerChildren: 0.025 } },
          }}
        >
          <Line text={line} />
        </motion.span>
      </AnimatePresence>
    </h1>
  );
};

export default RotatingGreeting;
