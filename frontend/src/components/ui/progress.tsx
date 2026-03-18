import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface AdditionalProgressProps {
  indicatorClassName?: string;
  wrapperClassName?: string;
  barHeight?: string;
  label: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root> & AdditionalProgressProps,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> &
    AdditionalProgressProps
>(({ className, value, indicatorClassName, wrapperClassName, barHeight = "h-2", label, ...props }, ref) => (
  <div className={cn("flex flex-col items-center gap-2 w-1/4", wrapperClassName)}>
    {<h2>{label}</h2>}
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
          "h-full w-full flex-1 bg-primary transition-all",
          indicatorClassName,
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  </div>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
