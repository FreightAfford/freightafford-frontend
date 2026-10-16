import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import cn from "../../utils/cn";

// shadcn/ui Select, on Radix. Styled with the project's tokens; the field
// wrappers in components/Select.tsx build on these parts.

const Select = (props: ComponentProps<typeof SelectPrimitive.Root>) => (
  <SelectPrimitive.Root data-slot="select" {...props} />
);

const SelectGroup = (props: ComponentProps<typeof SelectPrimitive.Group>) => (
  <SelectPrimitive.Group data-slot="select-group" {...props} />
);

const SelectValue = (props: ComponentProps<typeof SelectPrimitive.Value>) => (
  <SelectPrimitive.Value data-slot="select-value" {...props} />
);

const SelectTrigger = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) => (
  <SelectPrimitive.Trigger
    data-slot="select-trigger"
    className={cn(
      "group/trigger flex w-full items-center justify-between gap-2 text-left whitespace-nowrap outline-none disabled:cursor-not-allowed data-[placeholder]:text-slate-400 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDownIcon className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-150 group-data-[state=open]/trigger:rotate-180" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
);

// Radix Select is always modal: while open (and while it animates closed) it
// sets `pointer-events: none` on the body, so a click elsewhere only closes
// it. Find what was under the pointer and act on it straight away, so one
// click both closes this select and opens the next one or presses the button.
type PointerDownOutside = Parameters<
  NonNullable<
    ComponentProps<typeof SelectPrimitive.Content>["onPointerDownOutside"]
  >
>[0];

const elementUnderPointer = (x: number, y: number) => {
  const { body } = document;
  const blocked = body.style.pointerEvents;
  body.style.pointerEvents = "auto";
  const element = document.elementFromPoint(x, y);
  body.style.pointerEvents = blocked;
  return element;
};

const CLICKABLE =
  "button, a[href], input, textarea, label, [role=button], [tabindex]";

// The control a click outside landed on. When the select closes it would
// hand focus back to its own trigger, so it goes here instead.
// "keep" leaves focus where it is (inside the select that opened next).
let focusAfterClose: HTMLElement | "keep" | null = null;

const actOnElementUnderPointer = (event: PointerDownOutside) => {
  const pointer = event.detail.originalEvent;
  if (pointer.button !== 0) return;
  const under = elementUnderPointer(pointer.clientX, pointer.clientY);
  if (!under) return;

  // Another select opens on pointerdown, so replay that once this one closes.
  const trigger = under.closest("[data-slot=select-trigger]");
  if (trigger instanceof HTMLElement) {
    focusAfterClose = "keep";
    requestAnimationFrame(() =>
      trigger.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          button: 0,
          pointerType: "mouse",
          pointerId: pointer.pointerId,
          clientX: pointer.clientX,
          clientY: pointer.clientY,
        }),
      ),
    );
    return;
  }

  // Anything else: the click that follows lands on <html> while the page is
  // blocked, so hand it to the control instead. A click that reaches the
  // control on its own is left alone.
  const control = under.closest(CLICKABLE);
  if (!(control instanceof HTMLElement)) return;
  focusAfterClose = control;
  const onClick = (click: MouseEvent) => {
    const target = click.target as Node;
    if (target === document.documentElement || target === document.body) {
      control.focus();
      control.click();
    }
  };
  window.addEventListener("click", onClick, { capture: true, once: true });
  // A press that never becomes a click mustn't hijack a later one.
  setTimeout(() => window.removeEventListener("click", onClick, true), 1000);
};

const SelectContent = ({
  className,
  children,
  position = "popper",
  onPointerDownOutside,
  onCloseAutoFocus,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      data-slot="select-content"
      position={position}
      onPointerDownOutside={(event) => {
        onPointerDownOutside?.(event);
        actOnElementUnderPointer(event);
      }}
      onCloseAutoFocus={(event) => {
        onCloseAutoFocus?.(event);
        if (!focusAfterClose) return;
        event.preventDefault();
        if (focusAfterClose !== "keep") focusAfterClose.focus();
        focusAfterClose = null;
      }}
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 relative z-[60] max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-slate-200 bg-white text-slate-900 shadow-[0_12px_32px_-8px_rgb(15_23_43/0.18)]",
        position === "popper" &&
          "w-full min-w-(--radix-select-trigger-width) data-[side=bottom]:translate-y-1.5 data-[side=top]:-translate-y-1.5",
        className,
      )}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1.5",
          position === "popper" &&
            "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);

const SelectLabel = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Label>) => (
  <SelectPrimitive.Label
    data-slot="select-label"
    className={cn(
      "px-2.5 py-1.5 text-xs font-semibold text-slate-500",
      className,
    )}
    {...props}
  />
);

const SelectItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    data-slot="select-item"
    className={cn(
      "data-[state=checked]:text-brand relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2.5 pr-9 pl-3 text-[0.9375rem] outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-slate-100 data-[state=checked]:font-medium",
      className,
    )}
    {...props}
  >
    <span className="absolute right-3 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);

const SelectSeparator = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) => (
  <SelectPrimitive.Separator
    data-slot="select-separator"
    className={cn(
      "pointer-events-none -mx-1 my-1 h-px bg-slate-100",
      className,
    )}
    {...props}
  />
);

const SelectScrollUpButton = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpButton>) => (
  <SelectPrimitive.ScrollUpButton
    data-slot="select-scroll-up-button"
    className={cn(
      "flex cursor-default items-center justify-center py-1 text-slate-400",
      className,
    )}
    {...props}
  >
    <ChevronUpIcon className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
);

const SelectScrollDownButton = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownButton>) => (
  <SelectPrimitive.ScrollDownButton
    data-slot="select-scroll-down-button"
    className={cn(
      "flex cursor-default items-center justify-center py-1 text-slate-400",
      className,
    )}
    {...props}
  >
    <ChevronDownIcon className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
);

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
