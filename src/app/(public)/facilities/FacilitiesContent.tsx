"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Search, UtensilsCrossed, Coffee, Landmark, MapPin, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscountBadge } from "@/components/shared/DiscountBadge";
import { ImageWithSkeleton } from "@/components/shared/ImageWithSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFacilities } from "@/hooks/useFacilities";
import { useRegionStore } from "@/store/region.store";
import type { FacilityType, Facility } from "@/types/api.generated";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: { key: FacilityType | "all"; label: string; icon: typeof UtensilsCrossed }[] = [
  { key: "all", label: "الكل", icon: Landmark },
  { key: "restaurant", label: "مطاعم", icon: UtensilsCrossed },
  { key: "cafe", label: "كافيهات", icon: Coffee },
  { key: "public_facility", label: "مرافق عامة", icon: Landmark },
];

const TYPE_LABEL: Record<FacilityType, string> = {
  restaurant: "مطعم",
  cafe: "مقهى",
  public_facility: "مرفق عام",
};

const TYPE_ICON: Record<FacilityType, typeof UtensilsCrossed> = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  public_facility: Landmark,
};

const TYPE_BADGE_CLASS: Record<FacilityType, string> = {
  restaurant: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  cafe: "bg-accent/15 text-accent border-accent/20",
  public_facility: "bg-secondary/15 text-secondary border-secondary/20",
};

/* ------------------------------------------------------------------ */
/*  Debounce hook                                                      */
/* ------------------------------------------------------------------ */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* ------------------------------------------------------------------ */
/*  FacilityCard (upgraded)                                            */
/* ------------------------------------------------------------------ */
function FacilityCard({ facility }: { facility: Facility }) {
  const Icon = TYPE_ICON[facility.type];
  return (
    <Link href={`/facilities/${facility.id}`} className="block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="rounded-2xl border bg-card overflow-hidden transition-shadow hover:shadow-lg"
      >
        <div className="relative h-44 sm:h-52 bg-muted">
          {facility.image_url ? (
            <ImageWithSkeleton src={facility.image_url} alt={facility.name} fill className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Icon className="h-14 w-14 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-3 left-3 z-10">
            <DiscountBadge percentage={30} />
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-foreground truncate">{facility.name}</h3>
            <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium", TYPE_BADGE_CLASS[facility.type])}>
              {TYPE_LABEL[facility.type]}
            </span>
          </div>
          {facility.address ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{facility.address}</span>
            </p>
          ) : null}
        </div>
      </motion.div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty search result illustration                                   */
/* ------------------------------------------------------------------ */
function EmptySearchIllustration() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground">لا توجد نتائج</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs">
          جرّب تغيير كلمة البحث أو اختر فلترًا مختلفًا للعثور على ما تبحث عنه
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FacilitiesGrid                                                     */
/* ------------------------------------------------------------------ */
function FacilitiesGrid() {
  const { data, isLoading, error, refetch } = useFacilities();
  const selectedRegionId = useRegionStore((s) => s.selectedRegionId);
  const [typeFilter, setTypeFilter] = useState<FacilityType | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const prefersReduced = useReducedMotion();

  const allFacilities = useMemo(
    () => [...(data ?? [])].sort((a, b) => a.display_order - b.display_order || a.id - b.id),
    [data]
  );

  const filtered = useMemo(() => {
    let result = allFacilities;
    if (typeFilter !== "all") result = result.filter((f) => f.type === typeFilter);
    if (debouncedSearch.trim()) result = result.filter((f) => f.name.includes(debouncedSearch.trim()));
    return result;
  }, [allFacilities, typeFilter, debouncedSearch]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-card overflow-hidden">
            <Skeleton className="h-44 w-full" />
            <div className="p-4 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState title="تعذّر تحميل المنشآت" message="حدث خطأ أثناء جلب المنشآت" onRetry={() => refetch()} />;
  }

  if (!selectedRegionId) {
    return <EmptyState icon={Landmark} title="اختر منطقة لعرض المنشآت" description="حدد منطقتك من القائمة أعلى الصفحة" />;
  }

  if (allFacilities.length === 0) {
    return <EmptyState icon={Landmark} title="لا توجد منشآت في هذه المنطقة" description="ترقّب المزيد من المنشآت قريبًا" />;
  }

  const staggerVariants = prefersReduced
    ? { hidden: {}, visible: { transition: { staggerChildren: 0 } } }
    : { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

  return (
    <div>
      {/* Prominent search bar - always visible */}
      <div className="mb-6">
        <div className="relative max-w-lg">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث عن منشأة..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-11 min-h-[44px] pr-11 rounded-full text-base"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="scroll-area-thin mb-6 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
        {TYPE_CONFIG.map((cfg) => (
          <button
            key={cfg.key}
            onClick={() => setTypeFilter(cfg.key)}
            className={cn(
              "shrink-0 snap-start rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px] flex items-center gap-2",
              typeFilter === cfg.key
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <cfg.icon className="h-4 w-4" />
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Results counter */}
      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} منشأة
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptySearchIllustration />
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          key={`${typeFilter}-${debouncedSearch}`}
          variants={staggerVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((f) => (
            <motion.div
              key={f.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
              }}
            >
              <FacilityCard facility={f} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function FacilitiesContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">المنشآت</h1>
        <p className="mt-1 text-sm text-muted-foreground">استعرض المطاعم والكافيهات والمرافق العامة المتاحة</p>
      </div>
      <FacilitiesGrid />
    </div>
  );
}
