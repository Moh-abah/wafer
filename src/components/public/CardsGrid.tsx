"use client";

import { useCards } from "@/hooks/useCards";
import { useRegionStore } from "@/store/region.store";
import { CardItem } from "@/components/public/CardItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

export function CardsGrid() {
  const { data, isLoading, error, refetch } = useCards();
  const selectedRegionId = useRegionStore((s) => s.selectedRegionId);

  if (isLoading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="تعذّر تحميل البطاقات"
        description="حدث خطأ أثناء جلب البطاقات. حاول مرة أخرى."
        onRetry={() => refetch()}
      />
    );
  }

  if (!selectedRegionId) {
    return (
      <EmptyState
        title="اختر منطقة لعرض البطاقات"
        description="حدد منطقتك من القائمة أعلى الصفحة لاستعراض البطاقات المتاحة."
      />
    );
  }

  const cards = [...(data ?? [])].sort(
    (a, b) => a.display_order - b.display_order || a.id - b.id
  );

  if (cards.length === 0) {
    return (
      <EmptyState
        title="لا توجد بطاقات في هذه المنطقة حاليًا"
        description="ترقّب المزيد من البطاقات قريبًا في منطقتك."
      />
    );
  }

  return (
    <div className={GRID}>
      {cards.map((card) => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
}

function EmptyState({ title, description, onRetry }: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "border-dashed bg-muted/30",
        "flex min-h-[10rem] items-center justify-center"
      )}
    >
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-base font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        ) : null}
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            إعادة المحاولة
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
