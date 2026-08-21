import type { Metadata } from "next";
import { Cairo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
