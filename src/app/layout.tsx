import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const cairo = localFont({
  src: [
    {
      path: "../../public/fonts/Cairo-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Cairo-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Cairo-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Cairo-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/Cairo-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-cairo",
  display: "swap",
});

// تعريف Geist Mono محلياً (إذا كنت تملك الملفات)
// أو استخدم خطاً بديلاً
const geistMono = localFont({
  src: "../../public/fonts/GeistMono-Regular.ttf", // غيّر المسار حسب اسم الملف
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "وفر | بطاقات خصم 30% على المطاعم والمرافق",
  description:
    "منصة وفر — كتالوج بطاقات الخصم بنسبة 30% على جميع المطاعم والمقاهي والمرافق العامة. اختر منطقتك واستمتع بالعروض.",
  keywords: ["وفر", "Wafir", "بطاقات خصم", "خصم 30%", "مطاعم", "مقاهي", "عروض"],
  authors: [{ name: "وفر" }],
  icons: {
    icon: "/logowafir.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
