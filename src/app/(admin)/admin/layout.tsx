"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import {
  AdminSidebar,
  AdminMobileSidebar,
} from "@/components/layout/AdminSidebar";
import { useUiStore } from "@/store/ui.store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const toggleSidebar = useUiStore((s) => s.toggleAdminSidebar);

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
          <ThemeToggle />
        </header>

        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 overflow-x-hidden">
            <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>

        <AdminMobileSidebar />
      </div>
    </AdminAuthGuard>
  );
}
