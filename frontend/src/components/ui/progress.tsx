import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface AdditionalProgressProps {
  indicatorClassName?: string;
  wrapperClassName?: string;
  barHeight?: string;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  goalAt?: number;
  goalLabel?: string;
  destructiveOnOverflow?: boolean; // default: false
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root> & AdditionalProgressProps,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> &
    AdditionalProgressProps
>(({
  className,
  value,
  indicatorClassName,
  wrapperClassName,
  barHeight = "h-2",
  label,
  sublabel,
  goalAt,
  goalLabel,
  destructiveOnOverflow = false,
  ...props
}, ref) => {
  const pct = value || 0;
  const clamped = Math.min(pct, 100);
  const isOver = destructiveOnOverflow && pct > 100;

  return (
    <div className={cn("flex flex-col items-center gap-2 w-1/4", wrapperClassName)}>
      {(label !== undefined || sublabel !== undefined) && (
        <div className="flex w-full items-baseline justify-between gap-2">
          {label !== undefined && (
            <span className="text-sm font-medium">{label}</span>
          )}
          {sublabel !== undefined && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {sublabel}
            </span>
          )}
        </div>
      )}
      <div className="relative w-full">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            `relative ${barHeight} w-full overflow-hidden rounded-full bg-primary/20`,
            className,
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full w-full flex-1 transition-all",
              isOver ? "bg-destructive" : "bg-primary",
              indicatorClassName && !isOver ? indicatorClassName : "",
            )}
            style={{ transform: `translateX(-${100 - clamped}%)` }}
          />
        </ProgressPrimitive.Root>

        {goalAt !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground/60"
            style={{ left: `${goalAt}%` }}
          />
        )}
      </div>

      {goalAt !== undefined && goalLabel && (
        <p
          className="text-xs text-muted-foreground w-full mt-1"
          style={{ paddingLeft: `${goalAt}%` }}
        >
          ← {goalLabel}
        </p>
      )}
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
