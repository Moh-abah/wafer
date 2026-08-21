"use client";

import { useRegions } from "@/hooks/useRegions";
import { useRegionStore } from "@/store/region.store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

/**
 * Region selector bound to the region store.
 * Loading → Skeleton, Error → destructive text + retry, Empty → muted text.
 */
export function RegionSelector() {
  const { data, isLoading, error, refetch } = useRegions();
  const selectedRegionId = useRegionStore((s) => s.selectedRegionId);
  const setSelectedRegion = useRegionStore((s) => s.setSelectedRegion);

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <span className="sr-only">اختيار المنطقة</span>

      {isLoading ? (
        <Skeleton className="h-9 w-40" />
      ) : error ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-destructive">تعذّر تحميل المناطق</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => refetch()}
          >
            إعادة المحاولة
          </Button>
        </div>
      ) : !data || data.length === 0 ? (
        <span className="text-sm text-muted-foreground">لا توجد مناطق</span>
      ) : (
        <Select
          value={selectedRegionId != null ? String(selectedRegionId) : undefined}
          onValueChange={(val) => setSelectedRegion(Number(val))}
        >
          <SelectTrigger
            className="h-9 w-full sm:w-56"
            aria-label="اختيار المنطقة"
          >
            <SelectValue placeholder="اختر المنطقة" />
          </SelectTrigger>
          <SelectContent>
            {data.map((region) => (
              <SelectItem key={region.id} value={String(region.id)}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
