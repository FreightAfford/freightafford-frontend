import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import cn from "../../utils/cn";

// shadcn/ui Calendar, on react-day-picker v9, in the project's colours.
const Calendar = ({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  ...props
}: ComponentProps<typeof DayPicker>) => {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn("group/calendar [--cell-size:2.25rem]", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: cn("relative flex flex-col gap-4", defaults.months),
        month: cn("flex w-full flex-col gap-3", defaults.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaults.nav,
        ),
        button_previous: cn(
          "inline-flex size-(--cell-size) items-center justify-center rounded-lg text-slate-500 transition-colors select-none hover:bg-slate-100 hover:text-slate-900 aria-disabled:pointer-events-none aria-disabled:opacity-30",
          defaults.button_previous,
        ),
        button_next: cn(
          "inline-flex size-(--cell-size) items-center justify-center rounded-lg text-slate-500 transition-colors select-none hover:bg-slate-100 hover:text-slate-900 aria-disabled:pointer-events-none aria-disabled:opacity-30",
          defaults.button_next,
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaults.month_caption,
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5",
          defaults.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-lg border border-slate-200 transition-colors hover:border-slate-300 has-focus:border-brand has-focus:shadow-[0_0_0_3px_rgb(30_144_255/0.15)]",
          defaults.dropdown_root,
        ),
        dropdown: cn(
          "absolute inset-0 cursor-pointer bg-white opacity-0",
          defaults.dropdown,
        ),
        caption_label: cn(
          "font-display font-semibold text-slate-900 select-none",
          captionLayout === "label"
            ? "text-[0.9375rem]"
            : "flex h-8 items-center gap-1 rounded-lg pr-1.5 pl-2.5 text-sm [&>svg]:size-3.5 [&>svg]:text-slate-400",
          defaults.caption_label,
        ),
        month_grid: "w-full border-collapse",
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn(
          "flex-1 pb-1 text-[0.8125rem] font-medium text-slate-400 select-none",
          defaults.weekday,
        ),
        week: cn("mt-1 flex w-full", defaults.week),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none",
          defaults.day,
        ),
        today: cn("text-brand font-semibold", defaults.today),
        outside: cn("text-slate-300", defaults.outside),
        disabled: cn("text-slate-300 opacity-60", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...rest }) => {
          if (orientation === "left")
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...rest} />
            );
          if (orientation === "right")
            return (
              <ChevronRightIcon className={cn("size-4", className)} {...rest} />
            );
          return (
            <ChevronDownIcon className={cn("size-4", className)} {...rest} />
          );
        },
        DayButton: ({ className, day, modifiers, ...rest }) => (
          <button
            data-day={day.date.toLocaleDateString()}
            className={cn(
              "focus-visible:ring-brand/40 flex size-(--cell-size) items-center justify-center rounded-lg text-[0.9375rem] leading-none transition-colors outline-none hover:bg-slate-100 focus-visible:ring-2 disabled:pointer-events-none",
              modifiers.selected &&
                "bg-brand hover:bg-brand font-semibold text-white",
              className,
            )}
            {...rest}
          />
        ),
      }}
      {...props}
    />
  );
};

export { Calendar };
