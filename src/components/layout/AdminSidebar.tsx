"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  CreditCard,
  Store,
  Users,
  ScrollText,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useUiStore } from "@/store/ui.store";
import { useAdminLogout } from "@/hooks/useAdminAuth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/regions", label: "المناطق", icon: Map },
  { href: "/admin/cards", label: "البطاقات", icon: CreditCard },
  { href: "/admin/facilities", label: "المنشآت", icon: Store },
  { href: "/admin/users", label: "العملاء", icon: Users },
  { href: "/admin/audit-logs", label: "سجل العمليات", icon: ScrollText },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ onNavigate, collapsed }: { onNavigate?: () => void, collapsed: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
              active && "bg-accent font-medium text-primary",
              collapsed && "justify-center px-2" // توسيط الأيقونة عند التصغير
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const logout = useAdminLogout();
  return (
    <div className={cn(
      "mt-auto flex items-center border-t p-3",
      collapsed ? "flex-col gap-2" : "justify-between"
    )}>
      <Button
        variant="ghost"
        className={cn(
          "gap-2 text-muted-foreground hover:text-destructive",
          collapsed && "px-2"
        )}
        onClick={logout}
      >
        <LogOut className="h-4 w-4" />
        {!collapsed && <span>تسجيل الخروج</span>}
      </Button>
      {!collapsed && <ThemeToggle />}
      {collapsed && <ThemeToggle />} {/* يمكن عرضه في الوضع المطوي أيضاً */}
    </div>
  );
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-5 py-4",
      collapsed && "justify-center px-2"
    )}>
      <div
        className="h-9 w-9 shrink-0"
        style={{
          maskImage: "url(/logowafir.png)",
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          backgroundColor: "var(--primary)",
        }}
      />
      {!collapsed && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">وفر</span>
          <span className="text-xs text-muted-foreground">لوحة التحكم</span>
        </div>
      )}
    </div>
  );
}

/** Desktop sidebar — fixed on the RTL start (right) side, hidden on mobile. */
export function AdminSidebar() {
  const collapsed = useUiStore((s) => s.isSidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-l bg-card transition-all duration-300 lg:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between border-b px-2 py-2">
        <SidebarBrand collapsed={collapsed} />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleCollapsed}
        >
          {collapsed ? (
            <ChevronLeft className="h-4 w-4" /> // RTL -> left arrow يعني توسيع
          ) : (
            <ChevronRight className="h-4 w-4" /> // RTL -> right arrow يعني طي
          )}
        </Button>
      </div>
      <NavLinks collapsed={collapsed} />
      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}

/** Mobile sidebar — shadcn Sheet on the right side, controlled by UI store. */
export function AdminMobileSidebar() {
  const isOpen = useUiStore((s) => s.isAdminSidebarOpen);
  const setOpen = useUiStore((s) => s.setAdminSidebarOpen);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-72 p-0">
        <SheetHeader className="text-right">
          <SheetTitle className="text-right">
            <SidebarBrand collapsed={false} /> {/* دائماً موسع في الموبايل */}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <NavLinks onNavigate={() => setOpen(false)} collapsed={false} />
        </div>
        <SidebarFooter collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}