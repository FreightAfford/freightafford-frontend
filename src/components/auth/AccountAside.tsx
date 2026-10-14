// The navy panel beside Log in and the password pages.
const AccountAside = () => (
  <div>
    <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.1rem)] leading-tight font-extrabold tracking-tight">
      Your shipments, where you left them
    </h2>
    <p className="mt-3 max-w-md leading-relaxed text-slate-300">
      Bookings, tracking and your business verification are saved to your
      account. Log in to pick up where you stopped.
    </p>
    <p className="mt-8 flex items-center gap-2.5 text-sm text-slate-400">
      <span className="bg-live h-2 w-2 shrink-0 rounded-full" />
      Live with Maersk Line. More shipping lines coming soon.
    </p>
  </div>
);

export default AccountAside;
