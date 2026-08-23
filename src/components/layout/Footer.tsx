"use client";

import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { WafirLogo } from "@/components/shared/WafirLogo";
import { Logo } from "../shared/Logo";

/** بيانات التواصل الحقيقية — مصدرها مواصفة المشروع حصراً */
const CONTACT_PHONE = "0547669078";
const CONTACT_PHONE_DISPLAY = "0547 669 078";
const CONTACT_EMAIL = "s72468483@gmail.com";
const CONTACT_ADDRESS = "المملكة العربية السعودية";

const QUICK_LINKS = [
  { label: "الرئيسية", href: "/" },
  { label: "المتاجر", href: "/facilities" },
  { label: "تسجيل العضوية", href: "/register" },
  { label: "حسابي", href: "/account" },
  { label: "تسجيل الدخول", href: "/login" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full bg-card" role="contentinfo">
      {/* الخط العلوي المتدرج — هوية المحيط */}
      <div className="gradient-ocean h-1 w-full" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* العمود 1: وفر */}
          {/* <div className="space-y-4">
            <WafirLogo className="h-12 w-auto" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              منصة وفر — بطاقة الخصومات الذكية للمطاعم والمقاهي والمرافق
              العامة المشتركة في المملكة العربية السعودية.
            </p>
          </div> */}

          <Logo size="md" showPill />
          {/* العمود 2: روابط سريعة */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-foreground">روابط سريعة</h3>
            <ul className="space-y-1">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-[44px] items-center text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* العمود 3: تواصل معنا — بيانات حقيقية */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-foreground">تواصل معنا</h3>
            <ul className="space-y-1">
              <li>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="flex min-h-[44px] items-center gap-3 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                  <span dir="ltr">{CONTACT_PHONE_DISPLAY}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex min-h-[44px] items-center gap-3 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                  <span dir="ltr">{CONTACT_EMAIL}</span>
                </a>
              </li>
              <li className="flex min-h-[44px] items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                <span>{CONTACT_ADDRESS}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* الشريط السفلي */}
        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            جميع الحقوق محفوظة لوفر {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
