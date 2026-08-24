import type { Metadata, Viewport } from "next";

/**
 * Layout بوابة المالك لمسار الدخول /owner/login
 * ------------------------------------------------
 * مكوّن Server يمرر الأبناء كما هو (بلا أي واجهة) — وظيفته الوحيدة:
 * تجاوز ميتا تطبيق العميل بميتا «تطبيق المالك» حتى لو كان الأصل
 * localhost (يُقرأ الـ manifest الصحيح عند تثبيت التطبيق من صفحة الدخول).
 */
export const metadata: Metadata = {
  manifest: "/manifest.webmanifest?app=owner",
  applicationName: "وفر مالك",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "وفر مالك",
  },
  icons: {
    apple: "/icons/owner-apple-touch-icon.png",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#003B55",
};

export default function OwnerEntryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
