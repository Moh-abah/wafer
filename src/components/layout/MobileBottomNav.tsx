"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, Building2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/facilities", label: "البطاقات", icon: CreditCard },
  { href: "/facilities", label: "المنشآت", icon: Building2 },
  { href: "/register", label: "انضم", icon: UserPlus },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="navigation"
      aria-label="التنقل الرئيسي"
    >
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex min-h-[56px] min-w-[64px] flex-col items-center justify-center gap-1 px-3 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span
                className={cn(
                  "text-[11px] leading-tight",
                  isActive && "font-bold"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
