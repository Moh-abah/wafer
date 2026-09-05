"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StarRatingProps {
  /** Rating value (0–5). Floats are supported for display (e.g. 4.5). */
  value: number;
  /** Star size in pixels. Defaults to 16. */
  size?: number;
  /** Read-only (display) vs interactive (input). Defaults to read-only. */
  interactive?: boolean;
  /** Called when a star is clicked (only when interactive). */
  onChange?: (rating: number) => void;
  /** Show the numeric value next to the stars. */
  showValue?: boolean;
  className?: string;
  /** Hover state — the star the user is currently hovering (1–5). */
  hoverValue?: number;
}

/** Render 5 stars with partial fill support for display, or click handlers
 * for input. Uses a relative overlay technique so half-stars render cleanly
 * without needing a separate half-star icon. */
export function StarRating({
  value,
  size = 16,
  interactive = false,
  onChange,
  showValue = false,
  className,
  hoverValue,
}: StarRatingProps) {
  const displayValue = hoverValue ?? value;
  // For interactive mode, round to whole stars; for display, allow partial fill
  const filledCount = interactive ? Math.round(displayValue) : displayValue;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="relative inline-flex" role={interactive ? "radiogroup" : "img"} aria-label={`تقييم ${value} من 5`}>
        {/* Background (empty) stars */}
        <div className="inline-flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              style={{ width: size, height: size }}
              className="text-muted-foreground/30"
              fill="currentColor"
              strokeWidth={0}
            />
          ))}
        </div>
        {/* Foreground (filled) stars — clipped to the filled percentage */}
        <div
          className="absolute inset-0 inline-flex overflow-hidden"
          style={{ width: `${(filledCount / 5) * 100}%` }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              style={{ width: size, height: size, flexShrink: 0 }}
              className="text-accent"
              fill="currentColor"
              strokeWidth={0}
            />
          ))}
        </div>
        {/* Interactive overlay (click targets) */}
        {interactive && (
          <div className="absolute inset-0 inline-flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={Math.round(value) === star}
                aria-label={`${star} نجوم`}
                onClick={() => onChange?.(star)}
                style={{ width: size, height: size, flexShrink: 0 }}
                className="cursor-pointer appearance-none bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background rounded-sm"
              />
            ))}
          </div>
        )}
      </div>
      {showValue && (
        <span className="text-sm font-bold tabular-nums text-foreground" dir="ltr">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
