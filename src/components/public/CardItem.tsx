import * as React from "react";
import type { Card } from "@/types/api.generated";
import {
  Card as CardUI,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CardItemProps {
  card: Card;
}

/**
 * Single discount card display.
 * Always shows the fixed 30% discount text per platform policy.
 */
export function CardItem({ card }: CardItemProps) {
  return (
    <CardUI
      className={cn(
        "group relative overflow-hidden transition-all duration-200",
        "hover:shadow-md hover:ring-1 hover:ring-primary/30",
        "hover:-translate-y-0.5"
      )}
    >
      {/* Decorative gradient accent on the start edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-gradient-to-b from-primary/60 via-primary/40 to-transparent"
      />

      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">{card.name}</CardTitle>
            <CardDescription className="line-clamp-1">
              {card.platform_name}
            </CardDescription>
          </div>
          <Badge
            className={cn(
              "shrink-0 bg-gradient-to-l from-primary to-primary/70",
              "text-primary-foreground border-transparent shadow-sm"
            )}
          >
            30%-
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm font-medium leading-6 text-foreground">
          خصم 30% على جميع المطاعم والمرافق العامة والمقاهي
        </p>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        بطاقة خصم عضوية
      </CardFooter>
    </CardUI>
  );
}
