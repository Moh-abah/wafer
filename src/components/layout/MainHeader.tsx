"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { RegionSelector } from "@/components/public/RegionSelector";
import { MapPin } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export function MainHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo */}
        <Logo width={70} height={33} />

        {/* Region Selector - Desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <MapPin className="h-4 w-4 text-secondary" />
          <RegionSelector />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="rounded-full">
            <Link href="/register">تسجيل العضوية</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}