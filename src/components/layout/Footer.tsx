import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

const FOOTER_LINKS = [
  {
    title: "وفر",
    links: [
      { label: "عن المنصة", href: "/" },
      { label: "كيف تعمل وفر؟", href: "/#how-it-works" },
      { label: "البطاقات", href: "/" },
    ],
  },
  {
    title: "الدعم",
    links: [
      { label: "الأسئلة الشائعة", href: "/" },
      { label: "تواصل معنا", href: "/" },
      { label: "الشروط والأحكام", href: "/" },
    ],
  },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t bg-card" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Branding */}
          <div className="space-y-4">
            <Logo width={140} height={44} />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              منصة وفر تقدم لك بطاقات خصم بنسبة 30% على المطاعم والمقاهي
              والمرافق العامة في المملكة العربية السعودية.
            </p>
          </div>

          {/* Link Columns */}
          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-bold text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-foreground">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-secondary" />
                <span>المملكة العربية السعودية</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-secondary" />
                <span dir="ltr">info@wafir.gleeze.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-secondary" />
                <span dir="ltr">+966 XX XXX XXXX</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} وفر — جميع الحقوق محفوظة
          </p>
          <p className="text-xs text-muted-foreground">
            خصم 30% على المطاعم والمقاهي والمرافق العامة
          </p>
        </div>
      </div>
    </footer>
  );
}