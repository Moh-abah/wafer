"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { RegionSelector } from "@/components/public/RegionSelector";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "الرئيسية", href: "/" },
  { label: "المنشآت", href: "/facilities" },
  { label: "كيف تعمل؟", href: "/#how-it-works" },
] as const;

export function MainHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity hover:opacity-80"
          aria-label="وفر — الصفحة الرئيسية"
        >
          <div
            className="h-22 w-28 sm:h-10 sm:w-36"
            style={{
              maskImage: "url(/logowafir.png)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              backgroundColor: "var(--primary)",
            }}
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href.split("#")[0]);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative px-3 py-2 text-sm font-medium transition-colors min-h-[44px] inline-flex items-center",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute bottom-1 right-3 left-3 h-0.5 rounded-full bg-primary transition-all duration-300",
                    isActive ? "w-[calc(100%-1.5rem)] opacity-100" : "w-0 opacity-0 group-hover:w-[calc(100%-1.5rem)] group-hover:opacity-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="rounded-full">
            <Link href="/register">تسجيل العضوية</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Region Selector Bar — visible on mobile/tablet, hidden on desktop (shown inline above) */}
      <div className="border-t border-border/50 lg:hidden">
        <div className="mx-auto flex h-10 max-w-7xl items-center gap-2 px-4 sm:px-6">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary" />
          <RegionSelector />
        </div>
      </div>

      {/* Region Selector — Desktop inline */}
      <div className="hidden border-t border-border/50 lg:block">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-end gap-2 px-4 sm:px-6">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary" />
          <RegionSelector />
        </div>
      </div>

      {/* Gradient line at the bottom */}
      <div
        className="h-[2px] w-full"
        style={{
          background: "linear-gradient(to left, var(--primary), var(--secondary))",
        }}
      />
    </header>
  );
}
