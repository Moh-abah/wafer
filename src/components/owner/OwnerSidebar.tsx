"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, LogOut, ChevronLeft, ChevronRight, Package, Upload } from "lucide-react";
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
import { useOwnerLogout } from "@/hooks/useOwnerAuth";
import { useMyFacilities } from "@/hooks/useMyFacilities";
import { Skeleton } from "@/components/ui/skeleton";

const FACILITY_TYPE_LABELS: Record<string, string> = {
  restaurant: "مطعم",
  cafe: "مقهى",
  public_facility: "مرافق عام",
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/owner") return pathname === "/owner";
  return pathname === href || pathname.startsWith(`${href}/`);
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
          <span className="text-xs text-muted-foreground">بوابة المالك</span>
        </div>
      )}
    </div>
  );
}

function NavLinks({ onNavigate, collapsed }: { onNavigate?: () => void; collapsed: boolean }) {
  const pathname = usePathname();
  const { data: facilities, isLoading } = useMyFacilities();

  return (
    <nav className="flex flex-col gap-1 px-3 py-2">
      <Link
        href="/owner"
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
          isActive(pathname, "/owner") && "bg-accent font-medium text-primary",
          collapsed && "justify-center px-2"
        )}
        aria-current={isActive(pathname, "/owner") ? "page" : undefined}
      >
        <Store className="h-5 w-5 shrink-0" />
        {!collapsed && <span>منشآتي</span>}
      </Link>

      {isLoading && (
        <div className="px-3 py-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-4 w-24" />
        </div>
      )}

      {facilities?.map((f) => {
        const href = `/owner/facilities/${f.id}/products`;
        const active = isActive(pathname, href);
        return (
          <div key={f.id}>
            <Link
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                active && "bg-accent font-medium text-primary",
                collapsed && "justify-center px-2"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Package className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="truncate">{f.name}</span>
              )}
            </Link>
            {!collapsed && (
              <Link
                href={`/owner/facilities/${f.id}`}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-md pe-3 ps-11 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  isActive(pathname, `/owner/facilities/${f.id}`) && "text-primary"
                )}
              >
                تعديل المنشأة
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const logout = useOwnerLogout();
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
      {collapsed && <ThemeToggle />}
    </div>
  );
}

export function OwnerSidebar() {
  const collapsed = useUiStore((s) => s.isOwnerSidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleOwnerSidebarCollapsed);

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
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
      <NavLinks collapsed={collapsed} />
      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}

export function OwnerMobileSidebar() {
  const isOpen = useUiStore((s) => s.isOwnerSidebarOpen);
  const setOpen = useUiStore((s) => s.setOwnerSidebarOpen);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-72 p-0">
        <SheetHeader className="text-right">
          <SheetTitle className="text-right">
            <SidebarBrand collapsed={false} />
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
