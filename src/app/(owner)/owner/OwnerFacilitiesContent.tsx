"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, Eye, EyeOff, Package, Pencil, ChevronLeft, CheckCircle2, Plus, Upload, BarChart3, Percent, Hourglass, AlertTriangle } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { useMyFacilities } from "@/hooks/useMyFacilities";
import { useOwnerProducts } from "@/hooks/useOwnerProducts";
import { ownerService } from "@/services/owner.service";
import { formatCurrency } from "@/lib/format";
import type { Paginated, Product, Facility } from "@/types/api.generated";

const FACILITY_TYPE_LABELS: Record<string, string> = {
  restaurant: "مطعم",
  cafe: "مقهى",
  public_facility: "مرفق عام",
};

/**
 * بطاقات الإحصاءات الموحّدة — بيانات حقيقية من الـ API فقط.
 * تجمع بين StatsOverview + AnalyticsSection السابقتين (كانتا متماثلتين).
 * يحلّ مشكلة N+1: طلب واحد لكل منشأة بـ queryKey موحّد.
 */
function StatsOverview({ facilityIds }: { facilityIds: number[] }) {
  const prefersReduced = useReducedMotion();

  // طلب واحد موحّد لكل منشأة — يحلّ N+1
  const totalQueries = useQueries({
    queries: facilityIds.map((id) => ({
      queryKey: ["owner-products-stats", id],
      queryFn: (): Promise<Paginated<Product>> =>
        ownerService.getOwnerProducts(id, { page: 1, page_size: 1 }),
      staleTime: 30_000,
    })),
  });

  const availableQueries = useQueries({
    queries: facilityIds.map((id) => ({
      queryKey: ["owner-available-stats", id],
      queryFn: (): Promise<Paginated<Product>> =>
        ownerService.getOwnerProducts(id, { page: 1, page_size: 1, only_available: true }),
      staleTime: 30_000,
    })),
  });

  const isLoading = totalQueries.some((q) => q.isLoading);

  const totalProducts = totalQueries.reduce(
    (sum, q) => sum + (q.data?.total ?? 0),
    0
  );
  const availableProducts = availableQueries.reduce(
    (sum, q) => sum + (q.data?.total ?? 0),
    0
  );
  const availabilityPercent = totalProducts > 0
    ? Math.round((availableProducts / totalProducts) * 100)
    : 0;

  const stats = [
    {
      id: "facilities",
      icon: Store,
      value: facilityIds.length,
      label: "المنشآت",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      borderAccent: "border-l-4 border-l-primary",
    },
    {
      id: "products",
      icon: Package,
      value: isLoading ? null : totalProducts,
      label: "المنتجات",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      borderAccent: "border-l-4 border-l-secondary",
    },
    {
      id: "available",
      icon: CheckCircle2,
      value: isLoading ? null : availableProducts,
      label: "متاح",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      borderAccent: "border-l-4 border-l-secondary",
    },
  ];

  const containerVariants = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
    };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <Card className={cn("rounded-2xl", stat.borderAccent)}>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                    stat.iconBg
                  )}
                >
                  <Icon className={cn("h-6 w-6", stat.iconColor)} />
                </div>
                <div>
                  {stat.value === null ? (
                    <Skeleton className="mb-1 h-8 w-12 rounded" />
                  ) : (
                    <p className="text-2xl font-bold leading-none">{stat.value}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Facility Stats Mini Chart ───
function FacilityStatsChart({ facilities }: { facilities: { id: number; name: string }[] }) {
  const prefersReduced = useReducedMotion();

  // يعيد استخدام نفس queryKey الموحّد
  const barQueries = useQueries({
    queries: facilities.map((f) => ({
      queryKey: ["owner-products-stats", f.id],
      queryFn: (): Promise<Paginated<Product>> =>
        ownerService.getOwnerProducts(f.id, { page: 1, page_size: 1 }),
      staleTime: 30_000,
    })),
  });

  const isLoading = barQueries.some((q) => q.isLoading);

  const facilityData = facilities.map((f, idx) => ({
    name: f.name,
    count: barQueries[idx].data?.total ?? 0,
  }));

  const maxCount = Math.max(...facilityData.map((d) => d.count), 1);

  return (
    <Card className="rounded-2xl">
      <CardTitle className="p-5 pb-0 text-lg font-bold">أداء المنتجات حسب المنشأة</CardTitle>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-4">
            {facilities.map((f) => (
              <div key={f.id} className="space-y-1.5">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-6 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {facilityData.map((d) => {
              const percent = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
              return (
                <div key={d.name}>
                  <motion.div
                    className="h-6 rounded-full bg-primary/60"
                    initial={prefersReduced ? { width: `${percent}%` } : { width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    <span className="truncate max-w-[70%] text-xs text-muted-foreground">{d.name}</span>
                    <span className="text-xs font-semibold">{d.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Recent Products Widget (real data from API) ───
function RecentProductsWidget({ facilityIds }: { facilityIds: number[] }) {
  const prefersReduced = useReducedMotion();

  const recentQueries = useQueries({
    queries: facilityIds.map((id) => ({
      queryKey: ["recent-products", id],
      queryFn: (): Promise<Paginated<Product>> =>
        ownerService.getOwnerProducts(id, { page: 1, page_size: 5 }),
      staleTime: 30_000,
    })),
  });

  const isLoading = recentQueries.some((q) => q.isLoading);

  const allProducts = recentQueries
    .flatMap((q) => q.data?.items ?? [])
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  const staggerContainer = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { staggerChildren: 0.06 } },
    };

  const staggerItem = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } };

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">أحدث المنتجات</h2>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <div className="flex-1" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
              </div>
            ))}
          </div>
        ) : allProducts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            لا توجد منتجات بعد
          </p>
        ) : (
          <motion.div
            className="divide-y"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {allProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={staggerItem}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {product.category}
                </Badge>
                <span
                  className={cn(
                    "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
                    product.is_available
                      ? "bg-success"
                      : "bg-muted-foreground/40"
                  )}
                />
                <span className="shrink-0 font-mono text-sm">
                  {formatCurrency(product.price)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───
export default function OwnerFacilitiesContent() {
  const { data: facilities, isLoading, isError } = useMyFacilities();
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  // If only 1 facility, redirect to its products page
  // (المعلّقة/المرفوضة لا يُعاد توجيهها — تُعرض في القائمة بحالتها)
  useEffect(() => {
    if (
      facilities &&
      facilities.length === 1 &&
      facilities[0].is_approved !== false
    ) {
      router.replace(`/owner/facilities/${facilities[0].id}/products`);
    }
  }, [facilities, router]);

  const facilityIds = useMemo(
    () => (facilities ?? []).map((f) => f.id),
    [facilities]
  );

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-lg font-medium text-destructive">
          حدث خطأ أثناء تحميل المنشآت
        </p>
        <Button variant="outline" className="rounded-full" onClick={() => window.location.reload()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  // ─── Empty ───
  if (!facilities || facilities.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-6 py-20 text-center"
        variants={prefersReduced
          ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
          : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
        }
        initial="initial"
        animate="animate"
        transition={{ duration: 0.4 }}
      >
        <div className="relative flex items-center justify-center">
          <div className="h-36 w-36 rounded-full bg-primary/10" />
          <Store className="absolute h-24 w-24 text-primary" />
        </div>
        <div>
          <p className="text-lg font-semibold">لا توجد منشآت مسجلة</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            لم يتم ربط أي منشأة بحسابك بعد. تواصل مع فريق الإدارة لتفعيل منشآتك.
          </p>
        </div>
        <a href="mailto:info@wafir.gleeze.com">
          <Button
            className="gap-2 rounded-full min-h-[44px]"
            variant="outline"
          >
            تواصل مع الإدارة
          </Button>
        </a>
      </motion.div>
    );
  }

  // ─── Redirecting (single approved facility) ───
  if (
    facilities.length === 1 &&
    facilities[0].is_approved !== false
  ) {
    return (
      <div className="flex items-center justify-center py-20">
        <Skeleton className="h-6 w-48" />
      </div>
    );
  }

  const listVariants = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
    };

  const firstFacilityId = facilities[0].id;

  const quickActions = [
    {
      label: "إضافة منتج جديد",
      description: "أضف منتجا واحدا يدويا",
      href: `/owner/facilities/${firstFacilityId}/products`,
      icon: Plus,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      label: "استيراد منتجات",
      description: "استوردها من ملف Excel",
      href: `/owner/facilities/${firstFacilityId}/products/import`,
      icon: Upload,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
  ];

  const staggerContainer = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

  const staggerItem = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  // ─── Facilities list ───
  return (
    <div className="space-y-6">
      <motion.h1
        className="text-2xl font-bold"
        variants={listVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3 }}
      >
        منشآتي
      </motion.h1>

      {/* Quick Actions */}
      {facilities.length > 0 && (
        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <p className="text-sm font-semibold">إجراءات سريعة</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.div key={action.label} variants={staggerItem}>
                  <Link href={action.href}>
                    <Card className="group cursor-pointer rounded-2xl transition-all hover:shadow-md hover:border-primary/30">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors group-hover:bg-primary/15", action.iconBg)}>
                          <Icon className={cn("h-5 w-5", action.iconColor)} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                        <ChevronLeft className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-x-1" />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Stats Overview — 3 cards: منشآت / منتجات / متاح */}
      <StatsOverview facilityIds={facilityIds} />

      {/* Facility Stats Mini Chart */}
      <FacilityStatsChart facilities={facilities ?? []} />

      {/* Recent Products */}
      <RecentProductsWidget facilityIds={facilityIds} />

      {/* Facility Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((f, idx) => (
          <motion.div
            key={f.id}
            variants={listVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.3, delay: 0.3 + idx * 0.08 }}
          >
            <FacilityCard facility={f} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FacilityCard({ facility }: { facility: Facility }) {
  // يعيد استخدام queryKey الموحّد بدلاً من إنشاء طلب جديد
  const { data: productData } = useOwnerProducts(facility.id, { page: 1, page_size: 1 });
  const productCount = productData?.total ?? 0;

  /* منشأة معلّقة = بانتظار موافقة المشرف (is_approved === false صراحةً) */
  const isPending = facility.is_approved === false;

  return (
    <Card className="rounded-2xl transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight">{facility.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="text-xs">
                  {FACILITY_TYPE_LABELS[facility.type] || facility.type}
                </Badge>
                {isPending && (
                  <Badge className="gap-1 bg-accent text-accent-foreground hover:bg-accent">
                    <Hourglass className="h-3 w-3" aria-hidden="true" />
                    بانتظار الموافقة
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs",
            facility.is_visible
              ? "text-secondary"
              : "text-muted-foreground"
          )}>
            {facility.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{facility.is_visible ? "ظاهرة" : "مخفية"}</span>
          </div>
        </div>

        {/* سبب الرفض — بطاقة تنبيه حمراء عند توفره */}
        {facility.rejection_reason && (
          <div
            className="flex items-start gap-3 rounded-xl bg-destructive/10 p-4"
            role="alert"
          >
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-destructive">
              رُفض طلبك: {facility.rejection_reason} — عدّل بياناتك وتواصل مع
              الإدارة
            </p>
          </div>
        )}

        {facility.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {facility.description}
          </p>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{productCount} منتج</span>
          </div>
          <div className="flex gap-2">
            <Link href={`/owner/facilities/${facility.id}`}>
              <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-xs">
                <Pencil className="h-3.5 w-3.5" />
                تعديل
              </Button>
            </Link>
            <Link href={`/owner/facilities/${facility.id}/products`}>
              <Button size="sm" className="h-9 gap-1.5 rounded-full text-xs bg-secondary text-secondary-foreground hover:bg-secondary/90">
                المنتجات
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}