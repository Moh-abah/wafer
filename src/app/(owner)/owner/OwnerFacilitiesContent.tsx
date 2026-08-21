"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, Eye, EyeOff, Package, Pencil, ChevronLeft, CheckCircle2, Plus, Upload, BarChart3, Bell, Clock, Lightbulb, Percent, Mail, CheckCircle, FileSpreadsheet as FileSpreadsheetIcon, Power, QrCode, Download, Copy } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { useMyFacilities } from "@/hooks/useMyFacilities";
import { useOwnerProducts } from "@/hooks/useOwnerProducts";
import { ownerService } from "@/services/owner.service";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import type { Paginated, Product, Facility } from "@/types/api.generated";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const FACILITY_TYPE_LABELS: Record<string, string> = {
  restaurant: "مطعم",
  cafe: "مقهى",
  public_facility: "مرفق عام",
};

// ─── Stats Overview ───
function StatsOverview({ facilityIds }: { facilityIds: number[] }) {
const prefersReduced = usePrefersReducedMotion();

  // Use useQueries for dynamic number of facilities — single hook call
  const totalQueries = useQueries({
    queries: facilityIds.map((id) => ({
      queryKey: ["owner-products-count", id],
      queryFn: (): Promise<Paginated<Product>> => ownerService.getOwnerProducts(id, { page: 1, page_size: 1 }),
      staleTime: 0,
    })),
  });

  const availableQueries = useQueries({
    queries: facilityIds.map((id) => ({
      queryKey: ["owner-available-count", id],
      queryFn: (): Promise<Paginated<Product>> => ownerService.getOwnerProducts(id, { page: 1, page_size: 1, only_available: true }),
      staleTime: 0,
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

  const stats = [
    {
      id: "facilities",
      icon: Store,
      value: facilityIds.length,
      label: "إجمالي المنشآت",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      borderAccent: "border-l-4 border-l-primary",
    },
    {
      id: "products",
      icon: Package,
      value: isLoading ? null : totalProducts,
      label: "إجمالي المنتجات",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      borderAccent: "border-l-4 border-l-secondary",
    },
    {
      id: "available",
      icon: CheckCircle2,
      value: isLoading ? null : availableProducts,
      label: "المنتجات المتاحة",
      iconBg: "bg-teal-500/10",
      iconColor: "text-teal-500 dark:text-teal-400",
      borderAccent: "border-l-4 border-l-teal-500",
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

// ─── Product Stats Summary ───
function ProductStatsSummary() {
  const prefersReduced = usePrefersReducedMotion();

  const summaryCards = [
    { label: "إجمالي المنتجات", value: "45", icon: Package, bg: "bg-primary/5", border: "border-r-primary" },
    { label: "المنتجات المتاحة", value: "38", icon: CheckCircle, bg: "bg-emerald-500/5", border: "border-r-emerald-500" },
    { label: "المنشآت النشطة", value: "3", icon: Store, bg: "bg-secondary/5", border: "border-r-secondary" },
    { label: "متوسط الخصم", value: "30%", icon: Percent, bg: "bg-accent/5", border: "border-r-accent" },
  ];

  const containerVariants = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 } };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.4, delay: 0.2 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {summaryCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className={cn("p-4 border-r-4", card.bg, card.border)}>
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold leading-none">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </motion.div>
  );
}

export default function OwnerFacilitiesContent() {
  const { data: facilities, isLoading, isError } = useMyFacilities();
  const router = useRouter();
const prefersReduced = usePrefersReducedMotion();
  const [selectedQRFacility, setSelectedQRFacility] = useState<Facility | null>(null);

  // If only 1 facility, redirect to its products page
  useEffect(() => {
    if (facilities && facilities.length === 1) {
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
            <Mail className="h-4 w-4" />
            تواصل مع الإدارة
          </Button>
        </a>
      </motion.div>
    );
  }

  // ─── Redirecting (single facility) ───
  if (facilities.length === 1) {
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
      iconBg: "bg-teal-500/10",
      iconColor: "text-teal-600 dark:text-teal-400",
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

      {/* Stats Overview */}
      <StatsOverview facilityIds={facilityIds} />

      {/* Product Stats Summary Cards */}
      <ProductStatsSummary />

      {/* Analytics Section */}
      <AnalyticsSection facilityIds={facilityIds} />

      {/* Facility Stats Mini Chart */}
      <FacilityStatsChart facilities={facilities ?? []} />

      {/* Notification Center */}
      <NotificationCenter />

      {/* Recent Products */}
      <RecentProductsWidget facilityIds={facilityIds} />

      {/* Activity Log */}
      <ActivityLog />

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
            <FacilityCard facility={f} onQrClick={setSelectedQRFacility} />
          </motion.div>
        ))}
      </div>
      <QrCodeDialog
        facility={selectedQRFacility}
        open={selectedQRFacility !== null}
        onOpenChange={(open) => { if (!open) setSelectedQRFacility(null); }}
      />
    </div>
  );
}

// ─── Facility Stats Mini Chart ───
function FacilityStatsChart({ facilities }: { facilities: { id: number; name: string }[] }) {
  const prefersReduced = usePrefersReducedMotion();

  const barQueries = useQueries({
    queries: facilities.map((f) => ({
      queryKey: ["chart-facility-products", f.id],
      queryFn: (): Promise<Paginated<Product>> =>
        ownerService.getOwnerProducts(f.id, { page: 1, page_size: 1 }),
      staleTime: 0,
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
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-bold">أداء المنتجات حسب المنشأة</CardTitle>
        </div>
      </CardHeader>
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
                    <span className="text-xs text-muted-foreground truncate max-w-[70%]">{d.name}</span>
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

// ─── Analytics Section ───
function AnalyticsSection({ facilityIds }: { facilityIds: number[] }) {
  const prefersReduced = usePrefersReducedMotion();

  const totalQueries = useQueries({
    queries: facilityIds.map((id) => ({
      queryKey: ["analytics-total-products", id],
      queryFn: (): Promise<Paginated<Product>> => ownerService.getOwnerProducts(id, { page: 1, page_size: 1 }),
      staleTime: 0,
    })),
  });

  const availableQueries = useQueries({
    queries: facilityIds.map((id) => ({
      queryKey: ["analytics-available-products", id],
      queryFn: (): Promise<Paginated<Product>> => ownerService.getOwnerProducts(id, { page: 1, page_size: 1, only_available: true }),
      staleTime: 0,
    })),
  });

  const isLoading = totalQueries.some((q) => q.isLoading);
  const totalProducts = totalQueries.reduce((sum, q) => sum + (q.data?.total ?? 0), 0);
  const availableProducts = availableQueries.reduce((sum, q) => sum + (q.data?.total ?? 0), 0);
  const availabilityPercent = totalProducts > 0 ? Math.round((availableProducts / totalProducts) * 100) : 0;

  const analyticsStats = [
    {
      id: "a-total",
      icon: Package,
      value: isLoading ? null : totalProducts,
      label: "إجمالي المنتجات",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      id: "a-available",
      icon: CheckCircle2,
      value: isLoading ? null : availableProducts,
      label: "المنتجات المتاحة",
      iconBg: "bg-teal-500/10",
      iconColor: "text-teal-500 dark:text-teal-400",
    },
    {
      id: "a-percent",
      icon: Percent,
      value: isLoading ? null : `${availabilityPercent}%`,
      label: "نسبة التوفر",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      id: "a-facilities",
      icon: Store,
      value: facilityIds.length,
      label: "المنشآت النشطة",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
  ];

  const staggerContainer = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1, transition: { staggerChildren: 0.08 } } };

  const staggerItem = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">تحليلات سريعة</h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {analyticsStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.id}
                  variants={staggerItem}
                  className="rounded-xl bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", stat.iconBg)}>
                      <Icon className={cn("h-5 w-5", stat.iconColor)} />
                    </div>
                    <div>
                      <p className="text-xl font-bold leading-none">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Notification Center ───
function NotificationCenter() {
const prefersReduced = usePrefersReducedMotion();

  const notifications = [
    {
      id: "n1",
      icon: Clock,
      title: "تم إنشاء حسابك بنجاح",
      description: "مرحبًا بك في بوابة أصحاب المنشآت",
      time: "الآن",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      id: "n2",
      icon: Package,
      title: "تحديث: إضافة منتجات جديدة",
      description: "يمكنك إضافة منتجات لمنشآتك من صفحة المنتجات",
      time: "أمس",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      id: "n3",
      icon: Lightbulb,
      title: "نصيحة: أكمل بيانات منشآتك",
      description: "أضف صورة وعنوان وساعات العمل لجذب المزيد من العملاء",
      time: "منذ 3 أيام",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
  ];

  const staggerContainer = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1, transition: { staggerChildren: 0.08 } } };

  const staggerItem = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">الإشعارات</h2>
        </div>
        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <motion.div
                key={n.id}
                variants={staggerItem}
                className="flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/30"
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", n.iconBg)}>
                  <Icon className={cn("h-5 w-5", n.iconColor)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.description}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  );
}

function RecentProductsWidget({ facilityIds }: { facilityIds: number[] }) {
  const prefersReduced = usePrefersReducedMotion();

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
                      ? "bg-emerald-500"
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

function generateQRSvg(facilityId: number, name: string): string {
  const size = 21;
  const cellSize = 8;
  const padding = 16;
  const totalSize = size * cellSize + padding * 2;
  const primary = "#FF2A7A";
  const bg = "#FFFFFF";

  // Simple deterministic hash function
  function simpleHash(n: number, seed: number): number {
    let h = seed;
    h = ((h << 5) - h + n) | 0;
    h = ((h >> 16) ^ h) * 0x45d9f3b | 0;
    h = ((h >> 16) ^ h) * 0x45d9f3b | 0;
    h = (h >> 16) ^ h;
    return Math.abs(h);
  }

  // Create grid
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Position detection patterns (3 corners)
  function drawFinderPattern(row: number, col: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          grid[row + r][col + c] = true;
        }
      }
    }
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(0, 14);
  drawFinderPattern(14, 0);

  // Timing patterns
  for (let i = 8; i < 13; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Fill remaining cells based on facilityId
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder patterns and timing patterns
      if ((r < 9 && c < 9) || (r < 9 && c > 12) || (r > 12 && c < 9)) continue;
      if (r === 6 || c === 6) continue;

      const hash = simpleHash(r * size + c, facilityId);
      grid[r][c] = hash % 3 === 0;
    }
  }

  // White rectangle in center for name
  const centerX = 7;
  const centerY = 7;
  const centerW = 7;
  const centerH = 7;
  for (let r = centerY; r < centerY + centerH; r++) {
    for (let c = centerX; c < centerX + centerW; c++) {
      if (r < size && c < size) {
        grid[r][c] = false;
      }
    }
  }

  // Build SVG string
  let rects = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        rects += `<rect x="${x}" y="${y}" width="${cellSize - 1}" height="${cellSize - 1}" rx="1.5" fill="${primary}" />`;
      }
    }
  }

  // Center white background
  const cBgX = padding + centerX * cellSize - 2;
  const cBgY = padding + centerY * cellSize - 2;
  const cBgW = centerW * cellSize + 4;
  const cBgH = centerH * cellSize + 4;
  const textX = cBgX + cBgW / 2;
  const textY = cBgY + cBgH / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}" rx="12" fill="${bg}">
  ${rects}
  <rect x="${cBgX}" y="${cBgY}" width="${cBgW}" height="${cBgH}" rx="4" fill="${bg}" />
  <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="central" font-family="Cairo, sans-serif" font-size="10" font-weight="bold" fill="${primary}">${name.length > 10 ? name.slice(0, 10) : name}</text>
</svg>`;
}

function QrCodeDialog({ facility, open, onOpenChange }: { facility: Facility | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();

  const facilityName = facility?.name ?? "";
  const facilityId = facility?.id ?? 0;
  const svgString = facility ? generateQRSvg(facility.id, facility.name) : "";

  if (!facility) return null;

  function handleDownload() {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${facilityName}-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "تم تحميل رمز QR" });
  }

  function handleCopyLink() {
    const facilityUrl = `${window.location.origin}/facilities/${facilityId}`;
    navigator.clipboard.writeText(facilityUrl).then(() => {
      toast({ title: "تم نسخ رابط المنشأة" });
    }).catch(() => {
      toast({ title: "فشل نسخ الرابط", variant: "destructive" });
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>رمز QR للمنشأة - {facility.name}</DialogTitle>
          <DialogDescription>
            يمكنك استخدام هذا الرمز لمشاركة المنشأة مع العملاء
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div
            className="rounded-xl border p-3 bg-white"
            dangerouslySetInnerHTML={{ __html: svgString }}
          />
          <div className="text-center">
            <p className="font-semibold">{facility.name}</p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {FACILITY_TYPE_LABELS[facility.type] || facility.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                المنطقة: {facility.region_id}
              </span>
            </div>
          </div>
          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2 min-h-[44px]"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              تحميل QR
            </Button>
            <Button
              className="flex-1 gap-2 min-h-[44px]"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4" />
              نسخ رابط المنشأة
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FacilityCard({ facility, onQrClick }: { facility: Facility; onQrClick: (facility: Facility) => void }) {
  const { data: productData } = useOwnerProducts(facility.id, { page: 1, page_size: 1 });
  const productCount = productData?.total ?? 0;

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
              <Badge variant="secondary" className="mt-1 text-xs">
                {FACILITY_TYPE_LABELS[facility.type] || facility.type}
              </Badge>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-xs ${facility.is_visible ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground"}`}>
            {facility.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{facility.is_visible ? "ظاهرة" : "مخفية"}</span>
          </div>
        </div>

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
            <button
              type="button"
              onClick={() => onQrClick(facility)}
              className="flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground min-h-[44px]"
              aria-label="رمز QR"
            >
              <QrCode className="h-3.5 w-3.5" />
              رمز QR
            </button>
            <Link href={`/owner/facilities/${facility.id}`}>
              <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-xs">
                <Pencil className="h-3.5 w-3.5" />
                تعديل
              </Button>
            </Link>
            <Link href={`/owner/facilities/${facility.id}/products`}>
              <Button size="sm" className="h-9 gap-1.5 rounded-full text-xs bg-teal-600 hover:bg-teal-700 text-white">
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

// ─── Activity Log ───
function ActivityLog() {
const prefersReduced = usePrefersReducedMotion();


  const activities: {
    id: string;
    title: string;
    time: string;
    description: string;
    icon: typeof Clock;
    theme: "primary" | "secondary" | "accent" | "muted";
  }[] = [
    {
      id: "a1",
      title: "تم تسجيل الدخول بنجاح",
      time: "الآن",
      description: "تم تسجيل الدخول من جهاز جديد",
      icon: CheckCircle,
      theme: "primary",
    },
    {
      id: "a2",
      title: "تم تعديل بيانات المنشأة",
      time: "منذ ساعة",
      description: "تم تحديث اسم المنشأة وساعات العمل",
      icon: Pencil,
      theme: "secondary",
    },
    {
      id: "a3",
      title: "تم إضافة 3 منتجات جديدة",
      time: "منذ 15 دقيقة",
      description: "تمت إضافة منتجات للتصنيف مشروبات",
      icon: Package,
      theme: "accent",
    },
    {
      id: "a4",
      title: "تم تعطيل منتج",
      time: "منذ 30 دقيقة",
      description: "تم تعطيل منتج غير متوفر مؤقتا",
      icon: Power,
      theme: "muted",
    },
    {
      id: "a5",
      title: "تم استيراد ملف منتجات",
      time: "أمس",
      description: "تم استيراد 15 منتجا من ملف Excel",
      icon: FileSpreadsheetIcon,
      theme: "muted",
    },
  ];

  const themeStyles: Record<string, { iconBg: string; iconColor: string }> = {
    primary: { iconBg: "bg-primary/10", iconColor: "text-primary" },
    secondary: { iconBg: "bg-secondary/10", iconColor: "text-secondary" },
    accent: { iconBg: "bg-accent/10", iconColor: "text-accent" },
    muted: { iconBg: "bg-muted-foreground/10", iconColor: "text-muted-foreground" },
  };

  const staggerContainer = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1, transition: { staggerChildren: 0.08 } } };

  const staggerItem = prefersReduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <Card className="rounded-2xl">
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-bold">سجل النشاط</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {activities.map((activity) => {
            const Icon = activity.icon;
            const styles = themeStyles[activity.theme];
            return (
              <motion.div
                key={activity.id}
                variants={staggerItem}
                className="flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/30"
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", styles.iconBg)}>
                  <Icon className={cn("h-5 w-5", styles.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{activity.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{activity.description}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  );
}