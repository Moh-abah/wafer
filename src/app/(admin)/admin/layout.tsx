"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Store,
  UserPlus,
  AlertTriangle,
  MapPin,
  Keyboard,
  ShieldCheck,
  CreditCard,
  Package,
  FileEdit,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import {
  AdminSidebar,
  AdminMobileSidebar,
} from "@/components/layout/AdminSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUiStore } from "@/store/ui.store";
import { useAdminAuditLogs } from "@/hooks/useAdminAuditLogs";
import { useProactiveTokenRefresh } from "@/hooks/useProactiveTokenRefresh";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/types/api.generated";

/* ─── Audit-log → notification mapping ───────────── */
interface NotificationItem {
  id: string;
  text: string;
  time: string;
  icon: LucideIcon;
  bgClass: string;
  iconColorClass: string;
}

const ACTION_META: Record<
  string,
  { icon: LucideIcon; bgClass: string; iconColorClass: string; label: (d: Record<string, unknown>) => string }
> = {
  OWNER_LOGIN: { icon: Store, bgClass: "bg-secondary/15", iconColorClass: "text-secondary", label: () => "تسجيل دخول مالك منشأة" },
  ADMIN_LOGIN: { icon: ShieldCheck, bgClass: "bg-primary/15", iconColorClass: "text-primary", label: () => "تسجيل دخول مشرف" },
  ADMIN_PASSWORD_CHANGED: { icon: ShieldCheck, bgClass: "bg-accent/15", iconColorClass: "text-accent", label: () => "تغيير كلمة مرور المشرف" },
  ADMIN_PROFILE_UPDATED: { icon: ShieldCheck, bgClass: "bg-muted", iconColorClass: "text-muted-foreground", label: () => "تحديث ملف المشرف" },
  OWNER_REGISTERED: { icon: UserPlus, bgClass: "bg-secondary/15", iconColorClass: "text-secondary", label: (d) => `تسجيل مالك جديد: ${String(d.email ?? "—")}` },
  OWNER_FACILITY_UPDATED: { icon: FileEdit, bgClass: "bg-primary/15", iconColorClass: "text-primary", label: () => "تحديث بيانات منشأة" },
  PRODUCT_CREATED: { icon: Package, bgClass: "bg-success/15", iconColorClass: "text-success", label: (d) => `إضافة منتج: ${String(d.name ?? "—")}` },
  PRODUCT_UPDATED: { icon: FileEdit, bgClass: "bg-muted", iconColorClass: "text-muted-foreground", label: () => "تعديل منتج" },
  PRODUCT_DELETED: { icon: AlertTriangle, bgClass: "bg-destructive/15", iconColorClass: "text-destructive", label: () => "حذف منتج" },
  PRODUCT_AVAILABILITY_TOGGLED: { icon: Package, bgClass: "bg-accent/15", iconColorClass: "text-accent", label: () => "تغيير توفر منتج" },
  PRODUCT_IMPORT: { icon: Package, bgClass: "bg-success/15", iconColorClass: "text-success", label: () => "استيراد منتجات (Excel)" },
  FACILITY_CREATED: { icon: Store, bgClass: "bg-primary/15", iconColorClass: "text-primary", label: () => "إضافة منشأة جديدة" },
  FACILITY_UPDATED: { icon: FileEdit, bgClass: "bg-muted", iconColorClass: "text-muted-foreground", label: () => "تحديث منشأة" },
  FACILITY_DELETED: { icon: AlertTriangle, bgClass: "bg-destructive/15", iconColorClass: "text-destructive", label: () => "حذف منشأة" },
  CARD_CREATED: { icon: CreditCard, bgClass: "bg-primary/15", iconColorClass: "text-primary", label: () => "إضافة بطاقة" },
  CARD_UPDATED: { icon: CreditCard, bgClass: "bg-muted", iconColorClass: "text-muted-foreground", label: () => "تحديث بطاقة" },
  CARD_DELETED: { icon: AlertTriangle, bgClass: "bg-destructive/15", iconColorClass: "text-destructive", label: () => "حذف بطاقة" },
  REGION_UPDATED: { icon: MapPin, bgClass: "bg-success/15", iconColorClass: "text-success", label: () => "تحديث بيانات المنطقة" },
  DASHBOARD_VIEW: { icon: ShieldCheck, bgClass: "bg-muted", iconColorClass: "text-muted-foreground", label: () => "عرض لوحة التحكم" },
};

const DEFAULT_META = {
  icon: Bell,
  bgClass: "bg-muted",
  iconColorClass: "text-muted-foreground",
  label: (action: string) => `نشاط: ${action}`,
};

function timeAgoAr(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d < 7) return `منذ ${d} يوم`;
  return new Date(iso).toLocaleDateString("ar-SA");
}

function toNotification(log: AuditLog): NotificationItem {
  const meta = ACTION_META[log.action_type] ?? {
    icon: DEFAULT_META.icon,
    bgClass: DEFAULT_META.bgClass,
    iconColorClass: DEFAULT_META.iconColorClass,
    label: () => DEFAULT_META.label(log.action_type),
  };
  return {
    id: String(log.id),
    text: meta.label(log.details ?? {}),
    time: timeAgoAr(log.created_at),
    icon: meta.icon,
    bgClass: meta.bgClass,
    iconColorClass: meta.iconColorClass,
  };
}

/* ─── Keyboard shortcut items ───────────────────── */
interface ShortcutItem {
  keys: string[];
  description: string;
  href: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ["Ctrl", "K"], description: "فتح اختصارات لوحة المفاتيح", href: "" },
  { keys: ["Ctrl", "1"], description: "لوحة التحكم", href: "/admin" },
  { keys: ["Ctrl", "2"], description: "المناطق", href: "/admin/regions" },
  { keys: ["Ctrl", "3"], description: "البطاقات", href: "/admin/cards" },
  { keys: ["Ctrl", "4"], description: "المنشآت", href: "/admin/facilities" },
  { keys: ["Ctrl", "5"], description: "العملاء", href: "/admin/users" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const toggleSidebar = useUiStore((s) => s.toggleAdminSidebar);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Proactively refresh the admin access token ~60s before it expires.
  useProactiveTokenRefresh();

  // Real recent activity from audit logs (top 5) — replaces hardcoded mock.
  const { data: auditData } = useAdminAuditLogs(1, 5);
  const notifications = useMemo<NotificationItem[]>(
    () => (auditData?.items ?? []).map(toNotification),
    [auditData]
  );
  const notifCount = notifications.length;

  /* ─── Keyboard shortcut handler ────────────────── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      const key = e.key;

      if (key === "k") {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
        return;
      }

      if (key === "1") {
        e.preventDefault();
        router.push("/admin");
        setShortcutsOpen(false);
        return;
      }
      if (key === "2") {
        e.preventDefault();
        router.push("/admin/regions");
        setShortcutsOpen(false);
        return;
      }
      if (key === "3") {
        e.preventDefault();
        router.push("/admin/cards");
        setShortcutsOpen(false);
        return;
      }
      if (key === "4") {
        e.preventDefault();
        router.push("/admin/facilities");
        setShortcutsOpen(false);
        return;
      }
      if (key === "5") {
        e.preventDefault();
        router.push("/admin/users");
        setShortcutsOpen(false);
        return;
      }
    },
    [router],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleViewAllNotifications() {
    router.push("/admin/audit-logs");
  }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="فتح القائمة"
            onClick={toggleSidebar}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold">وفر — لوحة التحكم</span>
          <div className="flex items-center gap-1">
            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="الإشعارات"
                  className="relative h-9 w-9"
                >
                  <Bell className="h-5 w-5" />
                  {notifCount > 0 && (
                    <span className="animate-pulse-glow absolute -top-0.5 -left-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                      {notifCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="text-sm font-semibold">
                  النشاط الأخير
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    لا يوجد نشاط حديث
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <DropdownMenuItem
                        key={notif.id}
                        className="flex items-center gap-3 min-h-[44px] cursor-default hover:bg-muted/50"
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                            notif.bgClass,
                            notif.iconColorClass,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="text-sm truncate">{notif.text}</span>
                          <span className="text-xs text-muted-foreground">{notif.time}</span>
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center justify-center min-h-[44px] text-sm text-primary cursor-pointer hover:bg-muted/50"
                  onClick={handleViewAllNotifications}
                >
                  عرض سجل النشاط الكامل
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </header>

        {/* Desktop notification bell (in sidebar area) */}
        <div className="hidden lg:flex absolute top-2 left-72 z-30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="الإشعارات"
                className="relative h-9 w-9"
              >
                <Bell className="h-5 w-5" />
                {notifCount > 0 && (
                  <span className="animate-pulse-glow absolute -top-0.5 -left-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {notifCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="text-sm font-semibold">
                النشاط الأخير
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                  لا يوجد نشاط حديث
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <DropdownMenuItem
                      key={notif.id}
                      className="flex items-center gap-3 min-h-[44px] cursor-default hover:bg-muted/50"
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          notif.bgClass,
                          notif.iconColorClass,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-sm truncate">{notif.text}</span>
                        <span className="text-xs text-muted-foreground">{notif.time}</span>
                      </div>
                    </DropdownMenuItem>
                  );
                })
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center justify-center min-h-[44px] text-sm text-primary cursor-pointer hover:bg-muted/50"
                onClick={handleViewAllNotifications}
              >
                عرض سجل النشاط الكامل
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 overflow-x-hidden">
            <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>

        <AdminMobileSidebar />

          {/* Keyboard Shortcuts Dialog */}
        <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-primary" />
                اختصارات لوحة المفاتيح
              </DialogTitle>
              <DialogDescription>
                استخدم هذه الاختصارات للتنقل السريع بين أقسام لوحة التحكم.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1 pt-2">
              {SHORTCUTS.map((sc) => (
                <div
                  key={sc.description}
                  className="flex items-center justify-between min-h-[44px] rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  <span className="text-sm">{sc.description}</span>
                  <div className="flex items-center gap-1">
                    {sc.keys.map((k, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <kbd className="rounded border bg-muted px-2 py-1 text-xs font-mono shadow-sm">
                          {k}
                        </kbd>
                        {i < sc.keys.length - 1 && (
                          <span className="text-muted-foreground text-xs">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminAuthGuard>
  );
}
