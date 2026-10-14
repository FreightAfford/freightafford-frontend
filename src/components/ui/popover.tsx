import { Popover as PopoverPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import cn from "../../utils/cn";

// shadcn/ui Popover, on Radix.

const Popover = (props: ComponentProps<typeof PopoverPrimitive.Root>) => (
  <PopoverPrimitive.Root data-slot="popover" {...props} />
);

const PopoverTrigger = (
  props: ComponentProps<typeof PopoverPrimitive.Trigger>,
) => <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;

const PopoverAnchor = (
  props: ComponentProps<typeof PopoverPrimitive.Anchor>,
) => <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;

const PopoverContent = ({
  className,
  align = "start",
  sideOffset = 6,
  collisionPadding = 8,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      data-slot="popover-content"
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-[60] origin-(--radix-popover-content-transform-origin) rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-[0_12px_32px_-8px_rgb(15_23_43/0.18)] outline-none",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
);

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
