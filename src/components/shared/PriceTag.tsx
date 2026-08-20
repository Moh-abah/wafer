"use client";

import { cn } from "@/lib/utils";

const priceFormatter = new Intl.NumberFormat("ar-SA", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

interface PriceTagProps {
  price: number;
  className?: string;
  discountedPrice?: number;
}

export function PriceTag({ price, className, discountedPrice }: PriceTagProps) {
  const formattedPrice = priceFormatter.format(price);

  if (discountedPrice !== undefined) {
    const formattedDiscounted = priceFormatter.format(discountedPrice);
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-base font-bold text-foreground">
          {formattedDiscounted} ر.س
        </span>
        <span className="text-sm text-muted-foreground line-through">
          {formattedPrice} ر.س
        </span>
      </div>
    );
  }

  return (
    <span className={cn("text-base font-bold text-foreground", className)}>
      {formattedPrice} ر.س
    </span>
  );
}
