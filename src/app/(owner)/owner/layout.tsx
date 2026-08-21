"use client";

import { useState } from "react";
import { Menu, Bell, Package, ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { OwnerAuthGuard } from "@/components/owner/OwnerAuthGuard";
import {
  OwnerSidebar,
  OwnerMobileSidebar,
} from "@/components/owner/OwnerSidebar";
import { useUiStore } from "@/store/ui.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const NOTIFICATIONS = [
  {
    id: "n1",
    title: "تم إضافة منتج جديد بنجاح",
    time: "منذ 10 دقائق",
    icon: Package,
    iconBg: "bg-primary/15",
  },
  {
    id: "n2",
    title: "طلب خصم جديد على منتجك",
    time: "منذ 30 دقيقة",
    icon: ShoppingBag,
    iconBg: "bg-secondary/15",
  },
  {
    id: "n3",
    title: "تم تحديث بيانات المنشأة",
    time: "منذ ساعة",
    icon: Store,
    iconBg: "bg-accent/15",
  },
] as const;

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const toggleSidebar = useUiStore((s) => s.toggleOwnerSidebar);
  const { toast } = useToast();
  const [notifOpen, setNotifOpen] = useState(false);

  function handleViewAll() {
    setNotifOpen(false);
    toast({ title: "قريبًا" });
  }

  return (
    <OwnerAuthGuard>
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
          <span className="text-sm font-semibold">وفر — بوابة المالك</span>
          <div className="flex items-center gap-1">
            <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9"
                  aria-label="الإشعارات"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 left-1.5 h-2.5 w-2.5 rounded-full bg-destructive" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                {NOTIFICATIONS.map((n) => {
                  const Icon = n.icon;
                  return (
                    <DropdownMenuItem key={n.id} className="flex items-start gap-3 min-h-[44px] cursor-pointer">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.iconBg}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-tight">{n.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleViewAll}
                  className="flex items-center justify-center min-h-[44px] cursor-pointer text-primary font-medium"
                >
                  عرض جميع الإشعارات
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1">
          <OwnerSidebar />
          <main className="flex-1 overflow-x-hidden">
            <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>

        <OwnerMobileSidebar />
      </div>
    </OwnerAuthGuard>
  );
}