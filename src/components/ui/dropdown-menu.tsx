import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import cn from "../../utils/cn";

// shadcn/ui DropdownMenu, on Radix (the parts this project uses).

const DropdownMenu = (
  props: ComponentProps<typeof DropdownMenuPrimitive.Root>,
) => <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;

const DropdownMenuTrigger = (
  props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>,
) => (
  <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
);

const DropdownMenuContent = ({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      data-slot="dropdown-menu-content"
      sideOffset={sideOffset}
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-[60] max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 text-slate-900 shadow-[0_12px_32px_-8px_rgb(15_23_43/0.18)]",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

const DropdownMenuGroup = (
  props: ComponentProps<typeof DropdownMenuPrimitive.Group>,
) => <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;

const DropdownMenuItem = ({
  className,
  variant = "default",
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  variant?: "default" | "destructive";
}) => (
  <DropdownMenuPrimitive.Item
    data-slot="dropdown-menu-item"
    className={cn(
      "relative flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.9375rem] outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-slate-100 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      variant === "destructive" &&
        "text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700",
      className,
    )}
    {...props}
  />
);

const DropdownMenuLabel = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) => (
  <DropdownMenuPrimitive.Label
    data-slot="dropdown-menu-label"
    className={cn(
      "px-3 py-1.5 text-xs font-semibold text-slate-500",
      className,
    )}
    {...props}
  />
);

const DropdownMenuSeparator = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) => (
  <DropdownMenuPrimitive.Separator
    data-slot="dropdown-menu-separator"
    className={cn("-mx-1.5 my-1.5 h-px bg-slate-100", className)}
    {...props}
  />
);

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
