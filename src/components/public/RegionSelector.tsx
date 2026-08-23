"use client";

import { motion, useReducedMotion } from "framer-motion";
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
import { Check } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Region selector bound to the region store.
 * Loading -> Skeleton, Error -> destructive text + retry, Empty -> muted text.
 * Shows pulsing indicator when no region is selected.
 */
export function RegionSelector() {
  const { data, isLoading, error, refetch } = useRegions();
  const selectedRegionId = useRegionStore((s) => s.selectedRegionId);
  const setSelectedRegion = useRegionStore((s) => s.setSelectedRegion);
const prefersReduced = usePrefersReducedMotion();

  const selectedRegion = data?.find((r) => r.id === selectedRegionId);

  if (isLoading) {
    return (
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <Skeleton className="h-9 w-40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full items-center gap-2 sm:w-auto">
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
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <span className="text-sm text-muted-foreground">لا توجد مناطق</span>
      </div>
    );
  }

  /* When no region is selected, show a pulsing indicator */
  if (!selectedRegionId || !selectedRegion) {
    return (
      <div className="flex w-full items-center gap-2 sm:w-auto">
        {!prefersReduced && (
          <motion.span
            className="relative flex h-2.5 w-2.5"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.85, 1.15, 0.85] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </motion.span>
        )}
        <Select
          value={selectedRegionId != null ? String(selectedRegionId) : ""}
          onValueChange={(val) => setSelectedRegion(Number(val))}
        >
          <SelectTrigger
            className="h-9 w-full sm:w-56"
            aria-label="اختيار المنطقة"
          >
            <SelectValue placeholder="اختر منطقتك" />
          </SelectTrigger>
          <SelectContent>
            {data.map((region) => (
              <SelectItem key={region.id} value={String(region.id)}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  /* Region is selected - show name with checkmark */
  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15"
      >
        <Check className="h-3.5 w-3.5 text-primary" />
      </motion.span>
      <Select
        value={String(selectedRegionId)}
        onValueChange={(val) => setSelectedRegion(Number(val))}
      >
        <SelectTrigger
          className="h-9 w-full sm:w-56"
          aria-label="اختيار المنطقة"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {data.map((region) => (
            <SelectItem key={region.id} value={String(region.id)}>
              {region.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
