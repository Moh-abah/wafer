"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Map,
  CreditCard,
  Eye,
  Store,
  Users,
  UserCog,
  Package,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/services/api-client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types/api.generated";

/* ─── Time-based greeting ──────────────────────────── */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "صباح الخير";
  return "مساء الخير";
}

/* ─── Stat config with color themes ────────────────── */
interface StatConfig {
  key: keyof DashboardStats;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

const STAT_CONFIGS: StatConfig[] = [
  { key: "regions", label: "المناطق", icon: Map, color: "text-blue-500", bg: "bg-blue-500/15", border: "border-l-blue-500" },
  { key: "cards", label: "البطاقات", icon: CreditCard, color: "text-violet-500", bg: "bg-violet-500/15", border: "border-l-violet-500" },
  { key: "published_cards", label: "البطاقات المنشورة", icon: Eye, color: "text-emerald-500", bg: "bg-emerald-500/15", border: "border-l-emerald-500" },
  { key: "facilities", label: "المنشآت", icon: Store, color: "text-orange-500", bg: "bg-orange-500/15", border: "border-l-orange-500" },
  { key: "customers", label: "العملاء", icon: Users, color: "text-sky-500", bg: "bg-sky-500/15", border: "border-l-sky-500" },
  { key: "owners", label: "المالكون", icon: UserCog, color: "text-amber-500", bg: "bg-amber-500/15", border: "border-l-amber-500" },
  { key: "products", label: "المنتجات", icon: Package, color: "text-pink-500", bg: "bg-pink-500/15", border: "border-l-pink-500" },
  { key: "available_products", label: "المنتجات المتاحة", icon: PackageCheck, color: "text-teal-500", bg: "bg-teal-500/15", border: "border-l-teal-500" },
];

interface StatCardProps {
  config: StatConfig;
  isLoading: boolean;
  value: number | undefined;
}

function StatCard({ config, isLoading, value }: StatCardProps) {
  const Icon = config.icon;
  return (
    <Card className={cn("border-l-4", config.border)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {config.label}
          </CardTitle>
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", config.bg, config.color)}>
            <Icon className="h-4.5 w-4.5" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <span className="text-3xl font-bold">
            {value === undefined ? "—" : value}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const prefersReduced = useReducedMotion();
  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => apiClient.get<DashboardStats>("/admin/dashboard"),
    staleTime: 0,
  });

  const greeting = useMemo(() => getGreeting(), []);

  const stats = dashData ?? {
    regions: 0,
    cards: 0,
    published_cards: 0,
    facilities: 0,
    customers: 0,
    owners: 0,
    products: 0,
    available_products: 0,
  };

  const staggerVariants = prefersReduced
    ? { hidden: {}, visible: { transition: { staggerChildren: 0 } } }
    : { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

  const itemVariants = prefersReduced
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } } };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مرحبًا بك في لوحة تحكم وفر — إحصائيات مختصرة عن المنصة.
        </p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerVariants}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {STAT_CONFIGS.map((config) => (
          <motion.div key={config.key} variants={itemVariants}>
            <StatCard
              config={config}
              isLoading={dashLoading}
              value={stats[config.key]}
            />
          </motion.div>
        ))}
      </motion.div>

      <Card className="bg-primary/5 border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">ملاحظة</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          استخدم القائمة الجانبية للتنقل بين أقسام الإدارة. يمكنك إدارة المناطق
          والبطاقات والمنشآت والعملاء ومراجعة سجل العمليات.
        </CardContent>
      </Card>
    </div>
  );
}
