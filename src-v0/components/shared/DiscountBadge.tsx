"use client";

import { cn } from "@/lib/utils";

interface DiscountBadgeProps {
  percentage?: number;
  className?: string;
}

export function DiscountBadge({
  percentage = 30,
  className,
}: DiscountBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold leading-none",
        className
      )}
    >
      خصم {percentage}%
    </span>
  );
}
