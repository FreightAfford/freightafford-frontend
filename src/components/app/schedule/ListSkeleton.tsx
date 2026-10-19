// Loading placeholder for a list of sailings or routes.
const ListSkeleton = ({ label }: { label: string }) => (
  <div className="space-y-3 p-5" aria-label={label}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="h-28 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none"
      />
    ))}
  </div>
);

export default ListSkeleton;
