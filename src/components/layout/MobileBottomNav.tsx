"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Tag, CircleUserRound } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * التنقل السفلي (موبايل) — 4 تبويبات فقط:
 * الرئيسية | المتاجر | العروض (نفس وجهة المتاجر مؤقتاً) | حسابي
 * النشط: text-primary + خلفية كبسولة خفيفة primary/10.
 */
const NAV_ITEMS = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/facilities", label: "المتاجر", icon: Store },
  { href: "/facilities", label: "العروض", icon: Tag },
  { href: "/account", label: "حسابي", icon: CircleUserRound },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  /* أول تطابق يُعدّ النشط (المتاجر والعروض نفس الوجهة مؤقتاً) */
  const activeIndex = NAV_ITEMS.findIndex((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="navigation"
      aria-label="التنقل الرئيسي"
    >
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = idx === activeIndex;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-[56px] min-w-[64px] flex-col items-center justify-center gap-1 px-3 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  isActive && "bg-primary/10"
                )}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
              </span>
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
