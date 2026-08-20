import * as React from "react";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { ScrollToTop } from "@/components/shared/ScrollToTop";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <OfflineBanner />
      <MainHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <ScrollToTop />
    </div>
  );
}
