import cn from "../utils/cn";

// A row of containers seen side-on, echoing the stack in the landing hero.
// Widths are 20ft (1) and 40ft (2) boxes, repeated to fill the row.
const CONTAINER_ROW = [
  { span: 2, color: "bg-ochre" },
  { span: 1, color: "bg-[#3f7cbf]" },
  { span: 2, color: "bg-kelp" },
  { span: 1, color: "bg-[#16395f]" },
  { span: 1, color: "bg-ochre" },
  { span: 2, color: "bg-[#3f7cbf]" },
  { span: 1, color: "bg-kelp" },
  { span: 2, color: "bg-[#16395f]" },
  { span: 1, color: "bg-[#3f7cbf]" },
  { span: 2, color: "bg-ochre" },
  { span: 1, color: "bg-kelp" },
  { span: 1, color: "bg-[#3f7cbf]" },
];

const ContainerRow = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn("flex h-2.5 gap-[3px] overflow-hidden", className)}
  >
    {[...CONTAINER_ROW, ...CONTAINER_ROW].map((box, i) => (
      <span
        key={i}
        className={cn("min-w-0", box.color)}
        style={{ flexGrow: box.span, flexBasis: 0 }}
      />
    ))}
  </div>
);

export default ContainerRow;
