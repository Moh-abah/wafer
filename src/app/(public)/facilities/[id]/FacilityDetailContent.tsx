"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  Phone, MapPin, Clock, Search, ExternalLink,
  UtensilsCrossed, Coffee, Landmark, ArrowRight, PackageOpen,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { DiscountBadge } from "@/components/shared/DiscountBadge";
import { ImageWithSkeleton } from "@/components/shared/ImageWithSkeleton";
import { PriceTag } from "@/components/shared/PriceTag";
import { ErrorState } from "@/components/shared/ErrorState";
import { useFacilityProducts, useAllFacilityProducts } from "@/hooks/useFacilityProducts";
import { useProductCategories } from "@/hooks/useProductCategories";
import { useFacilities } from "@/hooks/useFacilities";
import type { FacilityType, Product } from "@/types/api.generated";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<FacilityType, string> = {
  restaurant: "مطعم",
  cafe: "مقهى",
  public_facility: "مرفق عام",
};

const PRICE_FMT = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/* ─── Product Card ──────────────────────────────────── */
function ProductCard({ product }: { product: Product }) {
  const price = parseFloat(product.price);
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
      }}
      className={cn(
        "group rounded-2xl border bg-card overflow-hidden transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30",
        !product.is_available && "opacity-60"
      )}
    >
      <div className="relative h-40 bg-muted">
        {product.image_url ? (
          <ImageWithSkeleton src={product.image_url} alt={product.name} fill className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/30">
            <UtensilsCrossed className="h-12 w-12" />
          </div>
        )}
        {!product.is_available && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white">
            غير متاح حاليا
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground leading-snug">{product.name}</h3>
          {product.is_available && (
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
            >
              <DiscountBadge percentage={30} />
            </motion.span>
          )}
        </div>
        {product.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        )}
        <div className="mt-3">
          {product.is_available ? (
            <PriceTag price={price} />
          ) : (
            <span className="text-sm text-muted-foreground">{PRICE_FMT.format(price)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Product Grid Skeleton ─────────────────────────── */
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card overflow-hidden">
          <Skeleton className="h-40 w-full" />
          <div className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-full" /><Skeleton className="h-5 w-1/3" /></div>
        </div>
      ))}
    </div>
  );
}

/* ─── Enhanced Empty State (no products + no categories) ── */
function EnhancedEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-6">
        <PackageOpen className="h-24 w-24 text-muted-foreground/15" strokeWidth={1} />
        <div className="absolute inset-0 flex items-center justify-center">
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground/25" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">لا توجد منتجات بعد</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        هذه المنشأة لم تضف أي منتجات حتى الآن. ترقّب التحديثات القادمة!
      </p>
    </div>
  );
}

/* ─── Main Content ──────────────────────────────────── */
export default function FacilityDetailContent() {
  const params = useParams<{ id: string }>();
  const facilityId = Number(params.id);
  const [activeCategory, setActiveCategory] = useState<string>("الكل");
  const [search, setSearch] = useState("");
  const prefersReduced = useReducedMotion();
  const coverRef = useRef<HTMLDivElement>(null);

  const { data: facilities, isLoading: facLoading, error: facError, refetch: facRefetch } = useFacilities();
  const { data: categories, isLoading: catLoading } = useProductCategories(facilityId);
  const { data: products, isLoading: prodLoading, error: prodError, refetch: prodRefetch } = useFacilityProducts(facilityId, {
    category: activeCategory !== "الكل" ? activeCategory : undefined,
    search: search.trim() || undefined,
  });
  const { data: allProducts } = useAllFacilityProducts(facilityId);

  const facility = useMemo(
    () => (facilities ?? []).find((f) => f.id === facilityId) ?? null,
    [facilities, facilityId]
  );

  /* ─── Parallax scroll effect (CSS variable, no re-renders) ── */
  useEffect(() => {
    if (prefersReduced) return;
    const el = coverRef.current;
    if (!el) return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const scale = 1 + Math.min(scrollY / 800, 0.12);
      el.style.setProperty("--cover-scale", String(scale));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [prefersReduced]);

  /* ─── Category product counts ──────────────────────── */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "الكل": 0 };
    if (allProducts) {
      counts["الكل"] = allProducts.length;
      for (const p of allProducts) {
        counts[p.category] = (counts[p.category] ?? 0) + 1;
      }
    }
    return counts;
  }, [allProducts]);

  /* ─── Facility loading / error ─────────────────────── */
  if (facLoading || catLoading) {
    return (
      <div>
        <Skeleton className="h-56 w-full" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
          <div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72" /></div>
          <div className="flex gap-2"><Skeleton className="h-10 w-20 rounded-full" /><Skeleton className="h-10 w-20 rounded-full" /><Skeleton className="h-10 w-20 rounded-full" /></div>
          <ProductGridSkeleton />
        </div>
      </div>
    );
  }

  if (facError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <ErrorState title="تعذّر تحميل المنشأة" message="حدث خطأ أثناء جلب بيانات المنشأة" onRetry={() => facRefetch()} />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Landmark className="h-20 w-20 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">المنشأة غير موجودة</h3>
          <p className="text-sm text-muted-foreground mb-4">لم نتمكن من العثور على هذه المنشأة</p>
          <Link href="/facilities" className="text-sm text-secondary hover:underline min-h-[44px] inline-flex items-center">العودة للمنشآت</Link>
        </div>
      </div>
    );
  }

  const googleMapsUrl = facility.latitude && facility.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}`
    : null;

  const allCategories = ["الكل", ...(categories ?? [])];
  const hasNoProductsAndNoCategories = !products?.length && !categories?.length;
  const totalProducts = products?.length ?? 0;

  const staggerVariants = prefersReduced
    ? { hidden: {}, visible: { transition: { staggerChildren: 0 } } }
    : { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

  return (
    <div>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            name: facility.name,
            description: facility.description ?? "",
            address: facility.address ?? "",
            telephone: facility.phone ?? "",
            image: facility.image_url ?? "",
            servesCuisine: TYPE_LABEL[facility.type],
          }),
        }}
      />

      {/* Hero Cover */}
      <div className="relative h-56 overflow-hidden sm:h-80">
        <div
          ref={coverRef}
          className="absolute inset-0 will-change-transform"
          style={{ transform: "scale(var(--cover-scale, 1))" }}
        >
          {facility.image_url ? (
            <ImageWithSkeleton src={facility.image_url} alt={facility.name} fill className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#0A1628]">
              <Landmark className="h-16 w-16 text-white/20" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-white sm:text-3xl">{facility.name}</h1>
                <span className="mt-2 inline-block rounded-full bg-secondary/90 px-3 py-1 text-xs font-medium text-white">
                  {TYPE_LABEL[facility.type]}
                </span>
              </div>
              <DiscountBadge percentage={30} />
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar — pill cards */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          {facility.working_hours && (
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3.5 py-2 text-sm text-muted-foreground min-h-[44px]">
              <Clock className="h-4 w-4 shrink-0 text-foreground/60" />{facility.working_hours}
            </span>
          )}
          {facility.phone && (
            <a href={`tel:${facility.phone}`} className="inline-flex items-center gap-2 rounded-full bg-muted px-3.5 py-2 text-sm text-secondary hover:bg-muted/80 min-h-[44px] transition-colors">
              <Phone className="h-4 w-4 shrink-0" />{facility.phone}
            </a>
          )}
          {facility.address && (
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3.5 py-2 text-sm text-muted-foreground min-h-[44px]">
              <MapPin className="h-4 w-4 shrink-0 text-foreground/60" />{facility.address}
            </span>
          )}
          {googleMapsUrl && (
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-muted px-3.5 py-2 text-sm text-secondary hover:bg-muted/80 min-h-[44px] transition-colors">
              <ExternalLink className="h-4 w-4 shrink-0" />افتح في الخرائط
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Category Chips - Sticky */}
        <div className="sticky top-14 z-30 -mx-4 border-b bg-background/95 backdrop-blur-md px-4 py-3 sm:-mx-6 sm:px-6">
          <div className="scroll-area-thin mb-2 flex snap-x snap-mandatory gap-2 overflow-x-auto">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 snap-start rounded-full px-4 py-1.5 text-sm font-medium transition-colors min-h-[44px] inline-flex items-center gap-2",
                  activeCategory === cat
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat}
                {categoryCounts[cat] !== undefined && (
                  <span className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold leading-none",
                    activeCategory === cat
                      ? "bg-white/20 text-secondary-foreground"
                      : "bg-foreground/10 text-muted-foreground"
                  )}>
                    {categoryCounts[cat]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full pr-10"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="mt-6">
          {prodLoading ? (
            <ProductGridSkeleton />
          ) : prodError ? (
            <ErrorState title="تعذّر تحميل المنتجات" message="حدث خطأ أثناء جلب المنتجات" onRetry={() => prodRefetch()} />
          ) : hasNoProductsAndNoCategories ? (
            <EnhancedEmptyState />
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <UtensilsCrossed className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-1">لا توجد منتجات</h3>
              <p className="text-sm text-muted-foreground max-w-sm">لا توجد منتجات متاحة في هذه الفئة حاليًا</p>
            </div>
          ) : (
            <>
              {/* Product count */}
              <p className="mb-4 text-sm text-muted-foreground">
                عدد المنتجات: {totalProducts}
              </p>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerVariants}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </motion.div>
            </>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/facilities" className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline min-h-[44px]">
            <ArrowRight className="h-4 w-4" />العودة لقائمة المنشآت
          </Link>
        </div>
      </div>
    </div>
  );
}
