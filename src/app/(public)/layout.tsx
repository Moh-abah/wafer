"use client";

import { WelcomeBanner } from "@/components/shared/WelcomeBanner";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { CookieConsent } from "@/components/shared/CookieConsent";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <WelcomeBanner />
      <OfflineBanner />
      <MainHeader />
      <main className="flex-1 pb-28 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <ScrollToTop />
      <CookieConsent />
    </div>
  );
}
